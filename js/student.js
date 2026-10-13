/**
 * QueueLess - Smart College Queue and Token Management System
 * student.js: Student Portal Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session Guard (Ensures logged in as Student, or sets demo student)
  let currentUser = QueueLessApp.checkAuth('Student');
  if (!currentUser) {
    // If testing directly, seed student session
    const profile = window.queueLessStore.getStudentProfile();
    currentUser = {
      name: profile.name,
      email: profile.email,
      role: 'Student',
      id: profile.registerNumber,
      department: profile.department
    };
    window.queueLessStore.setAuth(currentUser);
  }

  // State
  let selectedServiceForToken = null;
  let activeTokenToCancel = null;
  let serviceFilterDept = 'all';
  let serviceSearchQuery = '';
  let tokensFilterStatus = 'all';
  let historySearchQuery = '';
  let historyStatusFilter = 'all';

  // 2. Initialize Tab Routing
  QueueLessApp.initTabRouting('overview', (activeTab) => {
    refreshAllStudentViews();
  });

  // 3. Initial Render
  refreshAllStudentViews();

  // 4. Data Sync Listener (Live updates from other tabs or actions)
  window.addEventListener('queueless:data-updated', () => {
    refreshAllStudentViews();
  });

  function refreshAllStudentViews() {
    renderDashboardOverview();
    renderServicesCatalog();
    renderMyTokensList();
    renderLiveQueueTracker();
    renderRequestHistory();
    renderNotificationsCenter();
    renderStudentProfile();
    updateSidebarBadges();
  }

  function updateSidebarBadges() {
    const tokens = window.queueLessStore.getTokens();
    const studentTokens = tokens.filter(t => t.studentEmail === currentUser.email);
    const activeCount = studentTokens.filter(t => t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing').length;

    const badge = document.getElementById('sidebar-active-tokens-count');
    if (badge) badge.textContent = activeCount;

    const services = window.queueLessStore.getServices();
    const srvBadge = document.getElementById('sidebar-available-services-count');
    if (srvBadge) srvBadge.textContent = services.filter(s => s.isActive).length;
  }

  // =========================================================================
  // VIEW 1: DASHBOARD OVERVIEW
  // =========================================================================
  function renderDashboardOverview() {
    const tokens = window.queueLessStore.getTokens();
    const studentTokens = tokens.filter(t => t.studentEmail === currentUser.email);

    const activeTokens = studentTokens.filter(t => t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing');
    const completedTokens = studentTokens.filter(t => t.status === 'Completed');
    const pendingReview = studentTokens.filter(t => !t.documentsVerified);

    // KPI Values
    document.getElementById('kpi-active-tokens').textContent = activeTokens.length;
    document.getElementById('kpi-completed-requests').textContent = completedTokens.length;
    document.getElementById('kpi-pending-applications').textContent = pendingReview.length;

    // Calculate dynamic average wait time
    if (activeTokens.length > 0) {
      const waitTime = window.queueLessStore.calculateEstimatedWaitTime(activeTokens[0].serviceId, activeTokens[0].id);
      document.getElementById('kpi-avg-wait-time').textContent = `~${waitTime} min`;
    } else {
      document.getElementById('kpi-avg-wait-time').textContent = '~5 min';
    }

    // Active Token Spotlight Card
    const spotlightEl = document.getElementById('spotlight-token-content');
    if (activeTokens.length > 0) {
      const activeTkn = activeTokens[0];
      const qPos = window.queueLessStore.getQueuePosition(activeTkn.id);
      const estWait = window.queueLessStore.calculateEstimatedWaitTime(activeTkn.serviceId, activeTkn.id);

      let statusBadgeClass = 'badge-waiting';
      let statusIcon = 'fa-hourglass-start';
      if (activeTkn.status === 'Called') {
        statusBadgeClass = 'badge-called';
        statusIcon = 'fa-bullhorn';
      } else if (activeTkn.status === 'Processing') {
        statusBadgeClass = 'badge-processing';
        statusIcon = 'fa-spinner fa-spin';
      }

      spotlightEl.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 1.25rem;">
            <div class="token-circle-number" style="font-size: 1.5rem; padding: 0.6rem 1.2rem;">
              ${activeTkn.tokenNumber}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
                <span class="badge ${statusBadgeClass}"><i class="fa-solid ${statusIcon}"></i> ${activeTkn.status}</span>
                <span class="text-xs text-muted">• Requested at ${formatDisplayTime(activeTkn.createdAt)}</span>
              </div>
              <h3 style="font-size: 1.2rem; color: var(--slate-900);">${activeTkn.serviceName}</h3>
              <p class="text-xs text-muted">${activeTkn.department} ${activeTkn.counterName ? '• ' + activeTkn.counterName : ''}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div style="text-align: right;">
              <div class="text-xs text-muted">Queue Position</div>
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary-600);">
                ${activeTkn.status === 'Processing' ? 'At Counter' : activeTkn.status === 'Called' ? 'Called Now!' : '#' + qPos.position}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="text-xs text-muted">Estimated Wait</div>
              <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-600);">
                ~${estWait} mins
              </div>
            </div>
            <button class="btn btn-primary btn-sm" onclick="window.location.hash='live-tracker';">
              <i class="fa-solid fa-radar"></i> Live Track
            </button>
          </div>
        </div>
      `;
    } else {
      spotlightEl.innerHTML = `
        <div class="empty-state" style="padding: 2rem 1rem;">
          <div class="empty-state-icon" style="width: 50px; height: 50px; font-size: 1.4rem; margin-bottom: 0.75rem;">
            <i class="fa-solid fa-ticket"></i>
          </div>
          <h4 style="font-size: 1.05rem; margin-bottom: 0.25rem;">No Active Queue Tokens</h4>
          <p class="text-xs text-muted" style="margin-bottom: 1rem;">You don't have any pending queue tokens at the moment.</p>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='services';">
            <i class="fa-solid fa-plus-circle"></i> Request a Token Now
          </button>
        </div>
      `;
    }

    // Popular Services Quick Grid
    const services = window.queueLessStore.getServices().filter(s => s.isActive);
    const popularGrid = document.getElementById('dashboard-popular-services-grid');
    if (popularGrid) {
      const top4 = services.slice(0, 4);
      popularGrid.innerHTML = top4.map(s => renderServiceCardHtml(s)).join('');
      attachServiceCardEvents(popularGrid);
    }
  }

  // =========================================================================
  // VIEW 2: SERVICES CATALOG
  // =========================================================================
  function renderServicesCatalog() {
    const grid = document.getElementById('full-services-catalog-grid');
    if (!grid) return;

    let services = window.queueLessStore.getServices();

    // Filter by Dept
    if (serviceFilterDept !== 'all') {
      services = services.filter(s => s.department === serviceFilterDept);
    }

    // Search query
    if (serviceSearchQuery.trim() !== '') {
      const q = serviceSearchQuery.toLowerCase();
      services = services.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
      );
    }

    if (services.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon"><i class="fa-solid fa-folder-open"></i></div>
          <h3>No Services Found</h3>
          <p>No college services matched your current search and department filter.</p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-service-filters">Clear Filters</button>
        </div>
      `;
      const resetBtn = grid.querySelector('#btn-reset-service-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          serviceFilterDept = 'all';
          serviceSearchQuery = '';
          document.getElementById('services-search-input').value = '';
          document.querySelectorAll('#service-dept-filters .filter-pill').forEach(p => p.classList.toggle('active', p.getAttribute('data-dept') === 'all'));
          renderServicesCatalog();
        });
      }
      return;
    }

    grid.innerHTML = services.map(s => renderServiceCardHtml(s)).join('');
    attachServiceCardEvents(grid);
  }

  function renderServiceCardHtml(service) {
    const tokens = window.queueLessStore.getTokens();
    const queueLength = tokens.filter(t => t.serviceId === service.id && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing')).length;
    const estWait = window.queueLessStore.calculateEstimatedWaitTime(service.id, null);

    return `
      <div class="service-card" data-service-id="${service.id}">
        <div>
          <div class="service-card-top">
            <div class="service-icon-box">
              <i class="fa-solid ${service.icon || 'fa-file-lines'}"></i>
            </div>
            <div class="service-details">
              <span class="service-dept-tag">${service.department}</span>
              <h4 class="service-title">${service.name}</h4>
            </div>
          </div>
          <p class="service-desc">${service.description}</p>
        </div>

        <div>
          <div class="service-meta-row">
            <div class="meta-item" title="Estimated handling time">
              <i class="fa-regular fa-clock"></i>
              <span>Avg: ${service.avgDuration} min</span>
            </div>
            <div class="meta-item" title="Students currently waiting">
              <i class="fa-solid fa-users"></i>
              <span>Queue: ${queueLength}</span>
            </div>
            <div class="meta-item" title="Estimated wait time">
              <i class="fa-solid fa-stopwatch"></i>
              <span style="font-weight: 700; color: var(--primary-600);">~${estWait} min</span>
            </div>
          </div>

          <div class="service-action-row">
            <span class="badge ${service.isActive ? 'badge-available' : 'badge-offline'}">
              <i class="fa-solid ${service.isActive ? 'fa-circle-check' : 'fa-ban'}"></i>
              ${service.isActive ? 'Available' : 'Unavailable'}
            </span>
            <button class="btn btn-primary btn-sm btn-request-token-trigger" ${service.isActive ? '' : 'disabled'}>
              <i class="fa-solid fa-ticket"></i> Get Token
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function attachServiceCardEvents(container) {
    container.querySelectorAll('.service-card').forEach(card => {
      const triggerBtn = card.querySelector('.btn-request-token-trigger');
      if (!triggerBtn) return;

      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const srvId = card.getAttribute('data-service-id');
        openTokenRequestModal(srvId);
      });
    });
  }

  // Service Dept Filter Pills
  const deptPills = document.querySelectorAll('#service-dept-filters .filter-pill');
  deptPills.forEach(pill => {
    pill.addEventListener('click', () => {
      deptPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      serviceFilterDept = pill.getAttribute('data-dept');
      renderServicesCatalog();
    });
  });

  // Service Search Input
  const searchInput = document.getElementById('services-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      serviceSearchQuery = e.target.value;
      renderServicesCatalog();
    });
  }

  // =========================================================================
  // TOKEN REQUEST MODAL & GENERATION ENGINE
  // =========================================================================
  function openTokenRequestModal(serviceId) {
    const services = window.queueLessStore.getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    // Check duplicate active token rule
    const tokens = window.queueLessStore.getTokens();
    const existingActive = tokens.find(t => 
      t.studentEmail === currentUser.email && 
      t.serviceId === serviceId && 
      (t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing')
    );

    if (existingActive) {
      QueueLessApp.showToast(
        `You already hold an active token (${existingActive.tokenNumber}) for ${service.name}. Please wait for it to be completed or cancel it first.`,
        'warning',
        'Active Token Exists'
      );
      return;
    }

    selectedServiceForToken = service;
    document.getElementById('req-service-id').value = service.id;
    document.getElementById('req-modal-service-name').textContent = service.name;
    document.getElementById('req-modal-dept').textContent = service.department;

    const estWait = window.queueLessStore.calculateEstimatedWaitTime(service.id, null);
    document.getElementById('req-modal-est-wait').textContent = `~${estWait} min`;

    // Reset purpose and remarks
    document.getElementById('req-purpose').value = '';
    document.getElementById('req-remarks').value = '';

    // Document checklist
    const checklistContainer = document.getElementById('req-checklist-container');
    checklistContainer.innerHTML = '';
    if (service.documentsRequired && service.documentsRequired.length > 0) {
      checklistContainer.innerHTML = service.documentsRequired.map((doc, idx) => `
        <label class="check-item">
          <input type="checkbox" checked required id="check-doc-${idx}">
          <span>I have prepared the required document: <strong>${doc}</strong></span>
        </label>
      `).join('');
    } else {
      checklistContainer.innerHTML = `
        <label class="check-item">
          <input type="checkbox" checked required>
          <span>I have my College ID Card ready for counter verification</span>
        </label>
      `;
    }

    QueueLessApp.openModal('modal-request-token');
  }

  // Token Request Form Submit
  const requestForm = document.getElementById('form-token-request');
  if (requestForm) {
    requestForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!selectedServiceForToken) return;

      const purpose = document.getElementById('req-purpose').value.trim();
      const remarks = document.getElementById('req-remarks').value.trim();

      if (!purpose) {
        QueueLessApp.showToast('Please specify the purpose of your request.', 'error');
        return;
      }

      // Generate Unique Token
      const tokenNumber = window.queueLessStore.generateNextTokenNumber(selectedServiceForToken.prefix);
      const profile = window.queueLessStore.getStudentProfile();

      const newToken = {
        id: 'tok-' + Date.now(),
        tokenNumber: tokenNumber,
        serviceId: selectedServiceForToken.id,
        serviceName: selectedServiceForToken.name,
        department: selectedServiceForToken.department,
        studentName: profile.name,
        registerNumber: profile.registerNumber,
        studentEmail: profile.email,
        purpose: purpose,
        remarks: remarks,
        documentsVerified: true,
        status: 'Waiting',
        priority: false,
        priorityReason: '',
        counterId: null,
        counterName: null,
        createdAt: new Date().toISOString(),
        calledAt: null,
        startedAt: null,
        completedAt: null,
        actualDurationMins: null,
        staffNotes: ''
      };

      const tokens = window.queueLessStore.getTokens();
      tokens.push(newToken);
      window.queueLessStore.saveTokens(tokens);

      // Notification
      const estWait = window.queueLessStore.calculateEstimatedWaitTime(selectedServiceForToken.id, newToken.id);
      window.queueLessStore.addNotification(
        'Token Generated Successfully',
        `Your token ${tokenNumber} for ${selectedServiceForToken.name} has been generated. Estimated wait: ~${estWait} mins.`,
        'info',
        'Student',
        currentUser.email
      );

      // Close request modal
      QueueLessApp.closeModal('modal-request-token');
      QueueLessApp.showToast(`Token ${tokenNumber} generated successfully!`, 'success', 'Token Created');

      // Populate Success Modal
      document.getElementById('success-modal-token-num').textContent = tokenNumber;
      document.getElementById('success-modal-service').textContent = selectedServiceForToken.name;
      document.getElementById('success-modal-dept').textContent = selectedServiceForToken.department;
      
      const qPos = window.queueLessStore.getQueuePosition(newToken.id);
      document.getElementById('success-modal-position').textContent = `#${qPos.position} in Queue (${qPos.aheadCount} ahead)`;
      document.getElementById('success-modal-wait').textContent = `~${estWait} mins`;

      QueueLessApp.openModal('modal-token-success');

      // Refresh views
      refreshAllStudentViews();
    });
  }

  // Success Modal action: View in live tracker
  const viewTrackerBtn = document.getElementById('btn-view-my-token-live');
  if (viewTrackerBtn) {
    viewTrackerBtn.addEventListener('click', () => {
      QueueLessApp.closeModal('modal-token-success');
      window.location.hash = 'live-tracker';
    });
  }

  // =========================================================================
  // VIEW 3: MY TOKENS
  // =========================================================================
  function renderMyTokensList() {
    const container = document.getElementById('my-tokens-list-container');
    if (!container) return;

    const allTokens = window.queueLessStore.getTokens();
    let studentTokens = allTokens.filter(t => t.studentEmail === currentUser.email);

    // Apply Filter
    if (tokensFilterStatus === 'active') {
      studentTokens = studentTokens.filter(t => t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing');
    } else if (tokensFilterStatus === 'completed') {
      studentTokens = studentTokens.filter(t => t.status === 'Completed');
    } else if (tokensFilterStatus === 'cancelled') {
      studentTokens = studentTokens.filter(t => t.status === 'Cancelled');
    }

    if (studentTokens.length === 0) {
      container.innerHTML = `
        <div class="empty-state card">
          <div class="empty-state-icon"><i class="fa-solid fa-ticket-simple"></i></div>
          <h3>No Tokens Found</h3>
          <p>You do not have any tokens matching the selected filter.</p>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='services';">
            <i class="fa-solid fa-plus-circle"></i> Request a New Token
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = studentTokens.map(token => {
      const qPos = window.queueLessStore.getQueuePosition(token.id);
      const estWait = window.queueLessStore.calculateEstimatedWaitTime(token.serviceId, token.id);

      let statusBadge = '';
      if (token.status === 'Waiting') statusBadge = '<span class="badge badge-waiting"><i class="fa-solid fa-hourglass-start"></i> Waiting</span>';
      else if (token.status === 'Called') statusBadge = '<span class="badge badge-called"><i class="fa-solid fa-bullhorn"></i> Called to Counter</span>';
      else if (token.status === 'Processing') statusBadge = '<span class="badge badge-processing"><i class="fa-solid fa-spinner fa-spin"></i> Processing</span>';
      else if (token.status === 'Completed') statusBadge = '<span class="badge badge-completed"><i class="fa-solid fa-check"></i> Completed</span>';
      else if (token.status === 'Cancelled') statusBadge = '<span class="badge badge-cancelled"><i class="fa-solid fa-ban"></i> Cancelled</span>';

      const isCancellable = token.status === 'Waiting';

      return `
        <div class="card" style="border-left: 4px solid ${token.status === 'Completed' ? 'var(--success-main)' : token.status === 'Called' ? 'var(--accent-600)' : token.status === 'Processing' ? 'var(--primary-600)' : 'var(--warning-main)'};">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div class="token-circle-number" style="font-size: 1.35rem; padding: 0.5rem 1rem;">
                ${token.tokenNumber}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
                  ${statusBadge}
                  ${token.priority ? '<span class="badge badge-priority"><i class="fa-solid fa-bolt"></i> Urgent</span>' : ''}
                  <span class="text-xs text-muted">Created: ${formatDisplayTime(token.createdAt)}, ${formatDisplayDate(token.createdAt)}</span>
                </div>
                <h3 style="font-size: 1.15rem; color: var(--slate-900);">${token.serviceName}</h3>
                <span class="text-xs text-muted">${token.department}</span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <button class="btn btn-secondary btn-sm btn-view-token-receipt" data-token-id="${token.id}">
                <i class="fa-solid fa-file-invoice"></i> View Receipt
              </button>
              ${isCancellable ? `
                <button class="btn btn-danger btn-sm btn-cancel-token-trigger" data-token-id="${token.id}" data-token-num="${token.tokenNumber}">
                  <i class="fa-solid fa-xmark"></i> Cancel Token
                </button>
              ` : ''}
              ${(token.status === 'Waiting' || token.status === 'Called' || token.status === 'Processing') ? `
                <button class="btn btn-primary btn-sm" onclick="window.location.hash='live-tracker';">
                  <i class="fa-solid fa-radar"></i> Live Tracker
                </button>
              ` : ''}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.9rem; background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 0.85rem 1rem;">
            <div>
              <span class="text-xs text-muted">Counter</span>
              <div class="font-semibold text-sm">${token.counterName || 'Awaiting assignment'}</div>
            </div>
            <div>
              <span class="text-xs text-muted">Queue Position</span>
              <div class="font-semibold text-sm" style="color: var(--primary-600);">
                ${token.status === 'Completed' || token.status === 'Cancelled' ? 'Closed' : '#' + qPos.position + ' (' + qPos.aheadCount + ' ahead)'}
              </div>
            </div>
            <div>
              <span class="text-xs text-muted">Estimated Wait</span>
              <div class="font-semibold text-sm" style="color: var(--accent-600);">
                ${token.status === 'Completed' || token.status === 'Cancelled' ? '--' : '~' + estWait + ' mins'}
              </div>
            </div>
            <div>
              <span class="text-xs text-muted">Purpose</span>
              <div class="text-sm" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${token.purpose}">
                ${token.purpose}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Action Listeners
    container.querySelectorAll('.btn-view-token-receipt').forEach(btn => {
      btn.addEventListener('click', () => {
        const tknId = btn.getAttribute('data-token-id');
        openTokenReceiptModal(tknId);
      });
    });

    container.querySelectorAll('.btn-cancel-token-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const tknId = btn.getAttribute('data-token-id');
        const tknNum = btn.getAttribute('data-token-num');
        openCancelConfirmationModal(tknId, tknNum);
      });
    });
  }

  // Token Filter Pills
  const tokenFilterPills = document.querySelectorAll('#my-tokens-filter-pills .filter-pill');
  tokenFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      tokenFilterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      tokensFilterStatus = pill.getAttribute('data-status');
      renderMyTokensList();
    });
  });

  // Refresh my tokens button
  const refreshTokensBtn = document.getElementById('btn-refresh-my-tokens');
  if (refreshTokensBtn) {
    refreshTokensBtn.addEventListener('click', () => {
      renderMyTokensList();
      QueueLessApp.showToast('Token queue status refreshed', 'info');
    });
  }

  // Cancel Confirmation Modal Logic
  function openCancelConfirmationModal(tokenId, tokenNumber) {
    activeTokenToCancel = tokenId;
    document.getElementById('cancel-token-number-display').textContent = tokenNumber;
    QueueLessApp.openModal('modal-cancel-token');
  }

  const confirmCancelBtn = document.getElementById('btn-confirm-cancel-token');
  if (confirmCancelBtn) {
    confirmCancelBtn.addEventListener('click', () => {
      if (!activeTokenToCancel) return;

      const tokens = window.queueLessStore.getTokens();
      const target = tokens.find(t => t.id === activeTokenToCancel);
      if (target) {
        target.status = 'Cancelled';
        target.staffNotes = 'Cancelled by student.';
        window.queueLessStore.saveTokens(tokens);

        window.queueLessStore.addNotification(
          'Token Cancelled',
          `Your token ${target.tokenNumber} for ${target.serviceName} was cancelled successfully.`,
          'info',
          'Student',
          currentUser.email
        );

        QueueLessApp.closeModal('modal-cancel-token');
        QueueLessApp.showToast(`Token ${target.tokenNumber} has been cancelled.`, 'info', 'Token Cancelled');
        refreshAllStudentViews();
      }
    });
  }

  // =========================================================================
  // VIEW 4: LIVE QUEUE TRACKER
  // =========================================================================
  function renderLiveQueueTracker() {
    const container = document.getElementById('live-tracker-main-container');
    if (!container) return;

    const allTokens = window.queueLessStore.getTokens();
    const studentTokens = allTokens.filter(t => t.studentEmail === currentUser.email);
    
    // Pick the most relevant active token (or latest completed)
    let activeToken = studentTokens.find(t => t.status === 'Called' || t.status === 'Processing');
    if (!activeToken) {
      activeToken = studentTokens.find(t => t.status === 'Waiting');
    }
    if (!activeToken) {
      activeToken = studentTokens[0]; // fallback to most recent
    }

    if (!activeToken) {
      container.innerHTML = `
        <div class="empty-state card">
          <div class="empty-state-icon"><i class="fa-solid fa-radar"></i></div>
          <h3>No Active Queue Session</h3>
          <p>You do not currently have any tokens in queue to track.</p>
          <button class="btn btn-primary btn-sm" onclick="window.location.hash='services';">
            <i class="fa-solid fa-plus-circle"></i> Generate a Token
          </button>
        </div>
      `;
      return;
    }

    const qPos = window.queueLessStore.getQueuePosition(activeToken.id);
    const estWait = window.queueLessStore.calculateEstimatedWaitTime(activeToken.serviceId, activeToken.id);
    const syncTimeEl = document.getElementById('tracker-last-sync-time');
    if (syncTimeEl) syncTimeEl.textContent = 'Last updated: ' + new Date().toLocaleTimeString();

    // Determine current step index
    // 1 = Generated, 2 = Waiting, 3 = Called, 4 = Processing, 5 = Completed
    let currentStep = 1;
    let fillWidthPercent = 0;

    if (activeToken.status === 'Waiting') {
      currentStep = 2;
      fillWidthPercent = 30;
    } else if (activeToken.status === 'Called') {
      currentStep = 3;
      fillWidthPercent = 60;
    } else if (activeToken.status === 'Processing') {
      currentStep = 4;
      fillWidthPercent = 85;
    } else if (activeToken.status === 'Completed') {
      currentStep = 5;
      fillWidthPercent = 100;
    } else if (activeToken.status === 'Cancelled') {
      currentStep = 1;
      fillWidthPercent = 0;
    }

    container.innerHTML = `
      <div class="live-tracker-card">
        <div class="tracker-hero-header">
          <div class="token-big-badge">
            <div class="token-circle-number">
              ${activeToken.tokenNumber}
            </div>
            <div class="token-summary-info">
              <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
                <span class="badge ${activeToken.status === 'Called' ? 'badge-called' : activeToken.status === 'Processing' ? 'badge-processing' : activeToken.status === 'Completed' ? 'badge-completed' : 'badge-waiting'}">
                  ${activeToken.status}
                </span>
                ${activeToken.priority ? '<span class="badge badge-priority"><i class="fa-solid fa-bolt"></i> Urgent Case</span>' : ''}
              </div>
              <h3>${activeToken.serviceName}</h3>
              <p>${activeToken.department} • Requested at ${formatDisplayTime(activeToken.createdAt)}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn btn-secondary btn-sm" id="tracker-btn-view-receipt">
              <i class="fa-solid fa-receipt"></i> View Receipt
            </button>
            ${activeToken.status === 'Waiting' ? `
              <button class="btn btn-danger btn-sm" id="tracker-btn-cancel">
                <i class="fa-solid fa-xmark"></i> Cancel Token
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 5-Stage Stepper -->
        <div class="tracker-stepper">
          <div class="stepper-progress-line">
            <div class="stepper-progress-fill" style="width: ${fillWidthPercent}%;"></div>
          </div>

          <!-- Step 1 -->
          <div class="step-node ${currentStep >= 1 ? (currentStep === 1 ? 'active' : 'completed') : ''}">
            <div class="step-icon-circle">
              <i class="fa-solid ${currentStep > 1 ? 'fa-check' : 'fa-ticket'}"></i>
            </div>
            <span class="step-title">Token Generated</span>
            <span class="step-time">${formatDisplayTime(activeToken.createdAt)}</span>
          </div>

          <!-- Step 2 -->
          <div class="step-node ${currentStep >= 2 ? (currentStep === 2 ? 'active' : 'completed') : ''}">
            <div class="step-icon-circle">
              <i class="fa-solid ${currentStep > 2 ? 'fa-check' : 'fa-hourglass-half'}"></i>
            </div>
            <span class="step-title">Waiting in Queue</span>
            <span class="step-time">${activeToken.status === 'Waiting' ? '#' + qPos.position + ' in line' : 'Queue passed'}</span>
          </div>

          <!-- Step 3 -->
          <div class="step-node ${currentStep >= 3 ? (currentStep === 3 ? 'active' : 'completed') : ''}">
            <div class="step-icon-circle">
              <i class="fa-solid ${currentStep > 3 ? 'fa-check' : 'fa-bullhorn'}"></i>
            </div>
            <span class="step-title">Your Turn (Called)</span>
            <span class="step-time">${activeToken.calledAt ? formatDisplayTime(activeToken.calledAt) : 'Upcoming'}</span>
          </div>

          <!-- Step 4 -->
          <div class="step-node ${currentStep >= 4 ? (currentStep === 4 ? 'active' : 'completed') : ''}">
            <div class="step-icon-circle">
              <i class="fa-solid ${currentStep > 4 ? 'fa-check' : 'fa-user-check'}"></i>
            </div>
            <span class="step-title">Processing</span>
            <span class="step-time">${activeToken.counterName || 'Assigned Counter'}</span>
          </div>

          <!-- Step 5 -->
          <div class="step-node ${currentStep === 5 ? 'completed' : ''}">
            <div class="step-icon-circle">
              <i class="fa-solid fa-flag-checkered"></i>
            </div>
            <span class="step-title">Completed</span>
            <span class="step-time">${activeToken.completedAt ? formatDisplayTime(activeToken.completedAt) : 'Final Step'}</span>
          </div>
        </div>

        <!-- Real-Time Metrics Deck -->
        <div class="queue-live-stats-row">
          <div class="live-metric-card">
            <span class="live-metric-label">Queue Position</span>
            <span class="live-metric-value highlight">
              ${activeToken.status === 'Processing' ? 'At Counter' : activeToken.status === 'Called' ? 'Called!' : activeToken.status === 'Completed' ? 'Completed' : '#' + qPos.position}
            </span>
          </div>
          <div class="live-metric-card">
            <span class="live-metric-label">Students Ahead</span>
            <span class="live-metric-value">
              ${activeToken.status === 'Processing' || activeToken.status === 'Called' || activeToken.status === 'Completed' ? 0 : qPos.aheadCount}
            </span>
          </div>
          <div class="live-metric-card">
            <span class="live-metric-label">Serving Token</span>
            <span class="live-metric-value" style="color: var(--accent-600);">
              ${qPos.currentlyServing || 'None'}
            </span>
          </div>
          <div class="live-metric-card">
            <span class="live-metric-label">Est. Time Remaining</span>
            <span class="live-metric-value highlight">
              ${activeToken.status === 'Completed' ? '0 min' : activeToken.status === 'Called' ? 'Now!' : '~' + estWait + ' min'}
            </span>
          </div>
          <div class="live-metric-card">
            <span class="live-metric-label">Assigned Counter</span>
            <span class="live-metric-value text-sm" style="font-weight: 700; margin-top: 0.35rem;">
              ${activeToken.counterName || 'Waiting Assignment'}
            </span>
          </div>
        </div>

        <!-- Demonstration Simulation Helper -->
        <div class="demo-simulation-bar">
          <div class="sim-label">
            <i class="fa-solid fa-laptop-code"></i>
            <span>Interactive Demo Helper: Simulate queue progress for testing without switching tabs</span>
          </div>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-outline btn-sm" id="btn-sim-advance-step">
              <i class="fa-solid fa-forward-step"></i> Advance My Token State
            </button>
          </div>
        </div>

      </div>
    `;

    // Attach actions
    const receiptBtn = container.querySelector('#tracker-btn-view-receipt');
    if (receiptBtn) {
      receiptBtn.addEventListener('click', () => openTokenReceiptModal(activeToken.id));
    }

    const cancelBtn = container.querySelector('#tracker-btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => openCancelConfirmationModal(activeToken.id, activeToken.tokenNumber));
    }

    // Demo Simulation Button
    const advanceBtn = container.querySelector('#btn-sim-advance-step');
    if (advanceBtn) {
      advanceBtn.addEventListener('click', () => {
        simulateAdvanceTokenState(activeToken.id);
      });
    }
  }

  // Refresh live tracker button
  const refreshTrackerBtn = document.getElementById('btn-refresh-live-tracker');
  if (refreshTrackerBtn) {
    refreshTrackerBtn.addEventListener('click', () => {
      renderLiveQueueTracker();
      QueueLessApp.showToast('Live queue metrics updated', 'info');
    });
  }

  // Simulate token progression for reviewers
  function simulateAdvanceTokenState(tokenId) {
    const tokens = window.queueLessStore.getTokens();
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    if (token.status === 'Waiting') {
      token.status = 'Called';
      token.calledAt = new Date().toISOString();
      token.counterId = 'cnt-1';
      token.counterName = 'Counter 1 – Certificate Section';
      window.queueLessStore.saveTokens(tokens);

      window.queueLessStore.addNotification(
        'Your Turn! Token Called',
        `Token ${token.tokenNumber} has been called! Please proceed immediately to Counter 1.`,
        'success',
        'Student',
        currentUser.email
      );

      QueueLessApp.showToast(`Token ${token.tokenNumber} is now CALLED to Counter 1!`, 'success', 'Queue Advance');
    } else if (token.status === 'Called') {
      token.status = 'Processing';
      token.startedAt = new Date().toISOString();
      window.queueLessStore.saveTokens(tokens);

      window.queueLessStore.addNotification(
        'Token Processing Started',
        `Your request for ${token.serviceName} is now being processed at Counter 1.`,
        'info',
        'Student',
        currentUser.email
      );

      QueueLessApp.showToast(`Token ${token.tokenNumber} is now being PROCESSED at the counter.`, 'info', 'Queue Advance');
    } else if (token.status === 'Processing') {
      token.status = 'Completed';
      token.completedAt = new Date().toISOString();
      token.actualDurationMins = 6;
      token.staffNotes = 'Completed and verified by staff.';
      window.queueLessStore.saveTokens(tokens);

      window.queueLessStore.addNotification(
        'Request Completed',
        `Your service request ${token.tokenNumber} has been successfully completed!`,
        'success',
        'Student',
        currentUser.email
      );

      QueueLessApp.showToast(`Token ${token.tokenNumber} has been COMPLETED!`, 'success', 'Service Finished');
    } else if (token.status === 'Completed') {
      QueueLessApp.showToast('This token is already completed.', 'info');
    }

    refreshAllStudentViews();
  }

  // =========================================================================
  // VIEW 5: REQUEST HISTORY & PRINTABLE RECEIPT
  // =========================================================================
  function renderRequestHistory() {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;

    const allTokens = window.queueLessStore.getTokens();
    let studentTokens = allTokens.filter(t => t.studentEmail === currentUser.email);

    // Filter by status
    if (historyStatusFilter !== 'all') {
      studentTokens = studentTokens.filter(t => t.status === historyStatusFilter);
    }

    // Search query
    if (historySearchQuery.trim() !== '') {
      const q = historySearchQuery.toLowerCase();
      studentTokens = studentTokens.filter(t => 
        t.tokenNumber.toLowerCase().includes(q) ||
        t.serviceName.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
      );
    }

    if (studentTokens.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--slate-400);">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            No history records found matching criteria
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = studentTokens.map(token => {
      let badgeClass = 'badge-waiting';
      if (token.status === 'Completed') badgeClass = 'badge-completed';
      else if (token.status === 'Cancelled') badgeClass = 'badge-cancelled';
      else if (token.status === 'Called') badgeClass = 'badge-called';
      else if (token.status === 'Processing') badgeClass = 'badge-processing';

      const durationStr = token.actualDurationMins ? `${token.actualDurationMins} min` : (token.status === 'Completed' ? '6 min' : '--');

      return `
        <tr>
          <td>
            <span class="token-cell-code">${token.tokenNumber}</span>
          </td>
          <td>
            <strong>${token.serviceName}</strong>
            <div class="text-xs text-muted">${token.purpose}</div>
          </td>
          <td>${token.department}</td>
          <td>
            <div>${formatDisplayTime(token.createdAt)}</div>
            <div class="text-xs text-muted">${formatDisplayDate(token.createdAt)}</div>
          </td>
          <td>${durationStr}</td>
          <td>
            <span class="badge ${badgeClass}">${token.status}</span>
          </td>
          <td>${token.counterName ? token.counterName.split('–')[0].trim() : '--'}</td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm btn-view-history-detail" data-token-id="${token.id}">
              <i class="fa-solid fa-file-lines"></i> Details
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-view-history-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const tknId = btn.getAttribute('data-token-id');
        openTokenReceiptModal(tknId);
      });
    });
  }

  // History search and filter
  const historySearch = document.getElementById('history-search-input');
  if (historySearch) {
    historySearch.addEventListener('input', (e) => {
      historySearchQuery = e.target.value;
      renderRequestHistory();
    });
  }

  const historyStatus = document.getElementById('history-status-filter');
  if (historyStatus) {
    historyStatus.addEventListener('change', (e) => {
      historyStatusFilter = e.target.value;
      renderRequestHistory();
    });
  }

  // Token Details & Printable Receipt Modal
  function openTokenReceiptModal(tokenId) {
    const tokens = window.queueLessStore.getTokens();
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    const modalBody = document.getElementById('token-details-modal-body');
    const settings = window.queueLessStore.getSettings();

    modalBody.innerHTML = `
      <div class="printable-ticket" id="receipt-printable-area">
        <div class="ticket-header">
          <div style="font-weight: 800; font-size: 1.15rem; color: var(--slate-900);">${settings.collegeName}</div>
          <div style="font-size: 0.75rem; color: var(--slate-500); margin-top: 2px;">Campus Smart Queue Management • QueueLess</div>
        </div>

        <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--slate-500);">Token Pass</div>
        <div class="ticket-token-huge">${token.tokenNumber}</div>
        <span class="badge ${token.status === 'Completed' ? 'badge-completed' : token.status === 'Cancelled' ? 'badge-cancelled' : 'badge-called'}" style="margin-bottom: 1.25rem;">
          ${token.status}
        </span>

        <div class="ticket-meta-grid">
          <div>
            <strong style="color: var(--slate-400); display: block; font-size: 0.7rem;">STUDENT NAME</strong>
            <span>${token.studentName}</span>
          </div>
          <div>
            <strong style="color: var(--slate-400); display: block; font-size: 0.7rem;">REGISTER NO</strong>
            <span>${token.registerNumber}</span>
          </div>
          <div>
            <strong style="color: var(--slate-400); display: block; font-size: 0.7rem;">SERVICE</strong>
            <span>${token.serviceName}</span>
          </div>
          <div>
            <strong style="color: var(--slate-400); display: block; font-size: 0.7rem;">DEPARTMENT</strong>
            <span>${token.department}</span>
          </div>
          <div>
            <strong style="color: var(--slate-400); display: block; font-size: 0.7rem;">ISSUED TIME</strong>
            <span>${formatDisplayTime(token.createdAt)}, ${formatDisplayDate(token.createdAt)}</span>
          </div>
          <div>
            <strong style="color: var(--slate-400); display: block; font-size: 0.7rem;">COUNTER</strong>
            <span>${token.counterName || 'To Be Assigned'}</span>
          </div>
        </div>

        <div class="ticket-qr-placeholder">
          <i class="fa-solid fa-qrcode"></i>
        </div>

        <div style="font-size: 0.72rem; color: var(--slate-500); line-height: 1.35; margin-top: 0.5rem;">
          Please display this digital receipt when your token is called at the service desk.
          ${token.remarks ? `<div style="margin-top: 0.4rem; font-style: italic;">Note: "${token.remarks}"</div>` : ''}
        </div>
      </div>
    `;

    QueueLessApp.openModal('modal-token-details');
  }

  // Print Receipt Button
  const printBtn = document.getElementById('btn-print-token-receipt');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // =========================================================================
  // VIEW 6: NOTIFICATIONS CENTER
  // =========================================================================
  function renderNotificationsCenter() {
    const container = document.getElementById('full-notifications-list-container');
    if (!container) return;

    const notifs = window.queueLessStore.getNotifications();
    const userNotifs = notifs.filter(n => n.targetRole === 'All' || n.targetRole === 'Student');

    if (userNotifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon"><i class="fa-regular fa-bell"></i></div>
          <h3>No Notifications Yet</h3>
          <p>You will receive updates when your tokens are called or processed.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column;">
        ${userNotifs.map(n => `
          <div class="notif-item ${n.read ? '' : 'unread'}" style="padding: 1.1rem 1.4rem;" data-notif-id="${n.id}">
            <div class="notif-icon ${n.type}" style="width: 36px; height: 36px; font-size: 1rem;">
              <i class="fa-solid ${n.type === 'success' ? 'fa-check' : n.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-info'}"></i>
            </div>
            <div class="notif-text">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="notif-title" style="font-size: 0.95rem;">${n.title}</div>
                <span class="text-xs text-muted">${formatDisplayTime(n.time)} • ${formatDisplayDate(n.time)}</span>
              </div>
              <div class="notif-message" style="font-size: 0.85rem; margin-top: 0.2rem;">${n.message}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const notifId = item.getAttribute('data-notif-id');
        const all = window.queueLessStore.getNotifications();
        const target = all.find(n => n.id === notifId);
        if (target && !target.read) {
          target.read = true;
          window.queueLessStore.saveNotifications(all);
          renderNotificationsCenter();
          QueueLessApp.updateNotificationBadge();
        }
      });
    });
  }

  const markAllBtn = document.getElementById('btn-page-mark-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      const all = window.queueLessStore.getNotifications();
      all.forEach(n => {
        if (n.targetRole === 'All' || n.targetRole === 'Student') n.read = true;
      });
      window.queueLessStore.saveNotifications(all);
      renderNotificationsCenter();
      QueueLessApp.updateNotificationBadge();
      QueueLessApp.showToast('All notifications marked as read', 'success');
    });
  }

  const clearNotifsBtn = document.getElementById('btn-page-clear-notifs');
  if (clearNotifsBtn) {
    clearNotifsBtn.addEventListener('click', () => {
      const all = window.queueLessStore.getNotifications();
      const remaining = all.filter(n => n.targetRole !== 'All' && n.targetRole !== 'Student');
      window.queueLessStore.saveNotifications(remaining);
      renderNotificationsCenter();
      QueueLessApp.updateNotificationBadge();
      QueueLessApp.showToast('Notification center cleared', 'info');
    });
  }

  // =========================================================================
  // VIEW 7: STUDENT PROFILE
  // =========================================================================
  function renderStudentProfile() {
    const profile = window.queueLessStore.getStudentProfile();
    if (!profile) return;

    const nameInput = document.getElementById('prof-name');
    if (nameInput) nameInput.value = profile.name;

    const regInput = document.getElementById('prof-regno');
    if (regInput) regInput.value = profile.registerNumber;

    const emailInput = document.getElementById('prof-email');
    if (emailInput) emailInput.value = profile.email;

    const phoneInput = document.getElementById('prof-phone');
    if (phoneInput) phoneInput.value = profile.phone;

    const deptInput = document.getElementById('prof-dept');
    if (deptInput) deptInput.value = profile.department;

    const yearSemInput = document.getElementById('prof-yearsem');
    if (yearSemInput) yearSemInput.value = profile.yearSemester;

    const displayReg = document.getElementById('profile-display-regno');
    if (displayReg) displayReg.textContent = profile.registerNumber;
  }

  const profileForm = document.getElementById('student-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const existing = window.queueLessStore.getStudentProfile();

      const updated = {
        ...existing,
        name: document.getElementById('prof-name').value.trim(),
        phone: document.getElementById('prof-phone').value.trim(),
        department: document.getElementById('prof-dept').value.trim(),
        yearSemester: document.getElementById('prof-yearsem').value.trim()
      };

      window.queueLessStore.saveStudentProfile(updated);

      // Update current user session
      currentUser.name = updated.name;
      currentUser.department = updated.department;
      window.queueLessStore.setAuth(currentUser);

      QueueLessApp.populateHeaderProfile();
      QueueLessApp.showToast('Profile updated successfully!', 'success', 'Profile Saved');
      renderDashboardOverview();
    });
  }

});
