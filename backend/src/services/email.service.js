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

export async function sendSupplierLeadEmail(lead) {
  const notifyTo = process.env.SUPPLIER_LEADS_EMAIL || process.env.SMTP_USER || process.env.EMAIL_FROM;
  const productLines = (lead.products || [])
    .map((p) => `- ${p.name}${p.category ? ` (${p.category})` : ''}${p.description ? `: ${p.description}` : ''}`)
    .join('\n');
  const docs = (lead.documentsReady || []).join(', ') || 'None selected';
  const categories = (lead.categories || []).join(', ');

  // Confirmation to applicant
  await send({
    to: lead.email,
    subject: 'Lockseed supplier application received',
    text: `Hello ${lead.contactName},\n\nWe received your application for ${lead.companyName}. Our team will review it and follow up.\n\nProducts:\n${productLines}`,
    html: `<p>Hello ${lead.contactName},</p><p>We received your application for <b>${lead.companyName}</b>. Our team will review it and follow up.</p>`,
  });

  // Internal notify (if configured)
  if (notifyTo && !String(notifyTo).includes('yourdomain')) {
    await send({
      to: notifyTo,
      subject: `New supplier lead: ${lead.companyName}`,
      text: `Company: ${lead.companyName}\nContact: ${lead.contactName}\nEmail: ${lead.email}\nPhone: ${lead.phone}\nType: ${lead.supplierType}\nCategories: ${categories}\nDocs ready: ${docs}\n\nProducts:\n${productLines}\n\nMessage: ${lead.message || '-'}`,
      html: `<p><b>New supplier lead</b></p>
        <p>Company: ${lead.companyName}<br/>Contact: ${lead.contactName}<br/>Email: ${lead.email}<br/>Phone: ${lead.phone}<br/>Type: ${lead.supplierType}</p>
        <p>Categories: ${categories}<br/>Docs ready: ${docs}</p>
        <pre>${productLines}</pre>
        <p>${lead.message || ''}</p>`,
    });
  }
}
