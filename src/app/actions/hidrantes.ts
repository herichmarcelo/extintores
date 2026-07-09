'use server'

import prisma from '@/lib/prisma';
import { uploadImage } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';

export async function createHidrante(formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const localizacao = formData.get('localizacao') as string;
    const unidadeId = formData.get('unidadeId') as string;
    const fotoFile = formData.get('foto') as File | null;

    // Check for duplicate code in the same unit
    const existingHidrante = await prisma.hidrante.findFirst({
      where: {
        unidadeId,
        codigo,
      },
    });

    if (existingHidrante) {
      return { success: false, error: 'Já existe um hidrante com este código nesta unidade.' };
    }

    let fotoUrl = null;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileUri = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
      fotoUrl = await uploadImage(fileUri, 'hidrantes');
    }

    await prisma.hidrante.create({
      data: {
        codigo,
        localizacao,
        unidadeId,
        foto: fotoUrl,
      },
    });

    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error creating hidrante:', error);
    return { success: false, error: 'Falha ao cadastrar hidrante' };
  }
}

export async function updateHidrante(id: string, formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const localizacao = formData.get('localizacao') as string;
    const unidadeId = formData.get('unidadeId') as string;
    const fotoFile = formData.get('foto') as File | null;

    // Check for duplicate code in the same unit (excluding the current hidrante)
    const existingHidrante = await prisma.hidrante.findFirst({
      where: {
        unidadeId,
        codigo,
        NOT: { id },
      },
    });

    if (existingHidrante) {
      return { success: false, error: 'Já existe um hidrante com este código nesta unidade.' };
    }

    let fotoUrl = undefined;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileUri = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
      fotoUrl = await uploadImage(fileUri, 'hidrantes');
    }

    await prisma.hidrante.update({
      where: { id },
      data: {
        codigo,
        localizacao,
        unidadeId,
        ...(fotoUrl !== undefined && { foto: fotoUrl }),
      },
    });

    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error updating hidrante:', error);
    return { success: false, error: 'Falha ao atualizar hidrante' };
  }
}

export async function deleteHidrante(id: string) {
  try {
    await prisma.hidrante.delete({
      where: { id },
    });

    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error deleting hidrante:', error);
    return { success: false, error: 'Falha ao excluir hidrante' };
  }
}

export async function getHidrantes(userId?: string) {
  try {
    console.log('[DEBUG getHidrantes called with userId:', userId);
    if (!userId) {
      console.log('[DEBUG getHidrantes] No userId provided');
      return [];
    }
    
    let whereClause: any = {};
    console.log('[DEBUG getHidrantes] Initial whereClause:', JSON.stringify(whereClause));

    // Buscar o usuário para verificar o perfil e acessos
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });
    console.log('[DEBUG getHidrantes] User found:', user ? { id: user.id, perfil: user.perfil, unidadesAcessoCount: user.unidadesAcesso.length } : 'null');
    if (user) {
      console.log('[DEBUG getHidrantes] User perfil:', JSON.stringify(user.perfil));
      console.log('[DEBUG getHidrantes] User perfil trimmed:', JSON.stringify(user.perfil?.trim()));
      console.log('[DEBUG getHidrantes] User unidadesAcesso:', JSON.stringify(user.unidadesAcesso.map(a => ({ unidadeId: a.unidadeId }))));
    }

    // ARMADURA: Verificação robusta para Administrador (case-insensitive e trim)
    const isAdmin = user && (user.perfil?.trim()?.toLowerCase() === 'administrador');
    console.log('[DEBUG getHidrantes] Is Admin?', isAdmin);

    if (user && !isAdmin) {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      console.log('[DEBUG getHidrantes] unidadesAcessoIds:', JSON.stringify(unidadesAcessoIds));
      whereClause = {
        unidadeId: { in: unidadesAcessoIds },
      };
    } else if (user && isAdmin) {
      // GARANTIA: Força whereClause vazio para Admin
      console.log('[DEBUG getHidrantes] Admin user detected - no filters applied');
      whereClause = {};
    }

    console.log('[DEBUG getHidrantes] Final whereClause:', JSON.stringify(whereClause));

    // Primeiro contamos quantos registros existem no total
    const totalHidrantes = await prisma.hidrante.count();
    console.log('[DEBUG getHidrantes] Total hidrantes in DB:', totalHidrantes);

    const result = await prisma.hidrante.findMany({
      where: whereClause,
      include: {
        unidade: true,
        inspecoes: {
          orderBy: { dataInspecao: 'desc' },
          take: 1,
        },
      },
      orderBy: { codigo: 'asc' },
    });

    console.log('[DEBUG getHidrantes] Query result count:', result.length);
    console.log('[DEBUG getHidrantes] Result codes:', result.map(r => r.codigo));
    return result;
  } catch (error) {
    console.error('[DEBUG getHidrantes ERROR:', error);
    return [];
  }
}

