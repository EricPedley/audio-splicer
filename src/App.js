import React, { useState, useContext } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'



const placeholderData = [
  { id: 1, name: "never", start: "0", end: "1" },
  { id: 2, name: "gonna", start: "0", end: "1" },
  { id: 3, name: "give", start: "0", end: "1" },
  { id: 4, name: "you", start: "0", end: "1" }
];

var uniquenumber = 0;

const DataContext = React.createContext();
function App() {
  const [available, setAvailable] = useState([1, 2, 3]);//the IDs of the unused clips
  const [used, setUsed] = useState([]);//the IDs of the clips being used
  const [data, setData] = useState(placeholderData);//lookup table for info about each clip id
  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index))//no destination or dropped in same location
      return;
    const states = Object.assign({}, { available: available, used: used });
    states[source.droppableId].splice(source.index, 1);//remove from where it was before
    states[destination.droppableId].splice(destination.index, 0, draggableId)//insert into new place
    setAvailable(states.available);
    setUsed(states.used);
  }

  function duplicateClip(id, isAvailable) {
    if (isAvailable) {
      setAvailable([...available, `${id}-${uniquenumber++}`]);
    } else {
      setUsed([...used, `${id}-${uniquenumber++}`]);
    }
  }

  function buildMP3() {
    const reqData = used.map(uniqueID => {
      const id = Number((uniqueID + "").split("-")[0]);
      const { start, end } = data.find(element => id === element.id);
      return [start, end];
    });
    const options = {
      method: "POST",
      body: JSON.stringify(reqData)
    }
    fetch("http://localhost:3001/build-mp3", options).then(console.log)
  }

  function getData() {
    fetch("http://localhost:3001/audio-fragments").then(res => res.json()).then(json => {
      console.log(json)
      const newData = json[0].timestamps.map((timestamp, index) => (
        {
          id: index,
          name: timestamp[0],
          start: timestamp[1],
          end: timestamp[2]
        }));
      console.log(newData);
      setData(newData);
      setAvailable(newData.map((e, index) => index));
    })
  }

  return (
    <div id="app">
      <DragDropContext onDragEnd={onDragEnd}>
        <DataContext.Provider value={data}>
          <ClipsPool clips={available} onDuplicate={(id) => duplicateClip(id, true)} droppableId="available" id="available"></ClipsPool>
          <ClipsPool clips={used} onDuplicate={(id) => duplicateClip(id, false)} droppableId="used"></ClipsPool>
        </DataContext.Provider>
      </DragDropContext>
      <button onClick={buildMP3}>Export to mp3</button>
      <button onClick={getData}>Get data(test button)</button>
      <form method="POST" action="http://localhost:3001/file-upload" encType="multipart/form-data">
        <input type="file" id="myFile" name="audioFile" accept=".mp3"></input>
        <input type="submit"></input>
      </form>
    </div >
  );
}

function ClipsPool(props) {//it is fed the available clips through props
  const clips = props.clips//using state stops this from updating whenever the props change
  return <Droppable droppableId={props.droppableId} direction="horizontal">
    {(provided) =>
      <div
        id={props.id || ""}
        className="clips-pool"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {clips.map((id, index) => <Clip onDuplicate={() => props.onDuplicate(id)} draggableId={`${id}`} index={index} key={id}></Clip>)}
        {provided.placeholder}
      </div>
    }
  </Droppable>
}

function Clip(props) {
  const data = useContext(DataContext);
  console.log(data);
  const { name, start, end } = data.find(element => Number(props.draggableId.split("-")[0]) === element.id);
  return <Draggable draggableId={props.draggableId} index={props.index}>
    {(provided) =>
      <div className="clip"
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}>
        {name}
        <div>{start} - {end}</div>
        <button onClick={props.onDuplicate}>Duplicate</button>
      </div>}
  </Draggable>
}


export default App;