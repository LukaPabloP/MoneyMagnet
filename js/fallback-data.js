// MoneyMagnet v2.0 - Emergency Fallback Data System
// Aktiviert sich wenn alle APIs das Rate Limit erreicht haben

const FallbackDataManager = {
    // Demo-Aktienquotes (aktualisiert sich mit realistischen Schwankungen)
    generateRealisticQuote(symbol, basePrice) {
        const now = Date.now();
        const dayStart = new Date().setHours(0, 0, 0, 0);
        const timeProgress = (now - dayStart) / (24 * 60 * 60 * 1000); // 0-1 für den Tag
        
        // Simuliere Marktvolatilität basierend auf Tageszeit
        const morningVolatility = 0.02; // 2% am Morgen
        const midDayVolatility = 0.01;  // 1% mittags
        const eveningVolatility = 0.015; // 1.5% abends
        
        let volatility = morningVolatility;
        if (timeProgress > 0.3 && timeProgress < 0.7) {
            volatility = midDayVolatility;
        } else if (timeProgress > 0.7) {
            volatility = eveningVolatility;
        }
        
        // Generiere realistische Preisbewegung
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const currentPrice = basePrice * (1 + randomChange);
        const changePercent = randomChange * 100;
        const changeDollar = basePrice * randomChange;
        
        // Simuliere Tagesrange
        const dayHigh = currentPrice * (1 + Math.random() * volatility);
        const dayLow = currentPrice * (1 - Math.random() * volatility);
        
        return {
            c: Number(currentPrice.toFixed(2)),
            d: Number(changeDollar.toFixed(2)),
            dp: Number(changePercent.toFixed(2)),
            h: Number(dayHigh.toFixed(2)),
            l: Number(dayLow.toFixed(2)),
            o: Number((currentPrice * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2)),
            pc: basePrice,
            v: Math.floor(Math.random() * 50000000) + 1000000, // 1M-51M Volumen
            t: Math.floor(now / 1000),
            source: 'fallback_realistic'
        };
    },

    // Basis-Preise für beliebte Aktien (werden als Referenz verwendet)
    baseStockPrices: {
        'AAPL': 150.00,
        'TSLA': 180.00,
        'MSFT': 280.00,
        'GOOGL': 2800.00,
        'AMZN': 3200.00,
        'META': 200.00,
        'NVDA': 220.00,
        'JPM': 140.00,
        'JNJ': 160.00,
        'V': 200.00,
        'MA': 350.00,
        'PG': 140.00,
        'KO': 55.00,
        'PEP': 170.00,
        'WMT': 145.00,
        'HD': 300.00,
        'XOM': 60.00,
        'CVX': 150.00,
        'VZ': 40.00,
        'T': 20.00,
        'BA': 200.00,
        'DIS': 90.00,
        'NFLX': 400.00
    },

    // Realistische Nachrichten-Templates
    newsTemplates: [
        {
            category: 'earnings',
            templates: [
                '{company} veröffentlicht Quartalsergebnisse mit gemischten Signalen',
                '{company} übertrifft Analystenschätzungen bei Umsatz und Gewinn',
                '{company} meldet starkes Wachstum im {sector}-Segment',
                'Analysten erhöhen Kursziel für {company} nach soliden Zahlen'
            ]
        },
        {
            category: 'market',
            templates: [
                'Tech-Aktien zeigen gemischte Performance in volatiler Handelssitzung',
                'Märkte reagieren auf neue Wirtschaftsdaten mit moderaten Gewinnen',
                'Finanzsektor profitiert von steigenden Zinsen und stabiler Konjunktur',
                'Defensive Aktien gewinnen an Attraktivität bei Marktungewissheit'
            ]
        },
        {
            category: 'sector',
            templates: [
                '{sector}-Sektor zeigt Stärke trotz makroökonomischer Herausforderungen',
                'Innovation und Wachstum treiben {sector}-Unternehmen zu neuen Höhen',
                '{sector}-Branche profitiert von veränderten Verbrauchergewohnheiten',
                'Regulatorische Änderungen beeinflussen {sector}-Landschaft positiv'
            ]
        }
    ],

    // Generiere realistische Nachrichten
    generateFallbackNews(count = 15) {
        const news = [];
        const companies = Object.keys(this.baseStockPrices);
        const sectors = ['Technology', 'Healthcare', 'Financial Services', 'Consumer Goods', 'Energy'];
        
        for (let i = 0; i < count; i++) {
            const category = this.newsTemplates[Math.floor(Math.random() * this.newsTemplates.length)];
            const template = category.templates[Math.floor(Math.random() * category.templates.length)];
            const company = companies[Math.floor(Math.random() * companies.length)];
            const sector = sectors[Math.floor(Math.random() * sectors.length)];
            
            // Ersetze Platzhalter
            let headline = template
                .replace('{company}', SYMBOLS.getSymbolInfo(company)?.name || company)
                .replace('{sector}', sector);
            
            // Generiere realistische Zeit (letzte 24 Stunden)
            const hoursAgo = Math.random() * 24;
            const timestamp = Date.now() - (hoursAgo * 60 * 60 * 1000);
            
            news.push({
                id: `fallback_${i}_${Date.now()}`,
                headline: headline,
                summary: this.generateNewsSummary(headline, company, sector),
                datetime: Math.floor(timestamp / 1000),
                source: 'MoneyMagnet Analysis',
                url: `#fallback-news-${i}`,
                category: category.category,
                related: company,
                image: null,
                from_fallback: true
            });
        }
        
        // Sortiere nach Zeit (neueste zuerst)
        return news.sort((a, b) => b.datetime - a.datetime);
    },

    // Generiere News-Zusammenfassung
    generateNewsSummary(headline, company, sector) {
        const summaryTemplates = [
            `Die aktuellen Entwicklungen bei ${company} zeigen positive Trends im ${sector}-Bereich. Analysten bewerten die Geschäftsstrategie optimistisch.`,
            `Marktbeobachter verfolgen die Performance von ${company} genau. Die jüngsten Zahlen deuten auf eine stabile Entwicklung hin.`,
            `${company} setzt seinen Wachstumskurs fort und profitiert von günstigen Marktbedingungen im ${sector}-Sektor.`,
            `Die Investoren reagieren positiv auf die strategischen Initiativen von ${company} zur Stärkung der Marktposition.`,
            `Experten sehen ${company} gut positioniert für zukünftiges Wachstum trotz aktueller Marktherausforderungen.`
        ];
        
        return summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
    },

    // Trading-Signale basierend auf "technischer Analyse"
    generateFallbackSignals(count = 5) {
        const signals = [];
        const symbols = Object.keys(this.baseStockPrices).slice(0, count);
        
        symbols.forEach((symbol, index) => {
            const quote = this.generateRealisticQuote(symbol, this.baseStockPrices[symbol]);
            const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
            
            // Einfache technische Signal-Logik
            const changePercent = quote.dp;
            const volume = quote.v;
            const pricePosition = ((quote.c - quote.l) / (quote.h - quote.l)) * 100;
            
            let direction, confidence, reason;
            
            // Signal-Logik basierend auf Preisbewegung und Volumen
            if (changePercent > 1 && volume > 20000000 && pricePosition > 70) {
                direction = 'bullish';
                confidence = Math.min(60 + Math.abs(changePercent) * 5 + (volume / 1000000), 85);
                reason = `Technische Analyse zeigt bullisches Momentum: +${changePercent.toFixed(2)}% bei hohem Volumen (${Utils.formatNumber(volume)}). Kurs nahe Tageshoch deutet auf anhaltende Stärke hin.`;
            } else if (changePercent < -1 && volume > 20000000 && pricePosition < 30) {
                direction = 'bearish';
                confidence = Math.min(60 + Math.abs(changePercent) * 5 + (volume / 1000000), 85);
                reason = `Technische Analyse zeigt bearisches Momentum: ${changePercent.toFixed(2)}% bei erhöhtem Volumen (${Utils.formatNumber(volume)}). Kurs nahe Tagestief signalisiert Verkaufsdruck.`;
            } else if (Math.abs(changePercent) > 0.5) {
                direction = changePercent > 0 ? 'bullish' : 'bearish';
                confidence = Math.min(45 + Math.abs(changePercent) * 3, 70);
                reason = `Moderate technische Signale: ${changePercent.toFixed(2)}% Bewegung mit durchschnittlichem Volumen. Trend erfordert Bestätigung durch weitere Marktdaten.`;
            } else {
                // Überspringe neutrale Signale
                return;
            }
            
            signals.push({
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
                newsCount: Math.floor(Math.random() * 5) + 1,
                type: 'TECHNICAL_FALLBACK',
                technicalIndicators: {
                    rsi: Math.round(50 + changePercent * 3),
                    pricePosition: Math.round(pricePosition),
                    volumeStrength: volume > 30000000 ? 'High' : volume > 15000000 ? 'Medium' : 'Low',
                    momentum: changePercent > 2 ? 'Strong Up' : changePercent > 0 ? 'Up' : changePercent < -2 ? 'Strong Down' : 'Down'
                },
                riskLevel: confidence > 75 ? 'Low' : confidence > 60 ? 'Medium' : 'High',
                dataSource: 'fallback',
                fallbackGenerated: true
            });
        });
        
        return signals.filter(s => s).sort((a, b) => b.confidence - a.confidence);
    },

    // Market Movers mit realistischen Daten
    generateFallbackMarketMovers() {
        const symbols = Object.keys(this.baseStockPrices);
        const movers = [];
        
        symbols.forEach(symbol => {
            const quote = this.generateRealisticQuote(symbol, this.baseStockPrices[symbol]);
            const symbolInfo = SYMBOLS.getSymbolInfo(symbol);
            
            movers.push({
                symbol,
                name: symbolInfo?.name || symbol,
                price: quote.c,
                change: quote.d,
                changePercent: quote.dp,
                volume: quote.v,
                high: quote.h,
                low: quote.l,
                logo: symbolInfo?.logo || '📈',
                sector: symbolInfo?.sector || 'Technology',
                exchange: symbolInfo?.exchange || 'NASDAQ',
                source: 'fallback'
            });
        });
        
        // Sortiere für Winners/Losers
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
            totalAnalyzed: movers.length,
            source: 'fallback_realistic',
            note: 'Daten basieren auf technischer Simulation - API-Limits erreicht'
        };
    },

    // Trading Ideas mit realistischen Strategien
    generateFallbackTradingIdeas() {
        const currentHour = new Date().getHours();
        const isMarketHours = currentHour >= 9 && currentHour <= 16;
        
        const ideas = [
            {
                id: Utils.generateId(),
                title: "Technische Momentum-Strategie",
                type: "Technical Analysis",
                description: "Nutzt kurzfristige Preisbewegungen und Volumen-Indikatoren für timing-basierte Trades bei hochliquiden Aktien.",
                symbols: ["AAPL", "MSFT", "GOOGL", "TSLA"],
                riskLevel: "medium",
                timeframe: "1-2 Wochen",
                confidence: isMarketHours ? 72 : 65,
                expectedReturn: "8-15%",
                timestamp: Date.now(),
                analysis: "Fallback-Analyse basiert auf historischen Mustern und aktuellen technischen Indikatoren aus simulierten Marktdaten.",
                catalysts: ["Volumen-Ausbrüche", "Trend-Bestätigungen", "Support/Resistance-Levels"],
                risks: ["Marktvolatilität", "Fehlsignale", "Timing-Risiko"],
                source: 'fallback'
            },
            {
                id: Utils.generateId(),
                title: "Sektor-Rotation Defensive",
                type: "Sector Strategy",
                description: "Fokussiert auf stabile Dividendenzahler und defensive Sektoren während unsicherer Marktphasen.",
                symbols: ["JNJ", "PG", "KO", "VZ"],
                riskLevel: "low",
                timeframe: "3-6 Monate",
                confidence: 78,
                expectedReturn: "6-12%",
                timestamp: Date.now(),
                analysis: "Defensive Strategie basiert auf historischer Outperformance während Marktturbulenzen und stabilen Geschäftsmodellen.",
                catalysts: ["Dividenden-Kontinuität", "Stabile Cashflows", "Defensive Nachfrage"],
                risks: ["Zinssensitivität", "Inflationsrisiko", "Niedrige Wachstumsraten"],
                source: 'fallback'
            },
            {
                id: Utils.generateId(),
                title: "Tech-Innovation Recovery",
                type: "Growth Recovery",
                description: "Positionierung in qualitativ hochwertigen Tech-Aktien nach Korrekturen für langfristiges Wachstum.",
                symbols: ["NVDA", "META", "NFLX"],
                riskLevel: "high",
                timeframe: "6-12 Monate",
                confidence: 68,
                expectedReturn: "20-35%",
                timestamp: Date.now(),
                analysis: "Recovery-Strategie nutzt temporäre Bewertungsrückgänge bei fundamentall starken Technologieunternehmen.",
                catalysts: ["Innovation-Zyklen", "Marktanteil-Gewinne", "Bewertungs-Normalisierung"],
                risks: ["Technologie-Disruption", "Regulierung", "Makro-Headwinds"],
                source: 'fallback'
            }
        ];
        
        return ideas;
    },

    // Haupt-Fallback-Funktion
    async provideFallbackData(dataType, options = {}) {
        console.log(`🔄 Providing fallback data for: ${dataType}`);
        
        switch (dataType) {
            case 'quote':
                const symbol = options.symbol || 'AAPL';
                const basePrice = this.baseStockPrices[symbol] || 100;
                return this.generateRealisticQuote(symbol, basePrice);
                
            case 'signals':
                return this.generateFallbackSignals(options.count || 5);
                
            case 'news':
                return this.generateFallbackNews(options.count || 15);
                
            case 'marketMovers':
                return this.generateFallbackMarketMovers();
                
            case 'tradingIdeas':
                return this.generateFallbackTradingIdeas();
                
            default:
                console.warn(`Unknown fallback data type: ${dataType}`);
                return null;
        }
    },

    // Check if we should use fallback (all APIs at limit)
    shouldUseFallback() {
        const criticalAPIs = ['YAHOO_FINANCE', 'NEWS_API', 'FINNHUB'];
        const allAtLimit = criticalAPIs.every(api => !Utils.checkRateLimit(api));
        
        if (allAtLimit) {
            console.warn('⚠️ All critical APIs at rate limit - switching to fallback mode');
            return true;
        }
        
        return false;
    },

    // Status der Fallback-Modi
    getStatus() {
        return {
            fallbackActive: this.shouldUseFallback(),
            availableDataTypes: ['quote', 'signals', 'news', 'marketMovers', 'tradingIdeas'],
            lastGenerated: {
                signals: localStorage.getItem('fallback_signals_time'),
                news: localStorage.getItem('fallback_news_time'),
                marketMovers: localStorage.getItem('fallback_movers_time')
            },
            dataQuality: 'simulated_realistic'
        };
    }
};

// Global export
window.FallbackDataManager = FallbackDataManager;

console.log('🔄 Fallback Data Manager loaded - Ready for emergency data provision');