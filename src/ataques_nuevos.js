// ===============================================================
//  ATAQUES NUEVOS (v0.24): Patada trasera, Tirar caca, Meada,
//  Ladrido fuerte y Hedor; y las mejoras de stats Lomo ágil
//  (enfriamiento), Lengüetazo (regeneración), Pelaje grueso
//  (armadura) y Pata de conejo (suerte).
//  Se ganan como instintos (src/instintos.js), hasta Nv 5.
//  Los números están en src/config.js (ATAQUES y MEJORAS).
//  Aquí están los dibujos y el código.
// ===============================================================

// ---------------------------------------------------------------
//  Inicio de la partida (lo llama iniciarAtaques, en src/ataques.js)
// ---------------------------------------------------------------
function iniciarAtaquesNuevos(escena) {
  escena.esperaPatada = 0;
  escena.esperaCaca = 0;
  escena.esperaLadridoFuerte = 0;
  escena.esperaHedor = 0;
  escena.esperaManchas = 0;
  escena.esperaCharcos = 0;
  escena.cacasVolando = [];     // cacas en el aire
  escena.manchasCaca = [];      // manchas de caca en el suelo
  escena.charcos = [];          // charcos de la Meada
  escena.meadaRecorrido = 0;    // cuánto caminó desde el último charco
  escena.meadaUltimo = null;    // dónde estaba el perro el cuadro anterior
  escena.regeneracionResto = 0; // vida "a medias" del Lengüetazo (se suma cuando llega a 1)
  escena.nubesHedor = [];       // dibujos de la nube del Hedor
  escena.moscasHedor = [];      // moscas que vuelan en la nube
  escena.radioHedorDibujado = 0;

  // Dibujos (solo la primera vez)
  if (!escena.textures.exists('caca_vuela')) {
    crearTexturaPixel(escena, 'caca_vuela', {
      colores: { C: 0x795548, c: 0x4e342e },
      cuadros: [[
        '..K...',
        '.KCK..',
        '.KCcK.',
        'KCWCCK',
        'KcCCcK',
        '.KKKK.'
      ]]
    });
  }
  if (!escena.textures.exists('patada_pata')) {
    crearTexturaPixel(escena, 'patada_pata', {
      colores: { P: 0xc8935a, p: 0x5d4037 },
      cuadros: [[
        '..KKKK..',
        '.KPPPPK.',
        'KPpPPpPK',
        'KPPPPPPK',
        'KPpPPpPK',
        '.KPPPPK.',
        '..KKKK..'
      ]]
    });
  }
  if (!escena.textures.exists('mosca')) {
    // dos cuadros: alas arriba y alas abajo
    crearTexturaPixel(escena, 'mosca', {
      colores: { A: 0xcfd8dc },
      cuadros: [['A.A', '.K.', '...'], ['...', '.K.', 'A.A']]
    });
  }
}

// Lo llama actualizarAtaques (src/ataques.js) en cada cuadro
function actualizarAtaquesNuevos(escena, delta, puedeAtacar) {
  const nv = (id) => escena.instintos[id] || 0;

  // Patada trasera
  if (nv('patada') > 0 && puedeAtacar) {
    const espera = datosPatada(nv('patada'), escena).cadaMs;
    escena.esperaPatada = Math.min(espera, escena.esperaPatada + delta);
    if (escena.esperaPatada >= espera && patear(escena, nv('patada'))) escena.esperaPatada = 0;
  }

  // Tirar caca
  if (nv('caca') > 0 && puedeAtacar) {
    const espera = datosCaca(nv('caca'), escena).cadaMs;
    escena.esperaCaca = Math.min(espera, escena.esperaCaca + delta);
    if (escena.esperaCaca >= espera && tirarCaca(escena, nv('caca'))) escena.esperaCaca = 0;
  }
  moverCacas(escena);
  actualizarManchas(escena, delta, puedeAtacar);

  // Meada
  if (nv('meada') > 0 && puedeAtacar) dejarCharcos(escena, nv('meada'));
  else escena.meadaUltimo = null;
  actualizarCharcos(escena, delta, puedeAtacar);

  // Ladrido fuerte
  if (nv('ladridoFuerte') > 0 && puedeAtacar) {
    const espera = datosLadridoFuerte(nv('ladridoFuerte'), escena).cadaMs;
    escena.esperaLadridoFuerte = Math.min(espera, escena.esperaLadridoFuerte + delta);
    if (escena.esperaLadridoFuerte >= espera && ladridoFuerte(escena, nv('ladridoFuerte'))) escena.esperaLadridoFuerte = 0;
  }

  // Hedor (la nube se ve siempre que lo tengas; daña solo si puede atacar)
  actualizarHedor(escena, delta, puedeAtacar);

  // Lengüetazo: se cura poquito a poco
  const cura = vidaPorSegundoLenguetazo(escena);
  if (cura > 0 && !escena.amaneciendo && escena.vida < escena.vidaMax) {
    escena.regeneracionResto += cura * escena.multiplicadorRegeneracion() * delta / 1000;
    if (escena.regeneracionResto >= 1) {
      const entero = Math.floor(escena.regeneracionResto);
      escena.regeneracionResto -= entero;
      escena.vida = Math.min(escena.vidaMax, escena.vida + entero);
    }
  }
}

