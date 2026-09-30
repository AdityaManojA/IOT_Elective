// =============================================================================
//  Smart Notice Board – Core App Logic  (app.js)
//  Real-time clock, kiosk auto-rotator, weather fetcher, view switching
// =============================================================================

/* ── State ─────────────────────────────────────────────────────────────────── */
const App = {
  currentView: 'notices',
  views: ['notices', 'achievements', 'timetable', 'weather'],
  kioskTimer: null,
  kioskProgressInterval: null,
  kioskProgressElapsed: 0,
  kioskPaused: false,
  weatherRefreshTimer: null,
  data: null,
};

/* ── Helpers ─────────────────────────────────────────────────────────────────*/
function uid() { return 'id-' + Math.random().toString(36).substr(2,9) + '-' + Date.now(); }

function loadData() {
  const saved = localStorage.getItem('noticeboard_data');
  if (saved) {
    try {
      App.data = JSON.parse(saved);
      // Merge any missing keys from defaults
      const def = window.DEFAULT_NOTICE_DATA;
      if (!App.data.config)          App.data.config          = def.config;
      if (!App.data.weatherFallback) App.data.weatherFallback = def.weatherFallback;
      // Upgrade timetable if in old format (or missing 3 classes)
      if (!App.data.timetable || !App.data.timetable.classes || Array.isArray(App.data.timetable.days?.['Monday'])) {
        App.data.timetable = def.timetable;
      }
      return;
    } catch(e) {}
  }
  App.data = JSON.parse(JSON.stringify(window.DEFAULT_NOTICE_DATA));
  saveData();
}

function saveData() {
  localStorage.setItem('noticeboard_data', JSON.stringify(App.data));
}

/* ── Toast notifications ──────────────────────────────────────────────────── */
function showToast(msg, type = 'success', duration = 3000) {
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)';
    t.style.transition = '0.3s ease'; setTimeout(() => t.remove(), 300); }, duration);
}

/* ── Clock ───────────────────────────────────────────────────────────────────*/
function updateClock() {
  const now  = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const mons = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hh   = String(now.getHours()).padStart(2,'0');
  const mm   = String(now.getMinutes()).padStart(2,'0');
  const ss   = String(now.getSeconds()).padStart(2,'0');
  const dd   = days[now.getDay()];
  const dat  = `${now.getDate()} ${mons[now.getMonth()]} ${now.getFullYear()}`;
  document.getElementById('clock-time').textContent = `${hh}:${mm}:${ss}`;
  document.getElementById('clock-date').innerHTML = `${dd}<br>${dat}`;

  // Check and maintain sunset dark theme
  checkSunsetTheme();
}

/* ── View Switching ──────────────────────────────────────────────────────────*/
function switchView(view) {
  App.currentView = view;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const el = document.getElementById('view-' + view);
  if (el) el.classList.add('active');
  const nb = document.getElementById('nav-' + view);
  if (nb) nb.classList.add('active');

  if (view === 'timetable') renderTimetable();
  if (view === 'weather')   renderWeather();
  if (view === 'notices')   renderNotices();
  if (view === 'achievements') renderAchievements();

  resetKioskProgress();
}

/* ── Kiosk Auto-Rotate ───────────────────────────────────────────────────────*/
function startKiosk() {
  stopKiosk();
  if (!App.data.config.autoRotate) return;
  const interval = (App.data.config.rotateInterval || 12) * 1000;
  App.kioskProgressElapsed = 0;
  App.kioskProgressInterval = setInterval(() => {
    if (App.kioskPaused) return;
    App.kioskProgressElapsed += 100;
    const pct = Math.min((App.kioskProgressElapsed / interval) * 100, 100);
    document.getElementById('kiosk-progress-fill').style.width = pct + '%';
    if (App.kioskProgressElapsed >= interval) {
      nextView();
    }
  }, 100);
}

function stopKiosk() {
  clearInterval(App.kioskProgressInterval);
  App.kioskProgressInterval = null;
  App.kioskProgressElapsed = 0;
  document.getElementById('kiosk-progress-fill').style.width = '0%';
}

function resetKioskProgress() {
  App.kioskProgressElapsed = 0;
  document.getElementById('kiosk-progress-fill').style.width = '0%';
}

function nextView() {
  const idx  = App.views.indexOf(App.currentView);
  const next = App.views[(idx + 1) % App.views.length];
  switchView(next);
}

/* ── Urgent Banner (Removed per user requirement) ───────────────────────────*/
function updateUrgentBanner() {
  const banner = document.getElementById('urgent-banner');
  if (banner) {
    banner.classList.remove('visible');
    banner.style.display = 'none';
  }
}

