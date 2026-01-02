import Link from "next/link"
import InvoiceGenerator from "@/components/invoice-generator"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="container mx-auto py-4 sm:py-6 px-2">
      <div className="flex items-center mb-4 sm:mb-6">
      <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/invoices">
              <ArrowLeft className="size-4 mr-2" />
              Back to Invoices
            </Link>
          </Button>
      </div>
      <InvoiceGenerator />
      <footer className="mt-8 sm:mt-10 text-center text-muted-foreground text-sm pb-4">
        <p>
          © {new Date().getFullYear()}{" "}
          <Link
            href="https://zaytoontech.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold hover:text-foreground transition-colors"
          >
            Zaytoon Tech Llc
          </Link>
          . All rights reserved.
        </p>
      </footer>
    </main>
  )
}
