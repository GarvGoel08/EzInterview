import React, { useRef, useEffect, useState } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useParams } from "react-router-dom";
import io from "socket.io-client";

export default function Meet() {
  const meetRef = useRef(null);
  const webcamRef = useRef(null);
  const [isLookingAtCamera, setIsLookingAtCamera] = useState(false);
  const [currentLoc, setCurrentLoc] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [lookDuration, setLookDuration] = useState(0);
  const {id} = useParams();
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
          faceapi.nets.tinyFaceDetector.loadFromUri("../models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("../models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("../models"),
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
        setIsLookingAtCamera(isLooking)
        console.log(socket);
        if (socket) {
          if (isLooking) {
            socket.emit("look-back");
          } else {
            socket.emit("look-away");
          }
        }
      } else {
        socket.emit("look-away");
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
  }, [modelsLoaded,socket]);

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
  useEffect(() => {
    const roomID = id;
    const appID = 1842355862;
    const serverSecret = "f7994352e134f4ae2e8f4c3589316b37";
    const userID = "Candidate"; 

    const generateKitToken = async () => {
      const timestamp = Date.now();
      const kitToken = await ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        randomID(5),
        userID
      );
      return kitToken;
    };

    const initializeZegoSDK = async () => {
      const kitToken = await generateKitToken();
      const zc = ZegoUIKitPrebuilt.create(kitToken);
      zc.joinRoom({
        container: meetRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showScreenSharingButton: true,
        turnOnMicrophoneWhenJoining: true,
      });
    };

    initializeZegoSDK();
  }, []);
  
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_SOCKET_URL}`);
    setSocket(socket);
    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
      socket.emit("connect-room", { roomID: id });
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Webcam style={{visibility: 'hidden', position: 'absolute'}} ref={webcamRef} />
    </div>
  );
}
