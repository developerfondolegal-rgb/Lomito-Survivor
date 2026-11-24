# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.6.1** — personajes en pixel art (con limpieza de ajustes y zonas de choque).

## Cómo abrir el juego

1. Abre la carpeta `Lomito Survivor`.
2. Haz **doble clic** en `index.html`.
3. Se abrirá en tu navegador (Chrome, Edge o Firefox).

> Necesitas conexión a internet, porque el motor del juego (Phaser 3) se descarga desde internet al abrir la página.

## Controles

| Acción | Teclas |
|---|---|
| Elegir raza (pantalla de inicio) | **clic**, o teclas **1**, **2**, **3**, **4** |
| Mover al perro | **W A S D** o **flechas** |
| Sprint (solo Galgo) | **Espacio** |
| Elegir carta al subir de nivel | **clic**, o teclas **1**, **2**, **3** |
| Jugar de nuevo con la misma raza (en Game Over) | **R** |
| Volver a la pantalla de inicio (en Game Over) | **M** |
| Modo de prueba: un enemigo de cada tipo cerca del perro | **T** |

No hay botón para atacar: el perro muerde solo.

### Modo de prueba (tecla T)

Durante la partida, presiona **T** y aparecerá un enemigo de cada tipo en un círculo alrededor del perro (la Manada aparece como grupo completo). Sirve para ver cómo se mueve cada enemigo sin esperar minutos. Puedes presionarla varias veces. Estos enemigos **no sueltan huesos ni cuentan** en el Game Over, pero sí hacen daño y atrapan como los normales.

## Razas

Al abrir el juego eliges una raza. Cada una tiene distinta vida, velocidad, mordida, tamaño y un poder especial.

Todos los personajes están dibujados en **pixel art estilo 8 bits** (ver más abajo cómo editarlos). Caminan con una animación de 2 cuadros y se dan vuelta según hacia dónde se mueven.

| Raza | Cómo se ve | Cómo es | Poder especial |
|---|---|---|---|
| **Quiltro** (mestizo) | perro café, orejas caídas y cola parada | Equilibrado y resistente | **Calle** (pasivo): los enemigos siempre sueltan hueso y te curas un poco con el tiempo |
| **Pitbull** | perro gris azulado, ancho, cabeza grande y pecho blanco | Lento, mucha vida, mordida fuerte | **Mandíbula de hierro** (cada 6 s): la siguiente mordida aturde al enemigo (queda quieto y morado) y hace daño extra |
| **Galgo** | perro beige, muy delgado y de patas largas (el más chico) | Muy rápido y frágil | **Sprint** (tecla Espacio, cada 4 s): carrera corta muy rápida hacia donde te mueves, sin recibir daño |
| **Beagle** | perro blanco con cabeza café y lomo negro (tricolor), chico | Mordida débil, gran olfato | **Rastreo** (pasivo): imán de huesos gigante y flechas naranjas en el borde que apuntan a enemigos fuera de la pantalla |

Con las otras razas (no Quiltro), los enemigos sueltan hueso 3 de cada 4 veces.

## Cómo se juega

- **Enemigos**: aparecen desde fuera de la pantalla y con el tiempo llegan cada vez más seguido (ver tabla abajo).
- **Mordida automática**: tu perro muerde solo al enemigo más cercano si está cerca. Lo verás como unos dientes blancos sobre el enemigo (amarillos y más grandes si es la Mandíbula de hierro).
- **Daño**: si un enemigo te toca, pierdes vida y la pantalla tiembla. Después de cada golpe tienes medio segundo de invulnerabilidad (el perro se ve semitransparente).

### Enemigos

Al inicio solo hay perros rivales. Los demás se van sumando con el tiempo:

