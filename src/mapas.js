// ===============================================================
//  MAPAS: la lista de mapas que se pueden elegir antes de jugar.
//
//  Cada mapa tiene:
//   id:          nombre interno sin espacios ni tildes (no lo cambies:
//                los ultra raros y el último mapa elegido lo usan)
//   nombre:      el que se ve en la pantalla de mapas
//   descripcion: una frase corta para la carta del mapa
//   paleta:      colores del suelo y de los obstáculos (formato 0xRRGGBB
//                o '#rrggbb' para las líneas pintadas en el suelo)
//   obstaculos:  tipos de obstáculos que tiene (se muestran en la carta)
//   ultraRaros:  ids de los ultra raros que SOLO caen en este mapa
//                (sus textos y dibujos están en src/coleccionables.js)
//   desbloqueado: true = se puede elegir (por ahora todos)
//
//  El tamaño y las cantidades (cuántos buses, puestos, faroles...) y la
//  probabilidad de los ultra raros de cada mapa están en src/config.js,
//  sección MAPAS. El motor común (suelo, choques, luz) está en src/mapa.js.
//
//  Para agregar un mapa nuevo:
//   1. Copia un bloque de MAPAS (aquí abajo) con un id nuevo.
//   2. En src/config.js, dentro de MAPAS, copia un bloque con ese id.
//   3. Escribe su función "generar" (dónde va cada cosa) y "pintarSuelo".
//   4. En src/coleccionables.js agrega sus ultra raros.
// ===============================================================

