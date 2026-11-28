// ===============================================================
//  MENÚ DE PAUSA (teclas P o Esc)
//  Panel con 6 pestañas: Stats, Instintos y objetos, Fusiones,
//  Sinergias, Desafíos y Colección (ultra raros). Se cambian con clic
//  o con las flechas izquierda/derecha.
//  Mientras está abierto, nada se mueve y el reloj de la noche se detiene.
//  Lo usa src/scenes/GameScene.js.
// ===============================================================

const PESTANAS_PAUSA = ['Stats', 'Instintos y objetos', 'Fusiones', 'Sinergias', 'Desafíos', 'Colección'];

// Colores del panel (formato 0xRRGGBB)
const PAUSA_FONDO = 0x1d1b2e;     // fondo del panel
const PAUSA_BORDE = 0xc8935a;     // borde café claro
const PAUSA_LUZ = 0x3a3656;       // línea clara de arriba (efecto 8 bits)
const PAUSA_DORADO = 0xffd54f;    // pestaña elegida y cosas logradas
const PAUSA_PIXEL = 4;            // tamaño de los "píxeles" del borde

// ---------------- Abrir y cerrar ----------------

function abrirPausa(escena) {
  escena.pausado = true;
  escena.physics.pause();
  escena.anims.pauseAll();
  escena.tweens.pauseAll();       // también se detienen los avisos, destellos, etc.
  musicaEnPausa(true);            // v0.42: la música baja a la mitad (src/musica.js)
  crearTexturasInstintos(escena);

  // Olvidar teclas presionadas antes de abrir (si no, actuarían al instante)
  const teclado = Phaser.Input.Keyboard;
  [escena.teclaR, escena.teclaM, escena.cursors.left, escena.cursors.right,
    escena.cursors.up, escena.cursors.down].forEach((t) => teclado.JustDown(t));
  escena.scrollStats = 0;         // la pestaña Stats empieza arriba

  dibujarPausa(escena);
}

function cerrarPausa(escena) {
  borrarPausa(escena);
  escena.pausado = false;
  escena.physics.resume();
  escena.anims.resumeAll();
  escena.tweens.resumeAll();
  musicaEnPausa(false);           // v0.42: la música vuelve a su volumen
}

// Antes de reiniciar o volver al menú: dejar todo andando otra vez
function salirDePausa(escena) {
  borrarPausa(escena);
  escena.pausado = false;
  escena.tweens.resumeAll();
  escena.anims.resumeAll();
}

function borrarPausa(escena) {
  (escena.limpiezaPausa || []).forEach((quitar) => quitar()); // rueda y arrastre del scroll
  escena.limpiezaPausa = [];
  (escena.capaPausa || []).forEach((obj) => obj.destroy());
  escena.capaPausa = [];
}

// Se llama en cada cuadro mientras está en pausa.
// pidioPausa = true si se presionó P o Esc en este cuadro.
function actualizarPausa(escena, pidioPausa) {
  const teclado = Phaser.Input.Keyboard;
  if (pidioPausa) {
    cerrarPausa(escena);
  } else if (teclado.JustDown(escena.teclaR)) {
    salirDePausa(escena);
    escena.scene.restart(escena.datosReinicio()); // misma raza (o las dos en cooperativo)
  } else if (teclado.JustDown(escena.teclaM)) {
    salirDePausa(escena);
    escena.scene.start('MenuScene');
  } else if (teclado.JustDown(escena.cursors.left)) {
    cambiarPestana(escena, -1);
  } else if (teclado.JustDown(escena.cursors.right)) {
    cambiarPestana(escena, 1);
  } else if (teclado.JustDown(escena.cursors.up) && escena.moverScrollPausa) {
    escena.moverScrollPausa(-CONFIG.PAUSA.STATS.SCROLL_TECLA);
  } else if (teclado.JustDown(escena.cursors.down) && escena.moverScrollPausa) {
    escena.moverScrollPausa(CONFIG.PAUSA.STATS.SCROLL_TECLA);
  }
}

function cambiarPestana(escena, paso) {
  const n = PESTANAS_PAUSA.length;
  escena.pestanaPausa = ((escena.pestanaPausa || 0) + paso + n) % n;
  escena.scrollStats = 0;
  borrarPausa(escena);
  dibujarPausa(escena);
}

// ---------------- Dibujo del panel ----------------

function dibujarPausa(escena) {
  const w = escena.scale.width;
  const h = escena.scale.height;
  const capa = [];
  escena.capaPausa = capa;
  const pestana = escena.pestanaPausa || 0;
  escena.moverScrollPausa = null;   // solo la pestaña Stats tiene scroll

  capa.push(escena.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6));

  // Marco principal (en celular se aleja un poco más de los bordes: MOVIL.MARGEN_HUD)
  const e = margenExtra();
  const P = CONFIG.PAUSA;
  const px = P.MARGEN_X + e;
  const py = P.MARGEN_Y + e / 2;
  const pw = w - px * 2;
  const ph = h - py * 2;
  const marco = escena.add.graphics();
  marcoPixel(marco, px, py, pw, ph, PAUSA_BORDE, PAUSA_FONDO);
  capa.push(marco);

  capa.push(textoPausa(escena, w / 2, py + 26, 'PAUSA', 28, '#ffe082', true).setOrigin(0.5));
  const ayuda = modoTactil() ? 'Toca una pestaña para cambiar' : '◄ ►  cambiar pestaña   ·   P / Esc: volver a jugar';
  capa.push(textoPausa(escena, px + pw - 18, py + 26, ayuda, 12, '#9e9e9e')
    .setOrigin(1, 0.5));

  // Pestañas (se achican si no caben en el panel)
  const sepP = Math.min(P.PESTANA_ANCHO + P.PESTANA_ESPACIO, (pw - 24) / PESTANAS_PAUSA.length);
  const anchoP = sepP - P.PESTANA_ESPACIO;
  const inicioP = w / 2 - ((PESTANAS_PAUSA.length - 1) * sepP) / 2;
  PESTANAS_PAUSA.forEach((nombre, i) => {
    const cx = inicioP + i * sepP;
    const elegida = i === pestana;
    const g = escena.add.graphics();
    marcoPixel(g, cx - anchoP / 2, py + 46, anchoP, 30, elegida ? PAUSA_DORADO : 0x6d6a8a, elegida ? 0x4a3a12 : 0x2b2940);
    capa.push(g);
    capa.push(textoPausa(escena, cx, py + 61, nombre, 14, elegida ? '#ffe082' : '#cfd8dc', elegida).setOrigin(0.5));
    const zona = escena.add.zone(cx, py + 61, anchoP, 30).setInteractive({ useHandCursor: true });
    zona.on('pointerdown', () => { if (i !== escena.pestanaPausa) cambiarPestana(escena, i - (escena.pestanaPausa || 0)); });
    capa.push(zona);
  });

  // Contenido de la pestaña
  const yb = py + ph - 32;           // centro de los botones de abajo
  const altoBoton = modoTactil() ? 40 : 34;
  const area = { x: px + 26, y: py + 92, ancho: pw - 52, abajo: yb - altoBoton / 2 - P.STATS.ESPACIO_BOTONES };
  if (pestana === 0) pestanaStats(escena, capa, area);
  else if (pestana === 1) pestanaInventario(escena, capa, area);
  else if (pestana === 2) pestanaFusiones(escena, capa, area);
  else if (pestana === 3) pestanaSinergias(escena, capa, area);
  else if (pestana === 4) pestanaDesafios(escena, capa, area);
  else pestanaColeccion(escena, capa, area);

  // Botones de abajo
  botonPausa(escena, capa, w / 2 - 230, yb, 200, 'Continuar', () => cerrarPausa(escena));
  botonPausa(escena, capa, w / 2, yb, 200, modoTactil() ? 'Reiniciar' : 'Reiniciar (R)', () => {
    salirDePausa(escena);
    escena.scene.restart(escena.datosReinicio()); // misma raza (o las dos en cooperativo)
  });
  botonPausa(escena, capa, w / 2 + 230, yb, 200, modoTactil() ? 'Salir al menú' : 'Salir al menú (M)', () => {
    salirDePausa(escena);
    escena.scene.start('MenuScene');
  });

  capa.forEach((obj) => obj.setScrollFactor(0).setDepth(4000));
}

