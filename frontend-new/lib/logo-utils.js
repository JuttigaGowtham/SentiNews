import React from "react";

const DOMAIN_MAP = {
  "RELIANCE.NS": "ril.com",
  "RELIANCE": "ril.com",
  "TCS.NS": "tcs.com",
  "INFY.NS": "infosys.com",
  "HDFCBANK.NS": "hdfcbank.com",
  "ICICIBANK.NS": "icicibank.com",
  "SBIN.NS": "onlinesbi.sbi",
  "SBIN": "onlinesbi.sbi",
  "IPL.NS": "indiapesticideslimited.com",
  "IPL": "indiapesticideslimited.com",
  "BHARTIARTL.NS": "airtel.in",
  "LTIM.NS": "ltimindtree.com",
  "ITC.NS": "itcportal.com",
  "HINDUNILVR.NS": "hul.co.in",
  "KOTAKBANK.NS": "kotak.com",
  "LT.NS": "larsentoubro.com",
  "AXISBANK.NS": "axisbank.com",
  "ASIANPAINT.NS": "asianpaints.com",
  "MARUTI.NS": "marutisuzuki.com",
  "TITAN.NS": "titancompany.in",
  "BAJFINANCE.NS": "bajajfinserv.in",
  "BAJAJFINSV.NS": "bajajfinserv.in",
  "ULTRACEMCO.NS": "ultratechcement.com",
  "SUNPHARMA.NS": "sunpharma.com",
  "WIPRO.NS": "wipro.com",
  "ADANIENT.NS": "adanienterprises.com",
  "ADANIPORTS.NS": "adaniports.com",
  "JSWSTEEL.NS": "jswsteel.in",
  "HINDALCO.NS": "hindalco.com",
  "TATASTEEL.NS": "tatasteel.com",
  "TATAMOTORS.NS": "tatamotors.com",
  "M&M.NS": "mahindra.com",
  "NTPC.NS": "ntpc.co.in",
  "POWERGRID.NS": "powergrid.in",
  "ONGC.NS": "ongcindia.com",
  "COALINDIA.NS": "coalindia.in",
  "BPCL.NS": "bharatpetroleum.in",
  "IOC.NS": "iocl.com",
  "HEROMOTOCO.NS": "heromotocorp.com",
  "EICHERMOT.NS": "eicher.in",
  "BAJAJ-AUTO.NS": "bajajauto.com",
  "BRITANNIA.NS": "britannia.co.in",
  "NESTLEIND.NS": "nestle.in",
  "APOLLOHOSP.NS": "apollohospitals.com",
  "CIPLA.NS": "cipla.com",
  "DRREDDY.NS": "drreddys.com",
  "DIVISLAB.NS": "divislabs.com",
  "GRASIM.NS": "grasim.com",
  "INDUSINDBK.NS": "indusind.com",
  "HCLTECH.NS": "hcltech.com",
  "SBILIFE.NS": "sbilife.co.in",
  "HDFCLIFE.NS": "hdfclife.com",
  "ADANIPOWER.NS": "adanipower.com",
  "TATACOMM.NS": "tatacommunications.com",
  "TATACONSUM.NS": "tataconsumer.com",
  "JIOFIN.NS": "jiofinancialservices.com",
  "ZOMATO.NS": "zomato.com",
  "PAYTM.NS": "paytm.com",
  "NYKAA.NS": "nykaa.com",
  "ONGC": "ongcindia.com",
  "BDL": "bdl-india.in",
  "BDL.NS": "bdl-india.in",
  "MCX": "mcxindia.com",
  "MCX.NS": "mcxindia.com",
  "OLAELEC": "olaelectric.com",
  "OLAELEC.NS": "olaelectric.com",
  "NETWEB": "netwebindia.com",
  "NETWEB.NS": "netwebindia.com",
  "SJVN": "sjvn.nic.in",
  "SJVN.NS": "sjvn.nic.in",
  "RVNL": "rvnl.org",
  "RVNL.NS": "rvnl.org",
  "IRFC": "irfc.co.in",
  "IRFC.NS": "irfc.co.in",
  "BEL": "bel-india.in",
  "BEL.NS": "bel-india.in",
  "HAL": "hal-india.co.in",
  "HAL.NS": "hal-india.co.in",
  "BHEL": "bhel.com",
  "BHEL.NS": "bhel.com",
  "HUDCO": "hudco.org.in",
  "HUDCO.NS": "hudco.org.in",
  "IREDA": "ireda.in",
  "IREDA.NS": "ireda.in",
  "SUZLON": "suzlon.com",
  "SUZLON.NS": "suzlon.com",
  "YESBANK": "yesbank.in",
  "YESBANK.NS": "yesbank.in",
  "FEDERALBNK": "federalbank.co.in",
  "FEDERALBNK.NS": "federalbank.co.in",
  "PFC": "pfcindia.com",
  "PFC.NS": "pfcindia.com",
  "RECLTD": "recindia.nic.in",
  "RECLTD.NS": "recindia.nic.in",
  "POLYCAB": "polycab.com",
  "POLYCAB.NS": "polycab.com",
  "CDSL": "cdslindia.com",
  "CDSL.NS": "cdslindia.com",
  "BSE": "bseindia.com",
  "BSE.NS": "bseindia.com",
  "ANGELONE": "angelone.in",
  "ANGELONE.NS": "angelone.in",
  "SULA": "sulavineyards.com",
  "SULA.NS": "sulavineyards.com"
};

