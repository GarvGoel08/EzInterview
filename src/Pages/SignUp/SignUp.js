import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";


export default function SignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const authtoken = localStorage.getItem("auth-token");
  useEffect(() => { 
    if (authtoken){
      navigate("/candidate");
    }
  }, [authtoken]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const errors = [];

    if (formData.username.length < 3) {
      errors.push("Username must be at least 3 characters long");
    }
    if (!formData.email.includes("@")) {
      errors.push("Invalid email format");
    }
    if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (formData.password !== formData.confirmPassword) {
      errors.push("Passwords do not match");
    }

    if (errors.length > 0) {
      setError(errors[0]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/OTP', { state: { Email: formData.email } });
      } else {
        setError(data.error || "An error occurred");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="SignUpMain">
      <div className="SignUpContainer">
        <div className="SignUpImage">
          <img src="./Images/SignUpImage.png" alt="Sign Up" />
        </div>
        <form onSubmit={handleSubmit} className="SignUpForm">
          <h1>Sign Up</h1>
          {error && <p className="error">{error}</p>}
          <div className="SignUpInput">
            <label htmlFor="username">Company Name</label>
            <input
              
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="SignUpInput">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="SignUpInput">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="SignUpInput">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <div className="SignUpInput">
            <button type="submit" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
          <div className="SignUpInput" style={{ textAlign: 'center' }}>
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}
