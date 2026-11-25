// ===============================================================
//  PORTADA: la escena animada de la pantalla de bienvenida
//  (src/scenes/BienvenidaScene.js): una calle de noche con faroles,
//  basureros, edificios con ventanas, estrellas y luna, y dos perros
//  sentados uno al lado del otro, como hermanos: un chow chow negro
//  (izquierda) y un shar pei canela (derecha).
//
//  Estilo de los perros: pixel art chibi (cabeza grande, cuerpo chico
//  y redondo, patas cortas), colores planos (base + sombra + brillo),
//  contorno de 1 cuadrito del tono de cada perro y ojos simples con
//  brillo blanco. Se arman en código, por capas (cola, cuerpo, patas,
//  orejas, cabeza, hocico): cada capa lleva su propio contorno, así las
//  partes se separan solas y las formas quedan limpias.
//  Cada cuadro de la animación se arma igual, así todos calzan.
//
//  Los números (tamaño, posiciones, velocidades) están en src/config.js,
//  sección PORTADA.
// ===============================================================

// Colores de cada perro (formato 0xRRGGBB). W (blanco) viene de COLORES_COMUNES (src/sprites.js)
const COLORES_CHOW = {
  N: 0x151515, // negro casi puro (base)
  s: 0x09090b, // sombra
  b: 0x2c2f3a, // brillo gris azulado (volumen del pelo)
  O: 0x5c6478, // contorno gris azulado más claro (para que se separe del fondo de noche)
  E: 0x7a5236, // ojos café
  Z: 0x000000, // nariz
  P: 0x6a58b4, // lengua morada-azulada
  p: 0x9a8ce0  // brillo de la lengua
};
const COLORES_SHARPEI = {
  C: 0xd29a5c, // canela (base)
  c: 0xa36d38, // sombra y arrugas
  L: 0xf0c890, // brillo / hocico
  D: 0x5c3818, // contorno café oscuro
  E: 0x2a1a10, // ojos
  Z: 0xb3736a  // nariz rosada-café
};

// ---------------------------------------------------------------
//  Lienzo de pixel art: grilla de letras ('.' = vacío)
// ---------------------------------------------------------------
function lienzoPixel(ancho, alto) {
  const m = [];
  for (let y = 0; y < alto; y++) m.push(new Array(ancho).fill('.'));
  const dentro = (x, y) => x >= 0 && y >= 0 && x < ancho && y < alto;
  const L = {
    ancho, alto,
    pon(x, y, letra) {
      x = Math.round(x); y = Math.round(y);
      if (dentro(x, y)) m[y][x] = letra;
    },
    ver(x, y) {
      x = Math.round(x); y = Math.round(y);
      return dentro(x, y) ? m[y][x] : '.';
    },
    rect(x, y, w, h, letra) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) L.pon(i, j, letra);
    },
    elipse(cx, cy, rx, ry, letra) {
      for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
        for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
          const dx = (x - cx) / rx;
          const dy = (y - cy) / ry;
          if (dx * dx + dy * dy <= 1.0001) L.pon(x, y, letra);
        }
      }
    },
    // Línea de cuadritos de (x0, y0) a (x1, y1)
    linea(x0, y0, x1, y1, letra) {
      const pasos = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let k = 0; k <= pasos; k++) L.pon(x0 + (x1 - x0) * k / pasos, y0 + (y1 - y0) * k / pasos, letra);
    },
    // Triángulo relleno (para orejas)
    triangulo(ax, ay, bx, by, cx, cy, letra) {
      const minX = Math.floor(Math.min(ax, bx, cx)), maxX = Math.ceil(Math.max(ax, bx, cx));
      const minY = Math.floor(Math.min(ay, by, cy)), maxY = Math.ceil(Math.max(ay, by, cy));
      const lado = (px, py, x1, y1, x2, y2) => (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2);
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
        const d1 = lado(x, y, ax, ay, bx, by), d2 = lado(x, y, bx, by, cx, cy), d3 = lado(x, y, cx, cy, ax, ay);
        const neg = d1 < 0 || d2 < 0 || d3 < 0, pos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(neg && pos)) L.pon(x, y, letra);
      }
    },
    // Contorno de 1 cuadrito alrededor de todo lo pintado
    contorno(letra) {
      const nuevos = [];
      for (let y = 0; y < alto; y++) {
        for (let x = 0; x < ancho; x++) {
          if (m[y][x] !== '.') continue;
          const vecino = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => {
            const v = L.ver(x + a, y + b);
            return v !== '.' && v !== letra;
          });
          if (vecino) nuevos.push([x, y]);
        }
      }
      nuevos.forEach(([x, y]) => { m[y][x] = letra; });
    },
    // Copia encima todo lo pintado de otro lienzo del mismo tamaño
    pegar(otro) {
      for (let y = 0; y < alto; y++) for (let x = 0; x < ancho; x++) {
        const v = otro.ver(x, y);
        if (v !== '.') m[y][x] = v;
      }
    },
    // Brillo arriba y sombra abajo (1 cuadrito pegado al contorno): da volumen sin degradados
    volumen(base, brillo, sombra, borde) {
      const cambios = [];
      for (let y = 1; y < alto - 1; y++) for (let x = 0; x < ancho; x++) {
        if (m[y][x] !== base) continue;
        if (brillo && m[y - 1][x] === borde) cambios.push([x, y, brillo]);
        else if (sombra && m[y + 1][x] === borde) cambios.push([x, y, sombra]);
      }
      cambios.forEach(([x, y, l]) => { m[y][x] = l; });
    },
    filas() { return m.map((fila) => fila.join('')); }
  };
  return L;
}

