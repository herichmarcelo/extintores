'use server'

import prisma from '@/lib/prisma';
import { formatDatabaseError } from '@/lib/db-error';
import { uploadImage } from '@/lib/cloudinary';
import { revalidatePath } from 'next/cache';

export async function createExtintor(formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const localizacao = formData.get('localizacao') as string;
    const tipo = formData.get('tipo') as string;
    const capacidade = formData.get('capacidade') as string;
    const validadeCarga = new Date(formData.get('validadeCarga') as string);
    const unidadeId = formData.get('unidadeId') as string;
    const setorId = formData.get('setorId') as string || null;
    const fotoFile = formData.get('foto') as File | null;

    // Check for duplicate code in the same unit
    const existingExtintor = await prisma.extintor.findFirst({
      where: {
        unidadeId,
        codigo,
      },
    });

    if (existingExtintor) {
      return { success: false, error: 'Já existe um extintor com este código nesta unidade.' };
    }

    let fotoUrl = null;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileUri = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
      fotoUrl = await uploadImage(fileUri, 'extintores');
    }

    await prisma.extintor.create({
      data: {
        codigo,
        localizacao,
        tipo,
        capacidade,
        validadeCarga,
        unidadeId,
        setorId,
        foto: fotoUrl,
      },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating extintor:', error);
    return { success: false, error: 'Falha ao cadastrar extintor' };
  }
}

export async function createInspecao(formData: FormData) {
  try {
    const extintorId = formData.get('extintorId') as string;
    const usuarioId = formData.get('usuarioId') as string;
    
    // Buscar usuário e verificar permissões
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

    // Buscar o extintor para verificar acesso
    const extintor = await prisma.extintor.findUnique({
      where: { id: extintorId },
    });

    if (!extintor) {
      return { success: false, error: 'Extintor não encontrado.' };
    }

    // Verificar permissões se não for Administrador
    if (user.perfil !== 'Administrador') {
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      const setoresAcessoIds = user.setoresAcesso.map(a => a.setorId);

      // Verificar se tem acesso à unidade
      const temAcessoUnidade = unidadesAcessoIds.includes(extintor.unidadeId);
      
      if (!temAcessoUnidade) {
        return { success: false, error: 'Você não tem permissão para acessar este extintor.' };
      }

      // Verificar acesso ao setor se o extintor estiver em um setor
      if (extintor.setorId) {
        const temAcessoSetor = setoresAcessoIds.includes(extintor.setorId);
        if (!temAcessoSetor) {
          return { success: false, error: 'Você não tem permissão para acessar este extintor.' };
        }
      }
    }

    const status = formData.get('status') as string;
    const observacao = formData.get('observacao') as string;
    const dataInspecao = new Date(formData.get('dataInspecao') as string);
    const fotoFile = formData.get('foto') as File | null;

    const sinalizacao = formData.get('sinalizacao') === 'conforme';
    const manometro = formData.get('manometro') === 'conforme';
    const lacre = formData.get('lacre') === 'conforme';
    const mangueira = formData.get('mangueira') === 'conforme';
    const pintura = formData.get('pintura') === 'conforme';
    const seloInmetro = formData.get('seloInmetro') === 'conforme';

    let fotoUrl = null;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileUri = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
      fotoUrl = await uploadImage(fileUri, 'inspecoes');
    }

    await prisma.inspecaoExtintor.create({
      data: {
        extintorId,
        usuarioId,
        status,
        observacao,
        foto: fotoUrl,
        sinalizacao,
        manometro,
        lacre,
        mangueira,
        pintura,
        seloInmetro,
        dataInspecao,
      },
    });

    revalidatePath('/extintores');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error creating inspecao:', error);
    return { success: false, error: 'Falha ao salvar inspeção' };
  }
}

export async function getUnidades() {
  try {
    const data = await prisma.unidade.findMany({
      orderBy: { nome: 'asc' },
      include: {
        _count: { select: { extintores: true, hidrantes: true } },
      },
    });
    return { data, error: undefined as string | undefined };
  } catch (error) {
    console.error('Error fetching unidades:', error);
    return { data: [], error: formatDatabaseError(error) };
  }
}

export async function getExtintores(userId?: string) {
  try {
    if (!userId) return [];
    
    let whereClause: any = {};

    // Buscar o usuário para verificar o perfil e acessos
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        unidadesAcesso: true,
        setoresAcesso: true,
      },
    });

    if (user && user.perfil !== 'Administrador') {
      // Para perfis restritos (Brigadista/Inspetor, Gestor, SESMT), aplicar filtros
      const unidadesAcessoIds = user.unidadesAcesso.map(a => a.unidadeId);
      const setoresAcessoIds = user.setoresAcesso.map(a => a.setorId);

      // Construir cláusula WHERE estrita
      whereClause = {
        unidadeId: { in: unidadesAcessoIds },
        setorId: { in: setoresAcessoIds }
      };
    }

    return await prisma.extintor.findMany({
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
    console.error('Error fetching extintores:', error);
    return [];
  }
}

