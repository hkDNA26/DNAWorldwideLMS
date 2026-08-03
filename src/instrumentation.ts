const SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Some hosts (Railway included) have no IPv6 egress, but Node's DNS
  // resolution can still return an AAAA record first for outbound hosts
  // (SMTP, Dropbox downloads, ...) and fail immediately with ENETUNREACH
  // before ever trying the working IPv4 address. Prefer IPv4 process-wide.
  const dns = await import("dns");
  dns.setDefaultResultOrder("ipv4first");

  const { runAccessReminderSweep } = await import("@/lib/access-reminders");

  setInterval(() => {
    runAccessReminderSweep().catch((err) => console.error("Access reminder sweep failed:", err));
  }, SWEEP_INTERVAL_MS);
}
