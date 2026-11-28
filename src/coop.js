// ===============================================================
//  COOPERATIVO LOCAL (v0.26, parte 1): dos perros en el mismo computador.
//  - J1: WASD (+ Espacio = Sprint). J2: flechas (+ Enter = Sprint) o un
//    control (gamepad) si hay uno conectado.
//  - Cada perro tiene su propia vida, su mordida y su poder de raza.
//  - v0.27 (parte 2): las cartas se turnan (un nivel elige J1, el siguiente J2)
//    y la carta mejora solo al perro que la eligió: cada uno tiene sus propios
//    ataques (con su propio límite de espacios), mejoras, fusiones y evoluciones.
//    El nivel, la experiencia, los objetos y los huesitos son de los dos.
//  - v0.27: un perro caído revive si su compañero se queda cerca un rato.
//  - v0.27: con 2 jugadores los enemigos tienen más vida y aparecen más seguido.
//  - v0.28 (parte 3): cada jugador elige su raza; cada perro tiene sus stats,
//    su poder (con su propia carga) y el árbol de su raza.
//  - Cámara compartida: sigue el punto medio y se aleja si se separan.
//  - Correa invisible: no se pueden separar más que COOP.DISTANCIA_MAX.
//  - Los enemigos persiguen al perro más cercano.
//  Los números están en src/config.js, sección COOP.
//
//  Cómo funciona J2 por dentro: GameScene guarda el estado del perro en
//  sus propias variables (this.perro, this.vida, this.esperaMordida...).
//  Para que J2 use exactamente el mismo código que J1, conJugador2()
//  cambia esas variables por las de J2 un momento, ejecuta el código y
//  las devuelve. En 1 jugador no se usa nada de esto.
// ===============================================================

// Variables de cada perro (las que se intercambian entre J1 y J2)
const COOP_CLAVES = [
  'perro', 'vida', 'vidaMax', 'vidaAnterior', 'danoVisualHasta', 'ataqueVisualHasta',
  'invulnerableHasta', 'sprintHasta', 'atrapadoHasta', 'ultimaDireccion', 'poderCarga',
  'esperaMordida', 'esperaLadrido', 'esperaCura', 'esperaAgua', 'instintos', 'empujePerro',
  'direccionSprint', 'numeroSprint', 'lebrelListo', 'cueroHasta', 'controlJugador',
  'evoluciones', 'fusiones', 'mordidasOmitidas',
  // v0.27: lo de cada perro para sus propios ataques, mejoras del árbol y fusiones
  // (src/ataques.js, src/ataques_nuevos.js, src/arbol.js y GameScene)
  'esperaRasguno', 'esperaEscarbar', 'terrones', 'agarre', 'agarreListoEn', 'capaMarcas',
  'esperaPatada', 'esperaCaca', 'esperaLadridoFuerte', 'esperaHedor', 'esperaManchas', 'esperaCharcos',
  'cacasVolando', 'manchasCaca', 'charcos', 'meadaRecorrido', 'meadaUltimo', 'regeneracionResto',
  'nubesHedor', 'moscasHedor', 'radioHedorDibujado',
  'esperaCuraArbol', 'esperaTesoro', 'esperaAullido', 'sieteVidasUsada', 'muertesDueno',
  'rastro', 'esperaHuella', 'esperaGolpeRastro', 'escudo', 'jaula', 'esperaCaracu', 'sinergiasActivas',
  // v0.28: la raza de cada perro (stats, poder y árbol)
  'razaId', 'base', 'textosRaza', 'poder', 'poderEsperaTotal', 'arbol',
  // v0.35: Trono y Bostezo real del Chow chow (src/chowchow.js; las nubes de pelo son de los dos)
  'tronoEscudo', 'tronoQuietoMs', 'tronoEspera', 'esperaBostezo', 'graficoChow'
];

// ¿El cooperativo está activado? (lo cambia la tecla del menú o ?coop=1)
const COOP_ESTADO = { activo: false, padAnterior: {} };
(function leerCoopInicial() {
  COOP_ESTADO.activo = !!(CONFIG.COOP && CONFIG.COOP.ACTIVO);
  const pedido = /[?&]coop=([01])/.exec(window.location.search);
  if (pedido) COOP_ESTADO.activo = pedido[1] === '1';
})();

// ---------------- ¿Se puede jugar cooperativo aquí? ----------------

// Primer control (gamepad) conectado, o null
function controlConectado() {
  if (!navigator.getGamepads) return null;
  const lista = navigator.getGamepads() || [];
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] && lista[i].connected) return lista[i];
  }
  return null;
}

// En celular / tablet (táctil sin teclado, la misma detección de src/tactil.js)
// no se puede, salvo que haya un control conectado.
function coopPermitido() {
  return !modoTactil() || !!controlConectado();
}

// true si la próxima partida es cooperativa
function coopActivo() {
  return COOP_ESTADO.activo && coopPermitido();
}

// Tecla del menú: activa / desactiva. Devuelve false si no se puede (celular sin control).
function alternarCoop() {
  if (!coopPermitido()) {
    COOP_ESTADO.activo = false;
    return false;
  }
  COOP_ESTADO.activo = !COOP_ESTADO.activo;
  return true;
}

// Nombre de una tecla para Phaser: '2' -> 'TWO' (Phaser no entiende los números escritos así)
function nombreTeclaPhaser(tecla) {
  const numeros = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
  const t = String(tecla);
  return /^[0-9]$/.test(t) ? numeros[Number(t)] : t.toUpperCase();
}

