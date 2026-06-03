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
    return { success: true };
  } catch (error) {
    console.error('Error creating hidrante:', error);
    return { success: false, error: 'Falha ao cadastrar hidrante' };
  }
}

export async function getHidrantes() {
  try {
    return await prisma.hidrante.findMany({
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
    console.error('Error fetching hidrantes:', error);
    return [];
  }
}
