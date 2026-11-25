// ===============================================================
//  ONLINE: inicio de sesión con Google y ranking (Supabase)
//  - La URL y la llave anon están en src/config.js, sección ONLINE.
//  - La base de datos se crea con supabase/migraciones/001_ranking.sql
//  - Si se abre con doble clic (file://), sin internet o si Supabase no
//    carga, todo esto se apaga solo y el juego funciona igual que antes.
//  Lo usan MenuScene (botón de Google y apodo), GameScene (enviar el
//  puntaje al terminar) y RankingScene (el ranking).
// ===============================================================

const TEXTO_SOLO_ONLINE = 'Ranking disponible en la versión online';

// Estado de la conexión (lo leen las pantallas)
const ONLINE = {
  cliente: null,        // cliente de Supabase (null = sin online)
  cargando: true,       // true mientras se revisa si había sesión guardada
  usuario: null,        // usuario de Google con sesión iniciada (null = sin sesión)
  apodo: null,          // apodo elegido (null = todavía no elige)
  apodoCargado: false,  // true cuando ya se preguntó a la base de datos por el apodo
  avisos: []            // funciones a llamar cuando algo cambia (ver alCambiarOnline)
};

// true si el login y el ranking pueden funcionar en esta página
function onlineDisponible() {
  return !!ONLINE.cliente;
}

// Avisar a las pantallas que algo cambió (sesión, apodo)
function avisarCambioOnline() {
  ONLINE.avisos.slice().forEach((fn) => { try { fn(); } catch (e) { console.warn(e); } });
}

// Una pantalla se suscribe a los cambios. Devuelve una función para desuscribirse.
function alCambiarOnline(fn) {
  ONLINE.avisos.push(fn);
  return () => { ONLINE.avisos = ONLINE.avisos.filter((f) => f !== fn); };
}

// Se llama una vez al cargar la página (al final de este archivo)
function iniciarOnline() {
  const cfg = CONFIG.ONLINE;
  const enWeb = /^https?:$/.test(window.location.protocol); // file:// = doble clic
  const conInternet = navigator.onLine !== false;
  const hayLibreria = !!(window.supabase && window.supabase.createClient);
  if (!cfg || !cfg.ACTIVO || !enWeb || !conInternet || !hayLibreria) {
    ONLINE.cargando = false;
    return;
  }
  try {
    ONLINE.cliente = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_LLAVE_ANON, {
      auth: {
        persistSession: true,      // la sesión queda guardada al recargar
        autoRefreshToken: true,
        detectSessionInUrl: true   // lee la sesión al volver de Google
      }
    });
  } catch (e) {
    console.warn('Online apagado:', e);
    ONLINE.cliente = null;
    ONLINE.cargando = false;
    return;
  }

  // Cambios de sesión: al volver de Google, al salir, al renovar la sesión
  ONLINE.cliente.auth.onAuthStateChange((evento, sesion) => {
    cambiarUsuario(sesion ? sesion.user : null);
  });

  ONLINE.cliente.auth.getSession()
    .then(({ data }) => cambiarUsuario(data && data.session ? data.session.user : null))
    .catch((e) => {
      console.warn('No se pudo leer la sesión:', e);
      ONLINE.cargando = false;
      avisarCambioOnline();
    });
}

// Guarda el usuario y busca su apodo (solo si cambió de verdad)
function cambiarUsuario(usuario) {
  const antes = ONLINE.usuario ? ONLINE.usuario.id : null;
  const ahora = usuario ? usuario.id : null;
  ONLINE.usuario = usuario;
  if (antes === ahora && !ONLINE.cargando) return;
  ONLINE.cargando = false;
  ONLINE.apodo = null;
  ONLINE.apodoCargado = false;
  avisarCambioOnline();
  if (!usuario) return;

  // El supabase-js no deja llamar a la base de datos dentro de onAuthStateChange: va después
  setTimeout(() => {
    ONLINE.cliente.from('jugadores').select('apodo').eq('id', usuario.id).maybeSingle()
      .then(({ data, error }) => {
        if (!ONLINE.usuario || ONLINE.usuario.id !== usuario.id) return; // salió mientras tanto
        if (error) console.warn('No se pudo leer el apodo:', error);
        ONLINE.apodo = data ? data.apodo : null;
        ONLINE.apodoCargado = !error;
        avisarCambioOnline();
      });
  }, 0);
}

