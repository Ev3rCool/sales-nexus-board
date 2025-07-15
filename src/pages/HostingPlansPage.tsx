import React, { memo, useMemo } from 'react'
import { SalesEntryForm } from '@/modules/HostingPlans/components/SalesEntryForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSalesEntries } from '@/modules/HostingPlans/hooks/useSalesEntries'
import { usePlans } from '@/modules/HostingPlans/hooks/usePlans'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const HostingPlansPageComponent: React.FC = () => {
  const { user, profile } = useAuth()

  // Load all hosting-plans
  const {
    data: plans,
    isLoading: plansLoading,
    error: plansError,
    refetch: refetchPlans
  } = usePlans()

  // Load the sales entries
  const {
    data: salesEntries,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesEntries()

  // Enhanced debug logging
  React.useEffect(() => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAuthenticated: !!user,
      userEmail: user?.email,
      profileLoaded: !!profile,
      profileRole: profile?.role,
      plansLoading,
      plansCount: plans?.length ?? 0,
      plansError: plansError?.message,
      salesLoading,
      salesCount: salesEntries?.length ?? 0,
      salesError: salesError?.message,
    }
    
    console.log('🔍 HostingPlansPage Enhanced Debug Info:', debugInfo)
    
    // Store debug info in window for easy access
    ;(window as any).hostingPlansDebug = debugInfo
  }, [
    user,
    profile,
    plansLoading,
    plans?.length,
    plansError,
    salesLoading,
    salesEntries?.length,
    salesError,
  ])

  // Enhanced debug info for display
  const debugInfo = useMemo(
    () => ({
      userAuthenticated: user ? 'Yes' : 'No',
      userEmail: user?.email || 'N/A',
      profileLoaded: profile ? 'Yes' : 'No',
      profileRole: profile?.role || 'N/A',
      plansLoading: plansLoading ? 'Yes' : 'No',
      plansCount: plans?.length ?? 0,
      plansError: plansError?.message,
      salesLoading: salesLoading ? 'Yes' : 'No',
      salesCount: salesEntries?.length ?? 0,
      salesError: salesError?.message,
    }),
    [
      user,
      profile,
      plansLoading,
      plans?.length,
      plansError,
      salesLoading,
      salesEntries?.length,
      salesError,
    ]
  )

  // Only keep the 10 most-recent sales
  const recentSalesEntries = useMemo(
    () => salesEntries?.slice(0, 10) ?? [],
    [salesEntries]
  )

  const getStatusIcon = (condition: boolean, loading: boolean = false) => {
    if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-yellow-400" />
    return condition ? 
      <CheckCircle className="h-4 w-4 text-green-400" /> : 
      <XCircle className="h-4 w-4 text-red-400" />
  }

  const handleDatabaseTest = async () => {
    console.log('🔍 Manual database test initiated...')
    try {
      const { data, error } = await supabase
        .from('hosting_plans')
        .select('id, name, regular_price')
        .limit(5)
      
      console.log('🔍 Manual test result:', { data, error })
      alert(`Database test result:
Data: ${JSON.stringify(data, null, 2)}
Error: ${error?.message || 'None'}`)
    } catch (err) {
      console.error('🔍 Manual test error:', err)
      alert(`Database test failed: ${err}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header + Enhanced Debug Info */}
      <div>
        <h1 className="text-3xl font-bold text-white">Hosting Plans</h1>
        <p className="text-gray-400 mt-1">
          Record your sales and track performance
        </p>

        <details className="mt-4">
          <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center gap-2">
            <Database className="h-4 w-4" />
            🔍 Enhanced Debug Information (click to expand)
          </summary>
          <div className="mt-3 text-sm bg-black/30 p-4 rounded-lg border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Authentication Status
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">User authenticated:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!!user)}
                      <span className={user ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.userAuthenticated}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">User email:</span>
                    <span className="text-blue-400 text-xs">{debugInfo.userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Profile loaded:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!!profile)}
                      <span className={profile ? 'text-green-400' : 'text-yellow-400'}>
                        {debugInfo.profileLoaded}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Profile role:</span>
                    <span className="text-purple-400">{debugInfo.profileRole}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Data Loading Status
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plans loading:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!plansLoading, plansLoading)}
                      <span className={plansLoading ? 'text-yellow-400' : 'text-green-400'}>
                        {debugInfo.plansLoading}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Plans count:</span>
                    <span className={debugInfo.plansCount > 0 ? 'text-green-400' : 'text-red-400'}>
                      {debugInfo.plansCount}
                    </span>
                  </div>
                  {debugInfo.plansError && (
                    <div className="text-red-400 text-xs mt-1 p-2 bg-red-500/10 rounded">
                      <strong>Plans error:</strong> {debugInfo.plansError}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sales loading:</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(!salesLoading, salesLoading)}
                      <span className={salesLoading ? 'text-yellow-400' : 'text-green-400'}>
                        {debugInfo.salesLoading}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Sales count:</span>
                    <span className="text-blue-400">{debugInfo.salesCount}</span>
                  </div>
                  {debugInfo.salesError && (
                    <div className="text-red-400 text-xs mt-1 p-2 bg-red-500/10 rounded">
                      <strong>Sales error:</strong> {debugInfo.salesError}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <h4 className="text-white font-semibold mb-2">Debug Actions</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => refetchPlans()}
                  size="sm"
                  variant="outline"
                  className="bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Plans
                </Button>
                <Button
                  onClick={handleDatabaseTest}
                  size="sm"
                  variant="outline"
                  className="bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test Database
                </Button>
                <Button
                  onClick={() => console.log('Debug info:', (window as any).hostingPlansDebug)}
                  size="sm"
                  variant="outline"
                  className="bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                >
                  Log Debug Info
                </Button>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              <p>💡 <strong>Tip:</strong> Check the browser console for detailed step-by-step loading information.</p>
              <p>💡 <strong>Tip:</strong> Debug info is also available at <code>window.hostingPlansDebug</code></p>
            </div>
          </div>
        </details>
      </div>

      {/* Main Grid: Sales Entry Form + Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form to record a new sale */}
        <SalesEntryForm />

        {/* Right: Recent Sales List */}
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Sales</CardTitle>
            {salesLoading && (
              <p className="text-xs text-gray-400">
                Loading sales data...
              </p>
            )}
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span className="text-gray-400">Loading recent sales…</span>
              </div>
            ) : salesError ? (
              <div className="text-red-400 text-center py-4">
                <p className="font-semibold">❌ Error loading sales</p>
                <p className="text-sm mt-1">{salesError.message}</p>
              </div>
            ) : recentSalesEntries.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentSalesEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white/5 rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">
                          {(entry as any).hosting_plans?.name ?? 'Unknown Plan'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {entry.subscribers_count} subscriber(s) •{' '}
                          {entry.billing_cycle} • {entry.discount_pct}% discount
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">
                          ${entry.mrr?.toFixed(2) ?? '0.00'}
                        </p>
                        <p className="text-xs text-gray-400">MRR</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                <p>📝 No sales recorded yet.</p>
                <p className="text-sm mt-1">Record your first sale to get started!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Memoized export
export const HostingPlansPage = memo(HostingPlansPageComponent)