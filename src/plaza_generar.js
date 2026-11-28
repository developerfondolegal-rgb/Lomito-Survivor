// ===============================================================
//  LA PLAZA RENOVADA - FASE 1: DÓNDE VA CADA COSA
//  (archivo nuevo, script clásico)
//
//  generarPlazaNueva() reemplaza a generarPlaza() (src/mapa.js) SOLO en la
//  entrada 'plaza' de MAPAS (src/mapas.js). Devuelve el mismo tipo de mapa
//  que hoy (mapaVacio: centro, inicio, pileta, solidos, faroles, basureros,
//  adornos) y además:
//    sombras: sombras que se hornean en el suelo
//    calcos:  dibujos que se pintan EN el suelo (canteros, flores, cancha)
//    cables:  cables entre postes (sombra en el suelo + dibujo encima)
//    vida:    (lo usa la FASE 3) objetos animados
//    pastos:  un rectángulo con el pasto (para la miniatura de la pantalla de mapas)
//
//  No usa la escena: se puede llamar desde la miniatura (dibujarMiniaturaMapa).
//  Siempre sale igual con la misma CONFIG.MAPA_SEMILLA.
//
//  Si todavía no está la FASE 2 (src/plaza_objetos.js), usa los dibujos de hoy
//  (arbol, banca, basurero, farol, pileta, auto_N) y se salta lo que no
//  tiene dibujo (kiosko, juegos, mesas...).
// ===============================================================

