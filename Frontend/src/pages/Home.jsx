import React, { useState, useEffect } from 'react';
import '../styles/Home.css';

const HomePage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [statsCount, setStatsCount] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    
    // Animate the stats counter
    const timer = setTimeout(() => {
      let count = 0;
      const target = 10;
        const increment = Math.ceil(target / 100); 
      
      const counter = setInterval(() => {
    count += increment;
    if (count >= target) {
      count = target;
      clearInterval(counter);
    }
    setStatsCount(count);
  }, 20);
}, 2000);

    return () => clearTimeout(timer);
  }, []);

  const bloodDrops = Array.from({ length: 15 }, (_, i) => (
    <div
      key={i}
      className="blood-drop"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 3}s`,
        animationDuration: `${2 + Math.random() * 2}s`
      }}
    />
  ));

  return (
    <div className="homepage">
      {/* Floating Background Elements */}
      <div className="background-elements">
        {bloodDrops}
        <div className="floating-circle circle-1" />
        <div className="floating-circle circle-2" />
        <div className="floating-circle circle-3" />
      </div>

      {/* Hero Quote Section */}
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-gradient" />
        
        <div className={`hero-content ${isVisible ? 'visible' : ''}`}>
          <h1 className="hero-title">
            "The Gift Of Blood Is The Gift Of Life."
          </h1>
          <p className="hero-subtitle">
            A single donation can save up to <strong className="highlight-text">3 lives</strong>. Be someone's hero today.
          </p>
          <a href="/register" className="donate-btn">
            <span className="btn-content">
              ❤️ Donate Now
            </span>
          </a>
        </div>
        
        
      </section>

      {/* Importance of Blood Donation */}
      <section className="importance-section">
        <div className="container">
          <div className={`importance-content ${isVisible ? 'visible' : ''}`}>
            <div className="importance-image">
              <div className="image-container">
                <img
                  src="https://parashospitals-web.s3.ap-south-1.amazonaws.com/uploads/2017/06/all-about-blood-donation.jpg"
                  alt="Why Blood Donation Matters"
                  className="importance-img"
                />
                <div className="decorative-dot dot-1" />
                <div className="decorative-dot dot-2" />
              </div>
            </div>
            <div className="importance-text">
              <h2 className="section-title">
                Why Blood Donation is Important
              </h2>
              <p className="section-description">
                Blood donation is crucial for saving lives. Whether it's for accident victims,
                cancer patients, or emergency surgeries — your blood can make a difference.
              </p>
              <ul className="benefits-list">
                <li className="benefit-item">
                  <span className="bullet-point" />
                  You can donate every 3 months
                </li>
                <li className="benefit-item">
                  <span className="bullet-point" />
                  Healthy donors recover quickly
                </li>
                <li className="benefit-item">
                  <span className="bullet-point" />
                  It helps reduce iron overload
                </li>
              </ul>
              <p className="health-message">
                Healthy for you. Life-saving for others.
              </p>
              <div className="logo-container">
                <div className="logo-circle">
                  <span className="logo-icon">🩸</span>
                </div>
                <span className="logo-text">Lifeline Blood Center</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donor Screening Section */}
      <section className="screening-section">
        <div className="container">
          <div className={`screening-content ${isVisible ? 'visible' : ''}`}>
            <div className="screening-image">
              <div className="image-container">
                <img
                  src="https://images.pexels.com/photos/12820057/pexels-photo-12820057.jpeg"
                  alt="Blood Testing and Screening"
                  className="screening-img"
                />
                <div className="decorative-dot dot-3" />
                <div className="decorative-dot dot-4" />
              </div>
            </div>
            <div className="screening-text">
              <h2 className="section-title">
                Safe & Trusted Process
              </h2>
              <p className="section-description">
                All donated blood undergoes strict screening and testing for infections.
                Our trained professionals follow the highest medical standards.
              </p>
              <p className="safety-message">
                Your safety and the recipient's health is our top priority.
              </p>
              <a href="/services" className="safety-btn">
                🛡️ Learn About Safety
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Global Stats Section */}
      <section className="stats-section">
        <div className="container">
          <h2 className={`stats-title ${isVisible ? 'visible' : ''}`}>
            Join a Global Movement
          </h2>
          <div className="stats-number-container">
            <p className={`stats-number ${isVisible ? 'visible' : ''}`}>
              {statsCount.toFixed()}K+
            </p>
            <div className="decorative-dot dot-5" />
            <div className="decorative-dot dot-6" />
          </div>
          <p className="stats-description">
            blood donations collected worldwide. Be part of the impact.
          </p>
          <a href="/register-camp" className="camp-btn">
            🏕️ Organize a Blood Camp
          </a>
        </div>
      </section>
      

      
    </div>
  );
};

export default HomePage;