// ---------------- Aviso de sesión (v0.26, lo usa MenuScene) ----------------
// La ventana "¿Jugar sin guardar?" sale una sola vez por sesión del navegador
const CLAVE_AVISO_SESION = 'lomitoSurvivor_avisoSesion';

function avisoSesionYaVisto() {
  try {
    return window.sessionStorage.getItem(CLAVE_AVISO_SESION) === '1';
  } catch (e) {
    return false;
  }
}

function marcarAvisoSesionVisto() {
  try {
    window.sessionStorage.setItem(CLAVE_AVISO_SESION, '1');
  } catch (e) {
    // sin sessionStorage: se mostraría de nuevo, no pasa nada
  }
}

// ---------------- Control (gamepad) de J2 ----------------

// Lee el control: { dx, dy, fuerza, sprint } (sprint = se apretó recién el botón A)
function leerControlJ2() {
  const pad = controlConectado();
  if (!pad) return null;
  const zona = CONFIG.COOP.ZONA_MUERTA_CONTROL;
  const boton = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
  let dx = pad.axes[0] || 0;
  let dy = pad.axes[1] || 0;
  let fuerza = Math.min(1, Math.hypot(dx, dy));
  if (fuerza < zona) { dx = 0; dy = 0; fuerza = 0; }
  // Cruceta (botones 12 a 15)
  if (boton(14)) dx = -1;
  if (boton(15)) dx = 1;
  if (boton(12)) dy = -1;
  if (boton(13)) dy = 1;
  if (boton(12) || boton(13) || boton(14) || boton(15)) fuerza = 1;
  const a = boton(0);
  const sprint = a && !COOP_ESTADO.padAnterior.a;
  COOP_ESTADO.padAnterior.a = a;
  const largo = Math.hypot(dx, dy);
  return { dx: largo ? dx / largo : 0, dy: largo ? dy / largo : 0, fuerza: largo ? (fuerza - (fuerza < 1 ? zona : 0)) / (1 - zona) : 0, sprint };
}

// Dirección pedida por un jugador. control: undefined (1 jugador: WASD, flechas
// y joystick, como siempre), 1 (J1: WASD) o 2 (J2: flechas o control).
// Devuelve { dx, dy, intensidad }
function direccionJugador(escena, control) {
  let dx = 0;
  let dy = 0;
  let intensidad = 1;
  const w = escena.wasd;
  const c = escena.cursors;
  const usaWasd = control !== 2;
  const usaFlechas = control !== 1;
  if ((usaFlechas && c.left.isDown) || (usaWasd && w.A.isDown)) dx -= 1;
  if ((usaFlechas && c.right.isDown) || (usaWasd && w.D.isDown)) dx += 1;
  if ((usaFlechas && c.up.isDown) || (usaWasd && w.W.isDown)) dy -= 1;
  if ((usaFlechas && c.down.isDown) || (usaWasd && w.S.isDown)) dy += 1;

  if (control === 2) {
    // El control (gamepad) maneja a J2 (si no se mueve con las flechas)
    const pad = escena.padJ2;
    if (pad && dx === 0 && dy === 0 && pad.fuerza > 0) {
      dx = pad.dx;
      dy = pad.dy;
      intensidad = Math.min(1, pad.fuerza);
    }
  } else {
    // Joystick del celular (src/tactil.js): dirección e intensidad (solo J1 o 1 jugador)
    const joy = direccionJoystick(escena);
    if (joy && dx === 0 && dy === 0) {
      dx = joy.dx;
      dy = joy.dy;
      intensidad = joy.fuerza;
    }
  }
  return { dx, dy, intensidad };
}

// ---------------- Inicio de la partida ----------------

