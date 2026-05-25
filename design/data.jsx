/* LIFTING — shared data, helpers, icons */

// ───────── Exercise catalog ─────────
const CATALOG = {
  superior: [
    { group: 'Peito', items: [
      { id: 'sup-reto-barra', name: 'Supino reto com barra', kind: 'livre' },
      { id: 'sup-reto-halt',  name: 'Supino reto com halteres', kind: 'livre' },
      { id: 'sup-maq-art',    name: 'Supino na máquina articulada', kind: 'máquina' },
      { id: 'sup-incl-barra', name: 'Supino inclinado com barra', kind: 'livre' },
      { id: 'sup-incl-halt',  name: 'Supino inclinado com halteres', kind: 'livre' },
      { id: 'sup-decl',       name: 'Supino declinado', kind: 'livre' },
      { id: 'cruc-halt',      name: 'Crucifixo reto com halteres', kind: 'livre' },
      { id: 'cruc-incl',      name: 'Crucifixo inclinado', kind: 'livre' },
      { id: 'cruc-cabo-uni',  name: 'Crucifixo no cabo unilateral', kind: 'cabo' },
      { id: 'peck-deck',      name: 'Peck deck / voador', kind: 'máquina' },
    ]},
    { group: 'Costas', items: [
      { id: 'pux-frente',     name: 'Puxada frontal', kind: 'cabo' },
      { id: 'rem-curv',       name: 'Remada curvada com barra', kind: 'livre' },
      { id: 'rem-halt',       name: 'Remada unilateral com halter', kind: 'livre' },
      { id: 'rem-cavalinho',  name: 'Remada cavalinho', kind: 'livre' },
      { id: 'pull-down',      name: 'Pulldown com triângulo', kind: 'cabo' },
      { id: 'barra-fix',      name: 'Barra fixa', kind: 'peso corporal' },
    ]},
    { group: 'Ombro', items: [
      { id: 'desenvolv-halt', name: 'Desenvolvimento com halteres', kind: 'livre' },
      { id: 'desenvolv-maq',  name: 'Desenvolvimento na máquina', kind: 'máquina' },
      { id: 'elev-lat',       name: 'Elevação lateral', kind: 'livre' },
      { id: 'elev-front',     name: 'Elevação frontal', kind: 'livre' },
      { id: 'face-pull',      name: 'Face pull', kind: 'cabo' },
    ]},
    { group: 'Bíceps', items: [
      { id: 'rosca-direta',   name: 'Rosca direta com barra', kind: 'livre' },
      { id: 'rosca-alt',      name: 'Rosca alternada', kind: 'livre' },
      { id: 'rosca-martelo',  name: 'Rosca martelo', kind: 'livre' },
      { id: 'rosca-scott',    name: 'Rosca scott', kind: 'máquina' },
    ]},
    { group: 'Tríceps', items: [
      { id: 'tri-corda',      name: 'Tríceps na corda', kind: 'cabo' },
      { id: 'tri-testa',      name: 'Tríceps testa', kind: 'livre' },
      { id: 'tri-frances',    name: 'Tríceps francês', kind: 'livre' },
      { id: 'mergulho',       name: 'Mergulho no banco', kind: 'peso corporal' },
    ]},
  ],
  inferior: [
    { group: 'Quadríceps', items: [
      { id: 'agacha-livre',   name: 'Agachamento livre', kind: 'livre' },
      { id: 'leg-press',      name: 'Leg press 45°', kind: 'máquina' },
      { id: 'cad-ext',        name: 'Cadeira extensora', kind: 'máquina' },
      { id: 'hack',           name: 'Agachamento hack', kind: 'máquina' },
    ]},
    { group: 'Posterior de coxa', items: [
      { id: 'st-rom',         name: 'Stiff', kind: 'livre' },
      { id: 'mesa-flex',      name: 'Mesa flexora', kind: 'máquina' },
      { id: 'cad-flex',       name: 'Cadeira flexora', kind: 'máquina' },
    ]},
    { group: 'Glúteo', items: [
      { id: 'hip-thrust',     name: 'Hip thrust', kind: 'livre' },
      { id: 'gluteo-cabo',    name: 'Glúteo no cabo', kind: 'cabo' },
      { id: 'abducao',        name: 'Cadeira abdutora', kind: 'máquina' },
    ]},
    { group: 'Panturrilha', items: [
      { id: 'pant-pe',        name: 'Panturrilha em pé', kind: 'máquina' },
      { id: 'pant-sent',      name: 'Panturrilha sentado', kind: 'máquina' },
    ]},
  ],
};

const ALL_EXERCISES = (() => {
  const out = {};
  [...CATALOG.superior, ...CATALOG.inferior].forEach(g => g.items.forEach(it => {
    out[it.id] = { ...it, group: g.group };
  }));
  return out;
})();

