// MoneyMagnet v2.0 - Enhanced API Configuration (KORRIGIERT)
// WICHTIG: Echte API-Keys sind jetzt konfiguriert

const CONFIG = {
    APIs: {
        // Existing APIs with demo keys (fallback)
        FINNHUB: {
            KEY: 'd134r0pr01qv1k0ogipgd134r0pr01qv1k0ogiq0', 
            BASE_URL: 'https://finnhub.io/api/v1',
            RATE_LIMIT: 60 // 60 calls per minute
        },
        ALPHA_VANTAGE: {
            KEY: '20G28M62O8HVFIOW',
            BASE_URL: 'https://www.alphavantage.co/query',
            RATE_LIMIT: 5 // 5 calls per minute
        },
        COINGECKO: {
            BASE_URL: 'https://api.coingecko.com/api/v3',
            RATE_LIMIT: 50 // No API key needed
        },
        HUGGINGFACE: {
            TOKEN: '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',
            MODEL: 'ProsusAI/finbert',
            BASE_URL: 'https://api-inference.huggingface.co/models/',
            RATE_LIMIT: 30
        },
        
        // NEW REAL APIs
        YAHOO_FINANCE: {
            KEY: 'db1a954ed4msh9cd0e3266fb903cp1f9d9fjsnbddf8d68d908',
            BASE_URL: 'https://yahoo-finance-real-time1.p.rapidapi.com',
            HOST: 'yahoo-finance-real-time1.p.rapidapi.com',
            RATE_LIMIT: 500, // 500 calls per month - need to distribute carefully
            DAILY_LIMIT: Math.floor(500 / 31) // ~16 calls per day
        },
        EXCHANGE_RATE: {
            KEY: 'aba7caaad0b2e03003bf3d33',
            BASE_URL: 'https://v6.exchangerate-api.com/v6',
            RATE_LIMIT: 1500, // 1500 calls per month
            DAILY_LIMIT: Math.floor(1500 / 31) // ~48 calls per day
        },
        NEWS_API: {
            KEY: '479d91ee6688469eb107e9ad11531853',
            BASE_URL: 'https://newsapi.org/v2',
            RATE_LIMIT: 100, // 100 calls per day for free plan
            DAILY_LIMIT: 100
        },
        POLYGON: {
            KEY: 'aTn_Mpc8knmFZHyCPHHNR5VvXQs_l57P',
            BASE_URL: 'https://api.polygon.io/v2',
            RATE_LIMIT: 5, // 5 calls per minute
            DAILY_LIMIT: 7200 // 5 * 60 * 24 theoretical max, but we'll be conservative
        }
    },
    
    // Enhanced Rate Limiting with Daily Tracking
    RATE_LIMITS: {
        FINNHUB: { requests: 0, resetTime: Date.now() + 60000, dailyUsage: 0, lastReset: new Date().toDateString() },
        ALPHA_VANTAGE: { requests: 0, resetTime: Date.now() + 60000, dailyUsage: 0, lastReset: new Date().toDateString() },
        COINGECKO: { requests: 0, resetTime: Date.now() + 60000, dailyUsage: 0, lastReset: new Date().toDateString() },
        HUGGINGFACE: { requests: 0, resetTime: Date.now() + 60000, dailyUsage: 0, lastReset: new Date().toDateString() },
        YAHOO_FINANCE: { requests: 0, resetTime: Date.now() + 86400000, dailyUsage: 0, lastReset: new Date().toDateString() },
        EXCHANGE_RATE: { requests: 0, resetTime: Date.now() + 86400000, dailyUsage: 0, lastReset: new Date().toDateString() },
        NEWS_API: { requests: 0, resetTime: Date.now() + 86400000, dailyUsage: 0, lastReset: new Date().toDateString() },
        POLYGON: { requests: 0, resetTime: Date.now() + 60000, dailyUsage: 0, lastReset: new Date().toDateString() }
    },
    
    // Smart Usage Distribution
    USAGE_STRATEGY: {
        // Morning peak (9-12): 40% of daily quota
        // Afternoon (12-18): 35% of daily quota  
        // Evening (18-24): 20% of daily quota
        // Night (0-9): 5% of daily quota
        TIME_DISTRIBUTION: {
            MORNING: 0.4,   // 9-12
            AFTERNOON: 0.35, // 12-18
            EVENING: 0.2,   // 18-24
            NIGHT: 0.05     // 0-9
        },
        
        // Priority for different data types
        PRIORITY: {
            REAL_TIME_QUOTES: 1,    // Highest priority
            NEWS: 2,
            MARKET_DATA: 3,
            HISTORICAL_DATA: 4,
            EXCHANGE_RATES: 5       // Lowest priority (cached longer)
        }
    },
    
    // App Settings
    SETTINGS: {
        UPDATE_INTERVAL: 60000, // Increased to 1 minute to save API calls
        MAX_NEWS_ITEMS: 20,
        MAX_SIGNALS: 10,
        MAX_IDEAS: 5,
        CACHE_DURATION: 600000, // Increased to 10 minutes
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 2000,
        
        // New caching strategies
        CACHE_STRATEGIES: {
            QUOTES: 60000,          // 1 minute for real-time quotes
            NEWS: 300000,           // 5 minutes for news
            EXCHANGE_RATES: 3600000, // 1 hour for exchange rates
            COMPANY_DATA: 86400000,  // 24 hours for company profiles
            MARKET_DATA: 180000     // 3 minutes for market movers
        }
    },
    
    // UI Constants
    UI: {
        LOADING_DELAY: 500,
        ANIMATION_DURATION: 300,
        DEBOUNCE_DELAY: 500, // Increased to reduce API calls
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
        API_LIMIT: 'API-Limit erreicht. Verwende Cache-Daten.',
        NOT_FOUND: 'Die angeforderten Daten wurden nicht gefunden.',
        GENERIC: 'Ein unerwarteter Fehler ist aufgetreten.',
        TIMEOUT: 'Die Anfrage hat zu lange gedauert.',
        MISSING_API_KEY: 'API-Schlüssel fehlt. Bitte konfigurieren Sie Ihre API-Schlüssel.',
        DAILY_LIMIT_REACHED: 'Tägliches API-Limit erreicht. Verwende Cache-Daten.'
    }
};

