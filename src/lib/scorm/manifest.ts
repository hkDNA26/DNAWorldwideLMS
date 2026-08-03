import { XMLParser } from "fast-xml-parser";

export type ScormVersion = "SCORM_12" | "SCORM_2004";

export interface ParsedManifest {
  version: ScormVersion;
  entryPoint: string;
  title: string | null;
}

type ParseManifestResult = { success: true; data: ParsedManifest } | { success: false; error: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type XmlNode = any;

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function textOf(node: XmlNode): string | null {
  if (node == null) return null;
  if (typeof node === "string") return node;
  if (typeof node === "object" && typeof node["#text"] === "string") return node["#text"];
  return null;
}

function detectVersion(manifest: XmlNode): ScormVersion {
  const raw = textOf(manifest?.metadata?.schemaversion) ?? "";
  return raw.includes("2004") ? "SCORM_2004" : "SCORM_12";
}

/** Depth-first walk of an organization's <item> tree; returns the identifierref
 * of the first launchable item (grouping items with no identifierref are skipped
 * over, not stopped at). */
function findLaunchItemRef(items: XmlNode[]): string | null {
  for (const item of items) {
    const ref = item?.["@_identifierref"];
    if (ref) return ref;
    const found = findLaunchItemRef(asArray(item?.item));
    if (found) return found;
  }
  return null;
}

export function parseManifest(xml: string): ParseManifestResult {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });

  let doc: XmlNode;
  try {
    doc = parser.parse(xml);
  } catch {
    return { success: false, error: "imsmanifest.xml is not valid XML." };
  }

  const manifest = doc?.manifest;
  if (!manifest) {
    return { success: false, error: "imsmanifest.xml has no <manifest> root element." };
  }

  const version = detectVersion(manifest);

  const resources = asArray(manifest.resources?.resource);
  const resourceByIdentifier = new Map<string, XmlNode>();
  for (const resource of resources) {
    const id = resource?.["@_identifier"];
    if (id) resourceByIdentifier.set(id, resource);
  }

  let entryPoint: string | null = null;
  let title: string | null = null;

  const organizations = manifest.organizations;
  if (organizations) {
    const orgList = asArray(organizations.organization);
    const defaultId = organizations["@_default"];
    const org = orgList.find((o) => o?.["@_identifier"] === defaultId) ?? orgList[0];
    if (org) {
      title = textOf(org.title);
      const ref = findLaunchItemRef(asArray(org.item));
      if (ref) {
        const resource = resourceByIdentifier.get(ref);
        if (resource?.["@_href"]) entryPoint = resource["@_href"];
      }
    }
  }

  if (!entryPoint) {
    // Fallback for malformed/minimal packages with no usable organizations/items:
    // prefer a resource explicitly marked as an SCO, else take the first with an href.
    const scoResource = resources.find((r) => {
      const scormType = r?.["@_adlcp:scormtype"] ?? r?.["@_adlcp:scormType"];
      return typeof scormType === "string" && scormType.toLowerCase() === "sco" && r?.["@_href"];
    });
    const fallback = scoResource ?? resources.find((r) => r?.["@_href"]);
    if (fallback?.["@_href"]) entryPoint = fallback["@_href"];
  }

  if (!entryPoint) {
    return { success: false, error: "Could not find a launch file in imsmanifest.xml (no organizations/items or resources with an href)." };
  }

  return { success: true, data: { version, entryPoint, title } };
}
