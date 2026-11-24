// Pantalla de inicio: elegir la raza del perro (y abrir el Álbum de coleccionables).
// Arriba a la izquierda se ven los huesitos guardados (src/huesitos.js).

const FUENTE = 'Arial, sans-serif';

// Dibuja un perro en pixel art (los dibujos están en src/sprites.js).
// Si la raza no tiene dibujo, usa uno por defecto pintado con su COLOR.
// La usan la pantalla de inicio y la escena de juego.
function dibujarPerro(escena, x, y, razaId) {
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
    crearSprites(this);
    this.anims.resumeAll(); // por si venimos de un Game Over (animaciones en pausa)

    this.add.text(w / 2, 50, 'Lomito Survivor', {
      fontFamily: FUENTE, fontSize: '48px', color: '#ffe082', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(w / 2, 95, 'Elige tu raza (clic o teclas 1 a ' + this.listaRazas().length + ')', {
      fontFamily: FUENTE, fontSize: '18px', color: '#dddddd'
    }).setOrigin(0.5);

    this.add.text(w - 10, this.scale.height - 8, 'Lomito Survivor - v0.13', {
      fontFamily: FUENTE, fontSize: '13px', color: '#888888'
    }).setOrigin(1, 1);

    this.crearCartas();
    this.crearBotonAlbum();

    // Huesitos guardados (la moneda del juego)
    this.textoHuesitos = this.add.text(14, 12, '', {
      fontFamily: FUENTE, fontSize: '18px', color: '#f2d64b', fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
    });
    this.actualizarHuesitos();

    const nombresTeclas = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    this.teclas = this.razas.map((_, i) => this.input.keyboard.addKey(nombresTeclas[i]));
    this.teclaAlbum = this.input.keyboard.addKey('A');
    this.teclaH = this.input.keyboard.addKey('H'); // modo de prueba: +100 huesitos guardados
  }

  actualizarHuesitos() {
    this.textoHuesitos.setText('Huesitos: ' + huesitosGuardados());
  }

  update() {
    this.teclas.forEach((tecla, i) => {
      if (Phaser.Input.Keyboard.JustDown(tecla)) this.elegir(i);
    });
    if (Phaser.Input.Keyboard.JustDown(this.teclaAlbum)) this.scene.start('AlbumScene');
    // Modo de prueba: H da huesitos guardados (cuánto, en CONFIG.HUESITOS.PRUEBA_TECLA_H)
    if (Phaser.Input.Keyboard.JustDown(this.teclaH)) {
      sumarHuesitos(CONFIG.HUESITOS.PRUEBA_TECLA_H);
      this.actualizarHuesitos();
      const t = this.add.text(14, 36, '+' + CONFIG.HUESITOS.PRUEBA_TECLA_H + ' (prueba)', {
        fontFamily: FUENTE, fontSize: '15px', color: '#f2d64b', stroke: '#000000', strokeThickness: 3
      });
      this.tweens.add({ targets: t, y: 26, alpha: 0, duration: 900, onComplete: () => t.destroy() });
    }
  }

  // Botón "Álbum" abajo al centro (src/scenes/AlbumScene.js)
  crearBotonAlbum() {
    const cx = this.scale.width / 2;
    const cy = this.scale.height - 26;
    const ancho = 260;
    const alto = 34;
    const encontrados = cuantosEncontrados('plaza') + ' / ' + listaColeccionables('plaza').length;
    const g = this.add.graphics();
    const pintar = (encima) => {
      g.clear();
      marcoPixel(g, cx - ancho / 2, cy - alto / 2, ancho, alto, encima ? 0xffffff : 0xce93d8, encima ? 0x4a3560 : 0x2a1f3a);
    };
    pintar(false);
    this.add.text(cx, cy, 'Álbum (A)   ✦ ' + encontrados, {
      fontFamily: FUENTE, fontSize: '16px', color: '#f3e5f5', fontStyle: 'bold'
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

    this.razas.forEach((raza, i) => {
      const cfg = CONFIG.RAZAS[raza.id];
      const cx = inicioX + i * separacion;

      const fondo = this.add.rectangle(cx, arriba + altoCarta / 2, anchoCarta, altoCarta, 0x2b2b3a)
        .setStrokeStyle(3, 0x888899)
        .setInteractive({ useHandCursor: true });
      fondo.on('pointerover', () => fondo.setStrokeStyle(3, 0xf2d64b));
      fondo.on('pointerout', () => fondo.setStrokeStyle(3, 0x888899));
      fondo.on('pointerdown', () => this.elegir(i));

      this.add.text(cx - anchoCarta / 2 + 8, arriba + 6, '[' + (i + 1) + ']', {
        fontFamily: FUENTE, fontSize: '15px', color: '#aaaaaa'
      });

      // El perro camina en su lugar sobre la carta
      dibujarPerro(this, cx, arriba + 38, raza.id).play(claveSprite(raza.id, SPRITE_PERRO_POR_DEFECTO) + '_caminar');

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
      poner('Poder: ' + raza.poder + espera, { fontSize: '14px', color: '#ffe082', fontStyle: 'bold' }, 4);
      poner(raza.poderTexto, { fontSize: '13px', color: '#dddddd' }, 0);
    });
  }

  elegir(indice) {
    const raza = this.razas[indice];
    if (!raza) return;
    this.scene.start('GameScene', { raza: raza.id });
  }
}
