document.addEventListener('DOMContentLoaded', () => {

  // 1. Inicializar Íconos Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Registrar Plugins GSAP
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // ==========================================================================
  // 3. FONDO ANIMADO CON PARTÍCULAS EN MOVIMIENTO
  // ==========================================================================
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 1.5 - 0.75;
        this.speedY = Math.random() * 1.5 - 0.75;
        this.color = 'rgba(128, 61, 160, ' + (Math.random() * 0.3 + 0.1) + ')';
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        else if (this.x < 0) this.x = canvas.width;

        if (this.y > canvas.height) this.y = 0;
        else if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function initParticles() {
      particlesArray = [];
      const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    }
    initParticles();

    function animateCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      requestAnimationFrame(animateCanvas);
    }
    animateCanvas();
  }

  // ==========================================================================
  // 4. RESPLANDOR DEL CURSOR (GLOW EFFECT)
  // ==========================================================================
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('mousemove', (e) => {
      gsap.to(cursorGlow, { opacity: 1, duration: 0.3 });
      gsap.to(cursorGlow, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    document.addEventListener('mouseleave', () => {
      gsap.to(cursorGlow, { opacity: 0, duration: 0.4 });
    });
  }

  // ==========================================================================
  // 5. ANIMACIONES GSAP & EFECTO TILT 3D EN TARJETAS
  // ==========================================================================
  if (document.getElementById('heroTitle')) {
    gsap.from('#heroTitle', { opacity: 0, y: 30, duration: 1, ease: 'power3.out' });
  }

  const catalogCards = document.querySelectorAll('.catalog-card');

  catalogCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        transformPerspective: 1000,
        boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
        duration: 0.3,
        ease: 'power1.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  });

  // ==========================================================================-
  // 6. FILTRADO, BÚSQUEDA Y ORDENAMIENTO EN TIEMPO REAL
  // ==========================================================================
  const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const applyBtn = document.getElementById('applyFiltersBtn');
  const clearBtn = document.getElementById('clearFiltersBtn');
  const searchInput = document.getElementById('searchInput');
  const searchForm = document.getElementById('searchForm');
  const sortSelect = document.getElementById('sortSelect');
  const productsCount = document.getElementById('productsCount');

  function filterProducts() {
    const selectedCategories = Array.from(categoryCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);

    const minPrice = parseFloat(minPriceInput?.value) || 0;
    const maxPrice = parseFloat(maxPriceInput?.value) || Infinity;
    const searchQuery = searchInput?.value.toLowerCase().trim() || '';

    let visibleCount = 0;

    catalogCards.forEach((card) => {
      const category = card.getAttribute('data-category');
      const price = parseFloat(card.getAttribute('data-price')) || 0;
      const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';

      const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(category);
      const matchesPrice = price >= minPrice && price <= maxPrice;
      const matchesSearch = title.includes(searchQuery);

      if (matchesCat && matchesPrice && matchesSearch) {
        card.style.display = 'flex';
        gsap.to(card, { opacity: 1, scale: 1, duration: 0.3 });
        visibleCount++;
      } else {
        gsap.to(card, {
          opacity: 0,
          scale: 0.9,
          duration: 0.2,
          onComplete: () => {
            card.style.display = 'none';
          }
        });
      }
    });

    if (productsCount) {
      productsCount.textContent = `${visibleCount} productos encontrados`;
    }
  }

  // Escuchadores de eventos
  categoryCheckboxes.forEach((cb) => cb.addEventListener('change', filterProducts));
  if (applyBtn) applyBtn.addEventListener('click', filterProducts);

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      categoryCheckboxes.forEach((cb) => (cb.checked = false));
      if (minPriceInput) minPriceInput.value = '';
      if (maxPriceInput) maxPriceInput.value = '';
      if (searchInput) searchInput.value = '';
      filterProducts();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => e.preventDefault());
  }

  // Ordenamiento dinámico
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      const grid = document.getElementById('productsGrid');
      if (!grid) return;

      const cardsArray = Array.from(catalogCards);

      if (sortSelect.value === 'low-high') {
        cardsArray.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
      } else if (sortSelect.value === 'high-low') {
        cardsArray.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
      }

      cardsArray.forEach((card) => grid.appendChild(card));
    });
  }
});