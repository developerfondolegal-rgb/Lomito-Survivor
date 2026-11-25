// Escena principal: la plaza donde el perro sobrevive la noche.
// Los números para ajustar el juego están en src/config.js
// Los textos de razas, enemigos e instintos están en src/razas.js,
// src/enemigos.js y src/instintos.js; los objetos, rarezas y fusiones, en src/objetos.js
// (FUENTE y dibujarPerro vienen de MenuScene.js; los dibujos, de src/sprites.js;
//  la plaza, la luz y los obstáculos, de src/mapa.js;
//  el reloj y las fases de la noche, de src/noche.js; el jefe final, de src/jefe.js;
//  las zonas especiales, de src/zonas.js; los mini desafíos, de src/desafios.js;
//  los ultra raros coleccionables, de src/coleccionables.js;
//  los huesitos, de src/huesitos.js; el Rincón de apuestas, de src/scenes/ApuestasScene.js;
//  el joystick y los botones del celular, de src/tactil.js)

const COLOR_ATURDIDO = 0x9575cd; // morado: enemigo aturdido por la Mandíbula de hierro
const COLOR_AVISO = 0xb9f6ca;    // verde claro: aviso de embestida del Drogadicto
const COLOR_JAULA = 0x64b5f6;    // azul: jaula cuando la Perrera te atrapa
const COLOR_HUESO = 0xf2d64b;    // amarillo
const COLOR_XP = 0x4fc3f7;       // celeste
const COLOR_FLECHA = 0xff8a50;   // naranjo: flechas del Rastreo
const COLOR_BLANCO = 0xffffff;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  // Recibe la raza elegida en la pantalla de inicio
  init(datos) {
    const id = datos && datos.raza;
    this.razaId = CONFIG.RAZAS[id] ? id : Object.keys(CONFIG.RAZAS)[0];
  }

  create() {
    // Datos de la raza
    this.base = CONFIG.RAZAS[this.razaId];
    this.textosRaza = RAZAS.find((r) => r.id === this.razaId) || { nombre: this.razaId, poder: '' };
    this.poder = this.base.PODER || '';
    this.poderEsperaTotal = this.base.PODER_ESPERA_MS || 0;
    this.poderCarga = this.poderEsperaTotal; // el poder empieza listo

    // Estado de la partida
    // (Sweater tejido a mano: los coleccionables guardados se aplican desde el inicio)
    this.mapaId = 'plaza';        // mapa actual (los coleccionables dicen a qué mapa pertenecen)
    iniciarArbol(this);           // árbol de habilidades de la raza (src/arbol.js)
    this.vidaMax = this.base.VIDA + bonusColeccion('sweater', 'VIDA') + bonusArbol(this, 'VIDA');
    this.vida = this.vidaMax;
    this.tiempoSobrevivido = 0;   // reloj del juego en ms (se detiene en pausa)
    this.invulnerableHasta = 0;
    this.sprintHasta = 0;
    this.atrapadoHasta = 0;       // la Perrera te deja quieto hasta este momento
    this.ultimaDireccion = new Phaser.Math.Vector2(1, 0);
    this.gameOver = false;
    this.eligiendo = false;       // true mientras se muestran las cartas de instintos
    this.pausado = false;         // true mientras está abierto el menú de pausa (src/pausa.js)
    this.pestanaPausa = 0;        // pestaña del menú de pausa que se muestra
    this.sinergiasActivas = {};   // sinergias ya avisadas (src/sinergias.js)
    this.nivel = 1;
    this.xp = 0;
    this.nivelesPendientes = 0;
    this.derrotados = 0;
    this.derrotadosPorTipo = {};
    this.partidaDePrueba = false; // true si se usó alguna tecla de prueba: no va al ranking (src/online.js)
    Object.keys(CONFIG.ENEMIGOS).forEach((id) => { this.derrotadosPorTipo[id] = 0; });
    iniciarHuesitos(this);        // huesitos de la partida (src/huesitos.js)
    this.esperaMordida = 0;
    this.esperaLadrido = 0;
    this.esperaAparicion = 0;
    this.esperaCura = 0;
    this.cartas = [];
    this.esperaComida = 0;
    this.esperaBasurero = 0;
    this.esperaAgua = 0;

    // Nivel de cada instinto (0 = no lo tiene)
    this.instintos = {};
    INSTINTOS.forEach((inst) => { this.instintos[inst.id] = 0; });

    // Objetos (src/objetos.js): nivel de cada objeto recogido y en qué orden
    this.objetos = {};
    this.inventario = [];
    this.fusiones = {};           // fusiones logradas (id: true)
    this.esperaCaracu = 0;
    this.proximoElite = CONFIG.ELITE_CADA_SEGUNDOS * 1000;
    this.cueroHasta = 0;          // "Cuero de calle" activo hasta este momento
    this.rastro = [];             // huellas de la Estampida
    this.esperaHuella = 0;
    this.esperaGolpeRastro = 0;
    this.rondaPrueba = 0;         // para que la tecla Y saque objetos distintos cada vez

    // La noche (src/noche.js) y el jefe final (src/jefe.js)
    this.faseActual = -1;         // -1 = todavía no se anuncia la primera fase
    this.jefe = null;
    this.jefeAparecido = false;
    this.jefeAparecidoEn = 0;
    this.jefeDerrotado = false;
    this.avisoHoraFin = false;    // ya se avisó que son las 06:00 pero falta el jefe
    this.amaneciendo = false;
    this.amanecerMs = 0;          // cuánto lleva el amanecer
    this.oscuridadAlAmanecer = 0; // qué tan oscuro estaba cuando empezó a amanecer

    // Por si venimos de un Game Over (la física y las animaciones quedaron en pausa)
    this.physics.resume();
    crearSprites(this);
    crearTexturasObjetos(this);
    this.anims.resumeAll();
    this.tweens.resumeAll();      // por si venimos del menú de pausa

    // Mapa y cámara
    this.physics.world.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.cameras.main.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.plaza = crearPlaza(this); // suelo, pileta, bancas, árboles, autos... (src/mapa.js)

    // El perro (dibujo de su raza; el choque usa el RADIO de config.js)
    const inicio = this.plaza.buscarLibre(this.plaza.inicio.x, this.plaza.inicio.y, this.base.RADIO + 10);
    this.perro = dibujarPerro(this, inicio.x, inicio.y, this.razaId);
    this.physics.add.existing(this.perro);
    ponerChoqueCircular(this.perro, this.base.RADIO);
    this.perro.body.setCollideWorldBounds(true);
    this.perro.setDepth(10);
    this.cameras.main.startFollow(this.perro, true, 0.1, 0.1);

    // Enemigos
    this.enemigos = this.physics.add.group();
    this.physics.add.collider(this.enemigos, this.enemigos); // que no se amontonen en uno solo
    this.physics.add.overlap(this.perro, this.enemigos, this.recibirGolpe, null, this);

    // Los obstáculos (bancas, árboles, pileta, basureros, autos) no se pueden atravesar
    this.physics.add.collider(this.perro, this.plaza.obstaculos);
    this.physics.add.collider(this.enemigos, this.plaza.obstaculos, this.chocarObstaculo, null, this);

    // Huesos y comida
    this.huesos = this.add.group();
    this.comidas = this.add.group();
    this.objetosSuelo = this.add.group(); // objetos con rareza tirados en el suelo

    // Noche: todo oscuro menos cerca de los faroles y del perro
    this.oscuridad = crearOscuridad(this);

    // Flechas del Rastreo (Beagle)
    this.flechas = this.add.graphics().setScrollFactor(0).setDepth(900);

    // Líneas de aviso del Drogadicto y jaula de la Perrera
    this.avisos = this.add.graphics().setDepth(4);
    this.jaula = this.add.graphics().setDepth(12);
    this.escudo = this.add.graphics().setDepth(11); // anillo del "Cuero de calle"
    // Avisos de ataque del jefe (encima de la oscuridad para que se vean siempre)
    this.avisosJefe = this.add.graphics().setDepth(801);
    // Luz anaranjada del amanecer (empieza invisible)
    this.luzAmanecer = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0xffb74d, 0)
      .setOrigin(0).setScrollFactor(0).setDepth(802);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.teclaR = this.input.keyboard.addKey('R');
    this.teclaM = this.input.keyboard.addKey('M');
    this.teclaEspacio = this.input.keyboard.addKey('SPACE');
    this.teclaT = this.input.keyboard.addKey('T'); // modo de prueba: enemigos
    this.teclaY = this.input.keyboard.addKey('Y'); // modo de prueba: objetos
    this.teclaU = this.input.keyboard.addKey('U'); // modo de prueba: +5 niveles
    this.teclaJ = this.input.keyboard.addKey('J'); // modo de prueba: aparece el jefe
    this.teclaK = this.input.keyboard.addKey('K'); // modo de prueba: el reloj salta 1 minuto
    this.teclaZ = this.input.keyboard.addKey('Z'); // modo de prueba: una zona de cada tipo
    this.teclaX = this.input.keyboard.addKey('X'); // modo de prueba: empieza un desafío al azar
    this.teclaC = this.input.keyboard.addKey('C'); // modo de prueba: un ultra raro coleccionable
    this.teclaP = this.input.keyboard.addKey('P');   // menú de pausa
    this.teclaEsc = this.input.keyboard.addKey('ESC'); // menú de pausa
    this.teclasCartas = [
      this.input.keyboard.addKey('ONE'),
      this.input.keyboard.addKey('TWO'),
      this.input.keyboard.addKey('THREE')
    ];

    this.crearHUD();

    // Celular: joystick y botones Sprint / Pausa (src/tactil.js). En PC no aparece nada.
    crearControlesTactiles(this);
    this.cuadro = 0;              // contador de cuadros (para redibujar la oscuridad menos seguido en celular)

    // Zonas especiales (src/zonas.js) y mini desafíos (src/desafios.js)
    iniciarZonas(this);
    iniciarDesafios(this);

    // Ultra raros coleccionables (src/coleccionables.js): peluche, etc.
    iniciarColeccionables(this);
  }

  update(time, delta) {
    actualizarControlesTactiles(this); // joystick y botones del celular (o los esconde)

    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.teclaR)) {
        this.scene.restart({ raza: this.razaId }); // misma raza
      } else if (Phaser.Input.Keyboard.JustDown(this.teclaM)) {
        // Rincón de apuestas (src/scenes/ApuestasScene.js) y de ahí al inicio
        if (CONFIG.APUESTAS.EN_FIN_DE_PARTIDA) this.scene.start('ApuestasScene', { modo: 'fin' });
        else this.scene.start('MenuScene');        // volver al inicio
      }
      return;
    }

    // Menú de pausa (src/pausa.js): P o Esc lo abren y lo cierran.
    // Se leen las dos teclas siempre, para que no queden "guardadas" mientras salen las cartas.
    const teclaPausa = Phaser.Input.Keyboard.JustDown(this.teclaP);
    const teclaEscPausa = Phaser.Input.Keyboard.JustDown(this.teclaEsc);
    if (this.pausado) {
      actualizarPausa(this, teclaPausa || teclaEscPausa);
      return;
    }
    if ((teclaPausa || teclaEscPausa) && !this.eligiendo) {
      abrirPausa(this);
      return;
    }

    if (this.eligiendo) {
      this.teclasCartas.forEach((tecla, i) => {
        if (Phaser.Input.Keyboard.JustDown(tecla) && i < this.cartas.length) {
          this.elegirCarta(i);
        }
      });
      return;
    }

    this.tiempoSobrevivido += delta;

    // Cargar el poder (si tiene espera). No carga mientras está en sprint.
    // Capa de superhéroe: se recarga más rápido
    if (this.poderEsperaTotal > 0 && !this.enSprint()) {
      // Árbol: Mandíbula ansiosa (Pitbull) y Pulmones de atleta (Galgo)
      const rapidez = 1 + bonusColeccion('capa', 'RECARGA') + bonusArbol(this, 'MANDIBULA_RECARGA') + bonusArbol(this, 'SPRINT_RECARGA');
      this.poderCarga = Math.min(this.poderEsperaTotal, this.poderCarga + delta * rapidez);
    }

    // Sprint del Galgo (no se puede si la Perrera lo atrapó)
    const sprintTactil = pidioSprintTactil(this); // botón SPRINT del celular (se lee siempre)
    const pidioSprint = Phaser.Input.Keyboard.JustDown(this.teclaEspacio) || sprintTactil;
    if (this.poder === 'sprint' && pidioSprint &&
        this.poderListo() && !this.estaAtrapado()) {
      this.iniciarSprint();
    }

    // Modo de prueba: un enemigo de cada tipo cerca del perro
    if (Phaser.Input.Keyboard.JustDown(this.teclaT)) {
      this.partidaDePrueba = true;
      this.modoPrueba();
    }
    // Modo de prueba: un objeto de cada rareza cerca del perro
    if (Phaser.Input.Keyboard.JustDown(this.teclaY)) {
      this.partidaDePrueba = true;
      this.pruebaObjetos();
    }
    // Modo de prueba: subir 5 niveles de golpe (salen las cartas)
    if (Phaser.Input.Keyboard.JustDown(this.teclaU)) {
      this.partidaDePrueba = true;
      this.nivel += 5;
      this.nivelesPendientes += 5;
      this.mostrarCartas();
      if (this.eligiendo) return;
    }
    // Modo de prueba: el jefe aparece al tiro (si no hay uno vivo)
    if (Phaser.Input.Keyboard.JustDown(this.teclaJ) && !this.jefeVivo() && !this.amaneciendo) {
      this.partidaDePrueba = true;
      this.aparecerJefe();
    }
    // Modo de prueba: el reloj de la noche salta 1 minuto
    if (Phaser.Input.Keyboard.JustDown(this.teclaK) && !this.amaneciendo) {
      this.partidaDePrueba = true;
      this.tiempoSobrevivido += 60000;
      this.textoFlotante('+1 minuto (prueba)', '#b3e5fc');
    }
    // Modo de prueba: una zona especial de cada tipo cerca del perro
    if (Phaser.Input.Keyboard.JustDown(this.teclaZ) && !this.amaneciendo) {
      this.partidaDePrueba = true;
      pruebaZonas(this);
    }
    // Modo de prueba: empieza un desafío al azar
    if (Phaser.Input.Keyboard.JustDown(this.teclaX) && !this.amaneciendo) {
      this.partidaDePrueba = true;
      pruebaDesafio(this);
    }
    // Modo de prueba: un ultra raro coleccionable al azar cerca del perro
    if (Phaser.Input.Keyboard.JustDown(this.teclaC)) {
      this.partidaDePrueba = true;
      pruebaUltra(this);
    }

    // Zonas especiales: en cuál está el perro (antes de moverlo, por el barro)
    actualizarZonas(this);

    this.moverPerro();
    this.moverEnemigos();
    if (this.jefeVivo() && !this.amaneciendo) actualizarJefe(this, this.jefe);
    frenarEnemigosEnBarro(this);
    this.moverHuesos(delta);
    this.aparecerComida(delta);
    this.comer();
    this.beberAgua(delta);
    this.recogerObjetos();
    this.efectosObjetos(delta);
    actualizarColeccionables(this, delta); // ultra raros en el suelo, peluche, sweater y mantita
    this.actualizarEstampida(delta);
    this.dibujarJaula();
    this.dibujarEscudo();

    // Mini desafíos (src/desafios.js)
    actualizarDesafios(this, delta);
    if (this.eligiendo) return; // la recompensa de experiencia puede subir de nivel

    // La noche: fases, jefe y amanecer (si ya terminó, no sigue)
    this.actualizarNoche(delta);
    if (this.gameOver) return;

    // Enemigo élite cada cierto tiempo (al amanecer ya no llegan más)
    if (this.tiempoSobrevivido >= this.proximoElite) {
      this.proximoElite += CONFIG.ELITE_CADA_SEGUNDOS * 1000;
      if (!this.amaneciendo) this.aparecerElite();
    }

    // Aparición de enemigos
    this.esperaAparicion += delta;
    if (this.esperaAparicion >= this.intervaloAparicion()) {
      this.esperaAparicion = 0;
      if (!this.amaneciendo) this.aparecerEnemigos();
    }

    // Mordida automática (no muerde en la Zona de miedo ni en el desafío "Sin morder")
    const puedeAtacar = this.puedeAtacar();
    this.esperaMordida += delta;
    if (this.esperaMordida >= this.intervaloMordida()) {
      this.esperaMordida = puedeAtacar ? 0 : this.intervaloMordida();
      if (puedeAtacar) this.morder();
    }

    // Ladrido automático (solo si ya tiene el instinto; tampoco ladra si no puede atacar)
    if (this.instintos.ladrido > 0 && puedeAtacar) {
      this.esperaLadrido += delta;
      if (this.esperaLadrido >= this.intervaloLadrido()) {
        this.esperaLadrido = 0;
        this.ladrar();
      }
    }

    // Poder "Calle" (Quiltro): se cura un poco con el tiempo
    if (this.poder === 'calle') {
      this.esperaCura += delta;
      if (this.esperaCura >= this.base.CALLE_CURA_CADA_MS / this.multiplicadorRegeneracion() / this.rapidezCalle()) {
        this.esperaCura = 0;
        this.vida = Math.min(this.vidaMax, this.vida + this.curaCalle());
      }
    }

    // Mejoras especiales del árbol de habilidades (src/arbol.js)
    actualizarArbol(this, delta, puedeAtacar);

    // Poder "Rastreo" (Beagle): flechas a enemigos fuera de pantalla
    if (this.poder === 'rastreo') {
      this.dibujarFlechas();
    }

    // Parpadeo mientras es invulnerable
    const invulnerable = this.tiempoSobrevivido < this.invulnerableHasta;
    this.perro.setAlpha(invulnerable ? 0.5 : 1);

    // La oscuridad baja al acercarse el amanecer; el jefe lleva su propia luz
    // (en celular se redibuja cada MOVIL.OSCURIDAD_CADA_CUADROS cuadros, para ir más fluido)
    const luces = this.jefeVivo() ? [this.jefe] : [];
    const cada = modoTactil() ? Math.max(1, CONFIG.MOVIL.OSCURIDAD_CADA_CUADROS) : 1;
    if (this.cuadro++ % cada === 0) {
      actualizarOscuridad(this, this.oscuridad, this.plaza, this.perro, this.nivelOscuridad(), luces);
    }
    this.actualizarHUD();
  }

  // ---------------- La noche (src/noche.js) ----------------

  actualizarNoche(delta) {
    const ahora = this.tiempoSobrevivido;

    // Fases: aviso grande cada vez que empieza una nueva
    const fase = faseDeLaNoche(ahora);
    if (fase > this.faseActual) {
      const primera = this.faseActual < 0;
      this.faseActual = fase;
      const nombre = datosFase(fase).NOMBRE;
      if (primera) {
        this.mostrarAvisoGrande(nombre, 'Sobrevive hasta las ' + horaDeLaNoche(duracionNocheMs()), '#b3e5fc');
      } else if (nombre) {
        this.mostrarAvisoGrande(nombre, '¡La noche se pone más peligrosa!', '#ffcc80');
      }
      if (!primera && CONFIG.APUESTAS.EN_CAMBIO_DE_FASE) this.abrirRincon();
    }

    // El jefe llega a su minuto (o al final, si su minuto es después)
    const minutoJefe = Math.min(CONFIG.JEFE.MINUTO * 60000, duracionNocheMs());
    if (!this.jefeAparecido && ahora >= minutoJefe) this.aparecerJefe();

    // Barra de vida del jefe
    dibujarBarraJefe(this, this.jefe);

    // Llegó la hora del amanecer
    if (!this.amaneciendo && ahora >= duracionNocheMs()) {
      if (this.jefeDerrotado) {
        this.iniciarAmanecer();
      } else if (!this.avisoHoraFin && ahora >= this.jefeAparecidoEn + 3000) { // sin tapar el aviso del jefe
        this.avisoHoraFin = true;
        this.mostrarAvisoGrande('¡Son las ' + horaDeLaNoche(ahora) + '!', 'Derrota al Jefe para que amanezca', '#ffd54f');
      }
    }

    if (this.amaneciendo) this.actualizarAmanecer(delta);
  }

  // Cambio de fase: la partida se congela y se abre el Rincón de apuestas encima
  // (src/scenes/ApuestasScene.js). Al volver, todo sigue donde estaba.
  abrirRincon() {
    this.events.once('resume', () => {
      // Olvidar teclas presionadas o soltadas mientras estaba el rincón
      this.input.keyboard.resetKeys();
      soltarJoystick(this);         // el dedo pudo soltarse mientras estaba el rincón
      this.actualizarHUD();
    });
    this.scene.launch('ApuestasScene', { modo: 'fase' });
    this.scene.pause();
  }

  // Qué tan oscura está la plaza ahora
  nivelOscuridad() {
    if (!this.amaneciendo) return oscuridadDeLaNoche(this.tiempoSobrevivido);
    const t = Math.min(1, this.amanecerMs / CONFIG.NOCHE.AMANECER_MS);
    return this.oscuridadAlAmanecer * (1 - t);
  }

  jefeVivo() {
    return !!(this.jefe && this.jefe.active);
  }

  aparecerJefe() {
    this.jefeAparecido = true;
    this.jefeDerrotado = false;   // si aparece otro con la tecla J, hay que derrotarlo también
    this.jefeAparecidoEn = this.tiempoSobrevivido;
    this.jefe = crearJefe(this);
    this.mostrarAvisoGrande('¡' + NOMBRE_JEFE + '!', 'Un perro enorme llegó a la plaza', '#ff5252');
    this.cameras.main.shake(400, 0.008);
  }

  // Ganaste la noche: el cielo se aclara y los enemigos huyen
  iniciarAmanecer() {
    this.amaneciendo = true;
    this.amanecerMs = 0;
    this.oscuridadAlAmanecer = oscuridadDeLaNoche(this.tiempoSobrevivido);
    this.avisosJefe.clear();
    this.mostrarAvisoGrande('¡Amanece!', 'Los enemigos huyen de la luz', '#ffe082');
    this.enemigos.getChildren().forEach((e) => this.espantarEnemigo(e));
  }

  // Un enemigo huye del perro y se desvanece
  espantarEnemigo(enemigo) {
    if (enemigo.espantado) return;
    enemigo.espantado = true;
    enemigo.huyendoHasta = Infinity;
    enemigo.aturdidoHasta = 0;
    this.tweens.add({
      targets: enemigo, alpha: 0, delay: Phaser.Math.Between(300, 1500), duration: 1200,
      onComplete: () => enemigo.destroy()
    });
  }

  actualizarAmanecer(delta) {
    this.amanecerMs += delta;
    const t = Math.min(1, this.amanecerMs / CONFIG.NOCHE.AMANECER_MS);
    this.luzAmanecer.setAlpha(CONFIG.NOCHE.AMANECER_LUZ * t);
    // por si quedó alguno (por ejemplo, la manada del último aullido)
    this.enemigos.getChildren().forEach((e) => this.espantarEnemigo(e));
    if (t >= 1) {
      actualizarOscuridad(this, this.oscuridad, this.plaza, this.perro, 0);
      this.terminarJuego(true);
    }
  }

  // Texto muy grande al centro de la pantalla (fases, jefe, amanecer)
  mostrarAvisoGrande(titulo, subtitulo, color) {
    if (this.capaAvisoGrande) this.capaAvisoGrande.forEach((t) => { this.tweens.killTweensOf(t); t.destroy(); });
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2 - 90;
    const grande = this.add.text(cx, cy, titulo, {
      fontFamily: FUENTE, fontSize: '54px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);
    const chico = this.add.text(cx, cy + 46, subtitulo || '', {
      fontFamily: FUENTE, fontSize: '22px', color: '#ffffff', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    const capa = [grande, chico];
    capa.forEach((t) => t.setScrollFactor(0).setDepth(1600));
    this.capaAvisoGrande = capa;
    grande.setScale(0.6);
    this.tweens.add({ targets: grande, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.tweens.add({
      targets: capa, alpha: 0, delay: 2200, duration: 700,
      onComplete: () => capa.forEach((t) => t.destroy())
    });
  }

  // ---------------- Valores que dependen de la raza y los instintos ----------------

  // (bonusSinergias viene de src/sinergias.js: suma el bonus de las sinergias activas)
  // (bonusColeccion viene de src/coleccionables.js: bonus de los ultra raros guardados)
  velocidadPerro() {
    const suma = this.base.VELOCIDAD + this.instintos.patasLigeras * CONFIG.PATAS_VELOCIDAD +
      this.nivelObjeto('pelota') * CONFIG.OBJETOS.pelota.VELOCIDAD;
    return suma * (1 + bonusSinergias(this, 'VELOCIDAD') + bonusColeccion('capa', 'VELOCIDAD') + bonusArbol(this, 'VELOCIDAD'));
  }

  // Regeneración (poder Calle y Hueso de caracú): 1.2 = se cura 20% más rápido
  // (bonusArbol viene de src/arbol.js: mejoras compradas en el árbol de habilidades)
  multiplicadorRegeneracion() {
    return 1 + bonusSinergias(this, 'REGENERACION') + bonusArbol(this, 'REGENERACION');
  }

  // Poder Calle (Quiltro) con las mejoras del árbol
  rapidezCalle() {
    return 1 + bonusArbol(this, 'CALLE_RAPIDEZ');
  }

  curaCalle() {
    return (this.base.CALLE_CURA || 0) + bonusArbol(this, 'CALLE_CURA');
  }

  intervaloMordida() {
    let ms = Math.max(100, this.base.MORDIDA_CADA_MS - this.instintos.mordidaRapida * CONFIG.MORDIDA_RAPIDA_MS);
    if (this.fusiones.frenesi) ms = Math.max(100, ms * CONFIG.FUSIONES.frenesi.MORDIDA_MULTIPLICADOR);
    ms = Math.max(100, ms * Math.max(0.1, 1 - bonusArbol(this, 'MORDIDA_RAPIDEZ'))); // Árbol: Mordisco rápido
    return ms;
  }

  // Nivel de un objeto (0 = no lo tiene)
  nivelObjeto(id) {
    return this.objetos[id] || 0;
  }

  danoMordida() {
    const suma = this.base.MORDIDA_DANO + this.instintos.colmillos * CONFIG.COLMILLOS_DANO;
    return suma * (1 + bonusSinergias(this, 'DANO') + this.bonusDanoArbol());
  }

  // Daño extra del árbol: Quijada fuerte, Sangre caliente (poca vida) y Manada (enemigos cerca)
  bonusDanoArbol() {
    let b = bonusArbol(this, 'DANO');
    if (bonusArbol(this, 'FURIA_DANO') && this.vida < this.vidaMax * bonusArbol(this, 'FURIA_VIDA')) b += bonusArbol(this, 'FURIA_DANO');
    if (bonusArbol(this, 'GRUPO_DANO')) b += bonusArbol(this, 'GRUPO_DANO') * enemigosCercaArbol(this);
    return b;
  }

  // Berserker (Pitbull): con poca vida, todas las mordidas son de Mandíbula de hierro
  enBerserker() {
    const b = bonusArbol(this, 'BERSERKER');
    return b > 0 && this.poder === 'mandibula' && this.vida < this.vidaMax * b;
  }

  radioIman() {
    return CONFIG.IMAN_RADIO + (this.base.IMAN_EXTRA || 0) + this.instintos.olfato * CONFIG.OLFATO_IMAN +
      bonusColeccion('lentes', 'IMAN') + bonusArbol(this, 'IMAN');
  }

  // Alcance de la mordida (Lentes: más alcance)
  alcanceMordida() {
    return CONFIG.MORDIDA_ALCANCE + bonusColeccion('lentes', 'ALCANCE');
  }

  // Experiencia que da cada hueso (Placa de identificación y Cascabel)
  xpPorHueso() {
    return CONFIG.HUESO_XP * (1 + this.nivelObjeto('placa') * CONFIG.OBJETOS.placa.XP_EXTRA +
      bonusColeccion('cascabel', 'XP_EXTRA') + bonusArbol(this, 'XP'));
  }

  intervaloLadrido() {
    const extra = this.instintos.ladrido - 1;
    return Math.max(300, CONFIG.LADRIDO_CADA_MS - extra * CONFIG.LADRIDO_CADA_MENOS_MS);
  }

  radioLadrido() {
    const extra = this.fusiones.aullido ? CONFIG.FUSIONES.aullido.RADIO_EXTRA : 0;
    return CONFIG.LADRIDO_RADIO + (this.instintos.ladrido - 1) * CONFIG.LADRIDO_RADIO_EXTRA + extra;
  }

  danoLadrido() {
    return CONFIG.LADRIDO_DANO + (this.instintos.ladrido - 1) * CONFIG.LADRIDO_DANO_EXTRA;
  }

  xpParaSubir() {
    return CONFIG.XP_NIVEL_INICIAL + (this.nivel - 1) * CONFIG.XP_NIVEL_AUMENTO;
  }

  poderListo() {
    return this.poderEsperaTotal > 0 && this.poderCarga >= this.poderEsperaTotal;
  }

  enSprint() {
    return this.tiempoSobrevivido < this.sprintHasta;
  }

  estaAtrapado() {
    return this.tiempoSobrevivido < this.atrapadoHasta;
  }

  // No puede atacar dentro de la Zona de miedo ni durante el desafío "Sin morder"
  puedeAtacar() {
    return !this.efectoZona.miedo && !desafioSinAtacar(this);
  }

  // ---------------- Movimiento ----------------

  moverPerro() {
    this.moverPerroSinAnimar();
    const v = this.perro.body.velocity;
    animarCaminar(this.perro, v.x, v.y);
  }

  moverPerroSinAnimar() {
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    // Joystick del celular (src/tactil.js): dirección e intensidad
    let intensidad = 1;
    const joy = direccionJoystick(this);
    if (joy && dx === 0 && dy === 0) {
      dx = joy.dx;
      dy = joy.dy;
      intensidad = joy.fuerza;
    }

    if (dx !== 0 || dy !== 0) {
      this.ultimaDireccion.set(dx, dy).normalize();
    }

    // Atrapado por la Perrera: no se puede mover
    if (this.estaAtrapado()) {
      this.perro.body.setVelocity(0, 0);
      return;
    }

    // En el barro se mueve más lento (src/zonas.js). Gorro de lana: menos lento
    const barro = this.efectoZona.barro ? this.factorBarroPerro() : 1;

    // Durante el sprint va muy rápido en línea recta
    if (this.enSprint()) {
      const v = (this.base.SPRINT_VELOCIDAD + bonusArbol(this, 'SPRINT_VELOCIDAD')) * barro;
      this.perro.body.setVelocity(this.direccionSprint.x * v, this.direccionSprint.y * v);
      this.dejarEstela();
      return;
    }

    // Normalizar para que en diagonal no vaya más rápido
    const vel = new Phaser.Math.Vector2(dx, dy).normalize().scale(this.velocidadPerro() * barro * intensidad);
    this.perro.body.setVelocity(vel.x, vel.y);
  }

  // Cuánto se multiplica la velocidad del perro en el barro (Gorro de lana: frena menos)
  factorBarroPerro() {
    const b = CONFIG.ZONAS.barro;
    if (!b) return 1;
    const lentitud = (b.LENTITUD || 0) * Math.max(0, 1 - bonusColeccion('gorro', 'MENOS_LENTITUD'));
    return Math.max(0, 1 - lentitud);
  }

  moverEnemigos() {
    const ahora = this.tiempoSobrevivido;
    this.avisos.clear();

    this.enemigos.getChildren().forEach((enemigo) => {
      const cfg = enemigo.cfg;
      let avisando = false;

      // El jefe se mueve solo (src/jefe.js), salvo al amanecer, que huye como todos
      if (enemigo.esJefe && !this.amaneciendo) return;

      if (ahora < enemigo.empujadoHasta) {
        // Lo empujó un ladrido: lo dejamos volar un momento
        enemigo.estado = 'acercarse';
      } else if (ahora < enemigo.aturdidoHasta) {
        enemigo.body.setVelocity(0, 0); // aturdido: se queda quieto
        enemigo.estado = 'acercarse';
      } else if (ahora < enemigo.huyendoHasta) {
        // Lo asustó el Aullido: corre alejándose del perro
        const angulo = Phaser.Math.Angle.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y);
        enemigo.body.setVelocity(Math.cos(angulo) * enemigo.velocidad, Math.sin(angulo) * enemigo.velocidad);
        enemigo.estado = 'acercarse';
      } else if (cfg.COMPORTAMIENTO === 'zigzag') {
        this.moverZigzag(enemigo, ahora);
      } else if (cfg.COMPORTAMIENTO === 'embestida') {
        avisando = this.moverEmbestida(enemigo, ahora);
      } else {
        // 'perseguir' y 'atrapar': van hacia el perro (rodeando obstáculos)
        this.moverHaciaPerro(enemigo, enemigo.velocidad, ahora);
      }

      // Caminar y mirar hacia donde va (si lo empujó un ladrido, sigue mirando igual)
      if (ahora >= enemigo.empujadoHasta) {
        const v = enemigo.body.velocity;
        animarCaminar(enemigo, v.x, v.y);
      }
      if (enemigo.estado === 'avisar') enemigo.setFlipX(Math.cos(enemigo.anguloEmbestida) < 0);

      // Color según su estado
      let tinte = 'normal';
      if (ahora < enemigo.destelloHasta) tinte = 'destello';
      else if (ahora < enemigo.aturdidoHasta) tinte = 'aturdido';
      else if (avisando && Math.floor(ahora / 100) % 2 === 0) tinte = 'aviso'; // parpadeo
      if (enemigo.tinte !== tinte) {
        enemigo.tinte = tinte;
        if (tinte === 'destello') enemigo.setTintFill(COLOR_BLANCO);    // todo blanco
        else if (tinte === 'aviso') enemigo.setTintFill(COLOR_AVISO);   // todo verde claro
        else if (tinte === 'aturdido') enemigo.setTint(COLOR_ATURDIDO); // teñido morado
        else if (enemigo.tinteBase !== null) enemigo.setTint(enemigo.tinteBase);
        else enemigo.clearTint();
      }

      // La Perrera se ve transparente mientras no puede atraparte
      if (cfg.COMPORTAMIENTO === 'atrapar' && !enemigo.espantado) {
        enemigo.setAlpha(ahora < enemigo.recargaHasta ? 0.45 : 1);
      }

      // El borde dorado del élite sigue al enemigo (mismo cuadro y mismo lado)
      if (enemigo.borde) {
        enemigo.borde.setPosition(enemigo.x, enemigo.y);
        enemigo.borde.setFrame(enemigo.frame.name);
        enemigo.borde.setFlipX(enemigo.flipX);
        enemigo.borde.setAlpha(enemigo.alpha);
      }
    });
  }

  // Borracho: camina hacia el perro, pero desviándose de lado a lado
  moverZigzag(enemigo, ahora) {
    const cfg = enemigo.cfg;
    const haciaPerro = this.anguloHaciaPerro(enemigo, ahora);
    // mientras rodea un obstáculo no zigzaguea
    const vaiven = ahora < enemigo.rodeandoHasta ? 0 : Math.sin((ahora / cfg.ZIGZAG_CADA_MS) * Math.PI * 2 + enemigo.fase);
    const angulo = haciaPerro + Phaser.Math.DegToRad(cfg.ZIGZAG_GRADOS) * vaiven;
    enemigo.body.setVelocity(Math.cos(angulo) * enemigo.velocidad, Math.sin(angulo) * enemigo.velocidad);
  }

  // Hacia dónde camina un enemigo: directo al perro, o de lado si está
  // rodeando un obstáculo que chocó hace poco
  anguloHaciaPerro(enemigo, ahora) {
    const directo = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, this.perro.x, this.perro.y);
    if (ahora >= enemigo.rodeandoHasta || !enemigo.rodeoObstaculo) return directo;
    const o = enemigo.rodeoObstaculo;
    return Phaser.Math.Angle.Between(o.x, o.y, enemigo.x, enemigo.y) + enemigo.rodeoLado * Math.PI / 2;
  }

  moverHaciaPerro(enemigo, velocidad, ahora) {
    const angulo = this.anguloHaciaPerro(enemigo, ahora);
    enemigo.body.setVelocity(Math.cos(angulo) * velocidad, Math.sin(angulo) * velocidad);
  }

  // Un enemigo chocó con un obstáculo: camina de lado para rodearlo.
  // Elige el lado que lo deja más cerca del perro; si se queda pegado, prueba el otro.
  chocarObstaculo(a, b) {
    const enemigo = a.cfg ? a : b;
    const zona = a.cfg ? b : a;
    const ahora = this.tiempoSobrevivido;

    if (ahora >= enemigo.rodeandoHasta || enemigo.rodeoObstaculo !== zona) {
      const desde = Phaser.Math.Angle.Between(zona.x, zona.y, enemigo.x, enemigo.y);
      const directo = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, this.perro.x, this.perro.y);
      enemigo.rodeoLado = Math.cos(desde + Math.PI / 2 - directo) >= Math.cos(desde - Math.PI / 2 - directo) ? 1 : -1;
      enemigo.rodeoInicio = ahora;
      enemigo.rodeoX = enemigo.x;
      enemigo.rodeoY = enemigo.y;
    } else if (ahora - enemigo.rodeoInicio > 1000) {
      // Cada segundo revisa si avanzó; si casi no se movió, prueba por el otro lado
      if (Phaser.Math.Distance.Between(enemigo.x, enemigo.y, enemigo.rodeoX, enemigo.rodeoY) < 25) {
        enemigo.rodeoLado *= -1;
      }
      enemigo.rodeoInicio = ahora;
      enemigo.rodeoX = enemigo.x;
      enemigo.rodeoY = enemigo.y;
    }
    enemigo.rodeoObstaculo = zona;
    enemigo.rodeandoHasta = ahora + CONFIG.RODEO_MS;
  }

  // Drogadicto: se acerca, se detiene avisando, embiste en línea recta y descansa.
  // Devuelve true mientras está avisando.
  moverEmbestida(enemigo, ahora) {
    const cfg = enemigo.cfg;

    if (enemigo.estado === 'acercarse') {
      const d = Phaser.Math.Distance.Between(enemigo.x, enemigo.y, this.perro.x, this.perro.y);
      if (d <= cfg.DISTANCIA_EMBESTIDA) {
        // Fija la dirección ahora: el perro puede esquivar moviéndose
        enemigo.estado = 'avisar';
        enemigo.anguloEmbestida = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, this.perro.x, this.perro.y);
        enemigo.estadoHasta = ahora + cfg.AVISO_MS;
        enemigo.body.setVelocity(0, 0);
      } else {
        this.moverHaciaPerro(enemigo, enemigo.velocidad, ahora);
      }
    }

    if (enemigo.estado === 'avisar') {
      enemigo.body.setVelocity(0, 0);
      // Línea que muestra por dónde va a pasar
      const largo = cfg.EMBESTIDA_VELOCIDAD * (cfg.EMBESTIDA_MS / 1000);
      this.avisos.lineStyle(3, COLOR_AVISO, 0.7);
      this.avisos.lineBetween(
        enemigo.x, enemigo.y,
        enemigo.x + Math.cos(enemigo.anguloEmbestida) * largo,
        enemigo.y + Math.sin(enemigo.anguloEmbestida) * largo
      );
      if (ahora >= enemigo.estadoHasta) {
        enemigo.estado = 'embestir';
        enemigo.estadoHasta = ahora + cfg.EMBESTIDA_MS;
      }
      return true;
    }

    if (enemigo.estado === 'embestir') {
      const v = cfg.EMBESTIDA_VELOCIDAD;
      enemigo.body.setVelocity(Math.cos(enemigo.anguloEmbestida) * v, Math.sin(enemigo.anguloEmbestida) * v);
      if (ahora >= enemigo.estadoHasta) {
        enemigo.estado = 'descansar';
        enemigo.estadoHasta = ahora + cfg.DESCANSO_MS;
      }
    } else if (enemigo.estado === 'descansar') {
      enemigo.body.setVelocity(0, 0);
      if (ahora >= enemigo.estadoHasta) enemigo.estado = 'acercarse';
    }
    return false;
  }

  // Jaula azul alrededor del perro mientras la Perrera lo tiene atrapado
  dibujarJaula() {
    this.jaula.clear();
    if (!this.estaAtrapado()) return;

    const r = this.base.RADIO + 8;
    const x = this.perro.x;
    const y = this.perro.y;
    this.jaula.lineStyle(3, COLOR_JAULA, 1);
    this.jaula.strokeRect(x - r, y - r, r * 2, r * 2);
    for (let i = 1; i <= 3; i++) {
      const bx = x - r + (r * 2 * i) / 4;
      this.jaula.lineBetween(bx, y - r, bx, y + r);
    }
  }

  // ---------------- Sprint (Galgo) ----------------

  iniciarSprint() {
    this.direccionSprint = this.ultimaDireccion.clone();
    this.sprintHasta = this.tiempoSobrevivido + this.base.SPRINT_DURACION_MS + bonusArbol(this, 'SPRINT_DURACION_MS');
    this.poderCarga = 0;
    this.numeroSprint++;          // Rayo gris: cada enemigo recibe daño 1 vez por sprint
    if (bonusArbol(this, 'LEBREL_MULTIPLICADOR') > 0) this.lebrelListo = true; // Lebrel: la próxima mordida es fuerte
  }

  // Sombras que quedan atrás durante el sprint
  dejarEstela() {
    this.dejarSombra(this.perro);
  }

  // Sombra que se desvanece donde estaba un personaje (sprint del Galgo, embestida del jefe)
  dejarSombra(quien) {
    if (efectosLimitados(this)) return; // celular con muchos enemigos: sin sombras
    const sombra = this.add.image(quien.x, quien.y, quien.texture.key, quien.frame.name)
      .setScale(quien.scaleX).setFlipX(quien.flipX).setAlpha(0.4);
    if (quien.isTinted) sombra.setTint(quien.tintTopLeft);
    sombra.setDepth(quien.depth - 1);
    this.tweens.add({
      targets: sombra,
      alpha: 0,
      scale: quien.scaleX * 0.6,
      duration: 250,
      onComplete: () => sombra.destroy()
    });
  }

  // ---------------- Rastreo (Beagle) ----------------

  dibujarFlechas() {
    const g = this.flechas;
    g.clear();

    const cam = this.cameras.main;
    const w = this.scale.width;
    const h = this.scale.height;
    const margen = 26 + margenExtra();

    // Cosas fuera de la pantalla, las más cercanas primero
    const fueraDePantalla = (lista, maximo) => lista
      .filter((e) => e.active)
      .map((e) => ({ sx: e.x - cam.scrollX, sy: e.y - cam.scrollY, d: Phaser.Math.Distance.Between(this.perro.x, this.perro.y, e.x, e.y) }))
      .filter((p) => p.sx < 0 || p.sx > w || p.sy < 0 || p.sy > h)
      .sort((a, b) => a.d - b.d)
      .slice(0, maximo);

    this.dibujarGrupoFlechas(fueraDePantalla(this.enemigos.getChildren(), this.base.RASTREO_FLECHAS_MAX), COLOR_FLECHA, margen);

    // Nariz de sabueso (árbol del Beagle): también comida (verde) y objetos/ultra raros (morado)
    if (bonusArbol(this, 'NARIZ') > 0) {
      this.dibujarGrupoFlechas(fueraDePantalla(this.comidas.getChildren(), 3), 0x9ccc65, margen);
      const cosas = this.objetosSuelo.getChildren().concat(this.ultrasSuelo || []);
      this.dibujarGrupoFlechas(fueraDePantalla(cosas, 4), 0xce93d8, margen);
    }
  }

  // Triángulos en el borde de la pantalla apuntando a cada punto
  dibujarGrupoFlechas(fuera, color, margen) {
    const g = this.flechas;
    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;
    g.fillStyle(color, 0.9);
    fuera.forEach((p) => {
      const dx = p.sx - cx;
      const dy = p.sy - cy;
      // Punto en el borde de la pantalla en dirección al enemigo
      const t = Math.min((cx - margen) / Math.max(Math.abs(dx), 0.001), (cy - margen) / Math.max(Math.abs(dy), 0.001));
      const px = cx + dx * t;
      const py = cy + dy * t;
      const a = Math.atan2(dy, dx);
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      g.fillTriangle(
        px + cos * 10, py + sin * 10,
        px - cos * 7 - sin * 8, py - sin * 7 + cos * 8,
        px - cos * 7 + sin * 8, py - sin * 7 - cos * 8
      );
    });
  }

  // ---------------- Enemigos ----------------

  intervaloAparicion() {
    const segundos = this.tiempoSobrevivido / 1000;
    const intervalo = CONFIG.APARICION_INICIAL_MS - segundos * CONFIG.APARICION_ACELERA_MS;
    // La fase de la noche hace que salgan más seguido; con el jefe vivo, menos
    let multiplicador = datosFase(faseDeLaNoche(this.tiempoSobrevivido)).APARICION;
    if (this.jefeVivo()) multiplicador *= CONFIG.JEFE.APARICION_MIENTRAS;
    multiplicador *= multiplicadorAparicionDesafio(this); // desafío "Aguanta": más enemigos
    return Math.max(CONFIG.APARICION_MINIMA_MS, intervalo) * multiplicador;
  }

  // Cuántos enemigos de un tipo hay ahora en el mapa
  contarTipo(tipo) {
    return this.enemigos.getChildren().filter((e) => e.tipo === tipo).length;
  }

  // Elige al azar qué enemigo aparece (según el tiempo y el PESO de cada uno)
  aparecerEnemigos() {
    const segundos = this.tiempoSobrevivido / 1000;
    const disponibles = Object.keys(CONFIG.ENEMIGOS).filter((id) => {
      const cfg = CONFIG.ENEMIGOS[id];
      if (segundos < (cfg.DESDE_SEGUNDOS || 0)) return false;
      if (cfg.MAXIMO !== undefined && this.contarTipo(id) >= cfg.MAXIMO) return false;
      return (cfg.PESO || 0) > 0;
    });
    if (disponibles.length === 0) return;

    const total = disponibles.reduce((suma, id) => suma + CONFIG.ENEMIGOS[id].PESO, 0);
    let sorteo = Math.random() * total;
    let tipo = disponibles[disponibles.length - 1];
    for (const id of disponibles) {
      sorteo -= CONFIG.ENEMIGOS[id].PESO;
      if (sorteo < 0) { tipo = id; break; }
    }

    const pos = this.posicionFueraDePantalla();
    this.crearGrupo(tipo, pos.x, pos.y, false);
  }

  // Crea un enemigo (o un grupo, si el tipo tiene GRUPO_MIN / GRUPO_MAX)
  crearGrupo(tipo, x, y, ignorarLimite) {
    const cfg = CONFIG.ENEMIGOS[tipo];
    const cantidad = cfg.GRUPO_MIN ? Phaser.Math.Between(cfg.GRUPO_MIN, cfg.GRUPO_MAX || cfg.GRUPO_MIN) : 1;
    const creados = [];
    for (let i = 0; i < cantidad; i++) {
      const ox = cantidad > 1 ? Phaser.Math.Between(-40, 40) : 0;
      const oy = cantidad > 1 ? Phaser.Math.Between(-40, 40) : 0;
      const enemigo = this.crearEnemigo(tipo, x + ox, y + oy, ignorarLimite);
      if (enemigo) creados.push(enemigo);
    }
    return creados;
  }

  crearEnemigo(tipo, x, y, ignorarLimite, elite) {
    if (!ignorarLimite && this.enemigos.countActive() >= limiteEnemigos()) return null;

    const cfg = CONFIG.ENEMIGOS[tipo];
    const tamano = elite ? CONFIG.ELITE_TAMANO : 1;
    const r = cfg.RADIO * tamano;
    // Nunca dentro de un obstáculo: si el lugar está ocupado, busca el más cercano libre
    const lugar = this.plaza.buscarLibre(x, y, r + 4);
    x = lugar.x;
    y = lugar.y;
    // Dibujo en pixel art (src/sprites.js). Si no tiene dibujo propio,
    // usa el del perro rival pintado con su COLOR.
    const clave = claveSprite(tipo, SPRITE_ENEMIGO_POR_DEFECTO);
    const enemigo = agregarSprite(this, x, y, clave);
    enemigo.tinteBase = clave !== tipo ? cfg.COLOR : null;
    if (enemigo.tinteBase !== null) enemigo.setTint(enemigo.tinteBase);
    enemigo.tinte = 'normal';
    enemigo.setDepth(6);
    if (elite) enemigo.setScale(ESCALA_PIXEL * tamano);

    this.enemigos.add(enemigo);
    // El "cuerpo" para choques es siempre un círculo de RADIO centrado en el dibujo
    ponerChoqueCircular(enemigo, r);

    // Élite: borde dorado detrás del dibujo (se borra solo cuando muere)
    enemigo.elite = !!elite;
    enemigo.borde = null;
    if (elite) {
      enemigo.borde = this.add.sprite(x, y, texturaBorde(this, clave), 0)
        .setScale(ESCALA_PIXEL * tamano).setTint(0xffd54f).setDepth(5.9);
      enemigo.once('destroy', () => { if (enemigo.borde) enemigo.borde.destroy(); });
    }

    enemigo.tipo = tipo;
    enemigo.cfg = cfg;
    enemigo.radio = r;
    // La fase de la noche les da más vida y velocidad
    const fase = datosFase(faseDeLaNoche(this.tiempoSobrevivido));
    enemigo.vida = cfg.VIDA * (elite ? CONFIG.ELITE_VIDA : 1) * fase.VIDA;
    enemigo.velocidad = cfg.VELOCIDAD * fase.VELOCIDAD;
    enemigo.huyendoHasta = 0;     // huyendo del Aullido hasta este momento
    enemigo.empujadoHasta = 0;
    enemigo.aturdidoHasta = 0;
    enemigo.destelloHasta = 0;
    enemigo.recargaHasta = 0;
    enemigo.estado = 'acercarse';
    enemigo.estadoHasta = 0;
    enemigo.anguloEmbestida = 0;
    enemigo.fase = Math.random() * Math.PI * 2; // para que los borrachos no zigzagueen todos igual
    enemigo.dePrueba = false;
    enemigo.rodeandoHasta = 0;    // rodeando un obstáculo hasta este momento
    enemigo.rodeoObstaculo = null;
    enemigo.rodeoLado = 1;
    enemigo.rodeoInicio = 0;
    return enemigo;
  }

  // Modo de prueba (tecla T): un enemigo de cada tipo alrededor del perro.
  // Estos enemigos no sueltan huesos ni cuentan en el Game Over.
  modoPrueba() {
    const tipos = Object.keys(CONFIG.ENEMIGOS);
    tipos.forEach((tipo, i) => {
      const angulo = (i / tipos.length) * Math.PI * 2;
      const x = Phaser.Math.Clamp(this.perro.x + Math.cos(angulo) * 220, 20, CONFIG.MAPA_ANCHO - 20);
      const y = Phaser.Math.Clamp(this.perro.y + Math.sin(angulo) * 220, 20, CONFIG.MAPA_ALTO - 20);
      this.crearGrupo(tipo, x, y, true).forEach((enemigo) => { enemigo.dePrueba = true; });
    });
  }

  // Enemigo élite: uno grande, con borde dorado y mucha vida, de algún
  // tipo que ya esté apareciendo. Siempre suelta un objeto raro o mejor.
  aparecerElite() {
    const segundos = this.tiempoSobrevivido / 1000;
    const tipos = Object.keys(CONFIG.ENEMIGOS).filter((id) => segundos >= (CONFIG.ENEMIGOS[id].DESDE_SEGUNDOS || 0));
    if (tipos.length === 0) return;
    const tipo = Phaser.Math.RND.pick(tipos);
    const pos = this.posicionFueraDePantalla();
    const elite = this.crearEnemigo(tipo, pos.x, pos.y, true, true);
    if (!elite) return;

    const nombre = (ENEMIGOS.find((e) => e.id === tipo) || { nombre: tipo }).nombre;
    this.mostrarAviso('¡Apareció un élite: ' + nombre + '!', '#ffd54f');
  }

  // Texto grande arriba al centro que se desvanece
  mostrarAviso(texto, color) {
    // si ya hay avisos en pantalla, el nuevo sale más abajo
    this.avisosVisibles = (this.avisosVisibles || []).filter((a) => a.active);
    const y = 120 + (this.margenHudExtra || 0) + this.avisosVisibles.length * 34;
    const aviso = this.add.text(this.scale.width / 2, y, texto, {
      fontFamily: FUENTE, fontSize: '26px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1500);
    this.avisosVisibles.push(aviso);
    this.tweens.add({
      targets: aviso,
      alpha: 0,
      delay: 1800,
      duration: 600,
      onComplete: () => aviso.destroy()
    });
  }

  // Modo de prueba (tecla Y): un objeto de cada rareza en un círculo
  // alrededor del perro. Cada vez que presionas Y salen objetos distintos,
  // así en pocas veces tienes cada objeto en épico y legendario.
  pruebaObjetos() {
    RAREZAS.forEach((rareza, i) => {
      const objeto = OBJETOS[(this.rondaPrueba + i) % OBJETOS.length];
      const angulo = (i / RAREZAS.length) * Math.PI * 2 - Math.PI / 2;
      const lugar = this.plaza.buscarLibre(
        Phaser.Math.Clamp(this.perro.x + Math.cos(angulo) * 90, 20, CONFIG.MAPA_ANCHO - 20),
        Phaser.Math.Clamp(this.perro.y + Math.sin(angulo) * 90, 20, CONFIG.MAPA_ALTO - 20),
        12
      );
      this.soltarObjeto(lugar.x, lugar.y, objeto.id, rareza.id);
    });
    this.rondaPrueba++;
  }

  // Busca un punto justo fuera de lo que se ve en pantalla, pero dentro del mapa
  posicionFueraDePantalla() {
    const vista = this.cameras.main.worldView;
    const margen = 50 + bonusColeccion('chalequito', 'APARECE_LEJOS'); // Chalequito: aparecen más lejos

    for (let intento = 0; intento < 10; intento++) {
      let x;
      let y;
      const lado = Phaser.Math.Between(0, 3);
      if (lado === 0) { // arriba
        x = Phaser.Math.Between(vista.left, vista.right);
        y = vista.top - margen;
      } else if (lado === 1) { // abajo
        x = Phaser.Math.Between(vista.left, vista.right);
        y = vista.bottom + margen;
      } else if (lado === 2) { // izquierda
        x = vista.left - margen;
        y = Phaser.Math.Between(vista.top, vista.bottom);
      } else { // derecha
        x = vista.right + margen;
        y = Phaser.Math.Between(vista.top, vista.bottom);
      }
      const dentroDelMapa = x > 0 && x < CONFIG.MAPA_ANCHO && y > 0 && y < CONFIG.MAPA_ALTO;
      if (dentroDelMapa && this.plaza.libre(x, y, 30)) return { x, y }; // nunca dentro de un obstáculo
    }

    // Si no encontró lugar (raro), aparece cerca de una esquina del mapa
    return this.plaza.buscarLibre(
      Phaser.Math.RND.pick([30, CONFIG.MAPA_ANCHO - 30]),
      Phaser.Math.RND.pick([30, CONFIG.MAPA_ALTO - 30]),
      30
    );
  }

  // Quita vida a un enemigo; si muere, suelta huesos (más duro = más huesos)
  danarEnemigo(enemigo, dano) {
    if (!enemigo.active) return;
    enemigo.vida -= dano;

    if (enemigo.vida <= 0) {
      // Los enemigos del modo de prueba (tecla T) no dan huesos ni cuentan
      if (enemigo.dePrueba) {
        enemigo.destroy();
        return;
      }

      const probabilidad = this.base.HUESO_PROBABILIDAD === undefined ? 1 : this.base.HUESO_PROBABILIDAD;
      let cantidad = enemigo.cfg.HUESOS === undefined ? 1 : enemigo.cfg.HUESOS;
      if (enemigo.elite) cantidad *= CONFIG.ELITE_HUESOS;
      if (enemigo.esJefe) this.derrotarJefe(enemigo);
      // Árbol: Hueso de regalo / Escarbador: a veces 1 hueso extra
      if (Math.random() < bonusArbol(this, 'HUESO_EXTRA')) cantidad++;
      for (let i = 0; i < cantidad; i++) {
        if (Math.random() < probabilidad) {
          const ox = cantidad > 1 ? Phaser.Math.Between(-14, 14) : 0;
          const oy = cantidad > 1 ? Phaser.Math.Between(-14, 14) : 0;
          // si el hueso caería dentro de un obstáculo, cae justo donde estaba el enemigo
          const libre = this.plaza.libre(enemigo.x + ox, enemigo.y + oy, 4);
          this.soltarHueso(libre ? enemigo.x + ox : enemigo.x, libre ? enemigo.y + oy : enemigo.y);
        }
      }

      // A veces suelta un objeto con rareza (el élite, siempre uno raro o mejor)
      if (enemigo.esJefe) {
        this.soltarObjeto(enemigo.x, enemigo.y, null, this.sortearRareza(CONFIG.JEFE.OBJETO_RAREZA));
      } else if (enemigo.elite) {
        this.soltarObjeto(enemigo.x, enemigo.y, null, this.sortearRareza(CONFIG.ELITE_RAREZA_MINIMA));
      } else if (Math.random() < CONFIG.OBJETO_PROBABILIDAD * (1 + bonusArbol(this, 'OBJETO'))) { // Árbol: Ojo para lo bueno
        this.soltarObjeto(enemigo.x, enemigo.y, null, this.sortearRareza());
      }
      // Muy de vez en cuando, un ultra raro coleccionable (src/coleccionables.js)
      sorteoUltraAlDerrotar(this, enemigo);
      alDerrotarArbol(this, enemigo); // Dueño del barrio (src/arbol.js)
      this.derrotados++;
      this.derrotadosPorTipo[enemigo.tipo] = (this.derrotadosPorTipo[enemigo.tipo] || 0) + 1;
      enemigo.destroy();
      return;
    }

    enemigo.destelloHasta = this.tiempoSobrevivido + 80; // destello blanco breve
  }

  // El jefe murió: aviso (los huesos y el objeto los suelta danarEnemigo)
  derrotarJefe(jefe) {
    this.jefeDerrotado = true;
    this.jefesDerrotados++;       // para los huesitos (src/huesitos.js)
    this.avisosJefe.clear();
    this.cameras.main.shake(500, 0.012);
    const falta = this.tiempoSobrevivido < duracionNocheMs();
    this.mostrarAvisoGrande('¡Derrotaste al Jefe!', falta ? 'Aguanta hasta las ' + horaDeLaNoche(duracionNocheMs()) : '', '#ffd54f');
  }

  // ---------------- Mordida ----------------

  morder() {
    // Los enemigos dentro del alcance (medido hasta su borde), el más cercano primero.
    // Normalmente muerde a 1; con la fusión "Frenesí", a varios.
    let cuantos = this.fusiones.frenesi ? CONFIG.FUSIONES.frenesi.OBJETIVOS : 1;
    // Lebrel (Galgo): la primera mordida después de un sprint muerde a varios
    const lebrel = this.lebrelListo;
    if (lebrel) cuantos = Math.max(cuantos, bonusArbol(this, 'LEBREL_OBJETIVOS') || 1);
    const objetivos = this.enemigos.getChildren()
      .map((enemigo) => ({ enemigo, d: Phaser.Math.Distance.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y) - enemigo.radio }))
      .filter((o) => o.d <= this.alcanceMordida())
      .sort((a, b) => a.d - b.d)
      .slice(0, cuantos)
      .map((o) => o.enemigo);
    if (lebrel && objetivos.length > 0) this.lebrelListo = false;
    const berserker = this.enBerserker();

    objetivos.forEach((objetivo, i) => {
      let dano = this.danoMordida();
      let fuerte = false;

      // Poder "Mandíbula de hierro" (Pitbull): si está cargado, aturde y hace daño extra
      // (solo al primero)
      // Berserker (árbol): con poca vida todas son de hierro y no gastan la carga
      if (berserker || (i === 0 && this.poder === 'mandibula' && this.poderListo())) {
        dano += this.base.MANDIBULA_DANO_EXTRA + bonusArbol(this, 'MANDIBULA_DANO');
        objetivo.aturdidoHasta = this.tiempoSobrevivido + this.base.MANDIBULA_ATURDIR_MS + bonusArbol(this, 'MANDIBULA_ATURDIR_MS');
        if (!berserker) this.poderCarga = 0;
        fuerte = true;
      }

      // Caza (Galgo): más daño y crítico contra enemigos rápidos o que embisten
      const presa = esPresaRapida(objetivo);
      if (presa) dano *= 1 + bonusArbol(this, 'CAZA_DANO');
      // Lebrel (Galgo): mordida después del sprint
      if (lebrel) {
        dano *= bonusArbol(this, 'LEBREL_MULTIPLICADOR') || 1;
        fuerte = true;
      }

      // Pañuelo rojo y árbol (Colmillo certero, Remate): a veces la mordida es crítica (doble daño)
      const probCritico = bonusColeccion('panuelo', 'CRITICO') + bonusArbol(this, 'CRITICO') +
        (presa ? bonusArbol(this, 'CAZA_CRITICO') : 0);
      const critico = Math.random() < probCritico;
      if (critico) dano *= 2;

      this.mostrarMordida(objetivo, fuerte, critico);
      const ox = objetivo.x;
      const oy = objetivo.y;
      this.danarEnemigo(objetivo, dano);

      // Sacudida (Pitbull): también daña a los que están cerca del mordido
      const sacudida = bonusArbol(this, 'SACUDIDA');
      if (sacudida > 0) {
        const radio = bonusArbol(this, 'SACUDIDA_RADIO') || 70;
        this.enemigos.getChildren().slice().forEach((otro) => {
          if (otro === objetivo || !otro.active) return;
          if (Phaser.Math.Distance.Between(ox, oy, otro.x, otro.y) > radio + otro.radio) return;
          this.danarEnemigo(otro, dano * sacudida);
        });
      }
    });
  }

  // Dientes de pixel art sobre el enemigo que se desvanecen
  // (amarillos y más grandes si es la Mandíbula de hierro; rojos si es crítica)
  mostrarMordida(objetivo, fuerte, critico) {
    // Celular con muchos enemigos: solo 1 de cada MOVIL.EFECTOS_UNO_DE_CADA (src/tactil.js)
    if (!fuerte && !critico && efectosLimitados(this) &&
        (this.mordidasOmitidas = (this.mordidasOmitidas || 0) + 1) % CONFIG.MOVIL.EFECTOS_UNO_DE_CADA !== 0) return;
    const escala = fuerte || critico ? ESCALA_PIXEL + 1 : ESCALA_PIXEL;
    const dientes = this.add.image(objetivo.x, objetivo.y, 'mordida', 0).setScale(escala);
    dientes.setDepth(20);
    if (fuerte) dientes.setTint(COLOR_HUESO);
    else if (critico) dientes.setTint(0xff5252);

    this.tweens.add({
      targets: dientes,
      alpha: 0,
      scale: escala * 0.7, // se "cierran" mientras desaparecen
      duration: fuerte ? 350 : 200,
      onComplete: () => dientes.destroy()
    });
  }

  // ---------------- Ladrido ----------------

  // opciones (opcional, para el Aullido de la manada del árbol): { radio, dano, huirMs, color }
  ladrar(opciones) {
    const op = opciones || {};
    const radio = op.radio || this.radioLadrido();
    const dano = op.dano || this.danoLadrido();

    // Onda blanca pixelada que se expande
    const onda = this.add.image(this.perro.x, this.perro.y, texturaOnda(this, radio));
    onda.setDepth(5);
    onda.setScale(ESCALA_PIXEL * 0.2);
    const aullido = !!this.fusiones.aullido;
    if (op.color) onda.setTint(op.color);
    else if (aullido) onda.setTint(0xffd54f); // el Aullido se ve dorado
    this.tweens.add({
      targets: onda,
      scale: ESCALA_PIXEL,
      alpha: 0,
      duration: 350,
      onComplete: () => onda.destroy()
    });

    // Copia de la lista, porque algunos enemigos mueren dentro del ciclo
    this.enemigos.getChildren().slice().forEach((enemigo) => {
      const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y);
      if (d > radio + enemigo.radio) return;

      // Empujar hacia afuera
      const angulo = Phaser.Math.Angle.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y);
      enemigo.body.setVelocity(Math.cos(angulo) * CONFIG.LADRIDO_EMPUJE, Math.sin(angulo) * CONFIG.LADRIDO_EMPUJE);
      enemigo.empujadoHasta = this.tiempoSobrevivido + CONFIG.LADRIDO_EMPUJE_MS;
      // Aullido: además huyen un rato (después del empujón)
      if (aullido) enemigo.huyendoHasta = enemigo.empujadoHasta + CONFIG.FUSIONES.aullido.HUIR_MS;
      if (op.huirMs) enemigo.huyendoHasta = Math.max(enemigo.huyendoHasta || 0, enemigo.empujadoHasta + op.huirMs);

      this.danarEnemigo(enemigo, dano);
    });
  }

  // ---------------- Huesos y experiencia ----------------

  soltarHueso(x, y) {
    const hueso = agregarSprite(this, x, y, 'hueso');
    hueso.setFlipY(Math.random() < 0.5); // para que no se vean todos iguales
    hueso.setDepth(3);
    this.huesos.add(hueso);
  }

  moverHuesos(delta) {
    // En la Zona segura no gana experiencia: los huesos se quedan en el suelo esperando
    if (this.efectoZona.segura) return;
    const iman = this.radioIman();
    const distanciaRecoger = this.base.RADIO + CONFIG.HUESO_TAMANO;
    const paso = CONFIG.IMAN_VELOCIDAD * (1 + bonusArbol(this, 'IMAN_RAPIDEZ')) * (delta / 1000); // Árbol: Nariz fina

    this.huesos.getChildren().slice().forEach((hueso) => {
      const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, hueso.x, hueso.y);

      if (d <= distanciaRecoger) {
        hueso.destroy();
        // Placa de identificación y Cascabel: más experiencia por hueso
        this.ganarXP(this.xpPorHueso());
        return;
      }

      // El imán: si está cerca, vuela hacia el perro
      if (d <= iman) {
        const angulo = Phaser.Math.Angle.Between(hueso.x, hueso.y, this.perro.x, this.perro.y);
        const avance = Math.min(paso, d);
        hueso.x += Math.cos(angulo) * avance;
        hueso.y += Math.sin(angulo) * avance;
      }
    });
  }

  ganarXP(cantidad) {
    this.xp += cantidad;
    while (this.xp >= this.xpParaSubir()) {
      this.xp -= this.xpParaSubir();
      this.nivel++;
      this.nivelesPendientes++;
    }
    if (this.nivelesPendientes > 0 && !this.eligiendo) {
      this.mostrarCartas();
    }
  }

  // ---------------- Comida y agua ----------------

  soltarComida(x, y) {
    // Si ya hay demasiada, se quita la que está más lejos del perro
    const lista = this.comidas.getChildren();
    if (lista.length >= CONFIG.COMIDA_MAXIMA) {
      let lejana = null;
      let dMax = -1;
      lista.forEach((c) => {
        const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, c.x, c.y);
        if (d > dMax) { dMax = d; lejana = c; }
      });
      if (lejana) lejana.destroy();
    }
    const comida = agregarSprite(this, x, y, Phaser.Math.RND.pick(['sopaipilla', 'pan']));
    comida.setDepth(3);
    this.comidas.add(comida);
  }

  aparecerComida(delta) {
    // De vez en cuando, en algún lugar libre cerca del perro
    this.esperaComida += delta;
    if (this.esperaComida >= CONFIG.COMIDA_CADA_MS / (1 + bonusArbol(this, 'COMIDA_RAPIDEZ'))) { // Árbol: Huele la comida
      this.esperaComida = 0;
      for (let intento = 0; intento < 15; intento++) {
        const ang = Math.random() * Math.PI * 2;
        const d = Phaser.Math.Between(150, Math.max(150, CONFIG.COMIDA_DISTANCIA));
        const x = this.perro.x + Math.cos(ang) * d;
        const y = this.perro.y + Math.sin(ang) * d;
        if (this.plaza.libre(x, y, 20)) {
          this.soltarComida(x, y);
          break;
        }
      }
    }

    // Más seguido junto al basurero más cercano (si no tiene comida al lado)
    this.esperaBasurero += delta;
    if (this.esperaBasurero >= CONFIG.BASURERO_COMIDA_CADA_MS) {
      this.esperaBasurero = 0;
      let basurero = null;
      let dMin = Infinity;
      this.plaza.basureros.forEach((b) => {
        const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, b.x, b.y);
        if (d < dMin) { dMin = d; basurero = b; }
      });
      if (!basurero || dMin > CONFIG.BASURERO_DISTANCIA) return;
      const yaHay = this.comidas.getChildren().some((c) =>
        Phaser.Math.Distance.Between(c.x, c.y, basurero.x, basurero.y) < 90);
      if (yaHay) return;
      for (let intento = 0; intento < 10; intento++) {
        const ang = Math.random() * Math.PI * 2;
        const d = Phaser.Math.Between(35, 60);
        const x = basurero.x + Math.cos(ang) * d;
        const y = basurero.y + Math.sin(ang) * d;
        if (this.plaza.libre(x, y, 10)) {
          this.soltarComida(x, y);
          break;
        }
      }
    }
  }

  // Comer: solo si le falta vida (si no, la comida queda en el suelo)
  comer() {
    const alcance = this.base.RADIO + 14;
    this.comidas.getChildren().slice().forEach((comida) => {
      if (this.vida >= this.vidaMax) return;
      if (Phaser.Math.Distance.Between(this.perro.x, this.perro.y, comida.x, comida.y) <= alcance) {
        comida.destroy();
        // Zapatilla perdida: cura más. Árbol (Estómago de fierro): cura un % más
        const cura = (CONFIG.COMIDA_CURA + bonusColeccion('zapatilla', 'COMIDA_CURA')) * (1 + bonusArbol(this, 'COMIDA'));
        this.curar(Math.round(cura), '#9ccc65');
      }
    });
  }

  // Tomar agua: cura de a poco mientras el perro está pegado a la pileta
  beberAgua(delta) {
    const c = this.plaza.centro;
    const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, c.x, c.y);
    if (d > CONFIG.PILETA_RADIO + this.base.RADIO + CONFIG.AGUA_DISTANCIA || this.vida >= this.vidaMax) {
      this.esperaAgua = 0;
      return;
    }
    this.esperaAgua += delta;
    // Mantita cuadrillé: la pileta cura más rápido
    if (this.esperaAgua >= CONFIG.AGUA_CURA_CADA_MS / (1 + bonusColeccion('mantita', 'PILETA_RAPIDEZ') + bonusArbol(this, 'COMIDA'))) {
      this.esperaAgua = 0;
      this.curar(CONFIG.AGUA_CURA, '#81d4fa');
    }
  }

  // Sube la vida y muestra "+N" flotando sobre el perro
  curar(cantidad, color) {
    const antes = this.vida;
    this.vida = Math.min(this.vidaMax, this.vida + cantidad);
    const ganado = this.vida - antes;
    if (ganado <= 0) return;
    const texto = this.add.text(this.perro.x, this.perro.y - 32, '+' + ganado, {
      fontFamily: FUENTE, fontSize: '16px', color, fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(950);
    this.tweens.add({
      targets: texto,
      y: texto.y - 25,
      alpha: 0,
      duration: 700,
      onComplete: () => texto.destroy()
    });
  }

  // ---------------- Objetos con rareza (src/objetos.js) ----------------

  // Sortea una rareza según su PESO en config.js.
  // "minima": si se da, solo sale esa rareza o una mejor (para los élites).
  sortearRareza(minima) {
    const desde = minima ? Math.max(0, RAREZAS.findIndex((r) => r.id === minima)) : 0;
    const posibles = RAREZAS.slice(desde).filter((r) => CONFIG.RAREZAS[r.id] && CONFIG.RAREZAS[r.id].PESO > 0);
    if (posibles.length === 0) return RAREZAS[RAREZAS.length - 1].id;
    const total = posibles.reduce((suma, r) => suma + CONFIG.RAREZAS[r.id].PESO, 0);
    let sorteo = Math.random() * total;
    for (const r of posibles) {
      sorteo -= CONFIG.RAREZAS[r.id].PESO;
      if (sorteo < 0) return r.id;
    }
    return posibles[posibles.length - 1].id;
  }

  // Deja un objeto en el suelo, con brillo del color de su rareza.
  // Si objetoId es null, se elige un objeto al azar.
  soltarObjeto(x, y, objetoId, rarezaId) {
    const objeto = objetoId ? buscarObjeto(objetoId) : Phaser.Math.RND.pick(OBJETOS);
    const rareza = buscarRareza(rarezaId);
    if (!this.plaza.libre(x, y, 8)) {
      const lugar = this.plaza.buscarLibre(x, y, 12);
      x = lugar.x;
      y = lugar.y;
    }

    // Va encima de la oscuridad para que se vea brillar de noche
    const brillo = this.add.image(0, 0, 'brillo_objeto').setScale(ESCALA_PIXEL).setTint(rareza.color);
    const borde = this.add.image(0, 0, texturaBorde(this, objeto.id), 0).setScale(2).setTint(rareza.color);
    const icono = this.add.image(0, 0, objeto.id, 0).setScale(2);
    const cosa = this.add.container(x, y, [brillo, borde, icono]).setDepth(805);
    cosa.objetoId = objeto.id;
    cosa.rarezaId = rareza.id;
    cosa.avisoLleno = false;
    cosa.proximaChispa = 0;
    this.objetosSuelo.add(cosa);
    // al recogerlo, se detienen sus animaciones
    cosa.once('destroy', () => this.tweens.killTweensOf([brillo, borde, icono]));

    // Flota un poquito arriba y abajo
    this.tweens.add({ targets: [borde, icono], y: -4, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    // Raro o mejor: el brillo palpita (destella)
    if (rareza.destella) {
      this.tweens.add({ targets: brillo, alpha: 0.35, scale: ESCALA_PIXEL * 1.25, duration: 450, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: borde, alpha: 0.3, duration: 300, yoyo: true, repeat: -1 });
    }
    return cosa;
  }

  // Pasar encima de un objeto lo recoge; los raros o mejores sueltan chispitas
  recogerObjetos() {
    const alcance = this.base.RADIO + CONFIG.OBJETO_RECOGER;
    const ahora = this.tiempoSobrevivido;
    this.objetosSuelo.getChildren().slice().forEach((cosa) => {
      if (Phaser.Math.Distance.Between(this.perro.x, this.perro.y, cosa.x, cosa.y) <= alcance) {
        if (this.recogerObjeto(cosa.objetoId, cosa.rarezaId)) {
          cosa.destroy();
          return;
        }
        if (!cosa.avisoLleno) {
          cosa.avisoLleno = true;
          this.textoFlotante('¡Inventario lleno!', '#ff8a80');
        }
      }

      const rareza = buscarRareza(cosa.rarezaId);
      if (rareza.destella && ahora >= cosa.proximaChispa) {
        cosa.proximaChispa = ahora + Phaser.Math.Between(250, 600);
        const chispa = this.add.image(
          cosa.x + Phaser.Math.Between(-20, 20), cosa.y + Phaser.Math.Between(-22, 14), 'chispa', 0
        ).setScale(2).setTint(rareza.color).setDepth(806);
        this.tweens.add({ targets: chispa, alpha: 0, scale: 0.5, duration: 500, onComplete: () => chispa.destroy() });
      }
    });
  }

  // Suma niveles al objeto según la rareza. Devuelve false si no cabe en el inventario.
  recogerObjeto(objetoId, rarezaId) {
    const rareza = buscarRareza(rarezaId);
    const cfgRareza = CONFIG.RAREZAS[rareza.id] || { SUBE: 1 };
    const max = CONFIG.OBJETO_NIVEL_MAX;

    if (this.objetos[objetoId] === undefined) {
      if (this.inventario.length >= CONFIG.INVENTARIO_MAX) return false;
      this.inventario.push(objetoId);
      this.objetos[objetoId] = 0;
    }

    const antes = this.objetos[objetoId];
    const sube = cfgRareza.SUBE === 'max' ? max : (cfgRareza.SUBE || 1);
    const ahora = Math.min(max, antes + sube);
    const ganados = ahora - antes;
    this.objetos[objetoId] = ahora;

    // Frazada: más vida máxima (y te cura lo mismo)
    if (objetoId === 'frazada' && ganados > 0) {
      const extra = ganados * CONFIG.OBJETOS.frazada.VIDA;
      this.vidaMax += extra;
      this.vida = Math.min(this.vidaMax, this.vida + extra);
    }

    const nombre = buscarObjeto(objetoId).nombre;
    const nivelTexto = ahora >= max ? 'MAX' : 'Nv ' + ahora;
    this.textoFlotante(nombre + ' ' + (ganados > 0 ? nivelTexto : '(ya al máximo)'), rareza.colorTexto);

    // Legendario: además cura toda la vida
    if (cfgRareza.CURA_TODO) this.curar(this.vidaMax - this.vida, '#ffd54f');

    this.actualizarInventario();
    this.revisarSinergias();
    return true;
  }

  // Texto que sube y se desvanece sobre el perro
  textoFlotante(texto, color) {
    // si salen varios casi al mismo tiempo, se apilan para no taparse
    const ahora = this.tiempoSobrevivido;
    this.pilaFlotante = ahora - (this.ultimoFlotante || -9999) < 400 ? (this.pilaFlotante || 0) + 1 : 0;
    this.ultimoFlotante = ahora;
    const t = this.add.text(this.perro.x, this.perro.y - 50 - this.pilaFlotante * 20, texto, {
      fontFamily: FUENTE, fontSize: '16px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(950);
    this.tweens.add({ targets: t, y: t.y - 30, alpha: 0, duration: 1200, onComplete: () => t.destroy() });
  }

  // Efectos de los objetos que pasan con el tiempo
  // (Collar viejo está en recibirGolpe, Pelota en velocidadPerro,
  //  Placa en moverHuesos y Frazada en recogerObjeto)
  efectosObjetos(delta) {
    // Hueso de caracú: recupera vida de a poco
    const caracu = this.nivelObjeto('caracu');
    if (caracu > 0) {
      this.esperaCaracu += delta;
      if (this.esperaCaracu >= CONFIG.OBJETOS.caracu.CADA_MS / this.multiplicadorRegeneracion()) {
        this.esperaCaracu = 0;
        this.vida = Math.min(this.vidaMax, this.vida + caracu * CONFIG.OBJETOS.caracu.CURA);
      }
    }
  }

  // Fusión "Estampida": al moverse deja huellas que dañan a los enemigos que las pisan
  actualizarEstampida(delta) {
    const cfg = CONFIG.FUSIONES.estampida;
    const ahora = this.tiempoSobrevivido;

    // Borrar las huellas viejas
    this.rastro = this.rastro.filter((h) => {
      if (ahora < h.hasta) return true;
      h.imagen.destroy();
      return false;
    });
    if (!this.fusiones.estampida) return;

    const v = this.perro.body.velocity;
    this.esperaHuella += delta;
    if (v.x * v.x + v.y * v.y > 100 && this.esperaHuella >= cfg.HUELLA_CADA_MS) {
      this.esperaHuella = 0;
      const imagen = this.add.image(this.perro.x, this.perro.y, 'huella', 0)
        .setScale(ESCALA_PIXEL).setDepth(2).setRotation(Math.atan2(v.y, v.x) + Math.PI / 2);
      this.tweens.add({ targets: imagen, alpha: 0.15, duration: cfg.HUELLA_DURA_MS });
      this.rastro.push({ imagen, x: this.perro.x, y: this.perro.y, hasta: ahora + cfg.HUELLA_DURA_MS });
    }

    this.esperaGolpeRastro += delta;
    if (this.esperaGolpeRastro < cfg.GOLPE_CADA_MS || this.rastro.length === 0) return;
    this.esperaGolpeRastro = 0;
    this.enemigos.getChildren().slice().forEach((enemigo) => {
      const pisa = this.rastro.some((h) =>
        Phaser.Math.Distance.Between(h.x, h.y, enemigo.x, enemigo.y) <= cfg.HUELLA_RADIO + enemigo.radio);
      if (pisa) this.danarEnemigo(enemigo, cfg.DANO);
    });
  }

  // Fusión "Cuero de calle": anillo café alrededor del perro mientras está activo
  dibujarEscudo() {
    this.escudo.clear();
    if (!this.fusiones.cuero || this.tiempoSobrevivido >= this.cueroHasta) return;
    this.escudo.lineStyle(3, 0xc8935a, 0.9);
    this.escudo.strokeCircle(this.perro.x, this.perro.y, this.base.RADIO + 10);
  }

  // ---------------- Fusiones ----------------

  // Fusiones que se pueden elegir ahora: instinto al máximo + objeto al máximo
  fusionesDisponibles() {
    return FUSIONES.filter((f) =>
      !this.fusiones[f.id] &&
      this.instintos[f.instinto] >= CONFIG.INSTINTO_NIVEL_MAX &&
      this.nivelObjeto(f.objeto) >= CONFIG.OBJETO_NIVEL_MAX);
  }

  aplicarFusion(id) {
    this.fusiones[id] = true;
    const fusion = FUSIONES.find((f) => f.id === id);
    this.mostrarAviso('¡Fusión: ' + (fusion ? fusion.nombre : id) + '!', '#ffd54f');
    this.actualizarInventario();
  }

  // ---------------- Cartas de instintos ----------------

  instintosDisponibles() {
    return INSTINTOS.filter((inst) => this.instintos[inst.id] < CONFIG.INSTINTO_NIVEL_MAX);
  }

  mostrarCartas() {
    // Primero las fusiones disponibles (cartas doradas), y el resto instintos al azar
    const fusiones = this.fusionesDisponibles().slice(0, 3).map((f) => ({ fusion: f }));
    const instintos = Phaser.Utils.Array.Shuffle(this.instintosDisponibles().slice()).slice(0, 3 - fusiones.length);
    const opciones = fusiones.concat(instintos);

    // Si ya tiene todos los instintos al máximo, no hay nada que elegir
    if (opciones.length === 0) {
      this.nivelesPendientes = 0;
      return;
    }

    this.eligiendo = true;
    this.physics.pause();
    this.anims.pauseAll(); // todos quietos mientras eliges
    this.perro.setAlpha(1);
    this.actualizarHUD();

    // Olvidar teclas 1/2/3 que se hayan presionado antes de abrir las cartas
    this.teclasCartas.forEach((tecla) => Phaser.Input.Keyboard.JustDown(tecla));

    const w = this.scale.width;
    const h = this.scale.height;
    const capa = []; // todo lo que se dibuja para las cartas

    capa.push(this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.65));
    capa.push(this.add.text(w / 2, 90, '¡Subiste a nivel ' + this.nivel + '!', {
      fontFamily: FUENTE, fontSize: '36px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5));
    const como = modoTactil() ? '(toca una carta)' : '(clic o teclas 1, 2, 3)';
    const titulo = fusiones.length > 0
      ? '¡Fusión disponible! Elige una carta ' + como
      : 'Elige un instinto ' + como;
    // En celular, las cartas no se pueden tocar hasta pasado un ratito (evita toques sin querer)
    this.cartasListasEn = this.time.now + (modoTactil() ? CONFIG.MOVIL.CARTAS_ESPERA_MS : 0);
    capa.push(this.add.text(w / 2, 130, titulo, {
      fontFamily: FUENTE, fontSize: '18px', color: '#dddddd'
    }).setOrigin(0.5));

    const anchoCarta = 240;
    const altoCarta = 260;
    const separacion = 270;
    const inicioX = w / 2 - ((opciones.length - 1) * separacion) / 2;
    const cy = 320;

    this.cartas = opciones.map((inst, i) => {
      const cx = inicioX + i * separacion;
      if (inst.fusion) {
        capa.push(...this.dibujarCartaFusion(inst.fusion, i, cx, cy, anchoCarta, altoCarta));
        return inst;
      }
      const nivelActual = this.instintos[inst.id];

      const fondo = this.add.rectangle(cx, cy, anchoCarta, altoCarta, 0x2b2b3a)
        .setStrokeStyle(3, 0x888899)
        .setInteractive({ useHandCursor: true });
      fondo.on('pointerover', () => fondo.setStrokeStyle(3, COLOR_HUESO));
      fondo.on('pointerout', () => fondo.setStrokeStyle(3, 0x888899));
      fondo.on('pointerdown', () => this.tocarCarta(i));

      const tecla = this.add.text(cx, cy - 105, '[' + (i + 1) + ']', {
        fontFamily: FUENTE, fontSize: '18px', color: '#aaaaaa'
      }).setOrigin(0.5);

      const nombre = this.add.text(cx, cy - 65, inst.nombre, {
        fontFamily: FUENTE, fontSize: '24px', color: '#ffe082', fontStyle: 'bold'
      }).setOrigin(0.5);

      const frase = this.add.text(cx, cy, inst.frase, {
        fontFamily: FUENTE, fontSize: '17px', color: '#ffffff', align: 'center',
        wordWrap: { width: anchoCarta - 30 }
      }).setOrigin(0.5);

      const textoNivel = nivelActual === 0
        ? '¡Nuevo!'
        : 'Nivel actual: ' + nivelActual + ' / ' + CONFIG.INSTINTO_NIVEL_MAX;
      const nivel = this.add.text(cx, cy + 95, textoNivel, {
        fontFamily: FUENTE, fontSize: '16px', color: '#9ccc65'
      }).setOrigin(0.5);

      capa.push(fondo, tecla, nombre, frase, nivel);
      return inst;
    });

    capa.forEach((obj) => obj.setScrollFactor(0).setDepth(3000));
    this.capaCartas = capa;
  }

  // Carta dorada de fusión: muestra qué combinación la desbloqueó
  dibujarCartaFusion(fusion, i, cx, cy, anchoCarta, altoCarta) {
    const inst = INSTINTOS.find((x) => x.id === fusion.instinto) || { nombre: fusion.instinto };
    const obj = buscarObjeto(fusion.objeto);

    const fondo = this.add.rectangle(cx, cy, anchoCarta, altoCarta, 0x4a3a12)
      .setStrokeStyle(4, 0xffd54f)
      .setInteractive({ useHandCursor: true });
    fondo.on('pointerover', () => fondo.setStrokeStyle(5, 0xffffff));
    fondo.on('pointerout', () => fondo.setStrokeStyle(4, 0xffd54f));
    fondo.on('pointerdown', () => this.tocarCarta(i));

    const tecla = this.add.text(cx, cy - 108, '[' + (i + 1) + ']  FUSIÓN', {
      fontFamily: FUENTE, fontSize: '16px', color: '#ffd54f', fontStyle: 'bold'
    }).setOrigin(0.5);
    const nombre = this.add.text(cx, cy - 75, fusion.nombre, {
      fontFamily: FUENTE, fontSize: '26px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5);
    const frase = this.add.text(cx, cy - 15, fusion.frase, {
      fontFamily: FUENTE, fontSize: '16px', color: '#ffffff', align: 'center',
      wordWrap: { width: anchoCarta - 30 }
    }).setOrigin(0.5);
    const combinacion = this.add.text(cx, cy + 75,
      inst.nombre + ' (Nv ' + CONFIG.INSTINTO_NIVEL_MAX + ')\n+ ' + obj.nombre + ' (Nv ' + CONFIG.OBJETO_NIVEL_MAX + ')', {
        fontFamily: FUENTE, fontSize: '14px', color: '#ffcc80', align: 'center',
        wordWrap: { width: anchoCarta - 20 }
      }).setOrigin(0.5);
    // ícono del objeto que se fusiona
    const icono = this.add.image(cx, cy + 32, fusion.objeto, 0).setScale(2);

    // La carta palpita para que se note
    this.tweens.add({ targets: fondo, alpha: 0.8, duration: 500, yoyo: true, repeat: -1 });
    return [fondo, tecla, nombre, frase, icono, combinacion];
  }

  // Clic o toque en una carta (ignora toques justo cuando recién aparecen)
  tocarCarta(indice) {
    if (this.time.now < (this.cartasListasEn || 0)) return;
    this.elegirCarta(indice);
  }

  elegirCarta(indice) {
    if (!this.eligiendo) return;
    const inst = this.cartas[indice];
    if (!inst) return;

    if (inst.fusion) this.aplicarFusion(inst.fusion.id);
    else this.aplicarInstinto(inst.id);

    this.capaCartas.forEach((obj) => { this.tweens.killTweensOf(obj); obj.destroy(); });
    this.capaCartas = [];
    this.cartas = [];
    this.eligiendo = false;
    this.nivelesPendientes--;

    // Si subió varios niveles de golpe, mostrar las siguientes cartas
    if (this.nivelesPendientes > 0) {
      this.mostrarCartas();
      if (this.eligiendo) return;
    }

    this.physics.resume();
    this.anims.resumeAll();
    this.actualizarHUD();
  }

  aplicarInstinto(id) {
    this.instintos[id]++;

    if (id === 'pellejoDuro') {
      this.vidaMax += CONFIG.PELLEJO_VIDA;
      this.vida = Math.min(this.vidaMax, this.vida + CONFIG.PELLEJO_CURA);
    }
    if (id === 'ladrido' && this.instintos.ladrido === 1) {
      this.esperaLadrido = 0;
    }
    this.revisarSinergias();
  }

  // ---------------- Sinergias (src/sinergias.js) ----------------

  // Avisa cuando se activa una sinergia nueva. El bonus en sí se aplica
  // solo (en velocidadPerro, danoMordida y multiplicadorRegeneracion).
  revisarSinergias() {
    SINERGIAS.forEach((s) => {
      if (this.sinergiasActivas[s.id] || !sinergiaActiva(this, s)) return;
      this.sinergiasActivas[s.id] = true;
      this.mostrarAviso('¡Sinergia: ' + s.nombre + '! ' + textoBonusSinergia(s), '#9ccc65');
    });
  }

  // ---------------- Vida ----------------

  recibirGolpe(perro, enemigo) {
    if (this.gameOver || this.eligiendo || this.pausado || this.amaneciendo) return; // al amanecer ya nadie ataca
    if (this.enSprint()) return; // el Galgo no recibe daño ni lo atrapan durante el sprint

    const cfg = enemigo.cfg;
    const ahora = this.tiempoSobrevivido;

    // La Perrera no hace daño: te deja quieto un momento
    if (cfg.COMPORTAMIENTO === 'atrapar') {
      if (ahora < enemigo.recargaHasta || ahora < enemigo.aturdidoHasta) return;
      if (bonusArbol(this, 'INAMOVIBLE') > 0) return; // Inamovible (Pitbull): no lo pueden atrapar
      // Gorro de lana: te deja atrapado menos rato
      this.atrapadoHasta = ahora + cfg.ATRAPA_MS * Math.max(0, 1 - bonusColeccion('gorro', 'MENOS_LENTITUD'));
      enemigo.recargaHasta = ahora + cfg.RECARGA_MS;
      return;
    }

    if (!cfg.DANO || cfg.DANO <= 0) return;
    if (ahora < this.invulnerableHasta) return;
    if (this.efectoZona.segura) return; // Zona segura: no recibe daño

    // Antifaz: a veces esquiva el golpe
    // Árbol (Quiebre de cintura...): más probabilidad. Reflejos: el sprint queda listo
    if (Math.random() < bonusColeccion('antifaz', 'ESQUIVAR') + bonusArbol(this, 'ESQUIVAR')) {
      this.invulnerableHasta = ahora + CONFIG.PERRO_INVULNERABLE_MS + bonusArbol(this, 'REFLEJOS_MS');
      if (bonusArbol(this, 'REFLEJOS_MS') > 0 && this.poder === 'sprint') this.poderCarga = this.poderEsperaTotal;
      this.textoFlotante('¡Esquivado!', '#e1bee7');
      return;
    }

    // Collar viejo: menos daño por nivel. Cuero de calle: la mitad si está activo.
    let dano = cfg.DANO * Math.max(0, 1 - this.nivelObjeto('collar') * CONFIG.OBJETOS.collar.MENOS_DANO);
    if (this.fusiones.cuero && ahora < this.cueroHasta) dano *= CONFIG.FUSIONES.cuero.MULTIPLICADOR;
    // Zona peligrosa: el doble de daño
    if (this.efectoZona.peligro) dano *= CONFIG.ZONAS.peligro.DANO_MULTIPLICADOR || 1;
    // Chalequito reflectante: menos daño de las embestidas (Drogadicto y Jefe)
    if (enemigo.estado === 'embestir') dano *= Math.max(0, 1 - bonusColeccion('chalequito', 'MENOS_DANO_EMBESTIDA'));
    // Collar antipulgas: menos daño de la manada y de los perros rivales
    const antipulgas = CONFIG.COLECCIONABLES.antipulgas;
    if (antipulgas && (antipulgas.TIPOS || []).includes(enemigo.tipo)) {
      dano *= Math.max(0, 1 - bonusColeccion('antipulgas', 'MENOS_DANO'));
    }
    // Árbol: Piel gruesa (menos daño), Inamovible (embestidas) y Manada (enemigos cerca)
    dano *= Math.max(0, 1 - this.reduccionArbol());
    if (enemigo.estado === 'embestir') dano *= Math.max(0, 1 - bonusArbol(this, 'INAMOVIBLE'));
    dano = Math.max(1, Math.round(dano));

    this.vida = Math.max(0, this.vida - dano);
    this.invulnerableHasta = this.tiempoSobrevivido + CONFIG.PERRO_INVULNERABLE_MS;
    if (this.fusiones.cuero) this.cueroHasta = ahora + CONFIG.FUSIONES.cuero.DURACION_MS;
    this.cameras.main.shake(100, 0.005);

    if (this.vida <= 0 && !salvarseArbol(this)) { // Siete vidas (Quiltro, src/arbol.js)
      this.terminarJuego();
    }
  }

  // Reducción de daño del árbol (sin contar Inamovible, que es solo para embestidas)
  reduccionArbol() {
    return Math.min(0.9, bonusArbol(this, 'MENOS_DANO') + bonusArbol(this, 'GRUPO_DEFENSA') * enemigosCercaArbol(this));
  }

  // victoria = true: sobreviviste la noche; si no, Game Over
  terminarJuego(victoria) {
    this.gameOver = true;
    this.avisosJefe.clear();
    dibujarBarraJefe(this, null);
    if (this.capaAvisoGrande) this.capaAvisoGrande.forEach((t) => { this.tweens.killTweensOf(t); t.destroy(); });
    this.capaAvisoGrande = null;
    this.physics.pause();
    this.anims.pauseAll();
    this.perro.setAlpha(1);
    this.flechas.clear();
    this.avisos.clear();
    this.jaula.clear();
    this.escudo.clear();
    limpiarZonas(this);
    ocultarDesafio(this);
    this.actualizarHUD();
    // el inventario se oculta: los objetos salen escritos en el Game Over
    this.capaInventario.forEach((obj) => obj.destroy());
    this.capaInventario = [];

    // Olvidar R o M presionadas durante la partida (si no, actuarían al instante)
    Phaser.Input.Keyboard.JustDown(this.teclaR);
    Phaser.Input.Keyboard.JustDown(this.teclaM);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(2000);

    const lineas = [
      victoria
        ? { texto: '¡Sobreviviste la noche!', y: 62, tam: '50px', color: '#ffd54f', negrita: true }
        : { texto: 'Game Over', y: 62, tam: '60px', color: '#ff5555', negrita: true },
      { texto: 'Raza: ' + this.textosRaza.nombre, y: 122, tam: '24px', color: '#ffe082' },
      { texto: 'Sobreviviste: ' + this.formatearTiempo(this.tiempoSobrevivido) + '     Nivel alcanzado: ' + this.nivel,
        y: 156, tam: '22px', color: '#ffffff' },
      { texto: 'Enemigos derrotados: ' + this.derrotados, y: 196, tam: '22px', color: '#ffffff', negrita: true }
    ];

    // Una línea por cada tipo de enemigo
    let y = 226;
    this.listaEnemigos().forEach((e) => {
      lineas.push({ texto: e.nombre + ': ' + (this.derrotadosPorTipo[e.id] || 0), y, tam: '17px', color: '#cccccc' });
      y += 21;
    });
    if (this.jefeAparecido) {
      lineas.push({ texto: NOMBRE_JEFE + ': ' + (this.jefeDerrotado ? 'derrotado' : 'sigue vivo'),
        y, tam: '17px', color: this.jefeDerrotado ? '#ffd54f' : '#ff8a80', negrita: this.jefeDerrotado });
      y += 21;
    }

    // Objetos que tenías y fusiones logradas
    const objetos = this.inventario.map((id) => {
      const nivel = this.objetos[id];
      return buscarObjeto(id).nombre + ' ' + (nivel >= CONFIG.OBJETO_NIVEL_MAX ? 'MAX' : 'Nv ' + nivel);
    });
    const fusiones = FUSIONES.filter((f) => this.fusiones[f.id]).map((f) => f.nombre);
    y += 8;
    lineas.push({ texto: 'Objetos: ' + (objetos.length ? objetos.join(' · ') : 'ninguno'),
      y, tam: '17px', color: '#90caf9', ancho: 900 });
    y += objetos.length > 3 ? 44 : 28;
    lineas.push({ texto: 'Fusiones: ' + (fusiones.length ? fusiones.join(' · ') : 'ninguna'),
      y, tam: '18px', color: '#ffd54f', negrita: fusiones.length > 0 });
    y += 26;
    const completados = this.desafiosCompletados.length;
    const ultras = this.ultrasPartida.length;
    lineas.push({ texto: 'Desafíos completados: ' + completados + (this.desafiosFallidos ? '   (fallidos: ' + this.desafiosFallidos + ')' : '') +
      (ultras ? '     ·     Ultra raros: ' + ultras : ''),
      y, tam: '18px', color: '#9ccc65', negrita: completados > 0 || ultras > 0 });

    // Huesitos: se suman al total guardado ahora mismo (src/huesitos.js)
    const huesitos = cobrarHuesitos(this, victoria);
    y += 28;
    lineas.push({ texto: 'Huesitos de la partida: +' + huesitos.total + '     ·     Total guardado: ' + huesitosGuardados(),
      y, tam: '19px', color: '#f2d64b', negrita: true });
    y += 21;
    lineas.push({ texto: textoDesgloseHuesitos(huesitos), y, tam: '14px', color: '#e6d28a', ancho: 900 });

    // Ranking online (src/online.js): se envía solo, arriba a la derecha dice cómo le fue
    this.enviarAlRanking(victoria);


    lineas.forEach((l) => {
      const estilo = { fontFamily: FUENTE, fontSize: l.tam, color: l.color, fontStyle: l.negrita ? 'bold' : 'normal', align: 'center' };
      if (l.ancho) estilo.wordWrap = { width: l.ancho };
      this.add.text(cx, l.y, l.texto, estilo).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    });

    // Botones (se pueden tocar o clickear; también funcionan R y M)
    const tecla = (t) => (modoTactil() ? '' : ' (' + t + ')'); // en celular no se muestran las teclas
    const botones = [
      { texto: 'Reiniciar' + tecla('R'), color: 0x9ccc65, accion: () => this.scene.restart({ raza: this.razaId }) }
    ];
    if (CONFIG.APUESTAS.EN_FIN_DE_PARTIDA) {
      botones.push({ texto: 'Rincón de apuestas' + tecla('M'), color: 0xf2d64b, accion: () => this.scene.start('ApuestasScene', { modo: 'fin' }) });
      botones.push({ texto: 'Menú', color: 0xffd54f, accion: () => this.scene.start('MenuScene') });
    } else {
      botones.push({ texto: 'Menú' + tecla('M'), color: 0xffd54f, accion: () => this.scene.start('MenuScene') });
    }
    const anchoB = 250;
    const sepB = 270;
    botones.forEach((b, i) => {
      const bx = cx + (i - (botones.length - 1) / 2) * sepB;
      botonPantalla(this, bx, 518, anchoB, 34, b.texto, b.color, b.accion, 17)
        .forEach((o) => o.setScrollFactor(0).setDepth(2002));
    });
  }

  // Puntaje de la partida y envío al ranking (si hay sesión y no es de prueba)
  enviarAlRanking(victoria) {
    const datos = datosPartida(this, victoria);
    // Columna a la derecha, debajo del título (ahí no tapa ningún texto)
    const ancho = 180;
    const cx = this.scale.width - margenHUD() - ancho / 2;
    const fijo = (o) => o.setScrollFactor(0).setDepth(2001);
    fijo(this.add.text(cx, 112, 'PUNTAJE', {
      fontFamily: FUENTE, fontSize: '14px', color: '#cfd8dc', fontStyle: 'bold'
    }).setOrigin(0.5, 0));
    const numero = fijo(this.add.text(cx, 130, '', {
      fontFamily: FUENTE, fontSize: '28px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0));
    const texto = fijo(this.add.text(cx, 166, '', {
      fontFamily: FUENTE, fontSize: '14px', color: '#ffffff', fontStyle: 'bold', align: 'center',
      stroke: '#000000', strokeThickness: 3, wordWrap: { width: ancho }
    }).setOrigin(0.5, 0));
    const poner = (estado, color) => {
      if (!texto.active) return; // ya se fue de esta pantalla
      numero.setText(Number(datos.puntaje).toLocaleString('es-CL'));
      texto.setText(estado).setColor(color);
    };

    if (this.partidaDePrueba) {
      poner('Partida de prueba (usaste teclas de prueba): no se envía al ranking', '#ffb74d');
    } else if (!onlineDisponible()) {
      poner(TEXTO_SOLO_ONLINE, '#b0bec5');
    } else if (!ONLINE.usuario) {
      poner('Entra con Google en el menú para aparecer en el ranking', '#b0bec5');
    } else if (!ONLINE.apodo) {
      poner('Elige tu apodo en el menú para aparecer en el ranking', '#b0bec5');
    } else {
      poner('Enviando al ranking...', '#cfd8dc');
      enviarPartida(datos)
        .then((guardado) => {
          datos.puntaje = guardado;
          poner('Puntaje enviado ✓', '#9ccc65');
        })
        .catch((e) => poner('No se pudo enviar: ' + e.message, '#ef9a9a'));
    }
  }

  // Tipos de enemigo con nombre (src/enemigos.js) y números (config.js)
  listaEnemigos() {
    const conNombre = ENEMIGOS.filter((e) => CONFIG.ENEMIGOS[e.id]);
    const sinNombre = Object.keys(CONFIG.ENEMIGOS)
      .filter((id) => !ENEMIGOS.some((e) => e.id === id))
      .map((id) => ({ id, nombre: id }));
    return conNombre.concat(sinNombre);
  }

  // ---------------- Pantalla (HUD) ----------------

  crearHUD() {
    const estilo = { fontFamily: FUENTE, fontSize: '18px', color: '#ffffff' };
    // Margen desde los bordes: 12 en PC, MOVIL.MARGEN_HUD en celular (src/tactil.js)
    const m = margenHUD();
    const e = margenExtra(); // lo que se baja todo en celular (0 en PC)
    this.margenHud = m;
    this.margenHudExtra = e;

    // Barra de experiencia arriba de todo
    this.barraXP = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoNivel = this.add.text(this.scale.width / 2, 20 + e, '', { ...estilo, fontStyle: 'bold' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

    this.add.text(m, 20 + e, 'Lomito Survivor - v' + VERSION_JUEGO, estilo)
      .setScrollFactor(0).setDepth(1000);
    if (!modoTactil()) { // en celular está el botón de pausa
      this.add.text(12, this.scale.height - 10, 'P / Esc: pausa', { ...estilo, fontSize: '13px', color: '#9e9e9e' })
        .setOrigin(0, 1).setScrollFactor(0).setDepth(1000);
    }

    this.barraVida = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoVida = this.add.text(m + 100, 57 + e, '', { ...estilo, fontSize: '14px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Raza y poder
    const espera = this.poderEsperaTotal > 0 ? '' : ' (pasivo)';
    const poder = this.textosRaza.poder ? ' · ' + sinTeclas(this.textosRaza.poder) + espera : '';
    this.add.text(m, 74 + e, this.textosRaza.nombre + poder, { ...estilo, fontSize: '15px', color: '#ffe082' })
      .setScrollFactor(0).setDepth(1000);

    // Huesitos de la partida (src/huesitos.js), debajo del poder
    this.textoHuesitos = this.add.text(m, 108 + e, '', {
      ...estilo, fontSize: '15px', color: '#f2d64b', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    }).setScrollFactor(0).setDepth(1000);

    // Indicador de carga del poder (solo si tiene espera)
    this.barraPoder = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoPoder = this.add.text(m + 148, 96 + e, '', { ...estilo, fontSize: '14px' })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000);

    // Reloj de la noche (hora grande) y debajo la fase y el tiempo jugado
    this.textoTiempo = this.add.text(this.scale.width - m, 18 + e, '', {
      ...estilo, fontSize: '30px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);
    this.textoFase = this.add.text(this.scale.width - m, 56 + e, '', {
      ...estilo, fontSize: '14px', color: '#cfd8dc', stroke: '#000000', strokeThickness: 3
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Barra de vida del jefe (src/jefe.js), arriba al centro
    this.barraJefe = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoJefe = this.add.text(this.scale.width / 2, 42 + e, '', {
      ...estilo, fontSize: '17px', color: '#ffd54f', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1001).setVisible(false);

    // Inventario: fila de casillas abajo al centro
    this.capaInventario = [];
    this.actualizarInventario();

    this.actualizarHUD();
  }

  // Redibuja el inventario (solo cuando cambia algo: al recoger un objeto o lograr una fusión)
  actualizarInventario() {
    this.capaInventario.forEach((obj) => obj.destroy());
    this.capaInventario = [];

    const lado = 44;
    const espacio = 6;
    const total = CONFIG.INVENTARIO_MAX;
    const y = this.scale.height - 10 - (this.margenHudExtra || 0) - lado / 2;
    const inicioX = this.scale.width / 2 - ((total - 1) * (lado + espacio)) / 2;
    const max = CONFIG.OBJETO_NIVEL_MAX;
    const capa = [];

    for (let i = 0; i < total; i++) {
      const x = inicioX + i * (lado + espacio);
      const id = this.inventario[i];
      const nivel = id ? this.objetos[id] : 0;
      const alMaximo = id && nivel >= max;
      capa.push(this.add.rectangle(x, y, lado, lado, 0x000000, 0.6)
        .setStrokeStyle(2, alMaximo ? 0xffd54f : 0x888899, id ? 1 : 0.5));
      if (!id) continue;
      capa.push(this.add.image(x, y - 4, id, 0).setScale(2));
      capa.push(this.add.text(x + lado / 2 - 3, y + lado / 2 - 1, alMaximo ? 'MAX' : 'Nv' + nivel, {
        fontFamily: FUENTE, fontSize: '11px', color: alMaximo ? '#ffd54f' : '#ffffff', fontStyle: 'bold',
        stroke: '#000000', strokeThickness: 3
      }).setOrigin(1, 1));
    }

    // Fusiones logradas, encima de las casillas
    const fusiones = FUSIONES.filter((f) => this.fusiones[f.id]).map((f) => f.nombre);
    if (fusiones.length > 0) {
      capa.push(this.add.text(this.scale.width / 2, y - lado / 2 - 6, 'Fusiones: ' + fusiones.join(' · '), {
        fontFamily: FUENTE, fontSize: '14px', color: '#ffd54f', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5, 1));
    }

    capa.forEach((obj) => obj.setScrollFactor(0).setDepth(1000));
    this.capaInventario = capa;
  }

  actualizarHUD() {
    const w = this.scale.width;

    // Experiencia
    const porcentajeXP = Math.min(1, this.xp / this.xpParaSubir());
    this.barraXP.clear();
    this.barraXP.fillStyle(0x000000, 0.7);
    this.barraXP.fillRect(0, 0, w, 12);
    this.barraXP.fillStyle(COLOR_XP, 1);
    this.barraXP.fillRect(0, 0, w * porcentajeXP, 12);
    this.textoNivel.setText('Nivel ' + this.nivel);

    // Vida
    const ancho = 200;
    const alto = 18;
    const m = this.margenHud;
    const y = 48 + this.margenHudExtra;
    const porcentaje = this.vida / this.vidaMax;
    this.barraVida.clear();
    this.barraVida.fillStyle(0x000000, 0.6);
    this.barraVida.fillRect(m, y, ancho, alto);
    this.barraVida.fillStyle(porcentaje > 0.3 ? 0x4caf50 : 0xe53935, 1);
    this.barraVida.fillRect(m, y, ancho * porcentaje, alto);
    this.barraVida.lineStyle(2, COLOR_BLANCO, 0.8);
    this.barraVida.strokeRect(m, y, ancho, alto);
    this.textoVida.setText(this.vida + ' / ' + this.vidaMax);

    // Poder con espera
    if (this.poderEsperaTotal > 0) {
      const carga = this.poderCarga / this.poderEsperaTotal;
      const listo = this.poderListo();
      this.barraPoder.clear();
      this.barraPoder.fillStyle(0x000000, 0.6);
      const yp = 91 + this.margenHudExtra;
      this.barraPoder.fillRect(m, yp, 140, 10);
      this.barraPoder.fillStyle(listo ? COLOR_HUESO : 0x9e9e9e, 1);
      this.barraPoder.fillRect(m, yp, 140 * carga, 10);
      this.barraPoder.lineStyle(1, COLOR_BLANCO, 0.6);
      this.barraPoder.strokeRect(m, yp, 140, 10);

      if (listo) {
        this.textoPoder.setText(this.poder === 'sprint' ? sinTeclas('¡Listo! [Espacio]') : '¡Listo!');
        this.textoPoder.setColor('#ffe082');
      } else {
        const faltan = (this.poderEsperaTotal - this.poderCarga) / 1000;
        this.textoPoder.setText(faltan.toFixed(1) + ' s');
        this.textoPoder.setColor('#bbbbbb');
      }
    }

    this.textoHuesitos.setText('Huesitos: ' + huesitosDePartida(this));

    this.textoTiempo.setText(horaDeLaNoche(this.tiempoSobrevivido));
    const fase = datosFase(Math.max(0, this.faseActual)).NOMBRE;
    this.textoFase.setText((fase ? fase + ' · ' : '') + this.formatearTiempo(this.tiempoSobrevivido));
  }

  formatearTiempo(ms) {
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60);
    const seg = totalSeg % 60;
    return String(min).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
  }
}
