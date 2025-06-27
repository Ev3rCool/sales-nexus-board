import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BillingCycleSelector } from './BillingCycleSelector'
import { DiscountSelector } from './DiscountSelector'
import { usePlans, type HostingPlanWithDiscounts } from '../hooks/usePlans'
import { useCreateSalesEntry } from '../hooks/useSalesEntries'
import { calculateMRR } from '../utils/calculateMRR'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'

export const SalesEntryForm: React.FC = () => {
  const { profile } = useAuth()
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans()
  const createSalesEntry = useCreateSalesEntry()

  const [formData, setFormData] = React.useState({
    planId: '',
    billingCycle: '',
    discountPct: 0,
    subscribersCount: 1,
    orderLink: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Debug logging
  React.useEffect(() => {
    console.log('Plans loading state:', plansLoading)
    console.log('Plans error:', plansError)
    console.log('Plans data:', plans)
  }, [plans, plansLoading, plansError])

  const selectedPlan = plans?.find(p => p.id === formData.planId)
  const calculation = selectedPlan ? calculateMRR(
    selectedPlan.regular_price, 
    formData.discountPct, 
    formData.billingCycle,
    formData.subscribersCount
  ) : { mrr: 0, tcv: 0 }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!profile || !selectedPlan) return

    try {
      await createSalesEntry.mutateAsync({
        agent_id: profile.id,
        plan_id: formData.planId,
        date: formData.date,
        billing_cycle: formData.billingCycle,
        discount_pct: formData.discountPct,
        subscribers_count: formData.subscribersCount,
        order_link: formData.orderLink || null,
        mrr: calculation.mrr,
        tcv: calculation.tcv
      })

      toast({
        title: "Sales Entry Created",
        description: `Added ${formData.subscribersCount} subscriber(s) with $${calculation.mrr.toFixed(2)} MRR`
      })

      // Reset form
      setFormData({
        planId: '',
        billingCycle: '',
        discountPct: 0,
        subscribersCount: 1,
        orderLink: '',
        date: new Date().toISOString().split('T')[0]
      })
    } catch (error) {
      console.error('Error creating sales entry:', error)
      toast({
        title: "Error",
        description: "Failed to create sales entry",
        variant: "destructive"
      })
    }
  }

  if (plansLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="animate-pulse text-white">Loading hosting plans...</div>
        </CardContent>
      </Card>
    )
  }

  if (plansError) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-red-400">
            <p className="font-semibold">Error loading hosting plans:</p>
            <p className="text-sm mt-1">{plansError.message}</p>
            <p className="text-xs mt-2 text-gray-400">
              Check the browser console for more details.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-yellow-400">
            <p className="font-semibold">No hosting plans found</p>
            <p className="text-sm mt-1">
              The hosting plans table appears to be empty. Please check if the sample data has been inserted.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/5 backdrop-blur-xl border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Record New Sale</CardTitle>
        <p className="text-sm text-gray-400">Found {plans.length} hosting plans</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Hosting Plan</Label>
            <Select value={formData.planId} onValueChange={(value) => setFormData(prev => ({ ...prev, planId: value, billingCycle: '', discountPct: 0 }))}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select a hosting plan" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/10">
                {plans?.map((plan) => (
                  <SelectItem 
                    key={plan.id} 
                    value={plan.id}
                    className="text-white hover:bg-white/10"
                  >
                    {plan.name} - ${plan.regular_price}/{plan.plan_type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <>
              <div>
                <Label className="text-white mb-2 block">Billing Cycle</Label>
                <BillingCycleSelector
                  planType={selectedPlan.plan_type}
                  value={formData.billingCycle}
                  onChange={(value) => setFormData(prev => ({ ...prev, billingCycle: value }))}
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Discount %</Label>
                <DiscountSelector
                  planType={selectedPlan.plan_type}
                  value={formData.discountPct}
                  onChange={(value) => setFormData(prev => ({ ...prev, discountPct: value }))}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white mb-2 block">Subscribers</Label>
              <Input
                type="number"
                min="1"
                value={formData.subscribersCount}
                onChange={(e) => setFormData(prev => ({ ...prev, subscribersCount: parseInt(e.target.value) || 1 }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Order Link (Optional)</Label>
            <Input
              type="url"
              value={formData.orderLink}
              onChange={(e) => setFormData(prev => ({ ...prev, orderLink: e.target.value }))}
              className="bg-white/5 border-white/10 text-white"
              placeholder="https://..."
            />
          </div>

          {selectedPlan && formData.billingCycle && (
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20">
              <h4 className="text-white font-semibold mb-2">Calculation Preview</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Monthly Recurring Revenue:</span>
                  <p className="text-green-400 font-bold text-lg">${calculation.mrr.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Total Contract Value:</span>
                  <p className="text-blue-400 font-bold text-lg">${calculation.tcv.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={!formData.planId || !formData.billingCycle || createSalesEntry.isPending}
          >
            {createSalesEntry.isPending ? 'Creating...' : 'Record Sale'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}