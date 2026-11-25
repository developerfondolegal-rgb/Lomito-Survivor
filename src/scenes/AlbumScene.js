// Álbum de coleccionables ultra raros (se abre desde la pantalla de inicio
// con el botón "Álbum" o la tecla A). Una página por mapa: ← → o los botones ◀ ▶.
// Los coleccionables, sus textos, dibujos y el guardado están en src/coleccionables.js
// (marcoPixel viene de src/pausa.js; FUENTE, de MenuScene.js)

class AlbumScene extends Phaser.Scene {
  constructor() {
    super('AlbumScene');
  }

  create() {
    crearTexturasColeccionables(this);
    this.mapas = listaMapas();
    this.mapaId = mapaGuardado(); // empieza en el último mapa elegido
    this.capa = [];
    this.capaConfirmar = [];
    this.brillos = [];
    this.teclaEsc = this.input.keyboard.addKey('ESC');
    this.teclaA = this.input.keyboard.addKey('A');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.dibujar();
  }

  update(time) {
    // Brillo arcoíris de los coleccionables encontrados
    this.brillos.forEach((b, i) => { if (b.active) b.setTint(colorArcoiris(time, i * 0.09)); });

    const teclado = Phaser.Input.Keyboard;
    const esc = teclado.JustDown(this.teclaEsc);
    const a = teclado.JustDown(this.teclaA);
    if (this.capaConfirmar.length > 0) {
      if (esc) this.cerrarConfirmar();
    } else if (esc || a) {
      this.scene.start('MenuScene');
    } else if (teclado.JustDown(this.cursors.left)) {
      this.cambiarMapa(-1);
    } else if (teclado.JustDown(this.cursors.right)) {
      this.cambiarMapa(1);
    }
  }

  // Pasa a la página del mapa anterior (-1) o siguiente (1)
  cambiarMapa(paso) {
    const n = this.mapas.length;
    const i = this.mapas.findIndex((m) => m.id === this.mapaId);
    this.mapaId = this.mapas[(i + paso + n) % n].id;
    this.dibujar();
  }

