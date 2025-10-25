import { Metadata } from "next";
import { Layout } from "@/components/layout/layout";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics Dashboard | FileThetic",
  description: "AI-powered analytics with real-time mirror node data, carbon tracking, and fraud detection",
};

export default function AnalyticsPage() {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
              <p className="text-muted-foreground">
                Real-time network metrics, carbon tracking, and AI-powered insights
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Live Data</span>
            </div>
          </div>
          
          <AnalyticsDashboard />
        </div>
      </div>
    </Layout>
  );
}
