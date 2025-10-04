import { Router } from "express";
import { currencyService } from "../services/currencyService";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.use(verifyToken);

// Get supported currencies
router.get("/supported", async (req, res) => {
  try {
    const currencies = currencyService.getSupportedCurrencies();
    res.json({ currencies });
  } catch (error) {
    console.error("Get supported currencies error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Convert currency
router.post("/convert", async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ 
        message: "Amount, fromCurrency, and toCurrency are required" 
      });
    }

    const convertedAmount = await currencyService.convertCurrency(
      parseFloat(amount),
      fromCurrency,
      toCurrency
    );

    res.json({ 
      originalAmount: parseFloat(amount),
      fromCurrency,
      toCurrency,
      convertedAmount: Math.round(convertedAmount * 100) / 100 // Round to 2 decimal places
    });
  } catch (error) {
    console.error("Currency conversion error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get exchange rates
router.get("/rates", async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    const rates = await currencyService.getExchangeRates(base as string);
    res.json({ rates, base });
  } catch (error) {
    console.error("Get exchange rates error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
