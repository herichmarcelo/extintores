"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { InputContainer } from "./InputContainer"

interface DatePickerProps {
  date?: Date | null
  setDate: (date: Date | null) => void
  placeholder?: string
  disabled?: boolean
  focusColor?: "red" | "blue"
}

export function DatePicker({
  date,
  setDate,
  placeholder = "dd/mm/aaaa",
  disabled = false,
  focusColor = "red",
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-left font-normal p-0 h-full bg-transparent border-none shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              !date && "text-slate-500"
            )}
            disabled={disabled}
          />
        }
      >
        <InputContainer icon={<CalendarIcon className="w-5 h-5" />} focusColor={focusColor}>
          <div className="flex-1 flex items-center justify-between w-full pr-4">
            <span>
              {date ? (
                format(date, "dd/MM/yyyy", { locale: ptBR })
              ) : (
                <span>{placeholder}</span>
              )}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400 opacity-50" />
          </div>
        </InputContainer>
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
