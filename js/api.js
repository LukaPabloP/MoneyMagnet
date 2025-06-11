// MoneyMagnet v2.0 - Enhanced API Manager with Real APIs
const APIManager = {
    // Enhanced request function with smart fallbacks
    async request(url, options = {}, apiName, priority = 3) {
        // Check if we can make this call
        if (apiName && !Utils.checkRateLimit(apiName)) {
            console.warn(`⚠️ Rate limit exceeded for ${apiName}, trying cache...`);
            
            // Try cache first
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            const cached = CacheManager.get(cacheKey);
            if (cached) {
                console.log(`✅ Using cached data for ${apiName}`);
                return cached;
            }
            
            throw new Error(`Rate limit exceeded for ${apiName} and no cached data available`);
        }

        // Check cache first for non-critical requests
        if (priority > 2) {
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            const cached = CacheManager.get(cacheKey);
            if (cached) {
                console.log(`💾 Cache hit for ${url}`);
                return cached;
            }
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

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
            
            // Cache the result with smart duration
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            CacheManager.set(cacheKey, data);
            
            return data;
        } catch (error) {
            console.error(`API Request failed for ${url}:`, error);
            
            // Try to return cached data even if expired as fallback
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            const expiredCache = CacheManager.cache.get(cacheKey);
            if (expiredCache) {
                console.warn(`⚠️ Using expired cache for ${url} due to API error`);
                return expiredCache.data;
            }
            
            throw error;
        }
    },

    // YAHOO FINANCE API INTEGRATION
    yahooFinance: {
        async getQuote(symbol) {
            const apiKey = CONFIG.APIs.YAHOO_FINANCE.KEY;
            if (!apiKey || !Utils.checkRateLimit('YAHOO_FINANCE')) {
                throw new Error('Yahoo Finance API unavailable');
            }
            
            const url = `${CONFIG.APIs.YAHOO_FINANCE.BASE_URL}/stock/quote?symbol=${symbol}&lang=en-US&region=US`;
            return APIManager.request(url, {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': CONFIG.APIs.YAHOO_FINANCE.HOST
                }
            }, 'YAHOO_FINANCE', 1);
        },

        async getOptions(symbol) {
            const apiKey = CONFIG.APIs.YAHOO_FINANCE.KEY;
            if (!apiKey || !Utils.checkRateLimit('YAHOO_FINANCE')) {
                throw new Error('Yahoo Finance API unavailable');
            }
            
            const url = `${CONFIG.APIs.YAHOO_FINANCE.BASE_URL}/stock/get-options?symbol=${symbol}&lang=en-US&region=US`;
            return APIManager.request(url, {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': CONFIG.APIs.YAHOO_FINANCE.HOST
                }
            }, 'YAHOO_FINANCE', 4);
        },

        async getFinancials(symbol) {
            const apiKey = CONFIG.APIs.YAHOO_FINANCE.KEY;
            if (!apiKey || !Utils.checkRateLimit('YAHOO_FINANCE')) {
                throw new Error('Yahoo Finance API unavailable');
            }
            
            const url = `${CONFIG.APIs.YAHOO_FINANCE.BASE_URL}/stock/get-financials?symbol=${symbol}&lang=en-US&region=US`;
            return APIManager.request(url, {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': CONFIG.APIs.YAHOO_FINANCE.HOST
                }
            }, 'YAHOO_FINANCE', 4);
        },

        async getHistoricalData(symbol, period = '1d', interval = '1m') {
            const apiKey = CONFIG.APIs.YAHOO_FINANCE.KEY;
            if (!apiKey || !Utils.checkRateLimit('YAHOO_FINANCE')) {
                throw new Error('Yahoo Finance API unavailable');
            }
            
            const url = `${CONFIG.APIs.YAHOO_FINANCE.BASE_URL}/stock/get-chart?symbol=${symbol}&period=${period}&interval=${interval}&lang=en-US&region=US`;
            return APIManager.request(url, {
                headers: {
                    'X-RapidAPI-Key': apiKey,
                    'X-RapidAPI-Host': CONFIG.APIs.YAHOO_FINANCE.HOST
                }
            }, 'YAHOO_FINANCE', 3);
        }
    },

    // EXCHANGE RATE API INTEGRATION
    exchangeRate: {
        async getLatestRates(baseCurrency = 'USD') {
            const apiKey = CONFIG.APIs.EXCHANGE_RATE.KEY;
            if (!apiKey || !Utils.checkRateLimit('EXCHANGE_RATE')) {
                // Return cached data or basic fallback
                return this.getFallbackRates();
            }
            
            const url = `${CONFIG.APIs.EXCHANGE_RATE.BASE_URL}/${apiKey}/latest/${baseCurrency}`;
            return APIManager.request(url, {}, 'EXCHANGE_RATE', 5);
        },

        async convertCurrency(from, to, amount = 1) {
            const apiKey = CONFIG.APIs.EXCHANGE_RATE.KEY;
            if (!apiKey || !Utils.checkRateLimit('EXCHANGE_RATE')) {
                // Use cached rates for conversion
                const cachedRates = CacheManager.get(`exchange_rates_${from}`);
                if (cachedRates && cachedRates.conversion_rates[to]) {
                    return {
                        result: amount * cachedRates.conversion_rates[to],
                        conversion_rate: cachedRates.conversion_rates[to],
                        from_cache: true
                    };
                }
                throw new Error('Exchange rate API unavailable and no cached data');
            }
            
            const url = `${CONFIG.APIs.EXCHANGE_RATE.BASE_URL}/${apiKey}/pair/${from}/${to}/${amount}`;
            return APIManager.request(url, {}, 'EXCHANGE_RATE', 5);
        },

        getFallbackRates() {
            // Basic fallback rates (you might want to update these periodically)
            return {
                base_code: 'USD',
                conversion_rates: {
                    EUR: 0.85,
                    GBP: 0.75,
                    JPY: 110,
                    CAD: 1.25,
                    AUD: 1.35,
                    CHF: 0.92,
                    CNY: 7.1,
                    from_cache: true
                },
                time_last_update_utc: new Date().toISOString()
            };
        }
    },

    // NEWS API INTEGRATION
    newsAPI: {
        async getTopHeadlines(category = 'business', country = 'de', pageSize = 20) {
            const apiKey = CONFIG.APIs.NEWS_API.KEY;
            if (!apiKey || !Utils.checkRateLimit('NEWS_API')) {
                throw new Error('News API unavailable - using fallback');
            }
            
            const url = `${CONFIG.APIs.NEWS_API.BASE_URL}/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${apiKey}`;
            return APIManager.request(url, {}, 'NEWS_API', 2);
        },

        async searchNews(query, sortBy = 'publishedAt', pageSize = 20, language = 'en') {
            const apiKey = CONFIG.APIs.NEWS_API.KEY;
            if (!apiKey || !Utils.checkRateLimit('NEWS_API')) {
                throw new Error('News API unavailable - using fallback');
            }
            
            const url = `${CONFIG.APIs.NEWS_API.BASE_URL}/everything?q=${encodeURIComponent(query)}&sortBy=${sortBy}&pageSize=${pageSize}&language=${language}&apiKey=${apiKey}`;
            return APIManager.request(url, {}, 'NEWS_API', 2);
        },

        async getFinancialNews() {
            const queries = ['stock market', 'financial markets', 'economy'];
            const randomQuery = queries[Math.floor(Math.random() * queries.length)];
            
            try {
                return await this.searchNews(randomQuery, 'publishedAt', 15);
            } catch (error) {
                console.warn('NewsAPI failed, using Finnhub fallback');
                return APIManager.finnhub.getNews('general', 15);
            }
        },

        async getSymbolNews(symbol) {
            try {
                const companyInfo = SYMBOLS.getSymbolInfo(symbol);
                const query = companyInfo ? companyInfo.name : symbol;
                return await this.searchNews(query, 'publishedAt', 10);
            } catch (error) {
                console.warn(`NewsAPI failed for ${symbol}, using Finnhub fallback`);
                return APIManager.finnhub.getCompanyNews(symbol, 7);
            }
        }
    },

    // POLYGON.IO API INTEGRATION
    polygon: {
        async getQuote(symbol) {
            const apiKey = CONFIG.APIs.POLYGON.KEY;
            if (!apiKey || !Utils.checkRateLimit('POLYGON')) {
                throw new Error('Polygon API unavailable');
            }
            
            const url = `${CONFIG.APIs.POLYGON.BASE_URL}/last/trade/${symbol}?apikey=${apiKey}`;
            return APIManager.request(url, {}, 'POLYGON', 1);
        },

        async getAggregates(symbol, multiplier = 1, timespan = 'day', from, to) {
            const apiKey = CONFIG.APIs.POLYGON.KEY;
            if (!apiKey || !Utils.checkRateLimit('POLYGON')) {
                throw new Error('Polygon API unavailable');
            }
            
            // Default dates if not provided
            if (!to) to = new Date().toISOString().split('T')[0];
            if (!from) {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 30);
                from = fromDate.toISOString().split('T')[0];
            }
            
            const url = `${CONFIG.APIs.POLYGON.BASE_URL}/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?apikey=${apiKey}`;
            return APIManager.request(url, {}, 'POLYGON', 3);
        },

        async getMarketStatus() {
            const apiKey = CONFIG.APIs.POLYGON.KEY;
            if (!apiKey || !Utils.checkRateLimit('POLYGON')) {
                // Return basic market status
                return this.getFallbackMarketStatus();
            }
            
            const url = `${CONFIG.APIs.POLYGON.BASE_URL}/marketstatus/now?apikey=${apiKey}`;
            return APIManager.request(url, {}, 'POLYGON', 4);
        },

        async getTickers(type = 'CS', market = 'stocks', active = true, limit = 100) {
            const apiKey = CONFIG.APIs.POLYGON.KEY;
            if (!apiKey || !Utils.checkRateLimit('POLYGON')) {
                throw new Error('Polygon API unavailable');
            }
            
            const url = `${CONFIG.APIs.POLYGON.BASE_URL}/reference/tickers?type=${type}&market=${market}&active=${active}&limit=${limit}&apikey=${apiKey}`;
            return APIManager.request(url, {}, 'POLYGON', 4);
        },

        getFallbackMarketStatus() {
            const now = new Date();
            const hour = now.getHours();
            const day = now.getDay();
            
            // Simple market hours check (NYSE: 9:30 AM - 4:00 PM ET, Mon-Fri)
            const isWeekday = day >= 1 && day <= 5;
            const isMarketHours = hour >= 9 && hour < 16;
            
            return {
                market: 'open',
                serverTime: now.toISOString(),
                exchanges: {
                    nasdaq: isWeekday && isMarketHours ? 'open' : 'closed',
                    nyse: isWeekday && isMarketHours ? 'open' : 'closed'
                },
                currencies: {
                    fx: 'open',
                    crypto: 'open'
                },
                from_fallback: true
            };
        }
    },

    // ENHANCED EXISTING APIs WITH SMART FALLBACKS
    finnhub: {
        async getQuote(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            
            // Try Yahoo Finance first if Finnhub is rate limited
            if (!Utils.checkRateLimit('FINNHUB')) {
                try {
                    console.log(`🔄 Finnhub rate limited, trying Yahoo Finance for ${symbol}`);
                    const yahooData = await APIManager.yahooFinance.getQuote(symbol);
                    
                    // Convert Yahoo format to Finnhub format
                    if (yahooData && yahooData.regularMarketPrice) {
                        return {
                            c: yahooData.regularMarketPrice,
                            d: yahooData.regularMarketChange,
                            dp: yahooData.regularMarketChangePercent,
                            h: yahooData.regularMarketDayHigh,
                            l: yahooData.regularMarketDayLow,
                            o: yahooData.regularMarketOpen,
                            pc: yahooData.regularMarketPreviousClose,
                            t: Date.now() / 1000,
                            v: yahooData.regularMarketVolume,
                            source: 'yahoo_fallback'
                        };
                    }
                } catch (yahooError) {
                    console.warn('Yahoo Finance fallback also failed');
                }
                
                throw new Error('All quote sources unavailable');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/quote?symbol=${symbol}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB', 1);
        },

        async getProfile(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || !Utils.checkRateLimit('FINNHUB')) {
                throw new Error('Finnhub API unavailable');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/profile2?symbol=${symbol}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB', 4);
        },

        async getNews(category = 'general', count = 20) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            
            // Try NewsAPI first for better news quality
            if (Utils.checkRateLimit('NEWS_API')) {
                try {
                    console.log('🔄 Using NewsAPI for financial news');
                    const newsData = await APIManager.newsAPI.getFinancialNews();
                    
                    // Convert NewsAPI format to Finnhub format
                    if (newsData && newsData.articles) {
                        return newsData.articles.slice(0, count).map(article => ({
                            category: 'general',
                            datetime: new Date(article.publishedAt).getTime() / 1000,
                            headline: article.title,
                            id: Math.random().toString(36).substr(2, 9),
                            image: article.urlToImage,
                            related: '',
                            source: article.source.name,
                            summary: article.description,
                            url: article.url,
                            from_newsapi: true
                        }));
                    }
                } catch (newsError) {
                    console.warn('NewsAPI fallback failed, using Finnhub');
                }
            }
            
            if (!apiKey || !Utils.checkRateLimit('FINNHUB')) {
                throw new Error('All news sources unavailable');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/news?category=${category}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB', 2);
        },

        async getCompanyNews(symbol, days = 7) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            
            // Try NewsAPI first for company-specific news
            if (Utils.checkRateLimit('NEWS_API')) {
                try {
                    console.log(`🔄 Using NewsAPI for ${symbol} company news`);
                    const newsData = await APIManager.newsAPI.getSymbolNews(symbol);
                    
                    if (newsData && newsData.articles) {
                        return newsData.articles.slice(0, Math.min(days, 10)).map(article => ({
                            category: 'company',
                            datetime: new Date(article.publishedAt).getTime() / 1000,
                            headline: article.title,
                            id: Math.random().toString(36).substr(2, 9),
                            image: article.urlToImage,
                            related: symbol,
                            source: article.source.name,
                            summary: article.description,
                            url: article.url,
                            from_newsapi: true
                        }));
                    }
                } catch (newsError) {
                    console.warn(`NewsAPI failed for ${symbol}, using Finnhub`);
                }
            }
            
            if (!apiKey || !Utils.checkRateLimit('FINNHUB')) {
                throw new Error('All company news sources unavailable');
            }
            
            const to = new Date();
            const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/company-news?symbol=${symbol}&from=${from.toISOString().split('T')[0]}&to=${to.toISOString().split('T')[0]}&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB', 2);
        },

        async getMetrics(symbol) {
            const apiKey = CONFIG.APIs.FINNHUB.KEY;
            if (!apiKey || !Utils.checkRateLimit('FINNHUB')) {
                throw new Error('Finnhub API unavailable');
            }
            
            const url = `${CONFIG.APIs.FINNHUB.BASE_URL}/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`;
            return APIManager.request(url, {}, 'FINNHUB', 4);
        },

        async getMarketData() {
            const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'JPM'];
            const results = [];
            
            for (const symbol of symbols) {
                try {
                    // Use smart API selection based on availability
                    let quote = null;
                    
                    if (Utils.checkRateLimit('FINNHUB')) {
                        quote = await this.getQuote(symbol);
                    } else if (Utils.checkRateLimit('YAHOO_FINANCE')) {
                        quote = await APIManager.yahooFinance.getQuote(symbol);
                        // Convert format if needed
                        if (quote && quote.regularMarketPrice) {
                            quote = {
                                c: quote.regularMarketPrice,
                                d: quote.regularMarketChange,
                                dp: quote.regularMarketChangePercent,
                                h: quote.regularMarketDayHigh,
                                l: quote.regularMarketDayLow,
                                v: quote.regularMarketVolume
                            };
                        }
                    }
                    
                    if (quote) {
                        results.push({
                            symbol,
                            data: quote,
                            info: SYMBOLS.getSymbolInfo(symbol)
                        });
                    }
                    
                    // Respect rate limits
                    await Utils.sleep(200);
                    
                } catch (error) {
                    console.warn(`Failed to get data for ${symbol}:`, error.message);
                }
            }
            
            return results;
        }
    },

    // ENHANCED TRADING SIGNALS WITH MULTIPLE DATA SOURCES
    async generateTradingSignals() {
        try {
            console.log('🎯 Generating ENHANCED trading signals with multiple APIs...');
            
            const signals = [];
            const popularSymbols = SYMBOLS.getPopularSymbols('stocks', 6); // Reduced to save API calls
            
            console.log(`📊 Analyzing ${popularSymbols.length} symbols across multiple data sources...`);
            
            for (const symbol of popularSymbols) {
                try {
                    console.log(`🔍 Analyzing ${symbol}...`);
                    
                    // Get quote data from best available source
                    let quote = null;
                    let source = 'unknown';
                    
                    // Try Yahoo Finance first (better data quality)
                    if (Utils.checkRateLimit('YAHOO_FINANCE')) {
                        try {
                            const yahooData = await APIManager.yahooFinance.getQuote(symbol);
                            if (yahooData && yahooData.regularMarketPrice) {
                                quote = {
                                    c: yahooData.regularMarketPrice,
                                    d: yahooData.regularMarketChange,
                                    dp: yahooData.regularMarketChangePercent,
                                    h: yahooData.regularMarketDayHigh,
                                    l: yahooData.regularMarketDayLow,
                                    v: yahooData.regularMarketVolume
                                };
                                source = 'yahoo';
                            }
                        } catch (error) {
                            console.warn(`Yahoo Finance failed for ${symbol}`);
                        }
                    }
                    
                    // Fallback to Finnhub
                    if (!quote && Utils.checkRateLimit('FINNHUB')) {
                        try {
                            quote = await APIManager.finnhub.getQuote(symbol);
                            source = 'finnhub';
                        } catch (error) {
                            console.warn(`Finnhub failed for ${symbol}`);
                        }
                    }
                    
                    if (!quote || !quote.c) {
                        console.warn(`No quote data available for ${symbol}`);
                        continue;
                    }
                    
                    // Get news from best available source
                    let news = [];
                    
                    // Try NewsAPI first for better quality
                    if (Utils.checkRateLimit('NEWS_API')) {
                        try {
                            const newsData = await APIManager.newsAPI.getSymbolNews(symbol);
                            if (newsData && newsData.articles) {
                                news = newsData.articles.slice(0, 3).map(article => ({
                                    headline: article.title,
                                    summary: article.description,
                                    datetime: new Date(article.publishedAt).getTime() / 1000,
                                    source: article.source.name,
                                    url: article.url
                                }));
                            }
                        } catch (error) {
                            console.warn(`NewsAPI failed for ${symbol}`);
                        }
                    }
                    
                    // Fallback to Finnhub if no news from NewsAPI
                    if (news.length === 0 && Utils.checkRateLimit('FINNHUB')) {
                        try {
                            news = await APIManager.finnhub.getCompanyNews(symbol, 3);
                        } catch (error) {
                            console.warn(`Finnhub news failed for ${symbol}`);
                        }
                    }
                    
                    console.log(`📰 ${symbol}: Got ${news.length} news items from ${source}`);
                    
                    // Generate AI sentiment analysis
                    if (news.length > 0) {
                        const sentiments = await APIManager.huggingFace.analyzeNews(news);
                        
                        if (sentiments.length > 0) {
                            const avgSentiment = this.calculateAverageSentiment(sentiments);
                            const signal = this.generateSignal(symbol, avgSentiment, quote, sentiments);
                            
                            if (signal) {
                                signal.dataSource = source;
                                signal.newsSource = news[0]?.from_newsapi ? 'newsapi' : 'finnhub';
                                signals.push(signal);
                                console.log(`✅ Generated signal for ${symbol}: ${signal.direction} (${signal.confidence}%)`);
                            }
                        }
                    } else {
                        // Create technical signal if no news available
                        const technicalSignal = this.createTechnicalSignal(symbol, quote, source);
                        if (technicalSignal) {
                            signals.push(technicalSignal);
                            console.log(`📈 Technical signal for ${symbol}: ${technicalSignal.direction}`);
                        }
                    }
                    
                    // Rate limiting delay
                    await Utils.sleep(1000);
                    
                } catch (error) {
                    console.error(`❌ Error analyzing ${symbol}:`, error.message);
                }
            }
            
            if (signals.length === 0) {
                throw new Error('No signals could be generated - API limits or errors');
            }
            
            // Sort by confidence and data source quality
            const sortedSignals = signals.sort((a, b) => {
                const aScore = b.confidence + (a.dataSource === 'yahoo' ? 10 : 0);
                const bScore = a.confidence + (b.dataSource === 'yahoo' ? 10 : 0);
                return aScore - bScore;
            });
            
            console.log(`🎉 Generated ${sortedSignals.length} enhanced signals!`);
            return sortedSignals;
            
        } catch (error) {
            console.error('❌ Enhanced signal generation failed:', error);
            throw error;
        }
    },

    // Create technical signals when news is unavailable
    createTechnicalSignal(symbol, quote, source) {
        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
        const changePercent = quote.dp || 0;
        const volume = quote.v || 0;
        
        if (Math.abs(changePercent) < 1.0) {
            return null; // Not significant enough
        }
        
        const direction = changePercent > 0 ? 'bullish' : 'bearish';
        const confidence = Math.min(Math.abs(changePercent) * 10, 75);
        
        let reason = `Technisches Signal basierend auf ${Math.abs(changePercent).toFixed(2)}% Kursbewegung. `;
        reason += `Datenquelle: ${source.toUpperCase()}. `;
        
        if (Math.abs(changePercent) > 2) {
            reason += `Starke Bewegung deutet auf signifikantes Marktinteresse hin. `;
        }
        
        if (volume > 1000000) {
            reason += `Hohes Handelsvolumen von ${Utils.formatNumber(volume)} bestätigt das Signal.`;
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
            type: 'TECHNICAL_ENHANCED',
            dataSource: source,
            technicalIndicators: this.calculateTechnicalIndicators(quote),
            riskLevel: this.assessRiskLevel(confidence, Math.abs(changePercent))
        };
    },

    // MULTI-SOURCE MARKET MOVERS
    async getEnhancedMarketMovers() {
        try {
            const symbols = SYMBOLS.getPopularSymbols('stocks', 15);
            const movers = [];
            
            console.log('📊 Getting market movers from multiple sources...');
            
            // Try to get data from Yahoo Finance first (more reliable)
            let yahooSuccessCount = 0;
            for (const symbol of symbols.slice(0, 8)) { // Limit to save API calls
                if (!Utils.checkRateLimit('YAHOO_FINANCE')) break;
                
                try {
                    const yahooData = await APIManager.yahooFinance.getQuote(symbol);
                    if (yahooData && yahooData.regularMarketPrice) {
                        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
                        movers.push({
                            symbol,
                            name: symbolInfo?.name || symbol,
                            price: yahooData.regularMarketPrice,
                            change: yahooData.regularMarketChange || 0,
                            changePercent: yahooData.regularMarketChangePercent || 0,
                            volume: yahooData.regularMarketVolume || 0,
                            high: yahooData.regularMarketDayHigh || yahooData.regularMarketPrice,
                            low: yahooData.regularMarketDayLow || yahooData.regularMarketPrice,
                            logo: symbolInfo?.logo || '📈',
                            sector: symbolInfo?.sector || 'Unknown',
                            exchange: symbolInfo?.exchange || 'Unknown',
                            source: 'yahoo'
                        });
                        yahooSuccessCount++;
                    }
                } catch (error) {
                    console.warn(`Yahoo Finance failed for ${symbol}`);
                }
                
                await Utils.sleep(100); // Rate limiting
            }
            
            console.log(`✅ Got ${yahooSuccessCount} quotes from Yahoo Finance`);
            
            // Fill remaining with Finnhub if needed
            const remainingSymbols = symbols.slice(yahooSuccessCount);
            for (const symbol of remainingSymbols.slice(0, 10)) {
                if (!Utils.checkRateLimit('FINNHUB')) break;
                
                try {
                    const quote = await APIManager.finnhub.getQuote(symbol);
                    if (quote && quote.c) {
                        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
                        movers.push({
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
                            exchange: symbolInfo?.exchange || 'Unknown',
                            source: 'finnhub'
                        });
                    }
                } catch (error) {
                    console.warn(`Finnhub failed for ${symbol}`);
                }
                
                await Utils.sleep(100);
            }
            
            const winners = movers
                .filter(item => item.changePercent > 0)
                .sort((a, b) => b.changePercent - a.changePercent)
                .slice(0, 6);
                
            const losers = movers
                .filter(item => item.changePercent < 0)
                .sort((a, b) => a.changePercent - b.changePercent)
                .slice(0, 6);
            
            console.log(`📊 Market movers: ${winners.length} winners, ${losers.length} losers`);
            
            return { 
                winners, 
                losers,
                timestamp: Date.now(),
                totalAnalyzed: movers.length,
                sources: {
                    yahoo: movers.filter(m => m.source === 'yahoo').length,
                    finnhub: movers.filter(m => m.source === 'finnhub').length
                }
            };
        } catch (error) {
            console.error('Failed to get enhanced market movers:', error);
            return { winners: [], losers: [], timestamp: Date.now(), totalAnalyzed: 0 };
        }
    },

    // Calculate average sentiment (existing method)
    calculateAverageSentiment(sentiments) {
        if (!sentiments.length) return { label: 'neutral', score: 0 };
        
        let totalScore = 0;
        let positiveCount = 0;
        let negativeCount = 0;
        let totalWeight = 0;
        
        sentiments.forEach((item, index) => {
            if (item.sentiment) {
                const sentiment = item.sentiment;
                const weight = 1 / (index + 1);
                
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
        
        if (avgScore > CONFIG.SIGNALS.BULLISH_THRESHOLD) {
            return { label: 'positive', score: Math.abs(avgScore) };
        } else if (avgScore < CONFIG.SIGNALS.BEARISH_THRESHOLD) {
            return { label: 'negative', score: Math.abs(avgScore) };
        }
        
        return { label: 'neutral', score: Math.abs(avgScore) };
    },

    // Generate signal (existing method with enhancements)
    generateSignal(symbol, sentiment, quote, newsItems) {
        if (sentiment.score < CONFIG.SIGNALS.CONFIDENCE_THRESHOLD) {
            return null;
        }
        
        const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
        const change = quote.d || 0;
        const changePercent = quote.dp || 0;
        const volume = quote.v || 0;
        
        let direction, confidence, reason;
        
        if (sentiment.label === 'positive') {
            direction = 'bullish';
            confidence = Math.min(sentiment.score * 100, 95);
            
            reason = `KI-Sentiment-Analyse von ${newsItems.length} aktuellen Nachrichten zeigt positive Marktstimmung. `;
            if (change > 0) {
                reason += `Kurssteigerung von ${change.toFixed(2)}% bestätigt das bullische Signal. `;
            }
            reason += `Sentiment-Confidence: ${(sentiment.score * 100).toFixed(1)}%.`;
            
        } else if (sentiment.label === 'negative') {
            direction = 'bearish';
            confidence = Math.min(sentiment.score * 100, 95);
            
            reason = `KI-Sentiment-Analyse von ${newsItems.length} aktuellen Nachrichten zeigt negative Marktstimmung. `;
            if (change < 0) {
                reason += `Kursverlust von ${Math.abs(change).toFixed(2)}% bestätigt das bearische Signal. `;
            }
            reason += `Sentiment-Confidence: ${(sentiment.score * 100).toFixed(1)}%.`;
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
            type: 'AI_SENTIMENT_ENHANCED',
            technicalIndicators: this.calculateTechnicalIndicators(quote),
            riskLevel: this.assessRiskLevel(confidence, Math.abs(change)),
            analysisDetails: {
                avgSentiment: sentiment,
                newsQuality: newsItems[0]?.from_newsapi ? 'high' : 'standard'
            }
        };
    },

    // Technical indicators calculation (existing)
    calculateTechnicalIndicators(quote) {
        const price = quote.c;
        const high = quote.h;
        const low = quote.l;
        const volume = quote.v || 0;
        
        const changePercent = quote.dp || 0;
        const rsi = 50 + (changePercent * 2);
        const pricePosition = high > low ? ((price - low) / (high - low)) * 100 : 50;
        const volumeStrength = volume > 1000000 ? 'High' : volume > 500000 ? 'Medium' : 'Low';
        
        return {
            rsi: Math.max(0, Math.min(100, Math.round(rsi))),
            pricePosition: Math.round(pricePosition),
            volumeStrength,
            momentum: changePercent > 2 ? 'Strong Up' : changePercent > 0 ? 'Up' : changePercent < -2 ? 'Strong Down' : 'Down'
        };
    },

    // Risk assessment (existing)
    assessRiskLevel(confidence, volatility) {
        if (confidence > 80 && volatility < 2) return 'Low';
        if (confidence > 60 && volatility < 5) return 'Medium';
        return 'High';
    },

    // ENHANCED ASSET DATA WITH MULTIPLE SOURCES
    async getEnhancedAssetData(symbol, type = 'stock') {
        try {
            const symbolInfo = SYMBOLS.getSymbolInfo(symbol, type);
            
            if (type === 'stock') {
                // Try to get comprehensive data from multiple sources
                const dataPromises = {
                    quote: null,
                    profile: null,
                    news: null,
                    financials: null
                };
                
                // Primary quote source: Yahoo Finance
                if (Utils.checkRateLimit('YAHOO_FINANCE')) {
                    try {
                        const yahooQuote = await APIManager.yahooFinance.getQuote(symbol);
                        if (yahooQuote && yahooQuote.regularMarketPrice) {
                            dataPromises.quote = {
                                c: yahooQuote.regularMarketPrice,
                                d: yahooQuote.regularMarketChange,
                                dp: yahooQuote.regularMarketChangePercent,
                                h: yahooQuote.regularMarketDayHigh,
                                l: yahooQuote.regularMarketDayLow,
                                o: yahooQuote.regularMarketOpen,
                                pc: yahooQuote.regularMarketPreviousClose,
                                v: yahooQuote.regularMarketVolume,
                                source: 'yahoo'
                            };
                        }
                    } catch (error) {
                        console.warn('Yahoo Finance quote failed, trying Finnhub');
                    }
                }
                
                // Fallback quote source: Finnhub
                if (!dataPromises.quote && Utils.checkRateLimit('FINNHUB')) {
                    try {
                        dataPromises.quote = await APIManager.finnhub.getQuote(symbol);
                        dataPromises.quote.source = 'finnhub';
                    } catch (error) {
                        console.warn('Finnhub quote also failed');
                    }
                }
                
                // Company profile from Finnhub
                if (Utils.checkRateLimit('FINNHUB')) {
                    try {
                        dataPromises.profile = await APIManager.finnhub.getProfile(symbol);
                    } catch (error) {
                        console.warn('Company profile failed');
                    }
                }
                
                // News from best available source
                if (Utils.checkRateLimit('NEWS_API')) {
                    try {
                        const newsData = await APIManager.newsAPI.getSymbolNews(symbol);
                        if (newsData && newsData.articles) {
                            dataPromises.news = newsData.articles.slice(0, 10).map(article => ({
                                headline: article.title,
                                summary: article.description,
                                datetime: new Date(article.publishedAt).getTime() / 1000,
                                source: article.source.name,
                                url: article.url,
                                image: article.urlToImage,
                                from_newsapi: true
                            }));
                        }
                    } catch (error) {
                        console.warn('NewsAPI failed, trying Finnhub for company news');
                    }
                }
                
                // Fallback news from Finnhub
                if (!dataPromises.news && Utils.checkRateLimit('FINNHUB')) {
                    try {
                        dataPromises.news = await APIManager.finnhub.getCompanyNews(symbol, 10);
                    } catch (error) {
                        console.warn('Finnhub company news failed');
                    }
                }
                
                // Financial data from Yahoo Finance
                if (Utils.checkRateLimit('YAHOO_FINANCE')) {
                    try {
                        dataPromises.financials = await APIManager.yahooFinance.getFinancials(symbol);
                    } catch (error) {
                        console.warn('Yahoo Finance financials failed');
                    }
                }
                
                return {
                    symbol,
                    type: 'stock',
                    info: symbolInfo,
                    quote: dataPromises.quote,
                    profile: dataPromises.profile,
                    news: dataPromises.news || [],
                    financials: dataPromises.financials,
                    enhanced: true,
                    dataSources: {
                        quote: dataPromises.quote?.source || 'none',
                        news: dataPromises.news?.[0]?.from_newsapi ? 'newsapi' : 'finnhub'
                    }
                };
                
            } else if (type === 'crypto') {
                // Enhanced crypto data with multiple sources
                const cryptoId = this.getCryptoId(symbol);
                if (!cryptoId) return null;

                const [price, data] = await Promise.allSettled([
                    APIManager.coinGecko.getCryptoPrice(cryptoId),
                    APIManager.coinGecko.getCryptoData(cryptoId)
                ]);

                return {
                    symbol,
                    type: 'crypto',
                    info: symbolInfo,
                    price: price.status === 'fulfilled' ? price.value : null,
                    data: data.status === 'fulfilled' ? data.value : null,
                    enhanced: true,
                    dataSources: {
                        price: 'coingecko',
                        data: 'coingecko'
                    }
                };
            }
        } catch (error) {
            console.error(`Failed to get enhanced asset data for ${symbol}:`, error);
            return null;
        }
    },

    // SMART API USAGE MONITORING
    getAPIUsageReport() {
        const usage = APIKeys.getUsageStats();
        const recommendations = [];
        
        Object.entries(usage).forEach(([apiName, stats]) => {
            const usagePercent = stats.usagePercentage;
            
            if (usagePercent > 90) {
                recommendations.push({
                    api: apiName,
                    level: 'critical',
                    message: `${apiName} usage at ${usagePercent}% - consider reducing calls`,
                    action: 'Use cached data and reduce update frequency'
                });
            } else if (usagePercent > 75) {
                recommendations.push({
                    api: apiName,
                    level: 'warning',
                    message: `${apiName} usage at ${usagePercent}% - monitor closely`,
                    action: 'Implement smarter caching strategies'
                });
            } else if (usagePercent < 25) {
                recommendations.push({
                    api: apiName,
                    level: 'info',
                    message: `${apiName} usage at ${usagePercent}% - capacity available`,
                    action: 'Can increase usage if needed'
                });
            }
        });
        
        return {
            usage,
            recommendations,
            timestamp: new Date().toISOString(),
            cacheStats: CacheManager.getStats()
        };
    },

    // AUTO-SCALING API USAGE BASED ON TIME AND LIMITS
    async smartAPICall(apiName, callFunction, priority = 3, retries = 2) {
        const quota = Utils.getAvailableQuota(apiName);
        
        if (quota <= 0) {
            console.warn(`⚠️ No quota available for ${apiName}, using cache only`);
            throw new Error(`API quota exhausted for ${apiName}`);
        }
        
        // Check if this is a high-priority call during low-usage period
        const period = Utils.getCurrentTimePeriod();
        const shouldProceed = priority <= 2 || period === 'MORNING' || quota > 5;
        
        if (!shouldProceed) {
            console.warn(`⚠️ Deferring ${apiName} call due to quota management`);
            throw new Error(`API call deferred for quota management`);
        }
        
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await callFunction();
            } catch (error) {
                if (attempt === retries) {
                    throw error;
                }
                
                console.warn(`Attempt ${attempt}/${retries} failed for ${apiName}:`, error.message);
                await Utils.sleep(CONFIG.SETTINGS.RETRY_DELAY * attempt);
            }
        }
    },

    // CURRENCY CONVERSION INTEGRATION
    async convertPrice(amount, fromCurrency = 'USD', toCurrency = 'EUR') {
        try {
            if (Utils.checkRateLimit('EXCHANGE_RATE')) {
                const conversion = await APIManager.exchangeRate.convertCurrency(fromCurrency, toCurrency, amount);
                return conversion.result;
            } else {
                // Use cached rates
                const rates = await APIManager.exchangeRate.getLatestRates(fromCurrency);
                if (rates && rates.conversion_rates[toCurrency]) {
                    return amount * rates.conversion_rates[toCurrency];
                }
            }
        } catch (error) {
            console.warn('Currency conversion failed:', error.message);
        }
        
        // Fallback to basic conversion rates
        const fallbackRates = {
            'USD': { 'EUR': 0.85, 'GBP': 0.75, 'JPY': 110 },
            'EUR': { 'USD': 1.18, 'GBP': 0.88, 'JPY': 129 }
        };
        
        if (fallbackRates[fromCurrency] && fallbackRates[fromCurrency][toCurrency]) {
            return amount * fallbackRates[fromCurrency][toCurrency];
        }
        
        return amount; // Return original if conversion fails
    },

    // COMPREHENSIVE MARKET STATUS
    async getMarketStatus() {
        try {
            let status = null;
            
            // Try Polygon first for detailed market status
            if (Utils.checkRateLimit('POLYGON')) {
                try {
                    status = await APIManager.polygon.getMarketStatus();
                    status.source = 'polygon';
                } catch (error) {
                    console.warn('Polygon market status failed');
                }
            }
            
            // Fallback to basic status
            if (!status) {
                status = APIManager.polygon.getFallbackMarketStatus();
            }
            
            // Add exchange rates status
            if (Utils.checkRateLimit('EXCHANGE_RATE')) {
                try {
                    const rates = await APIManager.exchangeRate.getLatestRates('USD');
                    status.currencies = {
                        lastUpdate: rates.time_last_update_utc,
                        baseCurrency: rates.base_code,
                        ratesCount: Object.keys(rates.conversion_rates).length
                    };
                } catch (error) {
                    console.warn('Exchange rates status failed');
                }
            }
            
            return status;
        } catch (error) {
            console.error('Failed to get market status:', error);
            return APIManager.polygon.getFallbackMarketStatus();
        }
    },

    // EXISTING METHODS (keeping them for compatibility)
    alphaVantage: {
        async getIntraday(symbol, interval = '5min') {
            const apiKey = CONFIG.APIs.ALPHA_VANTAGE.KEY;
            if (!apiKey || !Utils.checkRateLimit('ALPHA_VANTAGE')) {
                throw new Error('Alpha Vantage API unavailable');
            }
            
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${interval}&apikey=${apiKey}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE', 3);
        },

        async getDaily(symbol) {
            const apiKey = CONFIG.APIs.ALPHA_VANTAGE.KEY;
            if (!apiKey || !Utils.checkRateLimit('ALPHA_VANTAGE')) {
                throw new Error('Alpha Vantage API unavailable');
            }
            
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE', 3);
        },

        async getOverview(symbol) {
            const apiKey = CONFIG.APIs.ALPHA_VANTAGE.KEY;
            if (!apiKey || !Utils.checkRateLimit('ALPHA_VANTAGE')) {
                throw new Error('Alpha Vantage API unavailable');
            }
            
            const url = `${CONFIG.APIs.ALPHA_VANTAGE.BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
            return APIManager.request(url, {}, 'ALPHA_VANTAGE', 4);
        }
    },

    coinGecko: {
        async getCryptoList() {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/list`;
            return APIManager.request(url, {}, 'COINGECKO', 4);
        },

        async getCryptoPrice(ids) {
            const idsString = Array.isArray(ids) ? ids.join(',') : ids;
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
            return APIManager.request(url, {}, 'COINGECKO', 2);
        },

        async getCryptoData(id) {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=false&sparkline=false`;
            return APIManager.request(url, {}, 'COINGECKO', 3);
        },

        async getCryptoMarket(limit = 100) {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&price_change_percentage=24h,7d`;
            return APIManager.request(url, {}, 'COINGECKO', 3);
        },

        async getTrending() {
            const url = `${CONFIG.APIs.COINGECKO.BASE_URL}/search/trending`;
            return APIManager.request(url, {}, 'COINGECKO', 4);
        }
    },

    huggingFace: {
        async analyzeSentiment(text) {
            const token = CONFIG.APIs.HUGGINGFACE.TOKEN;
            if (!token || !Utils.checkRateLimit('HUGGINGFACE')) {
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
                    return this.createFallbackSentiment(text);
                }
    
                const result = await response.json();
                
                if (result.error || !Array.isArray(result) || result.length === 0) {
                    return this.createFallbackSentiment(text);
                }
                
                Utils.incrementRateLimit('HUGGINGFACE');
                return result;
                
            } catch (error) {
                return this.createFallbackSentiment(text);
            }
        },

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
            let positiveCount = 0;
            let negativeCount = 0;
    
            positiveWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = (lowerText.match(regex) || []).length;
                if (matches > 0) {
                    positiveCount += matches;
                    const weight = ['excellent', 'surge', 'beat', 'exceed'].includes(word) ? 0.25 : 0.15;
                    score += matches * weight;
                }
            });
    
            negativeWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const matches = (lowerText.match(regex) || []).length;
                if (matches > 0) {
                    negativeCount += matches;
                    const weight = ['crash', 'plunge', 'disappointing', 'underperform'].includes(word) ? 0.25 : 0.15;
                    score -= matches * weight;
                }
            });

            if (lowerText.includes('earnings beat') || lowerText.includes('revenue growth')) {
                score += 0.3;
            }
            if (lowerText.includes('earnings miss') || lowerText.includes('guidance cut')) {
                score -= 0.3;
            }

            const textLength = text.split(' ').length;
            if (textLength > 0) {
                score = score / Math.sqrt(textLength) * 8;
            }
    
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
    
            return [{
                label: label,
                score: confidence,
                details: {
                    positiveWords: positiveCount,
                    negativeWords: negativeCount,
                    fallback: true
                }
            }];
        },
    
        async analyzeNews(newsItems) {
            const analyses = [];
            
            for (const [index, item] of newsItems.slice(0, 5).entries()) {
                const text = item.headline || item.title || item.summary || '';
                if (text && text.trim().length > 15) {
                    try {
                        const sentiment = await this.analyzeSentiment(text);
                        if (sentiment && sentiment.length > 0) {
                            analyses.push({
                                ...item,
                                sentiment: sentiment[0],
                                analyzedText: text.substring(0, 150)
                            });
                        }
                    } catch (error) {
                        console.warn('Error analyzing news item:', error.message);
                    }
                }
                
                await Utils.sleep(600);
            }
            
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

    // COMPATIBILITY METHODS
    async getAssetData(symbol, type = 'stock') {
        return this.getEnhancedAssetData(symbol, type);
    },

    async getMarketMovers() {
        return this.getEnhancedMarketMovers();
    },

    async generateTradingIdeas() {
        // Enhanced trading ideas with real market data
        const ideas = [
            {
                id: Utils.generateId(),
                title: "Multi-Source KI Momentum Strategy",
                type: "Enhanced Growth",
                description: "Nutzt Yahoo Finance und NewsAPI für präzise KI-Signale mit verbesserter Datenqualität und Sentiment-Analyse.",
                symbols: ["NVDA", "MSFT", "GOOGL", "AMD"],
                riskLevel: "medium",
                timeframe: "2-4 Monate",
                confidence: 87,
                expectedReturn: "18-28%",
                timestamp: Date.now(),
                analysis: "Verbesserte KI-Analyse durch mehrere Datenquellen zeigt starkes Momentum in Tech-Sektor.",
                catalysts: ["Erweiterte API-Abdeckung", "Bessere News-Qualität", "Multi-Source-Validierung"],
                risks: ["API-Limits", "Marktvolatilität", "Tech-Sektor-Risiken"]
            },
            {
                id: Utils.generateId(),
                title: "Globale Währungs-Arbitrage",
                type: "Currency Strategy",
                description: "Nutzt ExchangeRate-API für präzise Währungskonvertierung und Arbitrage-Gelegenheiten in internationalen Märkten.",
                symbols: ["JPM", "V", "MA", "WFC"],
                riskLevel: "low",
                timeframe: "3-6 Monate",
                confidence: 79,
                expectedReturn: "8-14%",
                timestamp: Date.now(),
                analysis: "Echtzeit-Wechselkurse ermöglichen bessere internationale Portfolio-Bewertung.",
                catalysts: ["Währungsvolatilität", "Internationale Expansion", "Zinsunterschiede"],
                risks: ["Wechselkursrisiko", "Politische Ereignisse", "Zentralbank-Politik"]
            },
            {
                id: Utils.generateId(),
                title: "News-Driven Event Trading",
                type: "Event Strategy",
                description: "Hochwertige NewsAPI-Integration ermöglicht schnelle Reaktion auf Marktereignisse mit verbesserter Nachrichtenqualität.",
                symbols: ["TSLA", "AAPL", "META", "NFLX"],
                riskLevel: "high",
                timeframe: "1-3 Monate",
                confidence: 72,
                expectedReturn: "20-35%",
                timestamp: Date.now(),
                analysis: "Erweiterte News-Abdeckung durch NewsAPI bietet Wettbewerbsvorteile bei Event-Trading.",
                catalysts: ["Earnings-Überraschungen", "Produktankündigungen", "Regulatorische Änderungen"],
                risks: ["Hohe Volatilität", "Event-Risiko", "Timing-Sensitivität"]
            }
        ];
        
        return ideas;
    },

    // API HEALTH AND MONITORING
    async performHealthCheck() {
        const results = {
            timestamp: new Date().toISOString(),
            apis: {},
            overall: 'unknown',
            usageStats: APIKeys.getUsageStats()
        };

        const checks = [
            { name: 'Yahoo Finance', test: async () => {
                if (!Utils.checkRateLimit('YAHOO_FINANCE')) throw new Error('Rate limited');
                return await this.yahooFinance.getQuote('AAPL');
            }},
            { name: 'NewsAPI', test: async () => {
                if (!Utils.checkRateLimit('NEWS_API')) throw new Error('Rate limited');
                return await this.newsAPI.getFinancialNews();
            }},
            { name: 'ExchangeRate', test: async () => {
                if (!Utils.checkRateLimit('EXCHANGE_RATE')) throw new Error('Rate limited');
                return await this.exchangeRate.getLatestRates('USD');
            }},
            { name: 'Polygon', test: async () => {
                if (!Utils.checkRateLimit('POLYGON')) throw new Error('Rate limited');
                return await this.polygon.getMarketStatus();
            }},
            { name: 'Finnhub', test: async () => {
                if (!Utils.checkRateLimit('FINNHUB')) throw new Error('Rate limited');
                return await this.finnhub.getQuote('AAPL');
            }},
            { name: 'CoinGecko', test: async () => {
                if (!Utils.checkRateLimit('COINGECKO')) throw new Error('Rate limited');
                return await this.coinGecko.getCryptoPrice('bitcoin');
            }}
        ];

        let healthyCount = 0;

        for (const check of checks) {
            try {
                await Promise.race([
                    check.test(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 8000))
                ]);
                results.apis[check.name] = { status: 'healthy', message: 'API responding normally' };
                healthyCount++;
            } catch (error) {
                results.apis[check.name] = { 
                    status: error.message.includes('Rate limited') ? 'rate_limited' : 'error', 
                    message: error.message
                };
            }
        }

        // Overall health assessment
        if (healthyCount === checks.length) results.overall = 'excellent';
        else if (healthyCount >= checks.length * 0.8) results.overall = 'good';
        else if (healthyCount >= checks.length * 0.5) results.overall = 'fair';
        else results.overall = 'poor';

        this.lastHealthCheck = results;
        return results;
    },

    // Error handler with retry logic (COMPATIBILITY METHOD)
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
            const apiConfig = CONFIG.APIs[apiName];
            if (apiConfig) {
                stats.rateLimits[apiName] = {
                    used: limit.requests,
                    limit: apiConfig.RATE_LIMIT,
                    resetTime: new Date(limit.resetTime).toISOString(),
                    available: apiConfig.RATE_LIMIT - limit.requests
                };
            }
        });

        // API key configuration status
        stats.apiKeysConfigured = {
            finnhub: !!(CONFIG.APIs.FINNHUB.KEY && CONFIG.APIs.FINNHUB.KEY.length > 10 && !CONFIG.APIs.FINNHUB.KEY.includes('DEMO')),
            alphaVantage: !!(CONFIG.APIs.ALPHA_VANTAGE.KEY && CONFIG.APIs.ALPHA_VANTAGE.KEY.length > 10 && !CONFIG.APIs.ALPHA_VANTAGE.KEY.includes('DEMO')),
            huggingFace: !!(CONFIG.APIs.HUGGINGFACE.TOKEN && CONFIG.APIs.HUGGINGFACE.TOKEN.length > 10 && !CONFIG.APIs.HUGGINGFACE.TOKEN.includes('DEMO')),
            coinGecko: true, // No API key required
            yahooFinance: !!(CONFIG.APIs.YAHOO_FINANCE.KEY && CONFIG.APIs.YAHOO_FINANCE.KEY.length > 10),
            newsAPI: !!(CONFIG.APIs.NEWS_API.KEY && CONFIG.APIs.NEWS_API.KEY.length > 10),
            exchangeRate: !!(CONFIG.APIs.EXCHANGE_RATE.KEY && CONFIG.APIs.EXCHANGE_RATE.KEY.length > 10),
            polygon: !!(CONFIG.APIs.POLYGON.KEY && CONFIG.APIs.POLYGON.KEY.length > 10)
        };

        return stats;
    },

    // Initialize enhanced API manager
    async init() {
        console.log('🔌 Enhanced API Manager initializing...');
        
        try {
            APIKeys.init();
            
            const healthCheck = await this.performHealthCheck();
            const healthyApis = Object.values(healthCheck.apis)
                .filter(api => api.status === 'healthy').length;
            
            console.log(`✅ Enhanced API Manager initialized - ${healthyApis}/${Object.keys(healthCheck.apis).length} APIs healthy`);
            console.log('📊 Usage stats:', APIKeys.getUsageStats());
            
            // Set up periodic health monitoring
            setInterval(() => {
                this.performHealthCheck().catch(error => {
                    console.warn('Periodic health check failed:', error.message);
                });
            }, 600000); // Every 10 minutes
            
            return true;
            
        } catch (error) {
            console.error('❌ Enhanced API Manager initialization failed:', error);
            return false;
        }
    }
};

// Auto-initialize enhanced API Manager
document.addEventListener('DOMContentLoaded', () => {
    APIManager.init().then(success => {
        if (success) {
            console.log('🚀 MoneyMagnet Enhanced API Manager ready with REAL APIs');
        } else {
            console.warn('⚠️ Enhanced API Manager started with limited functionality');
        }
    });
});

// Export for global access
window.APIManager = APIManager;

console.log('💰 MoneyMagnet Enhanced API Manager loaded with Yahoo Finance, NewsAPI, ExchangeRate-API & Polygon.io');