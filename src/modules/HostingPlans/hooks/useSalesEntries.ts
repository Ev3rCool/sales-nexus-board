
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import { useAuth } from '@/contexts/AuthContext'

type SalesEntry = Database['public']['Tables']['sales_entries']['Row']

export const useSalesEntries = (agentId?: string) => {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: ['sales-entries', agentId || profile?.id],
    queryFn: async (): Promise<SalesEntry[]> => {
      let query = supabase
        .from('sales_entries')
        .select(`
          *,
          hosting_plans (name, plan_type)
        `)
        .order('date', { ascending: false })

      // Filter by agent if specified or use current user
      const targetAgentId = agentId || profile?.id
      if (targetAgentId) {
        query = query.eq('agent_id', targetAgentId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    },
    enabled: !!(agentId || profile?.id),
    staleTime: 1000 * 60 * 2, // 2 minutes - sales data should be relatively fresh
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true // Refetch when user returns to window
  })
}

export const useCreateSalesEntry = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (entry: Database['public']['Tables']['sales_entries']['Insert']) => {
      const { data, error } = await supabase
        .from('sales_entries')
        .insert(entry)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-entries'] })
      queryClient.invalidateQueries({ queryKey: ['team-stats'] })
    }
  })
}

export const useTeamStats = () => {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: ['team-stats', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) return null

      // Get team members
      const { data: teamMembers, error: teamError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('team_id', profile.team_id)

      if (teamError) throw teamError

      // Get sales data for team members
      const { data: salesData, error: salesError } = await supabase
        .from('sales_entries')
        .select('agent_id, mrr, tcv, date')
        .in('agent_id', teamMembers.map(m => m.id))

      if (salesError) throw salesError

      // Calculate stats per agent
      const agentStats = teamMembers.map(member => {
        const memberSales = salesData.filter(s => s.agent_id === member.id)
        const totalMRR = memberSales.reduce((sum, s) => sum + s.mrr, 0)
        const totalTCV = memberSales.reduce((sum, s) => sum + s.tcv, 0)
        
        return {
          ...member,
          totalMRR,
          totalTCV,
          salesCount: memberSales.length
        }
      })

      const teamTotalMRR = agentStats.reduce((sum, agent) => sum + agent.totalMRR, 0)
      const teamTotalTCV = agentStats.reduce((sum, agent) => sum + agent.totalTCV, 0)

      return {
        agentStats,
        teamTotalMRR,
        teamTotalTCV,
        teamAvgMRR: teamTotalMRR / agentStats.length,
        teamAvgTCV: teamTotalTCV / agentStats.length
      }
    },
    enabled: !!profile?.team_id
  })
}
