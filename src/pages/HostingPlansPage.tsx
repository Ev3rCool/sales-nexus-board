import React, { memo, useMemo } from 'react'
import { SalesEntryForm } from '@/modules/HostingPlans/components/SalesEntryForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSalesEntries } from '@/modules/HostingPlans/hooks/useSalesEntries'
import { usePlans } from '@/modules/HostingPlans/hooks/usePlans'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'

const HostingPlansPageComponent: React.FC = () => {
  const { user, profile } = useAuth()
  const { data: salesEntries, isLoading } = useSalesEntries()
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans()

  // Memoized debug info to prevent unnecessary re-renders
  const debugInfo = useMemo(() => ({
    userAuthenticated: user ? 'Yes' : 'No',
    profileLoaded: profile ? 'Yes' : 'No',
    plansLoading: plansLoading ? 'Yes' : 'No',
    plansCount: plans?.length || 0,
    plansError: plansError?.message
  }), [user, profile, plansLoading, plans?.length, plansError?.message])

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
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          <p>User authenticated: {debugInfo.userAuthenticated}</p>
          <p>Profile loaded: {debugInfo.profileLoaded}</p>
          <p>Plans loading: {debugInfo.plansLoading}</p>
          <p>Plans count: {debugInfo.plansCount}</p>
          {debugInfo.plansError && <p className="text-red-400">Error: {debugInfo.plansError}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesEntryForm />
        
        <Card className="bg-white/5 backdrop-blur-xl border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse text-gray-400">Loading recent sales...</div>
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
                <p>No sales recorded yet.</p>
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