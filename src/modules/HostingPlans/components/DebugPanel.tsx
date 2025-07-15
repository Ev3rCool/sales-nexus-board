import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { usePlans } from '@/modules/HostingPlans/hooks/usePlans';
import { useSalesEntries } from '@/modules/HostingPlans/hooks/useSalesEntries';
import { RefreshCw, Database, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const StatusIcon: React.FC<{ condition: boolean; loading?: boolean }> = ({ condition, loading }) => {
  if (loading) return <RefreshCw className="h-4 w-4 animate-spin text-yellow-400" />;
  return condition ? (
    <CheckCircle className="h-4 w-4 text-green-400" />
  ) : (
    <XCircle className="h-4 w-4 text-red-400" />
  );
};

export const DebugPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const { data: plans, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = usePlans();
  const { data: salesEntries, isLoading: salesLoading, error: salesError } = useSalesEntries();

  const debugInfo = useMemo(() => ({
    userAuthenticated: !!user,
    userEmail: user?.email || 'N/A',
    profileLoaded: !!profile,
    profileRole: profile?.role || 'N/A',
    plansLoading,
    plansCount: plans?.length ?? 0,
    plansError: plansError?.message,
    salesLoading,
    salesCount: salesEntries?.length ?? 0,
    salesError: salesError?.message,
  }), [user, profile, plansLoading, plans, plansError, salesLoading, salesEntries, salesError]);

  const handleDatabaseTest = async () => {
    try {
      const { data, error } = await supabase.from('hosting_plans').select('id, name').limit(3);
      alert(`Database Test Successful:
${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      alert(`Database Test Failed:
${err}`);
    }
  };

  return (
    <details className="mt-4">
      <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 flex items-center gap-2">
        <Database className="h-4 w-4" />
        Enhanced Debug Information
      </summary>
      <div className="mt-3 text-sm bg-black/30 p-4 rounded-lg border border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Authentication Status */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2"><Database className="h-4 w-4" />Authentication Status</h4>
            <div className="flex justify-between"><span className="text-gray-400">User Authenticated:</span><StatusIcon condition={debugInfo.userAuthenticated} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Profile Loaded:</span><StatusIcon condition={debugInfo.profileLoaded} /></div>
            <div className="flex justify-between"><span className="text-gray-400">User Email:</span><span className="text-blue-400 text-xs">{debugInfo.userEmail}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Profile Role:</span><span className="text-purple-400">{debugInfo.profileRole}</span></div>
          </div>

          {/* Data Loading Status */}
          <div className="space-y-2">
            <h4 className="text-white font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Data Loading Status</h4>
            <div className="flex justify-between"><span className="text-gray-400">Plans Loading:</span><StatusIcon condition={!debugInfo.plansLoading} loading={debugInfo.plansLoading} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Plans Count:</span><span>{debugInfo.plansCount}</span></div>
            {debugInfo.plansError && <div className="text-red-400 text-xs mt-1 p-2 bg-red-500/10 rounded"><strong>Plans Error:</strong> {debugInfo.plansError}</div>}
            <div className="flex justify-between"><span className="text-gray-400">Sales Loading:</span><StatusIcon condition={!debugInfo.salesLoading} loading={debugInfo.salesLoading} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Sales Count:</span><span>{debugInfo.salesCount}</span></div>
            {debugInfo.salesError && <div className="text-red-400 text-xs mt-1 p-2 bg-red-500/10 rounded"><strong>Sales Error:</strong> {debugInfo.salesError}</div>}
          </div>
        </div>

        {/* Debug Actions */}
        <div className="mt-4 pt-4 border-t border-white/10 flex gap-2 flex-wrap">
          <Button onClick={() => refetchPlans()} size="sm" variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Retry Plans</Button>
          <Button onClick={handleDatabaseTest} size="sm" variant="outline"><Database className="h-4 w-4 mr-2" />Test Database</Button>
        </div>
      </div>
    </details>
  );
};