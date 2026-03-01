/* ============================================
   Al Uswah Access - Application Logic (Firebase)
   ============================================ */

// ── Configuration ──
const defaultConfig = {
  site_title: 'Al Uswah Access',
  site_subtitle: 'Sistem Akses Data Sekolah',
  footer_text: '© 2026 Al Uswah Access',
};
let config = { ...defaultConfig };

// ── State ──
let currentUser = null; // { uid, name, email, role, photo, branch }
let currentPage = 'dashboard-home';
let pageHistory = [];
let users = [];
let allAttendanceLogs = {};
let menuData = [];
let branches = [];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const branchOffices = ['Manajemen Al Uswah Banyuwangi', 'SMPIT Al Uswah Banyuwangi', 'SDIT Al Uswah Banyuwangi', 'SDIT Al Uswah 2', 'MATIQ Al Uswah', 'TKIT Al Hafidz', 'TKIT PMB 2', 'TKIT PMB 3', 'TKIT Al Uswah 4', 'TKIT Al Uswah 5'];

// ── Default Data ──
const defaultMenuData = [
  {
    id: 7, name: 'Data Keuangan', icon: '💰', directUrl: '', submenu: [
      { id: 71, name: 'Slip Gaji', type: 'internal', internalPage: 'slip-gaji' }
    ]
  },
  { id: 4, name: 'Data Quran', icon: '🕌', directUrl: '', submenu: [] },
  {
    id: 8, name: 'Data Arsip', icon: '🗄️', directUrl: '', submenu: [
      { id: 81, name: 'Arsip Administrasi Umum', type: 'internal', internalPage: 'arsip-admin-umum' },
      { id: 82, name: 'Arsip Sarana & Prasarana', type: 'internal', internalPage: 'arsip-sarpras' },
      { id: 83, name: 'Arsip Kegiatan & Dokumentasi', type: 'internal', internalPage: 'arsip-kegiatan' }
    ]
  },
  { id: 6, name: 'Galeri', icon: '🖼️', directUrl: '', submenu: [] }
];

const defaultBranches = [
  { id: 'manajemen_al_uswah', name: 'Manajemen Al Uswah', secret: 'AUSWH_' + Date.now().toString(36) + '_mgmt', createdAt: new Date().toISOString() },
  { id: 'smpit_al_uswah', name: 'SMPIT Al Uswah', secret: 'AUSWH_' + Date.now().toString(36) + '_smpit', createdAt: new Date().toISOString() },
  { id: 'sdit_al_uswah', name: 'SDIT Al Uswah', secret: 'AUSWH_' + Date.now().toString(36) + '_sdit', createdAt: new Date().toISOString() },
  { id: 'sdit_al_uswah_2', name: 'SDIT Al Uswah 2', secret: 'AUSWH_' + Date.now().toString(36) + '_sdit2', createdAt: new Date().toISOString() },
  { id: 'matiq_al_uswah', name: 'MATIQ Al Uswah', secret: 'AUSWH_' + Date.now().toString(36) + '_matiq', createdAt: new Date().toISOString() },
  { id: 'tkit_al_hafidz', name: 'TKIT Al Hafidz', secret: 'AUSWH_' + Date.now().toString(36) + '_hafidz', createdAt: new Date().toISOString() },
  { id: 'tkit_pmb_2', name: 'TKIT PMB 2', secret: 'AUSWH_' + Date.now().toString(36) + '_pmb2', createdAt: new Date().toISOString() },
  { id: 'tkit_pmb_3', name: 'TKIT PMB 3', secret: 'AUSWH_' + Date.now().toString(36) + '_pmb3', createdAt: new Date().toISOString() },
  { id: 'tkit_al_uswah_4', name: 'TKIT Al Uswah 4', secret: 'AUSWH_' + Date.now().toString(36) + '_tkit4', createdAt: new Date().toISOString() },
  { id: 'tkit_al_uswah_5', name: 'TKIT Al Uswah 5', secret: 'AUSWH_' + Date.now().toString(36) + '_tkit5', createdAt: new Date().toISOString() }
];

// ── Role Permissions ──
const _guruAccess = {
  allowedPages: ['dashboard-home', 'profile', 'data-pegawai', 'scan-attendance', 'attendance-log', 'perizinan', 'pelanggaran', 'slip-gaji'],
  allowedMenuIds: [4, 6, 7], canManage: false, canRekap: false, canManageUsers: false,
  dashboardItems: [
    { page: 'profile', icon: '👤', title: 'Profil', desc: 'Lihat & edit profil' },
    { page: 'scan-attendance', icon: '📷', title: 'Scan Absensi', desc: 'Absen masuk & pulang' },
    { page: 'attendance-log', icon: '📋', title: 'Log Absen', desc: 'Riwayat kehadiran' },
    { page: 'perizinan', icon: '📨', title: 'Perizinan', desc: 'Ajukan izin & sakit' },
    { page: 'pelanggaran', icon: '⚠️', title: 'Pelanggaran', desc: 'Status pelanggaran' },
  ], dashboardMenuIds: [4, 6, 7]
};
const _adminAccess = {
  allowedPages: ['dashboard-home', 'profile', 'data-pegawai', 'scan-attendance', 'attendance-log', 'perizinan', 'pelanggaran', 'manage-users', 'rekap-kehadiran', 'manual-attendance', 'slip-gaji', 'arsip-admin-umum', 'arsip-sarpras', 'arsip-kegiatan'],
  allowedMenuIds: 'all', canManage: false, canRekap: true, canManageUsers: true, canManualAttendance: true,
  dashboardItems: [
    { page: 'profile', icon: '👤', title: 'Profil', desc: 'Lihat & edit profil' },
    { page: 'scan-attendance', icon: '📷', title: 'Scan Absensi', desc: 'Absen masuk & pulang' },
    { page: 'attendance-log', icon: '📋', title: 'Log Absen', desc: 'Riwayat kehadiran' },
    { page: 'perizinan', icon: '📨', title: 'Perizinan', desc: 'Kelola perizinan' },
    { page: 'pelanggaran', icon: '⚠️', title: 'Pelanggaran', desc: 'Kelola pelanggaran' },
    { page: 'rekap-kehadiran', icon: '📊', title: 'Rekap Kehadiran', desc: 'Rekap lembaga Anda' },
    { page: 'manual-attendance', icon: '📝', title: 'Absensi Manual', desc: 'Input izin, sakit, dll' },
  ], dashboardMenuIds: 'all'
};

const rolePermissions = {
  guru: { label: 'Guru', ..._guruAccess },
  staf: { label: 'Staf', ..._guruAccess },
  wali_kelas: { label: 'Wali Kelas', ..._guruAccess },
  admin_cabang: { label: 'Admin Lembaga', ..._adminAccess },
  kepala_sekolah: { label: 'Kepala Sekolah', ..._adminAccess },
  manajer: { label: 'Manajer', ..._adminAccess },
  direktur: { label: 'Direktur', ..._adminAccess },
  super_admin: {
    label: 'Super Admin', allowedPages: ['dashboard-home', 'profile', 'data-pegawai', 'scan-attendance', 'attendance-log', 'perizinan', 'pelanggaran', 'manage-menu', 'manage-users', 'rekap-kehadiran', 'manage-qrcode', 'manual-attendance', 'slip-gaji', 'arsip-admin-umum', 'arsip-sarpras', 'arsip-kegiatan'],
    allowedMenuIds: 'all', canManage: true, canRekap: true, canManageUsers: true, canManualAttendance: true,
    dashboardItems: [
      { page: 'profile', icon: '👤', title: 'Profil', desc: 'Lihat & edit profil' },
      { page: 'scan-attendance', icon: '📷', title: 'Scan Absensi', desc: 'Absen masuk & pulang' },
      { page: 'attendance-log', icon: '📋', title: 'Log Absen', desc: 'Riwayat kehadiran' },
      { page: 'perizinan', icon: '📨', title: 'Perizinan', desc: 'Kelola perizinan' },
      { page: 'pelanggaran', icon: '⚠️', title: 'Pelanggaran', desc: 'Kelola pelanggaran' },
      { page: 'rekap-kehadiran', icon: '📊', title: 'Rekap Kehadiran', desc: 'Rekap semua user' },
      { page: 'manual-attendance', icon: '📝', title: 'Absensi Manual', desc: 'Input izin, sakit, dll' },
    ], dashboardMenuIds: 'all'
  }
};

const menuCardConfig = [
  { menuIndex: 0, icon: '💰', title: 'Data Keuangan', desc: 'Keuangan & slip gaji', menuId: 7 },
  { menuIndex: 1, icon: '🕌', title: 'Data Quran', desc: 'Tahfidz & Murojaah', menuId: 4 },
  { menuIndex: 2, icon: '🗄️', title: 'Data Arsip', desc: 'Arsip & dokumentasi', menuId: 8 },
  { menuIndex: 3, icon: '🖼️', title: 'Galeri', desc: 'Dokumentasi Kegiatan', menuId: 6 },
];

function getRoleLabel(role) { return rolePermissions[role]?.label || role; }
function isSuperAdmin() { return currentUser?.role === 'super_admin'; }
const adminLevelRoles = ['admin_cabang', 'kepala_sekolah', 'manajer', 'direktur'];
function isAdminCabang() { return adminLevelRoles.includes(currentUser?.role); }
function getRoleBadgeClass(role) {
  if (role === 'super_admin') return 'bg-red-100 text-red-700';
  if (role === 'direktur') return 'bg-rose-100 text-rose-700';
  if (role === 'manajer') return 'bg-amber-100 text-amber-700';
  if (role === 'kepala_sekolah') return 'bg-orange-100 text-orange-700';
  if (role === 'admin_cabang') return 'bg-purple-100 text-purple-700';
  if (role === 'wali_kelas') return 'bg-blue-100 text-blue-700';
  if (role === 'staf') return 'bg-cyan-100 text-cyan-700';
  return 'bg-teal-100 text-teal-700';
}
function getRoleSelectClass(role) {
  if (role === 'super_admin') return 'bg-red-50 border-red-200 text-red-700';
  if (role === 'direktur') return 'bg-rose-50 border-rose-200 text-rose-700';
  if (role === 'manajer') return 'bg-amber-50 border-amber-200 text-amber-700';
  if (role === 'kepala_sekolah') return 'bg-orange-50 border-orange-200 text-orange-700';
  if (role === 'admin_cabang') return 'bg-purple-50 border-purple-200 text-purple-700';
  if (role === 'wali_kelas') return 'bg-blue-50 border-blue-200 text-blue-700';
  if (role === 'staf') return 'bg-cyan-50 border-cyan-200 text-cyan-700';
  return 'bg-teal-50 border-teal-200 text-teal-700';
}
function generateSecret() { return 'AUSWH_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 10); }

function getFilteredMenuData() {
  if (!currentUser) return [];
  const perm = rolePermissions[currentUser.role];
  if (!perm) return [];
  if (perm.allowedMenuIds === 'all') return menuData;
  return menuData.filter(m => perm.allowedMenuIds.includes(m.id));
}

function canAccessPage(pageName) {
  if (!currentUser) return false;
  const perm = rolePermissions[currentUser.role];
  if (!perm) return false;
  if (perm.allowedMenuIds === 'all') return true;
  if (perm.allowedPages.includes(pageName)) return true;
  if (pageName === 'submenu') return getFilteredMenuData().length > 0;
  return false;
}

function getUserLogs(uid) {
  if (!allAttendanceLogs[uid]) allAttendanceLogs[uid] = [];
  return allAttendanceLogs[uid];
}

// ── App Initialization ──
async function initApp() {
  console.log('[App] Initializing...');
  auth.onAuthStateChanged(async (firebaseUser) => {
    const overlay = document.getElementById('loadingOverlay');
    if (firebaseUser) {
      try {
        let userData = await DB.getUser(firebaseUser.uid);
        if (userData) {
          currentUser = userData;
        } else {
          // UID doc not found — search by email (pre-registered user)
          const emailMatch = await DB.findUserByEmail(firebaseUser.email);
          if (emailMatch) {
            // Migrate to UID-based doc, keep the existing role
            currentUser = { ...emailMatch, uid: firebaseUser.uid, email: firebaseUser.email };
            await DB.saveUser(firebaseUser.uid, currentUser);
            // Remove old doc if different ID
            if (emailMatch.uid && emailMatch.uid !== firebaseUser.uid) {
              try { await DB.deleteUser(emailMatch.uid); } catch (_) { }
            }
            console.log('[App] Migrated user from email lookup, role:', currentUser.role);
          } else {
            // Truly new user — default to guru
            currentUser = { uid: firebaseUser.uid, name: firebaseUser.displayName || firebaseUser.email.split('@')[0], email: firebaseUser.email, role: 'guru', photo: '', createdAt: new Date().toISOString() };
            await DB.saveUser(firebaseUser.uid, currentUser);
          }
        }
        // Auto-migrate old 'admin' role to 'super_admin'
        if (currentUser.role === 'admin') {
          currentUser.role = 'super_admin';
          await DB.updateUser(currentUser.uid, { role: 'super_admin' });
          console.log('[App] Migrated admin → super_admin');
        }
        await loadAppData();
        showDashboard();
      } catch (e) {
        console.error('[App] Error loading user:', e);
        showLoginPage();
      }
    } else {
      showLoginPage();
    }
    if (overlay) overlay.classList.add('hidden');
  });
}

async function loadAppData() {
  try {
    const [savedMenus, savedBranches, savedUsers] = await Promise.all([
      DB.getMenus(), DB.getBranches(), DB.getAllUsers()
    ]);
    menuData = savedMenus || [...defaultMenuData];
    branches = savedBranches || [...defaultBranches];
    users = savedUsers || [];
    // Load attendance for current user
    const logs = await DB.getAttendanceLogs(currentUser.uid);
    allAttendanceLogs[currentUser.uid] = logs || [];
    // If first time, seed defaults to Firestore
    if (!savedMenus) await DB.saveMenus(menuData);
    if (!savedBranches) await DB.saveBranches(branches);
    // Merge any new default menus that don't exist in saved data
    if (savedMenus) {
      let updated = false;
      defaultMenuData.forEach((defMenu, idx) => {
        if (!menuData.some(m => m.id === defMenu.id)) {
          menuData.splice(idx, 0, defMenu);
          updated = true;
        }
        // Also merge new submenus into existing menus
        const existing = menuData.find(m => m.id === defMenu.id);
        if (existing && defMenu.submenu) {
          defMenu.submenu.forEach(defSub => {
            if (!existing.submenu.some(s => s.id === defSub.id)) {
              existing.submenu.push(defSub);
              updated = true;
            }
          });
        }
      });
      // Remove deprecated menus not in defaultMenuData
      const defaultIds = defaultMenuData.map(m => m.id);
      const before = menuData.length;
      menuData = menuData.filter(m => defaultIds.includes(m.id));
      if (menuData.length !== before) updated = true;
      if (updated) await DB.saveMenus(menuData);
    }
  } catch (e) { console.error('[App] loadAppData error:', e); }
}

function showLoginPage() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('registerPage').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  currentUser = null;
}

function showDashboard() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('registerPage').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRoleText').textContent = getRoleLabel(currentUser.role);
  document.getElementById('roleDisplay').textContent = getRoleLabel(currentUser.role);
  // Update mobile sidebar user info
  const msbName = document.getElementById('mobileSidebarUserName');
  const msbRole = document.getElementById('mobileSidebarUserRole');
  if (msbName) msbName.textContent = currentUser.name;
  if (msbRole) msbRole.textContent = getRoleLabel(currentUser.role);
  document.getElementById('adminOnlyMenu').classList[currentUser.role === 'super_admin' ? 'remove' : 'add']('hidden');
  const acMenu = document.getElementById('adminCabangMenu');
  if (acMenu) acMenu.classList[currentUser.role === 'admin_cabang' ? 'remove' : 'add']('hidden');
  // Show branch label in header for admin_lembaga
  if (currentUser.role === 'admin_cabang' && currentUser.branch) {
    document.getElementById('roleDisplay').textContent = getRoleLabel(currentUser.role) + ' — ' + currentUser.branch;
  }
  renderSidebar();
  renderMobileMenu();
  const welcomeEl = document.getElementById('welcomeText');
  if (welcomeEl) welcomeEl.textContent = `Assalamualaikum, ${currentUser.name}`;
  renderDashboardCards();
  showPage('dashboard-home');
  checkWarningBadge();
}

// ── UI Helpers ──
function updateUI() {
  const el = (id) => document.getElementById(id);
  if (el('loginTitle')) el('loginTitle').textContent = config.site_title;
  if (el('loginSubtitle')) el('loginSubtitle').textContent = config.site_subtitle;
  if (el('headerTitle')) el('headerTitle').textContent = config.site_title;
  if (el('footerText')) el('footerText').textContent = config.footer_text;
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-teal-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  toast.className = `toast ${bg} text-white px-6 py-3 rounded-xl shadow-lg`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function getPhotoHTML(user, size = 'w-32 h-32', textSize = 'text-5xl') {
  if (user.photo) return `<img src="${user.photo}" alt="Foto" class="${size} rounded-full object-cover shadow-lg">`;
  return `<div class="${size} gradient-bg rounded-full flex items-center justify-center shadow-lg"><span class="${textSize}">👤</span></div>`;
}

// ── Auth (Firebase) ──
async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');
  if (!email || !password) { errorEl.textContent = 'Email dan password harus diisi'; errorEl.classList.remove('hidden'); return; }
  btn.disabled = true; btn.textContent = 'Memproses...';
  errorEl.classList.add('hidden');
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showToast('Login berhasil!');
  } catch (e) {
    console.error('[Auth] Login error:', e);
    let msg = 'Email atau password salah';
    if (e.code === 'auth/user-not-found') msg = 'Akun tidak ditemukan';
    else if (e.code === 'auth/wrong-password') msg = 'Password salah';
    else if (e.code === 'auth/invalid-email') msg = 'Format email tidak valid';
    else if (e.code === 'auth/too-many-requests') msg = 'Terlalu banyak percobaan. Coba lagi nanti.';
    else if (e.code === 'auth/invalid-credential') msg = 'Email atau password salah';
    errorEl.textContent = msg; errorEl.classList.remove('hidden');
  }
  btn.disabled = false; btn.textContent = 'Masuk';
}

// ── Self-Registration ──
function showRegisterPage() {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('registerPage').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  // Clear form
  const fields = ['registerName', 'registerEmail', 'registerPassword', 'registerConfirmPassword',
    'registerBirthPlace', 'registerBirthDate', 'registerWhatsapp', 'registerAddress',
    'registerRT', 'registerRW', 'registerVillage', 'registerDistrict', 'registerProvince', 'registerPostalCode'];
  fields.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  const selects = ['registerGender', 'registerBranch'];
  selects.forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
  const errEl = document.getElementById('registerError');
  const sucEl = document.getElementById('registerSuccess');
  if (errEl) errEl.classList.add('hidden');
  if (sucEl) sucEl.classList.add('hidden');
  const strEl = document.getElementById('passwordStrength');
  if (strEl) strEl.classList.add('hidden');
}

function showLoginFromRegister() {
  document.getElementById('registerPage').classList.add('hidden');
  document.getElementById('loginPage').classList.remove('hidden');
}

