// ===============================================================
//  MINI DESAFÍOS
//  Cada cierto tiempo aparece uno con un aviso arriba y una cuenta
//  regresiva. Si lo cumples ganas una recompensa (un objeto raro o
//  mejor, o mucha experiencia). Si fallas, no pasa nada.
//   - Búsqueda: encuentra cosas perdidas repartidas en el mapa.
//   - Aguanta: quédate dentro de una zona marcada mientras llegan más enemigos.
//   - Cacería: derrota muchos enemigos rápido.
//   - Sin morder: sobrevive sin atacar (el ataque se apaga solo).
//  Los números están en src/config.js (sección DESAFIOS).
//  Lo usan src/scenes/GameScene.js y src/pausa.js (pestaña "Desafíos").
//
//  Para agregar un desafío nuevo:
//   1. Agrega sus números en CONFIG.DESAFIOS con PESO y TIEMPO_MS.
//   2. Agrégalo en la lista DESAFIOS de abajo (mismo id) con su nombre y frase.
//   3. Programa cómo empieza, cómo avanza y cuándo se cumple en
//      empezarDesafio, avanzarDesafio y textoProgresoDesafio (más abajo).
// ===============================================================

const DESAFIOS = [
  { id: 'busqueda',  nombre: 'Búsqueda',   frase: (c) => 'Encuentra ' + c.OBJETOS + ' cosas perdidas en la plaza (sigue las flechas doradas)' },
  { id: 'aguanta',   nombre: 'Aguanta',    frase: (c) => 'Quédate ' + Math.round(c.DENTRO_MS / 1000) + ' segundos dentro de la zona dorada. ¡Llegan más enemigos!' },
  { id: 'caceria',   nombre: 'Cacería',    frase: (c) => 'Derrota a ' + c.ENEMIGOS + ' enemigos' },
  { id: 'sinMorder', nombre: 'Sin morder', frase: (c) => 'Sobrevive ' + Math.round(c.TIEMPO_MS / 1000) + ' segundos sin atacar (tu ataque se apaga)' }
];

const COLOR_DESAFIO = 0xffd54f;   // dorado: flechas, zona de Aguanta y cosas perdidas

// Dibujo de 10 x 10 de las cosas perdidas de la Búsqueda: una cajita con "?"
const SPRITE_PERDIDO = {
  colores: { A: 0x42a5f5, Y: 0xffd54f },
  cuadros: [[
    'KKKKKKKKKK',
    'KAAAYYAAAK',
    'KAAYAAYAAK',
    'KAAAAAYAAK',
    'KAAAAYAAAK',
    'KAAAYAAAAK',
    'KAAAAAAAAK',
    'KAAAYAAAAK',
    'KAAAAAAAAK',
    'KKKKKKKKKK'
  ]]
};

function buscarDesafio(id) {
  return DESAFIOS.find((d) => d.id === id) || { id, nombre: id, frase: () => '' };
}

function fraseDesafio(id) {
  return buscarDesafio(id).frase(CONFIG.DESAFIOS[id] || {});
}

// Estado inicial (al empezar la partida)
function iniciarDesafios(escena) {
  if (!escena.textures.exists('perdido')) crearTexturaPixel(escena, 'perdido', SPRITE_PERDIDO);
  escena.desafio = null;                 // el desafío que está corriendo (o null)
  escena.desafiosCompletados = [];       // { id, nombre, minuto, recompensa }
  escena.desafiosFallidos = 0;
  escena.proximoDesafio = CONFIG.DESAFIO_PRIMERO_MS;

  // Aviso arriba al centro (debajo del nivel y de la barra del jefe)
  escena.textoDesafio = escena.add.text(escena.scale.width / 2, 72 + margenExtra(), '', {
    fontFamily: FUENTE, fontSize: '17px', color: '#ffe082', fontStyle: 'bold',
    stroke: '#000000', strokeThickness: 4, align: 'center'
  }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001).setVisible(false);
  escena.flechasDesafio = escena.add.graphics().setScrollFactor(0).setDepth(901);
}

// Elige un desafío al azar según su PESO
function sortearDesafio() {
  const ids = Object.keys(CONFIG.DESAFIOS || {}).filter((id) => (CONFIG.DESAFIOS[id].PESO || 0) > 0);
  if (ids.length === 0) return null;
  const total = ids.reduce((s, id) => s + CONFIG.DESAFIOS[id].PESO, 0);
  let sorteo = Math.random() * total;
  for (const id of ids) {
    sorteo -= CONFIG.DESAFIOS[id].PESO;
    if (sorteo < 0) return id;
  }
  return ids[ids.length - 1];
}