| Enemigo | Cómo se ve | Qué hace | Aparece desde | Huesos |
|---|---|---|---|---|
| **Perro rival** | perro rojizo con orejas paradas | Te persigue | 0:00 | 1 |
| **Manada** | perritos rojizos pequeños | Llegan en grupos de 3 a 4, rápidos y con poca vida. Aparecen menos seguido que el borracho o el drogadicto | 0:45 | 1 cada uno |
| **Borracho** | persona con camisa naranja, nariz roja y una botella | Lento, camina zigzagueando, mucha vida y golpe fuerte | 1:30 | 3 |
| **Drogadicto** | persona encorvada con polerón verde pálido | Se acerca, se queda quieto parpadeando con una **línea verde** que avisa hacia dónde va, y embiste muy rápido en línea recta. ¡Sal de la línea! | 2:30 | 3 |
| **Perrera** | persona con uniforme azul, gorra y un palo con lazo | No hace daño, pero si te toca te deja **atrapado 1,5 segundos** (aparece una jaula azul). Después se ve transparente un rato y no puede volver a atraparte. Aparece poco (máximo 2 a la vez) | 3:30 | 5 |

Los poderes de las razas, los instintos y el Ladrido funcionan contra todos. La Mandíbula de hierro del Pitbull también los aturde. El Sprint del Galgo evita que la Perrera te atrape.

### Huesos, experiencia y niveles

- Los enemigos derrotados sueltan **huesos** (huesitos amarillos). Los más duros sueltan más.
- Pasa cerca para recogerlos: cuando estás cerca, el hueso vuela solo hacia ti (como un imán).
- Cada hueso llena la **barra celeste** de arriba. Al llenarla subes de nivel. Cada nivel pide un poco más de huesos que el anterior.

### Instintos (mejoras)

Al subir de nivel el juego se pausa y aparecen **3 cartas al azar**. Elige una con clic o con las teclas 1, 2 o 3. Cada instinto llega hasta **nivel 5**; cuando llega al máximo ya no vuelve a aparecer. Funcionan con todas las razas (se suman a los números de la raza).

| Instinto | Qué hace |
|---|---|
| **Mordida rápida** | Muerdes más seguido |
| **Colmillos** | Cada mordida hace más daño |
| **Patas ligeras** | Corres más rápido |
| **Pellejo duro** | Más vida máxima y te cura un poco |
| **Olfato** | Atraes los huesos desde más lejos |
| **Ladrido** | Nuevo ataque: cada pocos segundos una onda blanca pixelada daña y empuja a los enemigos cercanos. Cada nivel ladra más seguido, más lejos y más fuerte |

### Pantalla

- Arriba de todo: barra de experiencia y tu **nivel**.
- Arriba a la izquierda: barra de **vida**, tu **raza** y su poder. Si el poder tiene espera (Pitbull y Galgo), una barrita muestra cuánto falta; cuando se pone amarilla dice **¡Listo!**
- Arriba a la derecha: **tiempo** sobrevivido.

### Game Over

Al llegar a 0 de vida aparece "Game Over" con tu raza, tu tiempo, el nivel alcanzado, el total de enemigos derrotados y cuántos de cada tipo.
- **R**: jugar de nuevo con la misma raza.
- **M**: volver a la pantalla de inicio para elegir otra raza.

## Cómo ajustar el juego

1. Abre el archivo con el Bloc de notas (clic derecho → Abrir con → Bloc de notas).
2. Cambia solo el número o texto que quieras.
3. Guarda el archivo y recarga el juego con **F5**.

> Cuidado: no borres las comas, los dos puntos ni las comillas. Si el juego queda en pantalla negra después de un cambio, revisa lo último que editaste.

### Números de las razas (`src/config.js`, sección `RAZAS`)

Cada raza tiene su bloque (`quiltro`, `pitbull`, `galgo`, `beagle`) con:

