// Start automatic data updates with smart scheduling
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(async () => {
            console.log('⏰ Auto-update triggered with enhanced APIs');
            
            try {
                // Check current API usage before auto-update
                const period = Utils.getCurrentTimePeriod();
                console.log(`🕐 Current period: ${period}`);
                
                // Only update visible tab to reduce API calls
                const activeTab = document.querySelector('.tab-btn.active');
                const tabName = activeTab?.dataset.tab;
                
                // Smart update based on time period and available quota
                const availableQuota = {
                    yahoo: Utils.getAvailableQuota('YAHOO_FINANCE'),
                    news: Utils.getAvailableQuota('NEWS_API'),
                    finnhub: Utils.getAvailableQuota('FINNHUB')
                };
                
                console.log('📊 Available quotas:', availableQuota);
                
                // Update strategy based on available resources
                if (availableQuota.yahoo > 5 || availableQuota.news > 10) {
                    // High quota available - update active tab
                    switch (tabName) {
                        case 'signals':
                            await this.loadSignals();
                            break;
                        case 'news':
                            await this.loadNews();
                            break;
                        case 'market':
                            await this.loadMarketData();
                            break;
                        case 'ideas':
                            await this.loadTradingIdeas();
                            break;
                        default:
                            // Update signals as default (most important)
                            await this.loadSignals();
                    }
                } else {
                    // Low quota - only update from cache or use fallbacks
                    console.log('⚠️ Low API quota - using cached data');
                    UIManager.showToast('Verwende Cache-Daten (API-Limit erreicht)', 'info');
                }
                
                UIManager.updateLastUpdateTime();
                
            } catch (error) {
                console.error('❌ Enhanced auto-update failed:', error);
            }
        }, CONFIG.SETTINGS.UPDATE_INTERVAL);
        
        console.log(`⏱️ Enhanced auto-update started (${CONFIG.SETTINGS.UPDATE_INTERVAL / 1000}s interval)`);
    },

    // Stop automatic updates
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Enhanced auto-update stopped');
        }
    },

    // Set up event listeners with enhanced monitoring
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoUpdate();
                console.log('📱 Page hidden - stopped auto-updates');
            } else {
                this.startAutoUpdate();
                console.log('📱 Page visible - resumed auto-updates');
            }
        });

        // Handle window beforeunload
        window.addEventListener('beforeunload', () => {
            this.stopAutoUpdate();
            APIManager.cleanup();
        });

        // Handle network status changes
        window.addEventListener('online', () => {
            console.log('🌐 Network connection restored');
            UIManager.showToast('Internetverbindung wiederhergestellt', 'success');
            this.refreshData();
        });

        window.addEventListener('offline', () => {
            console.log('🚫 Network connection lost');
            UIManager.showToast('Internetverbindung verloren - verwende Cache-Daten', 'warning');
            this.stopAutoUpdate();
        });

        // Tab change listeners
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.onTabChange(tabName);
            });
        });

        // API usage monitoring (every 5 minutes)
        setInterval(() => {
            const usageReport = APIManager.getAPIUsageReport();
            const criticalAPIs = usageReport.recommendations
                .filter(rec => rec.level === 'critical')
                .map(rec => rec.api);
            
            if (criticalAPIs.length > 0) {
                console.warn('⚠️ Critical API usage:', criticalAPIs);
                UIManager.showToast(`API-Limits kritisch: ${criticalAPIs.join(', ')}`, 'warning');
            }
        }, 300000); // Every 5 minutes

        console.log('👂 Enhanced event listeners set up');
    },

    // Handle tab changes with smart loading
    onTabChange(tabName) {
        console.log(`📑 Tab changed to: ${tabName}`);
        
        // Check if tab needs fresh data
        const container = document.getElementById(`${tabName}-container`) || 
                         document.querySelector(`#${tabName}-tab .loading`);
        
        if (container && container.querySelector('.loading')) {
            // Check available quota before loading
            const availableQuota = Utils.getAvailableQuota('YAHOO_FINANCE') + Utils.getAvailableQuota('NEWS_API');
            
            if (availableQuota > 3) {
                switch (tabName) {
                    case 'signals':
                        this.loadSignals();
                        break;
                    case 'news':
                        this.loadNews();
                        break;
                    case 'market':
                        this.loadMarketData();
                        break;
                    case 'ideas':
                        this.loadTradingIdeas();
                        break;
                }
            } else {
                console.log('⚠️ Low quota - showing cached data message');
                UIManager.showToast('API-Limit erreicht - Cache-Daten werden angezeigt', 'info');
            }
        }
    },

    // Enhanced error recovery
    async retryOperation(operation, context) {
        console.log(`🔄 Retrying enhanced operation: ${context}`);
        UIManager.showToast(`Wiederhole ${context} mit alternativen APIs...`, 'info');
        
        try {
            await operation();
            UIManager.showToast(`${context} erfolgreich mit erweiterten APIs!`, 'success');
        } catch (error) {
            console.error(`❌ Enhanced retry failed for ${context}:`, error);
            
            // Try to show what APIs are available
            const healthCheck = await APIManager.performHealthCheck();
            const healthyAPIs = Object.entries(healthCheck.apis)
                .filter(([name, status]) => status.status === 'healthy')
                .map(([name]) => name);
            
            if (healthyAPIs.length > 0) {
                UIManager.showToast(`Verfügbare APIs: ${healthyAPIs.join(', ')}`, 'info');
            } else {
                UIManager.showToast('Alle APIs nicht verfügbar - verwende Cache-Daten', 'warning');
            }
        }
    },

    // Get enhanced app status with fallback information
    getStatus() {
        const apiStats = APIManager.getStats();
        const usageReport = APIManager.getAPIUsageReport();
        const fallbackStatus = window.FallbackDataManager ? FallbackDataManager.getStatus() : { fallbackActive: false };
        
        return {
            initialized: this.initialized,
            autoUpdateActive: !!this.updateInterval,
            lastUpdate: Utils.formatTime(Date.now()),
            networkStatus: navigator.onLine ? 'online' : 'offline',
            cacheSize: CacheManager.cache.size,
            enhancedAPIs: {
                configured: Object.keys(apiStats.apiKeysConfigured).filter(key => apiStats.apiKeysConfigured[key]).length,
                healthy: Object.values(APIManager.lastHealthCheck?.apis || {}).filter(api => api.status === 'healthy').length,
                usage: usageReport.usage,
                recommendations: usageReport.recommendations.length
            },
            currentPeriod: Utils.getCurrentTimePeriod(),
            availableQuotas: {
                yahoo: Utils.getAvailableQuota('YAHOO_FINANCE'),
                news: Utils.getAvailableQuota('NEWS_API'),
                exchange: Utils.getAvailableQuota('EXCHANGE_RATE'),
                polygon: Utils.getAvailableQuota('POLYGON')
            },
            fallback: fallbackStatus
        };
    },

    // Enhanced cleanup
    cleanup() {
        this.stopAutoUpdate();
        APIManager.cleanup();
        CacheManager.clear();
        this.initialized = false;
        console.log('🧹 Enhanced app cleanup completed');
    },

    // Debug helper for enhanced features with fallback info
    showAPIStatus() {
        const status = this.getStatus();
        console.log('📊 Enhanced API Status:', status);
        
        const statusText = `
APIs konfiguriert: ${status.enhancedAPIs.configured}
APIs gesund: ${status.enhancedAPIs.healthy}
Aktuelle Periode: ${status.currentPeriod}
Fallback aktiv: ${status.fallback.fallbackActive ? 'JA' : 'NEIN'}
Verfügbare Quotas:
- Yahoo Finance: ${status.availableQuotas.yahoo}
- NewsAPI: ${status.availableQuotas.news}
- ExchangeRate: ${status.availableQuotas.exchange}
- Polygon: ${status.availableQuotas.polygon}
Cache-Größe: ${status.cacheSize}
`;
        
        console.log(statusText);
        UIManager.showToast('API-Status in Konsole angezeigt', 'info');
        return status;
    }
};

