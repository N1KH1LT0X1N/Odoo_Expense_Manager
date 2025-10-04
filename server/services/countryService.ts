interface Country {
  name: {
    common: string;
    official: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

interface CountryCurrency {
  country: string;
  currency: string;
  symbol: string;
  name: string;
}

class CountryService {
  private countries: CountryCurrency[] = [];
  private lastUpdated: Date | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async getCountriesWithCurrencies(): Promise<CountryCurrency[]> {
    const now = new Date();
    
    // Return cached data if still valid
    if (this.lastUpdated && 
        (now.getTime() - this.lastUpdated.getTime()) < this.CACHE_DURATION && 
        this.countries.length > 0) {
      return this.countries;
    }

    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies');
      const countries: Country[] = await response.json();
      
      this.countries = countries
        .filter(country => country.currencies && Object.keys(country.currencies).length > 0)
        .map(country => {
          const currencyCode = Object.keys(country.currencies)[0];
          const currency = country.currencies[currencyCode];
          
          return {
            country: country.name.common,
            currency: currencyCode,
            symbol: currency.symbol || currencyCode,
            name: currency.name
          };
        })
        .sort((a, b) => a.country.localeCompare(b.country));
      
      this.lastUpdated = now;
      
      return this.countries;
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      
      // Return fallback data
      return this.getFallbackCountries();
    }
  }

  async getCurrenciesByCountry(): Promise<{ [country: string]: CountryCurrency[] }> {
    const countries = await this.getCountriesWithCurrencies();
    
    return countries.reduce((acc, country) => {
      if (!acc[country.country]) {
        acc[country.country] = [];
      }
      acc[country.country].push(country);
      return acc;
    }, {} as { [country: string]: CountryCurrency[] });
  }

  async searchCountries(query: string): Promise<CountryCurrency[]> {
    const countries = await this.getCountriesWithCurrencies();
    const lowercaseQuery = query.toLowerCase();
    
    return countries.filter(country => 
      country.country.toLowerCase().includes(lowercaseQuery) ||
      country.currency.toLowerCase().includes(lowercaseQuery) ||
      country.name.toLowerCase().includes(lowercaseQuery)
    );
  }

  private getFallbackCountries(): CountryCurrency[] {
    return [
      { country: "United States", currency: "USD", symbol: "$", name: "US Dollar" },
      { country: "European Union", currency: "EUR", symbol: "€", name: "Euro" },
      { country: "United Kingdom", currency: "GBP", symbol: "£", name: "British Pound" },
      { country: "Japan", currency: "JPY", symbol: "¥", name: "Japanese Yen" },
      { country: "Canada", currency: "CAD", symbol: "C$", name: "Canadian Dollar" },
      { country: "Australia", currency: "AUD", symbol: "A$", name: "Australian Dollar" },
      { country: "Switzerland", currency: "CHF", symbol: "CHF", name: "Swiss Franc" },
      { country: "China", currency: "CNY", symbol: "¥", name: "Chinese Yuan" },
      { country: "India", currency: "INR", symbol: "₹", name: "Indian Rupee" },
      { country: "Brazil", currency: "BRL", symbol: "R$", name: "Brazilian Real" },
      { country: "Mexico", currency: "MXN", symbol: "$", name: "Mexican Peso" },
      { country: "Singapore", currency: "SGD", symbol: "S$", name: "Singapore Dollar" },
      { country: "Hong Kong", currency: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
      { country: "New Zealand", currency: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
      { country: "Sweden", currency: "SEK", symbol: "kr", name: "Swedish Krona" },
      { country: "Norway", currency: "NOK", symbol: "kr", name: "Norwegian Krone" },
      { country: "Denmark", currency: "DKK", symbol: "kr", name: "Danish Krone" },
      { country: "Poland", currency: "PLN", symbol: "zł", name: "Polish Zloty" },
      { country: "Czech Republic", currency: "CZK", symbol: "Kč", name: "Czech Koruna" },
      { country: "Hungary", currency: "HUF", symbol: "Ft", name: "Hungarian Forint" },
      { country: "Russia", currency: "RUB", symbol: "₽", name: "Russian Ruble" },
      { country: "South Africa", currency: "ZAR", symbol: "R", name: "South African Rand" },
      { country: "South Korea", currency: "KRW", symbol: "₩", name: "South Korean Won" },
      { country: "Thailand", currency: "THB", symbol: "฿", name: "Thai Baht" },
      { country: "Malaysia", currency: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
      { country: "Philippines", currency: "PHP", symbol: "₱", name: "Philippine Peso" },
      { country: "Indonesia", currency: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
      { country: "Vietnam", currency: "VND", symbol: "₫", name: "Vietnamese Dong" },
      { country: "Turkey", currency: "TRY", symbol: "₺", name: "Turkish Lira" },
      { country: "Israel", currency: "ILS", symbol: "₪", name: "Israeli Shekel" },
      { country: "United Arab Emirates", currency: "AED", symbol: "د.إ", name: "UAE Dirham" },
      { country: "Saudi Arabia", currency: "SAR", symbol: "﷼", name: "Saudi Riyal" },
      { country: "Qatar", currency: "QAR", symbol: "﷼", name: "Qatari Riyal" },
      { country: "Kuwait", currency: "KWD", symbol: "د.ك", name: "Kuwaiti Dinar" },
      { country: "Bahrain", currency: "BHD", symbol: "د.ب", name: "Bahraini Dinar" },
      { country: "Oman", currency: "OMR", symbol: "﷼", name: "Omani Rial" },
      { country: "Jordan", currency: "JOD", symbol: "د.ا", name: "Jordanian Dinar" },
      { country: "Lebanon", currency: "LBP", symbol: "ل.ل", name: "Lebanese Pound" },
      { country: "Egypt", currency: "EGP", symbol: "£", name: "Egyptian Pound" },
      { country: "Morocco", currency: "MAD", symbol: "د.م.", name: "Moroccan Dirham" },
      { country: "Tunisia", currency: "TND", symbol: "د.ت", name: "Tunisian Dinar" },
      { country: "Algeria", currency: "DZD", symbol: "د.ج", name: "Algerian Dinar" },
      { country: "Nigeria", currency: "NGN", symbol: "₦", name: "Nigerian Naira" },
      { country: "Ghana", currency: "GHS", symbol: "₵", name: "Ghanaian Cedi" },
      { country: "Kenya", currency: "KES", symbol: "KSh", name: "Kenyan Shilling" },
      { country: "Uganda", currency: "UGX", symbol: "USh", name: "Ugandan Shilling" },
      { country: "Tanzania", currency: "TZS", symbol: "TSh", name: "Tanzanian Shilling" },
      { country: "Ethiopia", currency: "ETB", symbol: "Br", name: "Ethiopian Birr" },
      { country: "Zambia", currency: "ZMW", symbol: "ZK", name: "Zambian Kwacha" },
      { country: "Botswana", currency: "BWP", symbol: "P", name: "Botswana Pula" },
      { country: "Swaziland", currency: "SZL", symbol: "L", name: "Swazi Lilangeni" },
      { country: "Lesotho", currency: "LSL", symbol: "L", name: "Lesotho Loti" },
      { country: "Namibia", currency: "NAD", symbol: "N$", name: "Namibian Dollar" },
      { country: "Mauritius", currency: "MUR", symbol: "₨", name: "Mauritian Rupee" },
      { country: "Seychelles", currency: "SCR", symbol: "₨", name: "Seychellois Rupee" },
      { country: "Maldives", currency: "MVR", symbol: "ރ", name: "Maldivian Rufiyaa" },
      { country: "Sri Lanka", currency: "LKR", symbol: "₨", name: "Sri Lankan Rupee" },
      { country: "Bangladesh", currency: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
      { country: "Pakistan", currency: "PKR", symbol: "₨", name: "Pakistani Rupee" },
      { country: "Afghanistan", currency: "AFN", symbol: "؋", name: "Afghan Afghani" },
      { country: "Nepal", currency: "NPR", symbol: "₨", name: "Nepalese Rupee" },
      { country: "Bhutan", currency: "BTN", symbol: "Nu.", name: "Bhutanese Ngultrum" }
    ];
  }
}

export const countryService = new CountryService();
