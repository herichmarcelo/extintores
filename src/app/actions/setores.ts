'use server'

import prisma from '@/lib/prisma';
import { formatDatabaseError } from '@/lib/db-error';
import { revalidatePath } from 'next/cache';

export async function createSetor(formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const unidadeId = formData.get('unidadeId') as string;

    await prisma.setor.create({
      data: { nome, unidadeId },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error creating setor:', error);
    return {
      success: false,
      error: formatDatabaseError(error),
    };
  }
}

export async function updateSetor(id: string, formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const unidadeId = formData.get('unidadeId') as string;

    await prisma.setor.update({
      where: { id },
      data: { nome, unidadeId },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating setor:', error);
    return {
      success: false,
      error: formatDatabaseError(error),
    };
  }
}

export async function deleteSetor(id: string) {
  try {
    const setor = await prisma.setor.findUnique({
      where: { id },
      include: {
        _count: { select: { extintores: true } },
      },
    });

    if (!setor) {
      return { success: false, error: 'Setor não encontrado.' };
    }

    if (setor._count.extintores > 0) {
      return {
        success: false,
        error: `Não é possível excluir: este setor possui ${setor._count.extintores} extintor(es) vinculados.`,
      };
    }

    await prisma.setor.delete({ where: { id } });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting setor:', error);
    return {
      success: false,
      error: formatDatabaseError(error),
    };
  }
}

export async function getSetores(unidadeId?: string) {
  try {
    const setores = await prisma.setor.findMany({
      where: unidadeId ? { unidadeId } : {},
      include: { 
        unidade: true,
        _count: { select: { extintores: true } },
      },
      orderBy: { nome: 'asc' },
    });
    return { success: true, data: setores };
  } catch (error: unknown) {
    console.error('Error getting setores:', error);
    return {
      success: false,
      error: formatDatabaseError(error),
      data: [],
    };
  }
}