const MAPAS = [
  {
    id: 'plaza',
    nombre: 'La plaza',
    descripcion: 'Pasto, pileta y autos estacionados. El barrio de siempre, ahora el doble de grande.',
    obstaculos: ['árboles', 'bancas', 'basureros', 'autos', 'pileta'],
    ultraRaros: ['chalequito', 'sweater', 'peluche', 'mantita', 'capa', 'antifaz',
      'antipulgas', 'lentes', 'zapatilla', 'panuelo', 'cascabel', 'gorro'],
    desbloqueado: true,
    paleta: {
      fondo: 0x2f5a2a,          // color de la miniatura en la pantalla de mapas
      baldosa: [0x6b6864, 0x5f5c58, 0x5f5c58], junta: 0x4a4744,
      pasto: [0x2f5a2a, 0x3d7234, 0x23461f],
      tierra: [0x6b4f35, 0x8a6a4a, 0x5a4129],
      asfalto: [0x2c2c30, 0x37373b, 0x222225],
      solera: '#9a9a9a', bordePasto: '#1a3517', lineaCalle: '#8a7a2a',
      arbol: [0x2e6b30, 0x0f2a14, 0x4a8f3c, 0x1f4d22, 0x24572a], // normal, borde, luz, sombra, detalle
      autos: [                  // [carrocería, techo]
        [0xb3261e, 0x7a1813],   // rojo
        [0x1f4e9c, 0x153566],   // azul
        [0xd8d8d8, 0xa8a8a8],   // blanco
        [0xe0b000, 0x9c7a00]    // amarillo
      ]
    },
    crearTexturas: (escena, p) => crearTexturasPlaza(escena, p),
    generar: () => generarPlaza(),
    pintarSuelo: (h, mapa, p) => pintarSueloPlaza(h, mapa, p)
  },

  {
    id: 'terminal',
    nombre: 'Terminal de buses',
    descripcion: 'Andenes largos y buses estacionados. Cuidado, que los micros no avisan.',
    obstaculos: ['buses', 'bancas', 'basureros'],
    ultraRaros: ['boleto', 'jockey'],
    desbloqueado: true,
    paleta: {
      fondo: 0x2c2c30,
      vereda: [0x6b6864, 0x5f5c58, 0x5f5c58], junta: 0x4a4744,
      asfalto: [0x2a2a2e, 0x34343a, 0x202024],
      anden: [0x9a968e, 0x8a867e, 0xa8a49c],     // cemento claro de los andenes
      lineaSeguridad: '#e0b000',                  // franja amarilla del borde del andén
      lineaEstacionamiento: '#c8c8c8',            // líneas blancas de cada estacionamiento
      solera: '#9a9a9a',
      buses: [                  // [carrocería, techo]
        [0xe8e8e8, 0xbdbdbd],   // blanco
        [0x2e7d32, 0x1b5e20],   // verde
        [0xef6c00, 0xbf5600],   // naranjo
        [0x1f4e9c, 0x153566],   // azul
        [0xb3261e, 0x7a1813]    // rojo
      ]
    },
    crearTexturas: (escena, p) => crearTexturasTerminal(escena, p),
    generar: () => generarTerminal(),
    pintarSuelo: (h, mapa, p) => pintarSueloTerminal(h, mapa, p),

    // TODO (misiones): eventos de misión de la terminal, por ejemplo ESCOLTAR a
    // los guardias de un andén a otro. Todavía NO están hechos. La idea:
    //  - Cada evento sería { id, nombre, desde (ms), cada (ms), iniciar(escena), actualizar(escena, delta) }.
    //  - GameScene llamaría actualizarEventosMapa(escena, delta) (src/mapas.js, abajo),
    //    que hoy no hace nada.
    //  - Sus números irían en src/config.js, dentro de MAPAS.terminal (por ejemplo MISION_ESCOLTA).
    eventos: []
  },

  {
    id: 'feria',
    nombre: 'Feria libre',
    descripcion: 'Corridas de puestos, toldos y cajones. Huele a cilantro y a pelea.',
    obstaculos: ['puestos', 'toldos', 'cajones'],
    ultraRaros: ['yapa', 'carro'],
    desbloqueado: true,
    paleta: {
      fondo: 0x3a3a40,
      vereda: [0x6b6864, 0x5f5c58, 0x5f5c58], junta: 0x4a4744,
      asfalto: [0x323238, 0x3c3c44, 0x28282e],
      solera: '#9a9a9a',
      lineaCalle: '#d0d0d0',    // líneas blancas de la calle
      manchas: ['#a07848', '#8a6438', '#4f8a3a', '#6aa848'], // cartones y hojas de lechuga
      madera: [0xa8743a, 0x7a5228],            // mesones y cajones [claro, oscuro]
      // Toldos a rayas: [color 1, color 2]
      toldos: [
        [0x1f63c8, 0xeeeeee],   // azul y blanco
        [0xd63c3c, 0xeeeeee],   // rojo y blanco
        [0x2e7d32, 0xf2d64b],   // verde y amarillo
        [0xef6c00, 0x5c3b8a]    // naranjo y morado
      ],
      // Frutas y verduras de los puestos y cajones: [color, sombra]
      verduras: [
        [0xe53935, 0x9e1f1c],   // tomates
        [0xff9800, 0xb86a00],   // naranjas
        [0x7cb342, 0x4c7a20],   // lechugas
        [0xfdd835, 0xb59a10],   // limones
        [0x4e342e, 0x2e1d18],   // paltas
        [0x8e24aa, 0x5c1470]    // betarragas
      ]
    },
    crearTexturas: (escena, p) => crearTexturasFeria(escena, p),
    generar: () => generarFeria(),
    pintarSuelo: (h, mapa, p) => pintarSueloFeria(h, mapa, p)
  }
];

// Choques de los obstáculos nuevos (en píxeles de pantalla)
const CHOQUE_BUS = { ANCHO: 46, ALTO: 122 };     // bus parado (trompa hacia abajo)
const CHOQUE_PUESTO = { ANCHO: 92, ALTO: 34 };
const CHOQUE_TOLDO = { ANCHO: 104, ALTO: 62 };
const CHOQUE_CAJONES = { ANCHO: 30, ALTO: 30 };

// ===============================================================
//  De aquí para abajo está el código. No hace falta tocarlo para
//  cambiar nombres, colores o números.
// ===============================================================

