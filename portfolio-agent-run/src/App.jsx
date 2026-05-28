import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "portfolio-agent-v4";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const GROWW_API_URL = "https://api.groww.in/v1";

const env = import.meta.env;
const inferredGrowwAccessToken =
  env.VITE_GROWW_ACCESS_TOKEN ||
  (env.VITE_GROWW_API_KEY && !env.VITE_GROWW_API_SECRET ? env.VITE_GROWW_API_KEY : "");

const CONFIG = {
  aiProvider: (env.VITE_AI_PROVIDER || "groq").toLowerCase(),
  groqApiKey: env.VITE_GROQ_API_KEY || "",
  geminiApiKey: env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || "",
  anthropicApiKey: env.VITE_ANTHROPIC_API_KEY || env.ANTHROPIC_API_KEY || "",
  marketDataProvider: (env.VITE_MARKET_DATA_PROVIDER || "").toLowerCase(),
  growwAccessToken: inferredGrowwAccessToken,
  growwApiKey: env.VITE_GROWW_API_KEY || "",
  growwApiSecret: env.VITE_GROWW_API_SECRET || "",
  fmpApiKey: env.VITE_FMP_API_KEY || "",
  twelveDataApiKey: env.VITE_TWELVE_DATA_API_KEY || "",
};

let growwTokenCache = {
  token: "",
  expiryMs: 0,
};

const SAMPLE_PORTFOLIO = [
  {
    id: 1,
    ticker: "TCS",
    exchange: "NSE",
    name: "Tata Consultancy Services",
    qty: 3,
    avgPrice: 3800,
    currency: "INR",
  },
  {
    id: 2,
    ticker: "AAPL",
    exchange: "NASDAQ",
    name: "Apple Inc.",
    qty: 2,
    avgPrice: 185,
    currency: "USD",
  },
];

const BUY_SIGNAL = {
  STRONG_BUY: { label: "Strong Buy", color: "#00e676", bg: "#00e67614", icon: "SB" },
  BUY: { label: "Buy", color: "#69f0ae", bg: "#69f0ae12", icon: "B" },
  ACCUMULATE: { label: "Accumulate", color: "#40c4ff", bg: "#40c4ff12", icon: "A" },
  HOLD: { label: "Hold", color: "#ffd740", bg: "#ffd74012", icon: "H" },
  WAIT_FOR_DIP: { label: "Wait for Dip", color: "#ff9100", bg: "#ff910012", icon: "W" },
  AVOID: { label: "Avoid", color: "#ff1744", bg: "#ff174412", icon: "X" },
};

const VALUATION_COLOR = {
  DEEPLY_UNDERVALUED: "#00e676",
  UNDERVALUED: "#69f0ae",
  FAIRLY_VALUED: "#ffd740",
  SLIGHTLY_OVERVALUED: "#ff9100",
  OVERVALUED: "#ff1744",
};

const VALUATION_LABEL = {
  DEEPLY_UNDERVALUED: "Deeply Undervalued",
  UNDERVALUED: "Undervalued",
  FAIRLY_VALUED: "Fair Value",
  SLIGHTLY_OVERVALUED: "Slightly Rich",
  OVERVALUED: "Overvalued",
};

const GROWTH_META = {
  STRONG_10Y: { label: "Strong 10Y", color: "#00e676" },
  MODERATE_5Y: { label: "Moderate 5Y", color: "#ffd740" },
  LIMITED: { label: "Limited", color: "#ff9100" },
  DECLINING: { label: "Declining", color: "#ff1744" },
};

const RISK_COLOR = { HIGH: "#ff1744", MEDIUM: "#ff9100", LOW: "#69f0ae" };

function hasAiKey() {
  if (CONFIG.aiProvider === "groq") return Boolean(CONFIG.groqApiKey);
  if (CONFIG.aiProvider === "gemini") return Boolean(CONFIG.geminiApiKey);
  if (CONFIG.aiProvider === "anthropic") return Boolean(CONFIG.anthropicApiKey);
  return false;
}

function detectMarketProvider() {
  if (CONFIG.marketDataProvider) return CONFIG.marketDataProvider;
  if (CONFIG.growwAccessToken || (CONFIG.growwApiKey && CONFIG.growwApiSecret)) return "groww";
  if (CONFIG.fmpApiKey) return "fmp";
  if (CONFIG.twelveDataApiKey) return "twelvedata";
  return "none";
}

function getSymbolForProvider(stock, provider) {
  if (provider === "fmp") {
    if (stock.exchange === "NSE") return `${stock.ticker}.NS`;
    if (stock.exchange === "BSE") return `${stock.ticker}.BO`;
    return stock.ticker;
  }

  if (provider === "twelvedata") {
    if (stock.exchange === "NSE") return `${stock.ticker}:NSE`;
    if (stock.exchange === "BSE") return `${stock.ticker}:BSE`;
    return stock.ticker;
  }

  return stock.ticker;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function pickNumber(...values) {
  for (const value of values) {
    const num = toNumber(value);
    if (num !== null) return num;
  }
  return null;
}

function formatDateTime(value) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return null;
  }
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Non-JSON response from ${url}`);
  }

  if (!res.ok) {
    throw new Error(data?.error?.message || data?.message || `${res.status} ${res.statusText}`);
  }

  return data;
}

async function sha256Hex(value) {
  const encoded = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function normalizeFmpPayload(payload) {
  if (Array.isArray(payload)) return payload[0] || null;
  return payload || null;
}

function isIndiaExchange(stock) {
  return stock.exchange === "NSE" || stock.exchange === "BSE";
}

function hasGrowwCredentials() {
  return Boolean(CONFIG.growwAccessToken || (CONFIG.growwApiKey && CONFIG.growwApiSecret));
}

function isFmpPlanRestriction(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("premium query parameter") ||
    message.includes("current subscription") ||
    message.includes("special endpoint") ||
    message.includes("not available under your current subscription")
  );
}

function isTwelveDataPlanRestriction(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("grow or venture plan") ||
    message.includes("consider upgrading now") ||
    message.includes("available starting with the grow") ||
    message.includes("status\":\"error")
  );
}

function isGrowwUnsupportedMarket(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("invalid trading symbol") ||
    message.includes("requested entity does not exist") ||
    message.includes("user not authorised") ||
    message.includes("groww currently supports indian nse/bse cash symbols only")
  );
}

async function getGrowwAccessToken() {
  if (CONFIG.growwAccessToken) {
    return CONFIG.growwAccessToken;
  }

  if (growwTokenCache.token && growwTokenCache.expiryMs > Date.now() + 60_000) {
    return growwTokenCache.token;
  }

  if (!CONFIG.growwApiKey || !CONFIG.growwApiSecret) {
    throw new Error(
      "Groww credentials are missing. Add VITE_GROWW_ACCESS_TOKEN, or add VITE_GROWW_API_KEY and VITE_GROWW_API_SECRET.",
    );
  }

  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const checksum = await sha256Hex(`${CONFIG.growwApiSecret}${timestamp}`);
  const data = await fetchJson(`${GROWW_API_URL}/token/api/access`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.growwApiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      key_type: "approval",
      checksum,
      timestamp,
    }),
  });

  if (!data?.token) {
    throw new Error("Groww did not return an access token.");
  }

  growwTokenCache = {
    token: data.token,
    expiryMs: data?.expiry ? new Date(data.expiry).getTime() : Date.now() + 8 * 60 * 60 * 1000,
  };

  return data.token;
}

async function fetchGrowwJson(path) {
  const useProxy = import.meta.env.DEV;
  const url = useProxy ? `/groww-proxy${path}` : `${GROWW_API_URL}${path}`;
  const headers = {
    Accept: "application/json",
    "X-API-VERSION": "1.0",
  };

  if (!useProxy) {
    const token = await getGrowwAccessToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const data = await fetchJson(url, { headers });

  if (data?.status === "FAILURE") {
    throw new Error(data?.error?.message || "Groww request failed.");
  }

  return data?.payload ?? data;
}

async function fetchGrowwSnapshot(stock) {
  if (!isIndiaExchange(stock)) {
    throw new Error("Groww currently supports Indian NSE/BSE cash symbols only in this app.");
  }

  const payload = await fetchGrowwJson(
    `/live-data/quote?exchange=${encodeURIComponent(stock.exchange)}&segment=CASH&trading_symbol=${encodeURIComponent(stock.ticker)}`,
  );

  const ohlc = payload?.ohlc && typeof payload.ohlc === "object" ? payload.ohlc : null;

  return {
    provider: "groww",
    providerLabel: "Groww",
    symbol: `${stock.exchange}:${stock.ticker}`,
    currentPrice: pickNumber(payload?.last_price, payload?.ltp),
    previousClose: pickNumber(payload?.close, ohlc?.close),
    changePercent: pickNumber(payload?.day_change_perc),
    dayHigh: pickNumber(payload?.high, payload?.high_trade_range, ohlc?.high),
    dayLow: pickNumber(payload?.low, payload?.low_trade_range, ohlc?.low),
    yearHigh: pickNumber(payload?.week_52_high),
    yearLow: pickNumber(payload?.week_52_low),
    marketCap: pickNumber(payload?.market_cap),
    pe: null,
    pb: null,
    roe: null,
    debtEquity: null,
    revenueGrowth: null,
    epsGrowth: null,
    fcfPositive: null,
    fetchedAt: new Date().toISOString(),
    warnings: [
      "Groww quote data is being used for Indian market prices.",
      "Fundamentals are not included in the Groww live-data quote response.",
    ],
  };
}

async function fetchGrowwQuote(stock) {
  if (!isIndiaExchange(stock)) {
    throw new Error("Groww currently supports Indian NSE/BSE cash symbols only in this app.");
  }

  const payload = await fetchGrowwJson(
    `/live-data/ltp?segment=CASH&exchange_symbols=${encodeURIComponent(`${stock.exchange}_${stock.ticker}`)}`,
  );
  const key = `${stock.exchange}_${stock.ticker}`;

  return buildQuoteOnlySnapshot({
    provider: "groww",
    providerLabel: "Groww",
    symbol: `${stock.exchange}:${stock.ticker}`,
    currentPrice: pickNumber(payload?.[key]),
    warnings: ["Live quote refresh is using Groww LTP data."],
  });
}

function buildQuoteOnlySnapshot(base) {
  return {
    provider: base.provider,
    providerLabel: base.providerLabel,
    symbol: base.symbol,
    currentPrice: base.currentPrice,
    previousClose: base.previousClose ?? null,
    changePercent: base.changePercent ?? null,
    dayHigh: base.dayHigh ?? null,
    dayLow: base.dayLow ?? null,
    yearHigh: null,
    yearLow: null,
    marketCap: null,
    pe: null,
    pb: null,
    roe: null,
    debtEquity: null,
    revenueGrowth: null,
    epsGrowth: null,
    fcfPositive: null,
    fetchedAt: new Date().toISOString(),
    warnings: base.warnings || [],
    quoteOnly: true,
  };
}

async function fetchFmpQuote(stock) {
  if (!CONFIG.fmpApiKey) {
    throw new Error("VITE_FMP_API_KEY is missing.");
  }

  const symbol = getSymbolForProvider(stock, "fmp");
  const apikey = encodeURIComponent(CONFIG.fmpApiKey);
  const quoteUrl = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apikey}`;
  const quoteRaw = await fetchJson(quoteUrl);
  const quote = normalizeFmpPayload(quoteRaw);

  if (!quote) {
    throw new Error("FMP did not return a quote for this symbol.");
  }

  return buildQuoteOnlySnapshot({
    provider: "fmp",
    providerLabel: "Financial Modeling Prep",
    symbol,
    currentPrice: pickNumber(quote.price),
    previousClose: pickNumber(quote.previousClose),
    changePercent: pickNumber(quote.changesPercentage, quote.changePercentage),
    dayHigh: pickNumber(quote.dayHigh, quote.high),
    dayLow: pickNumber(quote.dayLow, quote.low),
  });
}

