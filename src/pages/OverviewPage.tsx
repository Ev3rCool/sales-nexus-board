
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSalesEntries, useTeamStats } from '@/modules/HostingPlans/hooks/useSalesEntries'
import { useAuth } from '@/contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ComposedChart } from 'recharts'
import { DateRangeSelector, type DateRange } from '@/components/DateRangeSelector'

export const OverviewPage: React.FC = () => {
  const { profile } = useAuth()
  const [dateRange, setDateRange] = React.useState<DateRange | null>(null)
  const { data: salesEntries } = useSalesEntries(undefined, dateRange || undefined)
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

  // Team comparison data with more detailed insights
  const comparisonData = React.useMemo(() => {
    if (!teamStats || !profile) return []

    const myStats = teamStats.agentStats.find(agent => agent.id === profile.id)
    if (!myStats) return []

    return [
      {
        category: 'MRR Performance',
        myValue: myStats.totalMRR,
        teamAvg: teamStats.teamAvgMRR,
        myLabel: 'My MRR',
        teamLabel: 'Team Avg'
      },
      {
        category: 'TCV Performance', 
        myValue: myStats.totalTCV,
        teamAvg: teamStats.teamAvgTCV,
        myLabel: 'My TCV',
        teamLabel: 'Team Avg'
      }
    ]
  }, [teamStats, profile])

  // Enhanced leaderboard data with performance metrics
  const leaderboardData = React.useMemo(() => {
    if (!teamStats) return []

    return teamStats.agentStats
      .sort((a, b) => b.totalMRR - a.totalMRR)
      .map((agent, index) => ({
        ...agent,
        rank: index + 1,
        mrrShare: teamStats.teamTotalMRR > 0 ? (agent.totalMRR / teamStats.teamTotalMRR) * 100 : 0,
        tcvShare: teamStats.teamTotalTCV > 0 ? (agent.totalTCV / teamStats.teamTotalTCV) * 100 : 0,
        avgDealSize: agent.salesCount > 0 ? agent.totalTCV / agent.salesCount : 0,
        isCurrentUser: agent.id === profile?.id
      }))
  }, [teamStats, profile])

  const COLORS = ['#3b82f6', '#8b5cf6', '#06d6a0', '#f72585', '#f77f00']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Overview</h1>
          <p className="text-gray-400 mt-1">Track your sales performance and team standings</p>
        </div>
        <DateRangeSelector 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
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

        {/* Enhanced Team Comparison */}
        {teamStats && (
          <Card className="bg-white/5 backdrop-blur-xl border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Performance vs Team Average</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(2)}`, 
                      name === 'myValue' ? 'Your Performance' : 'Team Average'
                    ]}
                  />
                  <Bar dataKey="myValue" fill="#3b82f6" name="myValue" />
                  <Bar dataKey="teamAvg" fill="#8b5cf6" name="teamAvg" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Interactive Leaderboard */}
      {leaderboardData.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              🏆 Team Leaderboard
              <span className="text-sm text-gray-400 font-normal">Friendly Competition • Hover for details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                {leaderboardData.map((agent, index) => (
                  <div 
                    key={agent.id}
                    className={`group relative flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                      agent.isCurrentUser 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg' 
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    title={`${agent.name || agent.email} - Detailed Performance`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                        index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                        index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                        'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                      }`}>
                        {agent.rank}
                      </div>
                      <div>
                        <p className="text-white font-medium flex items-center gap-2">
                          {agent.name || agent.email}
                          {agent.isCurrentUser && (
                            <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-1 rounded-full border border-blue-500/40">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400">{agent.salesCount} sales • ${agent.avgDealSize.toFixed(0)} avg deal</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">${agent.totalMRR.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{agent.mrrShare.toFixed(1)}% of team MRR</p>
                    </div>
                    
                    {/* Enhanced Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="bg-gray-800 border border-white/20 rounded-lg p-3 shadow-xl min-w-[200px]">
                        <h4 className="text-white font-semibold mb-2">{agent.name || agent.email}</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">MRR:</span>
                            <span className="text-green-400 font-medium">${agent.totalMRR.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">TCV:</span>
                            <span className="text-blue-400 font-medium">${agent.totalTCV.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Sales Count:</span>
                            <span className="text-white">{agent.salesCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Avg Deal:</span>
                            <span className="text-purple-400">${agent.avgDealSize.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Team Share:</span>
                            <span className="text-yellow-400">{agent.mrrShare.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
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
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isCurrentUser ? '#3b82f6' : COLORS[index % COLORS.length]}
                          stroke={entry.isCurrentUser ? '#60a5fa' : 'none'}
                          strokeWidth={entry.isCurrentUser ? 2 : 0}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                      formatter={(value: number, name: string, props: any) => [
                        `$${value.toFixed(2)}`, 
                        `MRR (${props.payload.mrrShare.toFixed(1)}%)`
                      ]}
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