// Enhanced API Key Management with Real Keys
const APIKeys = {
    init() {
        this.validateKeys();
        this.initializeDailyLimits();
    },
    
    initializeDailyLimits() {
        const today = new Date().toDateString();
        
        // Reset daily counters if it's a new day
        Object.keys(CONFIG.RATE_LIMITS).forEach(apiName => {
            const limit = CONFIG.RATE_LIMITS[apiName];
            if (limit.lastReset !== today) {
                limit.dailyUsage = 0;
                limit.lastReset = today;
                console.log(`📅 Reset daily counter for ${apiName}`);
            }
        });
        
        // Store in localStorage for persistence
        localStorage.setItem('moneymagnet_rate_limits', JSON.stringify(CONFIG.RATE_LIMITS));
    },
    
    validateKeys() {
        const validKeys = [];
        const missingKeys = [];
        
        // Check all API keys
        const keyChecks = [
            { name: 'FINNHUB', key: CONFIG.APIs.FINNHUB.KEY },
            { name: 'ALPHA_VANTAGE', key: CONFIG.APIs.ALPHA_VANTAGE.KEY },
            { name: 'HUGGINGFACE', token: CONFIG.APIs.HUGGINGFACE.TOKEN },
            { name: 'YAHOO_FINANCE', key: CONFIG.APIs.YAHOO_FINANCE.KEY },
            { name: 'EXCHANGE_RATE', key: CONFIG.APIs.EXCHANGE_RATE.KEY },
            { name: 'NEWS_API', key: CONFIG.APIs.NEWS_API.KEY },
            { name: 'POLYGON', key: CONFIG.APIs.POLYGON.KEY }
        ];
        
        keyChecks.forEach(check => {
            const key = check.key || check.token;
            if (key && key.length > 10 && !key.includes('DEMO')) {
                validKeys.push(check.name);
            } else {
                missingKeys.push(check.name);
            }
        });
        
        console.log('✅ Configured APIs:', validKeys.join(', '));
        if (missingKeys.length > 0) {
            console.warn('⚠️ Missing API keys:', missingKeys.join(', '));
        }
        
        console.log('🔑 Total APIs available:', validKeys.length);
    },
    
    get(apiName) {
        const api = CONFIG.APIs[apiName];
        if (!api) return null;
        
        const key = api.KEY || api.TOKEN;
        
        if (!key || key.includes('DEMO_KEY') || key.includes('DEMO_TOKEN')) {
            console.warn(`⚠️ ${apiName} API-Schlüssel nicht konfiguriert`);
            return null;
        }
        
        return key;
    },
    
    // Check if we can make an API call based on daily limits
    canMakeCall(apiName) {
        const limit = CONFIG.RATE_LIMITS[apiName];
        const apiConfig = CONFIG.APIs[apiName];
        
        if (!limit || !apiConfig) return false;
        
        // Check daily limit
        if (apiConfig.DAILY_LIMIT && limit.dailyUsage >= apiConfig.DAILY_LIMIT) {
            console.warn(`📊 Daily limit reached for ${apiName}: ${limit.dailyUsage}/${apiConfig.DAILY_LIMIT}`);
            return false;
        }
        
        // Check rate limit
        const now = Date.now();
        if (now > limit.resetTime) {
            limit.requests = 0;
            limit.resetTime = now + (apiName.includes('YAHOO') || apiName.includes('NEWS') || apiName.includes('EXCHANGE') ? 86400000 : 60000);
        }
        
        return limit.requests < apiConfig.RATE_LIMIT;
    },
    
    // Get current API usage stats
    getUsageStats() {
        const stats = {};
        
        Object.keys(CONFIG.RATE_LIMITS).forEach(apiName => {
            const limit = CONFIG.RATE_LIMITS[apiName];
            const apiConfig = CONFIG.APIs[apiName];
            
            stats[apiName] = {
                dailyUsage: limit.dailyUsage,
                dailyLimit: apiConfig.DAILY_LIMIT || 'Unlimited',
                remainingDaily: apiConfig.DAILY_LIMIT ? apiConfig.DAILY_LIMIT - limit.dailyUsage : 'Unlimited',
                currentRequests: limit.requests,
                rateLimit: apiConfig.RATE_LIMIT,
                usagePercentage: apiConfig.DAILY_LIMIT ? Math.round((limit.dailyUsage / apiConfig.DAILY_LIMIT) * 100) : 0
            };
        });
        
        return stats;
    }
};

