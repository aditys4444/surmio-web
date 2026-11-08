/**
 * ==============================================================================
 * SURMIO MUSIC PLAYER — MAIN SCRIPT
 * Ultra-lightweight, 60fps smooth interactions.
 * ==============================================================================
 */

import { config } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Hydrate dynamic links
  hydrateLinks();

  // 2. Mobile Navigation
  setupMobileNav();

  // 3. Screenshot Tabs & Swipe Carousel
  setupPreviewSlider();

  // 4. Smooth FAQ Accordion
  setupFaqAccordion();
});

/**
 * Hydrates configurable URLs from config.js
 */
function hydrateLinks() {
  if (!config) return;

  if (config.telegram?.channelUrl) {
    document.querySelectorAll("[data-telegram-link]").forEach((el) => {
      el.setAttribute("href", config.telegram.channelUrl);
    });
  }

  if (config.app?.githubRepo) {
    document.querySelectorAll("[data-github-link]").forEach((el) => {
      el.setAttribute("href", config.app.githubRepo);
    });
  }
}

/**
 * Mobile Navigation Drawer Toggle & Escape handler
 */
function setupMobileNav() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");

  if (!menuBtn || !navMenu) return;

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle("open");
    menuBtn.classList.toggle("active", isOpen);
    menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function closeMenu() {
    navMenu.classList.remove("open");
    menuBtn.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn.addEventListener("click", toggleMenu);

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu.classList.contains("open")) {
      closeMenu();
    }
  });

  document.addEventListener("click", (e) => {
    if (
      navMenu.classList.contains("open") &&
      !navMenu.contains(e.target) &&
      !menuBtn.contains(e.target)
    ) {
      closeMenu();
    }
  });
}

/**
 * Screenshot Showcase: Interactive Tabs, Swipe Snap & Dots
 */
function setupPreviewSlider() {
  const tabs = document.querySelectorAll(".preview-tab");
  const slider = document.getElementById("previewSlider");
  const dots = document.querySelectorAll(".slider-dots .dot");
  const slides = document.querySelectorAll(".preview-slide");

  if (!slider || slides.length === 0) return;

  function setActiveIndex(index) {
    // Update tabs
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === index);
    });

    // Update slide state
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });

    // On mobile, scroll smoothly to the target slide
    if (window.innerWidth <= 680 && slides[index]) {
      slides[index].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }

  // Tab click
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetIndex = parseInt(tab.getAttribute("data-target"), 10);
      setActiveIndex(targetIndex);
    });
  });

  // Dot click
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = parseInt(dot.getAttribute("data-target"), 10);
      setActiveIndex(targetIndex);
    });
  });

  // Touch scroll detection on mobile
  let scrollTimeout = null;
  slider.addEventListener("scroll", () => {
    if (window.innerWidth > 680) return;

    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(() => {
      const scrollLeft = slider.scrollLeft;
      const width = slider.offsetWidth;
      const index = Math.round(scrollLeft / width);

      if (index >= 0 && index < slides.length) {
        tabs.forEach((tab, i) => {
          const active = i === index;
          tab.classList.toggle("active", active);
          tab.setAttribute("aria-selected", active ? "true" : "false");
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === index);
        });
      }
    });
  }, { passive: true });
}

/**
 * Smooth FAQ Accordion
 */
function setupFaqAccordion() {
  const triggers = document.querySelectorAll(".faq-trigger");

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const item = trigger.closest(".faq-item");
      if (!item) return;

      const isCurrentlyOpen = item.classList.contains("open");

      // Close all other items for a clean, non-cluttered reading experience
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          const openTrigger = openItem.querySelector(".faq-trigger");
          if (openTrigger) openTrigger.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current item
      if (isCurrentlyOpen) {
        item.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });
}
