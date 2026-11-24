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
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MenuScene, GameScene] // la primera de la lista es la que se muestra al abrir
};

const game = new Phaser.Game(config);
