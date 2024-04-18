import React, { useEffect, useState } from "react";
import "./InterviewCard.css";
import moment from "moment";
import { Link } from "react-router-dom";

export default function InterviewCard({ interview }) {
  const [candidate, setCandidate] = useState({});
  const interviewTime = moment(interview.scheduled_time).utcOffset("+05:30");

  const formattedTime = interviewTime.format("Do MMMM YYYY, h:mm A");
  
  const onStart = () => {
    window.location.href = `/interview/${interview._id}`;
  };

  useEffect(() => {
    fetchData();
  }, [setCandidate]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/candidate/${interview.candidate_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setCandidate(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  return (
    <div className="InterviewCard-main flex flex-row">
      <div className="InterviewCandidate-Main flex flex-column">
        <div className="InterviewCandidate flex flex-row">
          <div className="InterviewCandidate-Name">{interview.candidate_name},</div>
          <div className="InterviewCandidate-Role"> {interview.candidate_role}</div>
        </div>
        {/* to={`/candidate/feedback/${interview.candidate_id}`} */}
        <div className="Interview-Time">{formattedTime}</div>
      </div>
      <button className={`StartInterview ${interview.isCompleted?"collapsed":""}`} onClick={() => (onStart())}>Start</button>
      <Link to={`/candidate/feedback/${interview.candidate_id}`} className={`StartInterview ${interview.isCompleted?"":"collapsed"}`}>Feedback</Link>
    </div>
  );
}
