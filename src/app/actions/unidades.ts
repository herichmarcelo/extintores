'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createUnidade(formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const cidade = formData.get('cidade') as string;
    const estado = formData.get('estado') as string;

    await prisma.unidade.create({
      data: { nome, cidade, estado },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating unidade:', error);
    return { 
      success: false, 
      error: `Erro: ${error.message || 'Falha ao cadastrar unidade'}` 
    };
  }
}
