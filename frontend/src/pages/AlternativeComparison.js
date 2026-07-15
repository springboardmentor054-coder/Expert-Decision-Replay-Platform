import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";


function AlternativeComparison() {

    const [alternatives, setAlternatives] = useState([]);

    const navigate = useNavigate();


    useEffect(() => {

        fetch("http://127.0.0.1:8000/alternatives")

            .then(response => response.json())

            .then(data => {

                setAlternatives(data);

            })

            .catch(error => {

                console.log(error);

            });


    }, []);



    return (

        <div className="container">


            <h1>Alternative Comparison</h1>



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

                    onClick={() => navigate("/add-alternative")}

                    style={{ marginLeft: "10px" }}

                >
                    Add Alternative
                </button>



                <button

                    onClick={() => navigate("/alternatives")}

                    style={{ marginLeft: "10px" }}

                >
                    View Alternatives
                </button>


            </div>





            <table>


                <thead>

                    <tr>

                        <th>Alternative Name</th>

                        <th>Description</th>

                        <th>Cost</th>

                        <th>Feasibility</th>

                        <th>Risk Level</th>


                    </tr>


                </thead>




                <tbody>


                    {alternatives.map((alternative) => (


                        <tr key={alternative.id}>


                            <td>
                                {alternative.alternative_name}
                            </td>


                            <td>
                                {alternative.description}
                            </td>


                            <td>
                                {alternative.estimated_cost}
                            </td>


                            <td>
                                {alternative.feasibility}
                            </td>


                            <td>
                                {alternative.risk_level}
                            </td>


                        </tr>


                    ))}


                </tbody>


            </table>


        </div>

    );

}


export default AlternativeComparison;