class API {
    constructor() {
        this.baseURL = window.location.origin;
        this.updateInterval = null;
        this.subscribers = new Set();
    }

    async getQuote(symbol) {
        try {
            // Check cache first
            const cached = storage.getCachedQuote(symbol);
            if (cached) {
                return cached;
            }

            const response = await fetch(`${this.baseURL}/api/quote?symbol=${symbol}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // Cache the result
            storage.cacheQuote(symbol, data);
            return data;
        } catch (error) {
            console.error(`Error fetching quote for ${symbol}:`, error);
            throw error;
        }
    }

    async searchStocks(query) {
        try {
            const response = await fetch(`${this.baseURL}/api/search?q=${query}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data;
        } catch (error) {
            console.error(`Error searching stocks:`, error);
            throw error;
        }
    }

    async getMultipleQuotes(symbols) {
        const promises = symbols.map(symbol => 
            this.getQuote(symbol).catch(error => ({
                symbol: symbol,
                error: error.message
            }))
        );

        return Promise.all(promises);
    }

    subscribe(callback) {
        this.subscribers.add(callback);
    }

    unsubscribe(callback) {
        this.subscribers.delete(callback);
    }

    startAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }

        this.updateInterval = setInterval(async () => {
            const watchlist = storage.getWatchlist();
            if (watchlist.length > 0) {
                try {
                    const quotes = await this.getMultipleQuotes(watchlist);
                    this.subscribers.forEach(callback => {
                        try {
                            callback(quotes);
                        } catch (error) {
                            console.error('Error in subscriber callback:', error);
                        }
                    });
                } catch (error) {
                    console.error('Error in auto-update:', error);
                }
            }
        }, 30000); // 30 seconds
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    formatPrice(price) {
        return typeof price === 'number' ? price.toFixed(2) : 'N/A';
    }

    formatChange(change) {
        if (typeof change !== 'number') return 'N/A';
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(2)}`;
    }

    formatPercent(percent) {
        if (typeof percent !== 'number') return 'N/A';
        const sign = percent >= 0 ? '+' : '';
        return `${sign}${percent.toFixed(2)}%`;
    }

    formatVolume(volume) {
        if (typeof volume !== 'number') return 'N/A';
        
        if (volume >= 1000000000) {
            return `${(volume / 1000000000).toFixed(1)}B`;
        } else if (volume >= 1000000) {
            return `${(volume / 1000000).toFixed(1)}M`;
        } else if (volume >= 1000) {
            return `${(volume / 1000).toFixed(1)}K`;
        }
        
        return volume.toLocaleString();
    }

    formatMarketCap(marketCap) {
        if (typeof marketCap !== 'number') return 'N/A';
        
        if (marketCap >= 1000000000000) {
            return `$${(marketCap / 1000000000000).toFixed(1)}T`;
        } else if (marketCap >= 1000000000) {
            return `$${(marketCap / 1000000000).toFixed(1)}B`;
        } else if (marketCap >= 1000000) {
            return `$${(marketCap / 1000000).toFixed(1)}M`;
        }
        
        return `$${marketCap.toLocaleString()}`;
    }

    getChangeClass(change) {
        if (typeof change !== 'number') return 'neutral';
        return change > 0 ? 'gain' : change < 0 ? 'loss' : 'neutral';
    }
}

const api = new API();