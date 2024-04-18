import React, { useEffect, useState } from "react";
import Navbar from "../../Components/Navbar/Navbar";
import Candidates from "./CandidatesList/CandidatesList";
import CalendarComponent from "../../Components/Calendar/Calendar";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import InterviewerProfile from "../profile/InterviewerProfile";
import LoadingBar from "react-top-loading-bar";
import CandidateList from "../candidateScore/CandidateScoreList";
import CandidateScore from "../candidateScore/CandidateScore";
import { combineSlices } from "@reduxjs/toolkit";

export default function Dashboard() {
  const location = useLocation();
  const [loading, setProgress] = useState(0);
  const authtoken = localStorage.getItem("auth-token");
  const navigate = useNavigate();
  useEffect(() => { 
    if (!authtoken){
      navigate("/Login");
    }
  }, [authtoken]);

  return (
    <>
      <LoadingBar color="#007bff" progress={loading} height={3} />{" "}
      {/* Render LoadingBar component */}
      <div className="DashParent" style={{ display: "flex", flexDirection: "row" }}>
        <Navbar />
        {location.pathname === "/candidate" ? (
          <Candidates setProgress={setProgress} />
        ) : location.pathname === "/interviews" ? (
          <CalendarComponent setProgress={setProgress} />
        ) : location.pathname === "/profile" ? (
          <InterviewerProfile setProgress={setProgress} />
        ) : location.pathname === "/candidates/score-list" ? (
          <CandidateList />
        ) : location.pathname.startsWith("/candidates/score/") ? (
          <CandidateScore />
        ) : null}
      </div>
    </>
  );
}