  dibujar() {
    this.capa.forEach((o) => o.destroy());
    this.capa = [];
    this.brillos = [];
    const w = this.scale.width;
    const h = this.scale.height;
    const lista = listaColeccionables(this.mapaId);
    const capa = this.capa;

    capa.push(this.add.text(w / 2, 24, 'Álbum: ' + buscarMapa(this.mapaId).nombre, {
      fontFamily: FUENTE, fontSize: '30px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5));
    // Botones para cambiar de mapa
    if (this.mapas.length > 1) {
      this.boton(w / 2 - 290, 24, 64, '◀', 0xce93d8, () => this.cambiarMapa(-1));
      this.boton(w / 2 + 290, 24, 64, '▶', 0xce93d8, () => this.cambiarMapa(1));
    }

    const desafios = (CONFIG.ULTRA_DESAFIOS || []).map((id) => buscarDesafio(id).nombre).join(' o ');
    capa.push(this.add.text(w / 2, 56,
      'Encontrados: ' + cuantosEncontrados(this.mapaId) + ' / ' + lista.length +
      '   ·   Los ultra raros caen muy poco de los enemigos, más de los élites y del Jefe' +
      (desafios ? ', y siempre al cumplir ' + desafios : '') + '.', {
        fontFamily: FUENTE, fontSize: '13px', color: '#cfd8dc', align: 'center', wordWrap: { width: w - 40 }
      }).setOrigin(0.5));

    // Cuadrícula de 4 columnas
    const columnas = 4;
    const anchoC = 226;
    const altoC = 130;
    const espacioX = 8;
    const espacioY = 4;
    const inicioX = (w - (columnas * anchoC + (columnas - 1) * espacioX)) / 2;
    const arriba = 76;
    lista.forEach((c, i) => {
      const x = inicioX + (i % columnas) * (anchoC + espacioX);
      const y = arriba + Math.floor(i / columnas) * (altoC + espacioY);
      this.dibujarCarta(c, x, y, anchoC, altoC);
    });

    // Botones de abajo
    const yb = h - 28;
    this.boton(w / 2 - 130, yb, 220, modoTactil() ? 'Volver' : 'Volver (Esc / A)', 0xffd54f, () => this.scene.start('MenuScene'));
    this.boton(w / 2 + 130, yb, 220, 'Borrar progreso', 0xef5350, () => this.abrirConfirmar());
  }

  // Una carta del álbum: dibujo, nombre, nivel, copias, bonus y frase
  // (si no lo has encontrado: silueta negra y "???")
  dibujarCarta(c, x, y, ancho, alto) {
    const info = infoColeccionable(c.id);
    const tiene = info.copias > 0;
    const max = nivelMaximoColeccion();
    const capa = this.capa;

    const g = this.add.graphics();
    marcoPixel(g, x, y, ancho, alto, !tiene ? 0x55556a : info.max ? 0xffd54f : 0xce93d8, tiene ? 0x2a1f3a : 0x1d1b2e);
    capa.push(g);

    const ix = x + 36;
    const iy = y + 40;
    if (tiene) {
      const brillo = this.add.image(ix, iy, 'brillo_objeto').setScale(ESCALA_PIXEL * 1.1).setAlpha(0.8);
      this.brillos.push(brillo);
      capa.push(brillo);
    }
    const icono = this.add.image(ix, iy, claveColeccionable(c.id), 0).setScale(3);
    if (!tiene) icono.setTintFill(0x000000).setAlpha(0.75); // silueta
    capa.push(icono);

    const texto = (tx, ty, t, tam, color, extra) => {
      const obj = this.add.text(tx, ty, t, { fontFamily: FUENTE, fontSize: tam + 'px', color, ...extra });
      capa.push(obj);
      return obj;
    };
    const derecha = x + 70;
    const anchoDerecha = ancho - 78;

    if (!tiene) {
      texto(derecha, y + 12, '???', 18, '#8a8a99', { fontStyle: 'bold' });
      texto(derecha, y + 38, 'No encontrado', 12, '#77778a');
      texto(x + 10, y + 74, 'Mapa: ' + buscarMapa(mapaDeColeccionable(c.id)).nombre, 11, '#6d6d80');
      texto(x + 10, y + 92, '¿Qué será? Sigue buscando...', 11, '#6d6d80', { fontStyle: 'italic' });
      return;
    }

    texto(derecha, y + 8, c.nombre, 14, '#ffffff', { fontStyle: 'bold', wordWrap: { width: anchoDerecha } });
    const estrellas = '★'.repeat(info.nivel) + '☆'.repeat(max - info.nivel);
    texto(derecha, y + 42, estrellas + '  Nv ' + info.nivel + (info.max ? ' MAX' : ''), 12,
      info.max ? '#ffd54f' : '#ce93d8', { fontStyle: 'bold' });
    texto(derecha, y + 58, info.max ? 'Nivel máximo · ' + info.copias + ' copias'
      : 'Copias: ' + info.progreso + ' / ' + info.necesita + ' para Nv ' + (info.nivel + 1), 11, '#cfd8dc');
    const bonus = texto(x + 10, y + 70, textoBonusColeccionable(c.id, info.nivel), 11, '#c5e1a5', { wordWrap: { width: ancho - 20 } });
    const frase = texto(x + 10, bonus.y + bonus.height + 2, c.frase, 10, '#b0bec5', { fontStyle: 'italic', wordWrap: { width: ancho - 20 } });
    // En celular la letra es más grande (src/tactil.js): si la frase no cabe en la carta, vuelve a su tamaño normal
    if (frase.y + frase.height > y + alto - 6) frase.setFontSize(10);
  }

  boton(cx, cy, ancho, texto, color, alHacerClic, capa) {
    const lista = capa || this.capa;
    const alto = 34;
    const g = this.add.graphics();
    const pintar = (encima) => {
      g.clear();
      marcoPixel(g, cx - ancho / 2, cy - alto / 2, ancho, alto, encima ? 0xffffff : color, encima ? 0x4a3a2a : 0x2b2333);
    };
    pintar(false);
    const etiqueta = this.add.text(cx, cy, texto, {
      fontFamily: FUENTE, fontSize: '16px', color: colorTextoCol(color), fontStyle: 'bold'
    }).setOrigin(0.5);
    const zona = this.add.zone(cx, cy, ancho, alto).setInteractive({ useHandCursor: true });
    zona.on('pointerover', () => pintar(true));
    zona.on('pointerout', () => pintar(false));
    zona.on('pointerdown', alHacerClic);
    lista.push(g, etiqueta, zona);
    return [g, etiqueta, zona];
  }

  // ---------------- Borrar progreso (pide confirmar) ----------------

  abrirConfirmar() {
    if (this.capaConfirmar.length > 0) return;
    const w = this.scale.width;
    const h = this.scale.height;
    const capa = this.capaConfirmar;

    // El fondo oscuro tapa los clics a lo de atrás
    capa.push(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.75).setInteractive());
    const g = this.add.graphics();
    marcoPixel(g, w / 2 - 260, h / 2 - 110, 520, 220, 0xef5350, 0x2b1d24);
    capa.push(g);
    capa.push(this.add.text(w / 2, h / 2 - 70, '¿Borrar todo tu progreso?', {
      fontFamily: FUENTE, fontSize: '26px', color: '#ef9a9a', fontStyle: 'bold'
    }).setOrigin(0.5));
    capa.push(this.add.text(w / 2, h / 2 - 20,
      'Se perderán todos tus coleccionables, sus copias y niveles,\ntus huesitos guardados y el árbol de habilidades de todas las razas.\nNo se puede deshacer.', {
        fontFamily: FUENTE, fontSize: '15px', color: '#ffffff', align: 'center'
      }).setOrigin(0.5));
    this.boton(w / 2 - 120, h / 2 + 55, 200, 'Sí, borrar', 0xef5350, () => {
      borrarColeccion();
      borrarHuesitos(); // src/huesitos.js
      borrarArbol();    // src/arbol.js
      this.cerrarConfirmar();
      this.dibujar();
      this.avisoBorrado();
    }, capa);
    this.boton(w / 2 + 120, h / 2 + 55, 200, modoTactil() ? 'Cancelar' : 'Cancelar (Esc)', 0xffd54f, () => this.cerrarConfirmar(), capa);
  }

  cerrarConfirmar() {
    this.capaConfirmar.forEach((o) => o.destroy());
    this.capaConfirmar = [];
  }

  avisoBorrado() {
    const t = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Progreso borrado', {
      fontFamily: FUENTE, fontSize: '28px', color: '#ef9a9a', fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5);
    this.tweens.add({ targets: t, alpha: 0, delay: 1200, duration: 600, onComplete: () => t.destroy() });
  }
}