// ---------------------------------------------------------------
//  MEJORAS DE STATS
// ---------------------------------------------------------------

// Lomo ágil: los tiempos de espera de los ataques se multiplican por esto (1 = igual)
function factorEnfriamiento(escena) {
  const n = (escena && escena.instintos && escena.instintos.enfriamiento) || 0;
  return Math.max(0.3, 1 - n * CONFIG.MEJORAS.ENFRIAMIENTO);
}

// Lengüetazo: vida por segundo
function vidaPorSegundoLenguetazo(escena) {
  return ((escena.instintos && escena.instintos.regeneracion) || 0) * CONFIG.MEJORAS.REGENERACION;
}

// Pelaje grueso: parte del daño que se quita (0.2 = 20% menos)
function reduccionArmadura(escena) {
  return Math.min(0.9, ((escena.instintos && escena.instintos.armadura) || 0) * CONFIG.MEJORAS.ARMADURA);
}

// Pata de conejo: las rarezas mejores que la común pesan esto más (1.4 = 40% más seguido)
function multiplicadorSuerte(escena) {
  return 1 + ((escena.instintos && escena.instintos.suerte) || 0) * CONFIG.MEJORAS.SUERTE;
}

// Cuántos espacios de ataque se usan (instintos de ataque con nivel 1 o más)
function espaciosAtaqueUsados(escena) {
  return INSTINTOS.filter((i) => i.ataque && (escena.instintos[i.id] || 0) > 0).length;
}

// ---------------------------------------------------------------
//  NÚMEROS DE CADA ATAQUE EN UN NIVEL
//  (escena es opcional: si se da, se aplica el Lomo ágil)
// ---------------------------------------------------------------

function datosPatada(nv, escena) {
  const c = CONFIG.ATAQUES.PATADA;
  const n = Math.max(0, nv - 1);
  return {
    cadaMs: c.CADA_MS * factorEnfriamiento(escena),
    dano: c.DANO + n * c.DANO_EXTRA,
    empuje: c.EMPUJE + n * c.EMPUJE_EXTRA,
    alcance: c.ALCANCE,
    angulo: c.ANGULO
  };
}

function datosCaca(nv, escena) {
  const c = CONFIG.ATAQUES.CACA;
  const n = Math.max(0, nv - 1);
  return {
    cadaMs: c.CADA_MS * factorEnfriamiento(escena),
    cacas: c.CACAS + Math.floor(n / Math.max(1, c.CACA_CADA_NIVELES)),
    danoGolpe: c.DANO_GOLPE + n * c.DANO_GOLPE_EXTRA,
    danoMancha: c.DANO_MANCHA + n * c.DANO_MANCHA_EXTRA,
    manchaMs: c.MANCHA_MS + n * c.MANCHA_EXTRA_MS
  };
}

function datosMeada(nv) {
  const c = CONFIG.ATAQUES.MEADA;
  const n = Math.max(0, nv - 1);
  return {
    dano: c.DANO + n * c.DANO_EXTRA,
    radio: c.RADIO + n * c.RADIO_EXTRA,
    duraMs: c.DURA_MS + n * c.DURA_EXTRA_MS
  };
}

function datosLadridoFuerte(nv, escena) {
  const c = CONFIG.ATAQUES.LADRIDO_FUERTE;
  const n = Math.max(0, nv - 1);
  return {
    cadaMs: Math.max(800, c.CADA_MS - n * c.CADA_MENOS_MS) * factorEnfriamiento(escena),
    radio: c.RADIO + n * c.RADIO_EXTRA,
    dano: c.DANO + n * c.DANO_EXTRA,
    aturdeMs: c.ATURDE_MS
  };
}

function datosHedor(nv) {
  const c = CONFIG.ATAQUES.HEDOR;
  const n = Math.max(0, nv - 1);
  return {
    radio: c.RADIO * Math.pow(c.RADIO_MULT, n),
    dano: c.DANO * Math.pow(c.DANO_MULT, n),
    moscas: c.MOSCAS + n * c.MOSCAS_EXTRA
  };
}

