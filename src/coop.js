// ===============================================================
//  COOPERATIVO LOCAL (v0.26, parte 1): dos perros en el mismo computador.
//  - J1: WASD (+ Espacio = Sprint). J2: flechas (+ Enter = Sprint) o un
//    control (gamepad) si hay uno conectado.
//  - Cada perro tiene su propia vida, su mordida y su poder de raza.
//    Por ahora las cartas al subir de nivel son solo para J1.
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
  'evoluciones', 'fusiones', 'mordidasOmitidas'
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

  // El segundo perro (misma raza que J1 por ahora), al lado de J1
  const p1 = escena.perro;
  const lugar = escena.plaza.buscarLibre(p1.x + C.SEPARACION_INICIO, p1.y, escena.base.RADIO + 10);
  const p2 = dibujarPerro(escena, lugar.x, lugar.y, escena.razaId);
  escena.physics.add.existing(p2);
  ponerChoqueCircular(p2, escena.base.RADIO);
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
    perro: p2, vida: escena.vidaMax, vidaMax: escena.vidaMax, vidaAnterior: undefined,
    danoVisualHasta: 0, ataqueVisualHasta: 0, invulnerableHasta: 0, sprintHasta: 0, atrapadoHasta: 0,
    ultimaDireccion: new Phaser.Math.Vector2(1, 0), poderCarga: escena.poderEsperaTotal,
    esperaMordida: 0, esperaLadrido: 0, esperaCura: 0, esperaAgua: 0, instintos, empujePerro: null,
    direccionSprint: new Phaser.Math.Vector2(1, 0), numeroSprint: 0, lebrelListo: false, cueroHasta: 0,
    controlJugador: 2, evoluciones: {}, fusiones: {}, mordidasOmitidas: 0
  };
  escena.enJ2 = false;

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
  escena.textoNombreJ2 = escena.add.text(0, 0, 'P2', {
    fontFamily: FUENTE, fontSize: '15px', color: '#4fc3f7', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
  }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(1001);
  escena.textoNombreJ1 = escena.add.text(escena.margenHud + 204, 57 + escena.margenHudExtra, 'P1', {
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
    escena.mordidaAutomatica(delta, escena.puedeAtacar());
    if (!caido) escena.regenerarCalle(delta);
    const invulnerable = escena.tiempoSobrevivido < escena.invulnerableHasta;
    escena.perro.setAlpha(caido ? 0.45 : invulnerable ? 0.5 : 1);
  });
  // Las cartas de los huesos que juntó J2 se muestran ahora (las elige J1)
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
    perro.setTint(0x777777).setAlpha(0.45);
    if (perro.anims) perro.anims.stop();
    if (!otro.caido) escena.mostrarAviso('¡' + (escena.enJ2 ? 'P2' : 'P1') + ' cayó! Sigue tu compañero', '#ff8a80');
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
}

// Indicadores sobre la cabeza (después de que la física movió a los perros)
function moverEtiquetasCoop(escena) {
  if (!escena.jugador2) return;
  const [a, b] = escena.perrosCoop;
  const arriba = escena.base.RADIO + 14;
  escena.etiquetaJ1.setPosition(a.x, a.y - arriba).setAlpha(a.caido ? 0.5 : 1);
  escena.etiquetaJ2.setPosition(b.x, b.y - arriba).setAlpha(b.caido ? 0.5 : 1);
}
