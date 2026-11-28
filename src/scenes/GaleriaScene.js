// Galería de prueba de los sprites nuevos (v0.28.1). Solo se abre con ?galeria=1
// (ver src/main.js). No es una partida: no hay menú, ranking, sesión ni guardados.
// Los dibujos y el cargador están en src/sprites_nuevos.js.
// (FUENTE viene de MenuScene.js)

const GALERIA_FONDO = '#1f2440';
const GALERIA_ESCALAS = { 1: 'real', 2: 'como los perros jugables', 3: 'como los enemigos viejos' };

class GaleriaScene extends Phaser.Scene {
  constructor() {
    super('GaleriaScene');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.cameras.main.setBackgroundColor(GALERIA_FONDO);
    this.ids = crearSpritesNuevos(this);
    this.indice = 0;
    this.indiceAnim = 0;
    this.escala = 2;
    this.volteado = false;

    const estilo = (tam, color, extra) => ({ fontFamily: FUENTE, fontSize: tam + 'px', color, ...(extra || {}) });

    this.add.text(w / 2, 16, 'Galería de sprites nuevos', estilo(26, '#ffe082', { fontStyle: 'bold' })).setOrigin(0.5, 0);
    this.textoNombre = this.add.text(w / 2, 52, '', estilo(20, '#ffffff', { fontStyle: 'bold' })).setOrigin(0.5, 0);
    this.textoDatos = this.add.text(w / 2, 78, '', estilo(14, '#cfd8dc')).setOrigin(0.5, 0);

    // Personaje al centro, con una cruz chica en el piso para ver dónde está su centro
    this.add.rectangle(w / 2, 290, 220, 220, 0x000000, 0.18).setStrokeStyle(1, 0xffffff, 0.12);
    this.sprite = this.add.sprite(w / 2, 290, '__DEFAULT');

    // Lista de animaciones (izquierda): se pueden tocar con el mouse
    this.add.text(24, 120, 'Animaciones', estilo(16, '#ffe082', { fontStyle: 'bold' }));
    this.capaAnims = [];

    // Estado (derecha): cuadro actual, escala y si está en pausa
    this.textoEstado = this.add.text(w - 24, 120, '', estilo(15, '#ffffff', { align: 'right', lineSpacing: 6 })).setOrigin(1, 0);

    // Flechas para cambiar de personaje con el mouse
    const flecha = (x, texto, paso) => {
      const t = this.add.text(x, 290, texto, estilo(40, '#ffe082', { fontStyle: 'bold' })).setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => this.cambiarPersonaje(paso));
    };
    flecha(w / 2 - 170, '◄', -1);
    flecha(w / 2 + 170, '►', 1);

    this.add.text(w / 2, h - 92, '← → cambiar personaje   ·   ↑ ↓ o clic: cambiar animación   ·   Espacio: pausar o relanzar   ·   F: voltear',
      estilo(14, '#e0e0e0')).setOrigin(0.5, 0);
    this.add.text(w / 2, h - 70, '1 / 2 / 3: escala (1 = real, 2 = como los perros jugables, 3 = como los enemigos viejos)',
      estilo(14, '#e0e0e0')).setOrigin(0.5, 0);
    this.add.text(w / 2, h - 48, 'Hoy los perros jugables se ven a 64 px (32x2) y los enemigos viejos a 48 px (16x3).',
      estilo(13, '#b0bec5')).setOrigin(0.5, 0);
    this.add.text(w / 2, h - 22, 'Galería de prueba v' + VERSION_JUEGO + ' — no es una partida. Saca ?galeria=1 para jugar normal.',
      estilo(12, '#8a8fa8')).setOrigin(0.5, 0);

