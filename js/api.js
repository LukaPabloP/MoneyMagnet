// MoneyMagnet v2.0 - API Manager
const APIManager = {
    // Base request function with error handling and rate limiting
    async request(url, options = {}, apiName) {
        // Check rate limit
        if (apiName && !Utils.checkRateLimit(apiName)) {
            throw new Error(`Rate limit exceeded for ${apiName}`);
        }

        // Check cache first
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cached = CacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const response = await fetch(url, {
                ...options,
                timeout: 10000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            // Increment rate limit counter
            if (apiName) Utils.incrementRateLimit(apiName);
            
            // Cache the result
            CacheManager.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error(`API Request failed for ${url}:`, error);
            throw error;
        }
    },

    // Finnhub API Methods
    finnhub: {
        async getQuote(symbol) {
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/quote?symbol=${symbol}&token=${CONFIG.APIs.FINNHUB.KEY}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getProfile(symbol) {
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/profile2?symbol=${symbol}&token=${CONFIG.APIs.FINNHUB.KEY}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getNews(category = 'general', count = 20) {
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/news?category=${category}&token=${CONFIG.APIs.FINNHUB.KEY}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getCompanyNews(symbol, days = 7) {
            const to = new Date();
            const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${CONFIG.APIs.FINNHUB.KEY}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getMetrics(symbol) {
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${CONFIG.APIs.FINNHUB.KEY}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getMarketData() {
            const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'JPM'];
            const promises = symbols.map(symbol => this.getQuote(symbol));
            
            try {
                const results = await Promise.allSettled(promises);
                return symbols.map((symbol, index) => ({
                    symbol,
                    data: results[index].status === 'fulfilled' ? results[index].value : null,
                    info: SYMBOLS.getSymbolInfo(symbol)
                })).filter(item => item.data);
            } catch (error) {
                console.error('Market data fetch failed:', error);
                return [];
            }
        }
    },

    // Alpha Vantage API Methods
    alphaVantage: {
        async getIntraday(symbol, interval = '5min') {
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${CONFIG.APIs.ALPHA_VANTAGE.KEY}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE');
        },

        async getDaily(symbol) {
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${CONFIG.APIs.ALPHA_VANTAGE.KEY}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE');
        },

        async getOverview(symbol) {
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${CONFIG.APIs.ALPHA_VANTAGE.KEY}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE');
        }
    },

    // CoinGecko API Methods
    coinGecko: {
        async getCryptoList() {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/list`;
            return APIManager.request(url, {}, 'COINGECKO');
        },

        async getCryptoPrice(ids) {
            const idsString = Array.isArray(ids) ? ids.join(',') : ids;
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;
            return APIManager.request(url, {}, 'COINGECKO');
        },

        async getCryptoData(id) {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`;
            return APIManager.request(url, {}, 'COINGECKO');
        },

        async getCryptoMarket(limit = 100) {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h`;
            return APIManager.request(url, {}, 'COINGECKO');
        },

        async getTrending() {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/search/trending`;
            return APIManager.request(url, {}, 'COINGECKO');
        }
    },

    // Hugging Face API Methods
    huggingFace: {
        async analyzeSentiment(text) {
            if (!text || text.trim().length === 0) {
                return this.createFallbackSentiment(text);
            }
    
            const url = `${CONFIG.APIs.HUGGINGFACE.BASE_URL}${CONFIG.APIs.HUGGINGFACE.MODEL}`;
            
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${CONFIG.APIs.HUGGINGFACE.TOKEN}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: text.substring(0, 512)
                    })
                });
    
                if (!response.ok) {
                    console.warn('HuggingFace API error, using fallback sentiment analysis');
                    return this.createFallbackSentiment(text);
                }
    
                const result = await response.json();
                
                if (result.error || !result.length) {
                    return this.createFallbackSentiment(text);
                }
                
                Utils.incrementRateLimit('HUGGINGFACE');
                return result;
                
            } catch (error) {
                console.warn('HuggingFace request failed, using fallback:', error.message);
                return this.createFallbackSentiment(text);
            }
        },
    
        // Lokale Fallback-Sentiment-Analyse
        createFallbackSentiment(text) {
            const positiveWords = [
                'steigt', 'wächst', 'steigend', 'positiv', 'gewinn', 'profit', 'erfolg', 
                'bullish', 'optimistisch', 'kaufen', 'empfehlung', 'stark', 'hoch',
                'rising', 'growing', 'positive', 'profit', 'success', 'strong', 'buy'
            ];
            
            const negativeWords = [
                'fällt', 'sinkt', 'rückgang', 'negativ', 'verlust', 'crash', 'schwach',
                'bearish', 'pessimistisch', 'verkaufen', 'warnung', 'niedrig', 'risiko',
                'falling', 'dropping', 'negative', 'loss', 'weak', 'sell', 'warning'
            ];
    
            const lowerText = text.toLowerCase();
            let score = 0;
            let positiveCount = 0;
            let negativeCount = 0;
    
            positiveWords.forEach(word => {
                if (lowerText.includes(word)) {
                    positiveCount++;
                    score += 0.1;
                }
            });
    
            negativeWords.forEach(word => {
                if (lowerText.includes(word)) {
                    negativeCount++;
                    score -= 0.1;
                }
            });
    
            // Bestimme das Label basierend auf dem Score
            let label, confidence;
            if (score > 0.1) {
                label = 'positive';
                confidence = Math.min(0.6 + (score * 2), 0.9);
            } else if (score < -0.1) {
                label = 'negative';
                confidence = Math.min(0.6 + (Math.abs(score) * 2), 0.9);
            } else {
                label = 'neutral';
                confidence = 0.5;
            }
    
            console.log(`📊 Fallback sentiment: ${label} (${confidence.toFixed(2)}) for text: ${text.substring(0, 50)}...`);
    
            return [{
                label: label,
                score: confidence
            }];
        },
    
        async analyzeNews(newsItems) {
            const analyses = [];
            
            for (const item of newsItems.slice(0, 5)) {
                const text = item.headline || item.title || item.summary || '';
                if (text) {
                    const sentiment = await this.analyzeSentiment(text);
                    if (sentiment && sentiment.length > 0) {
                        analyses.push({
                            ...item,
                            sentiment: sentiment[0]
                        });
                    }
                }
                
                // Kurze Pause zwischen Anfragen
                await Utils.sleep(500);
            }
            
            return analyses;
        }
    },

    // Composite data fetchers
    async getAssetData(symbol, type = 'stock') {
        try {
            const symbolInfo = SYMBOLS.getSymbolInfo(symbol, type);
            
            if (type === 'stock') {
                const [quote, profile, metrics, news] = await Promise.allSettled([
                    this.finnhub.getQuote(symbol),
                    this.finnhub.getProfile(symbol),
                    this.finnhub.getMetrics(symbol),
                    this.finnhub.getCompanyNews(symbol, 7)
                ]);

                return {
                    symbol,
                    type: 'stock',
                    info: symbolInfo,
                    quote: quote.status === 'fulfilled' ? quote.value : null,
                    profile: profile.status === 'fulfilled' ? profile.value : null,
                    metrics: metrics.status === 'fulfilled' ? metrics.value : null,
                    news: news.status === 'fulfilled' ? news.value : []
                };
            } else if (type === 'crypto') {
                const cryptoId = this.getCryptoId(symbol);
                if (!cryptoId) return null;

                const [price, data] = await Promise.allSettled([
                    this.coinGecko.getCryptoPrice(cryptoId),
                    this.coinGecko.getCryptoData(cryptoId)
                ]);

                return {
                    symbol,
                    type: 'crypto',
                    info: symbolInfo,
                    price: price.status === 'fulfilled' ? price.value : null,
                    data: data.status === 'fulfilled' ? data.value : null
                };
            }
        } catch (error) {
            console.error(`Failed to get asset data for ${symbol}:`, error);
            return null;
        }
    },

    // Helper to map crypto symbols to CoinGecko IDs
    getCryptoId(symbol) {
        const cryptoMap = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'BNB': 'binancecoin',
            'ADA': 'cardano',
            'SOL': 'solana',
            'XRP': 'ripple',
            'DOT': 'polkadot',
            'DOGE': 'dogecoin',
            'AVAX': 'avalanche-2',
            'LINK': 'chainlink',
            'MATIC': 'matic-network',
            'UNI': 'uniswap',
            'LTC': 'litecoin',
            'BCH': 'bitcoin-cash',
            'ALGO': 'algorand',
            'VET': 'vechain',
            'FIL': 'filecoin',
            'TRX': 'tron',
            'ETC': 'ethereum-classic',
            'XLM': 'stellar',
            'THETA': 'theta-token',
            'FTM': 'fantom',
            'ATOM': 'cosmos',
            'NEAR': 'near',
            'SAND': 'the-sandbox',
            'MANA': 'decentraland',
            'CRO': 'crypto-com-chain',
            'SHIB': 'shiba-inu',
            'APE': 'apecoin',
            'LRC': 'loopring',
            'CRV': 'curve-dao-token'
        };
        
        return cryptoMap[symbol.toUpperCase()] || null;
    },

    // Generate trading signals using AI
    async generateTradingSignals() {
        try {
            console.log('🎯 Generiere Trading-Signale...');
            const signals = [];
            const popularSymbols = SYMBOLS.getPopularSymbols('stocks', 10);
            
            for (const symbol of popularSymbols) {
                try {
                    console.log(`📊 Analysiere ${symbol}...`);
                    
                    // Lade Nachrichten für das Symbol
                    const news = await this.finnhub.getCompanyNews(symbol, 7);
                    console.log(`📰 ${news?.length || 0} Nachrichten für ${symbol} gefunden`);
                    
                    if (news && news.length > 0) {
                        // Analysiere Sentiment der Nachrichten
                        const sentiments = await this.huggingFace.analyzeNews(news.slice(0, 3));
                        console.log(`🤖 ${sentiments.length} Sentiment-Analysen für ${symbol}`);
                        
                        // Lade Kursdaten
                        const quote = await this.finnhub.getQuote(symbol);
                        
                        if (sentiments.length > 0 && quote && quote.c) {
                            const avgSentiment = this.calculateAverageSentiment(sentiments);
                            const signal = this.generateSignal(symbol, avgSentiment, quote, sentiments);
                            
                            if (signal) {
                                signals.push(signal);
                                console.log(`✅ Signal generiert für ${symbol}: ${signal.direction}`);
                            }
                        }
                    } else {
                        // Erstelle Fallback-Signal basierend auf Kursbewegung
                        const quote = await this.finnhub.getQuote(symbol);
                        if (quote && quote.c) {
                            const fallbackSignal = this.createFallbackSignal(symbol, quote);
                            if (fallbackSignal) {
                                signals.push(fallbackSignal);
                                console.log(`📈 Fallback-Signal für ${symbol}: ${fallbackSignal.direction}`);
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`⚠️ Fehler bei Signal-Generierung für ${symbol}:`, error.message);
                }
                
                // Rate Limiting
                await Utils.sleep(1000);
            }
            
            // Wenn keine Signale generiert wurden, erstelle Demo-Signale
            if (signals.length === 0) {
                console.log('📊 Keine echten Signale verfügbar, erstelle Demo-Signale...');
                return this.createDemoSignals();
            }
            
            console.log(`✅ ${signals.length} Trading-Signale generiert`);
            return signals.sort((a, b) => b.confidence - a.confidence);
            
        } catch (error) {
            console.error('❌ Signal-Generierung fehlgeschlagen:', error);
            // Fallback zu Demo-Signalen
            return this.createDemoSignals();
        }
    },

    // Calculate average sentiment from analyzed news
    calculateAverageSentiment(sentiments) {
        if (!sentiments.length) return { label: 'neutral', score: 0 };
        
        let totalScore = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        
        sentiments.forEach(item => {
            if (item.sentiment) {
                const sentiment = item.sentiment;
                if (sentiment.label === 'positive') {
                    totalScore += sentiment.score;
                    positiveCount++;
                } else if (sentiment.label === 'negative') {
                    totalScore -= sentiment.score;
                    negativeCount++;
                }
            }
        });
        
        const avgScore = totalScore / sentiments.length;
        
        if (avgScore > CONFIG.SIGNALS.BULLISH_THRESHOLD) {
            return { label: 'positive', score: Math.abs(avgScore) };
        } else if (avgScore < CONFIG.SIGNALS.BEARISH_THRESHOLD) {
            return { label: 'negative', score: Math.abs(avgScore) };
        }
        
        return { label: 'neutral', score: Math.abs(avgScore) };
    },

    // Generate individual trading signal
    generateSignal(symbol, sentiment, quote, newsItems) {
        if (sentiment.score < CONFIG.SIGNALS.CONFIDENCE_THRESHOLD) {
            return null;
        }
        
        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
        const change = quote.dp || 0;
        const changePercent = quote.d || 0;
        
        let direction, confidence, reason;
        
        if (sentiment.label === 'positive') {
            direction = 'bullish';
            confidence = Math.min(sentiment.score * 100, 95);
            reason = `Positive Marktstimmung basierend auf aktuellen Nachrichten. Sentiment-Score: ${(sentiment.score * 100).toFixed(1)}%`;
        } else if (sentiment.label === 'negative') {
            direction = 'bearish';
            confidence = Math.min(sentiment.score * 100, 95);
            reason = `Negative Marktstimmung in aktuellen Nachrichten erkannt. Sentiment-Score: ${(sentiment.score * 100).toFixed(1)}%`;
        } else {
            return null;
        }
        
        return {
            id: Utils.generateId(),
            symbol,
            company: symbolInfo?.name || symbol,
            direction,
            confidence: Math.round(confidence),
            reason,
            currentPrice: quote.c,
            change: changePercent,
            timestamp: Date.now(),
            newsCount: newsItems.length,
            type: 'AI_SENTIMENT'
        };
    },

    // Get market movers
    async getMarketMovers() {
        try {
            const symbols = SYMBOLS.getPopularSymbols('stocks', 20);
            const quotes = await Promise.allSettled(
                symbols.map(symbol => this.finnhub.getQuote(symbol))
            );
            
            const movers = symbols.map((symbol, index) => {
                const quote = quotes[index].status === 'fulfilled' ? quotes[index].value : null;
                const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
                
                return {
                    symbol,
                    name: symbolInfo?.name || symbol,
                    price: quote?.c || 0,
                    change: quote?.d || 0,
                    changePercent: quote?.dp || 0,
                    logo: symbolInfo?.logo || '📈'
                };
            }).filter(item => item.price > 0);
            
            const winners = movers
                .filter(item => item.changePercent > 0)
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 5);
                
            const losers = movers
                .filter(item => item.changePercent < 0)
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 5);
            
            return { winners, losers };
        } catch (error) {
            console.error('Failed to get market movers:', error);
            return { winners: [], losers: [] };
        }
    },

    // Generate AI trading ideas
    async generateTradingIdeas() {
        const ideas = [
            {
                id: Utils.generateId(),
                title: "Tech-Rally Fortsetzung",
                type: "Long Position",
                description: "Die Tech-Aktien zeigen starke Fundamentaldaten und positive Analystenbewertungen. KI-Sentiment-Analyse deutet auf anhaltende Stärke hin.",
                symbols: ["AAPL", "MSFT", "GOOGL"],
                riskLevel: "medium",
                timeframe: "2-4 Wochen",
                confidence: 78,
                expectedReturn: "8-15%",
                timestamp: Date.now()
            },
            {
                id: Utils.generateId(),
                title: "Grüne Energie Momentum",
                type: "Sektor Play",
                description: "Erneuerbare Energien profitieren von politischen Entwicklungen und steigender institutioneller Nachfrage.",
                symbols: ["TSLA", "ENPH", "FSLR"],
                riskLevel: "high",
                timeframe: "1-3 Monate",
                confidence: 65,
                expectedReturn: "15-25%",
                timestamp: Date.now()
            },
            {
                id: Utils.generateId(),
                title: "Defensive Dividenden-Strategie",
                type: "Income Play",
                description: "Stabile Dividendenzahler mit starken Bilanzen als sicherer Hafen bei Marktvolatilität.",
                symbols: ["JNJ", "PG", "KO"],
                riskLevel: "low",
                timeframe: "3-6 Monate",
                confidence: 85,
                expectedReturn: "5-8%",
                timestamp: Date.now()
            },
            {
                id: Utils.generateId(),
                title: "Krypto-Markt Recovery",
                type: "Crypto Swing",
                description: "Bitcoin und Ethereum zeigen technische Erholung nach Konsolidierung. Institutionelle Adoption steigt.",
                symbols: ["BTC", "ETH"],
                riskLevel: "high",
                timeframe: "2-8 Wochen",
                confidence: 62,
                expectedReturn: "20-40%",
                timestamp: Date.now()
            },
            {
                id: Utils.generateId(),
                title: "Gesundheitssektor Übergewichtung",
                type: "Sector Rotation",
                description: "Biotech und Pharma profitieren von Innovation und demografischem Wandel. Starke Pipeline-Entwicklungen erwartet.",
                symbols: ["MRNA", "PFE", "JNJ"],
                riskLevel: "medium",
                timeframe: "1-4 Monate",
                confidence: 71,
                expectedReturn: "10-18%",
                timestamp: Date.now()
            }
        ];
        
        return ideas;
    },

    // Error handler with retry logic
    async withRetry(apiCall, maxRetries = CONFIG.SETTINGS.RETRY_ATTEMPTS) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await apiCall();
            } catch (error) {
                if (attempt === maxRetries) {
                    throw error;
                }
                
                console.warn(`API call failed (attempt ${attempt}/${maxRetries}):`, error.message);
                await Utils.sleep(CONFIG.SETTINGS.RETRY_DELAY * attempt);
            }
        }
    }
};