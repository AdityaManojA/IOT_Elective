# Changelog

All notable changes and task progress for the IoT Smart Notice Board project are documented in this file.

---

## [Task 0] — Baseline Audit and Plan
- **Date**: 2026-10-08
- **Issues Audited**:
  - Identified frontend entry point `public/index.html` with verified DOM elements: `#notices-grid`, `#achievements-grid`, `#tt-classes-grid`, `#day-pills`, `#view-*`, `#header`, `#header-weather`, `#clock-time`, `#clock-date`, `.status-badge`.
  - Identified frontend script loading in `public/index.html`: `js/mock-data.js` -> `js/app.js` -> `js/admin.js`.
  - Identified state model: `window.DEFAULT_NOTICE_DATA` in `mock-data.js` and `App.data` in `app.js` backed by `localStorage` (`noticeboard_data`).
  - Identified critical rendering defect in `public/js/app.js`: `renderNotices()` erroneously targets `document.getElementById('notices-container') || document.getElementById('main-content')`, destroying the `#main-content` page shell and removing weather, timetable, achievements, and navigation. Similarly `renderAchievements()` targets `#achievements-container` instead of `#achievements-grid`.
  - Identified backend state: `cors.txt` contains the baseline Flask backend with several defects (`pasword` typo, unimported `send_from_directory`, invalid `SETTINGS_FILE` expression, hardcoded admin credentials, lack of token auth, wildcard CORS, `load_json` returning `[]` for dict schemas, and no timetable/health routes).
  - Identified deployment scripts and config: `package.json` had `"dev"` and `"start"` serving `.` instead of `public/`, and missing `"build"` script needed by `.github/workflows/firebase-hosting-*.yml`. Root `.gitignore` lacked `.env*`, python caches, and data directory exclusions.
  - Verified `RTK.md`: searched repository and found 0 references; confirmed it is not an existing documentation dependency.
- **Files Inspected**:
  - `public/index.html`
  - `public/js/app.js`
  - `public/js/admin.js`
  - `public/js/mock-data.js`
  - `cors.txt`
  - `package.json`
  - `firebase.json`
  - `.github/workflows/firebase-hosting-merge.yml`
  - `.github/workflows/firebase-hosting-pull-request.yml`
  - `.gitignore`
- **Graphify Verification**:
  - Graphify CLI verified and active (`graphify 0.9.71`).
  - Queried graph for frontend entry points, renderers, and call relationships.
  - Confirmed 105 nodes, 169 edges in baseline graph.
