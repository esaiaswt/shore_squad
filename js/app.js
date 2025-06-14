/**
 * ShoreSquad - Interactive Beach Cleanup Platform
 * Modern JavaScript with ES6+ features for enhanced user experience
 */

class ShoreSquad {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.initializeComponents();
  }

  init() {
    // Application state
    this.state = {
      user: null,
      currentLocation: null,
      weatherData: null,
      nearbyBeaches: [],
      activeEvents: [],
      crew: []
    };

    // Configuration
    this.config = {
      weatherAPI: 'https://api.openweathermap.org/data/2.5', // You'll need an API key
      mapProvider: 'https://api.mapbox.com', // You'll need an API key
      debounceTime: 300,
      animationDelay: 100
    };

    console.log('🌊 ShoreSquad initialized successfully!');
  }

  setupEventListeners() {
    // Navigation toggle for mobile
    this.setupMobileNavigation();
    
    // Smooth scrolling for navigation links
    this.setupSmoothScrolling();
    
    // Intersection Observer for animations
    this.setupScrollAnimations();
    
    // Weather and location services
    this.setupLocationServices();
    
    // Search functionality
    this.setupSearchFeatures();
    
    // Button interactions
    this.setupButtonInteractions();
    
    // Keyboard navigation
    this.setupKeyboardNavigation();
  }

  // ============================================
  // Navigation & UI Components
  // ============================================

  setupMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', 
          navToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });

      // Close menu when pressing Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
          navMenu.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const navHeight = document.querySelector('.navbar').offsetHeight;
          const targetPosition = targetElement.offsetTop - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Add fade-in class to elements that should animate
    const animatedElements = document.querySelectorAll(
      '.feature-card, .section-title, .hero-stats .stat'
    );
    
    animatedElements.forEach((el, index) => {
      el.classList.add('fade-in');
      el.style.transitionDelay = `${index * this.config.animationDelay}ms`;
      observer.observe(el);
    });
  }

  // ============================================
  // Location & Weather Services
  // ============================================

  setupLocationServices() {
    this.getCurrentLocation()
      .then(position => {
        this.state.currentLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.loadWeatherData();
        this.loadNearbyBeaches();
      })
      .catch(error => {
        console.warn('Location access denied:', error);
        this.loadDefaultLocation();
      });
  }

  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  }

  loadDefaultLocation() {
    // Default to a coastal location (e.g., Santa Monica, CA)
    this.state.currentLocation = { lat: 34.0195, lng: -118.4912 };
    this.loadWeatherData();
    this.loadNearbyBeaches();
  }

  async loadWeatherData() {
    const weatherContainer = document.querySelector('.current-weather');
    const forecastContainer = document.querySelector('.weather-forecast');
    
    if (!weatherContainer) return;

    try {
      // Simulate weather data (replace with real API call)
      const weatherData = await this.fetchWeatherData();
      this.renderWeatherWidget(weatherData, weatherContainer, forecastContainer);
    } catch (error) {
      console.error('Failed to load weather data:', error);
      this.renderWeatherError(weatherContainer);
    }
  }

  async fetchWeatherData() {
    // Simulated weather data - replace with real API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          current: {
            temp: 75,
            condition: 'Sunny',
            humidity: 65,
            windSpeed: 12,
            icon: 'sun'
          },
          forecast: [
            { day: 'Today', temp: 75, icon: 'sun', condition: 'Sunny' },
            { day: 'Tomorrow', temp: 72, icon: 'cloud-sun', condition: 'Partly Cloudy' },
            { day: 'Thu', temp: 68, icon: 'cloud', condition: 'Cloudy' },
            { day: 'Fri', temp: 71, icon: 'sun', condition: 'Sunny' },
            { day: 'Sat', temp: 74, icon: 'sun', condition: 'Perfect!' }
          ]
        });
      }, 1000);
    });
  }

  renderWeatherWidget(data, currentContainer, forecastContainer) {
    // Render current weather
    currentContainer.innerHTML = `
      <div class="current-weather-content">
        <div class="weather-main">
          <i class="fas fa-${this.getWeatherIcon(data.current.icon)}" aria-hidden="true"></i>
          <div class="temp">${data.current.temp}°F</div>
        </div>
        <div class="weather-details">
          <h3>${data.current.condition}</h3>
          <div class="weather-stats">
            <span><i class="fas fa-tint" aria-hidden="true"></i> ${data.current.humidity}%</span>
            <span><i class="fas fa-wind" aria-hidden="true"></i> ${data.current.windSpeed} mph</span>
          </div>
        </div>
      </div>
    `;

    // Render forecast
    if (forecastContainer) {
      forecastContainer.innerHTML = data.forecast.map(day => `
        <div class="forecast-day">
          <div class="forecast-date">${day.day}</div>
          <i class="fas fa-${this.getWeatherIcon(day.icon)}" aria-hidden="true"></i>
          <div class="forecast-temp">${day.temp}°</div>
          <div class="forecast-condition">${day.condition}</div>
        </div>
      `).join('');
    }
  }

  renderWeatherError(container) {
    container.innerHTML = `
      <div class="weather-error">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <p>Weather data unavailable</p>
        <button class="btn btn-secondary" onclick="shoreSquad.loadWeatherData()">
          Try Again
        </button>
      </div>
    `;
  }

  getWeatherIcon(iconType) {
    const iconMap = {
      'sun': 'sun',
      'cloud': 'cloud',
      'cloud-sun': 'cloud-sun',
      'rain': 'cloud-rain',
      'storm': 'bolt'
    };
    return iconMap[iconType] || 'sun';
  }

  // ============================================
  // Map & Location Features
  // ============================================

  async loadNearbyBeaches() {
    const locationList = document.querySelector('.location-list');
    if (!locationList) return;

    try {
      const beaches = await this.fetchNearbyBeaches();
      this.renderLocationList(beaches, locationList);
    } catch (error) {
      console.error('Failed to load nearby beaches:', error);
      this.renderLocationError(locationList);
    }
  }

  async fetchNearbyBeaches() {
    // Simulated beach data - replace with real API
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            name: 'Santa Monica Beach',
            distance: '2.1 miles',
            cleanupScore: 85,
            nextEvent: '2 days',
            difficulty: 'Easy'
          },
          {
            id: 2,
            name: 'Venice Beach',
            distance: '3.4 miles',
            cleanupScore: 72,
            nextEvent: '1 week',
            difficulty: 'Medium'
          },
          {
            id: 3,
            name: 'Manhattan Beach',
            distance: '5.2 miles',
            cleanupScore: 91,
            nextEvent: '3 days',
            difficulty: 'Easy'
          }
        ]);
      }, 800);
    });
  }

  renderLocationList(beaches, container) {
    container.innerHTML = beaches.map(beach => `
      <div class="location-item" data-beach-id="${beach.id}">
        <div class="location-header">
          <h4>${beach.name}</h4>
          <span class="distance">${beach.distance}</span>
        </div>
        <div class="location-details">
          <div class="cleanup-score">
            <span class="score-label">Cleanup Score:</span>
            <div class="score-bar">
              <div class="score-fill" style="width: ${beach.cleanupScore}%"></div>
            </div>
            <span class="score-value">${beach.cleanupScore}%</span>
          </div>
          <div class="location-meta">
            <span class="next-event">
              <i class="fas fa-calendar" aria-hidden="true"></i>
              Next event in ${beach.nextEvent}
            </span>
            <span class="difficulty difficulty-${beach.difficulty.toLowerCase()}">
              ${beach.difficulty}
            </span>
          </div>
        </div>
        <button class="btn btn-primary btn-small" onclick="shoreSquad.selectBeach(${beach.id})">
          Select Beach
        </button>
      </div>
    `).join('');
  }

  renderLocationError(container) {
    container.innerHTML = `
      <div class="location-error">
        <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
        <p>Unable to load nearby beaches</p>
        <button class="btn btn-secondary" onclick="shoreSquad.loadNearbyBeaches()">
          Retry
        </button>
      </div>
    `;
  }

  selectBeach(beachId) {
    console.log(`Selected beach with ID: ${beachId}`);
    // Implementation for beach selection
    this.showNotification('Beach selected! Plan your cleanup event.', 'success');
  }

  // ============================================
  // Search & Interactive Features
  // ============================================

  setupSearchFeatures() {
    const searchInput = document.querySelector('.location-search input');
    const searchButton = document.querySelector('.location-search button');
    
    if (searchInput && searchButton) {
      // Debounced search
      let searchTimeout;
      
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performSearch(e.target.value);
        }, this.config.debounceTime);
      });

      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.performSearch(e.target.value);
        }
      });

      searchButton.addEventListener('click', () => {
        this.performSearch(searchInput.value);
      });
    }
  }

  performSearch(query) {
    if (!query.trim()) return;
    
    console.log(`Searching for: ${query}`);
    this.showNotification(`Searching for "${query}"...`, 'info');
    
    // Simulate search delay
    setTimeout(() => {
      this.showNotification(`Found locations for "${query}"`, 'success');
    }, 1000);
  }

  setupButtonInteractions() {
    // CTA buttons
    const ctaButtons = document.querySelectorAll('.btn');
    
    ctaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        if (e.target.textContent.includes('Get Started') || 
            e.target.textContent.includes('Join Now') || 
            e.target.textContent.includes('Start Your First Cleanup')) {
          this.handleSignup();
        } else if (e.target.textContent.includes('Watch Demo')) {
          this.handleDemo();
        }
      });
    });
  }

  handleSignup() {
    this.showNotification('Welcome to ShoreSquad! 🌊', 'success');
    console.log('User initiated signup process');
    // Future: Open signup modal or redirect to registration
  }

  handleDemo() {
    this.showNotification('Demo coming soon! 🎥', 'info');
    console.log('User requested demo');
    // Future: Open demo video or interactive tour
  }

  // ============================================
  // Accessibility & Keyboard Navigation
  // ============================================

  setupKeyboardNavigation() {
    // Enhanced keyboard navigation for interactive elements
    document.addEventListener('keydown', (e) => {
      // Close modals/menus with Escape
      if (e.key === 'Escape') {
        this.closeActiveModals();
      }
      
      // Quick navigation shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
          case 'm':
            e.preventDefault();
            document.querySelector('#map')?.scrollIntoView({ behavior: 'smooth' });
            break;
          case 'w':
            e.preventDefault();
            document.querySelector('#weather')?.scrollIntoView({ behavior: 'smooth' });
            break;
        }
      }
    });
  }

  closeActiveModals() {
    // Close mobile navigation
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu?.classList.contains('active')) {
      navMenu.classList.remove('active');
      document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    }
  }

  // ============================================
  // Utility Functions
  // ============================================

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${this.getNotificationIcon(type)}" aria-hidden="true"></i>
        <span>${message}</span>
        <button class="notification-close" aria-label="Close notification">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Position and animate
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 4000);

    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  }

  getNotificationIcon(type) {
    const iconMap = {
      'success': 'check-circle',
      'error': 'exclamation-circle',
      'warning': 'exclamation-triangle',
      'info': 'info-circle'
    };
    return iconMap[type] || 'info-circle';
  }

  // Performance optimization
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // ============================================
  // Component Initialization
  // ============================================

  initializeComponents() {
    // Initialize all interactive components
    this.initializeNavbar();
    this.initializeHeroAnimations();
    this.initializeFeatureCards();
    this.addDynamicStyles();
  }

  initializeNavbar() {
    // Add scroll-based navbar styling
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar');
      const currentScrollY = window.scrollY;
      
      if (navbar) {
        if (currentScrollY > 100) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
          navbar.style.transform = 'translateY(-100%)';
        } else {
          navbar.style.transform = 'translateY(0)';
        }
      }
      
      lastScrollY = currentScrollY;
    });
  }

  initializeHeroAnimations() {
    // Animate hero elements on load
    const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-actions, .hero-stats');
    
    heroElements.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        element.style.transition = 'all 0.8s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, 200 + (index * 150));
    });
  }

  initializeFeatureCards() {
    // Add hover effects and interactions to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
      });
    });
  }

  addDynamicStyles() {
    // Add notification styles dynamically
    const notificationStyles = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
      }
      
      .notification.show {
        transform: translateX(0);
      }
      
      .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
      }
      
      .notification-success { border-left: 4px solid #10B981; }
      .notification-error { border-left: 4px solid #EF4444; }
      .notification-warning { border-left: 4px solid #F59E0B; }
      .notification-info { border-left: 4px solid #3B82F6; }
      
      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      
      .notification-close:hover {
        opacity: 1;
      }
      
      .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
  }
}

// ============================================
// Progressive Web App Features
// ============================================

class PWAManager {
  constructor() {
    this.init();
  }

  init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        this.registerServiceWorker();
      });
    }

    // Handle install prompt
    this.setupInstallPrompt();
    
    // Handle offline status
    this.setupOfflineHandling();
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered successfully:', registration);
    } catch (error) {
      console.log('ServiceWorker registration failed:', error);
    }
  }

  setupInstallPrompt() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button
      const installButton = document.createElement('button');
      installButton.className = 'btn btn-secondary install-pwa';
      installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
      installButton.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User ${outcome} the install prompt`);
          deferredPrompt = null;
          installButton.remove();
        }
      });
      
      document.querySelector('.hero-actions')?.appendChild(installButton);
    });
  }

  setupOfflineHandling() {
    window.addEventListener('online', () => {
      console.log('Back online');
      shoreSquad.showNotification('Connection restored! 📶', 'success');
    });
    
    window.addEventListener('offline', () => {
      console.log('Gone offline');
      shoreSquad.showNotification('You\'re offline. Some features may be limited. 📱', 'warning');
    });
  }
}

// ============================================
// Initialize Application
// ============================================

// Global app instance
let shoreSquad;
let pwaManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  shoreSquad = new ShoreSquad();
  pwaManager = new PWAManager();
  
  // Global error handling
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    shoreSquad.showNotification('Something went wrong. Please refresh the page.', 'error');
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
  });
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShoreSquad, PWAManager };
}