async function handleRegister() {
  const v = (id) => (document.getElementById(id)?.value || '').trim();
  const name = v('registerName');
  const gender = v('registerGender');
  const birthPlace = v('registerBirthPlace');
  const birthDate = v('registerBirthDate');
  const branch = v('registerBranch');
  const email = v('registerEmail');
  const whatsapp = v('registerWhatsapp');
  const address = v('registerAddress');
  const rt = v('registerRT');
  const rw = v('registerRW');
  const village = v('registerVillage');
  const district = v('registerDistrict');
  const province = v('registerProvince');
  const postalCode = v('registerPostalCode');
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('registerConfirmPassword').value;
  const errorEl = document.getElementById('registerError');
  const successEl = document.getElementById('registerSuccess');
  const btn = document.getElementById('registerBtn');

  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');

  // Validations — required fields
  if (!name || !gender || !birthPlace || !birthDate || !email || !whatsapp || !address || !branch || !password || !confirmPassword) {
    errorEl.textContent = 'Semua field bertanda * harus diisi';
    errorEl.classList.remove('hidden');
    return;
  }
  if (name.length < 2) {
    errorEl.textContent = 'Nama minimal 2 karakter';
    errorEl.classList.remove('hidden');
    return;
  }
  if (password.length < 6) {
    errorEl.textContent = 'Password minimal 6 karakter';
    errorEl.classList.remove('hidden');
    return;
  }
  if (password !== confirmPassword) {
    errorEl.textContent = 'Konfirmasi password tidak cocok';
    errorEl.classList.remove('hidden');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Mendaftarkan...';

  try {
    // Create user with Firebase Auth (this auto-signs in the new user)
    const cred = await auth.createUserWithEmailAndPassword(email, password);

    // Save user profile to Firestore with default role 'guru'
    const userData = {
      uid: cred.user.uid,
      name, email, role: 'guru', branch, photo: '',
      gender, birthPlace, birthDate,
      whatsapp, address, rt, rw,
      village, district, province, postalCode,
      createdAt: new Date().toISOString()
    };
    await DB.saveUser(cred.user.uid, userData);

    console.log('[Auth] New user registered:', email, '→ role: guru');
    showToast('Pendaftaran berhasil! Selamat datang, ' + name);
    // onAuthStateChanged will fire and redirect to dashboard
  } catch (e) {
    console.error('[Auth] Register error:', e);
    let msg = 'Gagal mendaftar';
    if (e.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar. Silakan masuk.';
    else if (e.code === 'auth/invalid-email') msg = 'Format email tidak valid';
    else if (e.code === 'auth/weak-password') msg = 'Password terlalu lemah (minimal 6 karakter)';
    else if (e.code === 'auth/operation-not-allowed') msg = 'Pendaftaran tidak diizinkan. Hubungi Admin.';
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
  btn.disabled = false;
  btn.textContent = 'Daftar';
}

function toggleRegisterPasswordVisibility(inputId, iconId) {
  const pw = document.getElementById(inputId);
  if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
}

function checkPasswordStrength(password) {
  const container = document.getElementById('passwordStrength');
  const bar = document.getElementById('passwordStrengthBar');
  const text = document.getElementById('passwordStrengthText');
  if (!container || !bar || !text) return;

  if (!password || password.length === 0) {
    container.classList.add('hidden');
    return;
  }
  container.classList.remove('hidden');

  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Remove old classes
  bar.className = 'h-full rounded-full transition-all duration-300';

  if (score <= 1) {
    bar.classList.add('strength-weak');
    text.textContent = 'Lemah';
    text.className = 'text-xs mt-1 text-red-500';
  } else if (score === 2) {
    bar.classList.add('strength-fair');
    text.textContent = 'Cukup';
    text.className = 'text-xs mt-1 text-yellow-500';
  } else if (score === 3) {
    bar.classList.add('strength-good');
    text.textContent = 'Baik';
    text.className = 'text-xs mt-1 text-blue-500';
  } else {
    bar.classList.add('strength-strong');
    text.textContent = 'Kuat';
    text.className = 'text-xs mt-1 text-green-500';
  }
}

async function handleLogout() {
  try {
    await auth.signOut();
    currentUser = null;
    allAttendanceLogs = {};
    showToast('Anda telah keluar dari sistem');
  } catch (e) { console.error('[Auth] Logout error:', e); }
}

function togglePasswordVisibility() {
  const pw = document.getElementById('loginPassword');
  if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
}
function toggleMobileMenu() {
  const sidebar = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileSidebarOverlay');
  const isOpen = !sidebar.classList.contains('-translate-x-full');
  if (isOpen) {
    sidebar.classList.add('-translate-x-full');
    sidebar.classList.remove('translate-x-0');
    overlay.classList.add('hidden');
  } else {
    sidebar.classList.remove('-translate-x-full');
    sidebar.classList.add('translate-x-0');
    overlay.classList.remove('hidden');
  }
}

// ── Navigation ──
function showPage(pageName) {
  if (!canAccessPage(pageName)) { showToast('Anda tidak memiliki akses ke halaman ini', 'error'); return; }
  // Stop QR scanner if leaving scan page
  if (currentPage === 'scan-attendance' && pageName !== 'scan-attendance' && html5QrScanner) { stopScanner(); }
  document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
  const page = document.getElementById(`page-${pageName}`);
  if (page) { page.classList.remove('hidden'); currentPage = pageName; }
  document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
  if (pageName === 'manage-menu') renderMenuList();
  if (pageName === 'manage-users') loadAndRenderUserList();
  if (pageName === 'profile') renderProfile();
  if (pageName === 'attendance-log') renderAttendanceLogs();
  if (pageName === 'rekap-kehadiran') loadAndRenderRekap();
  if (pageName === 'manage-qrcode') renderQRCodePage();
  if (pageName === 'manual-attendance') renderManualAttendance();
  if (pageName === 'perizinan') renderPerizinan();
  if (pageName === 'pelanggaran') renderPelanggaran();
  if (pageName === 'data-pegawai') renderDataPegawai();
  if (pageName === 'slip-gaji') renderSlipGaji();
  if (pageName === 'arsip-admin-umum') renderArsipPage('arsip-admin-umum', 'arsipAdminUmumContent', arsipAdminUmumConfig);
  if (pageName === 'arsip-sarpras') renderArsipPage('arsip-sarpras', 'arsipSarprasContent', arsipSarprasConfig);
  if (pageName === 'arsip-kegiatan') renderArsipPage('arsip-kegiatan', 'arsipKegiatanContent', arsipKegiatanConfig);
}
function goBack() { showPage(pageHistory.pop() || 'dashboard-home'); }

// ── Profile ──
function profileField(label, value) {
  return `<div><label class="text-sm text-gray-500 block mb-1">${label}</label><p class="text-base font-semibold text-gray-800 border-b pb-2">${value || '<span class="text-gray-400 italic">Belum diisi</span>'}</p></div>`;
}

function renderProfile() {
  if (!currentUser) return;
  const u = currentUser;
  const c = document.getElementById('profileContent');
  c.innerHTML = `
    <!-- Photo & Role Header -->
    <div class="flex flex-col items-center mb-8">
      <div class="relative group mb-3">
        ${getPhotoHTML(u)}
        <label for="photoUpload" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span class="text-white text-sm font-medium">📷</span>
        </label>
        <input type="file" id="photoUpload" accept="image/*" capture="environment" class="hidden" onchange="handlePhotoUpload(event)">
      </div>
      <label for="photoUpload" class="text-sm text-teal-600 font-medium cursor-pointer hover:text-teal-800 transition-colors">📷 Ganti Foto</label>
      ${u.photo ? '<button onclick="deleteProfilePhoto()" class="text-sm text-red-500 font-medium cursor-pointer hover:text-red-700 transition-colors mt-1">🗑️ Hapus Foto</button>' : ''}
      <div class="mt-3 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(u.role)}">${getRoleLabel(u.role)}</span>
        <p class="text-sm text-gray-500 mt-1">${u.branch || '<span class="text-gray-400 italic">Lembaga belum diatur</span>'}</p>
      </div>
    </div>

    <!-- Bagian 1: Data Diri -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><span class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3"><span class="text-sm">👤</span></span>Data Diri</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${profileField('Nama Lengkap', u.name)}
        ${profileField('Jenis Kelamin', u.gender)}
        ${profileField('Tempat Lahir', u.birthPlace)}
        ${profileField('Tanggal Lahir', u.birthDate)}
      </div>
    </div>

    <!-- Bagian 2: Alamat dan Kontak -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><span class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3"><span class="text-sm">📍</span></span>Alamat dan Kontak</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${profileField('Email', u.email)}
        ${profileField('No. WhatsApp', u.whatsapp)}
        <div class="md:col-span-2">${profileField('Alamat', u.address)}</div>
        ${profileField('RT', u.rt)}
        ${profileField('RW', u.rw)}
        ${profileField('Desa/Kelurahan', u.village)}
        ${profileField('Kecamatan/Kota/Kabupaten', u.district)}
        ${profileField('Provinsi', u.province)}
        ${profileField('Kode Pos', u.postalCode)}
      </div>
    </div>

    <div class="pt-2"><button onclick="showEditProfile()" class="btn-hover gradient-bg text-white font-semibold px-6 py-3 rounded-xl shadow-lg">✏️ Edit Profil</button></div>
  `;
}

// ── Data Pegawai ──
let dataPegawaiList = [];
async function renderDataPegawai() {
  const container = document.getElementById('dataPegawaiContent');
  if (!container) return;
  container.innerHTML = `<div class="text-center py-12"><div class="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-500">Memuat data pegawai...</p></div>`;
  try {
    const allUsers = await DB.getAllUsers();
    // Exclude admin-level roles from pegawai list
    const adminRoles = ['super_admin', 'admin_cabang'];
    const nonAdminUsers = allUsers.filter(u => !adminRoles.includes(u.role));
    // Filter by same branch as current user
    if (currentUser.branch) {
      dataPegawaiList = nonAdminUsers.filter(u => u.branch === currentUser.branch);
    } else {
      dataPegawaiList = nonAdminUsers;
    }
    if (dataPegawaiList.length === 0) {
      container.innerHTML = `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-5xl mb-4">👥</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Belum Ada Data Pegawai</h3>
        <p class="text-gray-500">Tidak ditemukan pegawai pada lembaga ${currentUser.branch || 'Anda'}.</p>
      </div>`;
      return;
    }
    // Search bar + list
    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 class="font-semibold text-gray-800">Daftar Pegawai — ${currentUser.branch || 'Semua Lembaga'}</h3>
            <p class="text-sm text-gray-500 mt-1">${dataPegawaiList.length} pegawai terdaftar</p>
          </div>
          <div class="relative">
            <input type="text" id="searchPegawai" placeholder="Cari pegawai..." oninput="filterPegawaiList()" 
              class="pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 w-full md:w-64 text-sm">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <div id="pegawaiGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${renderPegawaiCards(dataPegawaiList)}
        </div>
      </div>`;
  } catch (e) {
    console.error('[DataPegawai] Error:', e);
    container.innerHTML = `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
      <p class="text-red-500">Gagal memuat data pegawai.</p>
    </div>`;
  }
}

function renderPegawaiCards(list) {
  return list.map(user => `
    <div onclick="viewPegawaiDetail('${user.uid}')" 
      class="bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl p-4 cursor-pointer transition-all duration-200 group">
      <div class="flex items-center space-x-4">
        ${user.photo
      ? `<img src="${user.photo}" class="w-12 h-12 rounded-full object-cover shadow-sm">`
      : `<div class="w-12 h-12 gradient-bg rounded-full flex items-center justify-center shadow-sm"><span class="text-lg">👤</span></div>`}
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 truncate group-hover:text-teal-700 transition-colors">${user.name}</p>
          <p class="text-sm text-gray-500 truncate">${user.email}</p>
          <span class="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span>
        </div>
        <svg class="w-5 h-5 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </div>
    </div>
  `).join('');
}

function filterPegawaiList() {
  const query = (document.getElementById('searchPegawai')?.value || '').toLowerCase();
  const filtered = dataPegawaiList.filter(u =>
    u.name.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query) ||
    (getRoleLabel(u.role) || '').toLowerCase().includes(query)
  );
  const grid = document.getElementById('pegawaiGrid');
  if (grid) {
    grid.innerHTML = filtered.length > 0
      ? renderPegawaiCards(filtered)
      : `<div class="col-span-full text-center py-8 text-gray-400">Tidak ditemukan pegawai dengan kata kunci "${query}"</div>`;
  }
}

function viewPegawaiDetail(uid) {
  const user = dataPegawaiList.find(u => u.uid === uid);
  if (!user) { showToast('Data pegawai tidak ditemukan', 'error'); return; }
  const container = document.getElementById('dataPegawaiContent');
  container.innerHTML = `
    <div class="mb-4">
      <button onclick="renderDataPegawai()" class="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg> Kembali ke Daftar
      </button>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
      <!-- Photo & Role Header -->
      <div class="flex flex-col items-center mb-8">
        ${getPhotoHTML(user)}
        <div class="mt-3 text-center">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span>
          <p class="text-sm text-gray-500 mt-1">${user.branch || '<span class="text-gray-400 italic">Lembaga belum diatur</span>'}</p>
        </div>
      </div>
      <!-- Bagian 1: Data Diri -->
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><span class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3"><span class="text-sm">👤</span></span>Data Diri</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${profileField('Nama Lengkap', user.name)}
          ${profileField('Jenis Kelamin', user.gender)}
          ${profileField('Tempat Lahir', user.birthPlace)}
          ${profileField('Tanggal Lahir', user.birthDate)}
        </div>
      </div>
      <!-- Bagian 2: Alamat dan Kontak -->
      <div>
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><span class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3"><span class="text-sm">📍</span></span>Alamat dan Kontak</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${profileField('Email', user.email)}
          ${profileField('No. WhatsApp', user.whatsapp)}
          <div class="md:col-span-2">${profileField('Alamat', user.address)}</div>
          ${profileField('RT', user.rt)}
          ${profileField('RW', user.rw)}
          ${profileField('Desa/Kelurahan', user.village)}
          ${profileField('Kecamatan/Kota/Kabupaten', user.district)}
          ${profileField('Provinsi', user.province)}
          ${profileField('Kode Pos', user.postalCode)}
        </div>
      </div>
    </div>`;
}

function showEditProfile() {
  if (!currentUser) return;
  const u = currentUser;
  const inputCls = 'input-focus w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm text-gray-800';
  const c = document.getElementById('profileContent');
  c.innerHTML = `
    <!-- Photo -->
    <div class="flex flex-col items-center mb-8">
      <div class="relative group mb-3">
        ${getPhotoHTML(u)}
        <label for="photoUploadEdit" class="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <span class="text-white text-sm font-medium">📷</span>
        </label>
        <input type="file" id="photoUploadEdit" accept="image/*" capture="environment" class="hidden" onchange="handlePhotoUpload(event)">
      </div>
      <label for="photoUploadEdit" class="text-sm text-teal-600 font-medium cursor-pointer hover:text-teal-800 transition-colors">📷 Ganti Foto</label>
      ${u.photo ? '<button onclick="deleteProfilePhoto()" class="text-sm text-red-500 font-medium cursor-pointer hover:text-red-700 transition-colors mt-1">🗑️ Hapus Foto</button>' : ''}
      <div class="mt-3 text-center">
        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeClass(u.role)}">${getRoleLabel(u.role)}</span>
        <p class="text-sm text-gray-500 mt-1">${u.branch || '<span class="text-gray-400 italic">Lembaga belum diatur</span>'}</p>
      </div>
    </div>

    <!-- Bagian 1: Data Diri -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><span class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3"><span class="text-sm">👤</span></span>Data Diri</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="text-sm text-gray-500 block mb-1">Nama Lengkap</label><input type="text" id="editName" value="${u.name || ''}" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">Jenis Kelamin</label>
          <select id="editGender" class="${inputCls} bg-white">
            <option value="">-- Pilih --</option>
            <option value="Laki-laki" ${u.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
            <option value="Perempuan" ${u.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
          </select>
        </div>
        <div><label class="text-sm text-gray-500 block mb-1">Tempat Lahir</label><input type="text" id="editBirthPlace" value="${u.birthPlace || ''}" placeholder="Contoh: Jakarta" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">Tanggal Lahir</label><input type="date" id="editBirthDate" value="${u.birthDate || ''}" class="${inputCls}"></div>
      </div>
    </div>

    <!-- Bagian 2: Alamat dan Kontak -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center"><span class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center mr-3"><span class="text-sm">📍</span></span>Alamat dan Kontak</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label class="text-sm text-gray-500 block mb-1">Email</label><p class="text-base font-semibold text-gray-800 border-b pb-2">${u.email}</p></div>
        <div><label class="text-sm text-gray-500 block mb-1">No. WhatsApp</label><input type="tel" id="editWhatsapp" value="${u.whatsapp || ''}" placeholder="08xxxxxxxxxx" class="${inputCls}"></div>
        <div class="md:col-span-2"><label class="text-sm text-gray-500 block mb-1">Alamat</label><textarea id="editAddress" rows="2" placeholder="Alamat lengkap" class="${inputCls}">${u.address || ''}</textarea></div>
        <div><label class="text-sm text-gray-500 block mb-1">RT</label><input type="text" id="editRT" value="${u.rt || ''}" placeholder="001" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">RW</label><input type="text" id="editRW" value="${u.rw || ''}" placeholder="001" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">Desa/Kelurahan</label><input type="text" id="editVillage" value="${u.village || ''}" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">Kecamatan/Kota/Kabupaten</label><input type="text" id="editDistrict" value="${u.district || ''}" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">Provinsi</label><input type="text" id="editProvince" value="${u.province || ''}" class="${inputCls}"></div>
        <div><label class="text-sm text-gray-500 block mb-1">Kode Pos</label><input type="text" id="editPostalCode" value="${u.postalCode || ''}" placeholder="12345" class="${inputCls}"></div>
      </div>
    </div>

    <div class="flex space-x-3 pt-2">
      <button onclick="saveProfile()" class="btn-hover gradient-bg text-white font-semibold px-6 py-3 rounded-xl shadow-lg">💾 Simpan</button>
      <button onclick="renderProfile()" class="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold transition-colors">Batal</button>
    </div>
  `;
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Pilih file gambar yang valid', 'error'); return; }
  if (file.size > 10 * 1024 * 1024) { showToast('Ukuran file maksimal 10MB', 'error'); return; }
  showToast('Mengupload foto...', 'info');
  // Resize image before saving to Firestore (max 200x200, JPEG 0.7 quality)
  const reader = new FileReader();
  reader.onload = function (e) {
    const img = new Image();
    img.onload = async function () {
      const canvas = document.createElement('canvas');
      const maxSize = 200;
      let w = img.width, h = img.height;
      if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
      else { w = Math.round(w * maxSize / h); h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', 0.7);
      currentUser.photo = compressed;
      await DB.updateUser(currentUser.uid, { photo: compressed });
      renderProfile();
      showToast('Foto profil berhasil diperbarui!');
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

async function deleteProfilePhoto() {
  if (!currentUser.photo) return;
  if (!confirm('Hapus foto profil?')) return;
  currentUser.photo = '';
  await DB.updateUser(currentUser.uid, { photo: '' });
  renderProfile();
  showToast('Foto profil berhasil dihapus');
}

async function saveProfile() {
  const val = (id) => (document.getElementById(id)?.value || '').trim();
  const newName = val('editName');
  if (!newName) { showToast('Nama tidak boleh kosong', 'error'); return; }
  const updates = {
    name: newName,
    gender: val('editGender'),
    birthPlace: val('editBirthPlace'),
    birthDate: val('editBirthDate'),
    whatsapp: val('editWhatsapp'),
    address: val('editAddress'),
    rt: val('editRT'),
    rw: val('editRW'),
    village: val('editVillage'),
    district: val('editDistrict'),
    province: val('editProvince'),
    postalCode: val('editPostalCode'),
  };
  Object.assign(currentUser, updates);
  await DB.updateUser(currentUser.uid, updates);
  document.getElementById('userName').textContent = currentUser.name;
  renderProfile();
  showToast('Profil berhasil diperbarui!');
}

// ── Dashboard Cards ──
function renderDashboardCards() {
  const container = document.getElementById('dashboardCardsGrid');
  if (!container) return;
  const perm = rolePermissions[currentUser?.role];
  if (!perm) { container.innerHTML = ''; return; }
  let html = perm.dashboardItems.map(item => `
    <button onclick="showPage('${item.page}')" class="card-hover bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-400 cursor-pointer text-left transition-all">
      <div class="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4"><span class="text-2xl">${item.icon}</span></div>
      <h3 class="font-semibold text-gray-800">${item.title}</h3>
      <p class="text-sm text-gray-500 mt-1">${item.desc}</p>
    </button>`).join('');
  const filtered = getFilteredMenuData();
  const visibleMenuCards = perm.dashboardMenuIds === 'all' ? menuCardConfig : menuCardConfig.filter(c => perm.dashboardMenuIds.includes(c.menuId));
  html += visibleMenuCards.filter(card => filtered.some(m => m.id === card.menuId)).map(card => `
    <button onclick="navigateToMenu(${card.menuIndex})" class="card-hover bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-teal-400 cursor-pointer text-left transition-all">
      <div class="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center mb-4"><span class="text-2xl">${card.icon}</span></div>
      <h3 class="font-semibold text-gray-800">${card.title}</h3>
      <p class="text-sm text-gray-500 mt-1">${card.desc}</p>
    </button>`).join('');
  container.innerHTML = html;
}

// ── Sidebar & Mobile Menu ──
function renderSidebar() {
  const filtered = getFilteredMenuData();
  const perm = rolePermissions[currentUser?.role];
  document.getElementById('sidebarMenu').innerHTML = filtered.map(menu => {
    if (menu.directUrl) {
      return `<a href="${menu.directUrl}" target="_blank" rel="noopener noreferrer" class="sidebar-item w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 cursor-pointer hover:text-teal-600"><span>${menu.icon}</span><span>${menu.name}</span><svg class="w-3 h-3 ml-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`;
    }
    if (menu.submenu.length === 0) {
      return `<div class="sidebar-item w-full text-left px-4 py-3 rounded-xl flex items-center space-x-3 text-gray-400 cursor-default"><span>${menu.icon}</span><span>${menu.name}</span><span class="text-xs ml-auto">(kosong)</span></div>`;
    }
    return `
    <div class="menu-group">
      <button onclick="toggleDropdown(${menu.id})" class="sidebar-item w-full text-left px-4 py-3 rounded-xl flex items-center justify-between">
        <span class="flex items-center space-x-3"><span>${menu.icon}</span><span>${menu.name}</span></span>
        <svg class="w-4 h-4 transition-transform dropdown-arrow-${menu.id}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <div id="dropdown-${menu.id}" class="dropdown-content pl-12 space-y-1">
        ${menu.submenu.map(sub => {
      if (sub.internalPage) {
        return `<button onclick="showPage('${sub.internalPage}')" class="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">${sub.name}</button>`;
      }
      const url = sub.baseUrl || sub.directUrl || '';
      if (url) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">${sub.name}</a>`;
      }
      return `<span class="block w-full text-left px-4 py-2 text-sm text-gray-400 rounded-lg">${sub.name} <span class="text-xs">(belum ada URL)</span></span>`;
    }).join('')}
      </div>
    </div>`;
  }).join('');
  if (perm?.canRekap) { const r = document.getElementById('rekapMenu'); if (r) r.classList.remove('hidden'); }
  else { const r = document.getElementById('rekapMenu'); if (r) r.classList.add('hidden'); }
}

function renderMobileMenu() {
  const filtered = getFilteredMenuData();
  const perm = rolePermissions[currentUser?.role];
  document.getElementById('mobileMenuItems').innerHTML = filtered.map(menu => {
    if (menu.directUrl) {
      return `<a href="${menu.directUrl}" target="_blank" rel="noopener noreferrer" onclick="toggleMobileMenu()" class="block w-full text-left px-4 py-2 rounded-lg hover:bg-white/20 text-white/90">${menu.icon} ${menu.name}</a>`;
    }
    if (menu.submenu.length === 0) {
      return `<div class="w-full text-left px-4 py-2 rounded-lg text-white/50">${menu.icon} ${menu.name} <span class="text-xs">(kosong)</span></div>`;
    }
    return `
    <div>
      <button onclick="toggleMobileDropdown(${menu.id})" class="w-full text-left px-4 py-2 rounded-lg hover:bg-white/20 flex items-center justify-between text-white/90">
        <span>${menu.icon} ${menu.name}</span>
        <svg class="w-4 h-4 mobile-arrow-${menu.id}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      <div id="mobile-dropdown-${menu.id}" class="dropdown-content pl-8 space-y-1">
        ${menu.submenu.map(sub => {
      if (sub.internalPage) {
        return `<button onclick="showPage('${sub.internalPage}'); toggleMobileMenu()" class="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg">${sub.name}</button>`;
      }
      const url = sub.baseUrl || sub.directUrl || '';
      if (url) {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" onclick="toggleMobileMenu()" class="block w-full text-left px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg">${sub.name}</a>`;
      }
      return `<span class="block w-full text-left px-4 py-2 text-sm text-white/50 rounded-lg">${sub.name}</span>`;
    }).join('')}
      </div>
    </div>`;
  }).join('');
  const mobileRekap = document.getElementById('mobileRekapBtn');
  if (mobileRekap) mobileRekap.classList[perm?.canRekap ? 'remove' : 'add']('hidden');
  const mobileManual = document.getElementById('mobileManualBtn');
  if (mobileManual) mobileManual.classList[perm?.canManualAttendance ? 'remove' : 'add']('hidden');
  const mobileQR = document.getElementById('mobileQRBtn');
  if (mobileQR) mobileQR.classList[perm?.canManage ? 'remove' : 'add']('hidden');
  const mobileUsers = document.getElementById('mobileUsersBtn');
  if (mobileUsers) mobileUsers.classList[perm?.canManageUsers ? 'remove' : 'add']('hidden');
}

// ── Dropdowns ──
function toggleDropdown(menuId) {
  const dd = document.getElementById(`dropdown-${menuId}`);
  const arrow = document.querySelector(`.dropdown-arrow-${menuId}`);
  dd.classList.toggle('show');
  arrow.style.transform = dd.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}
function toggleMobileDropdown(menuId) {
  const dd = document.getElementById(`mobile-dropdown-${menuId}`);
  const arrow = document.querySelector(`.mobile-arrow-${menuId}`);
  dd.classList.toggle('show');
  if (arrow) arrow.style.transform = dd.classList.contains('show') ? 'rotate(180deg)' : 'rotate(0deg)';
}

// ── Submenu / Direct URL Navigation ──
function openSubmenu(id, name, year, type, baseUrl) {
  // Open submenu URL directly instead of month grid
  const url = baseUrl || '';
  if (url) { window.open(url, '_blank', 'noopener,noreferrer'); }
  else { showToast('URL belum diatur untuk submenu ini', 'info'); }
}

function navigateToMenu(menuIndex) {
  const menu = menuData[menuIndex];
  if (!menu) return;
  const filtered = getFilteredMenuData();
  if (!filtered.some(m => m.id === menu.id)) { showToast('Anda tidak memiliki akses', 'error'); return; }
  if (menu.directUrl) { window.open(menu.directUrl, '_blank', 'noopener,noreferrer'); return; }
  if (menu.submenu.length === 0) { showToast('Menu ini belum memiliki submenu.', 'info'); return; }
  // Show submenu items as direct link tiles
  pageHistory.push(currentPage);
  showPage('submenu');
  document.getElementById('submenuTitle').textContent = menu.name;
  document.getElementById('submenuYear').textContent = '';
  document.getElementById('monthGrid').innerHTML = menu.submenu.map(sub => {
    if (sub.internalPage) {
      return `<button onclick="showPage('${sub.internalPage}')" class="month-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center cursor-pointer hover:shadow-md transition-all">
        <div class="text-3xl mb-2">📄</div>
        <p class="font-medium text-gray-800">${sub.name}</p>
        <p class="text-xs text-teal-500 mt-1">Buka halaman</p>
      </button>`;
    }
    const url = sub.baseUrl || sub.directUrl || '';
    if (url) {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="month-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center cursor-pointer hover:shadow-md transition-all">
        <div class="text-3xl mb-2">${sub.type === 'drive' ? '📁' : '📊'}</div>
        <p class="font-medium text-gray-800">${sub.name}</p>
        <p class="text-xs text-gray-500 mt-1">${sub.type === 'drive' ? 'Google Drive' : 'Spreadsheet'}</p>
      </a>`;
    }
    return `<div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center opacity-50">
      <div class="text-3xl mb-2">${sub.type === 'drive' ? '📁' : '📊'}</div>
      <p class="font-medium text-gray-800">${sub.name}</p>
      <p class="text-xs text-red-400 mt-1">URL belum diatur</p>
    </div>`;
  }).join('');
}