// El contorno de afuera de toda la silueta pasa a "exterior"; las líneas de
// adentro (entre partes) se quedan con el color "interior", más suave
function bordeExterior(L, interior, exterior) {
  const cambiar = [];
  for (let y = 0; y < L.alto; y++) for (let x = 0; x < L.ancho; x++) {
    if (L.ver(x, y) !== interior) continue;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => L.ver(x + a, y + b) === '.') ||
        x === 0 || y === 0 || x === L.ancho - 1 || y === L.alto - 1) cambiar.push([x, y]);
  }
  cambiar.forEach(([x, y]) => L.pon(x, y, exterior));
}

// Dibuja una parte en una capa aparte, le pone su contorno y la pega encima
function capaPixel(L, borde, dibujar) {
  const t = lienzoPixel(L.ancho, L.alto);
  dibujar(t);
  t.contorno(borde);
  L.pegar(t);
}

// ---------------------------------------------------------------
//  CHOW CHOW sentado, de frente. 32 x 30 cuadritos.
//  cola: 0 a 3 (meneo) · lengua: 0 = corta, 1 = larga (jadeo; SIEMPRE afuera)
//  mira: 1 = mira al shar pei (gesto de cariño) · oreja: 1 = mueve la oreja
// ---------------------------------------------------------------
const CHOW_ANCHO = 34;
const CHOW_CUERPO = { izq: 0, der: 29 }; // dónde empieza y termina (para juntarlo con el shar pei)

