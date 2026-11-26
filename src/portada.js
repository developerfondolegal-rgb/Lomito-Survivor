// ===============================================================
//  PORTADA HD (v0.20): la escena animada de la pantalla de bienvenida
//  (src/scenes/BienvenidaScene.js). Calle de noche con estrellas, luna,
//  edificios, faroles, basureros, un gato que se asoma, el título y dos
//  perros sentados: un chow chow negro y un shar pei canela.
//
//  Es una traducción a JavaScript de referencias/portada_hd.py (la fuente
//  de verdad): la escena se dibuja a 320 x 180 cuadritos y se agranda en
//  un múltiplo entero (nítida, sin suavizado). Los mapas de los perros
//  están en src/portada_perros.js.
//
//  Capas (de atrás hacia adelante). Las fijas se dibujan una sola vez;
//  las animadas se redibujan solo cuando cambia el cuadro (10 por segundo)
//  y solo en su propio rectángulo:
//    cielo (fija) · estrellas + estrella fugaz (animada) · ciudad: luna,
//    edificios, ventanas fijas y calle (fija) · ventanas que se prenden y
//    apagan (animada) · luz de los faroles (animada) · postes (fija) ·
//    vidrio de los faroles + polillas (animada) · ojos del gato (animada) ·
//    frente: basureros, resplandor y sombras (fija) · perros (animados,
//    24 cuadros precalculados) · título (fija)
//
//  Animación: ciclo de 24 cuadros a 10 cuadros por segundo (2,4 s), con el
//  tiempo de Phaser. Los números ajustables están en src/config.js,
//  sección PORTADA.
// ===============================================================

const PORTADA_BW = 320;        // ancho de la escena (cuadritos)
const PORTADA_BH = 180;        // alto de la escena
const PORTADA_N = 24;          // cuadros del ciclo
const PORTADA_SUELO = 126;     // borde de la vereda
// Zona que nunca se recorta (los perros y el título): x de 50 a 270
const PORTADA_ZONA = { x0: 50, x1: 270 };

function portadaHx(h) { return parseInt(h.replace('#', ''), 16); }
function portadaRGB(c) { return [(c >> 16) & 255, (c >> 8) & 255, c & 255]; }
function portadaMix(c, d, t) {
  const a = portadaRGB(c), b = portadaRGB(d);
  return (Math.trunc(a[0] + (b[0] - a[0]) * t) << 16) | (Math.trunc(a[1] + (b[1] - a[1]) * t) << 8) |
    Math.trunc(a[2] + (b[2] - a[2]) * t);
}
function portadaLum(c) { const r = portadaRGB(c); return 0.3 * r[0] + 0.59 * r[1] + 0.11 * r[2]; }
function portadaOsc(i, per, ph) { return Math.sin(2 * Math.PI * (i / per + (ph || 0))); }

