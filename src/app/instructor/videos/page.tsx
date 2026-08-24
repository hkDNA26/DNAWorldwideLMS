import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { VideosManager, type AdminVideo } from "@/components/instructor/videos-manager";

export default async function InstructorVideosPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const rows = await db.videoResource.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, thumbnailUrl: true, durationSec: true },
  });
  const videos: AdminVideo[] = rows;

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink">Videos</h1>
        <p className="text-ink-soft mt-1">
          Add or remove the Vimeo films staff can watch under Resources → Videos.
        </p>
      </div>
      <VideosManager videos={videos} />
    </div>
  );
}
