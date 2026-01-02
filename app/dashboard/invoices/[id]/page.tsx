"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InvoiceWithDetails } from "@/types/database"

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    params.then((p) => {
      setId(p.id)
      fetchInvoice(p.id)
    })
  }, [params])

  const fetchInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data)
      } else if (response.status === 404) {
        alert("Invoice not found")
        router.push("/dashboard/invoices")
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadPdf = async () => {
    if (invoiceRef.current) {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`invoice-${invoice?.invoice_number}.pdf`)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return
    
    setUpdatingStatus(true)
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        setInvoice(updatedInvoice)
      } else {
        alert("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "overdue":
        return "destructive"
      case "draft":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Invoice not found</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="size-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
          <Button variant="outline" onClick={downloadPdf}>
            <Download className="size-4 mr-2" />
            Download PDF
          </Button>
        </div>

        <Card ref={invoiceRef}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl">Invoice {invoice.invoice_number}</CardTitle>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <Select 
                    value={invoice.status} 
                    onValueChange={handleStatusChange}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Issue Date</p>
                <p className="font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Client Information</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{invoice.client?.name}</p>
                  <p>{invoice.client?.company_name}</p>
                  <p className="text-muted-foreground">{invoice.client?.email}</p>
                  {invoice.client?.phone && (
                    <p className="text-muted-foreground">{invoice.client.phone}</p>
                  )}
                  {invoice.client?.address && (
                    <p className="text-muted-foreground">{invoice.client.address}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-4">Line Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.invoice_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(item.unit_price.toString()).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        ${parseFloat(item.amount.toString()).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${parseFloat(invoice.subtotal.toString()).toFixed(2)}</span>
                </div>
                {invoice.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Discount ({invoice.discount_type === "percentage" ? `${invoice.discount_value}%` : "Amount"}):
                    </span>
                    <span>-${parseFloat(invoice.discount_amount.toString()).toFixed(2)}</span>
                  </div>
                )}
                {invoice.tax_amount > 0 && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Tax ({invoice.tax_rate}%):</span>
                    <span>${parseFloat(invoice.tax_amount.toString()).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${parseFloat(invoice.total.toString()).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
