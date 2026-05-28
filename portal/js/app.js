// Kith & Kin — Shared auth & utilities

// ── Session & role management ─────────────────────────────────────────────────
async function getSession() {
  const { data: { session } } = await db.auth.getSession();
  return session;
}

async function getProfile(userId, email) {
  // Try by ID first
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (!error && data) return data;

  // Fallback: look up by email (handles invite flow where IDs may differ)
  if (email) {
    const { data: data2 } = await db
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    if (data2) return { ...data2, id: userId };
  }
  return null;
}

async function requireAuth(allowedRoles) {
  const session = await getSession();
  if (!session) {
    window.location.href = '/portal/index.html';
    return null;
  }
  const profile = await getProfile(session.user.id, session.user.email);
  if (!profile) {
    await db.auth.signOut();
    window.location.href = '/portal/index.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    window.location.href = '/portal/index.html';
    return null;
  }
  return { session, profile };
}

async function signOut() {
  await db.auth.signOut();
  window.location.href = '/portal/index.html';
}

// ── Formatting helpers ────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scoreLabel(score) {
  const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };
  return labels[score] || '—';
}

function scoreColor(score) {
  if (!score) return '#7A6E62';
  if (score <= 2) return '#C0392B';
  if (score === 3) return '#E67E22';
  return '#27AE60';
}

function bpDisplay(sys, dia) {
  if (!sys || !dia) return '—';
  return `${sys}/${dia} mmHg`;
}

// ── Toast notifications ───────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.kk-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'kk-toast';
  toast.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:9999;
    padding:1rem 1.5rem;border-radius:4px;
    font-family:'Outfit',sans-serif;font-size:.85rem;font-weight:400;
    color:#FAF7F2;letter-spacing:.03em;
    box-shadow:0 4px 24px rgba(0,0,0,.25);
    animation:toastIn .3s ease;
    background:${type === 'success' ? '#2C2418' : '#C0392B'};
    border-left:3px solid ${type === 'success' ? '#BFA06A' : '#E74C3C'};
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Loading state ─────────────────────────────────────────────────────────────
function setLoading(btn, loading, defaultText) {
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : defaultText;
  btn.style.opacity = loading ? '0.7' : '1';
}

// ── Inject global toast animations ───────────────────────────────────────────
const toastStyle = document.createElement('style');
toastStyle.textContent = `
  @keyframes toastIn { from { opacity:0; transform:translateY(1rem); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(1rem); } }
`;
document.head.appendChild(toastStyle);
