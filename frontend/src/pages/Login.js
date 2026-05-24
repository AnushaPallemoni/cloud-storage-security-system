import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../App';

export default function Login() {
  const { loginCtx } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username || !form.password) { setError('Fill in all fields'); return; }
    setBusy(true);
    try {
      const res = await login(form);
      if (res.token) {
        const { token, ...user } = res;
        loginCtx(user, token);
        navigate('/');
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch { setError('Connection error. Is the backend running?'); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize:'2.8rem', marginBottom:8 }}>☁️🔒</div>
          <h2>CloudSec System</h2>
          <p>Cloud Storage Security &amp; Auditing</p>
        </div>

        {error && <div className="alert alert-red">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm({...form, username: e.target.value})}
              placeholder="Enter username" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} placeholder="Enter password" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in…</> : '🔐 Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          No account? <Link to="/register">Register here</Link>
        </div>

        <div style={{ marginTop:'1.5rem', padding:'12px', background:'rgba(59,130,246,.07)',
          borderRadius:8, fontSize:12, color:'var(--muted)', lineHeight:1.7 }}>
          <strong style={{ color:'var(--text)' }}>First time?</strong><br />
          Register with roles: USER · CLOUD_ADMIN · TPA · SANITIZER · PKG_ADMIN
        </div>
      </div>
    </div>
  );
}