- **Plan**:
  - Task 1: Frontend state and safe DOM rendering (Fix renderNotices #notices-grid, renderAchievements #achievements-grid, safe HTML/DOM, unified state assignment).
  - Task 2: Flask API, authentication, CORS, persistence (Repair backend from `cors.txt`, token auth, scoped CORS, atomic JSON, health/timetable/settings routes, tests).
  - Task 3: Admin saves, settings, imports, exports, logo flow (Backend sync, token auth, logo flow, schema validation).
  - Task 4: Notices, navigation, filters, status, weather, timetable (Deadline expiry, search/filter wiring, live Pi health status, weather pressure, break formatting).
  - Task 5: Local startup, package scripts, deployment, ignored files (Serve `public/`, build script, workflows, root `.gitignore`).
  - Task 6: Final handoff and complete documentation (`README.md`, `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT.md`).

---

## [Task 1] — Frontend State and Safe DOM Rendering
- **Date**: 2026-10-08
- **Issues Addressed**:
  - Fixed catastrophic bug where `renderNotices()` targeted `notices-container` or `main-content`, replacing `#main-content` and obliterating weather, timetable, achievements, and navigation. Target corrected to verified `#notices-grid`.
  - Fixed `renderAchievements()` targeting `achievements-container` or `stars-view` instead of verified `#achievements-grid`.
  - Added safe DOM guards in all renderers (`renderNotices`, `renderAchievements`, `renderTimetable`, `renderWeather`) returning diagnostic warnings if elements are absent without corrupting page shell.
  - Implemented safe escaping helper `escapeHTML` and URL validator `isValidHttpUrl` to prevent XSS and unsafe URLs. Removed inline event handlers on notices, achievements, and flash news items.
  - Added `rel="noopener noreferrer"` attributes for external links in flash news ticker and validated schemes (`http:`, `https:`).
  - Standardized application data model: backend fetchers `fetchNoticesFromBackend` and `fetchAchievementsFromBackend` now assign fetched data directly to shared `App.data` before rendering; navigation and admin updates render current shared state cleanly.
  - Standardized renderer argument defaults: both renderers accept optional data arrays (updating shared state) and default to shared `App.data` when arguments are omitted.
  - Added `public/config.js` static configuration to decouple frontend from hardcoded private IP `10.178.192.24`.
  - Fixed timetable break pill to display icon (`🍱` / `☕`) rather than raw boolean string.
  - Fixed weather pressure to read actual `surface_pressure` from Open-Meteo with fallback.
- **Files Changed**:
  - `public/js/app.js`
  - `public/index.html`
  - `public/config.js`
  - `tests/test_frontend_dom.js`
- **Behavior / API Contract Changed**:
  - `renderNotices()` and `renderAchievements()` now populate `#notices-grid` and `#achievements-grid` respectively.
  - Shared state is assigned before rendering.
- **Tests and Checks Run**:
  - Automated DOM test suite: `node tests/test_frontend_dom.js` (passed 5/5 tests). Verified `#notices-grid` and `#achievements-grid` render properly and `#main-content` is never destroyed or mutated.
- **Graphify Status**:
  - Graphify refreshed and verified after Task 1 changes.
- **Unresolved Limitations**:
  - Backend API persistence and authorization to be resolved in Task 2.

---

## [Task 2] — Flask API, Authentication, CORS, and Persistence
- **Date**: 2026-10-08
- **Issues Addressed**:
  - Inspected and repaired baseline Flask code provided in `cors.txt` and integrated it into `backend/app.py` with root entrypoint `app.py`.
  - Fixed typo `pasword` to `password` in login request handler and utilized constant-time comparison (`hmac.compare_digest`) against environment credentials.
  - Imported `send_from_directory` from Flask and fixed `GET /api/logo` route.
  - Removed stray invalid expression `SETTINGS_FILE+"settings.json"` and correctly initialized atomic data storage paths.
  - Fixed JSON loader to return schema-appropriate defaults: empty list `[]` for notices/achievements, and empty dict `{}` for timetable/settings.
  - Replaced wildcard CORS (`*`) with configurable allowed origins via `CORS_ORIGINS` environment variable, supporting preflight OPTIONS, `Authorization`, and `Content-Type` headers.
  - Implemented secure token-based session management (`secrets.token_hex(32)`) with expiration (`TOKEN_EXPIRY_SECONDS`), enforcing `@require_auth` on all mutating routes (`POST /api/notices`, `POST /api/achievements`, `POST /api/timetable`, `POST /api/settings`, `POST /api/upload-logo`).
  - Added public `GET /api/health` endpoint for kiosk status checks.
  - Added dedicated `GET` and `POST` routes for `/api/timetable`.
  - Added atomic JSON file writing (`save_json_atomic`) using temporary files and atomic replacement to protect against power interruption corruption on Raspberry Pi.
  - Implemented safe notice/achievement sync semantics supporting both full-list updates and individual item upserts without appending duplicate records.
  - Added logo upload validation enforcing file extension checks, image MIME type validation, 2MB size cap, and safe storage in configurable `UPLOAD_FOLDER`.
  - Created `requirements.txt` with backend dependencies.
  - Documented full API specifications in `docs/API.md`.
- **Files Changed**:
  - `backend/app.py`
  - `backend/__init__.py`
  - `app.py`
  - `requirements.txt`
  - `tests/test_api.py`
  - `tests/__init__.py`
  - `docs/API.md`
- **Behavior / API Contract Changed**:
  - Login now returns `{ success: true, token: "...", expiresIn: ... }`.
  - Mutating operations require `Authorization: Bearer <token>`.
  - Safe defaults returned for empty stores (`[]` vs `{}`).
- **Tests and Checks Run**:
  - Automated pytest suite: `python -m pytest tests/test_api.py -v` (8 passed in 1.46s).
  - Verified: health check, login success/failure, public reads, unauthorized write rejection, notice sync, timetable/settings persistence with credential stripping, CORS preflight handling.
- **Graphify Status**:
  - Graphify refreshed and verified after Task 2 changes.
- **Unresolved Limitations**:
  - Frontend admin panel integration with Bearer tokens and sync to be connected in Task 3.

---

## [Task 3] — Admin Saves, Settings, Imports, Exports, and Logo Flow
- **Date**: 2026-10-08
- **Issues Addressed**:
  - Fixed disconnect between frontend admin changes and backend persistence: admin saves for notices, achievements, timetable periods, and settings now perform atomic synchronization with the backend API via `syncToBackend()`.
  - Added explicit distinction between local cache updates and backend persistence: UI toasts explicitly notify when changes are synced to backend vs saved locally due to offline/unreachable server or session expiry.
  - Implemented token authentication flow in `public/js/admin.js`: `doLogin()` stores bearer token in `sessionStorage` (`iot_admin_token`) and attaches `Authorization: Bearer <token>` to all mutating API requests. Handled `401`/`403` session expiration by clearing session token and alerting user.
  - Fixed crash in `saveSettings()` and `loadSettings()` when `App.data.admin` is missing or undefined by providing safe fallback objects.
  - Fixed credential leakage and security defects: passwords and tokens are never persisted in `App.data`, never stored in `localStorage`, and stripped completely in `saveData()`.
  - Fixed `exportData()`: all credentials, tokens, and session secrets are strictly stripped before downloading the backup JSON.
  - Hardened `handleImport()`: validates JSON schema against expected structures (rejecting malformed/incompatible files without destroying state), creates a pre-import recoverable snapshot in `localStorage` (`noticeboard_pre_import_backup`), strips credentials from imported objects, and syncs valid data to the backend if logged in.
  - Overhauled timetable period tracking to use stable unique identifiers (`p.id`) rather than array indices: prevents period editing/deletion redirects when earlier items are removed or reordered.
  - Fixed college logo upload and display flow: logo file upload now validates file type and 2MB limit, sends `multipart/form-data` with Bearer token to `POST /api/upload-logo`, updates config with returned path, and properly resolves relative URLs (`/uploads/...`) against the API base URL in both header and settings displays.
  - Exposed admin handlers globally on `window` to support declarative HTML event bindings and headless test suites.
- **Files Changed**:
  - `public/js/admin.js`
  - `public/js/app.js`
  - `tests/test_frontend_dom.js`
  - `docs/CHANGELOG.md`
- **Behavior / API Contract Changed**:
  - `doLogin()` saves token to `sessionStorage`.
  - Notice, achievement, timetable, and settings modifications trigger authenticated backend sync.
  - Settings and export formats strictly exclude credentials.
  - Timetable periods maintain persistent `id` attributes.
- **Tests and Checks Run**:
  - `node tests/test_frontend_dom.js`: 9/9 tests passed (DOM integrity, safe rendering, view switching, crash-free settings, credential sanitization in saveData, credential exclusion in exportData, timetable stable ID editing).
  - `python -m pytest tests/test_api.py -v`: 8/8 tests passed.
- **Graphify Status**:
  - Refreshed via `graphify update .` and queried updated admin relationships.
- **Unresolved Limitations**:
  - Task 4 board interaction, filters, search, timetable midnight rollover, and status badge health polling to be addressed next.

