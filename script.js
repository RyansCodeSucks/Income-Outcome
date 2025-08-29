class IncomeOutcomeCalculator {
    constructor() {
        this.customIncomeFields = [];
        this.customExpenseFields = [];
        this.calculationHistory = [];
        this.calculatorDisplay = '';
        this.calculatorResult = 0;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.selectedCurrency = 'USD';
        this.currencySymbols = {
            'USD': '$', 'EUR': '€', 'GBP': '£', 'CAD': 'C$', 'AUD': 'A$',
            'JPY': '¥', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$',
            'MXN': '$', 'KRW': '₩', 'SGD': 'S$', 'NZD': 'NZ$', 'SEK': 'kr',
            'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft',
            'RUB': '₽', 'TRY': '₺', 'ZAR': 'R', 'HKD': 'HK$', 'TWD': 'NT$',
            'THB': '฿', 'MYR': 'RM', 'IDR': 'Rp', 'PHP': '₱', 'VND': '₫'
        };
        this.currencyNames = {
            'USD': 'US Dollar', 'EUR': 'Euro', 'GBP': 'British Pound',
            'CAD': 'Canadian Dollar', 'AUD': 'Australian Dollar', 'JPY': 'Japanese Yen',
            'CHF': 'Swiss Franc', 'CNY': 'Chinese Yuan', 'INR': 'Indian Rupee',
            'BRL': 'Brazilian Real', 'MXN': 'Mexican Peso', 'KRW': 'South Korean Won',
            'SGD': 'Singapore Dollar', 'NZD': 'New Zealand Dollar', 'SEK': 'Swedish Krona',
            'NOK': 'Norwegian Krone', 'DKK': 'Danish Krone', 'PLN': 'Polish Złoty',
            'CZK': 'Czech Koruna', 'HUF': 'Hungarian Forint', 'RUB': 'Russian Ruble',
            'TRY': 'Turkish Lira', 'ZAR': 'South African Rand', 'HKD': 'Hong Kong Dollar',
            'TWD': 'New Taiwan Dollar', 'THB': 'Thai Baht', 'MYR': 'Malaysian Ringgit',
            'IDR': 'Indonesian Rupiah', 'PHP': 'Philippine Peso', 'VND': 'Vietnamese Dong'
        };
        this.init();
    }

    init() {
        this.loadHistory();
        this.bindEvents();
        this.updateGoalStatus();
        this.initFloatingCalculator();
        this.loadCurrencyPreference();
    }

    loadCurrencyPreference() {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (savedCurrency && this.currencySymbols[savedCurrency]) {
            this.selectedCurrency = savedCurrency;
            document.getElementById('currency-select').value = savedCurrency;
        }
    }

    saveCurrencyPreference() {
        localStorage.setItem('selectedCurrency', this.selectedCurrency);
    }

    initFloatingCalculator() {
        // Make calculator draggable
        const calculatorHeader = document.querySelector('.calculator-header');
        const calculator = document.getElementById('floating-calculator');
        
        calculatorHeader.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            const rect = calculator.getBoundingClientRect();
            this.dragOffset.x = e.clientX - rect.left;
            this.dragOffset.y = e.clientY - rect.top;
            calculator.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const x = e.clientX - this.dragOffset.x;
                const y = e.clientY - this.dragOffset.y;
                
                // Keep calculator within viewport bounds
                const maxX = window.innerWidth - calculator.offsetWidth;
                const maxY = window.innerHeight - calculator.offsetHeight;
                
                calculator.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
                calculator.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
                calculator.style.right = 'auto';
                calculator.style.bottom = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            calculator.style.cursor = 'default';
        });

        // Initialize calculator display
        this.updateCalculatorDisplay();
    }

    // Calculator Methods
    addNumber(num) {
        if (this.calculatorDisplay === '0' && num !== '.') {
            this.calculatorDisplay = num;
        } else {
            this.calculatorDisplay += num;
        }
        this.updateCalculatorDisplay();
    }

    addOperator(operator) {
        if (this.calculatorDisplay !== '' && !this.calculatorDisplay.endsWith('+') && 
            !this.calculatorDisplay.endsWith('-') && !this.calculatorDisplay.endsWith('×') && 
            !this.calculatorDisplay.endsWith('÷')) {
            this.calculatorDisplay += operator;
            this.updateCalculatorDisplay();
        }
    }

    addDecimal() {
        if (!this.calculatorDisplay.includes('.')) {
            this.calculatorDisplay += '.';
            this.updateCalculatorDisplay();
        }
    }

    clearCalculator() {
        this.calculatorDisplay = '';
        this.calculatorResult = 0;
        this.updateCalculatorDisplay();
    }

    backspace() {
        this.calculatorDisplay = this.calculatorDisplay.slice(0, -1);
        if (this.calculatorDisplay === '') {
            this.calculatorDisplay = '0';
        }
        this.updateCalculatorDisplay();
    }

    calculate() {
        try {
            // Replace × and ÷ with * and / for evaluation
            let expression = this.calculatorDisplay.replace(/×/g, '*').replace(/÷/g, '/');
            
            // Validate expression
            if (expression === '' || expression === '0') {
                return;
            }
            
            // Check for division by zero
            if (expression.includes('/0') && !expression.includes('/0.')) {
                this.calculatorDisplay = 'Error';
                this.updateCalculatorDisplay();
                return;
            }
            
            this.calculatorResult = eval(expression);
            
            // Format result
            if (Number.isInteger(this.calculatorResult)) {
                this.calculatorDisplay = this.calculatorResult.toString();
            } else {
                this.calculatorDisplay = this.calculatorResult.toFixed(2);
            }
            
            this.updateCalculatorDisplay();
            
            // Show success notification
            this.showNotification('Calculation completed!', 'success');
            
        } catch (error) {
            this.calculatorDisplay = 'Error';
            this.updateCalculatorDisplay();
            this.showNotification('Invalid calculation!', 'error');
        }
    }

    copyResult() {
        if (this.calculatorResult !== 0) {
            navigator.clipboard.writeText(this.calculatorResult.toString()).then(() => {
                this.showNotification('Result copied to clipboard!', 'success');
            }).catch(() => {
                this.showNotification('Failed to copy result', 'error');
            });
        } else {
            this.showNotification('No result to copy!', 'warning');
        }
    }

    resetCalculator() {
        this.clearCalculator();
        this.showNotification('Calculator reset!', 'info');
    }

    updateCalculatorDisplay() {
        const display = document.getElementById('calc-display');
        if (display) {
            display.value = this.calculatorDisplay || '0';
        }
    }

    minimizeCalculator() {
        const calculator = document.getElementById('floating-calculator');
        const calculatorBody = document.getElementById('calculator-body');
        const minimizeBtn = document.getElementById('minimize-calc');
        
        if (calculator.classList.contains('minimized')) {
            calculator.classList.remove('minimized');
            minimizeBtn.innerHTML = '<i class="fas fa-minus"></i>';
        } else {
            calculator.classList.add('minimized');
            minimizeBtn.innerHTML = '<i class="fas fa-plus"></i>';
        }
    }

    bindEvents() {
        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateFinances();
        });

        // Add custom income button
        document.getElementById('add-income-btn').addEventListener('click', () => {
            this.addCustomIncomeField();
        });

        // Add custom expense button
        document.getElementById('add-expense-btn').addEventListener('click', () => {
            this.addCustomExpenseField();
        });

        // Save calculation button
        document.getElementById('save-calculation-btn').addEventListener('click', () => {
            this.saveCalculation();
        });

        // Clear history button
        document.getElementById('clear-history-btn').addEventListener('click', () => {
            this.clearHistory();
        });

        // Monthly savings goal input
        document.getElementById('monthly-savings-goal').addEventListener('input', () => {
            this.updateGoalStatus();
        });

        // Currency selection
        document.getElementById('currency-select').addEventListener('change', (e) => {
            this.selectedCurrency = e.target.value;
            this.saveCurrencyPreference();
            this.updateCurrencyDisplay();
            this.showNotification(`Currency changed to ${this.currencyNames[this.selectedCurrency]}`, 'info');
        });

        // Minimize calculator button
        document.getElementById('minimize-calc').addEventListener('click', () => {
            this.minimizeCalculator();
        });

        // Auto-calculate on input changes
        this.addAutoCalculateListeners();
    }

    updateCurrencyDisplay() {
        // Update all displayed amounts with new currency
        if (this.hasValidInputs()) {
            this.calculateFinances();
        }
        
        // Update savings goal status if it exists
        this.updateGoalStatus();
        
        // Update history display
        this.displayHistory();
    }

    addAutoCalculateListeners() {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (this.hasValidInputs()) {
                    this.calculateFinances();
                }
            });
        });
    }

    hasValidInputs() {
        const inputs = document.querySelectorAll('input[type="number"]');
        return Array.from(inputs).some(input => input.value && parseFloat(input.value) > 0);
    }

    addCustomIncomeField() {
        const container = document.getElementById('custom-income-container');
        const fieldId = `custom-income-${Date.now()}`;
        
        const fieldHTML = `
            <div class="custom-item" id="${fieldId}">
                <input type="text" placeholder="Income name" class="custom-name" style="flex: 0 0 120px;">
                <input type="number" placeholder="0.00" step="0.01" class="custom-amount">
                <button type="button" onclick="calculator.removeCustomField('${fieldId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', fieldHTML);
        this.customIncomeFields.push(fieldId);
        
        // Add auto-calculate listener
        const amountInput = container.querySelector(`#${fieldId} .custom-amount`);
        amountInput.addEventListener('input', () => {
            if (this.hasValidInputs()) {
                this.calculateFinances();
            }
        });
    }

    addCustomExpenseField() {
        const container = document.getElementById('custom-expense-container');
        const fieldId = `custom-expense-${Date.now()}`;
        
        const fieldHTML = `
            <div class="custom-item" id="${fieldId}">
                <input type="text" placeholder="Expense name" class="custom-name" style="flex: 0 0 120px;">
                <input type="number" placeholder="0.00" step="0.01" class="custom-amount">
                <button type="button" onclick="calculator.removeCustomField('${fieldId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', fieldHTML);
        this.customExpenseFields.push(fieldId);
        
        // Add auto-calculate listener
        const amountInput = container.querySelector(`#${fieldId} .custom-amount`);
        amountInput.addEventListener('input', () => {
            if (this.hasValidInputs()) {
                this.calculateFinances();
            }
        });
    }

    removeCustomField(fieldId) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.remove();
            
            // Remove from arrays
            this.customIncomeFields = this.customIncomeFields.filter(id => id !== fieldId);
            this.customExpenseFields = this.customExpenseFields.filter(id => id !== fieldId);
            
            // Recalculate if needed
            if (this.hasValidInputs()) {
                this.calculateFinances();
            }
        }
    }

    calculateFinances() {
        const income = this.calculateTotalIncome();
        const expenses = this.calculateTotalExpenses();
        const available = income - expenses;
        const savingsRate = income > 0 ? (available / income) * 100 : 0;

        this.displayResults(income, expenses, available, savingsRate);
        this.updateGoalStatus(available);
    }

    calculateTotalIncome() {
        let total = 0;
        
        // Standard income fields
        const salary = parseFloat(document.getElementById('salary').value) || 0;
        const freelance = parseFloat(document.getElementById('freelance').value) || 0;
        const investments = parseFloat(document.getElementById('investments').value) || 0;
        const otherIncome = parseFloat(document.getElementById('other-income').value) || 0;
        
        total += salary + freelance + investments + otherIncome;
        
        // Custom income fields
        this.customIncomeFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const amount = parseFloat(field.querySelector('.custom-amount').value) || 0;
                total += amount;
            }
        });
        
        return total;
    }

    calculateTotalExpenses() {
        let total = 0;
        
        // Standard expense fields
        const rent = parseFloat(document.getElementById('rent').value) || 0;
        const utilities = parseFloat(document.getElementById('utilities').value) || 0;
        const groceries = parseFloat(document.getElementById('groceries').value) || 0;
        const transportation = parseFloat(document.getElementById('transportation').value) || 0;
        const entertainment = parseFloat(document.getElementById('entertainment').value) || 0;
        const healthcare = parseFloat(document.getElementById('healthcare').value) || 0;
        
        total += rent + utilities + groceries + transportation + entertainment + healthcare;
        
        // Custom expense fields
        this.customExpenseFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const amount = parseFloat(field.querySelector('.custom-amount').value) || 0;
                total += amount;
            }
        });
        
        return total;
    }

    displayResults(income, expenses, available, savingsRate) {
        document.getElementById('total-income').textContent = this.formatCurrency(income);
        document.getElementById('total-expenses').textContent = this.formatCurrency(expenses);
        document.getElementById('available-money').textContent = this.formatCurrency(available);
        document.getElementById('savings-percentage').textContent = `${savingsRate.toFixed(1)}%`;
        
        // Show results with animation
        const results = document.getElementById('results');
        results.style.display = 'grid';
        
        // Add visual feedback based on available money
        const availableElement = document.getElementById('available-money');
        if (available > 0) {
            availableElement.style.color = '#38a169';
        } else if (available < 0) {
            availableElement.style.color = '#e53e3e';
        } else {
            availableElement.style.color = '#3182ce';
        }
    }

    updateGoalStatus(available = null) {
        if (available === null) {
            available = this.calculateTotalIncome() - this.calculateTotalExpenses();
        }
        
        const goalInput = document.getElementById('monthly-savings-goal');
        const goalStatus = document.getElementById('goal-status');
        const goal = parseFloat(goalInput.value) || 0;
        
        if (goal > 0) {
            if (available >= goal) {
                goalStatus.textContent = `🎉 Goal met! You have ${this.formatCurrency(available - goal)} extra disposable income.`;
                goalStatus.className = 'goal-status met';
            } else {
                const shortfall = goal - available;
                goalStatus.textContent = `📊 Goal not met. You need ${this.formatCurrency(shortfall)} more to reach your disposable income goal.`;
                goalStatus.className = 'goal-status not-met';
            }
        } else {
            goalStatus.textContent = '';
            goalStatus.className = 'goal-status';
        }
    }

    saveCalculation() {
        const income = this.calculateTotalIncome();
        const expenses = this.calculateTotalExpenses();
        const available = income - expenses;
        
        if (income === 0 && expenses === 0) {
            alert('Please enter some values before saving.');
            return;
        }
        
        const calculation = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            income: income,
            expenses: expenses,
            available: available,
            savingsRate: income > 0 ? (available / income) * 100 : 0
        };
        
        this.calculationHistory.unshift(calculation);
        this.saveHistory();
        this.displayHistory();
        
        // Show success message
        this.showNotification('Calculation saved successfully!', 'success');
    }

    displayHistory() {
        const historyList = document.getElementById('history-list');
        historyList.innerHTML = '';
        
        this.calculationHistory.forEach(calc => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <h4>${calc.date}</h4>
                <div class="history-details">
                    <div><span>Income:</span> <strong>${this.formatCurrency(calc.income)}</strong></div>
                    <div><span>Expenses:</span> <strong>${this.formatCurrency(calc.expenses)}</strong></div>
                    <div><span>Disposable Income:</span> <strong>${this.formatCurrency(calc.available)}</strong></div>
                    <div><span>Disposable Income Rate:</span> <strong>${calc.savingsRate.toFixed(1)}%</strong></div>
                </div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all calculation history?')) {
            this.calculationHistory = [];
            this.saveHistory();
            this.displayHistory();
            this.showNotification('History cleared successfully!', 'info');
        }
    }

    saveHistory() {
        localStorage.setItem('incomeOutcomeHistory', JSON.stringify(this.calculationHistory));
    }

    loadHistory() {
        const saved = localStorage.getItem('incomeOutcomeHistory');
        if (saved) {
            this.calculationHistory = JSON.parse(saved);
            this.displayHistory();
        }
    }

    formatCurrency(amount) {
        const symbol = this.currencySymbols[this.selectedCurrency] || '$';
        
        // Special formatting for different currencies
        switch (this.selectedCurrency) {
            case 'JPY':
            case 'KRW':
            case 'IDR':
            case 'VND':
                // These currencies typically don't use decimal places
                return `${symbol}${Math.round(amount).toLocaleString()}`;
            
            case 'CNY':
            case 'TWD':
            case 'THB':
            case 'MYR':
            case 'PHP':
                // These currencies use 2 decimal places
                return `${symbol}${amount.toFixed(2)}`;
            
            default:
                // Most currencies use 2 decimal places
                return `${symbol}${amount.toFixed(2)}`;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
            max-width: 300px;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#38a169';
                break;
            case 'error':
                notification.style.background = '#e53e3e';
                break;
            case 'warning':
                notification.style.background = '#d69e2e';
                break;
            default:
                notification.style.background = '#3182ce';
        }
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize calculator when page loads
let calculator;
document.addEventListener('DOMContentLoaded', () => {
    calculator = new IncomeOutcomeCalculator();
});

// Make calculator globally accessible for custom field removal
window.calculator = calculator;
