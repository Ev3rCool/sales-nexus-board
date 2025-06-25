
import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface BillingCycleSelectorProps {
  planType: string
  value: string
  onChange: (value: string) => void
}

export const BillingCycleSelector: React.FC<BillingCycleSelectorProps> = ({
  planType,
  value,
  onChange
}) => {
  const getAvailableCycles = (type: string) => {
    const lowerType = type.toLowerCase()
    
    if (lowerType.includes('shared')) {
      return [
        { value: 'M', label: 'Monthly' },
        { value: 'A', label: 'Annual' },
        { value: 'biennial', label: 'Biennial' },
        { value: 'triennial', label: 'Triennial' }
      ]
    } else if (lowerType.includes('vps') || lowerType.includes('dedicated')) {
      return [
        { value: 'M', label: 'Monthly' },
        { value: 'Q', label: 'Quarterly' },
        { value: 'S-A', label: 'Semi-Annual' },
        { value: 'A', label: 'Annual' }
      ]
    } else {
      // Default cycles
      return [
        { value: 'M', label: 'Monthly' },
        { value: 'Q', label: 'Quarterly' },
        { value: 'S-A', label: 'Semi-Annual' },
        { value: 'A', label: 'Annual' }
      ]
    }
  }

  const cycles = getAvailableCycles(planType)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="bg-white/5 border-white/10 text-white">
        <SelectValue placeholder="Select billing cycle" />
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-white/10">
        {cycles.map((cycle) => (
          <SelectItem 
            key={cycle.value} 
            value={cycle.value}
            className="text-white hover:bg-white/10"
          >
            {cycle.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
