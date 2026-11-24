// Escena principal: la plaza donde el perro sobrevive la noche.
// Los números para ajustar el juego están en src/config.js

const COLOR_PERRO = 0x8b5a2b;   // café
const COLOR_ENEMIGO = 0xd63c3c; // rojo
const COLOR_BLANCO = 0xffffff;

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.vida = CONFIG.PERRO_VIDA_MAX;
    this.tiempoSobrevivido = 0; // en ms
    this.invulnerableHasta = 0;
    this.gameOver = false;

    // Por si venimos de un Game Over (la física quedó en pausa)
    this.physics.resume();

    // Mapa y cámara
    this.physics.world.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.cameras.main.setBounds(0, 0, CONFIG.MAPA_ANCHO, CONFIG.MAPA_ALTO);
    this.dibujarSuelo();

    // El perro
    this.perro = this.add.circle(CONFIG.MAPA_ANCHO / 2, CONFIG.MAPA_ALTO / 2, CONFIG.PERRO_RADIO, COLOR_PERRO);
    this.physics.add.existing(this.perro);
    this.perro.body.setCircle(CONFIG.PERRO_RADIO);
    this.perro.body.setCollideWorldBounds(true);
    this.perro.setDepth(10);
    this.cameras.main.startFollow(this.perro, true, 0.1, 0.1);

    // Enemigos
    this.enemigos = this.physics.add.group();
    this.physics.add.collider(this.enemigos, this.enemigos); // que no se amontonen en uno solo
    this.physics.add.overlap(this.perro, this.enemigos, this.recibirGolpe, null, this);
    this.programarAparicion();

    // Mordida automática
    this.time.addEvent({
      delay: CONFIG.MORDIDA_CADA_MS,
      loop: true,
      callback: this.morder,
      callbackScope: this
    });

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.teclaR = this.input.keyboard.addKey('R');

    this.crearHUD();
  }

  update(time, delta) {
    if (this.gameOver) {
      if (Phaser.Input.Keyboard.JustDown(this.teclaR)) {
        this.scene.restart();
      }
      return;
    }

    this.tiempoSobrevivido += delta;
    this.moverPerro();

    // Los enemigos persiguen al perro
    this.enemigos.getChildren().forEach((enemigo) => {
      this.physics.moveToObject(enemigo, this.perro, CONFIG.ENEMIGO_VELOCIDAD);
    });

    // Parpadeo mientras es invulnerable
    this.perro.setAlpha(this.time.now < this.invulnerableHasta ? 0.5 : 1);

    this.actualizarHUD();
  }

  // ---------------- Movimiento ----------------

  moverPerro() {
    let dx = 0;
    let dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    // Normalizar para que en diagonal no vaya más rápido
    const vel = new Phaser.Math.Vector2(dx, dy).normalize().scale(CONFIG.PERRO_VELOCIDAD);
    this.perro.body.setVelocity(vel.x, vel.y);
  }

  // ---------------- Enemigos ----------------

  intervaloAparicion() {
    const segundos = this.tiempoSobrevivido / 1000;
    const intervalo = CONFIG.APARICION_INICIAL_MS - segundos * CONFIG.APARICION_ACELERA_MS;
    return Math.max(CONFIG.APARICION_MINIMA_MS, intervalo);
  }

  programarAparicion() {
    this.time.delayedCall(this.intervaloAparicion(), () => {
      if (this.gameOver) return;
      this.crearEnemigo();
      this.programarAparicion();
    });
  }

  crearEnemigo() {
    if (this.enemigos.countActive() >= CONFIG.ENEMIGOS_MAXIMOS) return;

    const pos = this.posicionFueraDePantalla();
    const enemigo = this.add.circle(pos.x, pos.y, CONFIG.ENEMIGO_RADIO, COLOR_ENEMIGO);
    this.enemigos.add(enemigo);
    enemigo.body.setCircle(CONFIG.ENEMIGO_RADIO);
    enemigo.vida = CONFIG.ENEMIGO_VIDA;
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

  // ---------------- Mordida ----------------

  morder() {
    if (this.gameOver) return;

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

    this.mostrarMordida(objetivo);

    objetivo.vida -= CONFIG.MORDIDA_DANO;
    if (objetivo.vida <= 0) {
      objetivo.destroy();
    } else {
      // Destello blanco breve en el enemigo
      objetivo.setFillStyle(COLOR_BLANCO);
      this.time.delayedCall(80, () => {
        if (objetivo.active) objetivo.setFillStyle(COLOR_ENEMIGO);
      });
    }
  }

  // Dibuja un arco blanco hacia el enemigo que se desvanece
  mostrarMordida(objetivo) {
    const angulo = Phaser.Math.Angle.Between(this.perro.x, this.perro.y, objetivo.x, objetivo.y);
    const radioArco = CONFIG.PERRO_RADIO + 18;

    const arco = this.add.graphics({ x: this.perro.x, y: this.perro.y });
    arco.setDepth(20);
    arco.lineStyle(5, COLOR_BLANCO, 1);
    arco.beginPath();
    arco.arc(0, 0, radioArco, angulo - 0.7, angulo + 0.7);
    arco.strokePath();

    this.tweens.add({
      targets: arco,
      alpha: 0,
      duration: 200,
      onComplete: () => arco.destroy()
    });
  }

  // ---------------- Vida ----------------

  recibirGolpe() {
    if (this.gameOver || this.time.now < this.invulnerableHasta) return;

    this.vida = Math.max(0, this.vida - CONFIG.ENEMIGO_DANO);
    this.invulnerableHasta = this.time.now + CONFIG.PERRO_INVULNERABLE_MS;
    this.cameras.main.shake(100, 0.005);

    if (this.vida <= 0) {
      this.terminarJuego();
    }
  }

  terminarJuego() {
    this.gameOver = true;
    this.physics.pause();
    this.perro.setAlpha(1);
    this.actualizarHUD();

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6)
      .setScrollFactor(0).setDepth(2000);

    this.add.text(cx, cy - 60, 'Game Over', {
      fontFamily: 'Arial, sans-serif', fontSize: '64px', color: '#ff5555', fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    this.add.text(cx, cy + 10, 'Sobreviviste: ' + this.formatearTiempo(this.tiempoSobrevivido), {
      fontFamily: 'Arial, sans-serif', fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);

    this.add.text(cx, cy + 60, 'Presiona R para reiniciar', {
      fontFamily: 'Arial, sans-serif', fontSize: '22px', color: '#dddddd'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2001);
  }

  // ---------------- Pantalla (HUD) ----------------

  crearHUD() {
    const estilo = { fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#ffffff' };

    this.add.text(12, 12, 'Lomito Survivor - v0.2', estilo)
      .setScrollFactor(0).setDepth(1000);

    this.barraVida = this.add.graphics().setScrollFactor(0).setDepth(1000);
    this.textoVida = this.add.text(12 + 100, 48, '', { ...estilo, fontSize: '14px' })
      .setOrigin(0.5).setScrollFactor(0).setDepth(1001);

    this.textoTiempo = this.add.text(this.scale.width - 12, 12, '', { ...estilo, fontSize: '22px' })
      .setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    this.actualizarHUD();
  }

  actualizarHUD() {
    const ancho = 200;
    const alto = 18;
    const porcentaje = this.vida / CONFIG.PERRO_VIDA_MAX;

    this.barraVida.clear();
    this.barraVida.fillStyle(0x000000, 0.6);
    this.barraVida.fillRect(12, 39, ancho, alto);
    this.barraVida.fillStyle(porcentaje > 0.3 ? 0x4caf50 : 0xe53935, 1);
    this.barraVida.fillRect(12, 39, ancho * porcentaje, alto);
    this.barraVida.lineStyle(2, COLOR_BLANCO, 0.8);
    this.barraVida.strokeRect(12, 39, ancho, alto);

    this.textoVida.setText(this.vida + ' / ' + CONFIG.PERRO_VIDA_MAX);
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
