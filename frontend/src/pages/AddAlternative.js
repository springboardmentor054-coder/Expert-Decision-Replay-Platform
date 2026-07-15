import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function AddAlternative() {

    const navigate = useNavigate();


    const [alternative, setAlternative] = useState({

        decision_id: 3,
        alternative_name: "",
        description: "",
        estimated_cost: "",
        feasibility: "",
        risk_level: ""

    });



    const handleChange = (e) => {

        setAlternative({

            ...alternative,

            [e.target.name]: e.target.value

        });

    };




    const handleSubmit = (e) => {

        e.preventDefault();


        console.log("Create button clicked");
        console.log(alternative);



        fetch("http://127.0.0.1:8000/alternatives/", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },


            body: JSON.stringify(alternative)

        })


        .then(response => {


            console.log("Response status:", response.status);



            if (response.ok) {


                alert("Alternative Created Successfully");


                navigate("/alternatives");


            }

            else {


                alert("Error Creating Alternative");


            }


        })


        .catch(error => {


            console.log("Fetch error:", error);


        });


    };




    return (

        <div className="container">


            <h1>Add Alternative</h1>




            {/* Navigation Buttons */}

            <div style={{ marginBottom: "20px" }}>


                <button onClick={() => navigate("/")}>
                    Create Decision
                </button>



                <button

                    onClick={() => navigate("/decisions")}

                    style={{ marginLeft: "10px" }}

                >
                    View Decisions
                </button>




                <button

                    onClick={() => navigate("/alternatives")}

                    style={{ marginLeft: "10px" }}

                >
                    View Alternatives
                </button>


            </div>






            <div className="form-container">


                <form onSubmit={handleSubmit}>


                    <div className="form-group">

                        <label>Alternative Name</label>


                        <input

                            type="text"

                            name="alternative_name"

                            value={alternative.alternative_name}

                            onChange={handleChange}

                        />


                    </div>





                    <div className="form-group">

                        <label>Description</label>


                        <textarea

                            name="description"

                            value={alternative.description}

                            onChange={handleChange}

                        />


                    </div>





                    <div className="form-group">

                        <label>Estimated Cost</label>


                        <input

                            type="number"

                            name="estimated_cost"

                            value={alternative.estimated_cost}

                            onChange={handleChange}

                        />


                    </div>





                    <div className="form-group">

                        <label>Feasibility</label>


                        <input

                            type="text"

                            name="feasibility"

                            value={alternative.feasibility}

                            onChange={handleChange}

                        />


                    </div>





                    <div className="form-group">

                        <label>Risk Level</label>


                        <input

                            type="text"

                            name="risk_level"

                            value={alternative.risk_level}

                            onChange={handleChange}

                        />


                    </div>





                    <button

                        type="submit"

                        className="submit-btn"

                    >

                        Create

                    </button>



                </form>


            </div>


        </div>

    );

}


export default AddAlternative;