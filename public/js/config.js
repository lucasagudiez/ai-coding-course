/**
 * Environment Configuration
 * 
 * Automatically detects environment and loads appropriate credentials
 * - localhost/127.0.0.1 = sandbox
 * - production domain = production
 */

const ENV_CONFIG = (() => {
    const hostname = window.location.hostname;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    
    // Sandbox configuration (for local development and testing)
    const SANDBOX = {
        environment: 'sandbox',
        square: {
            appId: 'sandbox-sq0idb-51AxZAaIW4wr4x51PivPfg',
            locationId: 'LM3C1QVBTJA5J',
            sdkUrl: 'https://sandbox.web.squarecdn.com/v1/square.js'
        },
        api: {
            baseUrl: 'http://localhost:3001'
        }
    };
    
    // Production configuration
    const PRODUCTION = {
        environment: 'production',
        square: {
            appId: 'sq0idp-8DEnXsW8Vm2TyUBzJ_FoBw',
            locationId: 'LGKFR26ZTVPGP',
            sdkUrl: 'https://web.squarecdn.com/v1/square.js'
        },
        api: {
            baseUrl: 'https://api.adavauniversity.org' // Update this to your actual production API
        }
    };
    
    // Select configuration based on environment
    const config = isLocalhost ? SANDBOX : PRODUCTION;
    
    console.log(`🌍 Environment: ${config.environment.toUpperCase()}`);
    console.log(`💳 Square App ID: ${config.square.appId.substring(0, 20)}...`);
    console.log(`📍 Location ID: ${config.square.locationId}`);
    
    return config;
})();

// Make it available globally
window.ENV_CONFIG = ENV_CONFIG;
