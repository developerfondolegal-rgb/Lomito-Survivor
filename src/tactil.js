// ===============================================================
//  CELULAR Y PANTALLA TÁCTIL
//  - Detecta si el dispositivo es táctil (en PC no se activa nada).
//  - Joystick virtual (mitad izquierda) y botones Sprint y Pausa.
//  - Pantalla completa y bloqueo en horizontal (si el navegador deja).
//  - Aviso "Gira el celular" cuando está en vertical (pausa la partida).
//  - Letra mínima legible en celular.
//  Los números están en src/config.js, sección MOVIL.
//  Lo usan src/scenes/GameScene.js y las demás pantallas.
// ===============================================================

// ---------------- ¿Es táctil? ----------------

let MODO_TACTIL = null;

// true si hay que mostrar los controles táctiles
function modoTactil() {
  if (MODO_TACTIL !== null) return MODO_TACTIL;
  let opcion = CONFIG.MOVIL && CONFIG.MOVIL.CONTROLES_TACTILES;
  // Para probar en PC: index.html?tactil=1 (forzar controles táctiles) o ?tactil=0 (quitarlos)
  const pedido = /[?&]tactil=([01])/.exec(window.location.search);
  if (pedido) opcion = pedido[1] === '1';
  if (opcion === true || opcion === false) {
    MODO_TACTIL = opcion;
  } else {
    // Puntero "grueso" (un dedo) o pantalla táctil sin mouse. Un notebook con
    // pantalla táctil y mouse cuenta como PC.
    const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
    const tieneToque = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0;
    MODO_TACTIL = mq('(pointer: coarse)') || (tieneToque && !mq('(hover: hover)'));
  }
  return MODO_TACTIL;
}

// En celular quita las teclas escritas entre corchetes: "Sprint [Espacio]" -> "Sprint"
function sinTeclas(texto) {
  return modoTactil() ? String(texto).replace(/\s*\[[^\]]*\]/g, '') : texto;
}

// Convierte px de la pantalla del celular a px del juego (el juego se achica para caber)
function pxReales(escena, n) {
  const s = escena.scale.displayScale;
  return n * (s && s.x > 0 ? s.x : 1);
}

// Margen (px del juego) entre los bordes de la pantalla y el HUD.
// En PC siempre 12 (igual que antes); en celular MOVIL.MARGEN_HUD.
function margenHUD() {
  return modoTactil() ? ((CONFIG.MOVIL && CONFIG.MOVIL.MARGEN_HUD) || 12) : 12;
}

// Lo que el margen del celular agrega sobre el de PC (0 en PC)
function margenExtra() {
  return Math.max(0, margenHUD() - 12);
}

// ---------------- Altura visible real ----------------
// En celular la barra del navegador tapa parte de la pantalla, y "100%" o
// innerHeight a veces la incluyen. visualViewport da lo que de verdad se ve.
// index.html usa estas medidas para el marco del juego (#marco).
function ajustarAltoVisible() {
  const vv = window.visualViewport;
  const alto = vv ? vv.height : window.innerHeight;
  const arriba = vv ? Math.max(0, vv.offsetTop) : 0;
  const raiz = document.documentElement.style;
  raiz.setProperty('--alto-visible', Math.round(alto) + 'px');
  raiz.setProperty('--arriba-visible', Math.round(arriba) + 'px');
  // Que Phaser vuelva a medir el marco y re-escale el juego
  if (typeof game !== 'undefined' && game.scale) game.scale.refresh();
}

// Al girar o cuando la barra aparece/desaparece, la medida tarda un poco en asentarse
let esperaAjuste = null;
function ajustarAltoVisiblePronto() {
  ajustarAltoVisible();
  clearTimeout(esperaAjuste);
  esperaAjuste = setTimeout(ajustarAltoVisible, 350);
}

ajustarAltoVisible();
window.addEventListener('resize', ajustarAltoVisiblePronto);
window.addEventListener('orientationchange', ajustarAltoVisiblePronto);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', ajustarAltoVisiblePronto);
  window.visualViewport.addEventListener('scroll', ajustarAltoVisiblePronto);
}
document.addEventListener('fullscreenchange', ajustarAltoVisiblePronto);
document.addEventListener('webkitfullscreenchange', ajustarAltoVisiblePronto);

// ---------------- Letra mínima en celular ----------------
// Todos los textos del juego pasan por aquí: si la letra es más chica que
// MOVIL.TEXTO_MINIMO, en celular se agranda a ese tamaño. En PC no cambia nada.
(function letraMinima() {
  const fabrica = Phaser.GameObjects.GameObjectFactory.prototype;
  const original = fabrica.text;
  fabrica.text = function (x, y, texto, estilo) {
    if (estilo && estilo.fontSize && modoTactil()) {
      const minimo = (CONFIG.MOVIL && CONFIG.MOVIL.TEXTO_MINIMO) || 0;
      const tam = parseFloat(estilo.fontSize);
      if (tam < minimo) estilo = { ...estilo, fontSize: minimo + 'px' };
    }
    return original.call(this, x, y, texto, estilo);
  };
})();

