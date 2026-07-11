import nodemailer from 'nodemailer';

function transporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function send({ to, subject, html, text }) {
  const t = transporter();
  if (!t) {
    console.warn('[email] SMTP not configured —', subject, 'to', to);
    return;
  }
  await t.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
    text,
  });
}

export async function sendWelcomeEmail({ to, name, temporaryPassword }) {
  const appUrl = process.env.CLIENT_URL || 'http://localhost:3001';
  await send({
    to,
    subject: 'Welcome to Lockseed Supplies',
    text: `Hello ${name},\n\nEmail: ${to}\nPassword: ${temporaryPassword}\n\nLogin: ${appUrl}/auth`,
    html: `<p>Hello ${name},</p><p>Email: <b>${to}</b><br>Password: <b>${temporaryPassword}</b></p><p><a href="${appUrl}/auth">Sign in</a></p>`,
  });
}

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  await send({
    to,
    subject: 'Reset your Lockseed password',
    text: `Hello ${name},\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `<p>Hello ${name},</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour.</p>`,
  });
}

export async function sendQuotationEmail({ to, name, quotationId }) {
  await send({
    to,
    subject: `Quotation ${quotationId} received`,
    text: `Hello ${name}, your quote ${quotationId} was submitted.`,
    html: `<p>Hello ${name}, quote <b>${quotationId}</b> was submitted.</p>`,
  });
}