// Recuadro con esquinas recortadas y sombra, estilo 8 bits
function marcoPixel(g, x, y, ancho, alto, colorBorde, colorFondo) {
  const p = PAUSA_PIXEL;
  g.fillStyle(0x000000, 0.5);                     // sombra
  g.fillRect(x + p * 2, y + p * 2, ancho - p, alto - p);
  g.fillStyle(colorBorde, 1);                     // borde
  g.fillRect(x + p, y, ancho - p * 2, p);
  g.fillRect(x + p, y + alto - p, ancho - p * 2, p);
  g.fillRect(x, y + p, p, alto - p * 2);
  g.fillRect(x + ancho - p, y + p, p, alto - p * 2);
  g.fillStyle(colorFondo, 1);                     // fondo
  g.fillRect(x + p, y + p, ancho - p * 2, alto - p * 2);
  g.fillStyle(0xffffff, 0.08);                    // línea clara arriba
  g.fillRect(x + p, y + p, ancho - p * 2, p);
}

function textoPausa(escena, x, y, texto, tam, color, negrita, ancho) {
  const estilo = { fontFamily: FUENTE, fontSize: tam + 'px', color, fontStyle: negrita ? 'bold' : 'normal' };
  if (ancho) estilo.wordWrap = { width: ancho };
  return escena.add.text(x, y, texto, estilo);
}

function botonPausa(escena, capa, cx, cy, ancho, texto, alHacerClic) {
  const alto = modoTactil() ? 40 : 34; // en celular, un poco más alto para el dedo
  const g = escena.add.graphics();
  const pintar = (encima) => {
    g.clear();
    marcoPixel(g, cx - ancho / 2, cy - alto / 2, ancho, alto, encima ? 0xffffff : PAUSA_DORADO, encima ? 0x5a4718 : 0x3a2f14);
  };
  pintar(false);
  const etiqueta = textoPausa(escena, cx, cy, texto, 16, '#ffe082', true).setOrigin(0.5);
  const zona = escena.add.zone(cx, cy, ancho, alto).setInteractive({ useHandCursor: true });
  zona.on('pointerover', () => pintar(true));
  zona.on('pointerout', () => pintar(false));
  zona.on('pointerdown', alHacerClic);
  capa.push(g, etiqueta, zona);
}

// Casilla oscura con un ícono adentro (como las del inventario)
function casillaIcono(escena, capa, x, y, clave, escala, apagado) {
  const lado = 40;
  capa.push(escena.add.rectangle(x, y, lado, lado, 0x000000, 0.6).setStrokeStyle(2, apagado ? 0x555566 : 0x888899));
  if (clave && escena.textures.exists(clave)) {
    const icono = escena.add.image(x, y, clave, 0).setScale(escala);
    if (apagado) icono.setAlpha(0.3);
    capa.push(icono);
  }
}

// Número con coma y máximo 1 decimal (16,5)
function numeroPausa(n, decimales) {
  const d = decimales === undefined ? 1 : decimales;
  const f = Math.pow(10, d);
  return String(Math.round(n * f) / f).replace('.', ',');
}

function nombreInstinto(id) {
  return (INSTINTOS.find((i) => i.id === id) || { nombre: id }).nombre;
}

// ---------------- Pestaña "Stats" ----------------