// El mapa con ese id (o el inicial si no existe)
function buscarMapa(id) {
  return MAPAS.find((m) => m.id === id && CONFIG.MAPAS[m.id]) ||
    MAPAS.find((m) => m.id === CONFIG.MAPAS.INICIAL) || MAPAS[0];
}

// Solo los mapas que tienen textos (aquí) y números (config.js)
function listaMapas() {
  return MAPAS.filter((m) => CONFIG.MAPAS[m.id]);
}

// Pone el tamaño del mapa en CONFIG.MAPA_ANCHO y CONFIG.MAPA_ALTO
// (todo el resto del juego usa esos dos números)
function aplicarTamanoMapa(id) {
  const cfg = CONFIG.MAPAS[buscarMapa(id).id];
  CONFIG.MAPA_ANCHO = cfg.ANCHO;
  CONFIG.MAPA_ALTO = cfg.ALTO;
}

// Último mapa elegido (se guarda en el navegador; si no se puede, se usa el inicial)
function mapaGuardado() {
  try {
    const id = window.localStorage.getItem(CONFIG.MAPAS.GUARDADO);
    if (id && CONFIG.MAPAS[id]) return id;
  } catch (e) { /* sin guardado: no pasa nada */ }
  return buscarMapa(CONFIG.MAPAS.INICIAL).id;
}
function guardarMapaElegido(id) {
  try { window.localStorage.setItem(CONFIG.MAPAS.GUARDADO, id); } catch (e) { /* no pasa nada */ }
}

// Multiplicador de probabilidad de ultra raros del mapa (config.js)
function multiplicadorUltraMapa(id) {
  const cfg = CONFIG.MAPAS[id];
  return cfg && typeof cfg.ULTRA_MULTIPLICADOR === 'number' ? cfg.ULTRA_MULTIPLICADOR : 1;
}

// TODO (misiones): aquí se actualizarán los eventos de misión del mapa
// (ver "eventos" de la Terminal de buses). Por ahora no hace nada.
function actualizarEventosMapa(escena, delta) {
  // const def = buscarMapa(escena.mapaId);
  // def.eventos.forEach((ev) => ev.actualizar(escena, delta));
}

// Colores de cada tipo de obstáculo en la miniatura de la pantalla de mapas
const COLORES_MINIATURA = {
  arbol: 0x1f4d22, banca: 0x8d5a34, basurero: 0x2e7d32, auto: 0xb3261e, pileta: 0x5f95d6,
  bus: 0xe8e8e8, puesto: 0xa8743a, toldo: 0x1f63c8, cajones: 0xff9800
};

// Dibuja una miniatura del mapa (vista desde arriba) en el rectángulo x, y, w, h.
// Genera el mapa igual que en la partida, así la miniatura muestra los lugares reales.
function dibujarMiniaturaMapa(g, id, x, y, w, h) {
  const def = buscarMapa(id);
  aplicarTamanoMapa(def.id);
  const mapa = def.generar();
  const p = def.paleta;
  const ex = w / CONFIG.MAPA_ANCHO;
  const ey = h / CONFIG.MAPA_ALTO;
  const rect = (r, color) => g.fillStyle(color, 1).fillRect(x + r.x * ex, y + r.y * ey, Math.max(1, r.w * ex), Math.max(1, r.h * ey));

  g.fillStyle(p.fondo, 1).fillRect(x, y, w, h);
  if (def.id === 'plaza') {
    rect({ x: 0, y: 0, w: CONFIG.MAPA_ANCHO, h: CONFIG.MAPA_ALTO }, p.asfalto[0]);
    const c = CONFIG.CALLE_ANCHO;
    rect({ x: c, y: c, w: CONFIG.MAPA_ANCHO - c * 2, h: CONFIG.MAPA_ALTO - c * 2 }, p.baldosa[0]);
  }
  (mapa.pastos || []).forEach((r) => rect(r, p.pasto[0]));
  (mapa.senderos || []).forEach((r) => rect(r, p.tierra[0]));
  (mapa.andenes || []).forEach((r) => rect(r, p.anden[0]));
  mapa.solidos.forEach((s) => {
    const color = COLORES_MINIATURA[s.tipo] || 0x9e9e9e;
    if (s.forma === 'circulo') g.fillStyle(color, 1).fillCircle(x + s.x * ex, y + s.y * ey, Math.max(1.2, s.r * ex));
    else rect({ x: s.x - s.w / 2, y: s.y - s.h / 2, w: s.w, h: s.h }, color);
  });
  mapa.faroles.forEach((f) => g.fillStyle(0xffd54f, 0.8).fillRect(x + f.x * ex - 1, y + f.y * ey - 1, 2, 2));
  g.lineStyle(2, 0x000000, 1).strokeRect(x, y, w, h);
}

