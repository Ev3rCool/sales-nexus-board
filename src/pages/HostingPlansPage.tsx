import React, { memo } from 'react';
import { usePlans } from '@/modules/HostingPlans/hooks/usePlans';
import { useSalesEntries } from '@/modules/HostingPlans/hooks/useSalesEntries';
import { SalesEntryForm } from '@/modules/HostingPlans/components/SalesEntryForm';
import { PlanCard, RecentSales } from '@/modules/HostingPlans/components/DisplayComponents';
import { PlanCardSkeleton, RecentSalesSkeleton } from '@/modules/HostingPlans/components/Skeletons';
import { DebugPanel } from '@/modules/HostingPlans/components/DebugPanel';

const HostingPlansPageComponent: React.FC = () => {
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans();
  const { data: salesEntries, isLoading: salesLoading, error: salesError } = useSalesEntries();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white">Hosting Plans</h1>
        <p className="text-gray-400 mt-1">Record your sales and track performance</p>
        <DebugPanel />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesEntryForm />
        {salesLoading ? (
          <RecentSalesSkeleton />
        ) : (
          <RecentSales sales={salesEntries || []} isLoading={salesLoading} error={salesError} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansLoading ? (
          [...Array(3)].map((_, i) => <PlanCardSkeleton key={i} />)
        ) : plansError ? (
          <div className="col-span-full text-red-400 text-center py-8">
            <p className="font-semibold">❌ Error loading hosting plans</p>
            <p className="text-sm mt-1">{plansError.message}</p>
          </div>
        ) : (
          plans?.map(plan => <PlanCard key={plan.id} plan={plan} />)
        )}
      </div>
    </div>
  );
};

export const HostingPlansPage = memo(HostingPlansPageComponent);