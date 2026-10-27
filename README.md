# LLB REAL ESTATE — CHENNAI LUXURY HOMES & LAND

> **Brand Aesthetic:** Ultra-Luxury Midnight Obsidian & 24K Royal Gold  
> **Jurisdiction:** Chennai Metropolitan Area (TN RERA, CMDA, DTCP Approved)  
> **Valuation:** Indian Currency (INR ₹) — Transparent Government Guideline vs Market Values  
> **3D Navigation:** Realistic First-Person Road-Level 3D Navigation with Smooth Curve & Turn Interpolation  
> **Automation:** Automated Client Registration with Nineteen Automation (n8n) & Direct SMTP Dossier Delivery  

---

## 1. Overview

LLB Real Estate is Chennai's premier private acquisitions advisory representing high-value land parcels, coastal beachfront acreage, and luxury residential estates:
- **East Coast Road (ECR):** Beachfront land parcels in Neelankarai & Uthandi, modern designer villas in Akkarai
- **Boat Club Road & Poes Garden:** Ultra-HNI residential land and colonial heritage residences
- **Old Mahabalipuram Road (OMR):** IT Corridor high-density development plots in Sholinganallur
- **Central Chennai:** Prime residential plots in Anna Nagar West Extension, duplex sky penthouses in Chetpet
- **South & West Corridors:** Coastal villas in Besant Nagar & Adyar, smart community villas in Porur, and grand residences in Velachery
- **India Prime Extensions:** Architectural seafront penthouses in Worli Sea Face (Mumbai) & tech corridors in Whitefield (Bangalore)

---

## 2. Key Features

- **Realistic 3D First-Person Road Navigation:**
  - Immersive forward-facing, road-level 3D driving camera following authentic Chennai road geometries.
  - Smooth camera pitch, banking, heading calculations, and turning transitions along genuine routes.
  - Interactive destination arrival dossier with exact plot coordinates, Google Maps distance calculator, and complimentary chauffeur cab booking.
- **Ultra-Luxury Midnight Obsidian & 24K Gold Design:**
  - High-contrast, radiant typography and iconography for 100% legibility in both desktop and mobile viewports.
  - Responsive across all mobile devices (320px, 375px, 414px) and desktop screens (1024px, 1280px+).
  - Dedicated, zero-overlap action rows for every property card.
- **Comprehensive Legal Transparency for Every Plot:**
  - Official Tamil Nadu RERA Registration Numbers (`TN/01/Building/...`, `TN/01/Layout/...`)
  - CMDA & DTCP Sanctions
  - Computerized Revenue Patta Passbook Lineage
  - Town Survey (T.S.) Numbers & SRO Jurisdictions
  - 35-Year Encumbrance-Free Title Audits
- **Automated Client Dossier Dispatch:**
  - Automated SMTP delivery of confidential plot dossiers with instant survey numbers, Patta records, and TN RERA documents.
  - Nineteen Automation (n8n) webhook integration with fallback SMTP delivery.

---

## 3. Technology Stack

- **Backend:** Node.js, Express, Cors, Dotenv, Nodemailer (Vercel Serverless Ready)
- **Frontend:** Vanilla HTML5, High-Contrast Modern CSS, Modular ES6 JavaScript
- **Mapping & Routing:** MapLibre GL, Leaflet, OpenRouteService & OSRM Routing Engines
- **Deployment:** Vercel Serverless Deployment (`vercel.json`) & GitHub Actions

---

## 4. Quick Start & Deployment

### Local Development:
```bash
npm install
npm start
```
The application will launch locally at: **http://localhost:3000**

### Deploying to Vercel:
1. Import the repository directly in the [Vercel Dashboard](https://vercel.com/new).
2. Configure environment variables in Vercel Settings:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `465`
   - `SMTP_USER`: `taskflow.notification@gmail.com`
   - `SMTP_PASS`: Your Gmail App Password
   - `SMTP_FROM`: `LLB Real Estate Chennai <taskflow.notification@gmail.com>`
3. Click **Deploy**. Vercel will automatically build the serverless functions via `vercel.json` and serve the static assets worldwide.

---

## 5. Repository Structure

```
llb-real-estate/
├── vercel.json           # Vercel deployment configuration
├── .gitignore            # Git exclusion rules
├── .env.example          # Sample environment variables
├── package.json          # Node.js dependencies & scripts
├── properties-data.js    # Verified catalog of Chennai properties (RERA, Patta, INR)
├── server.js             # Express API & Vercel serverless entry point
└── public/
    ├── index.html        # Main luxury landing page & featured residences
    ├── map.html          # Interactive 3D first-person road navigation map
    ├── properties.html   # Full 14-property collection & filter engine
    ├── property-details.html # Detailed property gallery & legal scrutiny view
    ├── about.html        # Fiduciary standards & due diligence practice
    ├── styles.css        # Responsive stylesheet
    ├── app.js            # Frontend application logic & modals
    └── map-engine.js     # 3D road navigation camera animation engine
```