// Calcula cada stat con su desglose: base de la raza + lo que suma cada cosa.
// Los totales vienen de las mismas funciones que usa el juego.
function calcularStats(escena) {
  const e = escena;
  const base = e.base;
  const raza = 'Base ' + e.textosRaza.nombre;
  const inst = (id) => e.instintos[id] || 0;
  const obj = (id) => e.nivelObjeto(id);
  const nvI = (id) => ' (Nv ' + inst(id) + ')';
  const nvO = (id) => ' (Nv ' + obj(id) + ')';
  // Coleccionables ultra raros (src/coleccionables.js): nivel y nombre
  const col = (id) => nivelColeccionable(id);
  const nombreCol = (id) => buscarColeccionable(id).nombre + ' (Nv ' + col(id) + ')';
  // Partes que vienen de sinergias activas con ese bonus
  const deSinergias = (bonus) => SINERGIAS
    .filter((s) => sinergiaActiva(e, s) && numerosSinergia(s)[bonus])
    .map((s) => s.nombre + ' +' + Math.round(numerosSinergia(s)[bonus] * 100) + '%');

  // Árbol de habilidades de la raza (src/arbol.js)
  const arb = (k) => bonusArbol(e, k);
  const pct = (v) => Math.round(v * 100) + '%';

  const stats = [];

  // Vida
  const vida = [raza + ' ' + base.VIDA];
  if (inst('pellejoDuro')) vida.push(nombreInstinto('pellejoDuro') + nvI('pellejoDuro') + ' +' + inst('pellejoDuro') * CONFIG.PELLEJO_VIDA);
  if (obj('frazada')) vida.push(buscarObjeto('frazada').nombre + nvO('frazada') + ' +' + obj('frazada') * CONFIG.OBJETOS.frazada.VIDA);
  if (col('sweater')) vida.push(nombreCol('sweater') + ' +' + Math.round(bonusColeccion('sweater', 'VIDA')));
  if (arb('VIDA')) vida.push('Árbol +' + arb('VIDA'));
  stats.push({ nombre: 'Vida', valor: Math.round(e.vida) + ' / ' + e.vidaMax, partes: vida });

  // Velocidad
  const vel = [raza + ' ' + base.VELOCIDAD];
  if (inst('patasLigeras')) vel.push(nombreInstinto('patasLigeras') + nvI('patasLigeras') + ' +' + inst('patasLigeras') * CONFIG.PATAS_VELOCIDAD);
  if (obj('pelota')) vel.push(buscarObjeto('pelota').nombre + nvO('pelota') + ' +' + obj('pelota') * CONFIG.OBJETOS.pelota.VELOCIDAD);
  const velCol = col('capa') ? [nombreCol('capa') + ' +' + Math.round(bonusColeccion('capa', 'VELOCIDAD') * 100) + '%'] : [];
  if (arb('VELOCIDAD')) velCol.push('Árbol +' + pct(arb('VELOCIDAD')));
  stats.push({ nombre: 'Velocidad', valor: numeroPausa(e.velocidadPerro()), partes: vel.concat(deSinergias('VELOCIDAD'), velCol) });

  // Daño de mordida
  const dano = [raza + ' ' + base.MORDIDA_DANO];
  if (inst('colmillos')) dano.push(nombreInstinto('colmillos') + nvI('colmillos') + ' +' + inst('colmillos') * CONFIG.COLMILLOS_DANO);
  const danoExtra = deSinergias('DANO');
  if (e.poder === 'mandibula') {
    // Con el árbol (Mandíbula ansiosa / pesada): más daño y se carga más rápido
    const cargaMs = base.PODER_ESPERA_MS / (1 + bonusColeccion('capa', 'RECARGA') + bonusArbol(e, 'MANDIBULA_RECARGA'));
    danoExtra.push('Mandíbula de hierro +' + (base.MANDIBULA_DANO_EXTRA + bonusArbol(e, 'MANDIBULA_DANO')) + ' cada ' + numeroPausa(cargaMs / 1000) + ' s');
  }
  if (col('panuelo')) danoExtra.push(nombreCol('panuelo') + ' ' + Math.round(bonusColeccion('panuelo', 'CRITICO') * 100) + '% de crítico (×2)');
  if (e.bonusDanoArbol()) danoExtra.push('Árbol +' + pct(e.bonusDanoArbol()) + ' ahora');
  if (arb('CRITICO')) danoExtra.push('Árbol ' + pct(arb('CRITICO')) + ' de crítico');
  // v0.22: multiplicador de todo el daño del perro (también ladrido y ataques)
  const multJ = e.multDanoJugador();
  if (CONFIG.JUGADOR && CONFIG.JUGADOR.DANIO_BASE_MULT && CONFIG.JUGADOR.DANIO_BASE_MULT !== 1) {
    danoExtra.push('Daño del perro ×' + numeroPausa(CONFIG.JUGADOR.DANIO_BASE_MULT, 2) + ' (todos los ataques)');
  }
  if (e.colmillosAfilados) danoExtra.push('Colmillos afilados Nv ' + e.colmillosAfilados + ' +' + pct(bonusColmillos(e.colmillosAfilados)) + ' (todos los ataques)');
  stats.push({ nombre: 'Daño de mordida', valor: numeroPausa(e.danoMordida() * multJ), partes: dano.concat(danoExtra) });

  // Frecuencia de mordida
  const ms = e.intervaloMordida();
  const frec = [raza + ' cada ' + numeroPausa(base.MORDIDA_CADA_MS / 1000, 2) + ' s'];
  if (inst('mordidaRapida')) frec.push(nombreInstinto('mordidaRapida') + nvI('mordidaRapida') + ' −' + numeroPausa(inst('mordidaRapida') * CONFIG.MORDIDA_RAPIDA_MS / 1000, 2) + ' s');
  if (e.fusiones.frenesi) {
    const f = CONFIG.FUSIONES.frenesi;
    frec.push('Frenesí ×' + numeroPausa(1 / f.MORDIDA_MULTIPLICADOR) + ' de rapidez y muerde a ' + f.OBJETIVOS);
  }
  if (arb('MORDIDA_RAPIDEZ')) frec.push('Árbol ' + pct(arb('MORDIDA_RAPIDEZ')) + ' más seguido');
  stats.push({ nombre: 'Frecuencia de mordida', valor: 'cada ' + numeroPausa(ms / 1000, 2) + ' s (' + numeroPausa(1000 / ms) + ' por seg.)', partes: frec });

  // Alcance de la mordida
  const alcance = ['Base ' + CONFIG.MORDIDA_ALCANCE + ' (igual para todas las razas)'];
  if (col('lentes')) alcance.push(nombreCol('lentes') + ' +' + Math.round(bonusColeccion('lentes', 'ALCANCE')));
  if (arb('ALCANCE')) alcance.push('Árbol +' + arb('ALCANCE')); // v0.36: Hocico en las nubes (Gran danés)
  stats.push({ nombre: 'Alcance de mordida', valor: String(e.alcanceMordida()), partes: alcance });

  // Imán de huesos
  const iman = ['Base ' + CONFIG.IMAN_RADIO];
  if (base.IMAN_EXTRA) iman.push(e.textosRaza.nombre + (e.poder === 'rastreo' ? ' (Rastreo)' : '') + ' +' + base.IMAN_EXTRA);
  if (inst('olfato')) iman.push(nombreInstinto('olfato') + nvI('olfato') + ' +' + inst('olfato') * CONFIG.OLFATO_IMAN);
  if (col('lentes')) iman.push(nombreCol('lentes') + ' +' + Math.round(bonusColeccion('lentes', 'IMAN')));
  if (arb('IMAN')) iman.push('Árbol +' + arb('IMAN'));
  stats.push({ nombre: 'Imán de huesos', valor: String(e.radioIman()), partes: iman });

  // Reducción de daño
  const collar = Math.min(1, obj('collar') * CONFIG.OBJETOS.collar.MENOS_DANO);
  const red = [raza + ' 0%'];
  if (obj('collar')) red.push(buscarObjeto('collar').nombre + nvO('collar') + ' −' + Math.round(collar * 100) + '%');
  if (e.fusiones.cuero) {
    const c = CONFIG.FUSIONES.cuero;
    red.push('Cuero de calle: −' + Math.round((1 - c.MULTIPLICADOR) * 100) + '% por ' + numeroPausa(c.DURACION_MS / 1000) + ' s tras cada golpe');
  }
  if (col('antifaz')) red.push(nombreCol('antifaz') + ' ' + Math.round(bonusColeccion('antifaz', 'ESQUIVAR') * 100) + '% de esquivar');
  if (col('antipulgas')) red.push(nombreCol('antipulgas') + ' −' + Math.round(bonusColeccion('antipulgas', 'MENOS_DANO') * 100) + '% de manada y rivales');
  if (col('chalequito')) red.push(nombreCol('chalequito') + ' −' + Math.round(bonusColeccion('chalequito', 'MENOS_DANO_EMBESTIDA') * 100) + '% de embestidas');
  if (arb('MENOS_DANO') || arb('GRUPO_DEFENSA')) red.push('Árbol −' + pct(e.reduccionArbol()) + ' ahora');
  if (arb('ESQUIVAR')) red.push('Árbol ' + pct(arb('ESQUIVAR')) + ' de esquivar');
  if (arb('INAMOVIBLE')) red.push('Inamovible −' + pct(arb('INAMOVIBLE')) + ' de embestidas, sin Perrera');
  if (inst('armadura')) red.push(nombreInstinto('armadura') + nvI('armadura') + ' −' + pct(reduccionArmadura(e)));
  if (e.poder === 'melena') red.push('Melena −' + pct(reduccionMelena(e)) + (arb('MELENA_MENOS_DANO') ? ' (con árbol)' : '')); // v0.35
  if (arb('FAROL_MENOS_DANO')) red.push('Farol andante −' + pct(arb('FAROL_MENOS_DANO')) + ' de los que están en tu sombra'); // v0.36
  if (arb('ESTATUA_MS')) red.push('Estatua: ' + numeroPausa(arb('ESTATUA_MS') / 1000) + ' s sin daño bajo ' + pct(arb('ESTATUA_VIDA')) + ' de vida'); // v0.36
  const reduccion = 1 - (1 - collar) * (1 - e.reduccionArbol()) * (1 - reduccionArmadura(e)) * (1 - reduccionMelena(e));
  stats.push({ nombre: 'Reducción de daño', valor: Math.round(reduccion * 100) + '%', partes: red });

  // Regeneración (curación con el tiempo)
  const mult = e.multiplicadorRegeneracion();
  let porSeg = 0;
  const regen = [];
  if (e.poder === 'calle') {
    const calle = e.curaCalle() * e.rapidezCalle() / (base.CALLE_CURA_CADA_MS / 1000);
    porSeg += calle * mult;
    regen.push(raza + ' (Calle' + (arb('CALLE_CURA') || arb('CALLE_RAPIDEZ') ? ' + árbol' : '') + ') ' + numeroPausa(calle, 2) + '/s');
  } else {
    regen.push(raza + ' 0/s');
  }
  if (obj('caracu')) {
    const caracu = obj('caracu') * CONFIG.OBJETOS.caracu.CURA / (CONFIG.OBJETOS.caracu.CADA_MS / 1000);
    porSeg += caracu * mult;
    regen.push(buscarObjeto('caracu').nombre + nvO('caracu') + ' +' + numeroPausa(caracu, 2) + '/s');
  }
  if (col('sweater')) {
    const sweater = col('sweater') / (CONFIG.COLECCIONABLES.sweater.CURA_CADA_MS / 1000);
    porSeg += sweater * mult;
    regen.push(nombreCol('sweater') + ' +' + numeroPausa(sweater, 2) + '/s');
  }
  if (arb('CURA_CADA_MS')) {
    const lamer = 1 / (arb('CURA_CADA_MS') / 1000);
    porSeg += lamer * mult;
    regen.push('Árbol +' + numeroPausa(lamer, 2) + '/s');
  }
  if (inst('regeneracion')) {
    const lengua = vidaPorSegundoLenguetazo(e);
    porSeg += lengua * mult;
    regen.push(nombreInstinto('regeneracion') + nvI('regeneracion') + ' +' + numeroPausa(lengua, 2) + '/s');
  }
  if (arb('REGENERACION')) regen.push('Árbol +' + pct(arb('REGENERACION')));
  stats.push({ nombre: 'Regeneración', valor: numeroPausa(porSeg, 2) + ' de vida por seg.', partes: regen.concat(deSinergias('REGENERACION')) });

  // Experiencia extra
  const xpPlaca = obj('placa') * CONFIG.OBJETOS.placa.XP_EXTRA;
  const xpCascabel = bonusColeccion('cascabel', 'XP_EXTRA');
  const xpExtra = xpPlaca + xpCascabel + arb('XP');
  const xp = [raza + ' 0%'];
  if (obj('placa')) xp.push(buscarObjeto('placa').nombre + nvO('placa') + ' +' + Math.round(xpPlaca * 100) + '%');
  if (col('cascabel')) xp.push(nombreCol('cascabel') + ' +' + Math.round(xpCascabel * 100) + '%');
  if (arb('XP')) xp.push('Árbol +' + pct(arb('XP')));
  stats.push({ nombre: 'Experiencia extra', valor: '+' + Math.round(xpExtra * 100) + '%', partes: xp });

  // v0.24: Lomo ágil (enfriamiento) y Pata de conejo (suerte), src/ataques_nuevos.js
  const enfr = 1 - factorEnfriamiento(e);
  stats.push({ nombre: 'Enfriamiento de ataques', valor: '−' + pct(enfr),
    partes: [inst('enfriamiento') ? nombreInstinto('enfriamiento') + nvI('enfriamiento') + ' −' + pct(enfr) + ' de espera (no la mordida)'
      : 'Sin mejora (sale como carta: ' + nombreInstinto('enfriamiento') + ')'] });
  const suerte = multiplicadorSuerte(e) - 1;
  stats.push({ nombre: 'Suerte', valor: '+' + pct(suerte),
    partes: [inst('suerte') ? nombreInstinto('suerte') + nvI('suerte') + ': raro, épico y legendario +' + pct(suerte) + ' más seguido'
      : 'Sin mejora (sale como carta: ' + nombreInstinto('suerte') + ')'] });

  return stats;
}

