import React, { useState } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
function App() {
  const [state, setState] = useState(["apples", "banannas", "cherries", "dates"])
  console.log("rerendering", state)
  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination)
      return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;
    const newArray = Array.from(state);
    newArray.splice(source.index, 1);
    newArray.splice(destination.index, 0, draggableId)
    setState(newArray);
  }
  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <DroppableCard droppableId="droppable-1">
          <h2>I am a droppable!</h2>
          {state.map((fruit, index) => <DraggableCard draggableId={fruit} index={index} key={fruit}>{fruit}</DraggableCard>)}
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
  const { name, start, end } = props.data;
  return <div>
    {name}
    <div>{start}-{end}</div>
  </div>
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

const DraggableCard = (props) => {
  return (
    <Draggable draggableId={props.draggableId} index={props.index}>
      {(provided) =>
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <div style={{
            border: "solid 2px",
            backgroundColor: "white",
            padding: "10px"
          }}>{props.children}</div>

        </div>}
    </Draggable>

  )
}

export default App;