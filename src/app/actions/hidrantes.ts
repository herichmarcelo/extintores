'use server'

import prisma from '@/lib/prisma';
import { formatDatabaseError } from '@/lib/db-error';
import { uploadImage } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';

export async function createHidrante(formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const localizacao = formData.get('localizacao') as string;
    const unidadeId = formData.get('unidadeId') as string;
    const setorId = formData.get('setorId') as string || null;
    const fotoFile = formData.get('foto') as File | null;

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
        setorId,
        foto: fotoUrl,
      },
    });

    revalidatePath('/unidades');
    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating hidrante:', error);
    return { success: false, error: 'Falha ao cadastrar hidrante' };
  }
}

export async function createInspecaoHidrante(formData: FormData) {
  try {
    const hidranteId = formData.get('hidranteId') as string;
    const usuarioId = formData.get('usuarioId') as string;
    
    const user = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado.' };
    }

    const hidrante = await prisma.hidrante.findUnique({
      where: { id: hidranteId },
    });

    if (!hidrante) {
      return { success: false, error: 'Hidrante não encontrado.' };
    }

    if (user.perfil !== 'Administrador') {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      const setoresAcessoIds = user.setoresAcesso.map(a => a.setorId);

      const temAcessoUnidade = unidadesAcessoIds.includes(hidrante.unidadeId);
      
      if (!temAcessoUnidade) {
        return { success: false, error: 'Você não tem permissão para acessar este hidrante.' };
      }

      if (hidrante.setorId) {
        const temAcessoSetor = setoresAcessoIds.includes(hidrante.setorId);
        if (!temAcessoSetor) {
          return { success: false, error: 'Você não tem permissão para acessar este hidrante.' };
        }
      }
    }

    const status = formData.get('status') as string;
    const observacao = formData.get('observacao') as string;
    const dataInspecao = new Date(formData.get('dataInspecao') as string);
    const fotoFile = formData.get('foto') as File | null;

    const localAcessivel = formData.get('localAcessivel') === 'conforme';
    const sinalizado = formData.get('sinalizado') === 'conforme';
    const estadoMangueiras = formData.get('estadoMangueiras') === 'conforme';
    const enroladasCorretamente = formData.get('enroladasCorretamente') === 'conforme';
    const esguichosNoLocal = formData.get('esguichosNoLocal') === 'conforme';
    const esguichosBoasCondicoes = formData.get('esguichosBoasCondicoes') === 'conforme';
    const semVazamentos = formData.get('semVazamentos') === 'conforme';
    const valvulaFechada = formData.get('valvulaFechada') === 'conforme';
    const temChaveStorz = formData.get('temChaveStorz') === 'conforme';
    const estadoPintura = formData.get('estadoPintura') === 'conforme';
    const proximoTesteHidrostatico = formData.get('proximoTesteHidrostatico') === 'conforme';

    let fotoUrl = null;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileUri = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
      fotoUrl = await uploadImage(fileUri, 'inspecoes');
    }

    await prisma.inspecaoHidrante.create({
      data: {
        hidranteId,
        usuarioId,
        status,
        observacao,
        foto: fotoUrl,
        dataInspecao,
        localAcessivel,
        sinalizado,
        estadoMangueiras,
        enroladasCorretamente,
        esguichosNoLocal,
        esguichosBoasCondicoes,
        semVazamentos,
        valvulaFechada,
        temChaveStorz,
        estadoPintura,
        proximoTesteHidrostatico,
      },
    });

    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating inspecao hidrante:', error);
    return { success: false, error: 'Falha ao salvar inspeção' };
  }
}

