import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { HostingPlanWithDiscounts } from '@/modules/HostingPlans/hooks/usePlans';
import { SalesEntry } from '@/modules/HostingPlans/hooks/useSalesEntries';

export const PlanCard: React.FC<{ plan: HostingPlanWithDiscounts }> = ({ plan }) => (
  <Card className="bg-white/5 backdrop-blur-xl border-white/10 flex flex-col">
    <CardHeader>
      <CardTitle className="text-white flex justify-between items-start">
        {plan.name}
        <Badge variant={plan.plan_category === 'Shared' ? 'secondary' : 'default'}>
          {plan.plan_category}
        </Badge>
      </CardTitle>
      <p className="text-gray-400 text-sm pt-2">{plan.description}</p>
    </CardHeader>
    <CardContent className="flex-grow">
      <p className="text-3xl font-bold text-green-400 mb-4">${plan.regular_price}<span className="text-lg font-normal text-gray-400">/mo</span></p>
      <ul className="space-y-2 text-sm text-gray-300">
        {(plan.features as string[])?.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            {feature}
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export const RecentSales: React.FC<{ sales: SalesEntry[], isLoading: boolean, error: Error | null }> = ({ sales, isLoading, error }) => (
  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
    <CardHeader>
      <CardTitle className="text-white">Recent Sales</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <p className="text-gray-400">Loading...</p>
      ) : error ? (
        <p className="text-red-400">Error: {error.message}</p>
      ) : sales.length === 0 ? (
        <p className="text-gray-400">No recent sales.</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sales.map(entry => (
            <div key={entry.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-medium">{(entry as any).hosting_plans?.name ?? 'Unknown Plan'}</p>
                  <p className="text-xs text-gray-400">{entry.subscribers_count} subscriber(s) • {entry.billing_cycle} • {entry.discount_pct}% off</p>
                  <p className="text-xs text-gray-500">{format(new Date(entry.date), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">${entry.mrr?.toFixed(2) ?? '0.00'}</p>
                  <p className="text-xs text-gray-400">MRR</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);