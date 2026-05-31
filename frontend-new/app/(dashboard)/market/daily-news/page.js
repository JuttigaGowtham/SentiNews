"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchDailyNewsData } from '@/lib/api';
import { 
  FiCalendar as CalendarIcon, 
  FiRotateCw as RefreshIcon, 
  FiSearch as SearchIcon, 
  FiX as ClearIcon, 
  FiFolder as EmptyIcon, 
  FiAlertTriangle as ErrorIcon, 
  FiExternalLink as LinkIcon,
  FiClock as ClockIcon,
  FiTrendingUp as TitleIcon
} from "react-icons/fi";
import { FaClipboardList as ReportsIcon } from "react-icons/fa";
import './DailyNews.css';

// Simple fallback components to avoid missing dependency errors
const Card = ({ children, className }) => <div className={className}>{children}</div>;

function SkeletonLoader() {
  return (
    <div className="skeleton-list-new">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-item-new">
          <div className="news-item-top-new">
            <div className="news-meta-left-new">
              <div className="skeleton-badge-new skeleton-pulse-new" />
              <div className="skeleton-badge-sm-new skeleton-pulse-new" />
              <div className="skeleton-badge-md-new skeleton-pulse-new" />
            </div>
            <div className="skeleton-badge-sm-new skeleton-pulse-new" />
          </div>
          <div className="news-body-new">
            <div className="skeleton-headline-new skeleton-pulse-new" style={{ width: "70%" }} />
            <div className="skeleton-summary-new skeleton-pulse-new" style={{ width: "95%" }} />
            <div className="skeleton-summary-new skeleton-pulse-new" style={{ width: "60%", marginTop: "6px" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DailyStockNewsPage() {
  const [date, setDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all"); // 'all', 'bullish', 'bearish', 'neutral'

  const router = useRouter();

  const fetchDailyNews = async (selectedDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDailyNewsData(selectedDate);
      setNews(data || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load daily stock news. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyNews(date);
  }, [date]);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  // Format the date for the header display
  const displayDate = new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const parseNewsText = (newsText) => {
    const parts = newsText.split(" - ");
    const headline = parts[0];
    const summary = parts.slice(1).join(" - ");
    return { headline, summary };
  };

  // Filter logic
  const filteredNews = news.filter((item) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      item.company.toLowerCase().includes(query) || 
      item.news.toLowerCase().includes(query) ||
      (item.source && item.source.toLowerCase().includes(query));
      
    if (sentimentFilter === "all") return matchesSearch;
    
    // Sentiment boundaries
    const score = item.sentiment || 0;
    const isBullish = score > 0.15 || (item.action && (item.action.toLowerCase().includes("bullish") || item.action.toLowerCase() === "buy"));
    const isBearish = score < -0.15 || (item.action && (item.action.toLowerCase().includes("bearish") || item.action.toLowerCase() === "sell"));
    const isNeutral = !isBullish && !isBearish;
    
    if (sentimentFilter === "bullish") return matchesSearch && isBullish;
    if (sentimentFilter === "bearish") return matchesSearch && isBearish;
    if (sentimentFilter === "neutral") return matchesSearch && isNeutral;
    
    return matchesSearch;
  });

  return (
    <div className="stocks-news-container">
      <header className="page-header-new">
        <div className="header-content-new">
          <h1 className="title-gradient-new">
            <span className="title-icon-new"><TitleIcon size={28} /></span> Stocks in News
          </h1>
          <p className="subtitle-new">
            Curated corporate buzz for <span className="highlight-date-new">{displayDate}</span>. Catch the catalysts before they move the market.
          </p>
        </div>
        
        <div className="controls-new">
          <div className="date-picker-wrapper-new">
            <CalendarIcon size={16} className="picker-icon-new" />
            <input
              type="date"
              value={date}
              onChange={handleDateChange}
              max={new Date().toISOString().split('T')[0]}
              className="custom-date-input-new"
            />
          </div>
          <button 
            onClick={() => fetchDailyNews(date)}
            disabled={loading}
            className="refresh-btn-new"
          >
            <RefreshIcon size={16} className={loading ? "refresh-icon-spin" : ""} />
            {loading ? 'Updating...' : 'Refresh Data'}
          </button>
        </div>
      </header>

      {/* Search & Filter section */}
      {!error && news.length > 0 && (
        <div className="search-filter-section">
          <div className="search-bar-wrapper">
            <SearchIcon className="search-icon-new" size={18} />
            <input
              type="text"
              placeholder="Search by company ticker or headline details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-new"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className="clear-search-btn-new"
                title="Clear Search"
              >
                <ClearIcon size={14} />
              </button>
            )}
          </div>
          
          <div className="filter-chips-row">
            <span className="filter-label">Filter Sentiment:</span>
            <button 
              className={`filter-chip-new ${sentimentFilter === "all" ? "filter-chip-new--active" : ""}`}
              onClick={() => setSentimentFilter("all")}
            >
              All Tickers ({news.length})
            </button>
            <button 
              className={`filter-chip-new ${sentimentFilter === "bullish" ? "filter-chip-new--active" : ""}`}
              onClick={() => setSentimentFilter("bullish")}
            >
              🟢 Bullish
            </button>
            <button 
              className={`filter-chip-new ${sentimentFilter === "bearish" ? "filter-chip-new--active" : ""}`}
              onClick={() => setSentimentFilter("bearish")}
            >
              🔴 Bearish
            </button>
            <button 
              className={`filter-chip-new ${sentimentFilter === "neutral" ? "filter-chip-new--active" : ""}`}
              onClick={() => setSentimentFilter("neutral")}
            >
              ⚪ Neutral
            </button>
          </div>
        </div>
      )}

      <Card className="news-main-card-new">
        {loading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="error-state-new">
            <ErrorIcon className="error-icon-new" />
            <h3>System Connection Error</h3>
            <p>{error}</p>
            <button onClick={() => fetchDailyNews(date)} className="retry-btn-new">
              <RefreshIcon size={14} style={{ marginRight: "6px" }} /> Retry Fetch
            </button>
          </div>
        ) : news.length === 0 ? (
          <div className="empty-state-new">
            <EmptyIcon className="empty-icon-new" />
            <h3>No Catalysts Found</h3>
            <p>It seems like a quiet day for specific corporate filings, or news hasn't been aggregated yet for this date.</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="empty-state-new">
            <EmptyIcon className="empty-icon-new" />
            <h3>No Matches Found</h3>
            <p>Try refining your search query or switching your sentiment filters.</p>
          </div>
        ) : (
          <div className="news-content-new">
            <div className="content-header-new">
              <span className="live-indicator-new"></span>
              <h2>Market Pulse: Today's Buzzing Tickers</h2>
            </div>
            
            <div className="news-list-new">
              {filteredNews.map((item, index) => {
                const { headline, summary } = parseNewsText(item.news);
                const score = item.sentiment || 0;
                const isBullish = score > 0.15 || (item.action && (item.action.toLowerCase().includes("bullish") || item.action.toLowerCase() === "buy"));
                const isBearish = score < -0.15 || (item.action && (item.action.toLowerCase().includes("bearish") || item.action.toLowerCase() === "sell"));
                
                let sentClass = "neutral";
                let sentLabel = "Neutral";
                if (isBullish) {
                  sentClass = "bullish";
                  sentLabel = "Bullish";
                } else if (isBearish) {
                  sentClass = "bearish";
                  sentLabel = "Bearish";
                }

                const formattedTime = item.published_at_ist || (item.published_at
                  ? new Date(item.published_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  }) + " IST"
                  : "");

                return (
                  <div key={index} className="news-item-new">
                    <div className="news-item-top-new">
                      <div className="news-meta-left-new">
                        <span 
                          className="company-badge-new" 
                          onClick={() => router.push(`/stock/${item.company}`)}
                          title="View Stock Performance"
                        >
                          {item.company}
                        </span>
                        {item.source && (
                          <span className="source-badge-new">{item.source}</span>
                        )}
                        <span className={`fnc-sentiment-badge fnc-sentiment-badge--${sentClass}`}>
                          <span className="fnc-sentiment-dot" />
                          {sentLabel}
                        </span>
                      </div>
                      {formattedTime && (
                        <span className="time-badge-new">
                          <ClockIcon size={12} style={{ marginRight: "4px" }} />
                          {formattedTime}
                        </span>
                      )}
                    </div>
                    
                    <div className="news-body-new">
                      <h3 className="news-headline-new">{headline}</h3>
                      {summary && <p className="news-summary-new">{summary}</p>}
                    </div>
                    
                    <div className="news-action-bar-new">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="news-link-btn-new">
                          Full Coverage <LinkIcon size={12} style={{ marginRight: "4px" }} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
      
      <footer className="integration-footer-new">
        <div className="footer-info-new">
          <h4>📊 Production Intelligence</h4>
          <p>These company data points are automatically fed into your Pre-Market & Post-Market reports.</p>
        </div>
        <Link href="/reports" style={{ textDecoration: "none" }}>
          <button className="nav-reports-btn-new">
            <ReportsIcon size={16} /> Open Reports
          </button>
        </Link>
      </footer>
    </div>
  );
}
