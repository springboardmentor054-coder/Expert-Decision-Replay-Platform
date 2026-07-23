import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Decision.css";

function EditDecision() {

  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [decision, setDecision] = useState({
    title: "",
    problem_statement: "",
    description: "",
    status: ""
  });

  useEffect(() => {

    fetch(`http://127.0.0.1:8000/decisions/${id}`)

      .then(response => response.json())

      .then(data => {

        setDecision(data);

      })

      .catch(error => {

        console.log("Error fetching decision:", error);

        alert("Unable to load decision");

      });

  }, [id]);


  const handleChange = (e) => {

    setDecision({

      ...decision,

      [e.target.name]: e.target.value

    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (decision.title.trim() === "") {

      alert("Title cannot be empty");

      return;

    }

    if (decision.problem_statement.trim() === "") {

      alert("Problem Statement is mandatory");

      return;

    }

    if (!token) {

      alert("Please login first");

      navigate("/login");

      return;

    }


    try {

      const response = await fetch(
        `http://127.0.0.1:8000/decisions/${id}`,
        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

            "Authorization": `Bearer ${token}`

          },

          body: JSON.stringify(decision)

        }
      );


      if (response.ok) {

        alert("Decision Updated Successfully");

        navigate(`/decision/${id}`);

      }

      else {

        const errorData = await response.json();

        console.log("Update Error:", errorData);

        alert(
          "Update Failed: " +
          JSON.stringify(errorData)
        );

      }

    }

    catch (error) {

      console.log("Network Error:", error);

      alert("Server connection failed");

    }

  };


  return (

    <div className="decision-page">


      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="decision-header">

        <div>

          <h1>Edit Decision</h1>

          <p>
            Update the decision details and track changes through version history.
          </p>

        </div>


        <button

          className="secondary-btn"

          onClick={() => navigate(`/decision/${id}`)}

        >

          ← Back to Decision

        </button>

      </div>



      {/* ================================= */}
      {/* EDIT FORM */}
      {/* ================================= */}

      <div className="decision-form-card">


        <div className="form-card-header">

          <h2>Update Decision Information</h2>

          <p>
            Modify the details below and save your changes.
          </p>

        </div>



        <form onSubmit={handleSubmit}>


          {/* ================================= */}
          {/* TITLE */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Decision Title <span>*</span>

            </label>


            <input

              type="text"

              name="title"

              placeholder="Enter a clear decision title"

              value={decision.title || ""}

              onChange={handleChange}

            />

          </div>



          {/* ================================= */}
          {/* PROBLEM STATEMENT */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Problem Statement <span>*</span>

            </label>


            <textarea

              name="problem_statement"

              placeholder="Describe the problem or challenge that requires a decision..."

              value={decision.problem_statement || ""}

              onChange={handleChange}

              rows="5"

            />

          </div>



          {/* ================================= */}
          {/* DESCRIPTION */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Description

            </label>


            <textarea

              name="description"

              placeholder="Provide additional context, background, or relevant information..."

              value={decision.description || ""}

              onChange={handleChange}

              rows="6"

            />

          </div>



          {/* ================================= */}
          {/* STATUS */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Decision Status

            </label>


            <select

              name="status"

              value={decision.status || ""}

              onChange={handleChange}

            >

              <option value="Draft">
                Draft
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>

              <option value="Cancelled">
                Cancelled
              </option>

            </select>

          </div>



          {/* ================================= */}
          {/* FORM ACTIONS */}
          {/* ================================= */}

          <div className="form-actions">


            <button

              type="button"

              className="cancel-btn"

              onClick={() => navigate(`/decision/${id}`)}

            >

              Cancel

            </button>



            <button

              type="submit"

              className="submit-btn"

            >

              Update Decision

            </button>


          </div>


        </form>


      </div>



      {/* ================================= */}
      {/* QUICK NAVIGATION */}
      {/* ================================= */}

      <div className="quick-navigation">


        <h3>Decision Management</h3>


        <div className="quick-nav-buttons">


          <button

            onClick={() => navigate("/decisions")}

          >

            📋 View All Decisions

          </button>



          <button

            onClick={() => navigate(`/decision/${id}/history`)}

          >

            🔄 View Version History

          </button>


        </div>


      </div>


    </div>

  );

}


export default EditDecision;