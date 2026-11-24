# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.3** — experiencia, niveles e instintos.

## Cómo abrir el juego

1. Abre la carpeta `Lomito Survivor`.
2. Haz **doble clic** en `index.html`.
3. Se abrirá en tu navegador (Chrome, Edge o Firefox).

> Necesitas conexión a internet, porque el motor del juego (Phaser 3) se descarga desde internet al abrir la página.

## Controles

| Acción | Teclas |
|---|---|
| Mover al perro | **W A S D** o **flechas** |
| Elegir carta al subir de nivel | **clic**, o teclas **1**, **2**, **3** |
| Reiniciar (en Game Over) | **R** |

No hay botón para atacar: el perro muerde solo.

## Cómo se juega

- **Tú**: el círculo café. Empiezas con **100 de vida**.
- **Enemigos**: perros rivales (círculos rojos). Aparecen desde fuera de la pantalla y te persiguen. Con el tiempo llegan cada vez más seguido.
- **Mordida automática**: una vez por segundo, tu perro muerde al enemigo más cercano si está cerca. Lo verás como un arco blanco. Al principio cada enemigo muere con 2 mordidas.
- **Daño**: si un enemigo te toca, pierdes vida y la pantalla tiembla. Después de cada golpe tienes medio segundo de invulnerabilidad (el perro se ve semitransparente).

### Huesos, experiencia y niveles

- Cada enemigo derrotado suelta un **hueso** (cuadradito amarillo).
- Pasa cerca para recogerlo: cuando estás cerca, el hueso vuela solo hacia ti (como un imán).
- Cada hueso llena la **barra celeste** de arriba de la pantalla. Al llenarla subes de nivel. Cada nivel pide un poco más de huesos que el anterior.

### Instintos (mejoras)

Al subir de nivel el juego se pausa y aparecen **3 cartas al azar**. Elige una con clic o con las teclas 1, 2 o 3. Cada instinto llega hasta **nivel 5**; cuando llega al máximo ya no vuelve a aparecer.

| Instinto | Qué hace |
|---|---|
| **Mordida rápida** | Muerdes más seguido |
| **Colmillos** | Cada mordida hace más daño |
| **Patas ligeras** | Corres más rápido |
| **Pellejo duro** | Más vida máxima y te cura un poco |
| **Olfato** | Atraes los huesos desde más lejos |
| **Ladrido** | Nuevo ataque: cada pocos segundos una onda blanca daña y empuja a los enemigos cercanos. Cada nivel ladra más seguido, más lejos y más fuerte |

### Pantalla

- Arriba de todo: barra de experiencia y tu **nivel**.
- Arriba a la izquierda: barra de **vida** (se pone roja cuando queda poca).
- Arriba a la derecha: **tiempo** sobrevivido.

### Game Over

Al llegar a 0 de vida aparece "Game Over" con tu tiempo, el **nivel alcanzado** y los **enemigos derrotados**. Presiona **R** para jugar de nuevo.

## Cómo ajustar el juego (`src/config.js`)

Todos los números importantes están en `src/config.js`, con comentarios en español.

1. Abre `src/config.js` con el Bloc de notas (clic derecho → Abrir con → Bloc de notas).
2. Cambia solo el número que quieras (por ejemplo `PERRO_VIDA_MAX: 100` → `PERRO_VIDA_MAX: 200`).
3. Guarda el archivo y recarga el juego con **F5**.

**El perro, la mordida y los enemigos**

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

**Huesos y niveles**

| Ajuste | Qué hace |
|---|---|
| `HUESO_XP` | Experiencia que da cada hueso |
| `IMAN_RADIO` | Desde qué distancia los huesos vuelan hacia ti |
| `IMAN_VELOCIDAD` | Qué tan rápido vuelan los huesos |
| `XP_NIVEL_INICIAL` | Huesos que pide el primer nivel |
| `XP_NIVEL_AUMENTO` | Cuántos huesos más pide cada nivel que el anterior |

**Instintos** (cada número es lo que suma cada nivel del instinto)

| Ajuste | Qué hace |
|---|---|
| `INSTINTO_NIVEL_MAX` | Nivel máximo de cada instinto |
| `MORDIDA_RAPIDA_MS` | Mordida rápida: cuántos ms antes muerde por nivel |
| `COLMILLOS_DANO` | Colmillos: daño extra por nivel |
| `PATAS_VELOCIDAD` | Patas ligeras: velocidad extra por nivel |
| `PELLEJO_VIDA` / `PELLEJO_CURA` | Pellejo duro: vida máxima extra / curación por nivel |
| `OLFATO_IMAN` | Olfato: alcance extra del imán por nivel |
| `LADRIDO_CADA_MS` / `LADRIDO_CADA_MENOS_MS` | Ladrido: cada cuánto ladra / cuánto antes por nivel |
| `LADRIDO_RADIO` / `LADRIDO_RADIO_EXTRA` | Ladrido: tamaño del círculo / cuánto crece por nivel |
| `LADRIDO_DANO` / `LADRIDO_DANO_EXTRA` | Ladrido: daño / daño extra por nivel |
| `LADRIDO_EMPUJE` / `LADRIDO_EMPUJE_MS` | Ladrido: fuerza del empujón / cuánto dura |

> Cuidado: no borres las comas ni los dos puntos. Si el juego queda en pantalla negra después de un cambio, revisa lo último que editaste.

## Archivos

- `index.html` — la página que abre el juego.
- `src/config.js` — los números para ajustar el juego.
- `src/instintos.js` — nombres y frases de las cartas de instintos.
- `src/main.js` — configuración del motor del juego.
- `src/scenes/GameScene.js` — la escena con el perro, los enemigos, los ataques, la experiencia, las cartas y el Game Over.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**. Si acabas de editar `src/config.js`, revisa ese cambio.
- El perro no se mueve, las teclas 1/2/3 o R no responden: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