/* ── NOTICES ─────────────────────────────────────────────────────────────────*/
let noticeFilter    = 'All';
let noticeSearchStr = '';

function isNoticeExpired(notice) {
  const deadlineStr = notice.deadline || notice.date;
  if (!deadlineStr) return false;
  const deadline = new Date(deadlineStr);
  if (isNaN(deadline.getTime())) return false;
  // If date string YYYY-MM-DD without time, expire at end of that day (23:59:59)
  if (deadlineStr.length <= 10) {
    deadline.setHours(23, 59, 59, 999);
  }
  return new Date() > deadline;
}

function renderNotices() {
  // Filter out inactive notices AND notices whose deadline has passed
  const activeNotices = (App.data.notices || []).filter(n => n.active && !isNoticeExpired(n));

  // Requirement: Remove tab groups (Academics, Placement, Events, General) and just keep only "All"
  const filterBar = document.getElementById('notice-filter-chips');
  if (filterBar) {
    filterBar.innerHTML = '';
    const chip = document.createElement('button');
    chip.className = 'filter-chip active';
    chip.id = 'chip-all';
    chip.innerHTML = `<span>📋 All Notices</span> <span class="chip-count">${activeNotices.length}</span>`;
    chip.onclick = () => { noticeFilter = 'All'; renderNotices(); };
    filterBar.appendChild(chip);
  }

  // Filter notices by search if present
  let filtered = activeNotices;
  if (noticeSearchStr) {
    const s = noticeSearchStr.toLowerCase();
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || (n.author && n.author.toLowerCase().includes(s))
    );
  }

  // Sort by priority (urgent -> high -> normal)
  const pOrder = { urgent:0, high:1, normal:2 };
  filtered.sort((a,b) => (pOrder[a.priority]??9) - (pOrder[b.priority]??9));

  const grid = document.getElementById('notices-grid');
  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="es-icon">📋</div><h3>No active notices found</h3>
      <p>All notices may be past their deadline or no notices match your search.</p></div>`;
    return;
  }

  const categoryIcons = {
    Academic: '📚', Events: '🎉', Placement: '💼', General: '📢', Urgent: '🚨', Circular: '📜'
  };

  filtered.forEach(notice => {
    const card = document.createElement('div');
    card.className = `notice-card priority-${notice.priority}`;
    const deadlineText = notice.deadline ? formatDate(notice.deadline) : formatDate(notice.date);
    card.innerHTML = `
      <div class="notice-meta">
        <span class="notice-category">${categoryIcons[notice.category] || '📌'} ${notice.category}</span>
        <span class="notice-priority-badge">${notice.priority.toUpperCase()}</span>
      </div>
      <div class="notice-title">${notice.title}</div>
      <div class="notice-content">${notice.content}</div>
      <div class="notice-footer">
        <span>👤 ${notice.author}</span>
        <span title="Valid until deadline" class="notice-deadline-tag">⏳ Deadline: ${deadlineText}</span>
      </div>`;
    card.onclick = () => openNoticeModal(notice);
    grid.appendChild(card);
  });
}

function openNoticeModal(notice) {
  document.getElementById('notice-modal-title').textContent = notice.title;
  document.getElementById('notice-modal-body').textContent  = notice.content;
  document.getElementById('notice-modal-author').textContent = `👤 ${notice.author}`;
  const deadlineText = notice.deadline ? formatDate(notice.deadline) : formatDate(notice.date);
  document.getElementById('notice-modal-date').textContent   = `⏳ Deadline: ${deadlineText}`;
  document.getElementById('notice-modal-cat').textContent    = `🏷 ${notice.category}`;
  document.getElementById('notice-modal').classList.add('open');
}

/* ── ACHIEVEMENTS ─────────────────────────────────────────────────────────── */
function renderAchievements() {
  const achs  = App.data.achievements || [];
  const grid  = document.getElementById('achievements-grid');
  grid.innerHTML = '';
  if (achs.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="es-icon">🏆</div><h3>No achievements yet</h3>
      <p>Add student achievements from the Admin panel.</p></div>`;
    return;
  }
  achs.forEach(ach => {
    const card = document.createElement('div');
    card.className = 'ach-card' + (ach.featured ? ' featured' : '');
    const iconMap = { 'IoT & Robotics':'🤖', Research:'📄', Cybersecurity:'🛡️', Robotics:'⚙️' };
    const imgHTML = ach.image
      ? `<div class="ach-image-wrap"><img src="${ach.image}" alt="${ach.studentName}" loading="lazy"><div class="ach-image-overlay"></div></div>`
      : `<div class="ach-img-placeholder">${iconMap[ach.category] || '🏆'}</div>`;
    card.innerHTML = `
      ${imgHTML}
      <span class="ach-featured-badge">⭐ Featured</span>
      <div class="ach-body">
        <div class="ach-category">${ach.category}</div>
        <div class="ach-title">${ach.title}</div>
        <div class="ach-student">🎓 ${ach.studentName}</div>
        <div class="ach-competition">🏆 ${ach.competition}</div>
        <div class="ach-award">🥇 ${ach.award}</div>
      </div>`;
    card.onclick = () => openAchModal(ach);
    grid.appendChild(card);
  });
}

