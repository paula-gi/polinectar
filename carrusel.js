document.querySelectorAll('.tarjeta-carrusel').forEach(tarjeta => {
  const carrusel = tarjeta.querySelector('.carrusel-interno');
  const slides = carrusel.querySelectorAll('.slide');
  const prevBtn = tarjeta.querySelector('.prev');
  const nextBtn = tarjeta.querySelector('.next');

  let index = 0;
  let startX = 0;
  let isDragging = false;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  // Inicializamos
  updateCarrusel();

  // Función principal para actualizar la posición del carrusel
  function updateCarrusel() {
    carrusel.style.transform = `translateX(-${index * 100}%)`;
  }

  // Flechas
  nextBtn.addEventListener('click', () => {
    index = (index + 1) % slides.length;
    updateCarrusel();
  });

  prevBtn.addEventListener('click', () => {
    index = (index - 1 + slides.length) % slides.length;
    updateCarrusel();
  });

  // Eventos touch/mouse para deslizar
  carrusel.addEventListener('touchstart', touchStart);
  carrusel.addEventListener('touchmove', touchMove);
  carrusel.addEventListener('touchend', touchEnd);
  carrusel.addEventListener('mousedown', touchStart);
  carrusel.addEventListener('mousemove', touchMove);
  carrusel.addEventListener('mouseup', touchEnd);
  carrusel.addEventListener('mouseleave', touchEnd);

  function touchStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    animationID = requestAnimationFrame(animation);
  }

  function touchMove(event) {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    currentTranslate = prevTranslate + currentX - startX;
  }

  function touchEnd() {
    cancelAnimationFrame(animationID);
    if (!isDragging) return;
    isDragging = false;

    const movedBy = currentTranslate - prevTranslate;

    // Si se arrastra más del 50px, cambiamos slide
    if (movedBy < -50) {
      index = (index + 1) % slides.length;
    } else if (movedBy > 50) {
      index = (index - 1 + slides.length) % slides.length;
    }

    updateCarrusel();
    prevTranslate = -index * carrusel.clientWidth;
  }

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function animation() {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  }

  function setSliderPosition() {
    carrusel.style.transform = `translateX(${currentTranslate}px)`;
  }
});