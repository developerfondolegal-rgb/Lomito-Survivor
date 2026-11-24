# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.8** — objetos con rareza, enemigos élite y fusiones.

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
| Modo de prueba: un objeto de cada rareza cerca del perro | **Y** |
| Modo de prueba: subir 5 niveles de golpe | **U** |

No hay botón para atacar: el perro muerde solo.

### Modo de prueba (teclas T, Y y U)

- **T**: aparece un enemigo de cada tipo en un círculo alrededor del perro (la Manada aparece como grupo completo). Sirve para ver cómo se mueve cada enemigo sin esperar minutos. Estos enemigos **no sueltan huesos ni objetos ni cuentan** en el Game Over, pero sí hacen daño y atrapan como los normales.
- **Y**: aparecen **4 objetos** alrededor del perro, uno de cada rareza (blanco, azul, morado y dorado). Cada vez que presionas Y salen objetos distintos, así en pocas veces tienes cada objeto en morado (épico) o dorado (legendario), que lo suben directo al nivel 3.
- **U**: el perro sube **5 niveles de golpe** y salen 5 rondas de cartas seguidas.

**Cómo forzar una fusión rápido** (por ejemplo *Frenesí*):
1. Presiona **U** y en cada ronda elige **Mordida rápida** cuando aparezca. Repite U hasta que llegue a nivel 5 (deja de aparecer en las cartas).
2. Presiona **Y** varias veces hasta que salga el **Collar viejo** morado o dorado, y pasa encima para recogerlo (queda en **MAX**).
3. Presiona **U** otra vez: la primera carta será la **carta dorada de Frenesí**.

Todas las teclas se pueden presionar varias veces.

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

### La plaza

El mapa es una plaza de noche dibujada en pixel art:

- **Calle con autos estacionados** en los 4 bordes.
- **Caminos de baldosas** en forma de cruz, con **bancas**, **basureros** y **faroles**.
- **4 prados de pasto** con **árboles** y senderos de tierra.
- Una **pileta** en el centro. Empiezas justo al sur de ella.

**Obstáculos:** las bancas, los árboles, la pileta, los basureros y los autos no se pueden atravesar, ni por ti ni por los enemigos. Los enemigos los rodean para llegar a ti. Puedes usarlos para que te alcancen más lento. Los faroles no bloquean el paso.

**Noche:** todo se ve oscuro menos los círculos de luz de los faroles y una luz chica alrededor de tu perro.

**Comida:** de vez en cuando aparecen restos de **sopaipilla** o un **pan** en el suelo cerca de ti. Si te falta vida, pasa encima y te cura (verás un **+15** verde). Si tienes la vida llena, la comida queda en el suelo para después. Cerca de los **basureros** aparece comida mucho más seguido.

**Agua:** quédate **pegado a la pileta** y te curas de a poco (verás **+1** celeste).

Los enemigos siguen apareciendo fuera de la pantalla, pero nunca dentro de un obstáculo.

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

### Objetos con rareza

Además de huesos, a veces los enemigos sueltan un **objeto** (3 de cada 100 veces). Brilla en el suelo con el color de su **rareza** y se ve aunque esté oscuro. Pasa encima para recogerlo.

| Rareza | Color | Qué tan seguido | Cuánto sube el objeto |
|---|---|---|---|
| **Común** | blanco | 70 de cada 100 objetos | +1 nivel |
| **Raro** | azul (destella) | 22 de cada 100 | +2 niveles |
| **Épico** | morado (destella) | 7 de cada 100 | directo al máximo |
| **Legendario** | dorado (destella) | 1 de cada 100 | directo al máximo **y cura toda la vida** |

Cada objeto llega hasta **nivel 3**. Si recoges uno que ya tienes, sube de nivel.

| Objeto | Qué hace (por nivel) |
|---|---|
| **Collar viejo** | 10% menos daño recibido (30% en nivel 3) |
| **Pelota mordida** | Corres más rápido |
| **Hueso de caracú** | Recuperas vida de a poco |
| **Placa de identificación** | 25% más experiencia por hueso |
| **Frazada** | +20 de vida máxima (y te cura lo mismo) |