// true si hay sesión pero todavía no elige apodo (hay que pedírselo)
function faltaApodo() {
  return onlineDisponible() && !!ONLINE.usuario && ONLINE.apodoCargado && !ONLINE.apodo;
}

// Ir a Google para iniciar sesión. Vuelve a esta misma página, sin parámetros.
function entrarConGoogle() {
  if (!onlineDisponible()) return Promise.resolve();
  const volverA = window.location.origin + window.location.pathname;
  return ONLINE.cliente.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: volverA } })
    .then(({ error }) => { if (error) throw error; });
}

// Cerrar sesión
function salirOnline() {
  if (!onlineDisponible()) return Promise.resolve();
  return ONLINE.cliente.auth.signOut()
    .catch((e) => console.warn('Error al salir:', e))
    .then(() => cambiarUsuario(null));
}

// Revisa un apodo. Devuelve el texto del error, o '' si está bien.
function errorApodo(apodo) {
  const cfg = CONFIG.ONLINE;
  if (apodo.length < cfg.APODO_MIN || apodo.length > cfg.APODO_MAX) {
    return 'El apodo debe tener entre ' + cfg.APODO_MIN + ' y ' + cfg.APODO_MAX + ' letras.';
  }
  if (!/^[A-Za-z0-9ÁÉÍÓÚÜÑáéíóúüñ _.-]+$/.test(apodo)) {
    return 'Usa solo letras, números, espacios, _ . o -';
  }
  return '';
}

// Guarda el apodo del jugador: lo crea la primera vez y después lo cambia
// (la base de datos deja editar solo el apodo propio). Devuelve una promesa.
function guardarApodo(apodo) {
  apodo = String(apodo || '').trim().replace(/\s+/g, ' ');
  const malo = errorApodo(apodo);
  if (malo) return Promise.reject(new Error(malo));
  if (!onlineDisponible() || !ONLINE.usuario) return Promise.reject(new Error('No has iniciado sesión.'));
  if (ONLINE.apodo === apodo) return Promise.resolve(); // no cambió nada
  const tabla = ONLINE.cliente.from('jugadores');
  const pedido = ONLINE.apodo
    ? tabla.update({ apodo }).eq('id', ONLINE.usuario.id).select('apodo')
    : tabla.insert({ id: ONLINE.usuario.id, apodo });
  return pedido
    .then(({ data, error }) => {
      if (error) throw new Error(mensajeError(error));
      if (ONLINE.apodo && (!data || data.length === 0)) throw new Error('No se pudo cambiar el apodo (revisa que la sesión siga iniciada).');
      ONLINE.apodo = apodo;
      ONLINE.apodoCargado = true;
      avisarCambioOnline();
    });
}

// Traduce los errores de Supabase a algo entendible
function mensajeError(error) {
  if (!error) return 'Error desconocido';
  if (error.code === '23505') return 'Ese apodo ya está ocupado.';
  if (error.code === '23514') return 'Datos no válidos (no pasaron las reglas del ranking).';
  if (error.code === '42501') return 'Sin permiso (revisa que la sesión siga iniciada).';
  if (error.code === '42P01' || error.code === 'PGRST205') return 'Falta crear las tablas del ranking en Supabase.';
  const texto = error.message || String(error);
  if (/fetch|network|Failed/i.test(texto)) return 'Sin conexión con el servidor.';
  return texto;
}

// ---------------- Puntaje ----------------