// ¿El perro tiene el ataque apagado por el desafío "Sin morder"?
function desafioSinAtacar(escena) {
  return !!(escena.desafio && escena.desafio.id === 'sinMorder');
}

// Mientras dura "Aguanta", los enemigos salen más seguido
function multiplicadorAparicionDesafio(escena) {
  if (escena.desafio && escena.desafio.id === 'aguanta') return CONFIG.DESAFIOS.aguanta.APARICION || 1;
  return 1;
}

// ---------------- Empezar ----------------

function empezarDesafio(escena, id) {
  id = id || sortearDesafio();
  if (!id) return;
  const c = CONFIG.DESAFIOS[id];
  const ahora = escena.tiempoSobrevivido;
  const d = { id, inicio: ahora, hasta: ahora + c.TIEMPO_MS, progreso: 0, cosas: [], zona: null };

  if (id === 'busqueda') {
    for (let i = 0; i < c.OBJETOS; i++) {
      const lugar = lugarCosaPerdida(escena, c, d.cosas);
      const cosa = escena.add.image(lugar.x, lugar.y, 'perdido', 0).setScale(ESCALA_PIXEL).setDepth(805);
      escena.tweens.add({ targets: cosa, y: lugar.y - 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      d.cosas.push(cosa);
    }
  } else if (id === 'aguanta') {
    const lugar = lugarZonaAguanta(escena, c);
    const g = escena.add.graphics({ x: lugar.x, y: lugar.y }).setDepth(801);
    g.fillStyle(COLOR_DESAFIO, 0.12);
    g.fillCircle(0, 0, c.RADIO);
    g.lineStyle(4, COLOR_DESAFIO, 0.95);
    g.strokeCircle(0, 0, c.RADIO);
    g.lineStyle(2, COLOR_DESAFIO, 0.5);
    g.strokeCircle(0, 0, c.RADIO - 10);
    const etiqueta = escena.add.text(lugar.x, lugar.y - c.RADIO - 14, '¡Aguanta aquí!', {
      fontFamily: FUENTE, fontSize: '16px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(802);
    d.zona = { x: lugar.x, y: lugar.y, radio: c.RADIO, grafico: g, etiqueta, dentroMs: 0 };
  } else if (id === 'caceria') {
    d.derrotadosAlEmpezar = escena.derrotados;
  }

  escena.desafio = d;
  escena.mostrarAviso('¡Desafío: ' + buscarDesafio(id).nombre + '!', '#ffd54f');
  escena.mostrarAviso(fraseDesafio(id), '#ffffff');
}

// Punto libre para una cosa perdida: lejos del perro, dentro del mapa,
// fuera de obstáculos (la pileta es un obstáculo) y no junto a otra cosa
function lugarCosaPerdida(escena, c, otras) {
  const borde = 120;
  for (let intento = 0; intento < 40; intento++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = Phaser.Math.Between(c.DISTANCIA_MIN, c.DISTANCIA_MAX);
    const x = escena.perro.x + Math.cos(ang) * dist;
    const y = escena.perro.y + Math.sin(ang) * dist;
    if (x < borde || y < borde || x > CONFIG.MAPA_ANCHO - borde || y > CONFIG.MAPA_ALTO - borde) continue;
    if (!escena.plaza.libre(x, y, 24)) continue;
    if (otras.some((o) => Phaser.Math.Distance.Between(x, y, o.x, o.y) < 300)) continue;
    return { x, y };
  }
  // Si no encontró (raro), en algún lugar libre del mapa
  return escena.plaza.buscarLibre(
    Phaser.Math.Between(borde, CONFIG.MAPA_ANCHO - borde),
    Phaser.Math.Between(borde, CONFIG.MAPA_ALTO - borde), 24);
}

// Centro de la zona de "Aguanta": a cierta distancia del perro, nunca
// encima de la pileta ni encima del perro, y dentro del mapa
function lugarZonaAguanta(escena, c) {
  const r = c.RADIO;
  const centro = escena.plaza.centro;
  const minPerro = r + escena.base.RADIO + CONFIG.ZONA_MARGEN;
  for (let intento = 0; intento < 40; intento++) {
    const ang = Math.random() * Math.PI * 2;
    const dist = Math.max(minPerro, c.DISTANCIA) + Math.floor(intento / 8) * 80;
    const x = escena.perro.x + Math.cos(ang) * dist;
    const y = escena.perro.y + Math.sin(ang) * dist;
    if (x - r < 0 || y - r < 0 || x + r > CONFIG.MAPA_ANCHO || y + r > CONFIG.MAPA_ALTO) continue;
    if (Phaser.Math.Distance.Between(x, y, centro.x, centro.y) < r + CONFIG.PILETA_RADIO + CONFIG.ZONA_MARGEN) continue;
    return { x, y };
  }
  // Último recurso: en una esquina del prado, lejos de la pileta
  return { x: r + 200, y: r + 200 };
}

// ---------------- Avanzar (en cada cuadro) ----------------

function actualizarDesafios(escena, delta) {
  const ahora = escena.tiempoSobrevivido;

  if (!escena.desafio) {
    escena.textoDesafio.setVisible(false);
    escena.flechasDesafio.clear();
    // Llega uno nuevo (si el jefe está vivo o ya amanece, espera)
    if (ahora >= escena.proximoDesafio && !escena.amaneciendo && !escena.jefeVivo()) empezarDesafio(escena);
    return;
  }

  const d = escena.desafio;
  if (avanzarDesafio(escena, d, delta)) {
    completarDesafio(escena);
  } else if (ahora >= d.hasta) {
    // Sin morder se cumple al llegar al final del tiempo
    if (d.id === 'sinMorder') completarDesafio(escena);
    else fallarDesafio(escena);
  } else {
    escena.textoDesafio.setText('DESAFÍO ' + buscarDesafio(d.id).nombre + ':  ' + textoProgresoDesafio(escena, d) +
      '   ·   quedan ' + segundosRestantes(escena, d) + ' s');
    escena.textoDesafio.setColor(d.hasta - ahora < 10000 && Math.floor(ahora / 300) % 2 === 0 ? '#ff8a80' : '#ffe082');
    escena.textoDesafio.setY(escena.jefeVivo() ? 90 : 72); // si está la barra del jefe, más abajo
    escena.textoDesafio.setVisible(true);
    dibujarFlechasDesafio(escena, d);
  }
}

// Devuelve true si ya se cumplió
function avanzarDesafio(escena, d, delta) {
  const c = CONFIG.DESAFIOS[d.id];
  const perro = escena.perro;

  if (d.id === 'busqueda') {
    const alcance = escena.base.RADIO + c.RECOGER;
    d.cosas = d.cosas.filter((cosa) => {
      if (Phaser.Math.Distance.Between(perro.x, perro.y, cosa.x, cosa.y) > alcance) return true;
      escena.tweens.killTweensOf(cosa);
      cosa.destroy();
      d.progreso++;
      escena.textoFlotante('¡Encontrada! ' + d.progreso + ' / ' + c.OBJETOS, '#ffe082');
      return false;
    });
    return d.progreso >= c.OBJETOS;
  }

  if (d.id === 'aguanta') {
    const z = d.zona;
    const dentro = Phaser.Math.Distance.Between(perro.x, perro.y, z.x, z.y) <= z.radio;
    if (dentro) z.dentroMs += delta;
    z.grafico.setAlpha(dentro ? 1 : 0.6);
    d.progreso = z.dentroMs;
    return z.dentroMs >= c.DENTRO_MS;
  }

  if (d.id === 'caceria') {
    d.progreso = escena.derrotados - d.derrotadosAlEmpezar;
    return d.progreso >= c.ENEMIGOS;
  }

  return false; // sinMorder: se cumple cuando se acaba el tiempo
}

// Texto corto del progreso (para el aviso de arriba y la pausa)
function textoProgresoDesafio(escena, d) {
  const c = CONFIG.DESAFIOS[d.id];
  if (d.id === 'busqueda') return d.progreso + ' / ' + c.OBJETOS + ' cosas';
  if (d.id === 'aguanta') {
    const dentro = Phaser.Math.Distance.Between(escena.perro.x, escena.perro.y, d.zona.x, d.zona.y) <= d.zona.radio;
    return Math.floor(d.progreso / 1000) + ' / ' + Math.round(c.DENTRO_MS / 1000) + ' s dentro' + (dentro ? '' : '  (¡entra a la zona!)');
  }
  if (d.id === 'caceria') return d.progreso + ' / ' + c.ENEMIGOS + ' enemigos';
  if (d.id === 'sinMorder') return 'sin atacar';
  return '';
}

function segundosRestantes(escena, d) {
  return Math.max(0, Math.ceil((d.hasta - escena.tiempoSobrevivido) / 1000));
}

// Flechas doradas en el borde de la pantalla hacia las cosas perdidas
// (o hacia la zona de Aguanta) que no se ven
function dibujarFlechasDesafio(escena, d) {
  const g = escena.flechasDesafio;
  g.clear();
  const puntos = d.id === 'busqueda' ? d.cosas : d.id === 'aguanta' ? [d.zona] : [];
  if (puntos.length === 0) return;

  const cam = escena.cameras.main;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const cx = w / 2;
  const cy = h / 2;
  const margen = 34;
  puntos.forEach((p) => {
    const sx = p.x - cam.scrollX;
    const sy = p.y - cam.scrollY;
    if (sx >= 0 && sx <= w && sy >= 0 && sy <= h) return; // se ve en pantalla
    const dx = sx - cx;
    const dy = sy - cy;
    const t = Math.min((cx - margen) / Math.max(Math.abs(dx), 0.001), (cy - margen) / Math.max(Math.abs(dy), 0.001));
    const px = cx + dx * t;
    const py = cy + dy * t;
    const a = Math.atan2(dy, dx);
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    g.fillStyle(0x000000, 0.7);
    g.fillTriangle(
      px + cos * 17, py + sin * 17,
      px - cos * 11 - sin * 13, py - sin * 11 + cos * 13,
      px - cos * 11 + sin * 13, py - sin * 11 - cos * 13
    );
    g.fillStyle(COLOR_DESAFIO, 1);
    g.fillTriangle(
      px + cos * 14, py + sin * 14,
      px - cos * 9 - sin * 10, py - sin * 9 + cos * 10,
      px - cos * 9 + sin * 10, py - sin * 9 - cos * 10
    );
  });
}

// ---------------- Terminar ----------------

function completarDesafio(escena) {
  const d = escena.desafio;
  const nombre = buscarDesafio(d.id).nombre;
  terminarDesafio(escena);
  let recompensa = darRecompensaDesafio(escena);
  // Algunos desafíos (CONFIG.ULTRA_DESAFIOS) además dan siempre un ultra raro (src/coleccionables.js)
  const ultra = ultraPorDesafio(escena, d.id);
  if (ultra) recompensa += ' + ' + ultra;
  escena.desafiosCompletados.push({ id: d.id, nombre, minuto: escena.formatearTiempo(escena.tiempoSobrevivido), recompensa });
  escena.mostrarAviso('¡Desafío cumplido: ' + nombre + '!', '#9ccc65');
  escena.mostrarAviso('Recompensa: ' + recompensa, '#ffe082');
}

function fallarDesafio(escena) {
  const nombre = buscarDesafio(escena.desafio.id).nombre;
  terminarDesafio(escena);
  escena.desafiosFallidos++;
  escena.mostrarAviso('Desafío fallido: ' + nombre + ' (no pasa nada)', '#b0bec5');
}

// Borra lo que dejó el desafío y programa el siguiente
function terminarDesafio(escena) {
  const d = escena.desafio;
  if (!d) return;
  d.cosas.forEach((cosa) => { escena.tweens.killTweensOf(cosa); cosa.destroy(); });
  if (d.zona) { d.zona.grafico.destroy(); d.zona.etiqueta.destroy(); }
  escena.desafio = null;
  escena.textoDesafio.setVisible(false);
  escena.flechasDesafio.clear();
  escena.proximoDesafio = escena.tiempoSobrevivido + CONFIG.DESAFIO_CADA_MS;
}

// Un objeto raro o mejor (directo al inventario) o mucha experiencia.
// Devuelve el texto de lo que ganó.
function darRecompensaDesafio(escena) {
  if (Math.random() < CONFIG.DESAFIO_OBJETO_PROBABILIDAD) {
    // Solo objetos que todavía sirven (no al máximo y que quepan en el inventario).
    // Si no queda ninguno, huesitos en vez del objeto (v0.21)
    const posibles = escena.objetosUtiles();
    if (posibles.length === 0) return '+' + escena.darHuesitosRecompensa() + ' huesitos';
    const objeto = Phaser.Math.RND.pick(posibles);
    const rareza = escena.sortearRareza(CONFIG.DESAFIO_RAREZA_MINIMA);
    if (objeto && escena.recogerObjeto(objeto.id, rareza)) {
      return objeto.nombre + ' (' + buscarRareza(rareza).nombre.toLowerCase() + ')';
    }
  }
  // La experiencia del desafío se gana aunque estés en la zona segura
  escena.ganarXP(CONFIG.DESAFIO_XP);
  return '+' + CONFIG.DESAFIO_XP + ' de experiencia';
}

// Modo de prueba (tecla X): empieza un desafío al azar
// (si ya había uno, se cancela sin contar como fallido)
function pruebaDesafio(escena) {
  if (escena.desafio) terminarDesafio(escena);
  empezarDesafio(escena);
}

// Al terminar la partida: se borra lo que quedaba en pantalla
function ocultarDesafio(escena) {
  if (escena.desafio) {
    const d = escena.desafio;
    d.cosas.forEach((cosa) => { escena.tweens.killTweensOf(cosa); cosa.destroy(); });
    if (d.zona) { d.zona.grafico.destroy(); d.zona.etiqueta.destroy(); }
  }
  escena.textoDesafio.setVisible(false);
  escena.flechasDesafio.clear();
}
