import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

/** One row from hosting_plans table */
type HostingPlan = Database['public']['Tables']['hosting_plans']['Row']
/** One row from plan_discounts table */
type PlanDiscount = Database['public']['Tables']['plan_discounts']['Row']

/**
 * A hosting plan with its embedded discounts.
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
        // Test basic connection first
        console.log('[usePlans] 🔄 testing connection...')
        const { data: testData, error: testError } = await supabase
          .from('hosting_plans')
          .select('count')
          .limit(1)

        if (testError) {
          console.error('[usePlans] ❌ connection test failed', testError)
          throw new Error(`Database connection failed: ${testError.message}`)
        }

        console.log('[usePlans] ✅ connection test passed')

        // 1) Fetch base plans with better error handling
        console.log('[usePlans] 🔄 fetching hosting_plans...')
        const { data: plansData, error: plansError } = await supabase
          .from('hosting_plans')
          .select('*')
          .order('name', { ascending: true })

        if (plansError) {
          console.error('[usePlans] ❌ plans fetch error', plansError)
          throw new Error(`Failed to fetch hosting plans: ${plansError.message}`)
        }

        if (!plansData || plansData.length === 0) {
          console.warn('[usePlans] ⚠️ no hosting plans found')
          return []
        }

        console.log(`[usePlans] ✅ fetched ${plansData.length} plans`, plansData)

        // 2) Fetch discounts with better error handling
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
        const combined: HostingPlanWithDiscounts[] = plansData.map(plan => ({
          ...plan,
          plan_discounts: (discountsData || []).filter(d => d.plan_id === plan.id),
        }))
        
        console.log(`[usePlans] 🔗 combined into ${combined.length} plans with discounts`, combined)
        return combined
      } catch (error) {
        console.error('[usePlans] ❌ unexpected error:', error)
        
        // Provide more specific error information
        if (error instanceof Error) {
          throw new Error(`Hosting plans loading failed: ${error.message}`)
        } else {
          throw new Error('Hosting plans loading failed: Unknown error occurred')
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log(`[usePlans] retry attempt ${failureCount}:`, error?.message)
      return failureCount < 2 // Only retry twice
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
  })
}