**Inventario:** abajo al centro hay 6 casillas con tus objetos y su nivel (**Nv1**, **Nv2** o **MAX** en dorado). Si las 6 casillas están llenas, no puedes recoger un objeto nuevo (sí puedes subir los que ya tienes).

### Enemigos élite

Cada **1 minuto** aparece un **élite**: una versión más grande de un enemigo que ya está apareciendo, con **borde dorado** y **10 veces más vida**. Arriba sale el aviso "¡Apareció un élite!". Al morir suelta el triple de huesos y **siempre un objeto raro o mejor**.

### Fusiones

Si tienes un **instinto en nivel 5** y su **objeto pareja en nivel 3**, al subir de nivel aparece una **carta dorada de fusión** (dice qué combinación la desbloqueó). Si la eliges, ese poder se transforma en una versión mucho más fuerte:

| Fusión | Instinto + Objeto | Qué hace |
|---|---|---|
| **Frenesí** | Mordida rápida + Collar viejo | Muerdes el doble de rápido y a **2 enemigos** a la vez |
| **Aullido** | Ladrido + Placa de identificación | Ladrido dorado más grande que además hace **huir** a los enemigos 2 segundos |
| **Estampida** | Patas ligeras + Pelota mordida | Al moverte dejas un **rastro de huellas** naranjas que daña a los enemigos que las pisan |
| **Cuero de calle** | Pellejo duro + Frazada | Después de cada golpe, recibes **la mitad de daño durante 3 segundos** (se ve un anillo café alrededor del perro) |

Las fusiones logradas salen escritas encima del inventario.

### Pantalla

- Arriba de todo: barra de experiencia y tu **nivel**.
- Arriba a la izquierda: barra de **vida**, tu **raza** y su poder. Si el poder tiene espera (Pitbull y Galgo), una barrita muestra cuánto falta; cuando se pone amarilla dice **¡Listo!**
- Arriba a la derecha: **tiempo** sobrevivido.
- Abajo al centro: **inventario** de objetos y fusiones logradas.

### Game Over

Al llegar a 0 de vida aparece "Game Over" con tu raza, tu tiempo, el nivel alcanzado, el total de enemigos derrotados, cuántos de cada tipo, los **objetos** que tenías (con su nivel) y las **fusiones** logradas.
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

### Números de la plaza (`src/config.js`, sección `PLAZA`)

| Ajuste | Qué hace |
|---|---|
| `MAPA_SEMILLA` | Un texto cualquiera. Cambiarlo pone los árboles, bancas, autos, etc. en otros lugares. Con el mismo texto la plaza sale siempre igual |
| `CALLE_ANCHO` | Ancho de la calle de los bordes |
| `PASILLO_ANCHO` | Ancho de los caminos de baldosas en cruz |
| `PILETA_RADIO` | Tamaño de la pileta |
| `SENDEROS_POR_PRADO` | Senderos de tierra en cada prado |
| `ARBOLES` / `BANCAS` / `BASUREROS` / `FAROLES` / `AUTOS` | Cuántos hay de cada cosa (si no caben todos, se ponen los que quepan) |
| `OSCURIDAD` | Qué tan oscura es la noche (0 = de día, 1 = negro total) |
| `LUZ_FAROL_RADIO` | Tamaño de la luz de cada farol |
| `LUZ_PERRO_RADIO` | Tamaño de la luz alrededor del perro |
| `COMIDA_CURA` | Vida que recupera cada comida |
| `COMIDA_CADA_MS` / `COMIDA_DISTANCIA` | Cada cuánto aparece comida cerca del perro / a qué distancia máxima |
| `COMIDA_MAXIMA` | Máximo de comida en el suelo a la vez |
| `BASURERO_COMIDA_CADA_MS` / `BASURERO_DISTANCIA` | Cada cuánto aparece comida junto al basurero más cercano / qué tan cerca debe estar ese basurero |
| `AGUA_CURA` / `AGUA_CURA_CADA_MS` | Vida que recupera la pileta / cada cuánto |
| `AGUA_DISTANCIA` | Qué tan pegado a la pileta tienes que estar |
| `RODEO_MS` | Al chocar un obstáculo, cuánto rato caminan de lado los enemigos para rodearlo |