| Ajuste | Qué hace |
|---|---|
| `COLOR` | No cambia el dibujo (eso está en `src/sprites.js`). Solo se usa para pintar una raza nueva que no tenga dibujo |
| `VIDA` | Vida inicial |
| `VELOCIDAD` | Qué tan rápido se mueve |
| `MORDIDA_DANO` | Daño de cada mordida |
| `MORDIDA_CADA_MS` | Cada cuánto muerde (1000 = una vez por segundo) |
| `RADIO` | Tamaño del choque (más chico = más fácil esquivar). No depende del dibujo |
| `HUESO_PROBABILIDAD` | Probabilidad de que un enemigo suelte hueso (1 = siempre, 0.75 = 3 de cada 4) |
| `IMAN_EXTRA` | Alcance extra del imán de huesos |
| `PODER` | Qué poder usa (`'calle'`, `'mandibula'`, `'sprint'`, `'rastreo'` o `''` para ninguno) |
| `PODER_ESPERA_MS` | Espera del poder (0 = pasivo) |

Y los números propios de cada poder:

| Ajuste | Raza | Qué hace |
|---|---|---|
| `CALLE_CURA` / `CALLE_CURA_CADA_MS` | Quiltro | Vida que recupera / cada cuánto |
| `MANDIBULA_DANO_EXTRA` | Pitbull | Daño extra de la mordida cargada |
| `MANDIBULA_ATURDIR_MS` | Pitbull | Cuánto tiempo queda quieto el enemigo |
| `SPRINT_VELOCIDAD` / `SPRINT_DURACION_MS` | Galgo | Velocidad / duración del sprint |
| `RASTREO_FLECHAS_MAX` | Beagle | Máximo de flechas en pantalla |

### Textos de las razas (`src/razas.js`)

Nombre, frase, fortalezas, debilidades y poder que se leen en las cartas de inicio.

**Agregar una raza nueva:** copia un bloque en `src/razas.js` y otro en `src/config.js` (sección `RAZAS`) con el mismo `id` nuevo (sin espacios ni tildes, por ejemplo `chihuahua`), y cambia sus números y textos. En `PODER` puedes reutilizar un poder existente o dejar `''`. Aparecerá sola en la pantalla de inicio (hasta 9 razas).

### Números de los enemigos (`src/config.js`, sección `ENEMIGOS`)

Cada enemigo tiene su bloque (`rival`, `manada`, `borracho`, `drogadicto`, `perrera`) con:

| Ajuste | Qué hace |
|---|---|
| `COLOR` | Solo se usa para pintar un enemigo nuevo que no tenga dibujo |
| `RADIO` | Tamaño del choque y de la mordida (no depende del dibujo) |
| `VIDA` | Vida del enemigo |
| `VELOCIDAD` | Qué tan rápido se mueve |
| `DANO` | Vida que te quita al tocarte (0 = no hace daño) |
| `HUESOS` | Cuántos huesos suelta al morir |
| `DESDE_SEGUNDOS` | Desde qué segundo aparece (45 = 0:45, 90 = 1:30, 150 = 2:30, 210 = 3:30) |
| `PESO` | Qué tan seguido aparece comparado con los demás (10 = muy seguido, 1 = poco) |
| `MAXIMO` | Máximo de ese enemigo a la vez (opcional) |
| `COMPORTAMIENTO` | `'perseguir'`, `'zigzag'`, `'embestida'` o `'atrapar'` |

Y los números propios de cada comportamiento:

| Ajuste | Enemigo | Qué hace |
|---|---|---|
| `GRUPO_MIN` / `GRUPO_MAX` | Manada | Cuántos llegan juntos |
| `ZIGZAG_GRADOS` / `ZIGZAG_CADA_MS` | Borracho | Cuánto se desvía / qué tan rápido va de lado a lado |
| `DISTANCIA_EMBESTIDA` | Drogadicto | A qué distancia se detiene para embestir |
| `AVISO_MS` | Drogadicto | Cuánto dura el aviso antes de embestir |
| `EMBESTIDA_VELOCIDAD` / `EMBESTIDA_MS` | Drogadicto | Velocidad / duración de la embestida |
| `DESCANSO_MS` | Drogadicto | Tiempo quieto después de embestir |
| `ATRAPA_MS` | Perrera | Cuánto tiempo te deja quieto |
| `RECARGA_MS` | Perrera | Cuánto espera antes de poder atraparte otra vez |