// Datos de la partida que van al ranking (sale de GameScene al terminar)
function datosPartida(escena, victoria) {
  const segundos = Math.min(CONFIG.ONLINE.SEGUNDOS_MAXIMOS, Math.floor(escena.tiempoSobrevivido / 1000));
  const datos = {
    raza: escena.razaId,
    segundos_sobrevividos: Math.max(0, segundos),
    nivel: Math.max(1, escena.nivel),
    enemigos: Math.max(0, escena.derrotados),
    jefe_derrotado: !!escena.jefeDerrotado,
    amanecer: !!victoria
  };
  datos.puntaje = calcularPuntaje(datos);
  return datos;
}

// La fórmula del puntaje (números en CONFIG.ONLINE.PUNTAJE)
function calcularPuntaje(d) {
  const p = CONFIG.ONLINE.PUNTAJE;
  return Math.floor(
    d.segundos_sobrevividos * p.POR_SEGUNDO +
    d.nivel * p.POR_NIVEL +
    d.enemigos * p.POR_ENEMIGO +
    (d.jefe_derrotado ? p.JEFE : 0) +
    (d.amanecer ? p.AMANECER : 0)
  );
}

// Envía la partida al ranking. Devuelve una promesa con el puntaje que guardó el servidor.
function enviarPartida(datos) {
  if (!onlineDisponible()) return Promise.reject(new Error(TEXTO_SOLO_ONLINE));
  if (!ONLINE.usuario) return Promise.reject(new Error('Entra con Google en el menú para aparecer en el ranking.'));
  if (!ONLINE.apodo) return Promise.reject(new Error('Elige tu apodo en el menú para aparecer en el ranking.'));
  const fila = Object.assign({}, datos, { jugador_id: ONLINE.usuario.id, version_juego: VERSION_JUEGO });
  return ONLINE.cliente.from('partidas').insert(fila).select('puntaje').single()
    .then(({ data, error }) => {
      if (error) throw new Error(mensajeError(error));
      return data ? data.puntaje : datos.puntaje;
    });
}

// ---------------- Ranking ----------------

// Carga el ranking. raza = null para el general (mejor partida de cada jugador)
// o el id de una raza. Devuelve { filas, mia, posicion } (mia/posicion = tu mejor
// partida y tu puesto, o null si no tienes).
function cargarRanking(raza) {
  if (!onlineDisponible()) return Promise.reject(new Error(TEXTO_SOLO_ONLINE));
  const vista = raza ? 'ranking_top' : 'ranking_general';
  const consulta = () => {
    let q = ONLINE.cliente.from(vista).select('*');
    if (raza) q = q.eq('raza', raza);
    return q;
  };
  const top = consulta().order('puntaje', { ascending: false }).order('creado', { ascending: true })
    .limit(CONFIG.ONLINE.RANKING_CANTIDAD);
  return top.then(({ data, error }) => {
    if (error) throw new Error(mensajeError(error));
    const filas = data || [];
    const yo = ONLINE.usuario && ONLINE.apodo ? ONLINE.usuario.id : null;
    if (!yo) return { filas, mia: null, posicion: null };
    const i = filas.findIndex((f) => f.jugador_id === yo);
    if (i >= 0) return { filas, mia: filas[i], posicion: i + 1 };
    // No estás en el top: busca tu mejor partida y cuenta cuántos te ganan
    return consulta().eq('jugador_id', yo).maybeSingle().then(({ data: mia, error: e2 }) => {
      if (e2 || !mia) return { filas, mia: null, posicion: null };
      let mejores = ONLINE.cliente.from(vista).select('jugador_id', { count: 'exact', head: true }).gt('puntaje', mia.puntaje);
      if (raza) mejores = mejores.eq('raza', raza);
      return mejores.then(({ count }) => ({ filas, mia, posicion: (count || 0) + 1 }));
    });
  });
}

// ---------------- Ventana para elegir (o cambiar) el apodo ----------------
// Es HTML encima del juego, para que funcione el teclado del celular.
// Las teclas no llegan a Phaser mientras está abierta.
// pedirApodo() = primera vez (solo si falta) · pedirApodo(true) = cambiar el apodo actual

