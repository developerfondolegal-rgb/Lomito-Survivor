# Lomito Survivor

Juego 2D con vista desde arriba (estilo Vampire Survivors). Controlas a un perro callejero que debe sobrevivir una noche en una plaza.

Versión actual: **v0.16** — inicio de sesión con Google y ranking online.

**Meta:** sobrevive la noche (de 22:00 a 06:00, 10 minutos de juego) y derrota al **Jefe de la Plaza**. Si lo logras, amanece y ganas.

## Cómo abrir el juego

1. Abre la carpeta `Lomito Survivor`.
2. Haz **doble clic** en `index.html`.
3. Se abrirá en tu navegador (Chrome, Edge o Firefox).

> Necesitas conexión a internet, porque el motor del juego (Phaser 3) se descarga desde internet al abrir la página.

## Jugar en el celular (Android)

1. Abre en **Chrome** la dirección del juego en GitHub Pages.
2. **Pon el celular en horizontal.** Si está en vertical sale el aviso **"Gira el celular"** y la partida se pausa sola.
3. Al primer toque el juego intenta ponerse en **pantalla completa** y quedarse en horizontal (si Chrome lo permite). En la pantalla de inicio también está el botón **⛶ Pantalla completa** (arriba a la derecha) para entrar o salir.
4. Toca la carta de una raza para empezar.

### iPhone (Safari o Chrome)

En iPhone el navegador no deja poner la página en pantalla completa (el botón **⛶ Pantalla completa** solo muestra el aviso *"En iPhone: Compartir → Agregar a inicio"*). Para jugar sin barra del navegador:

1. Abre el juego en **Safari** (en Chrome de iPhone también aparece "Agregar a inicio" en el menú **Compartir**).
2. Toca **Compartir** → **Agregar a inicio**.
3. Abre **Lomito Survivor** desde el ícono del perro en la pantalla de inicio: se abre como app, en pantalla completa y en horizontal.

El juego se ajusta solo a la parte visible de la pantalla (sin la barra del navegador), deja libre el notch y las esquinas redondeadas, y se vuelve a acomodar al girar el celular o cuando la barra del navegador aparece o desaparece. En pantallas muy anchas (iPhone 19.5:9, Android 20:9) quedan franjas negras a los lados, donde está el notch.

> Si después de actualizar el juego en GitHub Pages ves la versión anterior, recarga la página: cada versión carga sus archivos con `?v=` y su número, para que el navegador no use los viejos.

**Controles táctiles** (solo aparecen en pantallas táctiles; en PC todo sigue con teclado):

| Acción | Cómo |
|---|---|
| Moverse | Pon el dedo en la **mitad izquierda** de la pantalla y arrástralo: aparece un **joystick** donde tocaste. Mientras más lo alejas, más rápido corre el perro |
| Sprint (solo Galgo) | Botón redondo **SPRINT** abajo a la derecha. El anillo muestra cuánto falta para que se recargue. Se puede apretar mientras mueves el joystick con el otro dedo |
| Pausa | Botón redondo **II** a la derecha, debajo del reloj |
| Atacar | Automático, igual que en PC |
| Cartas al subir de nivel | Toca la carta (los primeros instantes no responden, para que no elijas sin querer) |
| Menú de pausa | Toca las pestañas y los botones **Continuar**, **Reiniciar** y **Salir al menú** |
| Pantalla final | Botones **Reiniciar**, **Rincón de apuestas** y **Menú** |
| Álbum | Botones **Volver** y **Borrar progreso** (pide confirmar) |
| Ranking | Botón **Ranking** del inicio; toca **General** o una raza, **Actualizar** y **Volver**. **Entrar con Google** / **Salir** arriba a la derecha |
| Árbol de habilidades | Toca una pestaña de raza, toca una mejora para ver qué hace, **Comprar**, **Reiniciar árbol de …** (pide confirmar) y **Volver** |
| Rincón de apuestas | Toca el juego, tu número o bajo/alto, **−** y **+** para el monto, "Huesitos guardados" o "1 copia de un coleccionable", **Tirar** y **Seguir jugando** / **Salir** |

Las teclas de prueba (T, Y, U, J, K, Z, X, C, H) no tienen versión táctil.

**Probar los controles táctiles en el PC:** abre `index.html?tactil=1` (o en Chrome usa F12 → ícono de celular "Toggle device toolbar" y elige un Android en horizontal). Con `?tactil=0` se quitan aunque la pantalla sea táctil.

## Controles

| Acción | Teclas |
|---|---|
| Elegir raza (pantalla de inicio) | **clic**, o teclas **1**, **2**, **3**, **4** |
| Abrir el Álbum de coleccionables (pantalla de inicio) | botón **Álbum** o tecla **A** |
| Abrir el Rincón de apuestas con los huesitos guardados (pantalla de inicio) | botón **Rincón de apuestas** o tecla **B** |
| Abrir el Árbol de habilidades (pantalla de inicio) | botón **Árbol** o tecla **G** |
| Abrir el Ranking online (pantalla de inicio) | botón **Ranking** o tecla **L** |
| Ranking: cambiar filtro / actualizar / volver | **flechas izquierda / derecha**, **Q** / **E** o **1**-**5** · **R** · **Esc** o **L** |
| Árbol: elegir mejora / raza / comprar / reiniciar / volver | flechas · **Q** / **E** o **1**-**4** · **Enter** o **Espacio** · **R** (Enter confirma, Esc cancela) · **Esc** o **G** |
| Volver del Álbum a la pantalla de inicio | **Esc** o **A** (o el botón Volver) |
| Modo de prueba: +100 huesitos guardados (pantalla de inicio) | **H** |
| Mover al perro | **W A S D** o **flechas** |
| Sprint (solo Galgo) | **Espacio** |
| Pausa (abrir y cerrar el menú) | **P** o **Esc** |
| Cambiar pestaña del menú de pausa | **clic**, o **flechas izquierda / derecha** |
| Reiniciar / volver al menú desde la pausa | **R** / **M** (o los botones) |
| Elegir carta al subir de nivel | **clic**, o teclas **1**, **2**, **3** |
| Jugar de nuevo con la misma raza (en Game Over) | **R** |
| Ir al Rincón de apuestas y después a la pantalla de inicio (en Game Over) | **M** |
| Rincón de apuestas: elegir juego | **1**, **2**, **3** (o clic) |
| Rincón de apuestas: cambiar el número o bajo/alto | **flechas arriba / abajo** (o clic) |
| Rincón de apuestas: cambiar el monto (o el coleccionable) | **flechas izquierda / derecha** |
| Rincón de apuestas: huesitos o coleccionable (solo al terminar) | **Tab** |
| Rincón de apuestas: tirar los dados | **Espacio** o **Enter** |
| Rincón de apuestas: seguir jugando / salir | **Esc** |
| Modo de prueba: un enemigo de cada tipo cerca del perro | **T** |
| Modo de prueba: un objeto de cada rareza cerca del perro | **Y** |
| Modo de prueba: subir 5 niveles de golpe | **U** |
| Modo de prueba: aparece el jefe al tiro | **J** |
| Modo de prueba: el reloj de la noche salta 1 minuto | **K** |
| Modo de prueba: una zona especial de cada tipo cerca del perro | **Z** |
| Modo de prueba: empieza un desafío al azar | **X** |
| Modo de prueba: un ultra raro coleccionable al azar cerca del perro | **C** |

