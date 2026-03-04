export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import PlatformStoryPage from "@/components/PlatformStoryPage";
import { Instagram } from "lucide-react";
import { getPlatformStory } from "@/lib/queries";

export default async function InstagramPage() {
  const data = await getPlatformStory("Instagram");

  return (
    <DashboardLayout>
      <PlatformStoryPage
        platform="Instagram"
        icon={<Instagram size={18} />}
        data={data}
        benchmarkAvg={1.22}
        benchmarkLabel="Instagram"
      />
    </DashboardLayout>
  );
}