function dibujoChow(cola, lengua, mira, oreja) {
  const L = lienzoPixel(CHOW_ANCHO, 30);
  const I = 's';   // líneas de adentro (entre partes): sombra
  const o = 2;     // todo corrido 2 a la derecha (a la izquierda queda la cola)
  const mx = [0, -0.7, 0, 0.7][cola % 4];
  const my = [0, -0.5, -1, -0.5][cola % 4];

  // Cola plumosa enroscada: se asoma grande por el lado izquierdo, arriba del lomo
  capaPixel(L, I, (t) => {
    t.elipse(5.5 + mx, 18.5 + my, 4, 3.6, 'N');
    t.elipse(3.6 + mx * 1.5, 14.6 + my, 2.6, 2.4, 'N');
  });
  // espiral de la cola (brillo)
  L.linea(3 + mx * 1.5, 15 + my, 5 + mx, 17 + my, 'b');
  L.linea(5 + mx, 17 + my, 7 + mx, 18 + my, 'b');

  // Cuerpo chico y redondo, con los muslos a los lados
  capaPixel(L, I, (t) => {
    t.elipse(o + 15, 22.5, 8, 6, 'N');
    t.elipse(o + 8.5, 25.5, 3.6, 3, 'N');
    t.elipse(o + 21.5, 25.5, 3.6, 3, 'N');
  });
  // Patitas de adelante: cortas y redondas
  capaPixel(L, I, (t) => {
    t.elipse(o + 12, 26.2, 2.3, 2.3, 'N');
    t.elipse(o + 18, 26.2, 2.3, 2.3, 'N');
  });
  // Orejitas chicas y redondas (la izquierda se mueve en el gesto de cariño)
  capaPixel(L, I, (t) => {
    t.elipse(o + 8 - oreja * 0.8, 3.6 - oreja, 2, 2, 'N');
    t.elipse(o + 22, 3.6, 2, 2, 'N');
  });
  // Melena de león: bien redonda, con 3 mechones marcados (cachetes y copete)
  capaPixel(L, I, (t) => {
    t.elipse(o + 15, 12, 10, 8.6, 'N');
    t.elipse(o + 5, 15, 2, 2.2, 'N');
    t.elipse(o + 25, 15, 2, 2.2, 'N');
    t.elipse(o + 15, 3.2, 2.4, 1.3, 'N');
  });
  bordeExterior(L, I, 'O');
  L.volumen('N', 'b', 's', 'O');
  // La cara, dentro de la melena: un anillo gris azulado la separa del pelo
  capaPixel(L, 'b', (t) => t.elipse(o + 15, 13.4, 5.4, 4.4, 'N'));
  // Hocico corto
  capaPixel(L, 'b', (t) => t.elipse(o + 15, 15.7, 2.5, 1.4, 'N'));

  // Ojos simples con brillo (miran al shar pei en el gesto de cariño)
  [[o + 11, 11.5], [o + 18, 11.5]].forEach(([x, y]) => {
    L.rect(x + mira, y, 2, 2, 'E');
    L.pon(x + mira, y, 'W');
  });
  // Nariz negra con brillo
  L.rect(o + 14, 14, 3, 1, 'Z'); L.pon(o + 15, 15, 'Z'); L.pon(o + 14, 14, 'b');
  // Boca alegre y la lengua morada colgando (siempre afuera; al jadear se alarga)
  L.pon(o + 13, 16, 's'); L.pon(o + 17, 16, 's');
  const largo = lengua ? 4 : 3;
  capaPixel(L, 's', (t) => {
    t.rect(o + 14, 16, 3, largo, 'P');
    t.pon(o + 15, 16 + largo, 'P');
  });
  L.pon(o + 14, 17, 'p');
  return L.filas();
}

// ---------------------------------------------------------------
//  SHAR PEI sentado, de frente, con la cabeza inclinada hacia el chow chow.
//  36 x 38 cuadritos.
//  respira: 1 = inspira (cuerpo y cabeza suben 1) · ojo: 1 = cerrado (parpadeo)
//  mira: 1 = mira al chow chow y se le acerca un poquito (gesto de cariño)
// ---------------------------------------------------------------
const SHARPEI_CUERPO = { izq: 6, der: 30, centro: 18 };

// Comisura de la boca (de ahí cuelga la baba), según la pose
function bocaSharpei(respira, mira) {
  return { x: 16 - mira + 3, y: 19 - respira };
}

