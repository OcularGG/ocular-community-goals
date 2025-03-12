// Medieval scroll effects

// Flickering candlelight effect on parchment edges
function initCandlelightEffect() {
  const edges = document.querySelectorAll('.scroll-edge-top, .scroll-edge-bottom');
  
  setInterval(() => {
    // Random shadow intensity for flickering effect
    const shadowIntensity = Math.random() * 5 + 10;
    const shadowColor = `rgba(255, 150, 50, ${Math.random() * 0.3 + 0.3})`;
    
    edges.forEach(edge => {
      edge.style.boxShadow = `0 0 ${shadowIntensity}px ${shadowColor}`;
    });
  }, 100);
}

// Scroll unrolling animation
function initScrollUnrolling() {
  const scrollContent = document.querySelector('.scroll-content');
  
  // Set initial state (rolled up)
  gsap.set(scrollContent, { height: 0, opacity: 0 });
  
  // Animate unrolling
  gsap.to(scrollContent, {
    height: "auto",
    opacity: 1,
    duration: 1.2,
    ease: "power2.out",
    onComplete: () => {
      // Allow normal scrolling after animation
      scrollContent.style.height = 'auto';
      scrollContent.style.overflow = 'visible';
    }
  });
}

// Initialize all scroll effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add small delay to let page elements load
  setTimeout(() => {
    initCandlelightEffect();
    initScrollUnrolling();
  }, 300);
});

// Wax seal button effect
function initWaxSealButtons() {
  const buttons = document.querySelectorAll('button, .btn-logout, .nav-link, .tab-btn');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        boxShadow: '0 0 15px rgba(255, 160, 60, 0.7)',
        scale: 1.05,
        duration: 0.3
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        boxShadow: '0 0 0px rgba(255, 160, 60, 0)',
        scale: 1,
        duration: 0.3
      });
    });
  });
}

// Call after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  initWaxSealButtons();
});
