import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateUserFailure,
  updateUserSuccess,
  updateUserStart,
} from "../../redux/user/userSlice";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import axios from "axios";
import { app } from "../../firebase";
import "./InterviewerProfile.css";

const InterviewerProfile = ({ setProgress }) => {
  const [hovered, setHovered] = useState(false);
  const fileInputRef = useRef(null); 
  const handleHover = () => {
    setHovered(!hovered);
    console.log("hello");
  };

  useEffect(() => {
    const button = document.querySelector(".button");
    if (button) {
      button.addEventListener("click", () => {
        button.classList.add("active");
        setTimeout(() => {
          button.classList.remove("active");

          const span = button.querySelector("span");
          if (span) {
            span.innerText = "Changes Saved";
          }
        }, 1000);
      });
    }
  }, []);

  const dispatch = useDispatch();
  setProgress(0);
  const { currentUser } = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
  });
  const [file, setFile] = useState(null);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    handleImageSubmit(selectedFile); // Automatically trigger upload when file is selected
  };

  const handleImageSubmit = async (selectedFile) => {
    try {
      setProgress(0);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + selectedFile.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
          setProgress(progress);
        },
        (error) => {
          console.error(error);
          setProgress(100);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            dispatch(updateUserStart());
            console.log("File available at", downloadURL);
            const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/user/update/${currentUser._id}`,
              { avatar: downloadURL },
              {
                headers: {
                  "auth-token": localStorage.getItem("auth-token"),
                },
              }
            );
            console.log("Image link uploaded successfully:", response.data);
            dispatch(updateUserSuccess(response.data));
          } catch (error) {
            console.error(error);
          }
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/user/update/${currentUser._id}`,
        formData,
        {
          headers: {
            "auth-token": localStorage.getItem("auth-token"),
          },
        }
      );
      dispatch(updateUserSuccess(response.data));
    } catch (error) {
      console.error("Error updating user:", error);
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="interviewer-profile-container">
      <div className="profile-details">
        <h2>Interviewer Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="profile-info">
            <div className="flex" style={{ justifyContent: "center" }}>
              <div
                className={`flex_image ${hovered ? "hovered" : ""}`}
                onMouseEnter={handleHover}
                onMouseLeave={handleHover}
                onClick={handleImageClick} // Open file explorer when clicked
              >
                <img
                  src={file ? URL.createObjectURL(file) : currentUser?.avatar}
                  alt="Avatar"
                />
                <img
                  src="./Images/upload.jpg"
                  alt="Another Image"
                  className="hover-image"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
            <div className="input-with-icon">
              <img
                src="./Images/enail-logo.png"
                className="email-logo"
                id="email-logo"
                style={{ transform: "none!important" }}
                alt="Email Logo"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
              />
            </div>
            <div className="input-with-icon">
              <img
                src="./Images/username.png"
                className="username"
                alt="Username"
              />
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                style={{ marginLeft: "10px" }}
              />
            </div>
            <div className="button">
              <div className="content">
                <button
                  type="submit"
                  style={{
                    backgroundColor: "transparent",
                    marginTop: "55px",
                    marginRight: "-26px",
                  }}
                >
                  <span className="button-text">Save</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewerProfile;
