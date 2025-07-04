import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2 } from 'lucide-react'
import type { HostingPlanWithDiscounts } from '../hooks/usePlans'

interface SalesSummaryPanelProps {
  selectedPlan: HostingPlanWithDiscounts | null
  selectedCategory: string | null
  selectedCycle: string | null
  discountPct: number
  subscribersCount: number
  mrr: number
  tcv: number
  onEdit: (step: number) => void
}

export const SalesSummaryPanel: React.FC<SalesSummaryPanelProps> = ({
  selectedPlan,
  selectedCategory,
  selectedCycle,
  discountPct,
  subscribersCount,
  mrr,
  tcv,
  onEdit
}) => {
  const getCategoryDisplayName = (type: string) => {
    switch (type) {
      case 'shared': return 'Shared Hosting'
      case 'vps': return 'Cloud SSD VPS'
      case 'dedicated': return 'Dedicated CPU Servers'
      default: return type
    }
  }

  const getCycleDisplayName = (cycle: string) => {
    switch (cycle) {
      case 'M': return 'Monthly'
      case 'Q': return 'Quarterly'
      case 'S-A': return 'Semi-Annual'
      case 'A': return 'Annual'
      case 'biennial': return 'Biennial'
      case 'triennial': return 'Triennial'
      default: return cycle
    }
  }

  if (!selectedCategory) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Sale Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Make your selections to see the summary</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10 sticky top-4">
      <CardHeader>
        <CardTitle className="text-white text-lg">Sale Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-400">Category</p>
            <p className="text-white font-medium">{getCategoryDisplayName(selectedCategory)}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(1)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Plan */}
        {selectedPlan && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Plan</p>
              <p className="text-white font-medium">{selectedPlan.name}</p>
              <p className="text-xs text-gray-400">${selectedPlan.regular_price}/month</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Billing Cycle */}
        {selectedCycle && (
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400">Billing Cycle</p>
              <p className="text-white font-medium">{getCycleDisplayName(selectedCycle)}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Discount */}
        {discountPct > 0 && (
          <div>
            <p className="text-xs text-gray-400">Discount</p>
            <Badge variant="outline" className="text-green-400 border-green-400/30">
              {discountPct}% OFF
            </Badge>
          </div>
        )}

        {/* Subscribers */}
        <div>
          <p className="text-xs text-gray-400">Subscribers</p>
          <p className="text-white font-medium">{subscribersCount}</p>
        </div>

        {/* Financial Summary */}
        {selectedPlan && selectedCycle && (
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly Recurring Revenue:</span>
              <span className="text-green-400 font-bold">${mrr.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Contract Value:</span>
              <span className="text-blue-400 font-bold">${tcv.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}