// Lo llama GameScene.create (al final). En 1 jugador no hace nada.
function iniciarCoop(escena) {
  escena.coop = coopActivo();
  escena.jugador2 = null;
  if (!escena.coop) return;
  const C = CONFIG.COOP;

  escena.controlJugador = 1;
  escena.teclaSprintJ2 = escena.input.keyboard.addKey('ENTER');
  escena.padJ2 = null;

  // v0.28: la raza de J2 (la eligió en el menú; si no viene, la misma de J1)
  const razaJ2 = CONFIG.RAZAS[escena.razaJ2] ? escena.razaJ2 : escena.razaId;
  const base2 = CONFIG.RAZAS[razaJ2];
  const arbol2 = efectosArbol(razaJ2);
  const vidaMax2 = base2.VIDA + bonusColeccion('sweater', 'VIDA') + (arbol2.VIDA || 0); // igual que J1 en GameScene.create
  const espera2 = base2.PODER_ESPERA_MS || 0;

  // El segundo perro, al lado de J1
  const p1 = escena.perro;
  const lugar = escena.plaza.buscarLibre(p1.x + C.SEPARACION_INICIO, p1.y, base2.RADIO + 10);
  const p2 = dibujarPerro(escena, lugar.x, lugar.y, razaJ2);
  escena.physics.add.existing(p2);
  ponerChoqueCircular(p2, base2.RADIO);
  p2.body.setCollideWorldBounds(true);
  p2.setDepth(10);
  escena.physics.add.collider(p2, escena.plaza.obstaculos);
  escena.physics.add.overlap(p2, escena.enemigos, (perro, enemigo) => {
    conJugador2(escena, () => escena.recibirGolpe(perro, enemigo));
  });
  escena.perrosCoop = [p1, p2];

  // Estado propio de J2 (mismos nombres que en GameScene)
  const instintos = {};
  INSTINTOS.forEach((inst) => { instintos[inst.id] = 0; });
  escena.jugador2 = {
    perro: p2, vida: vidaMax2, vidaMax: vidaMax2, vidaAnterior: undefined,
    danoVisualHasta: 0, ataqueVisualHasta: 0, invulnerableHasta: 0, sprintHasta: 0, atrapadoHasta: 0,
    ultimaDireccion: new Phaser.Math.Vector2(1, 0), poderCarga: espera2, // el poder empieza listo
    esperaMordida: 0, esperaLadrido: 0, esperaCura: 0, esperaAgua: 0, instintos, empujePerro: null,
    direccionSprint: new Phaser.Math.Vector2(1, 0), numeroSprint: 0, lebrelListo: false, cueroHasta: 0,
    controlJugador: 2, evoluciones: {}, fusiones: {}, mordidasOmitidas: 0,
    // v0.27: sus propios ataques, mejoras del árbol y fusiones (empiezan como los de J1)
    esperaRasguno: 0, esperaEscarbar: 0, terrones: [], agarre: null, agarreListoEn: 0,
    capaMarcas: escena.add.graphics().setDepth(801),
    esperaPatada: 0, esperaCaca: 0, esperaLadridoFuerte: 0, esperaHedor: 0, esperaManchas: 0, esperaCharcos: 0,
    cacasVolando: [], manchasCaca: [], charcos: [], meadaRecorrido: 0, meadaUltimo: null, regeneracionResto: 0,
    nubesHedor: [], moscasHedor: [], radioHedorDibujado: 0,
    esperaCuraArbol: 0, esperaTesoro: 0, esperaAullido: 0, sieteVidasUsada: false, muertesDueno: 0,
    rastro: [], esperaHuella: 0, esperaGolpeRastro: 0,
    escudo: escena.add.graphics().setDepth(11), jaula: escena.add.graphics().setDepth(12),
    esperaCaracu: 0, sinergiasActivas: {},
    tronoEscudo: 0, tronoQuietoMs: 0, tronoEspera: 0, esperaBostezo: 0, graficoChow: null, // v0.35 (Chow chow)
    // v0.28: su raza, su poder y el árbol de su raza
    razaId: razaJ2, base: base2, textosRaza: RAZAS.find((r) => r.id === razaJ2) || { nombre: razaJ2, poder: '' },
    poder: base2.PODER || '', poderEsperaTotal: espera2, arbol: arbol2
  };
  escena.enJ2 = false;
  escena.turnoCartas = 1;       // v0.27: quién elige la próxima carta (1 o 2)
  escena.eligeJ2 = false;       // true mientras J2 está eligiendo carta
  // Círculo de progreso para revivir (sobre la oscuridad)
  escena.capaRevivir = escena.add.graphics().setDepth(807);
  COOP_ESTADO.padCartas = {};

  // Indicadores "P1" y "P2" sobre la cabeza
  const etiqueta = (texto, color) => escena.add.text(0, 0, texto, {
    fontFamily: FUENTE, fontSize: '13px', color: '#' + color.toString(16).padStart(6, '0'), fontStyle: 'bold',
    stroke: '#000000', strokeThickness: 3
  }).setOrigin(0.5, 1).setDepth(806);
  escena.etiquetaJ1 = etiqueta('P1', C.COLOR_J1);
  escena.etiquetaJ2 = etiqueta('P2 ▼', C.COLOR_J2);

  // Vida de J2 en el HUD: arriba a la derecha, debajo del reloj
  escena.barraVidaJ2 = escena.add.graphics().setScrollFactor(0).setDepth(1000);
  escena.textoVidaJ2 = escena.add.text(0, 0, '', {
    fontFamily: FUENTE, fontSize: '14px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
  }).setOrigin(0.5).setScrollFactor(0).setDepth(1001);
  // v0.28: quién es y qué raza ("P2 · Galgo"), y la carga de su poder debajo de la barra
  escena.textoNombreJ2 = escena.add.text(0, 0, 'P2 · ' + escena.jugador2.textosRaza.nombre, {
    fontFamily: FUENTE, fontSize: '15px', color: '#4fc3f7', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
  }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);
  escena.textoPoderJ2 = escena.add.text(0, 0, '', {
    fontFamily: FUENTE, fontSize: '13px', color: '#bbbbbb', stroke: '#000000', strokeThickness: 3
  }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);
  escena.textoNombreJ1 = escena.add.text(escena.margenHud + 204, 57 + escena.margenHudExtra, 'P1 · ' + escena.textosRaza.nombre, {
    fontFamily: FUENTE, fontSize: '15px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
  }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(1001);

  // Cámara compartida: ya no sigue a J1; se mueve sola al punto medio.
  // El HUD (todo lo que tiene scrollFactor 0) se dibuja con otra cámara sin zoom.
  const cam = escena.cameras.main;
  cam.stopFollow();
  escena.camHUD = escena.cameras.add(0, 0, escena.scale.width, escena.scale.height);
  escena.camCentro = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
  cam.centerOn(escena.camCentro.x, escena.camCentro.y);
  const repartir = () => repartirCamaras(escena);
  escena.game.events.on('prerender', repartir);
  escena.events.once('shutdown', () => escena.game.events.off('prerender', repartir));

  // La oscuridad pasa a ser parte del mundo (así acompaña el zoom): ver actualizarOscuridadCoop
  if (escena.oscuridad) {
    const o = escena.oscuridad.capa;
    o.setScrollFactor(1);
    o.resize(Math.ceil(escena.scale.width / C.ZOOM_MIN) + 8, Math.ceil(escena.scale.height / C.ZOOM_MIN) + 8);
  }
}

// Cada objeto se dibuja con una sola cámara: el HUD (scrollFactor 0) con la del HUD
// (sin zoom) y el mundo con la principal (con zoom). Se revisa antes de cada dibujo.
function repartirCamaras(escena) {
  if (!escena.camHUD || !escena.sys.isActive()) return;
  const principal = escena.cameras.main.id;
  const hud = escena.camHUD.id;
  escena.children.list.forEach((o) => {
    o.cameraFilter = o.scrollFactorX === 0 ? principal : hud;
  });
}

// ---------------- Turno de J2 ----------------

// Ejecuta fn() con las variables de J2 puestas en la escena (y después las devuelve)
function conJugador2(escena, fn) {
  const j2 = escena.jugador2;
  if (!j2 || escena.enJ2) return fn ? fn() : undefined;
  const cambiar = () => COOP_CLAVES.forEach((k) => {
    const t = escena[k];
    escena[k] = j2[k];
    j2[k] = t;
  });
  cambiar();
  escena.enJ2 = true;
  let resultado;
  try {
    resultado = fn();
  } finally {
    escena.enJ2 = false;
    cambiar();
  }
  // HUD e inventario que se pidieron durante el turno de J2: se dibujan ahora (con los datos de J1)
  if (escena.inventarioPendiente) {
    escena.inventarioPendiente = false;
    escena.actualizarInventario();
  }
  if (escena.hudPendiente) {
    escena.hudPendiente = false;
    escena.actualizarHUD();
  }
  // Si J2 cayó y J1 ya estaba caído, se termina la partida (fuera del turno de J2,
  // para que la pantalla final muestre los datos de J1)
  if (escena.terminarCoopPendiente && !escena.gameOver) {
    escena.terminarCoopPendiente = false;
    escena.terminarJuego(false);
  }
  return resultado;
}

// Movimiento de J2 y correa (lo llama GameScene.update justo después de mover a J1)
function moverJugador2(escena, delta) {
  if (!escena.jugador2) return;
  escena.padJ2 = leerControlJ2();
  conJugador2(escena, () => {
    escena.cargarPoder(delta);
    const pidio = Phaser.Input.Keyboard.JustDown(escena.teclaSprintJ2) || (escena.padJ2 && escena.padJ2.sprint);
    if (escena.poder === 'sprint' && pidio && escena.poderListo() && !escena.estaAtrapado() && !escena.perro.caido) {
      escena.iniciarSprint();
    }
    // v0.35: Rugido del Chow chow (misma tecla que el Sprint: Enter o botón A)
    if (escena.poder === 'melena' && pidio && escena.poderListo() && !escena.perro.caido) rugirChow(escena);
    escena.moverPerro();
  });
  aplicarCorrea(escena);
}

// Lo demás de J2 en cada cuadro: comer, agua, huesos, objetos, mordida y poder
// (lo llama GameScene.update después de los ataques de J1)
function actualizarJugador2(escena, delta) {
  if (!escena.jugador2 || escena.gameOver) return;
  conJugador2(escena, () => {
    const caido = escena.perro.caido;
    if (!caido) {
      escena.moverHuesos(delta);
      escena.comer();
      escena.beberAgua(delta);
      escena.recogerObjetos();
    }
    if (escena.eligiendo || escena.gameOver) return;
    // v0.27: J2 usa sus propios ataques, instintos, fusiones y mejoras del árbol
    const puedeAtacar = escena.puedeAtacar();
    escena.mordidaAutomatica(delta, puedeAtacar);
    escena.ladridoAutomatico(delta, puedeAtacar);
    actualizarAtaques(escena, delta, puedeAtacar);
    if (escena.gameOver) return;
    if (!caido) {
      escena.regenerarCalle(delta);
      escena.efectosObjetos(delta);
      actualizarArbol(escena, delta, puedeAtacar);
    }
    escena.actualizarEstampida(delta);
    escena.dibujarJaula();
    escena.dibujarEscudo();
    const invulnerable = escena.tiempoSobrevivido < escena.invulnerableHasta;
    escena.perro.setAlpha(caido ? 0.45 : invulnerable ? 0.5 : 1);
  });
  // Las cartas de los huesos que juntó J2 se muestran ahora (elige el del turno)
  if (escena.nivelesPendientes > 0 && !escena.eligiendo && !escena.gameOver) escena.mostrarCartas();
}

// ---------------- Correa invisible ----------------

// Si están en el límite, se quita la parte de la velocidad que los separa.
// Si uno está caído, el que está de pie lo arrastra.
function aplicarCorrea(escena) {
  const [a, b] = escena.perrosCoop;
  const max = CONFIG.COOP.DISTANCIA_MAX;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  if (d < max - 4 || d === 0) return;
  const ux = dx / d;
  const uy = dy / d;
  // Cuánto se pasó (por un empujón o un sprint): se corrige de a poco
  const exceso = Math.max(0, d - max);
  const tirar = (perro, sx, sy) => {
    const v = perro.body.velocity;
    const hacia = v.x * sx + v.y * sy; // velocidad hacia afuera (alejándose del otro)
    if (hacia > 0) v.set(v.x - hacia * sx, v.y - hacia * sy);
    if (exceso > 0) v.set(v.x - sx * exceso * 8, v.y - sy * exceso * 8);
  };
  if (a.caido && !b.caido) {
    // b arrastra a a
    a.body.velocity.set(ux * Math.max(80, exceso * 10), uy * Math.max(80, exceso * 10));
  } else if (b.caido && !a.caido) {
    b.body.velocity.set(-ux * Math.max(80, exceso * 10), -uy * Math.max(80, exceso * 10));
  } else {
    tirar(a, -ux, -uy);
    tirar(b, ux, uy);
  }
}

// ---------------- Cámara compartida ----------------

// Punto medio entre los dos perros y zoom para que ambos queden en pantalla.
// instantaneo = true: sin suavizado (al empezar)
function actualizarCamaraCoop(escena, instantaneo) {
  if (!escena.jugador2) return;
  const C = CONFIG.COOP;
  const cam = escena.cameras.main;
  const [a, b] = escena.perrosCoop;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const m = C.MARGEN_PANTALLA;
  const sx = Math.abs(a.x - b.x);
  const sy = Math.abs(a.y - b.y);
  let zoom = Math.min(1, sx > 0 ? (w - 2 * m) / sx : 1, sy > 0 ? (h - 2 * m) / sy : 1);
  zoom = Phaser.Math.Clamp(zoom, C.ZOOM_MIN, 1);
  const kz = instantaneo ? 1 : C.ZOOM_SUAVIDAD;
  const kc = instantaneo ? 1 : C.CAMARA_SUAVIDAD;
  cam.setZoom(cam.zoom + (zoom - cam.zoom) * kz);
  const c = escena.camCentro;
  c.x += ((a.x + b.x) / 2 - c.x) * kc;
  c.y += ((a.y + b.y) / 2 - c.y) * kc;
  cam.centerOn(c.x, c.y);
}

// Parte del mundo que se ve (con el zoom): { x, y, ancho, alto }
function vistaCamara(escena) {
  const cam = escena.cameras.main;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const ancho = w / cam.zoom;
  const alto = h / cam.zoom;
  return { x: cam.scrollX + (w - ancho) / 2, y: cam.scrollY + (h - alto) / 2, ancho, alto };
}

// Posición en la pantalla de un punto del mundo (sirve con y sin zoom).
// Con zoom 1 es lo mismo que x - scrollX (como antes de v0.26).
function pantallaDesdeMundo(escena, x, y) {
  const cam = escena.cameras.main;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const z = cam.zoom;
  if (z === 1) return { x: x - cam.scrollX, y: y - cam.scrollY };
  return { x: (x - cam.scrollX - w / 2) * z + w / 2, y: (y - cam.scrollY - h / 2) * z + h / 2 };
}

// Oscuridad en cooperativo: la capa está en el mundo, cubre lo que se ve y deja
// luz alrededor de los dos perros, de los faroles y de las otras luces.
function actualizarOscuridadCoop(escena, oscuridad, plaza, alfa, luces) {
  if (!oscuridad) return;
  const capa = oscuridad.capa;
  const v = vistaCamara(escena);
  capa.setPosition(v.x - 4, v.y - 4);
  capa.clear();
  if (alfa <= 0) return;
  capa.fill(0x05081a, alfa);
  const R = CONFIG.LUZ_FAROL_RADIO;
  const ox = v.x - 4;
  const oy = v.y - 4;
  (luces || []).forEach((l) => capa.erase(oscuridad.luzPerro, l.x - ox, l.y - oy));
  plaza.faroles.forEach((f) => {
    if (f.x < v.x - R || f.y < v.y - R || f.x > v.x + v.ancho + R || f.y > v.y + v.alto + R) return;
    capa.erase(oscuridad.luzFarol, f.x - ox, f.y - oy);
  });
  escena.perrosCoop.forEach((p) => capa.erase(oscuridad.luzPerro, p.x - ox, p.y - oy));
}

// Nombre de la marca "ya lo golpeó" de un evento para el perro del turno:
// 'golpeoPerro' para J1 (o 1 jugador) y 'golpeoPerro2' para J2
function claveGolpeCoop(escena, base) {
  return escena.enJ2 ? base + '2' : base;
}

// ---------------- Enemigos: persiguen al perro más cercano ----------------

// El perro (de pie) más cercano a un enemigo. En 1 jugador, siempre el perro.
function perroMasCercano(escena, x, y) {
  if (!escena.jugador2) return escena.perro;
  const [a, b] = escena.perrosCoop;
  if (a.caido && !b.caido) return b;
  if (b.caido && !a.caido) return a;
  const da = (a.x - x) * (a.x - x) + (a.y - y) * (a.y - y);
  const db = (b.x - x) * (b.x - x) + (b.y - y) * (b.y - y);
  return db < da ? b : a;
}

// ---------------- Caer (vida en 0) ----------------

// Lo llama GameScene.terminarJuego cuando un perro llega a 0 de vida.
// Devuelve true si la partida sigue (el otro perro sigue de pie).
function caerJugadorCoop(escena) {
  if (!escena.jugador2) return false;
  const perro = escena.perro; // el del turno actual (J1 o J2)
  const otro = escena.perrosCoop.find((p) => p !== perro);
  if (!perro.caido) {
    perro.caido = true;
    escena.vida = 0;
    perro.body.setVelocity(0, 0);
    perro.progresoRevivir = 0;
    perro.tinteOriginal = perro.isTinted ? perro.tintTopLeft : null; // para devolverle su color al revivir
    perro.setTint(0x777777).setAlpha(0.45);
    if (perro.anims) perro.anims.stop();
    if (!otro.caido) escena.mostrarAviso('¡' + (escena.enJ2 ? 'P2' : 'P1') + ' cayó! Quédate cerca para revivirlo', '#ff8a80');
  }
  if (!otro.caido) return true;
  // Los dos cayeron: se termina la partida
  if (escena.enJ2) {
    escena.terminarCoopPendiente = true; // conJugador2 la termina al salir del turno de J2
    return true;
  }
  return false;
}

// ---------------- HUD e indicadores ----------------

function actualizarHUDCoop(escena) {
  if (!escena.jugador2) return;
  const C = CONFIG.COOP;
  const j2 = escena.jugador2;
  const ancho = 160;
  const alto = 16;
  const x = escena.scale.width - escena.margenHud - ancho;
  const y = 80 + escena.margenHudExtra;
  const g = escena.barraVidaJ2;
  const p = Math.max(0, j2.vida / j2.vidaMax);
  g.clear();
  g.fillStyle(0x000000, 0.6);
  g.fillRect(x, y, ancho, alto);
  g.fillStyle(j2.perro.caido ? 0x616161 : p > 0.3 ? C.COLOR_J2 : 0xe53935, 1);
  g.fillRect(x, y, ancho * p, alto);
  g.lineStyle(2, COLOR_BLANCO, 0.8);
  g.strokeRect(x, y, ancho, alto);
  escena.textoVidaJ2.setPosition(x + ancho / 2, y + alto / 2)
    .setText(j2.perro.caido ? 'caído' : Math.round(j2.vida) + ' / ' + j2.vidaMax);
  escena.textoNombreJ2.setPosition(x - 6, y + alto / 2);

  // v0.28: poder de J2 debajo de su barra (carga si tiene espera; si no, "pasivo")
  const yp = y + alto + 6;
  const nombrePoder = String(j2.textosRaza.poder || '').replace(/\s*\[[^\]]*\]/g, '');
  if (j2.poderEsperaTotal > 0) {
    const carga = Math.min(1, j2.poderCarga / j2.poderEsperaTotal);
    const listo = j2.poderCarga >= j2.poderEsperaTotal;
    g.fillStyle(0x000000, 0.6);
    g.fillRect(x, yp, ancho, 8);
    g.fillStyle(listo && !j2.perro.caido ? COLOR_HUESO : 0x9e9e9e, 1);
    g.fillRect(x, yp, ancho * carga, 8);
    g.lineStyle(1, COLOR_BLANCO, 0.6);
    g.strokeRect(x, yp, ancho, 8);
    const tecla = j2.poder === 'sprint' || j2.poder === 'melena' ? ' [Enter]' : '';
    const estado = listo ? '¡Listo!' + tecla : ((j2.poderEsperaTotal - j2.poderCarga) / 1000).toFixed(1) + ' s';
    escena.textoPoderJ2.setPosition(x - 6, yp + 4).setText(nombrePoder + ': ' + estado)
      .setColor(listo ? '#ffe082' : '#bbbbbb');
  } else {
    escena.textoPoderJ2.setPosition(x + ancho, yp + 6).setText(nombrePoder ? nombrePoder + ' (pasivo)' : '')
      .setColor('#ffe082');
  }
}

