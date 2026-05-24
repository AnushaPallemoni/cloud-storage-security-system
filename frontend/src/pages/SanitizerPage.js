import React, { useEffect, useState } from 'react';
import { getMyFiles, sanitizeFile, previewSanitize } from '../api';

const TYPE_COLORS = {
  EMAIL:'#60a5fa', PHONE:'#34d399', AADHAAR:'#fbbf24', PAN:'#f87171',
  CREDIT_CARD:'#c084fc', SSN:'#fb923c', PASSWORD_FIELD:'#f43f5e', IP_ADDRESS:'#94a3b8'
};

export default function SanitizerPage() {
  const [files, setFiles]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [preview, setPreview]     = useState(null);
  const [selected, setSelected]   = useState(null);
  const [processing, setProcessing] = useState(null);
  const [msg, setMsg]             = useState(null);

  const load = () => {
    setLoading(true);
    getMyFiles().then(d => { if (Array.isArray(d)) setFiles(d); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const showMsg = (text, type = 'green') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 4000); };

  const handlePreview = async (file) => {
    setSelected(file);
    setPreview(null);
    try {
      const res = await previewSanitize(file.id);
      setPreview(res);
    } catch {
      setPreview({ error: 'Cannot preview — file may be binary' });
    }
  };

  const handleSanitize = async (fileId, fileName) => {
    setProcessing(fileId);
    try {
      const res = await sanitizeFile(fileId);
      if (res.id) {
        showMsg(`✅ "${fileName}" sanitized successfully!`);
        load();
        setPreview(null);
        setSelected(null);
      } else {
        showMsg(res.message || 'Sanitization failed', 'red');
      }
    } catch (err) {
      showMsg('Sanitization failed', 'red');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>🧹 Sanitizer Module</h1>
        <p>Detect and redact PII / sensitive data before sharing files</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* What gets redacted */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(245,158,11,.05)', borderColor: 'rgba(245,158,11,.2)' }}>
        <div className="card-title" style={{ marginBottom: 10 }}>🔍 Patterns Detected &amp; Redacted</div>
        <div className="flex-gap">
          {Object.entries(TYPE_COLORS).map(([k, c]) => (
            <span key={k} style={{ padding: '3px 12px', borderRadius: 20, fontSize: 12,
              background: c + '22', color: c, fontWeight: 500 }}>
              {k.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className="grid2">
        {/* File list */}
        <div className="card">
          <div className="card-title">📂 Your Files</div>
          {loading ? (
            <div className="empty"><span className="spinner" /></div>
          ) : files.length === 0 ? (
            <div className="empty"><div className="empty-icon">📭</div><p>No files yet</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {files.map(f => (
                <div key={f.id} style={{
                  padding: 12, borderRadius: 8,
                  background: selected?.id === f.id ? 'rgba(245,158,11,.08)' : 'var(--bg3)',
                  border: `1px solid ${selected?.id === f.id ? 'rgba(245,158,11,.3)' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>📄 {f.originalName}</div>
                      <div style={{ marginTop: 4 }}>
                        {f.isSanitized
                          ? <span className="badge badge-green">✓ Sanitized</span>
                          : <span className="badge badge-amber">⚠ Not Sanitized</span>}
                      </div>
                    </div>
                    <div className="flex-gap">
                      <button className="btn btn-ghost btn-sm" onClick={() => handlePreview(f)}>
                        🔍 Preview
                      </button>
                      {!f.isSanitized && (
                        <button className="btn btn-amber btn-sm"
                          disabled={processing === f.id}
                          onClick={() => handleSanitize(f.id, f.originalName)}>
                          {processing === f.id
                            ? <><span className="spinner" /> …</>
                            : '🧹 Sanitize'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview panel */}
        <div className="card">
          <div className="card-title">🔍 Sanitization Preview</div>
          {!selected && (
            <div className="empty">
              <div className="empty-icon">👈</div>
              <p>Select a file and click Preview to see what will be redacted</p>
            </div>
          )}
          {preview?.error && (
            <div className="alert alert-amber">⚠️ {preview.error}</div>
          )}
          {preview && !preview.error && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>📄 {preview.fileName}</div>

              <div style={{ padding: '12px 16px', background: 'var(--bg3)', borderRadius: 8, marginBottom: 14 }}>
                <span style={{ color: 'var(--muted)', fontSize: 13 }}>Total items to redact: </span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1.4rem' }}>
                  {preview.totalItemsToRedact}
                </span>
              </div>

              {preview.totalItemsToRedact === 0 && (
                <div className="alert alert-green">✅ No sensitive data detected in this file!</div>
              )}

              {Object.entries(preview.detectedPatterns || {}).map(([type, items]) => (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: TYPE_COLORS[type] || '#94a3b8', marginBottom: 6 }}>
                    {type.replace('_', ' ')} — {items.length} found
                  </div>
                  <div className="flex-gap">
                    {items.map((item, i) => (
                      <span key={i} className="mono" style={{
                        padding: '2px 10px', borderRadius: 4,
                        background: (TYPE_COLORS[type] || '#94a3b8') + '22',
                        color: TYPE_COLORS[type] || '#94a3b8',
                      }}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}

              {selected && !selected.isSanitized && preview.totalItemsToRedact > 0 && (
                <button className="btn btn-amber" style={{ marginTop: 12, width: '100%', justifyContent: 'center' }}
                  disabled={processing === selected.id}
                  onClick={() => handleSanitize(selected.id, selected.originalName)}>
                  {processing === selected.id
                    ? <><span className="spinner" /> Sanitizing…</>
                    : `🧹 Sanitize Now (redact ${preview.totalItemsToRedact} items)`}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-title">⚙️ How Sanitization Works</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { step: '1', icon: '📂', label: 'Select file', desc: 'Choose any text-based file' },
            { step: '2', icon: '🔍', label: 'Preview scan', desc: 'System scans for PII patterns' },
            { step: '3', icon: '🧹', label: 'Sanitize', desc: 'Sensitive data replaced with [REDACTED-TYPE]' },
            { step: '4', icon: '📤', label: 'Share safely', desc: 'Use sanitized version for sharing' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, minWidth: 120, padding: 14, background: 'var(--bg3)',
              borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 12, color: '#fbbf24' }}>Step {s.step}: {s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
