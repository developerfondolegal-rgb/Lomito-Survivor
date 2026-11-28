// ===============================================================
//  LA PLAZA RENOVADA - FASE 3: VIDA (lo que se mueve y brilla)
//  (archivo nuevo, script clásico)
//
//  PZ_VIDA_SPRITES: versiones animadas (más cuadros) de algunos objetos de
//  la FASE 2 y dibujos chicos de partículas. Mismo formato { colores, cuadros }.
//  El cuadro 0 de cada objeto es IGUAL al dibujo quieto de la FASE 2.
//  crearTexturasPlazaNueva (FASE 2) ya los usa si este archivo está cargado.
//
//  Solo se anima lo que está en pantalla (más MARGEN): el resto no se toca.
//  Las partículas son pocas y se reciclan (pool fijo).
// ===============================================================

const PZ_VIDA_SPRITES = {
  // 4 cuadros: ondas que se abren y gotas del chorro
  pz_pileta: {
    colores: { a: 0x0d3d4a, b: 0x11596a, c: 0x178093, d: 0x22a7b5, e: 0x313b2e, f: 0x3d4a3a, g: 0x45523f, h: 0x4fd0d2, i: 0x56664f, j: 0x596950, l: 0x6f8364, m: 0x728365, n: 0x8a9a86, o: 0x8ea47e, p: 0x9ff6ef, q: 0xa8f0ea, s: 0xb8c4b0, t: 0xd8fff8, u: 0xdfe8d8 },
    cuadros: [
    [
      '...............................KKKKKKKKKKK...............................',
      '...........................KKKKKKmmmmmmmKKKKKK...........................',
      '........................KKKjjjjjjooolllomjjjjjKKK........................',
      '.....................KKKjjjjllllllllllllolllljjjjKKK.....................',
      '...................KKKjjllllllllllllllllllllllllljjKKK...................',
      '.................KKKjjlloollllllllllallllllllllllllggKKK.................',
      '................KKjjllllooollaaaaaaadaaaaaaalllliiiiiggKK................',
      '...............KKmllllllooaaadddddddddddddddaaaiiiiiiiigKK...............',
      '.............KKmjllllllaaaddcdcdcdddcdcdcdddcdcaaaiiliiiggKK.............',
      '............KKmjlllllaacdddddcdcdcdddcdddddddcdcdcaalliiiggKK............',
      '...........KKmolllllaacdddddcdchhhhhhhhhhhcdcdcdcdcaaliiiifeKK...........',
      '..........KKmooollaadcccdddhhhhhhhhhhhhhhhhhhhdcdddddaaiiiifeKK..........',
      '.........KKjlllooacdccccchhhhhhccdddcdcdcdhhhhhhcdddddcaiiiifeKK.........',
      '........KKjlllloaddddcdhhhhcdcccccdddddddcdcdchhhhdddddcaiiiffeKK........',
      '........KjllllladdddchhhhdcccccccdcdddcdcdcccdcdhhhhddcccaiiiiigK........',
      '.......KmjllllacddddhhhcdddcccccdcdcdddcdcdcdcdcdchhhddcdcaiiiiggK.......',
      '......KKmllloaccccdhhhcdcdccccccpcppcppdpcccccccccchhhcdcccaillljKK......',
      '.....KKmooooaddcdchhhcdcdcdccpdpdcdcdcdcdpdpccccccdchhhcccccailllgKK.....',
      '.....KmooooacdcddhhhcccccdccpccdcdcccccdcdccpccccccddhhhcccccailllgK.....',
      '....KKmooooadcddqhhcccccdppcccdcdddcccccdcccccppccddddhhhcccdaiilljKK....',
      '....KmooooadccchhhcccccpcccccccccdcccccccccccccccpcdcdchhhcdcdaiiiigK....',
      '...KKmoooaaddchhhcdcdccpdcdccccccchhhdhcccccccdccpccdcddhhhdddaafffeKK...',
      '...KjloooaddcdhhcccdcccccdccccdddhhhdddddhdccdcccccccccddhhdddcaffffeK...',
      '...KjlooaddddhhcdcddppccdcctcdhdhhcccccdhdhhdddccccppcdcddhhdddcafffeK...',
      '..KjloooadddchhdcdcdcccccccddddcccccccccccdhhhcdcccccccccdhhddcdaffffeK..',
      '..KjooooaddchhdddddpdcdcccdddcccccccctcccccthhhcccccdpccccdhhddcaffffeK..',
      '..KmoooaddddhhcccdcpcdcccdddccccccppcppcccccchhhcccddpccccchhdcdcafffeK..',
      '.KmmoooadddhhcccdcdddddchddccccppcccctccppcccchhhcdcdddccccchhdddaiifeeK.',
      '.KmooolacddhdcccccpdcdccddccccccccccccccccccccchdccdcdpcccccdhcddaiiifeK.',
      '.KmoooaddddhhccccpdcdcchhccccpccccKKKKKccccpcccchhdcdcdpdcdchhddddaiffeK.',
      '.KmoooadcdchhdccccccccdddcccccbcKooollllKcccccccdhdccdcdcdcdhhcccdafffeK.',
      'KKjoooacdchhdddccpccccddcccpcccKooollllllKcctpcctdhcccdpdddcdhhcdcafffeKK',
      'KKjlooadccdhcdccpcccccddcccpccKoKKllllKKliKccpcccddccccdpdcdchdcccafffeKK',
      'KglllladdchhdddcccdcccddccccccoKssKllKnuKiiccccccdhcccdddcdcchhcdcaffffeK',
      'KglllladccdhcdccpccdchdcccpccKoKsssKKnnnKiiKccpcccdhcccdpdccchhdddaffffeK',
      'KglllladdchhdddcpcdcdhhcdcpccKoKsussnnnuKiiKccpccchdccdcpcccdhhdddaffffeK',
      'KjlllacdcchhccccccccchhtcccccKllKssnnnnnKiiKccccccdhcccdccccchhdddcafffeK',
      'KjllllacdchhccdcpcccchhcdcpccKllKsnnnnnnKiiKccpccchdccdcpcccdhhdddaffffeK',
      'KjlllladcdhhcdcdpdccchhdcdpccKlllKnnnnKiiiiKccptccthcccdpcccchhdddaffffeK',
      'KgllolacddhhdddcdcdcdchhdccccclllKnKiKnKiiicccccchhcccdcdddcdhhdddaffffeK',
      'KKjoolaccdhhddcdpccdcchhcccpccKlliKiiiKiiiKccpccchdccccdpdcdchhdcdaiffeKK',
      'KKjlolacddqhdddddpdcdthhcccpcccKiiiiiiiiiKcctpcccdhcdcdpdddddhhdddaiffeKK',
      '.KjllladdddhhdcdddcdccdhdcccccccKiiiiiiiKcccccccdhdccdcdcdcchhcdddaiffeK.',
      '.KjllladdddhhcdddpdcdccdhccccpccccKKKKKccccpcccchhdcdddpdcdchhddddaffigK.',
      '.KjlilladddhhccdcdpdccccddccccccccccccccccccccchdccdcdpdcdcdhhdddafffigK.',
      '.KjgiiladddhhcccdcdddccchdhccccppcccccccppccdchhhcccdcdcddddhhdddafffegK.',
      '..KgiiladdddhhcccdcpccccchdhccccccppcppccccdchhhcccccpcccddhhddddafffeK..',
      '..KjiilladddhhccccdpdccccchhhcccccdcccccccdchhhcccccdpcccddhhdddaffffeK..',
      '..KjlliiadddchhcccccccccccchdhdccccccccccchhhhctcccdcccccchhcccdaffffeK..',
      '...KjliiaddddhhcccccppccccdcdhhdhhdccccthhhhdcdcdcdppccccchhccddafffeK...',
      '...KjliiiaddddhhcccccccccccdcddhdhdhdddhhhhdcdcccdcdcdccchdccdcaffffeK...',
      '...KKgiiiaadddhhhcccccdpccccdddccchddddcccdddcccdpdddddchhhcddaafffeKK...',
      '....KgiiiladdddhhhcccccpcccccdcccccccccccccdcccccpcdcdchhhcdddaffffeK....',
      '....KKgiiiladdddhhhcccdccppcdcdccccccctcccdddcppdcdcdchhhcdcdaffffeKK....',
      '.....KgiiiiacdccchdhccccccccpdcccccccccccccdpcccccccchhhcdcddaffffeK.....',
      '.....KKgiiiiacccdchhhcccdcdcdpdpdccccccccpdpdccccccchhhcdcdcaffffeKK.....',
      '......KKgiiiiaccccchhhcdcdcdcccdpcppcppcpccdccccccchhhcdcccaffffeKK......',
      '.......KggiiiiacdcddhhhddddcdcdcdcdcccdcdcdcdccccchhhddcdcaffffeeK.......',
      '........KgiiiiiadddddhhhhdddcdcccdcdcccdddccccccdhhhddcccafffffeK........',
      '........KKgiiiiiaddddddhqhhcdcdcdddddcdddddcdchhhhdddddcafffffeKK........',
      '.........KKgiffiiadddddddhhhhhhdcdddcccdcdhhdhhhcdcdcccafffffeKK.........',
      '..........KKgfffiiaadddddddhhhhhhhhhhhhhhhhhhhdcdddcdaafffffeKK..........',
      '...........KKefffiiiaaddddcccdchhhhhhhhhhhcccccddddaaffffffeKK...........',
      '............KKeefffiiaaddcdcdcdcdddddddddcdcccddddaafffffeeKK............',
      '.............KKeefffiiiaaacccccdcdcdcdddcdcccccaaaffffffeeKK.............',
      '...............KKeffiiiiffaaacdcdcdddddddcdcaaaffffffffeKK...............',
      '................KKggiiiffffffaaaaaaadaaaaaaafffffffffeeKK................',
      '.................KKKggffffffffffffffaiiffffffffffffeeKKK.................',
      '...................KKKeeiiiffffffffffiiffffffffffeeKKK...................',
      '.....................KKKgggefffffffffffffffffeeeeKKK.....................',
      '........................KKKeeeegefffffffeeggggKKK........................',
      '...........................KKKKKKeeeeeeeKKKKKK...........................',
      '...............................KKKKKKKKKKK...............................'
    ],
    [
      '...............................KKKKKKKKKKK...............................',
      '...........................KKKKKKmmmmmmmKKKKKK...........................',
      '........................KKKjjjjjjooolllomjjjjjKKK........................',
      '.....................KKKjjjjllllllllllllolllljjjjKKK.....................',
      '...................KKKjjllllllllllllllllllllllllljjKKK...................',
      '.................KKKjjlloollllllllllallllllllllllllggKKK.................',
      '................KKjjllllooollaaaaaaadaaaaaaalllliiiiiggKK................',
      '...............KKmllllllooaaaddhhhhhhhhhhhddaaaiiiiiiiigKK...............',
      '.............KKmjllllllaaadhhhhhhhhhhhhhhhhhhhcaaaiiliiiggKK.............',
      '............KKmjlllllaacdhhhhhhcdcdddcddddhhhhhhdcaalliiiggKK............',
      '...........KKmolllllaahhhhhdcdcccdcdcccdddcdcdhhhhhaaliiiifeKK...........',
      '..........KKmooollaadhhhhddddcccppdppcdppddcdddchhhhdaaiiiifeKK..........',
      '.........KKjlllooachhhhccccdcppccdddcdcdcdppcdcdcdhhhhcaiiiifeKK.........',
      '........KKjlllloadhhhcdcccppdcccccdddddddcdcdppdddddhhhcaiiiffeKK........',
      '........KjllllladhhhcdcppdcccccccdcdddcdcdcccdcdpdcddhhhcaiiiiigK........',
      '.......KmjllllachhhddddcdddcccccdcdcdddcdcdcdcdcdcpcddhhhcaiiiiggK.......',
      '......KKmllloachdcdddppdcdcccccccccdcdcdcccccccccccpcdcdhhcaillljKK......',
      '.....KKmooooadhhdcdpdcdcdcdcccdcdcdcdcdcdcdcccccccdcdpdcchhcailllgKK.....',
      '.....KmooooachhhddpccccccdcccccdcdchhhcdcdcccccccccddpccchdhcailllgK.....',
      '....KKmooooahhhddddcccccdcdccchhhhhhhdhhhhhcccdcccdddddccchhhaiilljKK....',
      '....KmooooadhhcdcpccccccccccdtdhhhccccchhhdhdccccccdcdcppcchhdaiiiigK....',
      '...KKmoooaahhcdcpcdcdcccdchhhdccppdppccppcchhhhcccccdcddddddhhaafffeKK...',
      '...KjloooahhhdcpcccdccccchhhccpcccccccccccpcchhhcccccccddpddhhhaffffeK...',
      '...KjlooadhhdcdpdcdddccchhhccpcccccccccccccpddhhhcccdcdcdpdddhhcafffeK...',
      '..KjloooadhhcccdcdcdccchdhcppcccccccccccccccppchddcccccccddddhhdaffffeK..',
      '..KjooooahhcdcpddddcdchhhcccccccccccccccccccdcdchdhcdcccccpdddhhaffffeK..',
      '..KmoooadhhdcpcccdcdchthppccctcccccccccccccccctpchhhddcccccpcdhhcafffeK..',
      '.KmmoooahhdddcccdcdddhhccccccccccctccccccccccccccchhdddcccccdcdhhaiifeeK.',
      '.KmooolahhddpccccccdhhcpcccccccccccccccccccccccccpchhdccccccpcchhaiiifeK.',
      '.KmoooadhhddpcccccdchhcpccccccccccKKKKKcccccctcccpdhhcdcdcdcpcdhhdaiffeK.',
      '.KmoooadhhcdcdccccchdcccccccccbcKooollllKccccccccccthhcdcdcdccchhdafffeK.',
      'KKjoooahhcccpddccccdhcpccccccccKooollllllKccccccccpchhdddddcpccchhafffeKK',
      'KKjlooahhccpcdccccchdcpcccccccKoKKllllKKliKcccccccpcdhcdcdcdcpcchhafffeKK',
      'KgllllahhcccdddcccdhhcccccccccoKssKllKnuKiicccttcctchhdddcdcccdchhaffffeK',
      'KgllllahhccpcdccccchcpcccccccKoKsssKKnnnKiiKcccccccpchcdcdcccpcdhhaffffeK',
      'KgllllahhccpdddccchhdpccdcdccKoKsussnnnuKiiKcccccccpchhcdcccdpddhhaffffeK',
      'KjlllachhcccccccccdhcccccccccKllKssnnnnnKiiKccccccccchhdcccccdddhhcafffeK',
      'KjllllahhcdpccdcdchdcpdcdccccKllKsnnnnnnKiiKcccccccpcdhcdcccdpddhhaffffeK',
      'KjllllahhdcpcdcdcdchcpcdcdcccKlllKnnnnKiiiiKcccccccpchcdcccccpddhhaffffeK',
      'KgllolahhddddddcdcdhhcdcdccccclllKnKiKnKiiiccccccccchhtcdddcddddhhaffffeK',
      'KKjoolahhddpddcdccchhcpdccccccKlliKiiiKiiiKcccccccpcdhcdcdcdcpcdhhaiffeKK',
      'KKjlolahhdddpddddcdhhcpccccccccKiiiiiiiiiKccccccccpchhddddddpcddhhaiffeKK',
      '.KjllladhhddcdcdddchhcccccccccccKiiiiiiiKccccccccccchhcdcdcccdchhdaiffeK.',
      '.KjllladqhddpcdddddchhcpccccccccccKKKKKccccccccccpdhhddddcdcpcdhqdaffigK.',
      '.KjlillahhddpccdcdcdhhcpcccccccccccccccccccccccccpchhdcdcdcdpddhhafffigK.',
      '.KjgiilahhdcccccdcdddhhccccccccccccccccctcccdcdccchhdcdcdddddddhhafffegK.',
      '..KgiiladhhdcpcccdcdchdhcpcccccctccccccccccdcdcpchdhcdcccddpddhhdafffeK..',
      '..KjiillahhddcpcccdcdchdhcccccccccdcccccccdcdddchhhcdccccdpdddhhaffffeK..',
      '..KjlliiadhhcdccccccccchdhcppccccccccccccccdppchhhcdcccccccdchhdaffffeK..',
      '...KjliiadqhdddpcccccccchhhcdpccccdcccccdcdpdchhhcdddccccpccchhdafffeK...',
      '...KjliiiahhhdcpccccccccchhhcdpccccccccccdpdchhhcdcdcdcccpcchhhaffffeK...',
      '...KKgiiiaahqddddcccccdccchhhhdcppcpcpcppcdhhhhcdddddddcdccchhaafffeKK...',
      '....KgiiiladhhddppcccccccccchhhhdhcccccddhhhhccccdcdcdcppcchhdaffffeK....',
      '....KKgiiilahhhddcccccdcccccdchhhdhdhdhdhdhddcccdcdcdcdddchhhaffffeKK....',
      '.....KgiiiiachhhcccpcccccccccdccccchdhcccccdcccccccccpcdchhhdaffffeK.....',
      '.....KKgiiiiachhdcdpdcccdcdcdcdcdcccccccccdcdcccccccdpdcdhhcaffffeKK.....',
      '......KKgiiiiachhccdcpcdcdcdcccdcccccccccccdcccccccpcdcdhhcaffffeKK......',
      '.......KggiiiiachhhdddpddddcdcdcdcdcccdcdcdcdcccccpdddhhhcaffffeeK.......',
      '........KgiiiiiadhhhddddpdddcdcccdcdcccdddccccccppcddhhhcafffffeK........',
      '........KKgiiiiiadhhqdddddppdcdcdddddcdddddcdppcccddhhhcafffffeKK........',
      '.........KKgiffiiadqhhhdddddcppdcdddcccdcdppcccccdhhhhcafffffeKK.........',
      '..........KKgfffiiaadhqhhddcdcddppdpdpdppcccccdchhhhdaafffffeKK..........',
      '...........KKefffiiiaahhhhhccdcdddcdcdcdcdcccchhhhhaaffffffeKK...........',
      '............KKeefffiiaaddhhhhhhcdddddddddchhhhhhddaafffffeeKK............',
      '.............KKeefffiiiaaachhhhhhhhhhhhhhhhhdhcaaaffffffeeKK.............',
      '...............KKeffiiiiffaaacdhhhhhhhhhhhdcaaaffffffffeKK...............',
      '................KKggiiiffffffaaaaaaadaaaaaaafffffffffeeKK................',
      '.................KKKggffffffffffffffaiiffffffffffffeeKKK.................',
      '...................KKKeeiiiffffffffffiiffffffffffeeKKK...................',
      '.....................KKKgggefffffffffffffffffeeeeKKK.....................',
      '........................KKKeeeegefffffffeeggggKKK........................',
      '...........................KKKKKKeeeeeeeKKKKKK...........................',
      '...............................KKKKKKKKKKK...............................'
    ],
    [
      '...............................KKKKKKKKKKK...............................',
      '...........................KKKKKKmmmmmmmKKKKKK...........................',
      '........................KKKjjjjjjooolllomjjjjjKKK........................',
      '.....................KKKjjjjllllllllllllolllljjjjKKK.....................',
      '...................KKKjjllllllllllllllllllllllllljjKKK...................',
      '.................KKKjjlloollllllllllallllllllllllllggKKK.................',
      '................KKjjllllooollaaaaaaadaaaaaaalllliiiiiggKK................',
      '...............KKmllllllooaaadddddddddddddddaaaiiiiiiiigKK...............',
      '.............KKmjllllllaaaddcdcdcdddcdcdcdddcdcaaaiiliiiggKK.............',
      '............KKmjlllllaacdddddcdcdcdddcdddddddcdcdcaalliiiggKK............',
      '...........KKmolllllaacdddddcdcccdcdcccdddcdcdcdcdcaaliiiifeKK...........',
      '..........KKmooollaadcccdddddcccdcdcdcdddddcdddcdddddaaiiiifeKK..........',
      '.........KKjlllooacdcccccccdcccccdddcdcdcdcdcdcdcdddddcaiiiifeKK.........',
      '........KKjlllloaddddcdcccdcdcccccdddddddcdcdcdddddddddcaiiiffeKK........',
      '........KjllllladdddcdcccdcccccccdcdddcdcdcccdcdcdcdddcccaiiiiigK........',
      '.......KmjllllacdddddddcdddcccccdcdcdddcdcdcdcdcdcdcdddcdcaiiiiggK.......',
      '......KKmllloaccccddddcdcdccccdhphpphpphphhccccccccdcdcdcccaillljKK......',
      '.....KKmooooaddcdcdddcdcdcdchphphhhhdhhhhphphcccccdcdddcccccailllgKK.....',
      '.....KmooooacdcdddcccccccdhhphcdcdcccccdcdchphdccccdddcccccccailllgK.....',
      '....KKmooooadcdddddccccchpphccdcdddcccccdcccchpphcdddddcccccdaiilljKK....',
      '....KmooooadcccdcdcccccphhcccccccdccccccccccccchdpcdcdcccccdcdaiiiigK....',
      '...KKmoooaaddcdcdcdcdchphcdcccccccdcccccccccccdchphcdcddddddddaafffeKK...',
      '...KjloooaddcdcccccdchdhcdcctccccccccctccccccdccchdhcccdddddddcaffffeK...',
      '...KjlooaddddcdcdcddpphcdcccccccccccccccccccddtccchppcdcdddddddcafffeK...',
      '..KjloooadddcccdcdchhhcccccccccccccccccccccccdcdccchhhcccdddddcdaffffeK..',
      '..KjooooaddcdcdddddphcdcccccccccccccccccccccdcdccccchpccccdddddcaffffeK..',
      '..KmoooaddddcccccdhpcdccccccccccccppcppccccccccccccddpdccccdcdcdcafffeK..',
      '.KmmoooadddddcccdchhdddccccccccpphhdhdhdppccccccccdcdhhcccccdcdddaiifeeK.',
      '.KmooolacdddccccchpdcdccccccccchdhdhddddddcccccccccdcdphcccccccddaiiifeK.',
      '.KmoooaddddddccccphcdccccccccpddddKKKKKdddhpccccccdcdchpdcdcccddddaiffeK.',
      '.KmoooadcdcdcdccdhcccccccccccdddKooollllKhddcccccccccdchhdcdcccccdafffeK.',
      'KKjoooacdcccdddchpccctcccccpdddKooollllllKhdhpccccccccdphddcdcccdcafffeKK',
      'KKjlooadcccccdccpdcccccccccpddKoKKllllKKliKhdpccccccccchpdcdccccccafffeKK',
      'KglllladdcccdddchddccccccccdhdoKssKllKnuKiidhdccccccccdhhcdcccdcdcaffffeK',
      'KglllladcccccdccphcdccccccphhKoKsssKKnnnKiiKddpcccccccchpdcccdcdddaffffeK',
      'KglllladdcccdddcphdcdcttdcphhKoKsussnnnuKiiKhdpcccccccdhpcccddddddaffffeK',
      'KjlllacdcccccccchcccccccccchdKllKssnnnnnKiiKddcccccccccdhccccdddddcafffeK',
      'KjllllacdcdcccdcphccccdcdcpddKllKsnnnnnnKiiKhdpcccccccdhpcccddddddaffffeK',
      'KjlllladcdcdcdcdphcccdcdcdpddKlllKnnnnKiiiiKdhpcctccccchpccccdddddaffffeK',
      'KgllolacdddddddchhdcdcdcdccdddlllKnKiKnKiiidhdccccccccdhhddcddddddaffffeK',
      'KKjoolaccdddddcdphcdccctcctpddKlliKiiiKiiiKddpccccctccchpdcdcdcdcdaiffeKK',
      'KKjlolacddddddddhpdcdccccccpdddKiiiiiiiiiKddhpccccccdcdphddddcddddaiffeKK',
      '.KjllladddddcdcdhhcdcccccccccdddKiiiiiiiKdddcccccccccdchhdcccdcdddaiffeK.',
      '.KjllladdddddcdddphcdccccccccpddddKKKKKdhddpccccccdcddhpdcdcdcddddaffigK.',
      '.KjlilladdddcccdchpdcccccccccccddddddhddddcccccccccdcdphcdcdcddddafffigK.',
      '.KjgiiladddcccccdchhdccccccccccppdhhhhhdppccdcdcccccdhhcdddddddddafffegK.',
      '..KgiiladdddcccccdhpccccccccccccccppcppccccdtdcccccccpdccddddddddafffeK..',
      '..KjiilladdddcccccdphcccccccccccccdcccccccdcdddccccchpcccdddddddaffffeK..',
      '..KjlliiadddcdccccchddcctccccccccccccccccccdcdccccchhhcccccdcccdaffffeK..',
      '...KjliiaddddddcccccpphcccdcdcccccdcccccdcdcdcdcdchppcccccccccddafffeK...',
      '...KjliiiaddddccccccchdhcccdcdcccccccccccdcdcdccchhhcdcccccccdcaffffeK...',
      '...KKgiiiaaddddddccccchphcccdddcccccccccccdddccchphddddcdcccddaafffeKK...',
      '....KgiiiladddddcccccccpddcccdcccccccccccccdccchhpcdcdcdcccdddaffffeK....',
      '....KKgiiiladddddcccccdchpphdcdcccccccccccdddhpphcdcdcdddcdcdaffffeKK....',
      '.....KgiiiiacdccccccccccccdhphccccccccccccchphdccccccdcdcdcddaffffeK.....',
      '.....KKgiiiiacccdcdcdcccdcdchphphhhhchhdhphphcccccccdcdcdcdcaffffeKK.....',
      '......KKgiiiiacccccdcccdcdcdcchhphppdpphphhdcccccccdcdcdcccaffffeKK......',
      '.......KggiiiiacdcdddddddddcdcdcdcdcccdcdcdcdcccccdddddcdcaffffeeK.......',
      '........KgiiiiiaddddddddddddcdcccdcdcccdddcccccccccdddcccafffffeK........',
      '........KKgiiiiiaddddddddddcdcdcdddddcdddddcdcccccdddddcafffffeKK........',
      '.........KKgiffiiaddddddddddcccdcdddcccdcdcccccccdcdcccafffffeKK.........',
      '..........KKgfffiiaadddddddcdcdddddddcdddcccccdcdddcdaafffffeKK..........',
      '...........KKefffiiiaaddddcccdcdddcdcdcdcdcccccddddaaffffffeKK...........',
      '............KKeefffiiaaddcdcdcdcdddddddddcdcccddddaafffffeeKK............',
      '.............KKeefffiiiaaacccccdcdcdcdddcdcccccaaaffffffeeKK.............',
      '...............KKeffiiiiffaaacdcdcdddddddcdcaaaffffffffeKK...............',
      '................KKggiiiffffffaaaaaaadaaaaaaafffffffffeeKK................',
      '.................KKKggffffffffffffffaiiffffffffffffeeKKK.................',
      '...................KKKeeiiiffffffffffiiffffffffffeeKKK...................',
      '.....................KKKgggefffffffffffffffffeeeeKKK.....................',
      '........................KKKeeeegefffffffeeggggKKK........................',
      '...........................KKKKKKeeeeeeeKKKKKK...........................',
      '...............................KKKKKKKKKKK...............................'
    ],
    [
      '...............................KKKKKKKKKKK...............................',
      '...........................KKKKKKmmmmmmmKKKKKK...........................',
      '........................KKKjjjjjjooolllomjjjjjKKK........................',
      '.....................KKKjjjjllllllllllllolllljjjjKKK.....................',
      '...................KKKjjllllllllllllllllllllllllljjKKK...................',
      '.................KKKjjlloollllllllllallllllllllllllggKKK.................',
      '................KKjjllllooollaaaaaaadaaaaaaalllliiiiiggKK................',
      '...............KKmllllllooaaadddddddddddddddaaaiiiiiiiigKK...............',
      '.............KKmjllllllaaaddcdcdcdddcdcdcdddcdcaaaiiliiiggKK.............',
      '............KKmjlllllaacdddddcdcdcdddcdddddddcdcdcaalliiiggKK............',
      '...........KKmolllllaacdddddcdcccdcdcccdddcdcdcdcdcaaliiiifeKK...........',
      '..........KKmooollaadcccdddddcccppdppcdppddcdddcdddddaaiiiifeKK..........',
      '.........KKjlllooacdcccccccdcppccdddcdcdcdppcdcdcdddddcaiiiifeKK.........',
      '........KKjlllloaddddcdcccppdchhhhhhhhhhhhhcdppddddddddcaiiiffeKK........',
      '........KjllllladdddcdcppdchhhdhhhhhhhhhhhhhhhcdpdcdddcccaiiiiigK........',
      '.......KmjllllacdddddddcdhhhhhccdcdcdddcdcdhhhhhdcpcdddcdcaiiiiggK.......',
      '......KKmllloaccccdddppdhhhhcccccccdcdcdccccchdhdccpcdcdcccaillljKK......',
      '.....KKmooooaddcdcdpdchhhhdcccdcdcdcdcdcdcdcccchhhhcdpdcccccailllgKK.....',
      '.....KmooooacdcdddpcchdhcdcccccdcdcccccdcdccccccchhhdpcccccccailllgK.....',
      '....KKmooooadcdddddchdhcdcdcccdcdddcccccdcccccdccchhhddcccccdaiilljKK....',
      '....KmooooadcccdcpchddccccccccctcdccccccccccccccccchhhcppccdcdaiiiigK....',
      '...KKmoooaaddcdcpchhhcccdcdcccccppdppccppcccccdccccchhhdddddddaafffeKK...',
      '...KjloooaddcdcpchhhcccccdccccpcccccccccccpccdccccccchhhdpddddcaffffeK...',
      '...KjlooaddddcdpdhhddcccdccccpcccccccccccccpdddcccccdchhdpdddddcafffeK...',
      '..KjloooadddcccdhhcdcccccccppcccchddddtdccccppcdccccccchhdddddcdaffffeK..',
      '..KjooooaddcdcphhhdcdcdcccccccchhdhdddhdhdccdcdcccccdccdhhpddddcaffffeK..',
      '..KmoooaddddcpchhdcdcdccppccchdhhcccccccthdhcccpcccdddccdhcpcdcdcafffeK..',
      '.KmmoooadddddchhhcdddddccccchdhccccccccccchdhcccccdcdddchhhcdcdddaiifeeK.',
      '.KmooolacdddpcdhcccdcdcpcccddhcccccccccccccdddcccpcdcdccchdcpccddaiiifeK.',
      '.KmoooadddddpchdccdcdccpccdddcccccKKKKKccccchdhccpdcdcdcdhhcpcddddaiffeK.',
      '.KmoooadcdcdchhcccccccccccdtccbcKooollllKcccchdccccccdcdcdhhcccccdafffeK.',
      'KKjoooacdcccphhcccccccpccddccccKooollllllKcccchdccpcccddddhhpcccdcafffeKK',
      'KKjlooadcccpchhcccccccpccddcccKoKKllllKKliKcccddccpccccdcdhhcpccccafffeKK',
      'KglllladdcccdhhcccdccccchdccccoKssKllKnuKiiccccdhcccccdddchhccdcdcaffffeK',
      'KglllladcccpchhccccdcpccdhcccKoKsssKKnnnKiiKcccddccpcccdcdhhcpcdddaffffeK',
      'KglllladdccpdhhcccdcdpcchhdccKoKsussnnnuKiiKcccdhccpccdcdchhdpddddaffffeK',
      'KjlllacdccccchhccccccccchhcccKllKssnnnnnKiiKcctddccccccdccdhcdddddcafffeK',
      'KjllllacdcdpchhcdccccpdchhcccKllKsnnnnnnKiiKcccdhccpccdcdchhdpddddaffffeK',
      'KjlllladcdcpchhdcdcccpcdhhcccKlllKnnnnKiiiiKccchdccpcctdcchhcpddddaffffeK',
      'KgllolacdddddhhcdcdcdcdchhcccclllKnKiKnKiiiccccdhcccccdcddhhddddddaffffeK',
      'KKjoolaccddpdhhdcccdccpdchdcccKlliKiiiKiiiKcccdhccpccccdcdhhcpcdcdaiffeKK',
      'KKjlolacddddphhddcdcdcpcchhccccKiiiiiiiiiKcccchhccpcdcddddhhpcddddaiffeKK',
      '.KjllladddddchhdddcdcctcccddccccKiiiiiiiKcctchdccccccdcdcdhhcdcdddaiffeK.',
      '.KjllladddddpchhdddcdccpcchdhcccccKKKKKccccchhhccpdcdddddhhcpcddddaffigK.',
      '.KjlilladdddpchhcdcdcccpcccdddccccccccccccchdhcccpcdcdcdchhdpddddafffigK.',
      '.KjgiiladddccchhhcdddccccccchddccccccccccchhhcdcccccdcdchhhddddddafffegK.',
      '..KgiiladdddcpchhdcdcctccpcccddddcccccccdddhcdcpcccccdcchhdpdddddafffeK..',
      '..KjiilladdddcphhhdcdccccccccccdhhhhhdhdhddcdddcccccdccdhhpdddddaffffeK..',
      '..KjlliiadddcdccdhcccccccccppcccchhhdddhcccdppcccccdccchdccdcccdaffffeK..',
      '...KjliiaddddddpcdhcccccccdcdpccccdcccccdcdpdctcdcdddchdcpccccddafffeK...',
      '...KjliiiaddddcpchddcccccccdcdpccccccccccdpdcdcccdcdchhhcpcccdcaffffeK...',
      '...KKgiiiaaddddddchdhcdcccccdddcppcpcpcpptdddcccddddhhhcdcccddaafffeKK...',
      '....KgiiiladddddppchdhcccccccdcccccccccccccdcccccdchhhcppccdddaffffeK....',
      '....KKgiiiladddddccchhhcccccdcdcccccccccccdddcccdchhhcdddcdcdaffffeKK....',
      '.....KgiiiiacdcccccpchhhcccccdcccccccccccccdccccchdhcpcdcdcddaffffeK.....',
      '.....KKgiiiiacccdcdpdchhhhdcdcdcdcccccccccdcdccdhdhcdpdcdcdcaffffeKK.....',
      '......KKgiiiiacccccdcpcdhhhhcccdcccccccccccdchdhdccpcdcdcccaffffeKK......',
      '.......KggiiiiacdcddddpddhhhhhdcdcdcccdcdcdhhhhdccpddddcdcaffffeeK.......',
      '........KgiiiiiaddddddddpddhhhhhhhhhhhhhhhhhhhccppcdddcccafffffeK........',
      '........KKgiiiiiadddddddddppdchhhhhhhhhhhhhcdppcccdddddcafffffeKK........',
      '.........KKgiffiiaddddddddddcppdcdddcccdcdppcccccdcdcccafffffeKK.........',
      '..........KKgfffiiaadddddddcdcddppdpdpdppcccccdcdddcdaafffffeKK..........',
      '...........KKefffiiiaaddddcccdcdddcdcdcdcdcccccddddaaffffffeKK...........',
      '............KKeefffiiaaddcdcdcdcdddddddddcdcccddddaafffffeeKK............',
      '.............KKeefffiiiaaacccccdcdcdcdddcdcccccaaaffffffeeKK.............',
      '...............KKeffiiiiffaaacdcdcdddddddcdcaaaffffffffeKK...............',
      '................KKggiiiffffffaaaaaaadaaaaaaafffffffffeeKK................',
      '.................KKKggffffffffffffffaiiffffffffffffeeKKK.................',
      '...................KKKeeiiiffffffffffiiffffffffffeeKKK...................',
      '.....................KKKgggefffffffffffffffffeeeeKKK.....................',
      '........................KKKeeeegefffffffeeggggKKK........................',
      '...........................KKKKKKeeeeeeeKKKKKK...........................',
      '...............................KKKKKKKKKKK...............................'
    ]
    ]
  },
  // 4 cuadros: los asientos se mecen
  pz_columpio: {
    colores: { a: 0x2c3e50, b: 0x8a919c, c: 0xc0392b, d: 0xe74c3c },
    cuadros: [
    [
      '.KcK.........................................................KcK.',
      '.KcK.........................................................KcK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KcK...........b.....b.......b.....b.......b.....b...........KcK.',
      '.KcK...........b.....b.....................b.....b...........KcK.',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.....................KKKKKKK...............',
      '...............KKKKKKK.......b.....b.......KaaaaaK...............',
      '...............KaaaaaK.......b.....b.......KKKKKKK...............',
      '...............KKKKKKK.......KKKKKKK.............................',
      '.............................KaaaaaK.............................'
    ],
    [
      '.KcK.........................................................KcK.',
      '.KcK.........................................................KcK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KcK...........b.....b.......b.....b.......b.....b...........KcK.',
      '.KcK.........................b.....b.......b.....b...........KcK.',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......KKKKKKK...............',
      '.............................b.....b.......KaaaaaK...............',
      '...............b.....b.......KKKKKKK.......KKKKKKK...............',
      '...............b.....b.......KaaaaaK.............................',
      '...............KKKKKKK.......KKKKKKK.............................',
      '...............KaaaaaK...........................................'
    ],
    [
      '.KcK.........................................................KcK.',
      '.KcK.........................................................KcK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KcK...........b.....b.......b.....b.......b.....b...........KcK.',
      '.KcK...........b.....b.......b.....b.......b.....b...........KcK.',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.............................',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......KKKKKKK.......b.....b...............',
      '...............b.....b.......KaaaaaK.......b.....b...............',
      '...............KKKKKKK.......KKKKKKK.......b.....b...............',
      '...............KaaaaaK.....................KKKKKKK...............',
      '...............KKKKKKK.....................KaaaaaK...............',
      '...........................................KKKKKKK...............'
    ],
    [
      '.KcK.........................................................KcK.',
      '.KcK.........................................................KcK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddK.',
      '.KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.',
      '.KcK...........b.....b.......b.....b.......b.....b...........KcK.',
      '.KcK...........b.....b.......b.....b.........................KcK.',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............b.....b.......b.....b.......b.....b...............',
      '...............KKKKKKK.......b.....b.......b.....b...............',
      '...............KaaaaaK.......b.....b.............................',
      '...............KKKKKKK.......KKKKKKK.......b.....b...............',
      '.............................KaaaaaK.......b.....b...............',
      '.............................KKKKKKK.......KKKKKKK...............',
      '...........................................KaaaaaK...............'
    ]
    ]
  },
  // 3 cuadros: la copa se mece con el viento
  pz_arbol_g: {
    colores: { a: 0x10301c, b: 0x16261c, c: 0x184626, d: 0x215c2c, e: 0x2d7332, f: 0x41893a, g: 0x64a446, h: 0x9cc85a },
    cuadros: [
    [
      '...........................................',
      '.................bbbbbbbbbb................',
      '...............bbfffffeeeeebb..............',
      '..............bfffgffeeefefffbb............',
      '.............bffhffgfeeeefffeeeb...........',
      '..........bbbfgggggggfeefefffeedb..........',
      '........bbfffgggfgfgfgffefefeedddb.........',
      '.......bffffghhggfgfggggfeeefeedeb.........',
      '......bfffghggggggfffgggfeeeeededdb........',
      '......bfgghggggghgghgggggeeeeeeeedeb.......',
      '.....bfgghghggggggfffgggfeeededeeedeb......',
      '.....bhggghggggggggfgggggeedeeeeeeeeeb.....',
      '....bhggggggggggfffffgggfffedededeeedeb....',
      '....bhhghggggggffffhgfgfffffeeedeeeeeeb....',
      '....bhggggggggghffffffffefefhedddeeededb...',
      '....bhhggggggggghhfffffffheehfedeeeeeddb...',
      '....bhggfgggfgfgghffefefeeeeeedddededddb...',
      '....bggggfgfgfghggfffefeeeeeeedddddddddcb..',
      '.....bfgfffffgggghfeefefeeeeeeddddcddddcb..',
      '....begggfffgghggffefffefeeefddddcccdddcb..',
      '....beeffffgfgggffeeefefeeeeedddcccccdcb...',
      '....befeffgggghffffefffffefedddddcccdcdb...',
      '...beeeeegggggffffefefefffedcdddddcccdcb...',
      '...beeeeefgggfhffefefefeeeeddddddccccccb...',
      '...bdededfffffefeeeeeeeeddddddcdcccccccb...',
      '....bdedeefefefeeeeeeeeedddddddccccccccb...',
      '....bededeefeeeeeeeeeeedddddddccccacacab...',
      '....beeeeefffefffffeheeddddcdcdccccacab....',
      '.....beeeeefehefffeeeeddddccccccccaaaab....',
      '......beeefefefffffeeddddddccccccccaab.....',
      '.......beeeeeedfefddddddddccccccccccb......',
      '........beeeeeeddddddddddddccccccccb.......',
      '........bdddddddddddddcdcdccacacacb........',
      '.........bdddddddddddcccdcdccacacb.........',
      '..........bbcccccddddccccdccacabb..........',
      '............bcdcdcdddcccccccccb............',
      '.............bbdccccccccacccbb.............',
      '...............bbbbbcccbbbbb...............',
      '....................bbb....................',
      '...........................................',
      '...........................................',
      '...........................................',
      '...........................................'
    ],
    [
      '...........................................',
      '..................bbbbbbbbb................',
      '................bbffffeeeeebbb.............',
      '..............bbffgffeeefeffffb............',
      '.............bffehfgfeeeefffeeeb...........',
      '..........bbbfgffggggfeefefffeedb..........',
      '.........bfffgfffgfgfgfgefefeedddb.........',
      '........bfffgggggfgfgggggeeefeedeb.........',
      '.......bffffffggggfffgggffeeeededdb........',
      '......bffghggggghggfhggggfeeeeeeedeb.......',
      '......bfghghggggggfffgggffeededeeedeb......',
      '.....bfggghggggggggfgggggfedeeeeeeeeeb.....',
      '.....bggggggggggfffffgggffffdededeeedeb....',
      '.....bhgghgggggfffffhfgffffffeedeeeeeeeb...',
      '.....bgggggggggghfffffffefeffhdddeeededb...',
      '.....bhgggggggggghhffffffehefhfdeeeeeddb...',
      '.....bggfgggfgfggghfefefeeeeeeeddededdddb..',
      '.....bgggfgfgfgghgfffefeeeeeeefddddddddcb..',
      '.....begfffffgggggheefefeeeeeeedddcddddcb..',
      '.....bfggfffggghgffefffefeeefeeddcccdddcb..',
      '....beeffffgfgggffeeefefeeeeeeddcccccdccb..',
      '....befefeggggghfffefffffefeeddddcccdcdb...',
      '....beeeefggggffffefefefffeecdddddcccdccb..',
      '....beeeeegggffhfefefefefeeddddddcccccccb..',
      '....bededeffffefeeeeeeeeedddddcdccccccccb..',
      '....bdededfefefeeeeeeeeeeddddddccccccccb...',
      '....bedededfeeeeeeeeeeeeedddddccccacacab...',
      '.....beeeeeffefffffeeheedddcdcdccccacacb...',
      '......beeeeeeehfffeeeeedddccccccccaaaab....',
      '......beeefeeefffffeeedddddccccccccaab.....',
      '.......beeeeeedfefeeddddddccccccccccb......',
      '........beeeeeeddddddddddddccccccccb.......',
      '.........bddddddddddddcdcdccacacacb........',
      '..........bddddddddddcccdcdccacacb.........',
      '...........bcccccddddccccdccacaab..........',
      '............bbdcdcdddcccccccccbb...........',
      '..............bbccccccccacccbb.............',
      '................bbbbccccbbbb...............',
      '....................bbbb...................',
      '...........................................',
      '...........................................',
      '...........................................',
      '...........................................'
    ],
    [
      '...........................................',
      '.................bbbbbbbbb.................',
      '...............bbfffffeeeebbb..............',
      '.............bbfffgffeeefefffbb............',
      '............bffhegfgfeeeefffeeeb...........',
      '.........bbbgfhggggggeeefefffeedb..........',
      '........bffffhggfgfgfgffefefeeddb..........',
      '.......bffffhhhggfgfgggffeeefeedeb.........',
      '......bfggghggggggfffgggeeeeeededb.........',
      '.....bgggghggggghghfggggfeeeeeeeedbb.......',
      '.....bggghghggggggfffgggeeeededeeedeb......',
      '....bhhggghggggggggfgggggeedeeeeeeeeeb.....',
      '....bhggggggggggfffffgggfffedededeeedeb....',
      '....bhhggggggggfffhfgfgfffffeeedeeeeeeb....',
      '....bhgggggggghgffffffffefeheedddeeededb...',
      '....bhhgggggggghhfffffffheehfdedeeeeeddb...',
      '....bhggfgggfgfghgffefefeeeeeddddededddb...',
      '....bggggfgfgfhgggfffefeeeeeeddddddddddb...',
      '....bgfgfffffggghgfeefefeeeeedddddcddddb...',
      '....begggfffghgggffefffefeeedddddcccdddb...',
      '...beeegfffgfgggffeeefefeeeeddddcccccdcb...',
      '...beefegfggghgffffefffffefddddddcccdcdb...',
      '...beeeefgggggffffefefeffeddcdddddcccdcb...',
      '...beeeegfggghfffefefefdeeeddddddccccccb...',
      '...bdedeefffffefeeeeeeedddddddcdcccccccb...',
      '...bededfefefefeeeeeeeeddddddddccccccccb...',
      '...beededfefeeeeeeeeeecdddddddccccacacab...',
      '....beeeeffffefffffheedddddcdcdccccacab....',
      '....beeeeeffheefffeeedddddccccccccaaaab....',
      '.....beeeefefefffffddddddddccccccccaab.....',
      '......beeeeeeededdddddddddcccccccccbb......',
      '.......beeeeeeeddddddddddddcccccccb........',
      '........bdddddddddddddcdcdccacacab.........',
      '.........bdddddddddddcccdcdccacab..........',
      '..........bdcccccddddccccdccacab...........',
      '...........bbcdcdcdddcccccccccb............',
      '.............bbdccccccccaccbbb.............',
      '...............bbbbccccbbbb................',
      '...................bbbb....................',
      '...........................................',
      '...........................................',
      '...........................................',
      '...........................................'
    ]
    ]
  },
  // 3 cuadros
  pz_arbol_m: {
    colores: { a: 0x10301c, b: 0x16261c, c: 0x184626, d: 0x215c2c, e: 0x2d7332, f: 0x41893a, g: 0x64a446, h: 0x9cc85a },
    cuadros: [
    [
      '...................................',
      '...................................',
      '...................................',
      '............bbbbbb.................',
      '...........bghgfefbbb..............',
      '..........bggggggefffbbb...........',
      '.........bfgggggfgeeefeeb..........',
      '........bggfggggggfefefeebb........',
      '......bbggggfffgggeeeeeedddb.......',
      '.....bhhhggggfggggfeeeedddddb......',
      '....bgggghggfffgggeeeedddddddb.....',
      '...bhghghggggfffgeeeedddddddeb.....',
      '...bggghggfghghfdeddddddddddddb....',
      '...bhghggfffhhhfddhdddddededddb....',
      '..bhggggffffffffhddddddddeddddcb...',
      '..bfhggffffffhfeeeheedddeddddddb...',
      '...bggffffhfeeeeeefeeeddddddcdccb..',
      '...bfggffffffefeeefeeddddddddcccb..',
      '...bfgffffffffeeefeeddddddddccacb..',
      '...bffgfgffffffefefdeddddddddccb...',
      '...beffgffffefefeeedddcdcdcdccab...',
      '...bfefggffehefeheeddddcccccdccb...',
      '....bfefefeeeeeeeeddddccccccccb....',
      '....befeeeedddddeddddcccccccdcb....',
      '.....beeeeddddddddddccccccccccb....',
      '......beededdddddcdcdcdcccccccb....',
      '.......beeddddddddcdcdcccccccb.....',
      '........bbdddddddddcdddccccccb.....',
      '..........bdcdddddcdcdccaaacb......',
      '...........bbbdddcdcccdccaab.......',
      '..............bbbbbbccccabb........',
      '....................bbbbb..........',
      '...................................',
      '...................................',
      '...................................'
    ],
    [
      '...................................',
      '...................................',
      '...................................',
      '.............bbbbbb................',
      '...........bbfffeffbb..............',
      '..........bfgggggefffbbb...........',
      '.........bfgggggfgeeefeebb.........',
      '........bggfgggggggefefeedb........',
      '......bbggggfffgggfeeeeedddb.......',
      '.....bhhhggggfgggggeeeedddddb......',
      '....bgggghggfffgggfeeedddddddb.....',
      '....bghghggggfffgffeedddddddeb.....',
      '...bfgghggfgfhfhffddddddddddddb....',
      '...bhghggfffghhhfddhddddededdddb...',
      '...bggggffffffffehdddddddeddddcb...',
      '...bgggfffffffheeefhedddeddddddcb..',
      '...bfgfffffheeeeeeffeeddddddcdccb..',
      '...bfegffffffefeeeffeddddddddcccb..',
      '...bffffffffffeeefefddddddddccacb..',
      '...bffgfgffffffefefeeddddddddccab..',
      '....bfegffffefefeeefddcdcdcdccab...',
      '....befegffefhfefhfedddcccccdccb...',
      '....bfefefeeeeeeefedddcccccccccb...',
      '.....bfeeeedddddeddddcccccccdcb....',
      '......beeeddddddddddccccccccccb....',
      '.......bededdddddcdcdcdcccccccb....',
      '........beddddddddcdcdccccccccb....',
      '.........bdddddddddcdddccccccb.....',
      '..........bbcdddddcdcdccaaacb......',
      '............bbdddcdcccdccaab.......',
      '..............bbbbbbccccabb........',
      '....................bbbbb..........',
      '...................................',
      '...................................',
      '...................................'
    ],
    [
      '...................................',
      '...................................',
      '...................................',
      '............bbbbbb.................',
      '..........bbghgfefbbb..............',
      '.........bggggggfefffbb............',
      '........bgfgggggffeeefebb..........',
      '.......bhggfgggggffefefeebb........',
      '.....bbhggggfffggfeeeeeedddb.......',
      '....bghhhggggfgggffeeeedddddb......',
      '...bggggghggfffggfeeeeddddddb......',
      '...bhghghggggffffeeeedddddddeb.....',
      '..bhggghggfhfhfededddddddddddb.....',
      '..bhhghggffhhhgedhddddddededddb....',
      '..bhggggfffffffhdddddddddeddddcb...',
      '..bghggfffffhffeeheeedddeddddddb...',
      '..bgggffhfffeeeeeeeeeeddddddcdcb...',
      '..bfgggffffffefeeeeeeddddddddccb...',
      '..bfggffffffffeeefdeddddddddccab...',
      '..bffggfgffffffefeededdddddddccb...',
      '..bfegfgffffefefeeddddcdcdcdccab...',
      '...bfefggffhfefhfdeddddcccccdccb...',
      '...befefefddeeeddeddddccccccccb....',
      '....befeeeedddddeddddcccccccdcb....',
      '.....beeeeddddddddddccccccccccb....',
      '......beededdddddcdcdcdccccccb.....',
      '.......beeddddddddcdcdcccccccb.....',
      '........bddddddddddcdddccccccb.....',
      '.........bbdcdddddcdcdccaaacb......',
      '...........bbddddcdcccdccaab.......',
      '.............bbbbbbbccccabb........',
      '....................bbbbb..........',
      '...................................',
      '...................................',
      '...................................'
    ]
    ]
  },
  // 3 cuadros
  pz_arbol_c: {
    colores: { a: 0x16261c, b: 0x184626, c: 0x215c2c, d: 0x2d7332, e: 0x41893a, f: 0x64a446, g: 0x9cc85a },
    cuadros: [
    [
      '...........................',
      '.........aaaa..............',
      '.......aaeefeaa............',
      '......aeffgffgfaaa.........',
      '.....aeefgffefefeda........',
      '.....aeegfgffeeeeddaa......',
      '....aeeefgffeeeeeeddca.....',
      '....aeeegggfeeeegeedda.....',
      '....aeegffffeedededdcca....',
      '...aeeedefffededgdeddcca...',
      '..aeeedddggfeeddddddddca...',
      '..aeeedddefeeeedddeddcca...',
      '..aeeeddgfeeeededecdccca...',
      '..aeeeeeeefeeeeeeedcdcca...',
      '...adededeegddgedeccccca...',
      '...adddddeedddddddccccca...',
      '...acdddcdddcccdccbbbcca...',
      '...adcdddcgddcddcbbbbbca...',
      '....addddcbcbcbcbcbbbba....',
      '.....adddccbcbcccbbbbba....',
      '.....acdccbcbbbcbbbbba.....',
      '......accccccbbbbbcbba.....',
      '.......abcccbbbbbbbaa......',
      '........accccbbbbaa........',
      '.........aacbbbba..........',
      '...........aaaaa...........',
      '...........................'
    ],
    [
      '...........................',
      '.........aaaaa.............',
      '.......aaeeeefaa...........',
      '......aefegffegfaa.........',
      '......aeegffefefedaa.......',
      '.....aeeffgffeeeeedca......',
      '.....aeeegffeeeeeeddca.....',
      '.....aeefggfeeeeegeddca....',
      '....aeeegfffeededeedcca....',
      '...aeeedefffededdgeddcca...',
      '...aegdddggfeedddddeddca...',
      '...aeeddddfeeeedddeedcca...',
      '...aeeddgdeeeededeedccca...',
      '...aeeeeedfeeeeeeeecdcca...',
      '...adededdeegddgdedcccca...',
      '...addddddeddddddddcccca...',
      '....adddcdddcccdcdbbbcca...',
      '....acdddccgdcdddcbbbbca...',
      '....addddcbcbdcdbcbbbba....',
      '.....adddccbcbcccbbbbba....',
      '......adccbcbbbcbbbbba.....',
      '.......acccccbbbbbcbba.....',
      '.......abcccbbbbbbbaa......',
      '........accccbbbbba........',
      '.........aacbbbbaa.........',
      '...........aaaaa...........',
      '...........................'
    ],
    [
      '...........................',
      '........aaaaa..............',
      '.......aegffeaa............',
      '.....aaegfgfgefaa..........',
      '.....aeffgffefefdaa........',
      '....aeefgfgffeeedddaa......',
      '....aeeffgffeeeeedddca.....',
      '....aeefgggfeeegededda.....',
      '...aeegfffffeededdddcca....',
      '..aeeeedffffedegdddddca....',
      '..aeeeddggefeeddddcdddca...',
      '..aeeeddeefeeeeddddddcca...',
      '..aeeedgefeeeededdcdccca...',
      '..aeeeeefefeeeeeeddcdcca...',
      '..addedeeegedgdeddccccca...',
      '..adddddeeeddddddcccccca...',
      '...acdddceddcccdbcbbbcca...',
      '...adcdddgdddcdbcbbbbba....',
      '...acddddcbcbcbcbcbbbba....',
      '....acdddccbcbcccbbbba.....',
      '.....acdccbcbbbcbbbbba.....',
      '......accccccbbbbbcba......',
      '......acbcccbbbbbbbaa......',
      '.......aaccccbbbbaa........',
      '.........accbbbba..........',
      '..........aaaaaa...........',
      '...........................'
    ]
    ]
  },
  // 2 cuadros: encendido / bajo (parpadeo)
  pz_farol: {
    colores: { a: 0x6a5a2a, b: 0x8a7a40, c: 0xffd54f, d: 0xfffbe0 },
    cuadros: [
    [
      '.......',
      '..KKK..',
      '.KcdcK.',
      '.KdddK.',
      '.KcdcK.',
      '..KKK..',
      '.......'
    ],
    [
      '.......',
      '..KKK..',
      '.KabaK.',
      '.KbbbK.',
      '.KabaK.',
      '..KKK..',
      '.......'
    ]
    ]
  },
  // 2 cuadros
  pz_farol_g: {
    colores: { a: 0x6a5a2a, b: 0x8a7a40, c: 0xffd54f, d: 0xfffbe0 },
    cuadros: [
    [
      '.........',
      '...KKK...',
      '..KcccK..',
      '.KcdddcK.',
      '.KcdddcK.',
      '.KcdddcK.',
      '..KcccK..',
      '...KKK...',
      '.........'
    ],
    [
      '.........',
      '...KKK...',
      '..KaaaK..',
      '.KabbbaK.',
      '.KabbbaK.',
      '.KabbbaK.',
      '..KaaaK..',
      '...KKK...',
      '.........'
    ]
    ]
  },
  // 4 cuadros: destello de los arbustos (va ENCIMA de la oscuridad)
  pz_brillito: {
    colores: { a: 0x8cb27b, b: 0x96bf84, c: 0xbfb784, d: 0xc8ffb0, e: 0xfff4b0, f: 0xffffff },
    cuadros: [
    [
      '.......',
      '.......',
      '...c...',
      '..cfc..',
      '...c...',
      '.......',
      '.......'
    ],
    [
      '.......',
      '...c...',
      '...e...',
      '.cefec.',
      '...e...',
      '...c...',
      '.......'
    ],
    [
      '...b...',
      '...d...',
      '..ada..',
      'bddfddb',
      '..ada..',
      '...d...',
      '...b...'
    ],
    [
      '.......',
      '.......',
      '...c...',
      '..cfc..',
      '...c...',
      '.......',
      '.......'
    ]
    ]
  },
  // 2 cuadros: luciérnaga prendida / apagada (encima de la oscuridad)
  pz_luciernaga: {
    colores: { a: 0x9ae05a, b: 0xc8e070, c: 0xf4ff9a },
    cuadros: [
    [
      '.....',
      '..a..',
      '.aca.',
      '..a..',
      '.....'
    ],
    [
      '.....',
      '.....',
      '..b..',
      '.....',
      '.....'
    ]
    ]
  },
  // 4 cuadros: hoja seca girando
  pz_hoja: {
    colores: { a: 0x8a5a24, b: 0xc4893a },
    cuadros: [
    [
      '.....',
      '.ba..',
      'baab.',
      '.aa..',
      '.....'
    ],
    [
      '.....',
      '..b..',
      '.ba..',
      '.aa..',
      '..a..'
    ],
    [
      '.....',
      '.....',
      'bbaa.',
      '.aa..',
      '.....'
    ],
    [
      '.....',
      '..b..',
      '.ab..',
      '.aa..',
      '.a...'
    ]
    ]
  }
};


