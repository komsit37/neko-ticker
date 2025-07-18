class Terminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('input');
        this.prompt = document.getElementById('prompt');
        this.cursor = document.getElementById('cursor');
        this.catMood = document.getElementById('cat-mood');
        
        this.history = [];
        this.historyIndex = -1;
        this.currentMode = 'main';
        this.searchResults = [];
        
        this.setupEventListeners();
        this.showWelcome();
    }

    setupEventListeners() {
        this.input.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.processCommand();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory(-1);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory(1);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.goBack();
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.handleTab();
                    break;
            }
        });

        this.input.addEventListener('input', () => {
            this.updateCursor();
        });

        // Handle number keys for quick selection
        document.addEventListener('keydown', (e) => {
            if (document.activeElement === this.input) {
                const num = parseInt(e.key);
                if (num >= 1 && num <= 9 && this.searchResults.length > 0) {
                    if (num <= this.searchResults.length) {
                        this.selectSearchResult(num - 1);
                    }
                }
            }
        });

        this.input.focus();
    }

    showWelcome() {
        this.print(`
Welcome to NEKO-TICKER! (=^･ω･^=)

Commands:
  [W] - View watchlist
  [Q] <symbol> - Get quote
  [A] <symbol> - Add to watchlist  
  [R] <symbol> - Remove from watchlist
  [S] <query> - Search stocks
  [H] - Show help
  [C] - Clear screen
  
Type a command or stock symbol to get started!
        `, 'info');
    }

    print(text, className = '') {
        const div = document.createElement('div');
        div.textContent = text;
        if (className) {
            div.className = className;
        }
        this.output.appendChild(div);
        this.output.scrollTop = this.output.scrollHeight;
    }

    printHTML(html, className = '') {
        const div = document.createElement('div');
        div.innerHTML = html;
        if (className) {
            div.className = className;
        }
        this.output.appendChild(div);
        this.output.scrollTop = this.output.scrollHeight;
    }

    clear() {
        this.output.innerHTML = '';
    }

    updateCursor() {
        const inputValue = this.input.value;
        const textWidth = this.getTextWidth(inputValue);
        this.cursor.style.left = `${textWidth}px`;
    }

    getTextWidth(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = getComputedStyle(this.input).font;
        return context.measureText(text).width;
    }

    processCommand() {
        const command = this.input.value.trim();
        if (!command) return;

        this.addToHistory(command);
        this.print(`${this.prompt.textContent}${command}`);
        this.input.value = '';
        this.updateCursor();

        this.executeCommand(command);
    }

    addToHistory(command) {
        this.history.push(command);
        this.historyIndex = this.history.length;
        
        // Keep only last 50 commands
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    navigateHistory(direction) {
        if (this.history.length === 0) return;

        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.history.length) {
            this.historyIndex = this.history.length;
            this.input.value = '';
        } else {
            this.input.value = this.history[this.historyIndex];
        }
        
        this.updateCursor();
    }

    executeCommand(command) {
        const cmd = command.toLowerCase();
        const args = command.split(' ').slice(1);

        // Handle single letter commands
        if (cmd === 'w' || cmd === 'watchlist') {
            this.showWatchlist();
        } else if (cmd.startsWith('q ') || cmd.startsWith('quote ')) {
            this.getQuote(args[0]);
        } else if (cmd.startsWith('a ') || cmd.startsWith('add ')) {
            this.addToWatchlist(args[0]);
        } else if (cmd.startsWith('r ') || cmd.startsWith('remove ')) {
            this.removeFromWatchlist(args[0]);
        } else if (cmd.startsWith('s ') || cmd.startsWith('search ')) {
            this.searchStocks(args.join(' '));
        } else if (cmd === 'h' || cmd === 'help') {
            this.showHelp();
        } else if (cmd === 'c' || cmd === 'clear') {
            this.clear();
        } else if (cmd === 'export') {
            this.exportWatchlist();
        } else if (cmd.match(/^[a-z]{1,5}$/i)) {
            // Treat as stock symbol
            this.getQuote(cmd);
        } else {
            this.print(`Unknown command: ${command}`, 'error');
            this.print('Type [H] for help', 'info');
        }
    }

    async showWatchlist() {
        const watchlist = storage.getWatchlist();
        
        if (watchlist.length === 0) {
            this.print('Your watchlist is empty. Add stocks with [A] <symbol>', 'info');
            return;
        }

        this.print('Loading watchlist...', 'info');
        this.setCatMood('loading');

        try {
            const quotes = await api.getMultipleQuotes(watchlist);
            this.displayWatchlist(quotes);
            this.updateCatMoodFromQuotes(quotes);
        } catch (error) {
            this.print(`Error loading watchlist: ${error.message}`, 'error');
            this.setCatMood('worried');
        }
    }

    displayWatchlist(quotes) {
        this.print('\n═══════════════════════════════════════════════════════════════');
        this.print('                        WATCHLIST                              ');
        this.print('═══════════════════════════════════════════════════════════════');
        
        const header = 'SYMBOL    PRICE      CHANGE     CHANGE%    VOLUME';
        this.print(header);
        this.print('─'.repeat(header.length));

        quotes.forEach((quote, index) => {
            if (quote.error) {
                this.print(`${(index + 1).toString().padStart(2)}. ${quote.symbol.padEnd(6)} ERROR: ${quote.error}`, 'error');
            } else {
                const symbol = quote.symbol.padEnd(6);
                const price = `$${api.formatPrice(quote.price)}`.padEnd(10);
                const change = api.formatChange(quote.change).padEnd(10);
                const changePercent = api.formatPercent(quote.changePercent).padEnd(10);
                const volume = api.formatVolume(quote.volume).padEnd(10);
                
                const changeClass = api.getChangeClass(quote.change);
                const line = `${(index + 1).toString().padStart(2)}. ${symbol} ${price} ${change} ${changePercent} ${volume}`;
                
                this.print(line, changeClass);
            }
        });

        this.print('─'.repeat(header.length));
        this.print(`Total: ${quotes.length} stocks`);
    }

    async getQuote(symbol) {
        if (!symbol) {
            this.print('Usage: [Q] <symbol>', 'error');
            return;
        }

        this.print(`Getting quote for ${symbol.toUpperCase()}...`, 'info');
        this.setCatMood('loading');

        try {
            const quote = await api.getQuote(symbol);
            this.displayQuote(quote);
            this.updateCatMoodFromQuote(quote);
        } catch (error) {
            this.print(`Error getting quote: ${error.message}`, 'error');
            this.setCatMood('worried');
        }
    }

    displayQuote(quote) {
        const changeClass = api.getChangeClass(quote.change);
        
        this.print('\n═══════════════════════════════════════════════════════════════');
        this.print(`                    ${quote.symbol} QUOTE                    `);
        this.print('═══════════════════════════════════════════════════════════════');
        
        this.print(`Price:        $${api.formatPrice(quote.price)}`, changeClass);
        this.print(`Change:       ${api.formatChange(quote.change)} (${api.formatPercent(quote.changePercent)})`, changeClass);
        this.print(`Volume:       ${api.formatVolume(quote.volume)}`);
        this.print(`Market Cap:   ${api.formatMarketCap(quote.marketCap)}`);
        this.print(`Day Range:    $${api.formatPrice(quote.low)} - $${api.formatPrice(quote.high)}`);
        this.print(`Previous:     $${api.formatPrice(quote.previousClose)}`);
        this.print(`Open:         $${api.formatPrice(quote.open)}`);
        
        // Show simple chart
        this.print('\n' + chart.generateSimpleChart(quote.price, quote.previousClose, quote.symbol), 'chart');
        
        this.print('\n═══════════════════════════════════════════════════════════════');
    }

    addToWatchlist(symbol) {
        if (!symbol) {
            this.print('Usage: [A] <symbol>', 'error');
            return;
        }

        if (storage.addToWatchlist(symbol)) {
            this.print(`Added ${symbol.toUpperCase()} to watchlist`, 'info');
            this.setCatMood('happy');
        } else {
            this.print(`${symbol.toUpperCase()} is already in watchlist`, 'error');
        }
    }

    removeFromWatchlist(symbol) {
        if (!symbol) {
            this.print('Usage: [R] <symbol>', 'error');
            return;
        }

        if (storage.removeFromWatchlist(symbol)) {
            this.print(`Removed ${symbol.toUpperCase()} from watchlist`, 'info');
        } else {
            this.print(`${symbol.toUpperCase()} not found in watchlist`, 'error');
        }
    }

    async searchStocks(query) {
        if (!query) {
            this.print('Usage: [S] <query>', 'error');
            return;
        }

        this.print(`Searching for "${query}"...`, 'info');
        this.setCatMood('loading');

        try {
            const results = await api.searchStocks(query);
            this.displaySearchResults(results);
            this.setCatMood('normal');
        } catch (error) {
            this.print(`Search error: ${error.message}`, 'error');
            this.setCatMood('worried');
        }
    }

    displaySearchResults(results) {
        if (results.length === 0) {
            this.print('No results found', 'info');
            return;
        }

        this.searchResults = results;
        this.print('\nSearch Results:');
        this.print('─'.repeat(50));
        
        results.slice(0, 9).forEach((result, index) => {
            this.print(`${index + 1}. ${result.symbol} - ${result.name} (${result.type})`);
        });
        
        this.print('─'.repeat(50));
        this.print('Press number key to get quote, or type symbol manually');
    }

    selectSearchResult(index) {
        if (index < this.searchResults.length) {
            const result = this.searchResults[index];
            this.getQuote(result.symbol);
        }
    }

    showHelp() {
        this.print(`
NEKO-TICKER Help (=^･ω･^=)

Commands:
  [W] or 'watchlist'        - Show your watchlist
  [Q] <symbol>             - Get quote for symbol
  [A] <symbol>             - Add symbol to watchlist
  [R] <symbol>             - Remove symbol from watchlist
  [S] <query>              - Search for stocks
  [H] or 'help'            - Show this help
  [C] or 'clear'           - Clear screen
  'export'                 - Export watchlist to CSV
  
Navigation:
  Arrow Up/Down            - Command history
  Escape                   - Go back
  Tab                      - Auto-complete
  1-9                      - Select from search results
  
Examples:
  Q AAPL                   - Get Apple quote
  A TSLA                   - Add Tesla to watchlist
  S microsoft              - Search for Microsoft
  
Shortcuts:
  Type any stock symbol directly (e.g., 'AAPL')
        `, 'info');
    }

    exportWatchlist() {
        try {
            storage.exportWatchlist();
            this.print('Watchlist exported to CSV file', 'info');
        } catch (error) {
            this.print(`Export error: ${error.message}`, 'error');
        }
    }

    goBack() {
        this.currentMode = 'main';
        this.searchResults = [];
        this.print('Back to main menu', 'info');
    }

    handleTab() {
        // Simple tab completion for commands
        const value = this.input.value.toLowerCase();
        const commands = ['watchlist', 'quote', 'add', 'remove', 'search', 'help', 'clear', 'export'];
        
        const matches = commands.filter(cmd => cmd.startsWith(value));
        if (matches.length === 1) {
            this.input.value = matches[0] + ' ';
            this.updateCursor();
        }
    }

    setCatMood(mood) {
        const moods = {
            'happy': '(=^-ω-^=)',
            'worried': '(=；ェ；=)',
            'normal': '(=^･ω･^=)',
            'loading': '(^._.^)~'
        };
        
        this.catMood.textContent = moods[mood] || moods.normal;
    }

    updateCatMoodFromQuotes(quotes) {
        const validQuotes = quotes.filter(q => !q.error);
        if (validQuotes.length === 0) {
            this.setCatMood('worried');
            return;
        }

        const totalChange = validQuotes.reduce((sum, q) => sum + (q.change || 0), 0);
        const avgChange = totalChange / validQuotes.length;

        if (avgChange > 0.5) {
            this.setCatMood('happy');
        } else if (avgChange < -0.5) {
            this.setCatMood('worried');
        } else {
            this.setCatMood('normal');
        }
    }

    updateCatMoodFromQuote(quote) {
        if (quote.change > 0) {
            this.setCatMood('happy');
        } else if (quote.change < 0) {
            this.setCatMood('worried');
        } else {
            this.setCatMood('normal');
        }
    }
}

const terminal = new Terminal();