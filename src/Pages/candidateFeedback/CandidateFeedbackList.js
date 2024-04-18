import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './CandidateFeedbackList.css'; // Import CSS for styling

const CandidateFeedbackList = () => {
  const [interviews, setInterviews] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/interview/get/${currentUser._id}`);
        setInterviews(response.data);
      } catch (error) {
        console.error('Error fetching interviews:', error);
      }
    };

    fetchInterviews(); 
  }, []);

  return (
    <div className="candidate-feedback-list-container">
      <h2>Candidate Feedback List</h2>
      <table className="interview-table">
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Candidate Role</th>
            <th>Scheduled Time</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map(interview => (
            <tr key={interview._id}>
              <td><Link to={`/candidate/feedback/${interview.candidate_id}`}>{interview.candidate_name}</Link></td>
              <td>{interview.candidate_role}</td>
              <td>{new Date(interview.scheduled_time).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CandidateFeedbackList;