// Tarjetas de la pestaña Stats. Cada fila: { nombre, valor, detalle, color, apagado }
function seccionesStats(escena) {
  const e = escena;
  const deJ1 = seccionesPerroStats(e);
  const partida = filasPartidaStats(e);

  // Cooperativo (v0.28, src/coop.js): las tarjetas de J2 se arman con sus datos.
  // Izquierda: J1 · Derecha: J2 y la partida (que es de los dos)
  if (e.coop && e.jugador2 && !e.enJ2) {
    const deJ2 = conJugador2(e, () => seccionesPerroStats(e));
    const conNombre = (secs, n) => secs.map((sec) => ({ ...sec, titulo: 'P' + n + ' · ' + sec.titulo }));
    return {
      izquierda: conNombre(deJ1, 1),
      derecha: conNombre(deJ2, 2).concat([{ titulo: 'Partida', color: '#90caf9', filas: partida }])
    };
  }

  return {
    izquierda: [deJ1[0]],
    derecha: [deJ1[1], deJ1[2], { titulo: 'Partida', color: '#90caf9', filas: partida }]
  };
}

// Tarjetas de un perro (el del turno en cooperativo): Perro, Ataques y Árbol de habilidades
function seccionesPerroStats(escena) {
  const e = escena;
  const stats = calcularStats(e);

  // Perro: raza, nivel, vida, velocidad, daño (y el resto de sus números)
  const perro = [
    { nombre: 'Raza', valor: e.textosRaza.nombre, detalle: 'Poder: ' + sinTeclas(textoPoderStats(e)) },
    { nombre: 'Nivel', valor: String(e.nivel), detalle: numeroPausa(e.xp) + ' / ' + e.xpParaSubir() + ' huesos para el siguiente' }
  ].concat(stats.map((st) => ({ nombre: st.nombre, valor: st.valor, detalle: st.partes.join('  ·  ') })));

  // Ataques: cada uno con su nivel y su evolución (src/ataques.js)
  const ataques = filasAtaquesStats(e).map((a) => ({
    nombre: a.nombre, valor: a.valor, apagado: a.apagado,
    detalle: a.detalle + (a.evolucion ? '\n' + a.evolucion : ''),
    colorDetalle: a.evolucionLograda ? '#ffcc80' : null
  }));

  // Árbol de habilidades: las mejoras compradas de cada rama (src/arbol.js)
  const arbol = ramasDeRaza(e.razaId).map((rama) => {
    const n = nivelRama(e.razaId, rama.id);
    const activos = rama.nodos.slice(0, n).map((nodo, i) => (i === ARBOL_NODOS - 1 ? '★ ' : '') + nodo.nombre);
    return {
      nombre: rama.nombre, valor: n + ' / ' + ARBOL_NODOS, apagado: n === 0,
      color: '#' + rama.color.toString(16).padStart(6, '0'),
      detalle: activos.length ? activos.join('  ·  ') : 'Sin mejoras en esta rama'
    };
  });
  // Colmillos afilados: mejora general, para todas las razas (v0.22)
  const nc = e.colmillosAfilados || 0;
  arbol.push({
    nombre: 'Colmillos afilados', valor: nc + ' / ' + nivelesColmillos(), apagado: nc === 0,
    detalle: nc ? '+' + Math.round(bonusColmillos(nc) * 100) + '% de daño en todos los ataques (todas las razas)'
      : 'Mejora general: se compra con huesitos en el Árbol'
  });
  const efectos = partesArbolStats(e).filter((t) => t.indexOf('★') !== 0 && t.indexOf('Colmillos afilados') !== 0);
  if (efectos.length) arbol.push({ nombre: 'Efectos extra', valor: '', detalle: efectos.join('  ·  ') });
  if (mejorasCompradas(e.razaId) === 0 && !nc) {
    arbol.push({ nombre: 'Sin mejoras', valor: '', detalle: 'Se compran con huesitos en el menú (Árbol)', apagado: true });
  }

  return [
    { titulo: e.coop ? 'Perro: ' + e.textosRaza.nombre : 'Perro', color: '#ffe082', filas: perro },
    { titulo: 'Ataques', color: '#ffab40', filas: ataques },
    { titulo: 'Árbol de habilidades', color: '#9ccc65', filas: arbol }
  ];
}

