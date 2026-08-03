import { promises as fs } from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { parseManifest, type ScormVersion } from "./manifest";

export interface ScormExtractResult {
  version: ScormVersion;
  entryPoint: string;
  title: string | null;
  extractedPath: string; // e.g. "scorm/<courseId>" or "scorm/<courseId>/<wrapping-folder>" — relative to public/uploads
}

type Result = { success: true; data: ScormExtractResult } | { success: false; error: string };

const UPLOAD_ROOT = process.env.UPLOAD_DIR || "./public/uploads";

function isSafeEntryName(entryName: string, targetDir: string): boolean {
  if (path.isAbsolute(entryName)) return false;
  const resolved = path.resolve(targetDir, entryName);
  return resolved === targetDir || resolved.startsWith(targetDir + path.sep);
}

/** Zip tools (Finder, Explorer) often wrap a package in a single top-level
 * folder, so imsmanifest.xml isn't always at the zip root. Find the
 * shallowest imsmanifest.xml and treat its directory as the package root. */
function locateManifestEntry(zip: AdmZip) {
  const candidates = zip
    .getEntries()
    .filter((e) => !e.isDirectory && e.entryName.split("/").pop()?.toLowerCase() === "imsmanifest.xml");
  candidates.sort((a, b) => a.entryName.split("/").length - b.entryName.split("/").length);
  return candidates[0] ?? null;
}

export async function extractScormPackage(zipBuffer: Buffer, courseId: string): Promise<Result> {
  let zip: AdmZip;
  try {
    zip = new AdmZip(zipBuffer);
  } catch {
    return { success: false, error: "This doesn't look like a valid .zip file." };
  }

  const entries = zip.getEntries();
  if (entries.length === 0) {
    return { success: false, error: "The zip file is empty." };
  }

  const baseRelativePath = `scorm/${courseId}`;
  const targetDir = path.join(process.cwd(), UPLOAD_ROOT.replace("./", ""), baseRelativePath);

  for (const entry of entries) {
    if (!isSafeEntryName(entry.entryName, targetDir)) {
      return { success: false, error: "This zip file contains unsafe file paths and was rejected." };
    }
  }

  const manifestEntry = locateManifestEntry(zip);
  if (!manifestEntry) {
    return { success: false, error: "Not a valid SCORM package: imsmanifest.xml was not found in the zip." };
  }

  const manifestResult = parseManifest(manifestEntry.getData().toString("utf-8"));
  if (!manifestResult.success) {
    return { success: false, error: manifestResult.error };
  }

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });
  zip.extractAllTo(targetDir, true);

  const manifestDir = path.posix.dirname(manifestEntry.entryName);
  const extractedPath = manifestDir === "." ? baseRelativePath : `${baseRelativePath}/${manifestDir}`;

  return {
    success: true,
    data: {
      version: manifestResult.data.version,
      entryPoint: manifestResult.data.entryPoint,
      title: manifestResult.data.title,
      extractedPath,
    },
  };
}

/** Best-effort cleanup of a course's extracted SCORM files (e.g. on course delete). */
export async function deleteScormFiles(courseId: string): Promise<void> {
  const targetDir = path.join(process.cwd(), UPLOAD_ROOT.replace("./", ""), "scorm", courseId);
  try {
    await fs.rm(targetDir, { recursive: true, force: true });
  } catch {
    // Directory may not exist; ignore.
  }
}
