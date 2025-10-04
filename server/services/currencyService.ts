import axios from 'axios';

interface CurrencyRates {
  [key: string]: number;
}

interface ExchangeRateResponse {
  rates: CurrencyRates;
  base: string;
  date: string;
}

class CurrencyService {
  private rates: CurrencyRates = {};
  private lastUpdated: Date | null = null;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  async getExchangeRates(baseCurrency: string = 'USD'): Promise<CurrencyRates> {
    const now = new Date();
    
    // Return cached rates if they're still valid
    if (this.lastUpdated && 
        (now.getTime() - this.lastUpdated.getTime()) < this.CACHE_DURATION && 
        this.rates[baseCurrency]) {
      return this.rates;
    }

    try {
      const response = await axios.get<ExchangeRateResponse>(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );
      
      this.rates = response.data.rates;
      this.lastUpdated = now;
      
      return this.rates;
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      
      // Return fallback rates if API fails
      return this.getFallbackRates();
    }
  }

  async convertCurrency(
    amount: number, 
    fromCurrency: string, 
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates();
    
    // Convert to USD first, then to target currency
    let usdAmount = amount;
    if (fromCurrency !== 'USD') {
      usdAmount = amount / (rates[fromCurrency] || 1);
    }
    
    if (toCurrency !== 'USD') {
      return usdAmount * (rates[toCurrency] || 1);
    }
    
    return usdAmount;
  }

  private getFallbackRates(): CurrencyRates {
    // Fallback rates for common currencies
    return {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110,
      'CAD': 1.25,
      'AUD': 1.35,
      'CHF': 0.92,
      'CNY': 6.45,
      'INR': 75,
      'BRL': 5.2,
      'MXN': 20,
      'SGD': 1.35,
      'HKD': 7.8,
      'NZD': 1.45,
      'SEK': 8.5,
      'NOK': 8.7,
      'DKK': 6.3,
      'PLN': 3.9,
      'CZK': 21.5,
      'HUF': 300,
      'RUB': 75,
      'ZAR': 15,
      'KRW': 1200,
      'THB': 33,
      'MYR': 4.2,
      'PHP': 50,
      'IDR': 14000,
      'VND': 23000,
      'TRY': 8.5,
      'ILS': 3.2,
      'AED': 3.67,
      'SAR': 3.75,
      'QAR': 3.64,
      'KWD': 0.30,
      'BHD': 0.38,
      'OMR': 0.38,
      'JOD': 0.71,
      'LBP': 1500,
      'EGP': 15.7,
      'MAD': 9.1,
      'TND': 2.8,
      'DZD': 135,
      'NGN': 410,
      'GHS': 5.8,
      'KES': 110,
      'UGX': 3500,
      'TZS': 2300,
      'ETB': 45,
      'ZMW': 18,
      'BWP': 11,
      'SZL': 15,
      'LSL': 15,
      'NAD': 15,
      'MUR': 40,
      'SCR': 13.5,
      'MVR': 15.4,
      'LKR': 200,
      'BDT': 85
    };
  }

  getSupportedCurrencies(): string[] {
    return Object.keys(this.getFallbackRates());
  }
}

export const currencyService = new CurrencyService();