function dibujoSharpei(respira, ojo, mira) {
  const L = lienzoPixel(36, 38);
  const I = 'c';   // líneas de adentro: sombra canela
  const r = respira;
  const hx = 16 - mira;    // la cabeza va corrida hacia el chow chow (más en el gesto de cariño)

  // Colita enroscada asomándose a la derecha
  capaPixel(L, I, (t) => {
    t.elipse(29.5, 23 - r, 2.3, 2.3, 'C');
    t.elipse(30.5, 20.8 - r, 1.3, 1.3, 'C');
  });
  // Cuerpo chico y redondo (al inspirar crece un poquito hacia arriba) y los muslos
  capaPixel(L, I, (t) => {
    t.elipse(18, 28 - r * 0.5, 9, 7.5 + r * 0.5, 'C');
    t.elipse(10, 32.5, 3.8, 3.2, 'C');
    t.elipse(26, 32.5, 3.8, 3.2, 'C');
  });
  // Patitas de adelante: cortas y redondas
  capaPixel(L, I, (t) => {
    t.elipse(14.5, 34, 2.4, 2.4, 'C');
    t.elipse(21.5, 34, 2.4, 2.4, 'C');
  });
  // Cabeza grande y cuadrada, con la papada que cuelga a los lados (hocico de hipopótamo)
  capaPixel(L, I, (t) => {
    t.elipse(hx, 12 - r, 9.5, 8, 'C');
    t.elipse(hx - 7.5, 17 - r, 3, 3.4, 'C');
    t.elipse(hx + 7.5, 17 - r, 3, 3.4, 'C');
  });
  bordeExterior(L, I, 'D');
  L.volumen('C', 'L', null, 'D');   // solo brillo arriba (las sombras son las líneas de adentro)
  // Hocico ancho y abultado
  capaPixel(L, 'c', (t) => t.elipse(hx, 17.5 - r, 6, 3.5, 'L'));
  // Orejas chicas dobladas hacia adelante: triangulitos en el borde de la cabeza que apuntan a los ojos
  capaPixel(L, 'D', (t) => {
    t.triangulo(hx - 9, 5 - r, hx - 4, 4 - r, hx - 6, 8 - r, 'c');
    t.triangulo(hx + 9, 5 - r, hx + 4, 4 - r, hx + 6, 8 - r, 'c');
  });

  // Arrugas: 2 en la frente y 2 pliegues en el cuello (líneas simples)
  const arco = (x0, x1, y, curva) => {
    L.linea(x0, y + curva, hx, y, 'c');
    L.linea(hx, y, x1, y + curva, 'c');
  };
  arco(hx - 3, hx + 3, 6 - r, 1);
  arco(hx - 2, hx + 2, 8 - r, 1);
  arco(hx - 4, hx + 4, 22.5 - r, -1);
  arco(hx - 3, hx + 3, 24.5 - r, -1);

  // Ojos caídos y tiernos: achinados, con brillo, y un párpado gordo que cae hacia afuera
  [[hx - 5, -1], [hx + 3, 1]].forEach(([x, lado]) => {
    const y = 12 - r;
    const ex = x - mira;   // al mirar al chow chow, los ojos se corren a la izquierda
    // párpado: rayita arriba del ojo que baja hacia el lado de afuera
    L.linea(x - 1, y, x + 2, y, 'c');
    L.pon(lado < 0 ? x - 2 : x + 3, y + 1, 'c');
    if (ojo) {
      L.linea(ex, y + 1, ex + 1, y + 1, 'c');     // cerrado
    } else {
      L.pon(ex, y + 1, 'E'); L.pon(ex + 1, y + 1, 'E');
      L.pon(ex + (lado < 0 ? 1 : 0), y + 1, 'W');  // brillo
      L.pon(ex, y + 2, 'E'); L.pon(ex + 1, y + 2, 'E');
    }
  });
  // Nariz rosada-café con brillo
  L.rect(hx - 1, 15 - r, 3, 2, 'Z');
  L.pon(hx - 1, 15 - r, 'L');
  // Boca simple y alegre
  L.pon(hx, 17 - r, 'c');
  L.linea(hx - 3, 18 - r, hx - 1, 19 - r, 'c');
  L.linea(hx + 1, 19 - r, hx + 3, 18 - r, 'c');
  L.pon(hx, 18 - r, 'c');
  return L.filas();
}

// Cuadro de cada pose dentro de la textura
function cuadroChow(cola, lengua, mira, oreja) { return ((oreja * 2 + mira) * 2 + lengua) * 4 + cola; }
function cuadroSharpei(respira, ojo, mira) { return (mira * 2 + ojo) * 2 + respira; }

// Crea las texturas de los dos perros (solo la primera vez)
function crearTexturasPortada(escena) {
  if (!escena.textures.exists('portada_chow')) {
    const cuadros = [];
    for (let oreja = 0; oreja < 2; oreja++) for (let mira = 0; mira < 2; mira++)
      for (let lengua = 0; lengua < 2; lengua++) for (let cola = 0; cola < 4; cola++) cuadros.push(dibujoChow(cola, lengua, mira, oreja));
    crearTexturaPixel(escena, 'portada_chow', { colores: COLORES_CHOW, cuadros });
  }
  if (!escena.textures.exists('portada_sharpei')) {
    const cuadros = [];
    for (let mira = 0; mira < 2; mira++) for (let ojo = 0; ojo < 2; ojo++)
      for (let respira = 0; respira < 2; respira++) cuadros.push(dibujoSharpei(respira, ojo, mira));
    crearTexturaPixel(escena, 'portada_sharpei', { colores: COLORES_SHARPEI, cuadros });
  }
}