// Diseño: objetos fijos (px de mundo, mapa 6000 x 6000) y reglas
const PZ_COLOCAR = {
  INICIO_LIBRE: 160,
  CENTRO_RESERVADO: {
    x: 1890,
    y: 2145,
    w: 1830,
    h: 1290
  },
  RINCONES: [
    {
      x: 1250,
      y: 1250,
      r: 330
    },
    {
      x: 4750,
      y: 1300,
      r: 300
    },
    {
      x: 1250,
      y: 4750,
      r: 300
    },
    {
      x: 4750,
      y: 4750,
      r: 300
    }
  ],
  ARBUSTOS: 140,
  FLORES: 90,
  POSTES_PASEO: {
    x: 3690,
    desde: 420,
    hasta: 5600,
    cada: 360
  },
  fijos: [
    {
      tipo: 'kiosko',
      x: 2445,
      y: 2421
    },
    {
      tipo: 'mesa',
      x: 2295,
      y: 3195,
      angulo: 90
    },
    {
      tipo: 'mesa',
      x: 3540,
      y: 3291
    },
    {
      tipo: 'banca',
      x: 2556,
      y: 2790
    },
    {
      tipo: 'banca',
      x: 2676,
      y: 2733
    },
    {
      tipo: 'banca',
      x: 2820,
      y: 2709
    },
    {
      tipo: 'banca',
      x: 2976,
      y: 2700
    },
    {
      tipo: 'banca',
      x: 3150,
      y: 2709
    },
    {
      tipo: 'banca',
      x: 2490,
      y: 2940,
      angulo: 90
    },
    {
      tipo: 'banca',
      x: 3330,
      y: 3075,
      angulo: 90
    },
    {
      tipo: 'basurero',
      x: 2619,
      y: 2757
    },
    {
      tipo: 'basurero',
      x: 2898,
      y: 2679
    },
    {
      tipo: 'basurero',
      x: 2466,
      y: 3009
    },
    {
      tipo: 'basurero',
      x: 3564,
      y: 2559
    },
    {
      tipo: 'basurero',
      x: 3366,
      y: 3141
    },
    {
      tipo: 'farol',
      x: 2280,
      y: 2655
    },
    {
      tipo: 'farol',
      x: 2706,
      y: 2601
    },
    {
      tipo: 'farol',
      x: 3156,
      y: 2553
    },
    {
      tipo: 'farol',
      x: 3540,
      y: 2487
    },
    {
      tipo: 'farol',
      x: 2184,
      y: 3075
    },
    {
      tipo: 'farol',
      x: 3600,
      y: 3045
    },
    {
      tipo: 'farol',
      x: 2676,
      y: 3105
    },
    {
      tipo: 'farol',
      x: 3330,
      y: 3321
    },
    {
      tipo: 'poste',
      x: 3714,
      y: 2265
    },
    {
      tipo: 'poste',
      x: 3714,
      y: 2625
    },
    {
      tipo: 'poste',
      x: 3714,
      y: 2985
    },
    {
      tipo: 'poste',
      x: 3714,
      y: 3345
    },
    {
      tipo: 'poste',
      x: 3294,
      y: 2589
    },
    {
      tipo: 'arbol_g',
      x: 2010,
      y: 2943
    },
    {
      tipo: 'arbol_g',
      x: 2070,
      y: 3075
    },
    {
      tipo: 'arbol_g',
      x: 1992,
      y: 3219
    },
    {
      tipo: 'arbol_g',
      x: 2064,
      y: 3363
    },
    {
      tipo: 'arbol_g',
      x: 3432,
      y: 2301
    },
    {
      tipo: 'arbol_g',
      x: 3480,
      y: 2481
    },
    {
      tipo: 'arbol_m',
      x: 2886,
      y: 2283
    },
    {
      tipo: 'arbol_m',
      x: 2580,
      y: 3399
    },
    {
      tipo: 'arbol_m',
      x: 2172,
      y: 2283
    },
    {
      tipo: 'arbol_m',
      x: 3435,
      y: 3231
    },
    {
      tipo: 'arbol_c',
      x: 2220,
      y: 3390
    },
    {
      tipo: 'arbol_c',
      x: 2706,
      y: 2241
    },
    {
      tipo: 'arbusto_g',
      x: 2364,
      y: 2820
    },
    {
      tipo: 'arbusto_g',
      x: 3180,
      y: 2760
    },
    {
      tipo: 'arbusto_g',
      x: 2520,
      y: 3141
    },
    {
      tipo: 'arbusto_g',
      x: 3645,
      y: 2880
    },
    {
      tipo: 'arbusto_c',
      x: 2250,
      y: 2955
    },
    {
      tipo: 'arbusto_c',
      x: 2670,
      y: 2559
    },
    {
      tipo: 'arbusto_c',
      x: 2205,
      y: 2541
    },
    {
      tipo: 'arbusto_c',
      x: 3246,
      y: 2799
    },
    {
      tipo: 'arbusto_c',
      x: 2562,
      y: 3093
    },
    {
      tipo: 'arbusto_c',
      x: 2820,
      y: 3159
    },
    {
      tipo: 'cantero',
      x: 2706,
      y: 2895
    },
    {
      tipo: 'cantero',
      x: 2706,
      y: 3105
    },
    {
      tipo: 'cantero',
      x: 3294,
      y: 2895
    },
    {
      tipo: 'cantero',
      x: 3294,
      y: 3105
    },
    {
      tipo: 'subebaja',
      x: 3420,
      y: 2901
    },
    {
      tipo: 'caballito_a',
      x: 3534,
      y: 2835
    },
    {
      tipo: 'caballito_r',
      x: 3375,
      y: 2961
    },
    {
      tipo: 'columpio',
      x: 2670,
      y: 3219
    },
    {
      tipo: 'resbalin',
      x: 2811,
      y: 3255
    },
    {
      tipo: 'carrito',
      x: 2235,
      y: 2625
    },
    {
      tipo: 'letrero',
      x: 3000,
      y: 2790
    },
    {
      tipo: 'grifo',
      x: 3684,
      y: 3195
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 345
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 501
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 657
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 813
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 969
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 1125
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 1281
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 1437
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 1593
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 1749
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 1905
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 2061
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 2217
    },
    {
      tipo: 'auto_estacionado',
      x: 2037,
      y: 2373
    },
    {
      tipo: 'auto_estacionado',
      x: 1959,
      y: 2529
    },
    {
      tipo: 'arco',
      x: 1004,
      y: 1250
    },
    {
      tipo: 'arco',
      x: 1496,
      y: 1250,
      angulo: 180
    },
    {
      tipo: 'cancha_lineas',
      x: 1250,
      y: 1250
    },
    {
      tipo: 'columpio',
      x: 4690,
      y: 1225
    },
    {
      tipo: 'resbalin',
      x: 4855,
      y: 1315
    },
    {
      tipo: 'subebaja',
      x: 4705,
      y: 1378
    },
    {
      tipo: 'caballito_a',
      x: 4790,
      y: 1290
    },
    {
      tipo: 'caballito_r',
      x: 4630,
      y: 1330
    },
    {
      tipo: 'farol',
      x: 4560,
      y: 1300
    },
    {
      tipo: 'farol',
      x: 4940,
      y: 1330
    },
    {
      tipo: 'banca',
      x: 4750,
      y: 1500
    },
    {
      tipo: 'mesa',
      x: 1130,
      y: 4660
    },
    {
      tipo: 'mesa',
      x: 1370,
      y: 4660
    },
    {
      tipo: 'mesa',
      x: 1130,
      y: 4840
    },
    {
      tipo: 'mesa',
      x: 1370,
      y: 4840
    },
    {
      tipo: 'farol_g',
      x: 1250,
      y: 4750
    },
    {
      tipo: 'basurero',
      x: 1400,
      y: 4750
    },
    {
      tipo: 'basurero',
      x: 1100,
      y: 4750
    },
    {
      tipo: 'glorieta',
      x: 4750,
      y: 4750
    },
    {
      tipo: 'cantero',
      x: 4889,
      y: 4807
    },
    {
      tipo: 'cantero',
      x: 4807,
      y: 4889
    },
    {
      tipo: 'cantero',
      x: 4693,
      y: 4889
    },
    {
      tipo: 'cantero',
      x: 4611,
      y: 4807
    },
    {
      tipo: 'cantero',
      x: 4611,
      y: 4693
    },
    {
      tipo: 'cantero',
      x: 4693,
      y: 4611
    },
    {
      tipo: 'cantero',
      x: 4807,
      y: 4611
    },
    {
      tipo: 'cantero',
      x: 4889,
      y: 4693
    },
    {
      tipo: 'banca',
      x: 4750,
      y: 4650
    },
    {
      tipo: 'banca',
      x: 4750,
      y: 4850
    },
    {
      tipo: 'banca',
      x: 4650,
      y: 4750,
      angulo: 90
    },
    {
      tipo: 'banca',
      x: 4850,
      y: 4750,
      angulo: 90
    }
  ],
  cables: [
    [[3714, 2265], [3714, 2625]],
    [[3714, 2625], [3714, 2985]],
    [[3714, 2985], [3714, 3345]],
    [[3714, 2625], [3294, 2589]],
    [[3294, 2589], [2640, 2337]],
    [[3294, 2589], [3330, 2025]],
    [[3714, 1905], [3714, 2265]]
  ]
};