// Nombre del poder con su tecla (cooperativo: J2 usa Enter en vez de Espacio)
function textoPoderStats(escena) {
  const texto = escena.textosRaza.poder || 'ninguno';
  return escena.enJ2 ? texto.replace('[Espacio]', '[Enter]') : texto;
}

// Filas de la tarjeta "Partida" (es de los dos en cooperativo)
function filasPartidaStats(escena) {
  const e = escena;
  // Partida: tiempo, enemigos, huesitos y mapa
  const fase = datosFase(Math.max(0, e.faseActual)).NOMBRE;
  const partida = [
    { nombre: 'Tiempo jugado', valor: e.formatearTiempo(e.tiempoSobrevivido) },
    { nombre: 'Hora de la noche', valor: horaDeLaNoche(e.tiempoSobrevivido) + (fase ? '  ·  ' + fase : '') },
    { nombre: 'Enemigos derrotados', valor: String(e.derrotados) },
    { nombre: 'Huesitos', valor: String(huesitosDePartida(e)), detalle: 'Se suman a tu total al terminar la partida' },
    { nombre: 'Mapa', valor: buscarMapa(e.mapaId).nombre }
  ];
  if (e.jefeAparecido) partida.push({ nombre: NOMBRE_JEFE, valor: e.jefeDerrotado ? 'derrotado' : 'sigue vivo' });
  if (e.coop) partida.push({ nombre: 'Objetos', valor: e.inventario.length + ' / ' + CONFIG.INVENTARIO_MAX, detalle: 'Los objetos son de los dos' });
  return partida;
}

