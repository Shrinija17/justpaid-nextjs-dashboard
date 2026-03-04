export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import PlatformStoryPage from "@/components/PlatformStoryPage";
import { Twitter } from "lucide-react";
import { getPlatformStory } from "@/lib/queries";

export default async function TwitterPage() {
  const data = await getPlatformStory("Twitter");

  return (
    <DashboardLayout>
      <PlatformStoryPage
        platform="Twitter"
        icon={<Twitter size={18} />}
        data={data}
        benchmarkAvg={0.05}
        benchmarkLabel="Twitter/X"
      />
    </DashboardLayout>
  );
}
