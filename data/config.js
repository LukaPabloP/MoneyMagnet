// MoneyMagnet v2.0 - Browser-kompatible Konfiguration
// API-Schlüssel werden hier als Demo-Keys definiert

const CONFIG = {
    APIs: {
        FINNHUB: {
            // Ersetzen Sie 'DEMO_KEY_REPLACE_ME' mit Ihrem echten API-Schlüssel
            KEY: 'd134r0pr01qv1k0ogipgd134r0pr01qv1k0ogiq0', 
            BASE_URL: 'https://finnhub.io/api/v1',
            RATE_LIMIT: 60 // Requests pro Minute
        },
        ALPHA_VANTAGE: {
            // Ersetzen Sie 'DEMO_KEY_REPLACE_ME' mit Ihrem echten API-Schlüssel
            KEY: '20G28M62O8HVFIOW',
            BASE_URL: 'https://www.alphavantage.co/query',
            RATE_LIMIT: 5
        },
        COINGECKO: {
            BASE_URL: 'https://api.coingecko.com/api/v3',
            RATE_LIMIT: 50 // CoinGecko benötigt keinen API-Key für Basic Plan
        },
        HUGGINGFACE: {
            // Ersetzen Sie 'DEMO_TOKEN_REPLACE_ME' mit Ihrem echten Token
            TOKEN: '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',
            MODEL: 'ProsusAI/finbert',
            BASE_URL: 'https://api-inference.huggingface.co/models/',
            RATE_LIMIT: 30
        }
    },
    
    // Rate Limiting
    RATE_LIMITS: {
        FINNHUB: { requests: 0, resetTime: Date.now() + 60000 },
        ALPHA_VANTAGE: { requests: 0, resetTime: Date.now() + 60000 },
        COINGECKO: { requests: 0, resetTime: Date.now() + 60000 },
        HUGGINGFACE: { requests: 0, resetTime: Date.now() + 60000 }
    },
    
    // App Settings
    SETTINGS: {
        UPDATE_INTERVAL: 30000, // 30 Sekunden
        MAX_NEWS_ITEMS: 20,
        MAX_SIGNALS: 10,
        MAX_IDEAS: 5,
        CACHE_DURATION: 300000, // 5 Minuten
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000
    },
    
    // UI Constants
    UI: {
        LOADING_DELAY: 500,
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 300,
        TOAST_DURATION: 5000
    },
    
    // Trading Signal Thresholds
    SIGNALS: {
        BULLISH_THRESHOLD: 0.6,
        BEARISH_THRESHOLD: -0.6,
        CONFIDENCE_THRESHOLD: 0.5
    },
    
    // Error Messages
    ERRORS: {
        NETWORK: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
        API_LIMIT: 'API-Limit erreicht. Bitte versuchen Sie es später erneut.',
        NOT_FOUND: 'Die angeforderten Daten wurden nicht gefunden.',
        GENERIC: 'Ein unerwarteter Fehler ist aufgetreten.',
        TIMEOUT: 'Die Anfrage hat zu lange gedauert.',
        MISSING_API_KEY: 'API-Schlüssel fehlt. Bitte konfigurieren Sie Ihre API-Schlüssel.'
    }
};

// Sichere API-Schlüssel-Verwaltung für Browser
const APIKeys = {
    init() {
        this.validateKeys();
    },
    
    validateKeys() {
        const warnings = [];
        
        if (CONFIG.APIs.FINNHUB.KEY === 'DEMO_KEY_REPLACE_ME') {
            warnings.push('FINNHUB_API_KEY');
        }
        
        if (CONFIG.APIs.ALPHA_VANTAGE.KEY === 'DEMO_KEY_REPLACE_ME') {
            warnings.push('ALPHA_VANTAGE_API_KEY');
        }
        
        if (CONFIG.APIs.HUGGINGFACE.TOKEN === 'DEMO_TOKEN_REPLACE_ME') {
            warnings.push('HUGGINGFACE_TOKEN');
        }
        
        if (warnings.length > 0) {
            console.warn('⚠️ WARNUNG: Demo-API-Schlüssel werden verwendet!');
            console.warn('📝 Bitte konfigurieren Sie folgende Schlüssel in config.js:', warnings.join(', '));
            console.warn('💡 Ersetzen Sie die DEMO_KEY_REPLACE_ME Werte mit echten API-Schlüsseln');
        } else {
            console.log('✅ API-Schlüssel konfiguriert');
        }
    },
    
    get(apiName) {
        const key = CONFIG.APIs[apiName]?.KEY || CONFIG.APIs[apiName]?.TOKEN;
        
        if (!key || key.includes('DEMO_KEY') || key.includes('DEMO_TOKEN')) {
            console.warn(`⚠️ ${apiName} API-Schlüssel nicht konfiguriert - verwende Demo-Daten`);
            return null;
        }
        
        return key;
    }
};

