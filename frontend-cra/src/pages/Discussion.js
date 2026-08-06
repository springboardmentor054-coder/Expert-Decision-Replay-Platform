import React, { useEffect, useState } from "react";
import api from "../api";

function Discussion() {

  const [decisionId, setDecisionId] = useState("");
  const [userId, setUserId] = useState("");
  const [comment, setComment] = useState("");

  const [comments, setComments] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const [meetingSummary, setMeetingSummary] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [nextAction, setNextAction] = useState("");

  const [error, setError] = useState("");


  useEffect(() => {
    fetchComments();
  }, []);



  const fetchComments = async () => {

    try {

      const response = await api.get("/comments/");

      setComments(response.data);

    } 
    catch (err) {

      console.log(err);

      setError("Failed to load comments");

    }

  };




  const addComment = async () => {


    if (decisionId === "") {
      alert("Please enter Decision ID");
      return;
    }


    if (userId === "") {
      alert("Please enter User ID");
      return;
    }


    if (comment.trim() === "") {
      alert("Comment cannot be empty");
      return;
    }



    try {


      await api.post("/comments/", {

      decision_id: parseInt(decisionId),

      comment: comment
    });



      alert("Comment added successfully");


      setDecisionId("");

      setUserId("");

      setComment("");


      fetchComments();


    }
    catch(err) {

      console.log(err);

      setError("Failed to add comment");

    }

  };





  const updateComment = async () => {

    try {


      await api.put(`/comments/${editId}`, {

        comment: editText

      });



      alert("Comment updated successfully");


      setEditId(null);

      setEditText("");


      fetchComments();


    }
    catch(err) {

      console.log(err);

      setError("Failed to update comment");

    }

  };





  const deleteComment = async (id) => {


    try {


      await api.delete(`/comments/${id}`);


      alert("Comment deleted");


      fetchComments();


    }
    catch(err) {

      console.log(err);

      setError("Failed to delete comment");

    }

  };





  return (

    <div>


      <h2>Discussion Page</h2>



      <h3>Add Comment</h3>



      <input
        type="number"
        placeholder="Decision ID"
        value={decisionId}
        onChange={(e)=>setDecisionId(e.target.value)}
      />


      <br/><br/>



      <input
        type="number"
        placeholder="User ID"
        value={userId}
        onChange={(e)=>setUserId(e.target.value)}
      />


      <br/><br/>



      <textarea
        placeholder="Enter Comment"
        value={comment}
        onChange={(e)=>setComment(e.target.value)}
      />


      <br/><br/>



      <button onClick={addComment}>
        Add Comment
      </button>


      <br/><br/>




      {
        error &&

        (
          <p style={{color:"red"}}>
            {error}
          </p>
        )
      }





      {
        editId &&

        <div>

          <h3>Edit Comment</h3>

          <textarea

            value={editText}

            onChange={(e)=>setEditText(e.target.value)}

          />

          <br/>

          <button onClick={updateComment}>
            Update
          </button>


          <button
            onClick={()=>{
              setEditId(null);
              setEditText("");
            }}
          >
            Cancel
          </button>

        </div>

      }






      <h3>Comment List</h3>




      {
        comments.length === 0

        ?

        (
          <p>No comments found</p>
        )

        :

        (

          <table border="1">


            <thead>

              <tr>

                <th>ID</th>

                <th>Decision ID</th>

                <th>User</th>

                <th>Comment</th>

                <th>Created At</th>

                <th>Updated At</th>

                <th>Action</th>

              </tr>

            </thead>




            <tbody>


            {
              comments.map((item)=>(


                <tr key={item.id}>


                  <td>{item.id}</td>


                  <td>{item.decision_id}</td>


                  <td>{item.user_name}</td>


                  <td>{item.comment}</td>


                  <td>

                    {new Date(item.created_at).toLocaleString()}

                  </td>


                  <td>

                    {new Date(item.updated_at).toLocaleString()}

                  </td>



                  <td>


                    <button

                      onClick={()=>{

                        setEditId(item.id);

                        setEditText(item.comment);

                      }}

                    >

                      Edit

                    </button>




                    <button

                      onClick={()=>deleteComment(item.id)}

                    >

                      Delete

                    </button>


                  </td>


                </tr>


              ))
            }


            </tbody>


          </table>

        )

      }







      <br/>




      <h3>Meeting Notes</h3>




      <label>Meeting Summary</label>

      <br/>


      <textarea

        value={meetingSummary}

        onChange={(e)=>setMeetingSummary(e.target.value)}

      />



      <br/><br/>




      <label>Conclusion</label>

      <br/>


      <textarea

        value={conclusion}

        onChange={(e)=>setConclusion(e.target.value)}

      />



      <br/><br/>




      <label>Next Action</label>

      <br/>


      <textarea

        value={nextAction}

        onChange={(e)=>setNextAction(e.target.value)}

      />


    </div>

  );

}


export default Discussion;