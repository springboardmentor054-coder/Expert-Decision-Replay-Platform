import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Decision.css";

function UploadDocument() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [file, setFile] = useState(null);


  const uploadDocument = async () => {

    if (!file) {

      alert("Please select a file");

      return;

    }


    const formData = new FormData();

    formData.append("decision_id", id);

    formData.append("uploaded_by", 1);

    formData.append("file", file);



    try {

      const response = await fetch(
        "http://127.0.0.1:8000/documents/upload",
        {
          method: "POST",
          body: formData
        }
      );



      if (response.ok) {


        alert("Document uploaded successfully");


        navigate("/documents");


      } 
      else {


        const errorData = await response.json();


        alert(
          errorData.detail || "Upload failed"
        );


      }



    } catch(error) {


      console.log(error);


      alert("Something went wrong while uploading");


    }

  };



  return (

    <div className="container">


      <h1>Upload Document</h1>


      <p>
        Decision ID: {id}
      </p>



      <input

        type="file"

        onChange={(e) =>
          setFile(e.target.files[0])
        }

      />



      <br /><br />



      <button onClick={uploadDocument}>

        Upload

      </button>



      <button

        onClick={() => navigate("/documents")}

        style={{ marginLeft:"10px" }}

      >

        View Documents

      </button>



    </div>

  );

}


export default UploadDocument;