import React, { useEffect, useState } from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";


function EditDecision() {

  const { decisionId } = useParams();

  const navigate = useNavigate();

  const API_URL =
    "http://127.0.0.1:8000";


  // =====================================
  // State
  // =====================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [changeSummary, setChangeSummary] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);


  // =====================================
  // Load Existing Decision
  // =====================================

  useEffect(() => {

    const fetchDecision = async () => {

      try {

        const response = await fetch(

          `${API_URL}/decisions/${decisionId}`

        );


        const data =
          await response.json();


        if (!response.ok) {

          setMessage(

            data.detail ||
            "Could not load decision"

          );

          setLoading(false);

          return;

        }


        setTitle(
          data.decision_title || ""
        );

        setDescription(
          data.decision_description || ""
        );


      } catch (error) {

        console.error(
          "Load decision error:",
          error
        );

        setMessage(
          "Could not connect to backend"
        );

      } finally {

        setLoading(false);

      }

    };


    fetchDecision();

  }, [decisionId]);


  // =====================================
  // Save Edited Decision
  // =====================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    setMessage("");


    // Get current logged-in user

    const loggedInUser =
      JSON.parse(
        localStorage.getItem("user")
      );


    if (
      !loggedInUser ||
      !loggedInUser.user_id
    ) {

      setMessage(
        "Please login again."
      );

      return;

    }


    // Make sure summary is entered

    if (!changeSummary.trim()) {

      setMessage(
        "Please enter a change summary."
      );

      return;

    }


    try {

      const response = await fetch(

        `${API_URL}/decisions/${decisionId}`,

        {

          method: "PUT",

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify({

            decision_title:
              title,

            decision_description:
              description,

            modified_by:
              loggedInUser.user_id,

            status:
              "Draft",

            change_summary:
              changeSummary,

          }),

        }

      );


      const data =
        await response.json();


      // =====================================
      // Backend Error
      // =====================================

      if (!response.ok) {

        console.error(
          "Update error:",
          data
        );


        if (
          Array.isArray(data.detail)
        ) {

          setMessage(

            data.detail

              .map(
                (error) =>
                  error.msg
              )

              .join(", ")

          );

        } else {

          setMessage(

            data.detail ||
            "Could not update decision"

          );

        }

        return;

      }


      // =====================================
      // Success
      // =====================================

      setMessage(

        `Decision updated successfully. Version ${data.version_number} created.`

      );


      // Return to View Decisions
      // after short delay

      setTimeout(() => {

        navigate(
          "/decisions?mode=view"
        );

      }, 1200);


    } catch (error) {

      console.error(
        "Update decision error:",
        error
      );

      setMessage(
        "Backend connection failed"
      );

    }

  };


  // =====================================
  // Loading
  // =====================================

  if (loading) {

    return (

      <div
        style={{
          padding: "30px"
        }}
      >

        <p>
          Loading decision...
        </p>

      </div>

    );

  }


  // =====================================
  // UI
  // =====================================

  return (

    <div
      style={{
        padding: "30px"
      }}
    >


      {/* BACK */}

      <button

        type="button"

        onClick={() =>
          navigate(
            "/decisions?mode=view"
          )
        }

      >

        Back to Decisions

      </button>


      <br /><br />


      <h1>
        Edit Decision
      </h1>


      <p>

        <strong>
          Decision ID:
        </strong>

        {" "}

        {decisionId}

      </p>


      <div

        style={{

          maxWidth: "600px",

          padding: "20px",

          border:
            "1px solid #ccc",

          borderRadius:
            "8px",

        }}

      >


        <form
          onSubmit={handleUpdate}
        >


          {/* TITLE */}

          <div
            style={{
              marginBottom:
                "20px"
            }}
          >

            <label>

              <strong>
                Decision Title
              </strong>

            </label>


            <br /><br />


            <input

              type="text"

              value={title}

              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }

              required

              style={{

                width: "100%",

                padding: "10px",

                boxSizing:
                  "border-box",

              }}

            />

          </div>


          {/* DESCRIPTION */}

          <div
            style={{
              marginBottom:
                "20px"
            }}
          >

            <label>

              <strong>
                Description
              </strong>

            </label>


            <br /><br />


            <textarea

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              required

              rows="6"

              style={{

                width: "100%",

                padding: "10px",

                boxSizing:
                  "border-box",

              }}

            />

          </div>


          {/* CHANGE SUMMARY */}

          <div
            style={{
              marginBottom:
                "20px"
            }}
          >

            <label>

              <strong>
                Change Summary
              </strong>

            </label>


            <br />


            <small>

              Briefly explain why this
              decision was changed.

            </small>


            <br /><br />


            <textarea

              value={changeSummary}

              onChange={(e) =>
                setChangeSummary(
                  e.target.value
                )
              }

              required

              rows="3"

              placeholder=
                "Example: Updated hiring requirements and job description"

              style={{

                width: "100%",

                padding: "10px",

                boxSizing:
                  "border-box",

              }}

            />

          </div>


          {/* SAVE */}

          <button
            type="submit"
          >

            Save Changes

          </button>


          {" "}


          {/* CANCEL */}

          <button

            type="button"

            onClick={() =>
              navigate(
                "/decisions?mode=view"
              )
            }

          >

            Cancel

          </button>


        </form>


        {/* MESSAGE */}

        {message && (

          <p
            style={{
              marginTop:
                "20px"
            }}
          >

            {message}

          </p>

        )}


      </div>


    </div>

  );

}


export default EditDecision;