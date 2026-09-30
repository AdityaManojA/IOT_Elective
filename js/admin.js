// =============================================================================
//  Smart Notice Board – Admin Logic (admin.js)
//  Auth, Achievements CRUD + Live Preview, Notices CRUD, Timetable, Settings
// =============================================================================

/* ── Auth ─────────────────────────────────────────────────────────────────── */
let isLoggedIn = false;

function doLogin() {
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value.trim();
  const cfg  = window.App.data.admin;
  if (user === cfg.username && pass === cfg.password) {
    isLoggedIn = true;
    document.getElementById('admin-login-screen').classList.remove('open');
    openAdminDashboard();
  } else {
    const err = document.getElementById('login-error');
    err.textContent = '❌ Invalid credentials. Please try again.';
    err.classList.add('visible');
    const passInput = document.getElementById('login-password');
    passInput.value = '';
    passInput.focus();
  }
}

function openAdminDashboard() {
  const dash = document.getElementById('admin-dashboard');
  dash.classList.add('open');
  switchAdminTab('notices');
}

function closeAdmin() {
  isLoggedIn = false;
  document.getElementById('admin-dashboard').classList.remove('open');
  window.showToast('Logged out successfully.', 'success');
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  const tabEl   = document.getElementById('atab-' + tab);
  const panelEl = document.getElementById('apanel-' + tab);
  if (tabEl)   tabEl.classList.add('active');
  if (panelEl) panelEl.classList.add('active');

  if (tab === 'notices')      renderAdminNotices();
  if (tab === 'achievements') renderAdminAchievements();
  if (tab === 'timetable')    renderAdminTimetable();
  if (tab === 'settings')     loadSettings();
}

/* ── ADMIN NOTICES ─────────────────────────────────────────────────────────── */
let editingNoticeId = null;

function renderAdminNotices() {
  const list = document.getElementById('admin-notices-list');
  const notices = window.App.data.notices || [];
  list.innerHTML = '';
  if (notices.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="es-icon">📋</div><p>No notices yet.</p></div>';
    return;
  }
  const pColors = { urgent:'var(--accent-rose)', high:'var(--accent-amber)', normal:'var(--accent-green)' };
  notices.forEach(n => {
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    const isExpired = window.isNoticeExpired ? window.isNoticeExpired(n) : false;
    const deadlineStr = n.deadline ? window.formatDate(n.deadline) : window.formatDate(n.date);
    item.innerHTML = `
      <div class="ali-content">
        <div class="ali-title">${n.title}</div>
        <div class="ali-meta" style="display:flex;gap:10px;margin-top:3px;flex-wrap:wrap">
          <span style="color:${pColors[n.priority]||'gray'};font-weight:600;font-size:11px">${n.priority.toUpperCase()}</span>
          <span>📂 ${n.category}</span>
          <span>📅 Posted: ${window.formatDate(n.date)}</span>
          <span style="color:${isExpired ? 'var(--accent-rose)' : 'var(--text-secondary)'};font-weight:${isExpired ? '600' : 'normal'}">
            ⏳ Deadline: ${deadlineStr} ${isExpired ? '(EXPIRED - Removed from board)' : ''}
          </span>
          <span style="color:${n.active && !isExpired ? 'var(--accent-green)' : 'var(--text-muted)'}">
            ${n.active && !isExpired ? '● Visible on Board' : (isExpired ? '✕ Expired' : '○ Hidden')}
          </span>
        </div>
      </div>
      <div class="ali-actions">
        <button class="btn-edit" onclick="editNotice('${n.id}')">✏️ Edit</button>
        <button class="btn-danger" onclick="deleteNotice('${n.id}')">🗑️</button>
      </div>`;
    list.appendChild(item);
  });
}

function editNotice(id) {
  const n = (window.App.data.notices || []).find(x => x.id === id);
  if (!n) return;
  editingNoticeId = id;
  document.getElementById('notice-form-title').value    = n.title;
  document.getElementById('notice-form-category').value = n.category;
  document.getElementById('notice-form-priority').value = n.priority;
  document.getElementById('notice-form-date').value     = n.date;
  const deadlineInput = document.getElementById('notice-form-deadline');
  if (deadlineInput) deadlineInput.value = n.deadline || n.date;
  document.getElementById('notice-form-author').value   = n.author;
  document.getElementById('notice-form-content').value  = n.content;
  document.getElementById('notice-form-active').checked = n.active;
  document.getElementById('notice-form-heading').textContent = '✏️ Edit Notice';
  document.getElementById('notice-form-cancel').style.display = 'inline-flex';
}