// Fila de "n" letras iguales (para armar dibujos largos)
function filaRepetida(inicio, letra, n, fin) {
  return inicio + letra.repeat(n) + fin;
}

// ---------------- Terminal de buses ----------------

// Bus visto desde arriba, 16 x 42 píxeles (la trompa mira hacia ARRIBA).
// C = carrocería, c = techo, V = vidrios, L = focos, R = luces traseras, a = escotilla del techo
function dibujoBus() {
  const filas = [
    '..KKKKKKKKKKKK..',
    '.KCCCCCCCCCCCCK.',
    'KCLCCCCCCCCCCLCK',
    'KVVVVVVVVVVVVVVK',
    'KVVVVVVVVVVVVVVK',
    'KCCCCCCCCCCCCCCK'
  ];
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 22) filas.push('KVcccKKKKKKcccVK');
    else if (i === 9 || i === 23) filas.push('KVcccKaaaaKcccVK');
    else if (i === 10 || i === 24) filas.push('KVcccKKKKKKcccVK');
    else if (i % 5 === 4) filas.push('KCccccccccccccCK'); // pilares entre ventanas
    else filas.push('KVccccccccccccVK');
  }
  filas.push('KCCCCCCCCCCCCCCK', 'KRCCCCCCCCCCCCRK', '.KCCCCCCCCCCCCK.', '..KKKKKKKKKKKK..');
  return filas;
}

function crearTexturasTerminal(escena, p) {
  tileRuido(escena, 'tile_terminal_vereda', p.vereda, 0.12, 0, p.junta);
  tileRuido(escena, 'tile_terminal_asfalto', p.asfalto, 0.1, 0.1);
  tileRuido(escena, 'tile_terminal_anden', p.anden, 0.1, 0.06);
  const bus = dibujoBus();
  p.buses.forEach((c, i) => {
    if (escena.textures.exists('bus_' + i)) return;
    crearTexturaPixel(escena, 'bus_' + i, {
      colores: { C: c[0], c: c[1], V: 0x37557a, L: 0xfff3b0, R: 0xff4040, a: 0x9e9e9e },
      cuadros: [bus]
    });
  });
}

// Centro (en Y) de cada andén
function andenesTerminal(cfg) {
  const lista = [];
  for (let i = 0; i < cfg.ANDENES; i++) {
    lista.push(cfg.ALTO / 2 + (i - (cfg.ANDENES - 1) / 2) * cfg.ANDEN_SEPARACION);
  }
  return lista;
}

