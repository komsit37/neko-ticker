class NekoTicker {
    constructor() {
        this.isOnline = navigator.onLine;
        this.setupEventListeners();
        this.init();
    }

    setupEventListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            terminal.print('Connection restored! (=^･ω･^=)', 'info');
            this.startAutoUpdate();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            terminal.print('Connection lost! Using cached data (=；ェ；=)', 'error');
            this.stopAutoUpdate();
        });

        // Handle page visibility for auto-updates
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoUpdate();
            } else {
                this.startAutoUpdate();
            }
        });

        // Handle beforeunload
        window.addEventListener('beforeunload', () => {
            this.stopAutoUpdate();
        });
    }

    init() {
        // Focus input
        const input = document.getElementById('input');
        if (input) {
            input.focus();
        }

        // Start auto-update if online
        if (this.isOnline) {
            this.startAutoUpdate();
        }

        // Subscribe to API updates
        api.subscribe(this.handleAutoUpdate.bind(this));
    }

    startAutoUpdate() {
        if (this.isOnline) {
            api.startAutoUpdate();
        }
    }

    stopAutoUpdate() {
        api.stopAutoUpdate();
    }

    handleAutoUpdate(quotes) {
        // Update watchlist display if currently showing
        const watchlist = storage.getWatchlist();
        if (watchlist.length > 0) {
            // Only update if we're on the main screen
            if (terminal.currentMode === 'main') {
                terminal.updateCatMoodFromQuotes(quotes);
            }
        }
    }

    // Error handling
    handleError(error) {
        console.error('App Error:', error);
        terminal.print(`System Error: ${error.message}`, 'error');
        terminal.setCatMood('worried');
    }

    // Keyboard shortcuts
    handleGlobalKeyboard(event) {
        // Only handle if input is not focused
        if (document.activeElement !== document.getElementById('input')) {
            switch (event.key.toLowerCase()) {
                case 'w':
                    terminal.executeCommand('w');
                    break;
                case 'h':
                    terminal.executeCommand('h');
                    break;
                case 'c':
                    terminal.executeCommand('c');
                    break;
                case 'escape':
                    terminal.goBack();
                    break;
            }
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    try {
        const app = new NekoTicker();
        
        // Global error handler
        window.addEventListener('error', (event) => {
            app.handleError(event.error);
        });
        
        // Global keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            app.handleGlobalKeyboard(event);
        });
        
        // Prevent right-click context menu for a more terminal-like experience
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        
        console.log('🐱 NEKO-TICKER initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize NEKO-TICKER:', error);
        document.body.innerHTML = `
            <div style="color: #ff6b6b; padding: 20px; font-family: monospace;">
                <h2>Error Loading NEKO-TICKER</h2>
                <p>Please refresh the page and try again.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
});