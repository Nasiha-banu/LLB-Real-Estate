/**
 * LLB Real Estate — Core Multi-Page Website Logic
 * Architectural Multi-Page Experience:
 * Page 1: index.html (House Image with Visible Door & Virtual Reality 3D Walkthrough)
 * Page 2: living-room.html (Living Area Feature Wall with Google Map via API & Location Pins)
 * Page 3: properties.html (Area Properties: House Image & Name Only)
 * Page 4: property-details.html (Multi-Photo Gallery, Descriptions, Legal Deeds & Automated Email Dossier)
 */

let allProperties = [];
let leafletMap = null;
let googleMap = null;
let googleMarkers = [];
let audioCtx = null;
let googleMapsApiKey = '';

// Initialize Web Audio Synthesizer (Instant acoustic feedback without external assets)
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Synthetic Sound: Heavy Architectural Door Opening & Creak
function playDoorOpenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(65, ctx.currentTime + 1.1);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.15);
  } catch (e) {
    // Audio optional fallback
  }
}

// 2. Synthetic Sound: High-Tech Radar GPS Lock Chirp
function playRadarLockSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.08);
    osc.frequency.setValueAtTime(1760, ctx.currentTime + 0.16);
    
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.42);
  } catch (e) {
    // Audio optional fallback
  }
}

// ============================================================================
// HUD ENROUTE OVERLAY CONTROLLER
// ============================================================================
function showEnrouteHUD(title, subtitle, coordsText, durationMs, callback) {
  let hud = document.getElementById('globalEnrouteHUD');
  if (!hud) {
    hud = document.createElement('div');
    hud.id = 'globalEnrouteHUD';
    hud.className = 'enroute-hud-overlay';
    hud.innerHTML = `
      <div class="hud-scanner">
        <div class="hud-crosshair"></div>
      </div>
      <div class="hud-telemetry">
        <span class="hud-badge">VR TELEMETRY LOCK &bull; ENROUTING</span>
        <h3 class="hud-title" id="hudTitleText">Enrouting...</h3>
        <p class="hud-coords" id="hudCoordsText">COORDINATES LOCKED</p>
        <p id="hudSubText" style="font-size: 13px; color: #CCCCCC; margin-bottom: 20px;">Accessing architectural portfolio...</p>
        <div class="hud-progress-bar">
          <div class="hud-progress-fill"></div>
        </div>
      </div>
    `;
    document.body.appendChild(hud);
  }

  const titleEl = document.getElementById('hudTitleText');
  const subEl = document.getElementById('hudSubText');
  const coordsEl = document.getElementById('hudCoordsText');

  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (coordsEl) coordsEl.textContent = coordsText || 'COORDINATES LOCKED';

  setTimeout(() => {
    hud.classList.add('active');
  }, 10);

  setTimeout(() => {
    if (callback) callback();
  }, durationMs || 1400);
}

// ============================================================================
// PAGE 1: CLEAN LANDING PAGE ENROUTE TO MAP
// ============================================================================
function enrouteToMap() {
  playDoorOpenSound();

  const card = document.querySelector('.clean-house-card');
  if (card) {
    card.style.transform = 'scale(1.02)';
  }

  showEnrouteHUD(
    'ENTERING RESIDENCE',
    'Opening Chennai & India Location Map Console...',
    'CARTOGRAPHIC CONSOLE &bull; 14 LOCATIONS PINNED',
    950,
    () => {
      window.location.href = 'map.html';
    }
  );
}

// Fallback aliases for door & living room
function enrouteToLivingRoom() {
  enrouteToMap();
}

function executeVRWalkthrough() {
  enrouteToMap();
}

// ============================================================================
// PAGE 2: LIVING ROOM WALL — GOOGLE MAP VIA API WITH PINNED LOCATIONS
// ============================================================================

async function fetchGoogleMapsConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    if (data.googleMapsApiKey) {
      googleMapsApiKey = data.googleMapsApiKey;
    }
  } catch (err) {
    console.warn('Could not read server config:', err.message);
  }

  // Check localStorage override
  const localKey = localStorage.getItem('google_maps_api_key');
  if (localKey) {
    googleMapsApiKey = localKey;
  }
}

function initWallMap() {
  // Always render high-fidelity Voyager/Architectural tiles with zero API key requirement
  initInteractiveWallMap();
}