function generarTerminal() {
  const cfg = CONFIG.MAPAS.terminal;
  const rnd = new Phaser.Math.RandomDataGenerator([String(CONFIG.MAPA_SEMILLA) + '_terminal']);
  const A = cfg.ANCHO;
  const H = cfg.ALTO;
  const mapa = mapaVacio(A / 2, H / 2, { x: A / 2, y: H / 2 });
  const x0 = cfg.ANDEN_MARGEN;
  const x1 = A - cfg.ANDEN_MARGEN;
  const ys = andenesTerminal(cfg);
  const lejosDelInicio = (x, y, d) => Phaser.Math.Distance.Between(x, y, mapa.inicio.x, mapa.inicio.y) > d;

  // El perro parte en la calle entre los dos andenes del medio
  const medio = Math.floor(ys.length / 2);
  if (ys.length >= 2) mapa.inicio.y = (ys[medio - 1] + ys[medio]) / 2 - 40;

  // Andenes (suelo) y estacionamientos de buses (al norte de cada andén)
  mapa.andenes = ys.map((y) => ({ x: x0, y: y - cfg.ANDEN_ALTO / 2, w: x1 - x0, h: cfg.ANDEN_ALTO }));
  mapa.estacionamientos = [];
  ys.forEach((y) => {
    const yBus = y - cfg.ANDEN_ALTO / 2 - CHOQUE_BUS.ALTO / 2 - 8;
    for (let x = x0 + cfg.BUS_SEPARACION / 2; x < x1 - cfg.BUS_SEPARACION / 2; x += cfg.BUS_SEPARACION) {
      mapa.estacionamientos.push({ x, y: yBus });
    }
  });

  // Faroles sobre los andenes
  const lugaresFaroles = [];
  ys.forEach((y) => {
    for (let x = x0 + cfg.FAROL_CADA / 2; x < x1; x += cfg.FAROL_CADA) lugaresFaroles.push({ x, y });
  });
  ponerFaroles(mapa, rnd.shuffle(lugaresFaroles), cfg.FAROLES);

  // Buses estacionados: la trompa hacia el andén (por eso van girados 180°)
  let buses = 0;
  rnd.shuffle(mapa.estacionamientos.slice()).forEach((e) => {
    if (buses >= cfg.BUSES) return;
    if (!lejosDelInicio(e.x, e.y, 160)) return;
    if (!puntoLibre(mapa.solidos, e.x, e.y, CHOQUE_BUS.ANCHO / 2 + 10)) return;
    mapa.solidos.push({ forma: 'rect', x: e.x, y: e.y, w: CHOQUE_BUS.ANCHO, h: CHOQUE_BUS.ALTO, tipo: 'bus' });
    mapa.adornos.push({ clave: 'bus_' + rnd.between(0, buscarMapa('terminal').paleta.buses.length - 1),
      x: e.x, y: e.y, angulo: 180, profundidad: 2 });
    buses++;
  });

  // Bancas sobre los andenes (mirando a lo largo del andén)
  const bancas = [];
  for (let intento = 0; intento < cfg.BANCAS * 40 && bancas.length < cfg.BANCAS; intento++) {
    const y = rnd.pick(ys) + rnd.pick([-1, 1]) * 22;
    const x = rnd.between(x0 + 60, x1 - 60);
    const banca = ponerBanca(mapa, x, y, true, 60);
    if (banca) bancas.push(banca);
  }
  ponerBasureros(mapa, bancas, cfg.BASUREROS, rnd);
  return mapa;
}

function pintarSueloTerminal(h, mapa, p) {
  const cfg = CONFIG.MAPAS.terminal;
  const A = cfg.ANCHO;
  const H = cfg.ALTO;
  const v = cfg.VEREDA;
  const E = ESCALA_PIXEL;
  const ctx = h.ctx;

  h.rect({ x: 0, y: 0, w: A, h: H }, h.patron('tile_terminal_vereda'));
  h.rect({ x: v, y: v, w: A - v * 2, h: H - v * 2 }, h.patron('tile_terminal_asfalto'));
  h.borde({ x: v, y: v, w: A - v * 2, h: H - v * 2 }, p.solera);

  // Líneas blancas de cada estacionamiento (a los lados de cada bus)
  ctx.fillStyle = p.lineaEstacionamiento;
  mapa.estacionamientos.forEach((e) => {
    const izq = Math.round((e.x - cfg.BUS_SEPARACION / 2) / E);
    const arriba = Math.round((e.y - CHOQUE_BUS.ALTO / 2 - 6) / E);
    const largo = Math.round((CHOQUE_BUS.ALTO + 14) / E);
    ctx.fillRect(izq, arriba, 1, largo);
  });

  // Andenes con franja amarilla de seguridad en los dos bordes largos
  mapa.andenes.forEach((r) => {
    h.rect(r, h.patron('tile_terminal_anden'));
    h.borde(r, p.solera);
    ctx.fillStyle = p.lineaSeguridad;
    const x = Math.round(r.x / E) + 1;
    const w = Math.round(r.w / E) - 2;
    for (let i = 0; i < w; i += 4) {
      ctx.fillRect(x + i, Math.round(r.y / E) + 2, 2, 1);
      ctx.fillRect(x + i, Math.round((r.y + r.h) / E) - 3, 2, 1);
    }
  });
}