// ---------------------------------------------------------------
//  Generador al azar igual al de Python (Mersenne Twister), para que las
//  estrellas y las ventanas queden exactamente donde en la referencia.
// ---------------------------------------------------------------
function portadaAzarPython(semilla) {
  const mt = new Uint32Array(624);
  let mti = 625;
  const initGen = (s) => {
    mt[0] = s >>> 0;
    for (mti = 1; mti < 624; mti++) {
      const p = mt[mti - 1] ^ (mt[mti - 1] >>> 30);
      mt[mti] = (Math.imul(1812433253, p) + mti) >>> 0;
    }
  };
  // init_by_array con la clave [semilla] (así siembra Python un entero chico)
  initGen(19650218);
  let i = 1, j = 0;
  const clave = [semilla >>> 0];
  for (let k = Math.max(624, clave.length); k; k--) {
    const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
    mt[i] = ((mt[i] ^ Math.imul(p, 1664525)) + clave[j] + j) >>> 0;
    i++; j++;
    if (i >= 624) { mt[0] = mt[623]; i = 1; }
    if (j >= clave.length) j = 0;
  }
  for (let k = 623; k; k--) {
    const p = mt[i - 1] ^ (mt[i - 1] >>> 30);
    mt[i] = ((mt[i] ^ Math.imul(p, 1566083941)) - i) >>> 0;
    i++;
    if (i >= 624) { mt[0] = mt[623]; i = 1; }
  }
  mt[0] = 0x80000000;
  mti = 624;
  const u32 = () => {
    if (mti >= 624) {
      for (let k = 0; k < 624; k++) {
        const y = (mt[k] & 0x80000000) | (mt[(k + 1) % 624] & 0x7fffffff);
        mt[k] = mt[(k + 397) % 624] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      mti = 0;
    }
    let y = mt[mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  };
  const bajo = (n) => {           // _randbelow de Python
    const bits = Math.floor(Math.log2(n)) + 1;
    let r = u32() >>> (32 - bits);
    while (r >= n) r = u32() >>> (32 - bits);
    return r;
  };
  return {
    random() { const a = u32() >>> 5, b = u32() >>> 6; return (a * 67108864 + b) / 9007199254740992; },
    randrange(a, b) { return b === undefined ? bajo(a) : a + bajo(b - a); }
  };
}

// ---------------------------------------------------------------
//  Lienzo: un rectángulo de la escena (x0, y0, ancho, alto) en RGBA.
//  Las coordenadas siempre son de la escena (0-319, 0-179).
// ---------------------------------------------------------------
function portadaLienzo(x0, y0, w, h, datos) {
  return { x0, y0, w, h, d: datos || new Uint8ClampedArray(w * h * 4) };
}
function portadaIndice(L, x, y) {
  if (!(x >= 0 && x < PORTADA_BW && y >= 0 && y < PORTADA_BH)) return -1;
  const X = Math.trunc(x) - L.x0, Y = Math.trunc(y) - L.y0;
  if (X < 0 || Y < 0 || X >= L.w || Y >= L.h) return -1;
  return (Y * L.w + X) * 4;
}
// P() del script: pinta un cuadrito opaco
function portadaPon(L, x, y, c) {
  const k = portadaIndice(L, x, y);
  if (k < 0) return;
  L.d[k] = (c >> 16) & 255; L.d[k + 1] = (c >> 8) & 255; L.d[k + 2] = c & 255; L.d[k + 3] = 255;
}
// Color del cuadrito (-1 si está vacío)
function portadaVer(L, x, y) {
  const k = portadaIndice(L, x, y);
  if (k < 0 || L.d[k + 3] === 0) return -1;
  return (L.d[k] << 16) | (L.d[k + 1] << 8) | L.d[k + 2];
}
// Mezcla un color encima con transparencia "a" (luces y sombras). Sobre un
// cuadrito opaco da lo mismo que mix() del script; sobre uno vacío queda
// semitransparente y se mezcla con las capas de atrás.
function portadaMezclar(L, x, y, c, a) {
  const k = portadaIndice(L, x, y);
  if (k < 0 || a <= 0) return;
  const d = L.d, s = portadaRGB(c);
  const ad = d[k + 3] / 255;
  if (ad === 1) {
    for (let n = 0; n < 3; n++) d[k + n] = Math.trunc(d[k + n] + (s[n] - d[k + n]) * a);
  } else {
    const ao = a + ad * (1 - a);
    for (let n = 0; n < 3; n++) d[k + n] = Math.round((s[n] * a + d[k + n] * ad * (1 - a)) / ao);
    d[k + 3] = Math.round(ao * 255);
  }
}

// ---------------------------------------------------------------
//  Datos fijos de la escena (estrellas, edificios, ventanas)
// ---------------------------------------------------------------
const PORTADA_FUENTE = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  V: ['10001', '10001', '10001', '10001', '01010', '01010', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000']
};

const PORTADA_EDIFICIOS = [  // x0, ancho, alto, color
  [-4, 34, 78, '#111834'], [30, 26, 52, '#151c3b'], [56, 40, 68, '#10162f'], [96, 18, 40, '#141b39'],
  [222, 22, 44, '#141b39'], [244, 34, 74, '#10162f'], [278, 20, 56, '#151c3b'], [298, 26, 82, '#111834']
];

const PORTADA_ESTRELLAS = (() => {
  const r = portadaAzarPython(21);
  const lista = [];
  for (let n = 0; n < 70; n++) {
    const x = r.randrange(PORTADA_BW), y = r.randrange(4, 70), ph = r.random(), grande = r.random() < 0.18;
    lista.push([x, y, ph, grande]);
  }
  return lista.filter(([x, y]) => !(x >= 70 && x <= 262 && y >= 4 && y <= 26));
})();

const PORTADA_VENTANAS = (() => {
  const r = portadaAzarPython(4);
  const lista = [];
  PORTADA_EDIFICIOS.forEach(([x0, w, h]) => {
    const arriba = PORTADA_SUELO - h;
    for (let wy = arriba + 6; wy < PORTADA_SUELO - 8; wy += 9) {
      for (let wx = x0 + 4; wx < x0 + w - 6; wx += 7) {
        const prendida = r.random() < 0.4, fase = r.randrange(PORTADA_N), cambia = r.random() < 0.3;
        lista.push([wx, wy, prendida, fase, cambia]);
      }
    }
  });
  return lista;
})();

// ---------------------------------------------------------------
//  Dibujo de cada capa (traducción de portada_hd.py)
// ---------------------------------------------------------------

// Cielo con degradado tramado (fija)
function portadaCielo(L) {
  const cielo = ['#0a0f26', '#0c1230', '#0f1636', '#121a3d', '#151e44', '#19224b'].map(portadaHx);
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const n = cielo.length;
  for (let y = 0; y < PORTADA_SUELO; y++) {
    const t = y / PORTADA_SUELO * (n - 1), k = Math.trunc(t), fr = t - k;
    for (let x = 0; x < PORTADA_BW; x++) {
      let c = cielo[Math.min(k, n - 1)];
      if (k < n - 1 && fr * 16 > BAY[y % 4][x % 4] + 0.5) c = cielo[k + 1];
      portadaPon(L, x, y, c);
    }
  }
}

// Estrellas que titilan y estrella fugaz (animada)
function portadaEstrellas(L, i, fugaz) {
  const fondo = portadaHx('#1a234d');
  PORTADA_ESTRELLAS.forEach(([x, y, ph, grande], n) => {
    const b = 0.5 + 0.5 * Math.sin(2 * Math.PI * (i / PORTADA_N * (1 + n % 3) + ph));
    const col = portadaMix(portadaHx('#3a4580'), portadaHx('#e8ecff'), b);
    portadaPon(L, x, y, col);
    if (grande && b > 0.55) {
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => portadaPon(L, x + dx, y + dy, portadaMix(fondo, col, 0.6)));
      if (b > 0.85) {
        [[2, 0], [-2, 0], [0, 2], [0, -2]].forEach(([dx, dy]) => portadaPon(L, x + dx, y + dy, portadaMix(fondo, col, 0.35)));
      }
    }
  });
  if (fugaz && i >= 5 && i <= 8) {
    const k = i - 5, sx = 200 + k * 16, sy = 30 + k * 5;
    for (let j = 0; j < 12; j++) {
      portadaPon(L, sx - j * 2, sy - j * 0.6, portadaMix(portadaHx('#ffffff'), fondo, j / 12));
      portadaPon(L, sx - j * 2 - 1, sy - j * 0.6, portadaMix(portadaHx('#c8d2ff'), fondo, j / 12));
    }
  }
}

// Color de una ventana según su nivel de luz (0 = apagada, 1 = prendida)
function portadaVentana(L, wx, wy, lvl) {
  const cw = portadaMix(portadaHx('#1c2448'), portadaHx('#ffd166'), lvl);
  for (let yy = 0; yy < 5; yy++) {
    for (let xx = 0; xx < 3; xx++) {
      portadaPon(L, wx + xx, wy + yy, yy < 4 || lvl === 0 ? cw : portadaMix(cw, portadaHx('#c98a2a'), 0.6));
    }
  }
}
function portadaNivelVentana(i, fase) {
  const t = ((i + fase) % PORTADA_N) / PORTADA_N;
  return t < 0.45 ? 1 : t < 0.55 ? 0.5 : t < 0.9 ? 0 : 0.5;
}

// Luna, edificios con ventanas fijas, vereda y calle adoquinada (fija)
function portadaCiudad(L) {
  // luna creciente
  const mx = 62, my = 15, mr = 8;
  for (let y = -mr - 3; y < mr + 4; y++) {
    for (let x = -mr - 3; x < mr + 4; x++) {
      const d = Math.hypot(x, y), d2 = Math.hypot(x - 4, y - 3);
      if (d <= mr && d2 > mr - 1) {
        portadaPon(L, mx + x, my + y, portadaHx(d < mr - 1.2 ? '#ffe9a8' : '#e8c870'));
      } else if (d > mr && d <= mr + 3 && d2 > mr + 1 && (((x + y) % 2) + 2) % 2 === 0) {
        portadaPon(L, mx + x, my + y, portadaHx('#232c5a'));
      }
    }
  }
  // edificios
  PORTADA_EDIFICIOS.forEach(([x0, w, h, col]) => {
    const c = portadaHx(col), arriba = PORTADA_SUELO - h;
    for (let y = arriba; y < PORTADA_SUELO; y++) for (let x = x0; x < x0 + w; x++) portadaPon(L, x, y, c);
    for (let x = x0; x < x0 + w; x++) portadaPon(L, x, arriba, portadaHx('#232b52'));
    if (w > 24) {                                          // tanque/antena en el techo
      const m = x0 + Math.floor(w / 2);
      for (let y = arriba - 5; y < arriba; y++) portadaPon(L, m, y, c);
      for (let x = m - 3; x < m + 4; x++) portadaPon(L, x, arriba - 5, c);
    }
  });
  PORTADA_VENTANAS.forEach(([wx, wy, prendida, , cambia]) => {
    if (!cambia) portadaVentana(L, wx, wy, prendida ? 1 : 0);
  });
  // vereda + calle adoquinada
  const H = portadaHx;
  for (let y = PORTADA_SUELO; y < PORTADA_BH; y++) {
    for (let x = 0; x < PORTADA_BW; x++) {
      let c;
      if (y === PORTADA_SUELO) c = H('#5c627e');
      else if (y < PORTADA_SUELO + 3) c = H('#41465f');
      else if (y < 142) {
        c = (Math.floor(x / 18) + Math.floor((y - PORTADA_SUELO) / 8)) % 2 === 0 ? H('#30344b') : H('#2c3045');
        if (x % 18 === 0 || (y - PORTADA_SUELO - 3) % 8 === 0) c = H('#24273a');
      } else if (y === 142) c = H('#6a6f88');
      else if (y < 145) c = H('#3a3e54');
      else {
        const fila = Math.floor((y - 145) / 6), off = fila % 2 ? 5 : 0;
        c = ((x + off) % 10 === 0 || (y - 145) % 6 === 0) ? H('#1d2032') : H('#262a3f');
        if ((Math.floor((x + off) / 10) + fila) % 3 === 0 && (x + off) % 10 !== 0 && (y - 145) % 6 !== 0) c = H('#2a2e44');
      }
      portadaPon(L, x, y, c);
    }
  }
}

// Ventanas que se prenden y apagan de a poco (animada)
function portadaVentanasAnim(L, i) {
  PORTADA_VENTANAS.forEach(([wx, wy, , fase, cambia]) => {
    if (cambia) portadaVentana(L, wx, wy, portadaNivelVentana(i, fase));
  });
}

// Resplandor ovalado (glow() del script)
function portadaResplandor(L, cx, cy, rx, ry, amt) {
  const amarillo = portadaHx('#ffd98a');
  for (let y = Math.trunc(cy - ry); y <= Math.trunc(cy + ry); y++) {
    for (let x = Math.trunc(cx - rx); x <= Math.trunc(cx + rx); x++) {
      const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
      if (d <= 1 && x >= 0 && x < PORTADA_BW && y >= 0 && y < PORTADA_BH) {
        const lvl = d < 0.3 ? 2 : d < 0.65 ? 1 : ((x + y) % 2 === 0 ? 1 : 0);
        if (lvl) portadaMezclar(L, x, y, amarillo, amt * lvl / 2);
      }
    }
  }
}

// Faroles: x de cada uno y su fase
const PORTADA_FAROLES = [[18, 0.0], [299, 0.37]];
function portadaIntensidad(i, ph) {
  return 0.92 + 0.08 * Math.sin(2 * Math.PI * (i / PORTADA_N * 3 + ph)) - ((i + Math.trunc(ph * 10)) % 17 === 0 ? 0.25 : 0);
}

// Luz de los faroles (animada: titila)
function portadaLuces(L, i) {
  PORTADA_FAROLES.forEach(([x, ph]) => {
    const fl = portadaIntensidad(i, ph);
    portadaResplandor(L, x + 1, 40, 16, 14, 0.18 * fl);
    portadaResplandor(L, x + 1, PORTADA_SUELO + 8, 34, 9, 0.16 * fl);
  });
}

// Postes y techos de los faroles (fija)
function portadaPostes(L) {
  const pole = portadaHx('#1c2034'), poleh = portadaHx('#34395a');
  PORTADA_FAROLES.forEach(([x]) => {
    for (let y = 46; y < PORTADA_SUELO + 4; y++) {
      portadaPon(L, x, y, poleh); portadaPon(L, x + 1, y, pole); portadaPon(L, x + 2, y, pole);
    }
    for (let y = PORTADA_SUELO + 1; y < PORTADA_SUELO + 5; y++) for (let xx = x - 3; xx < x + 6; xx++) portadaPon(L, xx, y, pole);
    for (let xx = x - 4; xx < x + 7; xx++) { portadaPon(L, xx, 33, pole); portadaPon(L, xx, 34, pole); }
    for (let xx = x - 2; xx < x + 5; xx++) portadaPon(L, xx, 32, pole);
    portadaPon(L, x + 1, 31, pole);
    for (let xx = x - 4; xx < x + 7; xx++) portadaPon(L, xx, 45, pole);
  });
}

// Vidrio de los faroles y polillas que dan vueltas (animada)
function portadaFarolesAnim(L, i) {
  const pole = portadaHx('#1c2034');
  PORTADA_FAROLES.forEach(([x, ph]) => {
    const fl = portadaIntensidad(i, ph);
    for (let y = 35; y < 45; y++) {
      for (let xx = x - 3; xx < x + 6; xx++) {
        const borde = xx === x - 3 || xx === x + 5;
        portadaPon(L, xx, y, borde ? pole : (y >= 37 && y <= 42) ?
          portadaMix(portadaHx('#ffe9a0'), portadaHx('#fff8dc'), fl - 0.8) : portadaHx('#ffd166'));
      }
    }
    for (let k = 0; k < 2; k++) {
      const a = 2 * Math.PI * (i / PORTADA_N * (k ? 2 : -3) + k * 0.4 + ph);
      const mxp = x + 1 + 9 * Math.cos(a), myp = 40 + 6 * Math.sin(a) * (k ? 1 : -1);
      portadaPon(L, mxp, myp, portadaHx('#fff1c4')); portadaPon(L, mxp + 1, myp, portadaHx('#c9b98e'));
    }
  });
}

// Ojos de gato que se asoman detrás del basurero derecho y parpadean (animada)
const PORTADA_GATO = { x: 285, y: PORTADA_SUELO - 1 };
function portadaGato(L, i) {
  if (!(i >= 6 && i <= 21)) return;
  const x = PORTADA_GATO.x, y = PORTADA_GATO.y;
  const yy = y + 2 - Math.min(i - 6, 2);                 // se asoma
  const head = portadaHx('#0c0f1c');
  for (let dx = -1; dx < 9; dx++) for (let dy = 0; dy < 4; dy++) portadaPon(L, x + dx, yy + dy, head);
  portadaPon(L, x - 1, yy - 1, head); portadaPon(L, x, yy - 2, head); portadaPon(L, x + 7, yy - 2, head); portadaPon(L, x + 8, yy - 1, head);
  if (i === 14 || i === 15) {
    const c = portadaHx('#6a8a20');
    [1, 2, 5, 6].forEach((d) => portadaPon(L, x + d, yy + 2, c));
  } else {
    [x + 1, x + 5].forEach((ex) => {
      portadaPon(L, ex, yy + 1, portadaHx('#d8f060')); portadaPon(L, ex + 1, yy + 1, portadaHx('#d8f060'));
      portadaPon(L, ex, yy + 2, portadaHx('#a8c838')); portadaPon(L, ex + 1, yy + 2, portadaHx('#101010'));
    });
  }
}

function portadaBasurero(L, x0, y0) {
  const H = portadaHx;
  const body = H('#2f7d3c'), dark = H('#1e5428'), hi = H('#4ea25a'), lid = H('#256a31'), out = H('#0b220f');
  for (let y = y0; y < y0 + 24; y++) {
    for (let x = x0 + 1; x < x0 + 19; x++) {
      let c = x < x0 + 13 ? body : dark;
      if (x === x0 + 3) c = hi;
      if (y === y0 + 8 || y === y0 + 16) c = dark;
      portadaPon(L, x, y, c);
    }
  }
  for (let x = x0 - 1; x < x0 + 21; x++) { portadaPon(L, x, y0 - 3, hi); portadaPon(L, x, y0 - 2, lid); portadaPon(L, x, y0 - 1, lid); }
  for (let x = x0 + 6; x < x0 + 14; x++) { portadaPon(L, x, y0 - 4, lid); portadaPon(L, x, y0 - 5, out); }
  for (let y = y0 - 3; y < y0 + 24; y++) {
    portadaPon(L, y < y0 ? x0 - 2 : x0, y, out);
    portadaPon(L, y < y0 ? x0 + 21 : x0 + 19, y, out);
  }
  for (let x = x0 - 1; x < x0 + 21; x++) portadaPon(L, x, !(x >= x0 + 6 && x < x0 + 14) ? y0 - 4 : y0 - 6, out);
  for (let x = x0; x < x0 + 20; x++) portadaPon(L, x, y0 + 24, out);
  for (let y = y0 + 4; y < y0 + 12; y++) for (let x = x0 + 7; x < x0 + 11; x++) portadaPon(L, x, y, H('#3f9050'));
  portadaPon(L, x0 + 16, y0 + 23, H('#101010')); portadaPon(L, x0 + 17, y0 + 23, H('#101010'));  // rueda
}

function portadaSombra(L, cx, cy, rx, ry) {
  for (let y = Math.trunc(cy - ry); y <= Math.trunc(cy + ry); y++) {
    for (let x = Math.trunc(cx - rx); x <= Math.trunc(cx + rx); x++) {
      if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) portadaMezclar(L, x, y, portadaHx('#05060d'), 0.55);
    }
  }
}

