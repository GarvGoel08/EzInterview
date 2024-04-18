import { useDispatch, useSelector } from "react-redux";
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CandidateList.css'; // Import CSS file for styling

function CandidateList() {
    const [candidates, setCandidates] = useState([]);
    const [candidateData, setCandidateData] = useState({});
    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        async function fetchCandidates() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/submission/company/${currentUser._id}`);
                const data = await response.json();
                setCandidates(data);
            } catch (error) {
                console.error('Error fetching candidates:', error);
            }
        }
        fetchCandidates();
    }, [currentUser._id]);

    useEffect(() => {
        async function fetchCandidateDetails(candidateId) {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/candidate/${candidateId}`);
                const data = await response.json();
                setCandidateData(prevData => ({ ...prevData, [candidateId]: data }));
            } catch (error) {
                console.error('Error fetching candidate details:', error);
            }
        }

        candidates.forEach(candidate => {
            fetchCandidateDetails(candidate.candidate_id);
        });
    }, [candidates]);

    return (
        <div className="candidate-list-container" style={{maxHeight: '100vh', boxSizing: 'border-box', overflowY: 'auto'}}>
            <h1 className="candidate-list-heading">Candidate Screening Test List </h1>
            <table className="candidate-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Total Score</th>
                        <th>Time taken</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(candidate => (
                        <tr key={candidate._id}>
                            <td>
                                <Link to={`/candidates/score/${candidate.candidate_id}`}>
                                    {candidateData[candidate.candidate_id] ? candidateData[candidate.candidate_id].name : 'Loading...'}
                                </Link>
                            </td>
                            <td>{candidateData[candidate.candidate_id] ? candidateData[candidate.candidate_id].email : 'Loading...'}</td>
                            <td>{candidateData[candidate.candidate_id] ? candidateData[candidate.candidate_id].role : 'Loading...'}</td>
                            <td>{candidateData[candidate.candidate_id] ? candidateData[candidate.candidate_id].contact : 'Loading...'}</td>
                            <td>{candidate.test_score} </td>
                            <td>{candidate.time_taken} sec</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CandidateList;
