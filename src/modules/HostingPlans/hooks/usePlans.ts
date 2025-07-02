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
      const { data, error } = await supabase
        .from('hosting_plans')
        .select(`
          *,
          plan_discounts (*)
        `)
        .order('name')

      if (error) {
        console.error('Error fetching hosting plans:', error)
        throw error
      }

      return data || []
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - hosting plans don't change often
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST301') {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false
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