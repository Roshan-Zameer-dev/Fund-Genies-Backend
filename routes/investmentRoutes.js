const express = require("express");
const { fetchStockData, fetchCryptoData } = require("../utils/fetchMarketData");

const router = express.Router();

// Input validation middleware
const validateInput = (req, res, next) => {
  const { amount, riskLevel } = req.body;
  
  if (!amount || !riskLevel) {
    return res.status(400).json({ 
      message: "Amount and risk level are required" 
    });
  }
  
  if (amount <= 0 || amount > 10000000) {
    return res.status(400).json({ 
      message: "Amount must be between 1 and 10,000,000" 
    });
  }
  
  if (!["Low", "Medium", "High"].includes(riskLevel)) {
    return res.status(400).json({ 
      message: "Risk level must be Low, Medium, or High" 
    });
  }
  
  next();
};

router.post("/recommend-investments", validateInput, async (req, res) => {
  const { amount, riskLevel } = req.body;

  try {
    console.log(`📈 Processing investment request: Amount=${amount}, Risk=${riskLevel}`);

    const [cryptoData, stockData] = await Promise.all([
      fetchCryptoData(),
      fetchStockData()
    ]);

    console.log(`✅ Crypto Data Fetched: ${cryptoData.length} cryptos found`);
    console.log(`✅ Stock Data Fetched: ${stockData.length} stocks found`);

    // Provide fallback recommendations if no data available
    if (!cryptoData.length && !stockData.length) {
      return res.status(503).json({ 
        message: "Market data temporarily unavailable. Please try again later." 
      });
    }

    let selectedStocks = [];
    let selectedCryptos = [];

    // Risk-based filtering
    if (riskLevel === "Low") {
      selectedStocks = stockData.filter(stock => stock.price < 2000);
      selectedCryptos = cryptoData.filter(crypto => crypto.price < 5000);
    } else if (riskLevel === "Medium") {
      selectedStocks = stockData.filter(stock => stock.price >= 2000 && stock.price < 20000);
      selectedCryptos = cryptoData.filter(crypto => crypto.price >= 5000 && crypto.price < 100000);
    } else {
      selectedStocks = stockData.filter(stock => stock.price >= 20000);
      selectedCryptos = cryptoData.filter(crypto => crypto.price >= 100000);
    }

    // Amount-based selection
    const maxSelections = amount > 100000 ? 3 : 2;
    selectedStocks = selectedStocks.slice(0, maxSelections);
    selectedCryptos = selectedCryptos.slice(0, maxSelections);

    const totalAssets = selectedStocks.length + selectedCryptos.length;
    
    if (totalAssets === 0) {
      return res.status(200).json({
        message: "No suitable investments found for the given criteria",
        investments: { cryptos: [], stocks: [] }
      });
    }

    const allocatedAmount = amount / totalAssets;

    const investmentRecommendations = {
      cryptos: selectedCryptos.map(crypto => ({
        name: crypto.name,
        price: crypto.price,
        amountInvested: parseFloat(allocatedAmount.toFixed(2)),
        image: crypto.image,
      })),
      stocks: selectedStocks.map(stock => ({
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price,
        amountInvested: parseFloat(allocatedAmount.toFixed(2)),
      })),
    };

    console.log(`✅ Recommendations generated successfully`);
    res.json({ 
      investments: investmentRecommendations,
      metadata: {
        totalAmount: amount,
        riskLevel: riskLevel,
        totalAssets: totalAssets,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("❌ Error processing request:", error.message);
    res.status(500).json({ 
      message: "Server error occurred while processing your request" 
    });
  }
});

// Test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    message: "Investment API is working!", 
    timestamp: new Date().toISOString() 
  });
});

module.exports = router;