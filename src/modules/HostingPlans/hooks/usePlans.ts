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
        // First, check if we can access the table at all
        const { data: testData, error: testError } = await supabase
          .from('hosting_plans')
          .select('count')
          .limit(1)

        if (testError) {
          console.error('❌ Test query failed:', testError)
          throw new Error(`Database access error: ${testError.message}`)
        }

        console.log('✅ Database access confirmed')

        // Now fetch the actual data
        const { data, error } = await supabase
          .from('hosting_plans')
          .select(`
            *,
            plan_discounts (*)
          `)
          .order('name')

        if (error) {
          console.error('❌ Error fetching hosting plans:', error)
          throw new Error(`Failed to fetch hosting plans: ${error.message}`)
        }

        console.log('✅ Hosting plans fetched successfully:', data?.length || 0, 'plans')
        return data || []
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