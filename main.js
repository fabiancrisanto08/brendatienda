document.addEventListener('DOMContentLoaded', () => {

  // 1. Inicializar Íconos Lucide
  if (window.lucide) {
    lucide.createIcons();
  }

  // 2. Registrar Plugins GSAP
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Detección de preferencia de Modo Oscuro del sistema
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

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
        this.resetColor();
      }

      resetColor() {
        const isDark = darkModeMediaQuery.matches;
        const alpha = Math.random() * 0.3 + 0.15;
        this.color = isDark 
          ? `rgba(168, 85, 247, ${alpha})` 
          : `rgba(128, 61, 160, ${alpha})`;
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

    darkModeMediaQuery.addEventListener('change', () => {
      particlesArray.forEach(particle => particle.resetColor());
    });
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
  // 5. MODAL INTERACTIVO DE DETALLE DE PRODUCTO
  // ==========================================================================
  const productModal = document.getElementById('productModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  const modalImg = document.getElementById('modalImg');
  const modalBrand = document.getElementById('modalBrand');
  const modalTitle = document.getElementById('modalTitle');
  const modalSku = document.getElementById('modalSku');
  const modalPrice = document.getElementById('modalPrice');
  const modalDescription = document.getElementById('modalDescription');
  const modalSpecs = document.getElementById('modalSpecs');
  
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const modalWspBtn = document.getElementById('modalWspBtn');

  let currentProduct = { name: '', price: 0 };

  // Abrir Modal al hacer clic en cualquier tarjeta
  document.querySelectorAll('.catalog-card').forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('.card-title')?.textContent || 'Producto';
      const priceText = card.querySelector('.price-val')?.textContent || 'S/ 0.00';
      const priceNum = parseFloat(card.getAttribute('data-price')) || 0;
      const img = card.querySelector('.card-thumb img')?.src || '';
      
      const brand = card.getAttribute('data-brand') || 'Famavaya Premium';
      const sku = card.getAttribute('data-sku') || 'SKU-001';
      const description = card.getAttribute('data-description') || 'Producto de alta calidad garantizado por Famavaya.';
      
      let specs = {};
      try {
        specs = JSON.parse(card.getAttribute('data-specs') || '{}');
      } catch (err) {
        specs = { "Categoría": "General" };
      }

      currentProduct = { name: title, price: priceNum };

      // Llenar datos en el modal
      if (modalImg) modalImg.src = img;
      if (modalBrand) modalBrand.textContent = brand;
      if (modalTitle) modalTitle.textContent = title;
      if (modalSku) modalSku.textContent = `SKU: ${sku}`;
      if (modalPrice) modalPrice.textContent = priceText;
      if (modalDescription) modalDescription.textContent = description;
      if (qtyInput) qtyInput.value = 1;

      // Generar lista de especificaciones técnicas
      if (modalSpecs) {
        modalSpecs.innerHTML = '';
        Object.entries(specs).forEach(([key, val]) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${key}:</strong> <span>${val}</span>`;
          modalSpecs.appendChild(li);
        });
      }

      updateModalWspLink();

      // Mostrar Modal
      if (productModal) {
        productModal.classList.add('active');
        productModal.setAttribute('aria-hidden', 'false');
      }
    });
  });

  // Controles de cantidad (+ / -)
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        updateModalWspLink();
      }
    });

    qtyPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
      updateModalWspLink();
    });
  }

  // Actualización dinámica de URL de WhatsApp
  function updateModalWspLink() {
    if (!modalWspBtn) return;
    const qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
    const total = (currentProduct.price * qty).toFixed(2);
    const message = `Hola Famavaya, deseo cotizar: ${currentProduct.name} (Cantidad: ${qty}) - Total aprox: S/ ${total} (inc. IGV)`;
    modalWspBtn.href = `https://wa.me/51981144383?text=${encodeURIComponent(message)}`;
  }

  // Cerrar Modal
  function closeModal() {
    if (productModal) {
      productModal.classList.remove('active');
      productModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

  // ==========================================================================
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
  const catalogCards = document.querySelectorAll('.catalog-card');

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


