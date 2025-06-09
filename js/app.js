// MoneyMagnet v2.0 - Main Application
const app = {
    initialized: false,
    updateInterval: null,
    
    // Initialize the application
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🚀 MoneyMagnet v2.0 starting...');
            
            // Initialize UI components
            UIManager.init();
            
            // Load initial data
            await this.loadInitialData();
            
            // Start auto-update cycle
            this.startAutoUpdate();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ MoneyMagnet v2.0 initialized successfully');
            
            UIManager.showToast('MoneyMagnet v2.0 gestartet! 🚀', 'success');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            UIManager.showToast('Fehler beim Starten der App', 'error');
        }
    },

    // Load all initial data
    async loadInitialData() {
        console.log('📊 Loading initial data...');
        
        // Update last update time
        UIManager.updateLastUpdateTime();
        
        // Load data for all tabs simultaneously
        const loadPromises = [
            this.loadSignals(),
            this.loadNews(),
            this.loadMarketData(),
            this.loadTradingIdeas()
        ];
        
        // Execute all loads in parallel but handle errors individually
        await Promise.allSettled(loadPromises);
        
        console.log('✅ Initial data loaded');
    },

    // Load AI trading signals
    async loadSignals() {
        console.log('🤖 Loading AI signals...');
        UIManager.showLoading('signals-container', 'Generiere KI-Signale...');
        
        try {
            const signals = await APIManager.withRetry(() => 
                APIManager.generateTradingSignals()
            );
            
            if (signals && signals.length > 0) {
                UIManager.renderSignals(signals);
                console.log(`✅ Loaded ${signals.length} AI signals`);
            } else {
                UIManager.showError('signals-container', 'Keine KI-Signale verfügbar');
            }
        } catch (error) {
            console.error('❌ Failed to load signals:', error);
            UIManager.showError('signals-container', 'Fehler beim Laden der KI-Signale');
        }
    },

    // Load financial news
    async loadNews() {
        console.log('📰 Loading news...');
        UIManager.showLoading('news-container', 'Lade Finanznachrichten...');
        
        try {
            const news = await APIManager.withRetry(() => 
                APIManager.finnhub.getNews('general', CONFIG.SETTINGS.MAX_NEWS_ITEMS)
            );
            
            if (news && news.length > 0) {
                // Filter and sort news
                const filteredNews = news
                    .filter(item => item.headline && item.url)
                    .slice(0, CONFIG.SETTINGS.MAX_NEWS_ITEMS);
                
                UIManager.renderNews(filteredNews);
                console.log(`✅ Loaded ${filteredNews.length} news items`);
            } else {
                UIManager.showError('news-container', 'Keine Nachrichten verfügbar');
            }
        } catch (error) {
            console.error('❌ Failed to load news:', error);
            UIManager.showError('news-container', 'Fehler beim Laden der Nachrichten');
        }
    },

    // Load market data (winners/losers)
    async loadMarketData() {
        console.log('📈 Loading market data...');
        UIManager.showLoading('winners-container', 'Lade Marktdaten...');
        UIManager.showLoading('losers-container', 'Lade Marktdaten...');
        UIManager.showLoading('crypto-news-container', 'Lade Krypto-News...');
        
        try {
            // Load market movers
            const movers = await APIManager.withRetry(() => 
                APIManager.getMarketMovers()
            );
            
            if (movers) {
                UIManager.renderMarketMovers(movers);
                console.log(`✅ Loaded market movers: ${movers.winners.length} winners, ${movers.losers.length} losers`);
            }
            
            // Load crypto news separately
            await this.loadCryptoNews();
            
        } catch (error) {
            console.error('❌ Failed to load market data:', error);
            UIManager.showError('winners-container', 'Fehler beim Laden der Marktdaten');
            UIManager.showError('losers-container', 'Fehler beim Laden der Marktdaten');
        }
    },

    // Load crypto-specific news
    async loadCryptoNews() {
        try {
            // Use general news but filter for crypto keywords
            const news = await APIManager.finnhub.getNews('crypto', 10);
            
            if (news && news.length > 0) {
                const cryptoNews = news.filter(item => 
                    item.headline && (
                        item.headline.toLowerCase().includes('bitcoin') ||
                        item.headline.toLowerCase().includes('crypto') ||
                        item.headline.toLowerCase().includes('ethereum') ||
                        item.category?.toLowerCase() === 'crypto'
                    )
                );
                
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

    // Load AI trading ideas
    async loadTradingIdeas() {
        console.log('💡 Loading trading ideas...');
        UIManager.showLoading('ideas-container', 'Generiere Trading-Ideen...');
        
        try {
            const ideas = await APIManager.withRetry(() => 
                APIManager.generateTradingIdeas()
            );
            
            if (ideas && ideas.length > 0) {
                UIManager.renderTradingIdeas(ideas);
                console.log(`✅ Loaded ${ideas.length} trading ideas`);
            } else {
                UIManager.showError('ideas-container', 'Keine Trading-Ideen verfügbar');
            }
        } catch (error) {
            console.error('❌ Failed to load trading ideas:', error);
            UIManager.showError('ideas-container', 'Fehler beim Laden der Trading-Ideen');
        }
    },

    // Refresh all data
    async refreshData() {
        console.log('🔄 Refreshing all data...');
        UIManager.showToast('Aktualisiere Daten...', 'info');
        
        try {
            await this.loadInitialData();
            UIManager.showToast('Daten erfolgreich aktualisiert! 🔄', 'success');
        } catch (error) {
            console.error('❌ Failed to refresh data:', error);
            UIManager.showToast('Fehler beim Aktualisieren der Daten', 'error');
        }
    },

    // Start automatic data updates
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(async () => {
            console.log('⏰ Auto-update triggered');
            
            try {
                // Only update visible tab to reduce API calls
                const activeTab = document.querySelector('.tab-btn.active');
                const tabName = activeTab?.dataset.tab;
                
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
                        // If no specific tab, update signals as default
                        await this.loadSignals();
                }
                
                UIManager.updateLastUpdateTime();
                
            } catch (error) {
                console.error('❌ Auto-update failed:', error);
            }
        }, CONFIG.SETTINGS.UPDATE_INTERVAL);
        
        console.log(`⏱️ Auto-update started (${CONFIG.SETTINGS.UPDATE_INTERVAL / 1000}s interval)`);
    },

    // Stop automatic updates
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Auto-update stopped');
        }
    },

    // Set up event listeners
    setupEventListeners() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoUpdate();
            } else {
                this.startAutoUpdate();
            }
        });

        // Handle window beforeunload
        window.addEventListener('beforeunload', () => {
            this.stopAutoUpdate();
        });

        // Handle network status changes
        window.addEventListener('online', () => {
            console.log('🌐 Network connection restored');
            UIManager.showToast('Internetverbindung wiederhergestellt', 'success');
            this.refreshData();
        });

        window.addEventListener('offline', () => {
            console.log('🚫 Network connection lost');
            UIManager.showToast('Internetverbindung verloren', 'error');
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

        console.log('👂 Event listeners set up');
    },

    // Handle tab changes
    onTabChange(tabName) {
        console.log(`📑 Tab changed to: ${tabName}`);
        
        // Load data for newly active tab if not already loaded
        const container = document.getElementById(`${tabName}-container`) || 
                         document.querySelector(`#${tabName}-tab .loading`);
        
        if (container && container.querySelector('.loading')) {
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
        }
    },

    // Error recovery
    async retryOperation(operation, context) {
        console.log(`🔄 Retrying operation: ${context}`);
        UIManager.showToast(`Wiederhole ${context}...`, 'info');
        
        try {
            await operation();
            UIManager.showToast(`${context} erfolgreich!`, 'success');
        } catch (error) {
            console.error(`❌ Retry failed for ${context}:`, error);
            UIManager.showToast(`Fehler bei ${context}`, 'error');
        }
    },

    // Get app status
    getStatus() {
        return {
            initialized: this.initialized,
            autoUpdateActive: !!this.updateInterval,
            lastUpdate: UIManager.formatTime(Date.now()),
            networkStatus: navigator.onLine ? 'online' : 'offline',
            cacheSize: CacheManager.cache.size
        };
    },

    // Clean up resources
    cleanup() {
        this.stopAutoUpdate();
        CacheManager.clear();
        this.initialized = false;
        console.log('🧹 App cleanup completed');
    }
};

// Global error handler
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
    UIManager.showToast('Ein unerwarteter Fehler ist aufgetreten', 'error');
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason);
    UIManager.showToast('Ein Netzwerkfehler ist aufgetreten', 'error');
    event.preventDefault();
});

// Export for debugging
window.MoneyMagnet = {
    app,
    APIManager,
    UIManager,
    Utils,
    CONFIG,
    SYMBOLS,
    CacheManager
};

console.log('💰 MoneyMagnet v2.0 loaded');