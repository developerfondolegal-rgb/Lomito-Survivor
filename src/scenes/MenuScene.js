// Pantalla de inicio: elegir la raza del perro (después se elige el mapa en
// src/scenes/MapaScene.js) (y abrir el Álbum de coleccionables,
// el Árbol de habilidades, el Rincón de apuestas y el Ranking).
// Arriba a la derecha: entrar con Google / salir y el apodo (src/online.js).
// Arriba a la izquierda se ven los huesitos guardados (src/huesitos.js).

const FUENTE = 'Arial, sans-serif';

// Dibuja un perro en pixel art. v0.23: las razas jugables usan los sprites
// nuevos de 32 x 32 (src/razas_sprites.js, escala 2, empieza quieto: idle).
// Si la raza no tiene sprite nuevo, usa el dibujo viejo (src/sprites.js) o
// uno por defecto pintado con su COLOR.
// La usan la pantalla de inicio y la escena de juego.
function dibujarPerro(escena, x, y, razaId) {
  crearSpritesRazas(escena);
  const nueva = claveSpriteRaza(razaId);
  if (nueva) return escena.add.sprite(x, y, nueva, 0).setScale(RAZAS_SPRITE_ESCALA).play(nueva + '_idle');
  const clave = claveSprite(razaId, SPRITE_PERRO_POR_DEFECTO);
  const perro = agregarSprite(escena, x, y, clave);
  if (clave !== razaId && CONFIG.RAZAS[razaId]) perro.setTint(CONFIG.RAZAS[razaId].COLOR);
  return perro;
}

