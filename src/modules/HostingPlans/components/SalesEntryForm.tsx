import React, { memo, useCallback, useMemo } from 'react'
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
import type { Database } from '@/integrations/supabase/types'

const SalesEntryFormComponent: React.FC = () => {
  const { user, profile } = useAuth()
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
    console.log('🔍 SalesEntryForm state:', {
      userAuthenticated: !!user,
      profileLoaded: !!profile,
      plansLoading,
      plansCount: plans?.length || 0,
      plansError: plansError?.message
    })
  }, [user, profile, plansLoading, plans?.length, plansError])

  // Memoized selected plan to prevent unnecessary recalculations
  const selectedPlan = useMemo(() => 
    plans?.find(p => p.id === formData.planId), 
    [plans, formData.planId]
  )

  // Memoized calculation to prevent unnecessary recalculations
  const calculation = useMemo(() => 
    selectedPlan ? calculateMRR(
      selectedPlan.regular_price, 
      formData.discountPct, 
      formData.billingCycle,
      formData.subscribersCount
    ) : { mrr: 0, tcv: 0 },
    [selectedPlan, formData.discountPct, formData.billingCycle, formData.subscribersCount]
  )

  // Memoized form validity check
  const isFormValid = useMemo(() => 
    formData.planId && formData.billingCycle && user,
    [formData.planId, formData.billingCycle, user]
  )

  // Optimized form field change handlers using useCallback
  const handlePlanChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, planId: value, billingCycle: '', discountPct: 0 }))
  }, [])

  const handleBillingCycleChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, billingCycle: value }))
  }, [])

  const handleDiscountChange = useCallback((value: number) => {
    setFormData(prev => ({ ...prev, discountPct: value }))
  }, [])

  const handleSubscribersChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, subscribersCount: parseInt(e.target.value) || 1 }))
  }, [])

  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, date: e.target.value }))
  }, [])

  const handleOrderLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, orderLink: e.target.value }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('📝 Form submitted with data:', formData)
    console.log('📋 Selected plan:', selectedPlan)
    console.log('👤 User:', user?.id)
    console.log('📊 Calculation:', calculation)
    
    if (!user) {
      console.error('❌ No user found')
      toast({
        title: "Error",
        description: "User not authenticated. Please try logging in again.",
        variant: "destructive"
      })
      return
    }

    if (!selectedPlan) {
      console.error('❌ No plan selected')
      toast({
        title: "Error",
        description: "Please select a hosting plan",
        variant: "destructive"
      })
      return
    }

    if (!formData.billingCycle) {
      console.error('❌ No billing cycle selected')
      toast({
        title: "Error",
        description: "Please select a billing cycle",
        variant: "destructive"
      })
      return
    }

    try {
      console.log('🚀 Creating sales entry...')
      const result = await createSalesEntry.mutateAsync({
        agent_id: user.id,
        plan_id: formData.planId,
        date: formData.date,
        billing_cycle: formData.billingCycle as Database['public']['Enums']['billing_cycle'],
        discount_pct: formData.discountPct,
        subscribers_count: formData.subscribersCount,
        order_link: formData.orderLink || null,
        mrr: calculation.mrr,
        tcv: calculation.tcv
      })

      console.log('✅ Sales entry created successfully:', result)

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
      console.error('❌ Error creating sales entry:', error)
      toast({
        title: "Error",
        description: "Failed to create sales entry. Check the console for details.",
        variant: "destructive"
      })
    }
  }, [formData, selectedPlan, calculation, user, createSalesEntry])

  // Loading state
  if (plansLoading) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-white">Loading hosting plans...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (plansError) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-red-400">
            <p className="font-semibold">❌ Error loading hosting plans</p>
            <p className="text-sm mt-1">{plansError.message}</p>
            <p className="text-xs mt-2 text-gray-400">
              Check the browser console for more details.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // No plans state
  if (!plans || plans.length === 0) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-yellow-400">
            <p className="font-semibold">⚠️ No hosting plans found</p>
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
        <p className="text-sm text-gray-400">✅ Found {plans.length} hosting plans</p>
        {user && !profile && (
          <p className="text-xs text-yellow-400">⚠️ Profile loading... Form is still functional.</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-white mb-2 block">Hosting Plan</Label>
            <Select value={formData.planId} onValueChange={handlePlanChange}>
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
                  onChange={handleBillingCycleChange}
                />
              </div>

              <div>
                <Label className="text-white mb-2 block">Discount %</Label>
                <DiscountSelector
                  planType={selectedPlan.plan_type}
                  value={formData.discountPct}
                  onChange={handleDiscountChange}
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
                onChange={handleSubscribersChange}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <Label className="text-white mb-2 block">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white mb-2 block">Order Link (Optional)</Label>
            <Input
              type="url"
              value={formData.orderLink}
              onChange={handleOrderLinkChange}
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
              <div className="mt-2 text-xs text-gray-400">
                <p>Base price: ${selectedPlan.regular_price} • Discount: {formData.discountPct}% • Cycle: {formData.billingCycle}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            disabled={!isFormValid || createSalesEntry.isPending}
          >
            {createSalesEntry.isPending ? 'Creating...' : 'Record Sale'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// Memoized export to prevent unnecessary re-renders
export const SalesEntryForm = memo(SalesEntryFormComponent)