function cancelEditNotice() {
  editingNoticeId = null;
  document.getElementById('notice-form').reset();
  document.getElementById('notice-form-heading').textContent = '➕ Add Notice';
  document.getElementById('notice-form-cancel').style.display = 'none';
}

function saveNotice() {
  const title    = document.getElementById('notice-form-title').value.trim();
  const category = document.getElementById('notice-form-category').value;
  const priority = document.getElementById('notice-form-priority').value;
  const date     = document.getElementById('notice-form-date').value;
  const deadline = document.getElementById('notice-form-deadline')?.value || date;
  const author   = document.getElementById('notice-form-author').value.trim();
  const content  = document.getElementById('notice-form-content').value.trim();
  const active   = document.getElementById('notice-form-active').checked;

  if (!title || !content) { window.showToast('Title and content are required.', 'error'); return; }

  if (editingNoticeId) {
    const idx = window.App.data.notices.findIndex(x => x.id === editingNoticeId);
    if (idx !== -1) {
      window.App.data.notices[idx] = { ...window.App.data.notices[idx], title, category, priority, date, deadline, author, content, active };
    }
    editingNoticeId = null;
  } else {
    window.App.data.notices.unshift({
      id: window.uid(), title, category, priority,
      date: date || new Date().toISOString().split('T')[0],
      deadline: deadline || date || new Date().toISOString().split('T')[0],
      author: author || 'Admin', content, active: true
    });
  }

  window.saveData();
  window.renderNotices();
  window.updateUrgentBanner();
  renderAdminNotices();
  cancelEditNotice();
  window.showToast('Notice saved successfully!', 'success');
}

function deleteNotice(id) {
  if (!confirm('Delete this notice?')) return;
  window.App.data.notices = (window.App.data.notices || []).filter(x => x.id !== id);
  window.saveData();
  window.renderNotices();
  window.updateUrgentBanner();
  renderAdminNotices();
  window.showToast('Notice deleted.', 'success');
}

/* ── ADMIN ACHIEVEMENTS ─────────────────────────────────────────────────────── */
let editingAchId = null;
let previewImageSrc = '';

function renderAdminAchievements() {
  const list = document.getElementById('admin-ach-list');
  const achs = window.App.data.achievements || [];
  list.innerHTML = '';
  if (achs.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="es-icon">🏆</div><p>No achievements yet.</p></div>';
    return;
  }
  achs.forEach(a => {
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    item.innerHTML = `
      <div class="ali-content">
        <div class="ali-title">${a.title}</div>
        <div class="ali-meta" style="display:flex;gap:8px;margin-top:3px;flex-wrap:wrap">
          <span>🎓 ${a.studentName}</span>
          <span>🏆 ${a.competition}</span>
          <span style="color:${a.featured?'var(--accent-amber)':'var(--text-muted)'}">
            ${a.featured ? '⭐ Featured' : '○ Not Featured'}
          </span>
        </div>
      </div>
      <div class="ali-actions">
        <button class="btn-edit" onclick="editAchievement('${a.id}')">✏️ Edit</button>
        <button class="btn-danger" onclick="deleteAchievement('${a.id}')">🗑️</button>
      </div>`;
    list.appendChild(item);
  });
}

function editAchievement(id) {
  const a = (window.App.data.achievements || []).find(x => x.id === id);
  if (!a) return;
  editingAchId = id;
  document.getElementById('ach-form-name').value        = a.studentName;
  document.getElementById('ach-form-rollno').value      = a.rollNo || '';
  document.getElementById('ach-form-title').value       = a.title;
  document.getElementById('ach-form-competition').value = a.competition;
  document.getElementById('ach-form-award').value       = a.award;
  document.getElementById('ach-form-category').value    = a.category;
  document.getElementById('ach-form-date').value        = a.date;
  document.getElementById('ach-form-desc').value        = a.description;
  document.getElementById('ach-form-imageurl').value    = a.image || '';
  document.getElementById('ach-form-featured').checked  = a.featured;
  previewImageSrc = a.image || '';
  updateAchPreview();
  document.getElementById('ach-form-heading').textContent = '✏️ Edit Achievement';
  document.getElementById('ach-form-cancel').style.display = 'inline-flex';
}

function cancelEditAch() {
  editingAchId = null;
  previewImageSrc = '';
  document.getElementById('ach-form').reset();
  document.getElementById('ach-form-heading').textContent = '➕ Add Achievement';
  document.getElementById('ach-form-cancel').style.display = 'none';
  updateAchPreview();
}

