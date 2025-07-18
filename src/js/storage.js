class Storage {
    constructor() {
        this.WATCHLIST_KEY = 'neko-watchlist';
        this.CACHE_KEY = 'neko-cache';
        this.CACHE_DURATION = 60000; // 1 minute
    }

    getWatchlist() {
        try {
            const stored = localStorage.getItem(this.WATCHLIST_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading watchlist:', error);
            return [];
        }
    }

    saveWatchlist(watchlist) {
        try {
            localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist));
            return true;
        } catch (error) {
            console.error('Error saving watchlist:', error);
            return false;
        }
    }

    addToWatchlist(symbol) {
        const watchlist = this.getWatchlist();
        const upperSymbol = symbol.toUpperCase();
        
        if (!watchlist.includes(upperSymbol)) {
            watchlist.push(upperSymbol);
            this.saveWatchlist(watchlist);
            return true;
        }
        return false;
    }

    removeFromWatchlist(symbol) {
        const watchlist = this.getWatchlist();
        const upperSymbol = symbol.toUpperCase();
        const index = watchlist.indexOf(upperSymbol);
        
        if (index > -1) {
            watchlist.splice(index, 1);
            this.saveWatchlist(watchlist);
            return true;
        }
        return false;
    }

    getCachedQuote(symbol) {
        try {
            const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
            const cached = cache[symbol.toUpperCase()];
            
            if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
                return cached.data;
            }
        } catch (error) {
            console.error('Error reading cache:', error);
        }
        return null;
    }

    cacheQuote(symbol, data) {
        try {
            const cache = JSON.parse(localStorage.getItem(this.CACHE_KEY) || '{}');
            cache[symbol.toUpperCase()] = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache));
        } catch (error) {
            console.error('Error caching quote:', error);
        }
    }

    clearCache() {
        try {
            localStorage.removeItem(this.CACHE_KEY);
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    exportWatchlist() {
        const watchlist = this.getWatchlist();
        const csv = 'Symbol\n' + watchlist.join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neko-watchlist.csv';
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

const storage = new Storage();