export async function getExtintorComHistorico(id: string, userId?: string) {
  try {
    if (!userId) return null;
    
    // Se um userId foi passado, verificar permissões
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

      // Primeiro buscar o extintor para verificar acesso
      const extintor = await prisma.extintor.findUnique({
        where: { id },
      });

      if (!extintor) {
        return null;
      }

      // Verificar acesso à unidade
      const temAcessoUnidade = unidadesAcessoIds.includes(extintor.unidadeId);
      
      if (!temAcessoUnidade) {
        return null;
      }

      // Verificar acesso ao setor
      if (extintor.setorId) {
        const temAcessoSetor = setoresAcessoIds.includes(extintor.setorId);
        if (!temAcessoSetor) {
          return null;
        }
      }
    }

    // Se tudo ok (ou usuário admin), retornar o extintor com histórico
    return await prisma.extintor.findUnique({
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
    console.error('Error fetching extintor history:', error);
    return null;
  }
}

export async function updateExtintor(id: string, formData: FormData) {
  try {
    const codigo = formData.get('codigo') as string;
    const localizacao = formData.get('localizacao') as string;
    const tipo = formData.get('tipo') as string;
    const capacidade = formData.get('capacidade') as string;
    const validadeCarga = new Date(formData.get('validadeCarga') as string);
    const unidadeId = formData.get('unidadeId') as string;
    const setorId = formData.get('setorId') as string || null;
    const fotoFile = formData.get('foto') as File | null;

    // Check for duplicate code in the same unit (excluding the current extintor)
    const existingExtintor = await prisma.extintor.findFirst({
      where: {
        unidadeId,
        codigo,
        NOT: { id },
      },
    });

    if (existingExtintor) {
      return { success: false, error: 'Já existe um extintor com este código nesta unidade.' };
    }

    let fotoUrl = undefined;

    if (fotoFile && fotoFile.size > 0) {
      const arrayBuffer = await fotoFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const fileUri = `data:${fotoFile.type};base64,${buffer.toString('base64')}`;
      fotoUrl = await uploadImage(fileUri, 'extintores');
    }

    await prisma.extintor.update({
      where: { id },
      data: {
        codigo,
        localizacao,
        tipo,
        capacidade,
        validadeCarga,
        unidadeId,
        setorId,
        ...(fotoUrl !== undefined && { foto: fotoUrl }),
      },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating extintor:', error);
    return { success: false, error: 'Falha ao atualizar extintor' };
  }
}

export async function deleteExtintor(id: string) {
  try {
    await prisma.extintor.delete({
      where: { id },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting extintor:', error);
    return { success: false, error: 'Falha ao deletar extintor' };
  }
}

export async function getDashboardData() {
  try {
    const unidades = await prisma.unidade.findMany({
      include: {
        extintores: {
          include: {
            inspecoes: {
              orderBy: { dataInspecao: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    const totalExtintores = unidades.reduce((acc, u) => acc + u.extintores.length, 0);
    
    let aprovados = 0;
    let reprovados = 0;

    const dataPorUnidade = unidades.map(u => {
      let uConforme = 0;
      let uNaoConforme = 0;

      u.extintores.forEach(e => {
        const ultimaInspecao = e.inspecoes[0];
        if (ultimaInspecao) {
          if (ultimaInspecao.status === 'Conforme') {
            uConforme++;
            aprovados++;
          } else {
            uNaoConforme++;
            reprovados++;
          }
        } else {
          // Se não tem inspeção, consideramos pendente/não conforme para fins de dashboard? 
          // Ou apenas não somamos. Vamos somar como não conforme para alertar.
          uNaoConforme++;
          reprovados++;
        }
      });

      return {
        name: u.nome,
        total: u.extintores.length,
        conforme: uConforme,
        naoConforme: uNaoConforme,
      };
    });

    return {
      totalExtintores,
      aprovados,
      reprovados,
      dataPorUnidade,
      taxaEficiencia: totalExtintores > 0 ? Math.round((aprovados / totalExtintores) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
}

export async function getRelatoriosExtintores(userId: string) {
  try {
    let whereClause: any = {};

    // Buscar o usuário para verificar o perfil e acessos
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

    return await prisma.extintor.findMany({
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
    console.error('Error fetching relatorios extintores:', error);
    return [];
  }
}
