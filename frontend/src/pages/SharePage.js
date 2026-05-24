import React, { useEffect, useState } from 'react';
import { getMyFiles, shareFile, getReceivedFiles, getSentFiles } from '../api';

export default function SharePage() {
  const [files,    setFiles]    = useState([]);
  const [received, setReceived] = useState([]);
  const [sent,     setSent]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('send');
  const [form,     setForm]     = useState({ fileId: '', sharedWithUsername: '', useSanitized: true });
  const [sending,  setSending]  = useState(false);
  const [msg,      setMsg]      = useState(null);

  const showMsg = (text, type = 'green') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [f, r, s] = await Promise.all([getMyFiles(), getReceivedFiles(), getSentFiles()]);
      if (Array.isArray(f)) setFiles(f);
      if (Array.isArray(r)) setReceived(r);
      if (Array.isArray(s)) setSent(s);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!form.fileId || !form.sharedWithUsername.trim()) {
      showMsg('Select a file and enter a username', 'red'); return;
    }
    setSending(true);
    try {
      const res = await shareFile({
        fileId: parseInt(form.fileId),
        sharedWithUsername: form.sharedWithUsername.trim(),
        useSanitized: form.useSanitized,
      });
      if (res.id) {
        showMsg(`✅ File shared with ${form.sharedWithUsername}!`);
        setForm({ fileId: '', sharedWithUsername: '', useSanitized: true });
        load();
      } else {
        showMsg(res.message || 'Sharing failed', 'red');
      }
    } catch { showMsg('Sharing failed', 'red'); }
    finally { setSending(false); }
  };

  const selectedFile = files.find(f => f.id === parseInt(form.fileId));
  const warnSanitized = form.useSanitized && selectedFile && !selectedFile.isSanitized;

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{
      padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer',
      fontWeight: 500, fontSize: 13, fontFamily: 'inherit',
      background: tab === t ? 'rgba(59,130,246,.15)' : 'transparent',
      color: tab === t ? '#60a5fa' : 'var(--muted)',
    }}>{label}</button>
  );

  return (
    <div>
      <div className="page-header">
        <h1>🔗 File Share</h1>
        <p>Securely share sanitized files with other users</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Security notice */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(16,185,129,.05)', borderColor: 'rgba(16,185,129,.2)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ fontSize: '1.5rem' }}>🔒</div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Secure Sharing Protocol</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Files are shared using the <strong style={{ color: 'var(--text)' }}>Sanitized version</strong> by default —
              all PII is redacted before the recipient accesses it.
              A unique <strong style={{ color: 'var(--text)' }}>share token</strong> is generated per share event for full traceability.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: '1.5rem', background: 'var(--bg2)',
        padding: 4, borderRadius: 10, border: '1px solid var(--border)', width: 'fit-content' }}>
        {tabBtn('send',     `📤 Send File`)}
        {tabBtn('received', `📥 Received (${received.length})`)}
        {tabBtn('sent',     `📨 Sent (${sent.length})`)}
      </div>

      {/* ── SEND TAB ── */}
      {tab === 'send' && (
        <div className="grid2">
          <div className="card">
            <div className="card-title">📤 Share a File</div>
            <form onSubmit={handleShare}>
              <div className="form-group">
                <label>Select File</label>
                <select value={form.fileId} onChange={e => setForm({ ...form, fileId: e.target.value })}>
                  <option value="">-- Choose a file --</option>
                  {files.map(f => (
                    <option key={f.id} value={f.id}>
                      📄 {f.originalName} {f.isSanitized ? '✓ Sanitized' : '⚠ Not Sanitized'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Recipient Username</label>
                <input value={form.sharedWithUsername}
                  onChange={e => setForm({ ...form, sharedWithUsername: e.target.value })}
                  placeholder="Enter their username" />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexDirection: 'row' }}>
                  <input type="checkbox" checked={form.useSanitized}
                    onChange={e => setForm({ ...form, useSanitized: e.target.checked })}
                    style={{ width: 'auto', marginRight: 4 }} />
                  Share sanitized version (recommended — hides PII)
                </label>
              </div>

              {warnSanitized && (
                <div className="alert alert-amber" style={{ marginBottom: '1rem' }}>
                  ⚠️ This file is not sanitized yet. Go to the Sanitizer module first,
                  or uncheck the "sanitized version" option.
                </div>
              )}

              <button type="submit" className="btn btn-green" disabled={sending || warnSanitized}>
                {sending ? <><span className="spinner" /> Sharing…</> : '🔗 Share File'}
              </button>
            </form>
          </div>

          <div className="card" style={{ background: 'rgba(59,130,246,.04)' }}>
            <div className="card-title">ℹ️ How Sharing Works</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: '1️⃣', text: 'Select a file and enter the recipient\'s username' },
                { icon: '2️⃣', text: 'System verifies recipient exists in the database' },
                { icon: '3️⃣', text: 'Sanitized version is linked to recipient (PII hidden)' },
                { icon: '4️⃣', text: 'Unique share token is generated for audit trail' },
                { icon: '5️⃣', text: 'Recipient sees it in their Received tab' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RECEIVED TAB ── */}
      {tab === 'received' && (
        <div className="card">
          <div className="card-title">📥 Files Shared With Me</div>
          {loading ? (
            <div className="empty"><span className="spinner" /></div>
          ) : received.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p>No files shared with you yet</p></div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Shared By</th>
                    <th>Version</th>
                    <th>Share Token</th>
                    <th>Shared At</th>
                  </tr>
                </thead>
                <tbody>
                  {received.map(s => (
                    <tr key={s.id}>
                      <td>📄 {s.fileName}</td>
                      <td>👤 {s.sharedBy}</td>
                      <td>
                        {s.useSanitized
                          ? <span className="badge badge-green">🧹 Sanitized</span>
                          : <span className="badge badge-amber">⚠ Original</span>}
                      </td>
                      <td><span className="mono" style={{ color: 'var(--muted)' }}>
                        {s.shareToken ? s.shareToken.substring(0, 16) + '…' : '—'}
                      </span></td>
                      <td>{s.sharedAt ? new Date(s.sharedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SENT TAB ── */}
      {tab === 'sent' && (
        <div className="card">
          <div className="card-title">📨 Files I Shared</div>
          {loading ? (
            <div className="empty"><span className="spinner" /></div>
          ) : sent.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p>You haven't shared any files yet</p></div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Shared With</th>
                    <th>Version</th>
                    <th>Share Token</th>
                    <th>Shared At</th>
                  </tr>
                </thead>
                <tbody>
                  {sent.map(s => (
                    <tr key={s.id}>
                      <td>📄 {s.fileName}</td>
                      <td>👤 {s.sharedWith}</td>
                      <td>
                        {s.useSanitized
                          ? <span className="badge badge-green">🧹 Sanitized</span>
                          : <span className="badge badge-amber">⚠ Original</span>}
                      </td>
                      <td><span className="mono" style={{ color: 'var(--muted)' }}>
                        {s.shareToken ? s.shareToken.substring(0, 16) + '…' : '—'}
                      </span></td>
                      <td>{s.sharedAt ? new Date(s.sharedAt).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}