async function fetchTwelveDataQuote(stock) {
  if (!CONFIG.twelveDataApiKey) {
    throw new Error("VITE_TWELVE_DATA_API_KEY is missing.");
  }

  const symbol = getSymbolForProvider(stock, "twelvedata");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(CONFIG.twelveDataApiKey)}`;
  const data = await fetchJson(url);

  if (data.status === "error") {
    throw new Error(data.message || "Twelve Data returned an error.");
  }

  return buildQuoteOnlySnapshot({
    provider: "twelvedata",
    providerLabel: "Twelve Data",
    symbol,
    currentPrice: pickNumber(data.close, data.price),
    previousClose: pickNumber(data.previous_close),
    changePercent: pickNumber(data.percent_change),
    dayHigh: pickNumber(data.high),
    dayLow: pickNumber(data.low),
    warnings: ["Live quote refresh is using the quote-only endpoint."],
  });
}

async function fetchFmpSnapshot(stock) {
  if (!CONFIG.fmpApiKey) {
    throw new Error("VITE_FMP_API_KEY is missing.");
  }

  const symbol = getSymbolForProvider(stock, "fmp");
  const apikey = encodeURIComponent(CONFIG.fmpApiKey);

  const quoteUrl = `https://financialmodelingprep.com/stable/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apikey}`;
  const ratiosUrl = `https://financialmodelingprep.com/stable/ratios-ttm?symbol=${encodeURIComponent(symbol)}&apikey=${apikey}`;
  const metricsUrl = `https://financialmodelingprep.com/stable/key-metrics-ttm?symbol=${encodeURIComponent(symbol)}&apikey=${apikey}`;
  const growthUrl = `https://financialmodelingprep.com/stable/income-statement-growth?symbol=${encodeURIComponent(symbol)}&limit=4&apikey=${apikey}`;

  const [quoteRaw, ratiosRaw, metricsRaw, growthRaw] = await Promise.allSettled([
    fetchJson(quoteUrl),
    fetchJson(ratiosUrl),
    fetchJson(metricsUrl),
    fetchJson(growthUrl),
  ]);

  const quote = quoteRaw.status === "fulfilled" ? normalizeFmpPayload(quoteRaw.value) : null;
  const ratios = ratiosRaw.status === "fulfilled" ? normalizeFmpPayload(ratiosRaw.value) : null;
  const metrics = metricsRaw.status === "fulfilled" ? normalizeFmpPayload(metricsRaw.value) : null;
  const growthRows =
    growthRaw.status === "fulfilled"
      ? Array.isArray(growthRaw.value)
        ? growthRaw.value
        : growthRaw.value
          ? [growthRaw.value]
          : []
      : [];

  if (!quote) {
    if (quoteRaw.status === "rejected") {
      throw quoteRaw.reason;
    }
    throw new Error("FMP did not return a quote for this symbol.");
  }

  const revenueGrowthSeries = growthRows
    .map((row) => pickNumber(row.revenueGrowth, row.growthRevenue, row.revenueGrowthRatio))
    .filter((value) => value !== null);
  const epsGrowthSeries = growthRows
    .map((row) => pickNumber(row.epsgrowth, row.epsGrowth, row.growthEPS))
    .filter((value) => value !== null);

  const revenueGrowth =
    revenueGrowthSeries.length > 0
      ? revenueGrowthSeries.reduce((sum, value) => sum + value, 0) / revenueGrowthSeries.length
      : null;
  const epsGrowth =
    epsGrowthSeries.length > 0
      ? epsGrowthSeries.reduce((sum, value) => sum + value, 0) / epsGrowthSeries.length
      : null;

  return {
    provider: "fmp",
    providerLabel: "Financial Modeling Prep",
    symbol,
    currentPrice: pickNumber(quote.price),
    previousClose: pickNumber(quote.previousClose),
    changePercent: pickNumber(quote.changesPercentage, quote.changePercentage),
    dayHigh: pickNumber(quote.dayHigh, quote.high),
    dayLow: pickNumber(quote.dayLow, quote.low),
    yearHigh: pickNumber(quote.yearHigh),
    yearLow: pickNumber(quote.yearLow),
    marketCap: pickNumber(quote.marketCap),
    pe: pickNumber(
      quote.pe,
      quote.priceEarningsRatio,
      ratios?.priceEarningsRatioTTM,
      metrics?.peRatioTTM,
    ),
    pb: pickNumber(
      quote.priceToBookRatio,
      ratios?.priceToBookRatioTTM,
      metrics?.pbRatioTTM,
    ),
    roe: pickNumber(
      ratios?.returnOnEquityTTM,
      metrics?.roeTTM,
      metrics?.returnOnEquityTTM,
    ),
    debtEquity: pickNumber(ratios?.debtEquityRatioTTM, ratios?.debtEquityRatio),
    revenueGrowth: revenueGrowth !== null ? revenueGrowth * 100 : null,
    epsGrowth: epsGrowth !== null ? epsGrowth * 100 : null,
    fcfPositive: (() => {
      const fcfPerShare = pickNumber(metrics?.freeCashFlowPerShareTTM, metrics?.freeCashFlowPerShare);
      return fcfPerShare === null ? null : fcfPerShare > 0;
    })(),
    fetchedAt: new Date().toISOString(),
    warnings: [
      ratiosRaw.status === "rejected" ? "Ratios unavailable on current FMP plan." : null,
      metricsRaw.status === "rejected" ? "Key metrics unavailable on current FMP plan." : null,
      growthRaw.status === "rejected" ? "Growth data unavailable on current FMP plan." : null,
    ].filter(Boolean),
  };
}

