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
      console.log('[usePlans] 🔄 Starting comprehensive fetch process...')

      try {
        // Step 1: Test basic Supabase connection
        console.log('[usePlans] 🔄 Step 1: Testing Supabase connection...')
        const { data: connectionTest, error: connectionError } = await supabase
          .from('hosting_plans')
          .select('count')
          .limit(1)

        if (connectionError) {
          console.error('[usePlans] ❌ Step 1 FAILED - Connection error:', connectionError)
          throw new Error(`Database connection failed: ${connectionError.message}`)
        }
        console.log('[usePlans] ✅ Step 1 PASSED - Connection successful')

        // Step 2: Check authentication
        console.log('[usePlans] 🔄 Step 2: Checking authentication...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('[usePlans] ❌ Step 2 FAILED - Auth error:', authError)
          throw new Error(`Authentication failed: ${authError.message}`)
        }
        
        if (!user) {
          console.error('[usePlans] ❌ Step 2 FAILED - No authenticated user')
          throw new Error('No authenticated user found')
        }
        
        console.log('[usePlans] ✅ Step 2 PASSED - User authenticated:', user.email)

        // Step 3: Check RLS policies by testing direct access
        console.log('[usePlans] 🔄 Step 3: Testing RLS policies...')
        const { data: rlsTest, error: rlsError } = await supabase
          .from('hosting_plans')
          .select('id, name')
          .limit(1)

        if (rlsError) {
          console.error('[usePlans] ❌ Step 3 FAILED - RLS policy blocking access:', rlsError)
          console.error('[usePlans] RLS Error details:', {
            code: rlsError.code,
            message: rlsError.message,
            details: rlsError.details,
            hint: rlsError.hint
          })
          throw new Error(`RLS policy error: ${rlsError.message}`)
        }
        
        console.log('[usePlans] ✅ Step 3 PASSED - RLS allows access, sample data:', rlsTest)

        // Step 4: Get full count of hosting plans
        console.log('[usePlans] 🔄 Step 4: Checking hosting plans count...')
        const { count, error: countError } = await supabase
          .from('hosting_plans')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          console.error('[usePlans] ❌ Step 4 FAILED - Count error:', countError)
          throw new Error(`Count query failed: ${countError.message}`)
        }

        console.log('[usePlans] ✅ Step 4 PASSED - Total hosting plans in database:', count)

        if (count === 0) {
          console.warn('[usePlans] ⚠️ Step 4 WARNING - Database has no hosting plans!')
          return []
        }

        // Step 5: Fetch all hosting plans
        console.log('[usePlans] 🔄 Step 5: Fetching all hosting plans...')
        const { data: plansData, error: plansError } = await supabase
          .from('hosting_plans')
          .select('*')
          .order('name', { ascending: true })

        if (plansError) {
          console.error('[usePlans] ❌ Step 5 FAILED - Plans fetch error:', plansError)
          throw new Error(`Failed to fetch hosting plans: ${plansError.message}`)
        }

        if (!plansData || plansData.length === 0) {
          console.warn('[usePlans] ⚠️ Step 5 WARNING - No plans returned despite count > 0')
          return []
        }

        console.log(`[usePlans] ✅ Step 5 PASSED - Fetched ${plansData.length} plans:`, 
          plansData.map(p => ({ id: p.id, name: p.name, price: p.regular_price })))

        // Step 6: Fetch plan discounts
        console.log('[usePlans] 🔄 Step 6: Fetching plan discounts...')
        const { data: discountsData, error: discountsError } = await supabase
          .from('plan_discounts')
          .select('*')

        if (discountsError) {
          console.warn('[usePlans] ⚠️ Step 6 WARNING - Discounts fetch error (continuing without):', discountsError)
        } else {
          console.log(`[usePlans] ✅ Step 6 PASSED - Fetched ${discountsData?.length || 0} discounts`)
        }

        // Step 7: Combine data
        console.log('[usePlans] 🔄 Step 7: Combining plans with discounts...')
        const combined: HostingPlanWithDiscounts[] = plansData.map(plan => ({
          ...plan,
          plan_discounts: (discountsData || []).filter(d => d.plan_id === plan.id),
        }))
        
        console.log(`[usePlans] ✅ Step 7 PASSED - Combined ${combined.length} plans with discounts`)
        console.log('[usePlans] 🎉 SUCCESS - Final result:', combined.map(p => ({
          id: p.id,
          name: p.name,
          price: p.regular_price,
          discounts: p.plan_discounts.length
        })))

        return combined

      } catch (error) {
        console.error('[usePlans] ❌ CRITICAL ERROR in queryFn:', error)
        
        // Enhanced error reporting
        if (error instanceof Error) {
          console.error('[usePlans] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          })
          throw new Error(`Hosting plans loading failed: ${error.message}`)
        } else {
          console.error('[usePlans] Unknown error type:', typeof error, error)
          throw new Error('Hosting plans loading failed: Unknown error occurred')
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log(`[usePlans] 🔄 Retry attempt ${failureCount + 1}/3:`, error?.message)
      return failureCount < 2 // Only retry twice
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000)
      console.log(`[usePlans] ⏱️ Retrying in ${delay}ms...`)
      return delay
    },
    refetchOnWindowFocus: false,
  })
}