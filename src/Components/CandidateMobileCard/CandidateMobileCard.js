// CandidateMobileCard.js

import React from "react";
import { Link } from "react-router-dom";
import "./CandidateMobileCard.css";

const CandidateMobileCard = ({
  candidate,
  deleteCandidate,
  hireCandidate,
  notSelectedCandidate,
}) => {
  const { name, email, role, current_status } = candidate;

  return (
    <div className="candidate-mobile-card">
      <div className="candidate-mobile-card-header">
        <div className="candidate-card-header-left">
          <Link to={`/candidates/${candidate._id}`}>{name}</Link>
          <p className="candidate-para">
            <span>Role:</span> {role}
          </p>
        </div>
        <div className="candidate-card-header-right">
          <p className="active-status candidate-para">{current_status}</p>
        </div>
        <p className="candidate-para">
          <span>Email:</span>
          <span>{email}</span>
        </p>
      </div>
      <div className="candidate-card-footer">
        <button
          className="create-candidate1"
          onClick={() => deleteCandidate(candidate._id)}
        >
          Delete
        </button>
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
  );
};

export default CandidateMobileCard;
