"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import { v4 as uuidv4 } from "uuid"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InvoiceForm from "@/components/invoice-form"
import InvoicePreview from "@/components/invoice-preview"
import { addDaysToInvoiceDate } from "@/lib/invoices"
import type { InvoiceData } from "@/types/invoice"
import type { Client } from "@/types/database"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Save } from "lucide-react"

export default function InvoiceGenerator() {
  const [activeTab, setActiveTab] = useState("edit")
  const invoiceRef = useRef<HTMLDivElement>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const { profile } = useAuth()
  const router = useRouter()

  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
    date: new Date().toISOString().split("T")[0],
    dueDate: addDaysToInvoiceDate(new Date(), 2).toISOString().split("T")[0],
    status: "draft",
    companyName: "",
    companyLogo: "",
    companyDetails: "",
    fromName: "",
    fromEmail: "",
    fromAddress: "",
    toName: "",
    toEmail: "",
    toAddress: "",
    items: [
      {
        id: uuidv4(),
        description: "",
        quantity: 1,
        price: 0,
        currency: "USD",
        exchangeRate: 1,
        discountType: "percentage",
        discountValue: 0,
      },
    ],
    notes: "",
    taxRate: 0,
    currency: "USD",
    footer: "Thank you for your business!",
    discountType: "percentage",
    discountValue: 0,
    applyInvoiceDiscountToDiscountedItems: true,
  })

  useEffect(() => {
    fetchClients()
    // Auto-fill user profile information
    if (profile) {
      setInvoiceData(prev => ({
        ...prev,
        fromName: profile.name || "",
        fromEmail: profile.email || "",
        fromAddress: profile.address || "",
        companyName: profile.company_name || "",
      }))
    }
  }, [profile])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients")
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const handleClientSelect = (clientId: string) => {
    setSelectedClientId(clientId)
    const client = clients.find(c => c.id === clientId)
    if (client) {
      setInvoiceData({
        ...invoiceData,
        toName: client.name,
        toEmail: client.email,
        toAddress: client.address || "",
      })
    }
  }
  
  const handleInvoiceChange = (field: string, value: string | number | boolean) => {
  if (field === "currency") {
    const updatedItems = invoiceData.items.map((item) => {
      if (item.currency === invoiceData.currency) {
        return { ...item, currency: value as string, exchangeRate: 1 }
      }
      return item
    })
    setInvoiceData({ ...invoiceData, [field]: value, items: updatedItems })
  } else if (field === "date") {
    const newDueDate = addDaysToInvoiceDate(new Date(value as string), 2).toISOString().split("T")[0];
    setInvoiceData({ ...invoiceData, [field]: value, dueDate: newDueDate });
  } else if (field === "dueDate" && !value) {
    const newDueDate = addDaysToInvoiceDate(new Date(invoiceData.date), 2).toISOString().split("T")[0];
    setInvoiceData({ ...invoiceData, [field]: newDueDate })
    } else {
    setInvoiceData({ ...invoiceData, [field]: value })
    }
  }




  const handleItemChange = (id: string, field: string, value: string | number) => {
    const updatedItems = invoiceData.items.map((item) => {
      if (item.id === id) {
        if (field === "currency") {
          // If currency is changed to match invoice currency, reset exchange rate to 1
          const exchangeRate = value === invoiceData.currency ? 1 : item.exchangeRate
          return { ...item, [field]: value, exchangeRate }
        }

        if (field === "quantity" || field === "price" || field === "exchangeRate" || field === "discountValue") {
          return { ...item, [field]: Number.parseFloat(value as string) || 0 }
        }

        return { ...item, [field]: value }
      }
      return item
    })
    setInvoiceData({ ...invoiceData, items: updatedItems })
  }

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          id: uuidv4(),
          description: "",
          quantity: 1,
          price: 0,
          currency: invoiceData.currency,
          exchangeRate: 1,
          discountType: "percentage",
          discountValue: 0,
        },
      ],
    })
  }

  const removeItem = (id: string) => {
    if (invoiceData.items.length > 1) {
      setInvoiceData({
        ...invoiceData,
        items: invoiceData.items.filter((item) => item.id !== id),
      })
    }
  }

  const calculateItemDiscount = (item: (typeof invoiceData.items)[0]) => {
    const itemSubtotal = item.quantity * item.price
    if (item.discountValue <= 0) return 0

    if (item.discountType === "percentage") {
      return itemSubtotal * (item.discountValue / 100)
    } else {
      return Math.min(item.discountValue, itemSubtotal) // Ensure discount doesn't exceed item subtotal
    }
  }

  const calculateItemTotal = (item: (typeof invoiceData.items)[0]) => {
    const itemSubtotal = item.quantity * item.price
    const itemDiscount = calculateItemDiscount(item)
    const itemNetTotal = itemSubtotal - itemDiscount

    return item.currency === invoiceData.currency ? itemNetTotal : itemNetTotal * item.exchangeRate
  }

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTotalItemDiscounts = () => {
    return invoiceData.items.reduce((sum, item) => {
      const itemDiscount = calculateItemDiscount(item)
      // Convert to invoice currency if needed
      return sum + (item.currency === invoiceData.currency ? itemDiscount : itemDiscount * item.exchangeRate)
    }, 0)
  }

  const calculateDiscount = () => {
    if (invoiceData.discountValue <= 0) return 0

    let discountableAmount = 0

    if (invoiceData.applyInvoiceDiscountToDiscountedItems) {
      // Apply discount to all items
      discountableAmount = calculateSubtotal()
    } else {
      // Apply discount only to items without their own discount
      discountableAmount = invoiceData.items.reduce((sum, item) => {
        if (item.discountValue > 0) return sum // Skip items with discount

        const itemTotal = item.quantity * item.price
        return sum + (item.currency === invoiceData.currency ? itemTotal : itemTotal * item.exchangeRate)
      }, 0)
    }

    if (invoiceData.discountType === "percentage") {
      return discountableAmount * (invoiceData.discountValue / 100)
    } else {
      return Math.min(invoiceData.discountValue, discountableAmount) // Ensure discount doesn't exceed subtotal
    }
  }

  const calculateTaxableAmount = () => {
    return calculateSubtotal() - calculateDiscount()
  }

  const calculateTax = () => {
    return calculateTaxableAmount() * (invoiceData.taxRate / 100)
  }

  const calculateTotal = () => {
    return calculateTaxableAmount() + calculateTax()
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
      pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setInvoiceData({
          ...invoiceData,
          companyLogo: reader.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const saveInvoice = async () => {
    if (!selectedClientId) {
      alert("Please select a client")
      return
    }

    if (invoiceData.items.some(item => !item.description || item.price <= 0)) {
      alert("Please fill in all item details")
      return
    }

    setSaving(true)

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClientId,
          invoice_number: invoiceData.invoiceNumber,
          status: invoiceData.status || "draft",
          issue_date: invoiceData.date,
          due_date: invoiceData.dueDate,
          tax_rate: invoiceData.taxRate,
          discount_type: invoiceData.discountValue > 0 ? invoiceData.discountType : null,
          discount_value: invoiceData.discountValue > 0 ? invoiceData.discountValue : null,
          currency: invoiceData.currency,
          notes: invoiceData.notes,
          items: invoiceData.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      })

      if (response.ok) {
        alert("Invoice saved successfully!")
        router.push("/dashboard/invoices")
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || "Failed to save invoice"}`)
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert("Failed to save invoice")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="edit">Edit Invoice</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <InvoiceForm
            invoiceData={invoiceData}
            clients={clients}
            selectedClientId={selectedClientId}
            onClientSelect={handleClientSelect}
            handleInvoiceChange={handleInvoiceChange}
            handleItemChange={handleItemChange}
            handleLogoUpload={handleLogoUpload}
            addItem={addItem}
            removeItem={removeItem}
            calculateItemDiscount={calculateItemDiscount}
            calculateItemTotal={calculateItemTotal}
            calculateTotalItemDiscounts={calculateTotalItemDiscounts}
            calculateSubtotal={calculateSubtotal}
            calculateDiscount={calculateDiscount}
            calculateTaxableAmount={calculateTaxableAmount}
            calculateTax={calculateTax}
            calculateTotal={calculateTotal}
          />
          <div className="mt-6 flex justify-end gap-4">
            <Button onClick={() => router.push("/dashboard/invoices")} variant="outline">
              Cancel
            </Button>
            <Button onClick={saveInvoice} disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card className="p-6">
            <div ref={invoiceRef}>
              <InvoicePreview
                invoiceData={invoiceData}
                calculateItemDiscount={calculateItemDiscount}
                calculateItemTotal={calculateItemTotal}
                calculateTotalItemDiscounts={calculateTotalItemDiscounts}
                calculateSubtotal={calculateSubtotal}
                calculateDiscount={calculateDiscount}
                calculateTaxableAmount={calculateTaxableAmount}
                calculateTax={calculateTax}
                calculateTotal={calculateTotal}
              />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <Button onClick={saveInvoice} disabled={saving} variant="outline">
                <Save className="size-4 mr-2" />
                {saving ? "Saving..." : "Save Invoice"}
              </Button>
              <Button onClick={downloadPdf}>Download PDF</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
