// ===============================================================
//  CÓMO JUGAR (v0.34): 8 cartas, una a la vez, para los jugadores nuevos.
//  Sale sola la primera vez (portada -> Cómo jugar -> menú). Al terminarlas
//  o saltarlas se guarda TUTORIAL_CLAVE = '1' y ya no sale sola.
//  Desde el menú se abre con el botón "Cómo jugar" (o la tecla I en PC).
//  PC: Enter o clic en la carta = siguiente, Esc = saltar, flechas = moverse.
//  Celular: se tocan los botones. Los textos cambian según modoTactil().
//  Si cambia una tecla o un número del juego, revisa los textos de aquí abajo.
// ===============================================================

const TUTORIAL_CLAVE = 'lomitoSurvivor_tutorial';

// ¿Ya vio (o saltó) las cartas?
function tutorialVisto() {
  try { return localStorage.getItem(TUTORIAL_CLAVE) === '1'; } catch (err) { return true; } // sin almacenamiento: no molestar
}
function marcarTutorialVisto() {
  try { localStorage.setItem(TUTORIAL_CLAVE, '1'); } catch (err) { /* sin almacenamiento */ }
}

// Hora del reloj en que llega el Jefe (por ejemplo "05:12")
function horaJefeTutorial() {
  return horaDeLaNoche(Math.min(CONFIG.JEFE.MINUTO * 60000, duracionNocheMs()));
}

