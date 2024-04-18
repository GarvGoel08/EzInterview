import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './CandidateScore.css';

function CandidateScore() {
    const [submissions, setSubmissions] = useState([]);
    const [questions, setQuestions] = useState([]);
    const { candidateId } = useParams();

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/submission/candidate/${candidateId}`);
                const data = await response.json();
                setSubmissions(data);
            } catch (error) {
                console.error('Error fetching submissions:', error);
            }
        }
        fetchSubmissions();
    }, [candidateId]);

    useEffect(() => {
        async function fetchQuestionsForSubmissions() {
            try {
                // Array to hold all the fetch promise
                const fetchPromises = submissions.map(async submission => {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/test/get-question/${submission.test_id}`);
                    return response.json();
                });
                // Wait for all fetch operations to complete
                const questionsData = await Promise.all(fetchPromises);
                // Flatten the array of arrays into a single array of questions
                const allQuestions = questionsData.flat();
                setQuestions(allQuestions);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        }
        fetchQuestionsForSubmissions();
    }, [submissions]);

    return (
        <div className="candidate-score-container">
            <h1>Candidate Score</h1>
            {submissions.map((submission, index) => (
                <div key={submission._id} className="submission-container" style={{display: 'flex', flexDirection: 'column'}}>
                    <div className="submission-details">
                        <p>Test Score: {submission.test_score}</p>
                        <p>Time Taken: {submission.time_taken} sec</p>
                        <p>Out Of Tab Time: {submission.outoftab_time} sec</p>
                        <p>Looking Away Time: {submission.looking_away_time} sec</p>
                    </div>
                    <ul className="question-list">
                        {questions
                            .filter(questionSet => questionSet.testId === submission.test_id)
                            .map(questionSet => (
                                questionSet.questions.map((question, qIndex) => {
                                    const correctAnswerIndex = question.options.findIndex(option => option.startsWith(question.correct_option)) ;
                                    const correctAnswer = question.options[correctAnswerIndex];
                                    const candidateAnswer = submission.answers[qIndex]?.answer?submission.answers[qIndex].answer: null;
                                    const candidateTime = submission.answers[qIndex]?.time_taken;
                                    const isCorrect = correctAnswer === candidateAnswer;
                                    const answerClass = isCorrect ? 'correct-answer' : 'incorrect-answer';
                                    return (
                                        <li key={qIndex} className="question-item">
                                            <p>Question: {question.question}</p>
                                            <p className="correctAnswer">Correct Answer: {correctAnswer}</p>
                                            <p>Chosen Answer: {candidateAnswer?candidateAnswer: "Not Answered"}</p>
                                            <p>Time Taken: {candidateTime ? candidateTime : 0}</p>
                                            <p className={answerClass}>{isCorrect ? 'Correct' : 'Incorrect'}</p>
                                        </li>
                                    );
                                })
                            ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}

export default CandidateScore;
