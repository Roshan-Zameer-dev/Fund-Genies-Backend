const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:3000',  // For local development
    'http://localhost:5173',  // For Vite dev server
    'https://your-netlify-site.netlify.app',  // Replace with your actual Netlify URL
    // Add more domains as needed
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Investment API is running!", status: "healthy" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Import investment routes
const investmentRoutes = require("./routes/investmentRoutes");
app.use("/api", investmentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});