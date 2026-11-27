// Pantalla para elegir el mapa (aparece después de elegir la raza).
// Flechas ← → para moverse, Enter o Espacio para jugar, teclas 1, 2, 3...
// para elegir directo, Esc para volver. Con el mouse: clic en un mapa.
// En celular: toca un mapa.
// Los mapas bloqueados se ven con candado y dicen qué hay que hacer (src/mapas.js).
// Tecla de prueba U: desbloquea todos los mapas (esas partidas no van al ranking).
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
    this.razaJ2 = (datos && datos.razaJ2) || null; // v0.28: raza de J2 (solo en cooperativo)
    this.avisoInicial = (datos && datos.aviso) || '';
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
    // v0.28: en cooperativo se muestran las dos razas ("J1: Pitbull · J2: Galgo")
    const raza2 = this.razaJ2 && RAZAS.find((r) => r.id === this.razaJ2);
    const razas = raza2 ? 'J1: ' + (raza ? raza.nombre : this.razaId) + '  ·  J2: ' + raza2.nombre + '  ·  '
      : (raza ? raza.nombre + '  ·  ' : '');
    this.add.text(w / 2, 70, razas + como, {
      fontFamily: FUENTE, fontSize: '16px', color: '#dddddd'
    }).setOrigin(0.5);

    this.crearCartas();
    this.marcar(this.indice);

    // Aviso abajo (por ejemplo, al tocar un mapa bloqueado)
    this.textoAviso = this.add.text(w / 2, h - 62 - e / 2, '', {
      fontFamily: FUENTE, fontSize: '15px', color: '#ffab91', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
    if (!modoTactil() && this.mapas.some((m) => !mapaDesbloqueado(m.id))) {
      this.add.text(w - 10, 6, 'Prueba: U desbloquea todos los mapas (no van al ranking)', {
        fontFamily: FUENTE, fontSize: '11px', color: '#777777'
      }).setOrigin(1, 0);
    }

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
    this.teclaU = this.input.keyboard.addKey('U'); // prueba: desbloquear todos los mapas
    const nombresTeclas = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    this.teclas = this.mapas.map((_, i) => this.input.keyboard.addKey(nombresTeclas[i]));
    if (this.avisoInicial) this.avisar(this.avisoInicial, '#ffcc80');
  }

  avisar(texto, color) {
    this.tweens.killTweensOf(this.textoAviso);
    this.textoAviso.setText(texto).setColor(color || '#ffab91').setAlpha(1);
    this.tweens.add({ targets: this.textoAviso, alpha: 0, delay: 2600, duration: 600 });
  }

  update() {
    const J = Phaser.Input.Keyboard.JustDown;
    if (J(this.cursors.left) || J(this.teclaA)) this.mover(-1);
    if (J(this.cursors.right) || J(this.teclaD)) this.mover(1);
    if (J(this.teclaEnter) || J(this.teclaEspacio)) this.jugar(this.indice);
    if (J(this.teclaEsc)) this.scene.start('MenuScene');
    if (J(this.teclaU) && this.mapas.some((m) => !mapaDesbloqueado(m.id))) {
      desbloquearTodosPrueba();
      this.scene.restart({ ...this.datosRazas(), aviso: 'Prueba: todos los mapas desbloqueados (no van al ranking)' });
      return;
    }
    this.teclas.forEach((t, i) => { if (J(t)) this.jugar(i); });
  }

  mover(paso) {
    const n = this.mapas.length;
    let i = this.indice;
    for (let k = 0; k < n; k++) { // salta los bloqueados
      i = (i + paso + n) % n;
      if (mapaDesbloqueado(this.mapas[i].id)) break;
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
    if (!mapaDesbloqueado(mapa.id)) { // bloqueado: dice qué hay que hacer
      this.avisar('🔒 ' + mapa.nombre + ': ' + textoDesbloqueo(mapa.id) + ' para desbloquearlo');
      this.cameras.main.shake(120, 0.004);
      return;
    }
    this.empezando = true;
    guardarMapaElegido(mapa.id);
    this.scene.start('GameScene', { ...this.datosRazas(), mapa: mapa.id });
  }

  // { raza } en 1 jugador; { raza, razaJ2 } en cooperativo (v0.28)
  datosRazas() {
    return this.razaJ2 ? { raza: this.razaId, razaJ2: this.razaJ2 } : { raza: this.razaId };
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
      const bloqueado = !mapaDesbloqueado(mapa.id);

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
      if (bloqueado) {
        g.fillStyle(0x000000, 0.7).fillRect(cx - anchoMini / 2, yMini, anchoMini, altoMini);
        dibujarCandado(g, cx, yMini + altoMini / 2 + 6);
      }

      // Textos
      let y = yMini + altoMini + 8;
      const poner = (texto, estilo, espacio) => {
        const t = this.add.text(cx, y, texto, {
          fontFamily: FUENTE, align: 'center', wordWrap: { width: anchoTexto }, ...estilo
        }).setOrigin(0.5, 0);
        y += t.height + espacio;
        return t;
      };
      poner(mapa.nombre, { fontSize: '22px', color: bloqueado ? '#9e9e9e' : '#ffe082', fontStyle: 'bold' }, 4);
      if (bloqueado) {
        poner('BLOQUEADO: ' + textoDesbloqueo(mapa.id) + ' para desbloquearlo',
          { fontSize: '13px', color: '#ffab91', fontStyle: 'bold' }, 6);
      } else {
        poner(mapa.descripcion, { fontSize: '13px', color: '#ffffff', fontStyle: 'italic' }, 6);
      }
      const dif = dificultadMapa(mapa.id);
      const nivelDif = Math.max(dif.VIDA, dif.DANO, dif.CANTIDAD);
      poner('Dificultad: ' + (nivelDif <= 1 ? 'normal' : '×' + numeroPausa(nivelDif, 2)),
        { fontSize: '12px', color: nivelDif >= 1.5 ? '#ff8a80' : nivelDif > 1 ? '#ffcc80' : '#c5e1a5', fontStyle: 'bold' }, 2);
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

// Candado dorado de pixel art (mapas bloqueados)
function dibujarCandado(g, x, y) {
  g.lineStyle(6, 0x000000, 1);
  g.beginPath();
  g.arc(x, y - 8, 12, Math.PI, 0, false);
  g.strokePath();
  g.lineStyle(4, 0xffd54f, 1);
  g.beginPath();
  g.arc(x, y - 8, 12, Math.PI, 0, false);
  g.strokePath();
  g.fillStyle(0x000000, 1).fillRect(x - 19, y - 10, 38, 30);
  g.fillStyle(0xffd54f, 1).fillRect(x - 17, y - 8, 34, 26);
  g.fillStyle(0xc49a00, 1).fillRect(x - 17, y + 12, 34, 6);
  g.fillStyle(0x000000, 1).fillRect(x - 3, y - 2, 6, 6).fillRect(x - 1, y + 3, 2, 8);
}
