import React, { useEffect, useState } from "react";
import "./SignUp.css";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../../redux/user/userSlice';

export default function Login() {
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
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

    // Client-side validation
    const errors = [];
    if (!formData.email.includes("@")) {
      errors.push("Invalid email format");
    }
    if (formData.password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }

    try {
      dispatch(signInStart());
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: "include" 
      });
      const data = await response.json();
      console.log(data);
      console.log(data.success)


      dispatch(signInSuccess(data.user));
      localStorage.setItem("auth-token", data.token);
      Navigate('/candidate');

    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };


  return (
    <div className="SignUpMain">
      <div className="SignUpContainer">
        <div className="SignUpImage">
          <img src="./Images/SignUpImage.png" alt="Sign Up" />
        </div>
        <form onSubmit={handleSubmit} className="SignUpForm">
          <h1>Log In</h1>
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
            <button type="submit">Log In</button>
          </div>
          <div className="SignUpInput" style={{ textAlign: 'center' }}>
            <p>Dont't have an account? <a href="/">Signup</a></p>
          </div>
        </form>
      </div>
    </div>
  );
}
