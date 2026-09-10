import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseVimeoUrl, fetchVimeoMeta } from "@/lib/videos";

export async function POST(request: Request) {
  try {
    const session = await requireAuth("ADMIN");
    const body = await request.json();
    const url = String(body.url || "").trim();
    const providedTitle = String(body.title || "").trim();

    if (!url) {
      return NextResponse.json({ error: "A Vimeo URL is required" }, { status: 400 });
    }

    const parsed = parseVimeoUrl(url);
    if (!parsed) {
      return NextResponse.json({ error: "That doesn't look like a valid Vimeo link" }, { status: 400 });
    }

    // Pull title/thumbnail/duration from Vimeo; fall back to any provided title.
    const meta = await fetchVimeoMeta(parsed.videoId, parsed.videoHash);
    const title = providedTitle || meta.title;
    if (!title) {
      return NextResponse.json(
        { error: "Couldn't read the video title from Vimeo — please enter a title." },
        { status: 400 }
      );
    }

    const max = await db.videoResource.aggregate({ _max: { sortOrder: true } });
    const nextOrder = (max._max.sortOrder ?? 0) + 1;

    const video = await db.videoResource.create({
      data: {
        title,
        provider: "vimeo",
        videoId: parsed.videoId,
        videoHash: parsed.videoHash,
        thumbnailUrl: meta.thumbnailUrl,
        durationSec: meta.durationSec,
        sortOrder: nextOrder,
        uploadedById: session.userId,
      },
    });

    return NextResponse.json({ data: video }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Create video error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAuth("ADMIN");
    const body = await request.json(); // [{ id, sortOrder }]

    await Promise.all(
      body.map((v: { id: string; sortOrder: number }) =>
        db.videoResource.update({ where: { id: v.id }, data: { sortOrder: v.sortOrder } })
      )
    );

    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof Error && (err.message === "UNAUTHORIZED" || err.message === "FORBIDDEN")) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    console.error("Reorder videos error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
