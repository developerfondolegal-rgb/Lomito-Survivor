// Pantalla de bienvenida: es lo primero que se ve al abrir el juego.
// Título en pixel art, un perro que mueve la cola y ladra, la plaza de noche
// con faroles que parpadean y una frase al azar (CONFIG.BIENVENIDA.FRASES).
// Al tocar la pantalla o presionar cualquier tecla, va al menú (MenuScene).
// Si hay sesión de Google con apodo, saluda: "¡Guau, bienvenido de vuelta, [apodo]!".
// (FUENTE viene de MenuScene.js; margenExtra y modoTactil, de src/tactil.js;
//  ONLINE y alCambiarOnline, de src/online.js)

// Letras del título (5 x 7 cuadritos, "1" = pintado)
const LETRAS_TITULO = {
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100']
};

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

    this.suelo = Math.round(h * 0.7); // donde termina el cielo y empieza la plaza
    this.dibujarFondo();
    this.crearFaroles();

    // Título
    const p = cfg.TITULO_PIXEL;
    const anchoTitulo = this.anchoTexto('LOMITO SURVIVOR') * p;
    const titulo = this.add.graphics();
    this.dibujarTitulo(titulo, 'LOMITO SURVIVOR', w / 2 - anchoTitulo / 2, 40 + e / 2, p);
    this.tweens.add({ targets: titulo, y: 4, duration: 1400, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Frase al azar (sin repetir la de la vez anterior)
    this.add.text(w / 2, 40 + e / 2 + 7 * p + 34, '“' + this.fraseAlAzar() + '”', {
      fontFamily: FUENTE, fontSize: '22px', color: '#ffffff', fontStyle: 'italic',
      stroke: '#000000', strokeThickness: 4, align: 'center', wordWrap: { width: w - 2 * (40 + e) }
    }).setOrigin(0.5);

    // Saludo si ya hay sesión (se actualiza cuando termina de cargar)
    this.saludo = this.add.text(w / 2, 40 + e / 2 + 7 * p + 74, '', {
      fontFamily: FUENTE, fontSize: '19px', color: '#9ccc65', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    this.actualizarSaludo();
    const desuscribir = alCambiarOnline(() => this.actualizarSaludo());
    this.events.once('shutdown', desuscribir);

    // Perro
    this.perroP = 6;
    this.perroX = Math.round(w / 2 - 11 * this.perroP);
    this.perroY = this.suelo + 34 - 13 * this.perroP;
    this.perro = this.add.graphics();
    this.ladrando = false;
    this.programarLadrido();

    // "Toca o presiona cualquier tecla para empezar" (parpadea)
    const empezar = this.add.text(w / 2, h - 44 - e, cfg.TEXTO_EMPEZAR, {
      fontFamily: FUENTE, fontSize: '22px', color: '#ffe082', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({ targets: empezar, alpha: 0.15, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(w - 10 - e, h - 8 - e, 'v' + VERSION_JUEGO, {
      fontFamily: FUENTE, fontSize: '13px', color: '#888888'
    }).setOrigin(1, 1);

    // Cualquier tecla o toque va al menú (con una pequeña espera para no saltarla sin querer)
    this.time.delayedCall(cfg.ESPERA_MS, () => {
      this.input.keyboard.on('keydown', () => this.irAlMenu());
      this.input.on('pointerdown', () => this.irAlMenu());
    });
  }

  update(tiempo) {
    this.dibujarPerro(tiempo);
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

  // ---------------- Título ----------------

  anchoTexto(texto) {
    return texto.split('').reduce((suma, letra) => suma + (letra === ' ' ? 3 : 6), 0) - 1;
  }

  dibujarTitulo(g, texto, x0, y0, p) {
    const pintar = (dx, dy, color) => {
      g.fillStyle(color, 1);
      let x = x0;
      texto.split('').forEach((letra) => {
        const forma = LETRAS_TITULO[letra];
        if (!forma) { x += 3 * p; return; }
        forma.forEach((fila, fy) => {
          for (let fx = 0; fx < fila.length; fx++) {
            if (fila[fx] === '1') g.fillRect(x + fx * p + dx, y0 + fy * p + dy, p, p);
          }
        });
        x += 6 * p;
      });
    };
    pintar(Math.round(p / 2) + 2, Math.round(p / 2) + 2, 0x000000); // sombra
    pintar(0, 2, 0x8b5a2b);  // borde de abajo
    pintar(0, 0, 0xffe082);  // letras
  }

  // ---------------- Plaza de noche ----------------

  dibujarFondo() {
    const w = this.scale.width;
    const h = this.scale.height;
    const suelo = this.suelo;
    const g = this.add.graphics();

    // Cielo y estrellas
    g.fillGradientStyle(0x060a22, 0x060a22, 0x1c2754, 0x1c2754, 1).fillRect(0, 0, w, suelo);
    const azar = new Phaser.Math.RandomDataGenerator(['lomito']);
    for (let i = 0; i < 70; i++) {
      g.fillStyle(0xffffff, azar.realInRange(0.3, 0.9)).fillRect(azar.between(0, w), azar.between(0, suelo - 90), 2, 2);
    }
    for (let i = 0; i < 8; i++) { // algunas estrellas titilan
      const s = this.add.rectangle(azar.between(20, w - 20), azar.between(10, suelo - 120), 3, 3, 0xfff8e1);
      this.tweens.add({ targets: s, alpha: 0.1, duration: azar.between(700, 1600), yoyo: true, repeat: -1, delay: azar.between(0, 1500) });
    }

    // Luna en pixel art
    const lx = w - 130;
    const ly = 150;
    g.fillStyle(0xfff3c4, 1);
    [[-2, 3], [-3, 4], [-4, 4], [-4, 4], [-4, 4], [-4, 4], [-3, 4], [-2, 3]].forEach(([a, b], fila) => {
      g.fillRect(lx + a * 6, ly + (fila - 4) * 6, (b - a) * 6, 6);
    });
    g.fillStyle(0xe6d79a, 1).fillRect(lx - 12, ly - 12, 6, 6).fillRect(lx + 6, ly + 6, 12, 6);

    // Edificios y árboles a lo lejos
    g.fillStyle(0x10152e, 1);
    let x = 0;
    while (x < w) {
      const ancho = azar.between(50, 110);
      const alto = azar.between(40, 120);
      g.fillRect(x, suelo - alto, ancho, alto);
      g.fillStyle(0xffe082, 0.5);
      for (let vy = suelo - alto + 10; vy < suelo - 14; vy += 18) {
        for (let vx = x + 8; vx < x + ancho - 10; vx += 16) {
          if (azar.frac() < 0.25) g.fillRect(vx, vy, 6, 8);
        }
      }
      g.fillStyle(0x10152e, 1);
      x += ancho + azar.between(0, 12);
    }
    g.fillStyle(0x0f2a1a, 1);
    for (let ax = -20; ax < w; ax += 70) {
      const r = azar.between(26, 38);
      g.fillRect(ax, suelo - r * 1.4, r * 2, r * 1.4);
      g.fillRect(ax + r * 0.3, suelo - r * 1.8, r * 1.4, r * 0.5);
    }

    // Pasto y camino de baldosas
    g.fillStyle(0x1d3b22, 1).fillRect(0, suelo, w, h - suelo);
    g.fillStyle(0x24482a, 1);
    for (let i = 0; i < 60; i++) g.fillRect(azar.between(0, w), azar.between(suelo + 4, h - 4), 4, 4);
    const caminoY = suelo + 14;
    const caminoAlto = 46;
    g.fillStyle(0x4a4a5a, 1).fillRect(0, caminoY, w, caminoAlto);
    g.fillStyle(0x3a3a48, 1);
    g.fillRect(0, caminoY, w, 3).fillRect(0, caminoY + caminoAlto - 3, w, 3).fillRect(0, caminoY + caminoAlto / 2 - 1, w, 2);
    for (let bx = 0; bx < w; bx += 48) {
      g.fillRect(bx, caminoY, 2, caminoAlto / 2);
      g.fillRect(bx + 24, caminoY + caminoAlto / 2, 2, caminoAlto / 2);
    }

    // Banca a la izquierda
    const bx = 150;
    const by = suelo + 4;
    g.fillStyle(0x5d3a1a, 1).fillRect(bx, by - 34, 110, 8).fillRect(bx, by - 20, 110, 8);
    g.fillStyle(0x2b2b2b, 1).fillRect(bx + 8, by - 26, 6, 30).fillRect(bx + 96, by - 26, 6, 30);
  }

  // Faroles con luz que parpadea (uno anda medio malo)
  crearFaroles() {
    const w = this.scale.width;
    const suelo = this.suelo;
    const posiciones = [0.1, 0.36, 0.64, 0.9];
    posiciones.forEach((fraccion, i) => {
      const x = Math.round(w * fraccion);
      const arriba = suelo - 170;
      const luz = this.add.graphics();
      [[90, 0.06], [60, 0.08], [36, 0.12]].forEach(([r, a]) => luz.fillStyle(0xffd27a, a).fillCircle(x, arriba + 10, r));
      luz.fillStyle(0xffd27a, 0.1).fillEllipse(x, suelo + 14, 160, 30);
      const poste = this.add.graphics();
      poste.fillStyle(0x22222c, 1).fillRect(x - 3, arriba + 16, 6, suelo + 14 - arriba - 16);
      poste.fillRect(x - 8, suelo + 6, 16, 8);
      poste.fillRect(x - 10, arriba - 6, 20, 6).fillRect(x - 6, arriba + 12, 12, 6);
      const ampolleta = this.add.rectangle(x, arriba + 6, 14, 12, 0xffe9a8);
      this.parpadear([luz, ampolleta], i === 2);
    });
  }

  parpadear(objetos, malo) {
    const espera = malo ? Phaser.Math.Between(400, 1600) : Phaser.Math.Between(1800, 6000);
    this.time.delayedCall(espera, () => {
      const veces = malo ? Phaser.Math.Between(2, 4) : Phaser.Math.Between(1, 2);
      let t = 0;
      for (let k = 0; k < veces; k++) {
        this.time.delayedCall(t, () => objetos.forEach((o) => o.setAlpha(Phaser.Math.FloatBetween(0.15, 0.5))));
        t += Phaser.Math.Between(50, 110);
        this.time.delayedCall(t, () => objetos.forEach((o) => o.setAlpha(1)));
        t += Phaser.Math.Between(60, 140);
      }
      this.time.delayedCall(t, () => this.parpadear(objetos, malo));
    });
  }

  // ---------------- Perro ----------------

  programarLadrido() {
    const [min, max] = this.cfg.LADRIDO_CADA_MS;
    this.time.delayedCall(Phaser.Math.Between(min, max), () => {
      this.ladrar();
      this.programarLadrido();
    });
  }

  ladrar() {
    this.ladrando = true;
    this.time.delayedCall(320, () => { this.ladrando = false; });
    const p = this.perroP;
    const t = this.add.text(this.perroX + 22 * p, this.perroY - 4, '¡Guau!', {
      fontFamily: FUENTE, fontSize: '22px', color: '#ffffff', fontStyle: 'bold', stroke: '#000000', strokeThickness: 4
    }).setOrigin(0, 1).setAngle(-8);
    this.tweens.add({ targets: t, y: t.y - 26, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  // Perro de perfil mirando a la derecha, en una grilla de 22 x 14 cuadritos
  dibujarPerro(tiempo) {
    const g = this.perro;
    const p = this.perroP;
    const respira = Math.sin(tiempo / 260) > 0.6 ? -1 : 0; // el cuerpo sube un poquito al respirar
    const ox = this.perroX;
    const oy = this.perroY;
    const c = (x, y, an, al, color, dy) => {
      g.fillStyle(color, 1).fillRect(ox + x * p, oy + (y + (dy || 0)) * p, an * p, al * p);
    };
    const CAFE = 0xc68642;
    const CLARO = 0xe8b07a;
    const OSCURO = 0x7a4a22;
    g.clear();

    // Sombra
    g.fillStyle(0x000000, 0.35).fillEllipse(ox + 11 * p, oy + 13.5 * p, 18 * p, 2 * p);

    // Cola (se mueve rápido de lado a lado)
    const angulo = Phaser.Math.DegToRad(55 + Math.sin(tiempo / 70) * 30);
    for (let k = 1; k <= 5; k++) {
      const tx = Math.round(4 - k * Math.cos(angulo) * 0.9);
      const ty = Math.round(5 - k * Math.sin(angulo) * 0.9);
      c(tx, ty, 1, 1, k === 5 ? CLARO : CAFE, respira);
    }

    // Patas
    c(5, 10, 2, 3, OSCURO);
    c(8, 10, 2, 3, CAFE);
    c(12, 10, 2, 3, OSCURO);
    c(15, 10, 2, 3, CAFE);
    c(5, 12, 2, 1, 0x3b2410); c(8, 12, 2, 1, 0x3b2410); c(12, 12, 2, 1, 0x3b2410); c(15, 12, 2, 1, 0x3b2410);

    // Cuerpo
    c(4, 5, 13, 5, CAFE, respira);
    c(6, 9, 9, 1, CLARO, respira);
    c(8, 5, 4, 2, OSCURO, respira); // mancha en el lomo

    // Collar
    c(15, 4, 2, 4, 0xd32f2f, respira);
    c(16, 8, 1, 1, 0xffd54f, respira);

    // Cabeza (se levanta un poco al ladrar)
    const dc = respira + (this.ladrando ? -1 : 0);
    c(16, 1, 5, 5, CAFE, dc);
    c(16, 0, 2, 5, OSCURO, dc);       // oreja caída
    c(19, 2, 1, 1, 0x000000, dc);     // ojo
    c(19, 1, 1, 1, 0xffffff, dc);     // brillo
    if (this.ladrando) {
      c(21, 2, 2, 2, CLARO, dc);      // hocico de arriba
      c(22, 2, 1, 1, 0x000000, dc);   // nariz
      c(21, 4, 2, 1, 0xb71c1c, dc);   // boca abierta
      c(20, 5, 3, 1, CLARO, dc);      // mandíbula
    } else {
      c(21, 3, 2, 3, CLARO, dc);      // hocico
      c(22, 3, 1, 1, 0x000000, dc);   // nariz
      c(21, 5, 1, 1, 0xf48fb1, dc);   // lengüita
    }
  }
}
