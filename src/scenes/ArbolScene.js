// Árbol de habilidades por raza (se abre desde la pantalla de inicio con
// la tecla G o el botón "Árbol"). Se compra con los huesitos guardados.
// Los datos, textos, íconos y el guardado están en src/arbol.js;
// los costos y números, en src/config.js (sección ARBOL).
// (marcoPixel viene de src/pausa.js; FUENTE, de MenuScene.js; botonPantalla,
//  margenExtra, avisoBreve y modoTactil, de src/tactil.js)
//
// Abajo de las ramas está "Colmillos afilados" (v0.22): mejora general para todas
// las razas, por niveles (▼ desde la última mejora de una rama para elegirla).
//
// Teclado: ◄ ► rama · ▲ ▼ mejora · Q / E (o 1 a 4) raza · Enter o Espacio comprar
//          R reiniciar el árbol de la raza · Esc o G volver

const ARBOL_COMPRADO = 0xffd54f;   // borde de las mejoras compradas
const ARBOL_BLOQUEADO = 0x55556a;  // borde de las mejoras bloqueadas
const ARBOL_COLMILLOS = 0xe0e0e0;  // color de Colmillos afilados (mejora general)

class ArbolScene extends Phaser.Scene {
  constructor() {
    super('ArbolScene');
  }

  init(datos) {
    // Se puede abrir con una raza ya elegida: scene.start('ArbolScene', { raza: 'galgo' })
    this.razaPedida = datos && datos.raza;
  }

  create() {
    this.e = margenExtra(); // en celular, todo se aleja un poco más de los bordes (0 en PC)
    this.capa = [];
    this.capaConfirmar = [];
    this.razas = RAZAS.filter((r) => CONFIG.RAZAS[r.id] && ramasDeRaza(r.id).length > 0);
    this.razaIndice = Math.max(0, this.razas.findIndex((r) => r.id === this.razaPedida));
    this.elegirPrimerNodo();

    const teclas = ['ESC', 'G', 'LEFT', 'RIGHT', 'UP', 'DOWN', 'Q', 'E', 'ENTER', 'SPACE', 'R', 'ONE', 'TWO', 'THREE', 'FOUR'];
    this.teclas = {};
    teclas.forEach((t) => { this.teclas[t] = this.input.keyboard.addKey(t); });

    this.dibujar();
  }

  update() {
    const t = (nombre) => Phaser.Input.Keyboard.JustDown(this.teclas[nombre]);

    // Con la confirmación abierta solo sirven Enter (sí) y Esc (no)
    if (this.capaConfirmar.length > 0) {
      if (t('ESC')) this.cerrarConfirmar();
      else if (t('ENTER')) this.confirmarReinicio();
      return;
    }

    if (t('ESC') || t('G')) { this.scene.start('MenuScene'); return; }
    if (t('Q')) this.cambiarRaza(-1);
    if (t('E')) this.cambiarRaza(1);
    ['ONE', 'TWO', 'THREE', 'FOUR'].forEach((nombre, i) => {
      if (t(nombre) && i < this.razas.length && i !== this.razaIndice) this.cambiarRaza(i - this.razaIndice);
    });
    if (t('LEFT')) this.moverSeleccion(-1, 0);
    if (t('RIGHT')) this.moverSeleccion(1, 0);
    if (t('UP')) this.moverSeleccion(0, -1);
    if (t('DOWN')) this.moverSeleccion(0, 1);
    if (t('ENTER') || t('SPACE')) this.comprar();
    if (t('R')) this.abrirConfirmar();
  }

  // ---------------- Selección ----------------

  raza() {
    return this.razas[this.razaIndice];
  }

  ramas() {
    return ramasDeRaza(this.raza().id);
  }

  // Al cambiar de raza: la primera mejora disponible (o la primera de todas)
  elegirPrimerNodo() {
    const razaId = this.raza().id;
    this.selGeneral = false; // true = está elegido Colmillos afilados
    this.selRama = 0;
    this.selNodo = 0;
    const ramas = ramasDeRaza(razaId);
    for (let r = 0; r < ramas.length; r++) {
      const nivel = nivelRama(razaId, ramas[r].id);
      if (nivel < ARBOL_NODOS) {
        this.selRama = r;
        this.selNodo = nivel;
        return;
      }
    }
  }

