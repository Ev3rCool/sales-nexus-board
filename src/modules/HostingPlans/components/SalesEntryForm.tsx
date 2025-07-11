import React, { memo, useCallback, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react'
import { CategorySelector } from './CategorySelector'
import { PlanGrid } from './PlanGrid'
import { BillingCycleGrid } from './BillingCycleGrid'
import { DiscountSelector } from './DiscountSelector'
import { SalesSummaryPanel } from './SalesSummaryPanel'
import { usePlans, type HostingPlanWithDiscounts } from '../hooks/usePlans'
import { useCreateSalesEntry } from '../hooks/useSalesEntries'
import { calculateMRR } from '../utils/calculateMRR'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

const SalesEntryFormComponent: React.FC = () => {
  const { user, profile } = useAuth()
  const { data: plans, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans()
  const createSalesEntry = useCreateSalesEntry()

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
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

  // Step handlers
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    setFormData(prev => ({ ...prev, planId: '', billingCycle: '', discountPct: 0 }))
    setCurrentStep(2)
  }, [])

  const handlePlanSelect = useCallback((planId: string) => {
    setFormData(prev => ({ ...prev, planId, billingCycle: '', discountPct: 0 }))
    setCurrentStep(3)
  }, [])

  const handleCycleSelect = useCallback((cycle: string) => {
    setFormData(prev => ({ ...prev, billingCycle: cycle }))
    setCurrentStep(4)
  }, [])

  const handleEditStep = useCallback((step: number) => {
    setCurrentStep(step)
  }, [])

  // Form field change handlers
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

  // Navigation
  const goToNextStep = useCallback(() => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }, [currentStep])

  const goToPrevStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }, [currentStep])

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
      
      // Map billing cycle to enum value
      const billingCycleMap: Record<string, Database['public']['Enums']['billing_cycle']> = {
        'M': 'monthly',
        'Q': 'quarterly',
        'S-A': 'semi-annual',
        'A': 'annual',
        'monthly': 'monthly',
        'quarterly': 'quarterly',
        'semi-annual': 'semi-annual',
        'annual': 'annual'
      }

      const mappedBillingCycle = billingCycleMap[formData.billingCycle]
      if (!mappedBillingCycle) {
        throw new Error(`Invalid billing cycle: ${formData.billingCycle}`)
      }

      const result = await createSalesEntry.mutateAsync({
        agent_id: user.id,
        plan_id: formData.planId,
        date: formData.date,
        billing_cycle: mappedBillingCycle,
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
      setSelectedCategory(null)
      setCurrentStep(1)
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

  // Error state with retry option
  if (plansError) {
    return (
      <Card className="bg-white/5 backdrop-blur-xl border-white/10">
        <CardContent className="p-6">
          <div className="text-red-400">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">Failed to load hosting plans</p>
            </div>
            <p className="text-sm mb-4">{plansError.message}</p>
            <div className="flex gap-2">
              <Button 
                onClick={() => refetchPlans()}
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
            <p className="text-xs mt-3 text-gray-400">
              If this problem persists, check the browser console for more details.
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
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5" />
              <p className="font-semibold">No hosting plans found</p>
            </div>
            <p className="text-sm mb-4">
              The hosting plans table appears to be empty. This might be because:
            </p>
            <ul className="text-sm space-y-1 mb-4 ml-4">
              <li>• The database hasn't been seeded with sample data</li>
              <li>• There's a permissions issue with the database</li>
              <li>• The migration scripts haven't been run</li>
            </ul>
            <Button 
              onClick={() => refetchPlans()}
              variant="outline"
              size="sm"
              className="bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategorySelector
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        )
      
      case 2:
        return selectedCategory && plans ? (
          <PlanGrid
            plans={plans}
            category={selectedCategory}
            selectedPlan={formData.planId}
            onPlanSelect={handlePlanSelect}
          />
        ) : null
      
      case 3:
        return selectedCategory ? (
          <BillingCycleGrid
            category={selectedCategory}
            selectedCycle={formData.billingCycle}
            onCycleSelect={handleCycleSelect}
          />
        ) : null
      
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Finalize Sale Details</h3>
              <p className="text-sm text-gray-400">Add final details to complete the sale entry</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {selectedPlan && (
                  <div>
                    <Label className="text-white mb-2 block">Discount %</Label>
                    <DiscountSelector
                      planType={selectedPlan.plan_type}
                      value={formData.discountPct}
                      onChange={handleDiscountChange}
                    />
                  </div>
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
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Record New Sale</CardTitle>
                <p className="text-sm text-gray-400">Step {currentStep} of 4</p>
              </div>
              {user && !profile && (
                <p className="text-xs text-yellow-400">⚠️ Profile loading... Form is still functional.</p>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={goToPrevStep}
                disabled={currentStep === 1}
                className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === 4 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid || createSalesEntry.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {createSalesEntry.isPending ? 'Creating...' : 'Record Sale'}
                </Button>
              ) : (
                <Button
                  onClick={goToNextStep}
                  disabled={
                    (currentStep === 1 && !selectedCategory) ||
                    (currentStep === 2 && !formData.planId) ||
                    (currentStep === 3 && !formData.billingCycle)
                  }
                  className="bg-primary hover:bg-primary/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Panel */}
      <div className="lg:col-span-1">
        <SalesSummaryPanel
          selectedPlan={selectedPlan}
          selectedCategory={selectedCategory}
          selectedCycle={formData.billingCycle}
          discountPct={formData.discountPct}
          subscribersCount={formData.subscribersCount}
          mrr={calculation.mrr}
          tcv={calculation.tcv}
          onEdit={handleEditStep}
        />
      </div>
    </div>
  )
}

// Memoized export to prevent unnecessary re-renders
export const SalesEntryForm = memo(SalesEntryFormComponent)