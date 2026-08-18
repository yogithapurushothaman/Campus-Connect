// 2D Campus Map & Wayfinding Canvas Renderer

let campusBuildings = [];
let activeRoute = null;

async function initCampusMap() {
  try {
    const res = await fetch('/api/map/buildings');
    const data = await res.json();
    campusBuildings = data.buildings || [];
    renderCampusMap();
  } catch (err) {
    console.error('Failed to load campus buildings:', err);
  }
}

function renderCampusMap() {
  const canvas = document.getElementById('campusMapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  // Clear canvas
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(0, 0, width, height);

  // Draw Campus Green Promenades & Paths
  ctx.fillStyle = '#CBD5E1';
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#CBD5E1';

  // Central Horizontal Promenade Spine
  ctx.beginPath();
  ctx.moveTo(40, height * 0.5);
  ctx.lineTo(width - 40, height * 0.5);
  ctx.stroke();

  // Vertical Spines
  ctx.beginPath();
  ctx.moveTo(width * 0.22, 60);
  ctx.lineTo(width * 0.22, height - 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.5, 60);
  ctx.lineTo(width * 0.5, height - 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width * 0.78, 60);
  ctx.lineTo(width * 0.78, height - 60);
  ctx.stroke();

  // Central Green Circle
  ctx.fillStyle = '#D1FAE5';
  ctx.beginPath();
  ctx.arc(width * 0.5, height * 0.5, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#10B981';
  ctx.stroke();

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 10px Plus Jakarta Sans';
  ctx.textAlign = 'center';
  ctx.fillText('Central Lawn', width * 0.5, height * 0.5 + 4);

  // Draw active route path if computed
  if (activeRoute && activeRoute.waypoints) {
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();

    activeRoute.waypoints.forEach((wp, idx) => {
      const px = (wp.x / 100) * width;
      const py = (wp.y / 100) * height;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Draw Building Nodes
  campusBuildings.forEach(bld => {
    const bx = (bld.position.x / 100) * width;
    const py = (bld.position.y / 100) * height;
    const bw = 90;
    const bh = 55;

    // Card background
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;
    
    ctx.beginPath();
    ctx.roundRect(bx - bw/2, py - bh/2, bw, bh, 8);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2;
    ctx.strokeStyle = bld.category === 'academic' ? '#4F46E5' : (bld.category === 'hostel' ? '#8B5CF6' : '#059669');
    ctx.stroke();

    // Building Code badge
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = 'bold 10px Plus Jakarta Sans';
    ctx.textAlign = 'center';
    ctx.fillText(bld.code, bx, py - 8);

    // Building Name snippet
    ctx.fillStyle = '#1E202A';
    ctx.font = '600 8.5px Plus Jakarta Sans';
    const shortName = bld.name.length > 18 ? bld.name.substring(0, 16) + '...' : bld.name;
    ctx.fillText(shortName, bx, py + 6);

    // Wi-Fi rating indicator
    ctx.fillStyle = '#D97706';
    ctx.font = 'bold 8px Plus Jakarta Sans';
    ctx.fillText(`★ ${bld.wifiRating}`, bx, py + 18);
  });
}

// Calculate Walking Route
async function calculateWalkingRoute() {
  const startId = document.getElementById('routeStartSelect').value;
  const destId = document.getElementById('routeDestSelect').value;

  try {
    const res = await fetch('/api/map/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startBuildingId: startId, destBuildingId: destId })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast('Error', data.error || 'Failed to compute route.', 'error');
      return;
    }

    activeRoute = data.route;
    renderCampusMap();

    // Populate route box
    document.getElementById('routeMeters').innerText = activeRoute.distanceMeters;
    document.getElementById('routeETA').innerText = activeRoute.durationMinutes;

    const listDiv = document.getElementById('routeStepsList');
    listDiv.innerHTML = '';
    activeRoute.steps.forEach((step, i) => {
      const p = document.createElement('div');
      p.innerHTML = `<strong>${i + 1}.</strong> ${step}`;
      listDiv.appendChild(p);
    });

    document.getElementById('routeResultBox').style.display = 'block';
    showToast('Route Calculated', `Estimated walk: ~${activeRoute.durationMinutes} mins (${activeRoute.distanceMeters}m)`, 'success');
  } catch (err) {
    showToast('Error', 'Route navigation service unavailable.', 'error');
  }
}

// Attach map renderer to window
window.renderCampusMap = renderCampusMap;
document.addEventListener('DOMContentLoaded', initCampusMap);
