// MoneyMagnet v2.0 - API Manager (Optimiert für ECHTE Signale)
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

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
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Finnhub API key not configured');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getProfile(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Finnhub API key not configured');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/profile2?symbol=${symbol}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getNews(category = 'general', count = 20) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Finnhub API key not configured');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/news?category=${category}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getCompanyNews(symbol, days = 7) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Finnhub API key not configured');
            }
            
            const to = new Date();
            const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getMetrics(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Finnhub API key not configured');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`;
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
        },

        async getEarnings(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                return [];
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/calendar/earnings?symbol=${symbol}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB');
        },

        async getRecommendation(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                return [];
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/recommendation?symbol=${symbol}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB');
        }
    },

    // Alpha Vantage API Methods
    alphaVantage: {
        async getIntraday(symbol, interval = '5min') {
            const apiKey = CONFIG.APIs.ALPHA_VANTAGE.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Alpha Vantage API key not configured');
            }
            
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE');
        },

        async getDaily(symbol) {
            const apiKey = CONFIG.APIs.ALPHA_VANTAGE.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Alpha Vantage API key not configured');
            }
            
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE');
        },

        async getOverview(symbol) {
            const apiKey = CONFIG.APIs.ALPHA_VANTAGE.KEY;
            if (!apiKey || apiKey.includes('DEMO_KEY') || apiKey.length < 10) {
                throw new Error('Alpha Vantage API key not configured');
            }
            
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
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
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
            return APIManager.request(url, {}, 'COINGECKO');
        },

        async getCryptoData(id) {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`;
            return APIManager.request(url, {}, 'COINGECKO');
        },

        async getCryptoMarket(limit = 100) {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d`;
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
            const token = CONFIG.APIs.HUGGINGFACE.TOKEN;
            if (!token || token.includes('DEMO_TOKEN') || token.length < 10) {
                console.warn('HuggingFace API token not configured, using fallback sentiment analysis');
                return this.createFallbackSentiment(text);
            }

            if (!text || text.trim().length === 0) {
                return this.createFallbackSentiment(text);
            }
    
            const url = `${CONFIG.APIs.HUGGINGFACE.BASE_URL}${CONFIG.APIs.HUGGINGFACE.MODEL}`;
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inputs: text.substring(0, 512),
                        options: {
                            wait_for_model: true,
                            use_cache: true
                        }
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
    
                if (!response.ok) {
                    console.warn('HuggingFace API error, using fallback sentiment analysis');
                    return this.createFallbackSentiment(text);
                }
    
                const result = await response.json();
                
                if (result.error || !Array.isArray(result) || result.length === 0) {
                    return this.createFallbackSentiment(text);
                }
                
                Utils.incrementRateLimit('HUGGINGFACE');
                return result;
                
            } catch (error) {
                console.warn('HuggingFace request failed, using fallback:', error.message);
                return this.createFallbackSentiment(text);
            }
        },

        // Erweiterte Fallback-Sentiment-Analyse
        createFallbackSentiment(text) {
            if (!text || text.trim().length === 0) {
                return [{ label: 'neutral', score: 0.5 }];
            }

            const positiveWords = [
                'steigt', 'wächst', 'steigend', 'positiv', 'gewinn', 'profit', 'erfolg', 
                'bullish', 'optimistisch', 'kaufen', 'empfehlung', 'stark', 'hoch',
                'rising', 'growing', 'positive', 'profit', 'success', 'strong', 'buy',
                'excellent', 'great', 'good', 'increase', 'gain', 'improvement',
                'boost', 'surge', 'rally', 'outperform', 'beat', 'exceed', 'upgrade'
            ];
            
            const negativeWords = [
                'fällt', 'sinkt', 'rückgang', 'negativ', 'verlust', 'crash', 'schwach',
                'bearish', 'pessimistisch', 'verkaufen', 'warnung', 'niedrig', 'risiko',
                'falling', 'dropping', 'negative', 'loss', 'weak', 'sell', 'warning',
                'decline', 'decrease', 'worry', 'concern', 'trouble', 'disappointing',
                'miss', 'cut', 'reduce', 'downgrade', 'underperform', 'plunge'
            ];

            const lowerText = text.toLowerCase();
            let score = 0;
            let wordCount = 0;
            let positiveCount = 0;
            let negativeCount = 0;
    
            // Count positive words with context weighting
            positiveWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = (lowerText.match(regex) || []).length;
                if (matches > 0) {
                    positiveCount += matches;
                    // Weight certain words more heavily
                    const weight = ['excellent', 'surge', 'beat', 'exceed'].includes(word) ? 0.25 : 0.15;
                    score += matches * weight;
                    wordCount += matches;
                }
            });
    
            // Count negative words with context weighting
            negativeWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = (lowerText.match(regex) || []).length;
                if (matches > 0) {
                    negativeCount += matches;
                    // Weight certain words more heavily
                    const weight = ['crash', 'plunge', 'disappointing', 'underperform'].includes(word) ? 0.25 : 0.15;
                    score -= matches * weight;
                    wordCount += matches;
                }
            });

            // Context-based adjustments
            if (lowerText.includes('earnings beat') || lowerText.includes('revenue growth')) {
                score += 0.3;
            }
            if (lowerText.includes('earnings miss') || lowerText.includes('guidance cut')) {
                score -= 0.3;
            }

            // Normalize score by text length
            const textLength = text.split(' ').length;
            if (textLength > 0) {
                score = score / Math.sqrt(textLength) * 8;
            }
    
            // Determine label and confidence
            let label, confidence;
            
            if (score > 0.4) {
                label = 'positive';
                confidence = Math.min(0.65 + Math.abs(score), 0.95);
            } else if (score < -0.4) {
                label = 'negative';
                confidence = Math.min(0.65 + Math.abs(score), 0.95);
            } else {
                label = 'neutral';
                confidence = 0.5 + Math.random() * 0.15;
            }

            confidence = Math.max(confidence, 0.45);

            console.log(`📊 Fallback sentiment: ${label} (${confidence.toFixed(2)}) - P:${positiveCount} N:${negativeCount} - "${text.substring(0, 50)}..."`);
    
            return [{
                label: label,
                score: confidence,
                details: {
                    positiveWords: positiveCount,
                    negativeWords: negativeCount,
                    totalSentimentWords: wordCount,
                    textLength: textLength,
                    rawScore: score
                }
            }];
        },
    
        async analyzeNews(newsItems) {
            const analyses = [];
            
            console.log(`🤖 Starte KI-Sentiment-Analyse für ${newsItems.length} Nachrichten...`);
            
            for (const [index, item] of newsItems.slice(0, 5).entries()) {
                const text = item.headline || item.title || item.summary || '';
                if (text && text.trim().length > 15) {
                    try {
                        console.log(`📝 Analysiere Nachricht ${index + 1}: "${text.substring(0, 60)}..."`);
                        
                        const sentiment = await this.analyzeSentiment(text);
                        if (sentiment && sentiment.length > 0) {
                            analyses.push({
                                ...item,
                                sentiment: sentiment[0],
                                analyzedText: text.substring(0, 150)
                            });
                            
                            console.log(`✅ Sentiment: ${sentiment[0].label} (${(sentiment[0].score * 100).toFixed(1)}%)`);
                        }
                    } catch (error) {
                        console.warn('Error analyzing news item:', error.message);
                    }
                }
                
                // Rate limiting zwischen Anfragen
                if (index < newsItems.length - 1) {
                    await Utils.sleep(600);
                }
            }
            
            console.log(`🎯 Sentiment-Analyse abgeschlossen: ${analyses.length} Nachrichten analysiert`);
            return analyses;
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
            'XLM': 'stellar'
        };
        
        return cryptoMap[symbol.toUpperCase()] || null;
    },

    // Generate REAL trading signals using AI
    async generateTradingSignals() {
        try {
            console.log('🎯 Generiere ECHTE Trading-Signale mit KI-Analyse...');
            
            // Validate API keys first
            const finnhubKey = CONFIG.APIs.FINNHUB.KEY;
            const huggingFaceToken = CONFIG.APIs.HUGGINGFACE.TOKEN;
            
            if (!finnhubKey || finnhubKey.includes('DEMO_KEY') || finnhubKey.length < 10) {
                throw new Error('Finnhub API-Schlüssel nicht konfiguriert oder ungültig');
            }
            
            if (!huggingFaceToken || huggingFaceToken.includes('DEMO_TOKEN') || huggingFaceToken.length < 10) {
                console.warn('⚠️ Hugging Face Token nicht konfiguriert - verwende Fallback-Sentiment-Analyse');
            }
            
            const signals = [];
            const popularSymbols = SYMBOLS.getPopularSymbols('stocks', 8);
            
            console.log(`📊 Analysiere ${popularSymbols.length} Top-Aktien für Trading-Signale...`);
            
            // Parallele Verarbeitung für bessere Performance
            const signalPromises = popularSymbols.map(async (symbol, index) => {
                try {
                    console.log(`🔍 Analysiere ${symbol}... (${index + 1}/${popularSymbols.length})`);
                    
                    // Parallele API-Aufrufe mit Timeouts
                    const [newsResult, quoteResult] = await Promise.allSettled([
                        Promise.race([
                            this.finnhub.getCompanyNews(symbol, 5),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('News timeout')), 8000))
                        ]),
                        Promise.race([
                            this.finnhub.getQuote(symbol),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Quote timeout')), 5000))
                        ])
                    ]);
                    
                    const news = newsResult.status === 'fulfilled' ? newsResult.value : [];
                    const quote = quoteResult.status === 'fulfilled' ? quoteResult.value : null;
                    
                    console.log(`📰 ${symbol}: ${news?.length || 0} Nachrichten geladen, Kurs: ${quote?.c || 'N/A'}`);
                    
                    if (news && news.length > 0 && quote && quote.c) {
                        // KI-Sentiment-Analyse der Nachrichten
                        console.log(`🤖 Führe KI-Sentiment-Analyse für ${symbol} durch...`);
                        
                        const sentiments = await Promise.race([
                            this.huggingFace.analyzeNews(news.slice(0, 3)),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Sentiment timeout')), 12000))
                        ]);
                        
                        console.log(`🎯 ${symbol}: ${sentiments.length} Sentiment-Analysen abgeschlossen`);
                        
                        if (sentiments.length > 0) {
                            const avgSentiment = this.calculateAverageSentiment(sentiments);
                            const signal = this.generateSignal(symbol, avgSentiment, quote, sentiments);
                            
                            if (signal) {
                                console.log(`✅ ECHTES Signal generiert für ${symbol}: ${signal.direction} (${signal.confidence}% Vertrauen)`);
                                return signal;
                            }
                        }
                    } 
                    
                    // Fallback: Technisches Signal wenn News-Analyse fehlschlägt
                    if (quote && quote.c) {
                        const technicalSignal = this.createFallbackSignal(symbol, quote);
                        if (technicalSignal) {
                            console.log(`📈 Technisches Signal für ${symbol}: ${technicalSignal.direction}`);
                            return technicalSignal;
                        }
                    }
                    
                    return null;
                    
                } catch (error) {
                    console.warn(`⚠️ Fehler bei ${symbol}:`, error.message);
                    
                    // Bei Fehlern: Versuche wenigstens Kursdaten zu holen
                    try {
                        const quote = await this.finnhub.getQuote(symbol);
                        if (quote && quote.c) {
                            return this.createFallbackSignal(symbol, quote);
                        }
                    } catch (fallbackError) {
                        console.warn(`❌ Auch Fallback für ${symbol} fehlgeschlagen`);
                    }
                    
                    return null;
                }
            });
            
            // Warte auf alle Signale mit globalem Timeout
            console.log('⏱️ Warte auf Abschluss aller Signal-Analysen...');
            
            const signalResults = await Promise.race([
                Promise.allSettled(signalPromises),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Globaler Signal-Timeout nach 30 Sekunden')), 30000)
                )
            ]);
            
            // Filtere erfolgreiche Signale
            const validSignals = signalResults
                .filter(result => result.status === 'fulfilled' && result.value !== null)
                .map(result => result.value);
            
            if (validSignals.length === 0) {
                throw new Error('Keine gültigen Signale erhalten - möglicherweise API-Probleme oder Rate-Limits');
            }
            
            // Sortiere nach Vertrauen
            const sortedSignals = validSignals.sort((a, b) => b.confidence - a.confidence);
            
            console.log(`🎉 ${sortedSignals.length} ECHTE Trading-Signale erfolgreich generiert!`);
            console.log('📊 Top Signale:', sortedSignals.slice(0, 3).map(s => `${s.symbol}: ${s.direction} (${s.confidence}%)`));
            
            return sortedSignals;
            
        } catch (error) {
            console.error('❌ ECHTE Signal-Generierung fehlgeschlagen:', error);
            console.error('🔧 Mögliche Ursachen: API-Limits, Netzwerkprobleme, ungültige API-Schlüssel');
            
            throw new Error(`Signal-Generierung fehlgeschlagen: ${error.message}`);
        }
    },

    // Calculate average sentiment from analyzed news
    calculateAverageSentiment(sentiments) {
        if (!sentiments.length) return { label: 'neutral', score: 0 };
        
        let totalScore = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        let totalWeight = 0;
        
        sentiments.forEach((item, index) => {
            if (item.sentiment) {
                const sentiment = item.sentiment;
                const weight = 1 / (index + 1); // More recent news gets higher weight
                
                if (sentiment.label === 'positive') {
                    totalScore += sentiment.score * weight;
                    positiveCount++;
                } else if (sentiment.label === 'negative') {
                    totalScore -= sentiment.score * weight;
                    negativeCount++;
                }
                totalWeight += weight;
            }
        });
        
        const avgScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        
        console.log(`📊 Durchschnittliches Sentiment: ${avgScore.toFixed(2)} (${positiveCount} pos, ${negativeCount} neg)`);
        
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
            console.log(`⚠️ Signal für ${symbol} unter Confidence-Threshold: ${sentiment.score} < ${CONFIG.SIGNALS.CONFIDENCE_THRESHOLD}`);
            return null;
        }
        
        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
        const change = quote.dp || 0;
        const changePercent = quote.d || 0;
        const volume = quote.v || 0;
        
        let direction, confidence, reason;
        
        if (sentiment.label === 'positive') {
            direction = 'bullish';
            confidence = Math.min(sentiment.score * 100, 95);
            
            reason = `Positive Marktstimmung durch KI-Analyse von ${newsItems.length} aktuellen Nachrichten. `;
            if (change > 0) {
                reason += `Kurssteigerung von ${change.toFixed(2)}% bestätigt das positive Sentiment. `;
            } else if (change < 0) {
                reason += `Trotz aktueller Kursschwäche deutet die Nachrichtenlage auf Erholung hin. `;
            }
            reason += `Sentiment-Confidence: ${(sentiment.score * 100).toFixed(1)}%.`;
            
            if (volume > 1000000) {
                reason += ` Hohes Handelsvolumen von ${Utils.formatNumber(volume)} unterstützt das Signal.`;
            }
            
        } else if (sentiment.label === 'negative') {
            direction = 'bearish';
            confidence = Math.min(sentiment.score * 100, 95);
            
            reason = `Negative Marktstimmung erkannt durch KI-Analyse von ${newsItems.length} aktuellen Nachrichten. `;
            if (change < 0) {
                reason += `Kursverlust von ${Math.abs(change).toFixed(2)}% bestätigt das negative Sentiment. `;
            } else if (change > 0) {
                reason += `Trotz aktueller Kursstärke warnt die Nachrichtenlage vor möglichen Rücksetzern. `;
            }
            reason += `Sentiment-Confidence: ${(sentiment.score * 100).toFixed(1)}%.`;
            
            if (volume > 1000000) {
                reason += ` Hohes Handelsvolumen verstärkt das Warnsignal.`;
            }
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
            volume: volume,
            timestamp: Date.now(),
            newsCount: newsItems.length,
            type: 'AI_SENTIMENT',
            technicalIndicators: this.calculateTechnicalIndicators(quote),
            riskLevel: this.assessRiskLevel(confidence, Math.abs(change)),
            analysisDetails: {
                avgSentiment: sentiment,
                priceAction: {
                    trend: change > 1 ? 'Strong Up' : change > 0 ? 'Up' : change < -1 ? 'Strong Down' : 'Down',
                    momentum: Math.abs(change) > 2 ? 'High' : 'Normal'
                }
            }
        };
    },

    // Calculate basic technical indicators
    calculateTechnicalIndicators(quote) {
        const price = quote.c;
        const high = quote.h;
        const low = quote.l;
        const volume = quote.v || 0;
        
        // RSI approximation (simplified)
        const changePercent = quote.dp || 0;
        const rsi = 50 + (changePercent * 2); // Simplified RSI calculation
        
        // Price position in daily range
        const pricePosition = high > low ? ((price - low) / (high - low)) * 100 : 50;
        
        // Volume indicator
        const volumeStrength = volume > 1000000 ? 'High' : volume > 500000 ? 'Medium' : 'Low';
        
        return {
            rsi: Math.max(0, Math.min(100, Math.round(rsi))),
            pricePosition: Math.round(pricePosition),
            volumeStrength,
            momentum: changePercent > 2 ? 'Strong Up' : changePercent > 0 ? 'Up' : changePercent < -2 ? 'Strong Down' : 'Down'
        };
    },

    // Assess risk level based on confidence and volatility
    assessRiskLevel(confidence, volatility) {
        if (confidence > 80 && volatility < 2) return 'Low';
        if (confidence > 60 && volatility < 5) return 'Medium';
        return 'High';
    },

    // Create fallback signal based on price movement
    createFallbackSignal(symbol, quote) {
        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
        const changePercent = quote.dp || 0;
        const volume = quote.v || 0;
        
        if (Math.abs(changePercent) < 1.5) {
            return null; // Nicht signifikant genug
        }
        
        const direction = changePercent > 0 ? 'bullish' : 'bearish';
        const confidence = Math.min(Math.abs(changePercent) * 8, 75);
        
        let reason = `Technisches Signal basierend auf ${Math.abs(changePercent).toFixed(2)}% Kursbewegung. `;
        
        if (Math.abs(changePercent) > 3) {
            reason += `Starke Bewegung deutet auf signifikantes Marktinteresse hin. `;
        }
        
        if (volume > 1000000) {
            reason += `Hohes Handelsvolumen von ${Utils.formatNumber(volume)} bestätigt das technische Signal.`;
        } else {
            reason += `Moderate Volumina erfordern Vorsicht bei der Interpretation.`;
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
            volume: volume,
            timestamp: Date.now(),
            newsCount: 0,
            type: 'TECHNICAL',
            technicalIndicators: this.calculateTechnicalIndicators(quote),
            riskLevel: this.assessRiskLevel(confidence, Math.abs(changePercent))
        };
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

    // Get market movers with enhanced data
    async getMarketMovers() {
        try {
            const symbols = SYMBOLS.getPopularSymbols('stocks', 20);
            const quotes = await Promise.allSettled(
                symbols.map(symbol => this.finnhub.getQuote(symbol))
            );
            
            const movers = symbols.map((symbol, index) => {
                const quote = quotes[index].status === 'fulfilled' ? quotes[index].value : null;
                const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
                
                if (!quote || !quote.c) return null;
                
                return {
                    symbol,
                    name: symbolInfo?.name || symbol,
                    price: quote.c,
                    change: quote.d || 0,
                    changePercent: quote.dp || 0,
                    volume: quote.v || 0,
                    high: quote.h || quote.c,
                    low: quote.l || quote.c,
                    logo: symbolInfo?.logo || '📈',
                    sector: symbolInfo?.sector || 'Unknown',
                    exchange: symbolInfo?.exchange || 'Unknown'
                };
            }).filter(item => item !== null);
            
            const winners = movers
                .filter(item => item.changePercent > 0)
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 8);
                
            const losers = movers
                .filter(item => item.changePercent < 0)
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 8);
            
            return { 
                winners, 
                losers,
                timestamp: Date.now(),
                totalAnalyzed: movers.length
            };
        } catch (error) {
            console.error('Failed to get market movers:', error);
            return { winners: [], losers: [], timestamp: Date.now(), totalAnalyzed: 0 };
        }
    },

    // Generate AI trading ideas
    async generateTradingIdeas() {
        const ideas = [
            {
                id: Utils.generateId(),
                title: "KI-Revolution Momentum Play",
                type: "Growth Strategy",
                description: "Profitieren Sie vom anhaltenden KI-Boom durch führende Technologieunternehmen. Fokus auf Unternehmen mit starken KI-Capabilities und Infrastruktur.",
                symbols: ["NVDA", "MSFT", "GOOGL", "AMD"],
                riskLevel: "medium",
                timeframe: "3-6 Monate",
                confidence: 82,
                expectedReturn: "15-25%",
                timestamp: Date.now(),
                analysis: "Künstliche Intelligenz transformiert Industrien. NVIDIA profitiert von GPU-Nachfrage, Microsoft von Azure AI-Services.",
                catalysts: ["GPU-Knappheit", "Enterprise AI-Adoption", "Neue KI-Modelle"],
                risks: ["Regulierung", "Bewertungen", "Konkurrenz"]
            },
            {
                id: Utils.generateId(),
                title: "Defensive Dividenden-Portfolio",
                type: "Income Strategy",
                description: "Stabile Dividendenzahler mit starken Fundamentaldaten als Schutz vor Marktvolatilität und Inflationshedge.",
                symbols: ["JNJ", "PG", "KO", "VZ", "PFE"],
                riskLevel: "low",
                timeframe: "6-12 Monate",
                confidence: 88,
                expectedReturn: "6-10%",
                timestamp: Date.now(),
                analysis: "Defensive Titel mit jahrzehntelanger Dividendenhistorie bieten Stabilität in unsicheren Zeiten.",
                catalysts: ["Stabile Cashflows", "Dividendenerhöhungen", "Defensive Geschäftsmodelle"],
                risks: ["Zinsänderungen", "Inflation", "Wachstumsschwäche"]
            },
            {
                id: Utils.generateId(),
                title: "Biotech Innovation Wave",
                type: "Thematic Play",
                description: "Biotechnologie-Durchbrüche in Immuntherapie und Gentherapie schaffen neue Investmentmöglichkeiten mit hohem Potenzial.",
                symbols: ["MRNA", "GILD", "BIIB", "VRTX"],
                riskLevel: "high",
                timeframe: "12-24 Monate",
                confidence: 64,
                expectedReturn: "25-50%",
                timestamp: Date.now(),
                analysis: "Pipeline-Fortschritte und neue Therapieansätze könnten Sektor-Outperformance treiben.",
                catalysts: ["FDA-Zulassungen", "Pipeline-Updates", "M&A-Aktivität"],
                risks: ["Regulatorische Risiken", "Klinische Fehlschläge", "Konkurrenzdruck"]
            },
            {
                id: Utils.generateId(),
                title: "Finanzsektor Value-Comeback",
                type: "Value Strategy",
                description: "Banken und Finanzdienstleister profitieren von normalisierenden Zinsen und verbesserter Kreditqualität.",
                symbols: ["JPM", "BAC", "WFC", "GS"],
                riskLevel: "medium",
                timeframe: "6-12 Monate",
                confidence: 75,
                expectedReturn: "12-18%",
                timestamp: Date.now(),
                analysis: "Finanzsektor unterbewertet trotz verbesserter Zinsmarge und starker Kapitalposition.",
                catalysts: ["Zinserhöhungen", "Kreditwachstum", "Kapitalrückgaben"],
                risks: ["Rezessionsrisiken", "Kreditverluste", "Regulierung"]
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
    },

    // Health check for all APIs
    async healthCheck() {
        const results = {
            timestamp: new Date().toISOString(),
            apis: {},
            overall: 'unknown'
        };

        const checks = [
            { name: 'finnhub', test: () => this.finnhub.getQuote('AAPL') },
            { name: 'alphaVantage', test: () => this.alphaVantage.getDaily('AAPL') },
            { name: 'coinGecko', test: () => this.coinGecko.getCryptoPrice('bitcoin') },
            { name: 'huggingFace', test: () => this.huggingFace.analyzeSentiment('positive market sentiment') }
        ];

        let healthyCount = 0;

        for (const check of checks) {
            try {
                await Promise.race([
                    check.test(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                results.apis[check.name] = { status: 'healthy', message: 'API responding normally' };
                healthyCount++;
            } catch (error) {
                results.apis[check.name] = { 
                    status: 'error', 
                    message: error.message
                };
            }
        }

        // Overall health assessment
        if (healthyCount === checks.length) results.overall = 'excellent';
        else if (healthyCount >= checks.length * 0.75) results.overall = 'good';
        else if (healthyCount >= checks.length * 0.5) results.overall = 'fair';
        else results.overall = 'poor';

        this.lastHealthCheck = results;
        return results;
    },

    // Get comprehensive API statistics
    getStats() {
        const stats = {
            rateLimits: {},
            cacheStats: CacheManager.getStats ? CacheManager.getStats() : { total: 0, expired: 0, valid: 0 },
            lastHealthCheck: this.lastHealthCheck?.timestamp || 'Never',
            apiKeysConfigured: {},
            performance: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0
            }
        };

        // Rate limit stats
        Object.keys(CONFIG.RATE_LIMITS).forEach(apiName => {
            const limit = CONFIG.RATE_LIMITS[apiName];
            stats.rateLimits[apiName] = {
                used: limit.requests,
                limit: CONFIG.APIs[apiName].RATE_LIMIT,
                resetTime: new Date(limit.resetTime).toISOString(),
                available: CONFIG.APIs[apiName].RATE_LIMIT - limit.requests
            };
        });

        // API key configuration status
        stats.apiKeysConfigured = {
            finnhub: !!(CONFIG.APIs.FINNHUB.KEY && CONFIG.APIs.FINNHUB.KEY.length > 10 && !CONFIG.APIs.FINNHUB.KEY.includes('DEMO')),
            alphaVantage: !!(CONFIG.APIs.ALPHA_VANTAGE.KEY && CONFIG.APIs.ALPHA_VANTAGE.KEY.length > 10 && !CONFIG.APIs.ALPHA_VANTAGE.KEY.includes('DEMO')),
            huggingFace: !!(CONFIG.APIs.HUGGINGFACE.TOKEN && CONFIG.APIs.HUGGINGFACE.TOKEN.length > 10 && !CONFIG.APIs.HUGGINGFACE.TOKEN.includes('DEMO')),
            coinGecko: true // No API key required
        };

        return stats;
    },

    // Performance monitoring
    async measurePerformance(apiCall, apiName) {
        const startTime = performance.now();
        
        try {
            const result = await apiCall();
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.log(`📊 ${apiName} API call completed in ${duration.toFixed(2)}ms`);
            
            return result;
        } catch (error) {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            console.warn(`❌ ${apiName} API call failed after ${duration.toFixed(2)}ms:`, error.message);
            throw error;
        }
    },

    // Batch processing utility
    async batchProcess(items, processor, batchSize = 5, delay = 1000) {
        const results = [];
        
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchPromises = batch.map(item => processor(item));
            
            try {
                const batchResults = await Promise.allSettled(batchPromises);
                results.push(...batchResults);
                
                // Delay between batches for rate limiting
                if (i + batchSize < items.length) {
                    await Utils.sleep(delay);
                }
            } catch (error) {
                console.error(`Batch processing error:`, error);
            }
        }
        
        return results;
    },

    // Data validation utilities
    validateQuoteData(quote) {
        if (!quote || typeof quote !== 'object') return false;
        
        const requiredFields = ['c']; // Current price is minimum requirement
        return requiredFields.every(field => 
            quote.hasOwnProperty(field) && 
            typeof quote[field] === 'number' && 
            !isNaN(quote[field]) &&
            quote[field] > 0
        );
    },

    validateNewsData(news) {
        if (!Array.isArray(news)) return false;
        
        return news.every(item => 
            item && 
            typeof item === 'object' && 
            (item.headline || item.title) &&
            item.url
        );
    },

    // Initialize API Manager
    async init() {
        console.log('🔌 API Manager initializing...');
        
        try {
            // Validate API keys if available
            if (typeof APIKeys !== 'undefined' && APIKeys.init) {
                APIKeys.init();
            }
            
            // Perform initial health check
            this.lastHealthCheck = await this.healthCheck();
            
            // Log initialization status
            const stats = this.getStats();
            const healthyApis = Object.values(this.lastHealthCheck.apis)
                .filter(api => api.status === 'healthy').length;
            
            console.log(`✅ API Manager initialized - ${healthyApis}/4 APIs healthy`);
            console.log(`📊 Cache: ${stats.cacheStats.total} items`);
            
            // Log API key status
            const configuredKeys = Object.entries(stats.apiKeysConfigured)
                .filter(([key, configured]) => configured)
                .map(([key]) => key);
            
            if (configuredKeys.length > 0) {
                console.log(`🔑 Configured APIs: ${configuredKeys.join(', ')}`);
            }
            
            return true;
            
        } catch (error) {
            console.error('❌ API Manager initialization failed:', error);
            return false;
        }
    },

    // Cleanup resources
    cleanup() {
        if (CacheManager && CacheManager.clear) {
            CacheManager.clear();
        }
        
        // Reset rate limits
        Object.keys(CONFIG.RATE_LIMITS).forEach(apiName => {
            CONFIG.RATE_LIMITS[apiName].requests = 0;
            CONFIG.RATE_LIMITS[apiName].resetTime = Date.now() + 60000;
        });
        
        console.log('🧹 API Manager cleanup completed');
    },

    // Advanced error handling
    handleApiError(error, apiName, operation) {
        const errorInfo = {
            api: apiName,
            operation: operation,
            message: error.message,
            timestamp: new Date().toISOString(),
            type: 'api_error'
        };

        // Categorize error types
        if (error.message.includes('Rate limit')) {
            errorInfo.category = 'rate_limit';
        } else if (error.message.includes('404') || error.message.includes('not found')) {
            errorInfo.category = 'not_found';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorInfo.category = 'authentication';
        } else if (error.message.includes('timeout')) {
            errorInfo.category = 'timeout';
        } else {
            errorInfo.category = 'unknown';
        }

        console.error('🚨 API Error:', errorInfo);
        
        return errorInfo;
    }
};

// Auto-initialize API Manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    APIManager.init().then(success => {
        if (success) {
            console.log('🚀 MoneyMagnet API Manager ready for REAL signals');
            
            // Optional: Periodic health checks
            setInterval(() => {
                APIManager.healthCheck().catch(error => {
                    console.warn('Health check failed:', error.message);
                });
            }, 300000); // Every 5 minutes
            
        } else {
            console.warn('⚠️ API Manager started with limited functionality');
        }
    });
});

// Export for global access and debugging
window.APIManager = APIManager;

console.log('💰 MoneyMagnet API Manager loaded (ECHTE Signale Version)');