// Enhanced Utils with Smart Rate Limiting (KORRIGIERT - formatTime hinzugefügt)
const Utils = {
    // Existing utility functions...
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
    
    formatPercentage: (value) => {
        if (value === null || value === undefined || isNaN(value)) return 'N/A';
        const sign = value >= 0 ? '+' : '';
        return `${sign}${Number(value).toFixed(2)}%`;
    },
    
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
    
    // FEHLENDE FUNKTION HINZUGEFÜGT
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
    
    sanitizeHTML: (str) => {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },
    
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },
    
    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    
    // Enhanced rate limiting with smart distribution
    checkRateLimit: (apiName) => {
        return APIKeys.canMakeCall(apiName);
    },
    
    // Smart rate limit increment with daily tracking
    incrementRateLimit: (apiName) => {
        const limit = CONFIG.RATE_LIMITS[apiName];
        if (limit) {
            limit.requests++;
            limit.dailyUsage++;
            
            // Persist daily usage
            localStorage.setItem('moneymagnet_rate_limits', JSON.stringify(CONFIG.RATE_LIMITS));
            
            console.log(`📊 ${apiName} usage: ${limit.dailyUsage}/${CONFIG.APIs[apiName].DAILY_LIMIT || '∞'} daily, ${limit.requests}/${CONFIG.APIs[apiName].RATE_LIMIT} current`);
        }
    },
    
    // Get current time period for smart distribution
    getCurrentTimePeriod() {
        const hour = new Date().getHours();
        
        if (hour >= 9 && hour < 12) return 'MORNING';
        if (hour >= 12 && hour < 18) return 'AFTERNOON';
        if (hour >= 18 && hour < 24) return 'EVENING';
        return 'NIGHT';
    },
    
    // Calculate available quota for current time period
    getAvailableQuota(apiName) {
        const apiConfig = CONFIG.APIs[apiName];
        const limit = CONFIG.RATE_LIMITS[apiName];
        
        if (!apiConfig.DAILY_LIMIT) return Infinity;
        
        const period = this.getCurrentTimePeriod();
        const periodQuota = Math.floor(apiConfig.DAILY_LIMIT * CONFIG.USAGE_STRATEGY.TIME_DISTRIBUTION[period]);
        const remainingDaily = apiConfig.DAILY_LIMIT - limit.dailyUsage;
        
        return Math.min(periodQuota, remainingDaily);
    },
    
    validateSymbol: (symbol) => {
        return /^[A-Z]{1,10}$/.test(symbol.toUpperCase());
    },
    
    isValidUrl: (url) => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }
};

