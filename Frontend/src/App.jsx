import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import DonorRegistration from './pages/DonorRegistration'
import Admin from './pages/Admin'
import AdminLogin from './pages/AdminLogin'
import CampDonorList from './pages/CampDonarList' // ✅ Fixed spelling
import Services from './pages/Services'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/donor-register" element={<DonorRegistration />} />
{/*         <Route path="/register" element={<DonorRegistration />} /> */}
        <Route path="/register/:campName" element={<DonorRegistration />} /> {/* ✅ Add this line */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/camp/:campName" element={<CampDonorList />} />
        <Route path="/services" element={<Services />} />
      </Routes>
    </Router>
  )
}

export default App
