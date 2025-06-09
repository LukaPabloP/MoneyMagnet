// MoneyMagnet v2.0 - Configuration
const CONFIG = {
    APIs: {
        FINNHUB: {
            KEY: 'd134r0pr01qv1k0ogipgd134r0pr01qv1k0ogiq0',
            BASE_URL: 'https://finnhub.io/api/v1',
            RATE_LIMIT: 60 // Requests pro Minute
        },
        ALPHA_VANTAGE: {
            KEY: '20G28M62O8HVFIOW',
            BASE_URL: 'https://www.alphavantage.co/query',
            RATE_LIMIT: 5
        },
        COINGECKO: {
            BASE_URL: 'https://api.coingecko.com/api/v3',
            RATE_LIMIT: 50
        },
        HUGGINGFACE: {
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
        TIMEOUT: 'Die Anfrage hat zu lange gedauert.'
    }
};

// Utility Functions
const Utils = {
    // Format currency
    formatCurrency: (value, currency = 'USD') => {
        if (value === null || value === undefined) return 'N/A';
        
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
        
        return formatters[currency] ? formatters[currency].format(value) : `$${value.toFixed(2)}`;
    },
    
    // Format percentage
    formatPercentage: (value) => {
        if (value === null || value === undefined) return 'N/A';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    },
    
    // Format large numbers
    formatNumber: (value) => {
        if (value === null || value === undefined) return 'N/A';
        
        if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
        
        return new Intl.NumberFormat('de-DE').format(value);
    },
    
    // Format date/time
    formatTime: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('de-DE', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    },
    
    formatDate: (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
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
    
    // Sanitize HTML
    sanitizeHTML: (str) => {
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
        const now = Date.now();
        
        if (now > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = now + 60000;
        }
        
        return limit.requests < CONFIG.APIs[apiName].RATE_LIMIT;
    },
    
    // Increment rate limit counter
    incrementRateLimit: (apiName) => {
        CONFIG.RATE_LIMITS[apiName].requests++;
    },
    
    // Validate symbol format
    validateSymbol: (symbol) => {
        return /^[A-Z]{1,10}$/.test(symbol.toUpperCase());
    }
};

// Cache Manager
const CacheManager = {
    cache: new Map(),
    
    set: (key, data, duration = CONFIG.SETTINGS.CACHE_DURATION) => {
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
    }
};