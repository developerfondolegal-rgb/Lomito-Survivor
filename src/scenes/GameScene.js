// Escena principal: la plaza donde vive el perro.
const WORLD_WIDTH = 3000;
const WORLD_HEIGHT = 3000;
const DOG_RADIUS = 20;
const DOG_SPEED = 220; // píxeles por segundo

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    // Límites del mapa (más grande que la pantalla)
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Cuadrícula tenue para que se note el movimiento de la cámara
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x3d3d3d, 1);
    for (let x = 0; x <= WORLD_WIDTH; x += 100) {
      grid.lineBetween(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += 100) {
      grid.lineBetween(0, y, WORLD_WIDTH, y);
    }
    // Borde del mapa
    grid.lineStyle(4, 0x555555, 1);
    grid.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // El perro: un círculo café en el centro del mapa
    this.dog = this.add.circle(WORLD_WIDTH / 2, WORLD_HEIGHT / 2, DOG_RADIUS, 0x8b5a2b);
    this.physics.add.existing(this.dog);
    this.dog.body.setCircle(DOG_RADIUS);
    this.dog.body.setCollideWorldBounds(true);

    // La cámara sigue al perro
    this.cameras.main.startFollow(this.dog, true, 0.1, 0.1);

    // Controles: flechas + WASD
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // Texto fijo en la esquina (no se mueve con la cámara)
    this.add.text(12, 12, 'Lomito Survivor - v0.1', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    })
      .setScrollFactor(0)
      .setDepth(1000);
  }

  update() {
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

    // Normalizar para que en diagonal no vaya más rápido
    const vec = new Phaser.Math.Vector2(dx, dy).normalize().scale(DOG_SPEED);
    this.dog.body.setVelocity(vec.x, vec.y);
  }
}
