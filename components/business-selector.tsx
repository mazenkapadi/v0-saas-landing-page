"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useBusiness } from "@/contexts/business-context"

export default function BusinessSelector() {
  const [open, setOpen] = useState(false)
  const { currentBusiness, availableBusinesses, switchBusiness, isLoading } = useBusiness()

  const handleBusinessChange = (businessId: string) => {
    if (businessId === currentBusiness) {
      setOpen(false)
      return
    }

    switchBusiness(businessId)
    setOpen(false)
  }

  if (isLoading) {
    return (
      <div className="w-full p-2 border rounded-md bg-background animate-pulse">
        <div className="h-6 bg-muted rounded"></div>
      </div>
    )
  }

  // Don't render if user has no business access
  if (availableBusinesses.length === 0) {
    return <div className="w-full p-2 text-center text-sm text-muted-foreground">No business access</div>
  }

  const selectedBusinessData = availableBusinesses.find((b) => b.id === currentBusiness)

  // If user only has access to one business, show it without dropdown
  if (availableBusinesses.length === 1) {
    const business = availableBusinesses[0]
    return (
      <div className="w-full p-2 border rounded-md bg-background">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
            {business.logo}
          </div>
          <span className="truncate text-sm">{business.name}</span>
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background hover:bg-muted/50 border-border"
        >
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
              {selectedBusinessData?.logo || "?"}
            </div>
            <span className="truncate">{selectedBusinessData?.name || "Select business..."}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[60]" align="start">
        <Command>
          <CommandInput placeholder="Search businesses..." />
          <CommandList>
            <CommandEmpty>No businesses found.</CommandEmpty>
            <CommandGroup>
              {availableBusinesses.map((business) => (
                <CommandItem
                  key={business.id}
                  value={business.id}
                  onSelect={() => handleBusinessChange(business.id)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {business.logo}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{business.name}</span>
                      <span className="text-xs text-muted-foreground">{business.email}</span>
                    </div>
                  </div>
                  <Check
                    className={cn("ml-auto h-4 w-4", currentBusiness === business.id ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