async function fetchTwelveDataSnapshot(stock) {
  if (!CONFIG.twelveDataApiKey) {
    throw new Error("VITE_TWELVE_DATA_API_KEY is missing.");
  }

  const symbol = getSymbolForProvider(stock, "twelvedata");
  const url = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(CONFIG.twelveDataApiKey)}`;
  const data = await fetchJson(url);

  if (data.status === "error") {
    throw new Error(data.message || "Twelve Data returned an error.");
  }

  return {
    provider: "twelvedata",
    providerLabel: "Twelve Data",
    symbol,
    currentPrice: pickNumber(data.close, data.price),
    previousClose: pickNumber(data.previous_close),
    changePercent: pickNumber(data.percent_change),
    dayHigh: pickNumber(data.high),
    dayLow: pickNumber(data.low),
    yearHigh: null,
    yearLow: null,
    marketCap: null,
    pe: null,
    pb: null,
    roe: null,
    debtEquity: null,
    revenueGrowth: null,
    epsGrowth: null,
    fcfPositive: null,
    fetchedAt: new Date().toISOString(),
    warnings: [
      "Fundamentals are not included in the free Twelve Data quote endpoint.",
    ],
  };
}

async function fetchMarketSnapshot(stock) {
  const preferred = detectMarketProvider();

  if (preferred === "groww") {
    if (isIndiaExchange(stock)) {
      return fetchGrowwSnapshot(stock);
    }

    if (CONFIG.fmpApiKey || CONFIG.twelveDataApiKey) {
      if (CONFIG.fmpApiKey) {
        return fetchFmpSnapshot(stock);
      }
      return fetchTwelveDataSnapshot(stock);
    }

    throw new Error(
      "Groww is configured for Indian stocks. Add FMP or Twelve Data as a fallback provider for U.S. symbols.",
    );
  }

  if (preferred === "fmp") {
    try {
      return await fetchFmpSnapshot(stock);
    } catch (error) {
      if (isIndiaExchange(stock) && isFmpPlanRestriction(error)) {
        if (CONFIG.twelveDataApiKey) {
          try {
            return await fetchTwelveDataSnapshot(stock);
          } catch (fallbackError) {
            if (isTwelveDataPlanRestriction(fallbackError)) {
              throw new Error(
                "Indian quotes are not enabled on the current keys. FMP blocks NSE/BSE on this plan, and the current Twelve Data key requires Grow or Venture for symbols like TCS:NSE.",
              );
            }

            throw fallbackError;
          }
        }

        throw new Error(
          "Your FMP key can fetch U.S. quotes, but NSE/BSE quotes are blocked on the current FMP plan. Add VITE_TWELVE_DATA_API_KEY for Indian stocks or upgrade the FMP subscription.",
        );
      }

      throw error;
    }
  }

  if (preferred === "twelvedata") return fetchTwelveDataSnapshot(stock);

  if (hasGrowwCredentials() && isIndiaExchange(stock)) {
    return fetchGrowwSnapshot(stock);
  }

  if (CONFIG.fmpApiKey) {
    try {
      return await fetchFmpSnapshot(stock);
    } catch (error) {
      if (isIndiaExchange(stock) && isFmpPlanRestriction(error) && CONFIG.twelveDataApiKey) {
        try {
          return await fetchTwelveDataSnapshot(stock);
        } catch (fallbackError) {
          if (isTwelveDataPlanRestriction(fallbackError)) {
            throw new Error(
              "Indian quotes are not enabled on the current keys. FMP blocks NSE/BSE on this plan, and the current Twelve Data key requires Grow or Venture for symbols like TCS:NSE.",
            );
          }

          throw fallbackError;
        }
      }

      if (isIndiaExchange(stock) && isFmpPlanRestriction(error)) {
        throw new Error(
          "Your FMP key can fetch U.S. quotes, but NSE/BSE quotes are blocked on the current FMP plan. Add VITE_TWELVE_DATA_API_KEY for Indian stocks or upgrade the FMP subscription.",
        );
      }

      throw error;
    }
  }
  if (CONFIG.twelveDataApiKey) return fetchTwelveDataSnapshot(stock);

  throw new Error(
    "No market data API configured. Add VITE_FMP_API_KEY or VITE_TWELVE_DATA_API_KEY to .env.local.",
  );
}

async function fetchMarketQuote(stock) {
  const preferred = detectMarketProvider();

  if (preferred === "groww") {
    if (isIndiaExchange(stock)) {
      return fetchGrowwQuote(stock);
    }

    if (CONFIG.fmpApiKey || CONFIG.twelveDataApiKey) {
      if (CONFIG.fmpApiKey) {
        return fetchFmpQuote(stock);
      }
      return fetchTwelveDataQuote(stock);
    }

    throw new Error(
      "Groww is configured for Indian stocks. Add FMP or Twelve Data as a fallback provider for U.S. symbols.",
    );
  }

  if (preferred === "fmp") {
    try {
      return await fetchFmpQuote(stock);
    } catch (error) {
      if (isIndiaExchange(stock) && isFmpPlanRestriction(error)) {
        if (CONFIG.twelveDataApiKey) {
          try {
            return await fetchTwelveDataQuote(stock);
          } catch (fallbackError) {
            if (isTwelveDataPlanRestriction(fallbackError)) {
              throw new Error(
                "Indian quotes are not enabled on the current keys. FMP blocks NSE/BSE on this plan, and the current Twelve Data key requires Grow or Venture for symbols like TCS:NSE.",
              );
            }

            throw fallbackError;
          }
        }

        throw new Error(
          "Your FMP key can fetch U.S. quotes, but NSE/BSE quotes are blocked on the current FMP plan. Add VITE_TWELVE_DATA_API_KEY for Indian stocks or upgrade the FMP subscription.",
        );
      }

      throw error;
    }
  }

  if (preferred === "twelvedata") return fetchTwelveDataQuote(stock);

  if (hasGrowwCredentials() && isIndiaExchange(stock)) {
    return fetchGrowwQuote(stock);
  }

  if (CONFIG.fmpApiKey) {
    try {
      return await fetchFmpQuote(stock);
    } catch (error) {
      if (isIndiaExchange(stock) && isFmpPlanRestriction(error) && CONFIG.twelveDataApiKey) {
        try {
          return await fetchTwelveDataQuote(stock);
        } catch (fallbackError) {
          if (isTwelveDataPlanRestriction(fallbackError)) {
            throw new Error(
              "Indian quotes are not enabled on the current keys. FMP blocks NSE/BSE on this plan, and the current Twelve Data key requires Grow or Venture for symbols like TCS:NSE.",
            );
          }

          throw fallbackError;
        }
      }

      if (isIndiaExchange(stock) && isFmpPlanRestriction(error)) {
        throw new Error(
          "Your FMP key can fetch U.S. quotes, but NSE/BSE quotes are blocked on the current FMP plan. Add VITE_TWELVE_DATA_API_KEY for Indian stocks or upgrade the FMP subscription.",
        );
      }

      throw error;
    }
  }

  if (CONFIG.twelveDataApiKey) return fetchTwelveDataQuote(stock);

  throw new Error(
    "No market data API configured. Add VITE_FMP_API_KEY or VITE_TWELVE_DATA_API_KEY to .env.local.",
  );
}

async function callGroq(system, user) {
  const data = await fetchJson(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CONFIG.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from Groq.");
  return text;
}

async function callGemini(system, user) {
  const data = await fetchJson(GEMINI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": CONFIG.geminiApiKey,
    },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((part) => part.text).filter(Boolean).join("") || "";
  if (!text) throw new Error("Empty response from Gemini.");
  return text;
}

async function callClaude(system, user) {
  const data = await fetchJson(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.anthropicApiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  const text = Array.isArray(data?.content)
    ? data.content.filter((block) => block.type === "text").map((block) => block.text).join("\n")
    : "";
  if (!text) throw new Error("Empty response from Anthropic.");
  return text;
}

function getValuation(pe, pb) {
  if (pe === null && pb === null) return "FAIRLY_VALUED";
  if ((pe !== null && pe <= 12) || (pb !== null && pb <= 1.6)) return "DEEPLY_UNDERVALUED";
  if ((pe !== null && pe <= 20) || (pb !== null && pb <= 3)) return "UNDERVALUED";
  if ((pe !== null && pe <= 30) || (pb !== null && pb <= 6)) return "FAIRLY_VALUED";
  if ((pe !== null && pe <= 45) || (pb !== null && pb <= 10)) return "SLIGHTLY_OVERVALUED";
  return "OVERVALUED";
}

function getGrowthRunway(snapshot) {
  const revenueGrowth = snapshot.revenueGrowth;
  const roe = snapshot.roe;

  if ((revenueGrowth ?? -999) >= 12 && (roe ?? -999) >= 15) return "STRONG_10Y";
  if ((revenueGrowth ?? -999) >= 5 && (roe ?? -999) >= 10) return "MODERATE_5Y";
  if ((revenueGrowth ?? 999) < 0) return "DECLINING";
  return "LIMITED";
}

function buildFallbackAnalysis(stock, snapshot) {
  const currentPrice = snapshot.currentPrice;
  if (currentPrice === null) {
    throw new Error("Market data source did not return a usable current price.");
  }

  const priceVsAvg = ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100;
  const valuation = getValuation(snapshot.pe, snapshot.pb);
  const growthRunway = getGrowthRunway(snapshot);
  const highDebt = snapshot.debtEquity !== null && snapshot.debtEquity > 1.5;
  const weakCash = snapshot.fcfPositive === false;

  let buySignal = "HOLD";
  if (valuation === "DEEPLY_UNDERVALUED" && !highDebt && !weakCash) buySignal = "STRONG_BUY";
  else if (valuation === "UNDERVALUED" && !highDebt) buySignal = "BUY";
  else if (valuation === "FAIRLY_VALUED" && !highDebt) buySignal = "ACCUMULATE";
  else if (valuation === "SLIGHTLY_OVERVALUED") buySignal = "WAIT_FOR_DIP";
  else if (valuation === "OVERVALUED" || highDebt || weakCash) buySignal = "AVOID";

  const risks = [];
  if (highDebt) {
    risks.push({
      risk: "Balance sheet leverage is elevated",
      severity: "HIGH",
      impact: "Higher leverage can compress valuation and reduce flexibility during downturns.",
    });
  }
  if (weakCash) {
    risks.push({
      risk: "Free cash flow is not clearly positive",
      severity: "MEDIUM",
      impact: "Weak cash conversion reduces the margin of safety for long-term compounding.",
    });
  }
  if (snapshot.pe !== null && snapshot.pe > 35) {
    risks.push({
      risk: "Valuation leaves limited room for execution misses",
      severity: "MEDIUM",
      impact: "Even good businesses can underperform when bought at a stretched multiple.",
    });
  }
  if (!risks.length) {
    risks.push({
      risk: "The business still needs steady execution to justify long-term accumulation",
      severity: "LOW",
      impact: "A durable moat matters only if revenue, margins, and capital allocation remain disciplined.",
    });
  }

  const valuationNoteMap = {
    DEEPLY_UNDERVALUED: "Available metrics imply a wide margin of safety versus a typical high-quality compounder.",
    UNDERVALUED: "Current multiples look reasonable relative to the available profitability profile.",
    FAIRLY_VALUED: "The stock looks broadly in line with the business quality shown by the available data.",
    SLIGHTLY_OVERVALUED: "Quality may be acceptable, but the entry point is not especially forgiving.",
    OVERVALUED: "Current valuation looks aggressive relative to the business snapshot available.",
  };

  return {
    currentPrice,
    analystTarget:
      valuation === "DEEPLY_UNDERVALUED" || valuation === "UNDERVALUED"
        ? Number((currentPrice * 1.12).toFixed(2))
        : null,
    priceVsAvg,
    fundamentals: {
      pe: snapshot.pe,
      pb: snapshot.pb,
      roe: snapshot.roe,
      debtEquity: snapshot.debtEquity,
      revenueGrowth: snapshot.revenueGrowth,
      epsGrowth: snapshot.epsGrowth,
      peVsSector:
        snapshot.pe === null
          ? "UNKNOWN"
          : snapshot.pe <= 20
            ? "CHEAP"
            : snapshot.pe <= 30
              ? "FAIR"
              : "EXPENSIVE",
      fcfPositive: snapshot.fcfPositive,
    },
    valuation,
    valuationNote: valuationNoteMap[valuation],
    supportZones: [
      {
        level: Number((currentPrice * 0.97).toFixed(2)),
        strength: "MODERATE",
        note: "A first pullback zone around 3% below the latest traded price.",
      },
      {
        level: Number((currentPrice * 0.92).toFixed(2)),
        strength: "STRONG",
        note: "A deeper accumulation zone around 8% below the latest traded price.",
      },
    ],
    buySignal,
    buySignalReason:
      buySignal === "STRONG_BUY" || buySignal === "BUY"
        ? "The current valuation is supportive and the available balance-sheet signals are acceptable. Daily accumulation is reasonable if position sizing stays small."
        : buySignal === "ACCUMULATE"
          ? "The stock is not obviously cheap, but it is still within a workable long-term accumulation range. Spread entries over time instead of forcing size in one go."
          : buySignal === "WAIT_FOR_DIP"
            ? "The business may still be sound, but the current setup does not offer enough entry comfort. Prefer adding only on pullbacks toward support."
            : buySignal === "AVOID"
              ? "Available metrics do not offer enough margin of safety right now. Preserve cash for cleaner setups or better prices."
              : "The setup is mixed, so patience is reasonable until either valuation or business momentum improves.",
    sipAdvice:
      buySignal === "STRONG_BUY" || buySignal === "BUY"
        ? "Continue daily SIP-style accumulation in small amounts while keeping dry powder for sharper dips."
        : buySignal === "ACCUMULATE"
          ? "Keep the SIP running, but reduce the pace and reserve some capital for lower support zones."
          : buySignal === "WAIT_FOR_DIP"
            ? "Pause aggressive buying and wait for pullbacks near the listed support levels."
            : "Do not average blindly. Reassess after the next price reset or stronger fundamentals.",
    moat:
      `${stock.name} should only be treated as a long-term compounder if it can maintain pricing power, customer stickiness, and disciplined capital allocation. This fallback note is based on quantitative snapshot data, not a live competitive deep-dive.`,
    risks,
    growthRunway,
    growthNote:
      growthRunway === "STRONG_10Y"
        ? "Recent growth and profitability signals support a credible long-duration runway if execution remains disciplined."
        : growthRunway === "MODERATE_5Y"
          ? "The business still shows a usable growth path, but the runway looks more moderate than exceptional."
          : growthRunway === "DECLINING"
            ? "Current growth signals are weak enough that the long-term thesis needs more proof before adding aggressively."
            : "Growth visibility is limited with the current dataset, so future compounding should not be assumed.",
    longTermVerdict:
      "This verdict is generated from fetched market data and deterministic rules, not from invented live research. Use it as a triage layer before doing deeper fundamental work.",
    dataSource: snapshot.providerLabel,
    fetchedAt: snapshot.fetchedAt,
    warnings: snapshot.warnings || [],
  };
}

const AI_SYSTEM = `You are a disciplined long-term equity analyst.
Use only the structured market data provided by the user.
Do not invent news, quotes, analyst targets, sector averages, or support levels from outside the prompt.
If a metric is missing, leave it null and acknowledge the limitation.
Return valid JSON only with the exact schema requested.`;

async function generateAiAnalysis(stock, snapshot) {
  const prompt = `Analyze this stock for a small daily accumulation strategy.

