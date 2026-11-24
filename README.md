# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.1** — proyecto base y movimiento del perro.

## Cómo abrir el juego

1. Abre la carpeta `Lomito Survivor`.
2. Haz **doble clic** en `index.html`.
3. Se abrirá en tu navegador (Chrome, Edge o Firefox).

> Necesitas conexión a internet, porque el motor del juego (Phaser 3) se descarga desde internet al abrir la página.

## Controles

| Acción | Teclas |
|---|---|
| Mover al perro | **W A S D** o **flechas** |

## Qué hay en esta versión

- El perro (círculo café) sobre un fondo gris oscuro con una cuadrícula tenue.
- El mapa es más grande que la pantalla; la cámara sigue al perro.
- El perro no puede salir del mapa.
- Texto fijo "Lomito Survivor - v0.1" en la esquina superior izquierda.

## Archivos

- `index.html` — la página que abre el juego.
- `src/main.js` — configuración del juego.
- `src/scenes/GameScene.js` — la escena con el perro, la cámara y los controles.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**.
- El perro no se mueve: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