// ---------------------------------------------------------------
//  PATADA TRASERA
// ---------------------------------------------------------------

// Patea hacia atrás (al revés de donde mira). Devuelve false si no hay nadie atrás.
function patear(escena, nv) {
  const d = datosPatada(nv, escena);
  const p = escena.perro;
  const dir = escena.ultimaDireccion;
  const atras = Math.atan2(-dir.y, -dir.x);
  const mitad = Phaser.Math.DegToRad(d.angulo) / 2;
  const alcance = escena.base.RADIO + d.alcance;
  const enCono = (en) => {
    const dist = Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y);
    if (dist - en.radio > alcance) return false;
    const dif = Math.abs(Phaser.Math.Angle.Wrap(Phaser.Math.Angle.Between(p.x, p.y, en.x, en.y) - atras));
    return dif <= mitad;
  };
  const golpeados = escena.enemigos.getChildren().filter((en) => en.active && enCono(en));
  if (golpeados.length === 0) return false;

  const ahora = escena.tiempoSobrevivido;
  golpeados.forEach((en) => {
    if (!en.esJefe) {
      const ang = Phaser.Math.Angle.Between(p.x, p.y, en.x, en.y);
      en.body.setVelocity(Math.cos(ang) * d.empuje, Math.sin(ang) * d.empuje);
      en.empujadoHasta = ahora + CONFIG.ATAQUES.PATADA.EMPUJE_MS;
    }
    escena.danarEnemigo(en, d.dano);
  });
  escena.marcarAtaqueVisual();

  // Dibujo: la pata sale disparada hacia atrás y un arco de golpe
  const px = p.x + Math.cos(atras) * (escena.base.RADIO + 6);
  const py = p.y + Math.sin(atras) * (escena.base.RADIO + 6);
  const pata = escena.add.image(px, py, 'patada_pata', 0).setScale(ESCALA_PIXEL).setDepth(11).setRotation(atras);
  escena.tweens.add({
    targets: pata, x: p.x + Math.cos(atras) * alcance * 0.8, y: p.y + Math.sin(atras) * alcance * 0.8,
    alpha: 0, duration: 200, ease: 'Quad.easeOut', onComplete: () => pata.destroy()
  });
  const g = escena.add.graphics({ x: p.x, y: p.y }).setDepth(21);
  [0.7, 1].forEach((f, i) => {
    g.lineStyle(i ? 4 : 3, i ? 0xffe082 : 0xffffff, 0.9);
    g.beginPath();
    g.arc(0, 0, alcance * f, atras - mitad * f, atras + mitad * f, false);
    g.strokePath();
  });
  escena.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() });
  if (!efectosLimitados(escena)) polvo(escena, p.x, p.y + escena.base.RADIO * 0.6, 3);
  return true;
}

// ---------------------------------------------------------------
//  TIRAR CACA
// ---------------------------------------------------------------

// Lanza cacas en arco hacia los enemigos más cercanos. Devuelve false si no hay nadie.
function tirarCaca(escena, nv) {
  const c = CONFIG.ATAQUES.CACA;
  const d = datosCaca(nv, escena);
  const p = escena.perro;
  const objetivos = escena.enemigos.getChildren()
    .filter((en) => en.active)
    .map((en) => ({ en, dist: Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) }))
    .filter((o) => o.dist - o.en.radio <= c.ALCANCE)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, d.cacas);
  if (objetivos.length === 0) return false;

  const ahora = escena.tiempoSobrevivido;
  for (let i = 0; i < d.cacas; i++) {
    // si hay menos enemigos que cacas, las que sobran caen cerca del más cercano
    const o = objetivos[i] || objetivos[0];
    const desvio = objetivos[i] ? 0 : 1;
    const tx = o.en.x + desvio * Phaser.Math.Between(-c.RADIO, c.RADIO);
    const ty = o.en.y + desvio * Phaser.Math.Between(-c.RADIO, c.RADIO);
    const img = escena.add.image(p.x, p.y, 'caca_vuela', 0).setScale(ESCALA_PIXEL).setDepth(12);
    escena.cacasVolando.push({
      img, sx: p.x, sy: p.y, tx, ty,
      desde: ahora + i * 90, dura: c.VUELO_MS,
      danoGolpe: d.danoGolpe, danoMancha: d.danoMancha, manchaMs: d.manchaMs
    });
  }
  return true;
}