function saveAchievement() {
  const studentName  = document.getElementById('ach-form-name').value.trim();
  const rollNo       = document.getElementById('ach-form-rollno').value.trim();
  const title        = document.getElementById('ach-form-title').value.trim();
  const competition  = document.getElementById('ach-form-competition').value.trim();
  const award        = document.getElementById('ach-form-award').value.trim();
  const category     = document.getElementById('ach-form-category').value;
  const date         = document.getElementById('ach-form-date').value;
  const description  = document.getElementById('ach-form-desc').value.trim();
  const imageUrl     = document.getElementById('ach-form-imageurl').value.trim();
  const featured     = document.getElementById('ach-form-featured').checked;

  if (!studentName || !title) {
    window.showToast('Student name and title are required.', 'error'); return;
  }

  const image = previewImageSrc || imageUrl;

  if (editingAchId) {
    const idx = window.App.data.achievements.findIndex(x => x.id === editingAchId);
    if (idx !== -1) {
      window.App.data.achievements[idx] = {
        ...window.App.data.achievements[idx],
        studentName, rollNo, title, competition, award, category, date, description, image, featured
      };
    }
    editingAchId = null;
  } else {
    window.App.data.achievements.unshift({
      id: window.uid(), studentName, rollNo, title, competition,
      award, category,
      date: date || new Date().toISOString().split('T')[0],
      description, image, featured
    });
  }

  window.saveData();
  window.renderAchievements();
  renderAdminAchievements();
  cancelEditAch();
  window.showToast('Achievement saved!', 'success');
}

function deleteAchievement(id) {
  if (!confirm('Delete this achievement?')) return;
  window.App.data.achievements = (window.App.data.achievements || []).filter(x => x.id !== id);
  window.saveData();
  window.renderAchievements();
  renderAdminAchievements();
  window.showToast('Achievement deleted.', 'success');
}

function updateAchPreview() {
  const name   = document.getElementById('ach-form-name')?.value.trim()  || 'Student Name';
  const title  = document.getElementById('ach-form-title')?.value.trim() || 'Achievement Title';
  const award  = document.getElementById('ach-form-award')?.value.trim() || 'Award';
  const imgUrl = previewImageSrc || document.getElementById('ach-form-imageurl')?.value.trim() || '';

  const imgEl     = document.getElementById('preview-img');
  const imgHolder = document.getElementById('preview-img-placeholder');
  if (imgUrl) {
    imgEl.src = imgUrl; imgEl.style.display = 'block';
    imgHolder.style.display = 'none';
  } else {
    imgEl.style.display = 'none'; imgHolder.style.display = 'flex';
  }
  document.getElementById('preview-title').textContent   = title;
  document.getElementById('preview-student').textContent = '🎓 ' + name;
  document.getElementById('preview-award').textContent   = '🥇 ' + award;
}

/* ── ADMIN TIMETABLE ─────────────────────────────────────────────────────── */
function renderAdminTimetable() {
  if (!window.App.data.timetable || !window.App.data.timetable.days) {
    window.App.data.timetable = window.DEFAULT_NOTICE_DATA.timetable;
  }
  const days    = Object.keys(window.App.data.timetable.days);
  const daySel  = document.getElementById('admin-tt-day-select');
  if (daySel) {
    daySel.innerHTML = days.map(d => `<option value="${d}">${d}</option>`).join('');
    daySel.value = days[0];
  }

  const clsSel = document.getElementById('admin-tt-class-select');
  if (clsSel) {
    const classes = window.App.data.timetable.classes || ["S7 MRE", "S5 MRE", "S3 MRE"];
    clsSel.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join('');
    clsSel.value = classes[0];
  }

  renderAdminTimetableDay();
}