No hay botón para atacar: el perro muerde solo.

### Modo de prueba (teclas T, Y, U, J, K, Z, X y C)

- **T**: aparece un enemigo de cada tipo en un círculo alrededor del perro (la Manada aparece como grupo completo). Sirve para ver cómo se mueve cada enemigo sin esperar minutos. Estos enemigos **no sueltan huesos ni objetos ni cuentan** en el Game Over, pero sí hacen daño y atrapan como los normales.
- **Y**: aparecen **4 objetos** alrededor del perro, uno de cada rareza (blanco, azul, morado y dorado). Cada vez que presionas Y salen objetos distintos, así en pocas veces tienes cada objeto en morado (épico) o dorado (legendario), que lo suben directo al nivel 3.
- **U**: el perro sube **5 niveles de golpe** y salen 5 rondas de cartas seguidas.
- **J**: aparece **El Jefe de la Plaza** al tiro (solo si no hay otro jefe vivo). Si lo llamas antes de tiempo, ya no vuelve a aparecer solo a los 9 minutos.
- **K**: el reloj **salta 1 minuto** hacia adelante (con 10 minutos, son 48 minutos de reloj). Todo avanza junto: la fase, los enemigos que aparecen y la oscuridad. El tiempo saltado también cuenta en "Sobreviviste" de la pantalla final.

- **Z**: aparecen **4 zonas especiales** alrededor del perro, una de cada tipo (miedo, peligrosa, barro y segura). Nunca encima del perro ni de la pileta. Camina a cada una para ver su aviso y su efecto. Duran lo normal (25 segundos).
- **X**: empieza **un desafío al azar** (Búsqueda, Aguanta, Cacería o Sin morder). Si ya había uno, se cancela sin contar como fallido y empieza otro. Presiona X varias veces hasta que salga el que quieres probar.
- **C**: aparece **un ultra raro coleccionable al azar** cerca del perro, con brillo arcoíris. Pasa encima para recogerlo: sale el aviso grande y **se guarda de verdad** en tu colección (cuenta como una copia más). Si quieres volver a empezar tu colección, usa **Borrar progreso** en el Álbum.

- **H** (en la pantalla de inicio): **+100 huesitos guardados**, para probar el Rincón de apuestas sin jugar mucho. Se guardan de verdad; para volver a 0 usa **Borrar progreso** en el Álbum (ojo: también borra la colección).

**Probar el Rincón de apuestas rápido:** en la partida presiona **K** 3 veces: a las 00:00 cambia la fase y se abre el rincón. Si molesta mientras pruebas otra cosa, pon `EN_CAMBIO_DE_FASE: false` en `src/config.js`.

**Probar el final rápido:** presiona **J**, derrota al jefe (o quítale vida con U para subir niveles) y luego presiona **K** unas 10 veces hasta las 06:00: amanece y sale "¡Sobreviviste la noche!". Para ver qué pasa si el jefe sigue vivo, presiona **K** 10 veces sin derrotarlo: el reloj se queda en 06:00 hasta que lo derrotes.

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

### Sinergias

Algunas combinaciones dan un **bonus extra** cuando tienes las dos cosas juntas (basta con tenerlas en nivel 1). Se activan solas y arriba sale el aviso "¡Sinergia: ...!".

| Sinergia | Necesitas | Bonus |
|---|---|---|
| **Callejero veterano** | Pellejo duro + Hueso de caracú | +20% de regeneración (el poder Calle y el Hueso de caracú curan más seguido) |
| **Cazador** | Colmillos + Olfato | +10% de daño de mordida |
| **Veloz** | Patas ligeras + Pelota mordida | +10% de velocidad |

### Zonas especiales

Cada 20 segundos (desde el segundo 30) aparece un **círculo** en la plaza, cerca del perro, con un **borde de color** y un **ícono** al centro. Dura 25 segundos; los últimos 4 segundos parpadea para avisar que se va. Hay como máximo 3 a la vez, y nunca aparecen encima de la pileta ni encima del perro. Al entrar en una, sale un aviso pequeño con su nombre.

| Zona | Color e ícono | Mientras el perro está dentro |
|---|---|---|
| **Zona de miedo** | morada, fantasma | No puede atacar (ni morder ni ladrar) |
| **Zona peligrosa** | roja, triángulo con "!" | Recibe el **doble de daño** |
| **Barro** | café, gotas de barro | Se mueve **40% más lento**. Los enemigos que pisan el barro también |
| **Zona segura** (rara) | verde, escudo con cruz | **No recibe daño**, pero tampoco gana experiencia: los huesos se quedan en el suelo hasta que salgas |

Si dos zonas se tocan y estás en ambas, se suman sus efectos.

### Mini desafíos

Al minuto de juego llega el primer desafío, y después uno nuevo cada minuto después de terminar el anterior. Aparece un aviso grande y, arriba al centro, una línea dorada con el **progreso** y la **cuenta regresiva**. No aparecen mientras el jefe está vivo ni al amanecer.

| Desafío | Qué hay que hacer | Tiempo |
|---|---|---|
| **Búsqueda** | Encontrar **3 cosas perdidas** (cajitas azules con "?") repartidas en la plaza. Unas **flechas doradas** en el borde de la pantalla apuntan a las que no se ven | 60 s |
| **Aguanta** | Estar **30 segundos dentro de la zona dorada** marcada (el tiempo solo corre mientras estás dentro). Mientras dura, llegan el **doble de enemigos** | 50 s |
| **Cacería** | Derrotar a **30 enemigos** | 45 s |
| **Sin morder** | Sobrevivir **20 segundos** sin atacar: la mordida y el ladrido se apagan solos durante el desafío | 20 s |

