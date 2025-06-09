// MoneyMagnet v2.0 - Search Manager
const searchManager = {
    currentFilter: 'all',
    lastQuery: '',
    searchTimeout: null,
    
    // Initialize search functionality
    init() {
        console.log('🔍 Search Manager initializing...');
        
        // Initialize UI components
        UIManager.init();
        
        // Set up search event listeners
        this.setupEventListeners();
        
        // Load popular symbols for suggestions
        this.loadPopularSymbols();
        
        console.log('✅ Search Manager initialized');
    },

    // Set up event listeners
    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearBtn');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const suggestionItems = document.querySelectorAll('.suggestion-item');

        // Search input with debouncing
        if (searchInput) {
            const debouncedSearch = Utils.debounce((query) => {
                this.performSearch(query);
            }, CONFIG.UI.DEBOUNCE_DELAY);

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                this.lastQuery = query;
                
                // Show/hide clear button
                if (clearBtn) {
                    clearBtn.style.display = query ? 'flex' : 'none';
                }

                // Perform search or show suggestions
                if (query.length >= 2) {
                    debouncedSearch(query);
                } else if (query.length === 0) {
                    this.showSuggestions();
                }
            });

            // Enter key search
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        this.performSearch(query);
                    }
                }
            });
        }

        // Clear button
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }

        // Filter buttons
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.type);
                
                // Re-search with new filter if there's a query
                if (this.lastQuery.length >= 2) {
                    this.performSearch(this.lastQuery);
                }
            });
        });

        // Suggestion items
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const symbol = item.dataset.symbol;
                const type = item.dataset.type;
                
                if (symbol) {
                    this.navigateToDetail(symbol, type);
                }
            });
        });
    },

    // Set search filter
    setFilter(filterType) {
        this.currentFilter = filterType;
        
        // Update active filter button
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === filterType);
        });
        
        console.log(`🔍 Filter set to: ${filterType}`);
    },

    // Perform search
    async performSearch(query) {
        if (!query || query.length < 2) {
            this.showSuggestions();
            return;
        }

        console.log(`🔍 Searching for: "${query}" with filter: ${this.currentFilter}`);
        
        try {
            // Show loading state
            UIManager.showSearchLoading();
            UIManager.hideSearchError();
            
            // Search in local symbol database first
            let results = this.searchLocalSymbols(query);
            
            // Filter results based on current filter
            if (this.currentFilter !== 'all') {
                results = results.filter(item => {
                    if (this.currentFilter === 'stocks') return item.type === 'stock';
                    if (this.currentFilter === 'crypto') return item.type === 'crypto';
                    return true;
                });
            }
            
            // If we have results, show them
            if (results.length > 0) {
                UIManager.hideSearchLoading();
                UIManager.renderSearchResults(results, query);
                console.log(`✅ Found ${results.length} results for "${query}"`);
            } else {
                // No local results, try API search if it's a specific symbol
                if (Utils.validateSymbol(query)) {
                    const apiResults = await this.searchAPI(query);
                    
                    UIManager.hideSearchLoading();
                    
                    if (apiResults.length > 0) {
                        UIManager.renderSearchResults(apiResults, query);
                        console.log(`✅ Found ${apiResults.length} API results for "${query}"`);
                    } else {
                        this.showNoResults(query);
                    }
                } else {
                    UIManager.hideSearchLoading();
                    this.showNoResults(query);
                }
            }
            
        } catch (error) {
            console.error('❌ Search failed:', error);
            UIManager.hideSearchLoading();
            UIManager.showSearchError('Suchfehler aufgetreten. Bitte versuchen Sie es erneut.');
        }
    },

    // Search in local symbol database
    searchLocalSymbols(query) {
        const results = SYMBOLS.searchSymbols(query);
        
        // Add search relevance scoring
        return results.map(item => {
            let score = 0;
            const searchTerm = query.toLowerCase();
            const symbol = item.symbol.toLowerCase();
            const name = item.name.toLowerCase();
            
            // Exact symbol match gets highest score
            if (symbol === searchTerm) score += 100;
            // Symbol starts with search term
            else if (symbol.startsWith(searchTerm)) score += 50;
            // Symbol contains search term
            else if (symbol.includes(searchTerm)) score += 25;
            
            // Name starts with search term
            if (name.startsWith(searchTerm)) score += 30;
            // Name contains search term
            else if (name.includes(searchTerm)) score += 15;
            
            return { ...item, score };
        }).sort((a, b) => b.score - a.score);
    },

    // Search via API for unknown symbols
    async searchAPI(symbol) {
        const results = [];
        const upperSymbol = symbol.toUpperCase();
        
        try {
            // Try to get stock data
            if (this.currentFilter === 'all' || this.currentFilter === 'stocks') {
                try {
                    const [quote, profile] = await Promise.allSettled([
                        APIManager.finnhub.getQuote(upperSymbol),
                        APIManager.finnhub.getProfile(upperSymbol)
                    ]);
                    
                    if (quote.status === 'fulfilled' && quote.value.c > 0) {
                        results.push({
                            symbol: upperSymbol,
                            name: profile.status === 'fulfilled' ? profile.value.name : upperSymbol,
                            type: 'stock',
                            exchange: profile.status === 'fulfilled' ? profile.value.exchange : 'Unknown',
                            logo: '📈'
                        });
                    }
                } catch (error) {
                    console.warn('Stock API search failed:', error);
                }
            }
            
            // Try to get crypto data
            if (this.currentFilter === 'all' || this.currentFilter === 'crypto') {
                const cryptoId = APIManager.getCryptoId(upperSymbol);
                if (cryptoId) {
                    try {
                        const cryptoData = await APIManager.coinGecko.getCryptoData(cryptoId);
                        
                        if (cryptoData) {
                            results.push({
                                symbol: upperSymbol,
                                name: cryptoData.name,
                                type: 'crypto',
                                logo: '₿'
                            });
                        }
                    } catch (error) {
                        console.warn('Crypto API search failed:', error);
                    }
                }
            }
            
        } catch (error) {
            console.error('API search error:', error);
        }
        
        return results;
    },

    // Show no results message
    showNoResults(query) {
        const container = document.getElementById('resultsGrid');
        const countElement = document.getElementById('resultsCount');
        
        if (countElement) {
            countElement.textContent = '0 Ergebnisse';
        }
        
        if (container) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="error-icon" style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
                    <h3>Keine Ergebnisse gefunden</h3>
                    <p>Für "${Utils.sanitizeHTML(query)}" wurden keine Aktien oder Kryptowährungen gefunden.</p>
                    <div style="margin-top: 1.5rem;">
                        <h4>Suchvorschläge:</h4>
                        <ul style="text-align: left; margin-top: 0.5rem;">
                            <li>Verwenden Sie das offizielle Börsensymbol (z.B. AAPL statt Apple)</li>
                            <li>Überprüfen Sie die Schreibweise</li>
                            <li>Versuchen Sie eine breitere Suche</li>
                            <li>Nutzen Sie die Vorschläge unten</li>
                        </ul>
                    </div>
                </div>
            `;
        }
        
        UIManager.showSearchResults();
    },

    // Clear search
    clearSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.getElementById('clearBtn');
        
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        
        if (clearBtn) {
            clearBtn.style.display = 'none';
        }
        
        this.lastQuery = '';
        this.showSuggestions();
        
        console.log('🗑️ Search cleared');
    },

    // Show suggestions
    showSuggestions() {
        UIManager.showSuggestions();
        UIManager.hideSearchError();
        UIManager.hideSearchLoading();
        
        console.log('💡 Showing suggestions');
    },

    // Load popular symbols for suggestions
    loadPopularSymbols() {
        // This could be enhanced to load real-time popular symbols
        const popularStocks = SYMBOLS.getPopularSymbols('stocks', 8);
        const popularCrypto = SYMBOLS.getPopularSymbols('crypto', 8);
        
        console.log(`📈 Loaded ${popularStocks.length} popular stocks and ${popularCrypto.length} popular cryptos`);
    },

    // Navigate to detail page
    navigateToDetail(symbol, type) {
        const url = `detail.html?symbol=${encodeURIComponent(symbol)}&type=${encodeURIComponent(type)}`;
        window.location.href = url;
        
        console.log(`🔗 Navigating to: ${url}`);
    },

    // Retry search after error
    retrySearch() {
        if (this.lastQuery) {
            this.performSearch(this.lastQuery);
        } else {
            this.showSuggestions();
        }
        
        console.log('🔄 Retrying search');
    },

    // Get search statistics
    getSearchStats() {
        return {
            lastQuery: this.lastQuery,
            currentFilter: this.currentFilter,
            totalSymbols: Object.keys(SYMBOLS.STOCKS).length + Object.keys(SYMBOLS.CRYPTO).length,
            stockSymbols: Object.keys(SYMBOLS.STOCKS).length,
            cryptoSymbols: Object.keys(SYMBOLS.CRYPTO).length
        };
    },

    // Advanced search with multiple criteria
    async advancedSearch(criteria) {
        const {
            query,
            type,
            sector,
            exchange,
            minPrice,
            maxPrice,
            minMarketCap,
            maxMarketCap
        } = criteria;
        
        console.log('🔍 Advanced search:', criteria);
        
        try {
            UIManager.showSearchLoading();
            
            let results = this.searchLocalSymbols(query);
            
            // Apply filters
            if (type && type !== 'all') {
                results = results.filter(item => item.type === type);
            }
            
            if (sector) {
                results = results.filter(item => 
                    item.sector && item.sector.toLowerCase().includes(sector.toLowerCase())
                );
            }
            
            if (exchange) {
                results = results.filter(item => 
                    item.exchange && item.exchange.toLowerCase().includes(exchange.toLowerCase())
                );
            }
            
            // For price and market cap filtering, we'd need to fetch real-time data
            // This would be implemented with API calls for each result
            
            UIManager.hideSearchLoading();
            UIManager.renderSearchResults(results, query);
            
            return results;
            
        } catch (error) {
            console.error('❌ Advanced search failed:', error);
            UIManager.hideSearchLoading();
            UIManager.showSearchError('Erweiterte Suche fehlgeschlagen');
            return [];
        }
    },

    // Search suggestions based on partial input
    getSearchSuggestions(partialQuery) {
        if (!partialQuery || partialQuery.length < 1) return [];
        
        const suggestions = SYMBOLS.searchSymbols(partialQuery)
            .slice(0, 10)
            .map(item => ({
                text: `${item.symbol} - ${item.name}`,
                symbol: item.symbol,
                type: item.type
            }));
        
        return suggestions;
    },

    // Export search results
    exportResults(results, format = 'csv') {
        if (!results || results.length === 0) {
            UIManager.showToast('Keine Ergebnisse zum Exportieren', 'error');
            return;
        }
        
        try {
            let content = '';
            let filename = `moneymagnet_search_${new Date().toISOString().split('T')[0]}`;
            
            if (format === 'csv') {
                const headers = ['Symbol', 'Name', 'Type', 'Exchange', 'Sector'];
                const csvContent = [
                    headers.join(','),
                    ...results.map(item => [
                        item.symbol,
                        `"${item.name}"`,
                        item.type,
                        item.exchange || '',
                        item.sector || ''
                    ].join(','))
                ].join('\n');
                
                content = csvContent;
                filename += '.csv';
                
            } else if (format === 'json') {
                content = JSON.stringify(results, null, 2);
                filename += '.json';
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
            
            UIManager.showToast(`Ergebnisse als ${format.toUpperCase()} exportiert`, 'success');
            
        } catch (error) {
            console.error('❌ Export failed:', error);
            UIManager.showToast('Export fehlgeschlagen', 'error');
        }
    }
};

// Global search manager access
window.searchManager = searchManager;

console.log('🔍 Search Manager loaded');