// Frente: basureros, resplandor general y sombras de los perros (fija)
function portadaFrente(L) {
  portadaBasurero(L, 26, PORTADA_SUELO + 8);
  portadaBasurero(L, 276, PORTADA_SUELO + 8);
  portadaResplandor(L, 160, 115, 125, 62, 0.06);
  portadaSombra(L, 110, 168, 58, 5);
  portadaSombra(L, 217, 168, 56, 5);
}

// Título "LOMITO SURVIVOR" con sombra, contorno y degradado (fija)
function portadaTitulo(L, texto, x0, y0, k) {
  const celdas = new Set();
  const clave = (x, y) => y * 1000 + x;
  for (let n = 0; n < texto.length; n++) {
    PORTADA_FUENTE[texto[n]].forEach((fila, r) => {
      for (let c = 0; c < fila.length; c++) {
        if (fila[c] !== '1') continue;
        for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) celdas.add(clave(x0 + n * 6 * k + c * k + dx, y0 + r * k + dy));
      }
    });
  }
  const lista = [...celdas].map((v) => [v % 1000, Math.floor(v / 1000)]);
  const sombraClara = portadaHx('#7a4a10'), sombraOscura = portadaHx('#3a2208');
  // sombra: a 1 abajo-derecha la clara y a 2 la oscura (donde se juntan gana la oscura,
  // que después pasa a contorno; en el script depende del orden de un set de Python)
  lista.forEach(([x, y]) => portadaPon(L, x + 1, y + 1, sombraClara));
  lista.forEach(([x, y]) => portadaPon(L, x + 1, y + 2, sombraOscura));
  lista.forEach(([x, y]) => {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (!celdas.has(clave(x + dx, y + dy)) && portadaVer(L, x + dx, y + dy) !== sombraClara) {
          portadaPon(L, x + dx, y + dy, portadaHx('#1a0f05'));
        }
      }
    }
  });
  lista.forEach(([x, y]) => {
    const r = (y - y0) / (7 * k);
    portadaPon(L, x, y, portadaHx(r < 0.25 ? '#ffe27a' : r < 0.75 ? '#ffc93c' : '#e89a1c'));
  });
}

