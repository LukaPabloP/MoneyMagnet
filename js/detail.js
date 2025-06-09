// MoneyMagnet v2.0 - Detail Manager
const detailManager = {
    currentSymbol: null,
    currentType: null,
    assetData: null,
    updateInterval: null,
    
    // Initialize detail page
    async init() {
        console.log('📊 Detail Manager initializing...');
        
        try {
            // Parse URL parameters
            const params = this.parseUrlParams();
            
            if (!params.symbol) {
                throw new Error('No symbol specified in URL');
            }
            
            this.currentSymbol = params.symbol.toUpperCase();
            this.currentType = params.type || 'auto';
            
            console.log(`📊 Loading details for ${this.currentSymbol} (${this.currentType})`);
            
            // Show loading state
            UIManager.showDetailLoading();
            
            // Load asset data
            await this.loadAssetData();
            
            // Initialize UI components
            this.setupEventListeners();
            
            // Start auto-update
            this.startAutoUpdate();
            
            console.log('✅ Detail Manager initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize detail page:', error);
            UIManager.showDetailError(error.message || 'Fehler beim Laden der Asset-Details');
        }
    },

    // Parse URL parameters
    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            symbol: urlParams.get('symbol'),
            type: urlParams.get('type')
        };
    },

    // Load comprehensive asset data
    async loadAssetData() {
        try {
            console.log(`📊 Loading data for ${this.currentSymbol}...`);
            
            // Determine asset type if auto
            let assetType = this.currentType;
            if (assetType === 'auto') {
                const symbolInfo = SYMBOLS.getSymbolInfo(this.currentSymbol);
                assetType = symbolInfo?.type || 'stock';
            }
            
            // Load asset data from API
            this.assetData = await APIManager.withRetry(() => 
                APIManager.getAssetData(this.currentSymbol, assetType)
            );
            
            if (!this.assetData) {
                throw new Error(`Asset data not found for ${this.currentSymbol}`);
            }
            
            console.log('✅ Asset data loaded:', this.assetData);
            
            // Render all sections
            await this.renderAllSections();
            
            // Show content
            UIManager.showDetailContent();
            
            // Initialize TradingView chart
            this.initChart();
            
        } catch (error) {
            console.error('❌ Failed to load asset data:', error);
            throw error;
        }
    },

    // Render all page sections
    async renderAllSections() {
        try {
            // Render asset header
            UIManager.renderAssetHeader(this.assetData);
            
            // Render key metrics
            UIManager.renderMetrics(this.assetData);
            
            // Render company profile
            UIManager.renderCompanyProfile(this.assetData);
            
            // Render key statistics
            UIManager.renderKeyStats(this.assetData);
            
            // Generate and render AI analysis
            await this.generateAIAnalysis();
            
            // Load and render news
            await this.loadAssetNews();
            
        } catch (error) {
            console.error('❌ Failed to render sections:', error);
        }
    },

    // Generate AI analysis for the asset
    async generateAIAnalysis() {
        try {
            console.log('🤖 Generating AI analysis...');
            
            if (!this.assetData.news || this.assetData.news.length === 0) {
                console.log('No news available for AI analysis');
                return;
            }
            
            // Analyze sentiment of recent news
            const recentNews = this.assetData.news.slice(0, 5);
            const sentiments = await APIManager.huggingFace.analyzeNews(recentNews);
            
            if (sentiments.length > 0) {
                const avgSentiment = APIManager.calculateAverageSentiment(sentiments);
                
                const analysis = {
                    text: this.generateAnalysisText(avgSentiment, sentiments),
                    confidence: Math.round(avgSentiment.score * 100),
                    sentiment: avgSentiment.label
                };
                
                UIManager.renderAIAnalysis(analysis);
                console.log('✅ AI analysis generated');
            }
            
        } catch (error) {
            console.error('❌ AI analysis failed:', error);
        }
    },

    // Generate human-readable analysis text
    generateAnalysisText(avgSentiment, sentiments) {
        const symbol = this.currentSymbol;
        const sentiment = avgSentiment.label;
        const confidence = Math.round(avgSentiment.score * 100);
        
        let analysis = `Basierend auf der KI-Analyse von ${sentiments.length} aktuellen Nachrichten `;
        
        if (sentiment === 'positive') {
            analysis += `zeigt ${symbol} eine positive Marktstimmung. `;
            analysis += `Die Sentiment-Analyse ergab überwiegend optimistische Nachrichten. `;
            analysis += `Dies könnte auf eine bullische Tendenz hindeuten. `;
        } else if (sentiment === 'negative') {
            analysis += `zeigt ${symbol} eine negative Marktstimmung. `;
            analysis += `Die Sentiment-Analyse ergab überwiegend pessimistische Nachrichten. `;
            analysis += `Dies könnte auf eine bearische Tendenz hindeuten. `;
        } else {
            analysis += `zeigt ${symbol} eine neutrale Marktstimmung. `;
            analysis += `Die Sentiment-Analyse ergab gemischte Signale. `;
            analysis += `Der Markt scheint unentschlossen zu sein. `;
        }
        
        analysis += `\n\nBitte beachten Sie, dass dies eine automatisierte Analyse ist und keine Anlageberatung darstellt. `;
        analysis += `Führen Sie immer eigene Recherchen durch bevor Sie Investitionsentscheidungen treffen.`;
        
        return analysis;
    },

    // Load asset-specific news
    async loadAssetNews() {
        try {
            console.log('📰 Loading asset news...');
            
            let news = [];
            
            if (this.assetData.type === 'stock') {
                // Use news from asset data or load fresh
                news = this.assetData.news || [];
                
                if (news.length === 0) {
                    news = await APIManager.finnhub.getCompanyNews(this.currentSymbol, 14);
                }
            } else if (this.assetData.type === 'crypto') {
                // For crypto, get general crypto news and filter
                const generalNews = await APIManager.finnhub.getNews('crypto', 20);
                news = generalNews.filter(item => 
                    item.headline && (
                        item.headline.toLowerCase().includes(this.currentSymbol.toLowerCase()) ||
                        item.headline.toLowerCase().includes(this.assetData.info?.name?.toLowerCase() || '')
                    )
                );
            }
            
            // Render news
            UIManager.renderNews(news, 'newsContainer');
            
            console.log(`✅ Loaded ${news.length} news items`);
            
        } catch (error) {
            console.error('❌ Failed to load asset news:', error);
            UIManager.showError('newsContainer', 'Fehler beim Laden der Nachrichten');
        }
    },

    // Initialize TradingView chart
    initChart() {
        try {
            console.log('📈 Initializing chart...');
            
            // Determine the symbol format for TradingView
            let tvSymbol = this.currentSymbol;
            
            if (this.assetData.type === 'stock') {
                // For stocks, use exchange:symbol format if available
                const exchange = this.assetData.info?.exchange;
                if (exchange) {
                    const exchangeMap = {
                        'NASDAQ': 'NASDAQ',
                        'NYSE': 'NYSE',
                        'XETRA': 'FWB'
                    };
                    const tvExchange = exchangeMap[exchange] || 'NASDAQ';
                    tvSymbol = `${tvExchange}:${this.currentSymbol}`;
                }
            } else if (this.assetData.type === 'crypto') {
                // For crypto, use crypto exchange format
                tvSymbol = `BINANCE:${this.currentSymbol}USDT`;
            }
            
            // Initialize TradingView widget if script is loaded
            if (typeof TradingView !== 'undefined') {
                UIManager.initChart(tvSymbol);
                console.log(`✅ Chart initialized for ${tvSymbol}`);
            } else {
                console.warn('TradingView script not loaded, chart will not be available');
            }
            
        } catch (error) {
            console.error('❌ Chart initialization failed:', error);
        }
    },

    // Set up event listeners
    setupEventListeners() {
        // Chart period buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const period = btn.dataset.period;
                this.updateChartPeriod(period);
            });
        });
        
        // Refresh news button
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshNews();
            });
        }
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoUpdate();
            } else {
                this.startAutoUpdate();
            }
        });
        
        console.log('👂 Event listeners set up');
    },

    // Update chart period
    updateChartPeriod(period) {
        console.log(`📈 Changing chart period to: ${period}`);
        
        // This would require TradingView widget API calls
        // Implementation depends on TradingView widget capabilities
        
        UIManager.showToast(`Chart-Zeitraum: ${period}`, 'info');
    },

    // Refresh news
    async refreshNews() {
        console.log('🔄 Refreshing news...');
        
        try {
            UIManager.showLoading('newsContainer', 'Aktualisiere Nachrichten...');
            await this.loadAssetNews();
            UIManager.showToast('Nachrichten aktualisiert', 'success');
        } catch (error) {
            console.error('❌ Failed to refresh news:', error);
            UIManager.showToast('Fehler beim Aktualisieren der Nachrichten', 'error');
        }
    },

    // Start automatic updates
    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.updateInterval = setInterval(async () => {
            console.log('⏰ Auto-update triggered for detail page');
            
            try {
                // Update price data
                await this.updatePriceData();
                
            } catch (error) {
                console.error('❌ Auto-update failed:', error);
            }
        }, CONFIG.SETTINGS.UPDATE_INTERVAL);
        
        console.log('⏱️ Auto-update started for detail page');
    },

    // Stop automatic updates
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            console.log('⏹️ Auto-update stopped for detail page');
        }
    },

    // Update price data only (lightweight update)
    async updatePriceData() {
        try {
            if (this.assetData.type === 'stock') {
                const quote = await APIManager.finnhub.getQuote(this.currentSymbol);
                if (quote) {
                    this.assetData.quote = quote;
                    
                    // Update price display
                    const currentPrice = document.getElementById('currentPrice');
                    const priceChange = document.getElementById('priceChange');
                    
                    if (currentPrice) {
                        currentPrice.textContent = Utils.formatCurrency(quote.c);
                    }
                    
                    if (priceChange) {
                        const change = quote.d || 0;
                        const changePercent = quote.dp || 0;
                        priceChange.textContent = `${change >= 0 ? '+' : ''}${Utils.formatCurrency(change)} (${Utils.formatPercentage(changePercent)})`;
                        priceChange.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
                    }
                }
            } else if (this.assetData.type === 'crypto') {
                const cryptoId = APIManager.getCryptoId(this.currentSymbol);
                if (cryptoId) {
                    const price = await APIManager.coinGecko.getCryptoPrice(cryptoId);
                    if (price) {
                        this.assetData.price = price;
                        
                        // Update price display
                        const priceData = Object.values(price)[0];
                        const currentPrice = document.getElementById('currentPrice');
                        const priceChange = document.getElementById('priceChange');
                        
                        if (currentPrice && priceData) {
                            currentPrice.textContent = Utils.formatCurrency(priceData.usd);
                        }
                        
                        if (priceChange && priceData) {
                            const change = priceData.usd_24h_change || 0;
                            priceChange.textContent = `24h: ${Utils.formatPercentage(change)}`;
                            priceChange.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Price update failed:', error);
        }
    },

    // Retry loading data
    async retryLoad() {
        console.log('🔄 Retrying data load...');
        
        try {
            UIManager.showDetailLoading();
            UIManager.hideDetailError();
            
            await this.loadAssetData();
            
            UIManager.showToast('Daten erfolgreich geladen', 'success');
            
        } catch (error) {
            console.error('❌ Retry failed:', error);
            UIManager.showDetailError(error.message || 'Fehler beim Laden der Daten');
            UIManager.showToast('Laden fehlgeschlagen', 'error');
        }
    },

    // Get detailed asset information
    getAssetInfo() {
        return {
            symbol: this.currentSymbol,
            type: this.currentType,
            data: this.assetData,
            lastUpdate: new Date().toISOString(),
            autoUpdateActive: !!this.updateInterval
        };
    },

    // Export asset data
    exportAssetData(format = 'json') {
        if (!this.assetData) {
            UIManager.showToast('Keine Daten zum Exportieren verfügbar', 'error');
            return;
        }
        
        try {
            let content = '';
            let filename = `${this.currentSymbol}_data_${new Date().toISOString().split('T')[0]}`;
            
            if (format === 'json') {
                content = JSON.stringify(this.assetData, null, 2);
                filename += '.json';
            } else if (format === 'csv') {
                // Create CSV for basic data
                const headers = ['Field', 'Value'];
                const rows = [
                    ['Symbol', this.assetData.symbol],
                    ['Name', this.assetData.info?.name || 'N/A'],
                    ['Type', this.assetData.type],
                    ['Current Price', this.assetData.quote?.c || 'N/A'],
                    ['Change', this.assetData.quote?.d || 'N/A'],
                    ['Change %', this.assetData.quote?.dp || 'N/A']
                ];
                
                content = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
                filename += '.csv';
            }
            
            // Create and download file
            const blob = new Blob([content], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            UIManager.showToast(`Daten als ${format.toUpperCase()} exportiert`, 'success');
            
        } catch (error) {
            console.error('❌ Export failed:', error);
            UIManager.showToast('Export fehlgeschlagen', 'error');
        }
    },

    // Add to watchlist (localStorage based)
    addToWatchlist() {
        try {
            const watchlist = JSON.parse(localStorage.getItem('moneymagnet_watchlist') || '[]');
            
            const item = {
                symbol: this.currentSymbol,
                name: this.assetData.info?.name || this.currentSymbol,
                type: this.assetData.type,
                addedAt: new Date().toISOString()
            };
            
            // Check if already in watchlist
            const exists = watchlist.find(w => w.symbol === this.currentSymbol && w.type === this.assetData.type);
            
            if (exists) {
                UIManager.showToast('Bereits in der Watchlist', 'info');
                return;
            }
            
            watchlist.push(item);
            localStorage.setItem('moneymagnet_watchlist', JSON.stringify(watchlist));
            
            UIManager.showToast('Zur Watchlist hinzugefügt', 'success');
            
        } catch (error) {
            console.error('❌ Failed to add to watchlist:', error);
            UIManager.showToast('Fehler beim Hinzufügen zur Watchlist', 'error');
        }
    },

    // Remove from watchlist
    removeFromWatchlist() {
        try {
            const watchlist = JSON.parse(localStorage.getItem('moneymagnet_watchlist') || '[]');
            const filtered = watchlist.filter(w => !(w.symbol === this.currentSymbol && w.type === this.assetData.type));
            
            localStorage.setItem('moneymagnet_watchlist', JSON.stringify(filtered));
            UIManager.showToast('Aus Watchlist entfernt', 'success');
            
        } catch (error) {
            console.error('❌ Failed to remove from watchlist:', error);
            UIManager.showToast('Fehler beim Entfernen aus der Watchlist', 'error');
        }
    },

    // Check if in watchlist
    isInWatchlist() {
        try {
            const watchlist = JSON.parse(localStorage.getItem('moneymagnet_watchlist') || '[]');
            return watchlist.some(w => w.symbol === this.currentSymbol && w.type === this.assetData.type);
        } catch (error) {
            return false;
        }
    },

    // Generate trading signals for this specific asset
    async generateAssetSignals() {
        try {
            console.log(`🎯 Generating signals for ${this.currentSymbol}...`);
            
            if (!this.assetData.news || this.assetData.news.length === 0) {
                UIManager.showToast('Keine Nachrichten für Signal-Generierung verfügbar', 'info');
                return;
            }
            
            const sentiments = await APIManager.huggingFace.analyzeNews(this.assetData.news.slice(0, 5));
            
            if (sentiments.length > 0) {
                const avgSentiment = APIManager.calculateAverageSentiment(sentiments);
                const signal = APIManager.generateSignal(
                    this.currentSymbol, 
                    avgSentiment, 
                    this.assetData.quote || { c: 0, d: 0, dp: 0 }, 
                    sentiments
                );
                
                if (signal) {
                    // Display signal in a modal or dedicated section
                    this.displayAssetSignal(signal);
                } else {
                    UIManager.showToast('Kein klares Signal erkennbar', 'info');
                }
            }
            
        } catch (error) {
            console.error('❌ Signal generation failed:', error);
            UIManager.showToast('Fehler bei der Signal-Generierung', 'error');
        }
    },

    // Display asset-specific signal
    displayAssetSignal(signal) {
        const signalHtml = `
            <div class="asset-signal-modal" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 500px;
                width: 90%;
            ">
                <div class="signal-card ${signal.direction}">
                    <div class="signal-header">
                        <div class="signal-info">
                            <div class="signal-symbol">${signal.symbol}</div>
                            <div class="signal-company">${signal.company}</div>
                        </div>
                        <div class="signal-badge">
                            <div class="signal-direction ${signal.direction}">
                                ${signal.direction === 'bullish' ? '📈 BULLISH' : '📉 BEARISH'}
                            </div>
                            <div class="signal-confidence">${signal.confidence}% Vertrauen</div>
                        </div>
                    </div>
                    <div class="signal-reason">
                        💡 ${signal.reason}
                    </div>
                    <div class="signal-meta">
                        <span>🕐 ${Utils.formatTime(signal.timestamp)}</span>
                        <span>📰 ${signal.newsCount} Nachrichten analysiert</span>
                    </div>
                </div>
                <div style="margin-top: 1rem; text-align: center;">
                    <button onclick="this.parentElement.parentElement.remove()" style="
                        background: #6b7280;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 8px;
                        cursor: pointer;
                    ">Schließen</button>
                </div>
            </div>
        `;
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        backdrop.onclick = () => backdrop.remove();
        
        backdrop.innerHTML = signalHtml;
        document.body.appendChild(backdrop);
        
        console.log('✅ Asset signal displayed');
    },

    // Get similar assets
    async getSimilarAssets() {
        try {
            const similarAssets = [];
            
            if (this.assetData.type === 'stock' && this.assetData.info?.sector) {
                // Find stocks in same sector
                const sector = this.assetData.info.sector;
                const sectorStocks = Object.entries(SYMBOLS.STOCKS)
                    .filter(([symbol, data]) => 
                        data.sector === sector && symbol !== this.currentSymbol
                    )
                    .slice(0, 5);
                
                similarAssets.push(...sectorStocks.map(([symbol, data]) => ({
                    symbol,
                    name: data.name,
                    type: 'stock',
                    reason: `Gleicher Sektor: ${sector}`
                })));
            }
            
            return similarAssets;
            
        } catch (error) {
            console.error('❌ Failed to get similar assets:', error);
            return [];
        }
    },

    // Performance metrics calculation
    calculatePerformanceMetrics() {
        if (!this.assetData.quote) return null;
        
        const quote = this.assetData.quote;
        const currentPrice = quote.c;
        const dayHigh = quote.h;
        const dayLow = quote.l;
        const prevClose = quote.pc;
        
        return {
            dailyRange: {
                high: dayHigh,
                low: dayLow,
                current: currentPrice,
                position: ((currentPrice - dayLow) / (dayHigh - dayLow) * 100).toFixed(1)
            },
            performance: {
                absolute: quote.d,
                percentage: quote.dp,
                vs_previous_close: ((currentPrice - prevClose) / prevClose * 100).toFixed(2)
            },
            volatility: {
                daily_range_pct: ((dayHigh - dayLow) / prevClose * 100).toFixed(2)
            }
        };
    },

    // Cleanup when leaving page
    cleanup() {
        this.stopAutoUpdate();
        console.log('🧹 Detail Manager cleanup completed');
    }
};

// Handle page unload
window.addEventListener('beforeunload', () => {
    detailManager.cleanup();
});

// Global detail manager access
window.detailManager = detailManager;

console.log('📊 Detail Manager loaded');