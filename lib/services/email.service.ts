import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getFromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@lockseed.com';
}

async function sendMail(options: { to: string; subject: string; html: string; text: string }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[email] SMTP not configured — skipping send to', options.to);
    console.warn('[email] Subject:', options.subject);
    return;
  }

  await transporter.sendMail({
    from: getFromAddress(),
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendWelcomeEmail(input: {
  to: string;
  name: string;
  temporaryPassword: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  await sendMail({
    to: input.to,
    subject: 'Welcome to Lockseed Supplies',
    text: `Hello ${input.name},\n\nYour Lockseed account has been created.\n\nEmail: ${input.to}\nTemporary password: ${input.temporaryPassword}\n\nSign in at ${appUrl}/auth and change your password.\n\nRegards,\nLockseed Supplies`,
    html: `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #16231C;">
        <h2 style="color: #1F4D3A;">Welcome to Lockseed Supplies</h2>
        <p>Hello ${input.name},</p>
        <p>Your account was created when you submitted a quote request.</p>
        <div style="background: #F1F3EC; border: 1px solid #D7DCCE; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${input.to}</p>
          <p style="margin: 0;"><strong>Temporary password:</strong> <code>${input.temporaryPassword}</code></p>
        </div>
        <p><a href="${appUrl}/auth" style="background: #f36b14; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Sign in to your dashboard</a></p>
        <p style="color: #4C5A50; font-size: 14px;">Please change your password after signing in.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(input: { to: string; name: string; resetUrl: string }) {
  await sendMail({
    to: input.to,
    subject: 'Reset your Lockseed password',
    text: `Hello ${input.name},\n\nReset your password: ${input.resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #16231C;">
        <h2 style="color: #1F4D3A;">Password reset</h2>
        <p>Hello ${input.name},</p>
        <p>Click the button below to reset your password. This link expires in 1 hour.</p>
        <p><a href="${input.resetUrl}" style="background: #f36b14; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset password</a></p>
      </div>
    `,
  });
}

export async function sendQuotationCreatedEmail(input: {
  to: string;
  name: string;
  quotationId: string;
}) {
  await sendMail({
    to: input.to,
    subject: `Quotation ${input.quotationId} received`,
    text: `Hello ${input.name},\n\nYour quotation request ${input.quotationId} has been submitted to Lockseed Supplies.`,
    html: `
      <div style="font-family: Montserrat, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #16231C;">
        <h2 style="color: #1F4D3A;">Quotation submitted</h2>
        <p>Hello ${input.name},</p>
        <p>Your quote request <strong>${input.quotationId}</strong> has been received. Track it in your dashboard.</p>
      </div>
    `,
  });
}