// ───────── Ficha colors ─────────
const FICHA_COLORS = {
  lime:    { name: 'Lime',    bg: '#CDFF00', soft: 'rgba(205,255,0,0.14)', line: 'rgba(205,255,0,0.32)', ink: '#0a0a0a' },
  coral:   { name: 'Coral',   bg: '#ff6b5b', soft: 'rgba(255,107,91,0.14)', line: 'rgba(255,107,91,0.32)', ink: '#0a0a0a' },
  sky:     { name: 'Sky',     bg: '#7ec4ff', soft: 'rgba(126,196,255,0.14)', line: 'rgba(126,196,255,0.32)', ink: '#0a0a0a' },
  amber:   { name: 'Amber',   bg: '#f5c451', soft: 'rgba(245,196,81,0.14)', line: 'rgba(245,196,81,0.32)', ink: '#0a0a0a' },
  violet:  { name: 'Violet',  bg: '#c79bff', soft: 'rgba(199,155,255,0.14)', line: 'rgba(199,155,255,0.32)', ink: '#0a0a0a' },
  mint:    { name: 'Mint',    bg: '#6bd49a', soft: 'rgba(107,212,154,0.14)', line: 'rgba(107,212,154,0.32)', ink: '#0a0a0a' },
};

// ───────── Seed fichas ─────────
const SEED_FICHAS = [
  {
    id: 'a',
    title: 'Peito + Tríceps',
    desc: 'Push pesado, foco em supino.',
    color: 'lime',
    lastUsed: Date.now() - 1000 * 60 * 60 * 24 * 2,
    exercises: ['sup-reto-barra', 'sup-incl-halt', 'sup-decl', 'cruc-cabo-uni', 'tri-corda', 'tri-testa'],
  },
  {
    id: 'b',
    title: 'Costas + Bíceps',
    desc: 'Volume alto na puxada.',
    color: 'sky',
    lastUsed: Date.now() - 1000 * 60 * 60 * 24 * 5,
    exercises: ['barra-fix', 'rem-curv', 'pux-frente', 'rem-halt', 'rosca-direta', 'rosca-martelo'],
  },
  {
    id: 'c',
    title: 'Perna pesada',
    desc: 'Agachamento + posterior.',
    color: 'coral',
    lastUsed: Date.now() - 1000 * 60 * 60 * 24 * 8,
    exercises: ['agacha-livre', 'leg-press', 'st-rom', 'mesa-flex', 'cad-ext', 'pant-pe'],
  },
  {
    id: 'd',
    title: 'Ombro + Abs',
    desc: 'Volume médio, rápido.',
    color: 'violet',
    lastUsed: Date.now() - 1000 * 60 * 60 * 24 * 12,
    exercises: ['desenvolv-halt', 'elev-lat', 'elev-front', 'face-pull'],
  },
];

// ───────── Seed PR / progress data ─────────
const PR_HISTORY = {
  'sup-reto-barra': [
    { date: '14 mar', kg: 62.5 }, { date: '28 mar', kg: 65 }, { date: '11 abr', kg: 67.5 },
    { date: '25 abr', kg: 70 }, { date: '09 mai', kg: 72.5 }, { date: '23 mai', kg: 75 },
  ],
  'agacha-livre': [
    { date: '14 mar', kg: 90 }, { date: '28 mar', kg: 95 }, { date: '11 abr', kg: 100 },
    { date: '25 abr', kg: 102.5 }, { date: '09 mai', kg: 105 }, { date: '23 mai', kg: 110 },
  ],
  'st-rom': [
    { date: '14 mar', kg: 70 }, { date: '28 mar', kg: 75 }, { date: '11 abr', kg: 80 },
    { date: '25 abr', kg: 80 }, { date: '09 mai', kg: 82.5 }, { date: '23 mai', kg: 85 },
  ],
  'rosca-direta': [
    { date: '14 mar', kg: 22.5 }, { date: '28 mar', kg: 25 }, { date: '11 abr', kg: 25 },
    { date: '25 abr', kg: 27.5 }, { date: '09 mai', kg: 27.5 }, { date: '23 mai', kg: 30 },
  ],
};

const WEEK_FREQ = [
  { w: 'S-7', days: 3 }, { w: 'S-6', days: 4 }, { w: 'S-5', days: 4 },
  { w: 'S-4', days: 3 }, { w: 'S-3', days: 5 }, { w: 'S-2', days: 4 },
  { w: 'S-1', days: 4 }, { w: 'Esta', days: 3 },
];

// last 7 days for streak
const STREAK_DAYS = [
  { d: 'S', done: true  },
  { d: 'T', done: false },
  { d: 'Q', done: true  },
  { d: 'Q', done: true  },
  { d: 'S', done: false },
  { d: 'S', done: true  },
  { d: 'D', done: false },
];

