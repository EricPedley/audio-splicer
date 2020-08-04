import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'



const placeholderData = [
  {id:1,name:"never",time:"00:00 - 00:01"},
  {id:2,name:"gonna",time:"00:01 - 00:02"},
  {id:3,name:"give",time:"00:02 - 00:03"}
]

function App() {
  const [state, setState] = useState({available:[1,2,3],used:[]})
  console.log("rerendering", state)
  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination)
      return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;
    const newState = Object.assign({},state);
    newState[source.droppableId].splice(source.index, 1);
    newState[destination.droppableId].splice(destination.index, 0, draggableId)
    setState(newState);
  }
  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <DroppableCard droppableId="available">
          {state.available.map((id, index) => <Clip draggableId={`${id}`} index={index} key={id}></Clip>)}
        </DroppableCard>
        <DroppableCard droppableId="used">
        {state.used.map((id, index) => <Clip draggableId={`${id}`} index={index} key={id}></Clip>)}
          </DroppableCard>
      </DragDropContext>
    </div >
  );
}

function SongClipsPool(props) {//there will only be one of these
  const [clips, setClips] = useState([])
  return <Droppable droppableId="songclipspool">
    {provided=><div ref = {provided.innerRef} {...provided.droppableProps}>
      </div>}
  </Droppable>
}

function Clip(props) {
  const { name, time } = placeholderData.find(element=>Number(props.draggableId)===element.id);
  return <Draggable draggableId={props.draggableId} index={props.index}>
  {(provided) =>
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}>
      <div style={{
        border: "solid 2px",
        backgroundColor: "white",
        padding: "10px"
      }}>{name}<div>{time}</div></div>

    </div>}
</Draggable>
}

const DroppableCard = (props) => {
  return (
    <Droppable droppableId={props.droppableId} direction="horizontal">
      {(provided) =>
        <div
          style={{
            border: "solid 2px",
            padding: "5px",
            display: "flex"
          }}
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {props.children}
          {provided.placeholder}
        </div>
      }
    </Droppable>
  )
}
export default App;