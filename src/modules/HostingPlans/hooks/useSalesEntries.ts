import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type { Database } from '@/integrations/supabase/types'
import { useAuth } from '@/contexts/AuthContext'

type SalesEntry = Database['public']['Tables']['sales_entries']['Row']

export const useSalesEntries = (agentId?: string, dateRange?: { from: Date; to: Date }) => {
  const { user, profile } = useAuth()
  
  return useQuery({
    queryKey: ['sales-entries', agentId || user?.id, dateRange],
    queryFn: async (): Promise<SalesEntry[]> => {
      console.log('🔍 Fetching sales entries...')
      
      try {
        let query = supabase
          .from('sales_entries')
          .select(`
            *,
            hosting_plans (name, plan_type)
          `)
          .order('date', { ascending: false })

        // Filter by agent if specified or use current user
        const targetAgentId = agentId || user?.id
        if (targetAgentId) {
          query = query.eq('agent_id', targetAgentId)
        }

        // Add date range filtering
        if (dateRange) {
          query = query
            .gte('date', dateRange.from.toISOString())
            .lte('date', dateRange.to.toISOString())
        }

        const { data, error } = await query

        if (error) {
          console.error('❌ Error fetching sales entries:', error)
          throw error
        }

        console.log('✅ Sales entries fetched successfully:', data?.length || 0, 'entries')
        return data || []
      } catch (error) {
        console.error('❌ Unexpected error in useSalesEntries:', error)
        throw error
      }
    },
    enabled: !!(agentId || user?.id),
    staleTime: 1000 * 60 * 2, // 2 minutes - sales data should be relatively fresh
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2
  })
}

export const useCreateSalesEntry = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (entry: Database['public']['Tables']['sales_entries']['Insert']) => {
      console.log('🔍 Creating sales entry:', entry)
      
      const { data, error } = await supabase
        .from('sales_entries')
        .insert(entry)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating sales entry:', error)
        throw error
      }

      console.log('✅ Sales entry created successfully:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('🔄 Invalidating queries after successful sales entry creation')
      queryClient.invalidateQueries({ queryKey: ['sales-entries'] })
      queryClient.invalidateQueries({ queryKey: ['team-stats'] })
    },
    onError: (error) => {
      console.error('❌ Sales entry creation failed:', error)
    }
  })
}

export const useTeamStats = () => {
  const { profile } = useAuth()
  
  return useQuery({
    queryKey: ['team-stats', profile?.team_id],
    queryFn: async () => {
      if (!profile?.team_id) {
        console.log('ℹ️ No team_id found, skipping team stats')
        return null
      }

      console.log('🔍 Fetching team stats for team:', profile.team_id)

      try {
        // Get team members
        const { data: teamMembers, error: teamError } = await supabase
          .from('users')
          .select('id, name, email')
          .eq('team_id', profile.team_id)

        if (teamError) {
          console.error('❌ Error fetching team members:', teamError)
          throw teamError
        }

        if (!teamMembers || teamMembers.length === 0) {
          console.log('ℹ️ No team members found')
          return null
        }

        // Get sales data for team members
        const { data: salesData, error: salesError } = await supabase
          .from('sales_entries')
          .select('agent_id, mrr, tcv, date')
          .in('agent_id', teamMembers.map(m => m.id))

        if (salesError) {
          console.error('❌ Error fetching team sales data:', salesError)
          throw salesError
        }

        // Calculate stats per agent
        const agentStats = teamMembers.map(member => {
          const memberSales = salesData?.filter(s => s.agent_id === member.id) || []
          const totalMRR = memberSales.reduce((sum, s) => sum + (s.mrr || 0), 0)
          const totalTCV = memberSales.reduce((sum, s) => sum + (s.tcv || 0), 0)
          
          return {
            ...member,
            totalMRR,
            totalTCV,
            salesCount: memberSales.length
          }
        })

        const teamTotalMRR = agentStats.reduce((sum, agent) => sum + agent.totalMRR, 0)
        const teamTotalTCV = agentStats.reduce((sum, agent) => sum + agent.totalTCV, 0)

        const result = {
          agentStats,
          teamTotalMRR,
          teamTotalTCV,
          teamAvgMRR: agentStats.length > 0 ? teamTotalMRR / agentStats.length : 0,
          teamAvgTCV: agentStats.length > 0 ? teamTotalTCV / agentStats.length : 0
        }

        console.log('✅ Team stats calculated successfully:', result)
        return result
      } catch (error) {
        console.error('❌ Unexpected error in useTeamStats:', error)
        throw error
      }
    },
    enabled: !!profile?.team_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  })
}