// ───────── Helpers ─────────
const fmtAgo = (ts) => {
  const d = Math.floor((Date.now() - ts) / (1000 * 60 * 60 * 24));
  if (d === 0) return 'hoje';
  if (d === 1) return 'ontem';
  if (d < 7) return `há ${d} dias`;
  if (d < 14) return 'há 1 semana';
  return `há ${Math.floor(d / 7)} semanas`;
};

const exerciseById = (id) => ALL_EXERCISES[id] || { id, name: id, group: '—', kind: '—' };

const groupsForFicha = (ficha) => {
  const s = new Set();
  ficha.exercises.forEach(id => s.add(exerciseById(id).group));
  return [...s];
};

// ───────── Icons (lucide-style, hand-written SVG) ─────────
function Icon({ name, size = 18, stroke = 1.6, className = '', style }) {
  const s = size;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', className, style };
  const paths = {
    home:      <><path d="M3 11l9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" /></>,
    list:      <><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
    dumbbell:  <><path d="M6.5 6.5l11 11" /><path d="M3 9l3-3 3 3-3 3z" /><path d="M15 15l3-3 3 3-3 3z" /><path d="M4.5 13.5l1.5 1.5" /><path d="M18 6l1.5 1.5" /></>,
    chart:     <><path d="M4 20V8" /><path d="M10 20V4" /><path d="M16 20v-8" /><path d="M3 20h18" /></>,
    settings:  <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.4 1 .7 1.5.7H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    plus:      <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    check:     <><path d="M5 12l5 5L20 7" /></>,
    x:         <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
    arrow_r:   <><path d="M5 12h14" /><path d="M13 5l7 7-7 7" /></>,
    play:      <><polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" /></>,
    clock:     <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    flame:     <><path d="M12 22c4.4 0 8-3.4 8-7.6 0-3.2-1.8-5.6-4-7.4 0 2.3-1.5 3-2.5 3.5C13 7 12.5 4 9 2c.5 4-3 5.6-3 10 0 4.2 3.6 10 6 10z" /></>,
    trophy:    <><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10v4a5 5 0 0 1-10 0z" /><path d="M17 4h3v2a3 3 0 0 1-3 3" /><path d="M7 4H4v2a3 3 0 0 0 3 3" /></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" /></>,
    edit:      <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    grip:      <><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></>,
    trash:     <><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
    timer:     <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M9 2h6" /></>,
    pause:     <><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /></>,
    bell:      <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    sparkles:  <><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" /><path d="M19 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>,
    log_out:   <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    smartphone:<><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
    monitor:   <><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></>,
    target:    <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></>,
    note:      <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
    chevron_r: <><path d="M9 6l6 6-6 6" /></>,
    chevron_d: <><path d="M6 9l6 6 6-6" /></>,
    chevron_u: <><path d="M18 15l-6-6-6 6" /></>,
    search:    <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
    google:    <><path d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" stroke="none" /><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" stroke="none" /><path d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9z" fill="#FBBC04" stroke="none" /><path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5l3.3 2.6A6 6 0 0 1 12 5.8z" fill="#EA4335" stroke="none" /></>,
    drag:      <><circle cx="8" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="8" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="8" cy="18" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="16" cy="18" r="1.2" fill="currentColor" stroke="none" /></>,
    arrow_l:   <><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></>,
    info:      <><circle cx="12" cy="12" r="9" /><path d="M12 8h.01" /><path d="M11 12h1v4h1" /></>,
    book:      <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5V21h16" /></>,
  };
  return <svg {...common}>{paths[name] || null}</svg>;
}

// ───────── Toast ─────────
const ToastCtx = React.createContext(null);
function ToastHost({ children }) {
  const [items, setItems] = React.useState([]);
  const push = React.useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setItems(x => [...x, { id, ...t }]);
    setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {items.map(it => (
          <div key={it.id} className="anim-rise" style={{
            pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 10,
            background: '#1a1a1a', border: '1px solid var(--border-hi)', borderRadius: 999,
            padding: '10px 16px', fontSize: 13, fontWeight: 500, color: 'var(--fg)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
            borderColor: it.kind === 'pr' ? 'var(--lime-line)' : it.kind === 'error' ? 'var(--coral-line)' : 'var(--border-hi)',
          }}>
            {it.kind === 'pr' && <Icon name="trophy" size={16} style={{ color: 'var(--lime)' }} />}
            {it.kind === 'ok' && <Icon name="check" size={16} style={{ color: 'var(--lime)' }} />}
            {it.kind === 'error' && <Icon name="info" size={16} style={{ color: 'var(--coral)' }} />}
            {it.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx);

// expose
Object.assign(window, {
  CATALOG, ALL_EXERCISES, FICHA_COLORS, SEED_FICHAS, PR_HISTORY, WEEK_FREQ, STREAK_DAYS,
  fmtAgo, exerciseById, groupsForFicha,
  Icon, ToastHost, useToast,
});
