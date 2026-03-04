export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import PlatformStoryPage from "@/components/PlatformStoryPage";
import { Youtube } from "lucide-react";
import { getPlatformStory } from "@/lib/queries";

export default async function YouTubePage() {
  const data = await getPlatformStory("YouTube");

  return (
    <DashboardLayout>
      <PlatformStoryPage
        platform="YouTube"
        icon={<Youtube size={18} />}
        data={data}
        benchmarkAvg={5.96}
        benchmarkLabel="YouTube"
      />
    </DashboardLayout>
  );
}