let ventanaApodo = null;

// true si hay sesión y apodo (se puede cambiar)
function puedeCambiarApodo() {
  return onlineDisponible() && !!ONLINE.usuario && !!ONLINE.apodo;
}

function pedirApodo(cambiar) {
  if (ventanaApodo) return;
  if (cambiar ? !puedeCambiarApodo() : !faltaApodo()) return;
  const cfg = CONFIG.ONLINE;
  const titulo = cambiar ? 'Cambiar apodo' : 'Elige tu apodo';
  const ayuda = cambiar
    ? 'Tu apodo actual es <b style="color:#ffe082"></b>. El nuevo se verá en todo el ranking.'
    : 'Así aparecerás en el ranking. Después lo puedes cambiar desde el menú.';
  const fondo = document.createElement('div');
  fondo.style.cssText = 'position:fixed;inset:0;z-index:20;background:rgba(0,0,0,0.8);display:flex;' +
    'align-items:flex-start;justify-content:center;padding-top:6vh;font-family:Arial,sans-serif;';
  fondo.innerHTML =
    '<div style="background:#2a1f3a;border:4px solid #ffe082;padding:18px 22px;max-width:92vw;width:420px;box-sizing:border-box;color:#fff;text-align:center">' +
      '<div style="font-size:22px;font-weight:bold;color:#ffe082;margin-bottom:6px">' + titulo + '</div>' +
      '<div style="font-size:14px;color:#cfd8dc;margin-bottom:12px">' + ayuda + '</div>' +
      '<input type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="' + cfg.APODO_MAX + '" ' +
        'style="font-size:20px;width:100%;box-sizing:border-box;padding:8px;border:2px solid #888;background:#111;color:#fff;' +
        'user-select:text;-webkit-user-select:text;touch-action:auto">' +
      '<div class="error" style="min-height:20px;font-size:14px;color:#ef9a9a;margin:8px 0"></div>' +
      '<div style="display:flex;gap:12px;justify-content:center">' +
        '<button class="ok" style="font-size:17px;font-weight:bold;padding:8px 18px;background:#9ccc65;border:0;cursor:pointer">Guardar</button>' +
        '<button class="no" style="font-size:17px;padding:8px 18px;background:#ffd54f;border:0;cursor:pointer">' + (cambiar ? 'Cancelar' : 'Ahora no') + '</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(fondo);
  ventanaApodo = fondo;

  const input = fondo.querySelector('input');
  input.placeholder = cfg.APODO_MIN + ' a ' + cfg.APODO_MAX + ' caracteres';
  if (cambiar) {
    fondo.querySelector('b').textContent = ONLINE.apodo; // textContent: el apodo no se lee como HTML
    input.value = ONLINE.apodo;
  }
  const textoError = fondo.querySelector('.error');
  const botonOk = fondo.querySelector('.ok');
  const cerrar = () => { if (fondo.parentNode) fondo.parentNode.removeChild(fondo); ventanaApodo = null; };
  const guardar = () => {
    botonOk.disabled = true;
    textoError.textContent = 'Guardando...';
    guardarApodo(input.value)
      .then(cerrar)
      .catch((e) => { textoError.textContent = e.message; botonOk.disabled = false; });
  };
  botonOk.addEventListener('click', guardar);
  fondo.querySelector('.no').addEventListener('click', cerrar);
  // Que Phaser no se entere de las teclas (si no, no se podría escribir A, B, G, H...)
  ['keydown', 'keyup', 'keypress'].forEach((tipo) => fondo.addEventListener(tipo, (ev) => {
    ev.stopPropagation();
    if (tipo === 'keydown' && ev.key === 'Enter') guardar();
    if (tipo === 'keydown' && ev.key === 'Escape') cerrar();
  }));
  ['pointerdown', 'touchstart', 'mousedown'].forEach((tipo) => fondo.addEventListener(tipo, (ev) => ev.stopPropagation()));
  setTimeout(() => { input.focus(); input.select(); }, 50);
}

iniciarOnline();
