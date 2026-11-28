// Configuración principal del juego.

// v0.28.1: con ?galeria=1 en la dirección se abre solo la galería de prueba de los
// sprites nuevos (src/scenes/GaleriaScene.js). Sin eso, el juego arranca como siempre.
const MODO_GALERIA = /[?&]galeria=1(&|$)/.test(window.location.search);

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 960,
  height: 540,
  backgroundColor: '#333333', // gris oscuro
  pixelArt: true, // sin suavizado: los píxeles se ven nítidos (estilo 8 bits)
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  // El juego mide siempre 960 x 540 y se agranda o achica para caber en
  // cualquier pantalla sin deformarse (quedan franjas negras si sobra espacio)
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // Varios dedos a la vez (moverse con el joystick y apretar Sprint)
  input: {
    activePointers: 3
  },
  disableContextMenu: true,
  scene: MODO_GALERIA
    ? [GaleriaScene] // galería de prueba (no es una partida)
    : [BienvenidaScene, MenuScene, MapaScene, GameScene, AlbumScene, ApuestasScene, ArbolScene, RankingScene, ComoJugarScene] // la primera de la lista es la que se muestra al abrir
};

const game = new Phaser.Game(config);