function openSubmenuMonths(name, type, baseUrl) {
  // Just open the base URL directly
  if (baseUrl) { window.open(baseUrl, '_blank', 'noopener,noreferrer'); }
  else { showToast('URL belum diatur', 'info'); }
}

// ── QR Scanner (html5-qrcode) ──
let html5QrScanner = null;
let pendingScanType = null;

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const Q1 = lat1 * Math.PI / 180;
  const Q2 = lat2 * Math.PI / 180;
  const dq = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dq / 2) * Math.sin(dq / 2) + Math.cos(Q1) * Math.cos(Q2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

async function startScanner(type) {
  pendingScanType = type;
  const label = type === 'in' ? '📥 Scan Kedatangan' : '📤 Scan Kepulangan';
  document.getElementById('scannerLabel').textContent = label;
  document.getElementById('scannerSection').classList.remove('hidden');
  document.getElementById('scanResult').classList.add('hidden');

  const statusEl = document.getElementById('locationStatus');
  statusEl.classList.remove('hidden');
  statusEl.className = 'mb-4 text-sm font-medium p-3 rounded-xl bg-blue-50 text-blue-700';
  statusEl.innerHTML = 'Memeriksa lokasi Anda... <span class="animate-pulse">⏳</span>';

  // Highlight active button
  document.getElementById('btnScanIn').classList.toggle('ring-4', type === 'in');
  document.getElementById('btnScanIn').classList.toggle('ring-green-300', type === 'in');
  document.getElementById('btnScanOut').classList.toggle('ring-4', type === 'out');
  document.getElementById('btnScanOut').classList.toggle('ring-orange-300', type === 'out');

  // Stop any existing scanner
  if (html5QrScanner) {
    try { await html5QrScanner.stop(); } catch (_) { }
    html5QrScanner.clear();
    html5QrScanner = null;
  }

  // 1. Get Branch location data (if any)
  const userBranchName = currentUser?.branch;
  const branch = branches.find(b => b.name === userBranchName);

  if (branch && branch.lat && branch.lng && branch.radius) {
    if (!navigator.geolocation) {
      statusEl.className = 'mb-4 text-sm font-medium p-3 rounded-xl bg-red-50 text-red-700';
      statusEl.innerHTML = '1. Geolocation tidak didukung oleh browser Anda.';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const distance = getDistance(userLat, userLng, branch.lat, branch.lng);

        if (distance <= branch.radius) {
          statusEl.className = 'mb-4 text-sm font-medium p-3 rounded-xl bg-green-50 text-green-700';
          statusEl.innerHTML = `📍 Di dalam area (${distance}m dari pusat)`;
          initCamera();
        } else {
          statusEl.className = 'mb-4 text-sm font-medium p-3 rounded-xl bg-red-50 text-red-700';
          statusEl.innerHTML = `📍 Di luar area lembaga. Jarak Anda: ${distance} meter (Batas: ${branch.radius}m).`;
          // Do not start scanner
        }
      },
      (error) => {
        console.error('[Geolocation] Error:', error);
        statusEl.className = 'mb-4 text-sm font-medium p-3 rounded-xl bg-red-50 text-red-700';
        statusEl.innerHTML = '⚠️ Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan pada browser.';
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    // No geofence configuration for this branch, just allow it
    statusEl.classList.add('hidden');
    initCamera();
  }

  async function initCamera() {
    html5QrScanner = new Html5Qrcode("qr-reader");
    try {
      await html5QrScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure);
    } catch (err) {
      console.error('[Scanner] Camera start error:', err);
      try {
        await html5QrScanner.start({ facingMode: "user" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure);
      } catch (err2) {
        console.error('[Scanner] All cameras failed:', err2);
        showToast('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.', 'error');
        stopScanner();
      }
    }
  }
}

async function stopScanner() {
  if (html5QrScanner) {
    try { await html5QrScanner.stop(); } catch (_) { }
    try { html5QrScanner.clear(); } catch (_) { }
    html5QrScanner = null;
  }
  document.getElementById('scannerSection').classList.add('hidden');
  document.getElementById('btnScanIn').classList.remove('ring-4', 'ring-green-300');
  document.getElementById('btnScanOut').classList.remove('ring-4', 'ring-orange-300');
  pendingScanType = null;
}

function onScanFailure(error) {
  // Ignore continuous scan failures (camera is just looking for QR)
}

async function onScanSuccess(decodedText) {
  // Save scan type BEFORE stopping scanner (stopScanner resets pendingScanType to null)
  const scanType = pendingScanType || 'in';

  // Stop scanner immediately
  stopScanner();

  let qrData;
  try {
    qrData = JSON.parse(decodedText);
  } catch (e) {
    showScanResult(false, 'QR Code tidak valid. Pastikan Anda scan QR Code lembaga yang benar.');
    return;
  }

  // Validate QR code against known branches
  if (!qrData.branchId || !qrData.secret || qrData.app !== 'Al Uswah Access') {
    showScanResult(false, 'QR Code bukan milik Al Uswah Access.');
    return;
  }
  const branch = branches.find(b => b.id === qrData.branchId && b.secret === qrData.secret);
  if (!branch) {
    showScanResult(false, 'QR Code tidak dikenali atau sudah kadaluarsa. Hubungi Admin.');
    return;
  }

  // ── Geolocation re-check at scan time ──
  // If the branch has GPS coordinates, verify user is within radius NOW
  if (branch.lat && branch.lng && branch.radius) {
    if (!navigator.geolocation) {
      showScanResult(false, 'Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    showScanResult(false, '<span class="text-blue-600">📍 Memverifikasi lokasi Anda...</span>');

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const distance = getDistance(userLat, userLng, branch.lat, branch.lng);

      if (distance > branch.radius) {
        showScanResult(false, `📍 Anda berada di luar area lembaga.<br>
          <span class="text-sm text-gray-500">Jarak: ${distance}m (Batas maksimal: ${branch.radius}m)</span><br>
          <span class="text-sm text-gray-500">Silakan mendekat ke area lembaga untuk absensi.</span>`);
        return;
      }
      // User is within radius — proceed with attendance
    } catch (geoError) {
      console.error('[Geolocation] Scan-time verification error:', geoError);
      showScanResult(false, '⚠️ Gagal memverifikasi lokasi. Pastikan GPS aktif dan izin lokasi diberikan.');
      return;
    }
  }

  // Process attendance (only reached if geolocation check passed or no geofence configured)
  await processAttendance(scanType, branch);
}

async function processAttendance(type, branch) {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  const logs = getUserLogs(currentUser.uid);

  if (type === 'in') {
    const existing = logs.find(l => l.date === today && l.timeIn !== '-');
    if (existing) { showScanResult(false, 'Anda sudah melakukan absen masuk hari ini.'); return; }
    // Check if late (after 07:10)
    const isLate = now.getHours() > 7 || (now.getHours() === 7 && now.getMinutes() > 10);
    const status = isLate ? 'Terlambat' : 'Hadir';
    const newLog = { date: today, timeIn: time, timeOut: '-', status: status, note: `Masuk via scan @ ${branch.name}${isLate ? ' (Terlambat)' : ''}`, branch: branch.name };
    logs.unshift(newLog);
    await DB.updateAttendanceLogs(currentUser.uid, logs);
    const lateWarning = isLate ? '<br><span class="text-sm text-yellow-600 font-semibold">⚠️ Anda terlambat (batas 07:10)</span>' : '';
    showScanResult(true, `Absensi Kedatangan Berhasil!<br><span class="text-sm text-gray-500">Lembaga: ${branch.name} | Jam: ${time}</span>${lateWarning}`);
  } else {
    const todayLog = logs.find(l => l.date === today && l.timeOut === '-');
    if (!todayLog) { showScanResult(false, 'Tidak ada absen masuk hari ini. Lakukan absen Kedatangan terlebih dahulu.'); return; }
    todayLog.timeOut = time;
    todayLog.note = `Lengkap (Masuk & Pulang) @ ${branch.name}`;
    await DB.updateAttendanceLogs(currentUser.uid, logs);
    showScanResult(true, `Absensi Kepulangan Berhasil!<br><span class="text-sm text-gray-500">Lembaga: ${branch.name} | Jam: ${time}</span>`);
  }
  setTimeout(() => showPage('attendance-log'), 2000);
}

function showScanResult(success, message) {
  const resultDiv = document.getElementById('scanResult');
  const content = document.getElementById('scanResultContent');
  resultDiv.classList.remove('hidden');
  content.innerHTML = `
    <div class="flex flex-col items-center space-y-3">
      <div class="w-16 h-16 rounded-full flex items-center justify-center ${success ? 'bg-green-100' : 'bg-red-100'}">
        <span class="text-3xl">${success ? '✅' : '❌'}</span>
      </div>
      <p class="${success ? 'text-green-700' : 'text-red-700'} font-semibold text-lg">${message}</p>
    </div>`;
}

// ── Attendance Log (with filters) ──
function renderAttendanceLogs() {
  if (!currentUser) return;
  const logs = getUserLogs(currentUser.uid);
  const container = document.getElementById('attendanceLogContent');
  if (!container) return;
  const filterDate = document.getElementById('filterDate')?.value || '';
  const filterMonth = document.getElementById('filterMonth')?.value || '';
  const filterYear = document.getElementById('filterYear')?.value || '';
  let filtered = [...logs];
  if (filterDate) { filtered = filtered.filter(l => l.date === filterDate); }
  else {
    if (filterYear) filtered = filtered.filter(l => l.date.startsWith(filterYear));
    if (filterMonth) filtered = filtered.filter(l => { const m = parseInt(l.date.split('-')[1]); return m === parseInt(filterMonth); });
  }
  const years = [...new Set(logs.map(l => l.date.split('-')[0]))].sort().reverse();
  container.innerHTML = `
    <div class="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div><label class="text-xs text-gray-500 block mb-1">Tanggal</label><input type="date" id="filterDate" value="${filterDate}" onchange="renderAttendanceLogs()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400"></div>
        <div><label class="text-xs text-gray-500 block mb-1">Bulan</label><select id="filterMonth" onchange="renderAttendanceLogs()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-white"><option value="">Semua Bulan</option>${months.map((m, i) => `<option value="${i + 1}" ${parseInt(filterMonth) === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        <div><label class="text-xs text-gray-500 block mb-1">Tahun</label><select id="filterYear" onchange="renderAttendanceLogs()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-white"><option value="">Semua Tahun</option>${years.map(y => `<option value="${y}" ${filterYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
        <div class="flex items-end"><button onclick="clearLogFilters()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors">Reset Filter</button></div>
      </div>
    </div>
    <div class="overflow-x-auto"><table class="w-full mobile-cards"><thead class="bg-gray-50"><tr>
      <th class="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Tanggal</th>
      <th class="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Waktu Masuk</th>
      <th class="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Waktu Pulang</th>
      <th class="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
      <th class="px-4 md:px-6 py-4 text-left text-sm font-semibold text-gray-700">Keterangan</th>
    </tr></thead><tbody>
      ${filtered.length === 0 ? '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">Tidak ada data</td></tr>' : ''}
      ${filtered.map(log => `<tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td data-label="Tanggal" class="px-4 md:px-6 py-2 md:py-4 text-sm text-gray-800 font-medium">${log.date}</td>
        <td data-label="Masuk" class="px-4 md:px-6 py-2 md:py-4 text-sm text-gray-600 font-mono">${log.timeIn}</td>
        <td data-label="Pulang" class="px-4 md:px-6 py-2 md:py-4 text-sm text-gray-600 font-mono">${log.timeOut}</td>
        <td data-label="Status" class="px-4 md:px-6 py-2 md:py-4"><span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(log.status)}">${log.status}</span></td>
        <td data-label="Keterangan" class="px-4 md:px-6 py-2 md:py-4 text-sm text-gray-500">${log.note}</td>
      </tr>`).join('')}
    </tbody></table></div>
    <div class="p-3 border-t border-gray-100 bg-gray-50 text-center text-sm text-gray-500">Menampilkan ${filtered.length} dari ${logs.length} data</div>`;
}

function clearLogFilters() {
  const fd = document.getElementById('filterDate'); if (fd) fd.value = '';
  const fm = document.getElementById('filterMonth'); if (fm) fm.value = '';
  const fy = document.getElementById('filterYear'); if (fy) fy.value = '';
  renderAttendanceLogs();
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'Hadir': return 'bg-green-100 text-green-700';
    case 'Terlambat': return 'bg-yellow-100 text-yellow-700';
    case 'Izin': return 'bg-blue-100 text-blue-700';
    case 'Sakit': return 'bg-purple-100 text-purple-700';
    case 'Dinas Luar': return 'bg-indigo-100 text-indigo-700';
    case 'Alpha': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// ── Manual Attendance (Admin Only) ──
async function renderManualAttendance() {
  const container = document.getElementById('manualAttendanceContent');
  if (!container) { console.error('[ManualAttendance] Container not found'); return; }
  try {
    // Load users if not loaded
    if (!users || users.length === 0) {
      users = await DB.getAllUsers();
    }
    // Filter users by branch for admin_lembaga
    let filteredUsers = [...users];
    if (isAdminCabang() && currentUser.branch) {
      filteredUsers = filteredUsers.filter(u => u.branch === currentUser.branch);
    }
    const today = new Date().toISOString().split('T')[0];
    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-800 mb-4 flex items-center space-x-2"><span>📝</span><span>Input Absensi Manual</span></h3>
        <p class="text-sm text-gray-500 mb-6">Masukkan absensi manual untuk pegawai yang izin, sakit, dinas luar, atau alpha.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="text-sm text-gray-500 block mb-1">Pegawai</label>
            <select id="manualUser" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 bg-white">
              <option value="">-- Pilih Pegawai --</option>
              ${filteredUsers.map(u => '<option value="' + u.uid + '">' + u.name + ' (' + getRoleLabel(u.role) + (u.branch ? ' - ' + u.branch : '') + ')</option>').join('')}
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-500 block mb-1">Tanggal</label>
            <input type="date" id="manualDate" value="${today}" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400">
          </div>
          <div>
            <label class="text-sm text-gray-500 block mb-1">Status</label>
            <select id="manualStatus" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 bg-white">
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
              <option value="Dinas Luar">Dinas Luar</option>
              <option value="Alpha">Alpha</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-500 block mb-1">Keterangan (opsional)</label>
            <input type="text" id="manualNote" placeholder="Contoh: Sakit demam" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400">
          </div>
        </div>
        <button onclick="submitManualAttendance()" id="submitManualBtn" class="btn-hover gradient-bg text-white font-semibold px-6 py-3 rounded-xl shadow-lg">Simpan Absensi</button>
        <p id="manualError" class="text-red-500 text-sm mt-2 hidden"></p>
        <p id="manualSuccess" class="text-green-600 text-sm mt-2 hidden"></p>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-800 mb-4">Riwayat Absensi Manual Hari Ini</h3>
        <div id="manualHistory">
          <p class="text-gray-400 text-sm">Memuat...</p>
        </div>
      </div>`;
    // Load today's manual entries
    await loadManualHistory(today);
  } catch (err) {
    console.error('[ManualAttendance] Render error:', err);
    container.innerHTML = '<div class="bg-red-50 rounded-2xl p-6 text-red-600"><p class="font-semibold">Error memuat halaman:</p><p class="text-sm mt-1">' + err.message + '</p></div>';
  }
}

async function loadManualHistory(date) {
  const historyDiv = document.getElementById('manualHistory');
  if (!historyDiv) return;
  try {
    const allAtt = await DB.getAllAttendance();
    let filteredUsers2 = [...users];
    if (isAdminCabang() && currentUser.branch) {
      filteredUsers2 = filteredUsers2.filter(u => u.branch === currentUser.branch);
    }
    const manualStatuses = ['Izin', 'Sakit', 'Dinas Luar', 'Alpha'];
    const entries = [];
    filteredUsers2.forEach(user => {
      const logs = allAtt[user.uid] || [];
      logs.forEach(log => {
        if (log.date === date && manualStatuses.includes(log.status)) {
          entries.push({ user, log });
        }
      });
    });
    if (entries.length === 0) {
      historyDiv.innerHTML = '<p class="text-gray-400 text-sm text-center py-4">Belum ada data absensi manual untuk hari ini</p>';
      return;
    }
    historyDiv.innerHTML = `<div class="divide-y divide-gray-100">
      ${entries.map(e => `<div class="flex items-center justify-between py-3">
        <div class="flex items-center space-x-3">
          ${e.user.photo ? `<img src="${e.user.photo}" class="w-8 h-8 rounded-full object-cover">` : '<div class="w-8 h-8 gradient-bg rounded-full flex items-center justify-center"><span class="text-sm">👤</span></div>'}
          <div>
            <p class="text-sm font-medium text-gray-800">${e.user.name}</p>
            <p class="text-xs text-gray-500">${e.user.branch || '-'}</p>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(e.log.status)}">${e.log.status}</span>
          ${e.log.note ? `<span class="text-xs text-gray-500">${e.log.note}</span>` : ''}
        </div>
      </div>`).join('')}
    </div>`;
  } catch (err) {
    console.error('[ManualAttendance] Load history error:', err);
    historyDiv.innerHTML = '<p class="text-red-400 text-sm">Gagal memuat riwayat</p>';
  }
}

async function submitManualAttendance() {
  const uid = document.getElementById('manualUser')?.value;
  const date = document.getElementById('manualDate')?.value;
  const status = document.getElementById('manualStatus')?.value;
  const note = document.getElementById('manualNote')?.value?.trim() || '';
  const errorEl = document.getElementById('manualError');
  const successEl = document.getElementById('manualSuccess');
  const btn = document.getElementById('submitManualBtn');
  errorEl.classList.add('hidden');
  successEl.classList.add('hidden');
  if (!uid) { errorEl.textContent = 'Pilih pegawai terlebih dahulu'; errorEl.classList.remove('hidden'); return; }
  if (!date) { errorEl.textContent = 'Pilih tanggal terlebih dahulu'; errorEl.classList.remove('hidden'); return; }
  btn.disabled = true; btn.textContent = 'Menyimpan...';
  try {
    const logs = await DB.getAttendanceLogs(uid);
    // Check for duplicate entry on same date with same status
    const existing = logs.find(l => l.date === date && l.status === status);
    if (existing) {
      errorEl.textContent = `Pegawai ini sudah memiliki status "${status}" pada tanggal tersebut.`;
      errorEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = '✅ Simpan Absensi';
      return;
    }
    const statusEmojis = { 'Izin': '🔵', 'Sakit': '🟣', 'Dinas Luar': '🔷', 'Alpha': '🔴' };
    const newLog = {
      date: date,
      timeIn: '-',
      timeOut: '-',
      status: status,
      note: `${statusEmojis[status] || ''} ${status}${note ? ': ' + note : ''} (input manual oleh ${currentUser.name})`,
      branch: users.find(u => u.uid === uid)?.branch || '',
      manualEntry: true,
      enteredBy: currentUser.uid
    };
    logs.unshift(newLog);
    await DB.updateAttendanceLogs(uid, logs);
    // Also update local cache
    allAttendanceLogs[uid] = logs;
    const targetUser = users.find(u => u.uid === uid);
    successEl.textContent = `Absensi "${status}" untuk ${targetUser?.name || 'pegawai'} pada ${date} berhasil disimpan.`;
    successEl.classList.remove('hidden');
    showToast(`Absensi ${status} berhasil disimpan!`);
    // Reset form
    document.getElementById('manualNote').value = '';
    // Reload history
    await loadManualHistory(document.getElementById('manualDate')?.value || date);
  } catch (err) {
    console.error('[ManualAttendance] Submit error:', err);
    errorEl.textContent = 'Terjadi kesalahan saat menyimpan. Coba lagi.';
    errorEl.classList.remove('hidden');
  }
  btn.disabled = false; btn.textContent = '✅ Simpan Absensi';
}

// ── Admin: Rekap Kehadiran ──
async function loadAndRenderRekap() {
  try {
    users = await DB.getAllUsers();
    allAttendanceLogs = await DB.getAllAttendance();
  } catch (e) { console.error('[Rekap] Load error:', e); }
  renderRekap();
}

function renderRekap() {
  const container = document.getElementById('rekapContent');
  if (!container) return;
  const rekapMonth = document.getElementById('rekapMonth')?.value || '';
  const rekapYear = document.getElementById('rekapYear')?.value || new Date().getFullYear().toString();
  const rekapBranch = document.getElementById('rekapBranch')?.value || '';
  const allYears = new Set();
  Object.values(allAttendanceLogs).forEach(logs => logs.forEach(l => allYears.add(l.date.split('-')[0])));
  const years = [...allYears].sort().reverse();
  if (years.length === 0) years.push(new Date().getFullYear().toString());
  // Filter users by branch
  let filteredUsers = [...users];
  if (isAdminCabang() && currentUser.branch) {
    filteredUsers = filteredUsers.filter(u => u.branch === currentUser.branch);
  } else if (rekapBranch) {
    filteredUsers = filteredUsers.filter(u => u.branch === rekapBranch);
  }
  const userRows = filteredUsers.map(user => {
    const logs = allAttendanceLogs[user.uid] || [];
    let f = [...logs];
    if (rekapYear) f = f.filter(l => l.date.startsWith(rekapYear));
    if (rekapMonth) f = f.filter(l => parseInt(l.date.split('-')[1]) === parseInt(rekapMonth));
    return { user, hadir: f.filter(l => l.status === 'Hadir').length, terlambat: f.filter(l => l.status === 'Terlambat').length, izin: f.filter(l => l.status === 'Izin').length, sakit: f.filter(l => l.status === 'Sakit').length, dinasLuar: f.filter(l => l.status === 'Dinas Luar').length, alpha: f.filter(l => l.status === 'Alpha').length, get total() { return this.izin + this.sakit + this.alpha; } };
  });
  container.innerHTML = `
    <div class="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div><label class="text-xs text-gray-500 block mb-1">Bulan</label><select id="rekapMonth" onchange="renderRekap()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-white"><option value="">Semua Bulan</option>${months.map((m, i) => `<option value="${i + 1}" ${parseInt(rekapMonth) === i + 1 ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        <div><label class="text-xs text-gray-500 block mb-1">Tahun</label><select id="rekapYear" onchange="renderRekap()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-white">${years.map(y => `<option value="${y}" ${rekapYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
        ${isSuperAdmin() ? `<div><label class="text-xs text-gray-500 block mb-1">Lembaga</label><select id="rekapBranch" onchange="renderRekap()" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400 bg-white"><option value="">Semua Lembaga</option>${branchOffices.map(b => `<option value="${b}" ${rekapBranch === b ? 'selected' : ''}>${b}</option>`).join('')}</select></div>` : `<div><label class="text-xs text-gray-500 block mb-1">Lembaga</label><p class="px-3 py-2 text-sm font-medium text-teal-700">${currentUser.branch || 'Belum diatur'}</p></div>`}
        <div class="flex items-end gap-2"><button onclick="document.getElementById('rekapMonth').value=''; document.getElementById('rekapBranch').value=''; renderRekap()" class="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition-colors">Reset</button><button onclick="printRekap()" class="flex-1 px-3 py-2 rounded-lg gradient-bg text-white text-sm hover:opacity-90 transition-colors flex items-center justify-center gap-1">🖨️ Cetak</button></div>
      </div>
    </div>
    <div class="overflow-x-auto"><table class="w-full mobile-cards"><thead class="bg-gray-50"><tr>
      <th class="px-3 md:px-4 py-4 text-left text-sm font-semibold text-gray-700">Nama</th>
      <th class="px-3 md:px-4 py-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Role</th>
      <th class="px-3 md:px-4 py-4 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Lembaga</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-green-700">Hadir</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-yellow-700">Terlambat</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-blue-700">Izin</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-purple-700">Sakit</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-indigo-700 hidden md:table-cell">Dinas Luar</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-red-700">Alpha</th>
      <th class="px-2 md:px-3 py-4 text-center text-sm font-semibold text-gray-700 hidden md:table-cell">Total</th>
    </tr></thead><tbody>
      ${userRows.map(r => `<tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td data-label="Nama" class="px-3 md:px-4 py-2 md:py-4"><div class="flex items-center space-x-2">${r.user.photo ? `<img src="${r.user.photo}" class="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover">` : '<div class="w-7 h-7 md:w-8 md:h-8 gradient-bg rounded-full flex items-center justify-center"><span class="text-xs">👤</span></div>'}<span class="text-sm text-gray-800 font-medium">${r.user.name}</span></div></td>
        <td data-label="Role" class="px-3 md:px-4 py-2 md:py-4 hidden md:table-cell"><span class="px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(r.user.role)}">${getRoleLabel(r.user.role)}</span></td>
        <td data-label="Lembaga" class="px-3 md:px-4 py-2 md:py-4 text-sm text-gray-600 hidden md:table-cell">${r.user.branch || '-'}</td>
        <td data-label="Hadir" class="px-2 md:px-3 py-2 md:py-4 text-center"><span class="text-green-600 font-semibold">${r.hadir}</span></td>
        <td data-label="Terlambat" class="px-2 md:px-3 py-2 md:py-4 text-center"><span class="text-yellow-600 font-semibold">${r.terlambat}</span></td>
        <td data-label="Izin" class="px-2 md:px-3 py-2 md:py-4 text-center"><span class="text-blue-600 font-semibold">${r.izin}</span></td>
        <td data-label="Sakit" class="px-2 md:px-3 py-2 md:py-4 text-center"><span class="text-purple-600 font-semibold">${r.sakit}</span></td>
        <td data-label="Dinas Luar" class="px-2 md:px-3 py-2 md:py-4 text-center hidden md:table-cell"><span class="text-indigo-600 font-semibold">${r.dinasLuar}</span></td>
        <td data-label="Alpha" class="px-2 md:px-3 py-2 md:py-4 text-center"><span class="text-red-600 font-semibold">${r.alpha}</span></td>
        <td data-label="Total Absen" class="px-2 md:px-3 py-2 md:py-4 text-center hidden md:table-cell"><span class="text-gray-800 font-semibold">${r.total}</span></td>
      </tr>`).join('')}
    </tbody></table></div>
    <div class="p-3 border-t border-gray-100 bg-gray-50 text-center text-sm text-gray-500">Menampilkan ${filteredUsers.length} dari ${users.length} pengguna</div>`;
}

function printRekap() {
  const rekapMonth = document.getElementById('rekapMonth')?.value || '';
  const rekapYear = document.getElementById('rekapYear')?.value || new Date().getFullYear().toString();
  const rekapBranch = document.getElementById('rekapBranch')?.value || '';

  let filteredUsers = [...users];
  if (isAdminCabang() && currentUser.branch) {
    filteredUsers = filteredUsers.filter(u => u.branch === currentUser.branch);
  } else if (rekapBranch) {
    filteredUsers = filteredUsers.filter(u => u.branch === rekapBranch);
  }

  const userRows = filteredUsers.map(user => {
    const logs = allAttendanceLogs[user.uid] || [];
    let f = [...logs];
    if (rekapYear) f = f.filter(l => l.date.startsWith(rekapYear));
    if (rekapMonth) f = f.filter(l => parseInt(l.date.split('-')[1]) === parseInt(rekapMonth));
    return { user, hadir: f.filter(l => l.status === 'Hadir').length, terlambat: f.filter(l => l.status === 'Terlambat').length, izin: f.filter(l => l.status === 'Izin').length, sakit: f.filter(l => l.status === 'Sakit').length, dinasLuar: f.filter(l => l.status === 'Dinas Luar').length, alpha: f.filter(l => l.status === 'Alpha').length, get total() { return this.izin + this.sakit + this.alpha; } };
  });

  // Build period label
  const monthLabel = rekapMonth ? months[parseInt(rekapMonth) - 1] : 'Semua Bulan';
  const yearLabel = rekapYear || 'Semua Tahun';
  const branchLabel = rekapBranch || 'Semua Lembaga';
  const periodText = `${monthLabel} ${yearLabel} — ${branchLabel}`;
  const printDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  // Summary totals
  const totalHadir = userRows.reduce((s, r) => s + r.hadir, 0);
  const totalTerlambat = userRows.reduce((s, r) => s + r.terlambat, 0);
  const totalIzin = userRows.reduce((s, r) => s + r.izin, 0);
  const totalSakit = userRows.reduce((s, r) => s + r.sakit, 0);
  const totalDinasLuar = userRows.reduce((s, r) => s + r.dinasLuar, 0);
  const totalAlpha = userRows.reduce((s, r) => s + r.alpha, 0);
  const totalAll = userRows.reduce((s, r) => s + r.total, 0);

  const printHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekap Kehadiran - Al Uswah Access</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; padding: 20px; font-size: 12px; }
    .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #0d9488; padding-bottom: 16px; }
    .header h1 { font-size: 20px; color: #0d9488; margin-bottom: 4px; }
    .header h2 { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 4px; }
    .header p { font-size: 11px; color: #6b7280; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 11px; color: #6b7280; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th { background-color: #f0fdfa; color: #0d9488; font-weight: 600; text-align: left; padding: 10px 8px; border: 1px solid #d1d5db; font-size: 10px; }
    td { padding: 8px; border: 1px solid #d1d5db; font-size: 11px; }
    tr:nth-child(even) { background-color: #f9fafb; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .summary-row td { font-weight: 700; background-color: #f0fdfa; }
    .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #9ca3af; }
    .signature { margin-top: 40px; display: flex; justify-content: flex-end; }
    .signature-block { text-align: center; min-width: 200px; }
    .signature-block .line { border-bottom: 1px solid #374151; margin-top: 60px; margin-bottom: 4px; }
    .signature-block p { font-size: 11px; color: #6b7280; }
    @media print {
      body { padding: 0; }
      @page { margin: 15mm; size: A4 landscape; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>AL USWAH ACCESS</h1>
    <h2>Rekap Kehadiran</h2>
    <p>Periode: ${periodText}</p>
  </div>
  <div class="meta">
    <span>Jumlah Pengguna: ${userRows.length}</span>
    <span>Dicetak: ${printDate}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th class="text-center" style="width:30px">No</th>
        <th>Nama</th>
        <th>Role</th>
        <th>Lembaga</th>
        <th class="text-center">Hadir</th>
        <th class="text-center">Terlambat</th>
        <th class="text-center">Izin</th>
        <th class="text-center">Sakit</th>
        <th class="text-center">Dinas Luar</th>
        <th class="text-center">Alpha</th>
        <th class="text-center">Total Ketidakhadiran</th>
      </tr>
    </thead>
    <tbody>
      ${userRows.map((r, i) => `<tr>
        <td class="text-center">${i + 1}</td>
        <td>${r.user.name}</td>
        <td>${getRoleLabel(r.user.role)}</td>
        <td>${r.user.branch || '-'}</td>
        <td class="text-center">${r.hadir}</td>
        <td class="text-center">${r.terlambat}</td>
        <td class="text-center">${r.izin}</td>
        <td class="text-center">${r.sakit}</td>
        <td class="text-center">${r.dinasLuar}</td>
        <td class="text-center">${r.alpha}</td>
        <td class="text-center">${r.total}</td>
      </tr>`).join('')}
      <tr class="summary-row">
        <td colspan="4" class="text-right">Total Ketidakhadiran Keseluruhan</td>
        <td class="text-center">${totalHadir}</td>
        <td class="text-center">${totalTerlambat}</td>
        <td class="text-center">${totalIzin}</td>
        <td class="text-center">${totalSakit}</td>
        <td class="text-center">${totalDinasLuar}</td>
        <td class="text-center">${totalAlpha}</td>
        <td class="text-center">${totalAll}</td>
      </tr>
    </tbody>
  </table>
  <div class="signature">
    <div class="signature-block">
      <p>${printDate}</p>
      <p>Mengetahui,</p>
      <div class="line"></div>
      <p>(____________________)</p>
    </div>
  </div>
  <div class="footer">Dicetak dari Al Uswah Access — Sistem Akses Data Sekolah</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printHTML);
    printWindow.document.close();
  } else {
    showToast('Popup diblokir. Izinkan popup untuk mencetak.', 'error');
  }
}

// ── Admin: Menu Management ──
function renderMenuList() {
  document.getElementById('menuList').innerHTML = menuData.map(menu => `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-3"><span class="text-2xl">${menu.icon}</span><h3 class="font-semibold text-gray-800">${menu.name}</h3></div>
        <button onclick="deleteMenu(${menu.id})" class="text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors">Hapus</button>
      </div>
      <div class="mb-4 p-3 bg-blue-50 rounded-xl">
        <label class="text-xs text-blue-600 font-medium block mb-1">🔗 Direct URL</label>
        <div class="flex gap-2">
          <input type="text" id="directUrl-${menu.id}" value="${menu.directUrl || ''}" placeholder="https://..." class="flex-1 px-3 py-2 rounded-lg border border-blue-200 text-sm focus:outline-none focus:border-blue-400">
          <button onclick="saveDirectUrl(${menu.id})" class="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">Simpan</button>
        </div>
      </div>
      <div class="space-y-2 mb-4">
        ${menu.submenu.length === 0 ? '<p class="text-sm text-gray-400 italic">Belum ada submenu.</p>' : ''}
        ${menu.submenu.map(sub => `
          <div class="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
            <span class="text-sm text-gray-700">${sub.name}</span>
            <div class="flex space-x-2">
              <button onclick="editSubmenuLink(${menu.id}, ${sub.id})" class="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
              <button onclick="deleteSubmenu(${menu.id}, ${sub.id})" class="text-red-500 hover:text-red-700 text-sm">Hapus</button>
            </div>
          </div>`).join('')}
      </div>
      <div class="border-t border-gray-100 pt-4">
        <p class="text-xs text-gray-500 mb-2 font-medium">Tambah Submenu ke "${menu.name}"</p>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input type="text" id="newSubmenu-${menu.id}" placeholder="Nama submenu" class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
          <input type="text" id="newSubmenuLink-${menu.id}" placeholder="Link URL" class="px-3 py-2 rounded-lg border border-gray-200 text-sm">
          <select id="newSubmenuType-${menu.id}" class="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="spreadsheet">Spreadsheet</option><option value="drive">Google Drive</option></select>
          <button onclick="addSubmenu(${menu.id})" class="gradient-bg text-white text-sm py-2 rounded-lg">Tambah</button>
        </div>
      </div>
    </div>`).join('');
}

async function saveDirectUrl(menuId) {
  const menu = menuData.find(m => m.id === menuId);
  if (!menu) return;
  menu.directUrl = document.getElementById(`directUrl-${menuId}`).value.trim();
  await DB.saveMenus(menuData);
  renderSidebar(); renderMobileMenu(); renderDashboardCards();
  showToast(menu.directUrl ? `Direct URL disimpan` : `Direct URL dihapus`);
}

async function addMenu() {
  const name = document.getElementById('newMenuName').value.trim();
  const icon = document.getElementById('newMenuIcon').value.trim() || '📌';
  if (!name) { showToast('Nama menu tidak boleh kosong', 'error'); return; }
  menuData.push({ id: Date.now(), name, icon, directUrl: '', submenu: [] });
  document.getElementById('newMenuName').value = '';
  document.getElementById('newMenuIcon').value = '';
  await DB.saveMenus(menuData);
  renderMenuList(); renderSidebar(); renderMobileMenu(); renderDashboardCards();
  showToast('Menu berhasil ditambahkan');
}

async function deleteMenu(menuId) {
  const i = menuData.findIndex(m => m.id === menuId);
  if (i > -1) { menuData.splice(i, 1); await DB.saveMenus(menuData); renderMenuList(); renderSidebar(); renderMobileMenu(); renderDashboardCards(); showToast('Menu dihapus'); }
}

async function addSubmenu(menuId) {
  const name = document.getElementById(`newSubmenu-${menuId}`).value.trim();
  const link = document.getElementById(`newSubmenuLink-${menuId}`).value.trim();
  const type = document.getElementById(`newSubmenuType-${menuId}`).value;
  if (!name) { showToast('Nama submenu tidak boleh kosong', 'error'); return; }
  const menu = menuData.find(m => m.id === menuId);
  if (menu) {
    menu.submenu.push({ id: Date.now(), name, year: 'Tahun Ajaran 2025/2026', type, baseUrl: link || 'https://docs.google.com/spreadsheets/d/CONTOH' });
    document.getElementById(`newSubmenu-${menuId}`).value = '';
    document.getElementById(`newSubmenuLink-${menuId}`).value = '';
    await DB.saveMenus(menuData);
    renderMenuList(); renderSidebar(); renderMobileMenu();
    showToast(`Submenu "${name}" ditambahkan`);
  }
}

async function deleteSubmenu(menuId, submenuId) {
  const menu = menuData.find(m => m.id === menuId);
  if (menu) { const i = menu.submenu.findIndex(s => s.id === submenuId); if (i > -1) { menu.submenu.splice(i, 1); await DB.saveMenus(menuData); renderMenuList(); renderSidebar(); renderMobileMenu(); showToast('Submenu dihapus'); } }
}

function editSubmenuLink(menuId, submenuId) {
  const menu = menuData.find(m => m.id === menuId);
  if (!menu) return;
  const sub = menu.submenu.find(s => s.id === submenuId);
  if (!sub) return;
  document.getElementById('toastContainer').innerHTML = `
    <div class="bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 w-96">
      <h4 class="font-semibold text-gray-800 mb-4">Edit: ${sub.name}</h4>
      <div class="space-y-3 mb-4">
        <div><label class="text-xs text-gray-500 block mb-1">Nama</label><input type="text" id="editSubName" value="${sub.name}" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"></div>
        <div><label class="text-xs text-gray-500 block mb-1">Link</label><input type="text" id="editLinkInput" value="${sub.baseUrl}" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"></div>
        <div><label class="text-xs text-gray-500 block mb-1">Tipe</label><select id="editSubType" class="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"><option value="spreadsheet" ${sub.type === 'spreadsheet' ? 'selected' : ''}>Spreadsheet</option><option value="drive" ${sub.type === 'drive' ? 'selected' : ''}>Google Drive</option></select></div>
      </div>
      <div class="flex space-x-2">
        <button onclick="saveSubmenuLink(${menuId}, ${submenuId})" class="flex-1 gradient-bg text-white py-2 rounded-lg text-sm">Simpan</button>
        <button onclick="document.getElementById('toastContainer').innerHTML=''" class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">Batal</button>
      </div>
    </div>`;
}

async function saveSubmenuLink(menuId, submenuId) {
  const menu = menuData.find(m => m.id === menuId);
  if (!menu) return;
  const sub = menu.submenu.find(s => s.id === submenuId);
  if (sub) {
    const n = document.getElementById('editSubName').value.trim();
    if (n) sub.name = n;
    sub.baseUrl = document.getElementById('editLinkInput').value.trim();
    sub.type = document.getElementById('editSubType').value;
    document.getElementById('toastContainer').innerHTML = '';
    await DB.saveMenus(menuData);
    renderMenuList(); renderSidebar(); renderMobileMenu();
    showToast('Submenu diperbarui');
  }
}

// ── Admin: User Management (Firebase Auth) ──
const roleOrder = { super_admin: 0, direktur: 1, manajer: 2, kepala_sekolah: 3, admin_cabang: 4, wali_kelas: 5, guru: 6, staf: 7 };

function populateBranchFilter() {
  const sel = document.getElementById('filterUserBranch');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Semua Lembaga</option>' +
    branchOffices.map(b => `<option value="${b}">${b}</option>`).join('');
  sel.value = current;
  // Hide branch filter for admin_cabang (they only see their branch)
  if (isAdminCabang()) sel.closest('.flex-col')?.querySelector('#filterUserBranch')?.parentElement && (sel.style.display = 'none');
}

function resetUserFilters() {
  const s = id => { const e = document.getElementById(id); if (e) e.value = ''; };
  s('filterUserSearch'); s('filterUserRole'); s('filterUserBranch');
  const sort = document.getElementById('sortUser');
  if (sort) sort.value = 'name-asc';
  renderUserList();
}

async function loadAndRenderUserList() {
  try { users = await DB.getAllUsers(); } catch (e) { console.error('[Users] Load error:', e); }
  populateBranchFilter();
  renderUserList();
  // Restrict add-user form for admin_lembaga
  const roleSelect = document.getElementById('newUserRole');
  const branchSelect = document.getElementById('newUserBranch');
  if (roleSelect) {
    const hiddenForAdmin = ['admin_cabang', 'kepala_sekolah', 'manajer', 'direktur', 'super_admin'];
    hiddenForAdmin.forEach(r => {
      const opt = roleSelect.querySelector(`option[value="${r}"]`);
      if (opt) opt.style.display = isAdminCabang() ? 'none' : '';
    });
  }
  if (branchSelect) {
    if (isAdminCabang() && currentUser.branch) {
      branchSelect.value = currentUser.branch;
      branchSelect.disabled = true;
    } else {
      branchSelect.disabled = false;
    }
  }
  // Hide branch filter for admin_cabang
  const filterBranch = document.getElementById('filterUserBranch');
  if (filterBranch) filterBranch.style.display = isAdminCabang() ? 'none' : '';
}

function renderUserList() {
  // 1. Base filter: admin_cabang sees only their branch
  let displayUsers = [...users];
  if (isAdminCabang() && currentUser.branch) {
    displayUsers = displayUsers.filter(u => u.branch === currentUser.branch);
  }

  // 2. Search filter
  const search = (document.getElementById('filterUserSearch')?.value || '').toLowerCase().trim();
  if (search) {
    displayUsers = displayUsers.filter(u =>
      (u.name || '').toLowerCase().includes(search) ||
      (u.email || '').toLowerCase().includes(search)
    );
  }

  // 3. Role filter
  const roleFilter = document.getElementById('filterUserRole')?.value || '';
  if (roleFilter) {
    displayUsers = displayUsers.filter(u => u.role === roleFilter);
  }

  // 4. Branch filter (super_admin only)
  const branchFilter = document.getElementById('filterUserBranch')?.value || '';
  if (branchFilter) {
    displayUsers = displayUsers.filter(u => u.branch === branchFilter);
  }

  // 5. Sort
  const sortVal = document.getElementById('sortUser')?.value || 'name-asc';
  displayUsers.sort((a, b) => {
    switch (sortVal) {
      case 'name-asc': return (a.name || '').localeCompare(b.name || '');
      case 'name-desc': return (b.name || '').localeCompare(a.name || '');
      case 'role': return (roleOrder[a.role] ?? 9) - (roleOrder[b.role] ?? 9) || (a.name || '').localeCompare(b.name || '');
      case 'branch': return (a.branch || 'zzz').localeCompare(b.branch || 'zzz') || (a.name || '').localeCompare(b.name || '');
      case 'newest': return (b.createdAt || '').localeCompare(a.createdAt || '');
      case 'oldest': return (a.createdAt || '').localeCompare(b.createdAt || '');
      default: return 0;
    }
  });

  // 6. Update count label
  const totalAll = isAdminCabang() && currentUser.branch ? users.filter(u => u.branch === currentUser.branch).length : users.length;
  const countEl = document.getElementById('userCountLabel');
  if (countEl) countEl.textContent = `Menampilkan ${displayUsers.length} dari ${totalAll} pengguna`;

  // 7. Render table (with mobile card view)
  const tableEl = document.getElementById('userList')?.closest('table');
  if (tableEl) tableEl.classList.add('mobile-cards');

  if (displayUsers.length === 0) {
    document.getElementById('userList').innerHTML = `<tr><td colspan="5" class="px-6 py-12 text-center text-gray-400">
      <div class="text-4xl mb-2">🔍</div>Tidak ditemukan pengguna yang sesuai filter</td></tr>`;
    return;
  }

  document.getElementById('userList').innerHTML = displayUsers.map(user => `
    <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td data-label="Nama" class="px-4 md:px-6 py-3 md:py-4">
        <div class="flex items-center space-x-3">
          ${user.photo ? `<img src="${user.photo}" class="w-8 h-8 rounded-full object-cover">` : '<div class="w-8 h-8 gradient-bg rounded-full flex items-center justify-center"><span class="text-xs">👤</span></div>'}
          <span class="text-sm text-gray-800 font-medium">${user.name}</span>
        </div>
      </td>
      <td data-label="Email" class="px-4 md:px-6 py-2 md:py-4 text-sm text-gray-600 break-all">${user.email}</td>
      <td data-label="Role" class="px-4 md:px-6 py-2 md:py-4">
        ${user.uid !== currentUser.uid ? `
        <select onchange="changeUserRole('${user.uid}', this.value)" class="px-3 py-1 text-xs font-medium rounded-full border ${getRoleSelectClass(user.role)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400">
          ${Object.keys(rolePermissions).filter(r => isSuperAdmin() || !['admin_cabang', 'kepala_sekolah', 'manajer', 'direktur', 'super_admin'].includes(r)).map(r => `<option value="${r}" ${user.role === r ? 'selected' : ''}>${getRoleLabel(r)}</option>`).join('')}
        </select>` : `<span class="px-3 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(user.role)}">${getRoleLabel(user.role)}</span>`}
      </td>
      <td data-label="Lembaga" class="px-4 md:px-6 py-2 md:py-4">
        ${isSuperAdmin() ? `<select onchange="changeUserBranch('${user.uid}', this.value)" class="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 bg-white max-w-[180px]">
          <option value="" ${!user.branch ? 'selected' : ''}>-- Pilih --</option>
          ${branchOffices.map(b => `<option value="${b}" ${user.branch === b ? 'selected' : ''}>${b}</option>`).join('')}
        </select>` : `<span class="text-sm text-gray-600">${user.branch || '-'}</span>`}
      </td>
      <td data-label="Aksi" class="px-4 md:px-6 py-2 md:py-4">${user.uid !== currentUser.uid ? `<button onclick="deleteUserDoc('${user.uid}')" class="text-red-500 hover:text-red-700 text-sm font-medium">🗑️ Hapus</button>` : '<span class="text-gray-400 text-sm">-</span>'}</td>
    </tr>`).join('');
}

async function changeUserRole(uid, newRole) {
  try {
    await DB.updateUser(uid, { role: newRole });
    const user = users.find(u => u.uid === uid);
    if (user) user.role = newRole;
    renderUserList();
    showToast(`Role berhasil diubah menjadi ${getRoleLabel(newRole)}`);
  } catch (e) {
    console.error('[Users] Role change error:', e);
    showToast('Gagal mengubah role', 'error');
    renderUserList();
  }
}

async function changeUserBranch(uid, newBranch) {
  try {
    await DB.updateUser(uid, { branch: newBranch });
    const user = users.find(u => u.uid === uid);
    if (user) user.branch = newBranch;
    if (uid === currentUser.uid) currentUser.branch = newBranch;
    showToast(newBranch ? `Lembaga diubah ke ${newBranch}` : 'Lembaga dihapus');
  } catch (e) {
    console.error('[Users] Branch change error:', e);
    showToast('Gagal mengubah lembaga', 'error');
    renderUserList();
  }
}

async function addUser() {
  const name = document.getElementById('newUserName').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  let role = document.getElementById('newUserRole').value;
  let branch = document.getElementById('newUserBranch').value;
  const errorEl = document.getElementById('addUserError');
  const btn = document.getElementById('addUserBtn');

  // Admin Lembaga restrictions
  if (isAdminCabang()) {
    if (!['guru', 'wali_kelas'].includes(role)) {
      role = 'guru'; // Force to guru if invalid role selected
    }
    branch = currentUser.branch; // Force to own branch
  }

  if (!name || !email || !password) { errorEl.textContent = 'Semua field harus diisi'; errorEl.classList.remove('hidden'); return; }
  if (password.length < 6) { errorEl.textContent = 'Password minimal 6 karakter'; errorEl.classList.remove('hidden'); return; }

  btn.disabled = true; btn.textContent = 'Memproses...';
  errorEl.classList.add('hidden');

  try {
    // Create user in Firebase Auth using a secondary auth instance
    const secondaryApp = firebase.initializeApp(firebase.app().options, 'secondary_' + Date.now());
    const secondaryAuth = secondaryApp.auth();
    const cred = await secondaryAuth.createUserWithEmailAndPassword(email, password);

    // Save user profile to Firestore
    const userData = { uid: cred.user.uid, name, email, role, branch, photo: '', createdAt: new Date().toISOString() };
    await DB.saveUser(cred.user.uid, userData);

    // Sign out from secondary and delete it
    await secondaryAuth.signOut();
    await secondaryApp.delete();

    document.getElementById('newUserName').value = '';
    document.getElementById('newUserEmail').value = '';
    document.getElementById('newUserPassword').value = '';
    await loadAndRenderUserList();
    showToast(`Pengguna ${name} berhasil ditambahkan sebagai ${getRoleLabel(role)}`);
  } catch (e) {
    console.error('[Users] Add error:', e);
    let msg = 'Gagal menambah pengguna';
    if (e.code === 'auth/email-already-in-use') msg = 'Email sudah terdaftar';
    else if (e.code === 'auth/invalid-email') msg = 'Format email tidak valid';
    else if (e.code === 'auth/weak-password') msg = 'Password terlalu lemah';
    errorEl.textContent = msg; errorEl.classList.remove('hidden');
  }
  btn.disabled = false; btn.textContent = 'Tambah';
}

async function deleteUserDoc(uid) {
  if (!confirm('Hapus pengguna ini dari database?')) return;
  try {
    await DB.deleteUser(uid);
    await loadAndRenderUserList();
    showToast('Data pengguna dihapus dari database');
  } catch (e) { console.error('[Users] Delete error:', e); showToast('Gagal menghapus pengguna', 'error'); }
}

// ── Admin: QR Code Management (Full CRUD) ──
function renderQRCodePage() {
  const container = document.getElementById('qrcodeContent');
  if (!container) return;
  container.innerHTML = `
    <div class="p-6">
      <p class="text-gray-600 mb-6">Kelola QR Code untuk setiap lembaga. Cetak dan tempel QR Code di lokasi absensi. Opsional: Atur geolokasi absensi lembaga.</p>
      <!-- Add Branch Form -->
      <div class="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
        <h4 class="font-semibold text-gray-700 mb-3">➕ Tambah Lembaga Baru</h4>
        <div class="flex flex-col sm:flex-row gap-3">
          <input type="text" id="newBranchName" placeholder="Nama Lembaga" class="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm">
          <button onclick="addBranch()" class="px-6 py-2 gradient-bg text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">Tambah</button>
        </div>
      </div>
      <!-- Branch Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${branches.map(branch => `
        <div class="border border-gray-200 rounded-2xl p-6 text-center relative" id="qr-card-${branch.id}">
          <h3 class="text-xl font-bold text-gray-800 mb-1">${branch.name}</h3>
          <p class="text-xs text-gray-400 mb-4">ID: ${branch.id} | Dibuat: ${new Date(branch.createdAt).toLocaleDateString('id-ID')}</p>
          <div id="qr-canvas-${branch.id}" class="flex justify-center mb-4"></div>
          <p class="text-xs text-gray-500 mb-4 font-mono break-all bg-gray-50 p-2 rounded-lg">${branch.secret}</p>
          
          <div class="bg-blue-50/50 p-3 rounded-xl border border-blue-100 mb-4 text-left">
            <h5 class="text-xs font-semibold text-blue-800 mb-2">📍 Pengaturan Geolokasi</h5>
            <div class="grid grid-cols-3 gap-2 mb-2">
              <div>
                <label class="text-[10px] text-blue-500 block">Latitude</label>
                <input type="number" step="any" id="brLat-${branch.id}" value="${branch.lat || ''}" placeholder="-8.xxxx" class="w-full px-2 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:border-teal-400 bg-white">
              </div>
              <div>
                <label class="text-[10px] text-blue-500 block">Longitude</label>
                <input type="number" step="any" id="brLng-${branch.id}" value="${branch.lng || ''}" placeholder="114.xxxx" class="w-full px-2 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:border-teal-400 bg-white">
              </div>
              <div>
                <label class="text-[10px] text-blue-500 block">Radius (m)</label>
                <input type="number" id="brRad-${branch.id}" value="${branch.radius || ''}" placeholder="50" class="w-full px-2 py-1.5 text-xs rounded-lg border border-blue-200 focus:outline-none focus:border-teal-400 bg-white">
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="getBranchGPS('${branch.id}')" class="flex-1 text-xs py-1.5 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors">📍 Ambil GPS Saat Ini</button>
              <button onclick="saveBranchLocation('${branch.id}')" class="flex-1 text-xs py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">💾 Simpan Lokasi</button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 justify-center">
            <button onclick="printQRCode('${branch.id}')" class="px-3 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors text-sm font-medium">🖨️ Cetak</button>
            <button onclick="regenerateQR('${branch.id}')" class="px-3 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors text-sm font-medium">🔄 Generate Ulang</button>
            <button onclick="editBranchName('${branch.id}')" class="px-3 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium">✏️ Edit Nama</button>
            <button onclick="deleteBranch('${branch.id}')" class="px-3 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-medium">🗑️ Hapus</button>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  setTimeout(() => branches.forEach(branch => generateQRImage(branch)), 100);
}

async function addBranch() {
  const nameInput = document.getElementById('newBranchName');
  const name = nameInput.value.trim();
  if (!name) { showToast('Nama lembaga tidak boleh kosong', 'error'); return; }
  const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  if (branches.find(b => b.id === id)) { showToast('Lembaga dengan ID serupa sudah ada', 'error'); return; }
  branches.push({ id, name, secret: generateSecret(), createdAt: new Date().toISOString() });
  await DB.saveBranches(branches);
  nameInput.value = '';
  renderQRCodePage();
  showToast(`Lembaga "${name}" berhasil ditambahkan`);
}

async function editBranchName(branchId) {
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return;
  const newName = prompt(`Ubah nama lembaga "${branch.name}" menjadi:`, branch.name);
  if (!newName || !newName.trim() || newName.trim() === branch.name) return;
  branch.name = newName.trim();
  await DB.saveBranches(branches);
  renderQRCodePage();
  showToast(`Nama lembaga diubah menjadi "${branch.name}"`);
}

function getBranchGPS(branchId) {
  if (!navigator.geolocation) {
    showToast('Geolocation tidak didukung browser ini', 'error');
    return;
  }
  showToast('Mengambil lokasi GPS... mohon tunggu.', 'info');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const latInput = document.getElementById(`brLat-${branchId}`);
      const lngInput = document.getElementById(`brLng-${branchId}`);
      if (latInput) latInput.value = pos.coords.latitude;
      if (lngInput) lngInput.value = pos.coords.longitude;
      showToast('📍 Koordinat GPS berhasil diambil! Klik "Simpan Lokasi" untuk menyimpan.');
    },
    (err) => {
      console.error(err);
      showToast('Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.', 'error');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

async function saveBranchLocation(branchId) {
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return;

  const lat = parseFloat(document.getElementById(`brLat-${branchId}`).value);
  const lng = parseFloat(document.getElementById(`brLng-${branchId}`).value);
  const radius = parseInt(document.getElementById(`brRad-${branchId}`).value);

  if (isNaN(lat) || isNaN(lng)) {
    showToast('Latitude dan Longitude harus diisi', 'error');
    return;
  }
  if (isNaN(radius) || radius <= 0) {
    showToast('Radius harus diisi (angka positif)', 'error');
    return;
  }

  branch.lat = lat;
  branch.lng = lng;
  branch.radius = radius;

  await DB.saveBranches(branches);
  showToast(`📍 Lokasi "${branch.name}" berhasil disimpan! (Radius: ${radius}m)`);
}

async function deleteBranch(branchId) {
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return;
  if (branches.length <= 1) { showToast('Harus ada minimal 1 lembaga', 'error'); return; }
  if (!confirm(`Hapus lembaga "${branch.name}"? QR Code lembaga ini tidak akan berlaku lagi.`)) return;
  branches = branches.filter(b => b.id !== branchId);
  await DB.saveBranches(branches);
  renderQRCodePage();
  showToast(`Lembaga "${branch.name}" berhasil dihapus`);
}

function generateQRImage(branch) {
  const canvas = document.getElementById(`qr-canvas-${branch.id}`);
  if (!canvas) return;
  const qrData = JSON.stringify({ branchId: branch.id, branchName: branch.name, secret: branch.secret, app: 'Al Uswah Access' });
  if (typeof qrcode !== 'undefined') {
    const qr = qrcode(0, 'M');
    qr.addData(qrData);
    qr.make();
    canvas.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 4 });
  } else {
    canvas.innerHTML = `<div style="width:200px;height:200px;" class="bg-white border-2 border-gray-800 rounded-lg flex flex-col items-center justify-center p-4"><p class="text-xs text-gray-600 text-center font-mono">${branch.id}</p><p class="text-[10px] text-gray-400 mt-1">QR library loading...</p></div>`;
  }
}

async function regenerateQR(branchId) {
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return;
  if (!confirm(`Generate ulang QR Code untuk ${branch.name}? QR lama tidak berlaku lagi.`)) return;
  branch.secret = generateSecret();
  branch.createdAt = new Date().toISOString();
  await DB.saveBranches(branches);
  renderQRCodePage();
  showToast(`QR Code ${branch.name} berhasil diperbarui`);
}

function printQRCode(branchId) {
  const branch = branches.find(b => b.id === branchId);
  if (!branch) return;
  const qrData = JSON.stringify({ branchId: branch.id, branchName: branch.name, secret: branch.secret, app: 'Al Uswah Access' });
  let qrSvg = '';
  if (typeof qrcode !== 'undefined') {
    const qr = qrcode(0, 'M');
    qr.addData(qrData);
    qr.make();
    qrSvg = qr.createSvgTag({ cellSize: 6, margin: 4 });
  } else { qrSvg = '<div style="width:250px;height:250px;border:3px solid #000;display:flex;align-items:center;justify-content:center;">QR Code</div>'; }
  const pw = window.open('', '_blank');
  pw.document.write(`<!DOCTYPE html><html><head><title>QR Code - ${branch.name}</title><style>body{font-family:'Segoe UI',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;}.print-card{text-align:center;padding:40px;border:3px solid #333;border-radius:16px;max-width:400px;}.title{font-size:24px;font-weight:bold;margin-bottom:8px;}.subtitle{font-size:14px;color:#666;margin-bottom:24px;}.branch-name{font-size:28px;font-weight:bold;color:#2EC4B6;margin-top:24px;}.instruction{font-size:12px;color:#888;margin-top:16px;}.qr-container{display:inline-block;padding:8px;border:2px solid #eee;border-radius:8px;}</style></head><body><div class="print-card"><div class="title">Al Uswah Access</div><div class="subtitle">Scan untuk Absensi</div><div class="qr-container">${qrSvg}</div><div class="branch-name">${branch.name}</div><div class="instruction">Arahkan kamera ke QR Code ini untuk mencatat kehadiran</div></div></body></html>`);
  pw.document.close();
  setTimeout(() => pw.print(), 500);
}

// ── Perizinan (Leave Request) ──
let perizinanData = [];

async function renderPerizinan() {
  const container = document.getElementById('perizinanContent');
  if (!container) return;
  const isAdmin = isSuperAdmin() || isAdminCabang();

  // Load data
  try {
    if (isAdmin) {
      perizinanData = await DB.getAllPerizinan();
      // Filter by branch for admin_lembaga
      if (isAdminCabang() && currentUser.branch) {
        const branchUsers = users.filter(u => u.branch === currentUser.branch).map(u => u.uid);
        perizinanData = perizinanData.filter(p => branchUsers.includes(p.uid));
      }
    } else {
      perizinanData = await DB.getPerizinanByUser(currentUser.uid);
    }
  } catch (e) {
    console.error('[Perizinan] Load error:', e);
    perizinanData = [];
  }

  const today = new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <!-- Form Ajukan Izin -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-semibold text-gray-800 mb-4 flex items-center space-x-2"><span>📨</span><span>Ajukan Perizinan</span></h3>
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm text-gray-500 block mb-1">Jenis Izin</label>
            <select id="perizinanType" onchange="togglePerizinanType()" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 bg-white">
              <option value="Izin">Izin</option>
              <option value="Sakit">Sakit</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-500 block mb-1">Tanggal</label>
            <input type="date" id="perizinanDate" value="${today}" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400">
          </div>
        </div>

        <!-- Info Izin Biasa -->
        <div id="perizinanIzinInfo" class="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div class="flex items-start space-x-3">
            <span class="text-amber-500 text-xl mt-0.5">⚠️</span>
            <div>
              <p class="text-sm font-medium text-amber-800">Ketentuan Izin</p>
              <p class="text-sm text-amber-700 mt-1">Izin harus kurang dari 24 jam dan harus mendapatkan <strong>approval</strong> dari Admin Lembaga atau Super Admin.</p>
            </div>
          </div>
        </div>

        <!-- Upload Surat Sakit (hidden by default) -->
        <div id="perizinanSakitUpload" class="hidden">
          <label class="text-sm text-gray-500 block mb-1">Surat Sakit <span class="text-gray-400">(opsional)</span></label>
          <div class="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-teal-400 transition-colors">
            <input type="file" id="perizinanFile" accept="image/*,.pdf" class="hidden" onchange="handlePerizinanFileUpload(event)">
            <div id="perizinanFilePreview">
              <button type="button" onclick="document.getElementById('perizinanFile').click()" class="text-teal-600 hover:text-teal-800 transition-colors">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-sm text-gray-500">Klik untuk upload surat sakit</p>
                <p class="text-xs text-gray-400 mt-1">Format: JPG, PNG, PDF (Maks 5MB)</p>
              </button>
            </div>
          </div>
        </div>

        <div>
          <label class="text-sm text-gray-500 block mb-1">Keterangan</label>
          <textarea id="perizinanNote" rows="3" placeholder="Jelaskan alasan perizinan..." class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 resize-none"></textarea>
        </div>

        <button onclick="submitPerizinan()" id="submitPerizinanBtn" class="btn-hover gradient-bg text-white font-semibold py-3 px-6 rounded-xl shadow-lg">📨 Ajukan Perizinan</button>
        <p id="perizinanError" class="text-red-500 text-sm hidden"></p>
      </div>
    </div>

    ${isAdmin ? `
    <!-- Admin: Daftar Permohonan Perizinan -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 class="font-semibold text-gray-800 flex items-center space-x-2"><span>📋</span><span>Permohonan Perizinan Masuk</span></h3>
      </div>
      <div id="perizinanAdminList" class="divide-y divide-gray-100">
        ${renderPerizinanAdminItems(perizinanData.filter(p => p.status === 'pending'))}
      </div>
      ${perizinanData.filter(p => p.status === 'pending').length === 0 ? '<div class="p-8 text-center text-gray-400">Tidak ada permohonan yang menunggu approval</div>' : ''}
    </div>
    ` : ''}

    <!-- Riwayat Perizinan -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 border-b border-gray-100 bg-gray-50/50">
        <h3 class="font-semibold text-gray-800 flex items-center space-x-2"><span>📜</span><span>Riwayat Perizinan ${isAdmin ? '(Semua)' : 'Saya'}</span></h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50"><tr>
            ${isAdmin ? '<th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>' : ''}
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tanggal</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jenis</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Keterangan</th>
            <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Lampiran</th>
            <th class="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
          </tr></thead>
          <tbody>
            ${perizinanData.length === 0 ? '<tr><td colspan="6" class="px-4 py-8 text-center text-gray-400">Belum ada data perizinan</td></tr>' : ''}
            ${perizinanData.map(p => {
    const userName = isAdmin ? (users.find(u => u.uid === p.uid)?.name || p.uid) : '';
    return `<tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                ${isAdmin ? `<td class="px-4 py-3 text-sm text-gray-800 font-medium">${userName}</td>` : ''}
                <td class="px-4 py-3 text-sm text-gray-600">${p.date}</td>
                <td class="px-4 py-3"><span class="px-2 py-1 text-xs font-medium rounded-full ${p.type === 'Sakit' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${p.type}</span></td>
                <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">${p.note || '-'}</td>
                <td class="px-4 py-3 text-sm">${p.attachment ? '<a href="' + p.attachment + '" target="_blank" class="text-teal-600 hover:text-teal-800 text-xs font-medium">📎 Lihat</a>' : '<span class="text-gray-400 text-xs">-</span>'}</td>
                <td class="px-4 py-3 text-center"><span class="px-3 py-1 text-xs font-medium rounded-full ${getStatusPerizinanClass(p.status)}">${getStatusPerizinanLabel(p.status)}</span></td>
              </tr>`;
  }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderPerizinanAdminItems(pendingItems) {
  return pendingItems.map(p => {
    const user = users.find(u => u.uid === p.uid);
    const userName = user?.name || p.uid;
    const userBranch = user?.branch || '-';
    return `
    <div class="p-4 hover:bg-gray-50 transition-colors">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-8 h-8 gradient-bg rounded-full flex items-center justify-center"><span class="text-xs">👤</span></div>
            <div>
              <p class="font-medium text-gray-800 text-sm">${userName}</p>
              <p class="text-xs text-gray-500">${userBranch}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mb-2">
            <span class="px-2 py-1 text-xs font-medium rounded-full ${p.type === 'Sakit' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${p.type}</span>
            <span class="text-xs text-gray-500">📅 ${p.date}</span>
            ${p.attachment ? '<a href="' + p.attachment + '" target="_blank" class="text-xs text-teal-600 hover:text-teal-800">📎 Surat Sakit</a>' : ''}
          </div>
          <p class="text-sm text-gray-600">${p.note || '-'}</p>
        </div>
        <div class="flex space-x-2">
          <button onclick="approvePerizinan('${p.id}')" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-xl transition-colors">✅ Setujui</button>
          <button onclick="rejectPerizinan('${p.id}')" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl transition-colors">❌ Tolak</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function togglePerizinanType() {
  const type = document.getElementById('perizinanType').value;
  const sakitUpload = document.getElementById('perizinanSakitUpload');
  const izinInfo = document.getElementById('perizinanIzinInfo');
  if (type === 'Sakit') {
    sakitUpload.classList.remove('hidden');
    izinInfo.classList.add('hidden');
  } else {
    sakitUpload.classList.add('hidden');
    izinInfo.classList.remove('hidden');
  }
}

let perizinanAttachment = '';

function handlePerizinanFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Ukuran file maksimal 5MB', 'error'); return; }

  const preview = document.getElementById('perizinanFilePreview');

  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        const maxSize = 800;
        let w = img.width, h = img.height;
        if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
        else { w = Math.round(w * maxSize / h); h = maxSize; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        perizinanAttachment = canvas.toDataURL('image/jpeg', 0.6);
        preview.innerHTML = `
          <div class="flex items-center space-x-3 p-2">
            <img src="${perizinanAttachment}" class="w-16 h-16 object-cover rounded-lg border">
            <div class="text-left flex-1">
              <p class="text-sm font-medium text-gray-700">${file.name}</p>
              <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button onclick="removePerizinanFile()" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>
          </div>`;
        showToast('File berhasil diupload');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    // PDF or other
    const reader = new FileReader();
    reader.onload = function (e) {
      perizinanAttachment = e.target.result;
      preview.innerHTML = `
        <div class="flex items-center space-x-3 p-2">
          <div class="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center"><span class="text-2xl">📄</span></div>
          <div class="text-left flex-1">
            <p class="text-sm font-medium text-gray-700">${file.name}</p>
            <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button onclick="removePerizinanFile()" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>
        </div>`;
      showToast('File berhasil diupload');
    };
    reader.readAsDataURL(file);
  }
}

function removePerizinanFile() {
  perizinanAttachment = '';
  const fileInput = document.getElementById('perizinanFile');
  if (fileInput) fileInput.value = '';
  const preview = document.getElementById('perizinanFilePreview');
  if (preview) {
    preview.innerHTML = `
      <button type="button" onclick="document.getElementById('perizinanFile').click()" class="text-teal-600 hover:text-teal-800 transition-colors">
        <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p class="text-sm text-gray-500">Klik untuk upload surat sakit</p>
        <p class="text-xs text-gray-400 mt-1">Format: JPG, PNG, PDF (Maks 5MB)</p>
      </button>`;
  }
}

async function submitPerizinan() {
  const type = document.getElementById('perizinanType').value;
  const date = document.getElementById('perizinanDate').value;
  const note = document.getElementById('perizinanNote').value.trim();
  const errorEl = document.getElementById('perizinanError');
  const btn = document.getElementById('submitPerizinanBtn');

  errorEl.classList.add('hidden');

  if (!date) { errorEl.textContent = 'Tanggal harus diisi'; errorEl.classList.remove('hidden'); return; }
  if (!note) { errorEl.textContent = 'Keterangan harus diisi'; errorEl.classList.remove('hidden'); return; }

  btn.disabled = true; btn.textContent = 'Mengirim...';

  try {
    const data = {
      uid: currentUser.uid,
      type: type,
      date: date,
      note: note,
      attachment: type === 'Sakit' ? perizinanAttachment : '',
      status: type === 'Sakit' ? 'approved' : 'pending', // Sakit auto-approved, Izin needs approval
      createdAt: new Date().toISOString(),
      approvedBy: type === 'Sakit' ? 'auto' : '',
      approvedAt: type === 'Sakit' ? new Date().toISOString() : ''
    };

    await DB.savePerizinan(data);

    // Clear form
    document.getElementById('perizinanNote').value = '';
    perizinanAttachment = '';
    const fileInput = document.getElementById('perizinanFile');
    if (fileInput) fileInput.value = '';

    if (type === 'Sakit') {
      showToast('Perizinan sakit berhasil dikirim');
    } else {
      showToast('Perizinan izin berhasil dikirim. Menunggu approval dari Admin.');
    }
    renderPerizinan();
  } catch (e) {
    console.error('[Perizinan] Submit error:', e);
    errorEl.textContent = 'Gagal mengirim perizinan. Coba lagi.';
    errorEl.classList.remove('hidden');
  }
  btn.disabled = false; btn.textContent = '📨 Ajukan Perizinan';
}

async function approvePerizinan(id) {
  if (!confirm('Setujui perizinan ini?')) return;
  try {
    await DB.updatePerizinan(id, {
      status: 'approved',
      approvedBy: currentUser.uid,
      approvedAt: new Date().toISOString()
    });
    showToast('Perizinan disetujui');
    renderPerizinan();
  } catch (e) {
    console.error('[Perizinan] Approve error:', e);
    showToast('Gagal menyetujui perizinan', 'error');
  }
}

async function rejectPerizinan(id) {
  if (!confirm('Tolak perizinan ini?')) return;
  try {
    await DB.updatePerizinan(id, {
      status: 'rejected',
      approvedBy: currentUser.uid,
      approvedAt: new Date().toISOString()
    });
    showToast('Perizinan ditolak');
    renderPerizinan();
  } catch (e) {
    console.error('[Perizinan] Reject error:', e);
    showToast('Gagal menolak perizinan', 'error');
  }
}

function getStatusPerizinanClass(status) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'approved': return 'bg-green-100 text-green-700';
    case 'rejected': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function getStatusPerizinanLabel(status) {
  switch (status) {
    case 'pending': return '⏳ Menunggu';
    case 'approved': return '✅ Disetujui';
    case 'rejected': return '❌ Ditolak';
    default: return status;
  }
}

// ── Pelanggaran (Violation / Surat Peringatan) ──

async function checkWarningBadge() {
  const badge = document.getElementById('warningBadge');
  if (!badge || !currentUser) return;
  try {
    const violations = await DB.getPelanggaranByUser(currentUser.uid);
    if (!violations || violations.length === 0) {
      badge.classList.add('hidden');
      badge.innerHTML = '';
      return;
    }
    // Find the highest level SP
    const levels = violations.map(v => v.level);
    const hasSP3 = levels.includes('SP3');
    const hasSP = levels.includes('SP1') || levels.includes('SP2');
    if (hasSP3) {
      badge.classList.remove('hidden');
      badge.innerHTML = '<span class="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-red-500 text-white animate-pulse" title="Surat Peringatan 3">!</span>';
    } else if (hasSP) {
      badge.classList.remove('hidden');
      badge.innerHTML = '<span class="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold rounded-full bg-yellow-400 text-yellow-900 animate-pulse" title="Surat Peringatan">!</span>';
    } else {
      badge.classList.add('hidden');
      badge.innerHTML = '';
    }
  } catch (e) {
    console.error('[Badge] Error:', e);
  }
}

async function renderPelanggaran() {
  const container = document.getElementById('pelanggaranContent');
  if (!container) return;
  const isAdmin = isSuperAdmin() || isAdminCabang();

  if (isAdmin) {
    // ── Admin View ──
    container.innerHTML = '<p class="text-gray-400 text-center py-8 animate-pulse">Memuat data...</p>';
    try {
      // Load users
      if (!users || users.length === 0) users = await DB.getAllUsers();
      let filteredUsers = [...users];
      if (isAdminCabang() && currentUser.branch) {
        filteredUsers = filteredUsers.filter(u => u.branch === currentUser.branch);
      }
      // Only show non-admin users (guru/wali_kelas)
      filteredUsers = filteredUsers.filter(u => u.role === 'guru' || u.role === 'wali_kelas');

      // Load all violations
      let allViolations = await DB.getAllPelanggaran();
      if (isAdminCabang() && currentUser.branch) {
        const branchUids = filteredUsers.map(u => u.uid);
        allViolations = allViolations.filter(v => branchUids.includes(v.targetUid));
      }

      // Get unique branches from users
      const allBranches = [...new Set(filteredUsers.map(u => u.branch).filter(Boolean))].sort();
      // Store for filter function
      window._pelanggaranUsers = filteredUsers;

      container.innerHTML = `
        <!-- Issue New Violation -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-bold text-gray-800 mb-4">📝 Terbitkan Surat Peringatan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="text-sm text-gray-500 block mb-1">Filter Lembaga</label>
              <select id="pelanggaranBranchFilter" onchange="filterPelanggaranUsers()" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm bg-white">
                <option value="">-- Semua Lembaga --</option>
                ${allBranches.map(b => `<option value="${b}">${b}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-500 block mb-1">Pilih User</label>
              <select id="pelanggaranUser" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm bg-white">
                <option value="">-- Pilih User --</option>
                ${filteredUsers.map(u => `<option value="${u.uid}">${u.name} (${u.branch || '-'})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-500 block mb-1">Jenis Peringatan</label>
              <select id="pelanggaranLevel" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm bg-white">
                <option value="SP1">Surat Peringatan 1</option>
                <option value="SP2">Surat Peringatan 2</option>
                <option value="SP3">Surat Peringatan 3</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-500 block mb-1">Keterangan</label>
              <input type="text" id="pelanggaranNote" placeholder="Alasan pelanggaran" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm">
            </div>
          </div>
          <button onclick="issuePelanggaran()" class="px-6 py-2.5 gradient-bg text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">⚠️ Terbitkan Surat Peringatan</button>
        </div>

        <!-- Violation History -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">📋 Riwayat Pelanggaran</h3>
          </div>
          ${allViolations.length === 0 ? '<p class="text-gray-400 text-center py-8">Tidak ada data pelanggaran</p>' :
          `<div class="divide-y divide-gray-100">
            ${allViolations.map(v => {
            const targetUser = users.find(u => u.uid === v.targetUid);
            const levelColor = v.level === 'SP3' ? 'bg-red-100 text-red-700' : v.level === 'SP2' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700';
            return `<div class="p-4 flex items-center justify-between hover:bg-gray-50">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="px-2 py-0.5 text-xs font-bold rounded-full ${levelColor}">${v.level}</span>
                    <span class="font-semibold text-gray-800">${targetUser ? targetUser.name : v.targetUid}</span>
                  </div>
                  <p class="text-sm text-gray-500">${v.note || '-'}</p>
                  <p class="text-xs text-gray-400">${new Date(v.createdAt).toLocaleString('id-ID')} — oleh ${v.issuedByName}</p>
                </div>
                <button onclick="deletePelanggaranItem('${v.id}')" class="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">🗑️ Hapus</button>
              </div>`;
          }).join('')}
          </div>`}
        </div>
      `;
    } catch (e) {
      console.error('[Pelanggaran] Admin load error:', e);
      container.innerHTML = '<p class="text-red-500 text-center py-8">Gagal memuat data pelanggaran</p>';
    }
  } else {
    // ── User View ──
    container.innerHTML = '<p class="text-gray-400 text-center py-8 animate-pulse">Memuat data...</p>';
    try {
      const violations = await DB.getPelanggaranByUser(currentUser.uid);
      if (!violations || violations.length === 0) {
        container.innerHTML = `
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div class="text-5xl mb-4">✅</div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Tidak ada data pelanggaran</h3>
            <p class="text-gray-500 text-sm">Anda tidak memiliki catatan pelanggaran saat ini.</p>
          </div>`;
        return;
      }
      container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-bold text-gray-800">📋 Catatan Pelanggaran Anda</h3>
          </div>
          <div class="divide-y divide-gray-100">
            ${violations.map(v => {
        const levelColor = v.level === 'SP3' ? 'bg-red-100 text-red-700 border-red-200' : v.level === 'SP2' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
        const bgColor = v.level === 'SP3' ? 'bg-red-50' : '';
        return `<div class="p-4 ${bgColor}">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-1 text-xs font-bold rounded-full border ${levelColor}">${v.level === 'SP1' ? 'Surat Peringatan 1' : v.level === 'SP2' ? 'Surat Peringatan 2' : 'Surat Peringatan 3'}</span>
                </div>
                <p class="text-sm text-gray-700 mt-2">${v.note || '-'}</p>
                <p class="text-xs text-gray-400 mt-1">Diterbitkan: ${new Date(v.createdAt).toLocaleString('id-ID')} — oleh ${v.issuedByName}</p>
              </div>`;
      }).join('')}
          </div>
        </div>`;
    } catch (e) {
      console.error('[Pelanggaran] User load error:', e);
      container.innerHTML = '<p class="text-red-500 text-center py-8">Gagal memuat data</p>';
    }
  }
}

function filterPelanggaranUsers() {
  const branch = document.getElementById('pelanggaranBranchFilter').value;
  const userSelect = document.getElementById('pelanggaranUser');
  const allUsers = window._pelanggaranUsers || [];
  const filtered = branch ? allUsers.filter(u => u.branch === branch) : allUsers;
  userSelect.innerHTML = '<option value="">-- Pilih User --</option>' + filtered.map(u => `<option value="${u.uid}">${u.name} (${u.branch || '-'})</option>`).join('');
}

async function issuePelanggaran() {
  const targetUid = document.getElementById('pelanggaranUser').value;
  const level = document.getElementById('pelanggaranLevel').value;
  const note = document.getElementById('pelanggaranNote').value.trim();

  if (!targetUid) { showToast('Pilih user terlebih dahulu', 'error'); return; }
  if (!level) { showToast('Pilih jenis peringatan', 'error'); return; }

  const targetUser = users.find(u => u.uid === targetUid);
  const levelLabel = level === 'SP1' ? 'Surat Peringatan 1' : level === 'SP2' ? 'Surat Peringatan 2' : 'Surat Peringatan 3';
  if (!confirm(`Terbitkan ${levelLabel} untuk "${targetUser?.name || targetUid}"?`)) return;

  try {
    await DB.savePelanggaran({
      targetUid: targetUid,
      targetName: targetUser?.name || '',
      level: level,
      note: note,
      issuedBy: currentUser.uid,
      issuedByName: currentUser.name,
      branch: currentUser.branch || '',
      createdAt: new Date().toISOString()
    });
    showToast(`⚠️ ${levelLabel} berhasil diterbitkan untuk ${targetUser?.name}`);
    document.getElementById('pelanggaranNote').value = '';
    renderPelanggaran();
  } catch (e) {
    console.error('[Pelanggaran] Issue error:', e);
    showToast('Gagal menerbitkan surat peringatan', 'error');
  }
}

async function deletePelanggaranItem(id) {
  if (!confirm('Hapus data pelanggaran ini?')) return;
  try {
    await DB.deletePelanggaran(id);
    showToast('Data pelanggaran berhasil dihapus');
    renderPelanggaran();
  } catch (e) {
    console.error('[Pelanggaran] Delete error:', e);
    showToast('Gagal menghapus data pelanggaran', 'error');
  }
}

// ── Slip Gaji ──
const defaultSlipGajiTemplate = {
  fields: [
    { key: 'gajiPokok', label: 'Gaji Pokok', type: 'earning' },
    { key: 'tunjanganJabatan', label: 'Tunjangan Jabatan', type: 'earning' },
    { key: 'tunjanganTransport', label: 'Tunjangan Transport', type: 'earning' },
    { key: 'tunjanganMakan', label: 'Tunjangan Makan', type: 'earning' },
    { key: 'potonganBPJS', label: 'Potongan BPJS', type: 'deduction' },
    { key: 'potonganLain', label: 'Potongan Lain', type: 'deduction' }
  ]
};
let slipGajiTemplate = null;

function formatRupiah(num) {
  return 'Rp ' + (num || 0).toLocaleString('id-ID');
}

async function loadSlipGajiTemplate() {
  if (!slipGajiTemplate) {
    const saved = await DB.getSlipGajiTemplate();
    slipGajiTemplate = saved || { ...defaultSlipGajiTemplate };
    if (!saved) await DB.saveSlipGajiTemplate(slipGajiTemplate);
  }
  return slipGajiTemplate;
}

async function renderSlipGaji() {
  const container = document.getElementById('slipGajiContent');
  if (!container) return;
  container.innerHTML = `<div class="text-center py-12"><div class="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-500">Memuat data...</p></div>`;
  await loadSlipGajiTemplate();
  const isAdmin = isSuperAdmin() || isAdminCabang();
  if (isAdmin) {
    renderSlipGajiAdmin();
  } else {
    renderSlipGajiUser();
  }
}

// ── User View: see own slips ──
async function renderSlipGajiUser() {
  const container = document.getElementById('slipGajiContent');
  try {
    const slips = await DB.getSlipGajiByUser(currentUser.uid);
    if (slips.length === 0) {
      container.innerHTML = `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-5xl mb-4">💰</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Belum Ada Slip Gaji</h3>
        <p class="text-gray-500">Slip gaji Anda belum tersedia.</p>
      </div>`;
      return;
    }
    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="font-semibold text-gray-800 mb-4">💰 Daftar Slip Gaji</h3>
        <div class="space-y-3">
          ${slips.map(slip => {
      const earnings = slipGajiTemplate.fields.filter(f => f.type === 'earning');
      const deductions = slipGajiTemplate.fields.filter(f => f.type === 'deduction');
      const totalEarning = earnings.reduce((s, f) => s + (slip.items?.[f.key] || 0), 0);
      const totalDeduction = deductions.reduce((s, f) => s + (slip.items?.[f.key] || 0), 0);
      const takeHome = totalEarning - totalDeduction;
      return `<div onclick="viewSlipGajiDetail('${slip.id}')" class="bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl p-4 cursor-pointer transition-all">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold text-gray-800">Periode: ${slip.period}</p>
                  <p class="text-sm text-gray-500">${slip.branch || ''}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-teal-600">${formatRupiah(takeHome)}</p>
                  <p class="text-xs text-gray-400">Take Home Pay</p>
                </div>
              </div>
            </div>`;
    }).join('')}
        </div>
      </div>`;
  } catch (e) {
    console.error('[SlipGaji] Error:', e);
    container.innerHTML = `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"><p class="text-red-500">Gagal memuat data slip gaji.</p></div>`;
  }
}

async function viewSlipGajiDetail(slipId) {
  const container = document.getElementById('slipGajiContent');
  container.innerHTML = `<div class="text-center py-12"><div class="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div></div>`;
  try {
    const doc = await db.collection('slip_gaji').doc(slipId).get();
    if (!doc.exists) { showToast('Slip gaji tidak ditemukan', 'error'); renderSlipGaji(); return; }
    const slip = { id: doc.id, ...doc.data() };
    await loadSlipGajiTemplate();
    const earnings = slipGajiTemplate.fields.filter(f => f.type === 'earning');
    const deductions = slipGajiTemplate.fields.filter(f => f.type === 'deduction');
    const totalEarning = earnings.reduce((s, f) => s + (slip.items?.[f.key] || 0), 0);
    const totalDeduction = deductions.reduce((s, f) => s + (slip.items?.[f.key] || 0), 0);
    const takeHome = totalEarning - totalDeduction;
    container.innerHTML = `
      <div class="mb-4">
        <button onclick="renderSlipGaji()" class="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Kembali
        </button>
      </div>
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl" id="slipGajiPrintArea">
        <div class="text-center mb-6 border-b pb-4">
          <h3 class="text-xl font-bold text-gray-800">SLIP GAJI</h3>
          <p class="text-sm text-gray-500">Periode: ${slip.period}</p>
          <p class="text-sm text-gray-500">${slip.branch || ''}</p>
        </div>
        <div class="mb-6 p-4 bg-gray-50 rounded-xl">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div><span class="text-gray-500">Nama:</span> <span class="font-medium">${slip.name}</span></div>
            <div><span class="text-gray-500">Lembaga:</span> <span class="font-medium">${slip.branch || '-'}</span></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 class="font-semibold text-green-700 mb-3 flex items-center"><span class="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mr-2 text-xs">➕</span>Pendapatan</h4>
            <div class="space-y-2">
              ${earnings.map(f => `<div class="flex justify-between text-sm"><span class="text-gray-600">${f.label}</span><span class="font-medium">${formatRupiah(slip.items?.[f.key] || 0)}</span></div>`).join('')}
              <div class="border-t pt-2 flex justify-between text-sm font-bold text-green-700"><span>Total Pendapatan</span><span>${formatRupiah(totalEarning)}</span></div>
            </div>
          </div>
          <div>
            <h4 class="font-semibold text-red-700 mb-3 flex items-center"><span class="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center mr-2 text-xs">➖</span>Potongan</h4>
            <div class="space-y-2">
              ${deductions.map(f => `<div class="flex justify-between text-sm"><span class="text-gray-600">${f.label}</span><span class="font-medium">${formatRupiah(slip.items?.[f.key] || 0)}</span></div>`).join('')}
              <div class="border-t pt-2 flex justify-between text-sm font-bold text-red-700"><span>Total Potongan</span><span>${formatRupiah(totalDeduction)}</span></div>
            </div>
          </div>
        </div>
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
          <p class="text-sm text-teal-600">Take Home Pay</p>
          <p class="text-2xl font-bold text-teal-700">${formatRupiah(takeHome)}</p>
        </div>
      </div>
      <div class="mt-4 flex gap-3">
        <button onclick="printSlipGaji()" class="btn-hover gradient-bg text-white font-semibold px-6 py-3 rounded-xl shadow-lg">🖨️ Cetak Slip Gaji</button>
        ${isSuperAdmin() ? `<button onclick="deleteSlipGajiData('${slipId}')" class="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg transition-colors">🗑️ Hapus Slip</button>` : ''}
      </div>`;
  } catch (e) {
    console.error('[SlipGaji] Detail error:', e);
    container.innerHTML = `<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"><p class="text-red-500">Gagal memuat detail slip gaji.</p></div>`;
  }
}

function printSlipGaji() {
  const area = document.getElementById('slipGajiPrintArea');
  if (!area) return;
  // Extract data from the current slip detail view
  const slipName = area.querySelector('.grid .font-medium')?.textContent || '-';
  const slipBranch = area.querySelectorAll('.grid .font-medium')[1]?.textContent || '-';
  const periodText = area.querySelectorAll('.text-sm.text-gray-500')[0]?.textContent || '';
  const branchText = area.querySelectorAll('.text-sm.text-gray-500')[1]?.textContent || '';
  // Get earnings rows
  const earningsDiv = area.querySelectorAll('.space-y-2')[0];
  const deductionsDiv = area.querySelectorAll('.space-y-2')[1];
  let earningsRows = '', deductionsRows = '';
  let totalEarning = '', totalDeduction = '', takeHome = '';
  if (earningsDiv) {
    const items = earningsDiv.querySelectorAll('.flex.justify-between.text-sm:not(.font-bold)');
    items.forEach(row => {
      const label = row.children[0]?.textContent || '';
      const amount = row.children[1]?.textContent || '';
      earningsRows += `<tr><td>${label}</td><td class="amount">${amount}</td></tr>`;
    });
    const total = earningsDiv.querySelector('.font-bold');
    totalEarning = total?.children[1]?.textContent || '';
  }
  if (deductionsDiv) {
    const items = deductionsDiv.querySelectorAll('.flex.justify-between.text-sm:not(.font-bold)');
    items.forEach(row => {
      const label = row.children[0]?.textContent || '';
      const amount = row.children[1]?.textContent || '';
      deductionsRows += `<tr><td>${label}</td><td class="amount">${amount}</td></tr>`;
    });
    const total = deductionsDiv.querySelector('.font-bold');
    totalDeduction = total?.children[1]?.textContent || '';
  }
  const thpEl = area.querySelector('.text-2xl.font-bold');
  takeHome = thpEl?.textContent || '';

  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Slip Gaji - ${slipName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; padding: 32px; }
  .slip { max-width: 720px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
  .header { background: linear-gradient(135deg, #0d9488, #14b8a6); color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; }
  .header-left h1 { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
  .header-left p { font-size: 12px; opacity: 0.85; margin-top: 4px; }
  .header-right { text-align: right; }
  .header-right .badge { background: rgba(255,255,255,0.2); padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  .header-right .period { font-size: 11px; opacity: 0.8; margin-top: 6px; }
  .body { padding: 24px 32px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px; }
  .info-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; display: block; margin-bottom: 2px; }
  .info-item span { font-size: 14px; font-weight: 600; color: #1e293b; }
  .section { margin-bottom: 20px; }
  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
  .section-title.earning { color: #15803d; background: #f0fdf4; }
  .section-title.deduction { color: #b91c1c; background: #fef2f2; }
  table { width: 100%; border-collapse: collapse; }
  table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
  table tr:nth-child(even) { background: #fafbfc; }
  table td:first-child { color: #475569; }
  table td.amount { text-align: right; font-weight: 600; color: #1e293b; font-variant-numeric: tabular-nums; }
  .total-row { background: #f8fafc !important; }
  .total-row td { border-top: 2px solid #e2e8f0; border-bottom: none; font-weight: 700; font-size: 14px; padding: 12px; }
  .total-row.earning td { color: #15803d; }
  .total-row.deduction td { color: #b91c1c; }
  .thp-box { margin-top: 24px; background: linear-gradient(135deg, #f0fdfa, #ccfbf1); border: 2px solid #99f6e4; border-radius: 12px; padding: 20px; text-align: center; }
  .thp-box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #0d9488; font-weight: 600; margin-bottom: 4px; }
  .thp-box .value { font-size: 28px; font-weight: 800; color: #0f766e; }
  .footer { padding: 24px 32px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-end; }
  .sign-area { text-align: center; }
  .sign-area .date { font-size: 11px; color: #94a3b8; margin-bottom: 48px; }
  .sign-area .line { border-top: 1px dashed #cbd5e1; width: 180px; margin: 0 auto; padding-top: 6px; }
  .sign-area .title { font-size: 12px; color: #64748b; font-weight: 600; }
  .confidential { font-size: 10px; color: #cbd5e1; text-align: center; padding: 12px; letter-spacing: 1px; text-transform: uppercase; }
  @media print { body { padding: 0; } .slip { border: none; } }
</style></head><body>
<div class="slip">
  <div class="header">
    <div class="header-left">
      <h1>SLIP GAJI</h1>
      <p>Al Uswah Access \u2022 Sistem Akses Data Sekolah</p>
    </div>
    <div class="header-right">
      <div class="badge">${periodText.replace('Periode: ', '')}</div>
      <div class="period">${branchText}</div>
    </div>
  </div>
  <div class="body">
    <div class="info-grid">
      <div class="info-item"><label>Nama Pegawai</label><span>${slipName}</span></div>
      <div class="info-item"><label>Lembaga</label><span>${slipBranch}</span></div>
    </div>
    <div class="section">
      <div class="section-title earning">\u25B2 Pendapatan</div>
      <table>${earningsRows}<tr class="total-row earning"><td>Total Pendapatan</td><td class="amount">${totalEarning}</td></tr></table>
    </div>
    <div class="section">
      <div class="section-title deduction">\u25BC Potongan</div>
      <table>${deductionsRows}<tr class="total-row deduction"><td>Total Potongan</td><td class="amount">${totalDeduction}</td></tr></table>
    </div>
    <div class="thp-box">
      <div class="label">Take Home Pay</div>
      <div class="value">${takeHome}</div>
    </div>
  </div>
  <div class="footer">
    <div class="sign-area">
      <div class="date">&nbsp;</div>
      <div class="line"></div>
      <div class="title">Penerima</div>
    </div>
    <div class="sign-area">
      <div class="date">&nbsp;</div>
      <div class="line"></div>
      <div class="title">HRD / Bendahara</div>
    </div>
  </div>
  <div class="confidential">Dokumen ini bersifat rahasia dan hanya ditujukan untuk penerima</div>
</div>
<script>window.onload=function(){window.print()}<\/script>
</body></html>`);
  w.document.close();
}

// ── Admin View: manage slips ──
async function renderSlipGajiAdmin() {
  const container = document.getElementById('slipGajiContent');
  const now = new Date();
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h3 class="font-semibold text-gray-800">💰 Kelola Slip Gaji</h3>
        <div class="flex flex-wrap gap-2">
          ${isSuperAdmin() ? '<button onclick="renderSlipGajiTemplateEditor()" class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors">⚙️ Edit Template</button>' : ''}
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="text-sm text-gray-500 block mb-1">Periode</label>
          <input type="month" id="slipGajiPeriod" value="${currentPeriod}" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm">
        </div>
        <div>
          <label class="text-sm text-gray-500 block mb-1">Pegawai</label>
          <select id="slipGajiUser" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 bg-white text-sm">
            <option value="">-- Pilih Pegawai --</option>
          </select>
        </div>
        <div class="flex items-end">
          <button onclick="loadSlipGajiForm()" class="btn-hover gradient-bg text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg text-sm w-full">Muat / Buat Slip</button>
        </div>
      </div>
      <div id="slipGajiFormArea"></div>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-semibold text-gray-800 mb-4">📋 Riwayat Slip Gaji</h3>
      <div id="slipGajiHistory"><p class="text-gray-400 text-sm">Memuat...</p></div>
    </div>`;
  // Populate user dropdown
  let userList = users;
  if (isAdminCabang() && currentUser.branch) {
    userList = users.filter(u => u.branch === currentUser.branch);
  }
  const sel = document.getElementById('slipGajiUser');
  userList.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.uid;
    opt.textContent = `${u.name} (${u.branch || '-'})`;
    sel.appendChild(opt);
  });
  // Load history
  await loadSlipGajiHistory();
}

async function loadSlipGajiHistory() {
  const histDiv = document.getElementById('slipGajiHistory');
  if (!histDiv) return;
  try {
    let slips;
    if (isSuperAdmin()) {
      slips = await DB.getAllSlipGaji();
    } else {
      const period = document.getElementById('slipGajiPeriod')?.value || '';
      slips = await DB.getSlipGajiByPeriod(period, currentUser.branch);
    }
    if (slips.length === 0) {
      histDiv.innerHTML = '<p class="text-gray-400 text-sm">Belum ada data slip gaji.</p>';
      return;
    }
    histDiv.innerHTML = `<div class="overflow-x-auto"><table class="w-full text-sm">
      <thead class="bg-gray-50"><tr>
        <th class="px-4 py-3 text-left font-semibold text-gray-700">Nama</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700">Periode</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700">Lembaga</th>
        <th class="px-4 py-3 text-right font-semibold text-gray-700">Take Home</th>
        <th class="px-4 py-3 text-left font-semibold text-gray-700">Aksi</th>
      </tr></thead>
      <tbody>${slips.map(slip => {
      const earnings = slipGajiTemplate.fields.filter(f => f.type === 'earning');
      const deductions = slipGajiTemplate.fields.filter(f => f.type === 'deduction');
      const totalE = earnings.reduce((s, f) => s + (slip.items?.[f.key] || 0), 0);
      const totalD = deductions.reduce((s, f) => s + (slip.items?.[f.key] || 0), 0);
      return `<tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-4 py-3">${slip.name}</td>
          <td class="px-4 py-3">${slip.period}</td>
          <td class="px-4 py-3">${slip.branch || '-'}</td>
          <td class="px-4 py-3 text-right font-medium text-teal-600">${formatRupiah(totalE - totalD)}</td>
          <td class="px-4 py-3 flex gap-2"><button onclick="viewSlipGajiDetail('${slip.id}')" class="text-teal-600 hover:text-teal-800 text-sm font-medium">Lihat</button>${isSuperAdmin() ? `<button onclick="deleteSlipGajiData('${slip.id}')" class="text-red-500 hover:text-red-700 text-sm font-medium">🗑️</button>` : ''}</td>
        </tr>`;
    }).join('')}</tbody>
    </table></div>`;
  } catch (e) {
    console.error('[SlipGaji] History error:', e);
    histDiv.innerHTML = '<p class="text-red-500 text-sm">Gagal memuat riwayat.</p>';
  }
}

async function loadSlipGajiForm() {
  const uid = document.getElementById('slipGajiUser')?.value;
  const period = document.getElementById('slipGajiPeriod')?.value;
  if (!uid || !period) { showToast('Pilih pegawai dan periode', 'error'); return; }
  const formArea = document.getElementById('slipGajiFormArea');
  formArea.innerHTML = '<p class="text-gray-400 text-sm">Memuat...</p>';
  const user = users.find(u => u.uid === uid);
  if (!user) { showToast('Pegawai tidak ditemukan', 'error'); return; }
  // Check existing
  const docId = `${uid}_${period}`;
  let existingItems = {};
  try {
    const doc = await db.collection('slip_gaji').doc(docId).get();
    if (doc.exists) existingItems = doc.data().items || {};
  } catch (_) { }
  await loadSlipGajiTemplate();
  const earnings = slipGajiTemplate.fields.filter(f => f.type === 'earning');
  const deductions = slipGajiTemplate.fields.filter(f => f.type === 'deduction');
  formArea.innerHTML = `
    <div class="border-t pt-4 mt-4">
      <h4 class="font-semibold text-gray-800 mb-3">Slip Gaji: ${user.name} — ${period}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h5 class="font-medium text-green-700 mb-2">➕ Pendapatan</h5>
          ${earnings.map(f => `<div class="mb-2"><label class="text-xs text-gray-500">${f.label}</label><input type="number" id="sg_${f.key}" value="${existingItems[f.key] || 0}" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-400 text-sm"></div>`).join('')}
        </div>
        <div>
          <h5 class="font-medium text-red-700 mb-2">➖ Potongan</h5>
          ${deductions.map(f => `<div class="mb-2"><label class="text-xs text-gray-500">${f.label}</label><input type="number" id="sg_${f.key}" value="${existingItems[f.key] || 0}" min="0" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-400 text-sm"></div>`).join('')}
        </div>
      </div>
      <div class="flex gap-3 mt-4">
        <button onclick="saveSlipGajiData('${uid}', '${period}')" class="btn-hover gradient-bg text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg text-sm">💾 Simpan Slip Gaji</button>
      </div>
    </div>`;
}

async function saveSlipGajiData(uid, period) {
  const user = users.find(u => u.uid === uid);
  if (!user) return;
  await loadSlipGajiTemplate();
  const items = {};
  slipGajiTemplate.fields.forEach(f => {
    const el = document.getElementById(`sg_${f.key}`);
    items[f.key] = parseInt(el?.value || '0', 10) || 0;
  });
  const docId = `${uid}_${period}`;
  const data = {
    uid, name: user.name, branch: user.branch || '',
    period, items,
    createdAt: new Date().toISOString(),
    createdBy: currentUser.uid
  };
  try {
    await DB.saveSlipGaji(docId, data);
    showToast('Slip gaji berhasil disimpan!');
    await loadSlipGajiHistory();
  } catch (e) {
    console.error('[SlipGaji] Save error:', e);
    showToast('Gagal menyimpan slip gaji', 'error');
  }
}

async function deleteSlipGajiData(docId) {
  if (!isSuperAdmin()) { showToast('Hanya Super Admin yang dapat menghapus slip gaji', 'error'); return; }
  if (!confirm('Yakin ingin menghapus slip gaji ini? Tindakan ini tidak bisa dibatalkan.')) return;
  try {
    await DB.deleteSlipGaji(docId);
    showToast('Slip gaji berhasil dihapus');
    renderSlipGaji();
  } catch (e) {
    console.error('[SlipGaji] Delete error:', e);
    showToast('Gagal menghapus slip gaji', 'error');
  }
}

// ── Super Admin: Template Editor ──
async function renderSlipGajiTemplateEditor() {
  const container = document.getElementById('slipGajiContent');
  await loadSlipGajiTemplate();
  const fields = slipGajiTemplate.fields || [];
  container.innerHTML = `
    <div class="mb-4">
      <button onclick="renderSlipGaji()" class="flex items-center text-gray-600 hover:text-teal-600 transition-colors">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Kembali
      </button>
    </div>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 class="font-semibold text-gray-800 mb-4">⚙️ Edit Template Slip Gaji</h3>
      <p class="text-sm text-gray-500 mb-6">Atur komponen gaji yang akan muncul di slip gaji. Perubahan berlaku untuk semua slip gaji baru.</p>
      <div id="templateFieldsList">
        ${fields.map((f, i) => `
          <div class="flex items-center gap-3 mb-3 p-3 rounded-xl ${f.type === 'earning' ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}">
            <span class="text-sm font-medium flex-1">${f.label}</span>
            <span class="text-xs px-2 py-1 rounded-full ${f.type === 'earning' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">${f.type === 'earning' ? 'Pendapatan' : 'Potongan'}</span>
            <button onclick="removeTemplateField(${i})" class="text-red-500 hover:text-red-700 text-sm">✖</button>
          </div>
        `).join('')}
      </div>
      <div class="border-t pt-4 mt-4">
        <h4 class="font-medium text-gray-700 mb-3">Tambah Komponen Baru</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="text" id="newFieldLabel" placeholder="Nama komponen (misal: Tunjangan Hari Raya)" class="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm">
          <select id="newFieldType" class="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 bg-white text-sm">
            <option value="earning">Pendapatan (➕)</option>
            <option value="deduction">Potongan (➖)</option>
          </select>
          <button onclick="addTemplateField()" class="btn-hover gradient-bg text-white font-semibold py-2.5 rounded-xl text-sm">➕ Tambah</button>
        </div>
      </div>
    </div>`;
}

async function addTemplateField() {
  const label = document.getElementById('newFieldLabel')?.value.trim();
  const type = document.getElementById('newFieldType')?.value;
  if (!label) { showToast('Nama komponen harus diisi', 'error'); return; }
  const key = label.replace(/[^a-zA-Z0-9]/g, '').replace(/^./, c => c.toLowerCase()) + '_' + Date.now().toString(36);
  slipGajiTemplate.fields.push({ key, label, type });
  slipGajiTemplate.updatedAt = new Date().toISOString();
  await DB.saveSlipGajiTemplate(slipGajiTemplate);
  showToast('Komponen berhasil ditambahkan!');
  renderSlipGajiTemplateEditor();
}

async function removeTemplateField(index) {
  if (!confirm('Hapus komponen ini dari template?')) return;
  slipGajiTemplate.fields.splice(index, 1);
  slipGajiTemplate.updatedAt = new Date().toISOString();
  await DB.saveSlipGajiTemplate(slipGajiTemplate);
  showToast('Komponen berhasil dihapus');
  renderSlipGajiTemplateEditor();
}

// ── Data Arsip Module ──
const arsipAdminUmumConfig = {
  title: 'Arsip Administrasi Umum',
  icon: '📃',
  menus: [
    { key: 'surat-masuk', icon: '📥', label: 'Surat Masuk', desc: 'Arsip surat masuk dari pihak luar', color: 'blue' },
    { key: 'surat-keluar', icon: '📤', label: 'Surat Keluar', desc: 'Arsip surat keluar resmi lembaga', color: 'emerald' },
    { key: 'pengumuman', icon: '📢', label: 'Pengumuman Resmi', desc: 'Arsip pengumuman & edaran resmi', color: 'purple' }
  ]
};

const arsipSarprasConfig = {
  title: 'Arsip Sarana & Prasarana',
  icon: '🏢',
  menus: [
    { key: 'inventaris', icon: '📦', label: 'Data Inventaris Barang', desc: 'Catatan inventaris aset & barang', color: 'orange' },
    { key: 'pengadaan', icon: '📝', label: 'Dokumen Pengadaan', desc: 'Arsip proses pengadaan barang', color: 'blue' },
    { key: 'serah-terima', icon: '🤝', label: 'Berita Acara Serah Terima', desc: 'Dokumen BAST barang/aset', color: 'teal' },
    { key: 'pemeliharaan', icon: '🛠️', label: 'Jadwal Pemeliharaan', desc: 'Jadwal & catatan maintenance', color: 'red' }
  ]
};

const arsipKegiatanConfig = {
  title: 'Arsip Kegiatan & Dokumentasi',
  icon: '📌',
  menus: [
    { key: 'proposal', icon: '📑', label: 'Proposal Kegiatan', desc: 'Arsip proposal rencana kegiatan', color: 'indigo' },
    { key: 'surat-tugas', icon: '📋', label: 'Surat Tugas', desc: 'Arsip surat tugas & penugasan', color: 'amber' },
    { key: 'laporan-kegiatan', icon: '📊', label: 'Laporan Kegiatan', desc: 'Arsip laporan pelaksanaan', color: 'green' },
    { key: 'dokumentasi', icon: '📷', label: 'Dokumentasi Foto/Video', desc: 'Arsip dokumentasi visual', color: 'pink' }
  ]
};

const colorMap = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'bg-blue-100 text-blue-600', badge: 'bg-blue-100 text-blue-700', hover: 'hover:border-blue-300' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'bg-emerald-100 text-emerald-600', badge: 'bg-emerald-100 text-emerald-700', hover: 'hover:border-emerald-300' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'bg-purple-100 text-purple-600', badge: 'bg-purple-100 text-purple-700', hover: 'hover:border-purple-300' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'bg-orange-100 text-orange-600', badge: 'bg-orange-100 text-orange-700', hover: 'hover:border-orange-300' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'bg-teal-100 text-teal-600', badge: 'bg-teal-100 text-teal-700', hover: 'hover:border-teal-300' },
  red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'bg-red-100 text-red-600', badge: 'bg-red-100 text-red-700', hover: 'hover:border-red-300' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'bg-indigo-100 text-indigo-600', badge: 'bg-indigo-100 text-indigo-700', hover: 'hover:border-indigo-300' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'bg-amber-100 text-amber-600', badge: 'bg-amber-100 text-amber-700', hover: 'hover:border-amber-300' },
  green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'bg-green-100 text-green-600', badge: 'bg-green-100 text-green-700', hover: 'hover:border-green-300' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'bg-pink-100 text-pink-600', badge: 'bg-pink-100 text-pink-700', hover: 'hover:border-pink-300' }
};

let arsipDocCounts = {};

async function renderArsipPage(pageKey, containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '<div class="text-center py-12"><div class="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div><p class="text-gray-500">Memuat data...</p></div>';
  try {
    for (const menu of config.menus) {
      const docs = await DB.getArsipByCategory(menu.key);
      arsipDocCounts[menu.key] = docs.length;
    }
  } catch (e) { console.error('[Arsip] Count error:', e); }

  container.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">' +
    config.menus.map(menu => {
      const c = colorMap[menu.color] || colorMap.blue;
      const count = arsipDocCounts[menu.key] || 0;
      return '<div onclick="openArsipSubMenu(\'' + pageKey + '\', \'' + containerId + '\', \'' + menu.key + '\', \'' + encodeURIComponent(JSON.stringify(config)) + '\')" class="' + c.bg + ' border ' + c.border + ' ' + c.hover + ' rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md group">' +
        '<div class="flex items-start justify-between mb-3">' +
        '<div class="w-12 h-12 ' + c.icon + ' rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">' + menu.icon + '</div>' +
        '<span class="' + c.badge + ' text-xs font-bold px-2.5 py-1 rounded-full">' + count + ' dokumen</span>' +
        '</div>' +
        '<h4 class="font-bold text-gray-800 mb-1">' + menu.label + '</h4>' +
        '<p class="text-xs text-gray-500 leading-relaxed">' + menu.desc + '</p>' +
        '</div>';
    }).join('') + '</div>';
}

function getArsipConfigVarName(pageKey) {
  if (pageKey === 'arsip-admin-umum') return 'arsipAdminUmumConfig';
  if (pageKey === 'arsip-sarpras') return 'arsipSarprasConfig';
  return 'arsipKegiatanConfig';
}

async function openArsipSubMenu(pageKey, containerId, menuKey, configEncoded) {
  const config = JSON.parse(decodeURIComponent(configEncoded));
  const menuCfg = config.menus.find(m => m.key === menuKey);
  if (!menuCfg) return;
  const container = document.getElementById(containerId);
  container.innerHTML = '<div class="text-center py-12"><div class="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div></div>';
  const c = colorMap[menuCfg.color] || colorMap.blue;
  const cfgVar = getArsipConfigVarName(pageKey);
  try {
    const docs = await DB.getArsipByCategory(menuKey);
    let html = '<div class="mb-4"><button onclick="renderArsipPage(\'' + pageKey + '\', \'' + containerId + '\', ' + cfgVar + ')" class="flex items-center text-gray-600 hover:text-teal-600 transition-colors"><svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg> Kembali</button></div>';
    html += '<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">';
    html += '<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">';
    html += '<div class="flex items-center gap-3"><div class="w-10 h-10 ' + c.icon + ' rounded-xl flex items-center justify-center text-xl">' + menuCfg.icon + '</div><div><h3 class="font-bold text-gray-800">' + menuCfg.label + '</h3><p class="text-xs text-gray-500">' + menuCfg.desc + '</p></div></div>';
    html += '<button onclick="showAddArsipForm(\'' + pageKey + '\',\'' + containerId + '\',\'' + menuKey + '\',\'' + encodeURIComponent(JSON.stringify(config)) + '\')" class="btn-hover gradient-bg text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg text-sm">➕ Tambah Dokumen</button>';
    html += '</div><div id="arsipFormArea"></div>';
    if (docs.length === 0) {
      html += '<div class="text-center py-12"><div class="text-4xl mb-3">' + menuCfg.icon + '</div><p class="text-gray-400">Belum ada dokumen arsip.</p></div>';
    } else {
      html += '<div class="space-y-3">';
      docs.forEach(doc => {
        html += '<div class="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-all">';
        html += '<div class="flex items-start justify-between"><div class="flex-1">';
        html += '<h4 class="font-semibold text-gray-800">' + (doc.title || '-') + '</h4>';
        html += '<p class="text-sm text-gray-500 mt-1">' + (doc.description || '') + '</p>';
        html += '<div class="flex flex-wrap gap-2 mt-2">';
        html += '<span class="text-xs ' + c.badge + ' px-2 py-0.5 rounded-full">' + (doc.subCategory || menuCfg.label) + '</span>';
        html += '<span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">' + (doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-') + '</span>';
        if (doc.createdByName) html += '<span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">oleh: ' + doc.createdByName + '</span>';
        html += '</div></div><div class="flex gap-2 ml-3">';
        if (doc.fileUrl) html += '<a href="' + doc.fileUrl + '" target="_blank" rel="noopener noreferrer" class="text-teal-600 hover:text-teal-800 text-sm font-medium">🔗 Buka</a>';
        if (isSuperAdmin()) html += '<button onclick="deleteArsipDoc(\'' + doc.id + '\',\'' + pageKey + '\',\'' + containerId + '\',\'' + menuKey + '\',\'' + encodeURIComponent(JSON.stringify(config)) + '\')" class="text-red-500 hover:text-red-700 text-sm">🗑️</button>';
        html += '</div></div></div>';
      });
      html += '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
  } catch (e) {
    console.error('[Arsip] Load error:', e);
    container.innerHTML = '<div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center"><p class="text-red-500">Gagal memuat arsip.</p></div>';
  }
}

function showAddArsipForm(pageKey, containerId, menuKey, configEncoded) {
  const formArea = document.getElementById('arsipFormArea');
  if (!formArea) return;
  let html = '<div class="border border-teal-200 bg-teal-50/50 rounded-xl p-5 mb-6">';
  html += '<h4 class="font-semibold text-gray-800 mb-3">📄 Tambah Dokumen Baru</h4>';
  html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
  html += '<div><label class="text-xs text-gray-500 block mb-1">Judul Dokumen *</label><input type="text" id="arsipTitle" placeholder="Masukkan judul" class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm"></div>';
  html += '<div><label class="text-xs text-gray-500 block mb-1">Link File (Google Drive, dll)</label><input type="url" id="arsipFileUrl" placeholder="https://drive.google.com/..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm"></div>';
  html += '</div>';
  html += '<div class="mt-3"><label class="text-xs text-gray-500 block mb-1">Deskripsi</label><textarea id="arsipDesc" rows="2" placeholder="Keterangan dokumen..." class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-400 text-sm resize-none"></textarea></div>';
  html += '<div class="flex gap-3 mt-4">';
  html += '<button onclick="saveArsipDoc(\'' + pageKey + '\',\'' + containerId + '\',\'' + menuKey + '\',\'' + configEncoded + '\')" class="btn-hover gradient-bg text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg text-sm">💾 Simpan</button>';
  html += '<button onclick="document.getElementById(\'arsipFormArea\').innerHTML=\'\'" class="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm">Batal</button>';
  html += '</div></div>';
  formArea.innerHTML = html;
}

async function saveArsipDoc(pageKey, containerId, menuKey, configEncoded) {
  const title = document.getElementById('arsipTitle')?.value.trim();
  const fileUrl = document.getElementById('arsipFileUrl')?.value.trim();
  const desc = document.getElementById('arsipDesc')?.value.trim();
  if (!title) { showToast('Judul dokumen harus diisi', 'error'); return; }
  const config = JSON.parse(decodeURIComponent(configEncoded));
  const menuCfg = config.menus.find(m => m.key === menuKey);
  const data = {
    category: menuKey,
    subCategory: menuCfg?.label || '',
    title, description: desc, fileUrl: fileUrl || '',
    branch: currentUser.branch || '',
    createdAt: new Date().toISOString(),
    createdBy: currentUser.uid,
    createdByName: currentUser.name || ''
  };
  try {
    await DB.saveArsip(data);
    showToast('Dokumen arsip berhasil disimpan!');
    openArsipSubMenu(pageKey, containerId, menuKey, configEncoded);
  } catch (e) {
    console.error('[Arsip] Save error:', e);
    showToast('Gagal menyimpan dokumen', 'error');
  }
}

async function deleteArsipDoc(docId, pageKey, containerId, menuKey, configEncoded) {
  if (!isSuperAdmin()) { showToast('Hanya Super Admin yang dapat menghapus', 'error'); return; }
  if (!confirm('Yakin ingin menghapus dokumen ini?')) return;
  try {
    await DB.deleteArsip(docId);
    showToast('Dokumen berhasil dihapus');
    openArsipSubMenu(pageKey, containerId, menuKey, configEncoded);
  } catch (e) {
    console.error('[Arsip] Delete error:', e);
    showToast('Gagal menghapus dokumen', 'error');
  }
}
