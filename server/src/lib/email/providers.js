/**
 * Pluggable email providers for transactional messages.
 * Add SMS / push providers alongside this module later.
 */

export class EmailProviderError extends Error {
  constructor(message, provider) {
    super(message);
    this.name = 'EmailProviderError';
    this.provider = provider;
  }
}

export async function sendWithResend({ apiKey, from, to, subject, html, text }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, html, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new EmailProviderError(`Resend error: ${body}`, 'resend');
  }

  return response.json();
}

export async function sendWithSendGrid({ apiKey, from, to, subject, html, text }) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new EmailProviderError(`SendGrid error: ${body}`, 'sendgrid');
  }

  return { sent: true };
}

export async function sendWithBrevo({ apiKey, from, to, subject, html, text }) {
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { email: from },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new EmailProviderError(`Brevo error: ${body}`, 'brevo');
  }

  return response.json();
}

export async function sendWithConsole({ to, subject, text }) {
  console.log('\n── Guest Invitation Email (dev) ──');
  console.log(`To:      ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(text);
  console.log('──────────────────────────────────\n');
  return { sent: true, dev: true };
}