// Las 8 cartas. t = true en celular. Cada carta: { titulo, iconos, lineas: [[texto, color]] }
// iconos: claves de dibujos (perros: 'raza:<id>'); si alguno no existe, no se dibuja.
function cartasComoJugar(t) {
  const blanco = '#ffffff';
  const verde = '#9ccc65';
  const amarillo = '#ffe082';
  const rojo = '#ef9a9a';
  const celeste = '#81d4fa';
  const N = CONFIG.NOCHE;
  const hora = (h) => String(h).padStart(2, '0') + ':00';
  const fases = N.FASES.map((f) => f.NOMBRE).join(' → ');
  const coopTecla = CONFIG.COOP.TECLA_MENU;
  return [
    {
      titulo: 'La noche',
      iconos: ['jefe'],
      lineas: [
        ['El reloj parte a las ' + hora(N.HORA_INICIO) + ' y hay que llegar a las ' + hora(N.HORA_FIN) +
          ' (' + N.DURACION_MINUTOS + ' minutos de juego).', blanco],
        ['Al minuto ' + CONFIG.JEFE.MINUTO + ' (las ' + horaJefeTutorial() + ' en el reloj) aparece el Jefe de la Plaza.', amarillo],
        ['Para ganar tienes que llegar a las ' + hora(N.HORA_FIN) + ' y además derrotar al Jefe.', verde]
      ]
    },
    {
      titulo: 'Moverse y morder',
      iconos: ['raza:quiltro'],
      lineas: [
        [t ? 'Muévete con el joystick: toca y arrastra en la mitad izquierda de la pantalla.'
          : 'Muévete con WASD o con las flechas.', blanco],
        ['Tu perro muerde solo cuando hay un enemigo cerca.', verde],
        ['La barra verde de arriba es tu vida (se pone roja cuando queda poca).', rojo]
      ]
    },
    {
      titulo: 'Elige tu raza',
      iconos: ['raza:quiltro', 'raza:pitbull', 'raza:galgo', 'raza:beagle', 'raza:chowchow', 'raza:grandanes'],
      lineas: [
        [(t ? 'Toca' : 'Haz clic en') + ' una carta para elegir. Después eliges el mapa.', blanco],
        ['Quiltro: equilibrado. "Calle" es pasivo: te curas de a poco.', amarillo],
        ['Pitbull: más vida y mordida fuerte, pero lento. La Mandíbula de hierro se carga sola ' +
          '(cada ' + (CONFIG.RAZAS.pitbull.PODER_ESPERA_MS / 1000) + ' s) y la siguiente mordida aturde.', amarillo],
        ['Galgo: rapidísimo pero frágil. Sprint con ' + (t ? 'el botón SPRINT' : 'Espacio') + '.', amarillo],
        ['Beagle: atrae huesos desde lejos y marca con flechas a los enemigos que no se ven.', amarillo],
        ['Chow chow: lento pero duro, recibe menos daño. Ruge con ' + (t ? 'el botón RUGIR' : 'Espacio') +
          ' y los enemigos cercanos huyen.', amarillo],
        ['Gran danés: gigante y fácil de golpear. Su sombra (pasiva) frena a los enemigos que tiene delante.', amarillo]
      ]
    },
    {
      titulo: 'Huesos y cartas',
      iconos: ['hueso'],
      lineas: [
        ['Los enemigos sueltan huesos que llenan la barra celeste.', celeste],
        ['Al subir de nivel eliges 1 de 3 cartas (' + (t ? 'tócala' : 'clic o teclas 1, 2, 3') + ').', amarillo],
        ['A veces cae un objeto al suelo: pásale por encima para tomarlo.', verde]
      ]
    },
    {
      titulo: 'Curarse y pausar',
      iconos: ['sopaipilla', 'pan'],
      lineas: [
        ['Come sopaipillas o pan del suelo para curarte.', verde],
        ['En La plaza, quédate pegado a la pileta del centro y te cura.', celeste],
        [t ? 'Pausa con el botón II (arriba a la derecha).' : 'Pausa con P o Esc.', blanco]
      ]
    },
    {
      titulo: 'Peligros de la noche',
      iconos: ['perrera', 'nuevo_tipoR', 'nuevo_limpiavidrios', 'nuevo_cuchilla', 'nuevo_perrera', 'nuevo_tripa_seca'],
      lineas: [
        ['La noche se pone más difícil por fases: ' + fases + '.', blanco],
        ['El curao al volante (aviso rojo) y la jauría (carril amarillo): ¡sal del camino!', rojo],
        ['La Perrera no pega, pero te deja quieto un momento.', amarillo],
        ['El Borracho tira botellas de lejos y pega botellazos de cerca: muévete cuando levante la botella.', rojo],
        ['Después llegan otros: el Limpiavidrios y su perro te mojan y te dejan lento (Plaza y Terminal); ' +
          'El Malandra corta con su cuchilla, aléjate cuando brille el filo (Feria); ' +
          'el Personal de la Perrera tira una red y llama perros con el silbato; ' +
          'y El Tripa Seca es un mini jefe de brazos largos.', amarillo]
      ]
    },
    {
      titulo: 'Cuenta, ranking y cooperativo',
      iconos: ['raza:pitbull', 'raza:galgo'],
      lineas: [
        ['Entra con Google y elige un apodo para quedar en el Ranking. Sin sesión, el puntaje no se guarda.', celeste],
        [t ? 'El cooperativo local es para PC (teclado o control).'
          : 'Cooperativo local: en el menú presiona ' + coopTecla + '. Cada jugador elige su raza. ' +
            'J1 juega con WASD + Espacio y J2 con flechas + Enter (o un control).', verde],
        ['Si tu compañero cae, quédate cerca ' + CONFIG.COOP.REVIVIR_SEGUNDOS + ' segundos para revivirlo.', amarillo],
        ['Las partidas en cooperativo todavía no van al ranking.', '#b0bec5']
      ]
    },
    {
      titulo: 'Entre partidas',
      iconos: ['hueso', 'raza:beagle'],
      lineas: [
        ['Empiezas en La plaza. Sobrevive una noche para desbloquear la Terminal de buses, ' +
          'y una noche en la Terminal para la Feria libre.', blanco],
        ['Los huesitos se guardan y se usan en el Árbol' + (t ? '' : ' (G)') +
          ' y en el Rincón de apuestas' + (t ? '' : ' (B)') + '.', amarillo],
        ['El Álbum' + (t ? '' : ' (A)') + ' guarda los ultra raros que encuentres.', '#ce93d8'],
        ['Elige tu raza y a cuidar la plaza.', verde]
      ]
    }
  ];
}

