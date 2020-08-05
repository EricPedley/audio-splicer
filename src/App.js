import React, { useState, useContext } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'



const placeholderData = [
  { id: 1, name: "never", time: "00:00 - 00:01" },
  { id: 2, name: "gonna", time: "00:01 - 00:02" },
  { id: 3, name: "give", time: "00:02 - 00:03" },
  { id: 4, name: "you", time: "00:03 - 00:04" }
];

var uniquenumber = 0;

const DataContext = React.createContext();
function App() {
  const [available,setAvailable] = useState([1,2,3]);
  const [used,setUsed] = useState([]);
  const [data,setData] = useState(placeholderData);
  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index))//no destination or dropped in same location
      return;
    const states = Object.assign({},{available:available,used:used});
    states[source.droppableId].splice(source.index, 1);//remove from where it was before
    states[destination.droppableId].splice(destination.index, 0, draggableId)//insert into new place
    setAvailable(states.available);
    setUsed(states.used);
  }

  function duplicateClip(id, isAvailable) {
    if (isAvailable) {
      setAvailable([...available, `${id}-${uniquenumber++}`] );
    } else {
      setUsed([...used, `${id}-${uniquenumber++}`]);
    }
  }

  function buildMP3() {
    const options = {
      method: "POST",
      body: JSON.stringify(used)
    }
    fetch("http://localhost:3001/build-mp3", options).then(console.log)
  }

  function getData() {
    fetch("http://localhost:3001/audio-fragments").then(res => res.json()).then(json => {
      console.log(json)
      const newData = json[0].timestamps.map((timestamp, index) => (
        {
          id: index,
          name: timestamp[0]
          , time: `${timestamp[1]}-${timestamp[2]}`
        }));
      console.log(newData);
      setData(newData);
      setAvailable(newData.map((e,index)=>index));
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
  const data=useContext(DataContext);
  console.log(data);
  const { name, time } = data.find(element => Number(props.draggableId.split("-")[0]) === element.id);
  return <Draggable draggableId={props.draggableId} index={props.index}>
    {(provided) =>
      <div className="clip"
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