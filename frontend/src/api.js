// ─────────────────────────────────────────────────────────────
// API Service — plain JavaScript fetch() calls to Spring Boot
// No axios, no extra libraries needed
// ─────────────────────────────────────────────────────────────

const BASE = '/api';

function getToken() { return localStorage.getItem('token'); }

function headers(isForm = false) {
  const h = { Authorization: `Bearer ${getToken()}` };
  if (!isForm) h['Content-Type'] = 'application/json';
  return h;
}

async function handleRes(res) {
  if (res.status === 401) { localStorage.clear(); window.location.href = '/login'; }
  const text = await res.text();
  try { return JSON.parse(text); }
  catch { return text; }
}

// ── AUTH ─────────────────────────────────────────────────────
export const register = (data) =>
  fetch(`${BASE}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(handleRes);

export const login = (data) =>
  fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(handleRes);

// ── FILES ────────────────────────────────────────────────────
export const uploadFile = (formData) =>
  fetch(`${BASE}/files/upload`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: formData })
    .then(handleRes);

export const getMyFiles = () =>
  fetch(`${BASE}/files/my`, { headers: headers() }).then(handleRes);

export const getAllFiles = () =>
  fetch(`${BASE}/files/all`, { headers: headers() }).then(handleRes);

export const deleteFile = (id) =>
  fetch(`${BASE}/files/${id}`, { method: 'DELETE', headers: headers() }).then(handleRes);

export const downloadFile = (id, filename) => {
  fetch(`${BASE}/files/download/${id}`, { headers: headers() })
    .then(r => r.blob()).then(blob => triggerDownload(blob, filename));
};

export const downloadSanitized = (id, filename) => {
  fetch(`${BASE}/files/download-sanitized/${id}`, { headers: headers() })
    .then(r => r.blob()).then(blob => triggerDownload(blob, 'sanitized_' + filename));
};

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── SANITIZER ────────────────────────────────────────────────
export const sanitizeFile = (fileId) =>
  fetch(`${BASE}/sanitizer/sanitize/${fileId}`, { method: 'POST', headers: headers() }).then(handleRes);

export const previewSanitize = (fileId) =>
  fetch(`${BASE}/sanitizer/preview/${fileId}`, { headers: headers() }).then(handleRes);

export const getPendingSanitize = () =>
  fetch(`${BASE}/sanitizer/pending`, { headers: headers() }).then(handleRes);

// ── TPA ──────────────────────────────────────────────────────
export const requestAudit = (fileId) =>
  fetch(`${BASE}/tpa/request/${fileId}`, { method: 'POST', headers: headers() }).then(handleRes);

export const verifyAudit = (auditId) =>
  fetch(`${BASE}/tpa/verify/${auditId}`, { method: 'POST', headers: headers() }).then(handleRes);

export const getPendingAudits = () =>
  fetch(`${BASE}/tpa/pending`, { headers: headers() }).then(handleRes);

export const getMyAudits = () =>
  fetch(`${BASE}/tpa/my-requests`, { headers: headers() }).then(handleRes);

export const getAllAudits = () =>
  fetch(`${BASE}/tpa/all`, { headers: headers() }).then(handleRes);

// ── PKG ──────────────────────────────────────────────────────
export const getMyKey = () =>
  fetch(`${BASE}/pkg/my-key`, { headers: headers() }).then(handleRes);

export const regenerateKey = () =>
  fetch(`${BASE}/pkg/regenerate-key`, { method: 'POST', headers: headers() }).then(handleRes);

export const verifyUserKey = (username) =>
  fetch(`${BASE}/pkg/verify/${username}`, { headers: headers() }).then(handleRes);

// ── SHARE ────────────────────────────────────────────────────
export const shareFile = (data) =>
  fetch(`${BASE}/share/send`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleRes);

export const getReceivedFiles = () =>
  fetch(`${BASE}/share/received`, { headers: headers() }).then(handleRes);

export const getSentFiles = () =>
  fetch(`${BASE}/share/sent`, { headers: headers() }).then(handleRes);