function moverCacas(escena) {
  if (escena.cacasVolando.length === 0) return;
  const c = CONFIG.ATAQUES.CACA;
  const ahora = escena.tiempoSobrevivido;
  escena.cacasVolando = escena.cacasVolando.filter((k) => {
    const t = Phaser.Math.Clamp((ahora - k.desde) / k.dura, 0, 1);
    const arco = Math.sin(t * Math.PI) * c.ALTURA;
    k.img.setPosition(k.sx + (k.tx - k.sx) * t, k.sy + (k.ty - k.sy) * t - arco)
      .setRotation(t * Math.PI * 3).setScale(ESCALA_PIXEL * (1 + Math.sin(t * Math.PI) * 0.4));
    if (t < 1) return true;

    // Cae: golpe en el lugar y deja una mancha
    k.img.destroy();
    escena.enemigos.getChildren().slice().forEach((en) => {
      if (!en.active || Phaser.Math.Distance.Between(k.tx, k.ty, en.x, en.y) > c.RADIO + en.radio) return;
      en.lentoHasta = Math.max(en.lentoHasta || 0, ahora + c.FRENO_MS);
      escena.danarEnemigo(en, k.danoGolpe);
    });
    const img = escena.add.image(k.tx, k.ty, texturaMancha(escena, 'mancha_caca', c.RADIO,
      ['#5d4037', '#795548', '#4e342e']), 0).setDepth(2).setAlpha(0.9);
    escena.manchasCaca.push({ x: k.tx, y: k.ty, hasta: ahora + k.manchaMs, img, dano: k.danoMancha });
    if (!efectosLimitados(escena)) {
      img.setScale(0.4);
      escena.tweens.add({ targets: img, scale: 1, duration: 120 });
    }
    return false;
  });
}

// Las manchas dañan y frenan cada TICK_MS a los que las pisan
function actualizarManchas(escena, delta, puedeAtacar) {
  if (escena.manchasCaca.length === 0) return;
  const c = CONFIG.ATAQUES.CACA;
  const ahora = escena.tiempoSobrevivido;
  escena.esperaManchas += delta;
  const toca = escena.esperaManchas >= c.TICK_MS;
  if (toca) escena.esperaManchas = 0;
  if (toca && puedeAtacar) danarEnZonas(escena, escena.manchasCaca, c.RADIO, (en) => {
    en.lentoHasta = Math.max(en.lentoHasta || 0, ahora + c.FRENO_MS);
  });
  escena.manchasCaca = escena.manchasCaca.filter((m) => {
    const falta = m.hasta - ahora;
    if (falta > 0) {
      if (falta < 500) m.img.setAlpha(0.9 * falta / 500); // se desvanece al final
      return true;
    }
    m.img.destroy();
    return false;
  });
}

// Daña una vez por tick a cada enemigo que pisa al menos una zona (no se suma si pisa varias).
// zonas: [{ x, y, dano, radio? }]. extra(en): algo más que hacerle (frenarlo, por ejemplo)
function danarEnZonas(escena, zonas, radioPorDefecto, extra) {
  escena.enemigos.getChildren().slice().forEach((en) => {
    if (!en.active) return;
    let mejor = 0;
    for (const z of zonas) {
      const r = (z.radio || radioPorDefecto) + en.radio * 0.6;
      const dx = en.x - z.x;
      const dy = en.y - z.y;
      if (dx * dx + dy * dy <= r * r && z.dano > mejor) mejor = z.dano;
    }
    if (mejor <= 0) return;
    if (extra) extra(en);
    escena.danarEnemigo(en, mejor);
  });
}

// ---------------------------------------------------------------
//  MEADA
// ---------------------------------------------------------------

// Mientras camina, cada CHARCO_CADA_PX deja un charco detrás
function dejarCharcos(escena, nv) {
  const c = CONFIG.ATAQUES.MEADA;
  const p = escena.perro;
  if (escena.meadaUltimo) {
    escena.meadaRecorrido += Phaser.Math.Distance.Between(p.x, p.y, escena.meadaUltimo.x, escena.meadaUltimo.y);
  }
  escena.meadaUltimo = { x: p.x, y: p.y };
  if (escena.meadaRecorrido < c.CHARCO_CADA_PX) return;
  escena.meadaRecorrido = 0;

  const d = datosMeada(nv);
  const dir = escena.ultimaDireccion;
  const x = p.x - dir.x * escena.base.RADIO * 0.8;
  const y = p.y - dir.y * escena.base.RADIO * 0.8 + escena.base.RADIO * 0.4;
  const img = escena.add.image(x, y, texturaMancha(escena, 'charco', d.radio,
    ['#f2d64b', '#e6c229', '#fff59d']), 0).setDepth(2).setAlpha(0.7);
  escena.charcos.push({ x, y, radio: d.radio, dano: d.dano, hasta: escena.tiempoSobrevivido + d.duraMs, img });
  // muy viejos fuera (para que no se ponga lento)
  while (escena.charcos.length > c.MAX_CHARCOS) escena.charcos.shift().img.destroy();
}