function openAchModal(ach) {
  document.getElementById('ach-modal-title').textContent   = ach.title;
  document.getElementById('ach-modal-student').textContent = ach.studentName + ' (' + ach.rollNo + ')';
  document.getElementById('ach-modal-comp').textContent    = ach.competition;
  document.getElementById('ach-modal-award').textContent   = ach.award;
  document.getElementById('ach-modal-desc').textContent    = ach.description;
  document.getElementById('ach-modal-date').textContent    = formatDate(ach.date);
  const imgEl = document.getElementById('ach-modal-img');
  if (ach.image) { imgEl.src = ach.image; imgEl.style.display = 'block'; }
  else           { imgEl.style.display = 'none'; }
  document.getElementById('ach-modal').classList.add('open');
}

/* ── TIMETABLE (S7, S5, S3 MRE All on One Page) ─────────────────────────────*/
let currentDay = '';
let activeClassFilter = 'all'; // 'all', 'S7 MRE', 'S5 MRE', 'S3 MRE'

function renderTimetable() {
  if (!App.data.timetable || !App.data.timetable.days) {
    App.data.timetable = window.DEFAULT_NOTICE_DATA.timetable;
  }
  const days     = Object.keys(App.data.timetable.days);
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today    = dayNames[new Date().getDay()];
  if (!currentDay) currentDay = days.includes(today) ? today : days[0];

  // Day pills
  const pillsEl = document.getElementById('day-pills');
  if (pillsEl) {
    pillsEl.innerHTML = '';
    days.forEach(d => {
      const pill = document.createElement('button');
      pill.className = 'day-pill' + (d === currentDay ? ' active' : '') + (d === today ? ' today' : '');
      pill.innerHTML = `<span>${d}</span>${d === today ? '<span class="today-dot" title="Today">●</span>' : ''}`;
      pill.onclick = () => { currentDay = d; renderTimetable(); };
      pillsEl.appendChild(pill);
    });
  }

  // Update day label
  const dayLabel = document.getElementById('tt-day-label');
  if (dayLabel) {
    dayLabel.textContent = `Showing S7, S5, and S3 MRE schedules for ${currentDay}${currentDay === today ? ' (Today)' : ''}`;
  }

  // Bind Class Filter buttons if present
  const filterBtns = document.querySelectorAll('.tt-filter-pill');
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.class === activeClassFilter);
    btn.onclick = () => {
      activeClassFilter = btn.dataset.class;
      filterBtns.forEach(b => b.classList.toggle('active', b.dataset.class === activeClassFilter));
      renderTimetableCards();
    };
  });

  renderTimetableCards();
}

