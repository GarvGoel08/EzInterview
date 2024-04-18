import React, { useState } from "react";
import "./CreateCandidate.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CreateCandidate = ({ open }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    skills: [],
    role: "",
    current_status: "Waiting",
    company_id: currentUser?._id, 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "skills") {
     
      const skillsArray = value.split(",").map((skill) => skill.trim());
      setFormData((prevState) => ({
        ...prevState,
        [name]: skillsArray,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };
  const [className, setClassName] = useState("submit1");
  const handleClick = () => {
    
    if (className === "submit1") {
      setClassName("changed");
    } else {
      setClassName("submit1");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      handleClick();
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/candidate/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create candidate");
      }

     
      setFormData({
        name: "",
        email: "",
        contact: "",
        skills: [],
        role: "",
        current_status: "Waiting",
        company_id: currentUser._id,
      });

     
      console.log("Candidate created successfully");
      open(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating candidate:", error.message);

      
    }
  };

  return (
    <div className="create-candidate-container">
      <h2>Create Candidate</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="input-field-email"
          />
        </div>
        <div className="form-group">
          <label>Contact:</label>
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Skills:</label>
          <input
            type="text"
            name="skills"
            value={formData.skills.join(", ")}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="input-field"
          />
        </div>
        
        <button type="submit" className={className}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default CreateCandidate;
