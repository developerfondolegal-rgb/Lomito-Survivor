// ===============================================================
//  RINCÓN DE APUESTAS
//  Se abre en dos momentos:
//   - modo 'fase': al cambiar de fase la noche. La partida queda
//     congelada detrás y solo se apuestan los huesitos de la partida.
//     "Seguir jugando" (Esc) vuelve a la partida justo donde estaba.
//   - modo 'fin': al terminar la partida (tecla M en la pantalla final).
//     Se apuesta el total guardado o 1 copia de un coleccionable.
//     "Salir" (Esc) va a la pantalla de inicio.
//
//  Los pagos y probabilidades están en src/config.js, sección APUESTAS
//  (ahí está calculado el valor esperado de cada juego).
//  Los huesitos están en src/huesitos.js; los coleccionables, en
//  src/coleccionables.js. (marcoPixel viene de src/pausa.js; FUENTE, de MenuScene.js)
// ===============================================================

// ---------------- Dibujos (mismo formato que src/sprites.js) ----------------
// Dado de 12 x 12 píxeles: 6 cuadros, uno por cara (cuadro 0 = cara 1).
//  K = borde, W = blanco, G = sombra, P = punto negro, R = punto rojo (la cara 1)
const SPRITE_DADO = {
  colores: { G: 0xb8b8c8, P: 0x1b1b1b },
  cuadros: [
    [ // 1
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWRRWWWWK',
      'KWWWWRRWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KGGGGGGGGGGK',
      '.KKKKKKKKKK.'
    ],
    [ // 2
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWWWWWWWPPWK',
      'KWWWWWWWPPWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWPPWWWWWWWK',
      'KWPPWWWWWWWK',
      'KGGGGGGGGGGK',
      '.KKKKKKKKKK.'
    ],
    [ // 3
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWWWWWWWPPWK',
      'KWWWWWWWPPWK',
      'KWWWWWWWWWWK',
      'KWWWWPPWWWWK',
      'KWWWWPPWWWWK',
      'KWWWWWWWWWWK',
      'KWPPWWWWWWWK',
      'KWPPWWWWWWWK',
      'KGGGGGGGGGGK',
      '.KKKKKKKKKK.'
    ],
    [ // 4
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KGGGGGGGGGGK',
      '.KKKKKKKKKK.'
    ],
    [ // 5
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KWWWWWWWWWWK',
      'KWWWWPPWWWWK',
      'KWWWWPPWWWWK',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KGGGGGGGGGGK',
      '.KKKKKKKKKK.'
    ],
    [ // 6
      '.KKKKKKKKKK.',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KWWWWWWWWWWK',
      'KWPPWWWWPPWK',
      'KWPPWWWWPPWK',
      'KGGGGGGGGGGK',
      '.KKKKKKKKKK.'
    ]
  ]
};

// El gato que salta a la mesa en "Bajo o alto" (16 x 16)
//  O = naranjo, Y = ojos, N = nariz
const SPRITE_GATO = {
  colores: { O: 0xf29b38, Y: 0xc6ff00, N: 0xf48fb1 },
  cuadros: [
    [
      '................',
      '..K.......K.....',
      '.KOK.....KOK....',
      '.KOOKKKKKOOK....',
      '.KOOOOOOOOOK....',
      '.KOYKOOOYKOK....',
      '.KOOOONOOOOK....',
      '..KOOOOOOOK.....',
      '..KOOOOOOOOOK.K.',
      '..KOWWOOOOOOKKOK',
      '..KOWWOOOOOOOOK.',
      '..KOOOOOOOOOOK..',
      '..KOOOOOOOOOK...',
      '..KOK.KOK.KOK...',
      '..KK..KK..KK....',
      '................'
    ]
  ]
};

// Los tres juegos (los números están en CONFIG.APUESTAS)
const JUEGOS_APUESTA = [
  { id: 'exacto', nombre: 'Número exacto', texto: 'Elige del 1 al 6. Se tira 1 dado.', pago: () => CONFIG.APUESTAS.EXACTO_PAGO },
  { id: 'maquina', nombre: 'Contra la máquina', texto: '2 dados cada uno. Gana la suma\nmás alta. Empate: gana la máquina.', pago: () => CONFIG.APUESTAS.MAQUINA_PAGO },
  { id: 'bajoalto', nombre: 'Bajo o alto', texto: 'Bajo (1-2-3) o alto (4-5-6).\nCuidado con el gato...', pago: () => CONFIG.APUESTAS.BAJO_ALTO_PAGO }
];