  cambiarRaza(paso) {
    const n = this.razas.length;
    this.razaIndice = (this.razaIndice + paso + n) % n;
    this.elegirPrimerNodo();
    this.dibujar();
  }

  moverSeleccion(dx, dy) {
    if (this.selGeneral) {
      // Desde Colmillos afilados: ▲ vuelve a la última mejora de la rama
      if (dy < 0) { this.selGeneral = false; this.selNodo = ARBOL_NODOS - 1; this.dibujar(); }
      return;
    }
    if (dy > 0 && this.selNodo === ARBOL_NODOS - 1) { this.selGeneral = true; this.dibujar(); return; }
    this.selRama = (this.selRama + dx + this.ramas().length) % this.ramas().length;
    this.selNodo = Phaser.Math.Clamp(this.selNodo + dy, 0, ARBOL_NODOS - 1);
    this.dibujar();
  }

  seleccionarGeneral() {
    this.selGeneral = true;
    this.dibujar();
  }

  seleccionar(rama, nodo) {
    this.selGeneral = false;
    this.selRama = rama;
    this.selNodo = nodo;
    this.dibujar();
  }

  // ---------------- Comprar ----------------

  comprar() {
    if (this.selGeneral) { this.comprarGeneral(); return; }
    const razaId = this.raza().id;
    const rama = this.ramas()[this.selRama];
    const i = this.selNodo;
    const estado = estadoNodo(razaId, rama.id, i);
    const w = this.scale.width;
    const aviso = (texto) => avisoBreve(this, w / 2, this.scale.height / 2, texto);
    if (estado === 'comprado') { aviso('Ya tienes esta mejora'); return; }
    if (estado === 'bloqueado') { aviso('Primero compra "' + rama.nodos[nivelRama(razaId, rama.id)].nombre + '"'); return; }
    const costo = costoNodo(i);
    const tienes = huesitosGuardados();
    if (tienes < costo) { aviso('Te faltan ' + (costo - tienes) + ' huesitos'); return; }
    if (!comprarNodo(razaId, rama.id, i)) return;
    // Pasa sola a la siguiente mejora de la rama
    if (this.selNodo < ARBOL_NODOS - 1) this.selNodo++;
    this.dibujar();
    aviso('¡' + rama.nodos[i].nombre + ' comprada!');
  }

  // Colmillos afilados (mejora general)
  comprarGeneral() {
    const aviso = (texto) => avisoBreve(this, this.scale.width / 2, this.scale.height / 2, texto);
    const costo = costoColmillos();
    if (costo === null) { aviso('Colmillos afilados ya está al máximo'); return; }
    const tienes = huesitosGuardados();
    if (tienes < costo) { aviso('Te faltan ' + (costo - tienes) + ' huesitos'); return; }
    if (!comprarColmillos()) return;
    this.dibujar();
    aviso('¡Colmillos afilados nivel ' + nivelColmillos() + '!');
  }

  // ---------------- Dibujo ----------------

