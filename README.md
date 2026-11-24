# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.2** — enemigos, mordida automática y Game Over.

## Cómo abrir el juego

1. Abre la carpeta `Lomito Survivor`.
2. Haz **doble clic** en `index.html`.
3. Se abrirá en tu navegador (Chrome, Edge o Firefox).

> Necesitas conexión a internet, porque el motor del juego (Phaser 3) se descarga desde internet al abrir la página.

## Controles

| Acción | Teclas |
|---|---|
| Mover al perro | **W A S D** o **flechas** |
| Reiniciar (en Game Over) | **R** |

No hay botón para atacar: el perro muerde solo.

## Cómo se juega

- **Tú**: el círculo café. Empiezas con **100 de vida**.
- **Enemigos**: perros rivales (círculos rojos). Aparecen desde fuera de la pantalla y te persiguen. Con el tiempo llegan cada vez más seguido.
- **Mordida automática**: una vez por segundo, tu perro muerde al enemigo más cercano si está cerca. Lo verás como un arco blanco. Cada enemigo muere con 2 mordidas.
- **Daño**: si un enemigo te toca, pierdes vida y la pantalla tiembla. Después de cada golpe tienes medio segundo de invulnerabilidad (el perro se ve semitransparente).
- **Pantalla**: arriba a la izquierda está la barra de vida (se pone roja cuando queda poca); arriba a la derecha, el tiempo sobrevivido.
- **Game Over**: al llegar a 0 de vida aparece "Game Over" con tu tiempo. Presiona **R** para jugar de nuevo.

## Cómo ajustar el juego (`src/config.js`)

Todos los números importantes están en `src/config.js`, con comentarios en español.

1. Abre `src/config.js` con el Bloc de notas (clic derecho → Abrir con → Bloc de notas).
2. Cambia solo el número que quieras (por ejemplo `PERRO_VIDA_MAX: 100` → `PERRO_VIDA_MAX: 200`).
3. Guarda el archivo y recarga el juego con **F5**.

| Ajuste | Qué hace |
|---|---|
| `PERRO_VIDA_MAX` | Vida inicial del perro |
| `PERRO_VELOCIDAD` | Qué tan rápido se mueve el perro |
| `PERRO_INVULNERABLE_MS` | Tiempo sin recibir daño después de un golpe (1000 = 1 segundo) |
| `MORDIDA_DANO` | Daño de cada mordida |
| `MORDIDA_ALCANCE` | Qué tan cerca debe estar un enemigo para morderlo |
| `MORDIDA_CADA_MS` | Cada cuánto muerde (1000 = una vez por segundo) |
| `ENEMIGO_VIDA` | Vida de cada enemigo |
| `ENEMIGO_VELOCIDAD` | Qué tan rápido persiguen los enemigos |
| `ENEMIGO_DANO` | Vida que te quitan al tocarte |
| `ENEMIGOS_MAXIMOS` | Máximo de enemigos a la vez |
| `APARICION_INICIAL_MS` | Cada cuánto aparece un enemigo al empezar |
| `APARICION_MINIMA_MS` | Lo más rápido que pueden llegar a aparecer |
| `APARICION_ACELERA_MS` | Cuánto se acelera la aparición por cada segundo sobrevivido |

> Cuidado: no borres las comas ni los dos puntos. Si el juego queda en pantalla negra después de un cambio, revisa lo último que editaste.

## Archivos

- `index.html` — la página que abre el juego.
- `src/config.js` — los números para ajustar el juego.
- `src/main.js` — configuración del motor del juego.
- `src/scenes/GameScene.js` — la escena con el perro, los enemigos, la mordida, la vida y el Game Over.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**. Si acabas de editar `src/config.js`, revisa ese cambio.
- El perro no se mueve o R no reinicia: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
