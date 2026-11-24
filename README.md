# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.5** — enemigos nuevos.

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

Durante la partida, presiona **T** y aparecerá un enemigo de cada tipo en un círculo alrededor del perro (la Manada aparece como grupo completo). Sirve para ver cómo se mueve cada enemigo sin esperar minutos. Puedes presionarla varias veces. Estos enemigos cuentan igual que los normales (dan huesos y salen en el Game Over).

## Razas

Al abrir el juego eliges una raza. Cada una tiene distinta vida, velocidad, mordida, tamaño y un poder especial.

| Raza | Color | Cómo es | Poder especial |
|---|---|---|---|
| **Quiltro** (mestizo) | café | Equilibrado y resistente | **Calle** (pasivo): los enemigos siempre sueltan hueso y te curas un poco con el tiempo |
| **Pitbull** | gris azulado | Lento, mucha vida, mordida fuerte | **Mandíbula de hierro** (cada 6 s): la siguiente mordida aturde al enemigo (queda quieto y morado) y hace daño extra |
| **Galgo** | beige claro, más chico | Muy rápido y frágil | **Sprint** (tecla Espacio, cada 4 s): carrera corta muy rápida hacia donde te mueves, sin recibir daño |
| **Beagle** | blanco con manchas (tricolor), chico | Mordida débil, gran olfato | **Rastreo** (pasivo): imán de huesos gigante y flechas naranjas en el borde que apuntan a enemigos fuera de la pantalla |

Con las otras razas (no Quiltro), los enemigos sueltan hueso 3 de cada 4 veces.

## Cómo se juega

- **Enemigos**: aparecen desde fuera de la pantalla y con el tiempo llegan cada vez más seguido (ver tabla abajo).
- **Mordida automática**: tu perro muerde solo al enemigo más cercano si está cerca. Lo verás como un arco blanco (amarillo y grueso si es la Mandíbula de hierro).
- **Daño**: si un enemigo te toca, pierdes vida y la pantalla tiembla. Después de cada golpe tienes medio segundo de invulnerabilidad (el perro se ve semitransparente).

### Enemigos

Al inicio solo hay perros rivales. Los demás se van sumando con el tiempo:

| Enemigo | Cómo se ve | Qué hace | Aparece desde | Huesos |
|---|---|---|---|---|
| **Perro rival** | círculo rojo | Te persigue | 0:00 | 1 |
| **Manada** | círculos rojo claro pequeños | Llegan en grupos de 4 a 6, rápidos y con poca vida | 0:45 | 1 cada uno |
| **Borracho** | rectángulo naranjo | Lento, camina zigzagueando, mucha vida y golpe fuerte | 1:30 | 3 |
| **Drogadicto** | triángulo verde | Se acerca, se queda quieto parpadeando con una **línea verde** que avisa hacia dónde va, y embiste muy rápido en línea recta. ¡Sal de la línea! | 2:30 | 3 |
| **Perrera** | cuadrado azul con borde blanco | No hace daño, pero si te toca te deja **atrapado 1,5 segundos** (aparece una jaula azul). Después se ve transparente un rato y no puede volver a atraparte. Aparece poco (máximo 2 a la vez) | 3:30 | 5 |

Los poderes de las razas, los instintos y el Ladrido funcionan contra todos. La Mandíbula de hierro del Pitbull también los aturde. El Sprint del Galgo evita que la Perrera te atrape.

### Huesos, experiencia y niveles

- Los enemigos derrotados sueltan **huesos** (cuadraditos amarillos). Los más duros sueltan más.
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
| **Ladrido** | Nuevo ataque: cada pocos segundos una onda blanca daña y empuja a los enemigos cercanos. Cada nivel ladra más seguido, más lejos y más fuerte |

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
| `COLOR` | Color del círculo (formato `0xRRGGBB`) |
| `VIDA` | Vida inicial |
| `VELOCIDAD` | Qué tan rápido se mueve |
| `MORDIDA_DANO` | Daño de cada mordida |
| `MORDIDA_CADA_MS` | Cada cuánto muerde (1000 = una vez por segundo) |
| `RADIO` | Tamaño del círculo (más chico = más fácil esquivar) |
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
| `COLOR_MANCHA` / `COLOR_MANCHA_2` | Beagle | Colores de las manchas |

### Textos de las razas (`src/razas.js`)

Nombre, frase, fortalezas, debilidades y poder que se leen en las cartas de inicio.

**Agregar una raza nueva:** copia un bloque en `src/razas.js` y otro en `src/config.js` (sección `RAZAS`) con el mismo `id` nuevo (sin espacios ni tildes, por ejemplo `chihuahua`), y cambia sus números y textos. En `PODER` puedes reutilizar un poder existente o dejar `''`. Aparecerá sola en la pantalla de inicio (hasta 9 razas).

### Números de los enemigos (`src/config.js`, sección `ENEMIGOS`)

Cada enemigo tiene su bloque (`rival`, `manada`, `borracho`, `drogadicto`, `perrera`) con:

| Ajuste | Qué hace |
|---|---|
| `FORMA` | `'circulo'`, `'rectangulo'`, `'triangulo'` o `'cuadrado'` |
| `COLOR` / `BORDE` | Color de relleno / color del borde (opcional) |
| `RADIO` | Tamaño (para choques y mordidas) |
| `ANCHO` / `ALTO` | Solo para rectángulos |
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

**Agregar un enemigo nuevo:** copia un bloque en `src/enemigos.js` y otro en `src/config.js` (sección `ENEMIGOS`) con el mismo `id` nuevo (sin espacios ni tildes, por ejemplo `gato`), y cambia sus números, forma y color. En `COMPORTAMIENTO` puedes reutilizar uno existente.

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
- `src/main.js` — configuración del motor del juego.
- `src/scenes/MenuScene.js` — la pantalla de inicio para elegir raza.
- `src/scenes/GameScene.js` — la partida: perro, enemigos, ataques, poderes, experiencia, cartas y Game Over.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**. Si acabas de editar `src/config.js`, `src/razas.js` o `src/enemigos.js`, revisa ese cambio.
- El perro no se mueve o las teclas no responden: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
