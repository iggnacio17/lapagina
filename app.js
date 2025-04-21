// app.js

const PASSWORD = "finnCracK12@";

const KEYS = {
  videos: 'videos',
  shorts: 'shorts',
  actrices: 'actrices',
  categorias: 'categorias',
  carpetas: 'carpetas',
  favoritos: 'favoritos',
  favoritosShorts: 'favoritosShorts'
};

const buscador = document.getElementById('buscador');
const categoriaFiltro = document.getElementById('categoriaFiltro');
const galeria = document.getElementById('galeria');
const galeriaShorts = document.getElementById('galeriaShorts');
const galeriaFavoritos = document.getElementById('galeriaFavoritos');

function mostrarTab(id) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (id === 'galeriaTab') cargarVideos();
  else if (id === 'shortsTab') cargarShorts();
  else if (id === 'favoritosTab') cargarFavoritos();
}

function getData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function cargarDatos() {
  actualizarSelect(document.getElementById('actrizSelect'), getData(KEYS.actrices));
  actualizarSelect(document.getElementById('categoriaSelect'), getData(KEYS.categorias));
  actualizarSelect(document.getElementById('carpetaSelect'), getData(KEYS.carpetas));
  actualizarSelect(categoriaFiltro, getData(KEYS.categorias), true);
  cargarVideos();
}

function actualizarSelect(select, data, incluirTodas = false) {
  select.innerHTML = '';
  if (incluirTodas) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '📂 Todas las categorías';
    select.appendChild(option);
  }
  data.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

function guardarVideo() {
  const video = {
    videoUrl: document.getElementById('videoUrl').value,
    imageUrl: document.getElementById('imageUrl').value,
    videoNombre: document.getElementById('videoNombre').value,
    actrices: document.getElementById('nuevaActriz').value.split(',').map(a => a.trim()).filter(Boolean),
    categorias: document.getElementById('nuevaCategoria').value.split(',').map(c => c.trim()).filter(Boolean),
    carpeta: document.getElementById('nuevaCarpeta').value || document.getElementById('carpetaSelect').value
  };

  if (!video.videoUrl || !video.imageUrl || !video.videoNombre) return alert("Todos los campos son obligatorios");

  const actrices = getData(KEYS.actrices);
  const categorias = getData(KEYS.categorias);
  const carpetas = getData(KEYS.carpetas);

  video.actrices.forEach(a => { if (!actrices.includes(a)) actrices.push(a); });
  video.categorias.forEach(c => { if (!categorias.includes(c)) categorias.push(c); });
  if (video.carpeta && !carpetas.includes(video.carpeta)) carpetas.push(video.carpeta);

  setData(KEYS.actrices, actrices);
  setData(KEYS.categorias, categorias);
  setData(KEYS.carpetas, carpetas);

  const lista = getData(KEYS.videos);
  lista.push(video);
  setData(KEYS.videos, lista);

  document.querySelectorAll('.formulario input').forEach(input => input.value = '');
  cargarDatos();
  mostrarTab('galeriaTab');
}

function guardarShort() {
  const short = {
    videoUrl: document.getElementById('shortUrl').value,
    imageUrl: document.getElementById('shortImageUrl').value
  };
  if (!short.videoUrl || !short.imageUrl) return alert("Ambos campos son obligatorios");

  const lista = getData(KEYS.shorts);
  lista.push(short);
  setData(KEYS.shorts, lista);

  document.getElementById('shortUrl').value = '';
  document.getElementById('shortImageUrl').value = '';
  cargarShorts();
}

function crearTag(texto, onClick) {
  const span = document.createElement('span');
  span.className = 'tag';
  span.textContent = texto;
  span.onclick = onClick;
  return span;
}

function crearCard(video, favoritos) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const img = document.createElement('img');
  img.src = video.imageUrl;
  img.onclick = () => { copiarEnlace(video.videoUrl); window.open(video.videoUrl, '_blank'); };

  const nombre = document.createElement('div');
  nombre.className = 'video-name';
  nombre.textContent = video.videoNombre;

  const etiquetas = document.createElement('p');
  (video.actrices || []).forEach(a => etiquetas.appendChild(crearTag(a, () => filtrarPorEtiqueta(a))));
  (video.categorias || []).forEach(c => etiquetas.appendChild(crearTag(c, () => filtrarPorEtiqueta(c))));

  const acciones = document.createElement('div');
  acciones.className = 'acciones';

  const star = document.createElement('span');
  star.textContent = favoritos.includes(video.videoUrl) ? '⭐' : '☆';
  star.onclick = () => toggleFavorito(video.videoUrl);

  const copy = document.createElement('span');
  copy.textContent = '📋';
  copy.onclick = () => copiarEnlace(video.videoUrl);

  const trash = document.createElement('span');
  trash.textContent = '🗑️';
  trash.onclick = () => eliminarVideo(video.videoUrl);

  acciones.append(star, copy, trash);
  card.append(img, nombre, etiquetas, acciones);
  return card;
}

function cargarVideos() {
  const videos = getData(KEYS.videos);
  const favoritos = getData(KEYS.favoritos);
  const query = buscador.value.toLowerCase().split(" ").filter(Boolean);
  const filtroCategoria = categoriaFiltro.value;

  let filtrados = videos.filter(video => {
    return query.every(palabra =>
      video.videoNombre.toLowerCase().includes(palabra) ||
      (video.actrices || []).some(a => a.toLowerCase().includes(palabra)) ||
      (video.categorias || []).some(c => c.toLowerCase().includes(palabra))
    );
  });

  if (filtroCategoria) {
    filtrados = filtrados.filter(v => (v.categorias || []).includes(filtroCategoria));
  }

  galeria.innerHTML = '';
  filtrados.forEach(video => galeria.appendChild(crearCard(video, favoritos)));
}