// Dibujo y choque de respaldo (FASE 1 sin FASE 2): los mismos de hoy (src/mapa.js)
const PZ_RESPALDO = {
  arbol_g: { clave: 'arbol', choque: { forma: 'circulo', r: 30 }, profundidad: 11, girar: true },
  arbol_m: { clave: 'arbol', choque: { forma: 'circulo', r: 30 }, profundidad: 11, girar: true },
  arbol_c: { clave: 'arbol', choque: { forma: 'circulo', r: 30 }, profundidad: 11, girar: true },
  banca: { clave: 'banca', choque: { forma: 'rect', w: 60, h: 24 }, profundidad: 2 },
  basurero: { clave: 'basurero', choque: { forma: 'circulo', r: 12 }, profundidad: 2 },
  farol: { clave: 'farol', choque: null, profundidad: 2 },
  farol_g: { clave: 'farol', choque: null, profundidad: 2 },
  pileta: { clave: 'pileta', choque: { forma: 'circulo', r: 108 }, profundidad: 1 }
};

// Dibujo nuevo (FASE 2) o el de respaldo. Devuelve null si no hay dibujo.
function pzDefinicion(tipo) {
  if (typeof PZ_OBJETOS !== 'undefined' && PZ_OBJETOS['pz_' + tipo]) {
    const d = PZ_OBJETOS['pz_' + tipo];
    return { clave: 'pz_' + tipo, choque: d.choque || null, profundidad: d.profundidad === undefined ? 2 : d.profundidad, sombra: d.sombra, enSuelo: d.enSuelo };
  }
  return PZ_RESPALDO[tipo] || null;
}

