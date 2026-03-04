export const dynamic = "force-dynamic";
import DashboardLayout from "@/components/DashboardLayout";
import PlatformStoryPage from "@/components/PlatformStoryPage";
import { Linkedin } from "lucide-react";
import { getPlatformStory } from "@/lib/queries";

export default async function LinkedInPage() {
  const data = await getPlatformStory("LinkedIn");

  return (
    <DashboardLayout>
      <PlatformStoryPage
        platform="LinkedIn"
        icon={<Linkedin size={18} />}
        data={data}
        benchmarkAvg={2.0}
        benchmarkLabel="LinkedIn"
      />
    </DashboardLayout>
  );
}
