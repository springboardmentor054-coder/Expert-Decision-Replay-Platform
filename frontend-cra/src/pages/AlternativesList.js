import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function AlternativesList() {

  const [alternatives, setAlternatives] = useState([]);

  const navigate = useNavigate();


  const getAlternatives = async () => {

    try {

      const response = await api.get("/alternatives/");

      setAlternatives(response.data);

    } catch (error) {

      console.log(error);
      alert("Failed to load alternatives");

    }

  };


  useEffect(() => {

    getAlternatives();

  }, []);



  const deleteAlternative = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this alternative?"
    );


    if (!confirmDelete) {
      return;
    }


    try {

      await api.delete(`/alternatives/${id}`);

      alert("Alternative deleted successfully");

      getAlternatives();


    } catch (error) {

      console.log(error);

      alert("Failed to delete alternative");

    }

  };



  return (

    <div>

      <h1>Alternatives List</h1>


      <table border="1">

        <thead>

          <tr>

            <th>ID</th>
            <th>Decision ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Pros</th>
            <th>Cons</th>
            <th>Cost</th>
            <th>Feasibility</th>
            <th>Risk Level</th>
            <th>Actions</th>

          </tr>

        </thead>


        <tbody>


          {alternatives.map((item) => (

            <tr key={item.id}>


              <td>{item.id}</td>

              <td>{item.decision_id}</td>

              <td>{item.alternative_name}</td>

              <td>{item.description}</td>

              <td>{item.pros}</td>

              <td>{item.cons}</td>

              <td>{item.estimated_cost}</td>

              <td>{item.feasibility}</td>

              <td>{item.risk_level}</td>


              <td>

                <button
                  onClick={() =>
                    navigate(`/edit-alternative/${item.id}`)
                  }
                >
                  Edit
                </button>


                <button
                  onClick={() =>
                    deleteAlternative(item.id)
                  }
                >
                  Delete
                </button>


              </td>


            </tr>

          ))}


        </tbody>


      </table>


    </div>

  );

}


export default AlternativesList;