// ---------------- Pantalla completa ----------------

function puedePantallaCompleta() {
  const d = document.documentElement;
  return !!(d.requestFullscreen || d.webkitRequestFullscreen);
}

// iPhone / iPod (Safari y Chrome de iPhone usan el mismo motor y no dejan
// poner la página en pantalla completa)
function esIPhone() {
  return /iPhone|iPod/.test(navigator.userAgent || '');
}

// true si el juego se abrió desde el ícono de la pantalla de inicio (ya sin barra)
function esModoApp() {
  const mq = (q) => !!(window.matchMedia && window.matchMedia(q).matches);
  return navigator.standalone === true || mq('(display-mode: fullscreen)') || mq('(display-mode: standalone)');
}

const AVISO_IPHONE = 'En iPhone: Compartir → Agregar a inicio';

function enPantallaCompleta() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

// Intenta bloquear en horizontal (solo funciona en pantalla completa y en algunos navegadores)
function bloquearHorizontal() {
  try {
    if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
  } catch (e) { /* el navegador no deja: no pasa nada */ }
}

// alFallar (opcional) se llama si el navegador no deja (por ejemplo en iPhone)
function pedirPantallaCompleta(alFallar) {
  const fallo = () => { if (alFallar) alFallar(); };
  if (enPantallaCompleta()) return;
  if (!puedePantallaCompleta() || esIPhone()) { fallo(); return; }
  try {
    const d = document.documentElement;
    const pedir = d.requestFullscreen || d.webkitRequestFullscreen;
    Promise.resolve(pedir.call(d, { navigationUI: 'hide' })).then(bloquearHorizontal).catch(fallo);
  } catch (e) { fallo(); /* el navegador no deja */ }
}

function alternarPantallaCompleta(alFallar) {
  try {
    if (!enPantallaCompleta()) { pedirPantallaCompleta(alFallar); return; }
    const salir = document.exitFullscreen || document.webkitExitFullscreen;
    if (salir) Promise.resolve(salir.call(document)).catch(() => {});
  } catch (e) { /* nada */ }
}

// ---------------- Al cargar la página ----------------

window.addEventListener('load', () => {
  if (modoTactil()) document.body.classList.add('tactil');

  // Al primer toque: pantalla completa y horizontal (si el navegador deja)
  const primerToque = (e) => {
    if (e.pointerType && e.pointerType !== 'touch') return;
    document.removeEventListener('pointerup', primerToque);
    pedirPantallaCompleta();
  };
  if (modoTactil()) document.addEventListener('pointerup', primerToque);

  // Sin menú de mantener presionado
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  window.addEventListener('resize', revisarOrientacion);
  window.addEventListener('orientationchange', revisarOrientacion);
  revisarOrientacion();
});

// En vertical: aviso "Gira el celular" y la partida se pausa sola
function revisarOrientacion() {
  const vertical = modoTactil() && window.innerHeight > window.innerWidth;
  document.body.classList.toggle('vertical', vertical);
  if (!vertical || typeof game === 'undefined' || !game.scene) return;
  const escena = game.scene.getScene('GameScene');
  if (escena && escena.sys.isActive() && !escena.pausado && !escena.eligiendo && !escena.gameOver) {
    abrirPausa(escena);
  }
}

// ---------------- Controles en la partida ----------------

// Se llama en GameScene.create (después del HUD)
function crearControlesTactiles(escena) {
  escena.joy = { activo: false, id: null, bx: 0, by: 0, x: 0, y: 0, dx: 0, dy: 0, fuerza: 0 };
  escena.pidioSprint = false;
  escena.tactil = null;
  if (!modoTactil()) return;

  const t = {
    grafico: escena.add.graphics().setScrollFactor(0).setDepth(1500),
    botones: [],
    escala: 0
  };
  escena.tactil = t;

  // v0.35: el Chow chow usa el mismo botón para rugir ("RUGIR")
  if (escena.poder === 'sprint' || escena.poder === 'melena') {
    t.sprint = botonTactil(escena, escena.poder === 'melena' ? 'RUGIR' : 'SPRINT', 0xffe082, () => { escena.pidioSprint = true; });
    t.botones.push(t.sprint);
  }
  t.pausa = botonTactil(escena, 'II', 0xffffff, () => {
    if (escena.gameOver || escena.eligiendo) return;
    if (escena.pausado) cerrarPausa(escena);
    else abrirPausa(escena);
  });
  t.botones.push(t.pausa);
  colocarControlesTactiles(escena);

  // Joystick: aparece donde pones el dedo (mitad izquierda)
  escena.input.on('pointerdown', (p, encima) => {
    const j = escena.joy;
    if (j.activo || (encima && encima.length > 0)) return; // tocó un botón
    if (escena.pausado || escena.eligiendo || escena.gameOver) return;
    if (p.x > escena.scale.width * CONFIG.MOVIL.JOYSTICK_ZONA) return;
    j.activo = true;
    j.id = p.id;
    j.bx = j.x = p.x;
    j.by = j.y = p.y;
    j.dx = j.dy = j.fuerza = 0;
  });
  escena.input.on('pointermove', (p) => {
    const j = escena.joy;
    if (!j.activo || p.id !== j.id) return;
    moverJoystick(escena, p.x, p.y);
  });
  const soltar = (p) => { if (escena.joy.activo && p.id === escena.joy.id) soltarJoystick(escena); };
  escena.input.on('pointerup', soltar);
  escena.input.on('pointerupoutside', soltar);
}

