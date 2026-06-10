# databoxing

ai powered webscraper that transforms data from websites into excel/csv/json

## Setup

### 1. Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/webscraper.git
cd webscraper
```

### 2. Install Dependencies

```
npm install
```

### 3. Get Your Own Anthropic API Key


### 4. Start the Server

```
npm start
```

Go to `http://localhost:3000`

## Project Structure

```
webscraper/
├── public/              # Frontend files
│   ├── index.html
│   ├── main.js
│   └── style.css
├── src/                 # Backend logic
│   ├── ai.js           # AI integration
│   ├── scraper.js      # Web scraping logic
│   ├── transformer.js  # Data transformation
│   └── exporter.js     # Export functionality
├── server.js           # Express server
├── package.json
├── .env.example        # Environment variables template
└── .gitignore
```

## License

ISC
