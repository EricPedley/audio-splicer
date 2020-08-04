import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
function App() {
  const onDragEnd = result => {
    console.log(result);
  }
  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <DroppableCard droppableId="droppable-1">
          <h2>I am a droppable!</h2>
          <DraggableCard draggableId="draggable-1" index={0}>my custom draggable element 1</DraggableCard>
          <DraggableCard draggableId="draggable-2" index={1}>my custom draggable element 2</DraggableCard>
        </DroppableCard>
      </DragDropContext>
    </div >
  );
}
const DroppableCard = (props) => {
  return (
    <Droppable droppableId={props.droppableId}>
      {(provided) => 
        <div
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
        <div ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}>
          <h4>{props.children}</h4>
        </div>}
    </Draggable>

  )
}

export default App;
