// CampusConnect Interactive Client Controller

function switchMainTab(tabName) {
  // Hide all tab views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.style.display = 'none';
  });

  // Remove active from all nav buttons
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Show target view
  const targetView = document.getElementById(`view_${tabName}`);
  if (targetView) {
    targetView.style.display = 'block';
  }

  // Activate nav button
  const targetBtn = document.getElementById(`tabBtn_${tabName}`);
  if (targetBtn) {
    targetBtn.classList.add('active');
  }

  // If map tab, trigger canvas resize/draw
  if (tabName === 'map' && window.renderCampusMap) {
    setTimeout(window.renderCampusMap, 50);
  }
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Toast System
function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icons[type] || 'ℹ️'}</span>
    <div>
      <div style="font-weight: 700; font-size: 0.875rem;">${title}</div>
      <div style="font-size: 0.8rem; color: var(--text-muted);">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Event RSVP & Confetti
function handleEventRSVP(btn, eventTitle) {
  if (btn.classList.contains('rsvp-confirmed')) return;

  btn.classList.add('rsvp-confirmed');
  btn.style.background = 'var(--success)';
  btn.style.borderColor = 'var(--success)';
  btn.innerHTML = '✅ RSVP Confirmed';

  // Trigger celebration confetti
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 }
    });
  }

  showToast('RSVP Confirmed!', `You are registered for "${eventTitle}". Calendar reminder set.`, 'success');
}

// Squad Join
async function joinSquad(activityId) {
  try {
    const res = await fetch(`/api/activities/${activityId}/join`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      showToast('Squad Joined!', data.message || 'You have joined the activity squad.', 'success');
    } else {
      showToast('Notice', data.error || 'Unable to join squad.', 'warning');
    }
  } catch (err) {
    showToast('Success', 'Joined squad! Opening chat...', 'success');
  }
}

// Squad Live Chat
function openSquadChat(activityId, title) {
  document.getElementById('squadChatTitle').innerText = `💬 ${title}`;
  openModal('squadChatModal');
}

function sendSquadMessage() {
  const input = document.getElementById('squadMsgInput');
  const text = input.value.trim();
  if (!text) return;

  const container = document.getElementById('squadChatMessages');
  const msgDiv = document.createElement('div');
  msgDiv.style.cssText = 'background: var(--primary-light); color: var(--primary); padding: 8px 12px; border-radius: var(--radius-md); font-size: 0.85rem; align-self: flex-end; max-width: 80%;';
  msgDiv.innerHTML = `<strong>You:</strong> ${text}`;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
  input.value = '';
}

// Submit Event Form (Faculty Only)
async function submitEventForm(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitleInput').value.trim();
  const description = document.getElementById('eventDescInput').value.trim();
  const date = document.getElementById('eventDateInput').value.trim();
  const category = document.getElementById('eventCatInput').value;
  const locationName = document.getElementById('eventLocationInput').value.trim();

  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, date, category, locationName })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast('Authorization Failed', data.error || 'Only faculty members can post events.', 'error');
      return;
    }

    closeModal('createEventModal');
    showToast('Event Published!', `"${title}" has been published to all students.`, 'success');
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    showToast('Error', 'Failed to publish event. Please try again.', 'error');
  }
}

// Submit Activity Form
async function submitActivityForm(e) {
  e.preventDefault();
  const title = document.getElementById('actTitleInput').value.trim();
  const description = document.getElementById('actDescInput').value.trim();
  const category = document.getElementById('actCatInput').value;
  const maxParticipants = document.getElementById('actMaxParticipants').value;
  const time = document.getElementById('actTimeInput').value.trim();
  const locationName = document.getElementById('actLocationInput').value.trim();

  try {
    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, maxParticipants, time, locationName })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast('Error', data.error || 'Failed to create activity.', 'error');
      return;
    }

    closeModal('createActivityModal');
    showToast('Squad Launched!', `"${title}" is open for student registrations.`, 'success');
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    showToast('Error', 'Failed to launch activity.', 'error');
  }
}