// Números de la vida (si quieres más o menos movimiento, cambia aquí)
const PZ_VIDA = {
  MARGEN: 120,                  // px fuera de pantalla que igual se animan
  pz_pileta: { MS: 140 },       // cuánto dura cada cuadro (ms)
  pz_columpio: { MS: 230 },
  pz_arbol_g: { MS: 480 },
  pz_arbol_m: { MS: 440 },
  pz_arbol_c: { MS: 400 },
  FAROLES_QUE_PARPADEAN: 4,     // cuántos faroles del mapa parpadean (siempre los mismos)
  PARPADEO: [1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1], // 1 = prendido, 0 = bajo (cada 90 ms)
  PARPADEO_MS: 90,
  BRILLITOS: 6,                 // destellos a la vez sobre los arbustos (encima de la oscuridad)
  BRILLITO_CADA_MS: 220,
  BRILLITO_MS: 90,              // cuánto dura cada cuadro del destello
  LUCIERNAGAS: 10,              // luciérnagas a la vez (encima de la oscuridad)
  HOJAS: 6,                     // hojas secas volando (debajo de la oscuridad)
  VIENTO: 22                    // px por segundo que avanzan las hojas
};

// Se llama una vez después de crearPlaza (necesita que cada adorno guarde su imagen en a.imagen)
function iniciarVidaPlaza(escena, plaza) {
  escena.vidaPlaza = null;
  if (!plaza || !plaza.vida) return;             // terminal y feria: nada (las texturas pz_ quedan en memoria entre partidas)
  const v = { t: 0, animados: [], faroles: [], arbustos: [], brillitos: [], luciernagas: [], hojas: [], proxBrillo: 0 };
  (plaza.vida || []).forEach((o, i) => {
    if (!o.imagen) return;
    const cfg = PZ_VIDA[o.clave];
    const tex = escena.textures.get(o.clave);
    const cuadros = tex ? tex.frameTotal - 1 : 1;   // frameTotal cuenta el cuadro __BASE
    if (cfg && cuadros > 1) v.animados.push({ img: o.imagen, cuadros, ms: cfg.MS, fase: Math.floor(pzHash(i, 7, 3) * cuadros * cfg.MS), actual: 0 });
    if ((o.clave === 'pz_farol' || o.clave === 'pz_farol_g') && cuadros > 1) v.faroles.push({ img: o.imagen, o, actual: 0 });
    if (o.clave === 'pz_arbusto_g' || o.clave === 'pz_arbusto_c') v.arbustos.push(o);
  });
  // los faroles que parpadean: siempre los mismos (según su posición)
  v.faroles.sort((a, b) => pzHash(a.o.x | 0, a.o.y | 0, 9) - pzHash(b.o.x | 0, b.o.y | 0, 9));
  v.faroles = v.faroles.slice(0, PZ_VIDA.FAROLES_QUE_PARPADEAN);
  const pool = (n, clave, depth) => {
    const lista = [];
    for (let i = 0; i < n; i++) lista.push(escena.add.image(0, 0, clave, 0).setScale(ESCALA_PIXEL).setDepth(depth).setVisible(false));
    return lista;
  };
  if (escena.textures.exists('pz_brillito')) v.brillitos = pool(PZ_VIDA.BRILLITOS, 'pz_brillito', 803).map((img) => ({ img, hasta: 0, inicio: 0 }));
  if (escena.textures.exists('pz_luciernaga')) v.luciernagas = pool(PZ_VIDA.LUCIERNAGAS, 'pz_luciernaga', 803).map((img, i) => ({ img, bx: 0, by: 0, fase: i * 1.7, vivo: false }));
  if (escena.textures.exists('pz_hoja')) v.hojas = pool(PZ_VIDA.HOJAS, 'pz_hoja', 12).map((img, i) => ({ img, vivo: false, fase: i * 2.3 }));
  escena.vidaPlaza = v;
}