// Choque (en px de mundo) girado 0/90/180/270
function pzChoqueGirado(ch, angulo) {
  if (!ch || ch.forma !== 'rect') return ch;
  const vertical = Math.round((angulo || 0) / 90) % 2 !== 0;
  return vertical ? { forma: 'rect', w: ch.h, h: ch.w, dx: ch.dx, dy: ch.dy } : ch;
}

// Pone un objeto si cabe. Devuelve el objeto puesto o null.
//  opciones.forzar: no revisa si choca con otros (lo fijo del diseño)
function pzPoner(mapa, tipo, x, y, angulo, rnd, opciones) {
  const op = opciones || {};
  const def = pzDefinicion(tipo);
  if (!def) return null;
  const libre = PZ_COLOCAR.INICIO_LIBRE;
  const ch = pzChoqueGirado(def.choque, angulo);
  // nunca tapar el punto de partida del perro
  if (ch && Math.hypot(x - mapa.inicio.x, y - mapa.inicio.y) < libre + (ch.r || Math.max(ch.w || 0, ch.h || 0) / 2 || 60)) return null;
  const formas = [];
  if (ch) {
    if (ch.forma === 'circulo') formas.push({ forma: 'circulo', x: x + (ch.dx || 0), y: y + (ch.dy || 0), r: ch.r });
    else if (ch.forma === 'rect') formas.push({ forma: 'rect', x: x + (ch.dx || 0), y: y + (ch.dy || 0), w: ch.w, h: ch.h });
    else if (ch.forma === 'circulos') ch.lista.forEach((c) => formas.push({ forma: 'circulo', x: x + c.dx, y: y + c.dy, r: c.r }));
  }
  if (!op.forzar) {
    for (const f of formas) {
      const m = (f.r || Math.max(f.w, f.h) / 2) + (op.margen || 20);
      if (!puntoLibre(mapa.solidos, f.x, f.y, m)) return null;
    }
  }
  // tipo del choque: 'arbol' para los 3 árboles (así la miniatura de mapas.js los pinta con su color de hoy)
  formas.forEach((f) => { f.tipo = tipo.indexOf('arbol') === 0 ? 'arbol' : tipo; mapa.solidos.push(f); });
  let ang = angulo || 0;
  if (def.girar && rnd) ang = rnd.pick([0, 90, 180, 270]);   // el árbol de hoy se gira para variar
  const objeto = { tipo, clave: def.clave, x, y, angulo: ang, profundidad: def.profundidad };
  if (def.enSuelo) mapa.calcos.push({ clave: def.clave, x, y });
  else mapa.adornos.push(objeto);
  if (def.sombra) {
    const s = def.sombra, vertical = Math.round(ang / 90) % 2 !== 0;
    mapa.sombras.push({ x, y, dx: s.dx, dy: s.dy, rx: vertical ? s.ry : s.rx, ry: vertical ? s.rx : s.ry, fuerza: s.fuerza });
  }
  if (tipo === 'farol' || tipo === 'farol_g') { objeto.luz = { x, y }; mapa.faroles.push(objeto.luz); }   // misma luz que usa actualizarOscuridad
  if (tipo === 'basurero') mapa.basureros.push({ x, y });
  mapa.vida.push(objeto);
  return objeto;
}

