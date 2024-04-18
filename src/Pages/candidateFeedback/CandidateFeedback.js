import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import StarRatings from "react-star-ratings";
import "./CandidateFeedback.css";
import Navbar from "../../Components/Navbar/Navbar";

export default function CandidateFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [candidateDetails, setCandidateDetails] = useState({});
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(null);
  const [submittedRating, setSubmittedRating] = useState(null);
  const [submittedRemarks, setSubmittedRemarks] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchFeedbackList();
    fetchCandidateDetails();
    setSubmittedRating(feedbackList[0]?.rating);
    setSubmittedRating(feedbackList[0]?.remark);
  }, []);

  const fetchFeedbackList = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/interview/getByCandidate/${id}`);
      setFeedbackList(response.data);
      setSubmittedRating(response.data[0]?.rating);
      setSubmittedRemarks(response.data[0]?.remark);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchCandidateDetails = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/${id}`);
      setCandidateDetails(response.data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChangeRating = (newRating) => {
    setRating(newRating);
  };

  const handleChangeRemarks = (e) => {
    setRemarks(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/interview/feedback/${id}`, {
        rating,
        remark: remarks,
      });
      setSubmittedRating(rating);
      setSubmittedRemarks(remarks);
      setRating(0);
      setRemarks("");

      fetchFeedbackList();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEdit = () => {
    setSubmittedRating(null);
    setSubmittedRemarks(null);
  };

  return (
    <div className="flex flex-row">
      <Navbar />
      
    <div className="feedback-container">
      <h2>Interview Feedback</h2>
      {error && <p>Error: {error}</p>}
      {/* Candidate Details */}
      <div>
        <p>Candidate Name: {candidateDetails.name}</p>
        <p>Contact: {candidateDetails.contact}</p>
        <p>Email: {candidateDetails.email}</p>
        <p>Skills: {candidateDetails.skills && candidateDetails.skills.join(", ")}</p>
        <p>Role: {candidateDetails.role}</p>
        <p>Current Status: {candidateDetails.current_status}</p>
      </div>

      {/* Feedback Table */}
      <table className="feedback-table">
        <thead>
          <tr>
            <th>Interview Date and Time</th>
            <th>Out of Tab Time</th>
            <th>Look Away Time</th>
            <th>Rating</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {feedbackList.map((feedback, index) => (
            <tr key={index}>
              <td>{new Date(feedback.scheduled_time).toLocaleString()}</td>
              <td>{Math.round(feedback.outoftab_time)}s</td>
              <td>{feedback.looking_away_time}s</td>
              <td>{feedback.rating}</td>
              <td>{feedback.remark}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Feedback Form */}
      {isEditing || (!submittedRating && !submittedRemarks) ? (
        <form onSubmit={handleSubmit} className="feedback-form">
          <div>
            <label>Rating:</label>
            <StarRatings
              rating={rating}
              starRatedColor="#388E3C"
              starHoverColor="#388E3C"
              changeRating={handleChangeRating}
              numberOfStars={5}
              name="rating"
            />
          </div>
          <div>
            <label>Extra Remarks:</label>
            <textarea
              value={remarks}
              onChange={handleChangeRemarks}
              required
              style={{
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                minWidth: '100%'
              }}
            />
          </div>
          <button type="submit" className="submit-button">Submit Feedback</button>
        </form>
      ) : (
        <button onClick={handleEdit} className="edit-button">Edit</button>
      )}
    </div>
    </div>
  );
}
