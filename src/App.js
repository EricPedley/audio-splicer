import React from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
function App() {
  const onDragEnd = result => {
    console.log(result);
  }
  return (
    <div className="App">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="1">
          {(provided) => (
          <div 
            innerRef={provided.innerRef}
            {...provided.droppableProps}
          >
            <Draggable draggableId = "0" index="0">
              {(provided)=> (
                <div {...provided.draggableProps}{...provided.dragHandleProps} innerRef={provided.innerRef}>
                  hello world!
                </div>
              )}
            </Draggable>
            <Draggable draggableId = "0" index="1">
              {(provided)=> (
                <div {...provided.draggableProps}{...provided.dragHandleProps} innerRef={provided.innerRef}>
                  foo bar
                </div>
              )}
            </Draggable>

          </div>)}

        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default App;
