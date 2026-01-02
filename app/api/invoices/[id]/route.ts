import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to calculate invoice totals
function calculateInvoiceTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  taxRate: number,
  discountType: 'percentage' | 'amount' | null,
  discountValue: number | null
) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  
  let discountAmount = 0
  if (discountType && discountValue) {
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100
    } else {
      discountAmount = discountValue
    }
  }
  
  const taxableAmount = subtotal - discountAmount
  const taxAmount = (taxableAmount * taxRate) / 100
  const total = taxableAmount + taxAmount
  
  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount_amount: Number(discountAmount.toFixed(2)),
    tax_amount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // If items are being updated, recalculate totals
    let totals = null
    if (body.items) {
      totals = calculateInvoiceTotals(
        body.items,
        body.tax_rate ?? 0,
        body.discount_type ?? null,
        body.discount_value ?? null
      )
    }

    // Update invoice
    const updateData: any = {}
    if (body.client_id !== undefined) updateData.client_id = body.client_id
    if (body.invoice_number !== undefined) updateData.invoice_number = body.invoice_number
    if (body.status !== undefined) updateData.status = body.status
    if (body.issue_date !== undefined) updateData.issue_date = body.issue_date
    if (body.due_date !== undefined) updateData.due_date = body.due_date
    if (body.tax_rate !== undefined) updateData.tax_rate = body.tax_rate
    if (body.discount_type !== undefined) updateData.discount_type = body.discount_type
    if (body.discount_value !== undefined) updateData.discount_value = body.discount_value
    if (body.currency !== undefined) updateData.currency = body.currency
    if (body.notes !== undefined) updateData.notes = body.notes

    if (totals) {
      updateData.subtotal = totals.subtotal
      updateData.tax_amount = totals.tax_amount
      updateData.discount_amount = totals.discount_amount
      updateData.total = totals.total
    }

    const { data: invoice, error: updateError } = await supabase
      .from('invoices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update invoice items if provided
    if (body.items) {
      // Delete existing items
      await supabase.from('invoice_items').delete().eq('invoice_id', id)

      // Insert new items
      const itemsToInsert = body.items.map((item: any) => ({
        invoice_id: id,
        description: item.description,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        amount: (item.quantity || 1) * item.unit_price,
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) {
        return NextResponse.json({ error: itemsError.message }, { status: 500 })
      }
    }

    // Fetch the complete updated invoice
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json(completeInvoice)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
