"use client"

import * as React from "react"
import { format, getMonth, getYear, setMonth, setYear } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { ptBR } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  label?: string
  error?: string
}

export function DatePickerWithYear({ date, setDate, label, error }: DatePickerProps) {
  const [month, setMonthState] = React.useState<Date>(date || new Date())

  const years = React.useMemo(() => {
    const currentYear = new Date().getFullYear()
    const startYear = 1900
    const years = []
    for (let i = currentYear; i >= startYear; i--) {
      years.push(i)
    }
    return years
  }, [])

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  const handleMonthChange = (monthIndex: string) => {
    const newDate = setMonth(month, parseInt(monthIndex))
    setMonthState(newDate)
  }

  const handleYearChange = (yearStr: string) => {
    const newDate = setYear(month, parseInt(yearStr))
    setMonthState(newDate)
  }

  // Atualiza o estado interno quando a prop date muda
  React.useEffect(() => {
    if (date) {
      setMonthState(date)
    }
  }, [date])

  return (
    <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "flex h-11 w-full justify-start text-left font-normal rounded-lg border-input bg-card px-4 py-2",
              !date && "text-muted-foreground",
              error && "border-destructive focus:ring-destructive",
              "hover:bg-background hover:text-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-2 p-3 border-b">
            <Select
              value={getMonth(month).toString()}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={month} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={getYear(month).toString()}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            month={month}
            onMonthChange={setMonthState}
            initialFocus
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