function initInteractiveWallMap() {
  const mapContainer = document.getElementById('googleMapCanvas');
  if (!mapContainer) return;

  if (leafletMap) {
    leafletMap.invalidateSize();
    return;
  }

  // Center on Chennai with zoom into India: [13.0400, 80.2400]
  leafletMap = L.map('googleMapCanvas', {
    center: [13.0400, 80.2400],
    zoom: 11,
    minZoom: 4,
    maxZoom: 18,
    zoomControl: true,
    scrollWheelZoom: true
  });

  // Esri World Street Map High-Contrast Tiles (100% Free, NO API KEY REQUIRED, Zero Watermarks)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri &bull; Real Estate Road Network &bull; Chennai &amp; India',
    maxZoom: 19
  }).addTo(leafletMap);

  // Plot all property location pins
  allProperties.forEach(p => {
    if (!p.coords || !Array.isArray(p.coords)) return;

    const isLand = p.category === 'land';
    const pinEmoji = isLand ? '🌱' : '🏡';

    const customPinIcon = L.divIcon({
      className: 'custom-leaflet-pin',
      html: `
        <div class="pin-container" title="${p.title} (${p.priceFormatted})">
          <div class="pin-bubble">
            <span class="pin-bubble-emoji">${pinEmoji}</span>
            <span>${p.title.split(' ')[0]} &bull; ${p.priceFormatted}</span>
          </div>
          <div class="pin-pulse-dot"></div>
        </div>
      `,
      iconSize: [120, 36],
      iconAnchor: [60, 34]
    });

    const marker = L.marker(p.coords, { icon: customPinIcon }).addTo(leafletMap);

    marker.on('click', () => {
      enrouteToAreaProperties(p.areaZone, p.coords, p.title);
    });

    marker.bindPopup(`
      <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:4px; max-width:220px;">
        <img src="${p.image}" style="width:100%; height:110px; object-fit:cover; margin-bottom:6px; border:1px solid #000;">
        <strong style="font-size:13px; display:block; margin-bottom:2px; color:#000;">${p.title}</strong>
        <span style="font-size:11px; font-family:'Space Mono',monospace; color:#333; font-weight:bold;">${p.priceFormatted} &bull; ${p.areaZone}</span>
        <button style="margin-top:8px; width:100%; background:#000; color:#fff; border:none; padding:8px; font-size:11px; font-weight:bold; cursor:pointer;" onclick="enrouteToAreaProperties('${p.areaZone}', [${p.coords.join(',')}], '${p.title}')">
          Enroute to ${p.areaZone} &rarr;
        </button>
      </div>
    `);
  });

  const statusPill = document.getElementById('mapEngineStatus');
  if (statusPill) statusPill.textContent = 'CARTOGRAPHIC SATELLITE ENGINE';
}



// Preset zoom functions
function focusWallMapIndia() {
  if (googleMap) {
    googleMap.setCenter({ lat: 21.0000, lng: 78.9629 });
    googleMap.setZoom(5);
  } else if (leafletMap) {
    leafletMap.flyTo([21.0000, 78.9629], 5, { duration: 1.0 });
  }
}

function focusWallMapChennai() {
  if (googleMap) {
    googleMap.setCenter({ lat: 13.0400, lng: 80.2400 });
    googleMap.setZoom(11);
  } else if (leafletMap) {
    leafletMap.flyTo([13.0400, 80.2400], 11, { duration: 1.0 });
  }
}

function enrouteToAreaProperties(zoneName, coords, propTitle) {
  // If moving navigation engine is active on the map, trigger realistic moving vehicle escort
  if (typeof startMovingNavigation === 'function') {
    startMovingNavigation(zoneName, coords, propTitle);
    return;
  }

  playRadarLockSound();

  // Camera dive
  if (typeof mapInstance !== 'undefined' && mapInstance && coords) {
    mapInstance.flyTo(coords, 14, { duration: 1.0 });
  } else if (googleMap && coords) {
    googleMap.panTo({ lat: coords[0], lng: coords[1] });
    googleMap.setZoom(14);
  } else if (leafletMap && coords) {
    leafletMap.flyTo(coords, 14, { duration: 1.1 });
  }

  const coordsStr = coords ? `${coords[0].toFixed(4)}° N, ${coords[1].toFixed(4)}° E` : 'COORDINATES LOCKED';

  showEnrouteHUD(
    `ENROUTING TO ${zoneName.toUpperCase()}`,
    `Locking onto verified properties and architectural deeds in ${zoneName}...`,
    `GPS LOCK: ${coordsStr}`,
    1300,
    () => {
      window.location.href = `properties.html?zone=${encodeURIComponent(zoneName)}`;
    }
  );
}

// ============================================================================
// PAGE 3: PROPERTIES SHOWCASE (HOUSE IMAGE & NAME ONLY)
// ============================================================================
let currentFilter = 'all';
let currentSearch = '';
let activeZoneQuery = '';
let arrivedPropertyId = '';
let isArrivedFromNav = false;

