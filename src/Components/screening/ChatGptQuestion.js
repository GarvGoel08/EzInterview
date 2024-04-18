import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import * as faceapi from "face-api.js";
import Webcam from "react-webcam";
import "./ChatGptQuestion.css";
import io from "socket.io-client";

const ChatGptQuestion = () => {
  const [questions, setQuestions] = useState([]);
  const [questionTimeStamp, setTimeStap] = useState([0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [loading, setLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const { id, testId } = useParams();
  const webcamRef = useRef(null);
  const [isLookingAtCamera, setIsLookingAtCamera] = useState(false);
  const [currentLoc, setCurrentLoc] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [lookDuration, setLookDuration] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isTabActive, setIsTabActive] = useState(true);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (socket) {
        socket.emit("back-in-tab");
      }
    };

    const handleWindowBlur = () => {
      if (socket) {
        socket.emit("out-of-tab");
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [socket]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(
            "https://ez-interview-frontend.vercel.app/models"
          ),
          faceapi.nets.faceLandmark68Net.loadFromUri(
            "https://ez-interview-frontend.vercel.app/models"
          ),
          faceapi.nets.faceRecognitionNet.loadFromUri(
            "https://ez-interview-frontend.vercel.app/models"
          ),
        ]);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Failed to load models:", error);
        setNotification({
          message:
            "Failed to load models. Please check the console for errors.",
          type: "error",
        });
      }
    };

    const detectFace = async () => {
      if (!modelsLoaded || !webcamRef.current || !webcamRef.current.video) {
        return;
      }

      const video = webcamRef.current.video;

      const result = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (result) {
        const landmarks = result.landmarks;
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        const avgEyeX =
          (leftEye.map((pt) => pt._x).reduce((a, b) => a + b, 0) /
            leftEye.length +
            rightEye.map((pt) => pt._x).reduce((a, b) => a + b, 0) /
              rightEye.length) /
          2;
        const avgEyeY =
          (leftEye.map((pt) => pt._y).reduce((a, b) => a + b, 0) /
            leftEye.length +
            rightEye.map((pt) => pt._y).reduce((a, b) => a + b, 0) /
              rightEye.length) /
          2;

        const canvasCenterX = video.videoWidth / 2;
        const canvasCenterY = video.videoHeight / 2;

        setCurrentLoc(
          `X: ${Math.abs(avgEyeX - canvasCenterX)} Y: ${Math.abs(
            avgEyeY - canvasCenterY
          )}`
        );

        const isLooking =
          Math.abs(avgEyeX - canvasCenterX) < 50 &&
          Math.abs(avgEyeY - canvasCenterY) < 100;
        setIsLookingAtCamera(isLooking);
        console.log(socket);
        if (socket) {
          if (isLooking && socket) {
            socket.emit("look-back");
          } else if (socket) {
            socket.emit("look-away");
          }
        }
      } else {
        if (socket) {
          socket.emit("look-away");
        }
        setIsLookingAtCamera(false);
        setLookDuration(0);
      }
    };

    loadModels().then(() => {
      const intervalId = setInterval(detectFace, 1000);

      return () => {
        clearInterval(intervalId);
      };
    });
  }, [modelsLoaded, socket]);

  function randomID(len) {
    let result = "";
    if (result) return result;
    var chars =
        "12345qwertyuiopasdfgh67890jklmnbvcxzMNBVCZXASDQWERTYHGFUIOLKJP",
      maxPos = chars.length,
      i;
    len = len || 5;
    for (i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return result;
  }

  const candidateId = id;
  let timer;
  useEffect(() => {
    if (quizStarted && timeLeft >= 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
        if (timeLeft === 0) {
          clearInterval(timer);
          handleSubmitQuiz();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, timeLeft]);

  const handleGenerateQuestions = async () => {
    try {
      //Generate Questions only if WebCam is active
      if (!isLookingAtCamera) {
        alert("Please look at the camera to start the test");
        return;
      }
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/test/get-question/${testId}`,
        {}
      );
      setQuestions(response.data[0].questions);
      setQuizStarted(true);
      setLoading(false);
      initializeSocket();
    } catch (error) {
      setLoading(false);
      console.error("Error generating questions:", error.message);
    }
  };
  const initializeSocket = () => {
    const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);
    setSocket(socket);
    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
      socket.emit("connect-test", { testID: testId, candidate_id: id });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });

    return socket;
  };

  const handleNextQuestion = () => {
    setTimeStap((prevTimeStap) => [...prevTimeStap, 300 - timeLeft]);
    console.log(questionTimeStamp);
    socket.emit("Answer", {
      questionNo: currentQuestionIndex,
      answer: answers[currentQuestionIndex],
      time_taken: 300 - timeLeft - questionTimeStamp[currentQuestionIndex],
    });
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
  };

  const handleSaveAnswer = (answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestionIndex]: answer,
    }));
  };

  const handleSubmitQuiz = () => {
    let totalScore = 0;
    let answeredAllQuestions = true;
    questions.forEach((question, index) => {
      if (!answers[index]) {
        answeredAllQuestions = false;
      } else if (answers[index].startsWith(question.correct_option)) {
        totalScore++;
      }
    });

    setScore(totalScore);
    clearInterval(timer);
    socket.emit("End-Test", { totalScore, totalTime: 300 - timeLeft });
    console.log("Submission successful:");
    setSubmissionStatus("success");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="container">
      <div className="content1">
        <h2>This is just a small test for checking your mentioned skills</h2>

        {!quizStarted && !loading && (
          <button className="blue-button" onClick={handleGenerateQuestions}>
            Start Test
          </button>
        )}
        {loading && <p>Loading...</p>}
        {quizStarted && submissionStatus !== "success" && !loading && (
          <div>
            <div className="timer">Time Left: {formatTime(timeLeft)}</div>
            {questions && questions.length > 0 && (
              <div>
                <h3>Question {currentQuestionIndex + 1}</h3>
                <p className="question">
                  {questions[currentQuestionIndex].question}
                </p>
                <ul className="options">
                  {questions[currentQuestionIndex].options.map(
                    (option, optionIndex) => (
                      <li key={optionIndex}>
                        <label>
                          <input
                            type="radio"
                            value={option}
                            checked={answers[currentQuestionIndex] === option}
                            onChange={() => handleSaveAnswer(option)}
                          />
                          <span>{option}</span>
                        </label>
                      </li>
                    )
                  )}
                </ul>
                <div>
                  {" "}
                  {currentQuestionIndex < questions.length - 1 && (
                    <button
                      className="blue-button"
                      onClick={handleNextQuestion}
                    >
                      Next
                    </button>
                  )}
                  {currentQuestionIndex === questions.length - 1 && (
                    <button className="blue-button" onClick={handleSubmitQuiz}>
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )}
            {score != null && (
              <p className="score">
                Your score: {score} / {questions.length}
              </p>
            )}
          </div>
        )}

        {submissionStatus === "success" && (
          <p className="success-message">
            Test submitted successfully! Have a Nice Day
          </p>
        )}
        {submissionStatus === "error" && (
          <p className="error-message">
            Error submitting test. May Be you have already submitted if not
            Please try again later.
          </p>
        )}
      </div>

      <Webcam
        style={{
          position: "absolute",
          bottom: "0",
          right: "0",
          height: "100px",
        }}
        ref={webcamRef}
      />
    </div>
  );
};

export default ChatGptQuestion;