Los dibujos de la plaza (bancas, basureros, faroles, autos y comida) y el tamaño de choque de cada obstáculo están en `src/mapa.js`.

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

### Objetos, rarezas, fusiones y élites (`src/config.js`, sección `OBJETOS`)

| Ajuste | Qué hace |
|---|---|
| `OBJETO_PROBABILIDAD` | Probabilidad de que un enemigo suelte objeto (0.03 = 3 de cada 100) |
| `OBJETO_NIVEL_MAX` | Nivel máximo de cada objeto |
| `INVENTARIO_MAX` | Cuántos objetos distintos puedes llevar |
| `OBJETO_RECOGER` | Qué tan cerca tienes que pasar para recogerlo |
| `RAREZAS` | Para cada rareza: `PESO` (qué tan seguido sale), `SUBE` (niveles que sube; `'max'` = al máximo) y `CURA_TODO` (cura toda la vida) |
| `OBJETOS` | Lo que hace cada objeto por nivel (`MENOS_DANO`, `VELOCIDAD`, `CURA` / `CADA_MS`, `XP_EXTRA`, `VIDA`) |
| `FUSIONES` | Los números de cada fusión (velocidad de mordida y objetivos del Frenesí; radio extra y tiempo de huida del Aullido; huellas de la Estampida; reducción y duración del Cuero de calle) |
| `ELITE_CADA_SEGUNDOS` | Cada cuánto aparece un élite |
| `ELITE_TAMANO` / `ELITE_VIDA` / `ELITE_HUESOS` | Cuánto más grande es, cuánta vida y cuántos huesos (multiplicando los del enemigo normal) |
| `ELITE_RAREZA_MINIMA` | Rareza mínima del objeto que suelta (`'raro'`) |

### Nombres, dibujos y parejas de fusión (`src/objetos.js`)

- `RAREZAS`: nombre y color de cada rareza, y si destella.
- `OBJETOS`: nombre y frase de cada objeto.
- `FUSIONES`: nombre, frase y qué instinto + objeto la desbloquean.
- `SPRITES_OBJETOS`: los dibujos de 16 x 16 de cada objeto (mismo formato que `src/sprites.js`), más la huella de la Estampida y la chispita.

**Agregar un objeto nuevo:** sigue los pasos escritos al principio de `src/objetos.js`. El nombre, dibujo, rareza e inventario funcionan solos; lo que *hace* el objeto hay que programarlo en `src/scenes/GameScene.js`.

## Archivos

- `index.html` — la página que abre el juego.
- `src/config.js` — los números para ajustar el juego (plaza, razas, enemigos, niveles, instintos, objetos, fusiones y élites).
- `src/razas.js` — textos de las cartas de razas.
- `src/enemigos.js` — nombres de los enemigos.
- `src/instintos.js` — nombres y frases de las cartas de instintos.
- `src/sprites.js` — los dibujos en pixel art de todos los personajes, el hueso y la mordida (y el borde de las élites y objetos).
- `src/objetos.js` — objetos, rarezas y fusiones: nombres, frases y dibujos.
- `src/mapa.js` — la plaza: suelo, pileta, bancas, árboles, faroles, basureros, autos, comida, obstáculos y la oscuridad de la noche.
- `src/main.js` — configuración del motor del juego.
- `src/scenes/MenuScene.js` — la pantalla de inicio para elegir raza.
- `src/scenes/GameScene.js` — la partida: perro, enemigos (y cómo rodean obstáculos), ataques, poderes, comida, agua, experiencia, objetos, élites, fusiones, cartas y Game Over.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**. Si acabas de editar `src/config.js`, `src/razas.js`, `src/enemigos.js`, `src/sprites.js`, `src/mapa.js` u `src/objetos.js`, revisa ese cambio.
- El perro no se mueve o las teclas no responden: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
