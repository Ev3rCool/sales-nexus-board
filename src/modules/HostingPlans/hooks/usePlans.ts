// src/modules/HostingPlans/hooks/usePlans.ts

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

/** Raw row from hosting_plans table */
type HostingPlan = Database['public']['Tables']['hosting_plans']['Row']
/** Raw row from plan_discounts table */
type PlanDiscount = Database['public']['Tables']['plan_discounts']['Row']

/** A HostingPlan plus its associated discounts */
export interface HostingPlanWithDiscounts extends HostingPlan {
  plan_discounts: PlanDiscount[]
}

/**
 * usePlans
 * Fetches all hosting_plans and their plan_discounts in one hook.
 */
export const usePlans = () => {
  console.log('💡 [usePlans] hook init')  

  return useQuery<HostingPlanWithDiscounts[], Error>({
    queryKey: ['hosting-plans'],
    queryFn: async () => {
      console.log('🔍 [usePlans] queryFn start')

      // 1️⃣ Fetch base plans
      const { data: plansData, error: plansError } = await supabase
        .from('hosting_plans')
        .select('*')
        .order('name', { ascending: true })

      if (plansError) {
        console.error('❌ [usePlans] plans fetch error', plansError)
        throw plansError
      }
      console.log(`✅ [usePlans] fetched ${plansData?.length} plans`)

      // 2️⃣ Fetch discounts
      const { data: discountsData, error: discountsError } = await supabase
        .from('plan_discounts')
        .select('*')

      if (discountsError) {
        console.warn('⚠️ [usePlans] discounts fetch error — continuing without discounts', discountsError)
      } else {
        console.log(`✅ [usePlans] fetched ${discountsData?.length || 0} discounts`)
      }

      // 3️⃣ Merge them together
      const combined: HostingPlanWithDiscounts[] = (plansData || []).map(plan => ({
        ...plan,
        plan_discounts: (discountsData || []).filter(d => d.plan_id === plan.id),
      }))
      console.log(`🔗 [usePlans] merged into ${combined.length} plans with discounts`)

      return combined
    },
    // Don't refetch on focus/mount—just once
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })
}