Stock:
${JSON.stringify(stock, null, 2)}

Fetched market snapshot:
${JSON.stringify(snapshot, null, 2)}

Return exactly this JSON schema:
{
  "currentPrice": <number>,
  "analystTarget": <number or null>,
  "priceVsAvg": <number>,
  "fundamentals": {
    "pe": <number or null>,
    "pb": <number or null>,
    "roe": <number or null>,
    "debtEquity": <number or null>,
    "revenueGrowth": <number or null>,
    "epsGrowth": <number or null>,
    "peVsSector": "CHEAP" or "FAIR" or "EXPENSIVE" or "UNKNOWN",
    "fcfPositive": true or false or null
  },
  "valuation": "DEEPLY_UNDERVALUED" or "UNDERVALUED" or "FAIRLY_VALUED" or "SLIGHTLY_OVERVALUED" or "OVERVALUED",
  "valuationNote": "<1 sentence>",
  "supportZones": [
    {"level": <number>, "strength": "STRONG" or "MODERATE", "note": "<why this level matters>"}
  ],
  "buySignal": "STRONG_BUY" or "BUY" or "ACCUMULATE" or "HOLD" or "WAIT_FOR_DIP" or "AVOID",
  "buySignalReason": "<2-3 sentences>",
  "sipAdvice": "<Direct advice on daily accumulation>",
  "moat": "<1-2 sentences based only on the provided data and company description>",
  "risks": [
    {"risk": "<specific risk>", "severity": "HIGH" or "MEDIUM" or "LOW", "impact": "<10-year impact>"}
  ],
  "growthRunway": "STRONG_10Y" or "MODERATE_5Y" or "LIMITED" or "DECLINING",
  "growthNote": "<2-3 sentences>",
  "longTermVerdict": "<3-4 sentences>"
}