// Se llama en cada cuadro (update), con delta en ms
function actualizarVidaPlaza(escena, delta) {
  const v = escena.vidaPlaza;
  if (!v) return;
  v.t += delta;
  const vista = escena.cameras.main.worldView;
  const M = PZ_VIDA.MARGEN;
  const x0 = vista.x - M, y0 = vista.y - M, x1 = vista.right + M, y1 = vista.bottom + M;
  const enVista = (x, y) => x > x0 && x < x1 && y > y0 && y < y1;

  // objetos animados en pantalla
  v.animados.forEach((a) => {
    if (!enVista(a.img.x, a.img.y)) return;
    const c = Math.floor((v.t + a.fase) / a.ms) % a.cuadros;
    if (c !== a.actual) { a.actual = c; a.img.setFrame(c); }
  });
  // faroles que parpadean (el dibujo; la luz la puede bajar actualizarOscuridad mirando plaza.faroles[i].bajo)
  const paso = Math.floor(v.t / PZ_VIDA.PARPADEO_MS);
  v.faroles.forEach((f, i) => {
    const prendido = PZ_VIDA.PARPADEO[(paso + i * 5) % PZ_VIDA.PARPADEO.length];
    const c = prendido ? 0 : 1;
    if (c !== f.actual) { f.actual = c; f.img.setFrame(c); }
    if (f.o.luz) f.o.luz.bajo = !prendido;      // plaza.faroles[i].bajo (opcional: actualizarOscuridad puede saltarse esa luz)
  });
  // destellos en arbustos visibles
  if (v.brillitos.length && v.t >= v.proxBrillo) {
    v.proxBrillo = v.t + PZ_VIDA.BRILLITO_CADA_MS;
    const visibles = v.arbustos.filter((o) => enVista(o.x, o.y));
    const libre = v.brillitos.find((b) => v.t >= b.hasta);
    if (visibles.length && libre) {
      const o = visibles[Math.floor(Math.random() * visibles.length)];
      libre.img.setPosition(o.x + (Math.random() - 0.5) * 30, o.y + (Math.random() - 0.5) * 22).setFrame(0).setVisible(true);
      libre.inicio = v.t; libre.hasta = v.t + PZ_VIDA.BRILLITO_MS * 4;
    }
  }
  v.brillitos.forEach((b) => {
    if (!b.img.visible) return;
    if (v.t >= b.hasta) { b.img.setVisible(false); return; }
    b.img.setFrame(Math.min(3, Math.floor((v.t - b.inicio) / PZ_VIDA.BRILLITO_MS)));
  });
  // luciérnagas: flotan cerca de donde nacieron; si salen de la vista, renacen en otro lugar
  v.luciernagas.forEach((l) => {
    if (!l.vivo || !enVista(l.bx, l.by)) {
      l.bx = vista.x + Math.random() * vista.width; l.by = vista.y + Math.random() * vista.height; l.vivo = true;
    }
    const s = v.t / 1000 + l.fase;
    l.img.setPosition(Math.round((l.bx + Math.sin(s * 0.9) * 14) / 3) * 3, Math.round((l.by + Math.cos(s * 1.3) * 10) / 3) * 3)
      .setFrame(Math.sin(s * 3) > -0.2 ? 0 : 1).setVisible(true);
  });
  // hojas secas: cruzan la pantalla con el viento
  v.hojas.forEach((h) => {
    if (!h.vivo || h.img.x > vista.right + 20) {
      h.img.setPosition(vista.x - 10 - Math.random() * 200, vista.y + Math.random() * vista.height);
      h.vivo = true; h.y0 = h.img.y;
    }
    const s = v.t / 1000 + h.fase;
    h.img.x += PZ_VIDA.VIENTO * delta / 1000 * (0.7 + 0.3 * Math.sin(s));
    h.img.y = h.y0 + Math.sin(s * 1.7) * 12;
    h.img.setFrame(Math.floor(s * 5) % 4).setVisible(true);
  });
}

// Al terminar la partida (si la escena se reinicia, Phaser destruye las imágenes solo)
function limpiarVidaPlaza(escena) {
  escena.vidaPlaza = null;
}