  dibujar() {
    this.capa.forEach((o) => { this.tweens.killTweensOf(o); o.destroy(); });
    this.capa = [];
    const capa = this.capa;
    const w = this.scale.width;
    const h = this.scale.height;
    const e = this.e;
    const raza = this.raza();
    const tactil = modoTactil();
    const texto = (x, y, t, tam, color, extra) => {
      const obj = this.add.text(x, y, t, { fontFamily: FUENTE, fontSize: tam + 'px', color, ...extra });
      capa.push(obj);
      return obj;
    };

    // Arriba: huesitos, título y ayuda de teclas
    texto(14 + e, 12 + e / 2, 'Huesitos: ' + huesitosGuardados(), 18, '#f2d64b', { fontStyle: 'bold', stroke: '#000000', strokeThickness: 3 });
    texto(w / 2, 26 + e / 2, 'Árbol de habilidades', 28, '#ffe082', { fontStyle: 'bold' }).setOrigin(0.5);
    if (!tactil) {
      texto(w - 14 - e, 12 + e / 2, '◄ ► ▲ ▼ elegir · Q / E raza\nEnter comprar · R reiniciar', 12, '#9e9e9e', { align: 'right' }).setOrigin(1, 0);
    }

    // Pestañas de raza
    const anchoP = 168;
    const sepP = 176;
    const yP = 70 + e / 2;
    const inicioP = w / 2 - ((this.razas.length - 1) * sepP) / 2;
    this.razas.forEach((r, i) => {
      const cx = inicioP + i * sepP;
      const elegida = i === this.razaIndice;
      const g = this.add.graphics();
      marcoPixel(g, cx - anchoP / 2, yP - 17, anchoP, 34, elegida ? PAUSA_DORADO : 0x6d6a8a, elegida ? 0x4a3a12 : 0x2b2940);
      capa.push(g);
      const etiqueta = (tactil ? '' : (i + 1) + '. ') + r.nombre + '  ' + mejorasCompradas(r.id) + '/' + ramasDeRaza(r.id).length * ARBOL_NODOS;
      texto(cx, yP, etiqueta, 15, elegida ? '#ffe082' : '#cfd8dc', { fontStyle: elegida ? 'bold' : 'normal' }).setOrigin(0.5);
      const zona = this.add.zone(cx, yP, anchoP, 34).setInteractive({ useHandCursor: true });
      zona.on('pointerdown', () => { if (i !== this.razaIndice) this.cambiarRaza(i - this.razaIndice); });
      capa.push(zona);
    });

    // Las 3 ramas en columnas
    const izquierda = 20 + e;
    const anchoCol = 200;
    const arriba = 152 + e / 2;
    const paso = 78;
    this.ramas().forEach((rama, r) => this.dibujarRama(rama, r, izquierda + r * anchoCol, anchoCol, arriba, paso));

    // Colmillos afilados (mejora general), debajo de las ramas
    const yGeneral = arriba + ARBOL_NODOS * paso - 4;
    this.dibujarGeneral(izquierda, yGeneral, this.ramas().length * anchoCol - 8, 56);

    // Panel con la mejora elegida
    const px = izquierda + this.ramas().length * anchoCol + 8;
    const yPanel = 96 + e / 2;
    const altoPanel = h - 60 - e - yPanel;
    if (this.selGeneral) this.dibujarPanelGeneral(px, yPanel, w - 16 - e - px, altoPanel);
    else this.dibujarPanel(px, yPanel, w - 16 - e - px, altoPanel);

    // Botones de abajo
    const yb = h - 26 - e / 2;
    capa.push(...botonPantalla(this, w / 2 - 175, yb, 300, 34, tactil ? 'Volver' : 'Volver (Esc / G)', 0xffd54f,
      () => this.scene.start('MenuScene')));
    capa.push(...botonPantalla(this, w / 2 + 175, yb, 330, 34, 'Reiniciar árbol de ' + raza.nombre + (tactil ? '' : ' (R)'), 0xef5350,
      () => this.abrirConfirmar(), 15));
  }

