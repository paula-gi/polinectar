let plantas = [];

const regionSelect = document.getElementById("region");
const estacionesElems = document.querySelectorAll(".estacion");
const huertoArea = document.querySelector(".huerto-area");
const huertoVacioText = document.querySelector(".huerto-vacio");

// Guardamos el filtro de categoría para cada estación
const filtrosPorEstacion = {};

// Cargar plantas desde el JSON externo
fetch("plantas.json")
  .then(res => res.json())
  .then(data => {
    plantas = data;
    // Inicializamos filtros a "todas" para cada estación
    estacionesElems.forEach(estElem => {
      filtrosPorEstacion[estElem.getAttribute("data-estacion")] = "todas";
    });
    renderCarruseles();
    regionSelect.addEventListener("change", renderCarruseles);
    setupFiltrosBotones();
  })
  .catch(error => console.error("Error al cargar plantas:", error));

function renderCarruseles() {
  const region = regionSelect.value;

  estacionesElems.forEach(estElem => {
    const estacion = estElem.getAttribute("data-estacion");
    const carrusel = estElem.querySelector(".carrusel");
    const slidesContainer = carrusel.querySelector(".slides-container");

    const filtroCategoria = filtrosPorEstacion[estacion] || "todas";

    // Filtramos plantas por estación, región y categoría
    let slides = plantas.filter(p =>
      p.estacion === estacion &&
      (region === "todas" ||
        (Array.isArray(p.region) ? p.region.includes(region) : p.region === region))
    );

    if (filtroCategoria !== "todas") {
      slides = slides.filter(p => p.categoria === filtroCategoria);
    }

    slidesContainer.innerHTML = "";

    if (slides.length === 0) {
      slidesContainer.innerHTML = "<p>No hay plantas disponibles.</p>";
    } else {
      slides.forEach(p => {
        const div = document.createElement("div");
        div.className = "planta-slide";
        div.innerHTML = `<img src="${p.imagen}" alt="${p.nombre}" draggable="false"><p>${p.nombre}</p>`;

        // Click para plantar directamente en la casilla
        div.addEventListener("click", () => plantarEnCasilla(p));

        slidesContainer.appendChild(div);
      });
    }

    let savedIndex = parseInt(estElem.getAttribute("data-index")) || 0;
    if (savedIndex >= slides.length) savedIndex = 0;

    setupCarrusel(estElem, slides.length, savedIndex);
  });
}

function setupCarrusel(estElem, count, startIndex = 0) {
  const btnPrev = estElem.querySelector(".prev-btn");
  const btnNext = estElem.querySelector(".next-btn");
  const slidesContainer = estElem.querySelector(".slides-container");

  let index = startIndex;

  btnPrev.onclick = () => {
    if (count === 0) return;
    index = (index - 1 + count) % count;
    updateCarrusel();
  };

  btnNext.onclick = () => {
    if (count === 0) return;
    index = (index + 1) % count;
    updateCarrusel();
  };

  function updateCarrusel() {
    const offset = -index * 100;
    slidesContainer.style.transform = `translateX(${offset}%)`;
    estElem.setAttribute("data-index", index);
  }

  updateCarrusel();
}

// Función para plantar una planta en la primera casilla libre correspondiente
function plantarEnCasilla(p) {
  huertoVacioText.style.display = "none";

  const categoria = p.categoria || "flores-medianas";
  const casillasCategoria = document.querySelectorAll(`.slot.${categoria}`);

  // Buscar primera casilla vacía
  let casillaLibre = null;
  for (const casilla of casillasCategoria) {
    if (casilla.children.length === 0) {
      casillaLibre = casilla;
      break;
    }
  }

  if (!casillaLibre) {
    alert("No hay casillas libres para esta categoría");
    return;
  }

  const contenedor = document.createElement("div");
  contenedor.style.display = "flex";
  contenedor.style.flexDirection = "column";
  contenedor.style.alignItems = "center";
  contenedor.style.width = "100%";

  // Imagen de la planta
  const img = document.createElement("img");
  img.src = p.imagen;
  img.alt = p.nombre;
  img.title = `${p.nombre} (Haz clic para quitar)`;
  img.className = "planta-item";
  img.style.cursor = "pointer";

  // Nombre debajo de la imagen
  const nombre = document.createElement("span");
  nombre.textContent = p.nombre;
  nombre.className = "nombre-planta-slot";

  // Eliminar planta al hacer clic en la imagen
  img.addEventListener("click", () => {
    contenedor.remove();
    if (document.querySelectorAll(".huerto-area .planta-item").length === 0) {
      huertoVacioText.style.display = "block";
    }
  });

  contenedor.appendChild(nombre);
  contenedor.appendChild(img);  
  casillaLibre.appendChild(contenedor);
}

// Setup botones filtros
function setupFiltrosBotones() {
  estacionesElems.forEach(estElem => {
    const botones = estElem.querySelectorAll(".btn-filtro");
    const estacion = estElem.getAttribute("data-estacion");

    botones.forEach(btn => {
      btn.addEventListener("click", () => {
        const categoria = btn.getAttribute("data-categoria");
        filtrosPorEstacion[estacion] = categoria;
        renderCarruseles();
      });
    });
  });
}