// Enhanced global error handler
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
    
    // Enhanced error reporting with API status
    if (event.error.message.includes('API') || event.error.message.includes('fetch')) {
        const apiStatus = APIManager.getStats();
        console.log('📊 API Status during error:', apiStatus);
        UIManager.showToast('API-Fehler aufgetreten - prüfe Konsole für Details', 'error');
    } else {
        UIManager.showToast('Ein unerwarteter Fehler ist aufgetreten', 'error');
    }
});

// Enhanced unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
    
    // Handle API-related promise rejections gracefully
    if (event.reason && event.reason.message) {
        if (event.reason.message.includes('Rate limit')) {
            console.log('⚠️ Rate limit reached - using cached data');
            UIManager.showToast('API-Limit erreicht - verwende Cache-Daten', 'warning');
        } else if (event.reason.message.includes('API')) {
            console.log('⚠️ API error - trying fallback');
            UIManager.showToast('API-Fehler - verwende Fallback-Quellen', 'warning');
        } else {
            UIManager.showToast('Ein Netzwerkfehler ist aufgetreten', 'error');
        }
    }
    
    event.preventDefault();
});

// Enhanced global exports for debugging
window.MoneyMagnet = {
    app,
    APIManager,
    UIManager,
    Utils,
    CONFIG,
    SYMBOLS,
    CacheManager,
    // Enhanced debugging methods
    showAPIStatus: () => app.showAPIStatus(),
    getUsageReport: () => APIManager.getAPIUsageReport(),
    getHealthCheck: () => APIManager.performHealthCheck(),
    resetDailyLimits: () => {
        Object.keys(CONFIG.RATE_LIMITS).forEach(apiName => {
            CONFIG.RATE_LIMITS[apiName].dailyUsage = 0;
            CONFIG.RATE_LIMITS[apiName].lastReset = new Date().toDateString();
        });
        console.log('🔄 Daily limits reset for testing');
    }
};