export async function createInspecaoHidrante(formData: FormData) {
  try {
    const hidranteId = formData.get('hidranteId') as string;
    const usuarioId = formData.get('usuarioId') as string;
    const observacao = formData.get('observacao') as string;
    const dataInspecao = new Date(formData.get('dataInspecao') as string);

    const checklistItems = [
      'localAcessivel',
      'sinalizado',
      'estadoMangueiras',
      'enroladasCorretamente',
      'esguichosNoLocal',
      'esguichosBoasCondicoes',
      'semVazamentos',
      'valvulaFechada',
      'temChaveStorz',
      'estadoPintura',
      'proximoTesteHidrostatico'
    ];

    const hasNonConformity = checklistItems.some(item => formData.get(item) === 'nao-conforme');

    await prisma.inspecaoHidrante.create({
      data: {
        hidranteId,
        usuarioId,
        observacao,
        dataInspecao,
        status: hasNonConformity ? 'Não Conforme' : 'Conforme',
        localAcessivel: formData.get('localAcessivel') !== 'nao-conforme',
        sinalizado: formData.get('sinalizado') !== 'nao-conforme',
        estadoMangueiras: formData.get('estadoMangueiras') !== 'nao-conforme',
        enroladasCorretamente: formData.get('enroladasCorretamente') !== 'nao-conforme',
        esguichosNoLocal: formData.get('esguichosNoLocal') !== 'nao-conforme',
        esguichosBoasCondicoes: formData.get('esguichosBoasCondicoes') !== 'nao-conforme',
        semVazamentos: formData.get('semVazamentos') !== 'nao-conforme',
        valvulaFechada: formData.get('valvulaFechada') !== 'nao-conforme',
        temChaveStorz: formData.get('temChaveStorz') !== 'nao-conforme',
        estadoPintura: formData.get('estadoPintura') !== 'nao-conforme',
        proximoTesteHidrostatico: formData.get('proximoTesteHidrostatico') !== 'nao-conforme'
      }
    });

    revalidatePath('/hidrantes');
    return { success: true };
  } catch (error) {
    console.error('Error creating hidrante inspection:', error);
    return { success: false, error: 'Falha ao registrar inspeção de hidrante' };
  }
}

export async function getHidranteComHistorico(id: string, userId: string) {
  try {
    if (!userId) return null;

    return await prisma.hidrante.findUnique({
      where: { id },
      include: {
        unidade: true,
        inspecoes: {
          include: {
            usuario: true,
          },
          orderBy: { dataInspecao: 'desc' },
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hidrante with history:', error);
    return null;
  }
}

export async function updateInspecaoHidrante(inspecaoId: string, userId: string, data: any) {
  try {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    
    // Only allow Administrador or Bombeiro
    if (user.perfil !== 'Administrador' && user.perfil !== 'Bombeiro') {
      return { success: false, error: 'Você não tem permissão para editar inspeções' };
    }
    
    await prisma.inspecaoHidrante.update({
      where: { id: inspecaoId },
      data: { ...data, usuarioId: userId }
    });
    
    revalidatePath('/hidrantes');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error updating hidrante inspection:', error);
    return { success: false, error: 'Falha ao atualizar inspeção' };
  }
}

export async function deleteInspecaoHidrante(inspecaoId: string, userId: string) {
  try {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: 'Usuário não encontrado' };
    
    // Only allow Administrador or Bombeiro
    if (user.perfil !== 'Administrador' && user.perfil !== 'Bombeiro') {
      return { success: false, error: 'Você não tem permissão para deletar inspeções' };
    }
    
    await prisma.inspecaoHidrante.delete({
      where: { id: inspecaoId }
    });
    
    revalidatePath('/hidrantes');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error deleting hidrante inspection:', error);
    return { success: false, error: 'Falha ao excluir inspeção' };
  }
}

export async function getRelatoriosHidrantes(userId: string) {
  try {
    console.log('[DEBUG getRelatoriosHidrantes called with userId:', userId);
    if (!userId) {
      console.log('[DEBUG getRelatoriosHidrantes] No userId provided');
      return [];
    }
    
    let whereClause: any = {};
    console.log('[DEBUG getRelatoriosHidrantes] Initial whereClause:', JSON.stringify(whereClause));

    // Buscar o usuário para verificar o perfil e acessos
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });
    console.log('[DEBUG getRelatoriosHidrantes] User found:', user ? { id: user.id, perfil: user.perfil, unidadesAcessoCount: user.unidadesAcesso.length } : 'null');
    if (user) {
      console.log('[DEBUG getRelatoriosHidrantes] User perfil:', JSON.stringify(user.perfil));
      console.log('[DEBUG getRelatoriosHidrantes] User perfil trimmed:', JSON.stringify(user.perfil?.trim()));
      console.log('[DEBUG getRelatoriosHidrantes] User unidadesAcesso:', JSON.stringify(user.unidadesAcesso.map(a => ({ unidadeId: a.unidadeId }))));
    }

    // ARMADURA: Verificação robusta para Administrador (case-insensitive e trim)
    const isAdmin = user && (user.perfil?.trim()?.toLowerCase() === 'administrador');
    console.log('[DEBUG getRelatoriosHidrantes] Is Admin?', isAdmin);

    if (user && !isAdmin) {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      console.log('[DEBUG getRelatoriosHidrantes] unidadesAcessoIds:', JSON.stringify(unidadesAcessoIds));
      whereClause = {
        unidadeId: { in: unidadesAcessoIds },
      };
    } else if (user && isAdmin) {
      // GARANTIA: Força whereClause vazio para Admin
      console.log('[DEBUG getRelatoriosHidrantes] Admin user detected - no filters applied');
      whereClause = {};
    }

    console.log('[DEBUG getRelatoriosHidrantes] Final whereClause:', JSON.stringify(whereClause));

    // Primeiro contamos quantos registros existem no total
    const totalHidrantes = await prisma.hidrante.count();
    console.log('[DEBUG getRelatoriosHidrantes] Total hidrantes in DB:', totalHidrantes);

    const result = await prisma.hidrante.findMany({
      where: whereClause,
      include: {
        unidade: true,
        inspecoes: {
          include: {
            usuario: true,
          },
          orderBy: { dataInspecao: 'desc' },
        },
      },
      orderBy: { codigo: 'asc' },
    });

    console.log('[DEBUG getRelatoriosHidrantes] Query result count:', result.length);
    console.log('[DEBUG getRelatoriosHidrantes] Result codes:', result.map(r => r.codigo));
    return result;
  } catch (error) {
    console.error('[DEBUG getRelatoriosHidrantes ERROR:', error);
    return [];
  }
}