// ---------------- Feria libre ----------------

// Mesón de un puesto visto desde arriba (32 x 12): marco de madera y
// 4 montoncitos de fruta o verdura (colores de paleta.verduras)
function dibujoPuesto() {
  const filas = ['KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', filaRepetida('K', 'M', 30, 'K')];
  for (let y = 0; y < 8; y++) {
    let fila = 'KM';
    for (let x = 0; x < 28; x++) {
      const grupo = Math.floor(x / 7);           // 4 grupos de 7 píxeles
      const borde = x % 7 === 6;                 // separación entre grupos
      if (borde) fila += 'm';
      else fila += (x + y) % 2 ? 'abcd'[grupo] : 'ABCD'[grupo]; // fruta con brillo y sombra
    }
    filas.push(fila + 'MK');
  }
  filas.push(filaRepetida('K', 'M', 30, 'K'), 'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK');
  return filas;
}

// Toldo de lona a rayas visto desde arriba (36 x 22), con el borde de abajo ondulado
function dibujoToldo() {
  const filas = [filaRepetida('', 'K', 36, '')];
  for (let y = 0; y < 19; y++) {
    let fila = 'K';
    for (let x = 0; x < 34; x++) fila += Math.floor(x / 3) % 2 ? 'T' : 't';
    filas.push(fila + 'K');
  }
  let onda1 = '';
  let onda2 = '';
  for (let x = 0; x < 36; x++) {
    onda1 += x % 3 === 2 ? 'K' : Math.floor((x - 1) / 3) % 2 ? 'T' : 't';
    onda2 += x % 3 === 1 ? 'K' : '.';
  }
  filas.push(onda1, onda2);
  return filas;
}

// Pila de cajones de fruta (11 x 11): tablas de madera y fruta arriba
const DIBUJO_CAJONES = [
  'KKKKKKKKKKK',
  'KMMMMMMMMMK',
  'KMFfFfFfFMK',
  'KMfFfFfFfMK',
  'KMFfFfFfFMK',
  'KMMMMMMMMMK',
  'KmmmmmmmmmK',
  'KMMMMMMMMMK',
  'KmmmmmmmmmK',
  'KMMMMMMMMMK',
  'KKKKKKKKKKK'
];

function crearTexturasFeria(escena, p) {
  tileRuido(escena, 'tile_feria_vereda', p.vereda, 0.12, 0, p.junta);
  tileRuido(escena, 'tile_feria_asfalto', p.asfalto, 0.1, 0.1);
  const madera = { M: p.madera[0], m: p.madera[1] };
  const v = p.verduras;

  // 3 mesones distintos (cada uno con otras verduras)
  const puesto = dibujoPuesto();
  for (let i = 0; i < 3; i++) {
    if (escena.textures.exists('puesto_' + i)) continue;
    const c = (n) => v[(i * 2 + n) % v.length];
    crearTexturaPixel(escena, 'puesto_' + i, {
      colores: Object.assign({
        A: c(0)[0], a: c(0)[1], B: c(1)[0], b: c(1)[1], C: c(2)[0], c: c(2)[1], D: c(3)[0], d: c(3)[1]
      }, madera),
      cuadros: [puesto]
    });
  }
  const toldo = dibujoToldo();
  p.toldos.forEach((c, i) => {
    if (escena.textures.exists('toldo_' + i)) return;
    crearTexturaPixel(escena, 'toldo_' + i, { colores: { T: c[0], t: c[1] }, cuadros: [toldo] });
  });
  v.forEach((c, i) => {
    if (escena.textures.exists('cajones_' + i)) return;
    crearTexturaPixel(escena, 'cajones_' + i, { colores: Object.assign({ F: c[0], f: c[1] }, madera), cuadros: [DIBUJO_CAJONES] });
  });
}