const MENSAJES_GATO = [
  '¡El gato saltó a la mesa y botó el dado! Pierdes la apuesta.',
  '¡Miau! El gato se sentó encima del dado. La casa gana.',
  'El gato se llevó el dado en la boca. Nadie se atreve a pedírselo.',
  '¡El gato pasó corriendo y tiró todo! Pierdes, pero fue muy tierno.'
];

function tirarDado() {
  return Phaser.Math.Between(1, 6);
}

// Número con decimales en español: 1.8 -> "1,8"
function numeroApuesta(n) {
  return String(Math.round(n * 100) / 100).replace('.', ',');
}

class ApuestasScene extends Phaser.Scene {
  constructor() {
    super('ApuestasScene');
  }

  init(datos) {
    this.modo = datos && datos.modo === 'fase' ? 'fase' : 'fin';
  }

  create() {
    const A = CONFIG.APUESTAS;
    this.anims.resumeAll(); // por si venimos de la pantalla final (animaciones en pausa)
    if (!this.textures.exists('dado')) crearTexturaPixel(this, 'dado', SPRITE_DADO);
    if (!this.textures.exists('gato_mesa')) crearTexturaPixel(this, 'gato_mesa', SPRITE_GATO);
    crearTexturasColeccionables(this);

    this.juego = 0;                       // índice en JUEGOS_APUESTA
    this.numeroElegido = 6;               // Número exacto
    this.alto = true;                     // Bajo o alto: true = alto
    this.apostarColeccionable = false;    // modo fin: false = huesitos guardados, true = 1 copia
    this.colIndice = 0;                   // coleccionable elegido
    this.monto = A.MINIMO;
    this.tirando = false;
    this.huboTirada = false;              // después de la primera tirada ya no se muestra la pantalla vacía
    this.capa = [];                       // todo lo que se redibuja
    this.dados = [];                      // imágenes de los dados en la mesa
    this.mensaje = { texto: '', color: '#ffffff' };

    this.add.rectangle(480, 270, 960, 540, 0x000000, this.modo === 'fase' ? 0.72 : 1).setInteractive();
    const g = this.add.graphics();
    marcoPixel(g, 20, 8, 920, 524, 0xf2d64b, 0x1d1b2e);

    // Mesa verde donde caen los dados
    this.mesa = { x: 180, y: 318, ancho: 600, alto: 100 };
    const mesa = this.add.graphics();
    mesa.fillStyle(0x0b3d2a, 1);
    mesa.fillRect(this.mesa.x, this.mesa.y, this.mesa.ancho, this.mesa.alto);
    mesa.lineStyle(4, 0x6d4c2f, 1);
    mesa.strokeRect(this.mesa.x, this.mesa.y, this.mesa.ancho, this.mesa.alto);

    const teclado = this.input.keyboard;
    this.teclas = {
      izq: teclado.addKey('LEFT'), der: teclado.addKey('RIGHT'),
      arriba: teclado.addKey('UP'), abajo: teclado.addKey('DOWN'),
      uno: teclado.addKey('ONE'), dos: teclado.addKey('TWO'), tres: teclado.addKey('THREE'),
      tab: teclado.addKey('TAB'), espacio: teclado.addKey('SPACE'), enter: teclado.addKey('ENTER'),
      esc: teclado.addKey('ESC')
    };

    this.ajustarMonto();
    if (this.modo === 'fin' && this.disponibleHuesitos() < A.MINIMO && coleccionablesQueTienes().length > 0) {
      this.apostarColeccionable = true; // sin huesitos: se parte en coleccionables
    }
    this.dibujar();
  }

  update() {
    const t = this.teclas;
    const just = (k) => Phaser.Input.Keyboard.JustDown(k);
    if (just(t.esc)) { this.salir(); return; }
    if (this.tirando) return;
    if (just(t.uno)) this.elegirJuego(0);
    if (just(t.dos)) this.elegirJuego(1);
    if (just(t.tres)) this.elegirJuego(2);
    if (just(t.tab)) this.cambiarQueApostar();
    if (just(t.izq)) this.cambiarMonto(-1);
    if (just(t.der)) this.cambiarMonto(1);
    if (just(t.arriba)) this.cambiarEleccion(1);
    if (just(t.abajo)) this.cambiarEleccion(-1);
    if (just(t.espacio) || just(t.enter)) this.tirar();
  }

