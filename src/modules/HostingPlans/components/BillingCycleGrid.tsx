import React from 'react'
import { Badge } from '@/components/ui/badge'

interface BillingCycleGridProps {
  category: string
  selectedCycle: string | null
  onCycleSelect: (cycle: string) => void
}

interface BillingCycle {
  value: string
  label: string
  description: string
}

export const BillingCycleGrid: React.FC<BillingCycleGridProps> = ({
  category,
  selectedCycle,
  onCycleSelect
}) => {
  const getBillingCycles = (type: string): BillingCycle[] => {
    if (type === 'shared') {
      return [
        { value: 'M', label: '1 Month', description: 'Monthly billing' },
        { value: 'A', label: '1 Year', description: 'Save with annual billing' },
        { value: 'biennial', label: '2 Years', description: 'Best value - 2 years' },
        { value: 'triennial', label: '3 Years', description: 'Maximum savings - 3 years' }
      ]
    } else {
      return [
        { value: 'M', label: '1 Month', description: 'Monthly billing' },
        { value: 'Q', label: 'Quarterly', description: '3 months billing' },
        { value: 'S-A', label: 'Semi-Annual', description: '6 months billing' },
        { value: 'A', label: 'Annual', description: 'Save with annual billing' }
      ]
    }
  }

  const cycles = getBillingCycles(category)

  const getCategoryDisplayName = (type: string) => {
    switch (type) {
      case 'shared': return 'Shared Hosting'
      case 'vps': return 'Cloud SSD VPS'
      case 'dedicated': return 'Dedicated CPU Servers'
      default: return type
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Choose Billing Cycle
        </h3>
        <p className="text-sm text-gray-400">
          Select billing frequency for {getCategoryDisplayName(category)}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cycles.map((cycle) => (
          <Badge
            key={cycle.value}
            variant={selectedCycle === cycle.value ? "default" : "outline"}
            className={`cursor-pointer p-4 h-auto flex flex-col items-center text-center transition-all duration-200 hover:scale-105 ${
              selectedCycle === cycle.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white/30'
            }`}
            onClick={() => onCycleSelect(cycle.value)}
          >
            <div className="font-medium text-sm mb-1">{cycle.label}</div>
            <div className="text-xs opacity-80">{cycle.description}</div>
          </Badge>
        ))}
      </div>
    </div>
  )
}