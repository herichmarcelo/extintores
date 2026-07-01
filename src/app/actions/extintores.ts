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
    
    // Buscar ou criar um usuário temporário se não existir (para evitar erro de FK)
    let user = await prisma.usuario.findFirst({
      where: { id: usuarioId }
    });

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          id: usuarioId,
          nome: 'Inspetor Bello',
          email: 'inspetor@belloalimentos.com.br',
          senha: '123',
          perfil: 'Inspetor'
        }
      });
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

export async function getExtintores() {
  try {
    return await prisma.extintor.findMany({
      include: {
        unidade: true,
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

export async function getExtintorComHistorico(id: string) {
  try {
    return await prisma.extintor.findUnique({
      where: { id },
      include: {
        unidade: true,
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
