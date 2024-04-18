import React, { useEffect, useState } from "react";
import "./Calendar.css";
import InterviewResults from "../InterviewResults/InterviewResults";
import InterviewCard from "../InterviewCard/InterviewCard";
import InterviewScheduler from "../InterviewScheduler/InterviewScheduler";
import { useSelector } from "react-redux";

const CalendarComponent = ({setProgress}) => {
  const [Open, setOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [uniqueRoles, setUniqueRoles] = useState([]);

  useEffect(() => {
    fetchInterviews();
  }, []);

  useEffect(() => {
    filterInterviews();
  }, [searchQuery, selectedRole, selectedStatus, interviews]);

  useEffect(() => {
    extractUniqueRoles();
  }, [interviews]);

  const fetchInterviews = () => {
    setProgress(25);
    fetch(`${process.env.REACT_APP_API_URL}/interview/get/${currentUser?._id}`)
      .then((res) => res.json())
      .then((data) => {
        setInterviews(data);
        setProgress(100);
      });
  };

  const filterInterviews = () => {
    let filtered = interviews.filter((interview) => {
      let match = true;
      if (
        searchQuery &&
        interview.candidate_name &&
        interview.candidate_name.toLowerCase().indexOf(searchQuery.toLowerCase()) ===
          -1
      ) {
        match = false;
      }
      if (selectedRole && interview.candidate_role !== selectedRole) {
        match = false;
      }
      if (selectedStatus === "completed" && !interview.isCompleted) {
        match = false;
      }
      if (selectedStatus === "not completed" && interview.isCompleted) {
        match = false;
      }
      return match;
    });
    setFilteredInterviews(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case "search":
        setSearchQuery(value);
        break;
      case "roles":
        setSelectedRole(value);
        break;
      case "status":
        setSelectedStatus(value);
        break;
      default:
        break;
    }
  };

  const extractUniqueRoles = () => {
    const roles = interviews.map((interview) => interview.candidate_role);
    const uniqueRoles = [...new Set(roles)];
    setUniqueRoles(uniqueRoles);
  };

  return (
    <div style={{ flexGrow: 1 ,maxHeight: '100vh',overflowY: 'auto' }}>
      {Open ? (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setOpen(false)}>
              &times;
            </span>
            <InterviewScheduler open={setOpen} />
          </div>
        </div>
      ) : (
        ""
      )}
      <div className="flex flex-row InterviewMainFlex">
        <div className="InterviewDetailsPanel">
          <div className="InterviewCounter">
            <div className="Heading InterviewCounterHead">Interview Stats:</div>
            <div className="flex" style={{ gap: "28px" }}>
              <InterviewResults total={interviews.length} label="Total Interviews" image="search"/>
              <InterviewResults total={filteredInterviews.length} label="Filtered Interviews" image="filter"/>
              <InterviewResults total={interviews.filter(interview => !interview.isCompleted).length} label="Pending Interviews" image="bookmark"/>
            </div>
          </div>

          <div className="filters-main">
            <div className="Heading">Filters:</div>
            <div className="filters">
              <form style={{width: '100%'}} onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  id="search"
                  name="search"
                  className="Filter-Input"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleFilterChange}
                />

                <label htmlFor="roles" className="Filter-text">
                  Roles:
                </label>
                <select
                  id="roles"
                  className="Filter-Input"
                  name="roles"
                  value={selectedRole}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  {uniqueRoles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>

                <label htmlFor="status" className="Filter-text">
                  Status:
                </label>
                <select
                  id="status"
                  className="Filter-Input"
                  name="status"
                  value={selectedStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="completed">Completed</option>
                  <option value="not completed">Not Completed</option>
                </select>

                <button className="Filter-Submit" type="submit">
                  Apply Filters
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="InterviewList">
          <div className="Heading InterviewCounterHead">Interviews:</div>
          <button className="create-candidate" onClick={() => setOpen(true)}>
            Schedule Interview
          </button>
          {filteredInterviews.map((interview) => (
            <InterviewCard interview={interview} key={interview.id}></InterviewCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarComponent;
