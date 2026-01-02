import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to calculate invoice totals
function calculateInvoiceTotals(
  items: Array<{ quantity: number; unit_price: number }>,
  taxRate: number,
  discountType: 'percentage' | 'amount' | null,
  discountValue: number | null
) {
  // Calculate subtotal from items
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price)
  }, 0)

  // Calculate discount amount
  let discountAmount = 0
  if (discountType && discountValue) {
    if (discountType === 'percentage') {
      discountAmount = (subtotal * discountValue) / 100
    } else {
      discountAmount = discountValue
    }
  }

  // Calculate taxable amount (after discount)
  const taxableAmount = subtotal - discountAmount

  // Calculate tax
  const taxAmount = (taxableAmount * taxRate) / 100

  // Calculate total
  const total = taxableAmount + taxAmount

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount_amount: Number(discountAmount.toFixed(2)),
    tax_amount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .order('issue_date', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: invoices, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(invoices)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.client_id || !body.invoice_number || !body.status || !body.issue_date || !body.due_date || !body.items || body.items.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate totals
    const totals = calculateInvoiceTotals(
      body.items,
      body.tax_rate || 0,
      body.discount_type || null,
      body.discount_value || null
    )

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        client_id: body.client_id,
        invoice_number: body.invoice_number,
        status: body.status,
        issue_date: body.issue_date,
        due_date: body.due_date,
        subtotal: totals.subtotal,
        tax_rate: body.tax_rate || 0,
        tax_amount: totals.tax_amount,
        discount_type: body.discount_type || null,
        discount_value: body.discount_value || null,
        discount_amount: totals.discount_amount,
        total: totals.total,
        currency: body.currency || 'USD',
        notes: body.notes || null,
      })
      .select()
      .single()

    if (invoiceError) {
      return NextResponse.json({ error: invoiceError.message }, { status: 500 })
    }

    // Create invoice items
    const itemsToInsert = body.items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity || 1,
      unit_price: item.unit_price,
      amount: (item.quantity || 1) * item.unit_price,
    }))

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(itemsToInsert)

    if (itemsError) {
      // Rollback: delete the invoice if items insertion fails
      await supabase.from('invoices').delete().eq('id', invoice.id)
      return NextResponse.json({ error: itemsError.message }, { status: 500 })
    }

    // Fetch the complete invoice with items and client
    const { data: completeInvoice, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(*),
        invoice_items(*)
      `)
      .eq('id', invoice.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    return NextResponse.json(completeInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
