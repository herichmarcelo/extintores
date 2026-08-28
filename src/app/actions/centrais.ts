'use server'

import prisma from '@/lib/prisma'
import { formatDatabaseError } from '@/lib/db-error'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TipoNormalizado =
  | 'detector_fumaca'
  | 'detector_termico'
  | 'sirene'
  | 'acionador_manual'
  | 'fonte_alimentacao'
  | 'desabilitado'
  | 'outro'

export type StatusDispositivo = 'Ativo' | 'Desabilitado'

export interface FiltrosDispositivos {
  busca?: string
  tipo?: string
  local?: string
  status?: StatusDispositivo | ''
  page?: number
  perPage?: number
}

// ─── Centrais ─────────────────────────────────────────────────────────────────

export async function getCentrais(unidadeId?: string) {
  try {
    const where = unidadeId ? { unidadeId } : {}
    const centrais = await prisma.centralIncendio.findMany({
      where,
      include: {
        unidade: { select: { id: true, nome: true, cidade: true, estado: true } },
        _count: { select: { dispositivos: true } },
      },
      orderBy: { nome: 'asc' },
    })
    return { success: true, data: centrais }
  } catch (error) {
    console.error('getCentrais error:', error)
    return { success: false, error: formatDatabaseError(error), data: [] }
  }
}

export async function getCentralById(id: string) {
  try {
    const central = await prisma.centralIncendio.findUnique({
      where: { id },
      include: {
        unidade: { select: { id: true, nome: true, cidade: true, estado: true } },
        _count: { select: { dispositivos: true } },
      },
    })
    return { success: true, data: central }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error), data: null }
  }
}

export async function createCentral(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    const nome = formData.get('nome') as string
    const modelo = formData.get('modelo') as string || null
    const fabricante = formData.get('fabricante') as string || null
    const unidadeId = formData.get('unidadeId') as string

    if (userId) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }
      if (user.perfil === 'Gestor') return { success: false, error: 'Sem permissão.' }
    }

    await prisma.centralIncendio.create({
      data: { nome, modelo, fabricante, unidadeId },
    })

    revalidatePath('/centrais')
    return { success: true }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error) }
  }
}

export async function updateCentral(id: string, formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    if (userId) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }
      if (user.perfil === 'Gestor') return { success: false, error: 'Sem permissão.' }
    }

    await prisma.centralIncendio.update({
      where: { id },
      data: {
        nome: formData.get('nome') as string,
        modelo: formData.get('modelo') as string || null,
        fabricante: formData.get('fabricante') as string || null,
      },
    })

    revalidatePath('/centrais')
    return { success: true }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error) }
  }
}

export async function deleteCentral(id: string, userId?: string) {
  try {
    if (userId) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }
      if (user.perfil !== 'Administrador') return { success: false, error: 'Apenas Administradores podem excluir centrais.' }
    }

    await prisma.centralIncendio.delete({ where: { id } })
    revalidatePath('/centrais')
    return { success: true }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error) }
  }
}

// ─── Dispositivos ─────────────────────────────────────────────────────────────

export async function getDispositivos(centralId: string, filtros: FiltrosDispositivos = {}) {
  try {
    const { busca, tipo, local, status, page = 1, perPage = 60 } = filtros

    const where: Record<string, unknown> = { centralId }

    if (busca) {
      where.OR = [
        { enderecoId: { contains: busca, mode: 'insensitive' } },
        { textoNaCentral: { contains: busca, mode: 'insensitive' } },
        { local: { contains: busca, mode: 'insensitive' } },
      ]
    }
    if (tipo) where.tipoNormalizado = tipo
    if (local) where.local = { contains: local, mode: 'insensitive' }
    if (status) where.status = status

    const [dispositivos, total] = await Promise.all([
      prisma.dispositivoCentral.findMany({
        where,
        orderBy: { enderecoId: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.dispositivoCentral.count({ where }),
    ])

    return {
      success: true,
      data: dispositivos,
      pagination: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error), data: [], pagination: null }
  }
}

export async function getDispositivoById(id: string) {
  try {
    const d = await prisma.dispositivoCentral.findUnique({
      where: { id },
      include: { central: { select: { id: true, nome: true } } },
    })
    return { success: true, data: d }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error), data: null }
  }
}

