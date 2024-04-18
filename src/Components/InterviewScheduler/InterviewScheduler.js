import React, { useEffect, useState } from "react";
import "./InterviewScheduler.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const InterviewScheduler = ({ open }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    candidate_id: "",
    candidate_name: "",
    candidate_role: "",
    scheduled_time: "", // No need to set initial value here
    company_id: currentUser?._id,
  });
  const [candidateData, setCandidateData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []); // Only fetch candidate data once when component mounts

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/get-all/${currentUser?._id}`, { withCredentials: true });
      const data = await response.data;
      setCandidateData(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (name === "candidate_id") {
      const selectedCandidate = candidateData.find(candidate => candidate._id === value);
      if (selectedCandidate) {
        setFormData(prevState => ({
          ...prevState,
          candidate_name: selectedCandidate.name,
          candidate_role: selectedCandidate.role,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/interview/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create Interview");
      }

      setFormData({
        candidate_id: "",
        candidate_name: "",
        candidate_role: "",
        scheduled_time: "",
        company_id: currentUser?._id,
      });

      console.log("Interview created successfully");
      window.location.reload(); // Reloading the page to update the list of interviews
    } catch (error) {
      console.error("Error creating candidate:", error.message);
    }
  };

  // Function to get the current date and time in the required format
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="create-candidate-container">
      <h2>Create Candidate</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="candidate_id">Candidate ID</label>
          <select
            name="candidate_id"
            value={formData.candidate_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Candidate</option>
            {candidateData.map((candidate) => (
              <option key={candidate._id} value={candidate._id}>
                {candidate.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="scheduled_time">Scheduled Time</label>
          <input
            type="datetime-local"
            className="form-control"
            id="scheduled_time"
            name="scheduled_time"
            value={formData.scheduled_time}
            onChange={handleChange}
            min={getCurrentDateTime()} // Set min attribute to current date and time
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>
    </div>
  );
};

export default InterviewScheduler;