// ---------------------------------------------------------------
//  PERROS: grilla de 320 x 180 colores (-1 = vacío), retoques y animación
// ---------------------------------------------------------------
const PORTADA_CHS = '0123456789abcdefghijklmnopqrstuv';

function portadaCargarPerro(d) {
  const g = new Int32Array(PORTADA_BW * PORTADA_BH).fill(-1);
  const pal = d.pal.map(portadaHx);
  d.rows.forEach((fila, j) => {
    for (let k = 0; k < fila.length; k++) {
      if (fila[k] !== '.') g[(d.y + j) * PORTADA_BW + d.x + k] = pal[PORTADA_CHS.indexOf(fila[k])];
    }
  });
  return g;
}
function portadaEsBaba(c) {
  if (c < 0) return false;
  const r = portadaRGB(c);
  return portadaLum(c) > 110 && Math.max(...r) - Math.min(...r) < 40;
}
function portadaEsLengua(c) {
  if (c < 0) return false;
  const r = portadaRGB(c);
  return r[0] > r[1] + 12 && r[2] > r[1] + 8;
}
// Contorno limpio de 1 cuadrito: los del perro que tocan el exterior
function portadaBorde(g, col) {
  const W = PORTADA_BW, H = PORTADA_BH, fuera = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g[y * W + x] < 0) continue;
      const toca = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const X = x + dx, Y = y + dy;
        return X < 0 || X >= W || Y < 0 || Y >= H || g[Y * W + X] < 0;
      });
      if (toca) fuera.push(y * W + x);
    }
  }
  fuera.forEach((k) => { g[k] = col; });
}

