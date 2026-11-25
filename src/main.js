// Configuración principal del juego.
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
  scene: [MenuScene, GameScene, AlbumScene, ApuestasScene, ArbolScene] // la primera de la lista es la que se muestra al abrir
};

const game = new Phaser.Game(config);