function actualizarCharcos(escena, delta, puedeAtacar) {
  if (escena.charcos.length === 0) return;
  const c = CONFIG.ATAQUES.MEADA;
  const ahora = escena.tiempoSobrevivido;
  escena.esperaCharcos += delta;
  if (escena.esperaCharcos >= c.TICK_MS) {
    escena.esperaCharcos = 0;
    if (puedeAtacar) danarEnZonas(escena, escena.charcos, c.RADIO);
  }
  escena.charcos = escena.charcos.filter((ch) => {
    const falta = ch.hasta - ahora;
    if (falta > 0) {
      if (falta < 500) ch.img.setAlpha(0.7 * falta / 500);
      return true;
    }
    ch.img.destroy();
    return false;
  });
}

// Mancha pixelada e irregular (charco o caca) de un radio en px.
// colores: [principal, borde, brillo] en formato '#rrggbb'. Se crea una vez por tamaño.
function texturaMancha(escena, nombre, radio, colores) {
  const r = Math.max(3, Math.ceil(radio / ESCALA_PIXEL));
  const clave = nombre + '_' + r;
  if (escena.textures.exists(clave)) return clave;
  const lado = r * 2 + 1;
  const textura = escena.textures.createCanvas(clave + '_chico', lado, Math.ceil(lado * 0.7) + 1);
  const ctx = textura.getContext();
  for (let y = 0; y < textura.height; y++) {
    for (let x = 0; x < lado; x++) {
      const dx = (x - r) / r;
      const dy = (y - r * 0.7) / (r * 0.7);
      // borde ondulado (siempre igual para el mismo tamaño)
      const ang = Math.atan2(dy, dx);
      const limite = 0.85 + 0.15 * Math.sin(ang * 3 + r) * Math.cos(ang * 2);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > limite) continue;
      if (d > limite - 0.18) ctx.fillStyle = colores[1];
      else if (dx < -0.2 && dy < -0.2 && d < 0.5 && (x + y) % 3 === 0) ctx.fillStyle = colores[2];
      else ctx.fillStyle = colores[0];
      ctx.fillRect(x, y, 1, 1);
    }
  }
  textura.refresh();
  // versión agrandada (cuadritos de ESCALA_PIXEL) para no tener que escalar cada imagen
  const grande = escena.textures.createCanvas(clave, textura.width * ESCALA_PIXEL, textura.height * ESCALA_PIXEL);
  const g = grande.getContext();
  g.imageSmoothingEnabled = false;
  g.drawImage(textura.getSourceImage(), 0, 0, grande.width, grande.height);
  grande.refresh();
  return clave;
}

// ---------------------------------------------------------------
//  LADRIDO FUERTE (distinto del Ladrido: aturde en vez de empujar)
// ---------------------------------------------------------------

// Devuelve false si no hay nadie en el círculo (así no se gasta)
function ladridoFuerte(escena, nv) {
  const d = datosLadridoFuerte(nv, escena);
  const p = escena.perro;
  const dentro = escena.enemigos.getChildren().filter((en) =>
    en.active && Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) <= d.radio + en.radio);
  if (dentro.length === 0) return false;

  const ahora = escena.tiempoSobrevivido;
  dentro.forEach((en) => {
    en.aturdidoHasta = Math.max(en.aturdidoHasta || 0, ahora + d.aturdeMs);
    escena.danarEnemigo(en, d.dano);
  });
  escena.marcarAtaqueVisual();

  // Dos anillos rojos que se expanden y un temblor chico
  [0, 90].forEach((retraso, i) => {
    const onda = escena.add.image(p.x, p.y, texturaOnda(escena, d.radio)).setDepth(5)
      .setScale(ESCALA_PIXEL * 0.15).setTint(i ? 0xffab91 : 0xff5722);
    escena.tweens.add({
      targets: onda, scale: ESCALA_PIXEL, alpha: 0, delay: retraso, duration: 320,
      onComplete: () => onda.destroy()
    });
  });
  escena.cameras.main.shake(90, 0.004);
  return true;
}

// ---------------------------------------------------------------
//  HEDOR (aura siempre activa)
// ---------------------------------------------------------------

