/* LIFTING — main app: routing, state, viewport switching, tweaks */

const DEFAULT_USER = { name: 'Gabriel Gonzaga', plan: 'Casual' };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "lime",
  "compactSidebar": false,
  "showGreeting": true,
  "loginVariant": "centered"
}/*EDITMODE-END*/;

function App() {
  const [viewport, setViewport] = React.useState('desktop');
  const [route, setRoute] = React.useState('login');
  const [fichas, setFichas] = React.useState(SEED_FICHAS);
  const [editing, setEditing] = React.useState(null);
  const [trainingFicha, setTrainingFicha] = React.useState(null);
  const [user] = React.useState(DEFAULT_USER);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const toast = useToast();

  // accent recoloring
  React.useEffect(() => {
    const root = document.documentElement;
    const map = {
      lime:  { bg: '#CDFF00', ink: '#0a0a0a', soft: 'rgba(205,255,0,0.12)', line: 'rgba(205,255,0,0.28)' },
      coral: { bg: '#ff6b5b', ink: '#0a0a0a', soft: 'rgba(255,107,91,0.14)', line: 'rgba(255,107,91,0.3)' },
      sky:   { bg: '#7ec4ff', ink: '#0a0a0a', soft: 'rgba(126,196,255,0.14)', line: 'rgba(126,196,255,0.3)' },
    };
    const c = map[tweaks.accent] || map.lime;
    root.style.setProperty('--lime', c.bg);
    root.style.setProperty('--lime-ink', c.ink);
    root.style.setProperty('--lime-soft', c.soft);
    root.style.setProperty('--lime-line', c.line);
  }, [tweaks.accent]);

  const handleLogin = () => setRoute('home');
  const handleLogout = () => setRoute('login');

  const openEditor = (ficha) => { setEditing(ficha); setRoute('editor'); };
  const newFicha = () => {
    const fresh = {
      id: Math.random().toString(36).slice(2),
      title: 'Nova ficha',
      desc: '',
      color: 'lime',
      lastUsed: Date.now(),
      exercises: [],
    };
    setEditing(fresh);
    setRoute('editor');
  };
  const saveFicha = (next) => {
    setFichas(curr => {
      const exists = curr.some(f => f.id === next.id);
      return exists ? curr.map(f => f.id === next.id ? next : f) : [next, ...curr];
    });
    setRoute('fichas');
  };
  const cancelEdit = () => setRoute('fichas');

  const startTreino = (ficha) => {
    setTrainingFicha(ficha || fichas[0]);
    setRoute('treino');
  };
  const finishTreino = () => {
    if (trainingFicha) {
      setFichas(curr => curr.map(f => f.id === trainingFicha.id ? { ...f, lastUsed: Date.now() } : f));
    }
    setRoute('progresso');
    toast({ kind: 'ok', msg: 'Treino salvo' });
  };

  // ───────── Screen content for app body ─────────
  const isMobile = viewport === 'mobile';
  const showShell = route !== 'login';

  let screen = null;
  if (route === 'login') {
    screen = <LoginScreen onLogin={handleLogin} isMobile={isMobile} />;
  } else if (route === 'home') {
    screen = <HomeScreen
      user={user} fichas={fichas}
      onContinue={() => startTreino(fichas[0])}
      onGoFichas={() => setRoute('fichas')}
      onGoTreino={() => startTreino()}
      onGoProgresso={() => setRoute('progresso')}
      onNewFicha={newFicha}
      isMobile={isMobile}
    />;
  } else if (route === 'fichas') {
    screen = <FichasScreen fichas={fichas} onOpen={openEditor} onNew={newFicha} onTreinar={startTreino} isMobile={isMobile} />;
  } else if (route === 'editor') {
    screen = <EditorScreen ficha={editing} onSave={saveFicha} onCancel={cancelEdit} isMobile={isMobile} />;
  } else if (route === 'treino') {
    screen = trainingFicha
      ? <TreinoScreen ficha={trainingFicha} onFinish={finishTreino} isMobile={isMobile} />
      : <NoActiveTreino fichas={fichas} onStart={startTreino} isMobile={isMobile} />;
  } else if (route === 'progresso') {
    screen = <ProgressoScreen isMobile={isMobile} />;
  }

  // ───────── Headers per-route (mobile) ─────────
  const titlesFor = {
    home:      { title: '', subtitle: '' },
    fichas:    { title: 'Suas fichas', subtitle: 'Abra uma ou crie a próxima rotina.' },
    treino:    { title: '', subtitle: '' },
    progresso: { title: 'Progresso', subtitle: 'Força e frequência, sem ruído.' },
  };
  const headerInfo = titlesFor[route];

  const mobileHeader = (route !== 'home' && route !== 'editor' && route !== 'treino' && headerInfo) ? (
    <MobileHeader
      title={headerInfo.title}
      subtitle={headerInfo.subtitle}
      right={
        route === 'fichas' ? (
          <button className="btn btn-primary btn-sm" onClick={newFicha}>
            <Icon name="plus" size={13} stroke={2.4} />
            Nova
          </button>
        ) : null
      }
    />
  ) : null;

  const desktopHeader = (route !== 'home' && route !== 'editor' && route !== 'treino' && headerInfo) ? (
    <DesktopHeader
      title={headerInfo.title}
      subtitle={headerInfo.subtitle}
      right={
        route === 'fichas' ? (
          <>
            <button className="btn btn-secondary" onClick={() => startTreino()}><Icon name="dumbbell" size={15} />Treinar</button>
            <button className="btn btn-primary" onClick={newFicha}><Icon name="plus" size={15} stroke={2.4} />Nova ficha</button>
          </>
        ) : null
      }
    />
  ) : null;

  // ───────── Tweaks panel ─────────
  const accentColorMap = { '#CDFF00': 'lime', '#ff6b5b': 'coral', '#7ec4ff': 'sky' };
  const accentHexMap = { lime: '#CDFF00', coral: '#ff6b5b', sky: '#7ec4ff' };

  const tweaksPanel = (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Tema" />
      <TweakColor
        label="Cor de ação"
        value={accentHexMap[tweaks.accent] || '#CDFF00'}
        onChange={v => setTweak('accent', accentColorMap[v] || 'lime')}
        options={['#CDFF00', '#ff6b5b', '#7ec4ff']}
      />

      <TweakSection label="Login" />
      <TweakRadio
        label="Layout"
        value={tweaks.loginVariant}
        onChange={v => setTweak('loginVariant', v)}
        options={[
          { value: 'centered', label: 'Centro' },
          { value: 'minimal',  label: 'Limpo' },
        ]}
      />

      <TweakSection label="Navegação" />
      <TweakRadio
        label="Viewport"
        value={viewport}
        onChange={setViewport}
        options={[
          { value: 'desktop', label: 'Desktop' },
          { value: 'mobile',  label: 'Mobile' },
        ]}
      />
      <TweakSelect
        label="Pular para tela"
        value={route}
        onChange={setRoute}
        options={[
          { value: 'login',     label: 'Login' },
          { value: 'home',      label: 'Home' },
          { value: 'fichas',    label: 'Fichas' },
          { value: 'editor',    label: 'Editor de ficha' },
          { value: 'treino',    label: 'Treino' },
          { value: 'progresso', label: 'Progresso' },
        ]}
      />
      <TweakButton label="Resetar dados" onClick={() => { setFichas(SEED_FICHAS); toast({ kind: 'ok', msg: 'Dados resetados' }); }} />
    </TweaksPanel>
  );

  // ───────── Render: split by viewport ─────────
  if (viewport === 'mobile') {
    return (
      <>
        <HostChrome viewport={viewport} setViewport={setViewport} />
        <PhoneStage>
          <PhoneFrame>
            {showShell ? (
              <>
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {mobileHeader}
                  {screen}
                </div>
                <BottomNav route={route === 'editor' ? 'fichas' : route} onRoute={setRoute} />
              </>
            ) : screen}
          </PhoneFrame>
        </PhoneStage>
        {tweaksPanel}
      </>
    );
  }

  return (
    <>
      <HostChrome viewport={viewport} setViewport={setViewport} />
      <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden', background: 'var(--bg)' }}>
        {showShell && <Sidebar route={route === 'editor' ? 'fichas' : route} onRoute={setRoute} user={user} onLogout={handleLogout} />}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          {showShell && desktopHeader}
          {screen}
        </div>
      </div>
      {tweaksPanel}
    </>
  );
}

