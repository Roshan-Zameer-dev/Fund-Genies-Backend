const yahooFinance = require("yahoo-finance2").default;
const axios = require("axios");

// Function to fetch live stock prices
const fetchStockData = async () => {
  try {
    console.log("📊 Fetching stock data...");
    const stockSymbols = ["AAPL", "GOOGL", "TSLA", "TCS.NS", "INFY.NS", "RELIANCE.NS"];
    
    const stockData = await Promise.all(
      stockSymbols.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return quote;
        } catch (error) {
          console.error(`❌ Error fetching ${symbol}:`, error.message);
          return null;
        }
      })
    );

    // Filter out null values and format data
    const validStocks = stockData.filter(stock => stock !== null);
    
    return validStocks.map(stock => ({
      name: stock.shortName || stock.symbol,
      symbol: stock.symbol,
      price: stock.regularMarketPrice || 0,
    }));
  } catch (error) {
    console.error("⚠️ Error fetching stock data:", error.message);
    return [];
  }
};

// Function to fetch live crypto data from CoinGecko
const fetchCryptoData = async () => {
  try {
    console.log("🪙 Fetching crypto data...");
    
    const response = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
      params: {
        vs_currency: "inr",
        order: "market_cap_desc",
        per_page: 5,
        page: 1,
        sparkline: false,
      },
      timeout: 10000, // 10 second timeout
    });

    return response.data.map(crypto => ({
      name: crypto.name,
      price: crypto.current_price,
      image: crypto.image,
    }));
  } catch (error) {
    console.error("⚠️ Error fetching crypto data:", error.message);
    
    // Return fallback data if API fails
    return [
      { name: "Bitcoin", price: 2500000, image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
      { name: "Ethereum", price: 200000, image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png" },
    ];
  }
};

module.exports = { fetchStockData, fetchCryptoData };