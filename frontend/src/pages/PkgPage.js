import React, { useEffect, useState } from 'react';
import { getMyKey, regenerateKey, verifyUserKey } from '../api';

export default function PkgPage() {
  const [keyInfo,      setKeyInfo]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [verifyInput,  setVerifyInput]  = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [verifying,    setVerifying]    = useState(false);
  const [msg,          setMsg]          = useState(null);
  const [copied,       setCopied]       = useState('');

  const showMsg = (text, type = 'green') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3500); };

  const load = () => {
    setLoading(true);
    getMyKey().then(d => { if (d?.username) setKeyInfo(d); }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleRegenerate = async () => {
    if (!window.confirm('Regenerate your identity key? The old key will be replaced.')) return;
    setRegenerating(true);
    try {
      const res = await regenerateKey();
      if (res.message) { showMsg('🔑 New identity key generated!'); load(); }
      else showMsg(res.message || 'Failed', 'red');
    } catch { showMsg('Regeneration failed', 'red'); }
    finally { setRegenerating(false); }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyInput.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await verifyUserKey(verifyInput.trim());
      setVerifyResult(res);
    } catch { showMsg('Verification error', 'red'); }
    finally { setVerifying(false); }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>🔑 PKG — Private Key Generator</h1>
        <p>Identity-Based Encryption key management module</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {/* IBE explanation */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(239,68,68,.05)', borderColor: 'rgba(239,68,68,.2)' }}>
        <div className="card-title">📚 Identity-Based Encryption (IBE)</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>
          In IBE, a user's <strong style={{ color: 'var(--text)' }}>identity (username + email)</strong> IS the public key.
          The PKG derives cryptographic keys using <strong style={{ color: 'var(--text)' }}>SHA-256 hashing</strong> —
          no traditional certificate authorities needed.
          Each user gets a unique <strong style={{ color: 'var(--text)' }}>Identity Hash</strong> and <strong style={{ color: 'var(--text)' }}>IBE Public Key</strong>.
        </p>
      </div>

      {loading ? (
        <div className="empty"><span className="spinner" /></div>
      ) : (
        <div className="grid2">
          {/* My key card */}
          <div className="card">
            <div className="card-title">🔐 My Identity Key</div>
            {keyInfo && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5, fontWeight: 500 }}>USERNAME (Identity)</div>
                  <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8,
                    border: '1px solid var(--border)', fontWeight: 600 }}>
                    👤 {keyInfo.username}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5, fontWeight: 500 }}>
                    IDENTITY HASH — SHA-256(username + email + salt)
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8,
                    border: '1px solid var(--border)' }}>
                    <div className="mono" style={{ color: '#fbbf24' }}>{keyInfo.identityHash}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
                    onClick={() => copyToClipboard(keyInfo.identityHash, 'hash')}>
                    {copied === 'hash' ? '✅ Copied!' : '📋 Copy Hash'}
                  </button>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5, fontWeight: 500 }}>
                    IBE PUBLIC KEY — H(identityHash + masterSecret)
                  </div>
                  <div style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8,
                    border: '1px solid var(--border)' }}>
                    <div className="mono" style={{ color: '#34d399' }}>{keyInfo.publicKey}</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }}
                    onClick={() => copyToClipboard(keyInfo.publicKey, 'key')}>
                    {copied === 'key' ? '✅ Copied!' : '📋 Copy Key'}
                  </button>
                </div>

                <button className="btn btn-red" onClick={handleRegenerate} disabled={regenerating}>
                  {regenerating ? <><span className="spinner" /> Regenerating…</> : '🔄 Regenerate Key Pair'}
                </button>
              </div>
            )}
          </div>

          {/* Verify another user */}
          <div className="card">
            <div className="card-title">🔍 Verify Another User's Identity</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: '1.2rem', lineHeight: 1.6 }}>
              Enter a username to verify their identity key is authentic and matches the PKG records.
            </p>

            <form onSubmit={handleVerify}>
              <div className="form-group">
                <label>Username to Verify</label>
                <input value={verifyInput} onChange={e => setVerifyInput(e.target.value)}
                  placeholder="Enter username…" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={verifying}>
                {verifying ? <><span className="spinner" /> Verifying…</> : '🔍 Verify Identity'}
              </button>
            </form>

            {verifyResult && (
              <div style={{ marginTop: '1.2rem', padding: 16, borderRadius: 10,
                background: verifyResult.verified ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)',
                border: `1px solid ${verifyResult.verified ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}` }}>
                <div style={{ fontWeight: 700, fontSize: 15,
                  color: verifyResult.verified ? '#34d399' : '#f87171', marginBottom: 8 }}>
                  {verifyResult.verified ? '✅ Identity Verified' : '❌ Verification Failed'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
                  {verifyResult.message}
                </div>
                {verifyResult.publicKey && (
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>Public Key:</div>
                    <div className="mono" style={{ color: '#34d399' }}>{verifyResult.publicKey}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Key generation flow */}
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-title">⚙️ PKG Key Generation Flow</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { label: 'User Registers',         sub: 'username + email',              icon: '👤', color: '#60a5fa' },
                { arrow: true },
                { label: 'PKG Identity String',    sub: 'user|email|CLOUDSEC2024',       icon: '🔤', color: '#fbbf24' },
                { arrow: true },
                { label: 'SHA-256 Hash',           sub: 'identityHash = H(identity)',    icon: '#️⃣', color: '#f87171' },
                { arrow: true },
                { label: 'Key Derivation',         sub: 'pubKey = H(hash|masterSecret)', icon: '🔑', color: '#34d399' },
                { arrow: true },
                { label: 'Stored in PostgreSQL',   sub: 'users.public_key = IBE-PK-…',  icon: '💾', color: '#a78bfa' },
              ].map((item, i) => item.arrow
                ? <div key={i} style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>→</div>
                : (
                  <div key={i} style={{ textAlign: 'center', padding: '12px 14px', flex: 1, minWidth: 110,
                    background: 'var(--bg3)', borderRadius: 10,
                    border: `1px solid ${item.color}44` }}>
                    <div style={{ fontSize: '1.3rem', marginBottom: 6 }}>{item.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: item.color }}>{item.label}</div>
                    <div className="mono" style={{ color: 'var(--muted)', marginTop: 3, fontSize: 10 }}>{item.sub}</div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
