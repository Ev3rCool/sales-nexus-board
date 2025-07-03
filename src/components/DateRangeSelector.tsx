import React from 'react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from "date-fns"
import { cn } from "@/lib/utils"

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangeSelectorProps {
  dateRange: DateRange | null
  onDateRangeChange: (range: DateRange | null) => void
}

const presetRanges = [
  { label: '1 Day', value: '1d' },
  { label: 'Weekly', value: '1w' },
  { label: '1 Month', value: '1m' },
  { label: '3 Months', value: '3m' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
  { label: 'Year over Year', value: 'yoy' },
  { label: 'Custom', value: 'custom' }
]

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [selectedPreset, setSelectedPreset] = React.useState<string>('1m')
  const [isCustomOpen, setIsCustomOpen] = React.useState(false)

  const getPresetRange = (preset: string): DateRange => {
    const today = new Date()
    const endDate = endOfDay(today)
    
    switch (preset) {
      case '1d':
        return { from: startOfDay(today), to: endDate }
      case '1w':
        return { from: startOfDay(subDays(today, 7)), to: endDate }
      case '1m':
        return { from: startOfDay(subMonths(today, 1)), to: endDate }
      case '3m':
        return { from: startOfDay(subMonths(today, 3)), to: endDate }
      case '6m':
        return { from: startOfDay(subMonths(today, 6)), to: endDate }
      case '1y':
        return { from: startOfDay(subYears(today, 1)), to: endDate }
      case 'yoy':
        return { from: startOfDay(subYears(today, 1)), to: endOfDay(subYears(subYears(today, 1), -1)) }
      default:
        return { from: startOfDay(subMonths(today, 1)), to: endDate }
    }
  }

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset)
    if (preset === 'custom') {
      setIsCustomOpen(true)
    } else {
      const range = getPresetRange(preset)
      onDateRangeChange(range)
    }
  }

  const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      })
      setIsCustomOpen(false)
    }
  }

  React.useEffect(() => {
    if (!dateRange) {
      const defaultRange = getPresetRange('1m')
      onDateRangeChange(defaultRange)
    }
  }, [dateRange, onDateRangeChange])

  return (
    <div className="flex gap-2 items-center">
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-white/10">
          {presetRanges.map((range) => (
            <SelectItem 
              key={range.value} 
              value={range.value}
              className="text-white hover:bg-white/10"
            >
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset === 'custom' && (
        <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10",
                !dateRange && "text-gray-400"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-800 border-white/10" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={{ from: dateRange?.from, to: dateRange?.to }}
              onSelect={handleCustomDateSelect}
              numberOfMonths={2}
              className="text-white"
            />
          </PopoverContent>
        </Popover>
      )}

      {selectedPreset !== 'custom' && dateRange && (
        <div className="text-sm text-gray-400">
          {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
        </div>
      )}
    </div>
  )
}