function filtrarVideos() {
  cargarVideos();
}

function filtrarPorEtiqueta(valor) {
  buscador.value = valor;
  cargarVideos();
}

function copiarEnlace(url) {
  navigator.clipboard.writeText(url).then(() => console.log("Copiado: " + url));
}

function toggleFavorito(videoUrl) {
  let favoritos = getData(KEYS.favoritos);
  favoritos = favoritos.includes(videoUrl)
    ? favoritos.filter(url => url !== videoUrl)
    : [...favoritos, videoUrl];
  setData(KEYS.favoritos, favoritos);
  cargarVideos();
  cargarFavoritos();
}

function eliminarVideo(videoUrl) {
  if (!confirm("¿Eliminar video?")) return;
  const lista = getData(KEYS.videos).filter(v => v.videoUrl !== videoUrl);
  const favoritos = getData(KEYS.favoritos).filter(f => f !== videoUrl);
  setData(KEYS.videos, lista);
  setData(KEYS.favoritos, favoritos);
  cargarVideos();
  cargarFavoritos();
}

function cargarShorts() {
  const shorts = getData(KEYS.shorts);
  const favoritos = getData(KEYS.favoritosShorts);
  galeriaShorts.innerHTML = '';
  shorts.forEach(short => {
    const card = document.createElement('div');
    card.className = 'short-card';

    const img = document.createElement('img');
    img.src = short.imageUrl;
    img.onclick = () => { copiarEnlace(short.videoUrl); window.open(short.videoUrl, '_blank'); };

    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.style.marginTop = '10px';

    const star = document.createElement('span');
    star.textContent = favoritos.includes(short.videoUrl) ? '⭐' : '☆';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);

    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.onclick = () => copiarEnlace(short.videoUrl);

    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.onclick = () => eliminarShort(short.videoUrl);

    acciones.append(star, copy, trash);
    card.append(img, acciones);
    galeriaShorts.appendChild(card);
  });
}

function toggleFavoritoShort(videoUrl) {
  let favoritos = getData(KEYS.favoritosShorts);
  favoritos = favoritos.includes(videoUrl)
    ? favoritos.filter(f => f !== videoUrl)
    : [...favoritos, videoUrl];
  setData(KEYS.favoritosShorts, favoritos);
  cargarShorts();
  cargarFavoritos();
}

function eliminarShort(videoUrl) {
  if (!confirm("¿Eliminar short?")) return;
  const lista = getData(KEYS.shorts).filter(s => s.videoUrl !== videoUrl);
  const favoritos = getData(KEYS.favoritosShorts).filter(f => f !== videoUrl);
  setData(KEYS.shorts, lista);
  setData(KEYS.favoritosShorts, favoritos);
  cargarShorts();
  cargarFavoritos();
}

function cargarFavoritos() {
  galeriaFavoritos.innerHTML = '';
  const videos = getData(KEYS.videos);
  const shorts = getData(KEYS.shorts);
  const favoritos = getData(KEYS.favoritos);
  const favoritosShorts = getData(KEYS.favoritosShorts);
  videos.filter(v => favoritos.includes(v.videoUrl)).forEach(v => galeriaFavoritos.appendChild(crearCard(v, favoritos)));
  shorts.filter(s => favoritosShorts.includes(s.videoUrl)).forEach(short => {
    const card = document.createElement('div');
    card.className = 'short-card';
    const img = document.createElement('img');
    img.src = short.imageUrl;
    img.onclick = () => { copiarEnlace(short.videoUrl); window.open(short.videoUrl, '_blank'); };
    const acciones = document.createElement('div');
    acciones.className = 'acciones';
    acciones.style.marginTop = '10px';
    const star = document.createElement('span');
    star.textContent = '⭐';
    star.onclick = () => toggleFavoritoShort(short.videoUrl);
    const copy = document.createElement('span');
    copy.textContent = '📋';
    copy.onclick = () => copiarEnlace(short.videoUrl);
    const trash = document.createElement('span');
    trash.textContent = '🗑️';
    trash.onclick = () => eliminarShort(short.videoUrl);
    acciones.append(star, copy, trash);
    card.append(img, acciones);
    galeriaFavoritos.appendChild(card);
  });
}

function exportarBaseDatos() {
  const datos = {
    [KEYS.videos]: getData(KEYS.videos),
    [KEYS.shorts]: getData(KEYS.shorts),
    [KEYS.actrices]: getData(KEYS.actrices),
    [KEYS.categorias]: getData(KEYS.categorias),
    [KEYS.carpetas]: getData(KEYS.carpetas),
    [KEYS.favoritos]: getData(KEYS.favoritos),
    [KEYS.favoritosShorts]: getData(KEYS.favoritosShorts)
  };
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importarBaseDatos(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const datos = JSON.parse(e.target.result);
      Object.keys(KEYS).forEach(k => setData(KEYS[k], datos[KEYS[k]] || []));
      alert("Base de datos importada.");
      cargarDatos();
    } catch {
      alert("Archivo JSON no válido.");
    }
  };
  reader.readAsText(file);
}

function pedirContrasena() {
  const input = prompt("Introduce la contraseña:");
  if (input !== PASSWORD) {
    alert("Contraseña incorrecta. Acceso denegado.");
    document.body.innerHTML = "<h1 style='color: red; text-align:center;'>Acceso Denegado</h1>";
  } else {
    cargarDatos();
  }
}

pedirContrasena();