  // ---------------- Saldo ----------------

  escenaJuego() {
    return this.scene.get('GameScene');
  }

  // Huesitos que se pueden apostar ahora
  disponibleHuesitos() {
    return this.modo === 'fase' ? huesitosDePartida(this.escenaJuego()) : huesitosGuardados();
  }

  // Cambia el saldo de huesitos (y guarda al instante)
  cambiarSaldo(cambio) {
    if (this.modo === 'fase') this.escenaJuego().huesitosApuestas += cambio;
    else sumarHuesitos(cambio);
  }

  coleccionableElegido() {
    const lista = coleccionablesQueTienes();
    if (lista.length === 0) return null;
    this.colIndice = Phaser.Math.Clamp(this.colIndice, 0, lista.length - 1);
    return lista[this.colIndice];
  }

  // ¿Hay algo para apostar con lo elegido?
  puedeApostar() {
    if (this.apostarColeccionable) return this.coleccionableElegido() !== null;
    return this.disponibleHuesitos() >= CONFIG.APUESTAS.MINIMO;
  }

  // ¿Hay algo para apostar en este rincón?
  hayAlgo() {
    if (this.disponibleHuesitos() >= CONFIG.APUESTAS.MINIMO) return true;
    return this.modo === 'fin' && coleccionablesQueTienes().length > 0;
  }

  // El monto queda entre el mínimo y el máximo, y nunca más de lo que tienes
  ajustarMonto() {
    const A = CONFIG.APUESTAS;
    const tope = Math.min(A.MAXIMO, this.disponibleHuesitos());
    this.monto = Math.max(A.MINIMO, Math.min(this.monto, tope));
  }

  // ---------------- Controles ----------------

  elegirJuego(i) {
    if (this.tirando || i === this.juego) return;
    this.juego = i;
    this.limpiarMesa();
    this.mensaje = { texto: '', color: '#ffffff' };
    this.dibujar();
  }

  cambiarQueApostar() {
    if (this.tirando || this.modo !== 'fin') return;
    if (!this.apostarColeccionable && coleccionablesQueTienes().length === 0) return;
    this.apostarColeccionable = !this.apostarColeccionable;
    this.dibujar();
  }

  // Flechas izquierda / derecha: el monto o el coleccionable
  cambiarMonto(paso) {
    if (this.tirando) return;
    if (this.apostarColeccionable) {
      const n = coleccionablesQueTienes().length;
      if (n > 0) this.colIndice = (this.colIndice + paso + n) % n;
    } else {
      this.monto += paso * CONFIG.APUESTAS.PASO;
      this.ajustarMonto();
    }
    this.dibujar();
  }

  // Flechas arriba / abajo: el número (Número exacto) o bajo/alto
  cambiarEleccion(paso) {
    if (this.tirando) return;
    const id = JUEGOS_APUESTA[this.juego].id;
    if (id === 'exacto') this.numeroElegido = ((this.numeroElegido - 1 + paso + 6) % 6) + 1;
    else if (id === 'bajoalto') this.alto = !this.alto;
    else return;
    this.dibujar();
  }

  salir() {
    this.tweens.killAll();
    if (this.modo === 'fase') {
      this.scene.resume('GameScene'); // la partida sigue justo donde estaba
      this.scene.stop();
    } else {
      this.scene.start('MenuScene');
    }
  }

  // ---------------- Dibujo ----------------

  texto(x, y, t, tam, color, extra) {
    const obj = this.add.text(x, y, t, { fontFamily: FUENTE, fontSize: tam + 'px', color, ...extra });
    this.capa.push(obj);
    return obj;
  }