export async function getHidrantes(userId?: string) {
  try {
    if (!userId) return [];
    
    let whereClause: any = {};

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });

    if (user && user.perfil !== 'Administrador') {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      const setoresAcessoIds = user.setoresAcesso.map(a => a.setorId);

      whereClause = {
        unidadeId: { in: unidadesAcessoIds },
        setorId: { in: setoresAcessoIds }
      };
    }

    return await prisma.hidrante.findMany({
      where: whereClause,
      include: {
        unidade: true,
        setor: true,
        inspecoes: {
          orderBy: { dataInspecao: 'desc' },
          take: 1,
        },
      },
      orderBy: { codigo: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching hidrantes:', error);
    return [];
  }
}

export async function getHidranteComHistorico(id: string, userId?: string) {
  try {
    if (!userId) return null;
    
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });

    if (user && user.perfil !== 'Administrador') {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      const setoresAcessoIds = user.setoresAcesso.map(a => a.setorId);

      const hidrante = await prisma.hidrante.findUnique({
        where: { id },
      });

      if (!hidrante) {
        return null;
      }

      const temAcessoUnidade = unidadesAcessoIds.includes(hidrante.unidadeId);
      
      if (!temAcessoUnidade) {
        return null;
      }

      if (hidrante.setorId) {
        const temAcessoSetor = setoresAcessoIds.includes(hidrante.setorId);
        if (!temAcessoSetor) {
          return null;
        }
      }
    }

    return await prisma.hidrante.findUnique({
      where: { id },
      include: {
        unidade: true,
        setor: true,
        inspecoes: {
          include: {
            usuario: true,
          },
          orderBy: { dataInspecao: 'desc' },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching hidrante history:', error);
    return null;
  }
}

export async function updateHidrante(id: string, formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const localizacao = formData.get('localizacao') as string;
    const unidadeId = formData.get('unidadeId') as string;
    const setorId = formData.get('setorId') as string || null;
    const fotoFile = formData.get('foto') as File | null;

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
        setorId,
        ...(fotoUrl !== undefined && { foto: fotoUrl }),
      },
    });

    revalidatePath('/unidades');
    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
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

    revalidatePath('/unidades');
    revalidatePath('/hidrantes');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting hidrante:', error);
    return { success: false, error: 'Falha ao deletar hidrante' };
  }
}

export async function updateInspecaoHidrante(inspecaoId: string, userId: string, data: {
  status: string;
  observacao?: string;
  dataInspecao: Date;
  localAcessivel: boolean;
  sinalizado: boolean;
  estadoMangueiras: boolean;
  enroladasCorretamente: boolean;
  esguichosNoLocal: boolean;
  esguichosBoasCondicoes: boolean;
  semVazamentos: boolean;
  valvulaFechada: boolean;
  temChaveStorz: boolean;
  estadoPintura: boolean;
  proximoTesteHidrostatico: boolean;
}) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (user.perfil !== 'Administrador' && user.perfil !== 'Bombeiro') {
      return { success: false, error: 'Você não tem permissão para editar inspeções' };
    }

    await prisma.inspecaoHidrante.update({
      where: { id: inspecaoId },
      data: {
        ...data,
        usuarioId: userId,
      },
    });

    revalidatePath('/hidrantes');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error updating inspecao hidrante:', error);
    return { success: false, error: 'Falha ao atualizar inspeção' };
  }
}

export async function deleteInspecaoHidrante(inspecaoId: string, userId: string) {
  try {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    if (user.perfil !== 'Administrador' && user.perfil !== 'Bombeiro') {
      return { success: false, error: 'Você não tem permissão para deletar inspeções' };
    }

    await prisma.inspecaoHidrante.delete({
      where: { id: inspecaoId },
    });

    revalidatePath('/hidrantes');
    revalidatePath('/relatorios');
    return { success: true };
  } catch (error) {
    console.error('Error deleting inspecao hidrante:', error);
    return { success: false, error: 'Falha ao deletar inspeção' };
  }
}

export async function getRelatoriosHidrantes(userId: string) {
  try {
    let whereClause: any = {};

    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });

    if (user && user.perfil !== 'Administrador') {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      const setoresAcessoIds = user.setoresAcesso.map(a => a.setorId);

      whereClause = {
        unidadeId: { in: unidadesAcessoIds },
        setorId: { in: setoresAcessoIds }
      };
    }

    return await prisma.hidrante.findMany({
      where: whereClause,
      include: {
        unidade: true,
        setor: true,
        inspecoes: {
          include: {
            usuario: true,
          },
          orderBy: { dataInspecao: 'desc' },
        },
      },
      orderBy: { codigo: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching relatorios hidrantes:', error);
    return [];
  }
}
