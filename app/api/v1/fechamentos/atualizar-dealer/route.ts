import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { fechamentoPagamentosTable } from '@/src/db/schema'

export async function POST(req: NextRequest) {
  try {
    const { report_id, dealer_id } = await req.json()

    if (!report_id || !dealer_id) {
      return NextResponse.json({ error: 'Parâmetros ausentes' }, { status: 400 })
    }

   
    const [fechamentoPagamento] = await db
      .select()
      .from(fechamentoPagamentosTable)
      .where(eq(fechamentoPagamentosTable.report_id, report_id))

    if (!fechamentoPagamento) {
      return NextResponse.json({ error: 'Fechamento não encontrado ou não existe pagamento associado' }, { status: 404 })
    }

    // Atualiza o dealer_id
    await db
      .update(fechamentoPagamentosTable)
      .set({ dealer_id })
      .where(eq(fechamentoPagamentosTable.report_id, report_id))

    return NextResponse.json({ success: true, message: 'Dealer atualizado com sucesso' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
