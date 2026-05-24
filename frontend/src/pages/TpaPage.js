import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getMyFiles, requestAudit, verifyAudit, getPendingAudits, getMyAudits } from '../api';

const STATUS_BADGE = {
  PENDING: 'badge-amber', IN_PROGRESS: 'badge-blue',
  VERIFIED: 'badge-green', FAILED: 'badge-red'
};

export default function TpaPage() {
  const { user } = useAuth();
  const [files,   setFiles]   = useState([]);
  const [audits,  setAudits]  = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy,    setBusy]    = useState(null);
  const [msg,     setMsg]     = useState(null);

  const showMsg = (text, type = 'green') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 4000); };

  const load = async () => {
    setLoading(true);
    try {
      const [f, a] = await Promise.all([getMyFiles(), getMyAudits()]);
      if (Array.isArray(f)) setFiles(f);
      if (Array.isArray(a)) setAudits(a);
      if (user?.role === 'TPA' || user?.role === 'CLOUD_ADMIN') {
        const p = await getPendingAudits();
        if (Array.isArray(p)) setPending(p);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRequest = async (fileId, fileName) => {
    setBusy('req-' + fileId);
    try {
      const res = await requestAudit(fileId);
      if (res.id) { showMsg(`🛡️ Audit requested for "${fileName}"`); load(); }
      else showMsg(res.message || 'Request failed', 'red');
    } catch { showMsg('Request failed', 'red'); }
    finally { setBusy(null); }
  };

  const handleVerify = async (auditId) => {
    setBusy('ver-' + auditId);
    try {
      const res = await verifyAudit(auditId);
      if (res.integrityVerified) {
        showMsg('✅ INTEGRITY VERIFIED — No tampering detected!');
      } else {
        showMsg('❌ INTEGRITY FAILED — Possible tampering detected!', 'red');
      }
      load();
    } catch { showMsg('Verification error', 'red'); }
    finally { setBusy(null); }
  };

  const isTpa = user?.role === 'TPA' || user?.role === 'CLOUD_ADMIN';

  return (
    <div>
      <div className="page-header">
        <h1>🛡️ TPA — Third Party Auditor</h1>
        <p>Remote file integrity verification via challenge-response protocol</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* Protocol explanation */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(139,92,246,.05)', borderColor: 'rgba(139,92,246,.2)' }}>
        <div className="card-title">🔬 Challenge-Response Protocol</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { icon: '👤', label: 'User requests audit' },
            { arrow: true },
            { icon: '🎲', label: 'System generates challenge token' },
            { arrow: true },
            { icon: '☁️', label: 'Cloud computes proof (no file sent)' },
            { arrow: true },
            { icon: '🛡️', label: 'TPA verifies proof independently' },
          ].map((s, i) => s.arrow
            ? <div key={i} style={{ color: 'var(--muted)' }}>→</div>
            : (
              <div key={i} style={{ textAlign: 'center', padding: '10px 14px', background: 'var(--bg3)',
                borderRadius: 8, flex: 1, minWidth: 100 }}>
                <div style={{ fontSize: '1.4rem' }}>{s.icon}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            )
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty"><span className="spinner" /></div>
      ) : (
        <div className="grid2">
          {/* Request audit panel */}
          <div className="card">
            <div className="card-title">📤 Request Audit for My Files</div>
            {files.length === 0 ? (
              <div className="empty"><div className="empty-icon">📭</div><p>No files to audit yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {files.map(f => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: 12, background: 'var(--bg3)',
                    borderRadius: 8, border: '1px solid var(--border)', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>📄 {f.originalName}</div>
                      <span className={`badge ${STATUS_BADGE[f.status] || 'badge-gray'}`} style={{ marginTop: 4 }}>
                        {f.status}
                      </span>
                    </div>
                    <button className="btn btn-purple btn-sm"
                      disabled={busy === 'req-' + f.id}
                      onClick={() => handleRequest(f.id, f.originalName)}>
                      {busy === 'req-' + f.id ? <><span className="spinner" /> …</> : '🛡️ Request'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My audit requests */}
          <div className="card">
            <div className="card-title">📋 My Audit History</div>
            {audits.length === 0 ? (
              <div className="empty"><div className="empty-icon">🔍</div><p>No audit requests yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                {audits.map(a => (
                  <div key={a.id} style={{ padding: 12, background: 'var(--bg3)',
                    borderRadius: 8, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>🆔 Audit #{a.id}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                          File: {a.fileName}
                        </div>
                        <span className={`badge ${STATUS_BADGE[a.status] || 'badge-gray'}`} style={{ marginTop: 5 }}>
                          {a.status}
                        </span>
                      </div>
                      {a.status === 'PENDING' && isTpa && (
                        <button className="btn btn-green btn-sm"
                          disabled={busy === 'ver-' + a.id}
                          onClick={() => handleVerify(a.id)}>
                          {busy === 'ver-' + a.id ? <><span className="spinner" /></> : '✅ Verify'}
                        </button>
                      )}
                    </div>
                    {a.auditResult && (
                      <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, fontSize: 11,
                        background: a.status === 'VERIFIED' ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)',
                        color: a.status === 'VERIFIED' ? '#34d399' : '#f87171' }}>
                        {a.auditResult}
                      </div>
                    )}
                    {a.challengeToken && (
                      <div className="mono" style={{ marginTop: 6, color: 'var(--muted)' }}>
                        Token: {a.challengeToken.substring(0, 20)}…
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TPA Pending audits panel */}
          {isTpa && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-title">⏳ All Pending Audits (TPA View)</div>
              {pending.length === 0 ? (
                <div className="empty"><div className="empty-icon">✅</div><p>No pending audits</p></div>
              ) : (
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Audit ID</th>
                        <th>File</th>
                        <th>Requested By</th>
                        <th>File Hash</th>
                        <th>Challenge Token</th>
                        <th>Requested At</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pending.map(a => (
                        <tr key={a.id}>
                          <td>#{a.id}</td>
                          <td>📄 {a.fileName}</td>
                          <td>👤 {a.requestedBy}</td>
                          <td><span className="mono" style={{ color: 'var(--muted)' }}>
                            {a.fileHash ? a.fileHash.substring(0, 12) + '…' : '—'}
                          </span></td>
                          <td><span className="mono" style={{ color: 'var(--muted)' }}>
                            {a.challengeToken ? a.challengeToken.substring(0, 16) + '…' : '—'}
                          </span></td>
                          <td>{a.requestedAt ? new Date(a.requestedAt).toLocaleString() : '—'}</td>
                          <td>
                            <button className="btn btn-green btn-sm"
                              disabled={busy === 'ver-' + a.id}
                              onClick={() => handleVerify(a.id)}>
                              {busy === 'ver-' + a.id ? <><span className="spinner" /></> : '✅ Verify'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
