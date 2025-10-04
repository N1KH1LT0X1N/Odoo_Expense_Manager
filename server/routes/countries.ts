import { Router } from "express";
import { countryService } from "../services/countryService";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.use(verifyToken);

// Get all countries with currencies
router.get("/", async (req, res) => {
  try {
    const countries = await countryService.getCountriesWithCurrencies();
    res.json({ countries });
  } catch (error) {
    console.error("Get countries error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get currencies grouped by country
router.get("/currencies", async (req, res) => {
  try {
    const currenciesByCountry = await countryService.getCurrenciesByCountry();
    res.json({ currenciesByCountry });
  } catch (error) {
    console.error("Get currencies by country error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Search countries
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ message: "Query parameter 'q' is required" });
    }

    const countries = await countryService.searchCountries(q);
    res.json({ countries });
  } catch (error) {
    console.error("Search countries error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