function renderTimetableCards() {
  const container = document.getElementById('tt-classes-grid');
  if (!container) return;
  container.innerHTML = '';

  const daySchedule = App.data.timetable.days[currentDay] || {};
  const allClasses = App.data.timetable.classes || ["S7 MRE", "S5 MRE", "S3 MRE"];
  const classesToRender = activeClassFilter === 'all'
    ? allClasses
    : allClasses.filter(c => c === activeClassFilter);

  const now = new Date();
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const today = dayNames[now.getDay()];
  const isToday = currentDay === today;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const classMeta = {
    'S7 MRE': { title: 'Semester 7 Mechatronics', badge: 'Final Year', icon: '🤖' },
    'S5 MRE': { title: 'Semester 5 Mechatronics', badge: 'Third Year', icon: '⚙️' },
    'S3 MRE': { title: 'Semester 3 Mechatronics', badge: 'Second Year', icon: '⚡' }
  };

  classesToRender.forEach(cls => {
    const periods = daySchedule[cls] || [];
    const meta = classMeta[cls] || { title: cls, badge: 'MRE', icon: '📚' };

    const card = document.createElement('div');
    card.className = 'tt-class-card';
    card.id = `tt-card-${cls.replace(/\s+/g,'-')}`;

    let rowsHTML = '';
    if (periods.length === 0) {
      rowsHTML = `<tr><td colspan="5" class="tt-empty-day">No periods scheduled for ${cls} on ${currentDay}.</td></tr>`;
    } else {
      periods.forEach(p => {
        const isLunch = /lunch/i.test(p.period) || /lunch/i.test(p.subject);
        const isBreak = isLunch || /break/i.test(p.period) || /break/i.test(p.subject);
        const isCurrent = !isBreak && isToday && isCurrentPeriod(p.time, nowMin);

        if (isBreak) {
          rowsHTML += `
            <tr class="tt-row break-row">
              <td colspan="5" class="tt-break-cell">
                <span class="tt-break-pill">${isLunch ? '🍱' : '☕'} ${p.subject} &nbsp;·&nbsp; ${p.time}</span>
              </td>
            </tr>`;
        } else {
          rowsHTML += `
            <tr class="tt-row ${isCurrent ? 'current-period' : ''}">
              <td class="tt-period"><span class="period-badge">${p.period}</span></td>
              <td class="tt-time">${p.time}</td>
              <td class="tt-subject">
                <span class="tt-sub-name">${p.subject}</span>
                ${isCurrent ? '<span class="now-badge">● LIVE NOW</span>' : ''}
              </td>
              <td class="tt-code-col"><span class="tt-code">${p.code}</span></td>
              <td class="tt-teacher">${p.teacher}</td>
            </tr>`;
        }
      });
    }

    card.innerHTML = `
      <div class="tt-card-header">
        <div class="tt-card-header-left">
          <div class="tt-card-icon">${meta.icon}</div>
          <div>
            <div class="tt-card-title">${cls} &mdash; ${meta.title}</div>
          </div>
        </div>
        <span class="tt-card-badge">${meta.badge}</span>
      </div>
      <div class="tt-table-wrap">
        <table class="timetable-table" role="table" aria-label="${cls} timetable for ${currentDay}">
          <thead>
            <tr>
              <th style="width:65px">Period</th>
              <th style="width:110px">Time</th>
              <th>Subject</th>
              <th style="width:90px">Code</th>
              <th>Faculty</th>
            </tr>
          </thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>`;

    container.appendChild(card);
  });
}

function isCurrentPeriod(timeStr, nowMin) {
  const match = timeStr.match(/(\d{2}):(\d{2})[–-](\d{2}):(\d{2})/);
  if (!match) return false;
  const start = parseInt(match[1]) * 60 + parseInt(match[2]);
  const end   = parseInt(match[3]) * 60 + parseInt(match[4]);
  return nowMin >= start && nowMin < end;
}

/* ── WEATHER ─────────────────────────────────────────────────────────────────*/
const WEATHER_ICONS = {
  'sunny':          '☀️',  'clear':         '🌤️',
  'partly-cloudy':  '⛅',  'cloudy':        '☁️',
  'rain':           '🌧️',  'drizzle':       '🌦️',
  'thunder':        '⛈️',  'snow':          '❄️',
  'fog':            '🌫️',  'windy':         '💨',
};

function getWeatherIcon(icon) { return WEATHER_ICONS[icon] || '🌡️'; }

