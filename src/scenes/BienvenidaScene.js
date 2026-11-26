// Pantalla de bienvenida: es lo primero que se ve al abrir el juego.
// La portada animada (src/portada.js: calle de noche con el título, un chow
// chow y un shar pei; el chow chow ladra de vez en cuando) y una frase al
// azar (CONFIG.BIENVENIDA.FRASES).
// Al tocar la pantalla o presionar cualquier tecla, va al menú (MenuScene).
// Si hay sesión de Google con apodo, saluda: "¡Guau, bienvenido de vuelta, [apodo]!".
// (FUENTE viene de MenuScene.js; margenExtra y modoTactil, de src/tactil.js;
//  ONLINE y alCambiarOnline, de src/online.js)

class BienvenidaScene extends Phaser.Scene {
  constructor() {
    super('BienvenidaScene');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const e = margenExtra(); // en celular todo se aleja un poco más del borde (0 en PC)
    const cfg = CONFIG.BIENVENIDA;
    this.cfg = cfg;
    this.yendo = false;

    // Portada animada con el título incluido (src/portada.js; números en CONFIG.PORTADA)
    this.portada = crearPortada(this);
    // Debajo del título (que termina en la fila 26 de la escena) y antes de las cabezas de los perros
    const yFrase = this.portada.aPantalla(0, 31).y + e / 2;

    // Frase al azar (sin repetir la de la vez anterior)
    this.add.text(w / 2, yFrase, '“' + this.fraseAlAzar() + '”', {
      fontFamily: FUENTE, fontSize: '20px', color: '#ffffff', fontStyle: 'italic',
      stroke: '#000000', strokeThickness: 4, align: 'center', wordWrap: { width: w - 2 * (40 + e) }
    }).setOrigin(0.5);

    // Saludo si ya hay sesión (se actualiza cuando termina de cargar)
    this.saludo = this.add.text(w / 2, yFrase + 24, '', {
      fontFamily: FUENTE, fontSize: '17px', color: '#9ccc65', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    this.actualizarSaludo();
    const desuscribir = alCambiarOnline(() => this.actualizarSaludo());
    this.events.once('shutdown', desuscribir);

    // El chow chow ladra de vez en cuando
    this.programarLadrido();

    // "Toca o presiona cualquier tecla para empezar" (parpadea), abajo de las patas de los perros
    const empezar = this.add.text(w / 2, h - 16 - e, cfg.TEXTO_EMPEZAR, {
      fontFamily: FUENTE, fontSize: '20px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({ targets: empezar, alpha: 0.15, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(w - 10 - e, h - 4 - e, 'v' + VERSION_JUEGO, {
      fontFamily: FUENTE, fontSize: '13px', color: '#888888'
    }).setOrigin(1, 1);

    // Cualquier tecla o toque va al menú (con una pequeña espera para no saltarla sin querer)
    this.time.delayedCall(cfg.ESPERA_MS, () => {
      this.input.keyboard.on('keydown', () => this.irAlMenu());
      this.input.on('pointerdown', () => this.irAlMenu());
    });
  }

  update(tiempo) {
    this.portada.actualizar(tiempo);
  }

  irAlMenu() {
    if (this.yendo) return;
    this.yendo = true;
    this.cameras.main.fadeOut(220, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('MenuScene'));
  }

  actualizarSaludo() {
    const apodo = onlineDisponible() && ONLINE.usuario ? ONLINE.apodo : null;
    this.saludo.setText(apodo ? '¡Guau, bienvenido de vuelta, ' + apodo + '!' : '');
  }

  fraseAlAzar() {
    const frases = this.cfg.FRASES;
    let anterior = -1;
    try { anterior = Number(localStorage.getItem('lomito_frase_bienvenida')); } catch (err) { /* sin almacenamiento */ }
    let i = Phaser.Math.Between(0, frases.length - 1);
    if (frases.length > 1 && i === anterior) i = (i + 1) % frases.length;
    try { localStorage.setItem('lomito_frase_bienvenida', String(i)); } catch (err) { /* sin almacenamiento */ }
    return frases[i];
  }

  // ---------------- Perro ----------------

  programarLadrido() {
    const [min, max] = this.cfg.LADRIDO_CADA_MS;
    this.time.delayedCall(Phaser.Math.Between(min, max), () => {
      this.ladrar();
      this.programarLadrido();
    });
  }

  // "¡Guau!" sobre el chow chow
  ladrar() {
    const chow = this.portada.chow;
    // a la izquierda de la cabeza (arriba al medio sale el corazón del gesto de cariño)
    const t = this.add.text(chow.x - chow.displayWidth * 0.3, chow.y - chow.displayHeight * 0.8, '¡Guau!', {
      fontFamily: FUENTE, fontSize: '22px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(1, 1).setAngle(8);
    this.tweens.add({ targets: t, y: t.y - 26, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }
}
