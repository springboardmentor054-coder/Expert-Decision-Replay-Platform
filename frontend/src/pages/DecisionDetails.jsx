import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


function DecisionDetails() {

    const { id } = useParams();

    const [decision, setDecision] = useState(null);


    useEffect(() => {

        fetch(`http://127.0.0.1:8000/decisions/${id}`)
            .then(response => response.json())
            .then(data => setDecision(data))
            .catch(error => console.log(error));

    }, [id]);


    if (!decision) {
        return <h2>Loading...</h2>;
    }


    return (
        <div>

            <h1>{decision.title}</h1>

            <p>
                Problem: {decision.problem_statement}
            </p>

            <p>
                Description: {decision.description}
            </p>

            <p>
                Status: {decision.status}
            </p>

        </div>
    );
}


export default DecisionDetails;