async function fetchWeather() {
  const cfg = App.data.config;
  // Try custom endpoint first
  if (cfg.weatherEndpoint) {
    try {
      const res = await fetch(cfg.weatherEndpoint, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const d = await res.json();
        App.data._weather = d;
        renderWeather();
        updateHeaderWeather();
        return;
      }
    } catch(e) { console.warn('Custom weather endpoint failed, falling back.'); }
  }

  // Open-Meteo fallback
  try {
    const lat = cfg.weatherLat || 9.9312;
    const lon = cfg.weatherLon || 76.2673;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=4`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const raw = await res.json();
      App.data._weather = parseOpenMeteo(raw, cfg.weatherCity);
      renderWeather();
      updateHeaderWeather();
      return;
    }
  } catch(e) { console.warn('Open-Meteo failed, using fallback data.'); }

  // Static fallback
  App.data._weather = App.data.weatherFallback;
  renderWeather();
  updateHeaderWeather();
  checkSunsetTheme();
}

function parseOpenMeteo(raw, city) {
  const cur    = raw.current || {};
  const daily  = raw.daily   || {};
  const hourly = raw.hourly  || {};
  const wmoIcon = code => {
    if (code === 0 || code === 1) return 'sunny';
    if (code <= 3)  return 'partly-cloudy';
    if (code <= 49) return 'fog';
    if (code <= 67) return 'rain';
    if (code <= 77) return 'snow';
    if (code <= 82) return 'rain';
    return 'thunder';
  };
  const wmoDesc = code => {
    if (code === 0)  return 'Clear Sky';
    if (code <= 3)  return 'Partly Cloudy';
    if (code <= 49) return 'Foggy';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Rain Showers';
    return 'Thunderstorm';
  };
  const dayNames = ['Today','Tomorrow'];
  const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // Parse sunrise & sunset
  if (daily.sunrise?.[0] && daily.sunset?.[0]) {
    App.sunsetTimes = {
      sunrise: new Date(daily.sunrise[0]),
      sunset:  new Date(daily.sunset[0])
    };
    checkSunsetTheme();
  }

  // Hourly – next 5 upcoming
  const nowHour = new Date().getHours();
  const hours   = (hourly.time || [])
    .map((t,i) => ({ t, temp: hourly.temperature_2m?.[i], pop: hourly.precipitation_probability?.[i], code: hourly.weather_code?.[i] }))
    .filter(h => new Date(h.t).getHours() > nowHour && new Date(h.t).getDate() === new Date().getDate())
    .slice(0,5)
    .map(h => ({
      time: new Date(h.t).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:false}),
      temp: Math.round(h.temp),
      icon: wmoIcon(h.code),
      pop:  (h.pop ?? 0) + '%'
    }));

  const daily4 = (daily.time || []).slice(0,4).map((t,i) => ({
    day:       dayNames[i] || dn[new Date(t).getDay()],
    condition: wmoDesc(daily.weather_code?.[i]),
    high:      Math.round(daily.temperature_2m_max?.[i]),
    low:       Math.round(daily.temperature_2m_min?.[i]),
    icon:      wmoIcon(daily.weather_code?.[i])
  }));

  return {
    location:        city || 'Campus',
    temperature:     Math.round(cur.temperature_2m ?? 28),
    feelsLike:       Math.round(cur.apparent_temperature ?? 30),
    condition:       wmoDesc(cur.weather_code ?? 0),
    icon:            wmoIcon(cur.weather_code ?? 0),
    humidity:        Math.round(cur.relative_humidity_2m ?? 75),
    windSpeed:       Math.round(cur.wind_speed_10m ?? 10),
    pressure:        1010,
    uvIndex:         '-',
    airQuality:      '-',
    rainProbability: hourly.precipitation_probability?.[nowHour] ?? 0,
    forecast:        hours,
    daily:           daily4
  };
}

function renderWeather() {
  const w = App.data._weather || App.data.weatherFallback;
  const cfg = App.data.config;

  document.getElementById('w-icon').textContent     = getWeatherIcon(w.icon);
  document.getElementById('w-temp').innerHTML       = `${w.temperature}<span class="weather-unit">°C</span>`;
  document.getElementById('w-condition').textContent = w.condition;
  document.getElementById('w-feels').textContent    = `Feels like ${w.feelsLike}°C`;
  document.getElementById('w-location').textContent = w.location || cfg.weatherCity;
  document.getElementById('w-humidity').textContent  = w.humidity + '%';
  document.getElementById('w-wind').textContent      = w.windSpeed + ' km/h';
  document.getElementById('w-pressure').textContent  = w.pressure + ' hPa';
  document.getElementById('w-rain').textContent      = w.rainProbability + '%';

  // Endpoint info
  const epEl = document.getElementById('w-endpoint-info');
  if (cfg.weatherEndpoint) {
    epEl.innerHTML = `🔌 Integrated with custom endpoint: <code>${cfg.weatherEndpoint}</code>`;
    epEl.style.display = 'block';
  } else {
    epEl.style.display = 'none';
  }

  // Hourly forecast
  const hourlyEl = document.getElementById('w-hourly');
  hourlyEl.innerHTML = '';
  (w.forecast || []).forEach(h => {
    hourlyEl.innerHTML += `
      <div class="forecast-hour">
        <div class="fh-time">${h.time}</div>
        <div class="fh-icon">${getWeatherIcon(h.icon)}</div>
        <div class="fh-temp">${h.temp}°</div>
        <div class="fh-pop">${h.pop}</div>
      </div>`;
  });
  if (!w.forecast || w.forecast.length === 0) {
    hourlyEl.innerHTML = '<div style="color:var(--text-muted);font-size:12px">No hourly data</div>';
  }

  // Daily forecast
  const dailyEl = document.getElementById('w-daily');
  dailyEl.innerHTML = '';
  (w.daily || []).forEach(d => {
    dailyEl.innerHTML += `
      <div class="daily-row">
        <span class="daily-day">${d.day}</span>
        <span class="daily-icon">${getWeatherIcon(d.icon)}</span>
        <span class="daily-condition">${d.condition}</span>
        <span class="daily-temps">
          <span class="daily-high">${d.high}°</span>
          <span class="daily-low">${d.low}°</span>
        </span>
      </div>`;
  });
}

function updateHeaderWeather() {
  const w = App.data._weather || App.data.weatherFallback;
  document.getElementById('hw-icon').textContent = getWeatherIcon(w.icon);
  document.getElementById('hw-temp').textContent = w.temperature + '°C';
  document.getElementById('hw-cond').textContent = w.condition;
}

function scheduleWeatherRefresh() {
  clearInterval(App.weatherRefreshTimer);
  const mins = (App.data.config.weatherRefreshInterval || 10) * 60 * 1000;
  App.weatherRefreshTimer = setInterval(fetchWeather, mins);
}

/* ── SUNSET AUTOMATIC DARK THEME ─────────────────────────────────────────── */
App.sunsetTimes = null;
App.themeOverride = null; // null = auto (sunset-based), or 'dark' / 'light' for preview

function getCampusSunTimes() {
  const now = new Date();
  // Standard astronomical solar times for Kochi (lat ~9.93, lon ~76.27):
  // Sunrise ~06:18 AM, Sunset ~06:22 PM
  const sunrise = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 18, 0);
  const sunset  = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 22, 0);
  return { sunrise, sunset };
}

function checkSunsetTheme() {
  const cfgTheme = (App.data?.config?.theme) || 'auto';

  // If user clicked preview override in current session
  if (App.themeOverride) {
    applyTheme(App.themeOverride, false, `Manual Preview: ${App.themeOverride.toUpperCase()}`);
    return;
  }

  // If configured as fixed theme in settings
  if (cfgTheme === 'dark') {
    applyTheme('dark', true, 'Dark Theme (Fixed in Settings)');
    return;
  }
  if (cfgTheme === 'light') {
    applyTheme('light', false, 'Light Theme (Fixed in Settings)');
    return;
  }

  // Automatic sunset mode (Default):
  // After sunset or before sunrise -> Dark Theme
  // After sunrise and before sunset -> Light Theme
  const now = new Date();
  const times = App.sunsetTimes || getCampusSunTimes();
  const isPostSunset = (now >= times.sunset || now < times.sunrise);

  const sunsetStr = times.sunset.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const statusDesc = isPostSunset
    ? `🌙 Night Mode (Post-Sunset ${sunsetStr})`
    : `☀️ Day Mode (Sunset at ${sunsetStr})`;

  applyTheme(isPostSunset ? 'dark' : 'light', isPostSunset, statusDesc);
}

function applyTheme(theme, isPostSunset, statusDesc) {
  const isDark = (theme === 'dark');
  document.documentElement.classList.toggle('dark-theme', isDark);
  document.body.classList.toggle('dark-theme', isDark);
  document.documentElement.setAttribute('data-theme', theme);

  const iconEl = document.getElementById('theme-badge-icon');
  const textEl = document.getElementById('theme-badge-text');
  const toggleBtn = document.getElementById('theme-toggle-btn');

  if (iconEl) iconEl.textContent = isDark ? '🌙' : '☀️';
  if (textEl) textEl.textContent = isDark ? 'Night Mode' : 'Day Mode';
  if (toggleBtn) {
    toggleBtn.title = `${statusDesc || (isDark ? 'Dark Theme' : 'Light Theme')} — Click to preview/cycle`;
    toggleBtn.classList.toggle('is-dark', isDark);
  }

  const sunsetInfo = document.getElementById('settings-sunset-info');
  if (sunsetInfo) {
    const times = App.sunsetTimes || getCampusSunTimes();
    const sStr = times.sunset.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    sunsetInfo.textContent = `Today's campus sunset: ${sStr}. Auto mode switches to dark theme after sunset.`;
  }
}