class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const w = this.scale.width;
    const e = margenExtra(); // en celular, todo lo de las esquinas se aleja un poco más del borde (0 en PC)
    this.margenExtra = e;
    crearSprites(this);
    this.anims.resumeAll(); // por si venimos de un Game Over (animaciones en pausa)

    this.add.text(w / 2, 50, 'Lomito Survivor', {
      fontFamily: FUENTE, fontSize: '48px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5);

    // v0.26.1: la raza se elige solo con clic / toque (la tecla 2 es para el cooperativo)
    // v0.28: en cooperativo eligen los dos, primero J1 y después J2 (ver elegir)
    this.razaJ1 = null;           // raza que ya eligió J1 (cooperativo)
    this.marcasRaza = [];         // marcas "P1" / "P2" sobre las cartas
    this.textoTitulo = this.add.text(w / 2, 95, '', {
      fontFamily: FUENTE, fontSize: '18px', color: '#dddddd'
    }).setOrigin(0.5);

    this.add.text(w - 10 - e, this.scale.height - 8 - e, 'Lomito Survivor - v' + VERSION_JUEGO, {
      fontFamily: FUENTE, fontSize: '13px', color: '#888888'
    }).setOrigin(1, 1);

    this.crearCartas();
    this.crearBotonAlbum();
    this.dibujarTitulo();

    // Botones de abajo: Álbum, Árbol y Rincón (dejan libre la esquina de la versión)
    const yBotones = this.scale.height - 26 - e / 2;
    // Árbol de habilidades por raza (src/scenes/ArbolScene.js)
    botonPantalla(this, w / 2 - 20, yBotones, 196, 34, 'Árbol' + (modoTactil() ? '' : ' (G)'),
      0x9ccc65, () => this.scene.start('ArbolScene'));
    // Rincón de apuestas con los huesitos guardados (src/scenes/ApuestasScene.js)
    botonPantalla(this, w / 2 + 186, yBotones, 196, 34, 'Rincón de apuestas' + (modoTactil() ? '' : ' (B)'),
      0xf2d64b, () => this.scene.start('ApuestasScene', { modo: 'fin' }), 15);

    // Celular: botón de pantalla completa (src/tactil.js). No se muestra si ya se abrió
    // como app desde la pantalla de inicio. En iPhone no se puede: muestra cómo agregarlo a inicio.
    if (modoTactil() && !esModoApp()) {
      const bx = w - 96 - e;
      const by = 28 + e / 2;
      botonPantalla(this, bx, by, 172, 34, '⛶ Pantalla completa', 0x90caf9, () => {
        alternarPantallaCompleta(() => avisoBreve(this, w - 190 - e, by + 40, AVISO_IPHONE));
      }, 15);
    }

    // Ranking online (src/scenes/RankingScene.js), abajo a la izquierda
    botonPantalla(this, 14 + e + 62, yBotones, 124, 34, 'Ranking' + (modoTactil() ? '' : ' (L)'),
      0x4fc3f7, () => this.scene.start('RankingScene'), 15);

    // v0.34: "Cómo jugar" (src/scenes/ComoJugarScene.js), justo sobre las cartas: a la derecha
    // (a la izquierda está el texto del cooperativo). En celular con el botón de pantalla completa
    // la cuenta baja hasta ahí, así que va a la izquierda (en celular el texto del coop es corto).
    const comoJugarIzq = modoTactil() && !esModoApp();
    const xComoJugar = comoJugarIzq ? 14 + e + 75 : w - 10 - e - 75;
    botonPantalla(this, xComoJugar, 114 + e / 2, 150, 28, 'Cómo jugar' + (modoTactil() ? '' : ' (I)'),
      0xffcc80, () => this.scene.start('ComoJugarScene'), 15);

    // Cuenta: "Entrar con Google" / "Salir" y el apodo (se redibuja cuando cambia la sesión)
    this.capaCuenta = [];
    this.dibujarCuenta();
    const desuscribir = alCambiarOnline(() => this.dibujarCuenta());
    this.events.once('shutdown', desuscribir);

    // Huesitos guardados (la moneda del juego)
    this.textoHuesitos = this.add.text(14 + e, 12 + e / 2, '', {
      fontFamily: FUENTE, fontSize: '18px', color: '#f2d64b', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    });
    this.actualizarHuesitos();

    // v0.26: cooperativo local (src/coop.js). En PC se activa con la tecla COOP.TECLA_MENU
    // o tocando el texto; en celular sin control solo se avisa que existe en PC.
    this.capaCoop = [];
    this.coopPermitidoAntes = coopPermitido();
    this.dibujarCoop();
    this.teclaCoop = this.input.keyboard.addKey(nombreTeclaPhaser(CONFIG.COOP.TECLA_MENU));
    this.capaAvisoSesion = []; // ventana "¿Jugar sin guardar?" (v0.26)

    this.teclaAlbum = this.input.keyboard.addKey('A');
    this.teclaRincon = this.input.keyboard.addKey('B');
    this.teclaArbol = this.input.keyboard.addKey('G');
    this.teclaH = this.input.keyboard.addKey('H'); // modo de prueba: +100 huesitos guardados
    this.teclaRanking = this.input.keyboard.addKey('L');
    this.teclaApodo = this.input.keyboard.addKey('N'); // cambiar apodo (con sesión)
    this.teclaComoJugar = this.input.keyboard.addKey('I'); // v0.34: cartas "Cómo jugar"
  }

  // Línea del cooperativo, arriba a la izquierda debajo de los huesitos (v0.26)
  dibujarCoop() {
    this.capaCoop.forEach((o) => o.destroy());
    this.capaCoop = [];
    const x = 14 + this.margenExtra;
    const y = 38 + this.margenExtra / 2;
    const estilo = (color) => ({
      fontFamily: FUENTE, fontSize: '13px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
      wordWrap: { width: 250 }
    });
    if (!coopPermitido()) {
      // Celular / tablet sin control: solo informativo (no hace nada al tocarlo)
      this.capaCoop.push(this.add.text(x, y, '🎮 Jugar COOP local en PC (teclado o control)', estilo('#90caf9')));
      return;
    }
    const activo = coopActivo();
    const tecla = CONFIG.COOP.TECLA_MENU;
    const texto = activo
      ? '👥 COOP: 2 jugadores (' + (modoTactil() ? 'toca aquí' : 'presiona ' + tecla) + ' para quitar)\n' +
        (modoTactil() ? 'P1: joystick · P2: control' : 'P1: WASD + Espacio · P2: flechas + Enter o control')
      : '👤 1 jugador · ' + (modoTactil() ? 'Toca aquí' : 'Presiona ' + tecla) + ' para COOP local';
    const t = this.add.text(x, y, texto, estilo(activo ? '#9ccc65' : '#b0bec5')).setInteractive({ useHandCursor: true });
    t.on('pointerdown', () => this.cambiarCoop());
    this.capaCoop.push(t);
  }

  cambiarCoop() {
    if (this.capaAvisoSesion.length > 0) return;
    alternarCoop();
    this.dibujarCoop();
    this.reiniciarEleccion(); // v0.28: si se apaga (o prende) a mitad de la elección, se empieza de nuevo
  }

  // v0.28: título de arriba de las cartas. 1 jugador: como siempre.
  // Cooperativo: "Jugador 1 elige su raza" y después "Jugador 2 elige su raza"
  dibujarTitulo() {
    if (!coopActivo()) {
      const como = modoTactil() ? 'toca una carta para empezar' : 'haz clic en una carta';
      this.textoTitulo.setText('Elige tu raza (' + como + ')').setColor('#dddddd');
      return;
    }
    const comoCoop = modoTactil() ? 'toca una carta' : 'haz clic en una carta';
    if (!this.razaJ1) {
      this.textoTitulo.setText('Jugador 1 elige su raza (' + comoCoop + ')').setColor(colorTextoJugador(1));
    } else {
      this.textoTitulo.setText('Jugador 2 elige su raza  ·  J1: ' + this.razaJ1.nombre)
        .setColor(colorTextoJugador(2));
    }
  }

  // v0.28: borra lo elegido y vuelve a "Jugador 1 elige" (o a 1 jugador)
  reiniciarEleccion() {
    this.razaJ1 = null;
    this.marcasRaza.forEach((o) => o.destroy());
    this.marcasRaza = [];
    this.dibujarTitulo();
  }

  // v0.28: marco y "P1" / "P2" en la carta elegida (P1 a la izquierda, P2 a la derecha,
  // así se ven las dos si eligen la misma raza)
  marcarRaza(indice, n) {
    const c = this.posCartas[indice];
    const color = n === 2 ? CONFIG.COOP.COLOR_J2 : CONFIG.COOP.COLOR_J1;
    const extra = n === 2 ? 16 : 8;
    const marco = this.add.rectangle(c.x, c.y, c.ancho + extra, c.alto + extra).setStrokeStyle(4, color);
    const lado = n === 2 ? 1 : -1;
    const t = this.add.text(c.x + lado * (c.ancho / 2 - 8), c.arriba + 8, 'P' + n, {
      fontFamily: FUENTE, fontSize: '18px', color: colorTextoJugador(n), fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(n === 2 ? 1 : 0, 0);
    this.marcasRaza.push(marco, t);
  }

  // Aviso de cuenta: sin sesión el puntaje no se guarda (v0.26)
  sinSesion() {
    return onlineDisponible() && !ONLINE.cargando && !ONLINE.usuario;
  }

  // Arriba a la derecha (en celular, debajo del botón de pantalla completa)
  dibujarCuenta() {
    this.capaCuenta.forEach((o) => o.destroy());
    this.capaCuenta = [];
    const capa = this.capaCuenta;

    // v0.26: sin sesión, aviso llamativo arriba de las cartas de raza (donde se elige para jugar)
    if (this.sinSesion()) {
      capa.push(this.add.text(this.scale.width / 2, 117, '⚠ Inicia sesión con Google para guardar tu puntaje en el ranking', {
        fontFamily: FUENTE, fontSize: '14px', color: '#ffd54f', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5));
    }
    const e = this.margenExtra;
    const derecha = this.scale.width - 10 - e;
    const ancho = 172;
    const cx = this.scale.width - 96 - e;
    const cy = (modoTactil() && !esModoApp() ? 70 : 28) + e / 2; // en celular el de arriba es pantalla completa
    const texto = (t, y, color) => {
      const obj = this.add.text(derecha, y, t, {
        fontFamily: FUENTE, fontSize: '14px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(1, 0.5);
      capa.push(obj);
      return obj;
    };

    if (!onlineDisponible()) {
      texto(TEXTO_SOLO_ONLINE.replace(' en la', '\nen la'), cy, '#9e9e9e').setAlign('right'); // en 2 líneas para no tocar el título
      return;
    }
    if (ONLINE.cargando) {
      texto('Conectando...', cy, '#9e9e9e');
      return;
    }
    if (!ONLINE.usuario) {
      capa.push(...botonPantalla(this, cx, cy, ancho, 34, 'Entrar con Google', 0x81d4fa, () => {
        entrarConGoogle().catch((err) => avisoBreve(this, this.scale.width / 2, 120, 'No se pudo entrar: ' + mensajeError(err)));
      }, 15));
      return;
    }
    if (ONLINE.apodo) {
      // "Cambiar apodo" y "Salir" en la misma fila (no bajan hasta las cartas)
      const anchoSalir = 84;
      const anchoCambiar = 150;
      capa.push(...botonPantalla(this, derecha - anchoSalir / 2, cy, anchoSalir, 34, 'Salir', 0xef9a9a, () => salirOnline(), 15));
      capa.push(...botonPantalla(this, derecha - anchoSalir - 10 - anchoCambiar / 2, cy, anchoCambiar, 34,
        'Cambiar apodo' + (modoTactil() ? '' : ' (N)'), 0x9ccc65, () => pedirApodo(true), 14));
      texto('★ ' + ONLINE.apodo, cy + 28, '#ffe082');
      return;
    }
    capa.push(...botonPantalla(this, cx, cy, ancho, 34, 'Salir', 0xef9a9a, () => salirOnline(), 15));
    if (ONLINE.apodoCargado) {
      // Primera vez: hay que elegir apodo
      const t = texto('Elegir apodo', cy + 28, '#9ccc65').setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => pedirApodo());
      pedirApodo();
    } else {
      texto('...', cy + 28, '#9e9e9e');
    }
  }

  actualizarHuesitos() {
    this.textoHuesitos.setText('Huesitos: ' + huesitosGuardados());
  }

  update(time) {
    // v0.26: si se conecta o desconecta un control, se actualiza la línea del cooperativo
    if (!this.revisarControlEn || time >= this.revisarControlEn) {
      this.revisarControlEn = time + 1000;
      const permitido = coopPermitido();
      if (permitido !== this.coopPermitidoAntes) {
        this.coopPermitidoAntes = permitido;
        this.dibujarCoop();
      }
    }
    // Con la ventana de sesión abierta solo funciona Esc (la cierra)
    if (this.capaAvisoSesion.length > 0) {
      Phaser.Input.Keyboard.JustDown(this.teclaCoop); // no se guarda para después
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ESC'))) {
        this.cerrarAvisoSesion();
        if (coopActivo()) this.reiniciarEleccion(); // cooperativo: se vuelve a elegir desde J1
      }
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.teclaCoop)) this.cambiarCoop();
    if (Phaser.Input.Keyboard.JustDown(this.teclaAlbum)) this.scene.start('AlbumScene');
    if (Phaser.Input.Keyboard.JustDown(this.teclaRincon)) this.scene.start('ApuestasScene', { modo: 'fin' });
    if (Phaser.Input.Keyboard.JustDown(this.teclaArbol)) this.scene.start('ArbolScene');
    if (Phaser.Input.Keyboard.JustDown(this.teclaRanking)) this.scene.start('RankingScene');
    if (Phaser.Input.Keyboard.JustDown(this.teclaApodo)) pedirApodo(true);
    if (Phaser.Input.Keyboard.JustDown(this.teclaComoJugar)) this.scene.start('ComoJugarScene');
    // Modo de prueba: H da huesitos guardados (cuánto, en CONFIG.HUESITOS.PRUEBA_TECLA_H)
    if (Phaser.Input.Keyboard.JustDown(this.teclaH)) {
      sumarHuesitos(CONFIG.HUESITOS.PRUEBA_TECLA_H);
      this.actualizarHuesitos();
      const t = this.add.text(14 + this.margenExtra, 36 + this.margenExtra / 2, '+' + CONFIG.HUESITOS.PRUEBA_TECLA_H + ' (prueba)', {
        fontFamily: FUENTE, fontSize: '15px', color: '#f2d64b', stroke: '#000000', strokeThickness: 3
      });
      this.tweens.add({ targets: t, y: t.y - 10, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }
  }

  // Botón "Álbum" abajo a la izquierda (src/scenes/AlbumScene.js)
  crearBotonAlbum() {
    const cx = this.scale.width / 2 - 226;
    const cy = this.scale.height - 26 - this.margenExtra / 2;
    const ancho = 196;
    const alto = 34;
    const encontrados = cuantosEncontrados() + ' / ' + listaColeccionables().length; // de todos los mapas
    const g = this.add.graphics();
    const pintar = (encima) => {
      g.clear();
      marcoPixel(g, cx - ancho / 2, cy - alto / 2, ancho, alto, encima ? 0xffffff : 0xce93d8, encima ? 0x4a3560 : 0x2a1f3a);
    };
    pintar(false);
    this.add.text(cx, cy, 'Álbum' + (modoTactil() ? '' : ' (A)') + '   ✦ ' + encontrados, {
      fontFamily: FUENTE, fontSize: '15px', color: '#f3e5f5', fontStyle: 'bold'
    }).setOrigin(0.5);
    const zona = this.add.zone(cx, cy, ancho, alto).setInteractive({ useHandCursor: true });
    zona.on('pointerover', () => pintar(true));
    zona.on('pointerout', () => pintar(false));
    zona.on('pointerdown', () => this.scene.start('AlbumScene'));
  }

  // Solo las razas que tienen textos (razas.js) y números (config.js)
  listaRazas() {
    return RAZAS.filter((r) => CONFIG.RAZAS[r.id]).slice(0, 9);
  }

  crearCartas() {
    const w = this.scale.width;
    this.razas = this.listaRazas();
    const n = this.razas.length;
    const separacion = Math.min(230, (w - 20) / n);
    const anchoCarta = separacion - 14;
    const altoCarta = 350;
    const arriba = 135;
    const inicioX = w / 2 - ((n - 1) * separacion) / 2;
    const anchoTexto = anchoCarta - 20;
    this.posCartas = []; // v0.28: para marcar la raza elegida en cooperativo

    this.razas.forEach((raza, i) => {
      const cfg = CONFIG.RAZAS[raza.id];
      const cx = inicioX + i * separacion;
      this.posCartas.push({ x: cx, y: arriba + altoCarta / 2, ancho: anchoCarta, alto: altoCarta, arriba });

      const fondo = this.add.rectangle(cx, arriba + altoCarta / 2, anchoCarta, altoCarta, 0x2b2b3a)
        .setStrokeStyle(3, 0x888899)
        .setInteractive({ useHandCursor: true });
      fondo.on('pointerover', () => fondo.setStrokeStyle(3, 0xf2d64b));
      fondo.on('pointerout', () => fondo.setStrokeStyle(3, 0x888899));
      fondo.on('pointerdown', () => this.elegir(i));


      // El perro corre en su lugar sobre la carta (sprites nuevos v0.23; si no, el dibujo viejo caminando)
      const perroCarta = dibujarPerro(this, cx, arriba + 38, raza.id);
      const animCarta = claveSpriteRaza(raza.id) ? claveSpriteRaza(raza.id) + '_correr' : claveSprite(raza.id, SPRITE_PERRO_POR_DEFECTO) + '_caminar';
      if (this.anims.exists(animCarta)) perroCarta.play(animCarta);

      // Textos apilados uno debajo del otro
      let y = arriba + 68;
      const poner = (texto, estilo, espacio) => {
        const t = this.add.text(cx, y, texto, {
          fontFamily: FUENTE, align: 'center', wordWrap: { width: anchoTexto }, ...estilo
        }).setOrigin(0.5, 0);
        y += t.height + espacio;
      };

      const espera = cfg.PODER_ESPERA_MS > 0
        ? ' (cada ' + (cfg.PODER_ESPERA_MS / 1000) + ' s)'
        : ' (pasivo)';

      poner(raza.nombre, { fontSize: '22px', color: '#ffe082', fontStyle: 'bold' }, 6);
      poner(raza.frase, { fontSize: '14px', color: '#ffffff', fontStyle: 'italic' }, 12);
      poner('+ ' + raza.fortalezas, { fontSize: '14px', color: '#9ccc65' }, 6);
      poner('− ' + raza.debilidades, { fontSize: '14px', color: '#ef9a9a' }, 12);
      poner('Poder: ' + sinTeclas(raza.poder) + espera, { fontSize: '14px', color: '#ffe082', fontStyle: 'bold' }, 4);
      poner(raza.poderTexto, { fontSize: '13px', color: '#dddddd' }, 0);
    });
  }

  elegir(indice) {
    const raza = this.razas[indice];
    if (!raza || this.capaAvisoSesion.length > 0) return;
    let datos = { raza: raza.id };
    // v0.28: cooperativo: el primer clic es la raza de J1; el segundo, la de J2
    if (coopActivo()) {
      if (!this.razaJ1) {
        this.razaJ1 = raza;
        this.marcarRaza(indice, 1);
        this.dibujarTitulo();
        return;
      }
      this.marcarRaza(indice, 2);
      this.textoTitulo.setText('J1: ' + this.razaJ1.nombre + '  ·  J2: ' + raza.nombre).setColor('#9ccc65');
      datos = { raza: this.razaJ1.id, razaJ2: raza.id };
    }
    // v0.26: sin sesión, una vez por sesión del navegador se pregunta si quiere entrar con Google
    // (cooperativo: sale una sola vez, después de que eligieron los dos)
    if (this.sinSesion() && !avisoSesionYaVisto()) {
      marcarAvisoSesionVisto();
      this.mostrarAvisoSesion(datos);
      return;
    }
    this.scene.start('MapaScene', datos); // después se elige el mapa (src/scenes/MapaScene.js)
  }

  // Ventana: "Iniciar sesión con Google" o "Jugar sin guardar" (v0.26)
  // datos: lo que recibe MapaScene ({ raza } o, en cooperativo, { raza, razaJ2 })
  mostrarAvisoSesion(datos) {
    const w = this.scale.width;
    const h = this.scale.height;
    const capa = this.capaAvisoSesion;
    const fondo = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive(); // no deja tocar lo de atrás
    capa.push(fondo);
    const ancho = 520;
    const alto = 210;
    const g = this.add.graphics();
    marcoPixel(g, w / 2 - ancho / 2, h / 2 - alto / 2, ancho, alto, 0xffd54f, 0x2b2333);
    capa.push(g);
    capa.push(this.add.text(w / 2, h / 2 - 70, '⚠ No has iniciado sesión', {
      fontFamily: FUENTE, fontSize: '22px', color: '#ffd54f', fontStyle: 'bold'
    }).setOrigin(0.5));
    capa.push(this.add.text(w / 2, h / 2 - 28, 'Si juegas sin sesión, tu puntaje no se guarda en el ranking.', {
      fontFamily: FUENTE, fontSize: '15px', color: '#ffffff', align: 'center', wordWrap: { width: ancho - 40 }
    }).setOrigin(0.5));
    capa.push(...botonPantalla(this, w / 2 - 125, h / 2 + 45, 230, 38, 'Iniciar sesión con Google', 0x81d4fa, () => {
      entrarConGoogle().catch((err) => avisoBreve(this, w / 2, h / 2 + 120, 'No se pudo entrar: ' + mensajeError(err)));
    }, 15));
    capa.push(...botonPantalla(this, w / 2 + 125, h / 2 + 45, 230, 38, 'Jugar sin guardar', 0x9ccc65, () => {
      this.cerrarAvisoSesion();
      this.scene.start('MapaScene', datos);
    }, 15));
    capa.forEach((o) => o.setDepth(3000));
  }

  cerrarAvisoSesion() {
    this.capaAvisoSesion.forEach((o) => o.destroy());
    this.capaAvisoSesion = [];
  }
}