function actualizarHedor(escena, delta, puedeAtacar) {
  const nv = escena.instintos.hedor || 0;
  if (nv <= 0) return;
  const c = CONFIG.ATAQUES.HEDOR;
  const d = datosHedor(nv);
  const p = escena.perro;

  // Daño cada TICK_MS a los que están dentro
  escena.esperaHedor += delta;
  if (escena.esperaHedor >= c.TICK_MS) {
    escena.esperaHedor = 0;
    if (puedeAtacar) {
      escena.enemigos.getChildren().slice().forEach((en) => {
        if (!en.active || Phaser.Math.Distance.Between(p.x, p.y, en.x, en.y) > d.radio + en.radio * 0.5) return;
        escena.danarEnemigo(en, d.dano);
      });
    }
  }
  dibujarHedor(escena, d);
}

// Nube verde semitransparente que se mueve (debajo de los enemigos y los huesos) con moscas
function dibujarHedor(escena, d) {
  const c = CONFIG.ATAQUES.HEDOR;
  const p = escena.perro;
  const t = escena.tiempoSobrevivido / 1000;

  // Si cambió el tamaño (subió de nivel), se rehacen las nubes con el radio nuevo
  if (Math.round(d.radio) !== escena.radioHedorDibujado) {
    const crecio = escena.radioHedorDibujado > 0 && Math.round(d.radio) > escena.radioHedorDibujado;
    escena.radioHedorDibujado = Math.round(d.radio);
    escena.nubesHedor.forEach((n) => n.destroy());
    escena.nubesHedor = [];
    const capas = [{ f: 1, a: 1 }, { f: 0.78, a: 0.8 }, { f: 0.55, a: 0.7 }];
    capas.forEach((capa, i) => {
      const img = escena.add.image(p.x, p.y, texturaNubeHedor(escena, d.radio * capa.f, i), 0)
        .setDepth(2).setAlpha(c.OPACIDAD * capa.a);
      img.fase = i * 2.1;
      escena.nubesHedor.push(img);
    });
    // al crecer, la nube "se infla" un momento para que se note
    if (crecio) {
      escena.nubesHedor.forEach((n) => {
        n.setScale(0.7);
        escena.tweens.add({ targets: n, scale: 1, duration: 450, ease: 'Back.easeOut' });
      });
      escena.textoFlotante('¡El hedor crece!', '#c5e1a5');
    }
  }
  escena.nubesHedor.forEach((n, i) => {
    // se mueve en círculos chicos y gira lento
    const mueve = d.radio * 0.08;
    n.setPosition(p.x + Math.cos(t * 0.9 + n.fase) * mueve, p.y + Math.sin(t * 1.1 + n.fase) * mueve * 0.7);
    n.setRotation((i % 2 ? -1 : 1) * t * 0.25 + n.fase);
  });

  // Moscas: tantas como el nivel pide; vuelan en ochos dentro de la nube
  while (escena.moscasHedor.length < d.moscas) {
    const m = escena.add.image(p.x, p.y, 'mosca', 0).setScale(ESCALA_PIXEL - 1).setDepth(11);
    m.fase = Math.random() * Math.PI * 2;
    m.vel = Phaser.Math.FloatBetween(1.6, 2.8);
    m.dist = Phaser.Math.FloatBetween(0.35, 0.85);
    escena.moscasHedor.push(m);
  }
  const limitado = efectosLimitados(escena);
  escena.moscasHedor.forEach((m, i) => {
    m.setVisible(!limitado || i < 2);
    const a = t * m.vel + m.fase;
    const r = d.radio * m.dist;
    m.setPosition(p.x + Math.cos(a) * r + Math.sin(a * 3.3) * 6, p.y + Math.sin(a * 2) * r * 0.6 + Math.cos(a * 2.7) * 5);
    m.setFrame(Math.floor(t * 20 + i) % 2);
  });
}

// Nube pixelada con bordes difusos (puntos sueltos en el borde). Una por tamaño y variante.
function texturaNubeHedor(escena, radio, variante) {
  const r = Math.max(4, Math.ceil(radio / ESCALA_PIXEL));
  const clave = 'nube_hedor_' + r + '_' + variante;
  if (escena.textures.exists(clave)) return clave;
  const lado = r * 2 + 1;
  const chica = escena.textures.createCanvas(clave + '_chico', lado, lado);
  const ctx = chica.getContext();
  // ruido siempre igual (para el mismo tamaño y variante)
  const ruido = (x, y) => {
    const s = Math.sin(x * 12.9898 + y * 78.233 + variante * 37.7) * 43758.5453;
    return s - Math.floor(s);
  };
  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const dx = x - r;
      const dy = y - r;
      const ang = Math.atan2(dy, dx);
      // borde con bultos, como nube
      const borde = r * (0.82 + 0.12 * Math.sin(ang * 5 + variante) + 0.06 * Math.sin(ang * 9 + variante * 2));
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > borde) continue;
      const hacia = d / borde; // 0 al centro, 1 en el borde
      // en el borde quedan puntos sueltos (se ve difuso y deja ver lo de abajo)
      if (hacia > 0.7 && ruido(x, y) < (hacia - 0.7) * 2.5) continue;
      const n = ruido(x + 3, y + 7);
      ctx.fillStyle = n < 0.15 ? '#c5e1a5' : n < 0.45 ? '#8bc34a' : '#7cb342';
      ctx.fillRect(x, y, 1, 1);
    }
  }
  chica.refresh();
  const grande = escena.textures.createCanvas(clave, lado * ESCALA_PIXEL, lado * ESCALA_PIXEL);
  const g = grande.getContext();
  g.imageSmoothingEnabled = false;
  g.drawImage(chica.getSourceImage(), 0, 0, grande.width, grande.height);
  grande.refresh();
  return clave;
}

