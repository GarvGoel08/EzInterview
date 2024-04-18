import React from "react";
import "./CandidateCard.css";
import { Link } from "react-router-dom";

export default function CandidateCard({ 
  candidate,
  deleteCandidate,
  hireCandidate,
  notSelectedCandidate,}) {
  const { name, email, role, current_status } = candidate;
  return (
    <div>
      <div className="flex flex-row candidate-card">
        <div className="candidate-card-header">
          <div className="candidate-name">{candidate.name}</div>
          <div className="candidate-role">{candidate.role}</div>
        </div>
        <div className="candidate-card-status">{candidate.current_status}</div>
        <div className="candidate-card-button">
          <Link
            to={`/candidates/${candidate._id}`}
            className="create-candidate1 create-desktop"
          >
            View Profile
          </Link>
          {current_status === "Hired" ? (
            <button className="create-candidate1" disabled>
              Hired
            </button>
          ) : (
            <button
              className="create-candidate1"
              onClick={() => hireCandidate(candidate._id)}
            >
              Hire
            </button>
          )}
          {current_status === "Not Selected" ? (
            <button className="create-candidate1" disabled>
              Not Selected
            </button>
          ) : (
            <button
              className="create-candidate1"
              onClick={() => notSelectedCandidate(candidate._id)}
            >
              Not Selected
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
