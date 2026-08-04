import React, { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
  useLocation
} from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner
} from "react-bootstrap";

import {
  FaArrowLeft,
  FaClipboardList,
  FaLayerGroup
} from "react-icons/fa";

import Documents from "../document/Documents";
import Discussions from "../discussion/Discussions";


function DecisionDetails() {

  const { decisionId } = useParams();

  const navigate = useNavigate();

  const location = useLocation();


  // =====================================
  // Get Page Mode
  //
  // create
  // -> Add Alternative
  // -> Upload Supporting Documents
  //
  // view
  // -> View Alternatives
  // -> View Documents only
  //
  // details
  // -> Complete Decision read-only
  // =====================================

  const mode =
    new URLSearchParams(
      location.search
    ).get("mode") || "details";


  // =====================================
  // Decision State
  // =====================================

  const [decision, setDecision] =
    useState(null);


  // =====================================
  // Alternative States
  // =====================================

  const [alternatives, setAlternatives] =
    useState([]);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [pros, setPros] =
    useState("");

  const [cons, setCons] =
    useState("");

  const [cost, setCost] =
    useState("");

  const [feasibility, setFeasibility] =
    useState("High");

  const [riskLevel, setRiskLevel] =
    useState("Low");

  const [message, setMessage] =
    useState("");


  const API_URL =
    "http://127.0.0.1:8000";


  // =====================================
  // Load Selected Decision
  // =====================================

  const fetchDecision = async () => {

    try {

      const response = await fetch(

        `${API_URL}/decisions/${decisionId}`

      );


      if (!response.ok) {

        throw new Error(
          "Could not load decision"
        );

      }


      const data =
        await response.json();


      setDecision(data);


    } catch (error) {

      console.error(
        "Load decision error:",
        error
      );


      setMessage(
        "Could not load decision details"
      );

    }

  };


  // =====================================
  // Load Alternatives
  // =====================================

  const fetchAlternatives = async () => {

    try {

      const response = await fetch(

        `${API_URL}/decisions/${decisionId}/alternatives`

      );


      if (!response.ok) {

        throw new Error(
          "Could not load alternatives"
        );

      }


      const data =
        await response.json();


      setAlternatives(data);


    } catch (error) {

      console.error(
        "Load alternatives error:",
        error
      );


      setMessage(
        "Could not load alternatives"
      );

    }

  };


  // =====================================
  // Load Required Data
  // =====================================

  useEffect(() => {

    if (decisionId) {

      fetchDecision();

      fetchAlternatives();

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [decisionId, mode]);


  // =====================================
  // Create Alternative
  // =====================================

  const handleCreateAlternative =
    async (e) => {

      e.preventDefault();

      setMessage("");


      // =====================================
      // STRICT MODE CHECK
      //
      // Only Create Alternative mode
      // can create an alternative
      // =====================================

      if (mode !== "create") {

        setMessage(
          "Alternative creation is not allowed on this page."
        );

        return;

      }


      try {

        const response = await fetch(

          `${API_URL}/alternatives`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body: JSON.stringify({

              decision_id:
                Number(decisionId),

              alternative_name:
                name,

              description:
                description,

              pros:
                pros,

              cons:
                cons,

              estimated_cost:
                Number(cost),

              feasibility:
                feasibility,

              risk_level:
                riskLevel,

            }),

          }

        );


        const data =
          await response.json();


        // =====================================
        // Backend Error
        // =====================================

        if (!response.ok) {

          console.log(
            "Create alternative error:",
            data
          );


          if (
            Array.isArray(
              data.detail
            )
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
              "Could not create alternative"

            );

          }

          return;

        }


        // =====================================
        // Success
        // =====================================

        setMessage(
          "Alternative created successfully"
        );


        // Clear Form

        setName("");

        setDescription("");

        setPros("");

        setCons("");

        setCost("");

        setFeasibility(
          "High"
        );

        setRiskLevel(
          "Low"
        );


        // Reload Alternatives

        fetchAlternatives();


      } catch (error) {

        console.error(
          "Create alternative error:",
          error
        );


        setMessage(
          "Backend connection failed"
        );

      }

    };


  // =====================================
  // Back Button
  // =====================================

  const handleBack = () => {

    // Create Alternative and
    // View Alternatives came through
    // Select Decision

    if (
      mode === "create" ||
      mode === "view"
    ) {

      navigate(
        "/dashboard"
      );

    } else {

      // Complete Decision Details
      // came from View Decisions

      navigate(
        "/decisions?mode=view"
      );

    }

  };


  // =====================================
  // UI
  // =====================================

  return (
<Container fluid className="py-4">
  <Row>
    <Col lg={12}>


      {/* =====================================
          BACK BUTTON
      ===================================== */}

     <Button
  variant="outline-primary"
  className="mb-4"
  onClick={handleBack}
>
  <FaArrowLeft className="me-2" />
  Back
</Button>


      {/* =====================================
          PAGE TITLES
      ===================================== */}


      {/* CREATE ALTERNATIVE */}
    {mode === "create" && (
  <h2 className="fw-bold text-primary mb-4">
    <FaLayerGroup className="me-2" />
    Add Alternative
  </h2>
)}


   {/* VIEW ALTERNATIVES */}

{mode === "view" && (
  <h2 className="fw-bold text-primary mb-4">
    <FaLayerGroup className="me-2" />
    View Alternatives
  </h2>
)}

{/* COMPLETE DECISION DETAILS */}
{mode === "details" && (
  <h2 className="fw-bold text-primary mb-4">
    <FaClipboardList className="me-2" />
    Decision Details
  </h2>
)}
      {/* =====================================
          SELECTED DECISION INFORMATION

          Always displayed so the user
          knows which decision is selected.
      ===================================== */}

{decision ? (

<Card className="shadow-sm mb-4">

<Card.Header>

<h5 className="mb-0">

Decision Information

</h5>

</Card.Header>

<Card.Body>

<Table bordered responsive>

<tbody>

<tr>

<th width="220">

Decision ID

</th>

<td>

{decision.decision_id}

</td>

</tr>

<tr>

<th>

Decision Title

</th>

<td>

{decision.decision_title}

</td>

</tr>

<tr>

<th>

Description

</th>

<td>

{decision.decision_description}

</td>

</tr>

<tr>

<th>

Created By

</th>

<td>

User {decision.user_id}

</td>

</tr>

{decision.created_at && (

<tr>

<th>

Created At

</th>

<td>

{new Date(decision.created_at).toLocaleString()}

</td>

</tr>

)}

</tbody>

</Table>

</Card.Body>

</Card>

) : (

<div className="text-center my-5">

<Spinner
    animation="border"
    variant="primary"
/>

<p className="text-muted mt-3 mb-0">
    Loading decision details...
</p>

</div>

)}


      <hr />


      {/* =====================================
          ADD ALTERNATIVE

          ONLY:
          mode = create
      ===================================== */}

     {mode === "create" && (
<>
<Card className="shadow-sm">

  <Card.Header>
    <h5 className="mb-0">Add Alternative</h5>
  </Card.Header>

  <Card.Body>

    <form onSubmit={handleCreateAlternative}>

      <div className="mb-3">
        <label className="form-label">Alternative Name</label>
        <input
          type="text"
          className="form-control"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Pros</label>
        <textarea
          className="form-control"
          rows="2"
          value={pros}
          onChange={(e) => setPros(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Cons</label>
        <textarea
          className="form-control"
          rows="2"
          value={cons}
          onChange={(e) => setCons(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Estimated Cost</label>
        <input
          type="number"
          className="form-control"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          min="0"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Feasibility</label>
        <select
          className="form-select"
          value={feasibility}
          onChange={(e) => setFeasibility(e.target.value)}
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Risk Level</label>
        <select
          className="form-select"
          value={riskLevel}
          onChange={(e) => setRiskLevel(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
<Button
    type="submit"
    variant="success"
    size="lg"
>
    Add Alternative
</Button>
    </form>

  </Card.Body>

</Card>

{message && (
  <Alert
    variant={
      message.toLowerCase().includes("success")
        ? "success"
        : "danger"
    }
    className="mt-3"
  >
    {message}
  </Alert>
)}

</>

)}

{/* =====================================
    ALTERNATIVES

          create
          -> View existing alternatives

          view
          -> View alternatives only

          details
          -> Related alternatives
      ===================================== */}

      {(
        mode === "create" ||
        mode === "view" ||
        mode === "details"
      ) && (

        <>


          {/* HEADING */}

          <Card className="shadow-sm mt-4">

  <Card.Header>

    <h5 className="mb-0">
      {mode === "details"
        ? "Related Alternatives"
        : "Alternatives"}
    </h5>

  </Card.Header>

  <Card.Body>

    {alternatives.length === 0 ? (

      <Alert variant="secondary" className="mb-0">
        No alternatives added yet.
      </Alert>

    ) : (

      <Table
        striped
        bordered
        hover
        responsive
        className="mb-0"
      >

        <thead className="table-dark">
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Pros</th>
            <th>Cons</th>
            <th>Cost</th>
            <th>Feasibility</th>
            <th>Risk</th>
          </tr>
        </thead>

        <tbody>

          {alternatives.map((alternative) => (

            <tr key={alternative.alternative_id}>

              <td>{alternative.alternative_name}</td>
              <td>{alternative.description}</td>
              <td>{alternative.pros}</td>
              <td>{alternative.cons}</td>
              <td>₹ {alternative.estimated_cost}</td>

              <td>
                <Badge
                  bg={
                    alternative.feasibility === "High"
                      ? "success"
                      : alternative.feasibility === "Medium"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {alternative.feasibility}
                </Badge>
              </td>

              <td>
                <Badge
                  bg={
                    alternative.risk_level === "Low"
                      ? "success"
                      : alternative.risk_level === "Medium"
                      ? "warning"
                      : "danger"
                  }
                >
                  {alternative.risk_level}
                </Badge>
              </td>

            </tr>

          ))}

        </tbody>

      </Table>

    )}

  </Card.Body>

</Card>

          

        </>

      )}


      {/* =====================================
          SUPPORTING DOCUMENTS

          CREATE ALTERNATIVE:
          Upload allowed

          VIEW ALTERNATIVES:
          Read only

          This keeps documents linked
          to the selected Decision.
      ===================================== */}

      {(
        mode === "create" ||
        mode === "view"
      ) && (

        <>

        <Card className="shadow-sm mt-4">

  <Card.Header>
    <h5 className="mb-0">
      Supporting Documents
    </h5>
  </Card.Header>

  <Card.Body>

    <Documents
      decisionId={decisionId}
      allowUpload={mode === "create"}
    />

  </Card.Body>

</Card>


        </>

      )}


      {/* =====================================
          COMPLETE DECISION VIEW

          ONLY:
          mode = details

          Everything here is READ ONLY.
      ===================================== */}

      {mode === "details" && (

        <>


          {/* =================================
              SUPPORTING DOCUMENTS
              READ ONLY
          ================================= */}

          <Card className="shadow-sm mt-4">

  <Card.Header>
    <h5 className="mb-0">
      Supporting Documents
    </h5>
  </Card.Header>

  <Card.Body>

    <Documents
      decisionId={decisionId}
      allowUpload={false}
    />

  </Card.Body>

</Card>


          {/* =================================
              DISCUSSIONS
              READ ONLY
          ================================= */}

          <Card className="shadow-sm mt-4">

  <Card.Header>
    <h5 className="mb-0">
      Discussions
    </h5>
  </Card.Header>

  <Card.Body>

    <Discussions
      decisionId={decisionId}
      allowAdd={false}
    />

  </Card.Body>

</Card>


        </>

      )}


    </Col>
</Row>
</Container>

  );

}


export default DecisionDetails;