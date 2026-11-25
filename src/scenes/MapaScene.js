// Pantalla para elegir el mapa (aparece después de elegir la raza).
// Flechas ← → para moverse, Enter o Espacio para jugar, teclas 1, 2, 3...
// para elegir directo, Esc para volver. Con el mouse: clic en un mapa.
// En celular: toca un mapa.
// La lista de mapas, sus nombres y colores están en src/mapas.js;
// sus tamaños y cantidades, en src/config.js (sección MAPAS).
// (FUENTE viene de MenuScene.js; marcoPixel, de src/pausa.js; botonPantalla, de src/tactil.js)

class MapaScene extends Phaser.Scene {
  constructor() {
    super('MapaScene');
  }

  // Recibe la raza elegida en la pantalla de inicio
  init(datos) {
    this.razaId = (datos && datos.raza) || Object.keys(CONFIG.RAZAS)[0];
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const e = margenExtra();
    crearTexturasColeccionables(this);
    this.mapas = listaMapas().slice(0, 9);
    const guardado = this.mapas.findIndex((m) => m.id === mapaGuardado());
    this.indice = Math.max(0, guardado);
    this.empezando = false;

    const raza = RAZAS.find((r) => r.id === this.razaId);
    this.add.text(w / 2, 34, 'Elige el mapa', {
      fontFamily: FUENTE, fontSize: '36px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5);
    const como = modoTactil() ? 'toca un mapa para jugar' : '← → y Enter, clic o teclas 1 a ' + this.mapas.length;
    this.add.text(w / 2, 70, (raza ? raza.nombre + '  ·  ' : '') + como, {
      fontFamily: FUENTE, fontSize: '16px', color: '#dddddd'
    }).setOrigin(0.5);

    this.crearCartas();
    this.marcar(this.indice);

    const yb = h - 26 - e / 2;
    botonPantalla(this, w / 2 - 130, yb, 200, 34, 'Volver' + (modoTactil() ? '' : ' (Esc)'), 0xffd54f,
      () => this.scene.start('MenuScene'));
    botonPantalla(this, w / 2 + 130, yb, 200, 34, '¡A jugar!' + (modoTactil() ? '' : ' (Enter)'), 0x9ccc65,
      () => this.jugar(this.indice));

    // Teclado
    this.cursors = this.input.keyboard.createCursorKeys();
    this.teclaA = this.input.keyboard.addKey('A');
    this.teclaD = this.input.keyboard.addKey('D');
    this.teclaEnter = this.input.keyboard.addKey('ENTER');
    this.teclaEspacio = this.input.keyboard.addKey('SPACE');
    this.teclaEsc = this.input.keyboard.addKey('ESC');
    const nombresTeclas = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    this.teclas = this.mapas.map((_, i) => this.input.keyboard.addKey(nombresTeclas[i]));
  }

  update() {
    const J = Phaser.Input.Keyboard.JustDown;
    if (J(this.cursors.left) || J(this.teclaA)) this.mover(-1);
    if (J(this.cursors.right) || J(this.teclaD)) this.mover(1);
    if (J(this.teclaEnter) || J(this.teclaEspacio)) this.jugar(this.indice);
    if (J(this.teclaEsc)) this.scene.start('MenuScene');
    this.teclas.forEach((t, i) => { if (J(t)) this.jugar(i); });
  }

  mover(paso) {
    const n = this.mapas.length;
    let i = this.indice;
    for (let k = 0; k < n; k++) { // salta los bloqueados
      i = (i + paso + n) % n;
      if (this.mapas[i].desbloqueado !== false) break;
    }
    this.marcar(i);
  }

  // Marca la carta elegida (borde amarillo y un poco más grande)
  marcar(i) {
    this.indice = i;
    this.cartas.forEach((c, k) => {
      const elegida = k === i;
      c.fondo.setStrokeStyle(elegida ? 4 : 3, elegida ? 0xf2d64b : 0x888899);
      c.flecha.setVisible(elegida);
    });
  }

  jugar(i) {
    const mapa = this.mapas[i];
    if (!mapa || this.empezando) return;
    if (mapa.desbloqueado === false) return; // por ahora todos vienen desbloqueados
    this.empezando = true;
    guardarMapaElegido(mapa.id);
    this.scene.start('GameScene', { raza: this.razaId, mapa: mapa.id });
  }

  crearCartas() {
    const w = this.scale.width;
    const n = this.mapas.length;
    const separacion = Math.min(300, (w - 20) / n);
    const ancho = separacion - 16;
    const alto = 360;
    const arriba = 96;
    const inicioX = w / 2 - ((n - 1) * separacion) / 2;
    const anchoTexto = ancho - 20;
    this.cartas = [];

    this.mapas.forEach((mapa, i) => {
      const cx = inicioX + i * separacion;
      const cfg = CONFIG.MAPAS[mapa.id];
      const bloqueado = mapa.desbloqueado === false;

      const fondo = this.add.rectangle(cx, arriba + alto / 2, ancho, alto, 0x2b2b3a).setStrokeStyle(3, 0x888899)
        .setInteractive({ useHandCursor: !bloqueado });
      fondo.on('pointerover', () => { if (!bloqueado && !modoTactil()) this.marcar(i); });
      fondo.on('pointerdown', () => this.jugar(i));
      const flecha = this.add.text(cx, arriba - 4, '▼', {
        fontFamily: FUENTE, fontSize: '18px', color: '#f2d64b'
      }).setOrigin(0.5, 1);

      if (!modoTactil()) {
        this.add.text(cx - ancho / 2 + 8, arriba + 6, '[' + (i + 1) + ']', { fontFamily: FUENTE, fontSize: '14px', color: '#aaaaaa' });
      }

      // Miniatura del mapa (el mapa real, visto desde arriba)
      const anchoMini = ancho - 24;
      const altoMini = Math.round(anchoMini * 0.56);
      const yMini = arriba + 28;
      const g = this.add.graphics();
      dibujarMiniaturaMapa(g, mapa.id, cx - anchoMini / 2, yMini, anchoMini, altoMini);
      if (bloqueado) g.fillStyle(0x000000, 0.6).fillRect(cx - anchoMini / 2, yMini, anchoMini, altoMini);

      // Textos
      let y = yMini + altoMini + 8;
      const poner = (texto, estilo, espacio) => {
        const t = this.add.text(cx, y, texto, {
          fontFamily: FUENTE, align: 'center', wordWrap: { width: anchoTexto }, ...estilo
        }).setOrigin(0.5, 0);
        y += t.height + espacio;
        return t;
      };
      poner(mapa.nombre + (bloqueado ? '  🔒' : ''), { fontSize: '22px', color: '#ffe082', fontStyle: 'bold' }, 4);
      poner(mapa.descripcion, { fontSize: '13px', color: '#ffffff', fontStyle: 'italic' }, 6);
      poner('Obstáculos: ' + mapa.obstaculos.join(', '), { fontSize: '12px', color: '#cfd8dc' }, 2);
      poner('Tamaño: ' + cfg.ANCHO + ' × ' + cfg.ALTO, { fontSize: '12px', color: '#9e9e9e' }, 6);

      // Ultra raros de este mapa (silueta si no lo has encontrado)
      const lista = listaColeccionables(mapa.id);
      poner('✦ Ultra raros: ' + cuantosEncontrados(mapa.id) + ' / ' + lista.length, {
        fontSize: '13px', color: '#f8bbd0', fontStyle: 'bold'
      }, 2);
      const maxIconos = Math.floor((ancho - 20) / 22);
      const mostrar = lista.slice(0, maxIconos);
      const x0 = cx - ((mostrar.length - 1) * 22) / 2;
      mostrar.forEach((c, k) => {
        const icono = this.add.image(x0 + k * 22, y + 10, claveColeccionable(c.id), 0).setScale(1.25);
        if (copiasColeccionable(c.id) <= 0) icono.setTintFill(0x000000).setAlpha(0.6);
      });

      this.cartas.push({ fondo, flecha });
    });
  }
}