// Enhanced Cache Manager with different strategies
const CacheManager = {
    cache: new Map(),
    maxSize: 2000, // Increased cache size
    
    set: (key, data, duration = null) => {
        // Use smart duration based on data type
        if (!duration) {
            duration = CacheManager.getSmartCacheDuration(key);
        }
        
        // Cache size management
        if (CacheManager.cache.size >= CacheManager.maxSize) {
            CacheManager.cleanup();
        }
        
        const expiry = Date.now() + duration;
        CacheManager.cache.set(key, { 
            data, 
            expiry, 
            created: Date.now(),
            hits: 0 
        });
        
        console.log(`💾 Cached ${key} for ${duration/1000}s`);
    },
    
    get: (key) => {
        const item = CacheManager.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            CacheManager.cache.delete(key);
            return null;
        }
        
        item.hits++;
        console.log(`✅ Cache hit for ${key} (${item.hits} hits)`);
        return item.data;
    },
    
    // Smart cache duration based on data type
    getSmartCacheDuration: (key) => {
        if (key.includes('quote') || key.includes('price')) {
            return CONFIG.SETTINGS.CACHE_STRATEGIES.QUOTES;
        }
        if (key.includes('news')) {
            return CONFIG.SETTINGS.CACHE_STRATEGIES.NEWS;
        }
        if (key.includes('exchange') || key.includes('rate')) {
            return CONFIG.SETTINGS.CACHE_STRATEGIES.EXCHANGE_RATES;
        }
        if (key.includes('profile') || key.includes('company')) {
            return CONFIG.SETTINGS.CACHE_STRATEGIES.COMPANY_DATA;
        }
        if (key.includes('market') || key.includes('movers')) {
            return CONFIG.SETTINGS.CACHE_STRATEGIES.MARKET_DATA;
        }
        
        return CONFIG.SETTINGS.CACHE_DURATION; // Default
    },
    
    // Intelligent cache cleanup
    cleanup: () => {
        const items = Array.from(CacheManager.cache.entries());
        
        // Sort by least recently used and lowest hit count
        items.sort((a, b) => {
            const scoreA = a[1].hits / (Date.now() - a[1].created);
            const scoreB = b[1].hits / (Date.now() - b[1].created);
            return scoreA - scoreB;
        });
        
        // Remove bottom 25%
        const removeCount = Math.floor(items.length * 0.25);
        for (let i = 0; i < removeCount; i++) {
            CacheManager.cache.delete(items[i][0]);
        }
        
        console.log(`🧹 Cleaned up ${removeCount} cache entries`);
    },
    
    clear: () => {
        CacheManager.cache.clear();
    },
    
    has: (key) => {
        const item = CacheManager.cache.get(key);
        return item && Date.now() <= item.expiry;
    },
    
    getStats: () => {
        const now = Date.now();
        let expired = 0;
        let totalHits = 0;
        
        for (const [key, value] of CacheManager.cache.entries()) {
            if (now > value.expiry) expired++;
            totalHits += value.hits;
        }
        
        return {
            total: CacheManager.cache.size,
            expired,
            valid: CacheManager.cache.size - expired,
            totalHits,
            hitRate: CacheManager.cache.size > 0 ? totalHits / CacheManager.cache.size : 0
        };
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    APIKeys.init();
    
    // Load persisted rate limits
    const stored = localStorage.getItem('moneymagnet_rate_limits');
    if (stored) {
        try {
            const storedLimits = JSON.parse(stored);
            Object.assign(CONFIG.RATE_LIMITS, storedLimits);
        } catch (error) {
            console.warn('Failed to load stored rate limits');
        }
    }
});

// Global exports
window.CONFIG = CONFIG;
window.APIKeys = APIKeys;
window.Utils = Utils;
window.CacheManager = CacheManager;

console.log('💰 MoneyMagnet Enhanced Config loaded with REAL API keys');