// ---------------------------------------------------------------
//  La portada completa. Devuelve un objeto con actualizar(tiempo) y
//  los perros (para poner el "¡Guau!" encima).
// ---------------------------------------------------------------
function crearPortada(escena) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const h = escena.scale.height;
  const suelo = Math.round(h * P.VEREDA_Y);   // donde están sentados los perros
  const azar = new Phaser.Math.RandomDataGenerator(['portada']);

  dibujarCieloPortada(escena, suelo, azar);
  dibujarEdificiosPortada(escena, suelo, azar);
  dibujarCallePortada(escena, suelo);
  crearFarolesPortada(escena, suelo);
  dibujarBasurerosPortada(escena, suelo);

  // Los dos perros juntos, hombro con hombro, centrados en PAREJA_X
  crearTexturasPortada(escena);
  const px = P.PIXEL;
  const anchoChow = CHOW_ANCHO;
  const anchoSharpei = 36;
  // distancia entre los centros de las texturas para que se toquen (SOLAPE = cuántos cuadritos se juntan)
  const entre = (CHOW_CUERPO.der - anchoChow / 2) + (anchoSharpei / 2 - SHARPEI_CUERPO.izq) - P.SOLAPE;
  const izqTotal = CHOW_CUERPO.izq - anchoChow / 2;                  // borde izquierdo del chow (desde su centro)
  const derTotal = entre + (SHARPEI_CUERPO.der - anchoSharpei / 2);   // borde derecho del shar pei (desde el centro del chow)
  const xChow = Math.round(w * P.PAREJA_X - ((izqTotal + derTotal) / 2) * px);
  const xSharpei = xChow + entre * px;
  // las texturas tienen 1 fila libre abajo del contorno: se bajan 1 cuadrito para tocar la vereda
  const yBase = suelo + px;

  // Luz suave de farol detrás del chow chow (para que lo negro no se pierda en la noche)
  const luz = escena.add.graphics();
  const yLuz = suelo - 16 * px;
  [[22, 0.05], [17, 0.06], [12, 0.07]].forEach(([r, a]) => luz.fillStyle(0xffd27a, a).fillCircle(xChow, yLuz, r * px));

  // Sombras elípticas oscuras bajo cada perro
  const sombra = escena.add.graphics();
  sombra.fillStyle(0x000000, 0.45);
  sombra.fillEllipse(xChow, suelo - px * 0.5, 22 * px, 3 * px);
  sombra.fillEllipse(xSharpei, suelo - px * 0.5, 25 * px, 3 * px);

  // El shar pei va delante: apoya el hombro y la cabeza hacia el chow chow
  const chow = escena.add.sprite(xChow, yBase, 'portada_chow', 0).setOrigin(0.5, 1).setScale(px);
  const sharpei = escena.add.sprite(xSharpei, yBase, 'portada_sharpei', 0).setOrigin(0.5, 1).setScale(px);
  const baba = escena.add.graphics();
  const corazon = escena.add.graphics();

  const portada = {
    chow, sharpei, suelo,
    proximoParpadeo: 0,
    parpadeoHasta: 0,
    proximoCarino: 0,
    carinoHasta: 0,
    proximaOreja: 0,
    orejaHasta: 0,
    actualizar(tiempo) {
      const entre2 = (rango) => tiempo + Phaser.Math.Between(rango[0], rango[1]);
      if (this.proximoParpadeo === 0) {
        this.proximoParpadeo = entre2(P.PARPADEO_CADA_MS);
        this.proximoCarino = entre2(P.CARINO_CADA_MS);
        this.proximaOreja = entre2(P.OREJA_CADA_MS);
      }

      // Gesto de cariño: se miran un momento (el shar pei se acerca un poquito) y sale un corazón
      if (tiempo >= this.proximoCarino) {
        this.carinoHasta = tiempo + P.CARINO_MS;
        this.proximoCarino = entre2(P.CARINO_CADA_MS);
        this.orejaHasta = tiempo + P.OREJA_MS;     // el chow chow también mueve la oreja
        corazonPortada(escena, corazon, (xChow + xSharpei) / 2, suelo - 33 * px, px);
      }
      if (tiempo >= this.proximaOreja) {            // y a veces mueve la oreja solo
        this.orejaHasta = tiempo + P.OREJA_MS;
        this.proximaOreja = entre2(P.OREJA_CADA_MS);
      }
      const mira = tiempo < this.carinoHasta ? 1 : 0;
      const oreja = tiempo < this.orejaHasta ? 1 : 0;

      // Chow chow: mueve la cola y jadea (la lengua nunca se mete)
      const cola = Math.floor(tiempo / P.COLA_MS) % 4;
      const lengua = Math.floor(tiempo / P.JADEO_MS) % 2;
      chow.setFrame(cuadroChow(cola, lengua, mira, oreja));

      // Shar pei: respira y parpadea cada tanto
      const respira = Math.sin(tiempo / P.RESPIRA_MS * Math.PI * 2) > 0 ? 1 : 0;
      if (tiempo >= this.proximoParpadeo) {
        this.parpadeoHasta = tiempo + P.PARPADEO_DURA_MS;
        this.proximoParpadeo = entre2(P.PARPADEO_CADA_MS);
      }
      const ojo = tiempo < this.parpadeoHasta ? 1 : 0;
      sharpei.setFrame(cuadroSharpei(respira, ojo, mira));

      // Hilo de baba que cuelga de la boca del shar pei y se balancea
      dibujarBaba(baba, sharpei, bocaSharpei(respira, mira), tiempo, px);
    }
  };
  return portada;
}

