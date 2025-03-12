/**
 * Minimalist animations and effects
 * 
 * This file provides subtle animations to enhance the user experience
 * without being distracting. It uses GSAP for smooth transitions.
 * 
 * @requires GSAP library
 * @author Your Name
 * @version 1.0.0
 */

/**
 * Initialize fade-in animations for sections
 * Creates a subtle entrance animation when sections are displayed
 */
function initFadeInEffects() {
  if (typeof gsap === 'undefined') return;
  
  const sections = document.querySelectorAll('.section');
  
  // Set initial state
  gsap.set(sections, { opacity: 0, y: 20 });
  
  // Animate the active section
  gsap.to('.section.active', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    ease: "power2.out"
  });
}

/**
 * Initialize subtle hover effects for interactive elements
 * This improves the perceived responsiveness of the interface
 */
function initHoverEffects() {
  if (typeof gsap === 'undefined') return;
  
  // Button hover effects
  const buttons = document.querySelectorAll('button, .btn-logout, .nav-link:not(.active)');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        y: -2,
        duration: 0.2
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        y: 0,
        duration: 0.2
      });
    });
  });
  
  // Card hover effects
  const sections = document.querySelectorAll('.section');
  
  sections.forEach(section => {
    section.addEventListener('mouseenter', () => {
      gsap.to(section, {
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.08)',
        duration: 0.3
      });
    });
    
    section.addEventListener('mouseleave', () => {
      gsap.to(section, {
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        duration: 0.3
      });
    });
  });
}

/**
 * Set up smooth transitions between different sections
 * This creates a more polished feel when navigating the app
 */
function setupSectionTransitions() {
  if (typeof gsap === 'undefined') return;
  
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Original navigation functionality is in script.js
      // This just adds animations to the transitions
      
      const targetSectionId = link.getAttribute('data-section');
      
      // Fade out all sections
      gsap.to('.section.active', {
        opacity: 0,
        y: 20,
        duration: 0.3,
        onComplete: () => {
          // The class changes happen in the original event handler
          // After classes are updated, fade in the new section
          setTimeout(() => {
            gsap.to(`#${targetSectionId}`, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out"
            });
          }, 50);
        }
      });
    });
  });
}

/**
 * Initialize all visual effects when DOM is loaded
 * This is the main entry point for all animations
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if GSAP is available
  if (typeof gsap !== 'undefined') {
    // Add small delay to let page elements load
    setTimeout(() => {
      initFadeInEffects();
      initHoverEffects();
      setupSectionTransitions();
    }, 300);
  } else {
    console.warn('GSAP library not found. Animations will not work.');
  }
});