- **Si lo cumples**: ganas una recompensa al azar: un **objeto raro o mejor** (entra directo al inventario; si está lleno, sube uno que ya tienes) o **40 de experiencia** de golpe.
- **Si fallas**: sale un aviso y no pasa nada más.

### Ultra raros coleccionables

Una rareza nueva por encima de Legendario: **Ultra raro**, con **brillo arcoíris** que cambia de color y chispitas. No son objetos del inventario: son **coleccionables** que se guardan en tu navegador para siempre y dan un **bonus permanente** en todas tus partidas, **con cualquier raza**, desde el primer segundo.

**Cómo se consiguen** (muy difícil):
- Cualquier enemigo: muy rara vez (5 de cada 10.000).
- Enemigos **élite**: 4 de cada 100.
- **El Jefe de la Plaza**: 35 de cada 100.
- Al cumplir los desafíos **Aguanta** o **Cacería**: **siempre** uno (además de la recompensa normal). Ese va directo a tu colección.

Cuando cae uno sale el aviso "¡Cayó un ULTRA RARO!". Al recogerlo aparece un **aviso grande especial** con brillo arcoíris, su dibujo, su nombre, su frase y **"¡Nuevo!"** o **"Copia X/Y"** (cuántas copias llevas para el siguiente nivel). El bonus se aplica al tiro.

**Niveles:** cada coleccionable sube del **nivel 1 al 5** juntando copias: 1 copia para el nivel 1, **2 más** para el 2, **3 más** para el 3, **5 más** para el 4 y **8 más** para el 5 (19 en total). Cada nivel aumenta su bonus.

Los 12 coleccionables de la plaza (bonus por cada nivel):

| Coleccionable | Bonus por nivel |
|---|---|
| **Chalequito reflectante** | Los enemigos aparecen 40 px más lejos y las embestidas (Drogadicto y Jefe) te hacen 10% menos daño |
| **Sweater tejido a mano** | +10 de vida máxima y recuperas 1 de vida cada 6 s (nivel 2: cada 3 s; nivel 5: cada 1,2 s) |
| **Peluche de zombie** | Un zombie de peluche gira a tu alrededor y hace 4 de daño a los enemigos que toca |
| **Mantita cuadrillé** | La Zona segura te cura (1 de vida cada 1,5 s en nivel 1) y la pileta cura 20% más rápido |
| **Capa de superhéroe** | +3% de velocidad y el poder (Sprint o Mandíbula) se recarga 8% más rápido |
| **Antifaz** | 3% de probabilidad de esquivar un golpe (sale "¡Esquivado!") |
| **Collar antipulgas** | 8% menos daño de la Manada y de los Perros rivales |
| **Lentes** | +6 de alcance de mordida y +15 de imán de huesos |
| **Zapatilla perdida** | La comida cura +3 de vida |
| **Pañuelo rojo** | 4% de probabilidad de mordida crítica (doble daño, dientes rojos) |
| **Cascabel** | +6% de experiencia por hueso |
| **Gorro de lana** | El barro te frena 15% menos y la Perrera te deja atrapado 15% menos rato |

El Peluche no ataca en la Zona de miedo ni durante el desafío "Sin morder" (se ve transparente).

### Huesitos

Los **huesitos** son la moneda del juego (no confundir con los huesos amarillos que dan experiencia).

- Durante la partida juntas **huesitos de la partida** (arriba a la izquierda, debajo del poder). Todavía **no están guardados**.
- Se ganan por: **minutos sobrevividos** (3 por minuto), **nivel alcanzado** (1 por cada nivel subido), **enemigos derrotados** (1 por cada 10), **desafíos cumplidos** (5 cada uno), **derrotar al Jefe** (20) y **bonus por amanecer** (25 si sobrevives la noche).
- Al terminar la partida (muerte o amanecer) se **suman al total guardado**. La pantalla final muestra el desglose y el total.
- El total guardado se ve arriba a la izquierda en la **pantalla de inicio**.
- **H** en la pantalla de inicio (modo de prueba): +100 huesitos guardados.
- Se guardan en el navegador igual que la colección. **Borrar progreso** del Álbum también los borra.
- Se gastan en el **Árbol de habilidades** (y se pueden apostar en el Rincón de apuestas).

### Árbol de habilidades

En la pantalla de inicio, el botón **Árbol** (o la tecla **G**) abre el árbol de mejoras **permanentes** de cada raza, que se compran con **huesitos guardados**.

- Cada raza tiene **3 ramas con 4 mejoras** (12 por raza). Para comprar una mejora necesitas la anterior de su rama.
- Cuestan **50, 120, 250 y 500** huesitos (1ª, 2ª, 3ª y 4ª de la rama). La **4ª es una habilidad especial** (★).
- Cada mejora sale como un cuadrito en pixel art: **dorado** = comprada, **de color** = disponible, **gris con candado** = bloqueada. Al elegirla, el panel de la derecha muestra su nombre, qué hace y cuánto cuesta.
- **Reiniciar árbol de …**: quita las mejoras de esa raza y te **devuelve el 100%** de los huesitos gastados en ella (pide confirmar).
- Las mejoras se aplican **al empezar** una partida con esa raza y se ven en la pestaña **Stats** del menú de pausa (como "Árbol +…" en cada stat y en la fila **Árbol de habilidades**).
- **Borrar progreso** del Álbum también borra el árbol de todas las razas.