// Primitivas para retocar una grilla (clase Pin del script)
function portadaPincel(g) {
  const p = {
    px(x, y, c) {
      x = Math.floor(x); y = Math.floor(y);
      if (x >= 0 && x < PORTADA_BW && y >= 0 && y < PORTADA_BH) g[y * PORTADA_BW + x] = c;
    },
    ell(cx, cy, rx, ry, c) {
      for (let y = Math.trunc(cy - ry - 1); y < Math.trunc(cy + ry + 2); y++) {
        for (let x = Math.trunc(cx - rx - 1); x < Math.trunc(cx + rx + 2); x++) {
          if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) p.px(x, y, c);
        }
      }
    },
    poly(pts, c) {
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      for (let y = Math.trunc(Math.min(...ys)) - 1; y < Math.trunc(Math.max(...ys)) + 2; y++) {
        for (let x = Math.trunc(Math.min(...xs)) - 1; x < Math.trunc(Math.max(...xs)) + 2; x++) {
          const X = x + 0.5, Y = y + 0.5;
          let dentro = false;
          for (let i = 0; i < pts.length; i++) {
            const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
            if ((y1 > Y) !== (y2 > Y) && X < x1 + (Y - y1) * (x2 - x1) / (y2 - y1)) dentro = !dentro;
          }
          if (dentro) p.px(x, y, c);
        }
      }
    },
    line(x0, y0, x1, y1, c) {
      const n = Math.trunc(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) + 1;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        p.px(x0 + (x1 - x0) * t + 0.5, y0 + (y1 - y0) * t + 0.5, c);
      }
    },
    arc(cx, cy, rx, ry, a0, a1, c) {
      for (let i = 0; i < 60; i++) {
        const a = (a0 + (a1 - a0) * i / 59) * (Math.PI / 180);
        p.px(cx + rx * Math.cos(a), cy + ry * Math.sin(a), c);
      }
    }
  };
  return p;
}

// Colores del shar pei y del chow chow (de la paleta extraída + 1 brillo)
const PORTADA_SP = {
  OUT: portadaHx('#1b1008'), BASE: portadaHx('#da913a'), SH: portadaHx('#c58033'),
  SH2: portadaHx('#ac6926'), DEEP: portadaHx('#8e5528'), HI: portadaHx('#eaa94f')
};
const PORTADA_CH = { OUT: portadaHx('#8d9bb3'), K: portadaHx('#1b1a1e') };

