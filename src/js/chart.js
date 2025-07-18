class ASCIIChart {
    constructor() {
        this.width = 60;
        this.height = 15;
        this.chars = {
            bar: '█',
            empty: ' ',
            axis: '│',
            bottom: '─',
            corner: '└'
        };
    }

    generateChart(data, symbol) {
        if (!data || data.length === 0) {
            return this.generateErrorChart('No data available');
        }

        const prices = data.map(point => point.price || point);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;

        if (range === 0) {
            return this.generateFlatChart(prices[0], symbol);
        }

        const normalizedPrices = prices.map(price => 
            Math.round(((price - min) / range) * (this.height - 1))
        );

        return this.renderChart(normalizedPrices, min, max, symbol);
    }

    generateMockData(symbol, days = 30) {
        const data = [];
        let basePrice = 100 + Math.random() * 50;
        
        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * 5;
            basePrice += change;
            basePrice = Math.max(10, basePrice); // Minimum price
            
            data.push({
                price: basePrice,
                date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000)
            });
        }
        
        return data;
    }

    renderChart(normalizedPrices, min, max, symbol) {
        const lines = [];
        const chartWidth = Math.min(this.width, normalizedPrices.length);
        const step = Math.max(1, Math.floor(normalizedPrices.length / chartWidth));
        
        // Sample data points to fit width
        const sampledPrices = [];
        for (let i = 0; i < normalizedPrices.length; i += step) {
            sampledPrices.push(normalizedPrices[i]);
        }

        // Create chart lines
        for (let row = this.height - 1; row >= 0; row--) {
            let line = '';
            for (let col = 0; col < sampledPrices.length; col++) {
                const price = sampledPrices[col];
                line += price >= row ? this.chars.bar : this.chars.empty;
            }
            lines.push(line);
        }

        // Add price labels
        const topLabel = `${symbol} - High: $${max.toFixed(2)}`;
        const bottomLabel = `Low: $${min.toFixed(2)}`;
        
        return [
            topLabel,
            '┌' + '─'.repeat(chartWidth) + '┐',
            ...lines.map((line, i) => '│' + line.padEnd(chartWidth) + '│'),
            '└' + '─'.repeat(chartWidth) + '┘',
            bottomLabel
        ].join('\n');
    }

    generateFlatChart(price, symbol) {
        const priceStr = typeof price === 'number' ? price.toFixed(2) : 'N/A';
        const line = this.chars.bar.repeat(this.width);
        
        return [
            `${symbol} - $${priceStr} (No Change)`,
            '┌' + '─'.repeat(this.width) + '┐',
            '│' + line + '│',
            '└' + '─'.repeat(this.width) + '┘'
        ].join('\n');
    }

    generateErrorChart(message) {
        const paddedMessage = message.padEnd(this.width);
        
        return [
            'Chart Error',
            '┌' + '─'.repeat(this.width) + '┐',
            '│' + paddedMessage + '│',
            '└' + '─'.repeat(this.width) + '┘'
        ].join('\n');
    }

    generateSimpleChart(current, previous, symbol) {
        const change = current - previous;
        const changePercent = ((change / previous) * 100);
        const direction = change >= 0 ? '↗' : '↘';
        const bars = Math.abs(Math.round(changePercent));
        
        let visualization = '';
        if (change >= 0) {
            visualization = '▲'.repeat(Math.min(bars, 20));
        } else {
            visualization = '▼'.repeat(Math.min(bars, 20));
        }
        
        return [
            `${symbol} ${direction} ${api.formatChange(change)} (${api.formatPercent(changePercent)})`,
            visualization || '━━━━━━━━━━━━━━━━━━━━'
        ].join('\n');
    }

    generateSparkline(prices, width = 40) {
        if (!prices || prices.length === 0) {
            return '─'.repeat(width);
        }

        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const range = max - min;

        if (range === 0) {
            return '─'.repeat(width);
        }

        const sparkChars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
        const step = Math.max(1, Math.floor(prices.length / width));
        
        let sparkline = '';
        for (let i = 0; i < prices.length; i += step) {
            if (sparkline.length >= width) break;
            
            const normalized = (prices[i] - min) / range;
            const charIndex = Math.floor(normalized * (sparkChars.length - 1));
            sparkline += sparkChars[charIndex];
        }

        return sparkline.padEnd(width, '─');
    }
}

const chart = new ASCIIChart();