// Corazoncito de pixel art que sube y se desvanece (gesto de cariño)
function corazonPortada(escena, g, x, y, px) {
  const forma = ['.KK.KK.', 'KRRKRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'];
  const colores = { K: 0x5c1a2a, R: 0xff6b8a };
  const p = Math.max(2, Math.round(px * 0.8));
  escena.tweens.killTweensOf(g);
  g.clear().setPosition(0, 0).setAlpha(1);
  forma.forEach((fila, fy) => {
    for (let fx = 0; fx < fila.length; fx++) {
      const l = fila[fx];
      if (l === '.') continue;
      g.fillStyle(colores[l], 1).fillRect(x + (fx - 3.5) * p, y + fy * p, p, p);
    }
  });
  escena.tweens.add({ targets: g, y: -6 * px, alpha: 0, delay: 300, duration: CONFIG.PORTADA.CARINO_MS + 400 });
}

// Hilo de baba: una cadenita de cuadritos que cuelga de la comisura y se mece (péndulo suave)
function dibujarBaba(g, sharpei, boca, tiempo, px) {
  const P = CONFIG.PORTADA;
  g.clear();
  const izq = sharpei.x - sharpei.displayWidth / 2;
  const arriba = sharpei.y - sharpei.displayHeight;
  const x0 = izq + (boca.x + 0.5) * px;
  const y0 = arriba + (boca.y + 1) * px;
  // el largo cambia un poquito (se estira y se encoge)
  const largo = P.BABA_LARGO + Math.round(Math.sin(tiempo / (P.BABA_VAIVEN_MS * 1.7)) * 0.8);
  const angulo = Math.sin(tiempo / P.BABA_VAIVEN_MS * Math.PI * 2) * P.BABA_ANGULO;
  for (let k = 0; k < largo; k++) {
    const t = (k + 1) / largo;
    const x = Math.round((x0 + Math.sin(angulo) * k * px * t) / px) * px;
    g.fillStyle(0xd8eefc, 0.75).fillRect(x - px / 2, y0 + k * px, px, px);
  }
  // gotita en la punta, más gordita
  const xf = Math.round((x0 + Math.sin(angulo) * (largo - 1) * px) / px) * px;
  g.fillStyle(0xffffff, 0.95).fillRect(xf - px / 2 - 1, y0 + largo * px, px + 2, px);
}

// ---------------------------------------------------------------
//  FONDO: cielo, estrellas, luna, edificios, calle, faroles y basureros
// ---------------------------------------------------------------