export async function getEstatisticasCentral(centralId: string) {
  try {
    const [total, porStatus, porTipo, locais] = await Promise.all([
      prisma.dispositivoCentral.count({ where: { centralId } }),
      prisma.dispositivoCentral.groupBy({
        by: ['status'],
        where: { centralId },
        _count: { id: true },
      }),
      prisma.dispositivoCentral.groupBy({
        by: ['tipoNormalizado'],
        where: { centralId },
        _count: { id: true },
      }),
      prisma.dispositivoCentral.findMany({
        where: { centralId, local: { not: null } },
        select: { local: true },
        distinct: ['local'],
        orderBy: { local: 'asc' },
      }),
    ])

    const statusMap = Object.fromEntries(porStatus.map(s => [s.status, s._count.id]))
    const tipoMap = Object.fromEntries(porTipo.map(t => [t.tipoNormalizado, t._count.id]))

    return {
      success: true,
      data: {
        total,
        ativos: statusMap['Ativo'] ?? 0,
        desabilitados: statusMap['Desabilitado'] ?? 0,
        detectorFumaca: tipoMap['detector_fumaca'] ?? 0,
        detectorTermico: tipoMap['detector_termico'] ?? 0,
        sirenes: (tipoMap['sirene'] ?? 0),
        acionadores: tipoMap['acionador_manual'] ?? 0,
        locais: locais.map(l => l.local).filter(Boolean) as string[],
      },
    }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error), data: null }
  }
}

export async function getLocaisDistintos(centralId: string) {
  try {
    const locais = await prisma.dispositivoCentral.findMany({
      where: { centralId, local: { not: null } },
      select: { local: true },
      distinct: ['local'],
      orderBy: { local: 'asc' },
    })
    return { success: true, data: locais.map(l => l.local).filter(Boolean) as string[] }
  } catch (error) {
    return { success: false, data: [] }
  }
}

export async function createDispositivo(formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    if (userId) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }
      if (user.perfil === 'Gestor') return { success: false, error: 'Sem permissão.' }
    }

    const centralId = formData.get('centralId') as string
    const enderecoId = String(formData.get('enderecoId')).padStart(3, '0')

    // Verifica duplicata
    const existe = await prisma.dispositivoCentral.findUnique({
      where: { centralId_enderecoId: { centralId, enderecoId } },
    })
    if (existe) return { success: false, error: `Endereço ${enderecoId} já cadastrado nesta central.` }

    const tipo = formData.get('tipo') as string
    const tipoNormalizado = normalizaTipoServer(tipo)

    await prisma.dispositivoCentral.create({
      data: {
        enderecoId,
        tipo,
        tipoNormalizado,
        local: formData.get('local') as string || null,
        textoNaCentral: formData.get('textoNaCentral') as string || null,
        zona: formData.get('zona') as string || '00',
        status: (formData.get('status') as string) || 'Ativo',
        observacoes: formData.get('observacoes') as string || null,
        centralId,
      },
    })

    revalidatePath('/centrais')
    return { success: true }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error) }
  }
}

export async function updateDispositivo(id: string, formData: FormData) {
  try {
    const userId = formData.get('userId') as string
    if (userId) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }
      if (user.perfil === 'Gestor') return { success: false, error: 'Sem permissão.' }
    }

    const tipo = formData.get('tipo') as string

    await prisma.dispositivoCentral.update({
      where: { id },
      data: {
        tipo,
        tipoNormalizado: normalizaTipoServer(tipo),
        local: formData.get('local') as string || null,
        textoNaCentral: formData.get('textoNaCentral') as string || null,
        zona: formData.get('zona') as string || '00',
        status: formData.get('status') as string,
        observacoes: formData.get('observacoes') as string || null,
      },
    })

    revalidatePath('/centrais')
    return { success: true }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error) }
  }
}

export async function deleteDispositivo(id: string, userId?: string) {
  try {
    if (userId) {
      const user = await prisma.usuario.findUnique({ where: { id: userId } })
      if (!user) return { success: false, error: 'Usuário não encontrado.' }
      if (user.perfil !== 'Administrador') return { success: false, error: 'Apenas Administradores podem excluir dispositivos.' }
    }

    await prisma.dispositivoCentral.delete({ where: { id } })
    revalidatePath('/centrais')
    return { success: true }
  } catch (error) {
    return { success: false, error: formatDatabaseError(error) }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizaTipoServer(tipo: string): string {
  const t = tipo.toLowerCase()
  if (t.includes('fumaça') || t.includes('fumaca')) return 'detector_fumaca'
  if (t.includes('térmico') || t.includes('termico')) return 'detector_termico'
  if (t.includes('sirene')) return 'sirene'
  if (t.includes('acionador')) return 'acionador_manual'
  if (t.includes('fonte')) return 'fonte_alimentacao'
  if (t.includes('desabilitar') || t.includes('desabilitado')) return 'desabilitado'
  return 'outro'
}
