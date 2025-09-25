import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import DonorRegistration from './pages/DonorRegistration';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import CampDonorList from './pages/CampDonorList'; // ✅ Fixed spelling
import Services from './pages/Services';
import Navbar from './components/Navbar';

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
          
        {/* Donor registration routes */}
        <Route path="/register" element={<DonorRegistration />} />
        {/* Optional: only if you want to use route params instead of query params */}
        {/* <Route path="/register/:campId" element={<DonorRegistration />} /> */}

        {/* Admin routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        {/* Camp donor list route */}
        <Route path="/admin/camp" element={<CampDonorList />} /> 
        {/* Use query param: /admin/camp?campId=xyz */}

        <Route path="/services" element={<Services />} />
      </Routes>
    </Router>
  );
};

export default App;
