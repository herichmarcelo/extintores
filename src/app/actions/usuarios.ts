'use server'

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUsuarios() {
  try {
    return await prisma.usuario.findMany({
      orderBy: { nome: 'asc' },
      include: {
        unidadesAcesso: { include: { unidade: true } },
        setoresAcesso: { include: { setor: true } },
      },
    });
  } catch (error) {
    console.error('Error fetching usuarios:', error);
    return [];
  }
}

export async function createUsuario(formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;
    const perfil = formData.get('perfil') as string;
    const unidadesIds = formData.getAll('unidadesIds') as string[];
    const setoresIds = formData.getAll('setoresIds') as string[];

    // Verificar se o email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'Este e-mail já está cadastrado.' };
    }

    await prisma.usuario.create({
      data: {
        nome,
        email,
        senha, // Nota: Em um ambiente de produção, a senha deve ser hasheada (ex: bcrypt)
        perfil,
        ...(perfil !== 'Administrador' && {
          unidadesAcesso: {
            create: unidadesIds.map((unidadeId) => ({ unidadeId })),
          },
          setoresAcesso: {
            create: setoresIds.map((setorId) => ({ setorId })),
          },
        }),
      },
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating usuario:', error);
    return { 
      success: false, 
      error: `Erro: ${error.message || 'Falha ao cadastrar usuário'}` 
    };
  }
}

export async function deleteUsuario(id: string) {
  try {
    await prisma.usuario.delete({
      where: { id },
    });
    revalidatePath('/usuarios');
    return { success: true };
  } catch (error) {
    console.error('Error deleting usuario:', error);
    return { success: false, error: 'Falha ao excluir usuário' };
  }
}

export async function updateUsuario(id: string, formData: FormData) {
  try {
    const nome = formData.get('nome') as string;
    const email = formData.get('email') as string;
    const senha = formData.get('senha') as string;
    const perfil = formData.get('perfil') as string;
    const unidadesIds = formData.getAll('unidadesIds') as string[];
    const setoresIds = formData.getAll('setoresIds') as string[];

    // Verificar se o email já existe em outro usuário
    const existingUser = await prisma.usuario.findFirst({
      where: { 
        email, 
        NOT: { id } 
      },
    });

    if (existingUser) {
      return { success: false, error: 'Este e-mail já está cadastrado para outro usuário.' };
    }

    // Prepare update data
    const updateData: any = {
      nome,
      email,
      perfil,
    };

    // Only update password if provided
    if (senha) {
      updateData.senha = senha;
    }

    // Handle access (only for non-admins)
    if (perfil !== 'Administrador') {
      // First, delete existing access
      await prisma.unidadeAcesso.deleteMany({ where: { usuarioId: id } });
      await prisma.setorAcesso.deleteMany({ where: { usuarioId: id } });

      // Then create new access
      updateData.unidadesAcesso = {
        create: unidadesIds.map((unidadeId) => ({ unidadeId })),
      };
      updateData.setoresAcesso = {
        create: setoresIds.map((setorId) => ({ setorId })),
      };
    } else {
      // If admin, delete all access
      await prisma.unidadeAcesso.deleteMany({ where: { usuarioId: id } });
      await prisma.setorAcesso.deleteMany({ where: { usuarioId: id } });
    }

    await prisma.usuario.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/usuarios');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating usuario:', error);
    return { 
      success: false, 
      error: `Erro: ${error.message || 'Falha ao atualizar usuário'}` 
    };
  }
}
