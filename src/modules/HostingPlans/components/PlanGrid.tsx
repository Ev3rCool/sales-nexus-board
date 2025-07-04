import React, { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search } from 'lucide-react'
import type { HostingPlanWithDiscounts } from '../hooks/usePlans'

interface PlanGridProps {
  plans: HostingPlanWithDiscounts[]
  category: string
  selectedPlan: string | null
  onPlanSelect: (planId: string) => void
}

export const PlanGrid: React.FC<PlanGridProps> = ({
  plans,
  category,
  selectedPlan,
  onPlanSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPlans = useMemo(() => {
    return plans
      .filter(plan => plan.plan_type === category)
      .filter(plan => 
        searchTerm === '' || 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.regular_price - b.regular_price)
  }, [plans, category, searchTerm])

  const getCategoryDisplayName = (type: string) => {
    switch (type) {
      case 'shared': return 'Shared Hosting'
      case 'vps': return 'Cloud SSD VPS'
      case 'dedicated': return 'Dedicated CPU Servers'
      default: return type
    }
  }

  const hasPromo = (plan: HostingPlanWithDiscounts) => {
    return plan.plan_discounts && plan.plan_discounts.length > 0
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Select {getCategoryDisplayName(category)} Plan
        </h3>
        <p className="text-sm text-gray-400">Choose from our available hosting plans</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search plans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedPlan === plan.id
                ? 'bg-primary/20 border-primary/40 ring-2 ring-primary/30'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            onClick={() => onPlanSelect(plan.id)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium text-sm">{plan.name}</h4>
                {hasPromo(plan) && (
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    Promo
                  </Badge>
                )}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">
                ${plan.regular_price}
              </div>
              <div className="text-xs text-gray-400">
                per {category === 'shared' ? 'month' : 'month'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No plans found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}