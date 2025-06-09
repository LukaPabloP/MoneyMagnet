// MoneyMagnet v2.0 - Symbol Database
const SYMBOLS = {
    STOCKS: {
        // Mega Cap Tech
        'AAPL': { name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '🍎' },
        'MSFT': { name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology', logo: '💻' },
        'GOOGL': { name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '🔍' },
        'AMZN': { name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', logo: '📦' },
        'TSLA': { name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', logo: '🚗' },
        'META': { name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '📘' },
        'NVDA': { name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology', logo: '🎮' },
        
        // Financial Services
        'JPM': { name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financial Services', logo: '🏦' },
        'BAC': { name: 'Bank of America Corp.', exchange: 'NYSE', sector: 'Financial Services', logo: '🏛️' },
        'WFC': { name: 'Wells Fargo & Company', exchange: 'NYSE', sector: 'Financial Services', logo: '🏪' },
        'GS': { name: 'Goldman Sachs Group Inc.', exchange: 'NYSE', sector: 'Financial Services', logo: '💰' },
        'MS': { name: 'Morgan Stanley', exchange: 'NYSE', sector: 'Financial Services', logo: '📊' },
        'V': { name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financial Services', logo: '💳' },
        'MA': { name: 'Mastercard Inc.', exchange: 'NYSE', sector: 'Financial Services', logo: '💰' },
        
        // Healthcare
        'JNJ': { name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare', logo: '🏥' },
        'PFE': { name: 'Pfizer Inc.', exchange: 'NYSE', sector: 'Healthcare', logo: '💊' },
        'UNH': { name: 'UnitedHealth Group Inc.', exchange: 'NYSE', sector: 'Healthcare', logo: '🏥' },
        'ABBV': { name: 'AbbVie Inc.', exchange: 'NYSE', sector: 'Healthcare', logo: '💉' },
        'MRK': { name: 'Merck & Co. Inc.', exchange: 'NYSE', sector: 'Healthcare', logo: '🔬' },
        
        // Consumer Goods
        'PG': { name: 'Procter & Gamble Co.', exchange: 'NYSE', sector: 'Consumer Staples', logo: '🧴' },
        'KO': { name: 'Coca-Cola Company', exchange: 'NYSE', sector: 'Consumer Staples', logo: '🥤' },
        'PEP': { name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Consumer Staples', logo: '🥤' },
        'WMT': { name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Staples', logo: '🛒' },
        'HD': { name: 'Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary', logo: '🔨' },
        
        // Energy
        'XOM': { name: 'Exxon Mobil Corporation', exchange: 'NYSE', sector: 'Energy', logo: '⛽' },
        'CVX': { name: 'Chevron Corporation', exchange: 'NYSE', sector: 'Energy', logo: '🛢️' },
        
        // Telecom
        'VZ': { name: 'Verizon Communications Inc.', exchange: 'NYSE', sector: 'Telecommunications', logo: '📱' },
        'T': { name: 'AT&T Inc.', exchange: 'NYSE', sector: 'Telecommunications', logo: '📞' },
        
        // Aerospace
        'BA': { name: 'Boeing Company', exchange: 'NYSE', sector: 'Industrials', logo: '✈️' },
        
        // Entertainment
        'DIS': { name: 'Walt Disney Company', exchange: 'NYSE', sector: 'Communication Services', logo: '🏰' },
        'NFLX': { name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communication Services', logo: '🎬' },
        
        // German Stocks (DAX)
        'SAP': { name: 'SAP SE', exchange: 'XETRA', sector: 'Technology', logo: '💼' },
        'SIE': { name: 'Siemens AG', exchange: 'XETRA', sector: 'Industrials', logo: '⚡' },
        'ASML': { name: 'ASML Holding N.V.', exchange: 'NASDAQ', sector: 'Technology', logo: '🔬' },
        
        // Emerging Tech
        'PLTR': { name: 'Palantir Technologies Inc.', exchange: 'NYSE', sector: 'Technology', logo: '🎯' },
        'SNOW': { name: 'Snowflake Inc.', exchange: 'NYSE', sector: 'Technology', logo: '❄️' },
        'ZM': { name: 'Zoom Video Communications', exchange: 'NASDAQ', sector: 'Technology', logo: '📹' },
        'UBER': { name: 'Uber Technologies Inc.', exchange: 'NYSE', sector: 'Technology', logo: '🚕' },
        'LYFT': { name: 'Lyft Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '🚗' },
        'SPOT': { name: 'Spotify Technology S.A.', exchange: 'NYSE', sector: 'Technology', logo: '🎵' },
        'SQ': { name: 'Block Inc.', exchange: 'NYSE', sector: 'Technology', logo: '💳' },
        'PYPL': { name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '💰' },
        
        // Retail
        'AMZN': { name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', logo: '📦' },
        'COST': { name: 'Costco Wholesale Corporation', exchange: 'NASDAQ', sector: 'Consumer Staples', logo: '🏪' },
        'TGT': { name: 'Target Corporation', exchange: 'NYSE', sector: 'Consumer Discretionary', logo: '🎯' },
        
        // Semiconductor
        'AMD': { name: 'Advanced Micro Devices', exchange: 'NASDAQ', sector: 'Technology', logo: '💻' },
        'INTC': { name: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology', logo: '🖥️' },
        'QCOM': { name: 'Qualcomm Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '📱' },
        'AVGO': { name: 'Broadcom Inc.', exchange: 'NASDAQ', sector: 'Technology', logo: '🔌' },
        
        // Biotech
        'GILD': { name: 'Gilead Sciences Inc.', exchange: 'NASDAQ', sector: 'Healthcare', logo: '💊' },
        'BIIB': { name: 'Biogen Inc.', exchange: 'NASDAQ', sector: 'Healthcare', logo: '🧬' },
        'MRNA': { name: 'Moderna Inc.', exchange: 'NASDAQ', sector: 'Healthcare', logo: '💉' },
        
        // EV & Clean Energy
        'NIO': { name: 'NIO Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary', logo: '🔋' },
        'XPEV': { name: 'XPeng Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary', logo: '⚡' },
        'LI': { name: 'Li Auto Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary', logo: '🚗' }
    },
    
    CRYPTO: {
        'BTC': { name: 'Bitcoin', symbol: 'BTC', logo: '₿' },
        'ETH': { name: 'Ethereum', symbol: 'ETH', logo: '♦️' },
        'BNB': { name: 'Binance Coin', symbol: 'BNB', logo: '🔶' },
        'ADA': { name: 'Cardano', symbol: 'ADA', logo: '🔷' },
        'SOL': { name: 'Solana', symbol: 'SOL', logo: '☀️' },
        'XRP': { name: 'Ripple', symbol: 'XRP', logo: '💧' },
        'DOT': { name: 'Polkadot', symbol: 'DOT', logo: '⚫' },
        'DOGE': { name: 'Dogecoin', symbol: 'DOGE', logo: '🐕' },
        'AVAX': { name: 'Avalanche', symbol: 'AVAX', logo: '🏔️' },
        'LINK': { name: 'Chainlink', symbol: 'LINK', logo: '🔗' },
        'MATIC': { name: 'Polygon', symbol: 'MATIC', logo: '🔺' },
        'UNI': { name: 'Uniswap', symbol: 'UNI', logo: '🦄' },
        'LTC': { name: 'Litecoin', symbol: 'LTC', logo: '⚡' },
        'BCH': { name: 'Bitcoin Cash', symbol: 'BCH', logo: '💰' },
        'ALGO': { name: 'Algorand', symbol: 'ALGO', logo: '🔷' },
        'VET': { name: 'VeChain', symbol: 'VET', logo: '✅' },
        'FIL': { name: 'Filecoin', symbol: 'FIL', logo: '📁' },
        'TRX': { name: 'TRON', symbol: 'TRX', logo: '🎭' },
        'ETC': { name: 'Ethereum Classic', symbol: 'ETC', logo: '💎' },
        'XLM': { name: 'Stellar', symbol: 'XLM', logo: '⭐' },
        'THETA': { name: 'Theta Network', symbol: 'THETA', logo: '📺' },
        'FTM': { name: 'Fantom', symbol: 'FTM', logo: '👻' },
        'ATOM': { name: 'Cosmos', symbol: 'ATOM', logo: '🌌' },
        'NEAR': { name: 'NEAR Protocol', symbol: 'NEAR', logo: '🌐' },
        'SAND': { name: 'The Sandbox', symbol: 'SAND', logo: '🏖️' },
        'MANA': { name: 'Decentraland', symbol: 'MANA', logo: '🏝️' },
        'CRO': { name: 'Cronos', symbol: 'CRO', logo: '💳' },
        'SHIB': { name: 'Shiba Inu', symbol: 'SHIB', logo: '🐶' },
        'APE': { name: 'ApeCoin', symbol: 'APE', logo: '🐵' },
        'LRC': { name: 'Loopring', symbol: 'LRC', logo: '🔄' },
        'CRV': { name: 'Curve DAO Token', symbol: 'CRV', logo: '📈' }
    },
    
    // Search helpers
    searchSymbols: (query) => {
        const results = [];
        const searchTerm = query.toLowerCase();
        
        // Search stocks
        for (const [symbol, data] of Object.entries(SYMBOLS.STOCKS)) {
            if (symbol.toLowerCase().includes(searchTerm) || 
                data.name.toLowerCase().includes(searchTerm)) {
                results.push({
                    symbol,
                    name: data.name,
                    type: 'stock',
                    exchange: data.exchange,
                    sector: data.sector,
                    logo: data.logo
                });
            }
        }
        
        // Search crypto
        for (const [symbol, data] of Object.entries(SYMBOLS.CRYPTO)) {
            if (symbol.toLowerCase().includes(searchTerm) || 
                data.name.toLowerCase().includes(searchTerm)) {
                results.push({
                    symbol,
                    name: data.name,
                    type: 'crypto',
                    logo: data.logo
                });
            }
        }
        
        return results.slice(0, 20); // Limit results
    },
    
    // Get symbol info
    getSymbolInfo: (symbol, type = 'auto') => {
        const upperSymbol = symbol.toUpperCase();
        
        if (type === 'stock' || type === 'auto') {
            if (SYMBOLS.STOCKS[upperSymbol]) {
                return {
                    ...SYMBOLS.STOCKS[upperSymbol],
                    symbol: upperSymbol,
                    type: 'stock'
                };
            }
        }
        
        if (type === 'crypto' || type === 'auto') {
            if (SYMBOLS.CRYPTO[upperSymbol]) {
                return {
                    ...SYMBOLS.CRYPTO[upperSymbol],
                    symbol: upperSymbol,
                    type: 'crypto'
                };
            }
        }
        
        return null;
    },
    
    // Get popular symbols
    getPopularSymbols: (type = 'all', limit = 10) => {
        const popular = {
            stocks: ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'JPM', 'JNJ', 'V'],
            crypto: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'XRP', 'DOT', 'DOGE', 'AVAX', 'LINK']
        };
        
        if (type === 'stocks') return popular.stocks.slice(0, limit);
        if (type === 'crypto') return popular.crypto.slice(0, limit);
        
        return [...popular.stocks.slice(0, limit/2), ...popular.crypto.slice(0, limit/2)];
    }
};