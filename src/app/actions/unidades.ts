'use server'

import prisma from '@/lib/prisma';
import { formatDatabaseError } from '@/lib/db-error';
import { revalidatePath } from 'next/cache';

export async function createUnidade(formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const cidade = formData.get('cidade') as string;
    const estado = formData.get('estado') as string;
    const userId = formData.get('userId') as string;

    // Verificar permissões do usuário
    if (userId) {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: 'Usuário não encontrado.' };
      }

      // Técnico de Segurança (Gestor) não pode criar unidades - apenas leitura
      if (user.perfil === 'Gestor') {
        return { success: false, error: 'Técnico de Segurança não tem permissão para criar unidades. Acesso somente leitura.' };
      }
    }

    await prisma.unidade.create({
      data: { nome, cidade, estado },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error creating unidade:', error);
    return { 
      success: false, 
      error: formatDatabaseError(error),
    };
  }
}

export async function updateUnidade(id: string, formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const cidade = formData.get('cidade') as string;
    const estado = formData.get('estado') as string;
    const userId = formData.get('userId') as string;

    // Verificar permissões do usuário
    if (userId) {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: 'Usuário não encontrado.' };
      }

      // Técnico de Segurança (Gestor) não pode editar unidades - apenas leitura
      if (user.perfil === 'Gestor') {
        return { success: false, error: 'Técnico de Segurança não tem permissão para editar unidades. Acesso somente leitura.' };
      }
    }

    await prisma.unidade.update({
      where: { id },
      data: { nome, cidade, estado: estado.toUpperCase() },
    });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error updating unidade:', error);
    return {
      success: false,
      error: formatDatabaseError(error),
    };
  }
}

export async function deleteUnidade(id: string, userId?: string) {
  try {
    // Verificar permissões do usuário
    if (userId) {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return { success: false, error: 'Usuário não encontrado.' };
      }

      // Técnico de Segurança (Gestor) não pode deletar unidades - apenas leitura
      if (user.perfil === 'Gestor') {
        return { success: false, error: 'Técnico de Segurança não tem permissão para deletar unidades. Acesso somente leitura.' };
      }
    }

    const unidade = await prisma.unidade.findUnique({
      where: { id },
      include: {
        _count: { select: { extintores: true, hidrantes: true } },
      },
    });

    if (!unidade) {
      return { success: false, error: 'Unidade não encontrada.' };
    }

    if (unidade._count.extintores > 0 || unidade._count.hidrantes > 0) {
      return {
        success: false,
        error: `Não é possível excluir: esta unidade possui ${unidade._count.extintores} extintor(es) e ${unidade._count.hidrantes} hidrante(s) vinculados.`,
      };
    }

    await prisma.unidade.delete({ where: { id } });

    revalidatePath('/unidades');
    revalidatePath('/extintores');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting unidade:', error);
    return {
      success: false,
      error: formatDatabaseError(error),
    };
  }
}
