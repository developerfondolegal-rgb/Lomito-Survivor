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
  crearTexturasInstintos(escena);

  // Olvidar teclas presionadas antes de abrir (si no, actuarían al instante)
  const teclado = Phaser.Input.Keyboard;
  [escena.teclaR, escena.teclaM, escena.cursors.left, escena.cursors.right].forEach((t) => teclado.JustDown(t));

  dibujarPausa(escena);
}

function cerrarPausa(escena) {
  borrarPausa(escena);
  escena.pausado = false;
  escena.physics.resume();
  escena.anims.resumeAll();
  escena.tweens.resumeAll();
}

// Antes de reiniciar o volver al menú: dejar todo andando otra vez
function salirDePausa(escena) {
  borrarPausa(escena);
  escena.pausado = false;
  escena.tweens.resumeAll();
  escena.anims.resumeAll();
}

function borrarPausa(escena) {
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
    escena.scene.restart({ raza: escena.razaId });
  } else if (teclado.JustDown(escena.teclaM)) {
    salirDePausa(escena);
    escena.scene.start('MenuScene');
  } else if (teclado.JustDown(escena.cursors.left)) {
    cambiarPestana(escena, -1);
  } else if (teclado.JustDown(escena.cursors.right)) {
    cambiarPestana(escena, 1);
  }
}

function cambiarPestana(escena, paso) {
  const n = PESTANAS_PAUSA.length;
  escena.pestanaPausa = ((escena.pestanaPausa || 0) + paso + n) % n;
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

  capa.push(escena.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6));

  // Marco principal
  const px = 30;
  const py = 14;
  const pw = w - 60;
  const ph = h - 28;
  const marco = escena.add.graphics();
  marcoPixel(marco, px, py, pw, ph, PAUSA_BORDE, PAUSA_FONDO);
  capa.push(marco);

  capa.push(textoPausa(escena, w / 2, py + 26, 'PAUSA', 28, '#ffe082', true).setOrigin(0.5));
  const ayuda = modoTactil() ? 'Toca una pestaña para cambiar' : '◄ ►  cambiar pestaña   ·   P / Esc: volver a jugar';
  capa.push(textoPausa(escena, px + pw - 18, py + 26, ayuda, 12, '#9e9e9e')
    .setOrigin(1, 0.5));

  // Pestañas
  const anchoP = 140;
  const sepP = 146;
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
  const area = { x: px + 26, y: py + 92, ancho: pw - 52 };
  if (pestana === 0) pestanaStats(escena, capa, area);
  else if (pestana === 1) pestanaInventario(escena, capa, area);
  else if (pestana === 2) pestanaFusiones(escena, capa, area);
  else if (pestana === 3) pestanaSinergias(escena, capa, area);
  else if (pestana === 4) pestanaDesafios(escena, capa, area);
  else pestanaColeccion(escena, capa, area);

  // Botones de abajo
  const yb = py + ph - 32;
  botonPausa(escena, capa, w / 2 - 230, yb, 200, 'Continuar', () => cerrarPausa(escena));
  botonPausa(escena, capa, w / 2, yb, 200, modoTactil() ? 'Reiniciar' : 'Reiniciar (R)', () => {
    salirDePausa(escena);
    escena.scene.restart({ raza: escena.razaId });
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
  stats.push({ nombre: 'Daño de mordida', valor: numeroPausa(e.danoMordida()), partes: dano.concat(danoExtra) });

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
  const reduccion = 1 - (1 - collar) * (1 - e.reduccionArbol());
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

  // Árbol de habilidades: lo que no aparece en los otros stats y las especiales (★)
  const partesArbol = partesArbolStats(e);
  stats.push({
    nombre: 'Árbol de habilidades',
    valor: mejorasCompradas(e.razaId) + ' / ' + ramasDeRaza(e.razaId).length * ARBOL_NODOS + ' mejoras',
    partes: partesArbol.length ? partesArbol : ['Sin mejoras: se compran con huesitos en el menú (Árbol)']
  });

  return stats;
}

function pestanaStats(escena, capa, area) {
  const stats = calcularStats(escena);
  const anchoCol = area.ancho / 2 - 14;
  const paso = 52;

  // 6 stats a la izquierda, el resto a la derecha
  let abajoDerecha = area.y + 4;
  stats.forEach((s, i) => {
    const col = i < 6 ? 0 : 1;
    const fila = i < 6 ? i : i - 6;
    const x = area.x + col * (anchoCol + 28);
    const y = area.y + 4 + fila * paso;
    capa.push(textoPausa(escena, x, y, s.nombre, 15, '#ffe082', true));
    capa.push(textoPausa(escena, x + 175, y, s.valor, 15, '#ffffff', true));
    const partes = textoPausa(escena, x, y + 20, s.partes.join('  ·  '), 12, '#b0bec5', false, anchoCol);
    capa.push(partes);
    if (col === 1) abajoDerecha = Math.max(y + paso, partes.y + partes.height + 8);
  });

  // Datos de la partida, abajo a la derecha (debajo del último stat de esa columna)
  const e = escena;
  const x = area.x + anchoCol + 28;
  let y = abajoDerecha + 6;
  const fase = datosFase(Math.max(0, e.faseActual)).NOMBRE;
  const lineas = [
    ['Nivel', e.nivel + '   (' + numeroPausa(e.xp) + ' / ' + e.xpParaSubir() + ' huesos para el siguiente)'],
    ['Tiempo jugado', e.formatearTiempo(e.tiempoSobrevivido)],
    ['Hora de la noche', horaDeLaNoche(e.tiempoSobrevivido) + (fase ? '  ·  ' + fase : '')],
    ['Enemigos derrotados', String(e.derrotados)]
  ];
  if (e.jefeAparecido) lineas.push([NOMBRE_JEFE, e.jefeDerrotado ? 'derrotado' : 'sigue vivo']);
  // Si el árbol ocupa mucho, las líneas se juntan un poco para no tapar los botones de abajo
  const limite = escena.scale.height - 72;
  const pasoLinea = Math.max(18, Math.min(24, (limite - y) / lineas.length));
  const g = escena.add.graphics();
  g.fillStyle(0x000000, 0.3);
  g.fillRect(x - 8, y - 6, anchoCol + 8, lineas.length * pasoLinea + 8);
  capa.push(g);
  lineas.forEach(([nombre, valor]) => {
    capa.push(textoPausa(escena, x, y, nombre, 15, '#90caf9', true));
    capa.push(textoPausa(escena, x + 175, y, valor, 15, '#ffffff'));
    y += pasoLinea;
  });
}

// ---------------- Pestaña "Instintos y objetos" ----------------

function pestanaInventario(escena, capa, area) {
  const anchoCol = area.ancho / 2 - 14;
  const paso = 48;

  // Instintos (izquierda)
  let x = area.x;
  capa.push(textoPausa(escena, x, area.y, 'Instintos (máximo Nv ' + CONFIG.INSTINTO_NIVEL_MAX + ')', 16, '#ffe082', true));
  INSTINTOS.forEach((inst, i) => {
    const y = area.y + 46 + i * paso;
    const nivel = escena.instintos[inst.id] || 0;
    filaInventario(escena, capa, x, y, anchoCol, 'instinto_' + inst.id, 3, inst.nombre, nivel, CONFIG.INSTINTO_NIVEL_MAX, inst.frase);
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