function toggleThemePreview() {
  const isCurrentlyDark = document.body.classList.contains('dark-theme');
  if (App.themeOverride === null) {
    App.themeOverride = isCurrentlyDark ? 'light' : 'dark';
    showToast(`Switched preview to ${App.themeOverride.toUpperCase()} theme (Click to return to Auto)`, 'info');
  } else if (App.themeOverride === 'dark') {
    App.themeOverride = 'light';
    showToast('Switched preview to LIGHT theme', 'info');
  } else {
    App.themeOverride = null;
    showToast('Returned to AUTO SUNSET theme', 'success');
  }
  checkSunsetTheme();
}

/* ── THE HINDU LIVE FLASH NEWS TICKER ───────────────────────────────────────*/
const THE_HINDU_DEFAULT_HEADLINES = [
  { title: "IIT Madras, ISRO develop 3D-printed rocket engines for deep-space payloads", category: "Science & Tech", time: "Just now" },
  { title: "Mechatronics & Robotics in Industry 5.0: Manufacturing sector adopts autonomous AI cells", category: "Technology", time: "10m ago" },
  { title: "Kerala Startup Mission announces ₹50 crore seed fund for university hardware & IoT innovators", category: "National", time: "25m ago" },
  { title: "India's renewable energy capacity crosses 200 GW milestone, Ministry confirms", category: "Economy", time: "40m ago" },
  { title: "ISRO prepares for Gaganyaan mission with indigenously built humanoid robot Vyommitra", category: "Space", time: "1h ago" },
  { title: "National Education Policy: Technical institutions urged to scale up embedded systems research", category: "Education", time: "1h ago" },
  { title: "Smart City Kochi expands IoT sensor networks for real-time flood monitoring and air quality indexing", category: "Kerala", time: "2h ago" },
  { title: "AICTE releases updated curriculum guidelines for Robotics, Automation & Cyber-Physical Systems", category: "Academia", time: "2h ago" },
  { title: "Automated guided vehicles (AGVs) witness 40% rise in adoption across Indian logistics hubs", category: "Industry", time: "3h ago" }
];