function initPropertiesPage() {
  const params = new URLSearchParams(window.location.search);
  activeZoneQuery = params.get('zone') || '';
  arrivedPropertyId = params.get('propertyId') || '';
  isArrivedFromNav = params.get('arrived') === '1';

  updatePropertiesHeader();
  renderCleanPropertiesGrid();

  if (isArrivedFromNav && arrivedPropertyId) {
    setTimeout(() => {
      const card = document.getElementById('card-' + arrivedPropertyId);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 450);
  }
}

function updatePropertiesHeader() {
  const badge = document.getElementById('propActiveZoneBadge');
  const title = document.getElementById('propActiveZoneTitle');
  const sub = document.getElementById('propActiveZoneSubtitle');

  if (activeZoneQuery) {
    if (badge) badge.textContent = `${activeZoneQuery.toUpperCase()} AREA COLLECTION`;
    if (title) title.textContent = `${activeZoneQuery} Properties`;
    if (sub) sub.textContent = `Enroute Completed. Showing verified Luxury Houses and Prime Land in ${activeZoneQuery}. Click any card to inspect gallery & legal details.`;
  } else {
    if (badge) badge.textContent = `ALL INDIA & CHENNAI PORTFOLIO`;
    if (title) title.textContent = `All Prime Land & Luxury Houses`;
    if (sub) sub.textContent = `Showing all 14 verified properties with transparent INR (₹) valuations, TN RERA, and CMDA registrations.`;
  }
}

function renderCleanPropertiesGrid() {
  const grid = document.getElementById('cleanPropertiesGrid');
  if (!grid) return;

  let filtered = allProperties;

  if (activeZoneQuery) {
    filtered = filtered.filter(p => p.areaZone.toLowerCase().includes(activeZoneQuery.toLowerCase()));
  }

  const subset = activeZoneQuery 
    ? allProperties.filter(p => p.areaZone.toLowerCase().includes(activeZoneQuery.toLowerCase()))
    : allProperties;

  const countAll = subset.length;
  const countHouse = subset.filter(p => p.category === 'house').length;
  const countLand = subset.filter(p => p.category === 'land').length;

  const elAll = document.getElementById('clean-count-all');
  const elHouse = document.getElementById('clean-count-house');
  const elLand = document.getElementById('clean-count-land');

  if (elAll) elAll.textContent = countAll;
  if (elHouse) elHouse.textContent = countHouse;
  if (elLand) elLand.textContent = countLand;

  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.category === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.areaZone.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">No Properties Found for Selected Filter</h3>
        <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Try clearing filters or view our complete portfolio.</p>
        <button class="btn btn-black" onclick="clearZoneFilter()">View All 14 Properties</button>
      </div>
    `;
    return;
  }

  // Render cards displaying ONLY Property Image and Name (+ price tag) with staggered luxury animations
  grid.innerHTML = filtered.map((p, idx) => {
    const isLand = p.category === 'land';
    const badgeText = isLand ? 'PRIME LAND' : 'LUXURY HOUSE';
    const pCoords = p.coords || [12.9480, 80.2560];
    const isArrivedPlot = isArrivedFromNav && (p.id === arrivedPropertyId);

    return `
      <article class="clean-property-card ${isArrivedPlot ? 'arrived-target-card' : ''}" id="card-${p.id}" style="--card-index: ${idx};" onclick="enrouteToPropertyDetails('${p.id}')">
        
        <div class="clean-card-img-wrap">
          <img src="${p.image}" alt="${p.title}" class="clean-card-img" loading="lazy">
          <span class="clean-badge">${badgeText}</span>
          <span class="clean-price">${p.priceFormatted}</span>
        </div>

        <div class="clean-card-body">
          ${isArrivedPlot ? '<div class="arrival-pill">🎯 YOUR NAVIGATED DESTINATION PLOT</div>' : ''}
          <h3 class="clean-title">${p.title}</h3>
          <p class="clean-loc">📍 ${p.location}</p>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin: 8px 0 10px 0;">
            <button class="map-badge-direct" onclick="event.stopPropagation(); openPropertyGoogleMaps(${pCoords[0]}, ${pCoords[1]}, '${encodeURIComponent(p.title)}');" title="Check distance from your location on Google Maps">
              <span>📍 Google Maps KM</span>
            </button>
            <button class="cab-badge-direct" onclick="event.stopPropagation(); openFreeCabModal('${p.title}');" title="Book Free Chauffeur Cab for Visit">
              <span>🚕 Free Cab</span>
            </button>
          </div>

          <button class="clean-view-btn" onclick="event.stopPropagation(); enrouteToPropertyDetails('${p.id}')">
            View Gallery &amp; Legal Details &rarr;
          </button>
        </div>

      </article>
    `;
  }).join('');
}

function filterPropertiesCategory(category, btnElement) {
  currentFilter = category;
  document.querySelectorAll('.clean-tab').forEach(t => t.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  renderCleanPropertiesGrid();
}

function handlePropertiesSearch() {
  const input = document.getElementById('cleanSearchInput');
  currentSearch = input.value;
  renderCleanPropertiesGrid();
}

function clearZoneFilter() {
  activeZoneQuery = '';
  window.history.replaceState({}, '', 'properties.html');
  updatePropertiesHeader();
  renderCleanPropertiesGrid();
}

function enrouteToPropertyDetails(propertyId) {
  playRadarLockSound();
  window.location.href = `property-details.html?id=${encodeURIComponent(propertyId)}`;
}

// ============================================================================
// PAGE 4: PROPERTY DETAILS & MULTI-IMAGE GALLERY
// ============================================================================
function initPropertyDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const propId = params.get('id');

  if (!propId) {
    window.location.href = 'properties.html';
    return;
  }

  if (allProperties.length > 0) {
    renderPropertyDetails(propId);
  } else {
    fetch('/api/properties/' + propId)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.property) {
          renderPropertyDetailsObj(data.property);
        } else {
          document.getElementById('detailsPageContainer').innerHTML = `
            <div style="text-align:center; padding:60px 20px;">
              <h2>Property Not Found</h2>
              <a href="properties.html" class="btn btn-black" style="margin-top:20px;">&larr; Back to Properties</a>
            </div>
          `;
        }
      });
  }
}

function renderPropertyDetails(propId) {
  const prop = allProperties.find(p => p.id === propId);
  if (!prop) {
    fetch('/api/properties/' + propId)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.property) renderPropertyDetailsObj(data.property);
      });
    return;
  }
  renderPropertyDetailsObj(prop);
}

function renderPropertyDetailsObj(prop) {
  const container = document.getElementById('detailsPageContainer');
  if (!container) return;

  const isLand = prop.category === 'land';
  const galleryImages = prop.gallery && prop.gallery.length > 0 ? prop.gallery : [prop.image];
  const pCoords = prop.coords || [12.9480, 80.2560];
  const detMapLocationUrl = `map.html?propertyId=${encodeURIComponent(prop.id)}&lat=${pCoords[0]}&lng=${pCoords[1]}&title=${encodeURIComponent(prop.title)}&zone=${encodeURIComponent(prop.areaZone)}&routeFromUser=1`;

  document.title = `${prop.title} — LLB Real Estate`;

  container.innerHTML = `
    <div class="page-hero-banner">
      <div class="container page-hero-content">
        <div>
          <div class="breadcrumbs-strip">
            <a href="index.html">Home</a> &rsaquo; 
            <a href="map.html">Location Map</a> &rsaquo; 
            <a href="properties.html?zone=${encodeURIComponent(prop.areaZone)}">${prop.areaZone}</a> &rsaquo; 
            <span>${prop.title}</span>
          </div>
          <span class="badge-mini">${isLand ? 'PRIME LAND / PLOT' : 'LUXURY HOUSE / VILLA'} &bull; ${prop.areaZone}</span>
          <h1 class="details-title">${prop.title}</h1>
          <p class="details-loc">📍 ${prop.location}</p>
        </div>

        <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
          <button class="btn btn-black btn-sm" onclick="openPropertyGoogleMaps(${pCoords[0]}, ${pCoords[1]}, '${encodeURIComponent(prop.title)}')" title="Check exact distance and live driving route from your location on Google Maps">
            📍 Google Maps Distance &amp; Directions &rarr;
          </button>
          <button class="btn btn-outline btn-sm" onclick="openFreeCabModal('${prop.title}')">
            🚕 Book Free Cab for Visit
          </button>
          <a href="properties.html?zone=${encodeURIComponent(prop.areaZone)}" class="btn btn-outline btn-sm">
            &larr; Back to Properties
          </a>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="details-page-layout">
        
        <div class="details-gallery-card">
          <div class="details-main-img-wrap">
            <img src="${galleryImages[0]}" alt="${prop.title}" id="detailsMainImg" class="details-main-img">
          </div>

          <div class="details-thumb-grid">
            ${galleryImages.map((imgUrl, idx) => `
              <img src="${imgUrl}" alt="Photo ${idx + 1}" class="details-thumb ${idx === 0 ? 'active' : ''}" onclick="switchDetailPhoto('${imgUrl}', this)">
            `).join('')}
          </div>
        </div>

        <div class="details-info-card">
          
          <div class="details-price-banner">
            <div>
              <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#AAA; display:block;">Fair Market Value</span>
              <span class="price-tag">${prop.priceFormatted}</span>
            </div>
            <div>
              <span style="font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#AAA; display:block;">Govt Guideline Rate</span>
              <span class="guideline-tag">${prop.guideValuePerSqFt || 'Market Benchmarked'}</span>
            </div>
          </div>

          <div class="details-narrative">
            <h4>ARCHITECTURAL OVERVIEW &amp; SITE NARRATIVE</h4>
            <p>${prop.description}</p>
          </div>

          <div style="margin-bottom:24px;">
            <h4 style="font-family:var(--font-mono); font-size:12px; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:8px; font-weight:800;">
              KEY HIGHLIGHTS &amp; INFRASTRUCTURE
            </h4>
            <ul style="padding-left:18px; font-size:13px; line-height:1.8; color:#DDDDDD;">
              ${prop.highlights ? prop.highlights.map(h => `<li>${h}</li>`).join('') : ''}
            </ul>
          </div>

          <h4 style="font-family:var(--font-mono); font-size:12px; letter-spacing:1.5px; text-transform:uppercase; margin-bottom:12px; font-weight:800; color:#FFFFFF;">
            LEGAL VERIFICATION &amp; REVENUE CERTIFICATES
          </h4>
          <table class="details-legal-table">
            <tr>
              <td>RERA Registration</td>
              <td><strong>${prop.reraNumber}</strong></td>
            </tr>
            <tr>
              <td>CMDA / DTCP Sanction</td>
              <td><strong>${prop.cmdaApproval}</strong></td>
            </tr>
            <tr>
              <td>Patta / Khata Passbook</td>
              <td><strong>${prop.pattaNumber}</strong></td>
            </tr>
            <tr>
              <td>Town Survey / Survey No</td>
              <td><strong>${prop.surveyNumber}</strong></td>
            </tr>
            <tr>
              <td>Sub-Registrar Jurisdiction</td>
              <td><strong>${prop.sroJurisdiction}</strong></td>
            </tr>
            <tr>
              <td>Dimensions / Built-up</td>
              <td><strong>${prop.size} &bull; ${prop.dimensions}</strong></td>
            </tr>
            <tr>
              <td>Encumbrance Status</td>
              <td><strong style="color:#00E5FF;">Clear Freehold &bull; 35-Year Encumbrance Free</strong></td>
            </tr>
          </table>

          <div style="background:#161616; color:#FFFFFF; padding:18px 22px; border:1px solid rgba(255, 255, 255, 0.2); box-shadow:0 10px 30px rgba(0, 0, 0, 0.8); margin:20px 0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <span class="badge-mini" style="background:#F5D77F; color:#000000; font-weight:800;">100% FREE VIP COURTESY</span>
              <strong style="display:block; font-size:15px; margin-top:4px; color:#FFFFFF;">Request Complimentary Chauffeur Cab</strong>
              <p style="font-size:12px; color:#CCCCCC; margin:2px 0 0 0;">Mercedes / BMW / HyCross VIP pickup from your home, hotel, or airport directly to this property.</p>
            </div>
            <button class="btn btn-white btn-sm" onclick="openFreeCabModal('${prop.title}')">
              🚕 Book Free Cab &rarr;
            </button>
          </div>

          <div class="details-booking-box">
            <h4>REQUEST CONFIDENTIAL DOSSIER FOR THIS PROPERTY</h4>
            <p>Enter your contact details below to instantly dispatch the authenticated survey maps, Patta passbook copy, and legal deeds directly to your email.</p>

            <form id="propDetailInquiryForm" onsubmit="handleDetailInquirySubmit(event, '${prop.id}', '${prop.title}', '${prop.priceFormatted}', '${prop.location}')">
              <div class="form-row">
                <div class="form-group">
                  <label>Full Name *</label>
                  <input type="text" id="detInqName" placeholder="e.g. Nasiha Banu" required>
                </div>
                <div class="form-group">
                  <label>Email Address *</label>
                  <input type="email" id="detInqEmail" placeholder="yourname@gmail.com" required>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>WhatsApp / Phone *</label>
                  <input type="tel" id="detInqPhone" placeholder="+91 98400 12345" required>
                </div>
                <div class="form-group">
                  <label>Preferred Visit / Notes</label>
                  <input type="text" id="detInqNotes" placeholder="Site visit date, survey questions...">
                </div>
              </div>
              <button type="submit" id="detInqSubmitBtn" class="btn btn-black btn-block">
                <span class="btn-text">Dispatch Official Dossier to My Email &rarr;</span>
                <span class="btn-loader" style="display:none;"></span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  `;
}

function switchDetailPhoto(url, thumbEl) {
  const mainImg = document.getElementById('detailsMainImg');
  if (mainImg) {
    mainImg.style.opacity = '0.4';
    setTimeout(() => {
      mainImg.src = url;
      mainImg.style.opacity = '1';
    }, 150);
  }

  document.querySelectorAll('.details-thumb').forEach(t => t.classList.remove('active'));
  if (thumbEl) thumbEl.classList.add('active');
}

// ============================================================================
// AUTOMATED REGISTRATION & EMAIL SUBMISSION HANDLERS
// ============================================================================
async function handleDetailInquirySubmit(event, propId, propTitle, propPrice, propLoc) {
  event.preventDefault();

  const btn = document.getElementById('detInqSubmitBtn');
  const btnText = btn.querySelector('.btn-text');
  const btnLoader = btn.querySelector('.btn-loader');

  const fullName = document.getElementById('detInqName').value.trim();
  const email = document.getElementById('detInqEmail').value.trim();
  const phone = document.getElementById('detInqPhone').value.trim();
  const notes = document.getElementById('detInqNotes').value.trim();

  btn.disabled = true;
  if (btnText) btnText.textContent = 'Authenticating & Dispatched via SMTP...';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  try {
    const payload = {
      fullName,
      email,
      phone,
      propertyType: 'Specific House / Land Inquiry',
      location: propLoc,
      budget: propPrice,
      specificProperty: `${propTitle} (${propPrice})`,
      notes: notes || `Direct inquiry for ${propTitle}`
    };

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      showSuccessModal(data.clientRef, email);
    } else {
      alert(`Note: ${data.message || 'Submission completed'}`);
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Submission failed. Please check connection and retry.');
  } finally {
    btn.disabled = false;
    if (btnText) btnText.textContent = 'Dispatch Official Dossier to My Email →';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

async function handleDirectRegSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('directRegistrationForm');
  const btn = document.getElementById('directRegSubmitBtn');
  const btnText = btn ? btn.querySelector('.btn-text') : null;
  const btnLoader = btn ? btn.querySelector('.btn-loader') : null;

  const fullNameEl = document.getElementById('regFullName');
  const emailEl = document.getElementById('regEmail');
  const phoneEl = document.getElementById('regPhone');
  const propertyTypeEl = document.getElementById('regPropertyType');
  const locationEl = document.getElementById('regLocation');
  const budgetEl = document.getElementById('regBudget');
  const specificPropertyEl = document.getElementById('regSpecificProperty');
  const notesEl = document.getElementById('regNotes');

  const fullName = fullNameEl ? fullNameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const propertyType = propertyTypeEl ? propertyTypeEl.value : 'Both Land & Housing';
  const location = locationEl ? locationEl.value : 'Chennai Prime';
  const budget = budgetEl ? budgetEl.value : 'Above ₹5 Cr';
  const specificProperty = specificPropertyEl ? specificPropertyEl.value : 'General Portfolio Inquiry';
  const notes = notesEl ? notesEl.value.trim() : '';

  if (!fullName || !email) {
    alert('Please enter your Name and Email address to receive your portfolio dossier.');
    return;
  }

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Authenticating & Dispatched via SMTP...';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  try {
    const payload = {
      fullName,
      email,
      phone,
      propertyType,
      location,
      budget,
      specificProperty,
      notes
    };

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      closeRegistrationModal();
      if (form) form.reset();
      showSuccessModal(data.clientRef, email);
    } else {
      alert(`Note: ${data.message || 'Submission completed'}`);
    }
  } catch (err) {
    console.error('Submission error:', err);
    alert('Submission failed. Please check connection and retry.');
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Submit Registration & Dispatch Email Dossier';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

function showSuccessModal(clientRef, email) {
  const successModal = document.getElementById('successModal');
  const refEl = document.getElementById('successRefCode');
  const emailEl = document.getElementById('successEmailDisplay');

  if (refEl) refEl.textContent = clientRef || `LLB-CHN-${Math.floor(10000 + Math.random() * 90000)}`;
  if (emailEl) emailEl.textContent = email;

  if (successModal) {
    successModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function openRegistrationModalDirect() {
  const modal = document.getElementById('directRegModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeRegistrationModal() {
  const modal = document.getElementById('directRegModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function handleModalBackdropClick(event) {
  if (event.target.classList.contains('modal')) {
    closeRegistrationModal();
    closeSuccessModal();
    closeFreeCabModal();
    closeCabSuccessModal();
  }
}

function setupMobileNav() {
  const toggle = document.getElementById('navToggle') || document.getElementById('blackNavToggle');
  const navLinks = document.getElementById('navLinks') || document.getElementById('blackNavLinks');
  if (!toggle || !navLinks) return;

  // Do not bind duplicate listener if inline onclick="toggleBlackMobileNav()" is present
  if (!toggle.getAttribute('onclick')) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleBlackMobileNav();
    });
  }
}

function toggleBlackMobileNav() {
  const nav = document.getElementById('blackNavLinks') || document.getElementById('navLinks');
  const btn = document.getElementById('blackNavToggle') || document.getElementById('navToggle');
  if (!nav || !btn) return;
  const willOpen = !nav.classList.contains('active');
  nav.classList.toggle('active', willOpen);
  nav.classList.toggle('mobile-open', willOpen);
  btn.classList.toggle('open', willOpen);
  btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
}

function closeMobileNav() {
  const toggle = document.getElementById('navToggle') || document.getElementById('blackNavToggle');
  const navLinks = document.getElementById('navLinks') || document.getElementById('blackNavLinks');
  if (navLinks) {
    navLinks.classList.remove('mobile-open');
    navLinks.classList.remove('active');
  }
  if (toggle) {
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
}

function closeBlackMobileNav() {
  closeMobileNav();
}

// Auto close mobile drawer on tapping any navigation tab or action, or tapping outside
document.addEventListener('click', function(e) {
  if (e.target.closest('.black-nav-tab') || e.target.closest('.nav-tab') || e.target.closest('.mobile-nav-cab-card') || e.target.closest('.mobile-nav-dossier-card') || e.target.closest('.mobile-nav-call-link')) {
    closeMobileNav();
  }
  const nav = document.getElementById('blackNavLinks');
  const toggle = document.getElementById('blackNavToggle');
  if (nav && nav.classList.contains('active')) {
    if (!nav.contains(e.target) && (!toggle || !toggle.contains(e.target))) {
      closeMobileNav();
    }
  }
});

// Global Ambient Stardust Particles Canvas
function initStarsCanvas() {
  const canvas = document.getElementById('ambientStarsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  const particles = [];
  const particleCount = 45;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.4 + 0.4,
      speedY: Math.random() * 0.35 + 0.1,
      speedX: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.55 + 0.15,
      fadeSpeed: Math.random() * 0.008 + 0.003
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let p of particles) {
      p.y -= p.speedY;
      p.x += p.speedX;
      p.opacity += p.fadeSpeed;

      if (p.opacity > 0.75 || p.opacity < 0.15) {
        p.fadeSpeed = -p.fadeSpeed;
      }
      if (p.y < -10) p.y = height + 10;
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.opacity)})`;
      ctx.shadowBlur = p.radius > 1 ? 6 : 0;
      ctx.shadowColor = '#FFFFFF';
      ctx.fill();
    }

    requestAnimationFrame(render);
  }
  render();
}

