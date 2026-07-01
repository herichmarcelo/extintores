"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  date?: Date | null
  setDate: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  placeholder = "dd/mm/aaaa",
  disabled = false,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white",
            !date && "text-slate-500"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: ptBR })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          required
          mode="single"
          selected={date || undefined}
          onSelect={setDate}
          autoFocus={true}
          locale={ptBR}
          weekStartsOn={1}
        />
      </PopoverContent>
    </Popover>
  )
}
