// ============= ROUTER CLASS =============

export class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.setupHashChange();
  }

  setupHashChange() {
    window.addEventListener('hashchange', () => {
      this.navigate(window.location.hash);
    });
  }

  onRoute(pattern, handler) {
    this.routes.set(pattern, handler);
  }

  navigate(hash) {
    if (!hash) hash = '#home';
    if (!hash.startsWith('#')) hash = '#' + hash;
    
    // Don't update hash if it's the same to avoid infinite loops
    if (window.location.hash === hash && this.currentRoute === hash) {
      return;
    }
    
    window.location.hash = hash;
    this.currentRoute = hash;
    
    // Find matching route
    for (const [pattern, handler] of this.routes.entries()) {
      const match = this.matchRoute(pattern, hash);
      if (match) {
        handler(match.params);
        return;
      }
    }
    
    // If no match found, default to home
    if (hash !== '#home') {
      this.navigate('#home');
    }
  }

  matchRoute(pattern, hash) {
    // Simple route matching with params
    if (pattern === hash) {
      return { params: {} };
    }

    // Check for parameterized routes like #meal/:id
    const patternParts = pattern.split('/');
    const hashParts = hash.split('/');
    
    if (patternParts.length !== hashParts.length) {
      return null;
    }

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        const paramName = patternParts[i].substring(1);
        params[paramName] = hashParts[i];
      } else if (patternParts[i] !== hashParts[i]) {
        return null;
      }
    }

    return { params };
  }

  getCurrentRoute() {
    return this.currentRoute || window.location.hash || '#home';
  }
}