// Centro (en Y) de cada corrida de puestos
function corridasFeria(cfg) {
  const lista = [];
  for (let i = 0; i < cfg.CORRIDAS; i++) {
    lista.push(cfg.ALTO / 2 + (i - (cfg.CORRIDAS - 1) / 2) * cfg.CORRIDA_SEPARACION);
  }
  return lista;
}

function generarFeria() {
  const cfg = CONFIG.MAPAS.feria;
  const p = buscarMapa('feria').paleta;
  const rnd = new Phaser.Math.RandomDataGenerator([String(CONFIG.MAPA_SEMILLA) + '_feria']);
  const A = cfg.ANCHO;
  const H = cfg.ALTO;
  const ys = corridasFeria(cfg);
  const mapa = mapaVacio(A / 2, H / 2, { x: A / 2, y: H / 2 + cfg.CORRIDA_SEPARACION / 2 });
  const x0 = cfg.CORRIDA_MARGEN;
  const x1 = A - cfg.CORRIDA_MARGEN;
  const lejosDelInicio = (x, y, d) => Phaser.Math.Distance.Between(x, y, mapa.inicio.x, mapa.inicio.y) > d;

  // Faroles en los pasillos entre corridas (y antes de la primera y después de la última)
  const lugaresFaroles = [];
  const pasillos = ys.map((y) => y + cfg.CORRIDA_SEPARACION / 2);
  pasillos.unshift(ys[0] - cfg.CORRIDA_SEPARACION / 2);
  pasillos.forEach((y) => {
    if (y < cfg.VEREDA + 40 || y > H - cfg.VEREDA - 40) return;
    for (let x = x0 + cfg.FAROL_CADA / 2; x < x1; x += cfg.FAROL_CADA) lugaresFaroles.push({ x, y });
  });
  ponerFaroles(mapa, rnd.shuffle(lugaresFaroles), cfg.FAROLES);

  // Lugares de puestos en cada corrida (cada PASILLO_CADA queda uno libre para pasar)
  const lugares = [];
  ys.forEach((y) => {
    let i = 0;
    for (let x = x0 + cfg.PUESTO_SEPARACION / 2; x < x1; x += cfg.PUESTO_SEPARACION, i++) {
      if (i % cfg.PASILLO_CADA === Math.floor(cfg.PASILLO_CADA / 2)) continue;
      lugares.push({ x, y });
    }
  });

  // Puestos (mesones). Detrás de algunos, un toldo.
  const puestos = [];
  rnd.shuffle(lugares).forEach((l) => {
    if (puestos.length >= cfg.PUESTOS) return;
    if (!lejosDelInicio(l.x, l.y, 140)) return;
    if (!puntoLibre(mapa.solidos, l.x, l.y, 8)) return;
    puestos.push(l);
    mapa.solidos.push({ forma: 'rect', x: l.x, y: l.y, w: CHOQUE_PUESTO.ANCHO, h: CHOQUE_PUESTO.ALTO, tipo: 'puesto' });
    mapa.adornos.push({ clave: 'puesto_' + rnd.between(0, 2), x: l.x, y: l.y, profundidad: 2 });
  });
  let toldos = 0;
  rnd.shuffle(puestos.slice()).forEach((l) => {
    if (toldos >= cfg.TOLDOS) return;
    const y = l.y - CHOQUE_PUESTO.ALTO / 2 - CHOQUE_TOLDO.ALTO / 2 - 2;
    if (!puntoLibre(mapa.solidos, l.x, y, 4)) return;
    mapa.solidos.push({ forma: 'rect', x: l.x, y, w: CHOQUE_TOLDO.ANCHO, h: CHOQUE_TOLDO.ALTO, tipo: 'toldo' });
    mapa.adornos.push({ clave: 'toldo_' + rnd.between(0, p.toldos.length - 1), x: l.x, y, profundidad: 11 });
    toldos++;
  });

  // Cajones: a los lados de los puestos o sueltos en los pasillos. Sueltan comida (como los basureros).
  let cajones = 0;
  for (let intento = 0; intento < cfg.CAJONES * 40 && cajones < cfg.CAJONES; intento++) {
    let x, y;
    if (puestos.length > 0 && rnd.frac() < 0.6) {
      const l = rnd.pick(puestos);
      x = l.x + rnd.pick([-1, 1]) * (CHOQUE_PUESTO.ANCHO / 2 + 24);
      y = l.y + rnd.between(-10, 30);
    } else {
      x = rnd.between(x0, x1);
      y = rnd.pick(pasillos) + rnd.between(-120, 120);
    }
    if (!puntoLibre(mapa.solidos, x, y, CHOQUE_CAJONES.ANCHO / 2 + 26)) continue;
    if (!lejosDelInicio(x, y, 120)) continue;
    if (!mapa.faroles.every((f) => Phaser.Math.Distance.Between(x, y, f.x, f.y) > 34)) continue;
    mapa.solidos.push({ forma: 'rect', x, y, w: CHOQUE_CAJONES.ANCHO, h: CHOQUE_CAJONES.ALTO, tipo: 'cajones' });
    mapa.basureros.push({ x, y });
    mapa.adornos.push({ clave: 'cajones_' + rnd.between(0, p.verduras.length - 1), x, y,
      angulo: rnd.pick([0, 90, 180, 270]), profundidad: 2 });
    cajones++;
  }

  // Cartones y hojas tiradas en el suelo (solo dibujo, no chocan)
  mapa.manchas = [];
  for (let i = 0; i < cfg.MANCHAS; i++) {
    const carton = rnd.frac() < 0.5;
    mapa.manchas.push({
      x: rnd.between(cfg.VEREDA, A - cfg.VEREDA - 40), y: rnd.between(cfg.VEREDA, H - cfg.VEREDA - 40),
      w: carton ? rnd.between(24, 42) : rnd.between(6, 12), h: carton ? rnd.between(18, 30) : rnd.between(6, 12),
      color: carton ? rnd.pick(p.manchas.slice(0, 2)) : rnd.pick(p.manchas.slice(2))
    });
  }
  return mapa;
}

