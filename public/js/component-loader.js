/**
 * Simple Component Loader
 * No build tools, just vanilla JS + fetch API
 * 
 * Usage in HTML:
 * <div data-component="shared/pain-points"></div>
 * <div data-component="index/hero"></div>
 * <div data-component="application/form"></div>
 */

class ComponentLoader {
    constructor() {
        this.componentsPath = '/components/';
        this.cache = new Map();
    }

    async loadComponent(name) {
        // Check cache first
        if (this.cache.has(name)) {
            return this.cache.get(name);
        }

        try {
            const response = await fetch(`${this.componentsPath}${name}.html`);
            if (!response.ok) {
                throw new Error(`Component not found: ${name}`);
            }
            const html = await response.text();
            this.cache.set(name, html);
            return html;
        } catch (error) {
            console.error(`Failed to load component: ${name}`, error);
            return `<!-- Component load error: ${name} -->`;
        }
    }

    async loadAll() {
        const elements = document.querySelectorAll('[data-component]');
        const loadPromises = Array.from(elements).map(async (el) => {
            const componentName = el.getAttribute('data-component');
            const html = await this.loadComponent(componentName);
            el.innerHTML = html;
            el.removeAttribute('data-component'); // Prevent re-loading
        });

        await Promise.all(loadPromises);
        
        // Trigger AOS refresh if available
        if (window.AOS) {
            window.AOS.refresh();
        }
    }
}

// Auto-load components when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const loader = new ComponentLoader();
        loader.loadAll();
    });
} else {
    const loader = new ComponentLoader();
    loader.loadAll();
}

// Export for manual use
window.ComponentLoader = ComponentLoader;
