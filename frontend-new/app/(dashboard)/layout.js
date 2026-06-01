"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import IndicesTickerBar from "@/components/layout/IndicesTickerBar/IndicesTickerBar";
import StocksInFocusTicker from "@/components/layout/StocksInFocusTicker/StocksInFocusTicker";
import { useTheme } from "@/context/ThemeContext";
import Link from "next/link";

import {
  Newspaper,
  Calendar,
  Sliders,
  ClipboardList,
  Star,
  Briefcase,
  Droplet,
  Globe,
  DollarSign,
  LogOut,
  LogIn,
  TrendingUp,
  Search,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const NAV_TABS = [
  { id: "market", href: "/market", label: "Market Pulse", icon: Newspaper },
  { id: "pre-market", href: "/market/pre-market", label: "Pre-Market Intel", icon: TrendingUp },
  { id: "post-market", href: "/market/post-market", label: "Post-Market Intel", icon: ClipboardList },
  { id: "daily-news", href: "/market/daily-news", label: "Stocks in News", icon: Calendar },
  // { id: "screener", href: "/screener", label: "Screener", icon: Sliders },
  { id: "reports", href: "/reports", label: "Reports", icon: ClipboardList },
  // { id: "watchlist", href: "/watchlist", label: "Watchlist", icon: Star },
  // { id: "portfolio", href: "/portfolio", label: "Portfolio", icon: Briefcase },
];

const MARKET_DROPDOWN = [
  { id: "commodities", label: "Commodities", href: "/commodities", icon: Droplet },
  { id: "indices", label: "Global Indices", href: "/indices", icon: Globe },
  { id: "currencies", label: "Currencies", href: "/currencies", icon: DollarSign },
];

export default function DashboardLayout({ children }) {
  const { authToken, userEmail, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);



  useEffect(() => {
    const handleOutsideClick = () => {
      setMarketDropdownOpen(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const isActive = (href) => pathname === href || (href === "/market" && pathname === "/");

  // Authentication Guard - only for sensitive pages
  useEffect(() => {
    const isProtected = pathname.startsWith("/watchlist") || pathname.startsWith("/portfolio");
    if (isProtected && !authToken) {
      router.push("/login");
    }
  }, [authToken, router, pathname]);

  // If on a protected page without a token, show loading while redirecting
  const isProtectedPath = pathname.startsWith("/watchlist") || pathname.startsWith("/portfolio");
  if (isProtectedPath && !authToken) return <div className="page-loading">Redirecting to login...</div>;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="app-container">
      <div className="app-body">
        <aside className={`app-header ${sidebarExpanded ? "expanded" : ""}`}>
          <div className="sidebar-brand-section">
            <Link href="/market" className="app-logo" title="Sentinews">
              <strong className="logo-sn-badge">SN</strong>
              <span>Sentinews</span>
            </Link>
          </div>



          {/* Desktop Nav Links */}
          <nav className="app-navbar">
            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`nav-btn ${isActive(tab.href) ? "nav-btn-active" : ""}`}
                  title={tab.label}
                >
                  {Icon && <Icon size={20} />}
                  <span>{tab.label}</span>
                </Link>
              );
            })}

            {/* Market Dropdown */}
            <div className="nav-dropdown">
              <button
                className={`nav-btn ${MARKET_DROPDOWN.some(d => isActive(d.href)) ? "nav-btn-active" : ""}`}
                title="Market Dropdown"
                onClick={(e) => {
                  e.stopPropagation();
                  setMarketDropdownOpen(!marketDropdownOpen);
                }}
              >
                <Globe size={20} />
                <span>Market</span>
                <span className="dropdown-arrow" />
              </button>
              <div className="nav-dropdown-content" style={{ display: marketDropdownOpen ? "block" : "none" }}>
                {MARKET_DROPDOWN.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`dropdown-item ${isActive(item.href) ? "active" : ""}`}
                      style={{ display: "flex", alignItems: "center", gap: "8px" }}
                      onClick={() => setMarketDropdownOpen(false)}
                    >
                      {Icon && <Icon size={14} />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Account & Theme Actions (Bottom of Sidebar on Desktop) */}
          <div className="app-navbar-actions">
            {/* Collapse/Expand Toggle Button */}
            <button
              className="nav-btn sidebar-toggle-btn"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              title={sidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
              type="button"
              style={{ display: "flex", alignItems: "center" }}
            >
              {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              <span>Collapse</span>
            </button>



            {authToken ? (
              <div className="user-profile-container">
                <div className="profile-info-wrapper">
                  <div className="profile-avatar">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="profile-email-text">{userEmail}</span>
                </div>
                <button
                  className="nav-btn nav-logout profile-logout-btn"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="nav-btn nav-login"
                title="Login"
                style={{ display: "flex", alignItems: "center" }}
              >
                <LogIn size={20} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`nav-hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span /><span /><span />
          </button>
        </aside>

        {/* Mobile Drawer */}
        {menuOpen && (
          <div className="mobile-nav-drawer">

            {NAV_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`nav-btn ${isActive(tab.href) ? "nav-btn-active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {Icon && <Icon size={16} />}
                  <span>{tab.label}</span>
                </Link>
              );
            })}
            <div style={{ padding: "8px 12px", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Market</div>
            {MARKET_DROPDOWN.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`nav-btn ${isActive(item.href) ? "nav-btn-active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                  style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "12px" }}
                >
                  {Icon && <Icon size={16} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}



            {authToken ? (
              <>
                <div className="mobile-profile-info">
                  <div className="mobile-avatar">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="mobile-email-text">{userEmail}</span>
                </div>
                <button
                  className="nav-btn nav-logout"
                  onClick={handleLogout}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="nav-btn nav-login"
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>
        )}

        <div className="app-content-wrapper">
          <div className="dashboard-tickers">
            <IndicesTickerBar />
            <StocksInFocusTicker />
          </div>

          <main className="dashboard-content">
            {children}
          </main>
        </div>
      </div>

      <style jsx>{`
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
        .app-body {
          display: flex;
          flex-direction: row;
          flex: 1;
          min-height: 0;
        }
        .dashboard-content {
          flex: 1;
          background: var(--bg-void);
          overflow-y: auto;
          height: 100%;
        }
        .dashboard-tickers {
          flex-shrink: 0;
          z-index: 90;
        }
        
        /* User Profile Sidebar Hover Styles */
        .user-profile-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          height: 44px;
          margin: 6px 0;
          padding: 0;
          box-sizing: border-box;
        }
        .profile-info-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0 14px;
          transition: opacity 0.2s ease, transform 0.2s ease, gap 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .profile-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--neon-cyan);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(79, 70, 229, 0.15);
        }
        .profile-email-text {
          display: inline-block;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          max-width: 150px;
          opacity: 1;
          transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
        }
        .profile-logout-btn {
          position: absolute !important;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          margin: 0 !important;
          height: 100% !important;
        }
        .user-profile-container:hover .profile-info-wrapper {
          opacity: 0;
          transform: scale(0.95);
        }
        .user-profile-container:hover .profile-logout-btn {
          opacity: 1;
          pointer-events: auto;
        }
        
        /* Mobile Profile styling */
        .mobile-profile-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          margin-bottom: 4px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .mobile-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--neon-cyan);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .mobile-email-text {
          font-size: 0.85rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (min-width: 769px) {
          /* When collapsed sidebar: adjust profile sizing */
          :global(.app-header:not(.expanded)) .profile-email-text {
            max-width: 0;
            opacity: 0;
            pointer-events: none;
          }
          :global(.app-header:not(.expanded)) .user-profile-container {
            justify-content: center;
            padding: 0;
          }
          :global(.app-header:not(.expanded)) .profile-info-wrapper {
            justify-content: center;
            padding: 0;
            gap: 0;
          }
          :global(.app-header:not(.expanded)) .profile-logout-btn {
            left: 13px;
            right: auto;
            width: 44px;
            height: 44px !important;
            border-radius: 12px;
            justify-content: center;
            padding: 0;
          }
        }

        @media (max-width: 768px) {
          .app-container {
            height: auto;
            overflow: visible;
          }
          .app-body {
            display: block;
            height: auto;
          }
          .dashboard-content {
            overflow-y: visible;
            height: auto;
          }
        }


      `}</style>
    </div>
  );
}
