/**
 * LLB Real Estate - Fast Diagnostic Tool
 * Tests SMTP authentication and Nineteen Automation (n8n) webhook
 * Usage: node test-email.js [recipient_email]
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

const recipient = process.argv[2] || process.env.SMTP_USER || 'taskflow.notification@gmail.com';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '465', 10);
const user = process.env.SMTP_USER || 'taskflow.notification@gmail.com';
const pass = (process.env.SMTP_PASS || 'yjrmgzksmxdawbmo').replace(/\s+/g, '');
const from = process.env.SMTP_FROM || `"LLB Real Estate" <${user}>`;
const webhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/llb-registration';

console.log("==========================================================");
console.log("  LLB REAL ESTATE - SMTP & AUTOMATION DIAGNOSTIC");
console.log("==========================================================");
console.log(`SMTP Host:    ${host}:${port}`);
console.log(`SMTP User:    ${user}`);
console.log(`Recipient:    ${recipient}`);
console.log(`Webhook URL:  ${webhookUrl}`);
console.log("----------------------------------------------------------");

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass }
});

async function run() {
  // Test 1: Verify SMTP Connection
  try {
    console.log("1. Verifying SMTP mail credentials...");
    await transporter.verify();
    console.log("✓ SUCCESS: SMTP server authentication approved!");

    console.log(`\n2. Dispatching sample registration email to ${recipient}...`);
    const info = await transporter.sendMail({
      from,
      to: recipient,
      subject: "Welcome to LLB Real Estate — SMTP Diagnostic Test [Verified]",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 30px; background: #fff;">
          <div style="background: #000; color: #fff; padding: 15px 20px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">
            LLB REAL ESTATE &bull; CHENNAI LAND &amp; HOUSING
          </div>
          <h2 style="margin-top: 25px; color: #000;">Direct SMTP Email Setup Verified!</h2>
          <p style="color: #333; line-height: 1.6;">
            This email confirms that your SMTP mail settings are fully functional. Whenever someone registers on your website, their personalized property dossier will be automatically dispatched to them!
          </p>
          <div style="background: #f8f9fa; border: 1px solid #ddd; padding: 15px; margin: 20px 0; font-family: monospace; font-size: 13px;">
            <strong>Host:</strong> ${host}<br>
            <strong>Sender:</strong> ${from}<br>
            <strong>Recipient:</strong> ${recipient}<br>
            <strong>Timestamp:</strong> ${new Date().toISOString()}
          </div>
          <p style="font-size: 11px; color: #888;">&copy; 2026 LLB Real Estate Group. All rights reserved.</p>
        </div>
      `
    });
    console.log(`✓ EMAIL SENT! Message ID: ${info.messageId}`);
  } catch (err) {
    console.error("✗ SMTP ERROR:", err.message);
  }

  // Test 2: Trigger Nineteen Automation (n8n Webhook)
  try {
    console.log(`\n3. Testing Nineteen Automation Webhook (${webhookUrl})...`);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Diagnostic User",
        email: recipient,
        phone: "+91 98400 99999",
        propertyType: "Coastal Villa Plot",
        location: "ECR Beachfront",
        budget: "₹5.50 Cr",
        specificProperty: "Neelankarai Coastal Villa Plot"
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✓ SUCCESS: Nineteen Automation executed successfully! Response:`, data);
    } else {
      console.log(`! Note: Automation returned HTTP ${response.status}`);
    }
  } catch (err) {
    console.log(`! Note on Automation Webhook: ${err.message}`);
  }

  console.log("\n==========================================================");
  console.log("  DIAGNOSTIC TEST COMPLETE");
  console.log("==========================================================");
}

run();