function pintarSueloFeria(h, mapa, p) {
  const cfg = CONFIG.MAPAS.feria;
  const A = cfg.ANCHO;
  const H = cfg.ALTO;
  const v = cfg.VEREDA;
  const E = ESCALA_PIXEL;
  const ctx = h.ctx;

  h.rect({ x: 0, y: 0, w: A, h: H }, h.patron('tile_feria_vereda'));
  h.rect({ x: v, y: v, w: A - v * 2, h: H - v * 2 }, h.patron('tile_feria_asfalto'));
  h.borde({ x: v, y: v, w: A - v * 2, h: H - v * 2 }, p.solera);

  // Líneas blancas segmentadas en los pasillos entre corridas
  ctx.fillStyle = p.lineaCalle;
  const ys = corridasFeria(cfg);
  ys.slice(0, -1).forEach((y) => {
    const yy = Math.round((y + cfg.CORRIDA_SEPARACION / 2) / E);
    for (let x = Math.round(v / E) + 4; x < Math.round((A - v) / E) - 4; x += 14) ctx.fillRect(x, yy, 7, 1);
  });

  // Cartones y hojas de lechuga
  mapa.manchas.forEach((m) => {
    ctx.fillStyle = m.color;
    ctx.fillRect(Math.round(m.x / E), Math.round(m.y / E), Math.max(1, Math.round(m.w / E)), Math.max(1, Math.round(m.h / E)));
  });
}