function renderAdminTimetableDay() {
  const day     = document.getElementById('admin-tt-day-select')?.value || 'Monday';
  const cls     = document.getElementById('admin-tt-class-select')?.value || 'S7 MRE';
  const dayData = window.App.data.timetable.days[day] || {};
  const periods = dayData[cls] || [];
  const list    = document.getElementById('admin-tt-list');
  if (!list) return;
  list.innerHTML = '';

  periods.forEach((p, idx) => {
    const item = document.createElement('div');
    item.className = 'admin-list-item';
    item.innerHTML = `
      <div class="ali-content">
        <div class="ali-title" style="font-size:13px">
          <span style="color:var(--text-muted);font-family:var(--font-mono);margin-right:8px">P${p.period}</span>
          ${p.subject} <span style="color:var(--accent-primary);font-size:11px;margin-left:6px">${p.code || ''}</span>
        </div>
        <div class="ali-meta" style="display:flex;gap:8px;margin-top:2px">
          <span>⏰ ${p.time}</span>
          <span>👤 ${p.teacher}</span>
          <span>📍 ${p.room}</span>
        </div>
      </div>
      <div class="ali-actions">
        <button class="btn-danger" onclick="deleteTTPeriod('${day}', '${cls}', ${idx})">🗑️</button>
      </div>`;
    list.appendChild(item);
  });
  if (periods.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="es-icon">📅</div><p>No periods for ${cls} on ${day}.</p></div>`;
  }
}

function addTTPeriod() {
  const day     = document.getElementById('admin-tt-day-select').value;
  const cls     = document.getElementById('admin-tt-class-select').value;
  const period  = document.getElementById('tt-form-period').value.trim();
  const time    = document.getElementById('tt-form-time').value.trim();
  const subject = document.getElementById('tt-form-subject').value.trim();
  const code    = document.getElementById('tt-form-code').value.trim();
  const teacher = document.getElementById('tt-form-teacher').value.trim();
  const room    = document.getElementById('tt-form-room').value.trim();

  if (!subject || !time) { window.showToast('Subject and time are required.', 'error'); return; }

  if (!window.App.data.timetable.days[day]) window.App.data.timetable.days[day] = {};
  if (!window.App.data.timetable.days[day][cls]) window.App.data.timetable.days[day][cls] = [];
  window.App.data.timetable.days[day][cls].push({ period, time, subject, code, teacher, room });
  window.saveData();
  if (window.renderTimetable) window.renderTimetable();
  renderAdminTimetableDay();
  document.getElementById('tt-form').reset();
  window.showToast(`Period added to ${cls} on ${day}!`, 'success');
}

function deleteTTPeriod(day, cls, idx) {
  if (!confirm(`Delete this period from ${cls}?`)) return;
  if (window.App.data.timetable.days[day] && window.App.data.timetable.days[day][cls]) {
    window.App.data.timetable.days[day][cls].splice(idx, 1);
  }
  window.saveData();
  if (window.renderTimetable) window.renderTimetable();
  renderAdminTimetableDay();
  window.showToast('Period deleted.', 'success');
}

/* ── SETTINGS ─────────────────────────────────────────────────────────────── */
function loadSettings() {
  const cfg = window.App.data.config;
  const sbt = document.getElementById('set-board-title');
  if (sbt) sbt.value = cfg.boardTitle || '';
  const sin = document.getElementById('set-institution');
  if (sin) sin.value = cfg.institution || '';
  document.getElementById('set-weather-endpoint').value = cfg.weatherEndpoint || '';
  document.getElementById('set-weather-city').value   = cfg.weatherCity || '';
  document.getElementById('set-rotate-interval').value = cfg.rotateInterval || 12;
  document.getElementById('set-auto-rotate').checked  = cfg.autoRotate;

  const themeModeEl = document.getElementById('set-theme-mode');
  if (themeModeEl) themeModeEl.value = cfg.theme || 'auto';

  const adm = window.App.data.admin;
  document.getElementById('set-admin-user').value = adm.username;

  if (window.updateCollegeLogoDisplay) window.updateCollegeLogoDisplay();
}

function saveSettings() {
  const cfg = window.App.data.config;
  const sbt = document.getElementById('set-board-title');
  if (sbt) cfg.boardTitle = sbt.value.trim() || cfg.boardTitle;
  const sin = document.getElementById('set-institution');
  if (sin) cfg.institution = sin.value.trim() || cfg.institution;
  cfg.weatherEndpoint   = document.getElementById('set-weather-endpoint').value.trim();
  cfg.weatherCity       = document.getElementById('set-weather-city').value.trim() || cfg.weatherCity;
  cfg.rotateInterval    = parseInt(document.getElementById('set-rotate-interval').value) || 12;
  cfg.autoRotate        = document.getElementById('set-auto-rotate').checked;

  const themeModeEl = document.getElementById('set-theme-mode');
  if (themeModeEl) cfg.theme = themeModeEl.value;

  const newUser = document.getElementById('set-admin-user').value.trim();
  const newPass = document.getElementById('set-admin-pass').value.trim();
  if (newUser) window.App.data.admin.username = newUser;
  if (newPass) window.App.data.admin.password = newPass;

  window.saveData();

  // Apply changes live
  const bt = document.getElementById('board-title');
  if (bt) bt.textContent = cfg.boardTitle;
  const bi = document.getElementById('board-institution');
  if (bi) bi.textContent = cfg.institution;

  if (window.updateCollegeLogoDisplay) window.updateCollegeLogoDisplay();
  if (window.checkSunsetTheme) window.checkSunsetTheme();

  if (cfg.autoRotate) { window.startKiosk(); } else { window.stopKiosk(); }
  window.fetchWeather();
  window.scheduleWeatherRefresh();

  window.showToast('Settings saved!', 'success');
  document.getElementById('set-admin-pass').value = '';
}

function exportData() {
  const blob = new Blob([JSON.stringify(window.App.data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `noticeboard_backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  window.showToast('Data exported!', 'success');
}

function importData() { document.getElementById('import-file-input').click(); }

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const parsed = JSON.parse(evt.target.result);
      window.App.data = parsed;
      window.saveData();
      window.renderNotices();
      window.renderAchievements();
      window.updateUrgentBanner();
      window.showToast('Data imported successfully!', 'success');
    } catch(err) {
      window.showToast('Invalid JSON file.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function resetToDefaults() {
  if (!confirm('Reset all board data to defaults? This cannot be undone.')) return;
  window.App.data = JSON.parse(JSON.stringify(window.DEFAULT_NOTICE_DATA));
  window.saveData();
  window.renderNotices();
  window.renderAchievements();
  window.updateUrgentBanner();
  loadSettings();
  window.showToast('Reset to default data.', 'success');
}

/* ── Image Upload / Preview ─────────────────────────────────────────────────*/
function handleImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const reader = new FileReader();
  reader.onload = e => {
    previewImageSrc = e.target.result;
    updateAchPreview();
  };
  reader.readAsDataURL(file);
}

