import { KpiCard } from "@/components/dashboard/kpi-card";
import { RecentCustomers } from "@/components/dashboard/recent-customers";
import { Overview } from "@/components/dashboard/overview";

type Metrics = {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  topCustomers: { id: string; name: string; value: number }[];
  currencyCode: string;
};

async function getMetrics(): Promise<Metrics | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/dashboard-metrics`, { cache: 'no-store' });
    if (!res.ok) {
      console.error("Failed to fetch metrics:", await res.text());
      return null;
    }
    return res.json();
  } catch (error) {
    console.error("Error in getMetrics:", error);
    return null;
  }
}


export default async function ShopifyDashboard() {
  const metrics = await getMetrics();

  if (!metrics) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">Error</h3>
          <p className="text-sm text-muted-foreground">
            Failed to load Shopify metrics. Please check the connection and try again.
          </p>
        </div>
      </div>
    )
  }

  const { totalRevenue, totalOrders, totalCustomers, topCustomers, currencyCode } = metrics;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  }

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:col-span-2">
        <KpiCard title="Total Revenue" value={formatCurrency(totalRevenue)} />
        <KpiCard title="Total Orders" value={totalOrders.toLocaleString()} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:col-span-3">
        <div className="col-span-1 xl:col-span-2">
            <Overview />
        </div>
        <RecentCustomers customers={topCustomers} currencyCode={currencyCode} />
      </div>
    </div>
  );
}