export function getStockLogoClearbitUrl(symbol) {
  const cleanSym = symbol ? symbol.toUpperCase().trim() : "";
  const domain = DOMAIN_MAP[cleanSym] || DOMAIN_MAP[cleanSym + ".NS"] || DOMAIN_MAP[cleanSym.replace(".NS", "")];
  return domain ? `https://logo.clearbit.com/${domain}` : null;
}

export function getStockLogoUrl(symbol) {
  const cleanSym = symbol ? symbol.toUpperCase().trim() : "";
  const domain = DOMAIN_MAP[cleanSym] || DOMAIN_MAP[cleanSym + ".NS"] || DOMAIN_MAP[cleanSym.replace(".NS", "")];
  
  if (domain) {
    return `https://www.google.com/s2/favicons?sz=128&domain=${domain}`;
  }
  
  const char = cleanSym.charAt(0);
  return `https://ui-avatars.com/api/?name=${char}&background=1E40AF&color=fff&rounded=true&bold=true`;
}

const INDEX_CONFIGS = {
  "NIFTY 50":      { text: "N50", bg: "linear-gradient(135deg, #10B981, #059669)" },
  "NIFTY BANK":    { text: "NBK", bg: "linear-gradient(135deg, #3B82F6, #1E40AF)" },
  "NIFTY IT":      { text: "NIT", bg: "linear-gradient(135deg, #8B5CF6, #6D28D9)" },
  "NIFTY MID 100": { text: "MID", bg: "linear-gradient(135deg, #F59E0B, #D97706)" },
  "NIFTY SML 100": { text: "SML", bg: "linear-gradient(135deg, #06B6D4, #0891B2)" },
  "NIFTY AUTO":    { text: "AUT", bg: "linear-gradient(135deg, #EC4899, #BE185D)" },
  "NIFTY FMCG":    { text: "FMC", bg: "linear-gradient(135deg, #F43F5E, #E11D48)" },
  "NIFTY PHARMA":  { text: "PHA", bg: "linear-gradient(135deg, #14B8A6, #0D9488)" },
  "NIFTY METAL":   { text: "MET", bg: "linear-gradient(135deg, #6B7280, #4B5563)" },
  "INDIA VIX":     { text: "VIX", bg: "linear-gradient(135deg, #EF4444, #DC2626)" },
  "SENSEX":        { text: "SNX", bg: "linear-gradient(135deg, #6366F1, #4F46E5)" },
};

export function getIndexLogo(name) {
  const cleanName = name ? name.toUpperCase().trim() : "";
  const isSensex = cleanName === "SENSEX";
  const domain = isSensex ? "bseindia.com" : "nseindia.com";
  
  const config = INDEX_CONFIGS[name] || { text: "IDX" };
  const fallbackText = config.text || "IDX";
  
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
      alt={name}
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        display: "block",
        flexShrink: 0,
        objectFit: "contain",
        background: "#ffffff",
        border: "1px solid var(--border-subtle)",
        padding: "1px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.06)"
      }}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${fallbackText}&background=1E40AF&color=fff&rounded=true&bold=true`;
      }}
    />
  );
}