// Pestaña Stats: dos columnas de tarjetas. Cada texto se mide antes de poner
// el siguiente, así nada se monta. Si no cabe, se puede bajar con la rueda
// del mouse, arrastrando con el dedo o con las flechas arriba/abajo.
// Los tamaños y márgenes están en src/config.js (PAUSA.STATS).
function pestanaStats(escena, capa, area) {
  const S = CONFIG.PAUSA.STATS;
  const secciones = seccionesStats(escena);
  const vista = { x: area.x - 6, y: area.y, ancho: area.ancho + 12, alto: area.abajo - area.y };
  const anchoCol = (area.ancho - S.COLUMNAS_ESPACIO) / 2;
  const contenido = []; // { obj, y } = objeto y su "y" sin scroll
  const poner = (obj) => { contenido.push({ obj, y: obj.y }); return obj; };

  // Dibuja una tarjeta y devuelve dónde termina (su "y" de abajo)
  const tarjeta = (x, y, sec) => {
    const r = S.TARJETA_RELLENO;
    const adentro = anchoCol - r * 2;
    const fondo = poner(escena.add.graphics({ x: 0, y }));
    let yy = y + r;
    poner(textoPausa(escena, x + r, yy, sec.titulo, S.TITULO_TAMANO, sec.color, true));
    yy += S.TITULO_TAMANO + 10;
    const linea = yy - 5; // línea bajo el título
    sec.filas.forEach((f) => {
      const colorNombre = f.apagado ? '#8a8a99' : (f.color || '#ffe082');
      const nombre = poner(textoPausa(escena, x + r, yy, f.nombre, S.NOMBRE_TAMANO, colorNombre, true));
      let abajo = yy + nombre.height;
      if (f.valor) {
        const valor = poner(textoPausa(escena, x + anchoCol - r, yy, f.valor, S.NOMBRE_TAMANO,
          f.apagado ? '#8a8a99' : '#ffffff', true).setOrigin(1, 0));
        // Si el valor no cabe al lado del nombre, va en la línea de abajo
        if (nombre.width + valor.width + 12 > adentro) {
          valor.y = abajo;
          contenido[contenido.length - 1].y = abajo;
          abajo += valor.height;
        }
      }
      if (f.detalle) {
        const det = poner(textoPausa(escena, x + r, abajo + 1, f.detalle, S.DETALLE_TAMANO,
          f.apagado ? '#77778a' : (f.colorDetalle || '#b0bec5'), false, adentro));
        abajo = det.y + det.height;
      }
      yy = abajo + S.FILA_ESPACIO;
    });
    const fin = yy - S.FILA_ESPACIO + r;
    fondo.fillStyle(0x000000, S.TARJETA_ALFA).fillRect(x, 0, anchoCol, fin - y);
    fondo.lineStyle(2, 0xffffff, 0.12).strokeRect(x, 0, anchoCol, fin - y);
    fondo.fillStyle(0xffffff, 0.15).fillRect(x + r, linea - y, adentro, 1);
    return fin;
  };

  const columna = (x, lista) => {
    let y = area.y;
    lista.forEach((sec) => { y = tarjeta(x, y, sec) + S.TARJETA_ESPACIO; });
    return y - S.TARJETA_ESPACIO;
  };
  const abajo = Math.max(
    columna(area.x, secciones.izquierda),
    columna(area.x + anchoCol + S.COLUMNAS_ESPACIO, secciones.derecha)
  );

  // Recorte: solo se ve lo que está dentro de la "ventana" de la pestaña
  const recorte = escena.make.graphics({ add: false });
  recorte.fillStyle(0xffffff).fillRect(vista.x, vista.y, vista.ancho, vista.alto);
  const mascara = recorte.createGeometryMask();
  capa.push(recorte);
  contenido.forEach((c) => { c.obj.setMask(mascara); capa.push(c.obj); });

  // Scroll (solo si el contenido no cabe)
  const maximo = Math.max(0, abajo - (vista.y + vista.alto));
  const barra = escena.add.graphics();
  capa.push(barra);
  const aplicar = () => {
    escena.scrollStats = Phaser.Math.Clamp(escena.scrollStats || 0, 0, maximo);
    contenido.forEach((c) => { c.obj.y = c.y - escena.scrollStats; });
    barra.clear();
    if (maximo <= 0) return;
    const altoBarra = Math.max(24, vista.alto * vista.alto / (vista.alto + maximo));
    const yBarra = vista.y + (vista.alto - altoBarra) * (escena.scrollStats / maximo);
    const xBarra = vista.x + vista.ancho - S.BARRA_ANCHO;
    barra.fillStyle(0xffffff, 0.12).fillRect(xBarra, vista.y, S.BARRA_ANCHO, vista.alto);
    barra.fillStyle(PAUSA_DORADO, 0.8).fillRect(xBarra, yBarra, S.BARRA_ANCHO, altoBarra);
  };
  aplicar();
  if (maximo <= 0) return;

  escena.moverScrollPausa = (paso) => { escena.scrollStats = (escena.scrollStats || 0) + paso; aplicar(); };
  const dentro = (p) => p.x >= vista.x && p.x <= vista.x + vista.ancho && p.y >= vista.y && p.y <= vista.y + vista.alto;
  const rueda = (puntero, objetos, dx, dy) => { if (dentro(puntero)) escena.moverScrollPausa(dy * S.SCROLL_RUEDA); };
  let arrastre = null;
  const bajar = (p) => { if (dentro(p)) arrastre = { y: p.y, scroll: escena.scrollStats || 0 }; };
  const mover = (p) => {
    if (!arrastre || !p.isDown) return;
    escena.scrollStats = arrastre.scroll - (p.y - arrastre.y);
    aplicar();
  };
  const soltar = () => { arrastre = null; };
  escena.input.on('wheel', rueda);
  escena.input.on('pointerdown', bajar);
  escena.input.on('pointermove', mover);
  escena.input.on('pointerup', soltar);
  escena.limpiezaPausa = (escena.limpiezaPausa || []).concat([() => {
    escena.input.off('wheel', rueda);
    escena.input.off('pointerdown', bajar);
    escena.input.off('pointermove', mover);
    escena.input.off('pointerup', soltar);
    escena.moverScrollPausa = null;
  }]);
}

// ---------------- Pestaña "Instintos y objetos" ----------------

function pestanaInventario(escena, capa, area) {
  const anchoCol = area.ancho / 2 - 14;
  // Si hay muchos instintos, las filas se juntan para no tapar los botones de abajo
  const limite = escena.scale.height - 72 - 34;
  const paso = Math.min(48, (limite - (area.y + 46)) / Math.max(1, OBJETOS.length - 1));

  // Instintos (izquierda). v0.24: son muchos, así que van en dos columnas chicas
  // (ícono, nombre y nivel; la descripción sale en la carta al subir de nivel)
  let x = area.x;
  const espacios = CONFIG.ATAQUES.ESPACIOS_MAX || 0;
  capa.push(textoPausa(escena, x, area.y, 'Instintos (máximo Nv ' + CONFIG.INSTINTO_NIVEL_MAX + ')' +
    (espacios ? '   Ataques ' + espaciosAtaqueUsados(escena) + ' / ' + espacios : ''), 16, '#ffe082', true));
  const porColumna = Math.ceil(INSTINTOS.length / 2);
  const pasoChico = Math.min(40, (limite - (area.y + 40)) / Math.max(1, porColumna - 1));
  const anchoChico = anchoCol / 2 - 6;
  INSTINTOS.forEach((inst, i) => {
    const col = Math.floor(i / porColumna);
    const y = area.y + 40 + (i % porColumna) * pasoChico;
    const nivel = escena.instintos[inst.id] || 0;
    filaInstintoChica(escena, capa, x + col * (anchoChico + 12), y, inst, nivel, CONFIG.INSTINTO_NIVEL_MAX);
  });

  // Objetos (derecha)
  x = area.x + anchoCol + 28;
  capa.push(textoPausa(escena, x, area.y, 'Objetos (máximo Nv ' + CONFIG.OBJETO_NIVEL_MAX + ')   ' +
    escena.inventario.length + ' / ' + CONFIG.INVENTARIO_MAX + ' casillas', 16, '#ffe082', true));
  OBJETOS.forEach((o, i) => {
    const y = area.y + 46 + i * paso;
    filaInventario(escena, capa, x, y, anchoCol, o.id, 2, o.nombre, escena.nivelObjeto(o.id), CONFIG.OBJETO_NIVEL_MAX, o.frase);
  });
}

// Fila chica de un instinto: casilla con ícono, nombre (naranjo si es ataque) y nivel
function filaInstintoChica(escena, capa, x, y, inst, nivel, max) {
  const tiene = nivel > 0;
  const lado = 30;
  capa.push(escena.add.rectangle(x + lado / 2, y, lado, lado, 0x000000, 0.6).setStrokeStyle(2, tiene ? 0x888899 : 0x555566));
  const clave = 'instinto_' + inst.id;
  if (escena.textures.exists(clave)) {
    const icono = escena.add.image(x + lado / 2, y, clave, 0).setScale(2);
    if (!tiene) icono.setAlpha(0.3);
    capa.push(icono);
  }
  const color = !tiene ? '#8a8a99' : inst.ataque ? '#ffcc80' : '#ffffff';
  capa.push(textoPausa(escena, x + lado + 8, y - 15, inst.nombre, 14, color, true));
  const textoNivel = !tiene ? (inst.ataque ? 'ataque · no lo tienes' : 'mejora · no la tienes')
    : nivel >= max ? 'MAX' : 'Nv ' + nivel + ' / ' + max;
  capa.push(textoPausa(escena, x + lado + 8, y + 2, textoNivel, 12,
    !tiene ? '#77778a' : nivel >= max ? '#ffd54f' : '#9ccc65', nivel >= max));
}

