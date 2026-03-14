import { useState, useEffect, useCallback } from 'react';

const API = 'https://ai-assisted-journal-system-production-4cde.up.railway.app/api/journal';
const AUTH_API = 'https://ai-assisted-journal-system-production-4cde.up.railway.app/api/auth';

const AMBIENCES = [
  { value: 'forest', emoji: '🌲', label: 'Forest' },
  { value: 'ocean', emoji: '🌊', label: 'Ocean' },
  { value: 'mountain', emoji: '🏔️', label: 'Mountain' },
  { value: 'rain', emoji: '🌧️', label: 'Rain' },
  { value: 'desert', emoji: '🏜️', label: 'Desert' },
  { value: 'meadow', emoji: '🌸', label: 'Meadow' },
];

const EMOTION_COLORS = {
  calm: '#34d399', peaceful: '#34d399', joyful: '#fbbf24',
  happy: '#fbbf24', grateful: '#a78bfa', anxious: '#f87171',
  sad: '#60a5fa', focused: '#818cf8', angry: '#f87171',
  excited: '#fb923c', content: '#34d399', default: '#94a3b8'
};

const EMOTION_EMOJIS = {
  calm: '😌', peaceful: '🕊️', joyful: '😄', happy: '😊',
  grateful: '🙏', anxious: '😰', sad: '😢', focused: '🎯',
  angry: '😠', excited: '🤩', content: '😇', default: '💭'
};

const ec = e => EMOTION_COLORS[e?.toLowerCase()] || EMOTION_COLORS.default;
const ee = e => EMOTION_EMOJIS[e?.toLowerCase()] || EMOTION_EMOJIS.default;

