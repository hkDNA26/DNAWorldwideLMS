import { requireResourceAccess } from "@/lib/resource-access";
import { db } from "@/lib/db";
import { BackLink } from "@/components/portal/back-link";
import { VideoGrid } from "@/components/portal/video-grid";

export default async function VideosPage() {
  await requireResourceAccess("VIDEOS");

  const videos = await db.videoResource.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      videoId: true,
      videoHash: true,
      thumbnailUrl: true,
      durationSec: true,
    },
  });

  return (
    <div>
      <BackLink href="/resources" label="Back to resources" />
      <div className="mb-8 animate-brand-fade-up">
        <h1 className="text-2xl font-bold text-ink">Videos</h1>
        <p className="text-ink-soft mt-1">Training films and drug-profile videos — click any to play.</p>
      </div>
      <VideoGrid videos={videos} />
    </div>
  );
}