function dibujarCieloPortada(escena, suelo, azar) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const g = escena.add.graphics();
  g.fillGradientStyle(0x060a22, 0x060a22, 0x1c2754, 0x1c2754, 1).fillRect(0, 0, w, suelo);
  for (let i = 0; i < P.ESTRELLAS; i++) {
    g.fillStyle(0xffffff, azar.realInRange(0.3, 0.9)).fillRect(azar.between(0, w), azar.between(0, suelo - 160), 2, 2);
  }
  // Estrellas que brillan (crecen un poco y se apagan)
  for (let i = 0; i < P.ESTRELLAS_BRILLAN; i++) {
    const s = escena.add.rectangle(azar.between(20, w - 20), azar.between(10, suelo - 180), 3, 3, 0xfff8e1);
    escena.tweens.add({
      targets: s, alpha: 0.1, scale: 0.6, duration: azar.between(P.ESTRELLA_MS[0], P.ESTRELLA_MS[1]),
      yoyo: true, repeat: -1, delay: azar.between(0, 1500), ease: 'Sine.easeInOut'
    });
  }
  // Luna en pixel art
  const lx = Math.round(w * P.LUNA_X);
  const ly = P.LUNA_Y + margenExtra() / 2;
  g.fillStyle(0xfff3c4, 0.08).fillCircle(lx + 3, ly, 64);
  g.fillStyle(0xfff3c4, 1);
  [[-2, 3], [-3, 4], [-4, 4], [-4, 4], [-4, 4], [-4, 4], [-3, 4], [-2, 3]].forEach(([a, b], fila) => {
    g.fillRect(lx + a * 6, ly + (fila - 4) * 6, (b - a) * 6, 6);
  });
  g.fillStyle(0xe6d79a, 1).fillRect(lx - 12, ly - 12, 6, 6).fillRect(lx + 6, ly + 6, 12, 6).fillRect(lx - 6, ly + 12, 6, 6);
}

// Edificios con ventanas; algunas ventanas se prenden y apagan solas
function dibujarEdificiosPortada(escena, suelo, azar) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const g = escena.add.graphics();
  const base = suelo - 6;
  const ventanasQueCambian = [];
  const colores = [0x141a36, 0x10152e, 0x181d3a];
  let x = -10;
  let n = 0;
  while (x < w) {
    const ancho = azar.between(70, 130);
    const alto = azar.between(P.EDIFICIO_ALTO[0], P.EDIFICIO_ALTO[1]);
    const color = colores[n++ % colores.length];
    g.fillStyle(color, 1).fillRect(x, base - alto, ancho, alto);
    g.fillStyle(0x0b0f24, 1).fillRect(x, base - alto, ancho, 4);           // cornisa
    if (azar.frac() < 0.4) g.fillRect(x + ancho / 2 - 4, base - alto - 14, 8, 14); // antena / chimenea
    // Ventanas en grilla
    for (let vy = base - alto + 14; vy < base - 22; vy += 20) {
      for (let vx = x + 10; vx < x + ancho - 14; vx += 18) {
        const prendida = azar.frac() < 0.3;
        g.fillStyle(prendida ? 0xffd27a : 0x0a0d1f, prendida ? 0.85 : 1).fillRect(vx, vy, 8, 10);
        if (!prendida && azar.frac() < 0.08) ventanasQueCambian.push({ x: vx, y: vy });
      }
    }
    x += ancho + azar.between(0, 8);
  }
  // Ventanas que se prenden y apagan (cada una a su ritmo)
  ventanasQueCambian.slice(0, P.VENTANAS_QUE_CAMBIAN).forEach((v) => {
    const r = escena.add.rectangle(v.x, v.y, 8, 10, 0xffd27a).setOrigin(0).setAlpha(0);
    const cambiar = () => {
      const prender = r.alpha < 0.5;
      r.setAlpha(prender ? 0.85 : 0);
      escena.time.delayedCall(Phaser.Math.Between(P.VENTANA_MS[0], P.VENTANA_MS[1]), cambiar);
    };
    escena.time.delayedCall(Phaser.Math.Between(0, P.VENTANA_MS[1]), cambiar);
  });
}

