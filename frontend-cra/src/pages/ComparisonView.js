import React, { useState } from "react";
import api from "../api";

function ComparisonView() {

  const [decisionId, setDecisionId] = useState("");
  const [alternatives, setAlternatives] = useState([]);


  const compareAlternatives = async () => {


    if (!decisionId) {

      alert("Please enter Decision ID");

      return;

    }


    try {


      const response = await api.get(
        `/decisions/${decisionId}/alternatives`
      );


      setAlternatives(response.data);



      if (response.data.length === 0) {

        alert("No alternatives found for this decision");

      }


    } catch (error) {


      console.log(error);

      alert("Failed to load alternatives");


    }


  };



  return (

    <div>


      <h1>Compare Alternatives</h1>


      <label>
        Enter Decision ID:
      </label>


      <br />


      <input

        type="number"

        value={decisionId}

        onChange={(e) => setDecisionId(e.target.value)}

      />


      <br /><br />


      <button onClick={compareAlternatives}>

        Compare

      </button>


      <br /><br />



      {alternatives.length > 0 ? (


        <table border="1">


          <thead>


            <tr>

              <th>Name</th>

              <th>Description</th>

              <th>Pros</th>

              <th>Cons</th>

              <th>Cost</th>

              <th>Feasibility</th>

              <th>Risk Level</th>


            </tr>


          </thead>



          <tbody>



            {alternatives.map((item) => (


              <tr key={item.id}>


                <td>{item.alternative_name}</td>


                <td>{item.description}</td>


                <td>{item.pros}</td>


                <td>{item.cons}</td>


                <td>{item.estimated_cost}</td>


                <td>{item.feasibility}</td>


                <td>{item.risk_level}</td>



              </tr>


            ))}



          </tbody>



        </table>



      ) : (


        <p>
          Enter a Decision ID and click Compare to view alternatives.
        </p>


      )}



    </div>

  );

}


export default ComparisonView;