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
        console.error("Failed to send verification email:", error);
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
        console.error("Failed to send password reset email:", error);
        throw error;
    }
}