function filaInventario(escena, capa, x, y, ancho, clave, escala, nombre, nivel, max, frase) {
  const tiene = nivel > 0;
  casillaIcono(escena, capa, x + 20, y, clave, escala, !tiene);
  const textoNivel = !tiene ? 'No lo tienes' : nivel >= max ? 'MAX' : 'Nv ' + nivel + ' / ' + max;
  capa.push(textoPausa(escena, x + 50, y - 18, nombre, 15, tiene ? '#ffffff' : '#8a8a99', true));
  capa.push(textoPausa(escena, x + 230, y - 18, textoNivel, 14,
    !tiene ? '#77778a' : nivel >= max ? '#ffd54f' : '#9ccc65', nivel >= max));
  capa.push(textoPausa(escena, x + 50, y + 2, frase, 13, tiene ? '#b0bec5' : '#6d6d80', false, ancho - 60));
}

// ---------------- Pestaña "Fusiones" ----------------

function pestanaFusiones(escena, capa, area) {
  capa.push(textoPausa(escena, area.x, area.y,
    'Instinto en Nv ' + CONFIG.INSTINTO_NIVEL_MAX + ' + su objeto en Nv ' + CONFIG.OBJETO_NIVEL_MAX +
    ' = carta dorada de fusión al subir de nivel', 14, '#cfd8dc'));
  const paso = 76;
  FUSIONES.forEach((f, i) => {
    const y = area.y + 50 + i * paso;
    const lograda = !!escena.fusiones[f.id];
    const nivelI = escena.instintos[f.instinto] || 0;
    const nivelO = escena.nivelObjeto(f.objeto);
    const lista = !lograda && nivelI >= CONFIG.INSTINTO_NIVEL_MAX && nivelO >= CONFIG.OBJETO_NIVEL_MAX;

    // Fondo de la fila (dorado si ya la tienes)
    const g = escena.add.graphics();
    g.fillStyle(lograda ? 0x4a3a12 : lista ? 0x1f3a1f : 0x000000, lograda || lista ? 0.8 : 0.3);
    g.fillRect(area.x, y - 26, area.ancho, paso - 10);
    if (lograda) { g.lineStyle(2, PAUSA_DORADO, 1); g.strokeRect(area.x, y - 26, area.ancho, paso - 10); }
    capa.push(g);

    casillaIcono(escena, capa, area.x + 30, y + 7, 'instinto_' + f.instinto, 3, nivelI === 0);
    capa.push(textoPausa(escena, area.x + 56, y, '+', 18, '#ffffff', true));
    casillaIcono(escena, capa, area.x + 92, y + 7, f.objeto, 2, nivelO === 0);

    capa.push(textoPausa(escena, area.x + 130, y - 20, f.nombre, 18, lograda ? '#ffd54f' : '#ffe082', true));
    capa.push(textoPausa(escena, area.x + 130, y + 4, f.frase, 13, '#b0bec5', false, 420));

    let estado;
    let color;
    if (lograda) { estado = '¡Lograda!'; color = '#ffd54f'; }
    else if (lista) { estado = '¡Lista! Sale en la próxima subida de nivel'; color = '#9ccc65'; }
    else {
      estado = 'Falta: ' + nombreInstinto(f.instinto) + ' ' + nivelI + '/' + CONFIG.INSTINTO_NIVEL_MAX +
        ' + ' + buscarObjeto(f.objeto).nombre + ' ' + nivelO + '/' + CONFIG.OBJETO_NIVEL_MAX;
      color = '#cfd8dc';
    }
    capa.push(textoPausa(escena, area.x + 570, y - 6, estado, 14, color, lograda || lista, area.ancho - 580));
  });
}

// ---------------- Pestaña "Sinergias" ----------------

function pestanaSinergias(escena, capa, area) {
  capa.push(textoPausa(escena, area.x, area.y,
    'Combinaciones que dan un bonus extra cuando las tienes juntas. Se activan solas.', 14, '#cfd8dc'));
  const paso = 84;
  SINERGIAS.forEach((s, i) => {
    const y = area.y + 50 + i * paso;
    const activa = sinergiaActiva(escena, s);

    const g = escena.add.graphics();
    g.fillStyle(activa ? 0x1f3a1f : 0x000000, activa ? 0.8 : 0.3);
    g.fillRect(area.x, y - 26, area.ancho, paso - 12);
    if (activa) { g.lineStyle(2, 0x9ccc65, 1); g.strokeRect(area.x, y - 26, area.ancho, paso - 12); }
    capa.push(g);

    // Íconos de lo que pide
    s.requiere.forEach((req, j) => {
      const clave = req.instinto ? 'instinto_' + req.instinto : req.objeto;
      const escala = req.instinto ? 3 : 2;
      const tiene = nivelRequisito(escena, req) >= (CONFIG.SINERGIA_NIVEL_MINIMO || 1);
      casillaIcono(escena, capa, area.x + 30 + j * 62, y + 7, clave, escala, !tiene);
      if (j > 0) capa.push(textoPausa(escena, area.x + j * 62 - 4, y - 4, '+', 18, '#ffffff', true));
    });
    const xTexto = area.x + 30 + s.requiere.length * 62;

    capa.push(textoPausa(escena, xTexto, y - 20, s.nombre, 18, activa ? '#9ccc65' : '#ffe082', true));
    capa.push(textoPausa(escena, xTexto + 220, y - 18, textoBonusSinergia(s), 15, '#ffffff', true));
    const requisitos = s.requiere.map((req) =>
      nombreRequisito(req) + (nivelRequisito(escena, req) >= (CONFIG.SINERGIA_NIVEL_MINIMO || 1) ? ' ✔' : ' ✘')).join('  +  ');
    capa.push(textoPausa(escena, xTexto, y + 4, requisitos + '   —   ' + s.frase, 13, '#b0bec5', false, 520));
    capa.push(textoPausa(escena, area.x + area.ancho - 14, y - 6, activa ? 'ACTIVA' : 'Inactiva', 16,
      activa ? '#9ccc65' : '#77778a', activa).setOrigin(1, 0));
  });
}

// ---------------- Pestaña "Desafíos" ----------------
// (los desafíos están en src/desafios.js y las zonas en src/zonas.js)