// ---------------------------------------------------------------
//  CARTAS: qué mejora el próximo nivel de cada instinto
// ---------------------------------------------------------------

// Texto corto para la carta: qué da el nivel siguiente (o el nivel 1 si es nuevo)
function textoMejoraInstinto(escena, id) {
  const nv = escena.instintos[id] || 0;
  const sig = nv + 1;
  const n = (v, dec) => numeroPausa(v, dec === undefined ? 1 : dec);
  const s = (ms) => n(ms / 1000, 2) + ' s';
  const pct = (v) => Math.round(v * 100) + '%';
  const nuevo = nv === 0;
  const dif = (a, b) => b - a;

  switch (id) {
    case 'mordidaRapida': return 'Muerdes ' + n(CONFIG.MORDIDA_RAPIDA_MS / 1000, 2) + ' s antes';
    case 'colmillos': return '+' + CONFIG.COLMILLOS_DANO + ' de daño de mordida';
    case 'patasLigeras': return '+' + CONFIG.PATAS_VELOCIDAD + ' de velocidad';
    case 'pellejoDuro': return '+' + CONFIG.PELLEJO_VIDA + ' de vida máxima y te curas ' + CONFIG.PELLEJO_CURA;
    case 'olfato': return '+' + CONFIG.OLFATO_IMAN + ' de radio del imán de huesos';
    case 'ladrido':
      if (nuevo) return n(CONFIG.LADRIDO_DANO) + ' de daño en ' + CONFIG.LADRIDO_RADIO + ' px cada ' + s(CONFIG.LADRIDO_CADA_MS * factorEnfriamiento(escena));
      return '+' + CONFIG.LADRIDO_DANO_EXTRA + ' daño, +' + CONFIG.LADRIDO_RADIO_EXTRA + ' px, ladra ' + s(CONFIG.LADRIDO_CADA_MENOS_MS) + ' antes';
    case 'rasguno': {
      const a = datosRasguno(nv);
      const b = datosRasguno(sig);
      if (nuevo) return n(b.dano) + ' de daño en abanico de ' + b.angulo + '° cada ' + s(b.cadaMs * factorEnfriamiento(escena));
      return '+' + n(dif(a.dano, b.dano)) + ' daño, +' + dif(a.angulo, b.angulo) + '° de abanico, más seguido';
    }
    case 'escarbar': {
      const a = datosEscarbar(nv);
      const b = datosEscarbar(sig);
      if (nuevo) return b.terrones + ' terrón de ' + n(b.dano) + ' que frena ' + s(b.frenoMs);
      return '+' + n(dif(a.dano, b.dano)) + ' daño, frena ' + s(dif(a.frenoMs, b.frenoMs)) + ' más' +
        (b.terrones > a.terrones ? ', +1 terrón' : '');
    }
    case 'patada': {
      const a = datosPatada(nv, escena);
      const b = datosPatada(sig, escena);
      if (nuevo) return n(b.dano) + ' de daño hacia atrás y empuje ' + b.empuje + ', cada ' + s(b.cadaMs);
      return '+' + n(dif(a.dano, b.dano)) + ' de daño y +' + dif(a.empuje, b.empuje) + ' de empuje';
    }
    case 'caca': {
      const a = datosCaca(nv, escena);
      const b = datosCaca(sig, escena);
      if (nuevo) return '1 caca de ' + n(b.danoGolpe) + '; la mancha dura ' + s(b.manchaMs) + ' y frena 2 s';
      return '+' + n(dif(a.danoGolpe, b.danoGolpe)) + ' daño, mancha +' + s(dif(a.manchaMs, b.manchaMs)) +
        (b.cacas > a.cacas ? ', +1 caca' : '');
    }
    case 'meada': {
      const a = datosMeada(nv);
      const b = datosMeada(sig);
      if (nuevo) return 'Charcos de ' + n(b.dano * 2) + ' daño/s que duran ' + s(b.duraMs);
      return '+' + n(dif(a.dano, b.dano) * 2) + ' daño/s, charco +' + dif(a.radio, b.radio) + ' px y +' + s(dif(a.duraMs, b.duraMs));
    }
    case 'ladridoFuerte': {
      const a = datosLadridoFuerte(nv, escena);
      const b = datosLadridoFuerte(sig, escena);
      if (nuevo) return n(b.dano) + ' de daño y aturde ' + s(b.aturdeMs) + ' en ' + b.radio + ' px, cada ' + s(b.cadaMs);
      return '+' + n(dif(a.dano, b.dano)) + ' daño, +' + dif(a.radio, b.radio) + ' px, ladra ' + s(a.cadaMs - b.cadaMs) + ' antes';
    }
    case 'hedor': {
      const a = datosHedor(nv);
      const b = datosHedor(sig);
      const porSeg = 1000 / CONFIG.ATAQUES.HEDOR.TICK_MS;
      if (nuevo) return 'Aura de ' + Math.round(b.radio) + ' px que hace ' + n(b.dano * porSeg) + ' daño/s';
      return 'Radio ' + Math.round(a.radio) + ' → ' + Math.round(b.radio) + ' px, daño/s ' + n(a.dano * porSeg) + ' → ' + n(b.dano * porSeg);
    }
    case 'enfriamiento':
      return 'Ataques esperan ' + pct(CONFIG.MEJORAS.ENFRIAMIENTO) + ' menos (total −' + pct(sig * CONFIG.MEJORAS.ENFRIAMIENTO) + ')';
    case 'regeneracion':
      return '+' + n(CONFIG.MEJORAS.REGENERACION, 2) + ' vida/s (total ' + n(sig * CONFIG.MEJORAS.REGENERACION, 2) + '/s)';
    case 'armadura':
      return pct(CONFIG.MEJORAS.ARMADURA) + ' menos daño recibido (total −' + pct(sig * CONFIG.MEJORAS.ARMADURA) + ')';
    case 'suerte':
      return 'Raro, épico y legendario +' + pct(sig * CONFIG.MEJORAS.SUERTE) + ' más seguido';
    default: return '';
  }
}