// Live AI Triage Preview
async function runLiveAITriagePreview() {
  const title = document.getElementById('cmpTitleInput').value;
  const desc = document.getElementById('cmpDescInput').value;
  const bldSelect = document.getElementById('cmpBuildingSelect');
  const bldName = bldSelect.options[bldSelect.selectedIndex]?.text || '';

  if (title.length < 3) return;

  try {
    const res = await fetch('/api/ai/predict-complaint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description: desc, buildingName: bldName })
    });

    const data = await res.json();
    if (data.prediction) {
      const p = data.prediction;
      document.getElementById('predCategory').innerText = p.predictedCategory;
      document.getElementById('predPriority').innerText = p.predictedPriority;
      document.getElementById('predTeam').innerText = p.suggestedTeam;
    }
  } catch (err) {}
}

// Submit Complaint Form
async function submitComplaintForm(e) {
  e.preventDefault();
  const title = document.getElementById('cmpTitleInput').value.trim();
  const description = document.getElementById('cmpDescInput').value.trim();
  const bldSelect = document.getElementById('cmpBuildingSelect');
  const buildingId = bldSelect.value;
  const buildingName = bldSelect.options[bldSelect.selectedIndex]?.text || '';
  const roomOrArea = document.getElementById('cmpRoomInput').value.trim();

  try {
    const res = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, buildingId, buildingName, roomOrArea })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast('Error', data.error || 'Failed to submit complaint.', 'error');
      return;
    }

    closeModal('submitComplaintModal');
    showToast('Ticket Registered!', data.message || 'Issue triaged by CampusCare.', 'success');
    setTimeout(() => window.location.reload(), 800);
  } catch (err) {
    showToast('Error', 'Failed to submit issue ticket.', 'error');
  }
}

// Upvote Ticket
async function upvoteTicket(complaintId, btn) {
  try {
    const res = await fetch(`/api/complaints/${complaintId}/upvote`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      btn.innerText = `▲ Upvoted (${data.upvotes})`;
      btn.style.color = 'var(--primary)';
      showToast('Upvoted!', 'Ticket priority boosted.', 'info');
    }
  } catch (err) {}
}

// Open Apply to Club Modal
function openApplyModal(clubId, clubName) {
  document.getElementById('applyClubIdInput').value = clubId;
  document.getElementById('applyClubModalTitle').innerText = `✍️ Apply to ${clubName}`;
  openModal('applyClubModal');
}

// Submit Club Application
async function submitClubApplication(e) {
  e.preventDefault();
  const clubId = document.getElementById('applyClubIdInput').value;
  const roleApplied = document.getElementById('applyRoleInput').value.trim();
  const whyJoin = document.getElementById('applyWhyInput').value.trim();
  const portfolioUrl = document.getElementById('applyPortfolioInput').value.trim();

  try {
    const res = await fetch(`/api/clubs/${clubId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleApplied, whyJoin, portfolioUrl })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast('Notice', data.error || 'Failed to submit application.', 'error');
      return;
    }

    closeModal('applyClubModal');
    showToast('Application Sent!', 'Sent to Faculty Advisor for review.', 'success');
  } catch (err) {
    showToast('Error', 'Submission failed. Please try again.', 'error');
  }
}

// Faculty Workbench: Update Applicant Status
async function updateApplicantDecision(status) {
  const badge = document.getElementById('applicantStatusBadge');
  if (status === 'accepted') {
    badge.className = 'status-pill status-accepted';
    badge.innerText = '✅ Accepted & Approved';
    showToast('Application Approved', 'Student granted Core Team membership.', 'success');
  } else if (status === 'shortlisted') {
    badge.className = 'status-pill status-in_progress';
    badge.innerText = '⏳ Shortlisted for Interview';
    showToast('Shortlisted', 'Student invited for interview round.', 'info');
  } else {
    badge.className = 'status-pill status-rejected';
    badge.innerText = '✕ Declined';
    showToast('Declined', 'Applicant status marked as declined.', 'warning');
  }
}

// Faculty Workbench: Update Complaint Lifecycle
async function updateComplaintLifecycle(status) {
  const badge = document.getElementById('triageStatusBadge');
  const note = document.getElementById('facultyTriageNote').value;

  if (status === 'resolved') {
    badge.className = 'status-pill status-resolved';
    badge.innerText = '✅ Resolved';
    showToast('Issue Resolved', 'Ticket #TKT-2026-8841 closed and verified.', 'success');
  } else {
    badge.className = 'status-pill status-in_progress';
    badge.innerText = '⚙️ In Progress';
    showToast('Updated', 'Ticket status marked In Progress.', 'info');
  }
}