Rules:
- priceVsAvg must be computed from currentPrice and avgPrice.
- Do not claim live web search or recent news access.
- Use support zones derived from the current price and explain them as technical approximation bands, not guaranteed support.
- If analystTarget is uncertain, set it to null.`;

  let raw;
  if (CONFIG.aiProvider === "gemini") raw = await callGemini(AI_SYSTEM, prompt);
  else if (CONFIG.aiProvider === "anthropic") raw = await callClaude(AI_SYSTEM, prompt);
  else raw = await callGroq(AI_SYSTEM, prompt);

  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}") + 1;
  if (start === -1 || end <= start) {
    throw new Error("LLM did not return valid JSON.");
  }

  const parsed = JSON.parse(cleaned.slice(start, end));
  parsed.dataSource = snapshot.providerLabel;
  parsed.fetchedAt = snapshot.fetchedAt;
  parsed.warnings = snapshot.warnings || [];
  return parsed;
}

async function analyzeStock(stock) {
  const snapshot = await fetchMarketSnapshot(stock);
  if (!hasAiKey()) {
    return buildFallbackAnalysis(stock, snapshot);
  }

  try {
    return await generateAiAnalysis(stock, snapshot);
  } catch (error) {
    const fallback = buildFallbackAnalysis(stock, snapshot);
    fallback.warnings = [
      ...(fallback.warnings || []),
      `LLM analysis failed, so the app used rule-based analysis instead: ${error.message}`,
    ];
    return fallback;
  }
}

function formatMoney(currency, value, options = {}) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: options.maximumFractionDigits ?? 2,
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
    }).format(value);
  } catch {
    return `${currency} ${Number(value).toLocaleString()}`;
  }
}

function formatSignedPercent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  const num = Number(value);
  return `${num >= 0 ? "+" : ""}${num.toFixed(1)}%`;
}

function getPositionMarketValue(stock, analysis) {
  const price = analysis?.currentPrice;
  if (price === null || price === undefined) return null;
  return price * stock.qty;
}

function groupPortfolioByCurrency(portfolio, analyses) {
  return portfolio.reduce((groups, stock) => {
    const currency = stock.currency || "INR";
    const marketValue = getPositionMarketValue(stock, analyses[stock.id]);
    const investedValue = stock.avgPrice * stock.qty;

    if (!groups[currency]) {
      groups[currency] = {
        currency,
        invested: 0,
        current: 0,
        pricedCount: 0,
        totalCount: 0,
      };
    }

    groups[currency].invested += investedValue;
    groups[currency].current += marketValue ?? 0;
    groups[currency].totalCount += 1;
    if (marketValue !== null) groups[currency].pricedCount += 1;

    return groups;
  }, {});
}

function Tag({ label, color }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: `${color}18`,
        border: `1px solid ${color}33`,
        color,
        borderRadius: 5,
        padding: "2px 9px",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.4,
        fontFamily: "'Fira Code', monospace",
      }}
    >
      {label}
    </span>
  );
}

function StatBox({ label, value, suffix = "", accent }) {
  const display =
    value !== null && value !== undefined
      ? `${typeof value === "number" ? value.toFixed(1) : value}${suffix}`
      : "--";

  return (
    <div
      style={{
        background: "#ffffff07",
        borderRadius: 8,
        padding: "9px 12px",
        border: accent ? `1px solid ${accent}30` : "1px solid transparent",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: "#3a5060",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 14,
          color: accent || "#aabbcc",
          fontWeight: 700,
        }}
      >
        {display}
      </div>
    </div>
  );
}

function SupportBadge({ zone, sym }) {
  const color = zone.strength === "STRONG" ? "#00e676" : "#ffd740";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: `${color}0a`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "0 8px 8px 0",
        padding: "8px 12px",
      }}
    >
      <div
        style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 15,
          color,
          fontWeight: 700,
          minWidth: 80,
        }}
      >
        {sym}
        {zone.level?.toLocaleString()}
      </div>
      <div>
        <Tag label={zone.strength} color={color} />
        <div style={{ fontSize: 11, color: "#5a7080", marginTop: 3 }}>{zone.note}</div>
      </div>
    </div>
  );
}

function StockCard({ stock, analysis, analyzing, analyzeError, onRemove, onAnalyze }) {
  const [open, setOpen] = useState(false);
  const money = (value, options) => formatMoney(stock.currency, value, options);
  const isUS = stock.exchange === "NASDAQ" || stock.exchange === "NYSE";
  const signal = analysis?.buySignal ? BUY_SIGNAL[analysis.buySignal] : null;
  const pnl = analysis?.priceVsAvg;
  const pnlColor = pnl >= 0 ? "#00e676" : "#ff4444";
  const warnings = analysis?.warnings || [];
  const marketValue = getPositionMarketValue(stock, analysis);
  const investedValue = stock.avgPrice * stock.qty;
  const absolutePnL = marketValue !== null ? marketValue - investedValue : null;
  const hasFullAnalysis = Boolean(analysis?.buySignal);
  const handleRemove = () => {
    if (window.confirm(`Remove ${stock.ticker} from this portfolio?`)) {
      onRemove(stock.id);
    }
  };

  return (
    <div
      className="surface-card stock-card"
      style={{
        background: "linear-gradient(160deg, #0d1d29 0%, #101924 45%, #0e1e2f 100%)",
        border: signal ? `1px solid ${signal.color}20` : "1px solid #ffffff10",
        borderRadius: 22,
        overflow: "hidden",
        boxShadow:
          signal && ["STRONG_BUY", "BUY"].includes(analysis?.buySignal)
            ? `0 0 28px ${signal.color}0e`
            : "0 18px 40px #02070b22",
        transition: "box-shadow 0.3s",
      }}
    >
      <div style={{ padding: "20px 22px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                background: isUS ? "#13253b" : "#11291d",
                border: `1px solid ${isUS ? "#2f5376" : "#2f6a4d"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                color: "#c8d8e2",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {isUS ? "US" : "IN"}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 19,
                    fontWeight: 700,
                    color: "#eff8fe",
                  }}
                >
                  {stock.ticker}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    background: "#ffffff10",
                    color: "#8ea4b2",
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontFamily: "'Fira Code', monospace",
                  }}
                >
                  {stock.exchange}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#708796", marginTop: 2, lineHeight: 1.5 }}>{stock.name}</div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="danger-button"
            style={{
              background: "#ffffff08",
              border: "1px solid #ffffff12",
              color: "#f19595",
              cursor: "pointer",
              fontSize: 12,
              lineHeight: 1,
              padding: "9px 11px",
              borderRadius: 12,
            }}
            aria-label={`Remove ${stock.ticker} from portfolio`}
          >
            Remove
          </button>
        </div>

        <div
          className="stock-stats-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginTop: 18,
          }}
        >
          {[
            { l: "Qty", v: stock.qty },
            { l: "Avg", v: money(stock.avgPrice) },
            { l: "Now", v: analysis?.currentPrice != null ? money(analysis.currentPrice) : "--" },
            {
              l: "P&L",
              v: pnl != null ? formatSignedPercent(pnl) : "--",
              c: pnl != null ? pnlColor : undefined,
            },
          ].map(({ l, v, c }) => (
            <div key={l} className="metric-tile" style={{ background: "#ffffff08", borderRadius: 12, padding: "10px 12px", border: "1px solid #ffffff08" }}>
              <div style={{ fontSize: 9, color: "#557080", textTransform: "uppercase", letterSpacing: 0.6 }}>{l}</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: c || "#d0dfeb", marginTop: 4, fontWeight: 600 }}>
                {v}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          <div style={{ background: "#0b2230", border: "1px solid #153649", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#628396", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
              Invested Value
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#ecf8ff", fontWeight: 700 }}>
              {money(investedValue)}
            </div>
          </div>
          <div style={{ background: "#102018", border: "1px solid #1e4934", borderRadius: 14, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, color: "#6c9580", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
              Current Value
            </div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#edfff3", fontWeight: 700 }}>
              {marketValue !== null ? money(marketValue) : "--"}
            </div>
            {absolutePnL !== null && (
              <div style={{ fontSize: 11, color: absolutePnL >= 0 ? "#80e6a6" : "#ff9a9a", marginTop: 5 }}>
                {absolutePnL >= 0 ? "Up " : "Down "}
                {money(Math.abs(absolutePnL))}
              </div>
            )}
          </div>
        </div>
      </div>

      {signal && (
        <div
          style={{
            background: signal.bg,
            borderTop: `1px solid ${signal.color}18`,
            borderBottom: `1px solid ${signal.color}18`,
            padding: "10px 22px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", color: signal.color }}>
            {signal.icon}
          </span>
          <div style={{ flex: 1 }}>
            <span
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 13,
                color: signal.color,
                fontWeight: 700,
              }}
            >
              {signal.label}
            </span>
            {analysis.valuation && (
              <span style={{ fontSize: 11, color: VALUATION_COLOR[analysis.valuation], marginLeft: 10 }}>
                {VALUATION_LABEL[analysis.valuation]}
              </span>
            )}
            {analysis.growthRunway && (
              <span style={{ fontSize: 11, color: GROWTH_META[analysis.growthRunway]?.color, marginLeft: 10 }}>
                {GROWTH_META[analysis.growthRunway]?.label}
              </span>
            )}
          </div>
          {analysis.analystTarget && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 9, color: "#334455" }}>TARGET</div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#99aabb" }}>
                {money(analysis.analystTarget)}
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: "16px 22px 20px" }}>
        {analyzeError && !analyzing && (
          <div
            style={{
              background: "#ff174410",
              border: "1px solid #ff174430",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 10,
              fontSize: 12,
              color: "#ff8a80",
              lineHeight: 1.5,
            }}
          >
            {analyzeError}
          </div>
        )}

        {!hasFullAnalysis && !analyzing && (
          <button
            onClick={() => onAnalyze(stock)}
            className="primary-button"
            style={{
              width: "100%",
              padding: "11px",
              background: "linear-gradient(90deg, #08253a, #082a2a)",
              border: "1px solid #1a4a60",
              borderRadius: 10,
              color: "#3aaacc",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Fira Code', monospace",
              letterSpacing: 0.5,
            }}
          >
            {analysis?.quoteOnly ? "Run full analysis" : "Fetch live snapshot and analyze"}
          </button>
        )}

        {analyzing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 52,
              color: "#4e6d7f",
              fontFamily: "'Fira Code', monospace",
              fontSize: 12,
            }}
          >
            <span>Loading market data</span>
          </div>
        )}

        {analysis && !analyzing && (
          <>
            <div
              style={{
                background: "#0d1720",
                border: "1px solid #152837",
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 12,
              }}
            >
              <div style={{ fontSize: 9, color: "#355163", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>
                Data Source
              </div>
              <div style={{ fontSize: 12, color: "#9eb5c2", lineHeight: 1.6 }}>
                {analysis.dataSource || "Unknown"}
                {analysis.fetchedAt ? ` | ${formatDateTime(analysis.fetchedAt)}` : ""}
              </div>
            </div>

            {warnings.length > 0 && (
              <div
                style={{
                  background: "#ffb30010",
                  border: "1px solid #ffb30028",
                  borderRadius: 10,
                  padding: "10px 12px",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 9, color: "#8a6a15", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 6 }}>
                  Notes
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {warnings.map((warning, index) => (
                    <div key={`${stock.id}-warning-${index}`} style={{ fontSize: 11, color: "#caa55b", lineHeight: 1.5 }}>
                      {warning}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasFullAnalysis ? (
              <>
                <div
                  style={{
                    background: "#0f2118",
                    border: "1px solid #1b4933",
                    borderRadius: 10,
                    padding: "10px 12px",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontSize: 9, color: "#3a7d5b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
                    SIP Advice
                  </div>
                  <div style={{ fontSize: 12, color: "#88bb99", lineHeight: 1.75 }}>{analysis.sipAdvice}</div>
                </div>

                <div style={{ fontSize: 12, color: "#6a8898", lineHeight: 1.75, marginBottom: 14 }}>
                  {analysis.buySignalReason}
                </div>

                <div style={{ fontSize: 9, color: "#2a4050", fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                  Fundamentals
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 14 }}>
                  <StatBox
                    label="P/E"
                    value={analysis.fundamentals?.pe}
                    accent={
                      analysis.fundamentals?.peVsSector === "CHEAP"
                        ? "#00e676"
                        : analysis.fundamentals?.peVsSector === "EXPENSIVE"
                          ? "#ff4444"
                          : null
                    }
                  />
                  <StatBox label="P/B" value={analysis.fundamentals?.pb} />
                  <StatBox label="ROE" value={analysis.fundamentals?.roe} suffix="%" />
                  <StatBox
                    label="Debt/Eq"
                    value={analysis.fundamentals?.debtEquity}
                    accent={analysis.fundamentals?.debtEquity > 1.5 ? "#ff4444" : null}
                  />
                  <StatBox label="Revenue" value={analysis.fundamentals?.revenueGrowth} suffix="%" />
                  <StatBox label="EPS" value={analysis.fundamentals?.epsGrowth} suffix="%" />
                </div>

                {analysis.valuationNote && (
                  <div
                    style={{
                      background: "#ffffff06",
                      borderRadius: 8,
                      padding: "9px 12px",
                      fontSize: 11,
                      color: "#6a8898",
                      marginBottom: 14,
                      borderLeft: "3px solid #33557755",
                    }}
                  >
                    {analysis.valuationNote}
                  </div>
                )}

                {analysis.supportZones?.length > 0 && (
                  <>
                    <div style={{ fontSize: 9, color: "#2a4050", fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                      Support Bands
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
                      {analysis.supportZones.map((zone, index) => (
                        <SupportBadge key={`${stock.id}-support-${index}`} zone={zone} sym={stock.currency === "USD" ? "$" : "Rs "} />
                      ))}
                    </div>
                  </>
                )}

                <button
                  onClick={() => setOpen((value) => !value)}
                  className="secondary-button"
                  style={{
                    background: "none",
                    border: "1px solid #ffffff0e",
                    borderRadius: 8,
                    color: "#3a5060",
                    fontSize: 11,
                    cursor: "pointer",
                    padding: "7px 14px",
                    width: "100%",
                    marginBottom: open ? 14 : 0,
                  }}
                  aria-expanded={open}
                >
                  {open ? "Collapse" : "Moat | Risks | Growth | Verdict"}
                </button>

                {open && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div
                      style={{
                        background: "#ffffff05",
                        borderRadius: 8,
                        padding: "10px 12px",
                        borderLeft: "3px solid #3388aa44",
                      }}
                    >
                      <div style={{ fontSize: 9, color: "#2a6070", fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>MOAT</div>
                      <div style={{ fontSize: 12, color: "#6a8898", lineHeight: 1.7 }}>{analysis.moat}</div>
                    </div>

                    {analysis.risks?.length > 0 && (
                      <div>
                        <div style={{ fontSize: 9, color: "#2a4050", fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
                          Risk Flags
                        </div>
                        {analysis.risks.map((risk, index) => (
                          <div
                            key={`${stock.id}-risk-${index}`}
                            style={{
                              background: `${RISK_COLOR[risk.severity]}09`,
                              borderLeft: `3px solid ${RISK_COLOR[risk.severity]}`,
                              borderRadius: "0 8px 8px 0",
                              padding: "8px 12px",
                              marginBottom: 6,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                              <Tag label={risk.severity} color={RISK_COLOR[risk.severity]} />
                              <span style={{ fontSize: 12, color: "#aabbcc", fontWeight: 600 }}>{risk.risk}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "#5a7080" }}>{risk.impact}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      style={{
                        background: "#ffffff05",
                        borderRadius: 8,
                        padding: "10px 12px",
                        borderLeft: "3px solid #aa880044",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: 1,
                          marginBottom: 5,
                          textTransform: "uppercase",
                          color: GROWTH_META[analysis.growthRunway]?.color || "#888",
                        }}
                      >
                        Growth Runway | {GROWTH_META[analysis.growthRunway]?.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#6a8898", lineHeight: 1.7 }}>{analysis.growthNote}</div>
                    </div>

                    <div
                      style={{
                        background: "linear-gradient(90deg, #08182a, #081820)",
                        border: "1px solid #1a3a5a",
                        borderRadius: 10,
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: 9, color: "#2a5a7a", fontWeight: 700, letterSpacing: 1, marginBottom: 6, textTransform: "uppercase" }}>
                        Long-Term Verdict
                      </div>
                      <div style={{ fontSize: 12, color: "#7a9aaa", lineHeight: 1.8 }}>{analysis.longTermVerdict}</div>
                    </div>

                    <button
                      onClick={() => onAnalyze(stock)}
                      className="secondary-button"
                      style={{
                        background: "none",
                        border: "1px solid #ffffff0e",
                        borderRadius: 7,
                        color: "#2a4050",
                        fontSize: 11,
                        cursor: "pointer",
                        padding: "6px 0",
                        width: "100%",
                      }}
                    >
                      Refresh analysis
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  background: "#0e1b25",
                  border: "1px solid #173042",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 12,
                  color: "#88a3b4",
                  lineHeight: 1.7,
                }}
              >
                Live price is being tracked. Run full analysis only when you want valuation, risk flags, SIP advice, and the long-term verdict.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function AddModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    ticker: "",
    exchange: "NSE",
    name: "",
    qty: "",
    avgPrice: "",
    currency: "INR",
  });
  const [error, setError] = useState("");

  const exchanges = [
    { value: "NSE", currency: "INR" },
    { value: "BSE", currency: "INR" },
    { value: "NASDAQ", currency: "USD" },
    { value: "NYSE", currency: "USD" },
  ];

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const updateField = (key, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickExchange = (value) => {
    const currency = exchanges.find((exchange) => exchange.value === value)?.currency || "INR";
    setForm((prev) => ({ ...prev, exchange: value, currency }));
  };

  const submit = () => {
    const ticker = form.ticker.toUpperCase().trim();
    const qty = parseFloat(form.qty);
    const avgPrice = parseFloat(form.avgPrice);

    if (!ticker || !Number.isFinite(qty) || !Number.isFinite(avgPrice)) {
      setError("Enter a valid ticker, quantity, and average price.");
      return;
    }

    if (qty <= 0 || avgPrice <= 0) {
      setError("Quantity and average price must be greater than zero.");
      return;
    }

    onAdd({
      id: Date.now(),
      ticker,
      exchange: form.exchange,
      name: form.name.trim() || ticker,
      qty,
      avgPrice,
      currency: form.currency,
    });
  };

  const input = (label, placeholder, key, type = "text") => (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, color: "#7f9aac" }}>
      {label}
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={(event) => updateField(key, event.target.value)}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "any" : undefined}
        style={{
          background: "#ffffff08",
          border: "1px solid #ffffff18",
          borderRadius: 10,
          color: "#ccdde8",
          padding: "10px 12px",
          fontSize: 13,
          fontFamily: "'Fira Code', monospace",
          outline: "none",
          width: "100%",
        }}
      />
    </label>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000000bb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      role="presentation"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-position-title"
        style={{
          background: "linear-gradient(180deg, #10202d 0%, #0b1822 100%)",
          border: "1px solid #ffffff14",
          borderRadius: 24,
          padding: 28,
          width: 420,
          maxWidth: "95vw",
          boxShadow: "0 30px 80px #00000055",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div
              id="add-position-title"
              style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 15,
                color: "#9ce5d8",
                marginBottom: 6,
                fontWeight: 700,
              }}
            >
              Add Position
            </div>
            <div style={{ fontSize: 12, color: "#6f8796", lineHeight: 1.6 }}>
              Add a holding first, then fetch the live snapshot when you are ready.
            </div>
          </div>
          <button
            onClick={onClose}
            className="secondary-button"
            style={{
              background: "#ffffff08",
              border: "1px solid #ffffff12",
              borderRadius: 999,
              color: "#7d92a0",
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
            }}
            aria-label="Close add position dialog"
          >
            ×
          </button>
        </div>
        <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
          {exchanges.map(({ value }) => (
            <button
              key={value}
              onClick={() => pickExchange(value)}
              className="segmented-button"
              aria-pressed={form.exchange === value}
              style={{
                flex: "1 1 90px",
                padding: "7px 0",
                background: form.exchange === value ? "#102840" : "#ffffff08",
                border: `1px solid ${form.exchange === value ? "#1a5888" : "#ffffff12"}`,
                borderRadius: 7,
                color: form.exchange === value ? "#55aadd" : "#3a5060",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {value}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 16 }}>
          {input("Ticker", "For example INFY, AAPL", "ticker")}
          {input("Company name", "Optional", "name")}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
            {input("Quantity", "Number of shares", "qty", "number")}
            {input(`Avg price (${form.currency === "USD" ? "$" : "Rs"})`, "Cost per share", "avgPrice", "number")}
          </div>
        </div>
        {error && (
          <div
            style={{
              background: "#ff6b6b14",
              border: "1px solid #ff6b6b2b",
              borderRadius: 12,
              color: "#ffb0b0",
              fontSize: 12,
              padding: "10px 12px",
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}
        <div className="add-modal-actions" style={{ display: "flex", gap: 9 }}>
          <button
            onClick={submit}
            className="primary-button"
            style={{
              flex: 1,
              padding: "11px",
              background: "linear-gradient(90deg, #0e6847, #17936a)",
              border: "1px solid #36b487",
              borderRadius: 12,
              color: "#f4fff9",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Fira Code', monospace",
              fontWeight: 700,
            }}
          >
            Save Position
          </button>
          <button
            onClick={onClose}
            className="secondary-button"
            style={{
              padding: "10px 18px",
              background: "#ffffff08",
              border: "1px solid #ffffff12",
              borderRadius: 12,
              color: "#8aa0af",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [analyses, setAnalyses] = useState({});
  const [analyzing, setAnalyzing] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [analyzeErrors, setAnalyzeErrors] = useState({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPortfolio(parsed.portfolio || SAMPLE_PORTFOLIO);
        setAnalyses(parsed.analyses || {});
      } else {
        setPortfolio(SAMPLE_PORTFOLIO);
      }
    } catch {
      setPortfolio(SAMPLE_PORTFOLIO);
    }
  }, []);

  const persist = useCallback((nextPortfolio, nextAnalyses) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ portfolio: nextPortfolio, analyses: nextAnalyses }),
      );
    } catch {
      // ignore storage errors
    }
  }, []);

  const addStock = (stock) => {
    const nextPortfolio = [...portfolio, stock];
    setPortfolio(nextPortfolio);
    persist(nextPortfolio, analyses);
    setShowAdd(false);
  };

  const removeStock = (id) => {
    const nextPortfolio = portfolio.filter((stock) => stock.id !== id);
    const nextAnalyses = { ...analyses };
    delete nextAnalyses[id];
    setPortfolio(nextPortfolio);
    setAnalyses(nextAnalyses);
    persist(nextPortfolio, nextAnalyses);
  };

  const mergeQuoteIntoAnalysis = useCallback((stock, quoteSnapshot, currentAnalyses) => {
    const previous = currentAnalyses[stock.id] || {};
    return {
      ...previous,
      ...quoteSnapshot,
      warnings: previous.quoteOnly
        ? quoteSnapshot.warnings || []
        : previous.warnings || quoteSnapshot.warnings || [],
      quoteOnly: previous.buySignal ? false : true,
    };
  }, []);

  const refreshQuotes = useCallback(async () => {
    if (!portfolio.length || detectMarketProvider() === "none") return;

    const results = await Promise.allSettled(
      portfolio.map(async (stock) => ({
        id: stock.id,
        stock,
        quote: await fetchMarketQuote(stock),
      })),
    );

    setAnalyses((prev) => {
      let changed = false;
      const updated = { ...prev };

      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const { stock, quote } = result.value;
        updated[stock.id] = mergeQuoteIntoAnalysis(stock, quote, updated);
        changed = true;
      }

      if (changed) {
        persist(portfolio, updated);
      }

      return changed ? updated : prev;
    });

    const quoteErrors = {};
    for (const result of results) {
      if (result.status === "rejected") continue;
      quoteErrors[result.value.id] = null;
    }

    if (Object.keys(quoteErrors).length) {
      setAnalyzeErrors((prev) => ({ ...prev, ...quoteErrors }));
    }
  }, [mergeQuoteIntoAnalysis, persist, portfolio]);

  const analyzeOne = async (stock) => {
    setAnalyzeErrors((prev) => ({ ...prev, [stock.id]: null }));
    setAnalyzing((prev) => ({ ...prev, [stock.id]: true }));

    try {
      const result = await analyzeStock(stock);
      setAnalyses((prev) => {
        const updated = { ...prev, [stock.id]: result };
        persist(portfolio, updated);
        return updated;
      });
    } catch (error) {
      setAnalyzeErrors((prev) => ({
        ...prev,
        [stock.id]: error?.message || "Analysis failed.",
      }));
    } finally {
      setAnalyzing((prev) => ({ ...prev, [stock.id]: false }));
    }
  };

  useEffect(() => {
    if (!portfolio.length || detectMarketProvider() === "none") return undefined;

    refreshQuotes();
    const intervalId = window.setInterval(refreshQuotes, 60000);
    return () => window.clearInterval(intervalId);
  }, [portfolio, refreshQuotes]);

  const analyzeAll = async () => {
    setBusy(true);
    try {
      for (const stock of portfolio) {
        await analyzeOne(stock);
      }
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    { id: "all", label: "All" },
    { id: "india", label: "India" },
    { id: "us", label: "US" },
    { id: "buy", label: "Buy Now" },
    { id: "risk", label: "High Risk" },
  ];

  const filtered = portfolio.filter((stock) => {
    const matchesQuery =
      !query.trim() ||
      `${stock.ticker} ${stock.name} ${stock.exchange}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());

    if (!matchesQuery) return false;
    if (tab === "all") return true;
    if (tab === "india") return stock.exchange === "NSE" || stock.exchange === "BSE";
    if (tab === "us") return stock.exchange === "NASDAQ" || stock.exchange === "NYSE";
    if (tab === "buy") {
      return ["STRONG_BUY", "BUY", "ACCUMULATE"].includes(analyses[stock.id]?.buySignal);
    }
    if (tab === "risk") {
      return analyses[stock.id]?.risks?.some((risk) => risk.severity === "HIGH");
    }
    return true;
  });

  const buyCount = portfolio.filter((stock) =>
    ["STRONG_BUY", "BUY", "ACCUMULATE"].includes(analyses[stock.id]?.buySignal),
  ).length;
  const riskCount = portfolio.filter((stock) =>
    analyses[stock.id]?.risks?.some((risk) => risk.severity === "HIGH"),
  ).length;
  const doneCount = Object.keys(analyses).length;
  const marketProvider = detectMarketProvider();
  const investedTotal = portfolio.reduce((sum, stock) => sum + stock.avgPrice * stock.qty, 0);
  const liveValueTotal = portfolio.reduce((sum, stock) => {
    const currentValue = getPositionMarketValue(stock, analyses[stock.id]);
    return sum + (currentValue ?? 0);
  }, 0);
  const analyzedPositions = portfolio.filter((stock) => analyses[stock.id]?.currentPrice != null).length;
  const unrealizedPnL = analyzedPositions ? liveValueTotal - investedTotal : null;
  const currencies = [...new Set(portfolio.map((stock) => stock.currency))];
  const hasMixedCurrencies = currencies.length > 1;
  const currencyGroups = Object.values(groupPortfolioByCurrency(portfolio, analyses));
  const dashboardRows = portfolio
    .map((stock) => {
      const analysis = analyses[stock.id];
      const investedValue = stock.avgPrice * stock.qty;
      const currentValue = getPositionMarketValue(stock, analysis);
      const pnlValue = currentValue !== null ? currentValue - investedValue : null;
      const pnlPercent =
        currentValue !== null && investedValue > 0 ? ((currentValue - investedValue) / investedValue) * 100 : null;

      return {
        id: stock.id,
        ticker: stock.ticker,
        name: stock.name,
        exchange: stock.exchange,
        currency: stock.currency,
        qty: stock.qty,
        avgPrice: stock.avgPrice,
        investedValue,
        currentValue,
        pnlValue,
        pnlPercent,
        buySignal: analysis?.buySignal || null,
      };
    })
    .sort((left, right) => (right.currentValue ?? -1) - (left.currentValue ?? -1));
  const topOpportunity = portfolio
    .filter((stock) => ["STRONG_BUY", "BUY"].includes(analyses[stock.id]?.buySignal))
    .sort((left, right) => (analyses[right.id]?.priceVsAvg ?? 999) - (analyses[left.id]?.priceVsAvg ?? 999))[0];
  const providerLabel =
    marketProvider === "groww"
      ? "Groww"
      : marketProvider === "fmp"
        ? "FMP"
        : marketProvider === "twelvedata"
          ? "Twelve Data"
          : "No provider";
  const summaryPanel = (
    <aside className="portfolio-sidebar" aria-label="Portfolio summary">
      <div
        style={{
          background: "linear-gradient(135deg, #12283a, #0d1f2f)",
          border: "1px solid #1a354a",
          borderRadius: 20,
          padding: "18px 18px 16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, color: "#7fa4b8", textTransform: "uppercase", letterSpacing: 1 }}>
              Portfolio Snapshot
            </div>
            <div style={{ fontSize: 24, color: "#edf8ff", fontWeight: 600, marginTop: 8 }}>
              {hasMixedCurrencies
                ? "Mixed Currency"
                : formatMoney(currencies[0] || "INR", investedTotal, { maximumFractionDigits: 0 })}
            </div>
            <div style={{ fontSize: 12, color: "#7f95a4", marginTop: 4, lineHeight: 1.55 }}>
              {hasMixedCurrencies
                ? "Portfolio contains multiple currencies, so totals stay unmerged."
                : `Cost basis across ${portfolio.length} holding${portfolio.length === 1 ? "" : "s"}`}
            </div>
          </div>
          <Tag label={providerLabel} color={marketProvider === "none" ? "#ff9100" : "#4fd1b8"} />
        </div>
        <div className="sidebar-metric-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 16 }}>
          <div style={{ background: "#ffffff08", borderRadius: 14, padding: "12px 12px" }}>
            <div style={{ fontSize: 9, color: "#6f8796", textTransform: "uppercase", letterSpacing: 0.7 }}>Live Value</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#ecf8ff", marginTop: 6 }}>
              {hasMixedCurrencies
                ? `${analyzedPositions}/${portfolio.length} priced`
                : analyzedPositions
                  ? formatMoney(currencies[0] || "INR", liveValueTotal, { maximumFractionDigits: 0 })
                  : "--"}
            </div>
          </div>
          <div style={{ background: "#ffffff08", borderRadius: 14, padding: "12px 12px" }}>
            <div style={{ fontSize: 9, color: "#6f8796", textTransform: "uppercase", letterSpacing: 0.7 }}>Unrealized</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: unrealizedPnL >= 0 ? "#7ce0a7" : "#ff9a9a", marginTop: 6 }}>
              {hasMixedCurrencies
                ? "Per-card only"
                : unrealizedPnL !== null
                  ? formatMoney(currencies[0] || "INR", unrealizedPnL, { maximumFractionDigits: 0 })
                  : "--"}
            </div>
          </div>
          <div style={{ background: "#ffffff08", borderRadius: 14, padding: "12px 12px" }}>
            <div style={{ fontSize: 9, color: "#6f8796", textTransform: "uppercase", letterSpacing: 0.7 }}>Coverage</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#9ddbff", marginTop: 6 }}>
              {doneCount}/{portfolio.length}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #1e2417, #101c18)", border: "1px solid #2d4331", borderRadius: 20, padding: "18px 18px 16px" }}>
        <div style={{ fontSize: 10, color: "#7ea389", textTransform: "uppercase", letterSpacing: 1 }}>Actionable</div>
        <div style={{ fontSize: 28, color: "#d9ffe7", fontWeight: 700, marginTop: 8 }}>{buyCount}</div>
        <div style={{ fontSize: 12, color: "#779286", lineHeight: 1.6, marginTop: 4 }}>
          Strong buy, buy, or accumulate positions from the latest analysis.
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #2a1817, #1c1114)", border: "1px solid #4a2428", borderRadius: 20, padding: "18px 18px 16px" }}>
        <div style={{ fontSize: 10, color: "#c08a90", textTransform: "uppercase", letterSpacing: 1 }}>Watchlist Risk</div>
        <div style={{ fontSize: 28, color: "#ffd9dc", fontWeight: 700, marginTop: 8 }}>{riskCount}</div>
        <div style={{ fontSize: 12, color: "#b1898d", lineHeight: 1.6, marginTop: 4 }}>
          High-severity risks flagged by the latest completed analysis.
        </div>
      </div>
    </aside>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #16324a 0%, #081019 32%, #061018 58%, #050a11 100%)",
        fontFamily: "'Fira Sans', sans-serif",
        color: "#bcd",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html { background: #071018; }
        body { margin: 0; }
        button, input { font: inherit; }
        button {
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease, opacity 160ms ease;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          border-color: #4fd1b855 !important;
        }
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        button:disabled {
          cursor: not-allowed !important;
        }
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #7dd3fc;
          outline-offset: 3px;
        }
        input::placeholder { color: #5d7483; }
        table tr:last-child { border-bottom: 0 !important; }
        tbody tr { transition: background 160ms ease; }
        tbody tr:hover { background: #ffffff06; }
        .surface-card {
          position: relative;
        }
        .surface-card::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background: linear-gradient(180deg, #ffffff08, transparent 34%);
        }
        .metric-tile { min-width: 0; }
        .primary-button { box-shadow: 0 10px 24px #001b1f22; }
        .danger-button:hover:not(:disabled) {
          background: #ff174414 !important;
          border-color: #ff8a8038 !important;
        }
        .secondary-button:hover:not(:disabled),
        .segmented-button:hover:not(:disabled) {
          color: #cfeaf8 !important;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1a3040; border-radius: 4px; }
        .app-shell {
          display: grid;
          grid-template-columns: minmax(240px, 286px) minmax(0, 1fr);
          gap: 22px;
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px 28px 60px;
          align-items: start;
        }
        .portfolio-sidebar {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: sticky;
          top: 104px;
        }
        .main-column {
          min-width: 0;
        }
        @media (max-width: 980px) {
          .portfolio-header { position: static !important; }
          .app-shell {
            grid-template-columns: 1fr;
            padding: 20px 22px 52px;
          }
          .portfolio-sidebar {
            position: static;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .portfolio-sidebar > :first-child {
            grid-column: 1 / -1;
          }
          .sidebar-metric-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 760px) {
          .portfolio-grid { grid-template-columns: 1fr !important; }
          .portfolio-header { padding: 18px 18px 0 !important; }
          .app-shell { padding: 20px 18px 42px !important; }
          .top-row { flex-direction: column; align-items: flex-start !important; gap: 12px; }
          .portfolio-sidebar { grid-template-columns: 1fr !important; }
          .sidebar-metric-grid { grid-template-columns: 1fr !important; }
          .dashboard-summary-grid { grid-template-columns: 1fr !important; }
          .stock-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .toolbar-row { flex-direction: column; align-items: stretch !important; }
          .toolbar-tabs { width: 100%; overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
          .toolbar-tabs button { white-space: nowrap; }
          .top-row-actions { width: 100%; }
          .top-row-actions button { flex: 1; }
          .add-modal-actions { flex-direction: column; }
          .add-modal-actions button { width: 100%; }
        }
      `}</style>

      {showAdd && <AddModal onAdd={addStock} onClose={() => setShowAdd(false)} />}

      <div
        className="portfolio-header"
        style={{
          background: "linear-gradient(180deg, #0a1520 0%, #09131bcc 100%)",
          borderBottom: "1px solid #ffffff10",
          padding: "22px 28px 0",
          position: "sticky",
          top: 0,
          zIndex: 10,
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <div className="top-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div
                style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 17,
                  fontWeight: 700,
                  background: "linear-gradient(90deg, #44aadd, #44ddaa)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: 1,
                }}
              >
                PORTFOLIO AGENT
              </div>
              <div style={{ fontSize: 11, color: "#6a8594", marginTop: 4, maxWidth: 560, lineHeight: 1.6 }}>
                Live quote snapshot first, portfolio triage second. Built for NSE/BSE and U.S. holdings with a cleaner review flow.
              </div>
            </div>
            <div className="top-row-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={analyzeAll}
                disabled={busy || !portfolio.length}
                className="secondary-button"
                style={{
                  background: "#082a40",
                  border: "1px solid #1a4a60",
                  borderRadius: 12,
                  color: "#9ddbff",
                  padding: "10px 16px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Fira Code', monospace",
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {busy ? "Analyzing..." : "Refresh All"}
              </button>
              <button
                onClick={() => setShowAdd(true)}
                className="primary-button"
                style={{
                  background: "linear-gradient(90deg, #116345, #178262)",
                  border: "1px solid #36b487",
                  borderRadius: 12,
                  color: "#f4fff9",
                  padding: "10px 16px",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                + Add Position
              </button>
            </div>
          </div>

          <div className="toolbar-row" style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
            <div className="toolbar-tabs" role="tablist" aria-label="Portfolio filters" style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  role="tab"
                  aria-selected={tab === id}
                  style={{
                    background: tab === id ? "#102030" : "none",
                    border: "none",
                    borderBottom: tab === id ? "2px solid #44aadd" : "2px solid transparent",
                    color: tab === id ? "#55ccee" : "#5f7a89",
                    padding: "8px 13px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: "'Fira Code', monospace",
                    borderRadius: "6px 6px 0 0",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              aria-label="Search ticker, company, or exchange"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ticker, company, or exchange"
              style={{
                width: "100%",
                maxWidth: 320,
                background: "#ffffff08",
                border: "1px solid #ffffff12",
                borderRadius: 14,
                color: "#d4e5ef",
                padding: "10px 14px",
                fontSize: 12,
                fontFamily: "'Fira Code', monospace",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <div className="app-shell">
        {summaryPanel}
        <main className="main-column">
          <div
          style={{
            marginBottom: 20,
            background: "linear-gradient(180deg, #0c1620 0%, #0b141d 100%)",
            border: "1px solid #ffffff10",
            borderRadius: 22,
            padding: 18,
            boxShadow: "0 20px 60px #0000001f",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#82a1b2", textTransform: "uppercase", letterSpacing: 1 }}>
                Dashboard
              </div>
              <div style={{ fontSize: 18, color: "#edf8ff", fontWeight: 600, marginTop: 6 }}>
                Track invested amount, current value, and returns across all holdings
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#6f8796" }}>
              {analyzedPositions}/{portfolio.length} positions have a live price snapshot
            </div>
          </div>

          <div
            className="dashboard-summary-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {currencyGroups.map((group) => {
              const pnl = group.pricedCount ? group.current - group.invested : null;
              const pnlPercent = pnl !== null && group.invested > 0 ? (pnl / group.invested) * 100 : null;

              return (
                <div
                  key={group.currency}
                  style={{
                    background: "#ffffff08",
                    border: "1px solid #ffffff10",
                    borderRadius: 18,
                    padding: "14px 14px 12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#cfe3ef", fontWeight: 700 }}>
                      {group.currency}
                    </div>
                    <Tag label={`${group.pricedCount}/${group.totalCount} priced`} color="#44aadd" />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, color: "#5f7b8b", textTransform: "uppercase", letterSpacing: 0.8 }}>Invested</div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#edf8ff", marginTop: 5 }}>
                        {formatMoney(group.currency, group.invested, { maximumFractionDigits: 0 })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#5f7b8b", textTransform: "uppercase", letterSpacing: 0.8 }}>Current</div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, color: "#edf8ff", marginTop: 5 }}>
                        {group.pricedCount
                          ? formatMoney(group.currency, group.current, { maximumFractionDigits: 0 })
                          : "--"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#5f7b8b", textTransform: "uppercase", letterSpacing: 0.8 }}>Return</div>
                      <div
                        style={{
                          fontFamily: "'Fira Code', monospace",
                          fontSize: 14,
                          color: pnl >= 0 ? "#7ce0a7" : "#ff9a9a",
                          marginTop: 5,
                        }}
                      >
                        {pnl !== null ? formatMoney(group.currency, pnl, { maximumFractionDigits: 0 }) : "--"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: "#5f7b8b", textTransform: "uppercase", letterSpacing: 0.8 }}>Return %</div>
                      <div
                        style={{
                          fontFamily: "'Fira Code', monospace",
                          fontSize: 14,
                          color: pnlPercent >= 0 ? "#7ce0a7" : "#ff9a9a",
                          marginTop: 5,
                        }}
                      >
                        {pnlPercent !== null ? formatSignedPercent(pnlPercent) : "--"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              overflowX: "auto",
              border: "1px solid #ffffff0c",
              borderRadius: 18,
              background: "#08111a",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ background: "#0d1822" }}>
                  {["Stock", "Qty", "Avg Price", "Invested", "Current", "Return", "Return %", "Signal"].map((label) => (
                    <th
                      key={label}
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        fontSize: 10,
                        color: "#688493",
                        textTransform: "uppercase",
                        letterSpacing: 0.9,
                        fontWeight: 700,
                        borderBottom: "1px solid #ffffff0c",
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dashboardRows.map((row) => (
                  <tr key={row.id} style={{ borderBottom: "1px solid #ffffff08" }}>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#edf8ff", fontWeight: 700 }}>
                          {row.ticker}
                        </div>
                        <div style={{ fontSize: 11, color: "#6f8796" }}>
                          {row.name} | {row.exchange}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#d7e8f2" }}>
                      {row.qty}
                    </td>
                    <td style={{ padding: "14px", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#d7e8f2" }}>
                      {formatMoney(row.currency, row.avgPrice, { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "14px", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#d7e8f2" }}>
                      {formatMoney(row.currency, row.investedValue, { maximumFractionDigits: 0 })}
                    </td>
                    <td style={{ padding: "14px", fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#d7e8f2" }}>
                      {row.currentValue !== null
                        ? formatMoney(row.currency, row.currentValue, { maximumFractionDigits: 0 })
                        : "--"}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 12,
                        color: row.pnlValue >= 0 ? "#7ce0a7" : "#ff9a9a",
                      }}
                    >
                      {row.pnlValue !== null
                        ? formatMoney(row.currency, row.pnlValue, { maximumFractionDigits: 0 })
                        : "--"}
                    </td>
                    <td
                      style={{
                        padding: "14px",
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 12,
                        color: row.pnlPercent >= 0 ? "#7ce0a7" : "#ff9a9a",
                      }}
                    >
                      {row.pnlPercent !== null ? formatSignedPercent(row.pnlPercent) : "--"}
                    </td>
                    <td style={{ padding: "14px" }}>
                      {row.buySignal ? (
                        <Tag
                          label={BUY_SIGNAL[row.buySignal]?.label || row.buySignal}
                          color={BUY_SIGNAL[row.buySignal]?.color || "#44aadd"}
                        />
                      ) : (
                        <span style={{ fontSize: 11, color: "#607887" }}>Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {topOpportunity && (
          <div
            style={{
              marginBottom: 18,
              background: "linear-gradient(90deg, #0f2219, #102b22)",
              border: "1px solid #24563f",
              borderRadius: 18,
              padding: "14px 16px",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 10, color: "#7cb092", textTransform: "uppercase", letterSpacing: 1 }}>
                Best Current Setup
              </div>
              <div style={{ fontSize: 16, color: "#effff4", fontWeight: 600, marginTop: 6 }}>
                {topOpportunity.ticker} looks strongest on the current ruleset
              </div>
              <div style={{ fontSize: 12, color: "#87a895", marginTop: 4 }}>
                {analyses[topOpportunity.id]?.buySignalReason}
              </div>
            </div>
            <button
              onClick={() => analyzeOne(topOpportunity)}
              style={{
                background: "#ffffff0a",
                border: "1px solid #ffffff14",
                borderRadius: 12,
                color: "#d4fbe0",
                padding: "10px 14px",
                cursor: "pointer",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              Refresh {topOpportunity.ticker}
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#3a5362", fontFamily: "'Fira Code', monospace" }}>
            <div style={{ fontSize: 15, color: "#a9c1cf", marginBottom: 8 }}>
              {portfolio.length === 0 ? "No positions yet." : "Nothing matches this view."}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.6 }}>
              {portfolio.length === 0
                ? "Add a holding to start tracking price snapshots and analysis."
                : "Try another tab or clear the search query."}
            </div>
          </div>
        ) : (
          <div
            className="portfolio-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: 18,
            }}
          >
            {filtered.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                analysis={analyses[stock.id]}
                analyzing={Boolean(analyzing[stock.id])}
                analyzeError={analyzeErrors[stock.id]}
                onRemove={removeStock}
                onAnalyze={analyzeOne}
              />
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: 36,
            padding: "14px 16px",
            background: "#d29c1d0d",
            border: "1px solid #c98c1625",
            borderRadius: 14,
            fontSize: 11,
            color: "#d9c18c",
            lineHeight: 1.7,
          }}
        >
          Educational use only. Not SEBI or SEC registered investment advice.
          {!hasAiKey() && <span> No AI key is configured, so the app is using rule-based analysis on fetched market data.</span>}
          {marketProvider === "none" && <span> Configure VITE_FMP_API_KEY or VITE_TWELVE_DATA_API_KEY in .env.local to enable live data.</span>}
        </div>
        </main>
      </div>
    </div>
  );
}
