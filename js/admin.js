/**
 * QueueLess - Smart College Queue and Token Management System
 * admin.js: Administrator Command Center Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Session Guard (Ensures logged in as Admin, or seeds demo admin)
  let currentUser = QueueLessApp.checkAuth('Admin');
  if (!currentUser) {
    currentUser = {
      name: 'Dr. K. Narayanan (Dean)',
      email: 'admin@college.edu',
      role: 'Admin',
      id: 'ADM-001',
      department: 'College Administration'
    };
    window.queueLessStore.setAuth(currentUser);
  }

  // State
  let serviceSearchQuery = '';
  let editingServiceId = null;
  let analyticsTimeframe = 'today';

  // 2. Initialize Tab Routing
  QueueLessApp.initTabRouting('overview', (activeTab) => {
    refreshAllAdminViews();
  });

  // 3. Initial Render
  refreshAllAdminViews();

  // 4. Data Sync Listener
  window.addEventListener('queueless:data-updated', () => {
    refreshAllAdminViews();
  });

  function refreshAllAdminViews() {
    renderAdminKPIs();
    renderOverviewCountersSummary();
    renderOverviewDemandChart();
    renderServicesManagement();
    renderStaffManagement();
    renderCountersConfig();
    renderAnalyticsCharts();
    renderSystemSettings();
    updateAdminBadges();
  }

  function updateAdminBadges() {
    const services = window.queueLessStore.getServices();
    const staff = window.queueLessStore.getStaff();

    const srvBadge = document.getElementById('admin-badge-services-count');
    if (srvBadge) srvBadge.textContent = services.length;

    const stfBadge = document.getElementById('admin-badge-staff-count');
    if (stfBadge) stfBadge.textContent = staff.length;
  }

  // =========================================================================
  // VIEW 1: SYSTEM OVERVIEW
  // =========================================================================
  function renderAdminKPIs() {
    const tokens = window.queueLessStore.getTokens();
    const counters = window.queueLessStore.getCounters();

    const activeTokens = tokens.filter(t => t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing');
    const waitingTokens = tokens.filter(t => t.status === 'Waiting');
    const completedTokens = tokens.filter(t => t.status === 'Completed');

    // Total served today: sum of counters served count or tokens
    let totalServed = 0;
    counters.forEach(c => totalServed += (c.studentsServedToday || 0));
    if (totalServed < completedTokens.length) totalServed = completedTokens.length;

    document.getElementById('admin-kpi-served-today').textContent = totalServed;
    document.getElementById('admin-kpi-active-tokens').textContent = activeTokens.length;
    document.getElementById('admin-kpi-total-counters').textContent = counters.length;
    document.getElementById('admin-kpi-pending-requests').textContent = waitingTokens.length;

    // Average wait time
    document.getElementById('admin-kpi-avg-wait').textContent = '5.4 min';

    // Sync button
    const syncBtn = document.getElementById('btn-admin-sync');
    if (syncBtn) {
      syncBtn.addEventListener('click', () => {
        refreshAllAdminViews();
        QueueLessApp.showToast('Administrator metrics synced', 'info');
      });
    }
  }

  function renderOverviewCountersSummary() {
    const tbody = document.getElementById('admin-counters-summary-tbody');
    if (!tbody) return;

    const counters = window.queueLessStore.getCounters();
    tbody.innerHTML = counters.map(c => `
      <tr>
        <td><strong>Counter ${c.number}</strong></td>
        <td>${c.department}</td>
        <td>${c.assignedStaff}</td>
        <td><strong style="color: var(--primary-600);">${c.currentToken || 'None'}</strong></td>
        <td>
          <span class="badge ${c.status === 'Serving' ? 'badge-serving' : c.status === 'Available' ? 'badge-available' : 'badge-paused'}">
            ${c.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  function renderOverviewDemandChart() {
    const chartEl = document.getElementById('admin-quick-breakdown-chart');
    if (!chartEl) return;

    const departments = [
      { name: 'Admin Office', count: 32, pct: 90 },
      { name: 'Accounts & Finance', count: 24, pct: 70 },
      { name: 'Examination Cell', count: 18, pct: 55 },
      { name: 'Student Support', count: 14, pct: 40 }
    ];

    chartEl.innerHTML = departments.map(d => `
      <div class="chart-row">
        <div class="chart-row-label">
          <span>${d.name}</span>
          <span>${d.count} requests</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${d.pct}%;"></div>
        </div>
      </div>
    `).join('');
  }

  // =========================================================================
  // VIEW 2: SERVICE MANAGEMENT
  // =========================================================================
  function renderServicesManagement() {
    const tbody = document.getElementById('admin-services-table-body');
    if (!tbody) return;

    let services = window.queueLessStore.getServices();
    const tokens = window.queueLessStore.getTokens();

    if (serviceSearchQuery.trim() !== '') {
      const q = serviceSearchQuery.toLowerCase();
      services = services.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.department.toLowerCase().includes(q) ||
        s.prefix.toLowerCase().includes(q)
      );
    }

    tbody.innerHTML = services.map(s => {
      const activeQueueCount = tokens.filter(t => t.serviceId === s.id && (t.status === 'Waiting' || t.status === 'Called' || t.status === 'Processing')).length;

      return `
        <tr>
          <td><span class="token-cell-code">${s.prefix}</span></td>
          <td>
            <strong>${s.name}</strong>
            <div class="text-xs text-muted">${s.description}</div>
          </td>
          <td>${s.department}</td>
          <td>${s.avgDuration} mins</td>
          <td>${s.maxCapacity} tokens/day</td>
          <td><strong style="color: var(--primary-600);">${activeQueueCount} in line</strong></td>
          <td>
            <span class="badge ${s.isActive ? 'badge-available' : 'badge-offline'}">
              ${s.isActive ? 'Active' : 'Disabled'}
            </span>
          </td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn btn-secondary btn-sm btn-edit-service" data-service-id="${s.id}">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
              <button class="btn btn-outline btn-sm btn-toggle-service" data-service-id="${s.id}">
                ${s.isActive ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>'}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach listeners
    tbody.querySelectorAll('.btn-edit-service').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-service-id');
        openEditServiceModal(sId);
      });
    });

    tbody.querySelectorAll('.btn-toggle-service').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-service-id');
        toggleServiceStatus(sId);
      });
    });
  }

  // Search input
  const srvSearch = document.getElementById('admin-services-search');
  if (srvSearch) {
    srvSearch.addEventListener('input', (e) => {
      serviceSearchQuery = e.target.value;
      renderServicesManagement();
    });
  }

  // Add Service Modal Trigger
  const addServiceBtn = document.getElementById('btn-admin-add-service-modal');
  if (addServiceBtn) {
    addServiceBtn.addEventListener('click', () => {
      editingServiceId = null;
      document.getElementById('modal-service-title').innerHTML = '<i class="fa-solid fa-plus" style="color: var(--primary-600);"></i> Add New College Service';
      document.getElementById('manage-service-id').value = '';
      document.getElementById('srv-input-name').value = '';
      document.getElementById('srv-input-dept').value = 'Administrative Office';
      document.getElementById('srv-input-prefix').value = '';
      document.getElementById('srv-input-desc').value = '';
      document.getElementById('srv-input-duration').value = '6';
      document.getElementById('srv-input-capacity').value = '50';
      document.getElementById('srv-input-active').checked = true;

      QueueLessApp.openModal('modal-service-form');
    });
  }

  function openEditServiceModal(serviceId) {
    const services = window.queueLessStore.getServices();
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    editingServiceId = service.id;
    document.getElementById('modal-service-title').innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: var(--primary-600);"></i> Edit College Service';
    document.getElementById('manage-service-id').value = service.id;
    document.getElementById('srv-input-name').value = service.name;
    document.getElementById('srv-input-dept').value = service.department;
    document.getElementById('srv-input-prefix').value = service.prefix;
    document.getElementById('srv-input-desc').value = service.description;
    document.getElementById('srv-input-duration').value = service.avgDuration;
    document.getElementById('srv-input-capacity').value = service.maxCapacity;
    document.getElementById('srv-input-active').checked = service.isActive;

    QueueLessApp.openModal('modal-service-form');
  }

  function toggleServiceStatus(serviceId) {
    const services = window.queueLessStore.getServices();
    const service = services.find(s => s.id === serviceId);
    if (service) {
      service.isActive = !service.isActive;
      window.queueLessStore.saveServices(services);
      QueueLessApp.showToast(`Service "${service.name}" ${service.isActive ? 'Enabled' : 'Disabled'}.`, 'info');
      refreshAllAdminViews();
    }
  }

  // Save Service Form Submit
  const serviceForm = document.getElementById('form-manage-service');
  if (serviceForm) {
    serviceForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const services = window.queueLessStore.getServices();

      const name = document.getElementById('srv-input-name').value.trim();
      const dept = document.getElementById('srv-input-dept').value;
      const prefix = document.getElementById('srv-input-prefix').value.trim().toUpperCase();
      const desc = document.getElementById('srv-input-desc').value.trim();
      const duration = parseInt(document.getElementById('srv-input-duration').value, 10) || 5;
      const capacity = parseInt(document.getElementById('srv-input-capacity').value, 10) || 50;
      const isActive = document.getElementById('srv-input-active').checked;

      if (!name || !prefix) {
        QueueLessApp.showToast('Please provide both name and prefix.', 'error');
        return;
      }

      if (editingServiceId) {
        // Edit
        const target = services.find(s => s.id === editingServiceId);
        if (target) {
          target.name = name;
          target.department = dept;
          target.prefix = prefix;
          target.description = desc;
          target.avgDuration = duration;
          target.maxCapacity = capacity;
          target.isActive = isActive;
        }
        QueueLessApp.showToast(`Service "${name}" updated successfully.`, 'success');
      } else {
        // Add
        const newService = {
          id: 'srv-' + (services.length + 1) + '-' + Date.now(),
          code: prefix,
          name: name,
          department: dept,
          icon: 'fa-file-lines',
          description: desc,
          avgDuration: duration,
          maxCapacity: capacity,
          prefix: prefix,
          documentsRequired: ['Student ID Card Copy'],
          isActive: isActive
        };
        services.push(newService);
        QueueLessApp.showToast(`New service "${name}" created!`, 'success');
      }

      window.queueLessStore.saveServices(services);
      QueueLessApp.closeModal('modal-service-form');
      refreshAllAdminViews();
    });
  }

  // =========================================================================
  // VIEW 3: STAFF & COUNTER MANAGEMENT
  // =========================================================================
  function renderStaffManagement() {
    const tbody = document.getElementById('admin-staff-management-tbody');
    if (!tbody) return;

    const staffList = window.queueLessStore.getStaff();
    tbody.innerHTML = staffList.map(s => `
      <tr>
        <td><strong>${s.name}</strong></td>
        <td>${s.email}</td>
        <td>${s.department}</td>
        <td>${s.assignedCounterId ? 'Counter ' + s.assignedCounterId.replace('cnt-', '') : 'Unassigned'}</td>
        <td><strong style="color: var(--primary-600);">${s.servedCount || 0} served</strong></td>
        <td>${s.avgTimeMins || 5} min</td>
        <td><span class="badge ${s.status === 'Active' ? 'badge-completed' : 'badge-offline'}">${s.status}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm btn-toggle-staff-status" data-staff-id="${s.id}">
            ${s.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-toggle-staff-status').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = btn.getAttribute('data-staff-id');
        const list = window.queueLessStore.getStaff();
        const member = list.find(x => x.id === sId);
        if (member) {
          member.status = member.status === 'Active' ? 'Inactive' : 'Active';
          window.queueLessStore.saveStaff(list);
          QueueLessApp.showToast(`Staff account ${member.name} set to ${member.status}.`, 'info');
          refreshAllAdminViews();
        }
      });
    });
  }

  function renderCountersConfig() {
    const tbody = document.getElementById('admin-counters-config-tbody');
    if (!tbody) return;

    const counters = window.queueLessStore.getCounters();
    tbody.innerHTML = counters.map(c => `
      <tr>
        <td><strong>#${c.number}</strong></td>
        <td>${c.name}</td>
        <td>${c.department}</td>
        <td>${c.assignedStaff}</td>
        <td>
          <span class="badge ${c.status === 'Serving' ? 'badge-serving' : c.status === 'Available' ? 'badge-available' : 'badge-paused'}">
            ${c.status}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm btn-toggle-admin-counter" data-counter-id="${c.id}">
            Toggle State
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-toggle-admin-counter').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-counter-id');
        const list = window.queueLessStore.getCounters();
        const counter = list.find(x => x.id === cId);
        if (counter) {
          counter.status = counter.status === 'Available' ? 'Serving' : (counter.status === 'Serving' ? 'Paused' : 'Available');
          window.queueLessStore.saveCounters(list);
          QueueLessApp.showToast(`Counter ${counter.number} status changed to ${counter.status}`, 'info');
          refreshAllAdminViews();
        }
      });
    });
  }

  // Add Staff Modal Trigger
  const addStaffBtn = document.getElementById('btn-admin-add-staff-modal');
  if (addStaffBtn) {
    addStaffBtn.addEventListener('click', () => {
      document.getElementById('stf-input-name').value = '';
      document.getElementById('stf-input-email').value = '';
      QueueLessApp.openModal('modal-staff-form');
    });
  }

  const staffForm = document.getElementById('form-manage-staff');
  if (staffForm) {
    staffForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('stf-input-name').value.trim();
      const email = document.getElementById('stf-input-email').value.trim();
      const dept = document.getElementById('stf-input-dept').value;
      const counterId = document.getElementById('stf-input-counter').value;

      if (!name || !email) {
        QueueLessApp.showToast('Please provide name and email.', 'error');
        return;
      }

      const staffList = window.queueLessStore.getStaff();
      const newStaff = {
        id: 'stf-' + (staffList.length + 1) + '-' + Date.now(),
        name: name,
        email: email,
        role: 'Staff',
        department: dept,
        assignedCounterId: counterId,
        status: 'Active',
        servedCount: 0,
        avgTimeMins: 5.0
      };

      staffList.push(newStaff);
      window.queueLessStore.saveStaff(staffList);

      QueueLessApp.closeModal('modal-staff-form');
      QueueLessApp.showToast(`Staff member ${name} created and assigned!`, 'success');
      refreshAllAdminViews();
    });
  }

  // =========================================================================
  // VIEW 4: QUEUE ANALYTICS
  // =========================================================================
  function renderAnalyticsCharts() {
    // 1. Service volume
    const srvVolChart = document.getElementById('chart-analytics-service-volume');
    if (srvVolChart) {
      const data = [
        { name: 'Bonafide Certificate', count: 34, pct: 92 },
        { name: 'Fee Receipts', count: 26, pct: 70 },
        { name: 'Semester Marksheets', count: 21, pct: 56 },
        { name: 'Transfer Certificate (TC)', count: 12, pct: 32 },
        { name: 'Conduct Certificate', count: 8, pct: 22 }
      ];

      srvVolChart.innerHTML = data.map(d => `
        <div class="chart-row">
          <div class="chart-row-label">
            <span>${d.name}</span>
            <span>${d.count} requests</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill" style="width: ${d.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 2. Wait by department
    const waitDeptChart = document.getElementById('chart-analytics-wait-by-dept');
    if (waitDeptChart) {
      const data = [
        { name: 'Administrative Office', mins: 4.8, pct: 45 },
        { name: 'Accounts & Finance', mins: 5.5, pct: 55 },
        { name: 'Examination Cell', mins: 6.2, pct: 62 },
        { name: 'Student Support Desk', mins: 3.9, pct: 38 }
      ];

      waitDeptChart.innerHTML = data.map(d => `
        <div class="chart-row">
          <div class="chart-row-label">
            <span>${d.name}</span>
            <span>${d.mins} min average</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill violet" style="width: ${d.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 3. Hourly demand
    const hourlyChart = document.getElementById('chart-analytics-hourly-demand');
    if (hourlyChart) {
      const data = [
        { hour: '09:00 AM - 10:00 AM (Opening)', pct: 40, count: 16 },
        { hour: '10:00 AM - 11:00 AM', pct: 65, count: 26 },
        { hour: '11:00 AM - 12:00 PM (Peak)', pct: 95, count: 38 },
        { hour: '12:00 PM - 01:00 PM (Peak)', pct: 88, count: 35 },
        { hour: '02:00 PM - 03:00 PM (Afternoon)', pct: 50, count: 20 },
        { hour: '03:00 PM - 04:30 PM (Closing)', pct: 30, count: 12 }
      ];

      hourlyChart.innerHTML = data.map(d => `
        <div class="chart-row">
          <div class="chart-row-label">
            <span>${d.hour}</span>
            <span>${d.count} tokens</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill amber" style="width: ${d.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }

    // 4. Counter Utilization
    const utilChart = document.getElementById('chart-analytics-counter-util');
    if (utilChart) {
      const data = [
        { name: 'Counter 1 – Certificate Section', pct: 94 },
        { name: 'Counter 2 – Accounts Office', pct: 89 },
        { name: 'Counter 3 – Examination Cell', pct: 78 },
        { name: 'Counter 4 – Student Support', pct: 68 }
      ];

      utilChart.innerHTML = data.map(d => `
        <div class="chart-row">
          <div class="chart-row-label">
            <span>${d.name}</span>
            <span>${d.pct}% active</span>
          </div>
          <div class="chart-bar-track">
            <div class="chart-bar-fill green" style="width: ${d.pct}%;"></div>
          </div>
        </div>
      `).join('');
    }
  }

  // Analytics timeframe filter
  const timeFilter = document.getElementById('analytics-date-filter');
  if (timeFilter) {
    timeFilter.addEventListener('change', (e) => {
      analyticsTimeframe = e.target.value;
      renderAnalyticsCharts();
      QueueLessApp.showToast(`Analytics filtered by: ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });
  }

  // =========================================================================
  // VIEW 5: SYSTEM SETTINGS
  // =========================================================================
  function renderSystemSettings() {
    const settings = window.queueLessStore.getSettings();

    const collegeInput = document.getElementById('set-college-name');
    if (collegeInput) collegeInput.value = settings.collegeName;

    const taglineInput = document.getElementById('set-tagline');
    if (taglineInput) taglineInput.value = settings.tagline;

    const hoursInput = document.getElementById('set-hours');
    if (hoursInput) hoursInput.value = settings.openingHours;

    const daysInput = document.getElementById('set-working-days');
    if (daysInput) daysInput.value = settings.workingDays;

    const maxTokensInput = document.getElementById('set-max-tokens');
    if (maxTokensInput) maxTokensInput.value = settings.maxTokensPerStudent;

    const durationInput = document.getElementById('set-default-duration');
    if (durationInput) durationInput.value = settings.defaultServiceDuration;
  }

  const settingsForm = document.getElementById('form-system-settings');
  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const existing = window.queueLessStore.getSettings();

      const updated = {
        ...existing,
        collegeName: document.getElementById('set-college-name').value.trim(),
        tagline: document.getElementById('set-tagline').value.trim(),
        openingHours: document.getElementById('set-hours').value.trim(),
        workingDays: document.getElementById('set-working-days').value.trim(),
        maxTokensPerStudent: parseInt(document.getElementById('set-max-tokens').value, 10) || 3,
        defaultServiceDuration: parseInt(document.getElementById('set-default-duration').value, 10) || 6
      };

      window.queueLessStore.saveSettings(updated);
      QueueLessApp.showToast('System settings saved successfully!', 'success');
    });
  }

  // RESET DEMO DATA TRIGGER
  const resetBtn = document.getElementById('btn-reset-demo-data-trigger');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      QueueLessApp.openModal('modal-confirm-reset');
    });
  }

  const confirmResetBtn = document.getElementById('btn-confirm-execute-reset');
  if (confirmResetBtn) {
    confirmResetBtn.addEventListener('click', () => {
      window.queueLessStore.resetDemoData();
      QueueLessApp.closeModal('modal-confirm-reset');
      QueueLessApp.showToast('All demo records reset to pristine factory state!', 'success', 'Data Reset Complete');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });
  }

});
