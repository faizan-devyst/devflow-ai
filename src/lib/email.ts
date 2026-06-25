import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendUserVerificationEmail(
    email: string,
    verificationUrl: string
) {
    try {
        await resend.emails.send({
            from: "DevFlow AI <onboarding@resend.dev>",
            to: email,
            subject: "Verify your DevFlow AI email",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header {
                margin-bottom: 30px;
              }
              .logo {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
              }
              .logo-ai {
                color: #14b8a6;
                padding-left: 5px;
              }
              .content {
                margin-bottom: 30px;
                color: #1f2937;
                line-height: 1.6;
              }
              .button {
                display: inline-block;
                background-color: #14b8a6;
                color: white;
                padding: 12px 32px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin: 20px 0;
              }
              .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                margin-top: 30px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  DevFlow<span class="logo-ai">AI</span>
                </div>
              </div>
              <div class="content">
                <p>Hi there!</p>
                <p>Welcome to DevFlow AI! Please verify your email to get started.</p>
                <a href="${verificationUrl}" class="button">
                <span style="color:#ffffff !important;">Verify Email</span>
                </a>
                <p>Or copy this link: ${verificationUrl}</p>
                <p>This link expires in 24 hours.</p>
              </div>
              <div class="footer">
                <p>DevFlow AI, Async standup & codebase onboarding for dev teams</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });
    } catch (error) {
        // Surface to the caller (Better-Auth) so the sign-up flow can handle it
        throw error;
    }
}

export async function sendPasswordResetEmail(
    email: string,
    resetUrl: string
) {
    try {
        await resend.emails.send({
            from: "DevFlow AI <onboarding@resend.dev>",
            to: email,
            subject: "Reset your DevFlow AI password",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header {
                margin-bottom: 30px;
              }
              .logo {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 20px;
              }
              .logo-ai {
                color: #14b8a6;
                padding-left: 5px;
              }
              .content {
                margin-bottom: 30px;
                color: #1f2937;
                line-height: 1.6;
              }
              .button {
                display: inline-block;
                background-color: #14b8a6;
                color: #ffffff;
                padding: 12px 32px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin: 20px 0;
              }
              .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                margin-top: 30px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">
                  DevFlow<span class="logo-ai">AI</span>
                </div>
              </div>
              <div class="content">
                <p>Hi there!</p>
                <p>We received a request to reset your password. Click the link below to create a new password.</p>
                <a href="${resetUrl}" class="button">
                <span style="color:#ffffff !important;">Reset Password</span>
                </a>
                <p>Or copy this link: ${resetUrl}</p>
                <p>This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>DevFlow AI, Async standup & codebase onboarding for dev teams</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });
    } catch (error) {
        // Surface to the caller (Better-Auth) so the reset flow can handle it
        throw error;
    }
}

export async function sendInvitationEmail(
    email: string,
    options: { inviterName: string; teamName: string; roleLabel: string; acceptUrl: string }
) {
    const { inviterName, teamName, roleLabel, acceptUrl } = options;
    try {
        await resend.emails.send({
            from: "DevFlow AI <onboarding@resend.dev>",
            to: email,
            subject: `You're invited to ${teamName} on DevFlow AI`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              }
              .header { margin-bottom: 30px; }
              .logo { font-size: 24px; font-weight: 600; margin-bottom: 20px; }
              .logo-ai { color: #14b8a6; padding-left: 5px; }
              .content { margin-bottom: 30px; color: #1f2937; line-height: 1.6; }
              .button {
                display: inline-block;
                background-color: #14b8a6;
                color: #ffffff;
                padding: 12px 32px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 500;
                margin: 20px 0;
              }
              .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                margin-top: 30px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">DevFlow<span class="logo-ai">AI</span></div>
              </div>
              <div class="content">
                <p>Hi there!</p>
                <p><strong>${escapeHtml(inviterName)}</strong> invited you to join
                   <strong>${escapeHtml(teamName)}</strong> on DevFlow AI as a
                   <strong>${escapeHtml(roleLabel)}</strong>.</p>
                <p>Click below to set your password and get started.</p>
                <a href="${acceptUrl}" class="button">
                  <span style="color:#ffffff !important;">Accept invitation</span>
                </a>
                <p>Or copy this link: ${acceptUrl}</p>
                <p>This invitation expires in 7 days.</p>
              </div>
              <div class="footer">
                <p>DevFlow AI, Async standup & codebase onboarding for dev teams</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });
    } catch (error) {
        // Surface so the caller can report a failed send
        throw error;
    }
}

// ─── Sprint digest ──────────────────────────────────────────────────────────

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function inlineFormat(value: string): string {
    return value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

// Minimal Markdown → email-safe HTML for AI-generated digests (headings, bullets, bold).
function digestToHtml(markdown: string): string {
    const out: string[] = [];
    let inList = false;
    const closeList = () => {
        if (inList) {
            out.push("</ul>");
            inList = false;
        }
    };

    for (const rawLine of escapeHtml(markdown).split("\n")) {
        const line = rawLine.trim();
        if (!line) {
            closeList();
            continue;
        }

        const heading = line.match(/^#{1,6}\s+(.*)$/);
        if (heading) {
            closeList();
            out.push(
                `<h2 style="font-size:16px;color:#1f2937;margin:24px 0 8px;">${inlineFormat(heading[1])}</h2>`
            );
            continue;
        }

        const bullet = line.match(/^[-*]\s+(.*)$/);
        if (bullet) {
            if (!inList) {
                out.push('<ul style="margin:0 0 12px;padding-left:20px;color:#1f2937;">');
                inList = true;
            }
            out.push(`<li style="margin:4px 0;">${inlineFormat(bullet[1])}</li>`);
            continue;
        }

        closeList();
        out.push(`<p style="margin:0 0 12px;color:#1f2937;line-height:1.6;">${inlineFormat(line)}</p>`);
    }

    closeList();
    return out.join("");
}

export async function sendSprintDigestEmail(
    email: string,
    options: { teamName: string; periodLabel: string; digest: string }
) {
    const { teamName, periodLabel, digest } = options;
    try {
        await resend.emails.send({
            from: "DevFlow AI <onboarding@resend.dev>",
            to: email,
            subject: `Weekly sprint digest — ${teamName}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 640px;
                margin: 40px auto;
                background-color: white;
                border-radius: 8px;
                padding: 40px;
              }
              .logo {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 4px;
              }
              .logo-ai { color: #14b8a6; padding-left: 5px; }
              .meta { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
              .footer {
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
                margin-top: 30px;
                font-size: 12px;
                color: #6b7280;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">DevFlow<span class="logo-ai">AI</span></div>
              <p class="meta">Weekly sprint digest for <strong>${escapeHtml(teamName)}</strong> · ${escapeHtml(periodLabel)}</p>
              ${digestToHtml(digest)}
              <div class="footer">
                <p>DevFlow AI · Async standups & codebase onboarding for dev teams</p>
              </div>
            </div>
          </body>
        </html>
      `,
        });
    } catch (error) {
        // Surface so the caller can report which recipients failed
        throw error;
    }
}