// v0.28: flechas del Rastreo en cooperativo: las dibuja cada perro que sea Beagle
// (lo llama GameScene.update en vez de dibujarFlechas)
function dibujarFlechasCoop(escena) {
  escena.flechas.clear();
  if (escena.poder === 'rastreo' && !escena.perro.caido) escena.dibujarFlechas(true);
  const j2 = escena.jugador2;
  if (j2 && j2.poder === 'rastreo' && !j2.perro.caido) conJugador2(escena, () => escena.dibujarFlechas(true));
}

// v0.28: radio de choque de la raza de un perro (0 = J1, 1 = J2), fuera del turno de J2
function radioPerroCoop(escena, i) {
  const estado = i === 0 ? escena : escena.jugador2;
  return (estado && estado.base && estado.base.RADIO) || escena.base.RADIO;
}

// Indicadores sobre la cabeza (después de que la física movió a los perros)
function moverEtiquetasCoop(escena) {
  if (!escena.jugador2) return;
  const [a, b] = escena.perrosCoop;
  escena.etiquetaJ1.setPosition(a.x, a.y - radioPerroCoop(escena, 0) - 14).setAlpha(a.caido ? 0.5 : 1);
  escena.etiquetaJ2.setPosition(b.x, b.y - radioPerroCoop(escena, 1) - 14).setAlpha(b.caido ? 0.5 : 1);
}

