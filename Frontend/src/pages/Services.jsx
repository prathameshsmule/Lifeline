import React from 'react';
import '../styles/Services.css';

// Import actual images from your assets folder
import donationCampImg from '../assets/images/Donation.jpg';
import deliveryImg from '../assets/images/delivery.jpg';
import healthCheckImg from '../assets/images/check.jpg';
import emergencyImg from '../assets/images/108.png';
import hospitalImg from '../assets/images/hos.jpg';
import pathologyImg from '../assets/images/Pathologylab12.jpg';
import radiologyImg from '../assets/images/radio.jpg';
import medicalImg from '../assets/images/srtore.jpg';

const services = [
  {
    title: '🩸 Blood Donation Camps',
    description:
      'We organize regular blood donation camps in local areas, schools, colleges, and offices to make donation accessible for all.',
    image: donationCampImg,
  },
  {
    title: '📦 Blood Requests & Delivery',
    description:
      'Quick and reliable delivery of required blood units to hospitals and patients in emergencies.',
    image: deliveryImg,
  },
  {
    title: '🏥 Free Health Checkups',
    description:
      'All blood donors get a free health screening which includes BP, blood sugar, hemoglobin, and doctor consultation.',
    image: healthCheckImg,
  },
  {
    title: '📞 Emergency Blood Helpline',
    description:
      '24/7 helpline for urgent blood requests. We coordinate donors and hospitals instantly.',
    image: emergencyImg,
  },
];

const privileges = [
  {
    title: '🏨 Hospital Privileges',
    points: ['OPD - 10% to 30%', 'IPD - 10% to 30%', 'Diagnostic Tests - 10% to 30%'],
    image: hospitalImg,
  },
  {
    title: '🧪 Pathology Lab Discounts',
    points: [
      'Hematology - 10% to 30%',
      'Biochemistry - 10% to 30%',
      'Serology - 10% to 30%',
      'Histopathology - 10% to 30%',
      'Cytology - 10% to 30%',
    ],
    image: pathologyImg,
  },
  {
    title: '🧴 Medical & Surgical Store',
    points: ['Medicines - 10% to 30%', 'Surgical Products - 10% to 30%'],
    image: medicalImg,
  },
  {
    title: '🔬 Radiology Diagnostics',
    points: [
      'X-Ray - 10% to 30%',
      'Ultrasound - 10% to 30%',
      'CT Scan - 10% to 30%',
      'MRI - 10% to 30%',
      'Mammography - 10% to 30%',
    ],
    image: radiologyImg,
  },
];


// 🎟 Coupons for Donors
const coupons = [
  {
    hospital: 'CityCare Hospital',
    offer: '10% To 30% OFF on OPD & Diagnostics',
    code: 'LIFELINE20',
    validity: 'Valid until Dec 31, 2025',
    image: hospitalImg,
  },
  {
    hospital: 'HealthPlus Pathology',
    offer: ' 10% To 30% OFF on All Tests',
    code: 'HEALTH30',
    validity: 'Valid until Nov 30, 2025',
    image: pathologyImg,
  },
  {
    hospital: 'MediStore Pharmacy',
    offer: '10% To  15% OFF on Medicines & Surgical Products',
    code: 'MEDI15',
    validity: 'Valid until Dec 31, 2025',
    image: medicalImg,
  },
];

const Services = () => {
  return (
    <div className="services-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-overlay">
            <h1 className="hero-title">Our Services & Donor Privileges</h1>
            <p className="hero-subtitle">
              Helping you save lives and stay healthy.
            </p>
            <div className="pulse-animation"></div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="services-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Core Services</h2>
            <div className="title-underline"></div>
          </div>
          <div className="services-grid">
            {services.map((service, index) => (
              <div
                className="service-card"
                key={index}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <div className="image-container">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="service-image"
                      />
                      <div className="image-overlay"></div>
                    </div>
                    <div className="card-content">
                      <h5 className="service-title">{service.title}</h5>
                      <p className="service-description">{service.description}</p>
                    </div>
                    <div className="card-footer"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privileges Section */}
      <section className="privileges-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Special Privileges for Blood Donors</h2>
            <div className="title-underline blue"></div>
          </div>
          <div className="privileges-grid">
            {privileges.map((item, index) => (
              <div
                className="privilege-card"
                key={index}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="privilege-image-container">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="privilege-image"
                  />
                  <div className="privilege-overlay">
                    <div className="discount-badge">
                      <span>Special</span>
                      <span>Discount</span>
                    </div>
                  </div>
                </div>
                <div className="privilege-content">
                  <h5 className="privilege-title">{item.title}</h5>
                  <ul className="privilege-list">
                    {item.points.map((point, i) => (
                      <li key={i} className="privilege-item">
                        <span className="checkmark">✔</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coupons Section */}
      <section className="coupons-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Exclusive Donor Coupons</h2>
            <div className="title-underline red"></div>
          </div>
          <div className="coupons-grid">
            {coupons.map((coupon, index) => (
              <div
                className="coupon-card"
                key={index}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="coupon-image-container">
                  <img
                    src={coupon.image}
                    alt={coupon.hospital}
                    className="coupon-image"
                  />
                </div>
                <div className="coupon-content">
                  <h5 className="coupon-hospital">{coupon.hospital}</h5>
                  <p className="coupon-offer">{coupon.offer}</p>
                  <p className="coupon-validity">{coupon.validity}</p>
                 
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
    <footer className="footer">
  <div className="container">
    <div className="footer-content">
      {/* Footer Info */}
      <div className="footer-info">
        <h3>Lifeline Blood Center</h3>
        <p>
          123 Healthcare Avenue,<br />
          Medical District,<br />
          Pune, Maharashtra 411001
        </p>
      </div>

      {/* Footer Contact */}
      <div className="footer-contact">
        <p>
          ✉️ Email: <strong>info@lifelinebloodcenter.org</strong>
        </p>
        <p>
          📞 Contact: <strong>+91 98765 43210 /+91 98765 43210</strong>
        </p>
           <p>
          📞 Contact: <strong>+91 98765 43210</strong>
        </p>
        
      </div>
    </div>
  </div>
</footer>

    </div>
  );
};

export default Services;