const css = {
  app: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a0f0a 0%, #0d1a0e 50%, #0a0f0a 100%)', color: '#e2e8f0', fontFamily: "'Inter', system-ui, sans-serif" },
  container: { maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' },
  authWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a0f0a 0%, #0d1a0e 50%, #0a0f0a 100%)' },
  authCard: { background: '#111a11', border: '1px solid #1e3a1e', borderRadius: 20, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 25px 60px #00000088' },
  authTitle: { fontSize: 28, fontWeight: 800, color: '#4ade80', textAlign: 'center', marginBottom: 6, letterSpacing: '-0.5px' },
  authSub: { fontSize: 13, color: '#4b6b4b', textAlign: 'center', marginBottom: 28 },
  authTabs: { display: 'flex', background: '#0a0f0a', borderRadius: 10, padding: 4, marginBottom: 24 },
  authTab: active => ({ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: active ? '#16a34a' : 'transparent', color: active ? '#fff' : '#4b6b4b', transition: 'all 0.2s' }),
  header: { padding: '20px 0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e3a1e', marginBottom: 24 },
  logo: { fontSize: 22, fontWeight: 800, color: '#4ade80', letterSpacing: '-0.5px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #4ade80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#0a0f0a' },
  nav: { display: 'flex', gap: 4, marginBottom: 28, background: '#111a11', borderRadius: 12, padding: 4, border: '1px solid #1e3a1e' },
  navBtn: active => ({ flex: 1, padding: '10px 8px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: active ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'transparent', color: active ? '#fff' : '#4b6b4b', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }),
  card: { background: '#111a11', border: '1px solid #1e3a1e', borderRadius: 16, padding: 22, marginBottom: 16 },
  cardGlow: { background: '#111a11', border: '1px solid #16a34a44', borderRadius: 16, padding: 22, marginBottom: 16, boxShadow: '0 0 20px #16a34a11' },
  label: { fontSize: 12, color: '#4b6b4b', display: 'block', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { background: '#0a0f0a', border: '1px solid #1e3a1e', borderRadius: 10, color: '#e2e8f0', padding: '11px 14px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  textarea: { background: '#0a0f0a', border: '1px solid #1e3a1e', borderRadius: 10, color: '#e2e8f0', padding: '12px 14px', fontSize: 14, resize: 'vertical', width: '100%', minHeight: 120, outline: 'none', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box' },
  select: { background: '#0a0f0a', border: '1px solid #1e3a1e', borderRadius: 10, color: '#e2e8f0', padding: '11px 14px', fontSize: 14, width: 'auto', minWidth: 140, outline: 'none', cursor: 'pointer' },
  btn: { background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  btnSm: { background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  btnGhost: { background: 'transparent', color: '#4ade80', border: '1px solid #1e3a1e', borderRadius: 10, padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  btnDanger: { background: '#7f1d1d22', color: '#f87171', border: '1px solid #991b1b44', borderRadius: 8, padding: '6px 12px', fontWeight: 600, cursor: 'pointer', fontSize: 12 },
  btnLogout: { background: 'transparent', color: '#4b6b4b', border: '1px solid #1e3a1e', borderRadius: 8, padding: '7px 14px', fontWeight: 600, cursor: 'pointer', fontSize: 13 },
  tag: { display: 'inline-block', background: '#0a1a0a', border: '1px solid #1e3a1e', borderRadius: 20, padding: '3px 10px', fontSize: 12, color: '#4b6b4b', margin: '2px' },
  emotionBadge: emotion => ({ display: 'inline-flex', alignItems: 'center', gap: 4, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, background: `${ec(emotion)}18`, color: ec(emotion), border: `1px solid ${ec(emotion)}33` }),
  error: { background: '#7f1d1d22', border: '1px solid #991b1b', borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 14 },
  summaryBox: { background: '#0a1a0a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#86efac', marginTop: 10, fontStyle: 'italic', borderLeft: '3px solid #16a34a' },
  streamBox: { background: '#0a0f0a', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#4b6b4b', marginTop: 10, fontFamily: 'monospace', minHeight: 44, whiteSpace: 'pre-wrap', border: '1px solid #1e3a1e' },
  rowBetween: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  row: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
  statBox: color => ({ background: '#0a1a0a', borderRadius: 14, padding: '18px 16px', border: `1px solid ${color}22`, textAlign: 'center' }),
  statVal: color => ({ fontSize: 30, fontWeight: 800, color }),
  statLabel: { fontSize: 11, color: '#4b6b4b', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' },
  overlay: { position: 'fixed', inset: 0, background: '#00000099', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' },
  modal: { background: '#111a11', border: '1px solid #1e3a1e', borderRadius: 18, padding: 32, maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 25px 60px #000000aa' },
  ambienceGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 },
  ambienceBtn: selected => ({ background: selected ? '#16a34a22' : '#0a0f0a', border: `1px solid ${selected ? '#16a34a' : '#1e3a1e'}`, borderRadius: 10, padding: '10px 8px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', color: selected ? '#4ade80' : '#4b6b4b' }),
  searchWrap: { position: 'relative', flex: 1 },
  searchInput: { background: '#0a0f0a', border: '1px solid #1e3a1e', borderRadius: 10, color: '#e2e8f0', padding: '10px 14px 10px 36px', fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4b6b4b', fontSize: 14, pointerEvents: 'none' },
  chartRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
  chartBar: (color, pct) => ({ height: 8, borderRadius: 4, background: color, width: `${pct}%`, transition: 'width 0.6s ease', minWidth: 4 }),
};

async function apiFetch(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || `HTTP ${res.status}`); }
  return res.json();
}

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '', displayName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await apiFetch(`${AUTH_API}/login`, {
          method: 'POST',
          body: JSON.stringify({ username: form.username, password: form.password })
        });
        localStorage.setItem('journalUser', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        const data = await apiFetch(`${AUTH_API}/register`, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        localStorage.setItem('journalUser', JSON.stringify(data.user));
        onLogin(data.user);
      }
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={css.authWrap}>
      <div style={css.authCard}>
        <div style={css.authTitle}>📓 Nature Journal</div>
        <div style={css.authSub}>AI-powered emotion analysis for your wellness journey</div>

        <div style={css.authTabs}>
          <button style={css.authTab(mode === 'login')} onClick={() => { setMode('login'); setError(null); }}>Sign In</button>
          <button style={css.authTab(mode === 'register')} onClick={() => { setMode('register'); setError(null); }}>Create Account</button>
        </div>

        {error && <div style={css.error}>⚠️ {error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div>
              <label style={css.label}>Display Name</label>
              <input style={css.input} placeholder="How should we call you?" value={form.displayName}
                onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))} />
            </div>
          )}
          <div>
            <label style={css.label}>Username</label>
            <input style={css.input} placeholder="Enter username" value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div>
            <label style={css.label}>Password</label>
            <input style={css.input} type="password" placeholder="Enter password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <button style={{ ...css.btn, width: '100%', marginTop: 4, opacity: loading ? 0.6 : 1 }}
            onClick={submit} disabled={loading}>
            {loading ? '⏳ Please wait...' : mode === 'login' ? '🌿 Sign In' : '🌱 Create Account'}
          </button>
        </div>

        <div style={{ fontSize: 12, color: '#4b6b4b', textAlign: 'center', marginTop: 20 }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={{ color: '#4ade80', cursor: 'pointer' }}
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('journalUser')); } catch { return null; }
  });
  const [tab, setTab] = useState('write');
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [ambience, setAmbience] = useState('forest');
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [filterEmotion, setFilterEmotion] = useState('');
  const [analyzeText, setAnalyzeText] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [streamOutput, setStreamOutput] = useState('');
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedEntry, setExpandedEntry] = useState(null);

  const setLoad = (k, v) => setLoading(p => ({ ...p, [k]: v }));

  const loadEntries = useCallback(async () => {
    if (!user) return;
    setLoad('entries', true);
    try { const d = await apiFetch(`${API}/${user.id}`); setEntries(d.entries || []); }
    catch (e) { setError(e.message); }
    finally { setLoad('entries', false); }
  }, [user]);

  const loadInsights = useCallback(async () => {
    if (!user) return;
    setLoad('insights', true);
    try { const d = await apiFetch(`${API}/insights/${user.id}`); setInsights(d); }
    catch (e) { setError(e.message); }
    finally { setLoad('insights', false); }
  }, [user]);

  useEffect(() => {
    if (tab === 'entries') loadEntries();
    if (tab === 'insights') loadInsights();
  }, [tab, loadEntries, loadInsights]);

  function logout() {
    localStorage.removeItem('journalUser');
    setUser(null);
    setEntries([]);
    setInsights(null);
    setTab('write');
  }

  async function submitEntry() {
    if (!text.trim()) return setError('Please write something first.');
    setError(null); setLoad('submit', true);
    try {
      await apiFetch(API, { method: 'POST', body: JSON.stringify({ userId: user.id, ambience, text }) });
      setText('');
      setTab('entries');
    } catch (e) { setError(e.message); }
    finally { setLoad('submit', false); }
  }

  async function deleteEntry(id) {
    setConfirmDelete(null);
    setLoad(`del_${id}`, true);
    try {
      await apiFetch(`${API}/${id}`, { method: 'DELETE' });
      setEntries(p => p.filter(e => e.id !== id));
    } catch (e) { setError(e.message); }
    finally { setLoad(`del_${id}`, false); }
  }

  async function analyzeEntry(id) {
    setError(null); setLoad(`ana_${id}`, true);
    try {
      const d = await apiFetch(`${API}/analyze-entry/${id}`, { method: 'POST' });
      setEntries(p => p.map(e => e.id === id
        ? { ...e, emotion: d.emotion, keywords: d.keywords, summary: d.summary, analyzed: 1 } : e));
    } catch (e) { setError(e.message); }
    finally { setLoad(`ana_${id}`, false); }
  }

  async function runAnalyze(stream = false) {
    if (!analyzeText.trim()) return setError('Please enter text to analyze.');
    setError(null); setAnalyzeResult(null); setStreamOutput('');
    if (stream) {
      setLoad('stream', true);
      try {
        const res = await fetch(`${API}/analyze`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: analyzeText, stream: true })
        });
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = '';
        while (true) {
          const { done, value } = await reader.read(); if (done) break;
          buf += decoder.decode(value);
          const lines = buf.split('\n'); buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const j = JSON.parse(line.slice(6));
              if (j.chunk) setStreamOutput(p => p + j.chunk);
              if (j.done) setAnalyzeResult(j.result);
            } catch {}
          }
        }
      } catch (e) { setError(e.message); }
      finally { setLoad('stream', false); }
    } else {
      setLoad('analyze', true);
      try {
        const d = await apiFetch(`${API}/analyze`, { method: 'POST', body: JSON.stringify({ text: analyzeText }) });
        setAnalyzeResult(d);
      } catch (e) { setError(e.message); }
      finally { setLoad('analyze', false); }
    }
  }

  if (!user) return <AuthScreen onLogin={setUser} />;

  const filteredEntries = entries.filter(e => {
    const matchSearch = !search || e.text.toLowerCase().includes(search.toLowerCase()) || e.ambience.toLowerCase().includes(search.toLowerCase());
    const matchEmotion = !filterEmotion || e.emotion === filterEmotion;
    return matchSearch && matchEmotion;
  });

  const uniqueEmotions = [...new Set(entries.map(e => e.emotion).filter(Boolean))];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const tabs = [
    { id: 'write', label: 'Write', icon: '✍️' },
    { id: 'entries', label: 'Entries', icon: '📖' },
    { id: 'analyze', label: 'Analyze', icon: '🔍' },
    { id: 'insights', label: 'Insights', icon: '📊' },
  ];

  return (
    <div style={css.app}>
      {confirmDelete && (
        <div style={css.overlay}>
          <div style={css.modal}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>Delete this entry?</div>
            <div style={{ fontSize: 13, color: '#4b6b4b', marginBottom: 24 }}>This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button style={css.btnGhost} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={{ ...css.btn, background: '#dc2626' }} onClick={() => deleteEntry(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div style={css.container}>
        <div style={css.header}>
          <div style={css.logo}>📓 Nature Journal</div>
          <div style={css.userBadge}>
            <div style={css.avatar}>{(user.displayName || user.username)[0].toUpperCase()}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{user.displayName || user.username}</div>
              <div style={{ fontSize: 11, color: '#4b6b4b' }}>@{user.username}</div>
            </div>
            <button style={css.btnLogout} onClick={logout}>Sign out</button>
          </div>
        </div>

        {error && (
          <div style={css.error}>
            ⚠️ {error}
            <span style={{ float: 'right', cursor: 'pointer' }} onClick={() => setError(null)}>✕</span>
          </div>
        )}

        <div style={css.nav}>
          {tabs.map(t => (
            <button key={t.id} style={css.navBtn(tab === t.id)}
              onClick={() => { setTab(t.id); setError(null); }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {tab === 'write' && (
          <div style={css.card}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>
              Good {greeting}, {user.displayName || user.username} 🌿
            </div>
            <div style={{ fontSize: 13, color: '#4b6b4b', marginBottom: 20 }}>
              How are you feeling today? Write freely and let AI understand your emotions.
            </div>

            <label style={css.label}>Choose your ambience</label>
            <div style={css.ambienceGrid}>
              {AMBIENCES.map(a => (
                <button key={a.value} style={css.ambienceBtn(ambience === a.value)} onClick={() => setAmbience(a.value)}>
                  <div style={{ fontSize: 22 }}>{a.emoji}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>{a.label}</div>
                </button>
              ))}
            </div>

            <label style={css.label}>Your journal entry</label>
            <textarea style={css.textarea}
              placeholder="Write about your nature experience, feelings, thoughts..."
              value={text} onChange={e => setText(e.target.value)} />
            <div style={{ ...css.rowBetween, marginTop: 6, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: text.length > 4500 ? '#f87171' : '#4b6b4b' }}>
                {text.length} / 5000 characters
              </span>
              {text.length > 0 && (
                <span style={{ fontSize: 12, color: '#4b6b4b' }}>
                  ~{Math.ceil(text.split(' ').filter(Boolean).length / 200) || 1} min read
                </span>
              )}
            </div>

            <div style={css.row}>
              <button style={{ ...css.btn, opacity: loading.submit ? 0.6 : 1 }}
                onClick={submitEntry} disabled={loading.submit}>
                {loading.submit ? '⏳ Saving...' : '💾 Save Entry'}
              </button>
              {text.length > 0 && (
                <button style={css.btnGhost} onClick={() => setText('')}>Clear</button>
              )}
            </div>
          </div>
        )}

        {tab === 'entries' && (
          <div>
            <div style={{ ...css.rowBetween, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>
                {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'}
              </div>
              <button style={{ ...css.btnGhost, opacity: loading.entries ? 0.6 : 1 }}
                onClick={loadEntries} disabled={loading.entries}>
                {loading.entries ? '⏳' : '↻'} Refresh
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <div style={css.searchWrap}>
                <span style={css.searchIcon}>🔍</span>
                <input style={css.searchInput} placeholder="Search entries..." value={search}
                  onChange={e => setSearch(e.target.value)} />
              </div>
              {uniqueEmotions.length > 0 && (
                <select style={css.select} value={filterEmotion} onChange={e => setFilterEmotion(e.target.value)}>
                  <option value="">All emotions</option>
                  {uniqueEmotions.map(em => <option key={em} value={em}>{ee(em)} {em}</option>)}
                </select>
              )}
            </div>

            {loading.entries && entries.length === 0 && (
              <div style={{ color: '#4b6b4b', textAlign: 'center', padding: 40 }}>Loading entries...</div>
            )}
            {!loading.entries && filteredEntries.length === 0 && (
              <div style={{ ...css.card, textAlign: 'center', color: '#4b6b4b', padding: 40 }}>
                {entries.length === 0 ? '🌱 No entries yet. Write your first journal entry!' : '🔍 No entries match your search.'}
              </div>
            )}

            {filteredEntries.map(entry => (
              <div key={entry.id} style={css.card}>
                <div style={css.rowBetween}>
                  <div style={css.row}>
                    <span style={{ fontSize: 18 }}>{AMBIENCES.find(a => a.value === entry.ambience)?.emoji || '🌿'}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>{entry.ambience}</span>
                    {entry.emotion && <span style={css.emotionBadge(entry.emotion)}>{ee(entry.emotion)} {entry.emotion}</span>}
                  </div>
                  <div style={css.row}>
                    <span style={{ fontSize: 12, color: '#4b6b4b' }}>
                      {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <button style={css.btnDanger} onClick={() => setConfirmDelete(entry.id)}>🗑️ Delete</button>
                  </div>
                </div>

                <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: '12px 0', cursor: entry.text.length > 160 ? 'pointer' : 'default' }}
                  onClick={() => entry.text.length > 160 && setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}>
                  {expandedEntry === entry.id ? entry.text : entry.text.length > 160 ? entry.text.slice(0, 160) + '...' : entry.text}
                  {entry.text.length > 160 && (
                    <span style={{ color: '#4ade80', fontSize: 12, marginLeft: 6 }}>
                      {expandedEntry === entry.id ? ' Show less' : ' Read more'}
                    </span>
                  )}
                </div>

                {entry.summary && <div style={css.summaryBox}>💬 {entry.summary}</div>}
                {entry.keywords?.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    {entry.keywords.map(k => <span key={k} style={css.tag}>{k}</span>)}
                  </div>
                )}

                {!entry.analyzed && (
                  <button style={{ ...css.btnSm, marginTop: 12, opacity: loading[`ana_${entry.id}`] ? 0.6 : 1 }}
                    onClick={() => analyzeEntry(entry.id)} disabled={loading[`ana_${entry.id}`]}>
                    {loading[`ana_${entry.id}`] ? '⏳ Analyzing...' : '🔍 Analyze Emotion'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'analyze' && (
          <div style={css.card}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}>Quick Emotion Analysis</div>
            <div style={{ fontSize: 13, color: '#4b6b4b', marginBottom: 16 }}>
              Paste any text to instantly analyze its emotional content.
            </div>
            <label style={css.label}>Text to analyze</label>
            <textarea style={{ ...css.textarea, minHeight: 140 }}
              placeholder="Paste journal text, messages, or any text here..."
              value={analyzeText} onChange={e => setAnalyzeText(e.target.value)} />
            <div style={{ ...css.row, marginTop: 14 }}>
              <button style={{ ...css.btn, opacity: loading.analyze ? 0.6 : 1 }}
                onClick={() => runAnalyze(false)} disabled={loading.analyze || loading.stream}>
                {loading.analyze ? '⏳ Analyzing...' : '🔍 Analyze'}
              </button>
              <button style={{ ...css.btnGhost, opacity: loading.stream ? 0.6 : 1 }}
                onClick={() => runAnalyze(true)} disabled={loading.analyze || loading.stream}>
                {loading.stream ? '⏳ Streaming...' : '⚡ Stream'}
              </button>
              {analyzeText && (
                <button style={css.btnGhost} onClick={() => { setAnalyzeText(''); setAnalyzeResult(null); setStreamOutput(''); }}>
                  Clear
                </button>
              )}
            </div>

            {streamOutput && (
              <>
                <div style={{ fontSize: 12, color: '#4b6b4b', marginTop: 14, marginBottom: 4 }}>Live output:</div>
                <div style={css.streamBox}>{streamOutput}</div>
              </>
            )}

            {analyzeResult && (
              <div style={{ ...css.cardGlow, marginTop: 16 }}>
                <div style={{ ...css.row, marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 700 }}>Result</span>
                  <span style={css.emotionBadge(analyzeResult.emotion)}>{ee(analyzeResult.emotion)} {analyzeResult.emotion}</span>
                  {analyzeResult.cached && <span style={{ ...css.tag, color: '#4ade80', borderColor: '#4ade8044' }}>⚡ cached</span>}
                </div>
                <div style={css.summaryBox}>{analyzeResult.summary}</div>
                <div style={{ marginTop: 10 }}>{analyzeResult.keywords?.map(k => <span key={k} style={css.tag}>{k}</span>)}</div>
              </div>
            )}
          </div>
        )}

        {tab === 'insights' && (
          <div>
            <div style={{ ...css.rowBetween, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#4ade80' }}>Your Insights</div>
              <button style={{ ...css.btnGhost, opacity: loading.insights ? 0.6 : 1 }}
                onClick={loadInsights} disabled={loading.insights}>
                {loading.insights ? '⏳' : '↻'} Refresh
              </button>
            </div>

            {loading.insights && (
              <div style={{ color: '#4b6b4b', textAlign: 'center', padding: 40 }}>Loading insights...</div>
            )}

            {insights && !loading.insights && (
              <>
                <div style={css.statGrid}>
                  <div style={css.statBox('#4ade80')}>
                    <div style={css.statVal('#4ade80')}>{insights.totalEntries}</div>
                    <div style={css.statLabel}>Total Entries</div>
                  </div>
                  <div style={css.statBox('#fbbf24')}>
                    <div style={{ fontSize: 22 }}>{insights.streak > 0 ? '🔥' : '💤'}</div>
                    <div style={css.statVal('#fbbf24')}>{insights.streak}</div>
                    <div style={css.statLabel}>Day Streak</div>
                  </div>
                  <div style={css.statBox(ec(insights.topEmotion))}>
                    <div style={{ fontSize: 22 }}>{ee(insights.topEmotion)}</div>
                    <div style={css.statVal(ec(insights.topEmotion))}>{insights.topEmotion || '—'}</div>
                    <div style={css.statLabel}>Top Emotion</div>
                  </div>
                </div>

                {Object.keys(insights.emotionDistribution || {}).length > 0 && (
                  <div style={{ ...css.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 14 }}>Emotion Distribution</div>
                    {Object.entries(insights.emotionDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([emotion, count]) => {
                        const max = Math.max(...Object.values(insights.emotionDistribution));
                        return (
                          <div key={emotion} style={css.chartRow}>
                            <span style={{ width: 90, fontSize: 12, color: '#4b6b4b', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {ee(emotion)} {emotion}
                            </span>
                            <div style={{ flex: 1, background: '#0a0f0a', borderRadius: 4, height: 8 }}>
                              <div style={css.chartBar(ec(emotion), (count / max) * 100)} />
                            </div>
                            <span style={{ width: 24, fontSize: 12, color: '#4b6b4b', textAlign: 'right' }}>{count}</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {Object.keys(insights.ambienceDistribution || {}).length > 0 && (
                  <div style={{ ...css.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 14 }}>Favourite Ambiences</div>
                    {Object.entries(insights.ambienceDistribution)
                      .sort((a, b) => b[1] - a[1])
                      .map(([amb, count]) => {
                        const max = Math.max(...Object.values(insights.ambienceDistribution));
                        const ambObj = AMBIENCES.find(a => a.value === amb);
                        return (
                          <div key={amb} style={css.chartRow}>
                            <span style={{ width: 100, fontSize: 12, color: '#4b6b4b', display: 'flex', alignItems: 'center', gap: 4 }}>
                              {ambObj?.emoji} {amb}
                            </span>
                            <div style={{ flex: 1, background: '#0a0f0a', borderRadius: 4, height: 8 }}>
                              <div style={css.chartBar('#4ade80', (count / max) * 100)} />
                            </div>
                            <span style={{ width: 24, fontSize: 12, color: '#4b6b4b', textAlign: 'right' }}>{count}</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                {insights.emotionHistory?.length > 0 && (
                  <div style={{ ...css.card, marginBottom: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 14 }}>Recent Mood Timeline</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {insights.emotionHistory.map((h, i) => (
                        <div key={i}
                          title={`${h.date}: ${h.emotion || 'unanalyzed'} (${h.ambience})`}
                          style={{ width: 36, height: 36, borderRadius: 10, background: h.emotion ? `${ec(h.emotion)}22` : '#0a0f0a', border: `1px solid ${h.emotion ? ec(h.emotion) + '44' : '#1e3a1e'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, cursor: 'default' }}>
                          {h.emotion ? ee(h.emotion) : '·'}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: '#4b6b4b', marginTop: 10 }}>
                      Hover over each dot to see details · Oldest → newest
                    </div>
                  </div>
                )}

                {insights.recentKeywords?.length > 0 && (
                  <div style={css.card}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', marginBottom: 10 }}>Recent Keywords</div>
                    <div>
                      {insights.recentKeywords.map(k => (
                        <span key={k} style={{ ...css.tag, fontSize: 13, padding: '5px 12px' }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {insights.cached && (
                  <div style={{ fontSize: 11, color: '#4b6b4b', textAlign: 'right', marginTop: 8 }}>⚡ served from cache</div>
                )}
              </>
            )}

            {insights && !loading.insights && insights.totalEntries === 0 && (
              <div style={{ ...css.card, textAlign: 'center', color: '#4b6b4b', padding: 40 }}>
                🌱 No data yet. Start writing journal entries to see your insights!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}