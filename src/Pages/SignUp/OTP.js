import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import {
  
  signInSuccess
  
} from '../../redux/user/userSlice';

const OTP = () => {
  const state = useLocation().state;
  const { Email } = state;
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const authtoken = localStorage.getItem("auth-token");
  useEffect(() => { 
    if (authtoken){
      navigate("/candidate");
    }
  }, [authtoken]);
 

  const otpOnChange = (event) => {
    setOtp(event.target.value);
  };

  const signUpHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!otp) {
      alert("Please enter OTP");
      setLoading(false);
      return;
    }

    const data = {
      otp: otp,
      email: Email,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const res = await response.json();
        dispatch(signInSuccess(res.user));
        setLoading(false);
        localStorage.setItem("auth-token", res.token);
        navigate("/candidate");
      } else {
        
        
        alert("An error occurred while verifying OTP. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred. Please try again later.");
      setLoading(false);
    }
  };
  
  return (
    <div className="SignUpMain">
      <div
        className={`container-fluid d-flex align-items-center justify-content-center ${
          loading ? "" : "Collapsed"
        }`}
      >
        {loading && (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>
      <div className="SignUpContainer">
        <div className="SignUpImage">
          <img src="./Images/SignUpImage.png" alt="Sign Up" />
        </div>
        <form className="SignUpForm" onSubmit={signUpHandler}>
          <h1>OTP Verification</h1>
          <div className="SignUpInput">
            <label htmlFor="OTP">OTP</label>
            <input
              type="text"
              name="OTP"
              id="OTP"
              value={otp}
              onChange={otpOnChange}
            />
          </div>
          <div className="SignUpInput">
            <button type="submit">Verify OTP</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OTP;
