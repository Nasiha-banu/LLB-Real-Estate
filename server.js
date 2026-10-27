/**
 * LLB Real Estate - Core Server
 * Serving Chennai Luxury Land & Housing with Nineteen Automation & SMTP
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const properties = require('./properties-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Multi-Page Website Navigation Routes
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});
app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});
app.get('/living-room', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'map.html'));
});
app.get('/properties', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'properties.html'));
});
app.get('/property-details', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'property-details.html'));
});

// Config Endpoint (Google Maps API Key & Environment)
app.get('/api/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || ''
  });
});

app.post('/api/config/google-maps-key', (req, res) => {
  const { apiKey } = req.body;
  if (typeof apiKey === 'string') {
    process.env.GOOGLE_MAPS_API_KEY = apiKey.trim();
    res.json({ success: true, googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY });
  } else {
    res.status(400).json({ success: false, message: 'Invalid API key format' });
  }
});

// Configure Direct SMTP Transporter (Fallback & Direct Verification for Vercel Serverless)
const SMTP_USER = (process.env.SMTP_USER || 'taskflow.notification@gmail.com').trim();
const SMTP_PASS = (process.env.SMTP_PASS || 'yjrmgzksmxdawbmo').replace(/\s+/g, '');
const SMTP_FROM = process.env.SMTP_FROM || `"LLB Real Estate Chennai" <${SMTP_USER}>`;

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  connectionTimeout: 8000,
  greetingTimeout: 8000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  }
});

// Helper function to build luxury 80% white / 20% black email HTML
function buildLuxuryEmailHtml({ fullName, email, phone, propertyType, specificProperty, budget, location, clientRef, notes }) {
  const currentYear = new Date().getFullYear();
  const formattedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to LLB Real Estate Chennai</title>
</head>
<body style="margin:0; padding:0; background-color:#FAFAFA; font-family:'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#FAFAFA; padding:40px 15px;">
    <tr>
      <td align="center">
        <!-- Container (80% White / 20% Black) -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color:#FFFFFF; border:2px solid #000000; max-width:600px; width:100%; box-shadow:0 12px 35px rgba(0,0,0,0.08);">
          
          <!-- 20% Black Header -->
          <tr>
            <td style="background-color:#000000; padding:32px 40px; color:#FFFFFF;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="background:#FFFFFF; color:#000000; font-family:monospace; font-weight:900; font-size:20px; padding:6px 16px; letter-spacing:2px; display:inline-block;">LLB</span>
                  </td>
                  <td align="right" style="color:#CCCCCC; font-size:11px; font-family:monospace; letter-spacing:1.5px; text-transform:uppercase;">
                    CHENNAI &bull; LAND &bull; HOUSING
                  </td>
                </tr>
              </table>
              <h1 style="color:#FFFFFF; font-size:22px; font-weight:700; margin:22px 0 6px 0; letter-spacing:-0.5px;">
                Client Registration Confirmed
              </h1>
              <p style="color:#CCCCCC; font-size:13px; margin:0; font-family:monospace;">
                Dossier: #${clientRef} &bull; TN RERA &amp; CMDA Compliant
              </p>
            </td>
          </tr>

          <!-- 80% White Content -->
          <tr>
            <td style="padding:40px; background-color:#FFFFFF; color:#111111;">
              <p style="font-size:16px; font-weight:700; margin:0 0 16px 0;">
                Dear ${fullName},
              </p>
              
              <p style="font-size:14px; line-height:22px; color:#333333; margin:0 0 24px 0;">
                Thank you for registering with <strong>LLB Real Estate</strong>. Your private acquisition profile has been authenticated in our Chennai land and residential network. All our listings feature clear Patta titles, CMDA / DTCP approvals, verified Survey Numbers, and strict TN RERA compliance.
              </p>

              <!-- Confidential Client Dossier Box -->
              <div style="border:2px solid #000000; padding:22px; background-color:#FAFAFA; margin-bottom:28px;">
                <p style="margin:0 0 12px 0; font-size:11px; font-family:monospace; font-weight:bold; letter-spacing:1.5px; border-bottom:1px solid #DDDDDD; padding-bottom:8px; text-transform:uppercase; color:#000000;">
                  CONFIDENTIAL CLIENT CRITERIA
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size:13px;">
                  <tr>
                    <td width="42%" style="color:#666666; font-family:monospace;">Reference Dossier:</td>
                    <td style="color:#000000; font-weight:700; font-family:monospace;">${clientRef}</td>
                  </tr>
                  <tr>
                    <td style="color:#666666; font-family:monospace;">Property Interest:</td>
                    <td style="color:#000000; font-weight:600;">${propertyType || 'Chennai Land & Housing'}</td>
                  </tr>
                  <tr>
                    <td style="color:#666666; font-family:monospace;">Target Location:</td>
                    <td style="color:#000000; font-weight:600;">${location || 'Chennai Metropolitan'}</td>
                  </tr>
                  <tr>
                    <td style="color:#666666; font-family:monospace;">Budget Allocation:</td>
                    <td style="color:#000000; font-weight:700;">${budget || 'Custom INR Allocation'}</td>
                  </tr>
                  <tr>
                    <td style="color:#666666; font-family:monospace;">Selected Property:</td>
                    <td style="color:#000000; font-weight:600;">${specificProperty || 'Chennai Prime Portfolio Inquiry'}</td>
                  </tr>
                  <tr>
                    <td style="color:#666666; font-family:monospace;">Contact Channel:</td>
                    <td style="color:#000000; font-weight:600;">${phone} (${email})</td>
                  </tr>
                  ${notes ? `<tr><td style="color:#666666; font-family:monospace;">Special Requirements:</td><td style="color:#333333;">${notes}</td></tr>` : ''}
                </table>
              </div>

              <!-- Acquisition Protocol -->
              <p style="font-size:12px; font-family:monospace; font-weight:700; letter-spacing:1px; margin:0 0 16px 0; text-transform:uppercase; color:#000000;">
                ACQUISITION PROTOCOL &amp; NEXT STEPS:
              </p>
              
              <ol style="font-size:13px; color:#333333; line-height:22px; padding-left:20px; margin:0 0 28px 0;">
                <li style="margin-bottom:8px;">
                  <strong>Chennai Legal Counsel Verification:</strong> Complete 30-year Encumbrance Certificate (EC), Patta passbook, Chitta, and CMDA approval copy dispatched.
                </li>
                <li style="margin-bottom:8px;">
                  <strong>Exclusive Off-Market Land &amp; Villa Catalog:</strong> Private access to unlisted prime plots in ECR, OMR IT corridor, Boat Club, Poes Garden, and Anna Nagar.
                </li>
                <li>
                  <strong>Private Site Inspections:</strong> Dedicated senior property manager accompaniment for boundary survey and registration guidance.
                </li>
              </ol>

              <!-- 20% Black Button -->
              <div style="text-align:center; margin:32px 0 20px 0;">
                <a href="http://localhost:3000" style="display:inline-block; background-color:#000000; color:#FFFFFF; text-decoration:none; font-size:13px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding:15px 36px; border:2px solid #000000;">
                  Browse Chennai Portfolio &rarr;
                </a>
              </div>

              <div style="margin-top:32px; padding-top:18px; border-top:1px solid #EEEEEE; font-size:12px; color:#666666; line-height:18px;">
                <p style="margin:0;">
                  Direct Desk: <strong style="color:#000000;">+91 44 2833 4455</strong> | <strong style="color:#000000;">taskflow.notification@gmail.com</strong><br>
                  Head Office: LLB Towers, Nungambakkam High Road, Chennai 600034.<br>
                  Automated dispatch generated on ${formattedDate} by LLB System.
                </p>
              </div>
            </td>
          </tr>

          <!-- 20% Black Footer -->
          <tr>
            <td style="background-color:#000000; padding:24px 40px; text-align:center; color:#CCCCCC; font-size:11px; font-family:monospace;">
              <p style="margin:0 0 4px 0; color:#FFFFFF; font-weight:bold; letter-spacing:1px;">
                LLB REAL ESTATE &bull; CHENNAI LAND &amp; HOUSING
              </p>
              <p style="margin:0 0 4px 0; color:#888888;">
                Boat Club &bull; Poes Garden &bull; ECR Beachfront &bull; OMR Corridor &bull; Anna Nagar &bull; Adyar
              </p>
              <p style="margin:0; color:#555555;">
                &copy; ${currentYear} LLB Real Estate. All rights reserved. TN RERA Registered.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Get All Properties (Chennai Land & Housing)
app.get('/api/properties', (req, res) => {
  const { category, search, minPrice, maxPrice } = req.query;
  let filtered = [...properties];

  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.areaZone.toLowerCase().includes(q) ||
      p.reraNumber.toLowerCase().includes(q) ||
      p.surveyNumber.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    properties: filtered
  });
});

// 2. Get Single Property by ID
app.get('/api/properties/:id', (req, res) => {
  const prop = properties.find(p => p.id === req.params.id);
  if (!prop) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }
  res.json({ success: true, property: prop });
});

// 3. User Registration Form Endpoint
// Triggers Nineteen Automation (n8n Webhook) + Guaranteed Direct SMTP Fallback
app.post('/api/register', async (req, res) => {
  const { fullName, email, phone, propertyType, specificProperty, budget, location, notes } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both your Full Name and Email Address.'
    });
  }

  // Generate unique Chennai Client Reference Number
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const clientRef = `LLB-CHN-${randomNum}`;
  const timestamp = new Date().toISOString();

  const registrationData = {
    fullName,
    email,
    phone: phone || 'Not provided',
    propertyType: propertyType || 'Chennai Land / Housing',
    specificProperty: specificProperty || 'General Portfolio Inquiry',
    budget: budget || 'Flexible Allocation',
    location: location || 'Chennai Prime Locations',
    notes: notes || '',
    clientRef,
    timestamp
  };

  console.log(`\n==========================================================`);
  console.log(`[LLB REGISTRATION] New Client Dossier: ${clientRef}`);
  console.log(`Name:     ${fullName}`);
  console.log(`Email:    ${email}`);
  console.log(`Phone:    ${phone}`);
  console.log(`Property: ${specificProperty} (${propertyType})`);
  console.log(`Location: ${location} | Budget: ${budget}`);
  console.log(`==========================================================`);

  let automationStatus = { triggered: false, mode: 'direct-smtp', error: null };
  let emailDispatched = false;

  // Step 1: Guaranteed Direct SMTP Confirmation Email Dispatch FIRST (Rapid & Reliable on Vercel)
  try {
    console.log(`[LLB REGISTRATION] Dispatching confirmation email directly via authenticated SMTP to ${email}...`);
    const emailHtml = buildLuxuryEmailHtml(registrationData);
    const info = await mailTransporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: `Welcome to LLB Real Estate Chennai — Registration Verified [Ref: ${clientRef}]`,
      html: emailHtml
    });
    console.log(`✓ Direct SMTP Email successfully dispatched! Message ID: ${info.messageId}`);
    emailDispatched = true;
    automationStatus.smtpDirect = true;
    automationStatus.messageId = info.messageId;
  } catch (smtpErr) {
    console.error(`Direct SMTP Error:`, smtpErr.message);
    automationStatus.smtpError = smtpErr.message;
  }

  // Step 2: Trigger Nineteen Automation (n8n Webhook) asynchronously without blocking response
  const customWebhook = process.env.N8N_WEBHOOK_URL;
  const isVercel = !!process.env.VERCEL;

  // Avoid hanging on localhost:5678 if deployed on Vercel
  if (customWebhook || !isVercel) {
    const webhookUrl = customWebhook || 'http://localhost:5678/webhook/llb-registration';
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
      signal: AbortSignal.timeout(3000)
    }).then(async (whRes) => {
      if (whRes.ok) {
        console.log(`✓ Nineteen Automation webhook successfully sent to ${webhookUrl}`);
      } else {
        console.warn(`Nineteen Automation webhook status: ${whRes.status}`);
      }
    }).catch((whErr) => {
      console.warn(`Nineteen Automation non-blocking note: ${whErr.message}`);
    });
  }

  return res.json({
    success: true,
    message: 'Registration successfully received and processed!',
    clientRef,
    recipient: email,
    automation: automationStatus,
    emailDispatched,
    timestamp
  });
});

// 4. Complimentary Luxury Cab Booking for Site Inspection
app.post('/api/book-cab', async (req, res) => {
  const { fullName, phone, email, pickupAddress, propertyTarget, inspectionDate, inspectionTime, vehicleClass, notes } = req.body;

  if (!fullName || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both your Full Name and Contact Phone Number.'
    });
  }

  const cabRef = `LLB-CAB-${Math.floor(10000 + Math.random() * 90000)}`;
  const timestamp = new Date().toISOString();

  console.log(`\n==========================================================`);
  console.log(`[LLB CAB BOOKING] Free Chauffeur Site Inspection: ${cabRef}`);
  console.log(`Name:        ${fullName}`);
  console.log(`Phone:       ${phone}`);
  console.log(`Email:       ${email || 'N/A'}`);
  console.log(`Pickup:      ${pickupAddress || 'Chennai Central / Airport'}`);
  console.log(`Destination: ${propertyTarget || 'Chennai Prime Estates'}`);
  console.log(`Date & Time: ${inspectionDate || 'Immediate'} at ${inspectionTime || 'Flexible'}`);
  console.log(`Vehicle:     ${vehicleClass || 'Mercedes-Benz / BMW / HyCross'}`);
  console.log(`==========================================================\n`);

  let emailDispatched = false;

  // Dispatch confirmation email if email was provided
  if (email && email.includes('@')) {
    try {
      const emailHtml = `
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#FAFAFA; font-family:'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width:600px; margin:30px auto; background:#FFFFFF; border:2px solid #000000; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
    <div style="background:#000000; color:#FFFFFF; padding:24px 30px; display:flex; justify-content:space-between; align-items:center;">
      <h2 style="margin:0; font-size:18px; letter-spacing:2px; font-family:monospace;">LLB REAL ESTATE &bull; CHENNAI</h2>
      <span style="background:#FFFFFF; color:#000000; font-size:11px; padding:4px 10px; font-weight:bold; font-family:monospace;">FREE CAB BOOKED</span>
    </div>
    <div style="padding:32px 30px;">
      <h3 style="margin-top:0; font-size:20px; color:#000000;">Complimentary Luxury Cab Confirmed</h3>
      <p style="color:#444444; font-size:14px; line-height:1.6;">
        Dear <strong>${fullName}</strong>,<br>
        Your complimentary private chauffeur-driven luxury site inspection cab has been reserved with LLB Real Estate.
      </p>

      <div style="background:#F4F4F4; border-left:4px solid #000000; padding:16px 20px; margin:20px 0; font-size:13px; font-family:monospace; line-height:1.8;">
        <strong>CAB BOOKING REF:</strong> ${cabRef}<br>
        <strong>PASSENGER:</strong> ${fullName} (${phone})<br>
        <strong>PICKUP LOCATION:</strong> ${pickupAddress || 'Chennai Designated Address'}<br>
        <strong>DESTINATION PROPERTY:</strong> ${propertyTarget || 'Selected Prime Property'}<br>
        <strong>SCHEDULED INSPECTION:</strong> ${inspectionDate || 'Upcoming'} at ${inspectionTime || 'Morning'}<br>
        <strong>VEHICLE CLASS:</strong> ${vehicleClass || 'Mercedes-Benz E-Class / BMW / HyCross VIP'}<br>
        <strong>SERVICE FEE:</strong> ₹0 (100% Free VIP Courtesy)
      </div>

      <p style="color:#555555; font-size:13px; line-height:1.6;">
        Your designated chauffeur will contact you 30 minutes prior to pickup. For any schedule adjustments, please quote your reference <strong>${cabRef}</strong>.
      </p>
    </div>
    <div style="background:#111111; color:#888888; padding:16px 30px; font-size:11px; font-family:monospace; text-align:center;">
      &copy; 2026 LLB Real Estate Chennai &bull; TN RERA Certified &bull; 24/7 VIP Concierge
    </div>
  </div>
</body>
</html>
      `;

      await mailTransporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: `Confirmed: Free Luxury Cab for Site Inspection [Ref: ${cabRef}] — LLB Real Estate`,
        html: emailHtml
      });
      emailDispatched = true;
      console.log(`✓ Cab Confirmation Email dispatched to ${email}!`);
    } catch (err) {
      console.warn(`Cab email dispatch note:`, err.message);
    }
  }

  return res.json({
    success: true,
    message: 'Free luxury site inspection cab successfully reserved!',
    cabRef,
    recipient: email || phone,
    emailDispatched,
    pickupAddress,
    propertyTarget,
    inspectionDate,
    inspectionTime,
    vehicleClass,
    timestamp
  });
});

// 5. Diagnostic SMTP Test Endpoint (Supports both GET and POST for instant verification in browser)
app.all('/api/test-email', async (req, res) => {
  const recipient = req.query.email || req.body?.email || SMTP_USER;
  try {
    await mailTransporter.verify();
    const info = await mailTransporter.sendMail({
      from: SMTP_FROM,
      to: recipient,
      subject: `LLB Real Estate — SMTP Verification Test [Operational]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; border:2px solid #000; padding:30px; background:#fff;">
          <div style="background:#000; color:#fff; padding:15px; font-weight:bold; letter-spacing:2px; font-family:monospace;">
            LLB REAL ESTATE &bull; CHENNAI
          </div>
          <h2 style="color:#000; margin-top:20px;">SMTP Mail Dispatch Fully Operational</h2>
          <p style="color:#333; line-height:1.6;">
            Your email configuration is fully operational on Vercel Serverless. Any client who registers on your LLB Real Estate website will instantly receive their personalized Chennai property dossier.
          </p>
          <div style="background:#f8f9fa; border:1px solid #000; padding:12px; margin:15px 0; font-family:monospace; font-size:13px;">
            Service: Gmail Authenticated SMTP<br>
            Sender: ${SMTP_FROM}<br>
            Recipient: ${recipient}<br>
            Platform: ${process.env.VERCEL ? 'Vercel Serverless Production' : 'Local Node Server'}<br>
            Timestamp: ${new Date().toISOString()}
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: `Test email sent successfully to ${recipient}`,
      messageId: info.messageId,
      sender: SMTP_FROM,
      recipient,
      platform: process.env.VERCEL ? 'Vercel Serverless' : 'Local Node Server'
    });
  } catch (err) {
    console.error('SMTP Test Error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message,
      sender: SMTP_FROM,
      recipient
    });
  }
});

// 6. Production Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'LLB Real Estate Chennai API',
    platform: process.env.VERCEL ? 'Vercel Serverless' : 'Local Node Server',
    smtpConfigured: !!SMTP_USER && !!SMTP_PASS,
    smtpUser: SMTP_USER,
    timestamp: new Date().toISOString()
  });
});

// Start Express Server (Runs locally; exported for Vercel Serverless)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n==========================================================`);
    console.log(`  LLB REAL ESTATE - CHENNAI LUXURY PORTAL`);
    console.log(`==========================================================`);
    console.log(`Website URL:           http://localhost:${PORT}`);
    console.log(`Properties API:        http://localhost:${PORT}/api/properties`);
    console.log(`Registration API:      http://localhost:${PORT}/api/register`);
    console.log(`SMTP Sender:           ${SMTP_FROM}`);
    console.log(`Automation Webhook:    ${process.env.N8N_WEBHOOK_URL || 'Disabled on Vercel'}`);
    console.log(`==========================================================\n`);
  });
}

module.exports = app;