function portadaPrepararSharpei() {
  const W = PORTADA_BW, S = PORTADA_SP;
  const g = portadaCargarPerro(PORTADA_SHARPEI), p = portadaPincel(g);
  const baba = [];
  for (let y = 100; y < 130; y++) for (let x = 188; x < 202; x++) if (portadaEsBaba(g[y * W + x])) baba.push([x, y, g[y * W + x]]);
  // Patas delanteras redibujadas: rectas, gruesas, separadas bajo el pecho, con pies redondeados
  for (let y = 118; y < PORTADA_BH; y++) for (let x = 163; x < 224; x++) if (y >= 127 || x < 173) g[y * W + x] = -1;
  const PATAS = [[174, 192, 175, 191], [205, 223, 206, 222]];   // x arriba izq/der, x abajo izq/der
  const TOP = 124, BOT = 158;
  p.poly([[192, 128], [206, 128], [206, BOT], [191, BOT]], S.DEEP);   // vientre entre las patas
  PATAS.forEach(([tl, tr, bl, brr]) => {
    p.poly([[tl, TOP], [tr + 1, TOP], [brr + 1, BOT], [bl, BOT]], S.BASE);
    p.line(tl - 1, TOP, bl - 1, BOT, S.OUT); p.line(tr + 1, TOP, brr + 1, BOT, S.OUT);
    for (let y = TOP + 8; y < BOT; y++) {
      const t = (y - TOP) / (BOT - TOP), xr = tr + (brr - tr) * t;
      p.px(xr, y, S.SH2); p.px(xr - 1, y, S.SH);
      if (y > TOP + 18) p.px(xr - 2, y, S.SH);
    }
    p.ell(tl + 5, TOP + 10, 2.5, 6, S.HI);                         // brillo del antebrazo
    const mx = (bl + brr) / 2 + 0.5;
    p.arc(mx, 150, 6, 1.6, 200, 340, S.SH);                        // pliegue de la muñeca
    p.ell(mx, 162.4, 11, 5.8, S.OUT); p.ell(mx, 162, 10, 4.9, S.BASE);
    p.arc(mx, 161.5, 7.5, 3, 200, 320, S.HI);
    [-4, 0, 4].forEach((d) => p.line(mx + d, 162, mx + d, 166, S.SH2));
    p.arc(mx, 166, 9.5, 1.4, 15, 165, S.SH2);
  });
  p.ell(198.5, 121, 27, 8, S.BASE);                                // pecho redondeado sobre las patas
  p.ell(199, 129, 5, 3, S.SH2);                                    // esternón entre las patas
  p.arc(198.5, 121, 27, 8, 60, 120, S.SH);
  portadaBorde(g, S.OUT);
  baba.forEach(([x, y, c]) => { g[y * W + x] = c; });
  // brillo de los ojos
  [[179, 66], [208, 69]].forEach(([gx, gy]) => {
    for (let y = gy - 2; y < gy + 3; y++) {
      for (let x = gx - 2; x < gx + 3; x++) {
        const c = g[y * W + x];
        if (c >= 0 && portadaLum(c) > 170) g[y * W + x] = 0xffffff;
      }
    }
  });
  return g;
}

function portadaPrepararChow() {
  const W = PORTADA_BW;
  const g = portadaCargarPerro(PORTADA_CHOW);
  for (let k = 0; k < g.length; k++) {                     // quitar el azul del fondo que se coló en el borde
    const c = g[k];
    if (c >= 0) { const r = portadaRGB(c); if (r[2] - r[0] > 25 && portadaLum(c) < 60) g[k] = PORTADA_CH.K; }
  }
  portadaBorde(g, PORTADA_CH.OUT);
  [[111, 85], [133, 86]].forEach(([ex, ey]) => {            // ojos: cuenca gris azul oscura + brillo
    for (let y = ey - 3; y < ey + 4; y++) {
      for (let x = ex - 4; x < ex + 5; x++) {
        const c = g[y * W + x];
        const e = ((x - ex) / 4.5) ** 2 + ((y - ey) / 3.2) ** 2;
        if (c >= 0 && portadaLum(c) < 20 && e > 0.55 && e <= 1) g[y * W + x] = portadaHx('#2e3242');
      }
    }
    g[(ey - 2) * W + ex - 1] = 0xffffff; g[(ey - 2) * W + ex] = 0xffffff; g[(ey - 1) * W + ex - 1] = 0xffffff;
  });
  return g;
}

// Respiración (sube 1 lo que está sobre "corte"), meneo de cola y parpadeo
function portadaAnimar(base, corte, br, parpados, parpadea, cola, tdx) {
  const W = PORTADA_BW;
  const g = Int32Array.from(base);
  if (br) g.copyWithin(0, W, (corte + 1) * W);
  if (tdx) {
    const [x0, y0, x1, y1] = cola;
    const src = Int32Array.from(g);
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const c = src[y * W + x];
        if (c >= 0 && x + tdx >= 0 && x + tdx < W) g[y * W + x + tdx] = c;
      }
    }
  }
  if (parpadea) {
    parpados.forEach(([x0, y0, x1, y1, lid, linea]) => {
      const yy0 = y0 - br, yy1 = y1 - br, midy = Math.floor((yy0 + yy1) / 2);
      for (let y = yy0; y < yy1; y++) {
        for (let x = x0; x < x1; x++) {
          const c = g[y * W + x];
          if (c >= 0 && (portadaLum(c) < 45 || portadaLum(c) > 170)) g[y * W + x] = lid;
        }
      }
      for (let x = x0 + 1; x < x1 - 1; x++) g[(midy + (x === x0 + 1 || x === x1 - 2 ? 1 : 0)) * W + x] = linea;
    });
  }
  return g;
}

