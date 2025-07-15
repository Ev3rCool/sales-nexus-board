import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Define types based on the function's return structure
type PlanDiscount = Database['public']['Tables']['plan_discounts']['Row'];

export interface HostingPlanWithDiscounts extends Database['public']['Tables']['hosting_plans']['Row'] {
  plan_discounts: PlanDiscount[];
}

// Custom hook to fetch hosting plans
export const usePlans = () => {
  return useQuery<HostingPlanWithDiscounts[], Error>({
    queryKey: ['hosting-plans'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_plans_with_discounts');

      if (error) {
        throw new Error(`Failed to fetch hosting plans: ${error.message}`);
      }

      // The RPC function is expected to return the data in the correct shape
      return data as HostingPlanWithDiscounts[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};