| Raza | Rama | Mejoras (la última es especial) |
|---|---|---|
| Quiltro | **Calle** | Calle cura 30% más rápido · 15% de hueso extra · Calle cura +1 · ★ **Dueño del barrio**: cada 12 enemigos derrotados cae una comida |
| Quiltro | **Suerte** | +15% huesitos · objetos 40% más seguido · ultra raros el doble de seguido · ★ **Pata de conejo**: los élites siempre sueltan un ultra raro |
| Quiltro | **Supervivencia** | +15 vida · comida y pileta +50% · regeneración +25% y +10 vida · ★ **Siete vidas**: 1 vez por partida vuelves con 40% de vida |
| Pitbull | **Mordida** | +10% daño · 8% crítico · muerde 10% más seguido · ★ **Sacudida**: la mordida también daña a los que están al lado (40%) |
| Pitbull | **Aguante** | +20 vida · −8% daño recibido · 1 de vida cada 3 s y +10 vida · ★ **Inamovible**: la Perrera no te atrapa y las embestidas hacen la mitad |
| Pitbull | **Furia** | Mandíbula se carga 25% más rápido · Mandíbula +15 daño y +0,5 s de aturdir · +30% daño con menos del 40% de vida · ★ **Berserker**: con menos del 35% de vida todas las mordidas son de Mandíbula de hierro |
| Galgo | **Sprint** | +0,1 s de sprint · recarga 20% más rápida · sprint más rápido y recarga +10% · ★ **Rayo gris**: el sprint daña (25) a cada enemigo que atraviesas |
| Galgo | **Esquiva** | +5% velocidad · 6% esquivar · +6% esquivar y +5% velocidad · ★ **Reflejos**: al esquivar, el sprint queda listo |
| Galgo | **Caza** | +25% daño a enemigos rápidos o que embisten · +25% más · 15% crítico contra ellos · ★ **Lebrel**: la primera mordida tras cada sprint hace ×3 a hasta 3 enemigos |
| Beagle | **Olfato** | +30 imán · +30 imán y huesos más rápidos · comida 30% más seguido · ★ **Nariz de sabueso**: el Rastreo también señala comida (verde) y objetos (morado) |
| Beagle | **Botín** | +10% experiencia · 15% de hueso extra · +20% huesitos · ★ **Tesoro enterrado**: cada 75 s desentierras un objeto raro o mejor |
| Beagle | **Manada** | −3% daño por enemigo cerca · +4% daño por enemigo cerca · ambos otra vez · ★ **Aullido de la manada**: cada 10 s un aullido que daña, empuja y hace huir |

### Rincón de apuestas

Una mesita verde con dados en pixel art. Aparece en dos momentos:

1. **Al cambiar de fase la noche** (Medianoche, Madrugada y Antes del alba): la partida se congela y el rincón sale encima. Solo puedes apostar los **huesitos de la partida**. **Seguir jugando** (Esc) vuelve a la partida exactamente donde estaba.
2. **Al terminar la partida**: en la pantalla final presiona **M**. Puedes apostar tu **total guardado** o **1 copia de un coleccionable** que tengas (Tab para cambiar; flechas izquierda/derecha para elegir cuál). **Salir** (Esc) va a la pantalla de inicio. (R sigue siendo "jugar de nuevo" directo.)

Eliges el monto con las flechas izquierda/derecha (de 5 en 5, mínimo 5 y máximo 200, nunca más de lo que tienes). Si no tienes nada para apostar sale **"Vuelve cuando tengas huesitos"** y solo puedes salir.

| Juego | Cómo se juega | Si ganas recibes |
|---|---|---|
| **Número exacto** | Eliges del 1 al 6 y se tira 1 dado. Ganas si sale tu número | 5 veces lo apostado |
| **Contra la máquina** | Tú y la máquina tiran 2 dados. Gana la suma más alta. **Empate: gana la máquina** | 2 veces lo apostado |
| **Bajo o alto** | Eliges bajo (1-2-3) o alto (4-5-6). **Regla de la casa:** 1 de cada 12 veces el gato salta a la mesa y pierdes igual | 1,8 veces lo apostado |

- "Recibes" incluye lo apostado (apuestas 10 en Contra la máquina y ganas: recibes 20, o sea +10). Se redondea hacia abajo.
- Con un **coleccionable**: si ganas te quedas tu copia y recibes copias extra (Número exacto +4, Contra la máquina +1, Bajo o alto +1). Si pierdes, pierdes esa copia y **puede bajar su nivel** (con 0 copias deja de estar en tu álbum).
- Al ganar, destello verde; al perder, la pantalla tiembla en rojo. El saldo se **guarda al instante** al tirar.
- **La casa siempre gana un poquito**: los tres juegos están hechos para que, a la larga, pierdas más de lo que ganas (Número exacto −16,7%, Contra la máquina −11,3%, Bajo o alto −17,5%). Apostar es para divertirse, no para hacerse rico.

### Álbum

En la pantalla de inicio, el botón **Álbum** (o la tecla **A**) muestra los 12 coleccionables en una cuadrícula:
- Los **no encontrados** salen como **silueta negra** con "???".
- Los **encontrados** muestran su dibujo con brillo arcoíris, su nombre, su frase, su **nivel** (estrellas), cuántas **copias** faltan para el siguiente nivel y su **bonus actual**. Los que están en nivel máximo tienen borde dorado.
- **Borrar progreso**: borra toda tu colección, **tus huesitos guardados y el árbol de habilidades de todas las razas**. Antes pregunta **"¿Borrar todo tu progreso?"** con los botones **Sí, borrar** y **Cancelar** (o Esc). No se puede deshacer.

**Dónde se guarda:** en el almacenamiento del navegador (localStorage). Se mantiene al cerrar el juego, pero es **de ese navegador**: si abres el juego en otro navegador o en una ventana privada/incógnito, la colección empieza vacía. Si borras los datos de navegación, también se borra.

### Menú de pausa

Presiona **P** o **Esc** para pausar. Todo se detiene (enemigos, reloj de la noche, poderes) hasta que vuelvas a presionar P o Esc, o el botón **Continuar**. No se puede pausar mientras eliges una carta de nivel.

El panel tiene 6 pestañas (clic o flechas izquierda/derecha):

- **Stats**: vida, velocidad, daño y frecuencia de mordida, alcance, imán de huesos, reducción de daño, regeneración, experiencia extra y **árbol de habilidades**. Debajo de cada uno sale el **valor base de tu raza** y cuánto suma cada instinto, objeto, fusión, sinergia o mejora del árbol (las especiales salen con ★). También tu nivel, el tiempo jugado, la hora de la noche y los enemigos derrotados.
- **Instintos y objetos**: todos, con su ícono, su nivel y lo que hacen (los que no tienes salen en gris).
- **Fusiones**: las 4 fusiones. Dice si ya la **lograste**, si está **lista** (sale en la próxima subida de nivel) o **qué falta** (por ejemplo "Falta: Mordida rápida 3/5 + Collar viejo 1/3").
- **Sinergias**: cuáles están **activas** y qué falta para las otras.
- **Desafíos**: el **desafío actual** con su progreso y el tiempo que queda (o cuándo llega el próximo), los **completados** en esta partida con su minuto y recompensa, y cuántos fallaste. A la derecha, qué hace cada **zona especial** y en cuál estás ahora.
- **Colección**: los 12 ultra raros con su nivel, sus copias y el **bonus activo** de cada uno (los que no tienes salen como silueta). En **Stats** también aparece lo que suma cada coleccionable.

