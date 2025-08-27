import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logo from '../assets/images/blood donate.jpeg'
import './Navbar.css'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="custom-navbar">
      <div className="nav-container">
        {/* Logo and Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="logo-container">
            <img
              src={logo}
              alt="Blood Donation Logo"
              className="nav-logo"
            />
            <div className="brand-text">
              <span className="brand-name">Lifeline</span>
              <span className="brand-subtitle">Blood Center</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links desktop-nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">🏠</span>
            Home
          </Link>
          <Link 
            to="/services" 
            className={`nav-link ${isActive('/services') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">⚕️</span>
            Services
          </Link>
          <Link 
            to="/register" 
            className={`nav-link register-link ${isActive('/register') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">❤️</span>
            Donor Registration
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="nav-icon">👨‍💼</span>
            Admin
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-toggle ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Mobile Navigation Menu */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-overlay" onClick={closeMenu}></div>
          <div className="mobile-nav-content">
            <div className="mobile-nav-header">
              <div className="mobile-brand">
                <img src={logo} alt="Logo" className="mobile-logo" />
                <span>Lifeline Blood Center</span>
              </div>
              {/* <button className="close-btn" onClick={closeMenu}>✕</button> */}
            </div>
            <div className="mobile-nav-links">
              <Link 
                to="/" 
                className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="nav-icon">🏠</span>
                Home
              </Link>
              <Link 
                to="/services" 
                className={`mobile-nav-link ${isActive('/services') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="nav-icon">⚕️</span>
                Services
              </Link>
              <Link 
                to="/register" 
                className={`mobile-nav-link register-mobile ${isActive('/register') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="nav-icon">❤️</span>
                Donor Registration
              </Link>
              <Link 
                to="/admin" 
                className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={closeMenu}
              >
                <span className="nav-icon">👨‍💼</span>
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
