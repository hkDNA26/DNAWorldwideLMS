import { Resend } from "resend";

// Raw SMTP to Gmail doesn't work from hosts like Railway — outbound
// connections on both 587 and 465 hang and time out (the platform or
// Gmail silently dropping traffic from cloud-hosting IP ranges is a
// known, common combination). Resend sends over HTTPS instead, which
// sidesteps that whole class of problem.
const FROM = process.env.EMAIL_FROM || "DNA Worldwide <onboarding@resend.dev>";

// Resend's constructor throws immediately if the API key is missing, which
// would crash the module at import time (including during `next build`,
// which statically evaluates route modules) if this were a top-level
// `new Resend(...)` — so it's created lazily on first actual send instead.
let resend: Resend | null = null;
function getResendClient(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  const { error } = await getResendClient().emails.send({ from: FROM, to, subject, html, text });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

export async function sendStudentInviteEmail(
  to: string,
  studentName: string,
  setupUrl: string,
  courseNames: string[],
  resourceNames: string[] = []
) {
  const courseList =
    courseNames.length > 0
      ? `<ul style="margin:8px 0 0 0;padding-left:20px;color:#374151;">${courseNames
          .map((c) => `<li>${c}</li>`)
          .join("")}</ul>`
      : "";

  const resourceList =
    resourceNames.length > 0
      ? `<p style="margin:16px 0 0;color:#475569;font-size:15px;line-height:1.6;">
           You've also been given access to the following ${resourceNames.length === 1 ? "tool" : "tools"}:
         </p>
         <ul style="margin:8px 0 0 0;padding-left:20px;color:#374151;">${resourceNames
           .map((r) => `<li>${r}</li>`)
           .join("")}</ul>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#1d4f8c;padding:28px 40px;text-align:center;">
            <img
              src="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/logo.png"
              alt="DNA Worldwide"
              width="120"
              style="display:block;margin:0 auto 10px;max-width:120px;height:auto;"
            />
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
              DNA Worldwide
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 32px;">
            <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;">
              Hello ${studentName},
            </p>
            <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
              You've been invited to join <strong>DNA Worldwide</strong> as a student.
              ${
                courseNames.length > 0
                  ? `You've been enrolled in the following ${
                      courseNames.length === 1 ? "course" : "courses"
                    }:`
                  : ""
              }
            </p>
            ${courseList ? `<div style="margin:0 0 20px;">${courseList}</div>` : ""}
            ${resourceList ? `<div style="margin:0 0 20px;">${resourceList}</div>` : ""}
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              Click the button below to set your password and access your account.
              This link expires in <strong>72 hours</strong>.
            </p>
            <div style="text-align:center;margin:0 0 28px;">
              <a href="${setupUrl}"
                 style="display:inline-block;background:#1d4f8c;color:#ffffff;text-decoration:none;
                        font-size:15px;font-weight:600;padding:14px 32px;border-radius:8px;">
                Set Your Password
              </a>
            </div>
            <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
              Or copy and paste this link into your browser:<br>
              <a href="${setupUrl}" style="color:#1d4f8c;word-break:break-all;">${setupUrl}</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              If you did not expect this email, you can safely ignore it.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await sendEmail({
    to,
    subject: "You've been invited to DNA Worldwide",
    html,
    text: `Hello ${studentName},\n\nYou've been invited to join DNA Worldwide.\n\nSet your password here: ${setupUrl}\n\nThis link expires in 72 hours.`,
  });
}

