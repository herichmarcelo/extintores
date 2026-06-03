'use server'

import prisma from '@/lib/prisma';
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

    revalidatePath('/extintores');
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
        dataInspecao: new Date(),
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
    return await prisma.unidade.findMany({
      orderBy: { nome: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching unidades:', error);
    return [];
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
