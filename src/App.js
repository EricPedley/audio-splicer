import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'



const placeholderData = [
  { id: 1, name: "never", time: "00:00 - 00:01" },
  { id: 2, name: "gonna", time: "00:01 - 00:02" },
  { id: 3, name: "give", time: "00:02 - 00:03" },
  { id: 4, name: "you", time: "00:03 - 00:04" }
]
var uniquenumber=0;
function App() {
  const [state, setState] = useState({ available: [1, 2, 3], used: [] });
  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    console.log(result);
    if (!destination)
      return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;
    const newState = Object.assign({}, state);
    //if(!(source.droppableId==="available"&&destination.droppableId==="used"))//don't remove the card if it's going from available to used
    newState[source.droppableId].splice(source.index, 1);//remove card from where it was before
    //if(!(source.droppableId==="used"&&destination.droppableId==="available"))//don't add the card if it's going from used to available
    newState[destination.droppableId].splice(destination.index, 0, draggableId)
    setState(newState);
    console.log(newState)
  }
  function duplicateClip(id,isAvailable) {
    if(isAvailable){
      setState({...state,available:[...state.available,`${id}-${uniquenumber++}`]});
    } else {
      setState({...state,used:[...state.used,`${id}-${uniquenumber++}`]});
    }
  }
  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <ClipsPool clips={state.available} onDuplicate = {(id)=>duplicateClip(id,true)} droppableId = "available" id = "available"></ClipsPool>
        <ClipsPool clips={state.used}  onDuplicate = {(id)=>duplicateClip(id,false)} droppableId = "used"></ClipsPool>
      </DragDropContext>
    </div >
  );
}

function ClipsPool(props) {//it is fed the available clips through props
  const clips = props.clips//using state stops this from updating whenever the props change
  return <Droppable droppableId={props.droppableId} direction="horizontal">
    {(provided) =>
      <div
        id={props.id||""}
        className="clips-pool"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {clips.map((id, index) => <Clip onDuplicate = {()=>props.onDuplicate(id)}draggableId={`${id}`} index={index} key={id}></Clip>)}
        {provided.placeholder}
      </div>
    }
  </Droppable>
}

function Clip(props) {
  const { name, time } = placeholderData.find(element => Number(props.draggableId.split("-")[0]) === element.id);
  return <Draggable draggableId={props.draggableId} index={props.index}>
    {(provided) =>
      <div className = "clip"
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}>
        {name}
        <div>{time}</div>
        <button onClick={props.onDuplicate}>Duplicate</button>
      </div>}
  </Draggable>
}


export default App;