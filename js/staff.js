/**
 * QueueLess - Smart College Queue and Token Management System
 * staff.js: Staff Control Console Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session Guard (Ensures logged in as Staff, or seeds demo staff)
  let currentUser = QueueLessApp.checkAuth('Staff');
  if (!currentUser) {
    const staffList = window.queueLessStore.getStaff();
    const defaultStaff = staffList[0] || {
      name: 'Mrs. Rekha Sharma',
      email: 'staff@college.edu',
      role: 'Staff',
      id: 'stf-1',
      department: 'Administrative Office'
    };
    currentUser = defaultStaff;
    window.queueLessStore.setAuth(currentUser);
  }

  // State
  let currentCounterId = 'cnt-1'; // Default Counter 1
  let selectedTokenForModal = null;
  let modalActionType = null; // 'reject' or 'request_docs'
  let queueSearchQuery = '';
  let queueDeptFilter = 'all';
  let queueStatusFilter = 'Waiting';

  // 2. Initialize Tab Routing
  QueueLessApp.initTabRouting('deck', (activeTab) => {
    refreshAllStaffViews();
  });

  // 3. Initialize Counter Toolbar
  initCounterToolbar();

  // 4. Initial Render
  refreshAllStaffViews();

  // 5. Data Sync Listener
  window.addEventListener('queueless:data-updated', () => {
    refreshAllStaffViews();
  });

  function refreshAllStaffViews() {
    renderKPIs();
    renderDeckSpotlight();
    renderDeskImmediateQueue();
    renderMasterQueueTable();
    renderCountersManagement();
    renderStaffPerformance();
    renderArchiveRequests();
    updateStaffSidebarBadges();
  }

  function updateStaffSidebarBadges() {
    const tokens = window.queueLessStore.getTokens();
    const waitingCount = tokens.filter(t => t.status === 'Waiting').length;
    const badge = document.getElementById('staff-sidebar-waiting-badge');
    if (badge) badge.textContent = waitingCount;
  }

  // =========================================================================
  // COUNTER TOOLBAR
  // =========================================================================
  function initCounterToolbar() {
    const selectEl = document.getElementById('staff-active-counter-select');
    const statusToggle = document.getElementById('staff-counter-status-toggle');
    if (!selectEl || !statusToggle) return;

    const counters = window.queueLessStore.getCounters();
    selectEl.innerHTML = counters.map(c => `
      <option value="${c.id}" ${c.id === currentCounterId ? 'selected' : ''}>
        ${c.name}
      </option>
    `).join('');

    const activeCounter = counters.find(c => c.id === currentCounterId) || counters[0];
    if (activeCounter) {
      statusToggle.value = activeCounter.status;
    }

    selectEl.addEventListener('change', (e) => {
      currentCounterId = e.target.value;
      const allCounters = window.queueLessStore.getCounters();
      const c = allCounters.find(x => x.id === currentCounterId);
      if (c) {
        statusToggle.value = c.status;
        QueueLessApp.showToast(`Switched active desk to ${c.name}`, 'info');
        refreshAllStaffViews();
      }
    });

    statusToggle.addEventListener('change', (e) => {
      const newStatus = e.target.value;
      const allCounters = window.queueLessStore.getCounters();
      const targetCounter = allCounters.find(c => c.id === currentCounterId);
      if (targetCounter) {
        targetCounter.status = newStatus;
        window.queueLessStore.saveCounters(allCounters);
        QueueLessApp.showToast(`Counter status updated to: ${newStatus}`, 'info');
        refreshAllStaffViews();
      }
    });

    // Refresh button
    const refreshBtn = document.getElementById('btn-refresh-staff-deck');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        refreshAllStaffViews();
        QueueLessApp.showToast('Staff queue metrics synced', 'info');
      });
    }

    // Demo helper: Inject a student token
    const injectBtn = document.getElementById('btn-demo-inject-student');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => {
        injectDemoStudentRequest();
      });
    }
  }

  function getActiveCounter() {
    const counters = window.queueLessStore.getCounters();
    return counters.find(c => c.id === currentCounterId) || counters[0];
  }

  // =========================================================================
  // VIEW 1: QUEUE DESK & CONTROLS
  // =========================================================================
  function renderKPIs() {
    const tokens = window.queueLessStore.getTokens();
    const activeCounter = getActiveCounter();

    const waitingTokens = tokens.filter(t => t.status === 'Waiting');
    const calledTokens = tokens.filter(t => t.status === 'Called');
    const processingTokens = tokens.filter(t => t.status === 'Processing');
    const completedTokens = tokens.filter(t => t.status === 'Completed' && (!t.counterId || t.counterId === currentCounterId));

    document.getElementById('kpi-staff-waiting').textContent = waitingTokens.length;
    document.getElementById('kpi-staff-called').textContent = calledTokens.length;
    document.getElementById('kpi-staff-processing').textContent = processingTokens.length;
    document.getElementById('kpi-staff-completed').textContent = activeCounter ? activeCounter.studentsServedToday : completedTokens.length;
    document.getElementById('kpi-staff-avg-time').textContent = '4.8 min';
  }

  function renderDeckSpotlight() {
    const spotlightEl = document.getElementById('deck-serving-spotlight');
    if (!spotlightEl) return;

    const tokens = window.queueLessStore.getTokens();
    const activeCounter = getActiveCounter();

    // Check if there is an active token at this counter (Called or Processing)
    let currentToken = tokens.find(t => 
      t.counterId === currentCounterId && 
      (t.status === 'Processing' || t.status === 'Called')
    );

    if (currentToken) {
      let statusBadge = currentToken.status === 'Processing'
        ? '<span class="badge badge-processing"><i class="fa-solid fa-spinner fa-spin"></i> Processing Application</span>'
        : '<span class="badge badge-called"><i class="fa-solid fa-bullhorn"></i> Called (Awaiting Student)</span>';

      spotlightEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap;">
          <div class="token-circle-number" style="font-size: 1.8rem; padding: 0.75rem 1.6rem;">
            ${currentToken.tokenNumber}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              ${statusBadge}
              ${currentToken.priority ? '<span class="badge badge-priority"><i class="fa-solid fa-bolt"></i> Urgent Case</span>' : ''}
              <span class="text-xs text-muted">Desk: ${activeCounter.name.split('–')[0]}</span>
            </div>
            <h3 style="font-size: 1.35rem; color: var(--slate-900);">${currentToken.studentName}</h3>
            <p class="text-xs text-muted">Reg: <strong>${currentToken.registerNumber}</strong> • ${currentToken.serviceName}</p>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <button class="btn btn-secondary btn-sm" id="spotlight-btn-inspect-docs">
            <i class="fa-solid fa-file-lines"></i> Inspect Documents
          </button>
        </div>
      `;

      const inspectBtn = spotlightEl.querySelector('#spotlight-btn-inspect-docs');
      if (inspectBtn) {
        inspectBtn.addEventListener('click', () => {
          openStaffTokenDetailsModal(currentToken.id);
        });
      }
    } else {
      spotlightEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div class="stat-icon blue" style="width: 54px; height: 54px; font-size: 1.4rem;">
            <i class="fa-solid fa-desk"></i>
          </div>
          <div>
            <h3 style="font-size: 1.2rem; color: var(--slate-900);">No Student Currently at Desk</h3>
            <p class="text-xs text-muted">Counter is ${activeCounter.status.toLowerCase()}. Click <strong>"Call Next Student"</strong> to summon the next queued token.</p>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="badge ${activeCounter.status === 'Serving' ? 'badge-serving' : activeCounter.status === 'Available' ? 'badge-available' : 'badge-paused'}">
            Counter Status: ${activeCounter.status}
          </span>
        </div>
      `;
    }
  }

  function renderDeskImmediateQueue() {
    const tbody = document.getElementById('desk-queue-table-body');
    if (!tbody) return;

    const tokens = window.queueLessStore.getTokens();
    const activeCounter = getActiveCounter();

    // Find tokens matching counter's department or active services
    const eligibleTokens = tokens.filter(t => {
      const matchesDept = t.department === activeCounter.department;
      const matchesService = activeCounter.activeServices && activeCounter.activeServices.includes(t.serviceName);
      return (matchesDept || matchesService) && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing');
    });

    // Sort: Priority tokens first, then creation time
    eligibleTokens.sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    if (eligibleTokens.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 2rem 1rem; color: var(--slate-400);">
            <i class="fa-solid fa-clipboard-check" style="font-size: 1.5rem; margin-bottom: 0.4rem; display: block;"></i>
            All queued students for this counter have been served!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = eligibleTokens.slice(0, 5).map(token => {
      const waitMins = Math.max(1, Math.round((Date.now() - new Date(token.createdAt).getTime()) / 60000));
      return `
        <tr>
          <td>
            <span class="token-cell-code">${token.tokenNumber}</span>
          </td>
          <td>
            <div class="table-student-cell">
              <span class="s-name">${token.studentName}</span>
              <span class="s-reg">${token.registerNumber}</span>
            </div>
          </td>
          <td>${token.serviceName}</td>
          <td>${waitMins} min ago</td>
          <td>
            ${token.priority ? '<span class="badge badge-priority"><i class="fa-solid fa-bolt"></i> Urgent</span>' : '<span class="text-xs text-muted">Normal</span>'}
          </td>
          <td>
            <span class="badge ${token.status === 'Waiting' ? 'badge-waiting' : token.status === 'Called' ? 'badge-called' : 'badge-processing'}">
              ${token.status}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm btn-quick-call-token" data-token-id="${token.id}" title="Call this specific student">
                <i class="fa-solid fa-bullhorn"></i> Call
              </button>
              <button class="btn btn-secondary btn-sm btn-quick-inspect-token" data-token-id="${token.id}" title="Inspect documents">
                <i class="fa-solid fa-eye"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-quick-call-token').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-token-id');
        callSpecificToken(tId);
      });
    });

    tbody.querySelectorAll('.btn-quick-inspect-token').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-token-id');
        openStaffTokenDetailsModal(tId);
      });
    });
  }

  // =========================================================================
  // STAFF ACTION CONTROLS ENGINE
  // =========================================================================
  
  // 1. CALL NEXT
  document.getElementById('btn-call-next-student').addEventListener('click', () => {
    callNextWaitingToken();
  });

  function callNextWaitingToken() {
    const activeCounter = getActiveCounter();
    if (activeCounter.status === 'Paused' || activeCounter.status === 'Offline') {
      QueueLessApp.showToast(`Cannot call student: Counter is currently ${activeCounter.status}. Change status to Serving or Available first.`, 'warning', 'Counter Paused');
      return;
    }

    const tokens = window.queueLessStore.getTokens();

    // Check if there is already a token called or processing at this desk
    const ongoing = tokens.find(t => t.counterId === currentCounterId && (t.status === 'Processing' || t.status === 'Called'));
    if (ongoing) {
      QueueLessApp.showToast(`Desk is currently engaged with ${ongoing.tokenNumber} (${ongoing.studentName}). Complete or skip it before calling the next student.`, 'warning', 'Desk Busy');
      return;
    }

    // Find candidate tokens:
    // Prioritize priority tokens matching department or counter active services, then creation time
    const eligibleWaiting = tokens.filter(t => {
      const matchesDept = t.department === activeCounter.department;
      const matchesService = activeCounter.activeServices && activeCounter.activeServices.includes(t.serviceName);
      return (matchesDept || matchesService) && t.status === 'Waiting';
    });

    if (eligibleWaiting.length === 0) {
      // If no department-specific token, check if general waiting tokens exist
      const generalWaiting = tokens.filter(t => t.status === 'Waiting');
      if (generalWaiting.length === 0) {
        QueueLessApp.showToast('No students currently waiting in queue!', 'info', 'Queue Empty');
        return;
      }
      // Offer general waiting
      eligibleWaiting.push(...generalWaiting);
    }

    // Sort: priority first, then oldest createdAt
    eligibleWaiting.sort((a, b) => {
      if (a.priority && !b.priority) return -1;
      if (!a.priority && b.priority) return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    const nextToken = eligibleWaiting[0];
    nextToken.status = 'Called';
    nextToken.calledAt = new Date().toISOString();
    nextToken.counterId = activeCounter.id;
    nextToken.counterName = activeCounter.name;

    // Update counter
    const counters = window.queueLessStore.getCounters();
    const c = counters.find(x => x.id === currentCounterId);
    if (c) {
      c.currentToken = nextToken.tokenNumber;
      c.status = 'Serving';
      window.queueLessStore.saveCounters(counters);
    }

    window.queueLessStore.saveTokens(tokens);

    // Generate Notification for Student
    window.queueLessStore.addNotification(
      'Your Turn! Token Called',
      `Token ${nextToken.tokenNumber} has been called! Please proceed immediately to ${activeCounter.name}.`,
      'success',
      'Student',
      nextToken.studentEmail
    );

    QueueLessApp.showToast(`Called Token ${nextToken.tokenNumber} (${nextToken.studentName}) to ${activeCounter.name}!`, 'success', 'Student Called');
    refreshAllStaffViews();
  }

  function callSpecificToken(tokenId) {
    const activeCounter = getActiveCounter();
    const tokens = window.queueLessStore.getTokens();
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    token.status = 'Called';
    token.calledAt = new Date().toISOString();
    token.counterId = activeCounter.id;
    token.counterName = activeCounter.name;

    const counters = window.queueLessStore.getCounters();
    const c = counters.find(x => x.id === currentCounterId);
    if (c) {
      c.currentToken = token.tokenNumber;
      c.status = 'Serving';
      window.queueLessStore.saveCounters(counters);
    }

    window.queueLessStore.saveTokens(tokens);

    window.queueLessStore.addNotification(
      'Your Turn! Token Called',
      `Token ${token.tokenNumber} has been called! Please proceed immediately to ${activeCounter.name}.`,
      'success',
      'Student',
      token.studentEmail
    );

    QueueLessApp.showToast(`Called Token ${token.tokenNumber} to ${activeCounter.name}!`, 'success');
    refreshAllStaffViews();
  }

  // 2. RECALL CURRENT
  document.getElementById('btn-recall-current-student').addEventListener('click', () => {
    const tokens = window.queueLessStore.getTokens();
    const currentToken = tokens.find(t => t.counterId === currentCounterId && (t.status === 'Called' || t.status === 'Processing'));
    
    if (!currentToken) {
      QueueLessApp.showToast('No active student currently called at this counter to recall.', 'warning');
      return;
    }

    window.queueLessStore.addNotification(
      'Second Call Reminder',
      `REMINDER: Token ${currentToken.tokenNumber} (${currentToken.serviceName}) is being recalled at Counter 1. Please proceed immediately.`,
      'warning',
      'Student',
      currentToken.studentEmail
    );

    QueueLessApp.showToast(`Recalled ${currentToken.tokenNumber}! Notification sent to ${currentToken.studentName}.`, 'info', 'Student Recalled');
  });

  // 3. START PROCESSING
  document.getElementById('btn-start-processing-student').addEventListener('click', () => {
    const tokens = window.queueLessStore.getTokens();
    const currentToken = tokens.find(t => t.counterId === currentCounterId && t.status === 'Called');

    if (!currentToken) {
      const alreadyProcessing = tokens.find(t => t.counterId === currentCounterId && t.status === 'Processing');
      if (alreadyProcessing) {
        QueueLessApp.showToast(`Token ${alreadyProcessing.tokenNumber} is already in processing state.`, 'info');
      } else {
        QueueLessApp.showToast('No called student waiting to start processing. Please call a student first.', 'warning');
      }
      return;
    }

    currentToken.status = 'Processing';
    currentToken.startedAt = new Date().toISOString();
    window.queueLessStore.saveTokens(tokens);

    window.queueLessStore.addNotification(
      'Application Processing Started',
      `Your service request ${currentToken.tokenNumber} for ${currentToken.serviceName} is now actively being processed at the counter.`,
      'info',
      'Student',
      currentToken.studentEmail
    );

    QueueLessApp.showToast(`Started processing ${currentToken.tokenNumber} (${currentToken.studentName}).`, 'success', 'Processing Started');
    refreshAllStaffViews();
  });

  // 4. MARK COMPLETED
  document.getElementById('btn-mark-completed-student').addEventListener('click', () => {
    const tokens = window.queueLessStore.getTokens();
    const currentToken = tokens.find(t => t.counterId === currentCounterId && (t.status === 'Processing' || t.status === 'Called'));

    if (!currentToken) {
      QueueLessApp.showToast('No student currently being served to complete.', 'warning');
      return;
    }

    // Calculate actual duration
    const startTime = currentToken.startedAt || currentToken.calledAt || currentToken.createdAt;
    const duration = Math.max(2, Math.round((Date.now() - new Date(startTime).getTime()) / 60000));

    currentToken.status = 'Completed';
    currentToken.completedAt = new Date().toISOString();
    currentToken.actualDurationMins = duration;
    currentToken.staffNotes = currentToken.staffNotes || 'Service completed and acknowledgement processed.';

    // Update Counter
    const counters = window.queueLessStore.getCounters();
    const c = counters.find(x => x.id === currentCounterId);
    if (c) {
      c.currentToken = null;
      c.studentsServedToday = (c.studentsServedToday || 0) + 1;
      c.status = 'Available';
      window.queueLessStore.saveCounters(counters);
    }

    window.queueLessStore.saveTokens(tokens);

    // Notify student
    window.queueLessStore.addNotification(
      'Service Request Completed',
      `Your request for ${currentToken.serviceName} (Token ${currentToken.tokenNumber}) has been completed. Thank you!`,
      'success',
      'Student',
      currentToken.studentEmail
    );

    QueueLessApp.showToast(`Completed Token ${currentToken.tokenNumber}! Duration: ${duration} mins.`, 'success', 'Service Complete');
    refreshAllStaffViews();
  });

  // 5. SKIP TOKEN
  document.getElementById('btn-skip-token-student').addEventListener('click', () => {
    const tokens = window.queueLessStore.getTokens();
    const currentToken = tokens.find(t => t.counterId === currentCounterId && (t.status === 'Called' || t.status === 'Processing'));

    if (!currentToken) {
      QueueLessApp.showToast('No student currently called to skip.', 'warning');
      return;
    }

    // Student didn't arrive, return token to waiting with lower priority or note
    currentToken.status = 'Waiting';
    currentToken.counterId = null;
    currentToken.counterName = null;
    currentToken.calledAt = null;
    currentToken.startedAt = null;
    currentToken.staffNotes = 'Skipped at desk: Student did not report on first call.';

    const counters = window.queueLessStore.getCounters();
    const c = counters.find(x => x.id === currentCounterId);
    if (c) {
      c.currentToken = null;
      c.status = 'Available';
      window.queueLessStore.saveCounters(counters);
    }

    window.queueLessStore.saveTokens(tokens);

    window.queueLessStore.addNotification(
      'Token Skipped - Please Re-report',
      `Token ${currentToken.tokenNumber} was skipped because you were not at the counter. Your token has been re-queued.`,
      'warning',
      'Student',
      currentToken.studentEmail
    );

    QueueLessApp.showToast(`Skipped Token ${currentToken.tokenNumber}. Token re-queued.`, 'warning');
    refreshAllStaffViews();
  });

  // 6. CANCEL REQUEST
  document.getElementById('btn-cancel-request-student').addEventListener('click', () => {
    const tokens = window.queueLessStore.getTokens();
    const currentToken = tokens.find(t => t.counterId === currentCounterId && (t.status === 'Called' || t.status === 'Processing'));

    if (!currentToken) {
      QueueLessApp.showToast('No student currently at counter to cancel.', 'warning');
      return;
    }

    openActionReasonModal(currentToken.id, 'reject', 'Cancel & Reject Request');
  });

  // =========================================================================
  // VIEW 2: MASTER QUEUE TABLE
  // =========================================================================
  function renderMasterQueueTable() {
    const tbody = document.getElementById('master-queue-table-body');
    if (!tbody) return;

    let tokens = window.queueLessStore.getTokens();

    // Department Filter
    if (queueDeptFilter !== 'all') {
      tokens = tokens.filter(t => t.department === queueDeptFilter);
    }

    // Status Filter
    if (queueStatusFilter !== 'all') {
      tokens = tokens.filter(t => t.status === queueStatusFilter);
    }

    // Search Query
    if (queueSearchQuery.trim() !== '') {
      const q = queueSearchQuery.toLowerCase();
      tokens = tokens.filter(t => 
        t.tokenNumber.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.registerNumber.toLowerCase().includes(q) ||
        t.serviceName.toLowerCase().includes(q)
      );
    }

    // Sort: Waiting priority first, then date
    tokens.sort((a, b) => {
      if (a.status === 'Waiting' && b.status === 'Waiting') {
        if (a.priority && !b.priority) return -1;
        if (!a.priority && b.priority) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (tokens.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 3rem 1rem; color: var(--slate-400);">
            <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
            No tokens matching filters
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = tokens.map(token => {
      let badgeClass = 'badge-waiting';
      if (token.status === 'Called') badgeClass = 'badge-called';
      else if (token.status === 'Processing') badgeClass = 'badge-processing';
      else if (token.status === 'Completed') badgeClass = 'badge-completed';
      else if (token.status === 'Cancelled') badgeClass = 'badge-cancelled';

      const waitMins = Math.max(1, Math.round((Date.now() - new Date(token.createdAt).getTime()) / 60000));

      return `
        <tr>
          <td>
            <span class="token-cell-code">${token.tokenNumber}</span>
          </td>
          <td>
            <div class="table-student-cell">
              <span class="s-name">${token.studentName}</span>
              <span class="s-reg">${token.registerNumber}</span>
            </div>
          </td>
          <td>
            <strong>${token.serviceName}</strong>
          </td>
          <td>${token.department}</td>
          <td>${formatDisplayTime(token.createdAt)}</td>
          <td>${waitMins} min</td>
          <td>
            ${token.priority ? '<span class="badge badge-priority"><i class="fa-solid fa-bolt"></i> Urgent</span>' : '<span class="text-xs text-muted">Normal</span>'}
          </td>
          <td>
            <span class="badge ${badgeClass}">${token.status}</span>
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              ${token.status === 'Waiting' ? `
                <button class="btn btn-primary btn-sm btn-table-call-token" data-token-id="${token.id}">
                  <i class="fa-solid fa-bullhorn"></i> Call
                </button>
              ` : ''}
              <button class="btn btn-secondary btn-sm btn-table-inspect-token" data-token-id="${token.id}">
                <i class="fa-solid fa-file-lines"></i> Review
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.btn-table-call-token').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-token-id');
        callSpecificToken(tId);
      });
    });

    tbody.querySelectorAll('.btn-table-inspect-token').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-token-id');
        openStaffTokenDetailsModal(tId);
      });
    });
  }

  // Filter Listeners
  const searchInput = document.getElementById('queue-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      queueSearchQuery = e.target.value;
      renderMasterQueueTable();
    });
  }

  const deptFilter = document.getElementById('queue-dept-filter');
  if (deptFilter) {
    deptFilter.addEventListener('change', (e) => {
      queueDeptFilter = e.target.value;
      renderMasterQueueTable();
    });
  }

  const statusFilter = document.getElementById('queue-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      queueStatusFilter = e.target.value;
      renderMasterQueueTable();
    });
  }

  // =========================================================================
  // VIEW 3: COUNTERS MANAGEMENT
  // =========================================================================
  function renderCountersManagement() {
    const grid = document.getElementById('counters-cards-grid');
    if (!grid) return;

    const counters = window.queueLessStore.getCounters();
    const tokens = window.queueLessStore.getTokens();

    grid.innerHTML = counters.map(counter => {
      const waitingCount = tokens.filter(t => 
        t.status === 'Waiting' && 
        (t.department === counter.department || (counter.activeServices && counter.activeServices.includes(t.serviceName)))
      ).length;

      let statusBadgeClass = 'badge-available';
      if (counter.status === 'Serving') statusBadgeClass = 'badge-serving';
      else if (counter.status === 'Paused') statusBadgeClass = 'badge-paused';
      else if (counter.status === 'Offline') statusBadgeClass = 'badge-offline';

      const isCurrentStaffCounter = counter.id === currentCounterId;

      return `
        <div class="card" style="border-top: 4px solid ${counter.status === 'Serving' ? 'var(--primary-600)' : counter.status === 'Available' ? 'var(--success-main)' : 'var(--warning-main)'};">
          <div class="card-header">
            <div>
              <span class="text-xs text-muted">Desk #${counter.number}</span>
              <h3 style="font-size: 1.15rem; color: var(--slate-900); margin-top: 0.2rem;">${counter.name}</h3>
            </div>
            <span class="badge ${statusBadgeClass}">${counter.status}</span>
          </div>

          <div style="margin-bottom: 1rem; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="text-muted">Staff Officer:</span>
              <strong>${counter.assignedStaff}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="text-muted">Department:</span>
              <span>${counter.department}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="text-muted">Current Serving:</span>
              <strong style="color: var(--primary-600);">${counter.currentToken || 'None'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem;">
              <span class="text-muted">Students Waiting:</span>
              <span class="font-semibold">${waitingCount} waiting</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span class="text-muted">Served Today:</span>
              <span>${counter.studentsServedToday || 0} students</span>
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; border-top: 1px solid var(--slate-100); padding-top: 0.9rem;">
            <button class="btn btn-secondary btn-sm btn-counter-assign-self" data-counter-id="${counter.id}" style="flex: 1;">
              ${isCurrentStaffCounter ? '<i class="fa-solid fa-check"></i> Active Desk' : 'Switch to This Desk'}
            </button>
            <button class="btn btn-outline btn-sm btn-toggle-counter-pause" data-counter-id="${counter.id}">
              ${counter.status === 'Paused' ? 'Resume' : 'Pause'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.btn-counter-assign-self').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-counter-id');
        currentCounterId = cId;
        const selectEl = document.getElementById('staff-active-counter-select');
        if (selectEl) selectEl.value = cId;
        QueueLessApp.showToast('Active desk changed.', 'info');
        refreshAllStaffViews();
      });
    });

    grid.querySelectorAll('.btn-toggle-counter-pause').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-counter-id');
        const counters = window.queueLessStore.getCounters();
        const c = counters.find(x => x.id === cId);
        if (c) {
          c.status = c.status === 'Paused' ? 'Available' : 'Paused';
          window.queueLessStore.saveCounters(counters);
          QueueLessApp.showToast(`Counter ${c.number} ${c.status.toLowerCase()}.`, 'info');
          refreshAllStaffViews();
        }
      });
    });
  }

  // =========================================================================
  // VIEW 4: PERFORMANCE & CHARTS
  // =========================================================================
  function renderStaffPerformance() {
    // 1. Service distribution bar chart
    const chartService = document.getElementById('chart-staff-service-distribution');
    if (chartService) {
      const services = [
        { name: 'Bonafide Certificate', count: 12, pct: 85 },
        { name: 'Fee Payment Receipt', count: 8, pct: 60 },
        { name: 'Semester Marksheet', count: 6, pct: 45 },
        { name: 'Transfer Certificate (TC)', count: 4, pct: 30 },
        { name: 'General Enquiries', count: 3, pct: 25 }
      ];

      chartService.innerHTML = services.map(s => `
        <div class="chart-row">
          <div class="chart-row-label">
            <span>${s.name}</span>
            <span>${s.count} served</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${s.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 2. Counter utilization bar chart
    const chartUtil = document.getElementById('chart-staff-utilization');
    if (chartUtil) {
      const counters = [
        { name: 'Counter 1 (Certificate Section)', pct: 92 },
        { name: 'Counter 2 (Accounts & Finance)', pct: 88 },
        { name: 'Counter 3 (Examination Cell)', pct: 75 },
        { name: 'Counter 4 (Student Support)', pct: 68 }
      ];

      chartUtil.innerHTML = counters.map(c => `
        <div class="chart-row">
          <div class="chart-row-label">
            <span>${c.name}</span>
            <span>${c.pct}% efficiency</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill violet" style="width: ${c.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 3. Staff Summary Table
    const staffTbody = document.getElementById('staff-summary-table-body');
    if (staffTbody) {
      const staffList = window.queueLessStore.getStaff();
      staffTbody.innerHTML = staffList.map(s => `
        <tr>
          <td><strong>${s.name}</strong></td>
          <td>${s.assignedCounterId ? 'Counter ' + s.assignedCounterId.replace('cnt-', '') : 'Desk 1'}</td>
          <td>${s.department}</td>
          <td><strong style="color: var(--primary-600);">${s.servedCount} students</strong></td>
          <td>${s.avgTimeMins} mins</td>
          <td><span class="badge badge-completed">Active</span></td>
        </tr>
      `).join('');
    }
  }

  // =========================================================================
  // VIEW 5: ARCHIVE REQUESTS
  // =========================================================================
  function renderArchiveRequests() {
    const tbody = document.getElementById('archive-requests-table-body');
    if (!tbody) return;

    const tokens = window.queueLessStore.getTokens();
    const closed = tokens.filter(t => t.status === 'Completed' || t.status === 'Cancelled');

    if (closed.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 2rem; color: var(--slate-400);">
            No archived requests yet
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = closed.map(t => `
      <tr>
        <td><span class="token-cell-code">${t.tokenNumber}</span></td>
        <td>
          <div class="table-student-cell">
            <span class="s-name">${t.studentName}</span>
            <span class="s-reg">${t.registerNumber}</span>
          </div>
        </td>
        <td>${t.serviceName}</td>
        <td>${t.counterName || '--'}</td>
        <td>${t.actualDurationMins ? t.actualDurationMins + ' min' : '5 min'}</td>
        <td><span class="badge ${t.status === 'Completed' ? 'badge-completed' : 'badge-cancelled'}">${t.status}</span></td>
        <td><span class="text-xs text-muted">${t.staffNotes || 'Processed successfully.'}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm btn-inspect-archive" data-token-id="${t.id}">
            <i class="fa-solid fa-eye"></i> Details
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-inspect-archive').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = btn.getAttribute('data-token-id');
        openStaffTokenDetailsModal(tId);
      });
    });
  }

  // =========================================================================
  // SERVICE REQUEST INSPECTION MODAL
  // =========================================================================
  function openStaffTokenDetailsModal(tokenId) {
    const tokens = window.queueLessStore.getTokens();
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return;

    selectedTokenForModal = token;
    const bodyEl = document.getElementById('staff-token-details-modal-body');
    const footerEl = document.getElementById('staff-token-details-modal-footer');

    const services = window.queueLessStore.getServices();
    const service = services.find(s => s.id === token.serviceId);

    bodyEl.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; margin-bottom: 1.4rem;">
        <div style="background: var(--slate-50); border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 1.1rem;">
          <div class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem;">Student Profile</div>
          <div style="font-size: 1.15rem; font-weight: 700; color: var(--slate-900);">${token.studentName}</div>
          <div class="text-sm text-muted">Register Number: <strong>${token.registerNumber}</strong></div>
          <div class="text-sm text-muted">Email: ${token.studentEmail}</div>
          <div class="text-sm text-muted">Department: ${token.department}</div>
        </div>

        <div style="background: var(--primary-50); border: 1px solid var(--primary-200); border-radius: var(--radius-md); padding: 1.1rem;">
          <div class="text-xs text-muted" style="text-transform: uppercase; font-weight: 700; margin-bottom: 0.5rem; color: var(--primary-700);">Token Assignment</div>
          <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary-700);">${token.tokenNumber}</div>
          <div class="text-sm">Status: <strong class="badge ${token.status === 'Completed' ? 'badge-completed' : token.status === 'Cancelled' ? 'badge-cancelled' : 'badge-called'}">${token.status}</strong></div>
          <div class="text-xs text-muted" style="margin-top: 0.35rem;">Issued: ${formatDisplayTime(token.createdAt)}, ${formatDisplayDate(token.createdAt)}</div>
        </div>
      </div>

      <div style="margin-bottom: 1.2rem;">
        <div class="form-label">Service Requested</div>
        <div style="font-weight: 700; font-size: 1.05rem; color: var(--slate-900);">${token.serviceName}</div>
      </div>

      <div style="margin-bottom: 1.2rem;">
        <div class="form-label">Stated Purpose of Application</div>
        <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.9rem;">
          ${token.purpose}
        </div>
      </div>

      ${token.remarks ? `
        <div style="margin-bottom: 1.2rem;">
          <div class="form-label">Student Remarks</div>
          <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.85rem; color: var(--slate-700);">
            ${token.remarks}
          </div>
        </div>
      ` : ''}

      <div style="margin-bottom: 1.2rem;">
        <div class="form-label">Attached Document Checklist Status</div>
        <div class="checklist-container">
          ${service && service.documentsRequired ? service.documentsRequired.map(doc => `
            <div class="check-item">
              <i class="fa-solid fa-square-check" style="color: var(--success-main); font-size: 1.1rem;"></i>
              <span>${doc} (Attached and declared verified)</span>
            </div>
          `).join('') : `
            <div class="check-item">
              <i class="fa-solid fa-square-check" style="color: var(--success-main); font-size: 1.1rem;"></i>
              <span>Student ID Card physical verification required</span>
            </div>
          `}
        </div>
      </div>

      ${token.staffNotes ? `
        <div style="margin-bottom: 1.2rem;">
          <div class="form-label">Processing History & Staff Remarks</div>
          <div style="background: var(--slate-100); border-radius: var(--radius-md); padding: 0.75rem 1rem; font-size: 0.82rem; color: var(--slate-700);">
            ${token.staffNotes}
          </div>
        </div>
      ` : ''}
    `;

    // Dynamic Action Buttons
    if (token.status === 'Waiting' || token.status === 'Called') {
      footerEl.innerHTML = `
        <button type="button" class="btn btn-secondary" data-modal-close="modal-staff-token-details">Close</button>
        <button type="button" class="btn btn-warning" id="modal-btn-request-more-docs">
          <i class="fa-solid fa-file-circle-question"></i> Request More Docs
        </button>
        <button type="button" class="btn btn-danger" id="modal-btn-reject-request">
          <i class="fa-solid fa-ban"></i> Reject Request
        </button>
        <button type="button" class="btn btn-primary" id="modal-btn-call-from-details">
          <i class="fa-solid fa-bullhorn"></i> Call Student Now
        </button>
      `;

      footerEl.querySelector('#modal-btn-call-from-details').addEventListener('click', () => {
        QueueLessApp.closeModal('modal-staff-token-details');
        callSpecificToken(token.id);
      });

      footerEl.querySelector('#modal-btn-reject-request').addEventListener('click', () => {
        QueueLessApp.closeModal('modal-staff-token-details');
        openActionReasonModal(token.id, 'reject', 'Reject Application');
      });

      footerEl.querySelector('#modal-btn-request-more-docs').addEventListener('click', () => {
        QueueLessApp.closeModal('modal-staff-token-details');
        openActionReasonModal(token.id, 'request_docs', 'Request Additional Documents');
      });

    } else if (token.status === 'Processing') {
      footerEl.innerHTML = `
        <button type="button" class="btn btn-secondary" data-modal-close="modal-staff-token-details">Close</button>
        <button type="button" class="btn btn-danger" id="modal-btn-reject-request">
          <i class="fa-solid fa-ban"></i> Reject
        </button>
        <button type="button" class="btn btn-success" id="modal-btn-complete-from-details">
          <i class="fa-solid fa-check-double"></i> Mark Completed & Issue
        </button>
      `;

      footerEl.querySelector('#modal-btn-complete-from-details').addEventListener('click', () => {
        QueueLessApp.closeModal('modal-staff-token-details');
        document.getElementById('btn-mark-completed-student').click();
      });

      footerEl.querySelector('#modal-btn-reject-request').addEventListener('click', () => {
        QueueLessApp.closeModal('modal-staff-token-details');
        openActionReasonModal(token.id, 'reject', 'Reject Application');
      });
    } else {
      footerEl.innerHTML = `
        <button type="button" class="btn btn-secondary" data-modal-close="modal-staff-token-details">Close</button>
      `;
    }

    QueueLessApp.openModal('modal-staff-token-details');
  }

  // =========================================================================
  // ACTION REASON MODAL (REJECT / REQUEST DOCS)
  // =========================================================================
  function openActionReasonModal(tokenId, actionType, title) {
    selectedTokenForModal = tokenId;
    modalActionType = actionType;

    document.getElementById('reason-modal-title').textContent = title;
    document.getElementById('staff-action-reason-text').value = '';

    const instructionsEl = document.getElementById('reason-modal-instructions');
    if (actionType === 'reject') {
      instructionsEl.textContent = 'Please state why this application is being rejected. The student will be notified.';
    } else {
      instructionsEl.textContent = 'Specify which additional documents or clearances the student must submit before processing.';
    }

    QueueLessApp.openModal('modal-staff-action-reason');
  }

  const submitReasonBtn = document.getElementById('btn-submit-staff-reason');
  if (submitReasonBtn) {
    submitReasonBtn.addEventListener('click', () => {
      const reason = document.getElementById('staff-action-reason-text').value.trim();
      if (!reason) {
        QueueLessApp.showToast('Please provide an administrative reason.', 'error');
        return;
      }

      const tokens = window.queueLessStore.getTokens();
      const target = tokens.find(t => t.id === selectedTokenForModal);
      if (!target) return;

      if (modalActionType === 'reject') {
        target.status = 'Cancelled';
        target.staffNotes = 'Rejected: ' + reason;

        // Clear active counter if this token was at desk
        const counters = window.queueLessStore.getCounters();
        const c = counters.find(x => x.currentToken === target.tokenNumber);
        if (c) {
          c.currentToken = null;
          c.status = 'Available';
          window.queueLessStore.saveCounters(counters);
        }

        window.queueLessStore.addNotification(
          'Service Request Rejected',
          `Your request for ${target.serviceName} (${target.tokenNumber}) was rejected. Reason: ${reason}`,
          'warning',
          'Student',
          target.studentEmail
        );

        QueueLessApp.showToast(`Token ${target.tokenNumber} rejected and cancelled.`, 'info');
      } else if (modalActionType === 'request_docs') {
        target.documentsVerified = false;
        target.staffNotes = 'Additional documents requested: ' + reason;

        window.queueLessStore.addNotification(
          'Additional Documents Required',
          `Action required for token ${target.tokenNumber}: Please submit ${reason}.`,
          'warning',
          'Student',
          target.studentEmail
        );

        QueueLessApp.showToast(`Requested additional documents for ${target.tokenNumber}.`, 'info');
      }

      window.queueLessStore.saveTokens(tokens);
      QueueLessApp.closeModal('modal-staff-action-reason');
      refreshAllStaffViews();
    });
  }

  // =========================================================================
  // FLAG URGENT ADMINISTRATIVE PRIORITY MODAL
  // =========================================================================
  const flagPriorityBtn = document.getElementById('btn-flag-urgent-priority-modal');
  if (flagPriorityBtn) {
    flagPriorityBtn.addEventListener('click', () => {
      const tokens = window.queueLessStore.getTokens();
      const waitingTokens = tokens.filter(t => t.status === 'Waiting');

      const selectEl = document.getElementById('priority-token-select');
      if (waitingTokens.length === 0) {
        QueueLessApp.showToast('No waiting tokens available to prioritize.', 'warning');
        return;
      }

      selectEl.innerHTML = waitingTokens.map(t => `
        <option value="${t.id}">${t.tokenNumber} – ${t.studentName} (${t.serviceName})</option>
      `).join('');

      document.getElementById('priority-reason-input').value = '';
      QueueLessApp.openModal('modal-urgent-priority');
    });
  }

  const submitPriorityBtn = document.getElementById('btn-submit-urgent-priority');
  if (submitPriorityBtn) {
    submitPriorityBtn.addEventListener('click', () => {
      const selectEl = document.getElementById('priority-token-select');
      const reasonInput = document.getElementById('priority-reason-input');

      const tId = selectEl.value;
      const reason = reasonInput.value.trim();

      if (!reason) {
        QueueLessApp.showToast('Administrative justification is required for queue priority.', 'error');
        return;
      }

      const tokens = window.queueLessStore.getTokens();
      const token = tokens.find(t => t.id === tId);
      if (token) {
        token.priority = true;
        token.priorityReason = reason;
        token.staffNotes = (token.staffNotes ? token.staffNotes + '; ' : '') + 'Flagged urgent priority: ' + reason;
        window.queueLessStore.saveTokens(tokens);

        window.queueLessStore.addNotification(
          'Urgent Priority Assigned',
          `Token ${token.tokenNumber} (${token.studentName}) has been prioritized. Reason: ${reason}`,
          'warning',
          'Staff'
        );

        QueueLessApp.closeModal('modal-urgent-priority');
        QueueLessApp.showToast(`Token ${token.tokenNumber} prioritized with high queue rank!`, 'success');
        refreshAllStaffViews();
      }
    });
  }

  // =========================================================================
  // DEMO HELPER: INJECT NEW STUDENT REQUEST
  // =========================================================================
  function injectDemoStudentRequest() {
    const mockStudents = [
      { name: 'Kavita Pillai', reg: '22BCE1140', email: 'kavita.p@college.edu', srv: 'srv-1', purpose: 'Passport verification' },
      { name: 'Siddharth Varma', reg: '21BME1082', email: 'sid.v@college.edu', srv: 'srv-6', purpose: 'Duplicate fee challan' },
      { name: 'Ananya Roy', reg: '23BIT1019', email: 'ananya.r@college.edu', srv: 'srv-5', purpose: 'Semester marksheet copy' },
      { name: 'Gautam Nair', reg: '22BEE1051', email: 'gautam.n@college.edu', srv: 'srv-11', purpose: 'Lost ID card replacement' }
    ];

    const pick = mockStudents[Math.floor(Math.random() * mockStudents.length)];
    const services = window.queueLessStore.getServices();
    const service = services.find(s => s.id === pick.srv) || services[0];

    const tokenNumber = window.queueLessStore.generateNextTokenNumber(service.prefix);

    const newToken = {
      id: 'tok-' + Date.now(),
      tokenNumber: tokenNumber,
      serviceId: service.id,
      serviceName: service.name,
      department: service.department,
      studentName: pick.name,
      registerNumber: pick.reg,
      studentEmail: pick.email,
      purpose: pick.purpose,
      remarks: 'Walk-in student request simulated via Staff console',
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

    window.queueLessStore.addNotification(
      'New Student In Queue',
      `New request ${tokenNumber} for ${service.name} added by ${pick.name}.`,
      'info',
      'Staff'
    );

    QueueLessApp.showToast(`New student simulated: ${pick.name} (${tokenNumber}) in queue!`, 'success');
    refreshAllStaffViews();
  }

});