// ---------------- Revivir (v0.27) ----------------

// Lo llama GameScene.update en cada cuadro (fuera del turno de J2).
// Si un perro está caído y el otro se queda a COOP.REVIVIR_RADIO, el progreso sube;
// si se aleja, baja. Al llenarse, el caído vuelve con parte de su vida.
function actualizarRevivir(escena, delta) {
  if (!escena.jugador2 || escena.gameOver) return;
  const C = CONFIG.COOP;
  const g = escena.capaRevivir;
  g.clear();
  const total = Math.max(1, C.REVIVIR_SEGUNDOS * 1000);
  escena.perrosCoop.forEach((perro, i) => {
    const arriba = radioPerroCoop(escena, i) + 32;
    const otro = escena.perrosCoop[1 - i];
    if (!perro.caido) {
      perro.progresoRevivir = 0;
      return;
    }
    if (otro.caido) return; // los dos caídos: la partida ya terminó
    const d = Phaser.Math.Distance.Between(perro.x, perro.y, otro.x, otro.y);
    const cerca = d <= C.REVIVIR_RADIO;
    const antes = perro.progresoRevivir || 0;
    perro.progresoRevivir = Phaser.Math.Clamp(antes + (cerca ? delta : -delta * C.REVIVIR_BAJA_MULT), 0, total);
    if (perro.progresoRevivir >= total) {
      revivirPerroCoop(escena, i);
      return;
    }
    // Zona para revivir (anillo suave) y círculo de progreso sobre el perro caído
    const color = i === 0 ? C.COLOR_J1 : C.COLOR_J2;
    g.lineStyle(2, color, cerca ? 0.7 : 0.35);
    g.strokeCircle(perro.x, perro.y, C.REVIVIR_RADIO);
    const f = perro.progresoRevivir / total;
    const x = perro.x;
    const y = perro.y - arriba;
    g.fillStyle(0x000000, 0.6);
    g.fillCircle(x, y, 15);
    g.lineStyle(2, COLOR_BLANCO, 0.5);
    g.strokeCircle(x, y, 12);
    if (f > 0) {
      g.lineStyle(5, color, 1);
      g.beginPath();
      g.arc(x, y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f, false);
      g.strokePath();
    }
    // una cruz chica al centro (símbolo de "revivir")
    g.fillStyle(color, 1);
    g.fillRect(x - 1.5, y - 5, 3, 10);
    g.fillRect(x - 5, y - 1.5, 10, 3);
  });
}

