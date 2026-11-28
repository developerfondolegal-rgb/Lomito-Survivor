// v0.42: música de fondo de los mapas (por ahora solo La Plaza) y botón de silencio.
//
// - El archivo se carga en el preload de BienvenidaScene con cargarMusica(escena).
// - GameScene llama a musicaDeMapa(escena, mapaId) al empezar la partida y
//   pararMusica() al perder, ganar o salir (la escena se apaga).
// - La pausa (src/pausa.js) llama a musicaEnPausa(true/false): baja a la mitad.
// - botonMusica(escena, x, y) dibuja el parlante (HUD y menú) y guarda la
//   preferencia en localStorage ('lomito_musica_on').
// - Siempre hay como mucho UNA copia sonando (MUSICA.sonido). Las que se están
//   apagando con fade se cortan de inmediato si empieza otra.
// - Si el archivo no carga (o el navegador no deja sonar), el juego sigue igual, sin música.
// - Abierto con doble clic (file://) el navegador no deja cargar el audio con
//   Phaser (Web Audio), así que se usa un <audio> normal.

const MUSICA_CFG = {
  VOLUMEN: 0.5,          // volumen normal
  FACTOR_PAUSA: 0.5,     // en pausa suena a la mitad
  FADE_MS: 500,          // fade out al parar
  ARCHIVO: 'assets/audio/plaza_tema.ogg',
  CLAVE_GUARDADO: 'lomito_musica_on',
  POR_MAPA: { plaza: 'musica_plaza' } // mapa -> clave de la música
};

const MUSICA = {
  game: null,
  sonido: null,        // la copia que está sonando ahora (envoltorio, ver crearSonido)
  apagandose: [],      // copias haciendo fade out
  deseada: null,       // clave que debería sonar en este momento (null = ninguna)
  enPausa: false,
  fallo: false,        // el archivo no cargó: no se vuelve a intentar
  activada: leerMusicaActivada()
};

function leerMusicaActivada() {
  try { return localStorage.getItem(MUSICA_CFG.CLAVE_GUARDADO) !== '0'; } catch (e) { return true; }
}

function musicaPorArchivoLocal() {
  return window.location.protocol === 'file:';
}

// Se llama en el preload de la primera escena
function cargarMusica(escena) {
  MUSICA.game = escena.game;
  if (musicaPorArchivoLocal() || !escena.sound || escena.sound.noAudio) return;
  escena.load.on('loaderror', (archivo) => {
    if (archivo && archivo.key === 'musica_plaza') MUSICA.fallo = true;
  });
  escena.load.audio('musica_plaza', MUSICA_CFG.ARCHIVO + '?v=' + VERSION_JUEGO);
}

// Crea una copia de la música con la misma forma para Phaser y para <audio>:
// { play(), setVolumen(v), destruir() }
function crearSonido(clave) {
  const game = MUSICA.game;
  if (MUSICA.fallo || !game) return null;
  try {
    if (!musicaPorArchivoLocal()) {
      if (!game.cache.audio.exists(clave)) return null;
      const s = game.sound.add(clave, { loop: true, volume: 0 });
      return {
        play: () => s.play(),
        setVolumen: (v) => { if (s.setVolume) s.setVolume(v); },
        destruir: () => { try { s.stop(); s.destroy(); } catch (e) { /* ya no existe */ } }
      };
    }
    // Doble clic (file://): <audio> normal
    const a = new Audio(MUSICA_CFG.ARCHIVO);
    a.loop = true;
    a.volume = 0;
    a.addEventListener('error', () => { MUSICA.fallo = true; }, { once: true });
    return {
      play: () => {
        const p = a.play();
        // El navegador no deja sonar hasta el primer toque: se reintenta ahí
        if (p && p.catch) p.catch(() => esperarToque(() => { if (MUSICA.sonido && MUSICA.sonido.audio === a) a.play().catch(() => {}); }));
      },
      setVolumen: (v) => { a.volume = Math.max(0, Math.min(1, v)); },
      destruir: () => { a.pause(); a.removeAttribute('src'); a.load(); },
      audio: a
    };
  } catch (e) {
    return null;
  }
}

// Llama a fn en el primer toque, clic o tecla
function esperarToque(fn) {
  const eventos = ['pointerdown', 'touchend', 'keydown'];
  const una = () => {
    eventos.forEach((ev) => document.removeEventListener(ev, una, true));
    fn();
  };
  eventos.forEach((ev) => document.addEventListener(ev, una, true));
}

function volumenMusica() {
  return MUSICA_CFG.VOLUMEN * (MUSICA.enPausa ? MUSICA_CFG.FACTOR_PAUSA : 1);
}

// Corta de inmediato todo lo que suene (incluye los fades a medias)
function cortarMusica() {
  MUSICA.apagandose.forEach((f) => { clearInterval(f.timer); f.sonido.destruir(); });
  MUSICA.apagandose = [];
  if (MUSICA.sonido) MUSICA.sonido.destruir();
  MUSICA.sonido = null;
}

