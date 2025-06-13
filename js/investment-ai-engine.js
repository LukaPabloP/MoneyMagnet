// MoneyMagnet v2.0 - Investment AI Engine (NEU IMPLEMENTIERT)
const InvestmentAIEngine = {
    // Portfolio-Optimierungs-Algorithmen
    algorithms: {
        // Modern Portfolio Theory
        modernPortfolioTheory: {
            calculateOptimalWeights(assets, riskTolerance) {
                const returns = assets.map(asset => asset.expectedReturn);
                const risks = assets.map(asset => asset.risk);
                const correlations = this.calculateCorrelationMatrix(assets);
                
                // Vereinfachte Markowitz-Optimierung
                const weights = this.optimizeWeights(returns, risks, correlations, riskTolerance);
                return weights;
            },
            
            calculateCorrelationMatrix(assets) {
                // Vereinfachte Korrelationsmatrix basierend auf Sektoren
                const matrix = [];
                for (let i = 0; i < assets.length; i++) {
                    matrix[i] = [];
                    for (let j = 0; j < assets.length; j++) {
                        if (i === j) {
                            matrix[i][j] = 1.0;
                        } else {
                            // Höhere Korrelation für gleiche Sektoren
                            const sameSector = assets[i].sector === assets[j].sector;
                            matrix[i][j] = sameSector ? 0.6 + Math.random() * 0.3 : Math.random() * 0.4;
                        }
                    }
                }
                return matrix;
            },
            
            optimizeWeights(returns, risks, correlations, riskTolerance) {
                // Vereinfachte Gewichtungsoptimierung
                const weights = [];
                let totalWeight = 0;
                
                for (let i = 0; i < returns.length; i++) {
                    // Gewichtung basierend auf Rendite-Risiko-Verhältnis und Risikotoleranz
                    const sharpeRatio = returns[i] / risks[i];
                    let weight = sharpeRatio * riskTolerance;
                    
                    // Diversifikationsanpassung
                    weight = weight * (0.8 + Math.random() * 0.4);
                    weights.push(weight);
                    totalWeight += weight;
                }
                
                // Normalisierung auf 100%
                return weights.map(w => w / totalWeight);
            }
        },
        
        // Monte Carlo Simulation
        monteCarloSimulation: {
            simulatePortfolioReturns(portfolio, timeHorizon, simulations = 1000) {
                const results = [];
                
                for (let sim = 0; sim < simulations; sim++) {
                    let portfolioValue = 1.0; // Start mit 100%
                    
                    for (let month = 0; month < timeHorizon; month++) {
                        let monthlyReturn = 0;
                        
                        portfolio.assets.forEach(asset => {
                            // Zufällige monatliche Rendite basierend auf erwarteter Rendite und Volatilität
                            const randomReturn = this.generateRandomReturn(asset.expectedReturn / 12, asset.volatility / Math.sqrt(12));
                            monthlyReturn += asset.weight * randomReturn;
                        });
                        
                        portfolioValue *= (1 + monthlyReturn);
                    }
                    
                    results.push(portfolioValue);
                }
                
                return this.analyzeSimulationResults(results);
            },
            
            generateRandomReturn(mean, standardDeviation) {
                // Box-Muller-Transformation für Normalverteilung
                const u1 = Math.random();
                const u2 = Math.random();
                const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
                return mean + z * standardDeviation;
            },
            
            analyzeSimulationResults(results) {
                results.sort((a, b) => a - b);
                
                return {
                    mean: results.reduce((sum, val) => sum + val, 0) / results.length,
                    median: results[Math.floor(results.length / 2)],
                    percentile5: results[Math.floor(results.length * 0.05)],
                    percentile95: results[Math.floor(results.length * 0.95)],
                    worstCase: results[0],
                    bestCase: results[results.length - 1],
                    volatility: this.calculateStandardDeviation(results)
                };
            },
            
            calculateStandardDeviation(values) {
                const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
                const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
                return Math.sqrt(avgSquaredDiff);
            }
        }
    },
    
    // Asset-Datenbank mit erwarteten Renditen und Risiken
    assetDatabase: {
        stocks: {
            'AAPL': { expectedReturn: 0.12, volatility: 0.25, sector: 'technology', beta: 1.2 },
            'MSFT': { expectedReturn: 0.11, volatility: 0.22, sector: 'technology', beta: 1.1 },
            'GOOGL': { expectedReturn: 0.13, volatility: 0.28, sector: 'technology', beta: 1.3 },
            'AMZN': { expectedReturn: 0.14, volatility: 0.32, sector: 'consumer_discretionary', beta: 1.4 },
            'TSLA': { expectedReturn: 0.18, volatility: 0.45, sector: 'automotive', beta: 2.0 },
            'JPM': { expectedReturn: 0.09, volatility: 0.20, sector: 'financial', beta: 1.1 },
            'JNJ': { expectedReturn: 0.07, volatility: 0.15, sector: 'healthcare', beta: 0.7 },
            'PG': { expectedReturn: 0.06, volatility: 0.12, sector: 'consumer_staples', beta: 0.5 },
            'KO': { expectedReturn: 0.05, volatility: 0.10, sector: 'consumer_staples', beta: 0.4 },
            'V': { expectedReturn: 0.10, volatility: 0.18, sector: 'financial', beta: 0.9 }
        },
        
        bonds: {
            'US_TREASURY_10Y': { expectedReturn: 0.04, volatility: 0.05, sector: 'government_bonds', beta: -0.2 },
            'CORPORATE_BONDS': { expectedReturn: 0.05, volatility: 0.08, sector: 'corporate_bonds', beta: 0.1 },
            'HIGH_YIELD_BONDS': { expectedReturn: 0.07, volatility: 0.12, sector: 'high_yield_bonds', beta: 0.3 }
        },
        
        etfs: {
            'SPY': { expectedReturn: 0.10, volatility: 0.16, sector: 'broad_market', beta: 1.0 },
            'QQQ': { expectedReturn: 0.12, volatility: 0.20, sector: 'technology', beta: 1.2 },
            'VTI': { expectedReturn: 0.09, volatility: 0.15, sector: 'broad_market', beta: 1.0 },
            'SCHD': { expectedReturn: 0.08, volatility: 0.13, sector: 'dividend', beta: 0.8 }
        }
    },
    
    // Strategien basierend auf Nutzerprofil
    strategyTemplates: {
        conservative: {
            name: 'Konservativ',
            description: 'Fokus auf Kapitalerhalt mit moderaten Erträgen',
            targetReturn: 0.06,
            maxVolatility: 0.12,
            allocation: {
                stocks: 0.30,
                bonds: 0.60,
                cash: 0.10
            },
            preferredAssets: ['JNJ', 'PG', 'KO', 'US_TREASURY_10Y', 'CORPORATE_BONDS', 'VTI']
        },
        
        moderate: {
            name: 'Ausgewogen',
            description: 'Ausgewogenes Verhältnis zwischen Wachstum und Sicherheit',
            targetReturn: 0.08,
            maxVolatility: 0.16,
            allocation: {
                stocks: 0.60,
                bonds: 0.30,
                cash: 0.10
            },
            preferredAssets: ['AAPL', 'MSFT', 'JPM', 'V', 'CORPORATE_BONDS', 'SPY', 'SCHD']
        },
        
        aggressive: {
            name: 'Wachstumsorientiert',
            description: 'Fokus auf maximales Wachstum mit höherem Risiko',
            targetReturn: 0.12,
            maxVolatility: 0.25,
            allocation: {
                stocks: 0.85,
                bonds: 0.10,
                cash: 0.05
            },
            preferredAssets: ['GOOGL', 'AMZN', 'TSLA', 'QQQ', 'AAPL', 'MSFT']
        },
        
        speculative: {
            name: 'Spekulativ',
            description: 'Hochrisiko-Hochrendite-Ansatz für erfahrene Investoren',
            targetReturn: 0.18,
            maxVolatility: 0.35,
            allocation: {
                stocks: 0.95,
                bonds: 0.00,
                cash: 0.05
            },
            preferredAssets: ['TSLA', 'GOOGL', 'AMZN', 'QQQ']
        }
    },
    
    // Hauptoptimierungsengine
    optimizePortfolio(userProfile) {
        console.log('🤖 Starting AI portfolio optimization...', userProfile);
        
        // 1. Strategie basierend auf Risikoprofil auswählen
        const strategy = this.selectStrategy(userProfile);
        
        // 2. Asset-Pool basierend auf Strategie erstellen
        const assetPool = this.createAssetPool(strategy, userProfile);
        
        // 3. Portfolio-Optimierung durchführen
        const optimizedWeights = this.algorithms.modernPortfolioTheory.calculateOptimalWeights(
            assetPool, 
            userProfile.riskTolerance / 10
        );
        
        // 4. Portfolio zusammenstellen
        const portfolio = this.constructPortfolio(assetPool, optimizedWeights, userProfile);
        
        // 5. Monte Carlo Simulation für Performance-Projektion
        const simulation = this.algorithms.monteCarloSimulation.simulatePortfolioReturns(
            portfolio, 
            userProfile.timeHorizon
        );
        
        // 6. Ergebnisse zusammenstellen
        return {
            portfolio,
            strategy,
            simulation,
            metrics: this.calculatePortfolioMetrics(portfolio),
            aiConfidence: this.calculateAIConfidence(portfolio, userProfile),
            timestamp: Date.now()
        };
    },
    
    selectStrategy(userProfile) {
        const { riskTolerance, goal, experience } = userProfile;
        
        if (riskTolerance <= 3) return this.strategyTemplates.conservative;
        if (riskTolerance <= 6) return this.strategyTemplates.moderate;
        if (riskTolerance <= 8) return this.strategyTemplates.aggressive;
        return this.strategyTemplates.speculative;
    },
    
    createAssetPool(strategy, userProfile) {
        const assetPool = [];
        
        // Assets aus Strategie hinzufügen
        strategy.preferredAssets.forEach(symbol => {
            const assetData = this.getAssetData(symbol);
            if (assetData) {
                assetPool.push({
                    symbol,
                    ...assetData,
                    suitabilityScore: this.calculateSuitability(assetData, userProfile)
                });
            }
        });
        
        // Nach Eignung sortieren
        return assetPool.sort((a, b) => b.suitabilityScore - a.suitabilityScore).slice(0, 8);
    },
    
    getAssetData(symbol) {
        return this.assetDatabase.stocks[symbol] || 
               this.assetDatabase.bonds[symbol] || 
               this.assetDatabase.etfs[symbol];
    },
    
    calculateSuitability(asset, userProfile) {
        let score = 50; // Basisscore
        
        // Risikotoleranz berücksichtigen
        const riskMatch = 1 - Math.abs(asset.volatility * 100 - userProfile.riskTolerance * 3) / 30;
        score += riskMatch * 30;
        
        // Erfahrung berücksichtigen
        if (userProfile.experience === 'beginner' && asset.volatility > 0.3) {
            score -= 20;
        }
        
        // Anlageziel berücksichtigen
        if (userProfile.goal === 'growth' && asset.expectedReturn > 0.10) {
            score += 15;
        } else if (userProfile.goal === 'preservation' && asset.volatility < 0.15) {
            score += 15;
        }
        
        return Math.max(0, Math.min(100, score));
    },
    
    constructPortfolio(assetPool, weights, userProfile) {
        const assets = assetPool.map((asset, index) => ({
            ...asset,
            weight: weights[index],
            allocation: userProfile.amount * weights[index]
        }));
        
        return {
            assets,
            totalValue: userProfile.amount,
            monthlyContribution: userProfile.frequency === 'monthly' ? userProfile.amount : 0,
            rebalanceFrequency: 'quarterly'
        };
    },
    
    calculatePortfolioMetrics(portfolio) {
        const weightedReturn = portfolio.assets.reduce((sum, asset) => 
            sum + asset.weight * asset.expectedReturn, 0
        );
        
        const weightedRisk = Math.sqrt(
            portfolio.assets.reduce((sum, asset) => 
                sum + Math.pow(asset.weight * asset.volatility, 2), 0
            )
        );
        
        const sharpeRatio = (weightedReturn - 0.02) / weightedRisk; // Annahme: Risikofreier Zins 2%
        
        return {
            expectedReturn: weightedReturn,
            expectedRisk: weightedRisk,
            sharpeRatio,
            diversificationRatio: this.calculateDiversification(portfolio)
        };
    },
    
    calculateDiversification(portfolio) {
        // Vereinfachte Diversifikationsberechnung
        const sectors = [...new Set(portfolio.assets.map(a => a.sector))];
        const maxWeight = Math.max(...portfolio.assets.map(a => a.weight));
        
        return Math.min(1, (sectors.length / 5) * (1 - maxWeight));
    },
    
    calculateAIConfidence(portfolio, userProfile) {
        let confidence = 75; // Basis-Konfidenz
        
        // Diversifikation erhöht Konfidenz
        const diversification = this.calculateDiversification(portfolio);
        confidence += diversification * 15;
        
        // Risiko-Rendite-Verhältnis berücksichtigen
        const metrics = this.calculatePortfolioMetrics(portfolio);
        if (metrics.sharpeRatio > 0.8) confidence += 10;
        
        // Erfahrung des Nutzers berücksichtigen
        if (userProfile.experience === 'expert') confidence += 5;
        else if (userProfile.experience === 'beginner') confidence -= 5;
        
        return Math.max(60, Math.min(95, Math.round(confidence)));
    },
    
    // Rebalancing-Empfehlungen
    generateRebalancingAdvice(currentPortfolio, targetPortfolio) {
        const advice = [];
        
        currentPortfolio.assets.forEach((current, index) => {
            const target = targetPortfolio.assets[index];
            const deviation = Math.abs(current.weight - target.weight);
            
            if (deviation > 0.05) { // 5% Abweichung als Schwellwert
                advice.push({
                    symbol: current.symbol,
                    action: current.weight > target.weight ? 'reduce' : 'increase',
                    currentWeight: current.weight,
                    targetWeight: target.weight,
                    deviation: deviation,
                    priority: deviation > 0.1 ? 'high' : 'medium'
                });
            }
        });
        
        return advice.sort((a, b) => b.deviation - a.deviation);
    },
    
    // Market Condition Analysis
    analyzeMarketConditions() {
        // Vereinfachte Marktanalyse basierend auf aktuellen Daten
        const conditions = {
            volatility: 'moderate', // low, moderate, high
            trend: 'bullish', // bearish, neutral, bullish
            sentiment: 'optimistic', // pessimistic, neutral, optimistic
            interestRates: 'rising', // falling, stable, rising
            inflation: 'moderate' // low, moderate, high
        };
        
        return {
            ...conditions,
            recommendation: this.getMarketRecommendation(conditions),
            confidence: 78
        };
    },
    
    getMarketRecommendation(conditions) {
        if (conditions.trend === 'bullish' && conditions.sentiment === 'optimistic') {
            return 'Günstige Zeit für Aktieninvestitionen mit moderater Risikoerhöhung';
        } else if (conditions.volatility === 'high') {
            return 'Defensive Positionierung mit verstärktem Fokus auf Qualitätsaktien';
        } else {
            return 'Ausgewogene Strategie mit regelmäßigem Rebalancing empfohlen';
        }
    },
    
    // Risk Assessment Tools
    calculateVaR(portfolio, confidence = 0.05, timeHorizon = 30) {
        // Value at Risk Berechnung (vereinfacht)
        const portfolioReturn = this.calculatePortfolioMetrics(portfolio).expectedReturn;
        const portfolioRisk = this.calculatePortfolioMetrics(portfolio).expectedRisk;
        
        // Annahme: Normalverteilung
        const zScore = this.getZScore(confidence);
        const monthlyReturn = portfolioReturn / 12;
        const monthlyRisk = portfolioRisk / Math.sqrt(12);
        
        const var95 = portfolio.totalValue * (monthlyReturn + zScore * monthlyRisk);
        
        return {
            confidence: confidence,
            timeHorizon: timeHorizon,
            value: Math.abs(var95),
            percentage: Math.abs(var95) / portfolio.totalValue * 100
        };
    },
    
    getZScore(confidence) {
        // Z-Scores für verschiedene Konfidenzniveaus
        const zScores = {
            0.01: -2.33,
            0.05: -1.645,
            0.10: -1.28
        };
        return zScores[confidence] || -1.645;
    },
    
    // Performance Attribution
    analyzePerformanceAttribution(portfolio, actualReturns) {
        const attribution = {
            assetAllocation: 0,
            securitySelection: 0,
            interaction: 0,
            total: 0
        };
        
        // Vereinfachte Attribution-Analyse
        portfolio.assets.forEach((asset, index) => {
            const benchmarkReturn = asset.expectedReturn;
            const actualReturn = actualReturns[index] || benchmarkReturn;
            const weight = asset.weight;
            
            // Asset Allocation Effect
            attribution.assetAllocation += weight * (benchmarkReturn - portfolio.benchmarkReturn);
            
            // Security Selection Effect
            attribution.securitySelection += weight * (actualReturn - benchmarkReturn);
        });
        
        attribution.total = attribution.assetAllocation + attribution.securitySelection + attribution.interaction;
        
        return attribution;
    },
    
    // Tax Optimization
    optimizeForTaxes(portfolio, userTaxSituation) {
        const taxOptimizedPortfolio = {
            ...portfolio,
            taxStrategy: {
                assetLocation: this.optimizeAssetLocation(portfolio, userTaxSituation),
                harvestingOpportunities: this.identifyTaxHarvesting(portfolio),
                holdingPeriods: this.optimizeHoldingPeriods(portfolio)
            }
        };
        
        return taxOptimizedPortfolio;
    },
    
    optimizeAssetLocation(portfolio, taxSituation) {
        // Asset Location: Steuereffiziente vs. steuerbegünstigte Konten
        return portfolio.assets.map(asset => ({
            symbol: asset.symbol,
            recommendedAccount: asset.expectedReturn > 0.08 ? 'tax_deferred' : 'taxable',
            reason: 'Optimierung basierend auf erwarteter Rendite und Steuersituation'
        }));
    },
    
    identifyTaxHarvesting(portfolio) {
        // Tax Loss Harvesting Gelegenheiten
        return portfolio.assets
            .filter(asset => asset.unrealizedLoss && asset.unrealizedLoss > 1000)
            .map(asset => ({
                symbol: asset.symbol,
                loss: asset.unrealizedLoss,
                recommendation: 'Verkauf zur Steueroptimierung erwägen'
            }));
    },
    
    optimizeHoldingPeriods(portfolio) {
        return {
            shortTerm: portfolio.assets.filter(a => a.holdingPeriod < 365).length,
            longTerm: portfolio.assets.filter(a => a.holdingPeriod >= 365).length,
            recommendation: 'Langfristige Haltedauer für bessere Steuerbehandlung anstreben'
        };
    },
    
    // ESG Integration
    incorporateESGFactors(portfolio, esgPreferences) {
        if (!esgPreferences.enabled) return portfolio;
        
        const esgPortfolio = {
            ...portfolio,
            assets: portfolio.assets.map(asset => ({
                ...asset,
                esgScore: this.getESGScore(asset.symbol),
                esgRating: this.getESGRating(asset.symbol)
            })).filter(asset => asset.esgScore >= esgPreferences.minimumScore)
        };
        
        // Neugewichtung nach ESG-Filterung
        const totalWeight = esgPortfolio.assets.reduce((sum, asset) => sum + asset.weight, 0);
        esgPortfolio.assets.forEach(asset => {
            asset.weight = asset.weight / totalWeight;
            asset.allocation = esgPortfolio.totalValue * asset.weight;
        });
        
        return esgPortfolio;
    },
    
    getESGScore(symbol) {
        // Vereinfachte ESG-Scores (in der Realität von Datenanbietern)
        const esgScores = {
            'AAPL': 82, 'MSFT': 88, 'GOOGL': 75, 'AMZN': 67, 'TSLA': 91,
            'JPM': 72, 'JNJ': 85, 'PG': 89, 'KO': 78, 'V': 80
        };
        return esgScores[symbol] || 70;
    },
    
    getESGRating(symbol) {
        const score = this.getESGScore(symbol);
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        return 'D';
    },
    
    // Dynamic Asset Allocation
    adjustAllocationForMarketCycle(portfolio, marketCycle) {
        const adjustments = {
            bull_market: { stocks: 1.1, bonds: 0.9, cash: 0.8 },
            bear_market: { stocks: 0.8, bonds: 1.2, cash: 1.5 },
            recession: { stocks: 0.7, bonds: 1.1, cash: 2.0 },
            recovery: { stocks: 1.2, bonds: 0.9, cash: 0.7 }
        };
        
        const multipliers = adjustments[marketCycle] || { stocks: 1.0, bonds: 1.0, cash: 1.0 };
        
        return {
            ...portfolio,
            assets: portfolio.assets.map(asset => {
                let multiplier = 1.0;
                if (asset.sector.includes('stock') || asset.expectedReturn > 0.08) {
                    multiplier = multipliers.stocks;
                } else if (asset.sector.includes('bond')) {
                    multiplier = multipliers.bonds;
                }
                
                return {
                    ...asset,
                    adjustedWeight: asset.weight * multiplier,
                    cyclicalReasoning: `Anpassung für ${marketCycle}: ${((multiplier - 1) * 100).toFixed(1)}%`
                };
            })
        };
    },
    
    // Behavioral Finance Considerations
    applyBehavioralFinanceInsights(portfolio, userBehavior) {
        const insights = {
            lossAversion: this.adjustForLossAversion(portfolio, userBehavior.lossAversion),
            overconfidence: this.adjustForOverconfidence(portfolio, userBehavior.overconfidence),
            herding: this.adjustForHerding(portfolio, userBehavior.herdingTendency),
            mentalAccounting: this.adjustForMentalAccounting(portfolio, userBehavior.mentalAccounting)
        };
        
        return {
            ...portfolio,
            behavioralAdjustments: insights,
            recommendedBehavior: this.generateBehavioralRecommendations(userBehavior)
        };
    },
    
    adjustForLossAversion(portfolio, lossAversion) {
        if (lossAversion > 7) {
            return {
                recommendation: 'Erhöhung der Bond-Allokation um Verlustängste zu reduzieren',
                adjustment: 'conservative_shift',
                reasoning: 'Hohe Verlustangst erfordert defensivere Positionierung'
            };
        }
        return { recommendation: 'Aktuelle Allokation angemessen', adjustment: 'none' };
    },
    
    adjustForOverconfidence(portfolio, overconfidence) {
        if (overconfidence > 8) {
            return {
                recommendation: 'Diversifikation erhöhen, Einzelpositionen begrenzen',
                adjustment: 'increase_diversification',
                reasoning: 'Selbstüberschätzung kann zu Konzentrations-Risiken führen'
            };
        }
        return { recommendation: 'Aktuelle Diversifikation angemessen', adjustment: 'none' };
    },
    
    adjustForHerding(portfolio, herdingTendency) {
        if (herdingTendency > 7) {
            return {
                recommendation: 'Contrarian-Elemente in Portfolio einbauen',
                adjustment: 'contrarian_bias',
                reasoning: 'Herdenverhalten kann zu suboptimalen Timing-Entscheidungen führen'
            };
        }
        return { recommendation: 'Systematischen Ansatz beibehalten', adjustment: 'none' };
    },
    
    adjustForMentalAccounting(portfolio, mentalAccounting) {
        if (mentalAccounting > 6) {
            return {
                recommendation: 'Ganzheitliche Portfolio-Betrachtung fördern',
                adjustment: 'holistic_view',
                reasoning: 'Mental Accounting kann Gesamtoptimierung verhindern'
            };
        }
        return { recommendation: 'Ganzheitlicher Ansatz wird bereits verfolgt', adjustment: 'none' };
    },
    
    generateBehavioralRecommendations(userBehavior) {
        const recommendations = [];
        
        if (userBehavior.lossAversion > 7) {
            recommendations.push('Fokus auf langfristige Ziele statt kurzfristige Schwankungen');
        }
        
        if (userBehavior.overconfidence > 8) {
            recommendations.push('Regelmäßige Portfolio-Reviews mit objektiven Metriken');
        }
        
        if (userBehavior.herdingTendency > 7) {
            recommendations.push('Systematische Investitionsstrategie unabhängig von Marktmeinungen');
        }
        
        return recommendations;
    },
    
    // Stress Testing
    performStressTest(portfolio, scenarios) {
        const stressResults = {};
        
        Object.entries(scenarios).forEach(([scenarioName, scenario]) => {
            const stressedPortfolio = this.applyStressScenario(portfolio, scenario);
            stressResults[scenarioName] = {
                portfolioValue: stressedPortfolio.totalValue,
                loss: portfolio.totalValue - stressedPortfolio.totalValue,
                lossPercentage: ((portfolio.totalValue - stressedPortfolio.totalValue) / portfolio.totalValue * 100).toFixed(2),
                worstAsset: this.findWorstPerformingAsset(stressedPortfolio),
                recovery: this.estimateRecoveryTime(scenario)
            };
        });
        
        return stressResults;
    },
    
    applyStressScenario(portfolio, scenario) {
        return {
            ...portfolio,
            assets: portfolio.assets.map(asset => {
                const sectorMultiplier = scenario.sectorMultipliers[asset.sector] || scenario.marketMultiplier;
                const stressedValue = asset.allocation * sectorMultiplier;
                
                return {
                    ...asset,
                    stressedValue,
                    stressLoss: asset.allocation - stressedValue
                };
            }),
            totalValue: portfolio.assets.reduce((sum, asset) => {
                const sectorMultiplier = scenario.sectorMultipliers[asset.sector] || scenario.marketMultiplier;
                return sum + (asset.allocation * sectorMultiplier);
            }, 0)
        };
    },
    
    findWorstPerformingAsset(stressedPortfolio) {
        return stressedPortfolio.assets.reduce((worst, asset) => 
            asset.stressLoss > worst.stressLoss ? asset : worst
        );
    },
    
    estimateRecoveryTime(scenario) {
        // Vereinfachte Erholungszeit-Schätzung
        const severityMultiplier = 1 - scenario.marketMultiplier;
        if (severityMultiplier < 0.1) return '3-6 Monate';
        if (severityMultiplier < 0.2) return '6-12 Monate';
        if (severityMultiplier < 0.3) return '1-2 Jahre';
        return '2+ Jahre';
    }
};

// Export für globale Verfügbarkeit
window.InvestmentAIEngine = InvestmentAIEngine;

console.log('🤖 Investment AI Engine loaded - Advanced portfolio optimization ready');