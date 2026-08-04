import Card from "react-bootstrap/Card";

const StatCard=({title,value,icon,color})=>{

return(

<Card className="shadow-sm h-100">

<Card.Body>

<div className="d-flex justify-content-between">

<div>

<h6 className="text-muted">{title}</h6>

<h2>{value}</h2>

</div>

<div
style={{
fontSize:"34px",
color:color
}}
>

{icon}

</div>

</div>

</Card.Body>

</Card>

);

};

export default StatCard;