// ---------------------------------------------------------------
//  Para la pestaña Stats de la pausa (las llama filasAtaquesStats)
// ---------------------------------------------------------------
function filasAtaquesNuevosStats(escena) {
  const e = escena;
  const max = CONFIG.INSTINTO_NIVEL_MAX;
  const s = (ms) => numeroPausa(ms / 1000, 2) + ' s';
  const fila = (id, nombre, detalle) => {
    const nv = e.instintos[id] || 0;
    return { id, nombre, valor: nv ? 'Nv ' + nv + ' / ' + max : 'sin aprender', apagado: !nv,
      detalle: nv ? detalle(nv) : 'Sale como instinto al subir de nivel' };
  };
  return [
    fila('patada', 'Patada trasera', (nv) => {
      const d = datosPatada(nv, e);
      return numeroPausa(d.dano) + ' de daño hacia atrás, empuje ' + d.empuje + ', cada ' + s(d.cadaMs);
    }),
    fila('caca', 'Tirar caca', (nv) => {
      const d = datosCaca(nv, e);
      return d.cacas + (d.cacas > 1 ? ' cacas' : ' caca') + ' de ' + numeroPausa(d.danoGolpe) + '; mancha de ' +
        numeroPausa(d.danoMancha) + ' cada ' + s(CONFIG.ATAQUES.CACA.TICK_MS) + ' por ' + s(d.manchaMs) + ' (frena), cada ' + s(d.cadaMs);
    }),
    fila('meada', 'Meada', (nv) => {
      const d = datosMeada(nv);
      return 'Charcos de ' + d.radio + ' px: ' + numeroPausa(d.dano) + ' de daño cada ' + s(CONFIG.ATAQUES.MEADA.TICK_MS) + ', duran ' + s(d.duraMs);
    }),
    fila('ladridoFuerte', 'Ladrido fuerte', (nv) => {
      const d = datosLadridoFuerte(nv, e);
      return numeroPausa(d.dano) + ' de daño y aturde ' + s(d.aturdeMs) + ' en ' + d.radio + ' px, cada ' + s(d.cadaMs);
    }),
    fila('hedor', 'Hedor', (nv) => {
      const d = datosHedor(nv);
      return 'Aura de ' + Math.round(d.radio) + ' px: ' + numeroPausa(d.dano) + ' de daño cada ' + s(CONFIG.ATAQUES.HEDOR.TICK_MS);
    })
  ];
}