function assignmentEmailHtml(studentName: string, itemLabel: string, itemUrl: string, itemWord: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="padding:32px 36px 28px;">
            <p style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:600;">Hi ${studentName},</p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              You've been given access to a new ${itemWord}: <strong>${itemLabel}</strong>.
            </p>
            <div style="text-align:center;margin:0 0 8px;">
              <a href="${itemUrl}"
                 style="display:inline-block;background:#1d4f8c;color:#ffffff;text-decoration:none;
                        font-size:15px;font-weight:600;padding:12px 28px;border-radius:8px;">
                Get started →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendCourseAssignedEmail(
  to: string,
  studentName: string,
  courseTitle: string,
  courseUrl: string
) {
  await sendEmail({
    to,
    subject: `You've been enrolled in ${courseTitle}`,
    html: assignmentEmailHtml(studentName, courseTitle, courseUrl, "course"),
    text: `Hi ${studentName},\n\nYou've been enrolled in ${courseTitle}.\n\nStart here: ${courseUrl}`,
  });
}

export async function sendResourceAssignedEmail(
  to: string,
  studentName: string,
  resourceLabel: string,
  resourceUrl: string
) {
  await sendEmail({
    to,
    subject: `You've been given access to ${resourceLabel}`,
    html: assignmentEmailHtml(studentName, resourceLabel, resourceUrl, "tool"),
    text: `Hi ${studentName},\n\nYou've been given access to ${resourceLabel}.\n\nOpen it here: ${resourceUrl}`,
  });
}

interface ReminderItem {
  label: string;
  url: string;
}

export async function sendAccessReminderEmail(to: string, studentName: string, items: ReminderItem[]) {
  const rows = items
    .map(
      (item) => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:14px;font-weight:600;color:#1e293b;">${item.label}</span>
        <a href="${item.url}" style="font-size:13px;font-weight:600;color:#1d4f8c;text-decoration:none;">Open →</a>
      </div>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="padding:32px 36px 28px;">
            <p style="margin:0 0 8px;color:#1e293b;font-size:16px;font-weight:600;">Hi ${studentName},</p>
            <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6;">
              Just a reminder — you still have ${items.length === 1 ? "this" : "these"} waiting for you:
            </p>
            ${rows}
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${studentName},`,
    ``,
    `Just a reminder — you still have these waiting for you:`,
    ...items.map((item) => `- ${item.label}: ${item.url}`),
  ].join("\n");

  await sendEmail({
    to,
    subject: items.length === 1 ? `Reminder: ${items[0].label}` : `Reminder: you have ${items.length} things waiting`,
    html,
    text,
  });
}

interface ReminderCourse {
  title: string;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
  hasCertificate: boolean;
  incompleteLessons: string[];
}

export async function sendReminderEmail(
  to: string,
  studentName: string,
  courses: ReminderCourse[]
) {
  const completedCount = courses.filter((c) => c.isCompleted).length;
  const inProgressCount = courses.filter((c) => !c.isCompleted && c.completedLessons > 0).length;

  const courseRows = courses
    .map((c) => {
      const pct = c.totalLessons > 0 ? Math.round((c.completedLessons / c.totalLessons) * 100) : 0;
      const barFill = c.isCompleted ? "#10b981" : pct > 50 ? "#1d4f8c" : "#f59e0b";
      const statusBadge = c.isCompleted
        ? `<span style="display:inline-block;background:#dcfce7;color:#166534;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;">✓ Completed</span>`
        : `<span style="display:inline-block;background:#fef9c3;color:#854d0e;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;">${pct}% complete</span>`;

      const incompleteList =
        !c.isCompleted && c.incompleteLessons.length > 0
          ? `<p style="margin:8px 0 4px;color:#64748b;font-size:12px;font-weight:600;">Still to complete:</p>
             <ul style="margin:0;padding-left:16px;color:#64748b;font-size:12px;">
               ${c.incompleteLessons.slice(0, 5).map((l) => `<li style="margin-bottom:2px;">${l}</li>`).join("")}
               ${c.incompleteLessons.length > 5 ? `<li style="color:#94a3b8;">...and ${c.incompleteLessons.length - 5} more</li>` : ""}
             </ul>`
          : "";

      const certLine = c.hasCertificate
        ? `<p style="margin:6px 0 0;font-size:12px;color:#059669;">🎓 Certificate issued</p>`
        : "";

      return `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <span style="font-size:14px;font-weight:600;color:#1e293b;">${c.title}</span>
          ${statusBadge}
        </div>
        <div style="background:#e2e8f0;border-radius:4px;height:6px;margin-bottom:6px;">
          <div style="background:${barFill};height:6px;border-radius:4px;width:${pct}%;"></div>
        </div>
        <p style="margin:0;font-size:12px;color:#64748b;">${c.completedLessons} of ${c.totalLessons} lessons complete</p>
        ${incompleteList}
        ${certLine}
      </div>`;
    })
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr>
          <td style="background:#1d4f8c;padding:28px 40px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">DNA Worldwide</h1>
            <p style="margin:4px 0 0;color:#93c5fd;font-size:13px;">Learning Progress Reminder</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 24px;">
            <p style="margin:0 0 8px;color:#1e293b;font-size:16px;font-weight:600;">Hi ${studentName},</p>
            <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
              Here's a summary of your current learning progress on DNA Worldwide.
              ${inProgressCount > 0 ? `You have <strong>${inProgressCount} course${inProgressCount > 1 ? "s" : ""} in progress</strong> — keep it up!` : ""}
            </p>

            <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;margin-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;padding:0 8px;">
                    <p style="margin:0;font-size:24px;font-weight:700;color:#1d4f8c;">${courses.length}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Enrolled</p>
                  </td>
                  <td style="text-align:center;padding:0 8px;border-left:1px solid #e0f2fe;">
                    <p style="margin:0;font-size:24px;font-weight:700;color:#10b981;">${completedCount}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">Completed</p>
                  </td>
                  <td style="text-align:center;padding:0 8px;border-left:1px solid #e0f2fe;">
                    <p style="margin:0;font-size:24px;font-weight:700;color:#f59e0b;">${inProgressCount}</p>
                    <p style="margin:4px 0 0;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;">In Progress</p>
                  </td>
                </tr>
              </table>
            </div>

            <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#1e293b;text-transform:uppercase;letter-spacing:0.5px;">Your Courses</h2>
            ${courseRows}

            <div style="text-align:center;margin-top:28px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/courses"
                 style="display:inline-block;background:#1d4f8c;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;">
                Continue Learning →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">DNA Worldwide Learning Platform</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Hi ${studentName},`,
    ``,
    `Here's your learning progress summary:`,
    ...courses.map(
      (c) =>
        `- ${c.title}: ${c.completedLessons}/${c.totalLessons} lessons (${c.isCompleted ? "Completed" : "In progress"})`
    ),
    ``,
    `Log in to continue: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/courses`,
  ].join("\n");

  await sendEmail({
    to,
    subject: `Your learning progress — DNA Worldwide`,
    html,
    text,
  });
}