  // Una rama: nombre arriba y sus 4 mejoras de arriba hacia abajo
  dibujarRama(rama, r, x0, ancho, arriba, paso) {
    const capa = this.capa;
    const razaId = this.raza().id;
    const nivel = nivelRama(razaId, rama.id);
    const cx = x0 + 34;   // centro de los cuadros
    const lado = 52;
    const colorTexto = colorTextoCol(rama.color);

    const titulo = this.add.text(x0 + ancho / 2 - 6, arriba - 46, rama.nombre + '  ' + nivel + '/' + ARBOL_NODOS, {
      fontFamily: FUENTE, fontSize: '17px', color: colorTexto, fontStyle: 'bold'
    }).setOrigin(0.5);
    capa.push(titulo);

    const g = this.add.graphics();
    capa.push(g);

    // Líneas que unen las mejoras (doradas si la de abajo ya está comprada)
    for (let i = 0; i < ARBOL_NODOS - 1; i++) {
      const y1 = arriba + i * paso + lado / 2;
      const y2 = arriba + (i + 1) * paso - lado / 2;
      g.fillStyle(i + 1 < nivel ? ARBOL_COMPRADO : i + 1 === nivel ? rama.color : ARBOL_BLOQUEADO, 1);
      g.fillRect(cx - 3, y1, 6, y2 - y1);
    }

    for (let i = 0; i < ARBOL_NODOS; i++) {
      const cy = arriba + i * paso;
      const estado = estadoNodo(razaId, rama.id, i);
      const especial = i === ARBOL_NODOS - 1;
      const elegido = !this.selGeneral && r === this.selRama && i === this.selNodo;

      // Cuadro del nodo
      const borde = estado === 'comprado' ? ARBOL_COMPRADO : estado === 'disponible' ? rama.color : ARBOL_BLOQUEADO;
      const fondo = estado === 'comprado' ? 0x4a3a12 : estado === 'disponible' ? 0x2b2940 : 0x1d1b2e;
      marcoPixel(g, cx - lado / 2, cy - lado / 2, lado, lado, borde, fondo);
      const colorIcono = estado === 'bloqueado' ? 0x77778a : estado === 'comprado' ? 0xffffff : rama.color;
      dibujarIconoArbol(g, cx - 16, cy - 16, rama.icono, 4, colorIcono, estado === 'bloqueado' ? 0.5 : 1);
      if (estado === 'bloqueado') dibujarIconoArbol(g, cx + 10, cy + 8, 'candado', 2, 0xb0bec5);
      if (especial) dibujarIconoArbol(g, cx + 12, cy - 26, 'estrella', 2, estado === 'comprado' ? ARBOL_COMPRADO : 0xb0bec5);

      // Marco blanco parpadeante en la mejora elegida
      if (elegido) {
        const cursor = this.add.graphics();
        cursor.lineStyle(3, 0xffffff, 1);
        cursor.strokeRect(x0 + 2, cy - lado / 2 - 6, ancho - 10, lado + 12);
        this.tweens.add({ targets: cursor, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
        capa.push(cursor);
      }

      // Nombre y costo al lado
      const tx = cx + lado / 2 + 10;
      const anchoTexto = x0 + ancho - 10 - tx;
      const nombre = this.add.text(tx, cy - 22, rama.nodos[i].nombre, {
        fontFamily: FUENTE, fontSize: '13px', fontStyle: 'bold', wordWrap: { width: anchoTexto },
        color: estado === 'bloqueado' ? '#8a8a99' : '#ffffff'
      });
      capa.push(nombre);
      let detalle;
      let colorDetalle;
      if (estado === 'comprado') { detalle = '✔ Comprada'; colorDetalle = '#ffd54f'; }
      else {
        const costo = costoNodo(i);
        detalle = costo + ' huesitos';
        colorDetalle = estado === 'bloqueado' ? '#6d6d80' : huesitosGuardados() >= costo ? '#9ccc65' : '#ef9a9a';
      }
      capa.push(this.add.text(tx, Math.max(cy + 6, nombre.y + nombre.height + 2), detalle, {
        fontFamily: FUENTE, fontSize: '12px', color: colorDetalle
      }));

      // Tocar la fila entera elige la mejora
      const zona = this.add.zone(x0 + ancho / 2 - 4, cy, ancho - 8, paso - 4).setInteractive({ useHandCursor: true });
      zona.on('pointerdown', () => this.seleccionar(r, i));
      capa.push(zona);
    }
  }

  // Fila de Colmillos afilados: ícono, nombre, un cuadrito por nivel y el costo del siguiente
  dibujarGeneral(x, cy, ancho, alto) {
    const capa = this.capa;
    const nivel = nivelColmillos();
    const total = nivelesColmillos();
    const costo = costoColmillos();
    const g = this.add.graphics();
    capa.push(g);
    marcoPixel(g, x, cy - alto / 2, ancho, alto, nivel >= total ? ARBOL_COMPRADO : ARBOL_COLMILLOS, 0x23213a);
    dibujarIconoArbol(g, x + 12, cy - 16, 'mordida', 4, nivel > 0 ? 0xffffff : ARBOL_COLMILLOS);
    capa.push(this.add.text(x + 54, cy - 20, 'Colmillos afilados', {
      fontFamily: FUENTE, fontSize: '15px', color: '#ffffff', fontStyle: 'bold'
    }));
    capa.push(this.add.text(x + 54, cy + 2, 'Todas las razas · +' + Math.round((CONFIG.ARBOL.COLMILLOS_DANIO_POR_NIVEL || 0) * 100) + '% de daño por nivel', {
      fontFamily: FUENTE, fontSize: '12px', color: '#cfd8dc'
    }));
    // Un cuadrito por nivel (dorado = comprado)
    const lado = 18;
    const x0 = x + ancho - 150 - total * (lado + 6);
    for (let i = 0; i < total; i++) {
      marcoPixel(g, x0 + i * (lado + 6), cy - lado / 2 - 8, lado, lado, i < nivel ? ARBOL_COMPRADO : ARBOL_BLOQUEADO, i < nivel ? 0x4a3a12 : 0x1d1b2e);
    }
    capa.push(this.add.text(x0, cy + 6, 'Nivel ' + nivel + ' / ' + total, { fontFamily: FUENTE, fontSize: '12px', color: '#ffd54f' }));
    const detalle = costo === null ? '✔ Al máximo' : 'Siguiente: ' + costo + ' huesitos';
    const colorDetalle = costo === null ? '#ffd54f' : huesitosGuardados() >= costo ? '#9ccc65' : '#ef9a9a';
    capa.push(this.add.text(x + ancho - 12, cy, detalle, {
      fontFamily: FUENTE, fontSize: '13px', color: colorDetalle, fontStyle: 'bold', align: 'right', wordWrap: { width: 130 }
    }).setOrigin(1, 0.5));
    if (this.selGeneral) {
      const cursor = this.add.graphics();
      cursor.lineStyle(3, 0xffffff, 1);
      cursor.strokeRect(x - 4, cy - alto / 2 - 4, ancho + 8, alto + 8);
      this.tweens.add({ targets: cursor, alpha: 0.35, duration: 450, yoyo: true, repeat: -1 });
      capa.push(cursor);
    }
    const zona = this.add.zone(x + ancho / 2, cy, ancho, alto).setInteractive({ useHandCursor: true });
    zona.on('pointerdown', () => this.seleccionarGeneral());
    capa.push(zona);
  }

  // Panel de la derecha cuando está elegido Colmillos afilados
  dibujarPanelGeneral(x, y, ancho, alto) {
    const capa = this.capa;
    const nivel = nivelColmillos();
    const total = nivelesColmillos();
    const costo = costoColmillos();
    const alcanza = costo !== null && huesitosGuardados() >= costo;
    const texto = (tx, ty, t, tam, color, extra) => {
      const obj = this.add.text(tx, ty, t, { fontFamily: FUENTE, fontSize: tam + 'px', color, ...extra });
      capa.push(obj);
      return obj;
    };
    const g = this.add.graphics();
    marcoPixel(g, x, y, ancho, alto, ARBOL_COLMILLOS, 0x1d1b2e);
    g.fillStyle(0x000000, 0.4);
    g.fillRect(x + 14, y + 14, 52, 52);
    dibujarIconoArbol(g, x + 20, y + 20, 'mordida', 5, ARBOL_COLMILLOS);
    capa.push(g);
    texto(x + 76, y + 16, 'Mejora general', 14, '#e0e0e0', { fontStyle: 'bold' });
    texto(x + 76, y + 36, 'Nivel ' + nivel + ' de ' + total + ' · todas las razas', 13, '#cfd8dc');
    const anchoTexto = ancho - 28;
    const nombre = texto(x + 14, y + 78, 'Colmillos afilados', 20, '#ffffff', { fontStyle: 'bold' });
    const por = Math.round((CONFIG.ARBOL.COLMILLOS_DANIO_POR_NIVEL || 0) * 100);
    const efecto = texto(x + 14, nombre.y + nombre.height + 8,
      '+' + por + '% de daño en todos tus ataques por nivel (máximo ' + total + ' niveles: +' + por * total + '%).\n' +
      'Ahora: +' + Math.round(bonusColmillos() * 100) + '%. Sirve para todas las razas y no se quita al reiniciar el árbol de una raza.',
      14, '#e0e0e0', { wordWrap: { width: anchoTexto }, lineSpacing: 3 });
    const yEstado = Math.max(efecto.y + efecto.height + 14, y + alto - 120);
    if (costo === null) {
      texto(x + 14, yEstado, '✔ Al máximo', 16, '#ffd54f', { fontStyle: 'bold' });
    } else {
      texto(x + 14, yEstado, 'Nivel ' + (nivel + 1) + ': ' + costo + ' huesitos', 16, alcanza ? '#9ccc65' : '#ef9a9a', { fontStyle: 'bold' });
      if (!alcanza) texto(x + 14, yEstado + 22, 'Te faltan ' + (costo - huesitosGuardados()) + ' huesitos', 13, '#b0bec5');
    }
    const bx = x + ancho / 2;
    const by = y + alto - 34;
    const anchoB = ancho - 28;
    const altoB = 40;
    const bg = this.add.graphics();
    const pintar = (encima) => {
      bg.clear();
      if (alcanza) marcoPixel(bg, bx - anchoB / 2, by - altoB / 2, anchoB, altoB, encima ? 0xffffff : 0x9ccc65, encima ? 0x3d5a2a : 0x26381c);
      else marcoPixel(bg, bx - anchoB / 2, by - altoB / 2, anchoB, altoB, ARBOL_BLOQUEADO, 0x232232);
    };
    pintar(false);
    capa.push(bg);
    const etiqueta = costo === null ? 'Al máximo' : 'Comprar nivel ' + (nivel + 1) + (modoTactil() ? '' : ' (Enter)');
    texto(bx, by, etiqueta, 17, alcanza ? '#c5e1a5' : '#77778a', { fontStyle: 'bold' }).setOrigin(0.5);
    const zona = this.add.zone(bx, by, anchoB, altoB).setInteractive({ useHandCursor: alcanza });
    zona.on('pointerover', () => pintar(true));
    zona.on('pointerout', () => pintar(false));
    zona.on('pointerdown', () => this.comprar());
    capa.push(zona);
  }

  // Panel de la derecha: nombre, efecto, costo y botón Comprar
  dibujarPanel(x, y, ancho, alto) {
    const capa = this.capa;
    const razaId = this.raza().id;
    const rama = this.ramas()[this.selRama];
    const i = this.selNodo;
    const nodo = rama.nodos[i];
    const estado = estadoNodo(razaId, rama.id, i);
    const especial = i === ARBOL_NODOS - 1;
    const costo = costoNodo(i);
    const alcanza = huesitosGuardados() >= costo;
    const texto = (tx, ty, t, tam, color, extra) => {
      const obj = this.add.text(tx, ty, t, { fontFamily: FUENTE, fontSize: tam + 'px', color, ...extra });
      capa.push(obj);
      return obj;
    };

    const g = this.add.graphics();
    marcoPixel(g, x, y, ancho, alto, especial ? ARBOL_COMPRADO : rama.color, 0x1d1b2e);
    capa.push(g);

    // Ícono grande y rama
    const ig = this.add.graphics();
    ig.fillStyle(0x000000, 0.4);
    ig.fillRect(x + 14, y + 14, 52, 52);
    dibujarIconoArbol(ig, x + 20, y + 20, rama.icono, 5, estado === 'bloqueado' ? 0x77778a : rama.color);
    capa.push(ig);
    texto(x + 76, y + 16, this.raza().nombre + ' · ' + rama.nombre, 14, colorTextoCol(rama.color), { fontStyle: 'bold' });
    texto(x + 76, y + 36, especial ? '★ Habilidad especial' : 'Mejora ' + (i + 1) + ' de ' + ARBOL_NODOS, 13,
      especial ? '#ffd54f' : '#cfd8dc', { fontStyle: especial ? 'bold' : 'normal' });

    const anchoTexto = ancho - 28;
    const nombre = texto(x + 14, y + 78, nodo.nombre, 20, '#ffffff', { fontStyle: 'bold', wordWrap: { width: anchoTexto } });
    const efecto = texto(x + 14, nombre.y + nombre.height + 8, textoNodo(razaId, rama.id, i), 14, '#e0e0e0',
      { wordWrap: { width: anchoTexto }, lineSpacing: 3 });

    // Estado y costo
    let yEstado = Math.max(efecto.y + efecto.height + 14, y + alto - 120);
    if (estado === 'comprado') {
      texto(x + 14, yEstado, '✔ Ya la tienes', 16, '#ffd54f', { fontStyle: 'bold' });
    } else {
      texto(x + 14, yEstado, 'Costo: ' + costo + ' huesitos', 16, alcanza ? '#9ccc65' : '#ef9a9a', { fontStyle: 'bold' });
      yEstado += 22;
      if (estado === 'bloqueado') {
        texto(x + 14, yEstado, 'Primero compra "' + rama.nodos[nivelRama(razaId, rama.id)].nombre + '"', 13, '#b0bec5',
          { wordWrap: { width: anchoTexto } });
      } else if (!alcanza) {
        texto(x + 14, yEstado, 'Te faltan ' + (costo - huesitosGuardados()) + ' huesitos', 13, '#b0bec5');
      }
    }

    // Botón Comprar (gris si no se puede)
    const puede = estado === 'disponible' && alcanza;
    const bx = x + ancho / 2;
    const by = y + alto - 34;
    const anchoB = ancho - 28;
    const altoB = 40;
    const bg = this.add.graphics();
    const pintar = (encima) => {
      bg.clear();
      if (puede) marcoPixel(bg, bx - anchoB / 2, by - altoB / 2, anchoB, altoB, encima ? 0xffffff : 0x9ccc65, encima ? 0x3d5a2a : 0x26381c);
      else marcoPixel(bg, bx - anchoB / 2, by - altoB / 2, anchoB, altoB, ARBOL_BLOQUEADO, 0x232232);
    };
    pintar(false);
    capa.push(bg);
    const etiqueta = estado === 'comprado' ? 'Comprada' : 'Comprar' + (modoTactil() ? '' : ' (Enter)');
    texto(bx, by, etiqueta, 17, puede ? '#c5e1a5' : '#77778a', { fontStyle: 'bold' }).setOrigin(0.5);
    const zona = this.add.zone(bx, by, anchoB, altoB).setInteractive({ useHandCursor: puede });
    zona.on('pointerover', () => pintar(true));
    zona.on('pointerout', () => pintar(false));
    zona.on('pointerdown', () => this.comprar()); // si no se puede, comprar() explica por qué
    capa.push(zona);
  }

  // ---------------- Reiniciar el árbol de la raza (pide confirmar) ----------------

  abrirConfirmar() {
    if (this.capaConfirmar.length > 0) return;
    const raza = this.raza();
    const w = this.scale.width;
    const h = this.scale.height;
    const gastado = gastadoEnRaza(raza.id);
    if (mejorasCompradas(raza.id) === 0 && gastado === 0) {
      avisoBreve(this, w / 2, h / 2, raza.nombre + ' todavía no tiene mejoras');
      return;
    }
    const devolucion = CONFIG.ARBOL.DEVOLUCION === undefined ? 1 : CONFIG.ARBOL.DEVOLUCION;
    const devuelve = Math.floor(gastado * devolucion);
    const capa = this.capaConfirmar;
    const tactil = modoTactil();

    // El fondo oscuro tapa los toques a lo de atrás
    capa.push(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75).setInteractive());
    const g = this.add.graphics();
    marcoPixel(g, w / 2 - 270, h / 2 - 110, 540, 220, 0xef5350, 0x2b1d24);
    capa.push(g);
    capa.push(this.add.text(w / 2, h / 2 - 72, '¿Reiniciar el árbol de ' + raza.nombre + '?', {
      fontFamily: FUENTE, fontSize: '24px', color: '#ef9a9a', fontStyle: 'bold'
    }).setOrigin(0.5));
    capa.push(this.add.text(w / 2, h / 2 - 22,
      'Se quitan sus ' + mejorasCompradas(raza.id) + ' mejoras y te devolvemos\n' +
      devuelve + ' huesitos (el ' + Math.round(devolucion * 100) + '% de lo gastado).\nLas otras razas no cambian.', {
        fontFamily: FUENTE, fontSize: '15px', color: '#ffffff', align: 'center'
      }).setOrigin(0.5));
    capa.push(...botonPantalla(this, w / 2 - 125, h / 2 + 58, 210, 38, tactil ? 'Sí, reiniciar' : 'Sí, reiniciar (Enter)', 0xef5350,
      () => this.confirmarReinicio(), 15));
    capa.push(...botonPantalla(this, w / 2 + 125, h / 2 + 58, 210, 38, tactil ? 'Cancelar' : 'Cancelar (Esc)', 0xffd54f,
      () => this.cerrarConfirmar(), 15));
  }

  confirmarReinicio() {
    const raza = this.raza();
    const devuelto = reiniciarArbolRaza(raza.id);
    this.cerrarConfirmar();
    this.elegirPrimerNodo();
    this.dibujar();
    avisoBreve(this, this.scale.width / 2, this.scale.height / 2, 'Árbol de ' + raza.nombre + ' reiniciado: +' + devuelto + ' huesitos');
  }

  cerrarConfirmar() {
    this.capaConfirmar.forEach((o) => o.destroy());
    this.capaConfirmar = [];
  }
}
