import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const PlanCardSkeleton = () => (
  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
    <CardHeader>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-10 w-1/4 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </CardContent>
  </Card>
);

export const RecentSalesSkeleton = () => (
  <Card className="bg-white/5 backdrop-blur-xl border-white/10">
    <CardHeader>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </CardHeader>
    <CardContent className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </CardContent>
  </Card>
);