function portadaCuadroSharpei(base, i) {
  const W = PORTADA_BW, S = PORTADA_SP, N = PORTADA_N;
  const br = portadaOsc(i, N) > 0.2 ? 1 : 0;
  const g = portadaAnimar(base, 120, br, [[173, 62, 186, 73, S.SH, S.OUT], [203, 65, 217, 77, S.SH, S.OUT]],
    i === 11 || i === 12, [257, 136, 270, 162], portadaOsc(i, N / 2) > 0 ? 1 : 0);
  // baba: se estira y cae una gota
  const pts = [];
  for (let y = 100; y < 130; y++) for (let x = 188; x < 202; x++) if (portadaEsBaba(g[y * W + x])) pts.push([x, y]);
  if (pts.length) {
    const bot = Math.max(...pts.map((q) => q[1]));
    const cols = [...new Set(pts.filter((q) => q[1] >= bot - 1).map((q) => q[0]))].sort((a, b) => a - b);
    const L = Math.floor((i % 12) / 2);
    for (let k = 1; k <= L; k++) cols.forEach((x) => { g[(bot + k) * W + x] = x === cols[0] ? portadaHx('#cfd9e0') : portadaHx('#8fa3b3'); });
    const tip = bot + L;
    if (i % 12 >= 9) {
      const yd = tip + 3 + (i % 12 - 9) * 5;
      g[yd * W + cols[0]] = 0xffffff; g[(yd + 1) * W + cols[0]] = portadaHx('#cfd9e0');
    }
  }
  return g;
}

function portadaCuadroChow(base, i) {
  const W = PORTADA_BW, N = PORTADA_N, linea = portadaHx('#3a3f52');
  const br = portadaOsc(i, N, 0.35) > 0.2 ? 1 : 0;
  const g = portadaAnimar(base, 132, br, [[106, 81, 117, 89, PORTADA_CH.K, linea], [128, 82, 139, 90, PORTADA_CH.K, linea]],
    i === 18 || i === 19, [50, 124, 70, 160], portadaOsc(i, N / 2, 0.1) > 0 ? -1 : 0);
  // lengua jadeando: se alarga 0-2 cuadritos
  const pts = [];
  for (let y = 100; y < 126; y++) for (let x = 112; x < 138; x++) if (portadaEsLengua(g[y * W + x])) pts.push([x, y]);
  if (pts.length) {
    const bot = Math.max(...pts.map((q) => q[1]));
    const fila = pts.filter((q) => q[1] === bot).map((q) => q[0]);
    const n = [0, 1, 2, 1][Math.floor(i / 2) % 4];
    const negro = portadaHx('#0b0c0e');
    for (let k = 1; k <= n; k++) {
      (fila.length > 2 ? fila.slice(1, -1) : fila).forEach((x) => { g[(bot + k) * W + x] = g[bot * W + x]; });
      g[(bot + k) * W + fila[0]] = negro; g[(bot + k) * W + fila[fila.length - 1]] = negro;
    }
  }
  return g;
}

