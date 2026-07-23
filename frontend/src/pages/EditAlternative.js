import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Decision.css";

function EditAlternative() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [alternative, setAlternative] = useState({
    decision_id: "",
    alternative_name: "",
    description: "",
    estimated_cost: "",
    feasibility: "",
    risk_level: ""
  });


  // =================================
  // FETCH ALTERNATIVE
  // =================================

  useEffect(() => {

    fetch(`http://127.0.0.1:8000/alternatives/${id}`)

      .then(response => {

        if (!response.ok) {

          throw new Error(
            "Unable to fetch alternative"
          );

        }

        return response.json();

      })

      .then(data => {

        setAlternative({

          decision_id: data.decision_id,

          alternative_name:
            data.alternative_name || "",

          description:
            data.description || "",

          estimated_cost:
            data.estimated_cost || "",

          feasibility:
            data.feasibility || "",

          risk_level:
            data.risk_level || ""

        });

      })

      .catch(error => {

        console.log(
          "Error fetching alternative:",
          error
        );

        alert(
          "Unable to load alternative"
        );

      });

  }, [id]);


  // =================================
  // HANDLE INPUT CHANGE
  // =================================

  const handleChange = (e) => {

    setAlternative({

      ...alternative,

      [e.target.name]:
        e.target.value

    });

  };


  // =================================
  // UPDATE ALTERNATIVE
  // =================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    if (
      !alternative.alternative_name.trim()
    ) {

      alert(
        "Alternative Name is required"
      );

      return;

    }


    if (
      !alternative.estimated_cost ||
      Number(
        alternative.estimated_cost
      ) <= 0
    ) {

      alert(
        "Estimated Cost must be greater than 0"
      );

      return;

    }


    try {

      console.log(
        "Updating Alternative:",
        alternative
      );


      const response = await fetch(

        `http://127.0.0.1:8000/alternatives/${id}`,

        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json"

          },

          body: JSON.stringify({

            ...alternative,

            decision_id:
              Number(
                alternative.decision_id
              ),

            estimated_cost:
              Number(
                alternative.estimated_cost
              )

          })

        }

      );


      console.log(
        "Response Status:",
        response.status
      );


      if (response.ok) {

        alert(
          "Alternative Updated Successfully"
        );


        // Return to decision-specific alternatives
        navigate(

          `/alternatives/${alternative.decision_id}`

        );

      }

      else {

        const errorData =
          await response.json();

        console.log(
          "Update Error:",
          errorData
        );


        alert(

          errorData.detail ||

          errorData.message ||

          "Update Failed"

        );

      }


    }

    catch (error) {

      console.log(
        "Network Error:",
        error
      );


      alert(
        "Server connection failed"
      );

    }

  };


  // =================================
  // RETURN TO ALTERNATIVES
  // =================================

  const handleBack = () => {

    if (
      alternative.decision_id
    ) {

      navigate(

        `/alternatives/${alternative.decision_id}`

      );

    }

    else {

      navigate(
        "/alternatives"
      );

    }

  };


  return (

    <div className="alternative-form-page">


      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="alternative-form-header">

        <div>

          <span className="eyebrow">
            DECISION ANALYSIS
          </span>

          <h1>
            Edit Alternative
          </h1>

          <p>
            Update the alternative details and keep the decision analysis accurate.
          </p>

        </div>


        <button

          className="secondary-btn"

          onClick={handleBack}

        >

          ← Back to Alternatives

        </button>

      </div>



      {/* ================================= */}
      {/* FORM CARD */}
      {/* ================================= */}

      <div className="alternative-form-card">


        <div className="form-card-header">

          <h2>
            Alternative Information
          </h2>

          <p>
            Review and update the details of this alternative.
          </p>

        </div>



        <form onSubmit={handleSubmit}>


          {/* ================================= */}
          {/* DECISION ID */}
          {/* ================================= */}

          <div className="form-group">

            <label>
              Decision ID
            </label>


            <input

              type="number"

              name="decision_id"

              value={
                alternative.decision_id || ""
              }

              readOnly

            />


            <small className="field-help">

              This alternative belongs to Decision{" "}

              {alternative.decision_id || "—"}.

            </small>

          </div>



          {/* ================================= */}
          {/* ALTERNATIVE NAME */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Alternative Name <span>*</span>

            </label>


            <input

              type="text"

              name="alternative_name"

              value={
                alternative.alternative_name || ""
              }

              onChange={handleChange}

              placeholder="Enter a clear alternative name"

              required

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

              value={
                alternative.description || ""
              }

              onChange={handleChange}

              placeholder="Describe how this alternative addresses the problem..."

              rows="5"

            />

          </div>



          {/* ================================= */}
          {/* ESTIMATED COST */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Estimated Cost <span>*</span>

            </label>


            <input

              type="number"

              name="estimated_cost"

              value={
                alternative.estimated_cost || ""
              }

              onChange={handleChange}

              placeholder="Enter estimated cost"

              min="1"

              required

            />

          </div>



          {/* ================================= */}
          {/* FEASIBILITY */}
          {/* ================================= */}

          <div className="form-group">

            <label>
              Feasibility
            </label>


            <select

              name="feasibility"

              value={
                alternative.feasibility || ""
              }

              onChange={handleChange}

            >

              <option value="">

                Select feasibility

              </option>

              <option value="High">

                High

              </option>

              <option value="Medium">

                Medium

              </option>

              <option value="Low">

                Low

              </option>

            </select>

          </div>



          {/* ================================= */}
          {/* RISK LEVEL */}
          {/* ================================= */}

          <div className="form-group">

            <label>

              Risk Level <span>*</span>

            </label>


            <select

              name="risk_level"

              value={
                alternative.risk_level || ""
              }

              onChange={handleChange}

              required

            >

              <option value="">

                Select risk level

              </option>

              <option value="Low">

                Low

              </option>

              <option value="Medium">

                Medium

              </option>

              <option value="High">

                High

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

              onClick={handleBack}

            >

              Cancel

            </button>



            <button

              type="submit"

              className="submit-btn"

            >

              Update Alternative

            </button>


          </div>


        </form>


      </div>



      {/* ================================= */}
      {/* QUICK NAVIGATION */}
      {/* ================================= */}

      <div className="quick-navigation">


        <h3>
          Decision Management
        </h3>


        <div className="quick-nav-buttons">


          <button

            onClick={() =>
              navigate("/decisions")
            }

          >

            📋 View All Decisions

          </button>



          <button

            onClick={() =>
              navigate("/alternatives")
            }

          >

            ⚖️ View All Alternatives

          </button>


        </div>


      </div>


    </div>

  );

}


export default EditAlternative;