### Nombres de los enemigos (`src/enemigos.js`)

Nombre y descripción de cada enemigo (el nombre sale en el Game Over).

**Agregar un enemigo nuevo:** copia un bloque en `src/enemigos.js` y otro en `src/config.js` (sección `ENEMIGOS`) con el mismo `id` nuevo (sin espacios ni tildes, por ejemplo `gato`), y cambia sus números. En `COMPORTAMIENTO` puedes reutilizar uno existente. Si no le haces dibujo en `src/sprites.js`, se verá como un perro rival pintado con su `COLOR`.

### Dibujos de los personajes (`src/sprites.js`)

Todos los dibujos están hechos con letras, sin archivos de imagen (por eso el juego sigue abriendo con doble clic). Cada personaje es una cuadrícula de **16 x 16** letras, y en pantalla cada letra se ve como un cuadradito de 3 x 3 píxeles.

Ejemplo (las patas de un perro):

```
'...KCK.....KCK..',
'..KCK.......KCK.',
```

- Cada letra es un color. `.` es transparente.
- Los colores de cada personaje están en su bloque `colores` (por ejemplo `C: 0x8b5a2b` es café). `K` (borde negro), `W` (blanco) y `R` (rojo) sirven para todos.
- Cada personaje tiene **2 cuadros** (`cuadros`); el juego los alterna para que camine. `animacion` es qué tan rápido los alterna.
- Dibuja siempre mirando a la **derecha**: el juego los da vuelta solo.
- Cada fila debe tener **16 letras**. Si te equivocas, el juego igual abre y avisa en la consola del navegador (tecla **F12** → pestaña Consola).
- Cambiar un dibujo **no** cambia la dificultad: el tamaño de los choques sigue siendo `RADIO` en `src/config.js`.
- `ESCALA_PIXEL` (arriba del archivo) es cuánto se agrandan los píxeles (3).

También están ahí el **hueso** y los **dientes de la mordida**. La onda del Ladrido se dibuja sola como un anillo pixelado.

**Raza o enemigo nuevo:** copia el bloque de otro dibujo, ponle el mismo `id` que usaste en `src/config.js` y edítalo.

### Otros números (`src/config.js`)

| Ajuste | Qué hace |
|---|---|
| `PERRO_INVULNERABLE_MS` | Tiempo sin recibir daño después de un golpe |
| `MORDIDA_ALCANCE` | Qué tan cerca debe estar un enemigo para morderlo |
| `ENEMIGOS_MAXIMOS` | Máximo de enemigos a la vez |
| `APARICION_INICIAL_MS` | Cada cuánto aparece un enemigo (o una manada) al empezar |
| `APARICION_MINIMA_MS` | Lo más rápido que pueden llegar a aparecer |
| `APARICION_ACELERA_MS` | Cuánto se acelera la aparición por cada segundo sobrevivido |
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

## Archivos

- `index.html` — la página que abre el juego.
- `src/config.js` — los números para ajustar el juego (razas, enemigos, niveles, instintos).
- `src/razas.js` — textos de las cartas de razas.
- `src/enemigos.js` — nombres de los enemigos.
- `src/instintos.js` — nombres y frases de las cartas de instintos.
- `src/sprites.js` — los dibujos en pixel art de todos los personajes, el hueso y la mordida.
- `src/main.js` — configuración del motor del juego.
- `src/scenes/MenuScene.js` — la pantalla de inicio para elegir raza.
- `src/scenes/GameScene.js` — la partida: perro, enemigos, ataques, poderes, experiencia, cartas y Game Over.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**. Si acabas de editar `src/config.js`, `src/razas.js`, `src/enemigos.js` o `src/sprites.js`, revisa ese cambio.
- El perro no se mueve o las teclas no responden: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
