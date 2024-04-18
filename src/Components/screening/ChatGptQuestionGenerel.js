import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import "./ChatGptQuestionGenerel.css"
import Navbar from '../Navbar/Navbar';

const ChatGptQuestionGenerel = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidates, setSelectedCandidates] = useState([]);
    const [showCandidates, setShowCandidates] = useState(false); // State to control candidate list visibility
    const [roles, setRoles] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [emailSent, setEmailSent] = useState(false); // State to track email sending success
    const [currentTaskId, setCurrentTest] = useState(null);

    const { currentUser } = useSelector((state) => state.user);

    useEffect(() => {
        fetchData();
    }, [currentUser._id]);

    function randomID(len) {
        let result = "";
        if (result) return result;
        var chars = "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
            maxPos = chars.length,
            i;
        len = len || 5;
        for (i = 0; i < len; i++) {
            result += chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return result;
    }

    const testId = randomID(10);

    const fetchData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate/get-all/${currentUser._id}`, { withCredentials: true });
            const data = await response.data;
            setCandidates(data);

            // Extracting unique roles from candidates
            const uniqueRoles = [...new Set(data.map(candidate => candidate.role))];
            setRoles(uniqueRoles);
        } catch (error) {
            console.error('Error fetching candidates:', error.message);
        }
    };

    const handleGenerateQuestions = async () => {
        try {
            const currentTest =  testId;
            setCurrentTest(currentTest);
            setLoading(true);
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/test/auto-generate`, {
                question: `Ask 10 questions for skills related to ${prompt} `,
                user: currentUser._id,
                testId: currentTest
            });
            console.log(currentTest);
            console.log(currentTaskId);
            setQuestions(response.data.questions);
        } catch (error) {
            console.error('Error generating questions:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmail = () => {
        if (selectedCandidates.length === 0) {
            alert("Please select at least one candidate before sending the email.");
            return; // Exit function if no candidates are selected
          } 
          if (questions.length === 0) {
            alert("Please generate question first.");
            return; // Exit function if no candidates are selected
          } 
        const selectedEmails = selectedCandidates.map(candidateId => {
            const selectedCandidate = candidates.find(candidate => candidate._id === candidateId);
            return selectedCandidate ? selectedCandidate.email : '';
        });
        axios.post(`${process.env.REACT_APP_API_URL}/test/send-email`, {
            candidateIds: selectedCandidates,
            companyId: currentUser._id,
            testId: currentTaskId
        })
            .then(response => {
                console.log('Email sent successfully',selectedCandidates);
                setEmailSent(true);
                setTimeout(() => {
                    setEmailSent(false);
                }, 3000);
            })
            .catch(error => {
                console.error('Error sending email:', error.message);
            });
    };

    const handleCandidateSelection = (e) => {
        const candidateId = e.target.value;
        const isChecked = e.target.checked;

        if (isChecked) {
            setSelectedCandidates(prevSelected => [...prevSelected, candidateId]);
        } else {
            setSelectedCandidates(prevSelected => prevSelected.filter(id => id !== candidateId));
        }
    };

    const handleRoleFilter = (selectedRole) => {
        const filteredCandidates = candidates.filter(candidate => candidate.role === selectedRole);
        setSelectedCandidates(filteredCandidates.map(candidate => candidate._id));
    };

    return (
        <div className='flex flex-row'>
            <Navbar/>
            <div style={{flexGrow: '1'}} className="content2">
                <div className="question-generation">
                    <div className="question-generation1">
                        <h1>Generate Questions</h1>
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Type Required Skills seperated by commas here..."
                        />
                    </div>
                    <button onClick={handleGenerateQuestions} disabled={!prompt || loading}>Generate Questions</button>
                    {loading && <p>Generating questions...</p>}
                    {questions.length > 0 && (
                        <div className='genreteQuestion'>
                            <h2>Generated Questions:</h2>
                            {questions.map((questionData, index) => (
                                <div key={questionData.id} style={{ marginBottom: '20px' }}>
                                    <h3>Question {questionData.id}:</h3>
                                    <p>{questionData.question}</p>
                                    <ul>
                                        {questionData.options.map((option, optionIndex) => (
                                            <li key={optionIndex}>{option}</li>
                                        ))}
                                    </ul>
                                    <p>Correct Option: {questionData.correct_option}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="candidate-selection">
                    <h2>Select Candidates for Test:</h2>
                    <div className="roles">
                        <h3>Select Role:</h3>
                        {roles.map((role, index) => (
                            <button key={index} onClick={() => handleRoleFilter(role)}>{role}</button>
                        ))}
                    </div>
                    <div className="candidates">
                        {candidates.map(candidate => (
                            <div className='checkbox-container' key={candidate._id}>
                                <input
                                    type="checkbox"
                                    value={candidate._id}
                                    onChange={handleCandidateSelection}
                                    checked={selectedCandidates.includes(candidate._id)}
                                />
                                <label>{candidate.name}</label>
                            </div>
                        ))}
                    </div>
                    <div className='sendEmail'><button onClick={handleSendEmail}>Send Test Link via Email</button></div>
                    {emailSent && <p className="success-message">Email sent successfully!</p>}
                </div>
            </div>
        </div>
    );
};

export default ChatGptQuestionGenerel;