// ---------------- Liberar de la red (v0.32) ----------------

// Lo llama GameScene.update después de actualizarRevivir (fuera del turno de J2).
// Si un perro está atrapado en la red del Personal de la Perrera y su compañero
// (de pie y libre) se queda a COOP.LIBERAR_RED_RADIO, lo suelta en LIBERAR_RED_SEGUNDOS.
// Si los dos están atrapados, nadie ayuda: se sueltan solos al terminar el tiempo.
function actualizarLiberarRed(escena, delta) {
  if (!escena.jugador2 || escena.gameOver) return;
  const C = CONFIG.COOP;
  const g = escena.capaRevivir; // la misma capa del revivir (ya se limpió en este cuadro)
  const ahora = escena.tiempoSobrevivido;
  const total = Math.max(1, (C.LIBERAR_RED_SEGUNDOS || 1.2) * 1000);
  const estados = [escena, escena.jugador2]; // fuera del turno de J2, J1 vive en la escena
  const enRed = (i) => ahora < estados[i].atrapadoHasta && escena.perrosCoop[i].redHasta >= estados[i].atrapadoHasta;
  escena.perrosCoop.forEach((perro, i) => {
    const otro = escena.perrosCoop[1 - i];
    if (!enRed(i)) {
      perro.progresoLiberar = 0;
      return;
    }
    if (otro.caido || ahora < estados[1 - i].atrapadoHasta) return; // el compañero no puede ayudar
    const d = Phaser.Math.Distance.Between(perro.x, perro.y, otro.x, otro.y);
    const cerca = d <= C.LIBERAR_RED_RADIO;
    perro.progresoLiberar = Phaser.Math.Clamp((perro.progresoLiberar || 0) + (cerca ? delta : -delta), 0, total);
    if (perro.progresoLiberar >= total) {
      estados[i].atrapadoHasta = 0;
      perro.redHasta = 0;
      perro.progresoLiberar = 0;
      escena.mostrarAviso('¡' + (i === 1 ? 'P1' : 'P2') + ' liberó a su compañero!', colorTextoJugador(2 - i));
      return;
    }
    // anillo de ayuda y círculo de progreso sobre el atrapado (como el revivir)
    const color = i === 0 ? C.COLOR_J1 : C.COLOR_J2;
    g.lineStyle(2, color, cerca ? 0.7 : 0.35);
    g.strokeCircle(perro.x, perro.y, C.LIBERAR_RED_RADIO);
    const f = perro.progresoLiberar / total;
    const x = perro.x;
    const y = perro.y - radioPerroCoop(escena, i) - 32;
    g.fillStyle(0x000000, 0.6);
    g.fillCircle(x, y, 15);
    g.lineStyle(2, COLOR_BLANCO, 0.5);
    g.strokeCircle(x, y, 12);
    if (f > 0) {
      g.lineStyle(5, color, 1);
      g.beginPath();
      g.arc(x, y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f, false);
      g.strokePath();
    }
  });
}

