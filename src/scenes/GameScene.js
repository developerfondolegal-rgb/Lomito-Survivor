// Escena principal: la plaza donde el perro sobrevive la noche.
// Los números para ajustar el juego están en src/config.js
// Los textos de razas e instintos están en src/razas.js y src/instintos.js
// (FUENTE y dibujarPerro vienen de MenuScene.js)

const COLOR_ENEMIGO = 0xd63c3c;  // rojo
const COLOR_ATURDIDO = 0x9575cd; // morado: enemigo aturdido por la Mandíbula de hierro
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
    this.vidaMax = this.base.VIDA;
    this.vida = this.vidaMax;
    this.tiempoSobrevivido = 0;   // reloj del juego en ms (se detiene en pausa)
    this.invulnerableHasta = 0;
    this.sprintHasta = 0;
    this.ultimaDireccion = new Phaser.Math.Vector2(1, 0);
    this.gameOver = false;
    this.eligiendo = false;       // true mientras se muestran las cartas de instintos
    this.nivel = 1;
    this.xp = 0;
    this.nivelesPendientes = 0;
    this.derrotados = 0;
    this.esperaMordida = 0;
    this.esperaLadrido = 0;
    this.esperaAparicion = 0;
    this.esperaCura = 0;
    this.cartas = [];

    // Nivel de cada instinto (0 = no lo tiene)
    this.instintos = {};
    INSTINTOS.forEach((inst) => { this.instintos[inst.id] = 0; });

    // Por si venimos de un Game Over (la física quedó en pausa)
    this.physics.resume();

    // Mapa y cámara
    this.physics.world.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.cameras.main.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.dibujarSuelo();

    // El perro (con el color y tamaño de su raza)
    const dibujo = dibujarPerro(this, CONFIG.MAPA_ANCHO / 2, CONFIG.MAPA_ALTO / 2, this.base);
    this.perro = dibujo.cuerpo;
    this.manchas = dibujo.manchas;
    this.physics.add.existing(this.perro);
    this.perro.body.setCircle(this.base.RADIO);
    this.perro.body.setCollideWorldBounds(true);
    this.perro.setDepth(10);
    if (this.manchas) this.manchas.setDepth(11);
    this.cameras.main.startFollow(this.perro, true, 0.1, 0.1);

    // Enemigos
    this.enemigos = this.physics.add.group();
    this.physics.add.collider(this.enemigos, this.enemigos); // que no se amontonen en uno solo
    this.physics.add.overlap(this.perro, this.enemigos, this.recibirGolpe, null, this);

    // Huesos
    this.huesos = this.add.group();

    // Flechas del Rastreo (Beagle)
    this.flechas = this.add.graphics().setScrollFactor(0).setDepth(900);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.teclaR = this.input.keyboard.addKey('R');
    this.teclaM = this.input.keyboard.addKey('M');
    this.teclaEspacio = this.input.keyboard.addKey('SPACE');
    this.teclasCartas = [
      this.input.keyboard.addKey('ONE'),
      this.input.keyboard.addKey('TWO'),
      this.input.keyboard.addKey('THREE')
    ];

    this.crearHUD();
  }

  update(time, delta) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.teclaR)) {
        this.scene.restart({ raza: this.razaId }); // misma raza
      } else if (Phaser.Input.Keyboard.JustDown(this.teclaM)) {
        this.scene.start('MenuScene');             // volver al inicio
      }
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
    if (this.poderEsperaTotal > 0 && !this.enSprint()) {
      this.poderCarga = Math.min(this.poderEsperaTotal, this.poderCarga + delta);
    }

    // Sprint del Galgo
    if (this.poder === 'sprint' && Phaser.Input.Keyboard.JustDown(this.teclaEspacio) && this.poderListo()) {
      this.iniciarSprint();
    }

    this.moverPerro();
    this.moverEnemigos();
    this.moverHuesos(delta);

    // Aparición de enemigos
    this.esperaAparicion += delta;
    if (this.esperaAparicion >= this.intervaloAparicion()) {
      this.esperaAparicion = 0;
      this.crearEnemigo();
    }

    // Mordida automática
    this.esperaMordida += delta;
    if (this.esperaMordida >= this.intervaloMordida()) {
      this.esperaMordida = 0;
      this.morder();
    }

    // Ladrido automático (solo si ya tiene el instinto)
    if (this.instintos.ladrido > 0) {
      this.esperaLadrido += delta;
      if (this.esperaLadrido >= this.intervaloLadrido()) {
        this.esperaLadrido = 0;
        this.ladrar();
      }
    }

    // Poder "Calle" (Quiltro): se cura un poco con el tiempo
    if (this.poder === 'calle') {
      this.esperaCura += delta;
      if (this.esperaCura >= this.base.CALLE_CURA_CADA_MS) {
        this.esperaCura = 0;
        this.vida = Math.min(this.vidaMax, this.vida + this.base.CALLE_CURA);
      }
    }

    // Poder "Rastreo" (Beagle): flechas a enemigos fuera de pantalla
    if (this.poder === 'rastreo') {
      this.dibujarFlechas();
    }

    // Parpadeo mientras es invulnerable
    const invulnerable = this.tiempoSobrevivido < this.invulnerableHasta;
    this.perro.setAlpha(invulnerable ? 0.5 : 1);
    if (this.manchas) {
      this.manchas.setPosition(this.perro.x, this.perro.y);
      this.manchas.setAlpha(this.perro.alpha);
    }

    this.actualizarHUD();
  }

  // ---------------- Valores que dependen de la raza y los instintos ----------------

  velocidadPerro() {
    return this.base.VELOCIDAD + this.instintos.patasLigeras * CONFIG.PATAS_VELOCIDAD;
  }

  intervaloMordida() {
    return Math.max(100, this.base.MORDIDA_CADA_MS - this.instintos.mordidaRapida * CONFIG.MORDIDA_RAPIDA_MS);
  }

  danoMordida() {
    return this.base.MORDIDA_DANO + this.instintos.colmillos * CONFIG.COLMILLOS_DANO;
  }

  radioIman() {
    return CONFIG.IMAN_RADIO + (this.base.IMAN_EXTRA || 0) + this.instintos.olfato * CONFIG.OLFATO_IMAN;
  }

  intervaloLadrido() {
    const extra = this.instintos.ladrido - 1;
    return Math.max(300, CONFIG.LADRIDO_CADA_MS - extra * CONFIG.LADRIDO_CADA_MENOS_MS);
  }

  radioLadrido() {
    return CONFIG.LADRIDO_RADIO + (this.instintos.ladrido - 1) * CONFIG.LADRIDO_RADIO_EXTRA;
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

  // ---------------- Movimiento ----------------

  moverPerro() {
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      this.ultimaDireccion.set(dx, dy).normalize();
    }

    // Durante el sprint va muy rápido en línea recta
    if (this.enSprint()) {
      const v = this.base.SPRINT_VELOCIDAD;
      this.perro.body.setVelocity(this.direccionSprint.x * v, this.direccionSprint.y * v);
      this.dejarEstela();
      return;
    }

    // Normalizar para que en diagonal no vaya más rápido
    const vel = new Phaser.Math.Vector2(dx, dy).normalize().scale(this.velocidadPerro());
    this.perro.body.setVelocity(vel.x, vel.y);
  }

  moverEnemigos() {
    const ahora = this.tiempoSobrevivido;
    this.enemigos.getChildren().forEach((enemigo) => {
      if (ahora < enemigo.empujadoHasta) {
        // Lo empujó un ladrido: lo dejamos volar un momento
      } else if (ahora < enemigo.aturdidoHasta) {
        enemigo.body.setVelocity(0, 0); // aturdido: se queda quieto
      } else {
        this.physics.moveToObject(enemigo, this.perro, CONFIG.ENEMIGO_VELOCIDAD);
      }

      // Color según su estado
      let color = COLOR_ENEMIGO;
      if (ahora < enemigo.destelloHasta) color = COLOR_BLANCO;
      else if (ahora < enemigo.aturdidoHasta) color = COLOR_ATURDIDO;
      if (enemigo.fillColor !== color) enemigo.setFillStyle(color);
    });
  }

  // ---------------- Sprint (Galgo) ----------------

  iniciarSprint() {
    this.direccionSprint = this.ultimaDireccion.clone();
    this.sprintHasta = this.tiempoSobrevivido + this.base.SPRINT_DURACION_MS;
    this.poderCarga = 0;
  }

  // Sombras que quedan atrás durante el sprint
  dejarEstela() {
    const sombra = this.add.circle(this.perro.x, this.perro.y, this.base.RADIO, this.base.COLOR, 0.4);
    sombra.setDepth(9);
    this.tweens.add({
      targets: sombra,
      alpha: 0,
      scale: 0.6,
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
    const cx = w / 2;
    const cy = h / 2;
    const margen = 26;

    // Enemigos fuera de la pantalla, los más cercanos primero
    const fuera = this.enemigos.getChildren()
      .map((e) => ({ sx: e.x - cam.scrollX, sy: e.y - cam.scrollY, d: Phaser.Math.Distance.Between(this.perro.x, this.perro.y, e.x, e.y) }))
      .filter((p) => p.sx < 0 || p.sx > w || p.sy < 0 || p.sy > h)
      .sort((a, b) => a.d - b.d)
      .slice(0, this.base.RASTREO_FLECHAS_MAX);

    g.fillStyle(COLOR_FLECHA, 0.9);
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
    return Math.max(CONFIG.APARICION_MINIMA_MS, intervalo);
  }

  crearEnemigo() {
    if (this.enemigos.countActive() >= CONFIG.ENEMIGOS_MAXIMOS) return;

    const pos = this.posicionFueraDePantalla();
    const enemigo = this.add.circle(pos.x, pos.y, CONFIG.ENEMIGO_RADIO, COLOR_ENEMIGO);
    this.enemigos.add(enemigo);
    enemigo.body.setCircle(CONFIG.ENEMIGO_RADIO);
    enemigo.vida = CONFIG.ENEMIGO_VIDA;
    enemigo.empujadoHasta = 0;
    enemigo.aturdidoHasta = 0;
    enemigo.destelloHasta = 0;
  }

  // Busca un punto justo fuera de lo que se ve en pantalla, pero dentro del mapa
  posicionFueraDePantalla() {
    const vista = this.cameras.main.worldView;
    const margen = CONFIG.ENEMIGO_RADIO * 3;

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
      if (dentroDelMapa) return { x, y };
    }

    // Si no encontró lugar (raro), aparece en una esquina del mapa
    return {
      x: Phaser.Math.RND.pick([CONFIG.ENEMIGO_RADIO, CONFIG.MAPA_ANCHO - CONFIG.ENEMIGO_RADIO]),
      y: Phaser.Math.RND.pick([CONFIG.ENEMIGO_RADIO, CONFIG.MAPA_ALTO - CONFIG.ENEMIGO_RADIO])
    };
  }

  // Quita vida a un enemigo; si muere, puede soltar un hueso
  danarEnemigo(enemigo, dano) {
    if (!enemigo.active) return;
    enemigo.vida -= dano;

    if (enemigo.vida <= 0) {
      const probabilidad = this.base.HUESO_PROBABILIDAD === undefined ? 1 : this.base.HUESO_PROBABILIDAD;
      if (Math.random() < probabilidad) {
        this.soltarHueso(enemigo.x, enemigo.y);
      }
      this.derrotados++;
      enemigo.destroy();
      return;
    }

    enemigo.destelloHasta = this.tiempoSobrevivido + 80; // destello blanco breve
  }

  // ---------------- Mordida ----------------

  morder() {
    // Buscar el enemigo más cercano dentro del alcance
    let objetivo = null;
    let distanciaMin = Infinity;
    this.enemigos.getChildren().forEach((enemigo) => {
      const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y);
      if (d < distanciaMin) {
        distanciaMin = d;
        objetivo = enemigo;
      }
    });

    const alcanceReal = CONFIG.MORDIDA_ALCANCE + CONFIG.ENEMIGO_RADIO;
    if (!objetivo || distanciaMin > alcanceReal) return;

    let dano = this.danoMordida();
    let fuerte = false;

    // Poder "Mandíbula de hierro" (Pitbull): si está cargado, aturde y hace daño extra
    if (this.poder === 'mandibula' && this.poderListo()) {
      dano += this.base.MANDIBULA_DANO_EXTRA;
      objetivo.aturdidoHasta = this.tiempoSobrevivido + this.base.MANDIBULA_ATURDIR_MS;
      this.poderCarga = 0;
      fuerte = true;
    }

    this.mostrarMordida(objetivo, fuerte);
    this.danarEnemigo(objetivo, dano);
  }

  // Dibuja un arco hacia el enemigo que se desvanece (amarillo y grueso si es la Mandíbula)
  mostrarMordida(objetivo, fuerte) {
    const angulo = Phaser.Math.Angle.Between(this.perro.x, this.perro.y, objetivo.x, objetivo.y);
    const radioArco = this.base.RADIO + 18;

    const arco = this.add.graphics({ x: this.perro.x, y: this.perro.y });
    arco.setDepth(20);
    arco.lineStyle(fuerte ? 9 : 5, fuerte ? COLOR_HUESO : COLOR_BLANCO, 1);
    arco.beginPath();
    arco.arc(0, 0, radioArco, angulo - 0.7, angulo + 0.7);
    arco.strokePath();

    this.tweens.add({
      targets: arco,
      alpha: 0,
      duration: fuerte ? 350 : 200,
      onComplete: () => arco.destroy()
    });
  }

  // ---------------- Ladrido ----------------

  ladrar() {
    const radio = this.radioLadrido();
    const dano = this.danoLadrido();

    // Onda blanca que se expande
    const onda = this.add.graphics({ x: this.perro.x, y: this.perro.y });
    onda.setDepth(5);
    onda.lineStyle(4, COLOR_BLANCO, 0.9);
    onda.strokeCircle(0, 0, radio);
    onda.fillStyle(COLOR_BLANCO, 0.12);
    onda.fillCircle(0, 0, radio);
    onda.setScale(0.2);
    this.tweens.add({
      targets: onda,
      scale: 1,
      alpha: 0,
      duration: 350,
      onComplete: () => onda.destroy()
    });

    // Copia de la lista, porque algunos enemigos mueren dentro del ciclo
    this.enemigos.getChildren().slice().forEach((enemigo) => {
      const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y);
      if (d > radio + CONFIG.ENEMIGO_RADIO) return;

      // Empujar hacia afuera
      const angulo = Phaser.Math.Angle.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y);
      enemigo.body.setVelocity(Math.cos(angulo) * CONFIG.LADRIDO_EMPUJE, Math.sin(angulo) * CONFIG.LADRIDO_EMPUJE);
      enemigo.empujadoHasta = this.tiempoSobrevivido + CONFIG.LADRIDO_EMPUJE_MS;

      this.danarEnemigo(enemigo, dano);
    });
  }

  // ---------------- Huesos y experiencia ----------------

  soltarHueso(x, y) {
    const t = CONFIG.HUESO_TAMANO;
    const hueso = this.add.rectangle(x, y, t, t, COLOR_HUESO);
    hueso.setStrokeStyle(1, 0x8a6d00);
    hueso.setDepth(3);
    this.huesos.add(hueso);
  }

  moverHuesos(delta) {
    const iman = this.radioIman();
    const distanciaRecoger = this.base.RADIO + CONFIG.HUESO_TAMANO;
    const paso = CONFIG.IMAN_VELOCIDAD * (delta / 1000);

    this.huesos.getChildren().slice().forEach((hueso) => {
      const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, hueso.x, hueso.y);

      if (d <= distanciaRecoger) {
        hueso.destroy();
        this.ganarXP(CONFIG.HUESO_XP);
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

  // ---------------- Cartas de instintos ----------------

  instintosDisponibles() {
    return INSTINTOS.filter((inst) => this.instintos[inst.id] < CONFIG.INSTINTO_NIVEL_MAX);
  }

  mostrarCartas() {
    const opciones = Phaser.Utils.Array.Shuffle(this.instintosDisponibles().slice()).slice(0, 3);

    // Si ya tiene todos los instintos al máximo, no hay nada que elegir
    if (opciones.length === 0) {
      this.nivelesPendientes = 0;
      return;
    }

    this.eligiendo = true;
    this.physics.pause();
    this.perro.setAlpha(1);
    if (this.manchas) this.manchas.setAlpha(1);
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
    capa.push(this.add.text(w / 2, 130, 'Elige un instinto (clic o teclas 1, 2, 3)', {
      fontFamily: FUENTE, fontSize: '18px', color: '#dddddd'
    }).setOrigin(0.5));

    const anchoCarta = 240;
    const altoCarta = 260;
    const separacion = 270;
    const inicioX = w / 2 - ((opciones.length - 1) * separacion) / 2;
    const cy = 320;

    this.cartas = opciones.map((inst, i) => {
      const cx = inicioX + i * separacion;
      const nivelActual = this.instintos[inst.id];

      const fondo = this.add.rectangle(cx, cy, anchoCarta, altoCarta, 0x2b2b3a)
        .setStrokeStyle(3, 0x888899)
        .setInteractive({ useHandCursor: true });
      fondo.on('pointerover', () => fondo.setStrokeStyle(3, COLOR_HUESO));
      fondo.on('pointerout', () => fondo.setStrokeStyle(3, 0x888899));
      fondo.on('pointerdown', () => this.elegirCarta(i));

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

  elegirCarta(indice) {
    if (!this.eligiendo) return;
    const inst = this.cartas[indice];
    if (!inst) return;

    this.aplicarInstinto(inst.id);

    this.capaCartas.forEach((obj) => obj.destroy());
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
  }

  // ---------------- Vida ----------------

  recibirGolpe() {
    if (this.gameOver || this.eligiendo) return;
    if (this.enSprint()) return; // el Galgo no recibe daño durante el sprint
    if (this.tiempoSobrevivido < this.invulnerableHasta) return;

    this.vida = Math.max(0, this.vida - CONFIG.ENEMIGO_DANO);
    this.invulnerableHasta = this.tiempoSobrevivido + CONFIG.PERRO_INVULNERABLE_MS;
    this.cameras.main.shake(100, 0.005);

    if (this.vida <= 0) {
      this.terminarJuego();
    }
  }

  terminarJuego() {
    this.gameOver = true;
    this.physics.pause();
    this.perro.setAlpha(1);
    if (this.manchas) this.manchas.setAlpha(1);
    this.flechas.clear();
    this.actualizarHUD();

    // Olvidar R o M presionadas durante la partida (si no, actuarían al instante)
    Phaser.Input.Keyboard.JustDown(this.teclaR);
    Phaser.Input.Keyboard.JustDown(this.teclaM);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(2000);

    const lineas = [
      { texto: 'Game Over', y: -135, tam: '64px', color: '#ff5555', negrita: true },
      { texto: 'Raza: ' + this.textosRaza.nombre, y: -65, tam: '26px', color: '#ffe082' },
      { texto: 'Sobreviviste: ' + this.formatearTiempo(this.tiempoSobrevivido), y: -28, tam: '26px', color: '#ffffff' },
      { texto: 'Nivel alcanzado: ' + this.nivel, y: 9, tam: '26px', color: '#ffffff' },
      { texto: 'Enemigos derrotados: ' + this.derrotados, y: 46, tam: '26px', color: '#ffffff' },
      { texto: 'R: jugar de nuevo con la misma raza', y: 105, tam: '20px', color: '#dddddd' },
      { texto: 'M: volver al inicio y elegir otra raza', y: 135, tam: '20px', color: '#dddddd' }
    ];
    lineas.forEach((l) => {
      this.add.text(cx, cy + l.y, l.texto, {
        fontFamily: FUENTE, fontSize: l.tam, color: l.color, fontStyle: l.negrita ? 'bold' : 'normal'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    });
  }

  // ---------------- Pantalla (HUD) ----------------

  crearHUD() {
    const estilo = { fontFamily: FUENTE, fontSize: '18px', color: '#ffffff' };

    // Barra de experiencia arriba de todo
    this.barraXP = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoNivel = this.add.text(this.scale.width / 2, 20, '', { ...estilo, fontStyle: 'bold' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

    this.add.text(12, 20, 'Lomito Survivor - v0.4', estilo)
      .setScrollFactor(0).setDepth(1000);

    this.barraVida = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoVida = this.add.text(12 + 100, 57, '', { ...estilo, fontSize: '14px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    // Raza y poder
    const espera = this.poderEsperaTotal > 0 ? '' : ' (pasivo)';
    const poder = this.textosRaza.poder ? ' · ' + this.textosRaza.poder + espera : '';
    this.add.text(12, 74, this.textosRaza.nombre + poder, { ...estilo, fontSize: '15px', color: '#ffe082' })
      .setScrollFactor(0).setDepth(1000);

    // Indicador de carga del poder (solo si tiene espera)
    this.barraPoder = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoPoder = this.add.text(160, 96, '', { ...estilo, fontSize: '14px' })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(1000);

    this.textoTiempo = this.add.text(this.scale.width - 12, 20, '', { ...estilo, fontSize: '22px' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    this.actualizarHUD();
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
    const y = 48;
    const porcentaje = this.vida / this.vidaMax;
    this.barraVida.clear();
    this.barraVida.fillStyle(0x000000, 0.6);
    this.barraVida.fillRect(12, y, ancho, alto);
    this.barraVida.fillStyle(porcentaje > 0.3 ? 0x4caf50 : 0xe53935, 1);
    this.barraVida.fillRect(12, y, ancho * porcentaje, alto);
    this.barraVida.lineStyle(2, COLOR_BLANCO, 0.8);
    this.barraVida.strokeRect(12, y, ancho, alto);
    this.textoVida.setText(this.vida + ' / ' + this.vidaMax);

    // Poder con espera
    if (this.poderEsperaTotal > 0) {
      const carga = this.poderCarga / this.poderEsperaTotal;
      const listo = this.poderListo();
      this.barraPoder.clear();
      this.barraPoder.fillStyle(0x000000, 0.6);
      this.barraPoder.fillRect(12, 91, 140, 10);
      this.barraPoder.fillStyle(listo ? COLOR_HUESO : 0x9e9e9e, 1);
      this.barraPoder.fillRect(12, 91, 140 * carga, 10);
      this.barraPoder.lineStyle(1, COLOR_BLANCO, 0.6);
      this.barraPoder.strokeRect(12, 91, 140, 10);

      if (listo) {
        this.textoPoder.setText(this.poder === 'sprint' ? '¡Listo! [Espacio]' : '¡Listo!');
        this.textoPoder.setColor('#ffe082');
      } else {
        const faltan = (this.poderEsperaTotal - this.poderCarga) / 1000;
        this.textoPoder.setText(faltan.toFixed(1) + ' s');
        this.textoPoder.setColor('#bbbbbb');
      }
    }

    this.textoTiempo.setText(this.formatearTiempo(this.tiempoSobrevivido));
  }

  formatearTiempo(ms) {
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60);
    const seg = totalSeg % 60;
    return String(min).padStart(2, '0') + ':' + String(seg).padStart(2, '0');
  }

  // ---------------- Suelo ----------------

  dibujarSuelo() {
    const g = this.add.graphics();
    g.lineStyle(1, 0x3d3d3d, 1);
    for (let x = 0; x <= CONFIG.MAPA_ANCHO; x += 100) g.lineBetween(x, 0, x, CONFIG.MAPA_ALTO);
    for (let y = 0; y <= CONFIG.MAPA_ALTO; y += 100) g.lineBetween(0, y, CONFIG.MAPA_ANCHO, y);
    g.lineStyle(4, 0x555555, 1);
    g.strokeRect(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
  }
}