function moverJoystick(escena, x, y) {
  const j = escena.joy;
  const M = CONFIG.MOVIL;
  const radio = pxReales(escena, M.JOYSTICK_RADIO_REAL);
  let dx = x - j.bx;
  let dy = y - j.by;
  const dist = Math.hypot(dx, dy);
  if (dist > radio) { // la perilla no se aleja más que el radio
    dx = (dx / dist) * radio;
    dy = (dy / dist) * radio;
  }
  j.x = j.bx + dx;
  j.y = j.by + dy;
  const t = Math.min(1, dist / radio);
  j.fuerza = t <= M.JOYSTICK_ZONA_MUERTA ? 0 : (t - M.JOYSTICK_ZONA_MUERTA) / (1 - M.JOYSTICK_ZONA_MUERTA);
  j.dx = dist > 0 ? dx / Math.hypot(dx, dy) : 0;
  j.dy = dist > 0 ? dy / Math.hypot(dx, dy) : 0;
}

function soltarJoystick(escena) {
  if (!escena.joy) return;
  escena.joy.activo = false;
  escena.joy.id = null;
  escena.joy.fuerza = 0;
}

// Dirección e intensidad del joystick: { dx, dy, fuerza } (fuerza 0 = quieto, 1 = a fondo)
function direccionJoystick(escena) {
  const j = escena.joy;
  if (!j || !j.activo || j.fuerza <= 0) return null;
  return { dx: j.dx, dy: j.dy, fuerza: j.fuerza };
}

// ¿Se tocó el botón de Sprint? (se "gasta" al leerlo)
function pidioSprintTactil(escena) {
  const pidio = !!escena.pidioSprint;
  escena.pidioSprint = false;
  return pidio;
}