// El perro i (0 = J1, 1 = J2) vuelve a la partida
function revivirPerroCoop(escena, i) {
  const C = CONFIG.COOP;
  const perro = escena.perrosCoop[i];
  const estado = i === 0 ? escena : escena.jugador2; // fuera del turno de J2, J1 vive en la escena
  perro.caido = false;
  perro.progresoRevivir = 0;
  if (perro.tinteOriginal !== null && perro.tinteOriginal !== undefined) perro.setTint(perro.tinteOriginal);
  else perro.clearTint();
  perro.setAlpha(1);
  estado.vida = Math.max(1, Math.ceil(estado.vidaMax * C.REVIVIR_VIDA_PCT));
  estado.vidaAnterior = estado.vida; // sin el dibujo de "daño" al volver
  estado.invulnerableHasta = escena.tiempoSobrevivido + C.REVIVIR_INVULN_S * 1000;
  estado.atrapadoHasta = 0;
  estado.empujePerro = null;
  escena.mostrarAviso('¡' + (i === 0 ? 'P1' : 'P2') + ' volvió a la pelea!', colorTextoJugador(i + 1));
  escena.actualizarHUD();
}

// ---------------- Cartas por turno (v0.27) ----------------

// Color de un jugador como texto ('#ffe082')
function colorTextoJugador(n) {
  const c = n === 2 ? CONFIG.COOP.COLOR_J2 : CONFIG.COOP.COLOR_J1;
  return '#' + c.toString(16).padStart(6, '0');
}

