// Escena principal: la plaza donde el perro sobrevive la noche.
// Los números para ajustar el juego están en src/config.js
// Los textos de razas, enemigos e instintos están en src/razas.js,
// src/enemigos.js y src/instintos.js
// (FUENTE y dibujarPerro vienen de MenuScene.js; los dibujos, de src/sprites.js)

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
    this.vidaMax = this.base.VIDA;
    this.vida = this.vidaMax;
    this.tiempoSobrevivido = 0;   // reloj del juego en ms (se detiene en pausa)
    this.invulnerableHasta = 0;
    this.sprintHasta = 0;
    this.atrapadoHasta = 0;       // la Perrera te deja quieto hasta este momento
    this.ultimaDireccion = new Phaser.Math.Vector2(1, 0);
    this.gameOver = false;
    this.eligiendo = false;       // true mientras se muestran las cartas de instintos
    this.nivel = 1;
    this.xp = 0;
    this.nivelesPendientes = 0;
    this.derrotados = 0;
    this.derrotadosPorTipo = {};
    Object.keys(CONFIG.ENEMIGOS).forEach((id) => { this.derrotadosPorTipo[id] = 0; });
    this.esperaMordida = 0;
    this.esperaLadrido = 0;
    this.esperaAparicion = 0;
    this.esperaCura = 0;
    this.cartas = [];

    // Nivel de cada instinto (0 = no lo tiene)
    this.instintos = {};
    INSTINTOS.forEach((inst) => { this.instintos[inst.id] = 0; });

    // Por si venimos de un Game Over (la física y las animaciones quedaron en pausa)
    this.physics.resume();
    crearSprites(this);
    this.anims.resumeAll();

    // Mapa y cámara
    this.physics.world.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.cameras.main.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.dibujarSuelo();

    // El perro (dibujo de su raza; el choque usa el RADIO de config.js)
    this.perro = dibujarPerro(this, CONFIG.MAPA_ANCHO / 2, CONFIG.MAPA_ALTO / 2, this.razaId);
    this.physics.add.existing(this.perro);
    ponerChoqueCircular(this.perro, this.base.RADIO);
    this.perro.body.setCollideWorldBounds(true);
    this.perro.setDepth(10);
    this.cameras.main.startFollow(this.perro, true, 0.1, 0.1);

    // Enemigos
    this.enemigos = this.physics.add.group();
    this.physics.add.collider(this.enemigos, this.enemigos); // que no se amontonen en uno solo
    this.physics.add.overlap(this.perro, this.enemigos, this.recibirGolpe, null, this);

    // Huesos
    this.huesos = this.add.group();

    // Flechas del Rastreo (Beagle)
    this.flechas = this.add.graphics().setScrollFactor(0).setDepth(900);

    // Líneas de aviso del Drogadicto y jaula de la Perrera
    this.avisos = this.add.graphics().setDepth(4);
    this.jaula = this.add.graphics().setDepth(12);

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.teclaR = this.input.keyboard.addKey('R');
    this.teclaM = this.input.keyboard.addKey('M');
    this.teclaEspacio = this.input.keyboard.addKey('SPACE');
    this.teclaT = this.input.keyboard.addKey('T'); // modo de prueba
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

    // Sprint del Galgo (no se puede si la Perrera lo atrapó)
    if (this.poder === 'sprint' && Phaser.Input.Keyboard.JustDown(this.teclaEspacio) &&
        this.poderListo() && !this.estaAtrapado()) {
      this.iniciarSprint();
    }

    // Modo de prueba: un enemigo de cada tipo cerca del perro
    if (Phaser.Input.Keyboard.JustDown(this.teclaT)) {
      this.modoPrueba();
    }

    this.moverPerro();
    this.moverEnemigos();
    this.moverHuesos(delta);
    this.dibujarJaula();

    // Aparición de enemigos
    this.esperaAparicion += delta;
    if (this.esperaAparicion >= this.intervaloAparicion()) {
      this.esperaAparicion = 0;
      this.aparecerEnemigos();
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

  estaAtrapado() {
    return this.tiempoSobrevivido < this.atrapadoHasta;
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

    if (dx !== 0 || dy !== 0) {
      this.ultimaDireccion.set(dx, dy).normalize();
    }

    // Atrapado por la Perrera: no se puede mover
    if (this.estaAtrapado()) {
      this.perro.body.setVelocity(0, 0);
      return;
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
    this.avisos.clear();

    this.enemigos.getChildren().forEach((enemigo) => {
      const cfg = enemigo.cfg;
      let avisando = false;

      if (ahora < enemigo.empujadoHasta) {
        // Lo empujó un ladrido: lo dejamos volar un momento
        enemigo.estado = 'acercarse';
      } else if (ahora < enemigo.aturdidoHasta) {
        enemigo.body.setVelocity(0, 0); // aturdido: se queda quieto
        enemigo.estado = 'acercarse';
      } else if (cfg.COMPORTAMIENTO === 'zigzag') {
        this.moverZigzag(enemigo, ahora);
      } else if (cfg.COMPORTAMIENTO === 'embestida') {
        avisando = this.moverEmbestida(enemigo, ahora);
      } else {
        // 'perseguir' y 'atrapar': van directo hacia el perro
        this.physics.moveToObject(enemigo, this.perro, cfg.VELOCIDAD);
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
      if (cfg.COMPORTAMIENTO === 'atrapar') {
        enemigo.setAlpha(ahora < enemigo.recargaHasta ? 0.45 : 1);
      }
    });
  }

  // Borracho: camina hacia el perro, pero desviándose de lado a lado
  moverZigzag(enemigo, ahora) {
    const cfg = enemigo.cfg;
    const haciaPerro = Phaser.Math.Angle.Between(enemigo.x, enemigo.y, this.perro.x, this.perro.y);
    const vaiven = Math.sin((ahora / cfg.ZIGZAG_CADA_MS) * Math.PI * 2 + enemigo.fase);
    const angulo = haciaPerro + Phaser.Math.DegToRad(cfg.ZIGZAG_GRADOS) * vaiven;
    enemigo.body.setVelocity(Math.cos(angulo) * cfg.VELOCIDAD, Math.sin(angulo) * cfg.VELOCIDAD);
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
        this.physics.moveToObject(enemigo, this.perro, cfg.VELOCIDAD);
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
    this.sprintHasta = this.tiempoSobrevivido + this.base.SPRINT_DURACION_MS;
    this.poderCarga = 0;
  }

  // Sombras que quedan atrás durante el sprint
  dejarEstela() {
    const sombra = this.add.image(this.perro.x, this.perro.y, this.perro.texture.key, this.perro.frame.name)
      .setScale(ESCALA_PIXEL).setFlipX(this.perro.flipX).setAlpha(0.4);
    if (this.perro.isTinted) sombra.setTint(this.perro.tintTopLeft);
    sombra.setDepth(9);
    this.tweens.add({
      targets: sombra,
      alpha: 0,
      scale: ESCALA_PIXEL * 0.6,
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

  crearEnemigo(tipo, x, y, ignorarLimite) {
    if (!ignorarLimite && this.enemigos.countActive() >= CONFIG.ENEMIGOS_MAXIMOS) return null;

    const cfg = CONFIG.ENEMIGOS[tipo];
    const r = cfg.RADIO;
    // Dibujo en pixel art (src/sprites.js). Si no tiene dibujo propio,
    // usa el del perro rival pintado con su COLOR.
    const clave = claveSprite(tipo, SPRITE_ENEMIGO_POR_DEFECTO);
    const enemigo = agregarSprite(this, x, y, clave);
    enemigo.tinteBase = clave !== tipo ? cfg.COLOR : null;
    if (enemigo.tinteBase !== null) enemigo.setTint(enemigo.tinteBase);
    enemigo.tinte = 'normal';
    enemigo.setDepth(6);

    this.enemigos.add(enemigo);
    // El "cuerpo" para choques es siempre un círculo de RADIO centrado en el dibujo
    ponerChoqueCircular(enemigo, r);

    enemigo.tipo = tipo;
    enemigo.cfg = cfg;
    enemigo.radio = r;
    enemigo.vida = cfg.VIDA;
    enemigo.empujadoHasta = 0;
    enemigo.aturdidoHasta = 0;
    enemigo.destelloHasta = 0;
    enemigo.recargaHasta = 0;
    enemigo.estado = 'acercarse';
    enemigo.estadoHasta = 0;
    enemigo.anguloEmbestida = 0;
    enemigo.fase = Math.random() * Math.PI * 2; // para que los borrachos no zigzagueen todos igual
    enemigo.dePrueba = false;
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

  // Busca un punto justo fuera de lo que se ve en pantalla, pero dentro del mapa
  posicionFueraDePantalla() {
    const vista = this.cameras.main.worldView;
    const margen = 50;

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
      x: Phaser.Math.RND.pick([30, CONFIG.MAPA_ANCHO - 30]),
      y: Phaser.Math.RND.pick([30, CONFIG.MAPA_ALTO - 30])
    };
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
      const cantidad = enemigo.cfg.HUESOS === undefined ? 1 : enemigo.cfg.HUESOS;
      for (let i = 0; i < cantidad; i++) {
        if (Math.random() < probabilidad) {
          const ox = cantidad > 1 ? Phaser.Math.Between(-14, 14) : 0;
          const oy = cantidad > 1 ? Phaser.Math.Between(-14, 14) : 0;
          this.soltarHueso(enemigo.x + ox, enemigo.y + oy);
        }
      }
      this.derrotados++;
      this.derrotadosPorTipo[enemigo.tipo] = (this.derrotadosPorTipo[enemigo.tipo] || 0) + 1;
      enemigo.destroy();
      return;
    }

    enemigo.destelloHasta = this.tiempoSobrevivido + 80; // destello blanco breve
  }

  // ---------------- Mordida ----------------

  morder() {
    // Buscar el enemigo más cercano dentro del alcance (medido hasta su borde)
    let objetivo = null;
    let distanciaMin = Infinity;
    this.enemigos.getChildren().forEach((enemigo) => {
      const d = Phaser.Math.Distance.Between(this.perro.x, this.perro.y, enemigo.x, enemigo.y) - enemigo.radio;
      if (d < distanciaMin) {
        distanciaMin = d;
        objetivo = enemigo;
      }
    });

    if (!objetivo || distanciaMin > CONFIG.MORDIDA_ALCANCE) return;

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

  // Dientes de pixel art sobre el enemigo que se desvanecen
  // (amarillos y más grandes si es la Mandíbula de hierro)
  mostrarMordida(objetivo, fuerte) {
    const escala = fuerte ? ESCALA_PIXEL + 1 : ESCALA_PIXEL;
    const dientes = this.add.image(objetivo.x, objetivo.y, 'mordida', 0).setScale(escala);
    dientes.setDepth(20);
    if (fuerte) dientes.setTint(COLOR_HUESO);

    this.tweens.add({
      targets: dientes,
      alpha: 0,
      scale: escala * 0.7, // se "cierran" mientras desaparecen
      duration: fuerte ? 350 : 200,
      onComplete: () => dientes.destroy()
    });
  }

  // ---------------- Ladrido ----------------

  ladrar() {
    const radio = this.radioLadrido();
    const dano = this.danoLadrido();

    // Onda blanca pixelada que se expande
    const onda = this.add.image(this.perro.x, this.perro.y, texturaOnda(this, radio));
    onda.setDepth(5);
    onda.setScale(ESCALA_PIXEL * 0.2);
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
  }

  // ---------------- Vida ----------------

  recibirGolpe(perro, enemigo) {
    if (this.gameOver || this.eligiendo) return;
    if (this.enSprint()) return; // el Galgo no recibe daño ni lo atrapan durante el sprint

    const cfg = enemigo.cfg;
    const ahora = this.tiempoSobrevivido;

    // La Perrera no hace daño: te deja quieto un momento
    if (cfg.COMPORTAMIENTO === 'atrapar') {
      if (ahora < enemigo.recargaHasta || ahora < enemigo.aturdidoHasta) return;
      this.atrapadoHasta = ahora + cfg.ATRAPA_MS;
      enemigo.recargaHasta = ahora + cfg.RECARGA_MS;
      return;
    }

    if (!cfg.DANO || cfg.DANO <= 0) return;
    if (ahora < this.invulnerableHasta) return;

    this.vida = Math.max(0, this.vida - cfg.DANO);
    this.invulnerableHasta = this.tiempoSobrevivido + CONFIG.PERRO_INVULNERABLE_MS;
    this.cameras.main.shake(100, 0.005);

    if (this.vida <= 0) {
      this.terminarJuego();
    }
  }

  terminarJuego() {
    this.gameOver = true;
    this.physics.pause();
    this.anims.pauseAll();
    this.perro.setAlpha(1);
    this.flechas.clear();
    this.avisos.clear();
    this.jaula.clear();
    this.actualizarHUD();

    // Olvidar R o M presionadas durante la partida (si no, actuarían al instante)
    Phaser.Input.Keyboard.JustDown(this.teclaR);
    Phaser.Input.Keyboard.JustDown(this.teclaM);

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(2000);

    const lineas = [
      { texto: 'Game Over', y: 62, tam: '60px', color: '#ff5555', negrita: true },
      { texto: 'Raza: ' + this.textosRaza.nombre, y: 122, tam: '24px', color: '#ffe082' },
      { texto: 'Sobreviviste: ' + this.formatearTiempo(this.tiempoSobrevivido) + '     Nivel alcanzado: ' + this.nivel,
        y: 156, tam: '22px', color: '#ffffff' },
      { texto: 'Enemigos derrotados: ' + this.derrotados, y: 196, tam: '22px', color: '#ffffff', negrita: true }
    ];

    // Una línea por cada tipo de enemigo
    let y = 228;
    this.listaEnemigos().forEach((e) => {
      lineas.push({ texto: e.nombre + ': ' + (this.derrotadosPorTipo[e.id] || 0), y, tam: '18px', color: '#cccccc' });
      y += 24;
    });

    lineas.push({ texto: 'R: jugar de nuevo con la misma raza', y: 468, tam: '20px', color: '#dddddd' });
    lineas.push({ texto: 'M: volver al inicio y elegir otra raza', y: 498, tam: '20px', color: '#dddddd' });

    lineas.forEach((l) => {
      this.add.text(cx, l.y, l.texto, {
        fontFamily: FUENTE, fontSize: l.tam, color: l.color, fontStyle: l.negrita ? 'bold' : 'normal'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
    });
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

    // Barra de experiencia arriba de todo
    this.barraXP = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoNivel = this.add.text(this.scale.width / 2, 20, '', { ...estilo, fontStyle: 'bold' })
      .setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

    this.add.text(12, 20, 'Lomito Survivor - v0.6.1', estilo)
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
