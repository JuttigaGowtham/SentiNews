"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Newspaper,
  BarChart2,
  Droplet,
  DollarSign,
  Calendar,
  FolderOpen,
  ClipboardList,
  Sliders,
  Star,
  Briefcase,
  LogOut,
  LogIn,
  TrendingUp,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const NAV_TABS = [
  { id: "market", label: "Feed", href: "/market", icon: Newspaper },
  { id: "indices", label: "Indices", href: "/indices", icon: BarChart2 },
  { id: "commodities", label: "Commodities", href: "/commodities", icon: Droplet },
  { id: "currencies", label: "Currencies", href: "/currencies", icon: DollarSign },
  { id: "daily-news", label: "Daily News", href: "/market/daily-news", icon: Calendar },
];

const HUB_DROPDOWN = [
  { id: "reports", label: "Reports", href: "/reports", icon: ClipboardList },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout, authToken } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href) => pathname === href || (href === "/market" && pathname === "/");

  return (
    <>
      <header className={`app-header ${sidebarExpanded ? "expanded" : ""}`}>
        <div className="sidebar-brand-section">
          <Link href="/market" className="app-logo" title="Sentinews">
            <TrendingUp size={22} />
            <span>Sentinews</span>
          </Link>
        </div>

        {/* Desktop Nav */}
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

          {/* My Hub Dropdown */}
          <div className="nav-dropdown">
            <button
              className={`nav-btn ${HUB_DROPDOWN.some(d => isActive(d.href)) ? "nav-btn-active" : ""}`}
              title="My Hub Dropdown"
            >
              <FolderOpen size={20} />
              <span>My Hub</span>
              <span className="dropdown-arrow" />
            </button>
            <div className="nav-dropdown-content">
              {HUB_DROPDOWN.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`dropdown-item ${isActive(item.href) ? "active" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    {Icon && <Icon size={14} />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {pathname.startsWith("/stock/") && (
            <button className="nav-btn nav-btn-active" title={pathname.split("/").pop()}>
              <TrendingUp size={20} />
              <span>{pathname.split("/").pop()}</span>
            </button>
          )}
        </nav>

        {/* Account / Action Buttons */}
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
            <button
              className="nav-btn nav-logout"
              onClick={handleLogout}
              title="Logout"
              style={{ display: "flex", alignItems: "center" }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
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
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </header>

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
          <div style={{ padding: "8px 12px", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Hub</div>
          {HUB_DROPDOWN.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`nav-btn ${isActive(item.href) ? "nav-btn-active" : ""}`}
                onClick={() => setMenuOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                {Icon && <Icon size={16} />}
                <span>{item.label}</span>
              </Link>
            );
          })}
          {pathname.startsWith("/stock/") && (
            <button className="nav-btn nav-btn-active" style={{ opacity: 0.85, display: "flex", alignItems: "center", gap: "8px" }}>
              <TrendingUp size={16} />
              <span>{pathname.split("/").pop()}</span>
            </button>
          )}
          <button
            className="nav-btn nav-logout"
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </>
  );
}
