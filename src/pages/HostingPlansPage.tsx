import React from 'react'
import { SalesEntryForm } from '@/modules/HostingPlans/components/SalesEntryForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useSalesEntries } from '@/modules/HostingPlans/hooks/useSalesEntries'
import { usePlans } from '@/modules/HostingPlans/hooks/usePlans'
import { format } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'

export const HostingPlansPage: React.FC = () => {
  const { user, profile } = useAuth()
  const { data: salesEntries, isLoading } = useSalesEntries()
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans()

  // Debug logging
  React.useEffect(() => {
    console.log('HostingPlansPage - User:', !!user)
    console.log('HostingPlansPage - Profile:', profile)
    console.log('HostingPlansPage - Plans loading:', plansLoading)
    console.log('HostingPlansPage - Plans error:', plansError)
    console.log('HostingPlansPage - Plans data:', plans)
  }, [user, profile, plans, plansLoading, plansError])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Hosting Plans</h1>
        <p className="text-gray-400 mt-1">Record your sales and track performance</p>
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          <p>User authenticated: {user ? 'Yes' : 'No'}</p>
          <p>Profile loaded: {profile ? 'Yes' : 'No'}</p>
          <p>Plans loading: {plansLoading ? 'Yes' : 'No'}</p>
          <p>Plans count: {plans?.length || 0}</p>
          {plansError && <p className="text-red-400">Error: {plansError.message}</p>}
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
                {salesEntries.slice(0, 10).map((entry) => (
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