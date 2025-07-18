# NEKO-TICKER Implementation Prompt

## Project Overview

Create a terminal-style stock portfolio tracker web application called NEKO-TICKER with a cat theme. The app should provide a fast, keyboard-driven interface for monitoring stock prices and managing a watchlist, optimized for data efficiency and speed.

## Motivation

- **Performance**: Text-only interface loads faster and uses less bandwidth than traditional trading apps
- **Accessibility**: Keyboard navigation is faster for power users and better for accessibility
- **Focus**: Terminal UI reduces distractions and focuses on essential data
- **Nostalgia**: Appeals to developers who appreciate terminal aesthetics

## Core Requirements

### 1. User Interface
- Terminal-style design with monospace font (JetBrains Mono)
- Dark theme with green-on-black color scheme
- ASCII art cat logo and mood indicators
- No images or heavy graphics
- Responsive to different screen sizes

### 2. Features
- **Watchlist View**: Display saved stocks with current price and daily change
- **Quote View**: Detailed stock information including price, volume, market cap, ranges
- **ASCII Charts**: Simple text-based price charts
- **Real-time Updates**: Prices should update periodically
- **Search**: Look up stocks by symbol with autocomplete

### 3. Navigation
- Keyboard-first interaction
- Number keys (1-9) for quick selection
- Letter commands: [W]atchlist, [Q]uote, [A]dd, [R]emove, [H]elp
- Direct symbol entry
- Enter to execute commands
- Escape to go back

### 4. Data
- Integrate with free stock API (Yahoo Finance or Alpha Vantage)
- Cache data to minimize API calls
- Store watchlist in localStorage
- Handle API errors gracefully

## Design Specifications

### Visual Elements
```
Logo:
  ╱|、          NEKO-TICKER
 (˚ˎ 。7        Purr-fect Portfolio Tracker
  |、˜〵      
  じしˍ,)ノ     v1.0

Cat Moods:
- Happy (gains): (=^-ω-^=)
- Worried (losses): (=；ェ；=)
- Normal: (=^･ω･^=)
- Loading: (^._.^)~
```

### Color Palette
- Background: #0a0a0a
- Primary text: #00ff88
- Gains: #00ff00
- Losses: #ff6b6b
- Accent: #ffd93d

## Technical Implementation Plan

### Project Structure
```
neko-ticker/
├── index.html
├── src/
│   ├── js/
│   │   ├── app.js         # Main application logic
│   │   ├── api.js         # API integration
│   │   ├── terminal.js    # Terminal UI handler
│   │   ├── storage.js     # LocalStorage manager
│   │   └── chart.js       # ASCII chart generator
│   └── css/
│       └── style.css
├── server.js              # Simple proxy server for API
└── package.json
```

### Key Components

1. **API Integration**
   - Use yahoo-finance2 or Alpha Vantage
   - Implement rate limiting
   - Cache responses for 1 minute
   - Handle network failures

2. **Terminal Engine**
   - Command parser
   - Screen state manager
   - Input handler with history
   - Output formatter

3. **Data Management**
   - Watchlist CRUD operations
   - Price update scheduler
   - Symbol search/validation

4. **ASCII Chart Generator**
   - Support 1D, 5D, 1M timeframes
   - Scale to terminal width
   - Show price levels

## Implementation Instructions

Please create a fully working prototype that:

1. **Sets up the complete project structure** with all necessary files
2. **Implements a Node.js/Express backend** that:
   - Serves the static files
   - Provides API endpoints for stock data
   - Handles CORS properly
   - Includes error handling
3. **Creates the frontend** with:
   - All navigation working
   - Real stock data integration
   - Persistent watchlist
   - ASCII chart generation
   - Smooth animations for the cat
4. **Includes setup instructions** in README.md
5. **Uses free tier APIs** with fallback data

## Additional Features (Nice to Have)

- Export watchlist to CSV
- Multiple watchlists
- Price alerts
- News headlines
- Portfolio tracking (with quantities)
- Vim keybindings
- Theme customization

## Constraints

- Must work without any build tools (vanilla JS)
- Should load in under 100KB total
- API calls should be minimized
- Must work offline with cached data
- No external dependencies except for fonts

## Success Criteria

- User can add/remove stocks from watchlist
- Prices update every 30 seconds
- All keyboard shortcuts work
- Cat mood changes based on portfolio performance
- Works on both desktop and mobile browsers
- Handles API failures gracefully

---

**Note**: I've attached a demo HTML file that shows the basic UI and interaction patterns. Please use this as a reference for the visual design and user experience, but implement proper separation of concerns and real data integration.