function empezarMusica(clave) {
  cortarMusica(); // nunca dos copias a la vez
  const s = crearSonido(clave);
  if (!s) return;
  MUSICA.sonido = s;
  const arrancar = () => {
    if (MUSICA.sonido !== s) return; // cambió algo mientras esperaba
    try {
      s.setVolumen(volumenMusica());
      s.play();
      s.setVolumen(volumenMusica());
    } catch (e) { /* sin música */ }
  };
  // Web Audio bloqueado hasta el primer toque: Phaser avisa con 'unlocked'
  const sm = MUSICA.game.sound;
  if (!musicaPorArchivoLocal() && sm.locked) sm.once('unlocked', arrancar);
  else arrancar();
}

// Fade out corto y después se destruye. No bloquea: puede empezar otra música enseguida
function pararMusica(ms) {
  MUSICA.deseada = null;
  MUSICA.enPausa = false;
  const s = MUSICA.sonido;
  if (!s) return;
  MUSICA.sonido = null;
  const dura = ms === undefined ? MUSICA_CFG.FADE_MS : ms;
  const inicio = Date.now();
  const desde = volumenMusica();
  const fade = { sonido: s, timer: null };
  fade.timer = setInterval(() => {
    const t = Math.min(1, (Date.now() - inicio) / Math.max(1, dura));
    try { s.setVolumen(desde * (1 - t)); } catch (e) { /* nada */ }
    if (t >= 1) {
      clearInterval(fade.timer);
      s.destruir();
      MUSICA.apagandose = MUSICA.apagandose.filter((f) => f !== fade);
    }
  }, 25);
  MUSICA.apagandose.push(fade);
}

// Al empezar una partida: suena la música del mapa (o nada si el mapa no tiene)
function musicaDeMapa(escena, mapaId) {
  if (!MUSICA.game) MUSICA.game = escena.game;
  MUSICA.enPausa = false;
  const clave = MUSICA_CFG.POR_MAPA[mapaId] || null;
  MUSICA.deseada = clave;
  cortarMusica();
  if (clave && MUSICA.activada) empezarMusica(clave);
}

// Pausa: baja a la mitad; al reanudar vuelve
function musicaEnPausa(pausada) {
  MUSICA.enPausa = !!pausada;
  if (MUSICA.sonido) MUSICA.sonido.setVolumen(volumenMusica());
}

function cambiarMusicaActivada() {
  MUSICA.activada = !MUSICA.activada;
  try { localStorage.setItem(MUSICA_CFG.CLAVE_GUARDADO, MUSICA.activada ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
  if (!MUSICA.activada) {
    const deseada = MUSICA.deseada;
    const pausa = MUSICA.enPausa;
    pararMusica(200);
    MUSICA.deseada = deseada; // sigue en el mapa: si se vuelve a activar, suena
    MUSICA.enPausa = pausa;
  } else if (MUSICA.deseada) {
    empezarMusica(MUSICA.deseada);
  }
}

// ---------------- Botón del parlante ----------------
// Cuadrito 8 bits con un parlante (con ondas = suena; con X = silencio).
// (x, y) es el centro. Devuelve los objetos para fijarlos al HUD (setScrollFactor / setDepth).
function botonMusica(escena, x, y, lado) {
  const L = lado || 30;
  const g = escena.add.graphics();
  const pintar = (encima) => {
    g.clear();
    marcoPixel(g, x - L / 2, y - L / 2, L, L, encima ? 0xffffff : 0xffd54f, encima ? 0x4a3a2a : 0x2b2333);
    const c = MUSICA.activada ? 0xffe082 : 0x9e9e9e;
    const p = L / 15; // "píxel" del dibujo
    const ox = x - 5 * p;
    const oy = y - 4 * p;
    g.fillStyle(c, 1);
    g.fillRect(ox, oy + 2.5 * p, 2 * p, 3 * p);          // cuerpo
    g.fillRect(ox + 2 * p, oy + 1.5 * p, 1 * p, 5 * p);   // cono
    g.fillRect(ox + 3 * p, oy + 0.5 * p, 1 * p, 7 * p);
    if (MUSICA.activada) { // ondas
      g.fillRect(ox + 5.5 * p, oy + 3 * p, 1 * p, 2 * p);
      g.fillRect(ox + 7 * p, oy + 1.5 * p, 1 * p, 1.5 * p);
      g.fillRect(ox + 7 * p, oy + 5 * p, 1 * p, 1.5 * p);
      g.fillRect(ox + 8 * p, oy + 3 * p, 1 * p, 2 * p);
    } else { // X roja
      g.fillStyle(0xff5252, 1);
      for (let i = 0; i < 4; i++) {
        g.fillRect(ox + 5.5 * p + i * p, oy + 2 * p + i * p, p, p);
        g.fillRect(ox + 8.5 * p - i * p, oy + 2 * p + i * p, p, p);
      }
    }
  };
  pintar(false);
  // Zona un poco más grande que el dibujo para que sea fácil de tocar con el dedo
  const zona = escena.add.zone(x, y, L + 12, L + 12).setInteractive({ useHandCursor: true });
  zona.on('pointerover', () => pintar(true));
  zona.on('pointerout', () => pintar(false));
  zona.on('pointerdown', (pointer, lx, ly, evento) => {
    if (evento && evento.stopPropagation) evento.stopPropagation(); // no cuenta como toque del juego
    cambiarMusicaActivada();
    pintar(!pointer.wasTouch);
  });
  return [g, zona];
}