// Enhanced initialization logging
// Enhanced initialization logging
console.log('💰 MoneyMagnet v2.0 Enhanced loaded with:');
console.log('📊 APIs: Yahoo Finance, NewsAPI, ExchangeRate-API, Polygon.io');
console.log('🧠 Smart Rate Limiting & Multi-Source Fallbacks');
console.log('💾 Intelligent Caching & Auto-Optimization');
console.log('🔧 Debug: window.MoneyMagnet.showAPIStatus()');

// Performance monitoring
if (typeof performance !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log(`⚡ App loaded in ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            }
        }, 1000);
    });
}// MoneyMagnet v2.0 - Enhanced Main Application (KORRIGIERT)
const app = {
    initialized: false,
    updateInterval: null,
    
    // Initialize the application
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 MoneyMagnet v2.0 starting with enhanced APIs...');
            
            // Initialize UI components
            UIManager.init();
            
            // Wait for API Manager to be ready
            await this.waitForAPIManager();
            
            // Load initial data
            await this.loadInitialData();
            
            // Start auto-update cycle
            this.startAutoUpdate();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ MoneyMagnet v2.0 initialized successfully with enhanced APIs');
            
            UIManager.showToast('MoneyMagnet v2.0 mit erweiterten APIs gestartet! 🚀', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            UIManager.showToast('Fehler beim Starten der App', 'error');
        }
    },

    // Wait for API Manager to be ready
    async waitForAPIManager() {
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds max wait
        
        while (!window.APIManager && attempts < maxAttempts) {
            await Utils.sleep(100);
            attempts++;
        }
        
        if (!window.APIManager) {
            throw new Error('API Manager not available');
        }
        
        console.log('✅ API Manager ready');
    },

    // Load all initial data with enhanced APIs
    async loadInitialData() {
        console.log('📊 Loading initial data with enhanced APIs...');
        
        // Update last update time
        UIManager.updateLastUpdateTime();
        
        // Load data for all tabs simultaneously with better error handling
        const loadPromises = [
            this.loadSignals().catch(error => console.error('Signals failed:', error.message)),
            this.loadNews().catch(error => console.error('News failed:', error.message)),
            this.loadMarketData().catch(error => console.error('Market data failed:', error.message)),
            this.loadTradingIdeas().catch(error => console.error('Trading ideas failed:', error.message))
        ];
        
        // Execute all loads in parallel
        await Promise.allSettled(loadPromises);
        
        console.log('✅ Initial data loaded with enhanced APIs');
    },

    // Load AI trading signals with enhanced APIs and fallback
    async loadSignals() {
        console.log('🤖 Loading enhanced AI signals...');
        UIManager.showLoading('signals-container', 'Generiere erweiterte KI-Signale...');
        
        try {
            // Check if we should use fallback first
            if (window.FallbackDataManager && FallbackDataManager.shouldUseFallback()) {
                console.log('⚠️ All APIs at limit - using realistic fallback signals');
                const fallbackSignals = await FallbackDataManager.provideFallbackData('signals', { count: 6 });
                
                if (fallbackSignals && fallbackSignals.length > 0) {
                    UIManager.renderSignals(fallbackSignals);
                    UIManager.showToast('⚠️ API-Limits erreicht - Technische Simulation aktiv', 'warning');
                    console.log(`✅ Loaded ${fallbackSignals.length} fallback signals`);
                    return;
                }
            }
            
            // Try enhanced signal generation with multiple APIs (KORRIGIERT)
            const signals = await this.retryWithFallback(() => 
                APIManager.generateTradingSignals()
            );
            
            if (signals && signals.length > 0) {
                UIManager.renderSignals(signals);
                console.log(`✅ Loaded ${signals.length} enhanced AI signals from multiple sources`);
                
                // Show source information
                const sources = signals.map(s => s.dataSource).filter((v, i, a) => a.indexOf(v) === i);
                UIManager.showToast(`Signale von ${sources.join(', ')} geladen`, 'info');
            } else {
                throw new Error('No signals from APIs');
            }
        } catch (error) {
            console.error('❌ Failed to load enhanced signals:', error);
            
            // Try fallback as last resort
            try {
                console.log('🔄 Trying realistic fallback signals due to API failure...');
                if (window.FallbackDataManager) {
                    const fallbackSignals = await FallbackDataManager.provideFallbackData('signals', { count: 5 });
                    if (fallbackSignals && fallbackSignals.length > 0) {
                        UIManager.renderSignals(fallbackSignals);
                        UIManager.showToast('🔄 Fallback-Signale geladen (APIs temporär nicht verfügbar)', 'warning');
                        return;
                    }
                }
                
                // Final fallback to demo signals
                const demoSignals = window.createDemoSignals ? window.createDemoSignals() : [];
                if (demoSignals.length > 0) {
                    UIManager.renderSignals(demoSignals);
                    UIManager.showToast('Demo-Signale geladen (alle Quellen nicht verfügbar)', 'warning');
                } else {
                    UIManager.showError('signals-container', 'Keine Signale verfügbar - alle Quellen erschöpft');
                }
            } catch (fallbackError) {
                UIManager.showError('signals-container', 'Alle Signal-Quellen nicht verfügbar');
            }
        }
    },

    // Load financial news with enhanced APIs and fallback
    async loadNews() {
        console.log('📰 Loading enhanced news...');
        UIManager.showLoading('news-container', 'Lade erweiterte Finanznachrichten...');
        
        try {
            // Check if we should use fallback first
            if (window.FallbackDataManager && FallbackDataManager.shouldUseFallback()) {
                console.log('⚠️ All APIs at limit - using realistic fallback news');
                const fallbackNews = await FallbackDataManager.provideFallbackData('news', { count: 15 });
                
                if (fallbackNews && fallbackNews.length > 0) {
                    UIManager.renderNews(fallbackNews);
                    UIManager.showToast('⚠️ API-Limits erreicht - Simulierte Nachrichten aktiv', 'warning');
                    console.log(`✅ Loaded ${fallbackNews.length} fallback news items`);
                    return;
                }
            }
            
            // Try NewsAPI first, then fallback to Finnhub
            let news = null;
            let source = 'unknown';
            
            if (Utils.checkRateLimit('NEWS_API')) {
                try {
                    console.log('🔄 Trying NewsAPI for financial news...');
                    const newsData = await APIManager.newsAPI.getFinancialNews();
                    if (newsData && newsData.articles) {
                        news = newsData.articles.slice(0, CONFIG.SETTINGS.MAX_NEWS_ITEMS);
                        source = 'NewsAPI';
                    }
                } catch (newsError) {
                    console.warn('NewsAPI failed, trying Finnhub fallback');
                }
            }
            
            // Fallback to Finnhub
            if (!news && Utils.checkRateLimit('FINNHUB')) {
                try {
                    console.log('🔄 Using Finnhub for news...');
                    news = await APIManager.finnhub.getNews('general', CONFIG.SETTINGS.MAX_NEWS_ITEMS);
                    source = 'Finnhub';
                } catch (finnhubError) {
                    console.warn('Finnhub also failed');
                }
            }
            
            if (news && news.length > 0) {
                // Filter and sort news
                const filteredNews = news
                    .filter(item => (item.headline || item.title) && item.url)
                    .slice(0, CONFIG.SETTINGS.MAX_NEWS_ITEMS);
                
                UIManager.renderNews(filteredNews);
                console.log(`✅ Loaded ${filteredNews.length} news items from ${source}`);
                UIManager.showToast(`Nachrichten von ${source} geladen`, 'info');
            } else {
                throw new Error('No news from APIs');
            }
        } catch (error) {
            console.error('❌ Failed to load enhanced news:', error);
            
            // Try realistic fallback
            try {
                console.log('🔄 Trying realistic fallback news due to API failure...');
                if (window.FallbackDataManager) {
                    const fallbackNews = await FallbackDataManager.provideFallbackData('news', { count: 12 });
                    if (fallbackNews && fallbackNews.length > 0) {
                        UIManager.renderNews(fallbackNews);
                        UIManager.showToast('🔄 Fallback-Nachrichten geladen (APIs temporär nicht verfügbar)', 'warning');
                        return;
                    }
                }
                UIManager.showError('news-container', 'Keine Nachrichten verfügbar');
            } catch (fallbackError) {
                UIManager.showError('news-container', 'Fehler beim Laden der Nachrichten');
            }
        }
    },

    // Load market data with enhanced APIs and fallback (KORRIGIERT)
    async loadMarketData() {
        console.log('📈 Loading enhanced market data...');
        UIManager.showLoading('winners-container', 'Lade erweiterte Marktdaten...');
        UIManager.showLoading('losers-container', 'Lade erweiterte Marktdaten...');
        UIManager.showLoading('crypto-news-container', 'Lade Krypto-News...');
        
        try {
            // Check if we should use fallback first
            if (window.FallbackDataManager && FallbackDataManager.shouldUseFallback()) {
                console.log('⚠️ All APIs at limit - using realistic fallback market data');
                const fallbackMovers = await FallbackDataManager.provideFallbackData('marketMovers');
                
                if (fallbackMovers && (fallbackMovers.winners.length > 0 || fallbackMovers.losers.length > 0)) {
                    UIManager.renderMarketMovers(fallbackMovers);
                    UIManager.showToast('⚠️ API-Limits erreicht - Simulierte Marktdaten aktiv', 'warning');
                    console.log(`✅ Loaded fallback market movers: ${fallbackMovers.winners.length} winners, ${fallbackMovers.losers.length} losers`);
                }
                
                // Also load fallback crypto news
                const fallbackCryptoNews = await FallbackDataManager.provideFallbackData('news', { count: 8 });
                if (fallbackCryptoNews) {
                    // Filter for crypto-related news
                    const cryptoNews = fallbackCryptoNews.filter(item => 
                        item.headline.toLowerCase().includes('crypto') ||
                        item.headline.toLowerCase().includes('bitcoin') ||
                        item.headline.toLowerCase().includes('blockchain')
                    ).slice(0, 6);
                    
                    if (cryptoNews.length > 0) {
                        UIManager.renderNews(cryptoNews, 'crypto-news-container');
                    } else {
                        UIManager.showError('crypto-news-container', 'Keine Krypto-Nachrichten in Simulation');
                    }
                }
                return;
            }
            
            // Use market movers (KORRIGIERT: getMarketMovers statt getEnhancedMarketMovers)
            const movers = await this.retryWithFallback(() => 
                APIManager.getMarketMovers()
            );
            
            if (movers && (movers.winners.length > 0 || movers.losers.length > 0)) {
                UIManager.renderMarketMovers(movers);
                console.log(`✅ Loaded market movers: ${movers.winners.length} winners, ${movers.losers.length} losers`);
                
                // Show source information
                if (movers.sources) {
                    const sourceInfo = Object.entries(movers.sources)
                        .map(([source, count]) => `${count} von ${source}`)
                        .join(', ');
                    UIManager.showToast(`Marktdaten: ${sourceInfo}`, 'info');
                }
            } else {
                throw new Error('No market data from APIs');
            }
            
            // Load crypto news separately with enhanced sources
            await this.loadCryptoNews();
            
        } catch (error) {
            console.error('❌ Failed to load enhanced market data:', error);
            
            // Try realistic fallback
            try {
                console.log('🔄 Trying realistic fallback market data due to API failure...');
                if (window.FallbackDataManager) {
                    const fallbackMovers = await FallbackDataManager.provideFallbackData('marketMovers');
                    if (fallbackMovers) {
                        UIManager.renderMarketMovers(fallbackMovers);
                        UIManager.showToast('🔄 Fallback-Marktdaten geladen (APIs temporär nicht verfügbar)', 'warning');
                        return;
                    }
                }
                UIManager.showError('winners-container', 'Keine Marktdaten verfügbar');
                UIManager.showError('losers-container', 'Keine Marktdaten verfügbar');
            } catch (fallbackError) {
                UIManager.showError('winners-container', 'Fehler beim Laden der Marktdaten');
                UIManager.showError('losers-container', 'Fehler beim Laden der Marktdaten');
            }
        }
    },

    // Load crypto-specific news with enhanced sources and fallback
    async loadCryptoNews() {
        try {
            let cryptoNews = null;
            
            // Try NewsAPI for crypto news first
            if (Utils.checkRateLimit('NEWS_API')) {
                try {
                    console.log('🔄 Trying NewsAPI for crypto news...');
                    const newsData = await APIManager.newsAPI.searchNews('cryptocurrency bitcoin ethereum', 'publishedAt', 10);
                    if (newsData && newsData.articles) {
                        cryptoNews = newsData.articles.slice(0, 10);
                    }
                } catch (error) {
                    console.warn('NewsAPI crypto search failed');
                }
            }
            
            // Fallback to Finnhub crypto category
            if (!cryptoNews && Utils.checkRateLimit('FINNHUB')) {
                try {
                    console.log('🔄 Using Finnhub for crypto news...');
                    const news = await APIManager.finnhub.getNews('crypto', 10);
                    if (news && news.length > 0) {
                        cryptoNews = news.filter(item => 
                            item.headline && (
                                item.headline.toLowerCase().includes('bitcoin') ||
                                item.headline.toLowerCase().includes('crypto') ||
                                item.headline.toLowerCase().includes('ethereum') ||
                                item.category?.toLowerCase() === 'crypto'
                            )
                        );
                    }
                } catch (error) {
                    console.warn('Finnhub crypto news failed');
                }
            }
            
            // Final fallback to realistic simulation
            if (!cryptoNews && window.FallbackDataManager) {
                console.log('🔄 Using fallback for crypto news...');
                const fallbackNews = await FallbackDataManager.provideFallbackData('news', { count: 8 });
                if (fallbackNews) {
                    cryptoNews = fallbackNews.filter(item => 
                        item.headline.toLowerCase().includes('crypto') ||
                        item.headline.toLowerCase().includes('bitcoin') ||
                        item.headline.toLowerCase().includes('blockchain')
                    ).slice(0, 6);
                }
            }
            
            if (cryptoNews && cryptoNews.length > 0) {
                UIManager.renderNews(cryptoNews, 'crypto-news-container');
                console.log(`✅ Loaded ${cryptoNews.length} crypto news items`);
            } else {
                UIManager.showError('crypto-news-container', 'Keine Krypto-Nachrichten verfügbar');
            }
        } catch (error) {
            console.error('❌ Failed to load crypto news:', error);
            UIManager.showError('crypto-news-container', 'Fehler beim Laden der Krypto-Nachrichten');
        }
    },

    // Load AI trading ideas with enhanced data and fallback
    async loadTradingIdeas() {
        console.log('💡 Loading enhanced trading ideas...');
        UIManager.showLoading('ideas-container', 'Generiere erweiterte Trading-Ideen...');
        
        try {
            // Check if we should use fallback first
            if (window.FallbackDataManager && FallbackDataManager.shouldUseFallback()) {
                console.log('⚠️ All APIs at limit - using realistic fallback trading ideas');
                const fallbackIdeas = await FallbackDataManager.provideFallbackData('tradingIdeas');
                
                if (fallbackIdeas && fallbackIdeas.length > 0) {
                    UIManager.renderTradingIdeas(fallbackIdeas);
                    UIManager.showToast('⚠️ API-Limits erreicht - Strategische Simulation aktiv', 'warning');
                    console.log(`✅ Loaded ${fallbackIdeas.length} fallback trading ideas`);
                    return;
                }
            }
            
            const ideas = await this.retryWithFallback(() => 
                APIManager.generateTradingIdeas()
            );
            
            if (ideas && ideas.length > 0) {
                UIManager.renderTradingIdeas(ideas);
                console.log(`✅ Loaded ${ideas.length} enhanced trading ideas`);
            } else {
                throw new Error('No ideas from APIs');
            }
        } catch (error) {
            console.error('❌ Failed to load enhanced trading ideas:', error);
            
            // Try realistic fallback
            try {
                console.log('🔄 Trying realistic fallback trading ideas due to API failure...');
                if (window.FallbackDataManager) {
                    const fallbackIdeas = await FallbackDataManager.provideFallbackData('tradingIdeas');
                    if (fallbackIdeas && fallbackIdeas.length > 0) {
                        UIManager.renderTradingIdeas(fallbackIdeas);
                        UIManager.showToast('🔄 Fallback-Trading-Ideen geladen (APIs temporär nicht verfügbar)', 'warning');
                        return;
                    }
                }
                UIManager.showError('ideas-container', 'Keine Trading-Ideen verfügbar');
            } catch (fallbackError) {
                UIManager.showError('ideas-container', 'Fehler beim Laden der Trading-Ideen');
            }
        }
    },

    // KORRIGIERT: Ersetzt withRetry durch retryWithFallback
    async retryWithFallback(operation, maxRetries = CONFIG.SETTINGS.RETRY_ATTEMPTS) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                console.warn(`API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
                await Utils.sleep(CONFIG.SETTINGS.RETRY_DELAY * attempt);
            }
        }
    },

    // Refresh all data with enhanced APIs
    async refreshData() {
        console.log('🔄 Refreshing all data with enhanced APIs...');
        UIManager.showToast('Aktualisiere Daten mit erweiterten APIs...', 'info');
        
        try {
            // Show API usage before refresh
            const usageReport = APIManager.getAPIUsageReport();
            console.log('📊 Current API usage:', usageReport.usage);
            
            await this.loadInitialData();
            
            // Show updated usage after refresh
            const newUsageReport = APIManager.getAPIUsageReport();
            console.log('📊 Updated API usage:', newUsageReport.usage);
            
            UIManager.showToast('Daten erfolgreich mit erweiterten APIs aktualisiert! 🔄', 'success');
        } catch (error) {
            console.error('❌ Failed to refresh enhanced data:', error);
            UIManager.showToast('Fehler beim Aktualisieren der Daten', 'error');
        }
    },