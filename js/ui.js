// MoneyMagnet v2.0 - UI Manager (KORRIGIERT)
const UIManager = {
    // Tab management
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update active tab pane
                tabPanes.forEach(pane => pane.classList.remove('active'));
                const targetPane = document.getElementById(`${targetTab}-tab`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    },

    // Render trading signals
    renderSignals(signals) {
        const container = document.getElementById('signals-container');
        if (!container) return;

        if (!signals || signals.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    <span>⚡ Keine KI-Signale verfügbar</span>
                </div>
            `;
            return;
        }

        container.innerHTML = signals.map(signal => `
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
                    <span>💰 ${Utils.formatCurrency(signal.currentPrice)}</span>
                    <span class="${signal.change >= 0 ? 'positive' : 'negative'}">
                        ${Utils.formatPercentage(signal.change)}
                    </span>
                </div>
            </div>
        `).join('');

        // Update signal counts
        const bullishCount = signals.filter(s => s.direction === 'bullish').length;
        const bearishCount = signals.filter(s => s.direction === 'bearish').length;
        
        const bullishElement = document.getElementById('bullishCount');
        const bearishElement = document.getElementById('bearishCount');
        
        if (bullishElement) bullishElement.textContent = bullishCount;
        if (bearishElement) bearishElement.textContent = bearishCount;
    },

    // Render news
    renderNews(newsItems, containerId = 'news-container') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!newsItems || newsItems.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    <span>📰 Keine Nachrichten verfügbar</span>
                </div>
            `;
            return;
        }

        container.innerHTML = newsItems.map(item => `
            <div class="news-item" onclick="window.open('${item.url}', '_blank')">
                <div class="news-meta">
                    <span class="news-source">${item.source || 'Unknown'}</span>
                    <span>${Utils.formatTime(item.datetime * 1000 || Date.now())}</span>
                </div>
                <h3 class="news-title">${Utils.sanitizeHTML(item.headline || item.title || 'No title')}</h3>
                <p class="news-summary">${Utils.sanitizeHTML(item.summary || 'No summary available')}</p>
                <a href="${item.url}" class="news-link" target="_blank" onclick="event.stopPropagation()">
                    Artikel lesen →
                </a>
            </div>
        `).join('');
    },

    // Render market movers
    renderMarketMovers(movers) {
        this.renderMovers(movers.winners, 'winners-container', '📈 Keine Gewinner verfügbar');
        this.renderMovers(movers.losers, 'losers-container', '📉 Keine Verlierer verfügbar');
    },

    renderMovers(items, containerId, emptyMessage) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = `<div class="loading"><span>${emptyMessage}</span></div>`;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="market-item" onclick="window.open('detail.html?symbol=${item.symbol}&type=stock', '_self')">
                <div class="market-info">
                    <div class="market-symbol">${item.logo} ${item.symbol}</div>
                    <div class="market-name">${item.name}</div>
                </div>
                <div class="market-price">
                    <div class="market-current">${Utils.formatCurrency(item.price)}</div>
                    <div class="market-change ${item.changePercent >= 0 ? 'positive' : 'negative'}">
                        ${Utils.formatPercentage(item.changePercent)}
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Render trading ideas
    renderTradingIdeas(ideas) {
        const container = document.getElementById('ideas-container');
        if (!container) return;

        if (!ideas || ideas.length === 0) {
            container.innerHTML = `
                <div class="loading">
                    <span>💡 Keine Trading-Ideen verfügbar</span>
                </div>
            `;
            return;
        }

        container.innerHTML = ideas.map(idea => `
            <div class="idea-card">
                <div class="idea-header">
                    <h3 class="idea-title">${idea.title}</h3>
                    <span class="idea-type">${idea.type}</span>
                </div>
                <p class="idea-description">${idea.description}</p>
                <div class="idea-metrics">
                    <div class="idea-metric">
                        <div class="idea-metric-label">Symbole</div>
                        <div class="idea-metric-value">${idea.symbols.join(', ')}</div>
                    </div>
                    <div class="idea-metric">
                        <div class="idea-metric-label">Zeitrahmen</div>
                        <div class="idea-metric-value">${idea.timeframe}</div>
                    </div>
                    <div class="idea-metric">
                        <div class="idea-metric-label">Erwartete Rendite</div>
                        <div class="idea-metric-value">${idea.expectedReturn}</div>
                    </div>
                    <div class="idea-metric">
                        <div class="idea-metric-label">KI-Vertrauen</div>
                        <div class="idea-metric-value">${idea.confidence}%</div>
                    </div>
                </div>
                <div class="idea-footer">
                    <span class="risk-badge risk-${idea.riskLevel}">
                        ${idea.riskLevel === 'low' ? '🟢 Niedriges' : 
                          idea.riskLevel === 'medium' ? '🟡 Mittleres' : '🔴 Hohes'} Risiko
                    </span>
                    <span>🕐 ${Utils.formatTime(idea.timestamp)}</span>
                </div>
            </div>
        `).join('');
    },

    // Update last update time
    updateLastUpdateTime() {
        const element = document.getElementById('lastUpdate');
        if (element) {
            element.textContent = Utils.formatTime(Date.now());
        }
    },

    // Show loading state
    showLoading(containerId, message = 'Laden...') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <div class="spinner"></div>
                    <span>${message}</span>
                </div>
            `;
        }
    },

    // Show error state
    showError(containerId, message = 'Ein Fehler ist aufgetreten') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error">
                    ❌ ${message}
                </div>
            `;
        }
    },

    // Toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, CONFIG.UI.TOAST_DURATION);
    },

    // Search UI Methods
    initSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const suggestionItems = document.querySelectorAll('.suggestion-item');

        if (searchInput) {
            // Debounced search
            const debouncedSearch = Utils.debounce((query) => {
                if (window.searchManager) {
                    window.searchManager.performSearch(query);
                }
            }, CONFIG.UI.DEBOUNCE_DELAY);

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // Show/hide clear button
                if (clearBtn) {
                    clearBtn.style.display = query ? 'flex' : 'none';
                }

                // Perform search
                if (query.length >= 2) {
                    debouncedSearch(query);
                } else if (query.length === 0) {
                    this.hideSearchResults();
                    this.showSuggestions();
                }
            });

            // Enter key search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query && window.searchManager) {
                        window.searchManager.performSearch(query);
                    }
                }
            });
        }

        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    clearBtn.style.display = 'none';
                    this.hideSearchResults();
                    this.showSuggestions();
                    searchInput.focus();
                }
            });
        }

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (window.searchManager) {
                    window.searchManager.setFilter(btn.dataset.type);
                }
            });
        });

        // Suggestion items
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const symbol = item.dataset.symbol;
                const type = item.dataset.type;
                
                if (symbol) {
                    window.open(`detail.html?symbol=${symbol}&type=${type}`, '_self');
                }
            });
        });
    },

    showSuggestions() {
        const suggestions = document.getElementById('suggestions');
        const results = document.getElementById('searchResults');
        
        if (suggestions) suggestions.style.display = 'block';
        if (results) results.style.display = 'none';
    },

    hideSearchResults() {
        const results = document.getElementById('searchResults');
        if (results) results.style.display = 'none';
    },

    showSearchResults() {
        const suggestions = document.getElementById('suggestions');
        const results = document.getElementById('searchResults');
        
        if (suggestions) suggestions.style.display = 'none';
        if (results) results.style.display = 'block';
    },

    renderSearchResults(results, query) {
        const container = document.getElementById('resultsGrid');
        const countElement = document.getElementById('resultsCount');
        
        if (!container) return;

        // Update results count
        if (countElement) {
            countElement.textContent = `${results.length} Ergebnis${results.length !== 1 ? 'se' : ''}`;
        }

        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>Keine Ergebnisse gefunden</h3>
                    <p>Für "${Utils.sanitizeHTML(query)}" wurden keine Aktien oder Kryptowährungen gefunden.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(item => `
            <div class="result-item" onclick="window.open('detail.html?symbol=${item.symbol}&type=${item.type}', '_self')">
                <div class="result-header">
                    <div class="result-logo ${item.type}">
                        ${item.logo || (item.type === 'stock' ? '📈' : '₿')}
                    </div>
                    <div class="result-info">
                        <div class="result-symbol">${item.symbol}</div>
                        <div class="result-name">${Utils.sanitizeHTML(item.name)}</div>
                    </div>
                    <div class="result-type">${item.type === 'stock' ? 'Aktie' : 'Crypto'}</div>
                </div>
                ${item.exchange ? `
                    <div class="result-metrics">
                        <div class="result-metric">
                            <div class="result-metric-value">${item.exchange}</div>
                            <div class="result-metric-label">Börse</div>
                        </div>
                        ${item.sector ? `
                            <div class="result-metric">
                                <div class="result-metric-value">${item.sector}</div>
                                <div class="result-metric-label">Sektor</div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');

        this.showSearchResults();
    },

    showSearchLoading() {
        const loading = document.getElementById('searchLoading');
        const error = document.getElementById('searchError');
        
        if (loading) loading.style.display = 'block';
        if (error) error.style.display = 'none';
        this.hideSearchResults();
    },

    hideSearchLoading() {
        const loading = document.getElementById('searchLoading');
        if (loading) loading.style.display = 'none';
    },

    showSearchError(message) {
        const error = document.getElementById('searchError');
        const errorMessage = document.getElementById('errorMessage');
        const loading = document.getElementById('searchLoading');
        
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'block';
        if (errorMessage) errorMessage.textContent = message;
        this.hideSearchResults();
    },

    hideSearchError() {
        const error = document.getElementById('searchError');
        if (error) error.style.display = 'none';
    },

    // Detail page UI methods
    renderAssetHeader(data) {
        const elements = {
            assetSymbol: document.getElementById('assetSymbol'),
            assetName: document.getElementById('assetName'),
            assetType: document.getElementById('assetType'),
            assetExchange: document.getElementById('assetExchange'),
            currentPrice: document.getElementById('currentPrice'),
            priceChange: document.getElementById('priceChange'),
            priceTime: document.getElementById('priceTime'),
            logoText: document.getElementById('logoText'),
            assetLogo: document.getElementById('assetLogo')
        };

        if (elements.assetSymbol) elements.assetSymbol.textContent = data.symbol;
        if (elements.assetName) elements.assetName.textContent = data.info?.name || 'Unknown';
        if (elements.assetType) elements.assetType.textContent = data.type === 'stock' ? 'Aktie' : 'Kryptowährung';
        if (elements.assetExchange) elements.assetExchange.textContent = data.info?.exchange || 'N/A';

        if (data.type === 'stock' && data.quote) {
            if (elements.currentPrice) elements.currentPrice.textContent = Utils.formatCurrency(data.quote.c);
            if (elements.priceChange) {
                const change = data.quote.d || 0;
                const changePercent = data.quote.dp || 0;
                elements.priceChange.textContent = `${change >= 0 ? '+' : ''}${Utils.formatCurrency(change)} (${Utils.formatPercentage(changePercent)})`;
                elements.priceChange.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
            }
        } else if (data.type === 'crypto' && data.price) {
            const priceData = Object.values(data.price)[0];
            if (priceData && elements.currentPrice) {
                elements.currentPrice.textContent = Utils.formatCurrency(priceData.usd);
                if (elements.priceChange) {
                    const change = priceData.usd_24h_change || 0;
                    elements.priceChange.textContent = `24h: ${Utils.formatPercentage(change)}`;
                    elements.priceChange.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
                }
            }
        }

        if (elements.priceTime) elements.priceTime.textContent = 'Echtzeit';
        if (elements.logoText) elements.logoText.textContent = data.info?.logo || (data.type === 'stock' ? '📈' : '₿');
    },

    renderMetrics(data) {
        const elements = {
            dayHigh: document.getElementById('dayHigh'),
            dayLow: document.getElementById('dayLow'),
            volume: document.getElementById('volume'),
            marketCap: document.getElementById('marketCap')
        };

        if (data.type === 'stock' && data.quote) {
            if (elements.dayHigh) elements.dayHigh.textContent = Utils.formatCurrency(data.quote.h);
            if (elements.dayLow) elements.dayLow.textContent = Utils.formatCurrency(data.quote.l);
            if (elements.volume) elements.volume.textContent = Utils.formatNumber(data.quote.v);
            
            if (data.profile && elements.marketCap) {
                elements.marketCap.textContent = Utils.formatCurrency(data.profile.marketCapitalization * 1000000);
            }
        } else if (data.type === 'crypto' && data.data) {
            const marketData = data.data.market_data;
            if (marketData) {
                if (elements.dayHigh) elements.dayHigh.textContent = Utils.formatCurrency(marketData.high_24h?.usd || 0);
                if (elements.dayLow) elements.dayLow.textContent = Utils.formatCurrency(marketData.low_24h?.usd || 0);
                if (elements.volume) elements.volume.textContent = Utils.formatCurrency(marketData.total_volume?.usd || 0);
                if (elements.marketCap) elements.marketCap.textContent = Utils.formatCurrency(marketData.market_cap?.usd || 0);
            }
        }
    },

    renderCompanyProfile(data) {
        const container = document.getElementById('companyProfile');
        if (!container) return;

        if (data.type === 'stock' && data.profile) {
            const profile = data.profile;
            container.innerHTML = `
                <div class="company-info">
                    <p><strong>Branche:</strong> ${profile.finnhubIndustry || 'N/A'}</p>
                    <p><strong>Land:</strong> ${profile.country || 'N/A'}</p>
                    <p><strong>Website:</strong> 
                        ${profile.weburl ? `<a href="${profile.weburl}" target="_blank">${profile.weburl}</a>` : 'N/A'}
                    </p>
                    <p><strong>Mitarbeiter:</strong> ${Utils.formatNumber(profile.employeeTotal || 0)}</p>
                    <p><strong>Börsengang:</strong> ${profile.ipo || 'N/A'}</p>
                </div>
            `;
        } else if (data.type === 'crypto' && data.data) {
            const cryptoData = data.data;
            container.innerHTML = `
                <div class="crypto-info">
                    <p><strong>Rang:</strong> #${cryptoData.market_cap_rank || 'N/A'}</p>
                    <p><strong>Genesis Date:</strong> ${cryptoData.genesis_date || 'N/A'}</p>
                    <p><strong>Homepage:</strong> 
                        ${cryptoData.links?.homepage?.[0] ? 
                            `<a href="${cryptoData.links.homepage[0]}" target="_blank">${cryptoData.links.homepage[0]}</a>` : 'N/A'}
                    </p>
                    <p><strong>Blockchain:</strong> ${cryptoData.asset_platform_id || 'Native'}</p>
                    <p><strong>Algorithmus:</strong> ${cryptoData.hashing_algorithm || 'N/A'}</p>
                </div>
            `;
        } else {
            container.innerHTML = '<p>Keine Profilinformationen verfügbar.</p>';
        }
    },

    renderKeyStats(data) {
        const container = document.getElementById('keyStats');
        if (!container) return;

        if (data.type === 'stock' && data.metrics) {
            const metrics = data.metrics.metric;
            container.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">P/E Ratio</span>
                    <span class="stat-value">${metrics.peBasicExclExtraTTM?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">P/B Ratio</span>
                    <span class="stat-value">${metrics.pbQuarterly?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">EPS</span>
                    <span class="stat-value">${Utils.formatCurrency(metrics.epsBasicExclExtraordinaryItemsTTM || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">52W High</span>
                    <span class="stat-value">${Utils.formatCurrency(metrics['52WeekHigh'] || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">52W Low</span>
                    <span class="stat-value">${Utils.formatCurrency(metrics['52WeekLow'] || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Beta</span>
                    <span class="stat-value">${metrics.beta?.toFixed(2) || 'N/A'}</span>
                </div>
            `;
        } else if (data.type === 'crypto' && data.data) {
            const marketData = data.data.market_data;
            container.innerHTML = `
                <div class="stat-row">
                    <span class="stat-label">All Time High</span>
                    <span class="stat-value">${Utils.formatCurrency(marketData.ath?.usd || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">All Time Low</span>
                    <span class="stat-value">${Utils.formatCurrency(marketData.atl?.usd || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">7d Change</span>
                    <span class="stat-value">${Utils.formatPercentage(marketData.price_change_percentage_7d || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">30d Change</span>
                    <span class="stat-value">${Utils.formatPercentage(marketData.price_change_percentage_30d || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Circulating Supply</span>
                    <span class="stat-value">${Utils.formatNumber(marketData.circulating_supply || 0)}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Total Supply</span>
                    <span class="stat-value">${Utils.formatNumber(marketData.total_supply || 0)}</span>
                </div>
            `;
        } else {
            container.innerHTML = '<p>Keine Kennzahlen verfügbar.</p>';
        }
    },

    renderAIAnalysis(analysis) {
        const card = document.getElementById('aiAnalysisCard');
        const content = document.getElementById('aiContent');
        const confidence = document.getElementById('aiConfidence');
        
        if (!card || !content) return;

        if (analysis) {
            card.style.display = 'block';
            content.textContent = analysis.text;
            if (confidence) confidence.textContent = `${analysis.confidence}%`;
        } else {
            card.style.display = 'none';
        }
    },

    // Chart initialization
    initChart(symbol) {
        const chartContainer = document.getElementById('tradingview_chart');
        if (!chartContainer) return;

        // Check if TradingView is available
        if (typeof TradingView === 'undefined') {
            chartContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 400px; background: #f9fafb; border-radius: 12px;">
                    <div style="text-align: center; color: #6b7280;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">📈</div>
                        <p>Chart wird geladen...</p>
                        <p style="font-size: 0.8rem; margin-top: 0.5rem;">TradingView Widget</p>
                    </div>
                </div>
            `;
            return;
        }

        // TradingView widget configuration
        new TradingView.widget({
            autosize: true,
            symbol: symbol,
            interval: "D",
            timezone: "Europe/Berlin",
            theme: "light",
            style: "1",
            locale: "de",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: false,
            container_id: "tradingview_chart",
            studies: [
                "Volume@tv-basicstudies",
                "RSI@tv-basicstudies"
            ]
        });

        // Chart period buttons
        const chartBtns = document.querySelectorAll('.chart-btn');
        chartBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                chartBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Here you would update the chart period
                // This would require TradingView widget API calls
                this.showToast(`Chart-Zeitraum: ${btn.dataset.period}`, 'info');
            });
        });
    },

    // Show/hide detail sections (KORRIGIERT)
    showDetailContent() {
        const loading = document.getElementById('detailLoading');
        const error = document.getElementById('detailError');
        const content = document.getElementById('detailContent');
        
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'none';
        if (content) content.style.display = 'block';
    },

    showDetailLoading() {
        const loading = document.getElementById('detailLoading');
        const error = document.getElementById('detailError');
        const content = document.getElementById('detailContent');
        
        if (loading) loading.style.display = 'flex';
        if (error) error.style.display = 'none';
        if (content) content.style.display = 'none';
    },

    showDetailError(message) {
        const loading = document.getElementById('detailLoading');
        const error = document.getElementById('detailError');
        const content = document.getElementById('detailContent');
        const errorMessage = document.getElementById('errorMessage');
        
        if (loading) loading.style.display = 'none';
        if (error) error.style.display = 'flex';
        if (content) content.style.display = 'none';
        if (errorMessage) errorMessage.textContent = message;
    },

    // FEHLENDE FUNKTION HINZUGEFÜGT
    hideDetailError() {
        const error = document.getElementById('detailError');
        if (error) error.style.display = 'none';
    },

    // Responsive design helpers
    isMobile() {
        return window.innerWidth <= 768;
    },

    isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    },

    // Animation helpers
    fadeIn(element, duration = 300) {
        element.style.opacity = 0;
        element.style.display = 'block';
        
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.min(progress / duration, 1);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },

    fadeOut(element, duration = 300) {
        let start = null;
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            
            element.style.opacity = Math.max(1 - progress / duration, 0);
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    },

    // Initialize all UI components
    init() {
        this.initTabs();
        
        // Initialize search if on search page
        if (document.getElementById('searchInput')) {
            this.initSearch();
        }
        
        console.log('✅ UI Manager initialized');
    }
};