Botones: **Continuar**, **Reiniciar (R)** (misma raza, partida nueva) y **Volver al menú (M)**.

### La noche

- **Reloj**: arriba a la derecha está la **hora de la noche** (empieza a las 22:00 y llega a las 06:00 en 10 minutos). Debajo sale la fase y el tiempo que llevas jugando.
- **Fases**: cada 2 horas de reloj (2 minutos y medio) aparece un aviso grande y la noche se pone más difícil: los enemigos nuevos llegan más seguido, con más vida y un poco más rápidos.

| Hora | Fase | Minuto |
|---|---|---|
| 22:00 | Anochecer | 0:00 |
| 00:00 | Medianoche | 2:30 |
| 02:00 | Madrugada | 5:00 |
| 04:00 | Antes del alba | 7:30 |

- **Oscuridad**: desde la mitad de la noche la plaza se va aclarando poco a poco.
- **Amanecer**: si llegas a las 06:00 **y el jefe está derrotado**, el cielo se aclara, se ve una luz anaranjada, los enemigos huyen y ya no te hacen daño. Luego sale **"¡Sobreviviste la noche!"**. Si llegan las 06:00 y el jefe sigue vivo, el reloj se queda en 06:00 hasta que lo derrotes.

### El Jefe de la Plaza

A los **9 minutos** (05:12 en el reloj) llega un perro enorme y oscuro con collar de púas y ojos rojos. Arriba al centro aparece su **barra de vida** grande (la rayita blanca marca la mitad). Mientras está vivo llegan menos enemigos normales, y lleva su propia luz para que siempre lo veas.

- **Embestida**: se queda quieto, parpadea en rojo y marca una **franja roja**; luego corre muy rápido por esa franja. ¡Sal de la franja! Después queda cansado un momento.
- **Aullido**: se queda quieto, parpadea en naranjo y unos **anillos naranjos** se cierran sobre él; luego aúlla y llega una **manada** de perritos a su alrededor.
- **Furia**: al bajar a la **mitad de su vida** se pone rojizo, camina más rápido, ataca más seguido, avisa menos tiempo y llama a más perritos.
- El Ladrido y la Mandíbula le hacen daño, pero no lo empujan ni lo aturden.
- Al morir suelta muchos huesos y un objeto **épico o legendario**.

### Pantalla

- Arriba de todo: barra de experiencia y tu **nivel**.
- Arriba a la izquierda: barra de **vida**, tu **raza** y su poder. Si el poder tiene espera (Pitbull y Galgo), una barrita muestra cuánto falta; cuando se pone amarilla dice **¡Listo!** Debajo, los **huesitos de la partida**.
- Arriba a la derecha: **hora de la noche**, y debajo la fase y el tiempo jugado.
- En celular: botón de **pausa** a la derecha (debajo del reloj), **SPRINT** abajo a la derecha (solo Galgo) y el **joystick** donde pongas el dedo a la izquierda.
- Arriba al centro (solo con el jefe vivo): nombre y **barra de vida del jefe**.
- Arriba al centro, en dorado (solo durante un desafío): el **desafío**, su progreso y los segundos que quedan. Se pone rojo y parpadea los últimos 10 segundos.
- Abajo al centro: **inventario** de objetos y fusiones logradas.

### Ranking online e inicio de sesión con Google

Solo en la **versión online** (GitHub Pages). Si abres el juego con doble clic o sin internet, todo funciona igual que antes y solo dice *"Ranking disponible en la versión online"*.

- **Entrar con Google** (arriba a la derecha del inicio): te lleva a Google y vuelve al juego. La sesión queda guardada al recargar. **Salir** la cierra.
- **Apodo**: la primera vez que entras te pide elegir un apodo (3 a 16 letras, números, espacios, `_ . -`). Es único y es el nombre que sale en el ranking. Se escribe con el teclado del PC o del celular. Si eliges *Ahora no*, te lo vuelve a pedir al volver al inicio.
- **Puntaje**: al terminar una partida (Game Over o victoria) aparece arriba a la derecha tu **PUNTAJE**. Si tienes sesión y apodo, se **envía solo** y dice *"Puntaje enviado ✓"* o el error.
  - Puntaje = segundos × 10 + nivel × 50 + enemigos × 5 + 2000 si derrotaste al jefe + 3000 si amaneció (sobreviviste la noche). Los números están en `src/config.js`, sección `ONLINE`, `PUNTAJE`.
  - **Las partidas donde usaste teclas de prueba (T, Y, U, J, K, Z, X, C) no se envían**: la pantalla final dice *"Partida de prueba: no se envía al ranking"*.
- **Ranking** (botón o tecla **L**): top 20 **General** (la mejor partida de cada jugador) o por **raza**. Tu fila se ve destacada en amarillo y abajo sale **tu posición** aunque no estés en el top 20. ⚔ = derrotó al jefe, ☀ = sobrevivió la noche.

#### Preparar la base de datos (una sola vez)

El ranking usa **Supabase**. La URL y la llave pública (anon) están en `src/config.js`, sección `ONLINE`. **Nunca** pongas ahí la llave `service_role`.