// Los 24 cuadros de cada perro (se calculan una vez) y el rectángulo que ocupan
function portadaCuadrosPerros() {
  const sp0 = portadaPrepararSharpei(), ch0 = portadaPrepararChow();
  const armar = (base, fn) => {
    const cuadros = [];
    let x0 = PORTADA_BW, y0 = PORTADA_BH, x1 = -1, y1 = -1;
    for (let i = 0; i < PORTADA_N; i++) {
      const g = fn(base, i);
      cuadros.push(g);
      for (let k = 0; k < g.length; k++) {
        if (g[k] < 0) continue;
        const x = k % PORTADA_BW, y = Math.floor(k / PORTADA_BW);
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    return { cuadros, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  };
  return { chow: armar(ch0, portadaCuadroChow), sharpei: armar(sp0, portadaCuadroSharpei) };
}
// ---------------------------------------------------------------
//  Capas de la escena: qué rectángulo ocupa cada una y cómo se dibuja.
//  i = cuadro (0-23); op = { fugaz, gato } (si aparecen en este ciclo).
// ---------------------------------------------------------------
const PORTADA_CAPAS = [
  { nombre: 'cielo', r: [0, 0, 320, 126], dibujar: (L) => portadaCielo(L) },
  { nombre: 'estrellas', r: [0, 0, 320, 74], anim: true, dibujar: (L, i, op) => portadaEstrellas(L, i, op.fugaz) },
  { nombre: 'ciudad', r: [0, 0, 320, 180], dibujar: (L) => portadaCiudad(L) },
  {
    nombre: 'ventanas', r: [0, 40, 320, 82], anim: true,
    firma: (i) => PORTADA_VENTANAS.filter((v) => v[4]).map((v) => portadaNivelVentana(i, v[3])).join(),
    dibujar: (L, i) => portadaVentanasAnim(L, i)
  },
  { nombre: 'luces', r: [0, 25, 320, 120], anim: true, dibujar: (L, i) => portadaLuces(L, i) },
  { nombre: 'postes', r: [0, 30, 320, 101], dibujar: (L) => portadaPostes(L) },
  { nombre: 'faroles', r: [0, 33, 320, 15], anim: true, dibujar: (L, i) => portadaFarolesAnim(L, i) },
  {
    nombre: 'gato', r: [282, 120, 14, 12], anim: true,
    firma: (i, op) => (op.gato && i >= 6 && i <= 21 ? Math.min(i - 6, 2) + (i === 14 || i === 15 ? 'c' : 'a') : 'no'),
    dibujar: (L, i, op) => { if (op.gato) portadaGato(L, i); }
  },
  { nombre: 'frente', r: [0, 52, 320, 128], dibujar: (L) => portadaFrente(L) },
  { nombre: 'perros' },
  { nombre: 'titulo', r: [70, 2, 192, 28], dibujar: (L) => portadaTitulo(L, 'LOMITO SURVIVOR', 76, 8, 2) }
];

// Si en el ciclo número "ciclo" pasan la estrella fugaz y el gato
function portadaOpciones(ciclo) {
  const P = (typeof CONFIG !== 'undefined' && CONFIG.PORTADA) || {};
  const toca = (cada) => (cada === undefined ? true : cada > 0 && ciclo % cada === 0);
  return { fugaz: toca(P.ESTRELLA_FUGAZ_CADA_CICLOS), gato: toca(P.GATO_CADA_CICLOS) };
}

// ---------------------------------------------------------------
//  La portada en Phaser. Devuelve { actualizar(tiempo), chow, sharpei,
//  aPantalla(x, y), escala } (chow y sharpei: rectángulo en pantalla, para
//  poner el "¡Guau!" encima).
// ---------------------------------------------------------------
function crearPortada(escena) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const h = escena.scale.height;

  // Escala entera: la más grande que deja ver la escena entera de alto y la
  // zona de los perros y el título entera de ancho (los costados se recortan)
  const zonaAncho = PORTADA_ZONA.x1 - PORTADA_ZONA.x0;
  const maxima = Math.max(1, Math.min(Math.floor(h / PORTADA_BH), Math.floor(w / zonaAncho)));
  const E = P.ESCALA > 0 ? Math.min(P.ESCALA, maxima) : maxima;
  const centro = (PORTADA_ZONA.x0 + PORTADA_ZONA.x1) / 2;
  // centrada; si la pantalla es más ancha que la escena queda al medio
  const ox = Math.round(w / 2 - (w >= PORTADA_BW * E ? PORTADA_BW / 2 : centro) * E);
  const oy = Math.round((h - PORTADA_BH * E) / 2);

  // Lo que sobre alrededor (si sobra): cielo arriba, calle abajo
  const relleno = escena.add.graphics();
  relleno.fillStyle(0x0a0f26, 1).fillRect(0, 0, w, h);
  relleno.fillStyle(0x262a3f, 1).fillRect(0, oy + PORTADA_SUELO * E, w, h);

  const capas = [];
  let perros = null;
  PORTADA_CAPAS.forEach((def) => {
    if (def.nombre === 'perros') { perros = crearPerrosPortada(escena, ox, oy, E); return; }
    const [x0, y0, cw, ch] = def.r;
    const key = 'portada_hd_' + def.nombre;
    const tex = escena.textures.exists(key) ? escena.textures.get(key) : escena.textures.createCanvas(key, cw, ch);
    const imagen = tex.context.createImageData(cw, ch);
    const capa = {
      def, tex, imagen, firmaActual: null,
      L: portadaLienzo(x0, y0, cw, ch, imagen.data),
      dibujar(i, op) {
        if (def.firma) {
          const f = def.firma(i, op);
          if (f === this.firmaActual) return;   // no cambió: no se redibuja
          this.firmaActual = f;
        }
        this.L.d.fill(0);
        def.dibujar(this.L, i, op);
        tex.context.putImageData(imagen, 0, 0);
        tex.refresh();
      }
    };
    escena.add.image(ox + x0 * E, oy + y0 * E, key).setOrigin(0, 0).setScale(E);
    capas.push(capa);
  });

  // Primer cuadro: todas las capas (las fijas quedan así para siempre)
  const op0 = portadaOpciones(0);
  capas.forEach((c) => c.dibujar(0, op0));
  perros.mostrar(0);

  const aPantalla = (x, y) => ({ x: ox + x * E, y: oy + y * E });
  const rect = (r) => ({
    x: ox + (r.x0 + r.w / 2) * E, y: oy + (r.y0 + r.h) * E, displayWidth: r.w * E, displayHeight: r.h * E
  });

  return {
    escala: E,
    aPantalla,
    chow: rect(perros.datos.chow),
    sharpei: rect(perros.datos.sharpei),
    ultimo: 0,
    actualizar(tiempo) {
      if (!P.ANIMACION_ACTIVA) return;
      const n = Math.floor(tiempo / (1000 / Math.max(1, P.FPS)));
      if (n === this.ultimo) return;               // mismo cuadro: nada que hacer
      this.ultimo = n;
      const i = n % PORTADA_N;
      const op = portadaOpciones(Math.floor(n / PORTADA_N));
      capas.forEach((c) => { if (c.def.anim) c.dibujar(i, op); });
      perros.mostrar(i);
    }
  };
}

// Los perros: una textura por perro con sus 24 cuadros uno al lado del otro
function crearPerrosPortada(escena, ox, oy, E) {
  if (!PORTADA_CACHE.perros) PORTADA_CACHE.perros = portadaCuadrosPerros();
  const datos = PORTADA_CACHE.perros;
  const sprites = ['chow', 'sharpei'].map((nombre) => {
    const r = datos[nombre];
    const key = 'portada_hd_' + nombre;
    if (!escena.textures.exists(key)) {
      const tex = escena.textures.createCanvas(key, r.w * PORTADA_N, r.h);
      const img = tex.context.createImageData(r.w * PORTADA_N, r.h);
      const d = img.data;
      r.cuadros.forEach((g, i) => {
        for (let y = 0; y < r.h; y++) {
          for (let x = 0; x < r.w; x++) {
            const c = g[(r.y0 + y) * PORTADA_BW + r.x0 + x];
            if (c < 0) continue;
            const k = (y * r.w * PORTADA_N + i * r.w + x) * 4;
            d[k] = (c >> 16) & 255; d[k + 1] = (c >> 8) & 255; d[k + 2] = c & 255; d[k + 3] = 255;
          }
        }
        tex.add(i, 0, i * r.w, 0, r.w, r.h);
      });
      tex.context.putImageData(img, 0, 0);
      tex.refresh();
    }
    return escena.add.image(ox + r.x0 * E, oy + r.y0 * E, key, 0).setOrigin(0, 0).setScale(E);
  });
  return {
    datos,
    actual: -1,
    mostrar(i) {
      if (i === this.actual) return;
      this.actual = i;
      sprites.forEach((s) => s.setFrame(i));
    }
  };
}

// Los cuadros de los perros se calculan una sola vez (aunque se vuelva a la bienvenida)
const PORTADA_CACHE = { perros: null };
