
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

/** One row from hosting_plans table */
type HostingPlan = Database['public']['Tables']['hosting_plans']['Row']
/** One row from plan_discounts table */
type PlanDiscount = Database['public']['Tables']['plan_discounts']['Row']

/**
 * A hosting plan with its embedded discounts.
 * We'll use PostgREST's `select('*, plan_discounts(*)')` syntax.
 */
export interface HostingPlanWithDiscounts extends HostingPlan {
  plan_discounts: PlanDiscount[]
}

export const usePlans = () => {
  console.log('[usePlans] hook mounted')

  return useQuery<HostingPlanWithDiscounts[], Error>({
    queryKey: ['hosting-plans'],
    queryFn: async () => {
      console.log('[usePlans] fetching from Supabase…')

      try {
        // 1) Fetch base plans
        console.log('[usePlans] 🔄 fetching hosting_plans...')
        const { data: plansData, error: plansError } = await supabase
          .from('hosting_plans')
          .select('*')
          .order('name', { ascending: true })

        if (plansError) {
          console.error('[usePlans] ❌ plans fetch error', plansError)
          throw plansError
        }
        console.log(`[usePlans] ✅ fetched ${plansData?.length ?? 0} plans`, plansData)

        // 2) Fetch discounts 
        console.log('[usePlans] 🔄 fetching plan_discounts...')
        const { data: discountsData, error: discountsError } = await supabase
          .from('plan_discounts')
          .select('*')

        if (discountsError) {
          console.warn('[usePlans] ⚠️ discounts fetch error - continuing without discounts', discountsError)
        } else {
          console.log(`[usePlans] ✅ fetched ${discountsData?.length ?? 0} discounts`, discountsData)
        }

        // 3) Combine them
        const combined: HostingPlanWithDiscounts[] = (plansData || []).map(plan => ({
          ...plan,
          plan_discounts: (discountsData || []).filter(d => d.plan_id === plan.id),
        }))
        
        console.log(`[usePlans] 🔗 combined into ${combined.length} plans with discounts`, combined)
        return combined
      } catch (error) {
        console.error('[usePlans] ❌ unexpected error:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Allow retries
    retryDelay: 1000, // Wait 1 second between retries
    refetchOnWindowFocus: false,
  })
}
