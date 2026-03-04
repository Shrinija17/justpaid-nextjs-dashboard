"use client";
import dynamic from "next/dynamic";

const GrowthChart = dynamic(() => import("./GrowthChart"), { ssr: false });
const EngagementChart = dynamic(() => import("./EngagementChart"), { ssr: false });

export function GrowthChartNoSSR({ data }: { data: unknown[] }) {
  return <GrowthChart data={data as never} />;
}

export function EngagementChartNoSSR({ data }: { data: unknown[] }) {
  return <EngagementChart data={data as never} />;
}