  boton(cx, cy, ancho, alto, texto, color, activo, alHacerClic, tam) {
    const g = this.add.graphics();
    const pintar = (encima) => {
      g.clear();
      const borde = !activo ? 0x55556a : encima ? 0xffffff : color;
      marcoPixel(g, cx - ancho / 2, cy - alto / 2, ancho, alto, borde, encima && activo ? 0x4a3a2a : 0x2b2333);
    };
    pintar(false);
    const etiqueta = this.add.text(cx, cy, texto, {
      fontFamily: FUENTE, fontSize: (tam || 16) + 'px', color: activo ? colorTextoCol(color) : '#77778a',
      fontStyle: 'bold', align: 'center'
    }).setOrigin(0.5);
    this.capa.push(g, etiqueta);
    if (activo) {
      const zona = this.add.zone(cx, cy, ancho, alto).setInteractive({ useHandCursor: true });
      zona.on('pointerover', () => pintar(true));
      zona.on('pointerout', () => pintar(false));
      zona.on('pointerdown', () => { if (!this.tirando) alHacerClic(); });
      this.capa.push(zona);
    }
  }

  dibujar() {
    this.capa.forEach((o) => o.destroy());
    this.capa = [];
    const A = CONFIG.APUESTAS;
    const cx = 480;
    this.ajustarMonto();
    if (this.apostarColeccionable && !this.coleccionableElegido()) this.apostarColeccionable = false;

    this.texto(cx, 22, 'Rincón de apuestas', 28, '#ffe082', { fontStyle: 'bold' }).setOrigin(0.5, 0);
    const saldo = this.modo === 'fase'
      ? 'Huesitos de la partida: ' + this.disponibleHuesitos() + '   (solo se apuestan estos)'
      : 'Huesitos guardados: ' + huesitosGuardados();
    this.texto(cx, 60, saldo, 17, '#f2d64b', { fontStyle: 'bold' }).setOrigin(0.5, 0);

    const esc = modoTactil() ? '' : ' (Esc)'; // en celular no se muestran las teclas
    const textoSalir = (this.modo === 'fase' ? 'Seguir jugando' : 'Salir') + esc;

    // Nada que apostar: solo se puede salir
    if (!this.hayAlgo() && !this.huboTirada) {
      this.limpiarMesa();
      this.texto(cx, 200, 'Vuelve cuando tengas huesitos', 30, '#ffcc80', { fontStyle: 'bold' }).setOrigin(0.5);
      this.texto(cx, 245, 'La apuesta mínima es de ' + A.MINIMO + ' huesitos.', 16, '#cfd8dc').setOrigin(0.5);
      this.boton(cx, 470, 260, 40, textoSalir, 0xffd54f, true, () => this.salir(), 18);
      return;
    }

    // Modo fin: ¿huesitos o coleccionable? (Tab)
    let y = 96;
    if (this.modo === 'fin') {
      const tieneCol = coleccionablesQueTienes().length > 0;
      this.boton(cx - 150, y, 280, 30, 'Huesitos guardados', 0xf2d64b, true,
        () => { this.apostarColeccionable = false; this.dibujar(); }, 15);
      this.boton(cx + 150, y, 280, 30, tieneCol ? '1 copia de un coleccionable' : 'Sin coleccionables', 0xce93d8, tieneCol,
        () => { this.apostarColeccionable = true; this.dibujar(); }, 15);
      if (this.apostarColeccionable) this.marcarElegido(cx + 150, y, 280, 30, 0xce93d8);
      else this.marcarElegido(cx - 150, y, 280, 30, 0xf2d64b);
      if (!modoTactil()) this.texto(cx, y + 18, 'Tab: cambiar', 11, '#9e9e9e').setOrigin(0.5, 0);
    } else {
      this.texto(cx, y, 'La noche cambió de fase. ¿Una apuestita antes de seguir?', 15, '#b3e5fc').setOrigin(0.5);
    }

    // Los tres juegos (teclas 1, 2, 3)
    y = 168;
    JUEGOS_APUESTA.forEach((j, i) => {
      const x = cx + (i - 1) * 296;
      const elegido = i === this.juego;
      const g = this.add.graphics();
      marcoPixel(g, x - 140, y - 38, 280, 76, elegido ? 0xffd54f : 0x666680, elegido ? 0x3a3020 : 0x24223a);
      this.capa.push(g);
      this.texto(x, y - 30, '[' + (i + 1) + '] ' + j.nombre + '  ·  paga x' + numeroApuesta(j.pago()), 15,
        elegido ? '#ffd54f' : '#dddddd', { fontStyle: 'bold' }).setOrigin(0.5, 0);
      this.texto(x, y - 8, j.texto, 12, '#cfd8dc', { align: 'center' }).setOrigin(0.5, 0);
      const zona = this.add.zone(x, y, 280, 76).setInteractive({ useHandCursor: true });
      zona.on('pointerdown', () => this.elegirJuego(i));
      this.capa.push(zona);
    });

    // Tu elección (flechas arriba / abajo o clic)
    y = 236;
    const id = JUEGOS_APUESTA[this.juego].id;
    if (id === 'exacto') {
      this.texto(cx - 300, y, modoTactil() ? 'Tu número:' : 'Tu número (↑ ↓):', 15, '#ffffff').setOrigin(0, 0.5);
      for (let n = 1; n <= 6; n++) {
        const bx = cx - 110 + (n - 1) * 52;
        this.boton(bx, y, 44, 32, String(n), 0xffd54f, true, () => { this.numeroElegido = n; this.dibujar(); }, 17);
        if (n === this.numeroElegido) this.marcarElegido(bx, y, 44, 32, 0xffd54f);
      }
    } else if (id === 'bajoalto') {
      this.texto(cx - 300, y, modoTactil() ? 'Tu elección:' : 'Tu elección (↑ ↓):', 15, '#ffffff').setOrigin(0, 0.5);
      this.boton(cx - 40, y, 170, 32, 'Bajo (1-2-3)', 0x81d4fa, true, () => { this.alto = false; this.dibujar(); });
      this.boton(cx + 150, y, 170, 32, 'Alto (4-5-6)', 0xff8a65, true, () => { this.alto = true; this.dibujar(); });
      if (this.alto) this.marcarElegido(cx + 150, y, 170, 32, 0xff8a65);
      else this.marcarElegido(cx - 40, y, 170, 32, 0x81d4fa);
    } else {
      this.texto(cx, y, 'Tú tiras 2 dados (izquierda) y la máquina 2 dados (derecha).', 15, '#ffffff').setOrigin(0.5);
    }

    // Cuánto apuestas (flechas izquierda / derecha)
    y = 284;
    if (this.apostarColeccionable) {
      const c = this.coleccionableElegido();
      const info = infoColeccionable(c.id);
      const extra = this.copiasSiGanas();
      this.boton(cx - 300, y, 44, 38, '◀', 0xce93d8, true, () => this.cambiarMonto(-1));
      this.boton(cx + 300, y, 44, 38, '▶', 0xce93d8, true, () => this.cambiarMonto(1));
      const icono = this.add.image(cx - 250, y, claveColeccionable(c.id), 0).setScale(2);
      this.capa.push(icono);
      this.texto(cx - 225, y, 'Apuestas 1 copia de ' + c.nombre + '  (tienes ' + info.copias + ', Nv ' + info.nivel + ')' +
        '\nSi ganas: +' + extra + (extra === 1 ? ' copia' : ' copias') + '  ·  Si pierdes: −1 copia', 13, '#f3e5f5').setOrigin(0, 0.5);
    } else if (this.disponibleHuesitos() >= A.MINIMO) {
      // − y + cambian el monto (también las flechas izquierda / derecha)
      this.boton(cx - 140, y, 52, 38, '−', 0xf2d64b, true, () => this.cambiarMonto(-1), 22);
      this.boton(cx + 140, y, 52, 38, '+', 0xf2d64b, true, () => this.cambiarMonto(1), 22);
      this.texto(cx, y - 8, 'Apuestas: ' + this.monto + ' huesitos', 18, '#f2d64b', { fontStyle: 'bold' }).setOrigin(0.5);
      const premio = Math.floor(this.monto * JUEGOS_APUESTA[this.juego].pago());
      this.texto(cx, y + 12, 'Si ganas recibes ' + premio + ' (mín ' + A.MINIMO + ', máx ' +
        Math.min(A.MAXIMO, this.disponibleHuesitos()) + ')', 12, '#cfd8dc').setOrigin(0.5);
    } else {
      this.texto(cx, y, 'Vuelve cuando tengas huesitos (mínimo ' + A.MINIMO + ')', 17, '#ffcc80', { fontStyle: 'bold' }).setOrigin(0.5);
    }

    // Etiquetas de la mesa
    if (id === 'maquina') {
      this.texto(this.mesa.x + 150, this.mesa.y + 4, 'Tú', 13, '#c5e1a5', { fontStyle: 'bold' }).setOrigin(0.5, 0);
      this.texto(this.mesa.x + 450, this.mesa.y + 4, 'Máquina', 13, '#ef9a9a', { fontStyle: 'bold' }).setOrigin(0.5, 0);
    }

    // Mensaje del resultado
    this.textoMensaje = this.texto(cx, 443, this.mensaje.texto, 17, this.mensaje.color,
      { fontStyle: 'bold', align: 'center', wordWrap: { width: 840 }, stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);

    // Botones de abajo
    this.boton(cx - 150, 490, 260, 40, 'Tirar' + (modoTactil() ? '' : ' (Espacio)'), 0x9ccc65, this.puedeApostar(), () => this.tirar(), 18);
    this.boton(cx + 150, 490, 260, 40, textoSalir, 0xffd54f, true, () => this.salir(), 18);
    if (!modoTactil()) this.texto(cx, 516, '1-2-3: juego  ·  ↑ ↓: elección  ·  ← →: ' + (this.apostarColeccionable ? 'coleccionable' : 'monto') +
      (this.modo === 'fin' ? '  ·  Tab: huesitos o coleccionable' : ''), 11, '#9e9e9e').setOrigin(0.5, 0);
  }

  // Recuadro brillante alrededor de lo elegido
  marcarElegido(cx, cy, ancho, alto, color) {
    const g = this.add.graphics();
    g.lineStyle(3, color, 1);
    g.strokeRect(cx - ancho / 2 - 4, cy - alto / 2 - 4, ancho + 8, alto + 8);
    this.capa.push(g);
  }

  // Copias extra si ganas con un coleccionable: (pago − 1) hacia abajo, mínimo 1
  copiasSiGanas() {
    return Math.max(1, Math.floor(JUEGOS_APUESTA[this.juego].pago() - 1));
  }

  limpiarMesa() {
    this.dados.forEach((d) => { this.tweens.killTweensOf(d); d.destroy(); });
    this.dados = [];
  }

  // ---------------- La tirada ----------------

  tirar() {
    if (this.tirando || !this.puedeApostar()) return;
    const A = CONFIG.APUESTAS;
    const juego = JUEGOS_APUESTA[this.juego];

    // 1) Se decide el resultado
    const r = { tuyos: [], maquina: [], gato: false, gana: false };
    if (juego.id === 'exacto') {
      r.tuyos = [tirarDado()];
      r.gana = r.tuyos[0] === this.numeroElegido;
    } else if (juego.id === 'maquina') {
      r.tuyos = [tirarDado(), tirarDado()];
      r.maquina = [tirarDado(), tirarDado()];
      r.gana = r.tuyos[0] + r.tuyos[1] > r.maquina[0] + r.maquina[1]; // empate: gana la máquina
    } else {
      r.tuyos = [tirarDado()];
      r.gato = Math.random() < A.GATO_PROBABILIDAD;
      r.gana = !r.gato && (r.tuyos[0] >= 4) === this.alto;
    }

    // 2) Se guarda el saldo AL INSTANTE (antes de la animación)
    if (this.apostarColeccionable) {
      const c = this.coleccionableElegido();
      const cambio = cambiarCopiasColeccionable(c.id, r.gana ? this.copiasSiGanas() : -1);
      r.premio = { col: c, cambio };
    } else {
      const ganancia = r.gana ? Math.floor(this.monto * juego.pago()) - this.monto : -this.monto;
      this.cambiarSaldo(ganancia);
      r.premio = { ganancia };
    }

    // 3) Animación de los dados
    this.tirando = true;
    this.huboTirada = true;
    this.mensaje = { texto: 'Rodando...', color: '#ffffff' };
    this.dibujar();
    this.limpiarMesa();
    const m = this.mesa;
    const posiciones = juego.id === 'maquina'
      ? [m.x + 115, m.x + 185, m.x + 415, m.x + 485]
      : [m.x + m.ancho / 2];
    const caras = r.tuyos.concat(r.maquina);
    posiciones.forEach((x, i) => {
      const dado = this.add.image(x, m.y + m.alto / 2 + 6, 'dado', Phaser.Math.Between(0, 5)).setScale(4);
      if (juego.id === 'maquina' && i >= 2) dado.setTint(0xffcdd2); // los de la máquina, rojizos
      this.dados.push(dado);
      this.tweens.add({ targets: dado, angle: { from: -25, to: 25 }, y: dado.y - 10, duration: 110, yoyo: true, repeat: -1 });
    });
    const cambiarCaras = this.time.addEvent({
      delay: 70, loop: true,
      callback: () => this.dados.forEach((d) => d.setFrame(Phaser.Math.Between(0, 5)))
    });

    this.time.delayedCall(A.DADO_MS, () => {
      cambiarCaras.remove();
      this.dados.forEach((d, i) => {
        this.tweens.killTweensOf(d);
        d.setAngle(0).setY(m.y + m.alto / 2 + 6).setFrame(caras[i] - 1);
        this.tweens.add({ targets: d, scale: 4.6, duration: 90, yoyo: true });
      });
      if (r.gato) this.saltaElGato(() => this.mostrarResultado(r));
      else this.mostrarResultado(r);
    });
  }

  // El gato cruza la mesa de un salto y bota el dado
  saltaElGato(alTerminar) {
    const m = this.mesa;
    const dado = this.dados[0];
    const gato = this.add.image(m.x - 40, m.y + 20, 'gato_mesa', 0).setScale(4).setDepth(5);
    this.dados.push(gato); // se limpia junto con los dados
    this.tweens.add({ targets: gato, x: dado.x, duration: 380, ease: 'Sine.easeOut' });
    this.tweens.add({
      targets: gato, y: m.y - 50, duration: 190, yoyo: true, ease: 'Sine.easeOut',
      onComplete: () => {
        this.cameras.main.shake(180, 0.008);
        this.tweens.add({ targets: dado, x: dado.x + 260, y: dado.y + 90, angle: 540, alpha: 0, duration: 520 });
        this.tweens.add({ targets: gato, x: m.x + m.ancho + 60, y: m.y - 30, alpha: 0, delay: 350, duration: 500 });
        this.time.delayedCall(450, alTerminar);
      }
    });
  }

  mostrarResultado(r) {
    const juego = JUEGOS_APUESTA[this.juego];
    const suma = (l) => l.reduce((a, b) => a + b, 0);
    let detalle = '';
    if (juego.id === 'exacto') detalle = 'Salió ' + r.tuyos[0] + ' (elegiste ' + this.numeroElegido + '). ';
    else if (juego.id === 'maquina') detalle = 'Tú: ' + suma(r.tuyos) + '  ·  Máquina: ' + suma(r.maquina) +
      (suma(r.tuyos) === suma(r.maquina) ? ' (empate: gana la máquina). ' : '. ');
    else if (!r.gato) detalle = 'Salió ' + r.tuyos[0] + ' (' + (r.tuyos[0] >= 4 ? 'alto' : 'bajo') + '). ';

    let resultado;
    if (r.premio.col) {
      const c = r.premio.col;
      const { antes, despues } = r.premio.cambio;
      const cambioNivel = despues.nivel !== antes.nivel ? ' ¡Nivel ' + antes.nivel + ' → ' + despues.nivel + '!' : '';
      resultado = r.gana
        ? '¡Ganaste! ' + c.nombre + ': +' + (despues.copias - antes.copias) + ' copias.' + cambioNivel
        : 'Perdiste 1 copia de ' + c.nombre + '.' + cambioNivel + (despues.copias === 0 ? ' Ya no lo tienes.' : '');
    } else {
      resultado = r.gana
        ? '¡Ganaste ' + r.premio.ganancia + ' huesitos!'
        : 'Perdiste ' + (-r.premio.ganancia) + ' huesitos.';
    }

    if (r.gato) {
      this.mensaje = { texto: Phaser.Utils.Array.GetRandom(MENSAJES_GATO) + '\n' + resultado, color: '#ffab91' };
    } else {
      this.mensaje = { texto: detalle + resultado, color: r.gana ? '#b9f6ca' : '#ff8a80' };
    }

    // Reacción: destello verde si ganas, temblor rojo si pierdes
    if (r.gana) {
      this.cameras.main.flash(250, 80, 200, 100);
      this.dados.forEach((d, i) => { if (juego.id !== 'maquina' || i < 2) d.setTint(0xb9f6ca); });
    } else {
      this.cameras.main.shake(260, 0.012);
      this.dados.forEach((d, i) => { if (juego.id !== 'maquina' || i < 2) d.setTint(0xff8a80); });
    }

    this.tirando = false;
    this.dibujar();
    this.tweens.add({ targets: this.textoMensaje, scale: { from: 1.25, to: 1 }, duration: 250, ease: 'Back.easeOut' });
  }
}
