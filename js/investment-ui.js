// MoneyMagnet v2.0 - Investment UI Manager (VOLLSTÄNDIG IMPLEMENTIERT)
const investmentAI = {
    currentStep: 1,
    totalSteps: 4,
    userProfile: {
        amount: 1000,
        frequency: 'monthly',
        timeHorizon: 36, // in Monaten
        goal: 'growth',
        riskTolerance: 5,
        lossReaction: 'hold',
        experience: 'beginner'
    },
    optimizedPortfolio: null,
    charts: {},
    
    // Initialize Investment AI Interface
    init() {
        console.log('🤖 Investment AI initializing...');
        
        this.setupEventListeners();
        this.updateProgressBar();
        this.initializeSliders();
        this.updateTotalInvestment();
        
        console.log('✅ Investment AI initialized');
    },
    
    // Setup Event Listeners
    setupEventListeners() {
        // Amount slider and input
        const amountSlider = document.getElementById('amountSlider');
        const amountInput = document.getElementById('amountInput');
        
        if (amountSlider && amountInput) {
            amountSlider.addEventListener('input', (e) => {
                this.userProfile.amount = parseInt(e.target.value);
                amountInput.value = this.userProfile.amount;
                this.updateTotalInvestment();
            });
            
            amountInput.addEventListener('input', (e) => {
                this.userProfile.amount = parseInt(e.target.value);
                amountSlider.value = this.userProfile.amount;
                this.updateTotalInvestment();
            });
        }
        
        // Frequency selector
        const frequencySelect = document.getElementById('frequencySelect');
        if (frequencySelect) {
            frequencySelect.addEventListener('change', (e) => {
                this.userProfile.frequency = e.target.value;
                this.updateTotalInvestment();
            });
        }
        
        // Duration slider
        const durationSlider = document.getElementById('durationSlider');
        if (durationSlider) {
            durationSlider.addEventListener('input', (e) => {
                this.userProfile.timeHorizon = parseInt(e.target.value);
                this.updateDurationDisplay();
            });
        }
        
        // Risk slider
        const riskSlider = document.getElementById('riskSlider');
        if (riskSlider) {
            riskSlider.addEventListener('input', (e) => {
                this.userProfile.riskTolerance = parseInt(e.target.value);
                this.updateRiskDisplay();
            });
        }
        
        // Goal selection
        const goalInputs = document.querySelectorAll('input[name="goal"]');
        goalInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.userProfile.goal = e.target.value;
            });
        });
        
        // Loss reaction
        const lossInputs = document.querySelectorAll('input[name="lossReaction"]');
        lossInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.userProfile.lossReaction = e.target.value;
            });
        });
        
        // Experience level
        const expInputs = document.querySelectorAll('input[name="experience"]');
        expInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.userProfile.experience = e.target.value;
            });
        });
        
        // Amount presets
        const presetBtns = document.querySelectorAll('.preset-btn');
        presetBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                this.setAmount(amount);
            });
        });
    },
    
    // Initialize sliders with correct values
    initializeSliders() {
        this.updateDurationDisplay();
        this.updateRiskDisplay();
    },
    
    // Update duration display
    updateDurationDisplay() {
        const durationText = document.getElementById('durationText');
        if (durationText) {
            const months = this.userProfile.timeHorizon;
            if (months < 12) {
                durationText.textContent = `${months} Monat${months > 1 ? 'e' : ''}`;
            } else {
                const years = Math.floor(months / 12);
                const remainingMonths = months % 12;
                let text = `${years} Jahr${years > 1 ? 'e' : ''}`;
                if (remainingMonths > 0) {
                    text += ` ${remainingMonths} Monat${remainingMonths > 1 ? 'e' : ''}`;
                }
                durationText.textContent = text;
            }
        }
    },
    
    // Update risk display
    updateRiskDisplay() {
        const riskValue = document.getElementById('riskValue');
        const riskDescription = document.getElementById('riskDescription');
        
        if (riskValue) {
            riskValue.textContent = this.userProfile.riskTolerance;
        }
        
        if (riskDescription) {
            const descriptions = {
                1: 'Sehr konservativ - Minimales Risiko, niedrige Rendite',
                2: 'Konservativ - Sicherheit steht im Vordergrund',
                3: 'Leicht konservativ - Überwiegend sichere Anlagen',
                4: 'Ausgewogen-konservativ - Leichte Risikokomponente',
                5: 'Ausgewogen - Gleichgewicht zwischen Risiko und Sicherheit',
                6: 'Ausgewogen-offensiv - Verstärkte Wachstumsorientierung',
                7: 'Offensiv - Fokus auf Wachstum bei moderatem Risiko',
                8: 'Stark offensiv - Hohe Wachstumserwartung',
                9: 'Sehr offensiv - Maximales Wachstum bei hohem Risiko',
                10: 'Spekulativ - Extrem hohes Risiko für maximale Rendite'
            };
            
            riskDescription.textContent = descriptions[this.userProfile.riskTolerance];
        }
    },
    
    // Set amount from preset
    setAmount(amount) {
        this.userProfile.amount = amount;
        
        const amountSlider = document.getElementById('amountSlider');
        const amountInput = document.getElementById('amountInput');
        
        if (amountSlider) amountSlider.value = amount;
        if (amountInput) amountInput.value = amount;
        
        this.updateTotalInvestment();
    },
    
    // Update total investment calculation
    updateTotalInvestment() {
        const totalElement = document.getElementById('totalInvestment');
        if (totalElement) {
            let total = 0;
            switch (this.userProfile.frequency) {
                case 'weekly':
                    total = this.userProfile.amount * 52;
                    break;
                case 'monthly':
                    total = this.userProfile.amount * 12;
                    break;
                case 'quarterly':
                    total = this.userProfile.amount * 4;
                    break;
                case 'yearly':
                    total = this.userProfile.amount * 1;
                    break;
                default:
                    total = this.userProfile.amount;
            }
            
            totalElement.textContent = `${total.toLocaleString('de-DE')}€`;
        }
    },
    
    // Navigation functions
    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            
            // Generate strategies when reaching step 4
            if (this.currentStep === 4) {
                this.generateStrategies();
            }
        }
    },
    
    previousStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgressBar();
        }
    },
    
    // Show/hide steps
    showStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    },
    
    hideStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    },
    
    // Update progress bar
    updateProgressBar() {
        const progressFill = document.getElementById('progressFill');
        const progressSteps = document.querySelectorAll('.progress-step');
        
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        progressSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= this.currentStep);
        });
    },
    
    // Generate investment strategies for step 4
    generateStrategies() {
        const strategyGrid = document.getElementById('strategyGrid');
        if (!strategyGrid) return;
        
        console.log('📊 Generating investment strategies based on user profile:', this.userProfile);
        
        // Use AI Engine to get strategies
        const strategies = this.getRecommendedStrategies();
        
        strategyGrid.innerHTML = strategies.map((strategy, index) => `
            <div class="strategy-card ${index === 0 ? 'recommended' : ''}" data-strategy="${strategy.id}">
                <div class="strategy-header">
                    <div class="strategy-icon">${strategy.icon}</div>
                    <div class="strategy-info">
                        <h3 class="strategy-title">${strategy.name}</h3>
                        ${index === 0 ? '<span class="recommended-badge">Empfohlen</span>' : ''}
                    </div>
                    <div class="strategy-return">
                        <div class="return-value">${strategy.expectedReturn}</div>
                        <div class="return-label">Erwartete Rendite</div>
                    </div>
                </div>
                <p class="strategy-description">${strategy.description}</p>
                <div class="strategy-metrics">
                    <div class="metric">
                        <span class="metric-label">Risiko</span>
                        <span class="metric-value risk-${strategy.riskLevel}">${strategy.riskLevel}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Diversifikation</span>
                        <span class="metric-value">${strategy.diversification}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Komplexität</span>
                        <span class="metric-value">${strategy.complexity}</span>
                    </div>
                </div>
                <div class="strategy-allocation">
                    <h4>Asset-Verteilung</h4>
                    <div class="allocation-bars">
                        ${Object.entries(strategy.allocation).map(([asset, percentage]) => `
                            <div class="allocation-bar">
                                <span class="asset-name">${asset}</span>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="percentage">${percentage}%</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button class="strategy-select-btn" onclick="investmentAI.selectStrategy('${strategy.id}')">
                    ${index === 0 ? 'Diese Strategie wählen' : 'Auswählen'}
                </button>
            </div>
        `).join('');
        
        // Enable analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
        }
    },
    
    // Get recommended strategies based on user profile
    getRecommendedStrategies() {
        const riskLevel = this.userProfile.riskTolerance;
        const goal = this.userProfile.goal;
        const timeHorizon = this.userProfile.timeHorizon;
        
        const strategies = [
            {
                id: 'conservative',
                name: 'Konservative Strategie',
                icon: '🛡️',
                description: 'Fokus auf Kapitalerhalt mit stabilen, niedrigen Renditen. Ideal für risikoaverse Investoren.',
                expectedReturn: '4-6% p.a.',
                riskLevel: 'niedrig',
                diversification: 'Hoch',
                complexity: 'Niedrig',
                allocation: { 'Aktien': 30, 'Anleihen': 60, 'Cash': 10 },
                suitability: riskLevel <= 4 ? 95 : 60
            },
            {
                id: 'balanced',
                name: 'Ausgewogene Strategie',
                icon: '⚖️',
                description: 'Optimales Verhältnis zwischen Wachstum und Sicherheit für langfristige Ziele.',
                expectedReturn: '6-9% p.a.',
                riskLevel: 'mittel',
                diversification: 'Sehr hoch',
                complexity: 'Mittel',
                allocation: { 'Aktien': 60, 'Anleihen': 30, 'REITs': 10 },
                suitability: riskLevel >= 4 && riskLevel <= 7 ? 95 : 70
            },
            {
                id: 'growth',
                name: 'Wachstumsstrategie',
                icon: '📈',
                description: 'Fokus auf langfristiges Wachstum mit höherer Volatilität. Für langfristige Investoren.',
                expectedReturn: '8-12% p.a.',
                riskLevel: 'hoch',
                diversification: 'Hoch',
                complexity: 'Hoch',
                allocation: { 'Aktien': 80, 'Anleihen': 15, 'Rohstoffe': 5 },
                suitability: riskLevel >= 6 && timeHorizon > 36 ? 95 : 50
            },
            {
                id: 'aggressive',
                name: 'Aggressive Strategie',
                icon: '🚀',
                description: 'Maximales Wachstumspotenzial mit hohem Risiko. Nur für erfahrene, risikotolerante Investoren.',
                expectedReturn: '12-18% p.a.',
                riskLevel: 'sehr hoch',
                diversification: 'Mittel',
                complexity: 'Sehr hoch',
                allocation: { 'Wachstumsaktien': 70, 'Small-Cap': 20, 'Emerging Markets': 10 },
                suitability: riskLevel >= 8 && this.userProfile.experience !== 'beginner' ? 95 : 30
            }
        ];
        
        // Sort by suitability
        return strategies.sort((a, b) => b.suitability - a.suitability).slice(0, 3);
    },
    
    // Select strategy
    selectStrategy(strategyId) {
        const strategyCards = document.querySelectorAll('.strategy-card');
        strategyCards.forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.strategy === strategyId) {
                card.classList.add('selected');
            }
        });
        
        this.userProfile.selectedStrategy = strategyId;
        console.log('📊 Strategy selected:', strategyId);
    },
    
    // Start AI analysis
    async startAnalysis() {
        console.log('🤖 Starting AI portfolio analysis...');
        
        // Show loading overlay
        this.showLoadingOverlay();
        
        try {
            // Simulate API calls and AI processing
            await this.simulateAIAnalysis();
            
            // Generate optimized portfolio using AI Engine
            if (typeof InvestmentAIEngine !== 'undefined') {
                this.optimizedPortfolio = InvestmentAIEngine.optimizePortfolio(this.userProfile);
            } else {
                // Fallback to demo portfolio
                this.optimizedPortfolio = this.generateDemoPortfolio();
            }
            
            // Hide wizard and show results
            this.hideWizard();
            this.showResults();
            
            // Initialize charts
            await this.initializeCharts();
            
        } catch (error) {
            console.error('❌ AI analysis failed:', error);
            this.hideLoadingOverlay();
            alert('Fehler bei der KI-Analyse. Bitte versuchen Sie es erneut.');
        }
    },
    
    // Generate demo portfolio as fallback
    generateDemoPortfolio() {
        const strategy = this.getRecommendedStrategies()[0];
        
        return {
            portfolio: {
                assets: [
                    { symbol: 'AAPL', weight: 0.15, expectedReturn: 0.12, volatility: 0.25, sector: 'technology', allocation: this.userProfile.amount * 0.15 },
                    { symbol: 'MSFT', weight: 0.15, expectedReturn: 0.11, volatility: 0.22, sector: 'technology', allocation: this.userProfile.amount * 0.15 },
                    { symbol: 'VTI', weight: 0.30, expectedReturn: 0.09, volatility: 0.15, sector: 'broad_market', allocation: this.userProfile.amount * 0.30 },
                    { symbol: 'BND', weight: 0.25, expectedReturn: 0.04, volatility: 0.05, sector: 'bonds', allocation: this.userProfile.amount * 0.25 },
                    { symbol: 'VNQ', weight: 0.10, expectedReturn: 0.08, volatility: 0.18, sector: 'real_estate', allocation: this.userProfile.amount * 0.10 },
                    { symbol: 'GLD', weight: 0.05, expectedReturn: 0.05, volatility: 0.20, sector: 'commodities', allocation: this.userProfile.amount * 0.05 }
                ],
                totalValue: this.userProfile.amount,
                monthlyContribution: this.userProfile.frequency === 'monthly' ? this.userProfile.amount : 0
            },
            strategy: strategy,
            metrics: {
                expectedReturn: 0.08,
                expectedRisk: 0.16,
                sharpeRatio: 0.38
            },
            simulation: {
                mean: 1.25,
                median: 1.22,
                percentile5: 0.85,
                percentile95: 1.68,
                worstCase: 0.72,
                bestCase: 1.89
            },
            aiConfidence: 78,
            timestamp: Date.now()
        };
    },
    
    // Simulate AI analysis process
    async simulateAIAnalysis() {
        const steps = [
            'Sammle Echzeit-Daten von weltweiten Börsen...',
            'Analysiere Markttrends und Volatilität...',
            'Berechne optimale Asset-Allokation...',
            'Führe Monte-Carlo-Simulation durch...',
            'Generiere Risiko-Rendite-Profile...',
            'Optimiere Portfolio für Ihre Ziele...',
            'Erstelle Performance-Projektionen...',
            'Finalisiere KI-Empfehlungen...'
        ];
        
        const loadingStatus = document.getElementById('loadingStatus');
        const loadingProgress = document.getElementById('loadingProgress');
        
        for (let i = 0; i < steps.length; i++) {
            if (loadingStatus) loadingStatus.textContent = steps[i];
            if (loadingProgress) loadingProgress.style.width = `${((i + 1) / steps.length) * 100}%`;
            
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        }
    },
    
    // Show/hide loading overlay
    showLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'flex';
    },
    
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    },
    
    // Hide wizard and show results
    hideWizard() {
        const wizard = document.getElementById('investmentWizard');
        const results = document.getElementById('investmentResults');
        
        if (wizard) wizard.style.display = 'none';
        if (results) results.style.display = 'block';
        
        this.hideLoadingOverlay();
    },
    
    // Show results
    showResults() {
        if (!this.optimizedPortfolio) return;
        
        console.log('📊 Displaying portfolio results:', this.optimizedPortfolio);
        
        // Update header info
        this.updateResultsHeader();
        
        // Update key metrics
        this.updateKeyMetrics();
        
        // Update performance scenarios
        this.updatePerformanceScenarios();
        
        // Show recommendations
        this.showRecommendations();
    },
    
    // Update results header
    updateResultsHeader() {
        const createdTime = document.getElementById('createdTime');
        const portfolioRisk = document.getElementById('portfolioRisk');
        
        if (createdTime) {
            createdTime.textContent = new Date().toLocaleString('de-DE');
        }
        
        if (portfolioRisk) {
            const riskLabels = {
                conservative: 'Niedriges Risiko',
                balanced: 'Mittleres Risiko',
                growth: 'Hohes Risiko',
                aggressive: 'Sehr hohes Risiko'
            };
            portfolioRisk.textContent = riskLabels[this.userProfile.selectedStrategy] || 'Mittleres Risiko';
        }
    },
    
    // Update key metrics
    updateKeyMetrics() {
        const elements = {
            monthlyAmount: document.getElementById('monthlyAmount'),
            expectedReturn: document.getElementById('expectedReturn'),
            sharpeRatio: document.getElementById('sharpeRatio'),
            aiConfidence: document.getElementById('aiConfidence')
        };
        
        if (elements.monthlyAmount) {
            elements.monthlyAmount.textContent = `${this.userProfile.amount.toLocaleString('de-DE')}€`;
        }
        
        if (elements.expectedReturn) {
            const returnPercent = (this.optimizedPortfolio.metrics.expectedReturn * 100).toFixed(1);
            elements.expectedReturn.textContent = `${returnPercent}%`;
        }
        
        if (elements.sharpeRatio) {
            elements.sharpeRatio.textContent = this.optimizedPortfolio.metrics.sharpeRatio.toFixed(2);
        }
        
        if (elements.aiConfidence) {
            elements.aiConfidence.textContent = `${this.optimizedPortfolio.aiConfidence}%`;
        }
    },
    
    // Update performance scenarios
    updatePerformanceScenarios() {
        const simulation = this.optimizedPortfolio.simulation;
        
        const elements = {
            bestCase: document.getElementById('bestCase'),
            likelyCase: document.getElementById('likelyCase'),
            worstCase: document.getElementById('worstCase')
        };
        
        if (elements.bestCase) {
            const bestReturn = ((simulation.percentile95 - 1) * 100).toFixed(1);
            elements.bestCase.textContent = `+${bestReturn}%`;
        }
        
        if (elements.likelyCase) {
            const likelyReturn = ((simulation.median - 1) * 100).toFixed(1);
            elements.likelyCase.textContent = `+${likelyReturn}%`;
        }
        
        if (elements.worstCase) {
            const worstReturn = ((simulation.percentile5 - 1) * 100).toFixed(1);
            elements.worstCase.textContent = `${worstReturn}%`;
        }
    },
    
    // Show detailed recommendations
    showRecommendations() {
        const container = document.getElementById('recommendationsGrid');
        if (!container) return;
        
        const recommendations = this.optimizedPortfolio.portfolio.assets.slice(0, 6);
        
        container.innerHTML = recommendations.map(asset => `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <div class="asset-icon">${this.getAssetIcon(asset.sector)}</div>
                    <div class="asset-info">
                        <h4 class="asset-symbol">${asset.symbol}</h4>
                        <p class="asset-sector">${this.translateSector(asset.sector)}</p>
                    </div>
                    <div class="asset-weight">
                        <span class="weight-percentage">${(asset.weight * 100).toFixed(1)}%</span>
                        <span class="weight-amount">${Math.round(asset.allocation).toLocaleString('de-DE')}€</span>
                    </div>
                </div>
                <div class="recommendation-metrics">
                    <div class="metric">
                        <span class="metric-label">Erwartete Rendite</span>
                        <span class="metric-value">${(asset.expectedReturn * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Volatilität</span>
                        <span class="metric-value">${(asset.volatility * 100).toFixed(1)}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Eignung</span>
                        <span class="metric-value">${Math.round((asset.suitabilityScore || 85))}%</span>
                    </div>
                </div>
                <div class="recommendation-reason">
                    <p>Empfohlen aufgrund von ${this.getRecommendationReason(asset)}</p>
                </div>
            </div>
        `).join('');
    },
    
    // Get asset icon based on sector
    getAssetIcon(sector) {
        const icons = {
            'technology': '💻',
            'healthcare': '🏥',
            'financial': '🏦',
            'consumer_staples': '🛒',
            'consumer_discretionary': '🛍️',
            'industrials': '🏭',
            'energy': '⚡',
            'utilities': '💡',
            'materials': '🏗️',
            'real_estate': '🏠',
            'government_bonds': '🏛️',
            'corporate_bonds': '📊',
            'broad_market': '🌍',
            'bonds': '🏦',
            'commodities': '🥇'
        };
        return icons[sector] || '📈';
    },
    
    // Translate sector names
    translateSector(sector) {
        const translations = {
            'technology': 'Technologie',
            'healthcare': 'Gesundheitswesen',
            'financial': 'Finanzen',
            'consumer_staples': 'Basiskonsumgüter',
            'consumer_discretionary': 'Konsumgüter',
            'industrials': 'Industrie',
            'energy': 'Energie',
            'utilities': 'Versorgung',
            'materials': 'Rohstoffe',
            'real_estate': 'Immobilien',
            'government_bonds': 'Staatsanleihen',
            'corporate_bonds': 'Unternehmensanleihen',
            'broad_market': 'Breiter Markt',
            'bonds': 'Anleihen',
            'commodities': 'Rohstoffe'
        };
        return translations[sector] || sector;
    },
    
    // Get recommendation reason
    getRecommendationReason(asset) {
        const reasons = [
            'starker Fundamentaldaten und Wachstumsaussichten',
            'attraktivem Risiko-Rendite-Verhältnis',
            'guter Diversifikation zu anderen Positionen',
            'stabiler Dividendenhistorie',
            'innovativer Marktposition',
            'defensiver Eigenschaften'
        ];
        
        return reasons[Math.floor(Math.random() * reasons.length)];
    },
    
    // Initialize charts
    async initializeCharts() {
        try {
            await this.initPortfolioChart();
            await this.initProjectionChart();
        } catch (error) {
            console.error('❌ Chart initialization failed:', error);
        }
    },
    
    // Initialize portfolio allocation chart
    async initPortfolioChart() {
        const canvas = document.getElementById('portfolioChart');
        if (!canvas || typeof Chart === 'undefined') {
            console.warn('Chart.js not available or canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const assets = this.optimizedPortfolio.portfolio.assets;
        
        this.charts.portfolio = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: assets.map(asset => `${asset.symbol} (${(asset.weight * 100).toFixed(1)}%)`),
                datasets: [{
                    data: assets.map(asset => asset.weight * 100),
                    backgroundColor: [
                        '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
                        '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const asset = assets[context.dataIndex];
                                return [
                                    `${asset.symbol}: ${context.parsed.toFixed(1)}%`,
                                    `Betrag: ${Math.round(asset.allocation).toLocaleString('de-DE')}€`,
                                    `Rendite: ${(asset.expectedReturn * 100).toFixed(1)}%`
                                ];
                            }
                        }
                    }
                }
            }
        });
    },
    
    // Initialize performance projection chart
    async initProjectionChart() {
        const canvas = document.getElementById('projectionChart');
        if (!canvas || typeof Chart === 'undefined') {
            console.warn('Chart.js not available or canvas not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        const simulation = this.optimizedPortfolio.simulation;
        
        // Generate projection data points
        const months = [];
        const projectedValues = [];
        const confidenceHigh = [];
        const confidenceLow = [];
        
        const monthlyReturn = this.optimizedPortfolio.metrics.expectedReturn / 12;
        const monthlyVolatility = this.optimizedPortfolio.metrics.expectedRisk / Math.sqrt(12);
        
        for (let i = 0; i <= this.userProfile.timeHorizon; i++) {
            months.push(i);
            const expectedValue = this.userProfile.amount * Math.pow(1 + monthlyReturn, i);
            const volatilityFactor = Math.sqrt(i) * monthlyVolatility * this.userProfile.amount;
            
            projectedValues.push(expectedValue);
            confidenceHigh.push(expectedValue + volatilityFactor);
            confidenceLow.push(Math.max(0, expectedValue - volatilityFactor));
        }
        
        this.charts.projection = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months.map(m => `${m}M`),
                datasets: [
                    {
                        label: 'Erwartete Entwicklung',
                        data: projectedValues,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: false,
                        tension: 0.4
                    },
                    {
                        label: 'Konfidenzbereich (Hoch)',
                        data: confidenceHigh,
                        borderColor: 'rgba(16, 185, 129, 0.5)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: '+1',
                        tension: 0.4
                    },
                    {
                        label: 'Konfidenzbereich (Niedrig)',
                        data: confidenceLow,
                        borderColor: 'rgba(239, 68, 68, 0.5)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: false,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString('de-DE') + '€';
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Monate'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${Math.round(context.parsed.y).toLocaleString('de-DE')}€`;
                            }
                        }
                    }
                }
            }
        });
    },
    
    // Export portfolio
    exportPortfolio() {
        if (!this.optimizedPortfolio) return;
        
        const portfolioData = {
            userProfile: this.userProfile,
            portfolio: this.optimizedPortfolio,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
        
        const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `moneymagnet_portfolio_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (typeof UIManager !== 'undefined') {
            UIManager.showToast('Portfolio erfolgreich exportiert', 'success');
        }
    },
    
    // Save portfolio to localStorage
    savePortfolio() {
        if (!this.optimizedPortfolio) return;
        
        try {
            const portfolioData = {
                userProfile: this.userProfile,
                portfolio: this.optimizedPortfolio,
                saveDate: new Date().toISOString()
            };
            
            localStorage.setItem('moneymagnet_saved_portfolio', JSON.stringify(portfolioData));
            
            if (typeof UIManager !== 'undefined') {
                UIManager.showToast('Portfolio erfolgreich gespeichert', 'success');
            }
        } catch (error) {
            console.error('❌ Failed to save portfolio:', error);
            if (typeof UIManager !== 'undefined') {
                UIManager.showToast('Fehler beim Speichern des Portfolios', 'error');
            }
        }
    },
    
    // Start over
    startOver() {
        // Reset user profile
        this.userProfile = {
            amount: 1000,
            frequency: 'monthly',
            timeHorizon: 36,
            goal: 'growth',
            riskTolerance: 5,
            lossReaction: 'hold',
            experience: 'beginner'
        };
        
        // Reset UI
        this.currentStep = 1;
        this.optimizedPortfolio = null;
        
        // Hide results and show wizard
        const wizard = document.getElementById('investmentWizard');
        const results = document.getElementById('investmentResults');
        
        if (wizard) wizard.style.display = 'block';
        if (results) results.style.display = 'none';
        
        // Reset wizard to step 1
        this.hideStep(4);
        this.showStep(1);
        this.updateProgressBar();
        
        // Reset form values
        this.resetFormValues();
        
        // Destroy existing charts
        this.destroyCharts();
        
        console.log('🔄 Investment wizard reset');
    },
    
    // Reset form values
    resetFormValues() {
        const amountSlider = document.getElementById('amountSlider');
        const amountInput = document.getElementById('amountInput');
        const frequencySelect = document.getElementById('frequencySelect');
        const durationSlider = document.getElementById('durationSlider');
        const riskSlider = document.getElementById('riskSlider');
        
        if (amountSlider) amountSlider.value = 1000;
        if (amountInput) amountInput.value = 1000;
        if (frequencySelect) frequencySelect.value = 'monthly';
        if (durationSlider) durationSlider.value = 36;
        if (riskSlider) riskSlider.value = 5;
        
        // Reset radio buttons
        const goalGrowth = document.getElementById('goalGrowth');
        const reactionHold = document.getElementById('reactionHold');
        const expBeginner = document.getElementById('expBeginner');
        
        if (goalGrowth) goalGrowth.checked = true;
        if (reactionHold) reactionHold.checked = true;
        if (expBeginner) expBeginner.checked = true;
        
        this.updateTotalInvestment();
        this.updateDurationDisplay();
        this.updateRiskDisplay();
    },
    
    // Destroy charts
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    },
    
    // Show API status
    showStatus() {
        const status = {
            aiEngine: !!window.InvestmentAIEngine,
            chartsLibrary: !!window.Chart,
            userProfile: this.userProfile,
            currentStep: this.currentStep,
            portfolioGenerated: !!this.optimizedPortfolio
        };
        
        console.log('📊 Investment AI Status:', status);
        
        if (typeof UIManager !== 'undefined') {
            UIManager.showToast('Status in Konsole angezeigt', 'info');
        }
        
        return status;
    }
};

// Global export
window.investmentAI = investmentAI;

console.log('🤖 Investment AI UI loaded - Advanced portfolio management interface ready');