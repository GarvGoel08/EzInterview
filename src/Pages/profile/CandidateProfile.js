import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./CandidateProfile.css";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../../firebase";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Dashboard from "../Dashboard/Dashboard";

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [downloadURL, setDownloadURL] = useState(null); // State to store the download URL
  const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility

  useEffect(() => {
    console.log("changes");
    fetchData();
  }, [candidate?.pdf_url, id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/candidate/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch candidate data");
      }
      const data = await response.json();
      setCandidate(data);
    } catch (error) {
      console.error("Error fetching candidate data:", error.message);
    }
  };

  const handleImageSubmit = async (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then(async (urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
          const downloadURL = urls[0];
          console.log(downloadURL);
          await savePDFURL(downloadURL); // Pass the download URL to the savePDFURL function
        })
        .catch((err) => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };
  const clickeddev = () => {
    const downloadLink = document.querySelector(".download-link");
    if (downloadLink) {
      downloadLink.click();
    } else {
      console.error("Download link not found");
    }
  };
  const savePDFURL = async (downloadURL1) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/candidate/save-pdf-url`,
        {
          pdf_url: downloadURL1,
          candidateId: id,
        }
      );
      console.log(downloadURL);
      console.log("PDF URL saved successfully:", response.data);
      await fetchData();
    } catch (error) {
      console.error("Error saving PDF URL:", error.message);
    }
  };

  const deletePDFURL = async () => {
    try {
      // Send a request to your API to delete the PDF URL
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/candidate/save-pdf-url`,
        {
          pdf_url: null,
          candidateId: id,
        }
      );
      await fetchData();
      console.log("PDF URL deleted successfully");
      // Set downloadURL state to null
      setDownloadURL(null);
    } catch (error) {
      console.error("Error deleting PDF URL:", error.message);
    }
  };

  useEffect(() => {
    const button = document.querySelector(".button1");
    if (button) {
      button.addEventListener("click", () => {
        button.classList.add("active");
        setTimeout(() => {
          button.classList.remove("active");

          const span = button.querySelector("span");
          if (span) {
            span.innerText = "Fetching";
          }
        }, 1000);
      });
    }
  }, []);
  useEffect(() => {
    const button = document.querySelector(".button2");
    if (button) {
      button.addEventListener("click", () => {
        button.classList.add("active");
        setTimeout(() => {
          button.classList.remove("active");

          const span = button.querySelector("span");
          if (span) {
            span.innerText = "Removing";
          }
        }, 1000);
      });
    }
  }, []);
  const updateCandidate = async () => {
    try {
      setLoading(true);
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/candidate/update/${id}`,
        candidate
      );
      setLoading(false);
      setShowUpdate(true);
      setTimeout(() => {
        setShowUpdate(false);
      }, 3000);

      console.log("Candidate updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating candidate:", error.message);
    }
  };

  return (
    <div className="flex flex-row">
      <Dashboard />
      <div className="profile-container" style={{ flexGrow: "1" }}>
        {candidate ? (
          <div className="profile-card">
            <h2>{candidate.name}'s Profile</h2>
            <div className="reset-h cand-container " style={{marginBottom: '24px', marginTop: '18px'}}>
              <div className="icon"></div>
              <div className="titles">
                <div
                  className="flex flex-row"
                  style={{ marginBottom: "12px", alignItems: "center" }}
                >
                  <img
                    src="../Images/enail-logo.png"
                    className="title-logo"
                  ></img>
                  <input
                    style={{ margin: "0" }}
                    type="text"
                    className="email"
                    defaultValue={candidate.email}
                    onChange={(e) =>
                      setCandidate({ ...candidate, email: e.target.value })
                    }
                  />
                </div>
                <div
                  className="flex flex-row"
                  style={{ marginBottom: "12px", alignItems: "center" }}
                >
                  <img src="../Images/role.png" className="title-logo"></img>
                  <input
                    style={{ margin: "0" }}
                    type="text"
                    className="role"
                    defaultValue={candidate.role}
                    onChange={(e) =>
                      setCandidate({ ...candidate, role: e.target.value })
                    }
                  />
                </div>
                <div
                  className="flex flex-row"
                  style={{ marginBottom: "12px", alignItems: "center" }}
                >
                  <img src="../Images/status.png" className="title-logo"></img>
                  <input
                    style={{ margin: "0" }}
                    type="text"
                    className="status"
                    defaultValue={candidate.current_status}
                    onChange={(e) =>
                      setCandidate({
                        ...candidate,
                        current_status: e.target.value,
                      })
                    }
                    disabled
                  />
                </div>
                <div
                  className="flex flex-row"
                  style={{ marginBottom: "12px", alignItems: "center" }}
                >
                  <img src="../Images/phone.svg" className="title-logo"></img>
                  <input
                    style={{ margin: "0" }}
                    type="text"
                    className="contact"
                    defaultValue={candidate.contact}
                    onChange={(e) =>
                      setCandidate({ ...candidate, contact: e.target.value })
                    }
                  />
                </div>
                <div
                  className="flex flex-row"
                  style={{ marginBottom: "12px", alignItems: "center" }}
                >
                  <img src="../Images/status.png" className="title-logo"></img>
                  <input
                    style={{ margin: "0" }}
                    type="text"
                    className="skills"
                    defaultValue={candidate.skills.join(", ")}
                    onChange={(e) =>
                      setCandidate({
                        ...candidate,
                        skills: e.target.value.split(","),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            {/* Conditional rendering based on the presence of PDF URL */}
            {candidate.pdf_url ? (
              <div>
                <a
                  href={candidate.pdf_url}
                  className="download-link"
                  download
                  style={{ display: "none" }}
                >
                  Download PDF
                </a>
                <div className="button1" onClick={clickeddev}>
                  Open Resume
                </div>
                <div className="button2" onClick={deletePDFURL}>
                  Delete Resume
                </div>{" "}
                <div className="button2" style={{marginBottom: '16px'}} onClick={updateCandidate}>
                        {loading
                          ? "Loading..."
                          : showUpdate
                          ? "Profile Updated"
                          : "Update Profile"}
                </div>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFiles(e.target.files)}
                />
                <button
                  type="button"
                  style={{
                    backgroundColor: "#5DA394",
                    borderRadius: "5px",
                    marginTop: "10px",
                  }}
                  disabled={uploading}
                  onClick={handleImageSubmit}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>Loading candidate data...</p>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;
