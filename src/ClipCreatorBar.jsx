import React, {useState} from "react";

export default function ClipCreatorBar(props) {
    const [start,setStart] = useState(0);
    const [end,setEnd] = useState(0);
    var tempstart=0
    return (
        <div onMouseDown={(event)=>{tempstart=event.clientX}}
            onMouseUp={(event)=>{setEnd(event.clientX); setStart(tempstart)}} 
            style = {{border:"solid black 1px",height:"20px"}}>
            <div style={{position:"relative",left:`${start}px`,width:`${end-start}px`,height:"20px",backgroundColor:"blue"}}></div>
       </div>
    )
}