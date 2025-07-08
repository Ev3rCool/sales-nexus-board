
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

      const { data, error } = await supabase
        .from('hosting_plans')
        // this will pull each plan plus its discounts in one request:
        .select('*, plan_discounts(*)')
        .order('name', { ascending: true })

      if (error) {
        console.error('[usePlans] ❌ fetch error', error)
        throw error
      }

      console.log(`[usePlans] ✅ fetched ${data?.length ?? 0} plans`)
      return data!
    },
    // default behavior: run on mount, no extra options needed
    refetchOnWindowFocus: false,
    retry: false,
  })
}