    // Teclado
    const k = this.input.keyboard;
    this.teclas = {
      izq: k.addKey('LEFT'), der: k.addKey('RIGHT'), arriba: k.addKey('UP'), abajo: k.addKey('DOWN'),
      espacio: k.addKey('SPACE'), f: k.addKey('F'), uno: k.addKey('ONE'), dos: k.addKey('TWO'), tres: k.addKey('THREE')
    };
    // Clic sobre el personaje: siguiente animación
    // (una zona fija del tamaño del recuadro: el dibujo cambia de tamaño con la escala)
    this.add.zone(w / 2, 290, 220, 220).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.cambiarAnim(1));

    if (this.ids.length === 0) {
      this.textoNombre.setText('No se cargó ningún sprite nuevo (revisa la consola)').setColor('#ff8a80');
      this.sprite.setVisible(false);
      return;
    }
    this.mostrarPersonaje();
  }

  update() {
    if (this.ids.length === 0) return;
    const J = Phaser.Input.Keyboard.JustDown;
    const t = this.teclas;
    if (J(t.izq)) this.cambiarPersonaje(-1);
    if (J(t.der)) this.cambiarPersonaje(1);
    if (J(t.arriba)) this.cambiarAnim(-1);
    if (J(t.abajo)) this.cambiarAnim(1);
    if (J(t.espacio)) this.pausarORelanzar();
    if (J(t.f)) {
      this.volteado = !this.volteado;
      this.sprite.setFlipX(this.volteado);
    }
    if (J(t.uno)) this.cambiarEscala(1);
    if (J(t.dos)) this.cambiarEscala(2);
    if (J(t.tres)) this.cambiarEscala(3);
    this.dibujarEstado();
  }

  datosActual() {
    const id = this.ids[this.indice];
    return { id, info: SPRITES_NUEVOS[id], datos: SPRITES_NUEVOS[id].datos() };
  }

  cambiarPersonaje(paso) {
    const n = this.ids.length;
    this.indice = (this.indice + paso + n) % n;
    this.indiceAnim = 0;
    this.mostrarPersonaje();
  }

  cambiarAnim(paso) {
    const n = this.anims_.length;
    this.indiceAnim = (this.indiceAnim + paso + n) % n;
    this.jugarAnim();
  }

  cambiarEscala(e) {
    this.escala = e;
    this.sprite.setScale(e);
  }

  // Espacio: si anda, se pausa; si está en pausa, sigue; si ya terminó (no se repite), parte de nuevo
  pausarORelanzar() {
    const a = this.sprite.anims;
    if (a.isPaused) a.resume();
    else if (a.isPlaying) a.pause();
    else this.jugarAnim();
  }

  mostrarPersonaje() {
    const { id, info, datos } = this.datosActual();
    this.anims_ = animsSpriteNuevo(datos);
    this.sprite.setTexture(id, 0).setScale(this.escala).setFlipX(this.volteado);
    this.textoNombre.setText(info.nombre + '   (' + (this.indice + 1) + ' / ' + this.ids.length + ')');
    this.textoDatos.setText('Clave: ' + id + '   ·   Tamaño: ' + datos.size + ' x ' + datos.size);

    // Lista de animaciones con sus cuadros (se pueden tocar)
    this.capaAnims.forEach((o) => o.destroy());
    this.capaAnims = this.anims_.map((nombre, i) => {
      const t = this.add.text(24, 150 + i * 26, '', { fontFamily: FUENTE, fontSize: '15px', color: '#ffffff' })
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => { this.indiceAnim = i; this.jugarAnim(); });
      return t;
    });
    this.jugarAnim();
  }

  jugarAnim() {
    const { id, datos } = this.datosActual();
    const nombre = this.anims_[this.indiceAnim];
    this.sprite.anims.play(id + '_' + nombre);
    this.capaAnims.forEach((t, i) => {
      const n = this.anims_[i];
      const elegida = i === this.indiceAnim;
      t.setText((elegida ? '▶ ' : '   ') + n + '  (' + datos.anims[n].length + ' cuadros)')
        .setColor(elegida ? '#ffe082' : '#cfd8dc').setFontStyle(elegida ? 'bold' : 'normal');
    });
  }

  dibujarEstado() {
    const { datos } = this.datosActual();
    const nombre = this.anims_[this.indiceAnim];
    const total = datos.anims[nombre].length;
    const a = this.sprite.anims;
    const cuadro = a.currentFrame ? a.currentFrame.index : 1;
    const [fps, repetir] = SPRITES_NUEVOS_VELOCIDAD[nombre] || [8, 0];
    const estado = a.isPaused ? 'En pausa' : a.isPlaying ? 'Animando' : 'Terminó (Espacio la repite)';
    this.textoEstado.setText([
      'Animación: ' + nombre,
      'Cuadro: ' + cuadro + ' / ' + total,
      fps + ' cuadros por seg. · ' + (repetir === -1 ? 'se repite' : 'una vez'),
      estado,
      '',
      'Escala ' + this.escala + ' (' + GALERIA_ESCALAS[this.escala] + ')',
      'Se ve a ' + datos.size * this.escala + ' px (' + datos.size + 'x' + this.escala + ')',
      'Volteado: ' + (this.volteado ? 'sí (mira a la izquierda)' : 'no (mira a la derecha)')
    ].join('\n'));
  }
}