/* ── DOM Ready ──────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {

  // Login
  document.getElementById('login-form').addEventListener('submit', e => { e.preventDefault(); doLogin(); });
  document.getElementById('login-cancel').addEventListener('click', () => {
    document.getElementById('admin-login-screen').classList.remove('open');
  });

  // Admin tabs
  document.querySelectorAll('.admin-tab[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => switchAdminTab(btn.dataset.panel));
  });

  // Admin close
  document.getElementById('admin-close-btn').addEventListener('click', closeAdmin);

  // Notice form
  document.getElementById('notice-form').addEventListener('submit', e => { e.preventDefault(); saveNotice(); });
  document.getElementById('notice-form-cancel').addEventListener('click', cancelEditNotice);

  // Achievement form
  document.getElementById('ach-form').addEventListener('submit', e => { e.preventDefault(); saveAchievement(); });
  document.getElementById('ach-form-cancel').addEventListener('click', cancelEditAch);

  // Achievement live preview triggers
  ['ach-form-name','ach-form-title','ach-form-award','ach-form-imageurl'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { if (id === 'ach-form-imageurl') previewImageSrc = ''; updateAchPreview(); });
  });

  // Image file upload (drag-drop + click)
  const uploadZone = document.getElementById('ach-upload-zone');
  const fileInput  = document.getElementById('ach-file-input');
  if (uploadZone) {
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault(); uploadZone.classList.remove('dragover');
      handleImageFile(e.dataTransfer.files[0]);
    });
    uploadZone.addEventListener('click', () => fileInput.click());
  }
  if (fileInput) {
    fileInput.addEventListener('change', e => handleImageFile(e.target.files[0]));
  }

  // Timetable form
  const ttDaySel = document.getElementById('admin-tt-day-select');
  if (ttDaySel) ttDaySel.addEventListener('change', renderAdminTimetableDay);
  const ttClassSel = document.getElementById('admin-tt-class-select');
  if (ttClassSel) ttClassSel.addEventListener('change', renderAdminTimetableDay);
  document.getElementById('tt-form').addEventListener('submit', e => { e.preventDefault(); addTTPeriod(); });

  // Settings
  document.getElementById('settings-save-btn').addEventListener('click', saveSettings);
  document.getElementById('settings-export-btn').addEventListener('click', exportData);
  document.getElementById('settings-import-btn').addEventListener('click', importData);
  document.getElementById('import-file-input').addEventListener('change', handleImport);
  document.getElementById('settings-reset-btn').addEventListener('click', resetToDefaults);

  // Settings Logo upload / remove
  const setLogoFile = document.getElementById('set-logo-file');
  if (setLogoFile) {
    setLogoFile.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        window.showToast('Please select a valid image file', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        window.App.data.config.collegeLogo = ev.target.result;
        window.saveData();
        if (window.updateCollegeLogoDisplay) window.updateCollegeLogoDisplay();
        window.showToast('College logo uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  const setLogoRemoveBtn = document.getElementById('set-logo-remove-btn');
  if (setLogoRemoveBtn) {
    setLogoRemoveBtn.addEventListener('click', () => {
      window.App.data.config.collegeLogo = '';
      window.saveData();
      if (window.updateCollegeLogoDisplay) window.updateCollegeLogoDisplay();
      window.showToast('College logo removed', 'info');
    });
  }
});
