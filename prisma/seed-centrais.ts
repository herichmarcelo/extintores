/**
 * seed-centrais.ts
 * Script one-shot: importa os 202 dispositivos do Excel para o banco,
 * vinculando à unidade "Bello Alimentos - Frigorifico Itaquirai - MS".
 *
 * Execução:
 *   npx tsx prisma/seed-centrais.ts
 */

import { PrismaClient } from '@prisma/client'
import * as XLSX from 'xlsx'
import path from 'path'

const prisma = new PrismaClient()

// Normaliza o tipo para um slug usado em ícones/filtros
function normalizaTipo(tipo: string): string {
  const t = tipo.toLowerCase()
  if (t.includes('fumaça') || t.includes('fumaca')) return 'detector_fumaca'
  if (t.includes('térmico') || t.includes('termico')) return 'detector_termico'
  if (t.includes('sirene') || t.includes('sirene')) return 'sirene'
  if (t.includes('acionador')) return 'acionador_manual'
  if (t.includes('fonte')) return 'fonte_alimentacao'
  if (t.includes('desabilitar') || t.includes('desabilitado')) return 'desabilitado'
  return 'outro'
}

async function main() {
  // 1. Localiza a unidade do Frigorifico
  const unidade = await prisma.unidade.findFirst({
    where: {
      OR: [
        { nome: { contains: 'Frigorifico', mode: 'insensitive' } },
        { nome: { contains: 'Frigorífico', mode: 'insensitive' } },
        { nome: { contains: 'Itaquirai', mode: 'insensitive' } },
        { nome: { contains: 'Itaquiraí', mode: 'insensitive' } },
      ],
    },
  })

  if (!unidade) {
    console.error('❌ Unidade do Frigorifico não encontrada no banco!')
    console.error('   Verifique se existe uma unidade com "Frigorifico" ou "Itaquirai" no nome.')
    process.exit(1)
  }

  console.log(`✅ Unidade encontrada: ${unidade.nome} (${unidade.id})`)

  // 2. Cria (ou reutiliza) a CentralIncendio
  let central = await prisma.centralIncendio.findFirst({
    where: { unidadeId: unidade.id },
  })

  if (!central) {
    central = await prisma.centralIncendio.create({
      data: {
        nome: 'Central Frigorífico - Avalon L250A / Evolution',
        modelo: 'Avalon L250A / Avalon Evolution',
        fabricante: 'Tecnohold',
        unidadeId: unidade.id,
      },
    })
    console.log(`✅ Central criada: ${central.nome} (${central.id})`)
  } else {
    console.log(`ℹ️  Central já existe: ${central.nome} (${central.id})`)
  }

  // 3. Lê o Excel
  const xlsxPath = path.join(process.cwd(), 'public', 'controle_enderecamento_frigorifico.xlsx')
  const wb = XLSX.readFile(xlsxPath)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: null })

  // Dados começam na linha 5 (índice 4)
  const dataRows = rows.slice(4).filter((row: unknown[]) => row[1] != null) as unknown[][]

  console.log(`📊 ${dataRows.length} dispositivos encontrados no Excel`)

  // 4. Prepara os registros
  const dispositivos = dataRows.map((row: unknown[]) => {
    const enderecoId = String(row[1]).trim().padStart(3, '0')
    const tipo = row[2] ? String(row[2]).trim() : 'Tipo 00 - Desabilitar dispositivo'
    const local = row[3] ? String(row[3]).trim() : null
    const textoNaCentral = row[4] ? String(row[4]).trim() : null
    const zona = row[5] ? String(row[5]).trim() : '00'
    const statusRaw = row[6] ? String(row[6]).trim() : null
    const observacoes = row[7] ? String(row[7]).trim() : null

    const status = statusRaw && statusRaw.toLowerCase().includes('desabilitado')
      ? 'Desabilitado'
      : 'Ativo'

    return {
      enderecoId,
      tipo,
      tipoNormalizado: normalizaTipo(tipo),
      local,
      textoNaCentral,
      zona,
      status,
      observacoes,
      centralId: central!.id,
    }
  })

  // 5. Insere com skipDuplicates
  const result = await prisma.dispositivoCentral.createMany({
    data: dispositivos,
    skipDuplicates: true,
  })

  console.log(`✅ ${result.count} dispositivos inseridos no banco`)

  // 6. Resumo
  const stats = await prisma.dispositivoCentral.groupBy({
    by: ['status'],
    where: { centralId: central.id },
    _count: { id: true },
  })
  console.log('\n📈 Resumo por status:')
  stats.forEach(s => console.log(`   ${s.status}: ${s._count.id}`))

  const tipoStats = await prisma.dispositivoCentral.groupBy({
    by: ['tipoNormalizado'],
    where: { centralId: central.id },
    _count: { id: true },
  })
  console.log('\n📈 Resumo por tipo:')
  tipoStats.forEach(s => console.log(`   ${s.tipoNormalizado}: ${s._count.id}`))
}

main()
  .catch(e => {
    console.error('❌ Erro:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
