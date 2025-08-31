import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/images/admin logo.png'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      alert('Please enter email and password')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(
  `/api/admin/login`,
  { email, password }
)
      localStorage.setItem('admin-token', res.data.token)
      navigate('/admin')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || '❌ Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <img src={logo} alt="Admin Logo" style={{ height: '70px' }} className="mb-2" />
          <h3 className="text-dark">Admin Login</h3>
        </div>

        <form onSubmit={handleLogin}>
          <input
            className="form-control mb-3"
            name="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="form-control mb-3"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-dark w-100" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