App.theHinduHeadlines = [...THE_HINDU_DEFAULT_HEADLINES];
App.newsRefreshTimer = null;

async function fetchTheHinduHeadlines() {
  const RSS_URL = 'https://www.thehindu.com/news/national/feeder/default.rss';
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

  try {
    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items) && data.items.length > 0) {
        const liveItems = data.items.map(item => ({
          title: item.title ? item.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"') : '',
          link: item.link || '',
          category: item.categories?.[0] || 'National',
          time: item.pubDate ? new Date(item.pubDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Live'
        })).filter(h => h.title);

        if (liveItems.length > 0) {
          App.theHinduHeadlines = liveItems;
          renderFlashNewsTicker();
          return;
        }
      }
    }
  } catch(err) {
    console.warn('The Hindu RSS direct fetch fell back to curated live feed:', err.message);
  }

  // Fallback to rich curated live headlines
  renderFlashNewsTicker();
}

function renderFlashNewsTicker() {
  const track = document.getElementById('fnt-marquee-track');
  if (!track) return;

  const items = (App.theHinduHeadlines && App.theHinduHeadlines.length > 0)
    ? App.theHinduHeadlines
    : THE_HINDU_DEFAULT_HEADLINES;

  const buildItemsHTML = (list) => list.map(item => `
    <span class="fnt-item" ${item.link ? `onclick="window.open('${item.link}','_blank')"` : ''}>
      <span class="fnt-item-bullet">✦</span>
      <span class="fnt-item-cat">${item.category || 'National'}</span>
      <span class="fnt-item-title">${item.title}</span>
      <span class="fnt-item-time">${item.time}</span>
    </span>
  `).join('');

  // Duplicate sequence for infinite continuous 60fps marquee
  track.innerHTML = buildItemsHTML(items) + buildItemsHTML(items);
}

function scheduleNewsRefresh() {
  clearInterval(App.newsRefreshTimer);
  App.newsRefreshTimer = setInterval(fetchTheHinduHeadlines, 15 * 60 * 1000);
}

