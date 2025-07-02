import React, { memo, useMemo } from 'react'
import { SalesEntryForm } from '@/modules/HostingPlans/components/SalesEntryForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSalesEntries } from '@/modules/HostingPlans/hooks/useSalesEntries'
import { usePlans } from '@/modules/HostingPlans/hooks/usePlans'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'

const HostingPlansPageComponent: React.FC = () => {
  const { user, profile } = useAuth()
  const { data: salesEntries, isLoading: salesLoading, error: salesError } = useSalesEntries()
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans()

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 HostingPlansPage state:', {
      userAuthenticated: !!user,
      profileLoaded: !!profile,
      plansLoading,
      plansCount: plans?.length || 0,
      plansError: plansError?.message,
      salesLoading,
      salesCount: salesEntries?.length || 0,
      salesError: salesError?.message
    })
  }, [user, profile, plansLoading, plans?.length, plansError, salesLoading, salesEntries?.length, salesError])

  // Memoized debug info to prevent unnecessary re-renders
  const debugInfo = useMemo(() => ({
    userAuthenticated: user ? 'Yes' : 'No',
    profileLoaded: profile ? 'Yes' : 'No',
    plansLoading: plansLoading ? 'Yes' : 'No',
    plansCount: plans?.length || 0,
    plansError: plansError?.message,
    salesLoading: salesLoading ? 'Yes' : 'No',
    salesCount: salesEntries?.length || 0,
    salesError: salesError?.message
  }), [user, profile, plansLoading, plans?.length, plansError, salesLoading, salesEntries?.length, salesError])

  // Memoized recent sales entries
  const recentSalesEntries = useMemo(() => 
    salesEntries?.slice(0, 10) || [], 
    [salesEntries]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Hosting Plans</h1>
        <p className="text-gray-400 mt-1">Record your sales and track performance</p>
        
        {/* Debug info - more compact */}
        <details className="mt-2">
          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
            🔍 Debug Information (click to expand)
          </summary>
          <div className="mt-1 text-xs text-gray-500 bg-black/20 p-2 rounded">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p>User authenticated: <span className={debugInfo.userAuthenticated === 'Yes' ? 'text-green-400' : 'text-red-400'}>{debugInfo.userAuthenticated}</span></p>
                <p>Profile loaded: <span className={debugInfo.profileLoaded === 'Yes' ? 'text-green-400' : 'text-yellow-400'}>{debugInfo.profileLoaded}</span></p>
                <p>Plans loading: <span className={debugInfo.plansLoading === 'Yes' ? 'text-yellow-400' : 'text-green-400'}>{debugInfo.plansLoading}</span></p>
                <p>Plans count: <span className="text-blue-400">{debugInfo.plansCount}</span></p>
              </div>
              <div>
                <p>Sales loading: <span className={debugInfo.salesLoading === 'Yes' ? 'text-yellow-400' : 'text-green-400'}>{debugInfo.salesLoading}</span></p>
                <p>Sales count: <span className="text-blue-400">{debugInfo.salesCount}</span></p>
                {debugInfo.plansError && <p className="text-red-400">Plans error: {debugInfo.plansError}</p>}
                {debugInfo.salesError && <p className="text-red-400">Sales error: {debugInfo.salesError}</p>}
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesEntryForm />
        
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Sales</CardTitle>
            {salesLoading && (
              <p className="text-xs text-gray-400">Loading sales data...</p>
            )}
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="text-gray-400">Loading recent sales...</span>
              </div>
            ) : salesError ? (
              <div className="text-red-400 text-center py-4">
                <p className="font-semibold">❌ Error loading sales</p>
                <p className="text-sm mt-1">{salesError.message}</p>
              </div>
            ) : salesEntries && salesEntries.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentSalesEntries.map((entry) => (
                  <div key={entry.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium">
                          {(entry as any).hosting_plans?.name || 'Unknown Plan'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {entry.subscribers_count} subscriber(s) • {entry.billing_cycle} • {entry.discount_pct}% discount
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(entry.date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">${entry.mrr?.toFixed(2) || '0.00'}</p>
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

// Memoized export to prevent unnecessary re-renders
export const HostingPlansPage = memo(HostingPlansPageComponent)