// Lee el control para las cartas: { izq, der, a } = se apretó recién
function leerPadCartas() {
  const pad = controlConectado();
  const antes = COOP_ESTADO.padCartas || {};
  const ahora = { izq: false, der: false, a: false };
  if (pad) {
    const boton = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
    const eje = pad.axes[0] || 0;
    ahora.izq = boton(14) || eje < -0.6;
    ahora.der = boton(15) || eje > 0.6;
    ahora.a = boton(0);
  }
  COOP_ESTADO.padCartas = ahora;
  COOP_ESTADO.padAnterior.a = ahora.a; // así el botón A de la carta no hace un sprint al cerrar
  return { izq: ahora.izq && !antes.izq, der: ahora.der && !antes.der, a: ahora.a && !antes.a };
}

// Al abrir las cartas: olvida teclas y botones apretados antes, y dibuja el
// "Elige: Jugador N" y el marco de la carta seleccionada (lo llama GameScene.mostrarCartas)
function prepararCartasCoop(escena, capa, posiciones, cy, anchoCarta, altoCarta) {
  const n = escena.eligeJ2 ? 2 : 1;
  const color = n === 2 ? CONFIG.COOP.COLOR_J2 : CONFIG.COOP.COLOR_J1;
  [escena.wasd.A, escena.wasd.D, escena.teclaEspacio, escena.cursors.left, escena.cursors.right, escena.teclaSprintJ2]
    .forEach((t) => Phaser.Input.Keyboard.JustDown(t));
  leerPadCartas();
  capa.push(escena.add.text(escena.scale.width / 2, 48, 'Elige: Jugador ' + n, {
    fontFamily: FUENTE, fontSize: '30px', color: colorTextoJugador(n), fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
  }).setOrigin(0.5));
  escena.cartaSeleccion = 0;
  escena.posCartas = posiciones;
  escena.marcoCarta = escena.add.rectangle(posiciones[0], cy, anchoCarta + 18, altoCarta + 18).setStrokeStyle(5, color);
  capa.push(escena.marcoCarta);
}

// Cómo elegir (va en el título de las cartas)
function textoComoElegirCoop(escena) {
  return escena.eligeJ2 ? '(P2: flechas ← → y Enter, o cruceta y botón A)' : '(P1: clic, A / D y Espacio, o teclas 1, 2, 3)';
}

// Mientras se eligen cartas en cooperativo (lo llama GameScene.update).
// J1: mouse (GameScene.tocarCarta), A / D + Espacio o 1 2 3. J2: flechas + Enter o el control.
function elegirCartaCoop(escena) {
  const j = Phaser.Input.Keyboard.JustDown;
  // Se leen todas siempre, para que no queden "guardadas" para después
  const t1 = escena.teclasCartas.map((t) => j(t));
  const izq1 = j(escena.wasd.A);
  const der1 = j(escena.wasd.D);
  const ok1 = j(escena.teclaEspacio);
  const izq2 = j(escena.cursors.left);
  const der2 = j(escena.cursors.right);
  const ok2 = j(escena.teclaSprintJ2);
  const pad = leerPadCartas();
  const total = escena.cartas.length;
  if (total === 0) return;

  let mover = 0;
  let elegir = false;
  if (escena.eligeJ2) {
    if (izq2 || pad.izq) mover = -1;
    if (der2 || pad.der) mover = 1;
    elegir = ok2 || pad.a;
  } else {
    const tecla = t1.findIndex((x, i) => x && i < total);
    if (tecla >= 0) {
      escena.elegirCarta(tecla);
      return;
    }
    if (izq1) mover = -1;
    if (der1) mover = 1;
    elegir = ok1;
  }
  if (mover !== 0) {
    escena.cartaSeleccion = (escena.cartaSeleccion + mover + total) % total;
    if (escena.marcoCarta) escena.marcoCarta.setX(escena.posCartas[escena.cartaSeleccion]);
  }
  if (elegir) escena.elegirCarta(escena.cartaSeleccion);
}

// Fusiones y evoluciones de J2 (para la línea del inventario)
function nombresFusionesJ2(escena) {
  if (!escena.jugador2 || escena.enJ2) return [];
  return conJugador2(escena, () => escena.nombresFusionesPerro());
}
