import React, { useState, useEffect } from "react";
import "./CandidatesList.css";
import CreateCandidate from "../CreateCandidate";
import { Link } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import CandidateMobileCard from "../../../Components/CandidateMobileCard/CandidateMobileCard";
import CandidateCard from "../../../Components/CandidateCard/CandidateCard";

const Candidates = ({ setProgress }) => {
  const [Tab, setTab] = useState("all");
  const [candidateData, setCandidateData] = useState([]);
  const [open, setOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [setCandidateData]);

  const updateCandidateStatus = async (id, newStatus) => {
    try {
      setProgress(25);
      await axios.put(
        `${process.env.REACT_APP_API_URL}/candidate/update-status/${id}`,
        { newStatus },
        { withCredentials: true }
      );
      setProgress(100);
      fetchData();
    } catch (error) {
      console.error(
        `Error updating candidate status to ${newStatus}:`,
        error.message
      );
    }
  };

  const hireCandidate = (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to hire this candidate? This action will send an email to the candidate.`
    );
    if (!confirmed) return;
    updateCandidateStatus(id, "Hired");
  };

  const notSelectedCandidate = (id) => {
    const confirmed = window.confirm(
      `Are you sure you want to not select this candidate? This action will send an email to the candidate.`
    );
    if (!confirmed) return;
    updateCandidateStatus(id, "Not Selected");
  };

  const fetchData = async () => {
    try {
      setProgress(25);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/candidate/get-all/${currentUser?._id}`,
        { withCredentials: true }
      );
      setProgress(75);
      const data = await response.data;
      setCandidateData(data);
      setProgress(100);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const deleteCandidate = async (id) => {
    try {
      setProgress(25);
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/candidate/delete/${id}`,
        { withCredentials: true }
      );
      setProgress(100);
      fetchData();
    } catch (error) {
      console.error("Error deleting candidate:", error.message);
    }
  };

  const filteredCandidates = candidateData.filter(
    (candidate) =>
      (candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.role.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (Tab === "all" ||
        (Tab === "waiting" &&
          candidate.current_status.toLowerCase() === "waiting") ||
        (Tab === "interviewScheduled" &&
          candidate.current_status.toLowerCase() === "interview scheduled") ||
        (Tab === "testSubmitted" &&
          candidate.current_status.toLowerCase() === "test submitted"))
  );

  return (
    <div className="candidates-container">
      <h1>Candidates</h1>

      <div className="Filters-Div">
        <div className="filters">
          <input
            type="text"
            className="candidates-filter"
            placeholder="Name or Email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            type="dropdown"
            className="candidates-filter candidates-filter-select"
            placeholder="Role"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          >
            {/* Default as NULL */}
            <option value="">Role</option>
            <option value="Frontend Developer">Frontend Developer</option>
          </select>
          <select
            className="candidates-filter candidates-filter-select"
            value={Tab}
            onChange={(e) => setTab(e.target.value)}
          >
            <option value="all">All</option>
            <option value="waiting">Waiting</option>
            <option value="testSubmitted">Test Submitted</option>
            <option value="interviewScheduled">Interview Scheduled</option>
          </select>
        </div>
        <button className="create-candidate" onClick={() => setOpen(!open)}>
          Create Candidate
        </button>
        {open && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setOpen(false)}>
                &times;
              </span>
              <CreateCandidate open={setOpen} />
            </div>
          </div>
        )}
      </div>
      <div className="candidate-laptop">
        {filteredCandidates.map((candidate) => (
          <CandidateCard
            key={candidate._id}
            candidate={candidate}
            deleteCandidate={deleteCandidate}
            hireCandidate={hireCandidate}
            notSelectedCandidate={notSelectedCandidate}
          />
        ))}
      </div>
      <div className="candidates-mob-table">
        {filteredCandidates.map((candidate) => (
          <CandidateMobileCard
            key={candidate._id}
            candidate={candidate}
            deleteCandidate={deleteCandidate}
            hireCandidate={hireCandidate}
            notSelectedCandidate={notSelectedCandidate}
          />
        ))}
      </div>
      <div className="pagination"></div>
    </div>
  );
};

export default Candidates;