function PhoneStage({ children }) {
  const stageRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      if (!stageRef.current) return;
      const { width, height } = stageRef.current.getBoundingClientRect();
      const phoneW = 390, phoneH = 800;
      const pad = 32;
      const s = Math.min((width - pad) / phoneW, (height - pad) / phoneH, 1);
      setScale(Math.max(s, 0.5));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={stageRef} style={{
      width: '100%', height: '100%',
      display: 'grid', placeItems: 'center',
      overflow: 'hidden',
      background: 'radial-gradient(900px 700px at 50% 0%, #0f0f0f, #050505)',
    }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        {children}
      </div>
    </div>
  );
}

function NoActiveTreino({ fichas, onStart, isMobile }) {
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
      <EmptyState
        icon="dumbbell"
        title="Escolha uma ficha para treinar."
        body="Selecione uma rotina existente para começar a registrar séries agora."
        action={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
            {fichas.slice(0, 3).map(f => (
              <button key={f.id} className="btn btn-secondary" onClick={() => onStart(f)} style={{ justifyContent: 'space-between' }}>
                <span>{f.title}</span>
                <Icon name="arrow_r" size={14} />
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
}

function HostChrome({ viewport, setViewport }) {
  return (
    <div style={{
      position: 'fixed', bottom: 14, left: 14,
      zIndex: 1000, pointerEvents: 'none',
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <ViewportSwitch viewport={viewport} onChange={setViewport} />
      </div>
    </div>
  );
}

// Mount
const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(
  <ToastHost>
    <App />
  </ToastHost>
);
