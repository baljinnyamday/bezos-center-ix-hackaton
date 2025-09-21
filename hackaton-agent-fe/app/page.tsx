import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DemandOverview } from "@/components/dashboard/demand-overview";
import { ProductionMetrics } from "@/components/dashboard/production-metrics";
import { SupplyAllocation } from "@/components/dashboard/supply-allocation";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { ExternalFactors } from "@/components/dashboard/external-factors";
import { UserGuidance } from "@/components/dashboard/user-guidance"; // Added user guidance component
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplyChainFlow } from "@/components/dashboard/supply-chain-flow";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-[100px] mb-2" />
              <Skeleton className="h-8 w-[60px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[400px]" />
        <Skeleton className="h-[400px]" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        <DashboardHeader />

        <Suspense fallback={<DashboardSkeleton />}>
          <div className="grid gap-6">
            {/* Key Metrics Row */}

            {/* Supply Chain Flow Visualization */}
            <SupplyChainFlow />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <ProductionMetrics />
                <ExternalFactors />
              </div>
              <div className="space-y-6">
                <UserGuidance />
                <AIInsights />
                <SupplyAllocation />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DemandOverview />
            </div>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