function pestanaDesafios(escena, capa, area) {
  const e = escena;
  const anchoCol = area.ancho / 2 - 14;
  let x = area.x;
  let y = area.y;

  // Desafío actual
  capa.push(textoPausa(e, x, y, 'Desafío actual', 16, '#ffe082', true));
  y += 30;
  const g = e.add.graphics();
  capa.push(g);
  const d = e.desafio;
  if (d) {
    g.fillStyle(0x4a3a12, 0.8);
    g.fillRect(x, y - 6, anchoCol, 112);
    g.lineStyle(2, PAUSA_DORADO, 1);
    g.strokeRect(x, y - 6, anchoCol, 112);
    capa.push(textoPausa(e, x + 12, y, buscarDesafio(d.id).nombre, 20, '#ffd54f', true));
    capa.push(textoPausa(e, x + 12, y + 28, fraseDesafio(d.id), 13, '#cfd8dc', false, anchoCol - 24));
    capa.push(textoPausa(e, x + 12, y + 64, 'Progreso: ' + textoProgresoDesafio(e, d), 15, '#ffffff', true, anchoCol - 24));
    capa.push(textoPausa(e, x + 12, y + 86, 'Quedan ' + segundosRestantes(e, d) + ' segundos', 14, '#ffcc80'));
  } else {
    g.fillStyle(0x000000, 0.3);
    g.fillRect(x, y - 6, anchoCol, 70);
    let espera;
    if (e.amaneciendo) espera = 'Ya amanece: no hay más desafíos.';
    else if (e.jefeVivo()) espera = 'Mientras el jefe está vivo no hay desafíos.';
    else espera = 'El próximo llega en ' + e.formatearTiempo(Math.max(0, e.proximoDesafio - e.tiempoSobrevivido)) + '.';
    capa.push(textoPausa(e, x + 12, y, 'Ninguno por ahora', 18, '#cfd8dc', true));
    capa.push(textoPausa(e, x + 12, y + 28, espera + '  (tecla X: empezar uno de prueba)', 13, '#b0bec5', false, anchoCol - 24));
  }

  // Completados en esta partida
  y = area.y + 180;
  const hechos = e.desafiosCompletados;
  capa.push(textoPausa(e, x, y, 'Completados en esta partida: ' + hechos.length +
    (e.desafiosFallidos ? '   (fallidos: ' + e.desafiosFallidos + ')' : ''), 16, '#9ccc65', true));
  y += 28;
  if (hechos.length === 0) {
    capa.push(textoPausa(e, x, y, 'Todavía ninguno.', 14, '#8a8a99'));
  }
  const maxFilas = 7;
  hechos.slice(-maxFilas).forEach((h) => {
    capa.push(textoPausa(e, x, y, '✔ ' + h.nombre, 14, '#ffffff', true));
    capa.push(textoPausa(e, x + 120, y, h.minuto + '   ·   ' + h.recompensa, 14, '#b0bec5', false, anchoCol - 120));
    y += 22;
  });
  if (hechos.length > maxFilas) capa.push(textoPausa(e, x, y, '(y ' + (hechos.length - maxFilas) + ' más)', 13, '#8a8a99'));

  // Zonas especiales (a la derecha): qué hace cada una y en cuál estás
  x = area.x + anchoCol + 28;
  y = area.y;
  capa.push(textoPausa(e, x, y, 'Zonas especiales', 16, '#ffe082', true));
  y += 40;
  ZONAS.filter((z) => CONFIG.ZONAS[z.id]).forEach((z) => {
    const aqui = !!(e.efectoZona && e.efectoZona[z.id]);
    const fondo = e.add.graphics();
    fondo.fillStyle(aqui ? 0x1f3a1f : 0x000000, aqui ? 0.8 : 0.3);
    fondo.fillRect(x, y - 24, anchoCol, 56);
    fondo.lineStyle(2, z.color, aqui ? 1 : 0.6);
    fondo.strokeRect(x, y - 24, anchoCol, 56);
    capa.push(fondo);
    casillaIcono(e, capa, x + 26, y + 4, 'zona_' + z.id, 3, false);
    capa.push(textoPausa(e, x + 56, y - 16, z.nombre, 15, z.colorTexto, true));
    capa.push(textoPausa(e, x + 56, y + 4, z.frase, 13, '#cfd8dc', false, anchoCol - 150));
    if (aqui) capa.push(textoPausa(e, x + anchoCol - 10, y - 16, 'ESTÁS AQUÍ', 13, '#9ccc65', true).setOrigin(1, 0));
    y += 66;
  });
  capa.push(textoPausa(e, x, y - 6, 'Tecla Z: una zona de cada tipo cerca del perro (prueba)', 12, '#8a8a99'));
}

// ---------------- Pestaña "Colección" ----------------
// (los coleccionables ultra raros están en src/coleccionables.js)

function pestanaColeccion(escena, capa, area) {
  const e = escena;
  const lista = listaColeccionables(e.mapaId);
  const max = nivelMaximoColeccion();
  capa.push(textoPausa(e, area.x, area.y, 'Bonus permanentes de tus ultra raros (se guardan entre partidas y sirven con cualquier raza)   ·   ' +
    'Encontrados: ' + cuantosEncontrados(e.mapaId) + ' / ' + lista.length, 14, '#cfd8dc'));

  const anchoCol = area.ancho / 2 - 14;
  const paso = 56;
  const porColumna = Math.ceil(lista.length / 2);
  lista.forEach((c, i) => {
    const col = i < porColumna ? 0 : 1;
    const fila = i < porColumna ? i : i - porColumna;
    const x = area.x + col * (anchoCol + 28);
    const y = area.y + 64 + fila * paso;
    const info = infoColeccionable(c.id);
    const tiene = info.nivel > 0;

    const g = e.add.graphics();
    g.fillStyle(tiene ? 0x2e1f3a : 0x000000, tiene ? 0.8 : 0.3);
    g.fillRect(x, y - 24, anchoCol, paso - 8);
    if (tiene) { g.lineStyle(2, info.max ? PAUSA_DORADO : 0xce93d8, 1); g.strokeRect(x, y - 24, anchoCol, paso - 8); }
    capa.push(g);

    // Ícono (silueta negra si todavía no lo encuentras)
    capa.push(e.add.rectangle(x + 26, y, 40, 40, 0x000000, 0.6).setStrokeStyle(2, tiene ? 0xce93d8 : 0x555566));
    const icono = e.add.image(x + 26, y, claveColeccionable(c.id), 0).setScale(2);
    if (!tiene) icono.setTintFill(0x000000).setAlpha(0.7);
    capa.push(icono);

    capa.push(textoPausa(e, x + 56, y - 20, tiene ? c.nombre : '???', 15, tiene ? '#ffffff' : '#8a8a99', true));
    const nivel = !tiene ? 'No encontrado' : info.max ? 'Nv ' + max + ' MAX' : 'Nv ' + info.nivel + ' / ' + max +
      '  (' + info.progreso + '/' + info.necesita + ' copias)';
    capa.push(textoPausa(e, x + anchoCol - 10, y - 20, nivel, 13, !tiene ? '#77778a' : info.max ? '#ffd54f' : '#ce93d8', tiene)
      .setOrigin(1, 0));
    capa.push(textoPausa(e, x + 56, y, tiene ? textoBonusColeccionable(c.id, info.nivel) : 'Búscalo en la plaza: cae muy poco de los enemigos.',
      12, tiene ? '#c5e1a5' : '#6d6d80', false, anchoCol - 66));
  });
  capa.push(textoPausa(e, area.x, area.y + 20,
    'Tecla C: aparece un ultra raro de prueba cerca del perro   ·   El álbum completo está en la pantalla de inicio (botón Álbum o tecla A)', 12, '#8a8a99'));
}
