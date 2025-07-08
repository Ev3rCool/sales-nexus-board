// src/modules/HostingPlans/hooks/usePlans.ts

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

/** The shape of one row in hosting_plans */
type HostingPlan = Database['public']['Tables']['hosting_plans']['Row']
/** The shape of one row in plan_discounts */
type PlanDiscount = Database['public']['Tables']['plan_discounts']['Row']

/** A hosting plan with its array of discounts attached */
export interface HostingPlanWithDiscounts extends HostingPlan {
  plan_discounts: PlanDiscount[]
}

/**
 * Fetches all hosting_plans + their discounts.
 * React-Query will flip isLoading→false when done.
 */
export const usePlans = () => {
  return useQuery<HostingPlanWithDiscounts[], Error>({
    queryKey: ['hosting-plans'],
    queryFn: async () => {
      console.log('🔍 [usePlans] Starting fetch of hosting plans')

      // 1) fetch base plans
      const { data: plansData, error: plansError } = await supabase
        .from('hosting_plans')
        .select('*')
        .order('name', { ascending: true })

      if (plansError) {
        console.error('❌ [usePlans] Error fetching hosting_plans:', plansError)
        throw plansError
      }
      console.log(`✅ [usePlans] Fetched ${plansData?.length} plans`)

      // 2) fetch discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from('plan_discounts')
        .select('*')
      if (discountsError) {
        console.warn('⚠️ [usePlans] Error fetching plan_discounts – continuing without discounts', discountsError)
      } else {
        console.log(`✅ [usePlans] Fetched ${discountsData.length} discounts`)
      }

      // 3) merge them
      const combined: HostingPlanWithDiscounts[] = (plansData || []).map(plan => ({
        ...plan,
        plan_discounts: (discountsData || []).filter(d => d.plan_id === plan.id),
      }))
      console.log(`🔗 [usePlans] Merged into ${combined.length} plans with discounts`)

      return combined
    },
    staleTime: 1000 * 60 * 5,      // 5m
    refetchOnWindowFocus: false,
    retry: false,
  })
}