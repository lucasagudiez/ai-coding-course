// Simple HTML Component Loader for Vue.js
// Loads HTML fragments and inserts them into the DOM before Vue mounts

const ComponentLoader = {
    components: {},
    
    async loadComponent(name, path) {
        try {
            const response = await fetch(path);
            const html = await response.text();
            this.components[name] = html;
            return html;
        } catch (error) {
            console.error(`Failed to load component ${name}:`, error);
            return '';
        }
    },
    
    async loadAll(componentList) {
        const promises = componentList.map(({ name, path }) => 
            this.loadComponent(name, path)
        );
        await Promise.all(promises);
    },
    
    insertComponent(placeholderId, componentName) {
        const placeholder = document.getElementById(placeholderId);
        if (placeholder && this.components[componentName]) {
            placeholder.innerHTML = this.components[componentName];
        }
    }
};

// Auto-load components on page load
document.addEventListener('DOMContentLoaded', async () => {
    const components = [
        { name: 'scarcity-bar', path: 'components/scarcity-bar.html' },
        { name: 'graduate-counter', path: 'components/graduate-counter.html' },
        { name: 'authority-logos', path: 'components/authority-logos.html' },
        { name: 'value-stack', path: 'components/value-stack.html' },
        { name: 'comparison-table', path: 'components/comparison-table.html' },
        { name: 'testimonials', path: 'components/testimonials.html' },
        { name: 'guarantee-badges', path: 'components/guarantee-badges.html' },
        { name: 'outcomes', path: 'components/outcomes.html' },
        { name: 'pain-points', path: 'components/pain-points.html' },
        { name: 'stats-banner', path: 'components/stats-banner.html' },
        { name: 'bonus-stack', path: 'components/bonus-stack.html' },
        { name: 'timeline', path: 'components/timeline.html' },
        { name: 'faq', path: 'components/faq.html' }
    ];
    
    // Load all components
    await ComponentLoader.loadAll(components);
    
    // Insert components into placeholders
    components.forEach(({ name }) => {
        ComponentLoader.insertComponent(`component-${name}`, name);
    });
    
    console.log('Components loaded');
});