1. Entra a [supabase.com](https://supabase.com) → tu proyecto → **SQL Editor** → **New query**.
2. Abre el archivo `supabase/migraciones/001_ranking.sql`, copia **todo** y pégalo.
3. Presiona **Run**. Debe decir *Success*. (Se puede correr otra vez sin borrar datos.)
4. Revisa en **Table Editor** que aparezcan las tablas `jugadores` y `partidas`, y en **Authentication → Providers** que **Google** esté activo, con la *Site URL* y la *Redirect URL* apuntando a la página del juego en GitHub Pages.

Qué crea la migración:
- `jugadores`: id del usuario de Google, apodo único (3-16 caracteres) y fecha.
- `partidas`: raza, segundos sobrevividos, nivel, enemigos, jefe derrotado, amanecer, puntaje, versión del juego y fecha.
- Reglas de seguridad (RLS): cada usuario solo crea o edita **su** jugador y solo guarda partidas **suyas**; todos pueden leer el ranking; **nadie puede editar ni borrar partidas**.
- Validaciones para frenar trampas obvias: valores no negativos, máximo 1200 segundos (la noche dura 600), no se puede amanecer sin derrotar al jefe, límite de enemigos por segundo, y **el servidor vuelve a calcular el puntaje** (el que manda el juego no se usa).
- Vistas `ranking_top` (mejor puntaje de cada jugador por raza, con apodo) y `ranking_general` (mejor puntaje de cada jugador).

> Si cambias la fórmula del puntaje en `src/config.js`, cámbiala también en la función `calcular_puntaje` de la base de datos (con una migración nueva, por ejemplo `002_...sql`). Si cambias `NOCHE.DURACION_MINUTOS`, revisa el máximo de segundos (`SEGUNDOS_MAXIMOS` y el CHECK de la tabla).

### Game Over y victoria

Al llegar a 0 de vida aparece "Game Over". Si sobrevives la noche aparece **"¡Sobreviviste la noche!"**. Las dos pantallas muestran tu raza, tu tiempo, el nivel alcanzado, el total de enemigos derrotados, cuántos de cada tipo, si derrotaste al jefe, los **objetos** que tenías (con su nivel), las **fusiones** logradas y cuántos **desafíos completaste** (y cuántos fallaste). Si recogiste ultra raros, también dice cuántos. Al final aparecen los **huesitos de la partida** (ya sumados a tu total guardado) con su desglose. Arriba a la derecha sale tu **puntaje** y si se envió al ranking.
- **R**: jugar de nuevo con la misma raza.
- **M**: ir al **Rincón de apuestas** y de ahí a la pantalla de inicio (si `EN_FIN_DE_PARTIDA` está en `false`, va directo al inicio).

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

### La noche y el jefe (`src/config.js`, secciones `NOCHE` y `JEFE`)

| Ajuste | Qué hace |
|---|---|
| `NOCHE.DURACION_MINUTOS` | Cuánto dura la noche (10 = 10 minutos) |
| `NOCHE.HORA_INICIO` / `NOCHE.HORA_FIN` | Hora del reloj al empezar (22) y del amanecer (6) |
| `NOCHE.ACLARA_DESDE` / `NOCHE.OSCURIDAD_AL_FINAL` | Desde qué parte de la noche se aclara (0.5 = la mitad) y qué tan oscuro queda al final |
| `NOCHE.AMANECER_MS` / `NOCHE.AMANECER_LUZ` | Cuánto dura el amanecer y cuánta luz anaranjada se ve |
| `NOCHE.FASES` | Cada fase: `HORA` en que empieza, `NOMBRE` del aviso y cuánto cambian los enemigos nuevos (`APARICION`: tiempo entre enemigos, `VIDA`, `VELOCIDAD`; 1 = igual que siempre) |
| `JEFE.MINUTO` | A qué minuto aparece el jefe (9) |
| `JEFE.VIDA` / `JEFE.RADIO` / `JEFE.TAMANO` | Vida, tamaño del choque y tamaño del dibujo |
| `JEFE.VELOCIDAD` / `JEFE.DANO` | Velocidad caminando y daño al tocarte |
| `JEFE.HUESOS` / `JEFE.OBJETO_RAREZA` | Huesos que suelta y rareza mínima del objeto |
| `JEFE.APARICION_MIENTRAS` | Con el jefe vivo, el tiempo entre enemigos normales se multiplica por esto |
| `JEFE.ATAQUE_CADA_MS` | Tiempo caminando entre ataques |
| `JEFE.FURIA_EN` / `FURIA_VELOCIDAD` / `FURIA_ATAQUE_CADA_MS` / `FURIA_AVISO` | Cuándo se enfurece (0.5 = mitad de vida) y cómo cambia |
| `JEFE.EMBESTIDA_...` | Aviso, velocidad, duración, daño y descanso de la embestida |
| `JEFE.AULLIDO_...` / `FURIA_AULLIDO_MANADA` | Aviso del aullido, cuántos perritos llegan (normal / en furia) y a qué distancia |

### Sinergias (`src/config.js`, sección `SINERGIAS`, y `src/sinergias.js`)

| Ajuste | Qué hace |
|---|---|
| `SINERGIA_NIVEL_MINIMO` | Nivel que necesita cada cosa para que la sinergia cuente (1 = basta con tenerla) |
| `SINERGIAS` | El bonus de cada sinergia: `VELOCIDAD`, `DANO` (de mordida) o `REGENERACION` (0.1 = 10% más) |

En `src/sinergias.js` está el nombre, la frase y qué pide cada una (`requiere`). **Agregar una sinergia nueva:** copia un bloque en `src/sinergias.js` y otro en `src/config.js` (sección `SINERGIAS`) con el mismo `id` nuevo. Si usa un bonus que ya existe (`VELOCIDAD`, `DANO` o `REGENERACION`), funciona sola y aparece en el menú de pausa. Las instrucciones están al principio de `src/sinergias.js`.

El dibujo del jefe (24 x 18 píxeles) está al principio de `src/jefe.js`, con el mismo formato que `src/sprites.js`.

### Zonas especiales (`src/config.js`, sección `ZONAS`, y `src/zonas.js`)

- `ZONAS_PRIMERA_MS`, `ZONAS_CADA_MS`: cuándo aparece la primera y cada cuánto una nueva.
- `ZONAS_MAXIMAS`: máximo de zonas a la vez. `ZONA_DURACION_MS`: cuánto dura cada una. `ZONA_PARPADEO_MS`: cuánto rato parpadea antes de irse.
- `ZONA_DISTANCIA_MIN` / `ZONA_DISTANCIA_MAX`: qué tan cerca o lejos del perro aparecen. `ZONA_MARGEN`: espacio libre entre la zona y la pileta o el perro.
- `ZONAS`: cada zona tiene `RADIO` (tamaño) y `PESO` (qué tan seguido sale; la segura tiene 1, es rara). La peligrosa tiene `DANO_MULTIPLICADOR` (2 = doble daño) y el barro `LENTITUD` (0.4 = 40% más lento).
- En `src/zonas.js` están el nombre, el color, la frase del aviso y el dibujo de 10 x 10 del ícono de cada zona, y los pasos para agregar una zona nueva.

### Mini desafíos (`src/config.js`, sección `DESAFIOS`, y `src/desafios.js`)

- `DESAFIO_PRIMERO_MS`: cuándo llega el primero. `DESAFIO_CADA_MS`: descanso entre uno y otro.
- `DESAFIO_OBJETO_PROBABILIDAD`: probabilidad de que la recompensa sea un objeto (si no, experiencia). `DESAFIO_RAREZA_MINIMA`: rareza mínima del objeto. `DESAFIO_XP`: experiencia que da.
- `DESAFIOS`: cada desafío tiene `PESO` (qué tan seguido sale) y `TIEMPO_MS` (la cuenta regresiva), más sus propios números: `OBJETOS` de la Búsqueda, `DENTRO_MS`, `RADIO` y `APARICION` de Aguanta, `ENEMIGOS` de la Cacería.
- En `src/desafios.js` están los nombres y frases, el dibujo de las cosas perdidas y los pasos para agregar un desafío nuevo.

### Ultra raros y coleccionables (`src/config.js`, sección `ULTRA RAROS`, y `src/coleccionables.js`)

- `ULTRA_PROBABILIDAD_ENEMIGO`, `ULTRA_PROBABILIDAD_ELITE`, `ULTRA_PROBABILIDAD_JEFE`: probabilidad de que suelten un ultra raro (0.04 = 4 de cada 100).
- `ULTRA_DESAFIOS`: qué desafíos dan **siempre** un ultra raro (por ahora `'aguanta'` y `'caceria'`).
- `ULTRA_RECOGER`: qué tan cerca hay que pasar para recogerlo.
- `COLECCION_COPIAS`: copias que pide cada nivel (`[1, 2, 3, 5, 8]`). Si agregas un número, hay un nivel más.
- `COLECCIONABLES`: lo que da cada coleccionable **por cada nivel** (por ejemplo `sweater: { VIDA: 10, ... }` = +10 de vida por nivel).
- `COLECCION_GUARDADO`: el nombre del guardado en el navegador. Si lo cambias, el juego empieza una colección nueva (la vieja queda escondida).
- En `src/coleccionables.js` están los nombres, las frases, los dibujos de 16 x 16 y a qué **mapa** pertenece cada uno (por ahora todos `'plaza'`). Al principio del archivo están los pasos para agregar uno nuevo (o de otro mapa).

### Huesitos (`src/config.js`, sección `HUESITOS`, y `src/huesitos.js`)

- `POR_MINUTO`, `POR_NIVEL`, `ENEMIGOS_POR_HUESITO`, `POR_DESAFIO`, `POR_JEFE`, `BONUS_AMANECER`: cuántos huesitos da cada cosa.
- `PRUEBA_TECLA_H`: cuántos da la tecla H en la pantalla de inicio.
- `GUARDADO`: el nombre del guardado en el navegador (no lo cambies o los huesitos se "pierden").

### Árbol de habilidades (`src/config.js`, sección `ARBOL`, y `src/arbol.js`)

- `COSTOS`: lo que cuesta cada nivel de una rama (por defecto `[50, 120, 250, 500]`).
- `DEVOLUCION`: qué parte de lo gastado devuelve "Reiniciar árbol" (`1` = el 100%).
- `GUARDADO`: el nombre del guardado en el navegador (no lo cambies o el árbol se "pierde").
- `GRUPO_RADIO`, `GRUPO_MAXIMO`: qué cuenta como "enemigo cerca" para la rama Manada del Beagle.
- `CAZA_VELOCIDAD_MINIMA`: desde qué velocidad un enemigo cuenta como "rápido" para la rama Caza del Galgo.
- `RAZAS`: los números de cada mejora (raza → rama → lista de 4). Arriba de la sección está explicado qué significa cada número. Si compras varias mejoras con el mismo número, se suman.
- En `src/arbol.js` están los **nombres y textos** de las mejoras (los números del texto se ponen solos desde `config.js`) y los **íconos de 8 x 8** de cada rama.

### Rincón de apuestas (`src/config.js`, sección `APUESTAS`, y `src/scenes/ApuestasScene.js`)

- `EN_CAMBIO_DE_FASE`: ponlo en `false` para que el rincón **no aparezca** al cambiar de fase (útil para probar).
- `EN_FIN_DE_PARTIDA`: en `false`, la M de la pantalla final vuelve directo al inicio.
- `MINIMO`, `MAXIMO`, `PASO`: apuesta mínima, máxima y cuánto cambia con las flechas.
- `EXACTO_PAGO`, `MAQUINA_PAGO`, `BAJO_ALTO_PAGO`, `GATO_PROBABILIDAD`: pagos y la probabilidad del gato. En los comentarios está calculado el **valor esperado** de cada juego: si cambias algo, revisa que siga siendo **negativo** (la casa gana).
- `DADO_MS`: cuánto rato rueda el dado.
- En `src/scenes/ApuestasScene.js` están los dibujos del **dado** (6 caras de 12 x 12) y del **gato** (16 x 16), en el mismo formato que `src/sprites.js`, y los mensajes del gato.

### Celular (`src/config.js`, sección `MOVIL`, y `src/tactil.js`)

- `CONTROLES_TACTILES`: `'auto'` (solo en pantallas táctiles), `true` (siempre) o `false` (nunca).
- `JOYSTICK_RADIO_REAL`, `JOYSTICK_ZONA_MUERTA`, `JOYSTICK_ZONA`: tamaño del joystick, cuánto hay que mover el dedo para que empiece a andar y qué parte de la pantalla sirve para el joystick.
- `BOTON_SPRINT_REAL`, `BOTON_PAUSA_REAL`, `BOTONES_ALFA`: tamaño de los botones en píxeles reales del celular y su transparencia.
- `CARTAS_ESPERA_MS`: rato en que las cartas de nivel no responden al aparecer.
- `MARGEN_HUD`: distancia entre los bordes de la pantalla y el HUD en celular (vida, poder, huesitos, reloj, botón de pausa, inventario y botones de las esquinas del menú). En PC siempre es 12. Súbelo si algo queda muy pegado al borde.
- `TEXTO_MINIMO`: tamaño mínimo de letra en celular (súbelo si te cuesta leer; puede encimar textos).
- Rendimiento: `ENEMIGOS_MAXIMOS` (límite de enemigos en celular), `LIMITAR_EFECTOS_DESDE` y `EFECTOS_UNO_DE_CADA` (con muchos enemigos se muestran menos dientes de mordida y no hay sombras del sprint), `OSCURIDAD_CADA_CUADROS` (cada cuántos cuadros se redibuja la oscuridad).

### Nombres, dibujos y parejas de fusión (`src/objetos.js`)

- `RAREZAS`: nombre y color de cada rareza, y si destella.
- `OBJETOS`: nombre y frase de cada objeto.
- `FUSIONES`: nombre, frase y qué instinto + objeto la desbloquean.
- `SPRITES_OBJETOS`: los dibujos de 16 x 16 de cada objeto (mismo formato que `src/sprites.js`), más la huella de la Estampida y la chispita.

**Agregar un objeto nuevo:** sigue los pasos escritos al principio de `src/objetos.js`. El nombre, dibujo, rareza e inventario funcionan solos; lo que *hace* el objeto hay que programarlo en `src/scenes/GameScene.js`.

## Archivos

- `index.html` — la página que abre el juego (zona segura del notch, altura visible y modo app de iPhone).
- `manifest.json` — datos para "Agregar a pantalla de inicio": nombre, pantalla completa, horizontal e ícono.
- `icons/` — ícono del perro en pixel art (180, 192 y 512 px).
- `src/config.js` — los números para ajustar el juego (plaza, razas, enemigos, niveles, instintos, objetos, fusiones, élites, zonas, desafíos, ultra raros, la noche, el jefe, los huesitos, el árbol de habilidades y las apuestas).
- `src/razas.js` — textos de las cartas de razas.
- `src/enemigos.js` — nombres de los enemigos.
- `src/instintos.js` — nombres y frases de las cartas de instintos, y sus íconos (12 x 12) para el menú de pausa.
- `src/sinergias.js` — las sinergias: nombre, frase, qué pide cada una y cómo se calcula su bonus.
- `src/pausa.js` — el menú de pausa: panel, pestañas (incluidas Desafíos y Colección) y botones.
- `src/coleccionables.js` — los ultra raros coleccionables: nombres, frases, dibujos, a qué mapa pertenecen, guardado en el navegador, peluche, aviso grande y la tecla C.
- `src/tactil.js` — el celular: detecta pantallas táctiles, joystick, botones Sprint y Pausa, pantalla completa (y aviso en iPhone), altura visible real, margen del HUD, aviso "Gira el celular", letra mínima y límites de rendimiento.
- `src/huesitos.js` — los huesitos: cuánto se gana en la partida, el desglose y el guardado en el navegador.
- `src/arbol.js` — el árbol de habilidades: nombres y textos de las mejoras, íconos, guardado en el navegador, comprar/reiniciar y lo que hacen las especiales en la partida.
- `src/zonas.js` — las zonas especiales: nombres, colores, íconos, dónde aparecen y qué hacen.
- `src/desafios.js` — los mini desafíos: nombres, frases, cómo avanzan, flechas, recompensas y la tecla X.
- `src/sprites.js` — los dibujos en pixel art de todos los personajes, el hueso y la mordida (y el borde de las élites y objetos).
- `src/objetos.js` — objetos, rarezas y fusiones: nombres, frases y dibujos.
- `src/mapa.js` — la plaza: suelo, pileta, bancas, árboles, faroles, basureros, autos, comida, obstáculos y la oscuridad de la noche.
- `src/noche.js` — el reloj de la noche, las fases y cuánto se aclara la oscuridad.
- `src/jefe.js` — El Jefe de la Plaza: su dibujo, sus ataques y su barra de vida.
- `src/online.js` — login con Google, apodo, puntaje, envío de partidas y lectura del ranking (Supabase).
- `src/main.js` — configuración del motor del juego.
- `src/scenes/MenuScene.js` — la pantalla de inicio para elegir raza (y los botones Álbum, Árbol, Rincón de apuestas, Ranking y Entrar con Google / Salir).
- `src/scenes/RankingScene.js` — el Ranking online: top 20 general y por raza, y tu posición.
- `supabase/migraciones/001_ranking.sql` — tablas, reglas de seguridad y vistas del ranking (se pega en el SQL Editor de Supabase).
- `src/scenes/ArbolScene.js` — la pantalla del Árbol de habilidades: pestañas de raza, las 3 ramas, el panel de la mejora y el botón Reiniciar.
- `src/scenes/AlbumScene.js` — el Álbum de coleccionables y el botón Borrar progreso.
- `src/scenes/ApuestasScene.js` — el Rincón de apuestas: los tres juegos, el dado y el gato en pixel art.
- `src/scenes/GameScene.js` — la partida: perro, enemigos (y cómo rodean obstáculos), ataques, poderes, comida, agua, experiencia, objetos, élites, fusiones, cartas, fases de la noche, amanecer, Game Over y victoria.

## Si algo no funciona

- Pantalla negra: revisa tu conexión a internet y recarga con **F5**. Si acabas de editar `src/config.js`, `src/razas.js`, `src/enemigos.js`, `src/sprites.js`, `src/mapa.js`, `src/objetos.js`, `src/noche.js`, `src/jefe.js`, `src/sinergias.js`, `src/zonas.js`, `src/desafios.js`, `src/coleccionables.js`, `src/huesitos.js`, `src/arbol.js` o `src/scenes/ApuestasScene.js`, revisa ese cambio.
- En el celular no aparece el joystick: revisa que `CONTROLES_TACTILES` en `src/config.js` esté en `'auto'` o `true`. Si se ve todo muy chico, gira el celular a horizontal y usa pantalla completa.
- En el celular va lento: baja `ENEMIGOS_MAXIMOS` o `LIMITAR_EFECTOS_DESDE` en la sección `MOVIL`, o sube `OSCURIDAD_CADA_CUADROS` a 3.
- En el celular se corta el HUD arriba o abajo: recarga la página (puede ser caché vieja) y gira el celular a horizontal. Si aún queda pegado al borde, sube `MARGEN_HUD` en la sección `MOVIL`.
- El perro no se mueve o las teclas no responden: haz clic una vez sobre el juego para que la ventana tenga el foco del teclado.
- Dice "Ranking disponible en la versión online": abriste el juego con doble clic o sin internet. Ábrelo desde GitHub Pages.
- "Falta crear las tablas del ranking en Supabase": aplica `supabase/migraciones/001_ranking.sql` (ver *Ranking online*).
- Al entrar con Google vuelve a otra página o da error de redirección: en Supabase → Authentication → URL Configuration, la *Site URL* y la *Redirect URL* deben ser exactamente la dirección del juego en GitHub Pages (con la `/` final).
- La colección no se guarda: revisa que no estés en una ventana privada/incógnito. Cada navegador guarda su propia colección.