// Vereda (donde están los perros), solera y calle con línea pintada
function dibujarCallePortada(escena, suelo) {
  const w = escena.scale.width;
  const h = escena.scale.height;
  const g = escena.add.graphics();
  const veredaArriba = suelo - 30;
  // Vereda de baldosas
  g.fillStyle(0x4a4a5a, 1).fillRect(0, veredaArriba, w, suelo + 22 - veredaArriba);
  g.fillStyle(0x3a3a48, 1);
  for (let bx = 0; bx < w; bx += 40) g.fillRect(bx, veredaArriba, 2, suelo + 22 - veredaArriba);
  g.fillRect(0, veredaArriba, w, 2).fillRect(0, suelo - 4, w, 2);
  // Solera
  g.fillStyle(0x9a9a9a, 1).fillRect(0, suelo + 22, w, 6);
  g.fillStyle(0x6b6b6b, 1).fillRect(0, suelo + 28, w, 3);
  // Calle de asfalto con línea segmentada
  g.fillStyle(0x23232a, 1).fillRect(0, suelo + 31, w, h - suelo - 31);
  g.fillStyle(0x2c2c34, 1);
  const azar = new Phaser.Math.RandomDataGenerator(['calle']);
  for (let i = 0; i < 70; i++) g.fillRect(azar.between(0, w), azar.between(suelo + 34, h - 4), 4, 4);
  g.fillStyle(0xc9a83a, 0.8);
  const yLinea = h - 16; // abajo de todo, para no pasar por detrás del texto "Toca o presiona..." (PC y celular)
  for (let lx = 10; lx < w; lx += 64) g.fillRect(lx, yLinea, 34, 5);
}

// Faroles con luz que titila (uno anda medio malo)
function crearFarolesPortada(escena, suelo) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  P.FAROLES_X.forEach((fraccion, i) => {
    const x = Math.round(w * fraccion);
    const pie = suelo - 26;
    const arriba = pie - P.FAROL_ALTO;
    const luz = escena.add.graphics();
    [[90, 0.06], [60, 0.08], [36, 0.12]].forEach(([r, a]) => luz.fillStyle(0xffd27a, a).fillCircle(x, arriba + 10, r));
    luz.fillStyle(0xffd27a, 0.12).fillEllipse(x, suelo - 8, 190, 34);
    const poste = escena.add.graphics();
    poste.fillStyle(0x22222c, 1).fillRect(x - 3, arriba + 16, 6, pie - arriba - 16);
    poste.fillRect(x - 8, pie - 6, 16, 8);
    poste.fillRect(x - 10, arriba - 6, 20, 6).fillRect(x - 6, arriba + 12, 12, 6);
    const ampolleta = escena.add.rectangle(x, arriba + 6, 14, 12, 0xffe9a8);
    titilarPortada(escena, [luz, ampolleta], i === P.FAROL_MALO);
  });
}

function titilarPortada(escena, objetos, malo) {
  const P = CONFIG.PORTADA;
  const rango = malo ? P.FAROL_MALO_MS : P.FAROL_TITILA_MS;
  escena.time.delayedCall(Phaser.Math.Between(rango[0], rango[1]), () => {
    const veces = malo ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(1, 2);
    let t = 0;
    for (let k = 0; k < veces; k++) {
      escena.time.delayedCall(t, () => objetos.forEach((o) => o.setAlpha(Phaser.Math.FloatBetween(0.15, 0.5))));
      t += Phaser.Math.Between(50, 110);
      escena.time.delayedCall(t, () => objetos.forEach((o) => o.setAlpha(1)));
      t += Phaser.Math.Between(60, 140);
    }
    escena.time.delayedCall(t, () => titilarPortada(escena, objetos, malo));
  });
}

// Basureros verdes (como los del juego) sobre la vereda
function dibujarBasurerosPortada(escena, suelo) {
  const P = CONFIG.PORTADA;
  const w = escena.scale.width;
  const g = escena.add.graphics();
  P.BASUREROS_X.forEach((fraccion) => {
    const x = Math.round(w * fraccion);
    const y = suelo - 8;
    g.fillStyle(0x1b1b1b, 1).fillRect(x - 16, y - 46, 32, 48);   // borde
    g.fillStyle(0x2e7d32, 1).fillRect(x - 13, y - 40, 26, 39);   // tarro
    g.fillStyle(0x1b5e20, 1).fillRect(x - 13, y - 40, 5, 39).fillRect(x + 4, y - 40, 3, 39); // franjas
    g.fillStyle(0x43a047, 1).fillRect(x - 16, y - 46, 32, 6);    // tapa
    g.fillStyle(0x1b1b1b, 1).fillRect(x - 5, y - 50, 10, 4);     // manilla
    g.fillStyle(0xc68642, 1).fillRect(x + 6, y - 50, 6, 4);      // algo que se asoma
  });
}