// Utility Functions (vollständig für Browser)
const Utils = {
    // Format currency
    formatCurrency: (value, currency = 'USD') => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        
        try {
            const formatters = {
                USD: new Intl.NumberFormat('de-DE', { 
                    style: 'currency', 
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }),
                EUR: new Intl.NumberFormat('de-DE', { 
                    style: 'currency', 
                    currency: 'EUR',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            };
            
            return formatters[currency] ? formatters[currency].format(value) : `$${Number(value).toFixed(2)}`;
        } catch (error) {
            return `$${Number(value).toFixed(2)}`;
        }
    },
    
    // Format percentage
    formatPercentage: (value) => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${Number(value).toFixed(2)}%`;
    },
    
    // Format large numbers
    formatNumber: (value) => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        
        const num = Number(value);
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        
        try {
            return new Intl.NumberFormat('de-DE').format(num);
        } catch (error) {
            return num.toString();
        }
    },
    
    // Format date/time
    formatTime: (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
        } catch (error) {
            return '--:--';
        }
    },
    
    formatDate: (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return '--.--.----';
        }
    },
    
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Sanitize HTML - WICHTIG für Sicherheit
    sanitizeHTML: (str) => {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    // Generate random ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Sleep function
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Check if rate limit exceeded
    checkRateLimit: (apiName) => {
        const limit = CONFIG.RATE_LIMITS[apiName];
        if (!limit) return true;
        
        const now = Date.now();
        
        if (now > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = now + 60000;
        }
        
        return limit.requests < CONFIG.APIs[apiName].RATE_LIMIT;
    },
    
    // Increment rate limit counter
    incrementRateLimit: (apiName) => {
        if (CONFIG.RATE_LIMITS[apiName]) {
            CONFIG.RATE_LIMITS[apiName].requests++;
        }
    },
    
    // Validate symbol format
    validateSymbol: (symbol) => {
        return /^[A-Z]{1,10}$/.test(symbol.toUpperCase());
    },
    
    // Sichere URL-Validierung
    isValidUrl: (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }
};

// Cache Manager (erweitert für Sicherheit)
const CacheManager = {
    cache: new Map(),
    maxSize: 1000, // Maximale Cache-Größe
    
    set: (key, data, duration = CONFIG.SETTINGS.CACHE_DURATION) => {
        // Cache-Größe begrenzen
        if (CacheManager.cache.size >= CacheManager.maxSize) {
            const firstKey = CacheManager.cache.keys().next().value;
            CacheManager.cache.delete(firstKey);
        }
        
        const expiry = Date.now() + duration;
        CacheManager.cache.set(key, { data, expiry });
    },
    
    get: (key) => {
        const item = CacheManager.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            CacheManager.cache.delete(key);
            return null;
        }
        
        return item.data;
    },
    
    clear: () => {
        CacheManager.cache.clear();
    },
    
    has: (key) => {
        const item = CacheManager.cache.get(key);
        return item && Date.now() <= item.expiry;
    },
    
    // Cache-Statistiken
    getStats: () => {
        const now = Date.now();
        let expired = 0;
        
        for (const [key, value] of CacheManager.cache.entries()) {
            if (now > value.expiry) expired++;
        }
        
        return {
            total: CacheManager.cache.size,
            expired,
            valid: CacheManager.cache.size - expired
        };
    }
};

// Demo-Daten Fallback für Entwicklung ohne API-Keys
const createDemoSignals = () => {
    return [
        {
            id: Utils.generateId(),
            symbol: 'AAPL',
            company: 'Apple Inc.',
            direction: 'bullish',
            confidence: 78,
            reason: 'Demo-Signal: Positive Marktstimmung in lokalen Nachrichten-Simulation.',
            currentPrice: 150.25,
            change: 2.5,
            timestamp: Date.now(),
            newsCount: 3,
            type: 'DEMO'
        },
        {
            id: Utils.generateId(),
            symbol: 'TSLA',
            company: 'Tesla Inc.',
            direction: 'bearish',
            confidence: 65,
            reason: 'Demo-Signal: Negative Sentiment-Analyse in simulierten Berichten.',
            currentPrice: 180.50,
            change: -1.8,
            timestamp: Date.now(),
            newsCount: 4,
            type: 'DEMO'
        },
        {
            id: Utils.generateId(),
            symbol: 'NVDA',
            company: 'NVIDIA Corporation',
            direction: 'bullish',
            confidence: 85,
            reason: 'Demo-Signal: KI-Revolution treibt Chip-Nachfrage in Simulationen.',
            currentPrice: 220.75,
            change: 3.2,
            timestamp: Date.now(),
            newsCount: 5,
            type: 'DEMO'
        }
    ];
};

// Initialize API Keys validation
document.addEventListener('DOMContentLoaded', () => {
    APIKeys.init();
});

// Exportiere Demo-Daten für Fallback
window.createDemoSignals = createDemoSignals;

// Global exports für Browser
window.CONFIG = CONFIG;
window.APIKeys = APIKeys;
window.Utils = Utils;
window.CacheManager = CacheManager;

console.log('💰 MoneyMagnet Config loaded (Browser-kompatibel)');