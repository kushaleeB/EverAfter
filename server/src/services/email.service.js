import env from '../config/env.js';

/**
 * Email delivery stub. Replace with SendGrid, Resend, or AWS SES in production.
 */
export async function sendPasswordResetEmail(email, resetUrl) {
  if (!env.isProduction) {
    console.log('\n── Password Reset Email (dev) ──');
    console.log(`To:      ${email}`);
    console.log(`Reset:   ${resetUrl}`);
    console.log('─────────────────────────────────\n');
    return { sent: true, dev: true };
  }

  // Production: integrate your email provider here
  console.warn('[email] Password reset email not configured for production');
  return { sent: false };
}
