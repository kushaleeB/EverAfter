import env from '../config/env.js';
import {
  EmailProviderError,
  sendWithBrevo,
  sendWithConsole,
  sendWithResend,
  sendWithSendGrid,
} from '../lib/email/providers.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildGuestInvitationEmail({ guestName, coupleNames, invitationUrl }) {
  const subject = `You're Invited to ${coupleNames}' Wedding 💍`;
  const text = `Hello ${guestName},

We are excited to celebrate our special day with you.

Please view your invitation below.

${invitationUrl}

We hope to celebrate with you!

Love,
${coupleNames}`;

  const html = `<!DOCTYPE html>
<html>
  <body style="font-family: Georgia, 'Times New Roman', serif; color: #4e342e; background: #faf9f6; padding: 24px;">
    <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8dfd6; border-radius: 16px; padding: 32px;">
      <p style="font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: #c5a67c; margin: 0 0 12px;">You're Invited</p>
      <h1 style="font-size: 28px; font-weight: normal; margin: 0 0 16px;">${escapeHtml(coupleNames)}</h1>
      <p style="font-size: 16px; line-height: 1.6; color: #6d625a;">Hello ${escapeHtml(guestName)},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #6d625a;">We are excited to celebrate our special day with you.</p>
      <p style="font-size: 16px; line-height: 1.6; color: #6d625a;">Please view your invitation below.</p>
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(invitationUrl)}" style="display: inline-block; background: #4e342e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-size: 14px;">View Your Invitation</a>
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: #9e8e82; word-break: break-all;">${escapeHtml(invitationUrl)}</p>
      <p style="font-size: 16px; line-height: 1.6; color: #6d625a; margin-top: 24px;">We hope to celebrate with you!</p>
      <p style="font-size: 16px; line-height: 1.6; color: #6d625a;">Love,<br>${escapeHtml(coupleNames)}</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

async function dispatchEmail(payload) {
  const provider = env.EMAIL_PROVIDER;
  const from = env.EMAIL_FROM;
  const apiKey = env.EMAIL_API_KEY;

  if (provider === 'console' || !apiKey) {
    return sendWithConsole(payload);
  }

  const request = { apiKey, from, ...payload };

  switch (provider) {
    case 'resend':
      return sendWithResend(request);
    case 'sendgrid':
      return sendWithSendGrid(request);
    case 'brevo':
      return sendWithBrevo(request);
    default:
      throw new EmailProviderError(`Unknown email provider: ${provider}`, provider);
  }
}

export async function sendGuestInvitationEmail({
  to,
  guestName,
  coupleNames,
  invitationUrl,
}) {
  if (!to) {
    throw new Error('Guest email is required to send an invitation email.');
  }

  const { subject, text, html } = buildGuestInvitationEmail({
    guestName,
    coupleNames,
    invitationUrl,
  });

  return dispatchEmail({ to, subject, text, html });
}

export async function sendPasswordResetEmail(email, resetUrl) {
  const subject = 'Reset your EverAfter password';
  const text = `Reset your password using this link:\n\n${resetUrl}`;
  const html = `<p><a href="${escapeHtml(resetUrl)}">Reset your password</a></p>`;
  return dispatchEmail({ to: email, subject, text, html });
}