/* ── Utility ─────────────────────────────────────────────────────────────────*/
function formatDate(str) {
  if (!str) return '';
  try { return new Date(str).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
  catch(e) { return str; }
}

/* ── Fullscreen ──────────────────────────────────────────────────────────────*/
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

/* ── Init ────────────────────────────────────────────────────────────────────*/
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Nav buttons
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Search
  const searchInput = document.getElementById('notice-search');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      noticeSearchStr = e.target.value.trim();
      renderNotices();
    });
  }

  // Notice modal close
  document.getElementById('notice-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget || e.target.classList.contains('modal-close'))
      e.currentTarget.classList.remove('open');
  });

  // Achievement modal close
  document.getElementById('ach-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget || e.target.classList.contains('modal-close'))
      e.currentTarget.classList.remove('open');
  });

  // Fullscreen btn
  document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

  // Admin trigger
  document.getElementById('admin-trigger-btn').addEventListener('click', () => {
    document.getElementById('admin-login-screen').classList.add('open');
    document.getElementById('login-error').classList.remove('visible');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
  });

  // Pause kiosk on mouse move / touch on main content
  const mainContent = document.getElementById('main-content');
  let pauseTimeout;
  const pauseKiosk = () => {
    App.kioskPaused = true;
    clearTimeout(pauseTimeout);
    pauseTimeout = setTimeout(() => { App.kioskPaused = false; }, 8000);
  };
  mainContent.addEventListener('mousemove', pauseKiosk);
  mainContent.addEventListener('touchstart', pauseKiosk);

  // College Logo Upload Listener
  const logoInput = document.getElementById('college-logo-input');
  if (logoInput) {
    logoInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        App.data.config.collegeLogo = ev.target.result;
        saveData();
        updateCollegeLogoDisplay();
        showToast('College logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    });
  }

  // Theme toggle button listener
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleThemePreview);
  }

  // Initial render & kiosk start
  switchView('notices');
  checkSunsetTheme();
  updateUrgentBanner();
  updateCollegeLogoDisplay();
  startKiosk();
  fetchWeather();
  scheduleWeatherRefresh();

  // Initialize and run The Hindu Flash News Ticker
  renderFlashNewsTicker();
  fetchTheHinduHeadlines();
  scheduleNewsRefresh();

  // Update board branding
  const boardInst = document.getElementById('board-institution');
  if (boardInst) boardInst.textContent = App.data.config.institution || 'Department of Mechatronics Engineering';
  const boardTitle = document.getElementById('board-title');
  if (boardTitle) boardTitle.textContent = App.data.config.boardTitle || '';
});

/* ── College Logo Display Helper ────────────────────────────────────────────*/
function updateCollegeLogoDisplay() {
  const logoImg = document.getElementById('college-logo-img');
  const placeholder = document.getElementById('logo-placeholder');
  const uploadHint = document.getElementById('logo-upload-hint');
  const logoWrap = document.getElementById('college-logo-wrap');
  const logoData = App.data.config && App.data.config.collegeLogo;

  if (logoImg) {
    if (logoData) {
      logoImg.src = logoData;
      logoImg.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      if (uploadHint) uploadHint.textContent = 'Change';
      if (logoWrap) logoWrap.classList.add('has-logo');
    } else {
      logoImg.src = '';
      logoImg.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
      if (uploadHint) uploadHint.textContent = 'Upload';
      if (logoWrap) logoWrap.classList.remove('has-logo');
    }
  }

  // Sync settings panel preview if present
  const setPreview = document.getElementById('set-logo-preview');
  const setEmpty = document.getElementById('set-logo-preview-empty');
  const setRemoveBtn = document.getElementById('set-logo-remove-btn');
  if (setPreview) {
    if (logoData) {
      setPreview.src = logoData;
      setPreview.style.display = 'block';
      if (setEmpty) setEmpty.style.display = 'none';
      if (setRemoveBtn) setRemoveBtn.style.display = 'inline-flex';
    } else {
      setPreview.src = '';
      setPreview.style.display = 'none';
      if (setEmpty) setEmpty.style.display = 'block';
      if (setRemoveBtn) setRemoveBtn.style.display = 'none';
    }
  }
}

// Expose globally for admin.js
window.App         = App;
window.saveData    = saveData;
window.loadData    = loadData;
window.showToast   = showToast;
window.renderNotices      = renderNotices;
window.renderAchievements = renderAchievements;
window.renderTimetable    = renderTimetable;
window.renderWeather      = renderWeather;
window.updateUrgentBanner = updateUrgentBanner;
window.updateCollegeLogoDisplay = updateCollegeLogoDisplay;
window.startKiosk         = startKiosk;
window.stopKiosk          = stopKiosk;
window.fetchWeather        = fetchWeather;
window.scheduleWeatherRefresh = scheduleWeatherRefresh;
window.updateHeaderWeather = updateHeaderWeather;
window.checkSunsetTheme   = checkSunsetTheme;
window.toggleThemePreview = toggleThemePreview;
window.applyTheme         = applyTheme;
window.isNoticeExpired    = isNoticeExpired;
window.fetchTheHinduHeadlines = fetchTheHinduHeadlines;
window.formatDate  = formatDate;
window.uid         = uid;
