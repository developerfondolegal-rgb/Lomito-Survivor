// ===============================================================
//  AJUSTES DEL JUEGO
//  Cambia estos números para hacer el juego más fácil o difícil.
//  Guarda el archivo y recarga el navegador (F5) para ver el cambio.
//  (ms = milisegundos; 1000 ms = 1 segundo)
//  Cuidado: no borres las comas ni los dos puntos.
// ===============================================================

// Versión del juego (se ve en pantalla y se guarda con cada partida del ranking)
const VERSION_JUEGO = '0.34';

const CONFIG = {
  // Tamaño del mapa que se está jugando (en píxeles).
  // NO lo cambies aquí: el juego lo pone solo al empezar la partida con el
  // ANCHO y ALTO del mapa elegido (sección MAPAS, justo aquí abajo).
  MAPA_ANCHO: 6000,
  MAPA_ALTO: 6000,

  // ---------------------------------------------------------------
  //  MAPAS: se elige uno antes de cada partida (después de la raza).
  //  Los nombres, colores, dibujos y la lista de ultra raros de cada
  //  mapa están en src/mapas.js. Aquí van los números.
  //  En todos los mapas: si no caben todas las cosas, se ponen las que quepan.
  // ---------------------------------------------------------------
  // ---------------------------------------------------------------
  //  DIFICULTAD (v0.19): un solo número para afinar todo el juego.
  //  Multiplica la vida, el daño y la cantidad de enemigos (también la
  //  del jefe), el daño de los eventos peligrosos (curao al volante y
  //  jauría) y qué tan seguido llegan, en TODOS los mapas.
  //  1 = normal · 1.2 = 20% más difícil · 0.8 = 20% más fácil
  //  La dificultad de cada mapa está en MAPAS (más abajo), en DIFICULTAD.
  // ---------------------------------------------------------------
  DIFICULTAD: {
    MULTIPLICADOR_GLOBAL: 1.0,
    // v0.21: daño de los enemigos comunes (perro rival, manada, borracho, los de cada mapa, sus
    // élites y los que llama el jefe). NO cuenta al jefe ni a los eventos (curao al volante y jauría).
    // 1.3 = pegan 30% más · 1 = como antes de v0.21
    DANIO_MOBS_COMUNES_MULT: 1.3
  },

  // ---------------------------------------------------------------
  //  HUESOS (v0.21 / v0.22): cuándo sueltan huesos (la experiencia de la
  //  partida) los enemigos al morir y cuánta experiencia dan.
  // ---------------------------------------------------------------
  HUESOS: {
    PROBABILIDAD_DROP: 1.0,     // probabilidad de que un enemigo común suelte sus huesos (1 = siempre, como antes de v0.21;
                                // en v0.21 era 0.35). Después se aplica la de la raza (HUESO_PROBABILIDAD) a cada hueso.
                                // Los jefes, los élites y los TIPOS_SIEMPRE sueltan siempre.
    TIPOS_SIEMPRE: ['perrera', 'tripaseca'], // v0.33: + El Tripa Seca // enemigos especiales que siempre sueltan sus huesos
    XP_MULT: 0.65               // v0.22: la experiencia de cada hueso se multiplica por esto (HUESO_XP × XP_MULT).
                                // 0.65 = cada hueso da 35% menos experiencia que en v0.20. 1 = como antes
  },

  // ---------------------------------------------------------------
  //  JUGADOR (v0.22): daño del perro
  // ---------------------------------------------------------------
  JUGADOR: {
    DANIO_BASE_MULT: 1.15       // todo el daño que hace el perro (mordida, ladrido, ataques, poderes, fusiones,
                                // árbol y compañeros) se multiplica por esto. 1.15 = 15% más. No cambia la vida.
                                // No cuenta el curao al volante (no es del perro)
  },

  // ---------------------------------------------------------------
  //  RECOMPENSAS (v0.21): nunca se ofrece algo que ya está al máximo.
  //  Si el objeto que caería (o el de un desafío) ya no sirve, o si al
  //  subir de nivel ya no queda ningún instinto por mejorar, se ganan
  //  huesitos de la partida en su lugar.
  // ---------------------------------------------------------------
  RECOMPENSAS: {
    HUESOS_SI_MAXEADO: 25       // huesitos que se ganan en vez de una recompensa ya al máximo
  },

  // ---------------------------------------------------------------
  //  COOP (v0.26): cooperativo local, dos perros en el mismo computador.
  //  J1: WASD (+ Espacio para el Sprint). J2: flechas (+ Enter para el Sprint),
  //  o un control (gamepad) si hay uno conectado.
  //  Se activa en el menú con la tecla TECLA_MENU, o con ?coop=1 en la dirección.
  //  En celular / tablet no se puede (salvo que haya un control conectado).
  //  El código está en src/coop.js.
  // ---------------------------------------------------------------
  COOP: {
    ACTIVO: false,              // true = el juego empieza en cooperativo (si el dispositivo lo permite)
    TECLA_MENU: '2',            // tecla del menú que activa / desactiva el cooperativo (v0.26.1: la raza se elige solo con clic)
    ZOOM_MIN: 0.7,              // lo más lejos que se aleja la cámara cuando los perros se separan (1 = sin zoom)
    ZOOM_SUAVIDAD: 0.06,        // qué tan rápido cambia el zoom (0.06 = suave; 1 = de golpe)
    CAMARA_SUAVIDAD: 0.1,       // qué tan rápido sigue la cámara al punto medio (igual que en 1 jugador)
    MARGEN_PANTALLA: 70,        // espacio que se deja entre cada perro y el borde de la pantalla (px)
    DISTANCIA_MAX: 600,         // correa invisible: los perros no se separan más que esto (px).
                                // Con ZOOM_MIN 0.7 se ven 771 px de alto: 600 + 2 × 70 de margen = 740, así
                                // los dos quedan siempre en pantalla aunque se separen hacia arriba y abajo
    SEPARACION_INICIO: 60,      // a qué distancia aparece J2 al lado de J1 al empezar
    ZONA_MUERTA_CONTROL: 0.25,  // el palito del control no mueve al perro si se inclina menos que esto
    COLOR_J1: 0xffe082,         // color del indicador "P1" (amarillo)
    COLOR_J2: 0x4fc3f7,         // color del indicador "P2" y de su barra de vida (celeste)

    // v0.27 (parte 2): cartas por turno, revivir y dificultad
    // Cartas: al subir de nivel elige un jugador y al siguiente nivel el otro (empieza J1).
    // La carta solo mejora al perro que la eligió. El nivel y la experiencia son de los dos.
    REVIVIR_RADIO: 60,          // qué tan cerca (px) tiene que estar el compañero para revivir al perro caído
    REVIVIR_SEGUNDOS: 3,        // cuántos segundos tiene que quedarse cerca para revivirlo
    REVIVIR_BAJA_MULT: 1,       // si el que revive se aleja, el progreso baja a esta rapidez (1 = igual de rápido que sube)
    REVIVIR_VIDA_PCT: 0.4,      // con qué parte de su vida máxima vuelve el perro (0.4 = 40%)
    REVIVIR_INVULN_S: 2,        // segundos sin recibir daño después de revivir
    // v0.32: la red del Personal de la Perrera (misma idea que revivir, más corto)
    LIBERAR_RED_RADIO: 60,      // qué tan cerca (px) tiene que estar el compañero para sacarle la red al atrapado
    LIBERAR_RED_SEGUNDOS: 1.2,  // cuántos segundos tiene que quedarse cerca (si los dos están atrapados, se sueltan solos)
    VIDA_ENEMIGOS_MULT: 1.5,    // con 2 jugadores, los enemigos (y el jefe) tienen esta vida multiplicada (1.5 = 50% más)
    SPAWN_MULT: 1.3             // con 2 jugadores aparecen esta cantidad de enemigos multiplicada (1.3 = 30% más seguido)
  },

  MAPA_SEMILLA: 'lomito',       // cambia este texto para que las cosas salgan en otros lugares (todos los mapas)
  MAPAS: {
    INICIAL: 'plaza',           // mapa marcado la primera vez que se abre la pantalla de mapas
    GUARDADO: 'lomitoSurvivor_mapa', // nombre del guardado en el navegador del último mapa elegido
    // Mapas desbloqueados y noches sobrevividas en cada mapa (v0.19). No lo cambies o se "pierde" el progreso
    GUARDADO_DESBLOQUEO: 'lomitoSurvivor_mapas',

    // En cada mapa (v0.19):
    //  DIFICULTAD: multiplicadores del mapa. VIDA, DANO y CANTIDAD de enemigos,
    //              y EVENTOS = qué tan seguido llegan el curao y la jauría (1.35 = 35% más).
    //              Se multiplican con DIFICULTAD.MULTIPLICADOR_GLOBAL (arriba).
    //  DESBLOQUEO: qué hay que hacer para poder elegirlo (sin DESBLOQUEO = siempre disponible).
    //              MAPA: en qué mapa hay que sobrevivir · NOCHES: cuántas noches

    // La plaza (el mapa de siempre, ahora el doble de ancho y de alto)
    plaza: {
      ANCHO: 6000,              // tamaño del mapa en píxeles (antes 3000 x 3000)
      ALTO: 6000,
      ARBOLES: 150,             // en los 4 prados
      BANCAS: 56,               // a la orilla de los caminos en cruz
      BASUREROS: 28,            // van al lado de las bancas (y sueltan comida)
      FAROLES: 70,              // 4 alrededor de la pileta y el resto en caminos y senderos
      FAROL_CADA: 350,          // distancia entre faroles a lo largo de los caminos
      AUTOS: 40,                // estacionados en la calle de los bordes
      SENDEROS_POR_PRADO: 2,    // senderos de tierra en cada uno de los 4 prados
      ULTRA_MULTIPLICADOR: 1,   // probabilidad de ultra raros en este mapa (1 = normal, 2 = el doble)
      DIFICULTAD: { VIDA: 1.0, DANO: 1.0, CANTIDAD: 1.0, EVENTOS: 1.0 } // el mapa base
    },

    // Terminal de buses: andenes con buses estacionados
    terminal: {
      ANCHO: 5400,
      ALTO: 4200,
      VEREDA: 140,              // ancho de la vereda en los 4 bordes
      ANDENES: 6,               // cuántos andenes (filas largas de cemento)
      ANDEN_ALTO: 120,          // grosor de cada andén
      ANDEN_SEPARACION: 560,    // distancia entre un andén y el siguiente
      ANDEN_MARGEN: 480,        // espacio libre entre los extremos del andén y el borde del mapa
      BUSES: 30,                // buses estacionados (con la trompa hacia el andén)
      BUS_SEPARACION: 110,      // distancia entre un estacionamiento de bus y el siguiente
      BANCAS: 34,               // sobre los andenes
      BASUREROS: 18,            // al lado de las bancas (sueltan comida)
      FAROLES: 48,              // sobre los andenes
      FAROL_CADA: 380,          // distancia entre faroles en un andén
      ULTRA_MULTIPLICADOR: 1,
      DIFICULTAD: { VIDA: 1.35, DANO: 1.35, CANTIDAD: 1.35, EVENTOS: 1.35 },
      DESBLOQUEO: { MAPA: 'plaza', NOCHES: 1 }    // sobrevivir 1 noche en la plaza
    },

    // Feria libre: corridas de puestos con toldos y cajones
    feria: {
      ANCHO: 4800,
      ALTO: 4800,
      VEREDA: 140,              // ancho de la vereda en los 4 bordes
      CORRIDAS: 7,              // filas de puestos
      CORRIDA_SEPARACION: 520,  // distancia entre una corrida y la siguiente
      CORRIDA_MARGEN: 380,      // espacio libre entre los extremos de la corrida y el borde del mapa
      PUESTO_SEPARACION: 130,   // distancia entre un puesto y el siguiente en la corrida
      PASILLO_CADA: 5,          // cada 5 lugares de la corrida queda uno libre para pasar
      PUESTOS: 120,             // mesones con fruta y verdura
      TOLDOS: 70,               // toldos de lona detrás de algunos puestos
      CAJONES: 70,              // pilas de cajones (sueltan comida, como los basureros)
      FAROLES: 44,              // en los pasillos entre corridas
      FAROL_CADA: 420,          // distancia entre faroles en un pasillo
      MANCHAS: 160,             // cartones y hojas de lechuga tirados en el suelo (solo adorno)
      ULTRA_MULTIPLICADOR: 1,
      DIFICULTAD: { VIDA: 1.7, DANO: 1.7, CANTIDAD: 1.7, EVENTOS: 1.7 },
      DESBLOQUEO: { MAPA: 'terminal', NOCHES: 1 } // sobrevivir 1 noche en la terminal
    }
  },

  // ---------------------------------------------------------------
  //  PLAZA: medidas del dibujo (src/mapa.js). Las cantidades están en MAPAS.plaza
  // ---------------------------------------------------------------
  CALLE_ANCHO: 160,             // ancho de la calle con autos en los 4 bordes
  PASILLO_ANCHO: 400,           // ancho de los caminos de baldosas en cruz
  PILETA_RADIO: 108,            // tamaño de la pileta del centro (solo en la plaza)

  // Luz y oscuridad
  OSCURIDAD: 0.7,               // qué tan oscura es la noche (0 = de día, 1 = negro total)
  LUZ_FAROL_RADIO: 220,         // tamaño del círculo de luz de cada farol
  LUZ_PERRO_RADIO: 150,         // pequeña luz alrededor del perro para no perderlo de vista

  // Comida (cura un poco de vida; solo se come si te falta vida)
  COMIDA_CURA: 11,              // vida que recupera cada comida (antes 15; v0.19: -25%)
  COMIDA_CADA_MS: 12000,        // cada cuánto aparece comida en algún lugar cerca del perro
  COMIDA_DISTANCIA: 550,        // qué tan lejos del perro puede aparecer
  COMIDA_MAXIMA: 8,             // máximo de comida en el suelo a la vez
  BASURERO_COMIDA_CADA_MS: 6000, // cada cuánto aparece comida junto al basurero más cercano
  BASURERO_DISTANCIA: 700,      // el basurero tiene que estar a esta distancia del perro o menos

  // Agua de la pileta (cura si el perro está pegado a ella)
  AGUA_CURA: 1,                 // vida que recupera...
  AGUA_CURA_CADA_MS: 670,       // ...cada este tiempo (antes 500; v0.19: cura 25% menos)
  AGUA_DISTANCIA: 15,           // qué tan pegado a la pileta tiene que estar

  // Enemigos rodeando obstáculos
  RODEO_MS: 600,                // al chocar un obstáculo, cuánto rato caminan de lado para rodearlo

  // ---------------------------------------------------------------
  //  RAZAS
  //  Los números base de cada perro. Los textos de las cartas están
  //  en src/razas.js
  //
  //  COLOR: no cambia el dibujo (los dibujos están en src/sprites.js).
  //         Solo se usa para pintar una raza nueva que no tenga dibujo
  //         (formato 0xRRGGBB)
  //  VIDA: vida con la que empieza
  //  VELOCIDAD: qué tan rápido se mueve
  //  MORDIDA_DANO: daño de cada mordida
  //  MORDIDA_CADA_MS: cada cuánto muerde (1000 = 1 vez por segundo)
  //  RADIO: tamaño de la zona de choque (más chico = más fácil esquivar)
  //  HUESO_PROBABILIDAD: probabilidad de que un enemigo suelte hueso
  //                      (1 = siempre, 0.75 = 3 de cada 4 veces)
  //  IMAN_EXTRA: alcance extra del imán de huesos
  //  PODER: qué poder especial usa ('calle', 'mandibula', 'sprint',
  //         'rastreo' o '' para ninguno)
  //  PODER_ESPERA_MS: tiempo de espera del poder (0 = poder pasivo)
  // ---------------------------------------------------------------
  RAZAS: {
    // Quiltro (mestizo): equilibrado y resistente
    quiltro: {
      COLOR: 0x8b5a2b,          // café
      VIDA: 82,                 // antes 110 (v0.19: -25%)
      VELOCIDAD: 220,
      MORDIDA_DANO: 10,
      MORDIDA_CADA_MS: 1000,
      RADIO: 20,
      HUESO_PROBABILIDAD: 1,    // poder "Calle": cuando un enemigo suelta huesos, no se pierde ninguno
      IMAN_EXTRA: 0,
      PODER: 'calle',
      PODER_ESPERA_MS: 0,
      CALLE_CURA: 1,            // poder "Calle": vida que recupera...
      CALLE_CURA_CADA_MS: 2670  // ...cada este tiempo (antes 2000; v0.19: cura 25% menos)
    },

    // Pitbull: lento, mucha vida y mordida fuerte
    pitbull: {
      COLOR: 0x6b7f99,          // gris azulado
      VIDA: 120,                // antes 160 (v0.19: -25%)
      VELOCIDAD: 175,
      MORDIDA_DANO: 16,
      MORDIDA_CADA_MS: 1150,
      RADIO: 23,
      HUESO_PROBABILIDAD: 0.75,
      IMAN_EXTRA: 0,
      PODER: 'mandibula',
      PODER_ESPERA_MS: 6000,    // "Mandíbula de hierro" se carga cada 6 segundos
      MANDIBULA_DANO_EXTRA: 20, // daño extra de esa mordida
      MANDIBULA_ATURDIR_MS: 1500 // cuánto tiempo queda quieto el enemigo
    },

    // Galgo: muy rápido y frágil
    galgo: {
      COLOR: 0xe8d5b0,          // beige claro
      VIDA: 52,                 // antes 70 (v0.19: -25%)
      VELOCIDAD: 290,
      MORDIDA_DANO: 9,
      MORDIDA_CADA_MS: 1000,
      RADIO: 16,
      HUESO_PROBABILIDAD: 0.75,
      IMAN_EXTRA: 0,
      PODER: 'sprint',
      PODER_ESPERA_MS: 4000,    // "Sprint" (tecla Espacio) se recarga en 4 segundos
      SPRINT_VELOCIDAD: 800,    // velocidad durante el sprint
      SPRINT_DURACION_MS: 300   // cuánto dura el sprint
    },

    // Beagle: mordida débil pero gran olfato
    beagle: {
      COLOR: 0xf5f5f0,          // blanco
      VIDA: 68,                 // antes 90 (v0.19: -25%)
      VELOCIDAD: 225,
      MORDIDA_DANO: 7,
      MORDIDA_CADA_MS: 900,
      RADIO: 17,
      HUESO_PROBABILIDAD: 0.75,
      IMAN_EXTRA: 130,          // poder "Rastreo": imán de huesos mucho más grande
      PODER: 'rastreo',
      PODER_ESPERA_MS: 0,
      RASTREO_FLECHAS_MAX: 15   // máximo de flechas a enemigos fuera de pantalla
    }
  },

  // --- Cosas que comparten todas las razas ---
  PERRO_INVULNERABLE_MS: 500,   // tiempo sin recibir daño después de un golpe
  MORDIDA_ALCANCE: 90,          // qué tan cerca debe estar el enemigo para morderlo

  // ---------------------------------------------------------------
  //  ENEMIGOS
  //  Los números de cada tipo de enemigo. Sus nombres están en
  //  src/enemigos.js
  //
  //  COLOR: no cambia el dibujo (los dibujos están en src/sprites.js).
  //         Solo se usa para pintar un enemigo nuevo que no tenga
  //         dibujo (formato 0xRRGGBB)
  //  RADIO: tamaño de la zona de choque (y para las mordidas)
  //  VIDA: vida del enemigo
  //  VELOCIDAD: qué tan rápido se mueve
  //  DANO: vida que te quita al tocarte (0 = no hace daño)
  //  HUESOS: cuántos huesos suelta al morir (más duro = más huesos)
  //  DESDE_SEGUNDOS: desde qué segundo de la partida empieza a aparecer
  //                  (45 = 0:45, 90 = 1:30, 150 = 2:30, 210 = 3:30)
  //  PESO: qué tan seguido aparece comparado con los demás
  //        (10 = muy seguido, 1 = poco)
  //  MAXIMO: máximo de este enemigo a la vez (opcional)
  //  COMPORTAMIENTO: cómo se mueve: 'perseguir', 'zigzag',
  //                  'embestida' o 'atrapar'
  //  MAPAS: (opcional) ids de los mapas donde aparece. Sin MAPAS = en todos.
  // ---------------------------------------------------------------
  ENEMIGOS: {
    // Perro rival: el enemigo básico
    rival: {
      COLOR: 0xd63c3c,          // rojo
      RADIO: 16,
      VIDA: 20,
      VELOCIDAD: 110,
      DANO: 5,
      HUESOS: 1,
      DESDE_SEGUNDOS: 0,
      PESO: 10,
      COMPORTAMIENTO: 'perseguir'
    },

    // Manada: grupos de perros chicos, rápidos y débiles
    manada: {
      COLOR: 0xff6e6e,          // rojo claro
      RADIO: 10,
      VIDA: 8,
      VELOCIDAD: 165,
      DANO: 3,
      HUESOS: 1,
      DESDE_SEGUNDOS: 45,
      PESO: 1.5,                // la mitad de seguido que el borracho o el drogadicto
      COMPORTAMIENTO: 'perseguir',
      GRUPO_MIN: 3,             // llegan de a 3...
      GRUPO_MAX: 4              // ...hasta 4 juntos
    },

    // Borracho: lento, zigzaguea, mucha vida y golpe fuerte
    borracho: {
      COLOR: 0xff9800,          // naranjo
      RADIO: 18,                // zona de choque del tamaño del dibujo (era 15)
      VIDA: 70,
      VELOCIDAD: 65,
      DANO: 15,
      HUESOS: 3,
      DESDE_SEGUNDOS: 90,
      PESO: 3,
      COMPORTAMIENTO: 'zigzag',
      ZIGZAG_GRADOS: 55,        // cuánto se desvía hacia los lados
      ZIGZAG_CADA_MS: 1400      // cuánto demora en ir de un lado al otro y volver
    },

    // Drogadicto: se queda quieto, avisa y embiste rápido
    drogadicto: {
      COLOR: 0x66bb6a,          // verde
      RADIO: 18,                // zona de choque del tamaño del dibujo (era 16)
      VIDA: 35,
      VELOCIDAD: 80,            // velocidad cuando se acerca caminando
      DANO: 10,
      HUESOS: 3,
      DESDE_SEGUNDOS: 150,
      PESO: 3,
      COMPORTAMIENTO: 'embestida',
      DISTANCIA_EMBESTIDA: 280, // a esta distancia del perro se detiene para embestir
      AVISO_MS: 700,            // tiempo quieto avisando (línea y parpadeo)
      EMBESTIDA_VELOCIDAD: 520, // velocidad de la embestida
      EMBESTIDA_MS: 550,        // cuánto dura la embestida
      DESCANSO_MS: 900          // tiempo quieto después de embestir
    },

    // Perrera: no hace daño, pero te atrapa
    perrera: {
      COLOR: 0x1e63c8,          // azul
      RADIO: 17,
      VIDA: 90,
      VELOCIDAD: 95,
      DANO: 0,
      HUESOS: 5,
      DESDE_SEGUNDOS: 210,
      PESO: 1,
      MAXIMO: 2,
      COMPORTAMIENTO: 'atrapar',
      ATRAPA_MS: 1500,          // cuánto tiempo te deja quieto
      RECARGA_MS: 4000          // después de atraparte, cuánto espera para poder atraparte de nuevo
    },

    // --- Enemigos propios de cada mapa (v0.19) ---

    // Palomas (solo en la plaza): bandadas que revolotean en zigzag. Débiles pero molestas
    paloma: {
      COLOR: 0x8e9aaf,          // gris paloma
      RADIO: 10,
      VIDA: 6,
      VELOCIDAD: 150,
      DANO: 3,
      HUESOS: 1,
      DESDE_SEGUNDOS: 75,
      PESO: 1.5,
      COMPORTAMIENTO: 'zigzag',
      ZIGZAG_GRADOS: 40,
      ZIGZAG_CADA_MS: 700,
      GRUPO_MIN: 4,             // llegan de a 4...
      GRUPO_MAX: 6,             // ...hasta 6 juntas
      MAPAS: ['plaza']
    },

    // Auxiliar de micro (solo en la terminal): embiste más fuerte y más lejos que el Drogadicto
    auxiliar: {
      COLOR: 0xf9a825,          // chaleco amarillo
      RADIO: 18,
      VIDA: 55,
      VELOCIDAD: 95,
      DANO: 14,
      HUESOS: 3,
      DESDE_SEGUNDOS: 100,
      PESO: 2.5,
      COMPORTAMIENTO: 'embestida',
      DISTANCIA_EMBESTIDA: 330,
      AVISO_MS: 650,
      EMBESTIDA_VELOCIDAD: 600,
      EMBESTIDA_MS: 600,
      DESCANSO_MS: 800,
      MAPAS: ['terminal']
    },

    // Quiltro bravo (solo en la feria): un perro rival más grande, rápido y fuerte, con collar de púas
    bravo: {
      COLOR: 0x5d4037,          // café oscuro
      RADIO: 18,
      VIDA: 45,
      VELOCIDAD: 135,
      DANO: 9,
      HUESOS: 2,
      DESDE_SEGUNDOS: 40,
      PESO: 4,
      COMPORTAMIENTO: 'perseguir',
      MAPAS: ['feria']
    },

    // --- Enemigos con dibujo nuevo (v0.29) ---

    // Perrita del moño: enemiga temprana. Se frena, abre la boca y se lanza un tramo corto.
    // (id monaEnemiga: "mona" queda reservado por si después es raza jugable)
    monaEnemiga: {
      COLOR: 0x5a6a88,          // gris azulado (no se usa: tiene dibujo propio)
      SPRITE: 'nuevo_perrita',  // dibujo nuevo (src/sprites_perrita.js); su tamaño está en ENEMIGOS_SPRITE_NUEVO
      RADIO: 14,
      VIDA: 16,
      VELOCIDAD: 128,
      DANO: 4,
      HUESOS: 1,
      DESDE_SEGUNDOS: 20,
      PESO: 6,
      COMPORTAMIENTO: 'embestida', // el mismo del Drogadicto, con números chicos
      DISTANCIA_EMBESTIDA: 130, // a esta distancia del perro se detiene para embestir
      AVISO_MS: 350,            // tiempo quieto avisando (abre la boca)
      EMBESTIDA_VELOCIDAD: 380, // velocidad de la embestida
      EMBESTIDA_MS: 260,        // cuánto dura la embestida (380 x 0,26 s = unos 100 px de tramo)
      DESCANSO_MS: 700          // tiempo quieto después de embestir
    },

    // --- v0.30: Limpiavidrios y su perro (diseño: _nuevos/docs/diseno_razas.md, 5.2) ---

    // Limpiavidrios: humano lento con balde. De lejos tira agua jabonosa (te deja lento);
    // de cerca, escobillazo en arco. Siempre sale con su perro (perroJabon) al lado.
    limpiavidrios: {
      COLOR: 0x7a8e5a,          // verde (no se usa: tiene dibujo propio)
      SPRITE: 'nuevo_limpiavidrios', // dibujo 48x48 (src/sprites_limpiavidrios.js), escala 1.5
      RADIO: 18,                // igual que borracho / auxiliar
      VIDA: 62,
      VELOCIDAD: 70,
      DANO: 0,                  // al tocarlo no pega: solo hace daño con el escobillazo
      HUESOS: 3,
      DESDE_SEGUNDOS: 110,      // desde el 1:50
      PESO: 2.2,
      MAXIMO: 2,                // como mucho 2 limpiavidrios a la vez
      COMPORTAMIENTO: 'limpiavidrios',
      ACOMPANANTE: 'perroJabon', // cada vez que sale uno, sale este perro a su lado
      MAPAS: ['plaza', 'terminal'], // donde hay vidrios. Para abrirlo a otros mapas, agrega su id aquí
      // Agua jabonosa (de lejos): un chorro corto hacia el perro
      AGUA_DISTANCIA_MAX: 260,  // tira agua si el perro está a menos de esto (y más lejos que el escobillazo)
      AGUA_AVISO_MS: 300,       // se detiene y avisa esto antes de tirarla
      AGUA_VELOCIDAD: 320,      // qué tan rápido vuela el chorro
      AGUA_ALCANCE: 300,        // hasta dónde llega el chorro
      AGUA_RADIO: 12,           // tamaño del chorro (para pegarle al perro)
      AGUA_LENTITUD: 0.5,       // el perro mojado va a la mitad de velocidad (la misma LENTITUD que Escarbar)
      AGUA_LENTO_MS: 2000,      // cuánto dura lo mojado (el Gorro de lana lo acorta, igual que el barro)
      AGUA_ESPERA_MS: 3200,     // después de tirar agua, espera esto para volver a atacar
      // Escobillazo (de cerca): golpe en arco frente a él
      ESCOBA_DISTANCIA: 75,     // si el perro está a menos de esto, prepara el escobillazo
      ESCOBA_ALCANCE: 70,       // largo del golpe (desde el borde del limpiavidrios)
      ESCOBA_ANGULO: 90,        // ancho del arco en grados
      ESCOBA_DANO: 12,
      ESCOBA_AVISO_MS: 400,     // aviso corto antes del golpe (el arco parpadea)
      ESCOBA_ESPERA_MS: 1600,   // después del escobillazo, espera esto para volver a atacar
      ATAQUE_MS: 300            // queda quieto mostrando la animación de ataque después de atacar
    },

    // Perro jabón (crema): el perro del limpiavidrios. Persigue al perro del jugador;
    // si el agua de su dueño te moja, te embiste. Si su dueño muere, se queda y se enoja.
    perroJabon: {
      COLOR: 0xe0cc98,          // crema (no se usa: tiene dibujo propio)
      SPRITE: 'nuevo_limpiavidrios_perro', // dibujo 32x32 (src/sprites_limpiavidrios.js), escala 2
      RADIO: 14,
      VIDA: 18,
      VELOCIDAD: 140,
      DANO: 5,
      HUESOS: 1,
      PESO: 0,                  // no sale solo: lo trae el limpiavidrios (ACOMPANANTE)
      SOLO_CON_DUENO: true,     // tampoco sale suelto con la tecla T ni como élite
      COMPORTAMIENTO: 'acompanante', // persigue; embiste con el combo de su dueño (v0.31: lo comparte con el perro del Malandra)
      COMBO_VELOCIDAD: 400,     // embestida cuando el agua de su dueño te moja...
      COMBO_MS: 300,            // ...y cuánto dura
      SIN_DUENO_VELOCIDAD_MULT: 1.2 // si su dueño murió, corre un 20% más rápido
    },

    // --- v0.31: El Malandra y su perro (diseño: _nuevos/docs/diseno_razas.md, 5.4) ---

    // El Malandra: peligroso de mitad y final de la noche. Se acerca, avisa con un brillo
    // en el filo y corta en arco. Se esquiva alejándose o yéndose al lado.
    // Siempre sale con su perro (perroMalandra) al lado.
    malandra: {
      COLOR: 0x3a3a48,          // oscuro (no se usa: tiene dibujo propio)
      SPRITE: 'nuevo_cuchilla', // dibujo 48x48 (src/sprites_cuchilla.js), escala 1.5
      RADIO: 18,
      VIDA: 80,
      VELOCIDAD: 85,
      DANO: 0,                  // al tocarlo no pega: solo hace daño con el corte
      HUESOS: 4,
      DESDE_SEGUNDOS: 180,      // desde las 3:00
      PESO: 2,
      MAXIMO: 2,                // como mucho 2 a la vez
      COMPORTAMIENTO: 'malandra',
      ACOMPANANTE: 'perroMalandra', // cada vez que sale uno, sale este perro a su lado
      MAPAS: ['feria'],         // para sumarlo a otros mapas, agrega su id aquí
      CORTE_DISTANCIA: 85,      // si el perro está a menos de esto, prepara el corte
      CORTE_AVISO_MS: 400,      // aviso antes del corte (brillo en el filo): tiempo para esquivar
      CORTE_ALCANCE: 80,        // largo del corte (desde el borde del Malandra)
      CORTE_ANGULO: 100,        // ancho del arco en grados
      CORTE_DANO: 18,
      CORTE_ESPERA_MS: 1800,    // después de un corte, espera esto para volver a cortar
      ATAQUE_MS: 300            // queda quieto mostrando la animación de ataque después de cortar
    },

    // Perro del Malandra: agresivo. Persigue al perro del jugador y embiste cuando su
    // dueño corta. Si su dueño muere, se queda y se enoja (igual que el del limpiavidrios).
    perroMalandra: {
      COLOR: 0x5a4a3a,          // no se usa: tiene dibujo propio
      SPRITE: 'nuevo_cuchilla_perro', // dibujo 32x32 (src/sprites_cuchilla.js), escala 2
      RADIO: 15,
      VIDA: 28,
      VELOCIDAD: 150,
      DANO: 7,
      HUESOS: 2,
      PESO: 0,                  // no sale solo: lo trae el Malandra (ACOMPANANTE)
      SOLO_CON_DUENO: true,     // tampoco sale suelto con la tecla T ni como élite
      COMPORTAMIENTO: 'acompanante',
      COMBO_VELOCIDAD: 400,     // embestida al mismo tiempo que el corte de su dueño...
      COMBO_MS: 300,            // ...y cuánto dura
      SIN_DUENO_VELOCIDAD_MULT: 1.2 // si su dueño murió, corre un 20% más rápido
    },

    // --- v0.32: Personal de la Perrera (diseño: _nuevos/docs/diseno_razas.md, 5.3) ---
    // El de la red y el silbato. Más tardío y más duro que la Perrera (perrera, arriba), que sigue igual.
    personalPerrera: {
      COLOR: 0x4a6a8a,          // no se usa: tiene dibujo propio
      SPRITE: 'nuevo_perrera',  // dibujo 48x48 (src/sprites_perrera.js), escala 1.5
      RADIO: 18,
      VIDA: 110,                // Perrera 90
      VELOCIDAD: 100,           // Perrera 95
      DANO: 6,                  // al tocarlo pega poquito (el palo de la red)
      HUESOS: 6,
      DESDE_SEGUNDOS: 240,      // desde las 4:00 (la Perrera sale a las 3:30)
      PESO: 1,
      MAXIMO: 1,                // nunca más de uno a la vez
      COMPORTAMIENTO: 'personalPerrera',
      MAPAS: ['plaza', 'terminal', 'feria'], // todos los mapas (si se agrega uno nuevo, súmalo aquí)
      // Red: se detiene, avisa y la lanza hacia donde estaba el perro
      RED_DISTANCIA: 150,       // si el perro está a menos de esto, prepara la red
      RED_AVISO_MS: 500,        // aviso antes de lanzarla (se ve dónde va a caer): tiempo para esquivar
      RED_ALCANCE: 160,         // hasta dónde llega la red
      RED_VELOCIDAD: 380,       // qué tan rápido vuela
      RED_RADIO: 16,            // tamaño de la red (para pillar al perro)
      RED_ATRAPA_MS: 2500,      // si te pilla, te deja inmóvil esto (el Gorro de lana lo acorta, igual que la Perrera)
      RED_ESPERA_MS: 4500,      // después de lanzar la red, espera esto para volver a lanzarla
      ATAQUE_MS: 350,           // queda quieto mostrando la animación de ataque después de lanzar
      // Silbato: llama perros de manada
      SILBATO_CADA_MS: 8000,    // cada cuánto toca el silbato (si no está lanzando la red)
      SILBATO_MS: 600,          // cuánto se queda quieto tocándolo
      SILBATO_MANADA: 3,        // cuántos perros de manada llama...
      SILBATO_DISTANCIA: 180,   // ...y a qué distancia de él aparecen
      SILBATO_TIPO: 'manada'    // qué enemigo llama (el perrito de manada de siempre)
    },

    // --- v0.33: El Tripa Seca (diseño: _nuevos/docs/diseno_razas.md, 5.5) ---
    // Mini jefe de la noche. NO sale con los enemigos comunes: llega como evento
    // (sección TRIPA_SECA, más abajo; código en src/tripaseca.js).
    // La vida, la velocidad y el daño llevan los mismos multiplicadores que el resto
    // (fase de la noche, mapa, dificultad global y cooperativo), una sola vez.
    tripaseca: {
      COLOR: 0x9a5634,          // no se usa: tiene dibujo propio
      SPRITE: 'nuevo_tripa_seca', // dibujo 48x48 (src/sprites_tripa_seca.js)
      ESCALA: 1.75,             // un poco más grande que los humanos nuevos (1.5); el Jefe de la Plaza es mucho más grande
      RADIO: 20,
      VIDA: 180,                // Perrera 90, Jefe 3000: es un mini jefe
      VELOCIDAD: 100,           // caminando (Jefe 90)
      DANO: 22,                 // daño al tocarlo
      HUESOS: 10,               // siempre los suelta (está en HUESOS.TIPOS_SIEMPRE)
      PESO: 0,                  // no sale con los enemigos comunes (solo como evento)
      MAXIMO: 1,                // nunca más de uno a la vez
      SOLO_EVENTO: true,        // tampoco sale como élite ni en el círculo de la tecla T (la T lo trae con su aviso)
      COMPORTAMIENTO: 'tripaseca',
      MASA: 20,                 // los perros chicos casi no lo empujan al chocar
      // Brazo largo: se detiene, avisa con una línea en el suelo y lanza el brazo
      BRAZO_ALCANCE: 200,       // hasta dónde llega el brazo (px, desde su borde)
      BRAZO_ANCHO: 14,          // qué tan gruesa es la zona que pega (px)
      BRAZO_AVISO_MS: 550,      // aviso (línea en el suelo) antes de lanzarlo
      BRAZO_DANO: 16,
      BRAZO_ESPERA_MS: 2600,    // espera entre brazos
      BRAZO_TIRON_VELOCIDAD: 520, // si te pega, te tira hacia él a esta velocidad...
      BRAZO_TIRON_MS: 220,      // ...durante este rato (nunca te deja encima de él)
      // Estirón: se achica, avisa con una franja y cruza en línea recta
      ESTIRON_DISTANCIA_MIN: 180, // lo usa si el perro está entre esta distancia...
      ESTIRON_DISTANCIA_MAX: 460, // ...y esta (más cerca usa el brazo)
      ESTIRON_AVISO_MS: 600,    // cuánto se achica avisando
      ESTIRON_LARGO: 400,       // cuánto cruza (px)
      ESTIRON_VELOCIDAD: 600,   // qué tan rápido (el Curao va a 1000)
      ESTIRON_DANO: 22,
      ESTIRON_ESPERA_MS: 5500,  // espera entre estirones
      ESTIRON_DESCANSO_MS: 600, // queda quieto después de cruzar
      ESPERA_ENTRE_ATAQUES_MS: 900, // después de cualquier ataque espera esto antes del siguiente
      ATAQUE_MS: 300,           // queda quieto mostrando la animación después del brazo
      // Furia: bajo la mitad de la vida
      FURIA_EN: 0.5,            // 0.5 = al bajar del 50% de la vida
      FURIA_BRAZO_ALCANCE: 240, // el brazo llega más lejos...
      FURIA_BRAZO_ESPERA_MS: 1500, // ...y lo lanza más seguido
      FURIA_TINTE: 0xff8a80     // se ve rojizo
    }
  },

  // --- Enemigos con dibujo nuevo (SPRITE: 'nuevo_...', src/sprites_nuevos.js) ---
  // El choque sigue usando el RADIO de cada enemigo, no el tamaño del dibujo.
  ENEMIGOS_SPRITE_NUEVO: {
    ESCALA_32: 2,               // dibujos de 32x32 a escala 2 (64 px, igual que los perros jugables)
    ESCALA_48: 1.5,             // dibujos de 48x48 a escala 1.5 (72 px)
    DANO_ANIM_MS: 200,          // cuánto se ve la animación de daño después de un golpe
    MUERTE_MAX_MS: 1500         // por si la animación de muerte no termina: suelta el hueso igual a este tiempo
  },

  // --- Aparición de enemigos ---
  ENEMIGOS_MAXIMOS: 150,        // límite de enemigos a la vez (para que no se ponga lento)
  APARICION_INICIAL_MS: 2000,   // al empezar, aparece 1 enemigo (o 1 manada) cada 2 segundos
  APARICION_MINIMA_MS: 300,     // lo más rápido que pueden llegar a aparecer
  APARICION_ACELERA_MS: 15,     // cada segundo sobrevivido, aparecen esta cantidad de ms antes

  // --- Huesos (experiencia) ---
  HUESO_XP: 1,                  // experiencia que da cada hueso
  HUESO_TAMANO: 8,              // tamaño del cuadradito amarillo
  IMAN_RADIO: 70,               // desde qué distancia los huesos vuelan hacia el perro
  IMAN_VELOCIDAD: 400,          // qué tan rápido vuelan los huesos hacia el perro

  // --- Niveles ---
  XP_NIVEL_INICIAL: 4,          // huesos que pide el primer nivel
  XP_NIVEL_AUMENTO: 3,          // cuántos huesos más pide cada nivel que el anterior

  // --- Instintos (mejoras al subir de nivel) ---
  INSTINTO_NIVEL_MAX: 5,        // nivel máximo de cada instinto

  // "Mordida rápida": cada nivel muerde esta cantidad de ms antes
  MORDIDA_RAPIDA_MS: 120,

  // "Colmillos": daño extra por mordida en cada nivel
  COLMILLOS_DANO: 5,

  // "Patas ligeras": velocidad extra en cada nivel
  PATAS_VELOCIDAD: 25,

  // "Pellejo duro": vida máxima extra y curación en cada nivel
  PELLEJO_VIDA: 20,
  PELLEJO_CURA: 20,

  // "Olfato": alcance extra del imán de huesos en cada nivel
  OLFATO_IMAN: 40,

  // "Ladrido": ataque en círculo alrededor del perro que daña y empuja
  LADRIDO_CADA_MS: 4000,        // cada cuánto ladra en el nivel 1
  LADRIDO_CADA_MENOS_MS: 400,   // cada nivel ladra esta cantidad de ms antes
  LADRIDO_RADIO: 120,           // tamaño del círculo en el nivel 1
  LADRIDO_RADIO_EXTRA: 20,      // círculo más grande en cada nivel
  LADRIDO_DANO: 8,              // daño en el nivel 1
  LADRIDO_DANO_EXTRA: 4,        // daño extra en cada nivel
  LADRIDO_EMPUJE: 350,          // qué tan fuerte empuja a los enemigos
  LADRIDO_EMPUJE_MS: 250,       // cuánto dura el empujón

  // --- v0.24: mejoras de stats (salen como cartas, hasta Nv 5) ---
  // (Velocidad = "Patas ligeras" e imán = "Olfato" ya existían, aquí arriba)
  MEJORAS: {
    ENFRIAMIENTO: 0.06,         // "Lomo ágil": cada nivel, los ataques (todos menos la mordida) esperan 6% menos
    REGENERACION: 0.25,         // "Lengüetazo": cada nivel, te curas esta vida por segundo (Nv 5 = 1,25/s)
    ARMADURA: 0.04,             // "Pelaje grueso": cada nivel, 4% menos daño recibido (Nv 5 = 20%)
    SUERTE: 0.2                 // "Pata de conejo": cada nivel, las rarezas raro, épico y legendario
                                // salen 20% más seguido (Nv 5 = el doble)
  },

  // ---------------------------------------------------------------
  //  ATAQUES: ataques secundarios nuevos y evoluciones de ataque.
  //  Los textos y el código están en src/ataques.js.
  //  Todo se ve en la pausa, pestaña Stats ("Ataques").
  //
  //  Rasguño y Escarbar son instintos (salen como cartas, hasta Nv 5).
  //  Cada número "_EXTRA" o "_MENOS" se suma (o resta) en cada nivel
  //  después del 1.
  // ---------------------------------------------------------------
  ATAQUES: {
    // "Rasguño": zarpazo en abanico hacia el enemigo más cercano
    RASGUNO: {
      CADA_MS: 1800,            // cada cuánto rasguña en el nivel 1
      CADA_MENOS_MS: 150,       // cada nivel rasguña esta cantidad de ms antes
      DANO: 6,                  // daño en el nivel 1...
      DANO_EXTRA: 3,            // ...y daño extra en cada nivel
      ALCANCE: 105,             // qué tan lejos llega el zarpazo (px)
      ALCANCE_EXTRA: 10,
      ANGULO: 90,               // qué tan abierto es el abanico (grados)
      ANGULO_EXTRA: 15
    },

    // "Escarbar": lanza terrones que dañan y frenan a los enemigos
    ESCARBAR: {
      CADA_MS: 2800,            // cada cuánto escarba en el nivel 1
      CADA_MENOS_MS: 250,
      TERRONES: 1,              // terrones por vez en el nivel 1...
      TERRON_CADA_NIVELES: 2,   // ...y 1 terrón más cada 2 niveles (Nv 3 = 2, Nv 5 = 3)
      DANO: 5,                  // daño de cada terrón en el nivel 1...
      DANO_EXTRA: 3,            // ...y daño extra en cada nivel
      VELOCIDAD: 450,           // qué tan rápido vuela el terrón
      ALCANCE: 380,             // a qué distancia busca enemigos
      RADIO: 30,                // tamaño de la zona donde cae (daña y frena a todos los que estén ahí)
      LENTITUD: 0.5,            // cuánto frena (0.5 = los enemigos van a la mitad de velocidad)
      FRENO_MS: 1500,           // cuánto dura el freno en el nivel 1...
      FRENO_EXTRA_MS: 250       // ...y cuánto más en cada nivel
    },

    // ---- v0.24: ataques nuevos (código en src/ataques_nuevos.js) ----

    // Espacios de ataque: cuántos ataques distintos (instintos de ataque, sin contar la
    // mordida) puedes tener a la vez. Con los espacios llenos solo salen cartas para
    // subir los que ya tienes (y las mejoras de stats). 0 = sin límite
    ESPACIOS_MAX: 6,

    // "Patada trasera": golpe corto hacia atrás del perro, con empuje
    PATADA: {
      CADA_MS: 1600,            // cada cuánto patea (si hay alguien atrás o pegado)
      DANO: 9,                  // daño en el nivel 1...
      DANO_EXTRA: 4,            // ...y daño extra en cada nivel
      EMPUJE: 380,              // qué tan fuerte empuja en el nivel 1...
      EMPUJE_EXTRA: 70,         // ...y cuánto más en cada nivel
      EMPUJE_MS: 260,           // cuánto dura el empujón
      ALCANCE: 75,              // qué tan lejos llega la patada (px desde el borde del perro)
      ANGULO: 110               // qué tan abierto es el golpe hacia atrás (grados)
    },

    // "Tirar caca": lanza cacas en arco al enemigo más cercano; al caer deja una mancha
    // que daña y frena (con la misma LENTITUD que Escarbar)
    CACA: {
      CADA_MS: 3200,            // cada cuánto tira
      CACAS: 1,                 // cacas por vez en el nivel 1...
      CACA_CADA_NIVELES: 2,     // ...y 1 caca más cada 2 niveles (Nv 3 = 2, Nv 5 = 3)
      DANO_GOLPE: 8,            // daño al caer en el nivel 1...
      DANO_GOLPE_EXTRA: 3,      // ...y daño extra en cada nivel
      DANO_MANCHA: 3,           // daño de la mancha (cada TICK_MS) en el nivel 1...
      DANO_MANCHA_EXTRA: 1.5,   // ...y daño extra en cada nivel
      TICK_MS: 500,             // cada cuánto daña la mancha a los que la pisan
      FRENO_MS: 2000,           // los que pisan la mancha quedan frenados este rato
      MANCHA_MS: 3000,          // cuánto dura la mancha en el suelo en el nivel 1...
      MANCHA_EXTRA_MS: 600,     // ...y cuánto más en cada nivel
      RADIO: 38,                // tamaño de la mancha (px)
      ALCANCE: 360,             // a qué distancia busca enemigos
      VUELO_MS: 650,            // cuánto demora en caer
      ALTURA: 70                // qué tan alto sube el arco (px)
    },

    // "Meada": deja charcos detrás del perro mientras camina; dañan a los que los pisan
    MEADA: {
      CHARCO_CADA_PX: 55,       // deja un charco cada vez que camina esta distancia
      DANO: 3,                  // daño de cada charco (cada TICK_MS) en el nivel 1...
      DANO_EXTRA: 1.5,          // ...y daño extra en cada nivel
      TICK_MS: 500,             // cada cuánto daña el charco a los que lo pisan
      RADIO: 24,                // tamaño del charco en el nivel 1...
      RADIO_EXTRA: 4,           // ...y cuánto más grande en cada nivel
      DURA_MS: 2200,            // cuánto dura cada charco en el nivel 1...
      DURA_EXTRA_MS: 400,       // ...y cuánto más en cada nivel
      MAX_CHARCOS: 40           // como mucho estos charcos a la vez (para que no se ponga lento)
    },

    // "Ladrido fuerte": distinto del Ladrido (que empuja). Es una onda que daña y
    // ATURDE (deja quietos) a todos los del círculo, sin empujarlos
    LADRIDO_FUERTE: {
      CADA_MS: 5000,            // cada cuánto ladra en el nivel 1...
      CADA_MENOS_MS: 500,       // ...y cuánto antes en cada nivel (Nv 5 = cada 3 s)
      RADIO: 140,               // tamaño del círculo en el nivel 1...
      RADIO_EXTRA: 20,          // ...y cuánto más grande en cada nivel
      DANO: 10,                 // daño en el nivel 1...
      DANO_EXTRA: 5,            // ...y daño extra en cada nivel
      ATURDE_MS: 500            // cuánto quedan aturdidos (0,5 s; el jefe no se aturde, pero recibe el daño)
    },

    // "Hedor": aura de olor siempre activa que daña a los que están dentro
    HEDOR: {
      TICK_MS: 500,             // cada cuánto daña
      RADIO: 70,                // tamaño del aura en el nivel 1...
      RADIO_MULT: 1.15,         // ...y en cada nivel se multiplica por esto (+15%: Nv 5 ≈ 122 px)
      DANO: 2.5,                // daño en el nivel 1 (cada TICK_MS)...
      DANO_MULT: 1.10,          // ...y en cada nivel se multiplica por esto (+10%)
      OPACIDAD: 0.28,           // qué tan visible es la nube (0 = invisible, 1 = tapa todo)
      MOSCAS: 3,                // moscas que vuelan en el nivel 1...
      MOSCAS_EXTRA: 1           // ...y cuántas más en cada nivel
    },

    // EVOLUCIONES: cuando el INSTINTO está en su nivel máximo y tienes el
    // OBJETO en OBJETO_NIVEL (o más), al subir de nivel aparece una carta
    // dorada "EVOLUCIÓN" que transforma el ataque de esa RAZA.
    //  RAZA: id de RAZAS   INSTINTO: id de src/instintos.js   OBJETO: id de OBJETOS
    // Los "DANO" que dicen "× mordida" se multiplican por tu daño de mordida.
    EVOLUCIONES: {
      // Quiltro: "Mordida callejera": la mordida rebota a otros enemigos
      rebote: {
        RAZA: 'quiltro', INSTINTO: 'colmillos', OBJETO: 'caracu', OBJETO_NIVEL: 1,
        REBOTES: 3,             // a cuántos enemigos más salta
        DISTANCIA: 170,         // qué tan lejos puede saltar (px)
        DANO: 0.75              // cada salto hace esta parte del daño del anterior (0.75 = 75%)
      },
      // Pitbull: "Agarre de pitbull": la Mandíbula de hierro sujeta y sacude;
      // al soltarlo, golpe en área
      sacudida: {
        RAZA: 'pitbull', INSTINTO: 'colmillos', OBJETO: 'collar', OBJETO_NIVEL: 1,
        AGARRE_MS: 1200,        // cuánto rato lo tiene sujeto
        SACUDIDA_CADA_MS: 300,  // cada cuánto lo sacude...
        SACUDIDA_DANO: 0.4,     // ...con este daño (× mordida)
        EXPLOSION_RADIO: 110,   // tamaño del golpe en área al soltarlo
        EXPLOSION_DANO: 1.5,    // daño del golpe en área (× mordida)
        EXPLOSION_EMPUJE: 400,  // qué tan fuerte empuja
        ESPERA_MS: 1500         // tiempo mínimo entre un agarre y el siguiente
      },
      // Galgo: "Embestida de galgo": el sprint daña y aparta todo a su paso
      embestida: {
        RAZA: 'galgo', INSTINTO: 'mordidaRapida', OBJETO: 'pelota', OBJETO_NIVEL: 1,
        DANO: 2,                // daño a cada enemigo que atraviesa (× mordida)
        ANCHO: 30,              // qué tan ancho es el golpe (px a cada lado, además del cuerpo)
        EMPUJE: 380,            // qué tan fuerte los tira hacia el lado
        DURACION_EXTRA_MS: 120  // el sprint dura esto más
      },
      // Beagle: "Aullido rastreador": el ladrido marca a los enemigos
      marca: {
        RAZA: 'beagle', INSTINTO: 'ladrido', OBJETO: 'placa', OBJETO_NIVEL: 1,
        MARCA_MS: 4000,         // cuánto dura la marca (mira roja)
        DANO_EXTRA: 0.5,        // los marcados reciben 50% más daño de todo
        RADIO_EXTRA: 30         // el ladrido llega más lejos
      }
    }
  },

  // ---------------------------------------------------------------
  //  EL CURAO AL VOLANTE (src/ataques.js): un auto cruza la plaza a toda
  //  velocidad. Antes avisa: borde rojo, bocina, texto y flecha.
  //  Atropella también a los enemigos (¡úsalo a tu favor!).
  //  Tecla de prueba: V
  // ---------------------------------------------------------------
  CURAO: {
    ACTIVO: true,               // false = nunca aparece
    // Qué tan seguido viene en cada fase de la noche (mismo orden que NOCHE.FASES):
    // 0 = no viene, 1 = normal, 2 = el doble de seguido
    // (también se multiplica por DIFICULTAD.EVENTOS del mapa y por MULTIPLICADOR_GLOBAL)
    FRECUENCIA_POR_FASE: [0.6, 1, 1.5, 2], // antes [0, 1, 1.5, 2]: ahora también puede venir en el Anochecer (desde DESDE_SEGUNDOS)
    DESDE_SEGUNDOS: 90,         // nunca viene antes de este segundo (nuevo en v0.19)
    ESPERA_MIN_MS: 20000,       // con frecuencia 1, entre un auto y otro pasan entre 20 s... (antes 40000; v0.19: el doble de seguido)
    ESPERA_MAX_MS: 35000,       // ...y 35 s (al azar). Se divide por la frecuencia (antes 70000)
    // Cuántos autos vienen juntos en cada fase, desde lados distintos: [mínimo, máximo]
    AUTOS_POR_FASE: [[1, 1], [1, 1], [1, 2], [2, 3]], // nuevo en v0.19 (antes siempre 1)
    DESVIO_EXTRA_MAX: 260,      // los autos de más pasan hasta esta distancia del perro (te cierran el paso)
    SEPARACION_AUTOS_MS: 350,   // cuando vienen varios, cada uno sale este rato después del anterior
    AVISO_MS: 2000,             // cuánto antes avisa (igual que antes)
    VELOCIDAD: 1000,            // qué tan rápido va (el Galgo corre 290)
    INCLINACION_GRADOS: 15,     // no entra siempre derecho: se tuerce hasta esto
    DESVIO_MAX: 80,             // pasa a esta distancia (al azar) del lugar donde estabas en el aviso
    ZIGZAG_PROBABILIDAD: 0.5,   // probabilidad de que vaya zigzagueando
    ZIGZAG_AMPLITUD: 45,        // cuánto se va hacia los lados al zigzaguear (px)
    ZIGZAG_CADA_MS: 600,        // cuánto demora cada vaivén
    DANO: 45,                   // daño si te pega (antes 35; v0.19: +30%). Se multiplica por MULTIPLICADOR_GLOBAL
    EMPUJE: 750,                // qué tan fuerte te empuja...
    EMPUJE_MS: 280,             // ...y cuánto dura el empujón
    INVULNERABLE_MS: 1000,      // tiempo sin recibir daño después del atropello
    DANO_ENEMIGOS: 99999,       // daño a los enemigos que atropella (99999 = los mata, también a los élites)
    DANO_JEFE: 200,             // daño al Jefe de la Plaza (a él no lo mata)
    GALGO_MARGEN: 8,            // el Galgo es más difícil de atropellar: su zona de choque es 8 px más chica
    GALGO_SPRINT_LISTO: true,   // true = al sonar la bocina, el sprint del Galgo queda listo para esquivar
    BOCINA_VOLUMEN: 0.08        // volumen de la bocina (0 = sin sonido)
  },

  // ---------------------------------------------------------------
  //  LA JAURÍA (nuevo en v0.19, src/ataques.js): una estampida de perros
  //  cruza la pantalla en fila por un carril. Antes avisa: carril amarillo,
  //  texto y flecha. Si te pilla hace mucho daño; para esquivarla hay que
  //  salirse del carril. No daña a los otros enemigos.
  //  Tecla de prueba: E (estampida)
  // ---------------------------------------------------------------
  JAURIA: {
    ACTIVO: true,               // false = nunca aparece
    DESDE_SEGUNDOS: 120,        // nunca viene antes de este segundo
    // Qué tan seguido viene en cada fase (como el curao). Se multiplica por
    // DIFICULTAD.EVENTOS del mapa y por MULTIPLICADOR_GLOBAL
    FRECUENCIA_POR_FASE: [0.7, 1, 1.4, 1.8],
    ESPERA_MIN_MS: 30000,       // con frecuencia 1, entre una jauría y otra pasan entre 30 s...
    ESPERA_MAX_MS: 50000,       // ...y 50 s (al azar)
    AVISO_MS: 1800,             // cuánto antes avisa
    PERROS_POR_FASE: [7, 9, 11, 14], // cuántos perros corren en cada carril
    CARRILES_POR_FASE: [1, 1, 2, 2], // cuántos carriles a la vez (desde lados distintos)
    ANCHO_CARRIL: 120,          // ancho del carril por donde corren (px)
    DESVIO_MAX: 60,             // el carril pasa a esta distancia (al azar) de donde estabas en el aviso
    DESVIO_EXTRA_MAX: 240,      // los carriles extra pasan hasta esta distancia
    VELOCIDAD: 620,             // qué tan rápido corren
    SEPARACION: 46,             // distancia entre un perro y el siguiente en la fila
    DANO: 30,                   // daño si te pillan (una sola vez por jauría). Se multiplica por MULTIPLICADOR_GLOBAL
    EMPUJE: 520,                // qué tan fuerte te empujan...
    EMPUJE_MS: 220,             // ...y cuánto dura el empujón
    INVULNERABLE_MS: 900,       // tiempo sin recibir daño después
    ESPERA_TRAS_CURAO_MS: 4000  // si hay un curao en camino, la jauría espera este rato (para no venir encima)
  },

  // ---------------------------------------------------------------
  //  EL TRIPA SECA (nuevo en v0.33, src/tripaseca.js): mini jefe que llega
  //  una vez por noche como evento (como el curao y la jauría), con aviso.
  //  Sus números de pelea están en ENEMIGOS.tripaseca.
  //  Tecla de prueba: T (junto con un enemigo de cada tipo)
  // ---------------------------------------------------------------
  TRIPA_SECA: {
    ACTIVO: true,               // false = nunca aparece
    DESDE_SEGUNDOS: 300,        // llega cerca de los 5:00 de partida (el reloj marca 02:00)...
    VARIACION_SEGUNDOS: 20,     // ...entre 5:00 y 5:20, al azar
    VECES_POR_NOCHE: 1,         // cuántas veces llega por noche
    AVISO_MS: 2500,             // cuánto se ve el aviso antes de que aparezca
    MAPAS: ['plaza', 'terminal', 'feria'] // todos los mapas (si se agrega uno nuevo, súmalo aquí)
  },

  // ---------------------------------------------------------------
  //  OBJETOS
  //  Caen a veces de los enemigos (además de los huesos). Pasa encima
  //  para recogerlos. Los nombres, frases y dibujos están en src/objetos.js
  // ---------------------------------------------------------------
  OBJETO_PROBABILIDAD: 0.021,   // probabilidad de que un enemigo suelte objeto (0.021 = 2,1 de cada 100)
                                // (antes 0.03; v0.19: -30%)
  OBJETO_NIVEL_MAX: 3,          // nivel máximo de cada objeto
  INVENTARIO_MAX: 6,            // cuántos objetos distintos puedes llevar
  OBJETO_RECOGER: 22,           // qué tan cerca tienes que pasar para recogerlo (se suma al RADIO del perro)

  // Rarezas: PESO = qué tan seguido sale comparado con las demás
  //          (70 de 100 veces común, 22 raro, 7 épico, 1 legendario)
  //          SUBE = cuántos niveles sube el objeto ('max' = directo al máximo)
  //          CURA_TODO = true para que además cure toda la vida
  RAREZAS: {
    comun:      { PESO: 70, SUBE: 1 },
    raro:       { PESO: 22, SUBE: 2 },
    epico:      { PESO: 7,  SUBE: 'max' },
    legendario: { PESO: 1,  SUBE: 'max', CURA_TODO: true }
  },

  // Qué hace cada objeto POR CADA NIVEL (nivel 3 = 3 veces esto)
  OBJETOS: {
    collar:  { MENOS_DANO: 0.1 },             // Collar viejo: 10% menos daño recibido por nivel
    pelota:  { VELOCIDAD: 20 },               // Pelota mordida: velocidad extra por nivel
    caracu:  { CURA: 1, CADA_MS: 2500 },      // Hueso de caracú: vida que recupera por nivel, cada este tiempo
    placa:   { XP_EXTRA: 0.25 },              // Placa: 25% más experiencia por hueso por nivel
    frazada: { VIDA: 20 }                     // Frazada: vida máxima extra por nivel (y te cura lo mismo)
  },

  // ---------------------------------------------------------------
  //  FUSIONES (instinto en nivel 5 + su objeto en nivel 3)
  //  Qué combinación desbloquea cada una está en src/objetos.js
  // ---------------------------------------------------------------
  FUSIONES: {
    // Frenesí (Mordida rápida + Collar viejo)
    frenesi: {
      MORDIDA_MULTIPLICADOR: 0.5, // el tiempo entre mordidas se multiplica por esto (0.5 = el doble de rápido)
      OBJETIVOS: 2                // a cuántos enemigos muerde a la vez
    },
    // Aullido (Ladrido + Placa de identificación)
    aullido: {
      RADIO_EXTRA: 80,            // círculo del ladrido más grande
      HUIR_MS: 2000               // cuánto rato huyen los enemigos alcanzados
    },
    // Estampida (Patas ligeras + Pelota mordida)
    estampida: {
      HUELLA_CADA_MS: 90,         // cada cuánto deja una huella mientras corre
      HUELLA_DURA_MS: 1500,       // cuánto dura cada huella en el suelo
      HUELLA_RADIO: 22,           // tamaño de la zona que daña de cada huella
      DANO: 6,                    // daño que hacen las huellas...
      GOLPE_CADA_MS: 350          // ...cada este tiempo, a los enemigos que las pisan
    },
    // Cuero de calle (Pellejo duro + Frazada)
    cuero: {
      MULTIPLICADOR: 0.5,         // daño recibido mientras está activo (0.5 = la mitad)
      DURACION_MS: 3000           // cuánto dura después de cada golpe
    }
  },

  // ---------------------------------------------------------------
  //  ENEMIGO ÉLITE: versión grande de un enemigo, con borde dorado
  // ---------------------------------------------------------------
  ELITE_CADA_SEGUNDOS: 60,      // cada cuánto aparece uno (60 = cada minuto)
  ELITE_TAMANO: 1.7,            // cuánto más grande es (dibujo y choque)
  ELITE_VIDA: 10,               // su vida es la del enemigo normal por este número
  ELITE_HUESOS: 3,              // suelta los huesos del enemigo normal por este número
  ELITE_RAREZA_MINIMA: 'raro',  // siempre suelta un objeto de esta rareza o mejor

  // ---------------------------------------------------------------
  //  SINERGIAS: bonus extra por tener dos cosas juntas.
  //  Qué cosas pide cada una (y sus nombres) está en src/sinergias.js
  //  Cada número es el bonus: 0.1 = 10% más, 0.2 = 20% más.
  //  Bonus que existen: VELOCIDAD, DANO (de mordida), REGENERACION
  //  (la regeneración es la curación con el tiempo: el poder Calle del
  //  Quiltro y el Hueso de caracú; la comida y la pileta no cambian)
  // ---------------------------------------------------------------
  SINERGIA_NIVEL_MINIMO: 1,     // nivel que necesita cada cosa para que cuente (1 = basta con tenerla)
  SINERGIAS: {
    // Callejero veterano (Pellejo duro + Hueso de caracú)
    callejero: { REGENERACION: 0.2 },  // te curas 20% más rápido
    // Cazador (Colmillos + Olfato)
    cazador:   { DANO: 0.1 },          // 10% más daño de mordida
    // Veloz (Patas ligeras + Pelota mordida)
    veloz:     { VELOCIDAD: 0.1 }      // 10% más rápido
  },

  // ---------------------------------------------------------------
  //  ZONAS ESPECIALES: círculos que aparecen un rato en el mapa, con
  //  borde de color y un ícono. Sus nombres, colores, íconos y qué
  //  hacen están en src/zonas.js
  //  Nunca aparecen encima de la pileta ni encima del perro.
  // ---------------------------------------------------------------
  ZONAS_PRIMERA_MS: 30000,      // a qué momento de la partida aparece la primera (30000 = 0:30)
  ZONAS_CADA_MS: 20000,         // después, cada cuánto aparece una nueva
  ZONAS_MAXIMAS: 3,             // máximo de zonas en el mapa a la vez
  ZONA_DURACION_MS: 25000,      // cuánto dura cada zona antes de desaparecer
  ZONA_PARPADEO_MS: 4000,       // los últimos 4 segundos parpadea para avisar que se va
  ZONA_DISTANCIA_MIN: 250,      // qué tan cerca del perro puede aparecer (desde el centro de la zona)...
  ZONA_DISTANCIA_MAX: 650,      // ...y qué tan lejos
  ZONA_MARGEN: 40,              // espacio libre mínimo entre el borde de la zona y la pileta o el perro

  // Cada zona:
  //  RADIO: tamaño del círculo
  //  PESO: qué tan seguido aparece comparada con las demás (1 = rara)
  ZONAS: {
    // Zona de miedo (morada): el perro no puede atacar (ni morder ni ladrar)
    miedo:   { RADIO: 140, PESO: 3 },
    // Zona peligrosa (roja): el daño que recibe el perro se multiplica por esto
    peligro: { RADIO: 150, PESO: 3, DANO_MULTIPLICADOR: 2 },
    // Barro (café): el perro y los enemigos se mueven más lento (0.4 = 40% más lento)
    barro:   { RADIO: 160, PESO: 3, LENTITUD: 0.4 },
    // Zona segura (verde, rara): no recibe daño, pero tampoco recoge huesos (no gana experiencia)
    segura:  { RADIO: 110, PESO: 1 }
  },

  // ---------------------------------------------------------------
  //  MINI DESAFÍOS: cada cierto tiempo aparece uno con un aviso arriba
  //  y una cuenta regresiva. Si lo cumples ganas una recompensa; si
  //  fallas no pasa nada. Sus nombres y frases están en src/desafios.js
  //  (no aparecen mientras el jefe está vivo ni al amanecer)
  // ---------------------------------------------------------------
  DESAFIO_PRIMERO_MS: 60000,    // a qué momento de la partida llega el primero (60000 = 1:00)
  DESAFIO_CADA_MS: 60000,       // tiempo de descanso entre que termina uno y empieza el siguiente

  // Recompensa al cumplirlo: un objeto (raro o mejor) o mucha experiencia
  DESAFIO_OBJETO_PROBABILIDAD: 0.5, // probabilidad de que sea objeto (0.5 = la mitad de las veces; si no, experiencia)
  DESAFIO_RAREZA_MINIMA: 'raro',    // el objeto es de esta rareza o mejor
  DESAFIO_XP: 40,                   // experiencia que da (40 huesos de golpe)

  // Cada desafío:
  //  PESO: qué tan seguido sale comparado con los demás
  //  TIEMPO_MS: la cuenta regresiva (tiempo para cumplirlo)
  DESAFIOS: {
    // Búsqueda: encontrar cosas perdidas repartidas en el mapa (con flechas en el borde de la pantalla)
    busqueda: {
      PESO: 1,
      TIEMPO_MS: 60000,
      OBJETOS: 3,               // cuántas cosas hay que encontrar
      DISTANCIA_MIN: 500,       // qué tan lejos del perro aparecen...
      DISTANCIA_MAX: 1100,      // ...como máximo
      RECOGER: 30               // qué tan cerca hay que pasar para recogerlas (se suma al RADIO del perro)
    },
    // Aguanta: quedarse dentro de una zona marcada mientras llegan más enemigos
    aguanta: {
      PESO: 1,
      TIEMPO_MS: 50000,         // tiempo total para lograrlo
      DENTRO_MS: 30000,         // tiempo que hay que estar dentro de la zona (se suma solo mientras estás dentro)
      RADIO: 170,               // tamaño de la zona marcada
      DISTANCIA: 320,           // a qué distancia del perro aparece la zona
      APARICION: 0.5            // mientras dura, el tiempo entre enemigos se multiplica por esto (0.5 = el doble de enemigos)
    },
    // Cacería: derrotar muchos enemigos rápido
    caceria: {
      PESO: 1,
      TIEMPO_MS: 45000,
      ENEMIGOS: 30              // cuántos hay que derrotar
    },
    // Sin morder: sobrevivir sin atacar (la mordida y el ladrido se apagan solos)
    sinMorder: {
      PESO: 1,
      TIEMPO_MS: 20000
    }
  },

  // ---------------------------------------------------------------
  //  ULTRA RAROS: la rareza más difícil (brillo arcoíris). No son
  //  objetos del inventario: son COLECCIONABLES que se guardan en el
  //  navegador para siempre y dan un bonus permanente en todas las
  //  partidas, con cualquier raza. Sus nombres, frases y dibujos están
  //  en src/coleccionables.js
  // ---------------------------------------------------------------
  ULTRA_PROBABILIDAD_ENEMIGO: 0.00025, // enemigo normal: 2,5 de cada 10.000 sueltan uno (antes 0.0005; v0.19: la mitad)
  ULTRA_PROBABILIDAD_ELITE: 0.02,     // élite: 2 de cada 100 (antes 0.04; v0.19: la mitad)
  ULTRA_PROBABILIDAD_JEFE: 0.175,     // Jefe de la Plaza: 17,5 de cada 100 (antes 0.35; v0.19: la mitad)
  ULTRA_DESAFIOS: ['aguanta', 'caceria'], // estos desafíos SIEMPRE dan un ultra raro al cumplirlos
                                          // (además de su recompensa normal). Ids de DESAFIOS
  ULTRA_RECOGER: 24,                  // qué tan cerca tienes que pasar para recogerlo (se suma al RADIO del perro)

  // Copias que pide cada nivel del coleccionable (del 1 al 5):
  // 1 copia para el nivel 1, 2 más para el 2, 3 más para el 3, 5 más para el 4 y 8 más para el 5.
  // Si agregas o quitas números, cambia la cantidad de niveles.
  COLECCION_COPIAS: [1, 2, 3, 5, 8],
  COLECCION_GUARDADO: 'lomitoSurvivor_coleccion', // nombre del guardado en el navegador (no lo cambies o se "pierde" el progreso)

  // Qué da cada coleccionable POR CADA NIVEL (nivel 3 = 3 veces esto).
  // 0.1 = 10%
  COLECCIONABLES: {
    // Chalequito reflectante: los enemigos aparecen más lejos (px) y las embestidas
    // (Drogadicto y Jefe) te hacen menos daño
    chalequito: { APARECE_LEJOS: 40, MENOS_DANO_EMBESTIDA: 0.1 },
    // Sweater tejido a mano: vida máxima extra, y recupera 1 de vida cada
    // (CURA_CADA_MS / nivel): nivel 1 = cada 6 s, nivel 5 = cada 1,2 s
    sweater: { VIDA: 10, CURA_CADA_MS: 6000 },
    // Peluche de zombie: compañero que da vueltas alrededor del perro.
    //  DANO: daño por nivel al tocar a un enemigo   GOLPE_CADA_MS: cada cuánto puede golpear al mismo enemigo
    //  ORBITA_RADIO: qué tan lejos del perro gira   VUELTA_MS: cuánto demora una vuelta   RADIO: su tamaño de choque
    peluche: { DANO: 4, GOLPE_CADA_MS: 500, ORBITA_RADIO: 70, VUELTA_MS: 2200, RADIO: 14 },
    // Mantita cuadrillé: la Zona segura cura 1 de vida cada (SEGURA_CURA_CADA_MS / nivel)
    // y la pileta cura más rápido (0.2 = 20% más rápido por nivel)
    mantita: { SEGURA_CURA_CADA_MS: 1500, PILETA_RAPIDEZ: 0.2 },
    // Capa de superhéroe: más velocidad y el poder (Sprint o Mandíbula) se recarga más rápido
    capa: { VELOCIDAD: 0.03, RECARGA: 0.08 },
    // Antifaz: probabilidad de esquivar un golpe (0.03 = 3 de cada 100)
    antifaz: { ESQUIVAR: 0.03 },
    // Collar antipulgas: menos daño de estos enemigos (ids de ENEMIGOS)
    antipulgas: { MENOS_DANO: 0.08, TIPOS: ['manada', 'rival'] },
    // Lentes: más alcance de mordida y del imán de huesos (px)
    lentes: { ALCANCE: 6, IMAN: 15 },
    // Zapatilla perdida: la comida cura esta vida extra
    zapatilla: { COMIDA_CURA: 3 },
    // Pañuelo rojo: probabilidad de mordida crítica (hace el doble de daño)
    panuelo: { CRITICO: 0.04 },
    // Cascabel: más experiencia por hueso
    cascabel: { XP_EXTRA: 0.06 },
    // Gorro de lana: el barro te frena menos y la Perrera te deja atrapado menos rato
    gorro: { MENOS_LENTITUD: 0.15 },

    // --- Solo en la Terminal de buses ---
    // Boleto de micro: el curao al volante te hace menos daño (0.1 = 10% menos por nivel)
    boleto: { MENOS_DANO_CURAO: 0.1 },
    // Jockey del auxiliar: los huesos vuelan más rápido hacia ti (0.1 = 10% más rápido por nivel)
    jockey: { IMAN_RAPIDEZ: 0.1 },

    // --- Solo en la Feria libre ---
    // La yapa: probabilidad de que cada enemigo suelte 1 hueso extra (0.04 = 4 de cada 100 por nivel)
    yapa: { HUESO_EXTRA: 0.04 },
    // Carro de feria: la comida aparece más seguido (0.08 = 8% más seguido por nivel)
    carro: { COMIDA_RAPIDEZ: 0.08 }
  },

  // ---------------------------------------------------------------
  //  LA NOCHE (meta de la partida). El código está en src/noche.js
  //  Ganas si llegas a la HORA_FIN y el Jefe de la Plaza está derrotado.
  // ---------------------------------------------------------------
  NOCHE: {
    DURACION_MINUTOS: 10,       // cuánto dura la noche de verdad (10 = 10 minutos jugando)
    HORA_INICIO: 22,            // hora que marca el reloj al empezar (22 = 22:00)
    HORA_FIN: 6,                // hora del amanecer (6 = 06:00)

    // La oscuridad baja poco a poco al acercarse el amanecer
    ACLARA_DESDE: 0.5,          // desde qué parte de la noche empieza a aclarar (0.5 = desde la mitad)
    OSCURIDAD_AL_FINAL: 0.35,   // qué tan oscuro queda justo antes del amanecer (OSCURIDAD normal es 0.7)

    // Amanecer: cuando ganas, el cielo se aclara y los enemigos huyen
    AMANECER_MS: 5000,          // cuánto dura el amanecer antes de la pantalla de victoria
    AMANECER_LUZ: 0.2,          // cuánta luz anaranjada se ve al amanecer (0 = nada, 1 = todo naranjo)

    // Fases: al llegar cada HORA aparece un aviso grande y la dificultad sube.
    // (las horas se reparten solas en la duración: con 10 minutos, cada 2 horas = 2,5 minutos)
    //  APARICION: el tiempo entre enemigos se multiplica por esto (0.7 = salen más seguido)
    //  VIDA: la vida de los enemigos nuevos se multiplica por esto (1.5 = 50% más vida)
    //  VELOCIDAD: la velocidad de los enemigos nuevos se multiplica por esto
    //  DANO: el daño que hacen los enemigos nuevos se multiplica por esto (nuevo en v0.19)
    //  v0.19: curva más dura. La 1ª fase (0:00 a 2:30) queda igual que antes; al final
    //  de la noche los enemigos hacen +60% de daño y tienen +40% de vida comparado con v0.18.
    //  También salen más seguido en la 2ª mitad de la noche (+40% de enemigos).
    //  Valores anteriores (v0.18): APARICION 1 / 0.85 / 0.7 / 0.6 · VIDA 1 / 1.25 / 1.5 / 1.8 · sin DANO (= 1)
    FASES: [
      { HORA: 22, NOMBRE: 'Anochecer',      APARICION: 1,    VIDA: 1,    VELOCIDAD: 1,    DANO: 1 },
      { HORA: 0,  NOMBRE: 'Medianoche',     APARICION: 0.85, VIDA: 1.41, VELOCIDAD: 1.05, DANO: 1.2 },  // VIDA antes 1.25 (+13%)
      { HORA: 2,  NOMBRE: 'Madrugada',      APARICION: 0.5,  VIDA: 1.9,  VELOCIDAD: 1.1,  DANO: 1.4 },  // APARICION antes 0.7 (÷1.4), VIDA antes 1.5 (+27%)
      { HORA: 4,  NOMBRE: 'Antes del alba', APARICION: 0.43, VIDA: 2.52, VELOCIDAD: 1.15, DANO: 1.6 }   // APARICION antes 0.6 (÷1.4), VIDA antes 1.8 (+40%)
    ]
  },

  // ---------------------------------------------------------------
  //  JEFE FINAL: "El Jefe de la Plaza". Su dibujo y ataques están en src/jefe.js
  // ---------------------------------------------------------------
  JEFE: {
    MINUTO: 9,                  // a qué minuto de la noche aparece
    VIDA: 3000,                 // vida total (la barra grande de arriba)
    RADIO: 42,                  // tamaño de su zona de choque
    TAMANO: 2,                  // cuánto más grande se dibuja que un perro normal
    VELOCIDAD: 90,              // velocidad caminando
    DANO: 20,                   // daño al tocarte
    HUESOS: 40,                 // huesos que suelta al morir
    OBJETO_RAREZA: 'epico',     // suelta un objeto de esta rareza o mejor
    APARICION_MIENTRAS: 1.5,    // mientras está vivo, el tiempo entre enemigos normales se multiplica por esto (1.5 = salen menos)
    ATAQUE_CADA_MS: 4000,       // tiempo caminando entre un ataque y el siguiente

    // Furia: al bajar a esta parte de su vida se pone más rápido
    FURIA_EN: 0.5,              // 0.5 = a la mitad de la vida
    FURIA_VELOCIDAD: 140,       // velocidad caminando en furia
    FURIA_ATAQUE_CADA_MS: 2500, // tiempo entre ataques en furia

    // Ataque 1: embestida en línea recta (antes avisa con una franja roja)
    EMBESTIDA_AVISO_MS: 1000,   // tiempo quieto avisando antes de embestir
    EMBESTIDA_VELOCIDAD: 650,   // velocidad de la embestida
    EMBESTIDA_MS: 700,          // cuánto dura la embestida
    EMBESTIDA_DANO: 30,         // daño si te alcanza embistiendo
    EMBESTIDA_DESCANSO_MS: 900, // tiempo quieto (cansado) después de embestir

    // Ataque 2: aullido que llama a una manada (antes avisa con anillos)
    AULLIDO_AVISO_MS: 1200,     // tiempo quieto avisando antes de aullar
    AULLIDO_MANADA: 6,          // cuántos perritos de manada llegan
    FURIA_AULLIDO_MANADA: 9,    // cuántos llegan en furia
    AULLIDO_DISTANCIA: 180,     // a qué distancia del jefe aparecen

    FURIA_AVISO: 0.7            // en furia, los avisos duran esto (0.7 = 70% del tiempo normal)
  },

  // ---------------------------------------------------------------
  //  HUESITOS: la moneda del juego. Durante la partida se juntan
  //  "huesitos de la partida" (se ven arriba a la izquierda). Al terminar
  //  (muerte o amanecer) se suman al total guardado en el navegador.
  //  El código está en src/huesitos.js
  // ---------------------------------------------------------------
  HUESITOS: {
    POR_MINUTO: 3,              // huesitos por cada minuto entero sobrevivido
    POR_NIVEL: 1,               // huesitos por cada nivel subido (el nivel 1 no cuenta)
    ENEMIGOS_POR_HUESITO: 10,   // 1 huesito por cada 10 enemigos derrotados
    POR_DESAFIO: 5,             // huesitos por cada mini desafío cumplido
    POR_JEFE: 20,               // huesitos por derrotar al Jefe de la Plaza
    BONUS_AMANECER: 25,         // bonus extra si sobrevives la noche (amanece)
    PRUEBA_TECLA_H: 100,        // modo de prueba: cuántos huesitos da la tecla H en la pantalla de inicio
    GUARDADO: 'lomitoSurvivor_huesitos' // nombre del guardado en el navegador (no lo cambies o se "pierden" los huesitos)
  },

  // ---------------------------------------------------------------
  //  ÁRBOL DE HABILIDADES (src/arbol.js y src/scenes/ArbolScene.js)
  //  Mejoras permanentes por raza que se compran con huesitos guardados.
  //  Cada raza tiene 3 ramas con 4 mejoras. Para comprar una mejora hay
  //  que tener la anterior de su rama. Se aplican al EMPEZAR la partida.
  //  Los nombres y textos de cada mejora están en src/arbol.js
  //
  //  Cada mejora es una lista de números; si compras varias mejoras con
  //  el mismo número, se suman. Qué significa cada número:
  //   VIDA: vida máxima extra              VELOCIDAD: 0.05 = 5% más rápido
  //   DANO: 0.1 = 10% más daño de mordida  MORDIDA_RAPIDEZ: 0.1 = muerde 10% más seguido
  //   CRITICO: probabilidad de mordida crítica (doble daño)
  //   MENOS_DANO: 0.08 = 8% menos daño recibido
  //   ESQUIVAR: probabilidad de esquivar un golpe (0.06 = 6 de cada 100)
  //   REGENERACION: 0.25 = la curación con el tiempo es 25% más rápida
  //   IMAN: alcance extra del imán (px)    IMAN_RAPIDEZ: 0.4 = los huesos vuelan 40% más rápido
  //   XP: 0.1 = 10% más experiencia        HUESO_EXTRA: probabilidad de 1 hueso extra por enemigo
  //   HUESITOS: 0.2 = 20% más huesitos al terminar la partida
  //   OBJETO: 0.4 = los objetos caen 40% más seguido
  //   ULTRA: 1 = los ultra raros caen el doble de seguido de enemigos normales
  //   COMIDA: 0.5 = comida 50% más curativa y pileta 50% más rápida
  //   COMIDA_RAPIDEZ: 0.3 = la comida aparece 30% más seguido
  // ---------------------------------------------------------------
  ARBOL: {
    COSTOS: [50, 120, 250, 500],  // huesitos que cuesta cada nivel de la rama (1º, 2º, 3º y 4º)
    // Colmillos afilados (v0.22): mejora GENERAL (sirve para todas las razas), aparte de las ramas.
    // Se compra por niveles; cada nivel suma daño a todo el daño del perro.
    COLMILLOS_COSTOS: [40, 80, 150, 250, 400], // huesitos que cuesta cada nivel (la cantidad de niveles es el largo de la lista)
    COLMILLOS_DANIO_POR_NIVEL: 0.05,           // daño extra por nivel (0.05 = +5%; con 5 niveles, +25%)
    DEVOLUCION: 1,                // "Reiniciar árbol" devuelve esta parte de lo gastado (1 = el 100%)
    GUARDADO: 'lomitoSurvivor_arbol', // nombre del guardado en el navegador (no lo cambies o se "pierde" el árbol)

    // Para las ramas que dependen de los enemigos cercanos (Manada del Beagle)
    GRUPO_RADIO: 160,             // a esta distancia (px) un enemigo cuenta como "cerca"
    GRUPO_MAXIMO: 5,              // máximo de enemigos que cuentan
    // Caza (Galgo): enemigos "rápidos" = velocidad base desde este número, o embistiendo
    CAZA_VELOCIDAD_MINIMA: 110,   // rival (110) y manada (165) cuentan; borracho (65) no

    RAZAS: {
      quiltro: {
        // Calle: mejora el poder "Calle"
        calle: [
          { CALLE_RAPIDEZ: 0.3 },               // Calle cura 30% más rápido
          { HUESO_EXTRA: 0.15 },                // 15% de probabilidad de 1 hueso extra
          { CALLE_CURA: 1 },                    // Calle cura +1 de vida cada vez
          { DUENO_CADA_ENEMIGOS: 12 }           // ESPECIAL "Dueño del barrio": cada 12 enemigos derrotados cae una comida
        ],
        // Suerte: más raros, ultra raros y huesitos
        suerte: [
          { HUESITOS: 0.15 },                   // +15% huesitos al terminar
          { OBJETO: 0.4 },                      // objetos 40% más seguido
          { ULTRA: 1 },                         // ultra raros el doble de seguido (enemigos normales)
          { PATA_CONEJO: 1 }                    // ESPECIAL "Pata de conejo": los élites siempre sueltan un ultra raro
        ],
        // Supervivencia: vida, regeneración, comer y beber
        supervivencia: [
          { VIDA: 15 },
          { COMIDA: 0.5 },                      // comida cura 50% más y la pileta cura 50% más rápido
          { REGENERACION: 0.25, VIDA: 10 },
          { SIETE_VIDAS: 0.4 }                  // ESPECIAL "Siete vidas": 1 vez por partida, al morir vuelves con 40% de vida
        ]
      },
      pitbull: {
        // Mordida: daño
        mordida: [
          { DANO: 0.1 },
          { CRITICO: 0.08 },                    // 8% de mordida crítica (doble daño)
          { MORDIDA_RAPIDEZ: 0.1 },
          { SACUDIDA: 0.4, SACUDIDA_RADIO: 70 } // ESPECIAL "Sacudida": cada mordida daña también a los que están
                                                // cerca del mordido (40% del daño, a 70 px)
        ],
        // Aguante: vida y reducción de daño
        aguante: [
          { VIDA: 20 },
          { MENOS_DANO: 0.08 },
          { CURA_CADA_MS: 3000, VIDA: 10 },     // recupera 1 de vida cada 3 s
          { INAMOVIBLE: 0.5 }                   // ESPECIAL "Inamovible": la Perrera no te atrapa y las embestidas
                                                // te hacen la mitad de daño (0.5)
        ],
        // Furia: mejora "Mandíbula de hierro" y pega más con poca vida
        furia: [
          { MANDIBULA_RECARGA: 0.25 },          // la Mandíbula se carga 25% más rápido
          { MANDIBULA_DANO: 15, MANDIBULA_ATURDIR_MS: 500 },
          { FURIA_DANO: 0.3, FURIA_VIDA: 0.4 }, // +30% de daño con menos del 40% de vida
          { BERSERKER: 0.35 }                   // ESPECIAL "Berserker": con menos del 35% de vida TODAS las mordidas
                                                // son de Mandíbula de hierro
        ]
      },
      galgo: {
        // Sprint: duración y recarga
        sprint: [
          { SPRINT_DURACION_MS: 100 },          // el sprint dura 0,1 s más
          { SPRINT_RECARGA: 0.2 },              // se recarga 20% más rápido
          { SPRINT_VELOCIDAD: 150, SPRINT_RECARGA: 0.1 },
          { RAYO_DANO: 25 }                     // ESPECIAL "Rayo gris": el sprint hace 25 de daño a cada enemigo que atraviesas
        ],
        // Esquiva: velocidad y esquivar
        esquiva: [
          { VELOCIDAD: 0.05 },
          { ESQUIVAR: 0.06 },
          { ESQUIVAR: 0.06, VELOCIDAD: 0.05 },
          { REFLEJOS_MS: 800 }                  // ESPECIAL "Reflejos": al esquivar, el sprint queda listo y
                                                // quedas 0,8 s más sin recibir daño
        ],
        // Caza: daño a enemigos rápidos o embistiendo
        caza: [
          { CAZA_DANO: 0.25 },
          { CAZA_DANO: 0.25 },
          { CAZA_CRITICO: 0.15 },               // 15% de crítico contra enemigos rápidos
          { LEBREL_MULTIPLICADOR: 3, LEBREL_OBJETIVOS: 3 } // ESPECIAL "Lebrel": la primera mordida después de cada sprint
                                                           // hace el triple de daño a hasta 3 enemigos
        ]
      },
      beagle: {
        // Olfato: rango de recolección y Rastreo
        olfato: [
          { IMAN: 30 },
          { IMAN: 30, IMAN_RAPIDEZ: 0.4 },
          { COMIDA_RAPIDEZ: 0.3 },
          { NARIZ: 1 }                          // ESPECIAL "Nariz de sabueso": las flechas del Rastreo también
                                                // señalan comida (verde) y objetos (morado) fuera de la pantalla
        ],
        // Botín: más huesos, experiencia y huesitos
        botin: [
          { XP: 0.1 },
          { HUESO_EXTRA: 0.15 },
          { HUESITOS: 0.2 },
          { TESORO_CADA_MS: 75000 }             // ESPECIAL "Tesoro enterrado": cada 75 s desentierra un objeto raro o mejor
        ],
        // Manada: ayuda contra grupos de enemigos
        manada: [
          { GRUPO_DEFENSA: 0.03 },              // 3% menos daño por cada enemigo cerca (máx GRUPO_MAXIMO)
          { GRUPO_DANO: 0.04 },                 // 4% más daño por cada enemigo cerca
          { GRUPO_DEFENSA: 0.03, GRUPO_DANO: 0.04 },
          { AULLIDO_CADA_MS: 10000, AULLIDO_RADIO: 170, AULLIDO_DANO: 12, AULLIDO_HUIR_MS: 1500 }
                                                // ESPECIAL "Aullido de la manada": cada 10 s aúlla: daña,
                                                // empuja y hace huir a los enemigos cercanos
        ]
      }
    }
  },

  // ---------------------------------------------------------------
  //  RINCÓN DE APUESTAS (src/scenes/ApuestasScene.js)
  //  Aparece al cambiar de fase la noche (solo con los huesitos de la
  //  partida) y al terminar la partida (con el total guardado o con
  //  1 copia de un coleccionable).
  //  PAGO = cuánto te devuelven en total si ganas, contando lo apostado
  //  (apuestas 10 con PAGO 2: recibes 20, o sea ganas 10). Se redondea hacia abajo.
  //  Con coleccionables: si ganas te quedas tu copia y recibes
  //  (PAGO - 1) copias extra redondeado hacia abajo, mínimo 1.
  //
  //  REGLA: la casa siempre gana un poquito. Cada juego tiene valor
  //  esperado NEGATIVO para el jugador (lo que ganas en promedio por cada
  //  huesito apostado; −0,10 = pierdes 10 de cada 100 a la larga).
  //  Si cambias PAGO o probabilidades, revisa que siga siendo negativo.
  // ---------------------------------------------------------------
  APUESTAS: {
    EN_CAMBIO_DE_FASE: true,    // false = el rincón NO aparece al cambiar de fase (útil para probar)
    EN_FIN_DE_PARTIDA: true,    // false = al terminar la partida, M vuelve directo al menú
    MINIMO: 5,                  // apuesta mínima en huesitos
    MAXIMO: 200,                // apuesta máxima en huesitos (nunca más de lo que tienes)
    PASO: 5,                    // cuánto sube o baja la apuesta con las flechas izquierda/derecha

    // Número exacto: eliges del 1 al 6 y se tira 1 dado.
    //  Ganas 1 de cada 6 veces. Valor esperado = (1/6) × 5 − 1 = −0,167 (−16,7%)
    //  Coleccionable: +4 copias. VE = (1/6) × 4 − (5/6) × 1 = −0,167 copias
    EXACTO_PAGO: 5,

    // Contra la máquina: tú y la máquina tiran 2 dados; gana la suma más alta.
    //  EMPATE = gana la máquina. Empatan 146 de 1296 veces (11,3%),
    //  así que ganas 575/1296 = 44,4% de las veces.
    //  Valor esperado = 0,444 × 2 − 1 = −0,113 (−11,3%)
    //  Coleccionable: +1 copia. VE = 0,444 × 1 − 0,556 × 1 = −0,113 copias
    MAQUINA_PAGO: 2,

    // Bajo o alto: "bajo" = 1, 2 o 3; "alto" = 4, 5 o 6. Acertar es 1 de 2...
    //  ...pero "el gato salta a la mesa" GATO_PROBABILIDAD de las veces y pierdes igual.
    //  Ganas (1/2) × (11/12) = 45,8% de las veces.
    //  Valor esperado = 0,458 × 1,8 − 1 = −0,175 (−17,5%)
    //  Coleccionable: +1 copia (mínimo 1). VE = 0,458 × 1 − 0,542 × 1 = −0,083 copias
    BAJO_ALTO_PAGO: 1.8,
    GATO_PROBABILIDAD: 1 / 12,  // 1 de cada 12 tiradas el gato salta y pierdes

    DADO_MS: 900                // cuánto rato rueda el dado antes de mostrar el resultado
  },

  // ---------------------------------------------------------------
  //  BIENVENIDA: la primera pantalla al abrir el juego
  //  (src/scenes/BienvenidaScene.js). Cada vez sale una frase al azar.
  //  Puedes agregar, cambiar o borrar frases (entre comillas y con coma).
  // ---------------------------------------------------------------
  BIENVENIDA: {
    FRASES: [
      "¡Está como pa' perros!",
      'Perro que ladra no muerde... el tuyo sí',
      "Sobrevive la noche, que el día es pa' echarse",
      'Más perdido que perro en misa',
      'Ser quiltro es un estilo de vida',
      'Aquí no hay correa que valga',
      'Más contento que perro con dos colas',
      'Al tiro, que la plaza no se cuida sola',
      'Ladra, corre y no te achunchis',
      'Pulento el lomito, bacán la noche',
      'Ni el gato del almacén me quita la banca',
      'Perro que duerme no come sopaipilla',
      'Ojo al charqui: cada huesito cuenta',
      "La plaza de noche es pa' valientes... y pa' quiltros",
      'Cachai que aquí manda el lomito, ¿cierto?',
      '¡Aperra, lomito, que se viene la noche!'
    ],
    TEXTO_EMPEZAR: 'Toca o presiona cualquier tecla para empezar',
    LADRIDO_CADA_MS: [2200, 3800], // el perro ladra cada este rato (al azar entre los dos números)
    ESPERA_MS: 350                // no acepta toques antes de este rato (para no saltarla sin querer)
  },

  // ---------------------------------------------------------------
  //  PORTADA (v0.20): la escena animada de la pantalla de bienvenida
  //  (src/portada.js y src/portada_perros.js): calle de noche con un chow
  //  chow y un shar pei, en pixel art de 320 x 180 cuadritos.
  // ---------------------------------------------------------------
  PORTADA: {
    ESCALA: 0,                  // cuántas veces se agranda la escena (número entero). 0 = automática: la más grande
                                //   que cabe (en 960 x 540 es 3). Si la pantalla es angosta se recortan los costados,
                                //   nunca los perros ni el título
    FPS: 10,                    // cuadros por segundo de la animación (el ciclo tiene 24 cuadros: 2,4 s a 10 fps)
    ESTRELLA_FUGAZ_CADA_CICLOS: 1, // la estrella fugaz pasa una vez cada este número de ciclos (1 = en todos; 0 = nunca)
    GATO_CADA_CICLOS: 1,        // los ojos del gato se asoman una vez cada este número de ciclos (1 = en todos; 0 = nunca)
    ANIMACION_ACTIVA: true      // false = la portada queda quieta (primer cuadro)
  },

  // ---------------------------------------------------------------
  //  MENÚ DE PAUSA (src/pausa.js). Medidas en px del juego (960 x 540).
  //  En celular, a los márgenes del panel se les suma lo que MOVIL.MARGEN_HUD
  //  tiene de más sobre el de PC (así el panel no toca los bordes ni la muesca).
  // ---------------------------------------------------------------
  PAUSA: {
    MARGEN_X: 30,               // espacio entre el panel y los bordes izquierdo y derecho de la pantalla
    MARGEN_Y: 14,               // espacio entre el panel y los bordes de arriba y abajo
    PESTANA_ANCHO: 140,         // ancho máximo de cada pestaña (se achican si no caben)
    PESTANA_ESPACIO: 6,         // espacio entre una pestaña y la siguiente

    // Pestaña Stats: tarjetas (Perro, Ataques, Árbol de habilidades, Partida)
    STATS: {
      COLUMNAS_ESPACIO: 16,     // espacio entre las dos columnas de tarjetas
      TARJETA_ESPACIO: 10,      // espacio entre una tarjeta y la de abajo
      TARJETA_RELLENO: 10,      // espacio entre el borde de la tarjeta y su texto
      TARJETA_ALFA: 0.35,       // qué tan oscuro es el fondo de la tarjeta (0 = transparente, 1 = negro)
      TITULO_TAMANO: 16,        // tamaño de letra del título de cada tarjeta
      NOMBRE_TAMANO: 14,        // tamaño de letra del nombre y el valor de cada fila
      DETALLE_TAMANO: 12,       // tamaño de letra del desglose (la línea gris de abajo)
      FILA_ESPACIO: 6,          // espacio entre una fila y la siguiente
      ESPACIO_BOTONES: 10,      // espacio libre entre el contenido y los botones de abajo
      SCROLL_RUEDA: 0.6,        // cuánto baja con cada movimiento de la rueda del mouse
      SCROLL_TECLA: 40,         // cuánto baja con cada flecha arriba/abajo
      BARRA_ANCHO: 5            // ancho de la barra de scroll (solo aparece si el contenido no cabe)
    }
  },

  // ---------------------------------------------------------------
  //  MÓVIL: celulares y tablets con pantalla táctil (src/tactil.js)
  //  En PC con teclado y mouse nada de esto se activa.
  //  Los tamaños "reales" son píxeles de la pantalla del celular
  //  (no del juego, que se achica para caber).
  // ---------------------------------------------------------------
  MOVIL: {
    CONTROLES_TACTILES: 'auto', // 'auto' = solo en pantallas táctiles · true = siempre · false = nunca

    // Joystick (mitad izquierda de la pantalla: aparece donde pones el dedo)
    JOYSTICK_RADIO_REAL: 60,    // cuánto hay que mover el dedo para ir a toda velocidad
    JOYSTICK_ZONA_MUERTA: 0.15, // movimientos más chicos que esto (15% del radio) no mueven al perro
    JOYSTICK_ZONA: 0.5,         // qué parte de la pantalla (desde la izquierda) sirve para el joystick (0.5 = la mitad)

    // Botones de la derecha (Sprint y Pausa)
    BOTON_SPRINT_REAL: 84,      // tamaño del botón de Sprint en px reales (mínimo recomendado: 60)
    BOTON_PAUSA_REAL: 62,       // tamaño del botón de Pausa en px reales
    BOTONES_ALFA: 0.45,         // transparencia de los controles (0 = invisibles, 1 = sólidos)

    CARTAS_ESPERA_MS: 450,      // las cartas de nivel no se pueden tocar hasta pasado este rato (evita toques sin querer)
    MARGEN_HUD: 24,             // distancia (px del juego) entre los bordes de la pantalla y los textos/botones del HUD en celular (en PC es 12)
    TEXTO_MINIMO: 12,           // tamaño mínimo de letra en celular (px del juego). Más alto = más legible pero puede encimarse

    // Rendimiento (solo en celular)
    ENEMIGOS_MAXIMOS: 100,      // límite de enemigos a la vez en celular (en PC se usa ENEMIGOS_MAXIMOS de arriba)
    LIMITAR_EFECTOS_DESDE: 45,  // con más enemigos que esto se omiten efectos chicos (dientes, sombras del sprint)
    EFECTOS_UNO_DE_CADA: 3,     // cuando se limitan, solo se muestra 1 de cada 3 dientes de mordida
    OSCURIDAD_CADA_CUADROS: 2   // la oscuridad de la noche se redibuja cada 2 cuadros (1 = siempre, más fluido pero más pesado)
  },

  // ---------------------------------------------------------------
  //  ONLINE: inicio de sesión con Google y ranking (src/online.js,
  //  src/scenes/RankingScene.js). Usa Supabase.
  //  Solo funciona en la versión online (GitHub Pages). Con doble clic
  //  (file://) o sin internet el juego sigue igual, sin ranking.
  //  La base de datos se crea con supabase/migraciones/001_ranking.sql
  // ---------------------------------------------------------------
  ONLINE: {
    ACTIVO: true,               // false = apaga el login y el ranking aunque haya internet

    // Datos del proyecto de Supabase (Project Settings → API).
    // La llave "anon" es pública: está hecha para ir en la página. La seguridad
    // la ponen las reglas (RLS) de la base de datos.
    // ¡NUNCA pongas aquí la llave service_role!
    SUPABASE_URL: 'https://apxeyaveeeixskyashwb.supabase.co',
    SUPABASE_LLAVE_ANON: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGV5YXZlZWVpeHNreWFzaHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU1NzAzMTIsImV4cCI6MjExMTE0NjMxMn0.M8uZe9Y4J9w3VIUHbujrtN3Mt_vAT2cifjtTlxCUI0o',

    // Apodo: se elige la primera vez que entras (letras, números, espacio, _ . -)
    APODO_MIN: 3,
    APODO_MAX: 16,

    RANKING_CANTIDAD: 20,       // cuántos puestos muestra el ranking

    // Puntaje de una partida (se muestra en la pantalla final y va al ranking):
    //   segundos × POR_SEGUNDO + nivel × POR_NIVEL + enemigos × POR_ENEMIGO
    //   + JEFE (si derrotaste al jefe) + AMANECER (si sobreviviste la noche)
    // OJO: la base de datos vuelve a calcular el puntaje con estos mismos números
    // (función calcular_puntaje en supabase/migraciones/001_ranking.sql).
    // Si cambias algo aquí, cámbialo también allá (con una migración nueva).
    PUNTAJE: {
      POR_SEGUNDO: 10,
      POR_NIVEL: 50,
      POR_ENEMIGO: 5,
      JEFE: 2000,
      AMANECER: 3000
    },
    // Máximo de segundos que se envían (la noche dura NOCHE.DURACION_MINUTOS más un
    // margen por si el jefe sigue vivo a las 06:00). Debe ser igual al CHECK de la base de datos.
    SEGUNDOS_MAXIMOS: 1200
  }
};