function generarPlazaNueva() {
  const cfg = CONFIG.MAPAS.plaza;
  const C = PZ_COLOCAR;
  const rnd = new Phaser.Math.RandomDataGenerator([String(CONFIG.MAPA_SEMILLA) + '_plaza_nueva']);
  const A = cfg.ANCHO, H = cfg.ALTO, cx = A / 2, cy = H / 2;
  const sx = A / 6000, sy = H / 6000;
  const X = (v) => v * sx, Y = (v) => v * sy;

  const mapa = mapaVacio(cx, cy, { x: cx, y: cy + CONFIG.PILETA_RADIO + 200 });
  mapa.sombras = []; mapa.calcos = []; mapa.cables = []; mapa.vida = [];
  const borde = CONFIG.CALLE_ANCHO + PZ_SUELO.VEREDA;
  mapa.pastos = [{ x: borde, y: borde, w: A - borde * 2, h: H - borde * 2 }];  // para la miniatura
  mapa.senderos = [];   // para la miniatura: caminos y claros como cuadritos (solo se dibujan, no chocan)
  PZ_SUELO.caminos.forEach((c) => {
    const a = c.ancho * Math.min(sx, sy);
    for (let i = 1; i < c.puntos.length; i++) {
      const [x0, y0] = c.puntos[i - 1], [x1, y1] = c.puntos[i];
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 40));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        mapa.senderos.push({ x: X(x0 + (x1 - x0) * t) - a / 2, y: Y(y0 + (y1 - y0) * t) - a / 2, w: a, h: a });
      }
    }
  });
  PZ_SUELO.claros.forEach((c) => {
    const rad = Math.max(c.rx || 0, c.ry || 0, (c.w || 0) / 2, (c.h || 0) / 2) * Math.max(sx, sy);
    for (let y = c.y * sy - rad; y <= c.y * sy + rad; y += 60) {
      for (let x = c.x * sx - rad; x <= c.x * sx + rad; x += 60) if (pzDentroClaro(c, x, y) < 0) mapa.senderos.push({ x: x - 30, y: y - 30, w: 60, h: 60 });
    }
  });

  // Pileta: mismo lugar, mismo radio y misma clave de choque que hoy
  mapa.pileta = { x: cx, y: cy, r: CONFIG.PILETA_RADIO };
  const defP = pzDefinicion('pileta');
  mapa.solidos.push({ forma: 'circulo', x: cx, y: cy, r: CONFIG.PILETA_RADIO, tipo: 'pileta' });
  const pileta = { tipo: 'pileta', clave: defP.clave, x: cx, y: cy, profundidad: 1 };
  mapa.adornos.push(pileta); mapa.vida.push(pileta);
  if (defP.sombra) mapa.sombras.push(Object.assign({ x: cx, y: cy }, defP.sombra));

  // 4 faroles grandes alrededor de la pileta (como hoy: a PILETA_RADIO + 70)
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2, d = CONFIG.PILETA_RADIO + 70;
    pzPoner(mapa, 'farol_g', cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0, rnd, { forzar: true });
  }

  // Lo fijo del diseño (la composición del concept y los 4 rincones)
  const coloresAutos = buscarMapa('plaza').paleta.autos.length;
  C.fijos.forEach((f) => {
    if (f.tipo === 'auto_estacionado') {
      if (rnd.frac() < 0.25) return;                     // algunos lugares quedan vacíos
      const i = rnd.between(0, coloresAutos - 1);
      const tipo = (typeof PZ_OBJETOS !== 'undefined') ? 'auto_' + i : null;
      const clave = tipo && PZ_OBJETOS['pz_' + tipo] ? 'pz_' + tipo : 'auto_' + i;
      const ang = rnd.pick([0, 180]);
      mapa.solidos.push({ forma: 'rect', x: X(f.x), y: Y(f.y), w: CHOQUE_AUTO.ANCHO, h: CHOQUE_AUTO.ALTO, tipo: 'auto' });
      mapa.adornos.push({ tipo: 'auto', clave, x: X(f.x), y: Y(f.y), angulo: ang, profundidad: 2 });
      mapa.sombras.push({ x: X(f.x), y: Y(f.y), dx: 2, dy: 2, rx: 8, ry: 12, fuerza: 0.35 });
      return;
    }
    pzPoner(mapa, f.tipo, X(f.x), Y(f.y), f.angulo || 0, rnd, { forzar: true });
  });

  // Postes a lo largo del paseo de baldosas, con cables entre ellos
  const pp = C.POSTES_PASEO;
  let anterior = null;
  for (let y = pp.desde; y <= pp.hasta; y += pp.cada) {
    if (y > 1800 && y < 3500) { anterior = null; continue; }   // en el centro van los postes fijos
    const poste = pzPoner(mapa, 'poste', X(pp.x), Y(y), 0, rnd, { forzar: true });
    const punto = { x: X(pp.x), y: Y(y) };
    if (anterior) mapa.cables.push({ a: anterior, b: punto, comba: 3 });
    anterior = punto;
  }
  C.cables.forEach((c) => mapa.cables.push({ a: { x: X(c[0][0]), y: Y(c[0][1]) }, b: { x: X(c[1][0]), y: Y(c[1][1]) }, comba: 3 }));

  // ¿Está en una parte reservada (centro o rincones)?
  const R = C.CENTRO_RESERVADO;
  const reservado = (x, y, m) =>
    (x > X(R.x) - m && x < X(R.x + R.w) + m && y > Y(R.y) - m && y < Y(R.y + R.h) + m) ||
    C.RINCONES.some((r) => Math.hypot(x - X(r.x), y - Y(r.y)) < r.r + m);
  const lejosDeFaroles = (x, y, m) => mapa.faroles.every((f) => Math.hypot(x - f.x, y - f.y) > m);

  // Faroles y bancas a la orilla de los caminos
  const orillas = [];
  PZ_SUELO.caminos.forEach((c) => {
    for (let i = 0; i < c.puntos.length - 1; i++) {
      const ax = X(c.puntos[i][0]), ay = Y(c.puntos[i][1]), bx = X(c.puntos[i + 1][0]), by = Y(c.puntos[i + 1][1]);
      const largo = Math.hypot(bx - ax, by - ay);
      const nx = -(by - ay) / largo, ny = (bx - ax) / largo;
      for (let d = 120; d < largo - 60; d += 175) {
        const lado = rnd.pick([-1, 1]);
        orillas.push({ x: ax + (bx - ax) * d / largo, y: ay + (by - ay) * d / largo, nx: nx * lado, ny: ny * lado, ancho: c.ancho, horizontal: Math.abs(bx - ax) > Math.abs(by - ay) });
      }
    }
  });
  rnd.shuffle(orillas);
  orillas.forEach((o, i) => {
    if (i % 2 === 0 && mapa.faroles.length < cfg.FAROLES) {
      const x = o.x + o.nx * (o.ancho / 2 + 14), y = o.y + o.ny * (o.ancho / 2 + 14);
      if (!reservado(x, y, 0) && lejosDeFaroles(x, y, cfg.FAROL_CADA * 0.8)) pzPoner(mapa, 'farol', x, y, 0, rnd, { forzar: true });
    }
  });
  let bancas = mapa.adornos.filter((a) => a.tipo === 'banca').length;
  orillas.forEach((o, i) => {
    if (i % 2 === 1 && bancas < cfg.BANCAS) {
      const x = o.x + o.nx * (o.ancho / 2 + 26), y = o.y + o.ny * (o.ancho / 2 + 26);
      if (reservado(x, y, 40) || !lejosDeFaroles(x, y, 50) || pzSobreSuelo(x, y, 8)) return;
      if (pzPoner(mapa, 'banca', x, y, o.horizontal ? 0 : 90, rnd, { margen: 40 })) bancas++;
    }
  });

  // Basureros al lado de las bancas
  const listaBancas = mapa.adornos.filter((a) => a.tipo === 'banca');
  for (let k = 0; k < cfg.BASUREROS * 40 && mapa.basureros.length < cfg.BASUREROS && listaBancas.length; k++) {
    const b = rnd.pick(listaBancas);
    const horizontal = Math.round((b.angulo || 0) / 90) % 2 === 0;
    const lado = rnd.pick([-1, 1]);
    const x = horizontal ? b.x + lado * 56 : b.x, y = horizontal ? b.y : b.y + lado * 56;
    if (!lejosDeFaroles(x, y, 30)) continue;
    pzPoner(mapa, 'basurero', x, y, 0, rnd, { margen: 10 });
  }

  // Árboles en el pasto (3 tamaños), sin tapar caminos ni lo reservado
  const tiposArbol = ['arbol_g', 'arbol_g', 'arbol_m', 'arbol_m', 'arbol_c'];
  let arboles = mapa.adornos.filter((a) => a.tipo.indexOf('arbol') === 0).length;
  for (let k = 0; k < cfg.ARBOLES * 40 && arboles < cfg.ARBOLES; k++) {
    const x = rnd.between(borde + 60, A - borde - 60), y = rnd.between(borde + 60, H - borde - 60);
    if (reservado(x, y, 60) || pzSobreSuelo(x, y, 40) || !lejosDeFaroles(x, y, 60)) continue;
    if (pzPoner(mapa, rnd.pick(tiposArbol), x, y, 0, rnd, { margen: 60 })) arboles++;
  }

  // Arbustos (sin choque) y flores pintadas en el suelo
  const nArbustos = cfg.ARBUSTOS || C.ARBUSTOS;
  for (let k = 0, n = 0; k < nArbustos * 30 && n < nArbustos; k++) {
    const x = rnd.between(borde + 30, A - borde - 30), y = rnd.between(borde + 30, H - borde - 30);
    if (reservado(x, y, 20) || pzSobreSuelo(x, y, 20) || !puntoLibre(mapa.solidos, x, y, 30)) continue;
    if (pzPoner(mapa, rnd.frac() < 0.4 ? 'arbusto_g' : 'arbusto_c', x, y, 0, rnd)) n++;
  }
  if (typeof PZ_OBJETOS !== 'undefined') {
    const nFlores = cfg.FLORES || C.FLORES;
    for (let k = 0, n = 0; k < nFlores * 20 && n < nFlores; k++) {
      const x = rnd.between(borde + 20, A - borde - 20), y = rnd.between(borde + 20, H - borde - 20);
      if (pzSobreSuelo(x, y, 6)) continue;
      mapa.calcos.push({ clave: 'pz_flores_' + rnd.between(0, 3), x, y }); n++;
    }
  }

  // Autos estacionados en la calle de los bordes (igual que hoy)
  let autos = 0;
  for (let k = 0; k < cfg.AUTOS * 40 && autos < cfg.AUTOS; k++) {
    const b4 = rnd.between(0, 3);
    const largo = rnd.between(220, (b4 < 2 ? A : H) - 220);
    const pegado = 55;
    let x, y, angulo;
    if (b4 === 0) { x = largo; y = pegado; angulo = 90; }
    else if (b4 === 1) { x = largo; y = H - pegado; angulo = 270; }
    else if (b4 === 2) { x = pegado; y = largo; angulo = 180; }
    else { x = A - pegado; y = largo; angulo = 0; }
    const horizontal = b4 < 2;
    const w = horizontal ? CHOQUE_AUTO.ALTO : CHOQUE_AUTO.ANCHO, h = horizontal ? CHOQUE_AUTO.ANCHO : CHOQUE_AUTO.ALTO;
    if (!puntoLibre(mapa.solidos, x, y, CHOQUE_AUTO.ALTO / 2 + 25, true)) continue;
    const i = rnd.between(0, coloresAutos - 1);
    const clave = (typeof PZ_OBJETOS !== 'undefined' && PZ_OBJETOS['pz_auto_' + i]) ? 'pz_auto_' + i : 'auto_' + i;
    mapa.solidos.push({ forma: 'rect', x, y, w, h, tipo: 'auto' });
    mapa.adornos.push({ tipo: 'auto', clave, x, y, angulo, profundidad: 2 });
    mapa.sombras.push({ x, y, dx: 2, dy: 2, rx: horizontal ? 12 : 8, ry: horizontal ? 8 : 12, fuerza: 0.35 });
    autos++;
  }
  return mapa;
}
