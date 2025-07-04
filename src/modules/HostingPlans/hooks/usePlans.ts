import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'

type HostingPlan = Database['public']['Tables']['hosting_plans']['Row']
type PlanDiscount = Database['public']['Tables']['plan_discounts']['Row']

export interface HostingPlanWithDiscounts extends HostingPlan {
  plan_discounts: PlanDiscount[]
}

export const usePlans = () => {
  return useQuery({
    queryKey: ['hosting-plans'],
    queryFn: async (): Promise<HostingPlanWithDiscounts[]> => {
      console.log('🔍 Fetching hosting plans...')
      
      try {
        console.log('🔍 Starting to fetch hosting plans...')
        
        // Fetch hosting plans first
        const { data: plansData, error: plansError } = await supabase
          .from('hosting_plans')
          .select('*')
          .order('name')

        if (plansError) {
          console.error('❌ Error fetching hosting plans:', plansError)
          throw new Error(`Failed to fetch hosting plans: ${plansError.message}`)
        }

        console.log('✅ Hosting plans fetched:', plansData?.length || 0, 'plans')

        // Fetch plan discounts separately
        const { data: discountsData, error: discountsError } = await supabase
          .from('plan_discounts')
          .select('*')

        if (discountsError) {
          console.error('❌ Error fetching plan discounts:', discountsError)
          // Don't throw error for discounts, just log and continue
          console.log('⚠️ Continuing without discounts data')
        }

        console.log('✅ Plan discounts fetched:', discountsData?.length || 0, 'discounts')

        // Combine the data
        const combinedData = plansData?.map(plan => ({
          ...plan,
          plan_discounts: discountsData?.filter(discount => discount.plan_id === plan.id) || []
        })) || []

        console.log('✅ Combined data prepared:', combinedData.length, 'plans with discounts')
        return combinedData
      } catch (error) {
        console.error('❌ Unexpected error in usePlans:', error)
        throw error
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - hosting plans don't change often
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for hosting plans`)
      // Don't retry on auth errors or RLS errors
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = error.message.toLowerCase()
        if (errorMessage.includes('permission') || errorMessage.includes('rls') || errorMessage.includes('policy')) {
          console.log('🚫 Not retrying due to permission error')
          return false
        }
      }
      return failureCount < 2
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true
  })
}

export const useCreatePlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (plan: Database['public']['Tables']['hosting_plans']['Insert']) => {
      const { data, error } = await supabase
        .from('hosting_plans')
        .insert(plan)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosting-plans'] })
    }
  })
}

export const useUpdatePlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Database['public']['Tables']['hosting_plans']['Update'] & { id: string }) => {
      const { data, error } = await supabase
        .from('hosting_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosting-plans'] })
    }
  })
}

export const useDeletePlan = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hosting_plans')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosting-plans'] })
    }
  })
}