// Botón redondo semitransparente
function botonTactil(escena, etiqueta, color, alTocar) {
  const b = {
    g: escena.add.graphics().setScrollFactor(0).setDepth(1500),
    texto: escena.add.text(0, 0, etiqueta, {
      fontFamily: FUENTE, fontSize: '16px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1501),
    zona: escena.add.zone(0, 0, 10, 10).setScrollFactor(0).setDepth(1502),
    color, x: 0, y: 0, r: 10, apretado: false
  };
  b.zona.setInteractive();
  b.zona.on('pointerdown', () => { b.apretado = true; alTocar(); });
  b.zona.on('pointerup', () => { b.apretado = false; });
  b.zona.on('pointerout', () => { b.apretado = false; });
  return b;
}

// Pone los botones en su lugar según el tamaño real de la pantalla
function colocarControlesTactiles(escena) {
  const t = escena.tactil;
  const M = CONFIG.MOVIL;
  const w = escena.scale.width;
  const h = escena.scale.height;
  t.escala = escena.scale.displayScale.x;
  const margen = Math.max(pxReales(escena, 16), margenHUD());
  const ubicar = (b, diametroReal, x, y) => {
    b.r = pxReales(escena, diametroReal) / 2;
    b.x = x(b.r);
    b.y = y(b.r);
    b.zona.setPosition(b.x, b.y).setSize(b.r * 2, b.r * 2);
    b.texto.setPosition(b.x, b.y).setFontSize(Math.max(14, Math.round(b.r * 0.42)));
  };
  // Sprint: abajo a la derecha. Pausa: a la derecha, debajo del reloj.
  if (t.sprint) ubicar(t.sprint, M.BOTON_SPRINT_REAL, (r) => w - margen - r, (r) => h - margen - r);
  ubicar(t.pausa, M.BOTON_PAUSA_REAL, (r) => w - margen - r, (r) => 82 + margenExtra() + r);
}

// Se llama en cada cuadro (también en pausa, cartas y Game Over, para esconderlos)
function actualizarControlesTactiles(escena) {
  const t = escena.tactil;
  if (!t) return;
  if (escena.scale.displayScale.x !== t.escala) colocarControlesTactiles(escena);
  const visible = !escena.gameOver && !escena.eligiendo && !escena.pausado;
  const alfa = CONFIG.MOVIL.BOTONES_ALFA;
  const g = t.grafico;
  g.clear();
  t.botones.forEach((b) => {
    b.texto.setVisible(visible);
    b.zona.input.enabled = visible;
  });
  if (!visible) return;

  // Joystick
  const j = escena.joy;
  if (j.activo) {
    const radio = pxReales(escena, CONFIG.MOVIL.JOYSTICK_RADIO_REAL);
    g.fillStyle(0x000000, alfa * 0.6);
    g.fillCircle(j.bx, j.by, radio);
    g.lineStyle(3, 0xffffff, alfa);
    g.strokeCircle(j.bx, j.by, radio);
    g.fillStyle(0xffffff, Math.min(1, alfa + 0.25));
    g.fillCircle(j.x, j.y, radio * 0.42);
  } else {
    // Pista suave de dónde va el joystick
    const r = pxReales(escena, CONFIG.MOVIL.JOYSTICK_RADIO_REAL);
    const borde = Math.max(r * 1.6, margenHUD() + r + 8);
    g.lineStyle(2, 0xffffff, alfa * 0.35);
    g.strokeCircle(borde, escena.scale.height - borde, r);
  }

  // Botones (el de Sprint muestra la carga del poder)
  t.botones.forEach((b) => {
    let listo = true;
    if (b === t.sprint && escena.poderEsperaTotal > 0) {
      const carga = escena.poderCarga / escena.poderEsperaTotal;
      listo = escena.poderListo();
      if (!listo) {
        g.lineStyle(5, b.color, alfa + 0.2);
        g.beginPath();
        g.arc(b.x, b.y, b.r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * carga);
        g.strokePath();
      }
    }
    g.fillStyle(b.apretado ? 0xffffff : 0x000000, b.apretado ? alfa : alfa * 0.7);
    g.fillCircle(b.x, b.y, b.r);
    g.lineStyle(3, listo ? b.color : 0x9e9e9e, Math.min(1, alfa + 0.3));
    g.strokeCircle(b.x, b.y, b.r);
    b.texto.setAlpha(listo ? 1 : 0.5);
  });
}

// ---------------- Rendimiento en celular ----------------

// Límite de enemigos a la vez
function limiteEnemigos() {
  return modoTactil() ? CONFIG.MOVIL.ENEMIGOS_MAXIMOS : CONFIG.ENEMIGOS_MAXIMOS;
}

// true si conviene saltarse un efecto chico (muchos enemigos en celular)
function efectosLimitados(escena) {
  return modoTactil() && escena.enemigos && escena.enemigos.countActive() > CONFIG.MOVIL.LIMITAR_EFECTOS_DESDE;
}

// Aviso chico que se desvanece (por ejemplo "En iPhone: Compartir → Agregar a inicio")
function avisoBreve(escena, x, y, texto) {
  if (escena.avisoBreveTexto && escena.avisoBreveTexto.active) escena.avisoBreveTexto.destroy();
  const t = escena.add.text(x, y, texto, {
    fontFamily: FUENTE, fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    backgroundColor: '#000000cc', padding: { x: 10, y: 6 }
  }).setOrigin(0.5).setDepth(5000);
  escena.avisoBreveTexto = t;
  escena.tweens.add({ targets: t, alpha: 0, delay: 2600, duration: 500, onComplete: () => t.destroy() });
  return t;
}

// ---------------- Botón simple para las pantallas (menú, final) ----------------
// Recuadro estilo 8 bits que se puede tocar o clickear (marcoPixel viene de src/pausa.js)
function botonPantalla(escena, cx, cy, ancho, alto, texto, color, alTocar, tam) {
  const g = escena.add.graphics();
  const pintar = (encima) => {
    g.clear();
    marcoPixel(g, cx - ancho / 2, cy - alto / 2, ancho, alto, encima ? 0xffffff : color, encima ? 0x4a3a2a : 0x2b2333);
  };
  pintar(false);
  const etiqueta = escena.add.text(cx, cy, texto, {
    fontFamily: FUENTE, fontSize: (tam || 16) + 'px', color: colorTextoCol(color), fontStyle: 'bold'
  }).setOrigin(0.5);
  const zona = escena.add.zone(cx, cy, ancho, alto).setInteractive({ useHandCursor: true });
  zona.on('pointerover', () => pintar(true));
  zona.on('pointerout', () => pintar(false));
  zona.on('pointerdown', alTocar);
  return [g, etiqueta, zona];
}