class ComoJugarScene extends Phaser.Scene {
  constructor() {
    super('ComoJugarScene');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const e = margenExtra();
    this.tactil = modoTactil();
    this.cartas = cartasComoJugar(this.tactil);
    this.indice = 0;
    this.capaCarta = [];
    this.capaBotones = [];
    this.saliendo = false;
    crearSprites(this);
    if (typeof crearSpritesNuevos === 'function') crearSpritesNuevos(this);
    if (typeof crearTexturasComunes === 'function') crearTexturasComunes(this); // sopaipilla y pan (src/mapa.js)
    this.anims.resumeAll();

    this.add.text(w / 2, 30 + e / 2, 'Cómo jugar', {
      fontFamily: FUENTE, fontSize: '30px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // La carta (mismo estilo que las cartas de raza del menú)
    this.carta = { x: w / 2, y: 252, ancho: Math.min(640, w - 40 - 2 * e), alto: 360 };
    const c = this.carta;
    this.fondoCarta = this.add.rectangle(c.x, c.y, c.ancho, c.alto, 0x2b2b3a).setStrokeStyle(3, 0xf2d64b);
    if (!this.tactil) {
      // En PC, un clic en la carta avanza (en celular solo los botones)
      this.fondoCarta.setInteractive({ useHandCursor: true });
      this.fondoCarta.on('pointerdown', () => this.siguiente());
    }

    this.textoContador = this.add.text(w / 2, c.y + c.alto / 2 + 18, '', {
      fontFamily: FUENTE, fontSize: '16px', color: '#b0bec5', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.yBotones = h - 30 - e / 2;

    if (!this.tactil) {
      this.add.text(w / 2, c.y + c.alto / 2 + 38, 'Enter o clic: siguiente  ·  Esc: saltar', {
        fontFamily: FUENTE, fontSize: '12px', color: '#888888'
      }).setOrigin(0.5);
      const k = this.input.keyboard;
      k.on('keydown-ENTER', () => this.siguiente());
      k.on('keydown-ESC', () => this.terminar());
      k.on('keydown-RIGHT', () => this.siguiente());
      k.on('keydown-LEFT', () => this.anterior());
    }

    this.mostrar();
    this.cameras.main.fadeIn(200, 0, 0, 0);
  }

  mostrar() {
    this.capaCarta.forEach((o) => o.destroy());
    this.capaBotones.forEach((o) => o.destroy());
    this.capaCarta = [];
    this.capaBotones = [];
    const datos = this.cartas[this.indice];
    const c = this.carta;
    const arriba = c.y - c.alto / 2;
    const anchoTexto = c.ancho - 50;

    // Dibujos arriba de la carta
    const iconos = datos.iconos.filter((id) => (id.startsWith('raza:') ? !!CONFIG.RAZAS[id.slice(5)] : this.textures.exists(id)));
    const sep = 74;
    iconos.forEach((id, i) => {
      const x = c.x + (i - (iconos.length - 1) / 2) * sep;
      const y = arriba + 44;
      let obj;
      if (id.startsWith('raza:')) {
        obj = dibujarPerro(this, x, y, id.slice(5));
      } else {
        obj = this.add.sprite(x, y, id, 0);
        const alto = obj.height || 16;
        obj.setScale(Math.max(1, Math.min(ESCALA_PIXEL, 56 / alto)));
        if (id === 'jefe') obj.setScale(ESCALA_PIXEL * 1.1);
        if (this.anims.exists(id + '_idle')) obj.play(id + '_idle');
      }
      this.capaCarta.push(obj);
    });

    let y = arriba + 88;
    const titulo = this.add.text(c.x, y, datos.titulo, {
      fontFamily: FUENTE, fontSize: '24px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.capaCarta.push(titulo);
    y += titulo.height + 12;

    // Las cartas largas usan letra un poco más chica para caber
    const largo = datos.lineas.reduce((s, l) => s + l[0].length, 0);
    const tam = largo > 420 ? 16 : 18;
    datos.lineas.forEach(([texto, color]) => {
      const t = this.add.text(c.x, y, texto, {
        fontFamily: FUENTE, fontSize: tam + 'px', color, align: 'center', wordWrap: { width: anchoTexto }
      }).setOrigin(0.5, 0);
      this.capaCarta.push(t);
      y += t.height + (tam <= 16 ? 7 : 10);
    });

    const n = this.cartas.length;
    this.textoContador.setText('Carta ' + (this.indice + 1) + ' de ' + n);

    // Botones: Anterior (desde la 2), Saltar y Siguiente / ¡A jugar!
    const w = this.scale.width;
    const yb = this.yBotones;
    if (this.indice > 0) {
      this.capaBotones.push(...botonPantalla(this, w / 2 - 210, yb, 170, 40, '◀ Anterior', 0x90caf9, () => this.anterior()));
    }
    this.capaBotones.push(...botonPantalla(this, w / 2, yb, 150, 40, 'Saltar', 0xb0bec5, () => this.terminar()));
    const ultima = this.indice === n - 1;
    this.capaBotones.push(...botonPantalla(this, w / 2 + 210, yb, 170, 40, ultima ? '¡A jugar!' : 'Siguiente ▶',
      ultima ? 0x9ccc65 : 0xf2d64b, () => this.siguiente()));
  }

  siguiente() {
    if (this.saliendo) return;
    if (this.indice >= this.cartas.length - 1) {
      this.terminar();
      return;
    }
    this.indice++;
    this.mostrar();
  }

  anterior() {
    if (this.saliendo || this.indice === 0) return;
    this.indice--;
    this.mostrar();
  }

  // Saltar o "¡A jugar!": ya no sale sola y vuelve al menú
  terminar() {
    if (this.saliendo) return;
    this.saliendo = true;
    marcarTutorialVisto();
    this.cameras.main.fadeOut(200, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }
}