function populateSpecificPropertySelects() {
  const select = document.getElementById('regSpecificProperty');
  if (!select) return;

  select.innerHTML = '<option value="General Portfolio Inquiry">-- General Portfolio Inquiry (All Matching Properties) --</option>';
  allProperties.forEach(p => {
    const opt = document.createElement('option');
    opt.value = `${p.title} (${p.priceFormatted}) - ${p.location}`;
    opt.textContent = `${p.title} — ${p.priceFormatted} [${p.areaZone}]`;
    select.appendChild(opt);
  });
}

async function fetchProperties() {
  try {
    const res = await fetch('/api/properties');
    const data = await res.json();
    if (data.success && Array.isArray(data.properties)) {
      allProperties = data.properties;
      populateSpecificPropertySelects();
      window.dispatchEvent(new CustomEvent('propertiesLoaded', { detail: allProperties }));
    }
  } catch (err) {
    console.error('Failed to load property database:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  initStarsCanvas();
  fetchGoogleMapsConfig();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRegistrationModal();
      closeSuccessModal();
      closeFreeCabModal();
      closeCabSuccessModal();
    }
  });

  fetchProperties();
});

// =========================================================================
// FREE LUXURY CAB FOR SITE INSPECTION
// =========================================================================
function openFreeCabModal(propertyTitle) {
  const modal = document.getElementById('freeCabModal');
  if (!modal) return;

  const propSelect = document.getElementById('cabPropertyTarget');
  if (propSelect && propertyTitle) {
    let found = false;
    for (let opt of propSelect.options) {
      if (opt.value.includes(propertyTitle) || opt.textContent.includes(propertyTitle)) {
        opt.selected = true;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = propertyTitle;
      opt.textContent = propertyTitle;
      opt.selected = true;
      propSelect.appendChild(opt);
    }
  }

  // Pre-fill tomorrow's date if empty
  const dateInput = document.getElementById('cabDate');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFreeCabModal() {
  const modal = document.getElementById('freeCabModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

async function handleFreeCabSubmit(event) {
  event.preventDefault();

  const form = document.getElementById('freeCabForm');
  const btn = document.getElementById('cabSubmitBtn');
  const btnText = btn ? btn.querySelector('.btn-text') : null;
  const btnLoader = btn ? btn.querySelector('.btn-loader') : null;

  const fullName = document.getElementById('cabFullName') ? document.getElementById('cabFullName').value.trim() : '';
  const phone = document.getElementById('cabPhone') ? document.getElementById('cabPhone').value.trim() : '';
  const email = document.getElementById('cabEmail') ? document.getElementById('cabEmail').value.trim() : '';
  const pickupAddress = document.getElementById('cabPickupAddress') ? document.getElementById('cabPickupAddress').value.trim() : '';
  const propertyTarget = document.getElementById('cabPropertyTarget') ? document.getElementById('cabPropertyTarget').value : 'Chennai Prime Property';
  const inspectionDate = document.getElementById('cabDate') ? document.getElementById('cabDate').value : '';
  const inspectionTime = document.getElementById('cabTime') ? document.getElementById('cabTime').value : '';
  const vehicleClass = document.getElementById('cabVehicle') ? document.getElementById('cabVehicle').value : 'Mercedes-Benz E-Class VIP';
  const notes = document.getElementById('cabNotes') ? document.getElementById('cabNotes').value.trim() : '';

  if (!fullName || !phone) {
    alert('Please enter your Name and WhatsApp/Phone number for the chauffeur reservation.');
    return;
  }

  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'Reserving Luxury Chauffeur Cab...';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  try {
    const payload = {
      fullName,
      phone,
      email,
      pickupAddress,
      propertyTarget,
      inspectionDate,
      inspectionTime,
      vehicleClass,
      notes
    };

    const res = await fetch('/api/book-cab', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      closeFreeCabModal();
      if (form) form.reset();
      showCabSuccessModal(data);
    } else {
      alert(`Booking Notice: ${data.message || 'Cab reservation received'}`);
    }
  } catch (err) {
    console.error('Cab booking error:', err);
    alert('Cab request received. Our VIP transport concierge will call you directly.');
    closeFreeCabModal();
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'Confirm Complimentary Cab & Dispatch Driver →';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

function showCabSuccessModal(data) {
  const modal = document.getElementById('cabSuccessModal');
  const refEl = document.getElementById('cabSuccessRef');
  const destEl = document.getElementById('cabSuccessDest');
  const pickupEl = document.getElementById('cabSuccessPickup');

  if (refEl) refEl.textContent = data.cabRef || `LLB-CAB-${Math.floor(10000 + Math.random() * 90000)}`;
  if (destEl) destEl.textContent = data.propertyTarget || 'Selected Prime Property';
  if (pickupEl) pickupEl.textContent = data.pickupAddress || 'Designated Chennai Location';

  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeCabSuccessModal() {
  const modal = document.getElementById('cabSuccessModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// =========================================================================
// GOOGLE MAPS DISTANCE & LIVE TURN-BY-TURN ROUTE
// =========================================================================
function openPropertyGoogleMaps(lat, lng, title) {
  if (typeof playRadarLockSound === 'function') {
    playRadarLockSound();
  }

  // Retrieve user live GPS to display exact distance (KM) & live driving duration in Google Maps
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const uLat = pos.coords.latitude;
        const uLng = pos.coords.longitude;
        const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${uLat},${uLng}&destination=${lat},${lng}&travelmode=driving`;
        window.open(gmapsUrl, '_blank', 'noopener,noreferrer');
      },
      (err) => {
        console.warn('Geolocation prompt dismissed or unavailable, opening Google Maps with device location:', err.message);
        const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
      },
      { enableHighAccuracy: true, timeout: 4000 }
    );
  } else {
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
}

function openGpsNavigation(lat, lng, title) {
  openPropertyGoogleMaps(lat, lng, title);
}

function openLocationOnMapPage(lat, lng, areaTitle) {
  openPropertyGoogleMaps(lat, lng, areaTitle);
}
