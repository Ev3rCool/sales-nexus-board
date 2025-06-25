
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSalesEntries, useTeamStats } from '@/modules/HostingPlans/hooks/useSalesEntries'
import { useAuth } from '@/contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

export const OverviewPage: React.FC = () => {
  const { profile } = useAuth()
  const { data: salesEntries } = useSalesEntries()
  const { data: teamStats } = useTeamStats()

  // Calculate personal stats
  const totalMRR = salesEntries?.reduce((sum, entry) => sum + entry.mrr, 0) || 0
  const totalTCV = salesEntries?.reduce((sum, entry) => sum + entry.tcv, 0) || 0
  const totalSales = salesEntries?.length || 0

  // Chart data for personal performance over time
  const chartData = React.useMemo(() => {
    if (!salesEntries) return []
    
    const monthlyData = salesEntries.reduce((acc, entry) => {
      const month = new Date(entry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      if (!acc[month]) {
        acc[month] = { month, mrr: 0, tcv: 0, sales: 0 }
      }
      acc[month].mrr += entry.mrr
      acc[month].tcv += entry.tcv
      acc[month].sales += 1
      return acc
    }, {} as Record<string, any>)

    return Object.values(monthlyData).slice(-6) // Last 6 months
  }, [salesEntries])

  // Team comparison data
  const comparisonData = React.useMemo(() => {
    if (!teamStats || !profile) return []

    const myStats = teamStats.agentStats.find(agent => agent.id === profile.id)
    if (!myStats) return []

    return [
      {
        name: 'My MRR',
        value: myStats.totalMRR,
        fill: '#3b82f6'
      },
      {
        name: 'Team Avg MRR',
        value: teamStats.teamAvgMRR,
        fill: '#8b5cf6'
      }
    ]
  }, [teamStats, profile])

  // Leaderboard data
  const leaderboardData = React.useMemo(() => {
    if (!teamStats) return []

    return teamStats.agentStats
      .sort((a, b) => b.totalMRR - a.totalMRR)
      .map((agent, index) => ({
        ...agent,
        rank: index + 1,
        mrrShare: teamStats.teamTotalMRR > 0 ? (agent.totalMRR / teamStats.teamTotalMRR) * 100 : 0
      }))
  }, [teamStats])

  const COLORS = ['#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#f77f00']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 mt-1">Your performance dashboard</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-400 text-sm font-medium">Total MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              ${totalMRR.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-400 text-sm font-medium">Total TCV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              ${totalTCV.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total Contract Value</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-400 text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {totalSales}
            </div>
            <p className="text-xs text-gray-500 mt-1">Sales Entries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Over Time */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Performance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }} 
                />
                <Line type="monotone" dataKey="mrr" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="tcv" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Team Comparison */}
        {teamStats && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">vs Team Average</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }} 
                  />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Team Leaderboard */}
      {leaderboardData.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🏆 Team Leaderboard
              <span className="text-sm text-gray-400 font-normal">Friendly Competition</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {leaderboardData.map((agent, index) => (
                  <div 
                    key={agent.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all hover:bg-white/5 ${
                      agent.id === profile?.id ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-amber-600 text-white' :
                        'bg-gray-600 text-white'
                      }`}>
                        {agent.rank}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {agent.name || agent.email}
                          {agent.id === profile?.id && (
                            <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">You</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{agent.salesCount} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">${agent.totalMRR.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{agent.mrrShare.toFixed(1)}% of team</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-3">Team MRR Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leaderboardData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalMRR"
                      label={({ name, mrrShare }) => `${name?.split(' ')[0] || 'Agent'}: ${mrrShare.toFixed(1)}%`}
                    >
                      {leaderboardData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'MRR']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
