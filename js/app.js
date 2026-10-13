/**
 * QueueLess - Smart College Queue and Token Management System
 * app.js: Global UI Utilities, Toast Engine, Modal Controller, and Session Guards
 */

// Global App Utilities
const QueueLessApp = {
  // Toast Engine
  showToast(message, type = 'info', title = null, duration = 4000) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-info';
    let defaultTitle = 'Notice';

    if (type === 'success') {
      iconClass = 'fa-circle-check';
      defaultTitle = 'Success';
    } else if (type === 'error' || type === 'danger') {
      iconClass = 'fa-circle-exclamation';
      defaultTitle = 'Alert';
    } else if (type === 'warning') {
      iconClass = 'fa-triangle-exclamation';
      defaultTitle = 'Attention';
    }

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon"></i>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitle}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <i class="fa-solid fa-xmark toast-close"></i>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
      this.dismissToast(toast);
    });

    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        this.dismissToast(toast);
      }, duration);
    }
  },

  dismissToast(toastElement) {
    if (!toastElement || !toastElement.parentNode) return;
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.parentNode.removeChild(toastElement);
      }
    }, 200);
  },

  // Modal Dialogs
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    // Focus first input if present
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  },

  initModalListeners() {
    // Backdrop click and close button listeners
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        e.target.classList.remove('show');
        document.body.style.overflow = '';
      }
      if (e.target.closest('[data-modal-close]')) {
        const closeBtn = e.target.closest('[data-modal-close]');
        const targetModalId = closeBtn.getAttribute('data-modal-close');
        if (targetModalId) {
          QueueLessApp.closeModal(targetModalId);
        } else {
          const parentModal = closeBtn.closest('.modal-backdrop');
          if (parentModal) {
            parentModal.classList.remove('show');
            document.body.style.overflow = '';
          }
        }
      }
    });

    // ESC key closes top modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal-backdrop.show');
        if (openModals.length > 0) {
          const topModal = openModals[openModals.length - 1];
          topModal.classList.remove('show');
          document.body.style.overflow = '';
        }
      }
    });
  },

  // Session Guard & Routing
  checkAuth(allowedRole = null) {
    const auth = window.queueLessStore.getAuth();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    if (currentPage === 'index.html' || currentPage === '') {
      if (auth) {
        if (auth.role === 'Student') window.location.href = 'student-dashboard.html';
        else if (auth.role === 'Staff') window.location.href = 'staff-dashboard.html';
        else if (auth.role === 'Admin') window.location.href = 'admin-dashboard.html';
      }
      return auth;
    }

    if (!auth) {
      window.location.href = 'index.html';
      return null;
    }

    if (allowedRole && auth.role !== allowedRole) {
      // Role mismatch
      console.warn(`Role mismatch: Expected ${allowedRole}, got ${auth.role}`);
      if (auth.role === 'Student') window.location.href = 'student-dashboard.html';
      else if (auth.role === 'Staff') window.location.href = 'staff-dashboard.html';
      else if (auth.role === 'Admin') window.location.href = 'admin-dashboard.html';
      return null;
    }

    return auth;
  },

  logout() {
    window.queueLessStore.clearAuth();
    this.showToast('You have been securely logged out.', 'info', 'Logged Out', 2000);
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  },

  switchRoleDemo(newRole) {
    let mockUser;
    if (newRole === 'Student') {
      const profile = window.queueLessStore.getStudentProfile();
      mockUser = {
        name: profile.name,
        email: profile.email,
        role: 'Student',
        id: profile.registerNumber,
        department: profile.department
      };
      window.queueLessStore.setAuth(mockUser);
      window.location.href = 'student-dashboard.html';
    } else if (newRole === 'Staff') {
      const staffList = window.queueLessStore.getStaff();
      const staffMember = staffList[0] || { name: 'Mrs. Rekha Sharma', email: 'staff@college.edu', department: 'Administrative Office' };
      mockUser = {
        name: staffMember.name,
        email: staffMember.email,
        role: 'Staff',
        id: staffMember.id,
        department: staffMember.department
      };
      window.queueLessStore.setAuth(mockUser);
      window.location.href = 'staff-dashboard.html';
    } else if (newRole === 'Admin') {
      mockUser = {
        name: 'Dr. K. Narayanan (Dean)',
        email: 'admin@college.edu',
        role: 'Admin',
        id: 'ADM-001',
        department: 'College Administration'
      };
      window.queueLessStore.setAuth(mockUser);
      window.location.href = 'admin-dashboard.html';
    }
  },

  // Notification Header Menu
  initNotificationDropdown() {
    const bellBtn = document.getElementById('notif-bell-btn');
    const dropdown = document.getElementById('notifications-dropdown');
    if (!bellBtn || !dropdown) return;

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('show');
      this.renderNotificationDropdown();
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== bellBtn) {
        dropdown.classList.remove('show');
      }
    });

    // Mark all read button
    const markAllBtn = document.getElementById('btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        const notifs = window.queueLessStore.getNotifications();
        notifs.forEach(n => n.read = true);
        window.queueLessStore.saveNotifications(notifs);
        this.renderNotificationDropdown();
        this.updateNotificationBadge();
        this.showToast('All notifications marked as read', 'success', 'Notifications');
      });
    }

    // Clear all button
    const clearAllBtn = document.getElementById('btn-clear-notifications');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        window.queueLessStore.saveNotifications([]);
        this.renderNotificationDropdown();
        this.updateNotificationBadge();
        this.showToast('Notification center cleared', 'info', 'Notifications');
      });
    }

    this.updateNotificationBadge();
  },

  updateNotificationBadge() {
    const badge = document.getElementById('notif-badge-count');
    if (!badge) return;

    const auth = window.queueLessStore.getAuth();
    const notifs = window.queueLessStore.getNotifications();
    const currentRole = auth ? auth.role : 'Student';

    const unreadCount = notifs.filter(n => {
      const matchesRole = n.targetRole === 'All' || n.targetRole === currentRole;
      return matchesRole && !n.read;
    }).length;

    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  },

  renderNotificationDropdown() {
    const listEl = document.getElementById('notifications-dropdown-list');
    if (!listEl) return;

    const auth = window.queueLessStore.getAuth();
    const notifs = window.queueLessStore.getNotifications();
    const currentRole = auth ? auth.role : 'Student';

    const userNotifs = notifs.filter(n => n.targetRole === 'All' || n.targetRole === currentRole);

    if (userNotifs.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 2rem 1rem; text-align: center; color: var(--slate-400); font-size: 0.85rem;">
          <i class="fa-regular fa-bell-slash" style="font-size: 1.8rem; margin-bottom: 0.5rem; display: block;"></i>
          No notifications yet
        </div>
      `;
      return;
    }

    listEl.innerHTML = userNotifs.map(n => {
      let icon = 'fa-info';
      if (n.type === 'success') icon = 'fa-check';
      if (n.type === 'warning') icon = 'fa-triangle-exclamation';

      return `
        <div class="notif-item ${n.read ? '' : 'unread'}" data-notif-id="${n.id}">
          <div class="notif-icon ${n.type}">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="notif-text">
            <div class="notif-title">${n.title}</div>
            <div class="notif-message">${n.message}</div>
            <div class="notif-time">${formatDisplayTime(n.time)} • ${formatDisplayDate(n.time)}</div>
          </div>
        </div>
      `;
    }).join('');

    // Clicking an unread item marks it as read
    listEl.querySelectorAll('.notif-item').forEach(item => {
      item.addEventListener('click', () => {
        const notifId = item.getAttribute('data-notif-id');
        const allNotifs = window.queueLessStore.getNotifications();
        const target = allNotifs.find(n => n.id === notifId);
        if (target && !target.read) {
          target.read = true;
          window.queueLessStore.saveNotifications(allNotifs);
          this.renderNotificationDropdown();
          this.updateNotificationBadge();
        }
      });
    });
  },

  // Mobile navigation drawer
  initMobileDrawer() {
    const menuBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    if (!menuBtn || !sidebar) return;

    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && e.target !== menuBtn && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    });
  },

  // Header User Display
  populateHeaderProfile() {
    const auth = window.queueLessStore.getAuth();
    if (!auth) return;

    const nameEls = document.querySelectorAll('.sync-user-name');
    nameEls.forEach(el => el.textContent = auth.name || 'User');

    const roleEls = document.querySelectorAll('.sync-user-role');
    roleEls.forEach(el => el.textContent = auth.role || 'Member');

    const deptEls = document.querySelectorAll('.sync-user-dept');
    deptEls.forEach(el => el.textContent = auth.department || auth.id || '');

    const initialsEls = document.querySelectorAll('.sync-user-initials');
    const initials = (auth.name || 'User')
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
    initialsEls.forEach(el => el.textContent = initials);
  },

  // Setup tab routing via URL Hash
  initTabRouting(defaultTab = 'overview', onTabChange = null) {
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link[data-tab]');
    const viewPanes = document.querySelectorAll('.view-pane');

    const switchTab = (tabName) => {
      let found = false;
      viewPanes.forEach(pane => {
        if (pane.id === `view-${tabName}`) {
          pane.classList.add('active');
          found = true;
        } else {
          pane.classList.remove('active');
        }
      });

      if (!found && viewPanes.length > 0) {
        // Fallback to first view pane
        viewPanes[0].classList.add('active');
        tabName = viewPanes[0].id.replace('view-', '');
      }

      navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabName) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      // Update breadcrumb
      const breadcrumb = document.querySelector('.page-breadcrumb .current');
      if (breadcrumb) {
        const activeLink = document.querySelector(`.sidebar-nav .nav-link[data-tab="${tabName}"]`);
        if (activeLink) {
          const linkText = activeLink.querySelector('.nav-left span') || activeLink;
          breadcrumb.textContent = linkText.textContent.trim();
        }
      }

      if (typeof onTabChange === 'function') {
        onTabChange(tabName);
      }
    };

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = link.getAttribute('data-tab');
        window.location.hash = tab;
        switchTab(tab);

        // Close mobile sidebar if open
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      });
    });

    // Check hash on load
    const currentHash = window.location.hash.replace('#', '');
    switchTab(currentHash || defaultTab);

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      switchTab(hash || defaultTab);
    });
  }
};

// Initialize common app listeners on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  QueueLessApp.initModalListeners();
  QueueLessApp.initNotificationDropdown();
  QueueLessApp.initMobileDrawer();
  QueueLessApp.populateHeaderProfile();

  // Listen to cross-tab storage changes
  window.addEventListener('storage', (e) => {
    if (e.key && e.key.startsWith('queueless_')) {
      QueueLessApp.updateNotificationBadge();
      window.dispatchEvent(new CustomEvent('queueless:data-updated', { detail: { type: 'storage-event' } }));
    }
  });

  // Role Switcher links in header
  const switchBtns = document.querySelectorAll('[data-switch-role]');
  switchBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const role = btn.getAttribute('data-switch-role');
      QueueLessApp.switchRoleDemo(role);
    });
  });

  // Logout triggers
  const logoutBtns = document.querySelectorAll('[data-action-logout]');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      QueueLessApp.logout();
    });
  });
});
