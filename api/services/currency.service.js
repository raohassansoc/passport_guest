const axios = require("axios");
const Sentry = require("@sentry/node");

const currencyConvert = async (symbol, quote_currency) => {
  let data;
  try {
    const options = {
      url: `https://nomics.com/data/currencies-ticker?filter=any&include-fiat=true&interval=1d&symbols=${symbol}&quote-currency=${quote_currency}`,
      method: "GET",
    };
    data = await axios(options);
  } catch (error) {
    Sentry.captureException(error);
    return (data = error);
  }
  return data;
};

module.exports = {
  currencyConvert,
};
