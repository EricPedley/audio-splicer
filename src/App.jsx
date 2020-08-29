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
  const [DLID, setDLID] = useState();//id of file for upload and download
  const [isDLShowing, showDL] = useState(false);
  //console.log(available, used)
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

  function buildMP3() {
    const reqData = used.map(uniqueID => {
      const id = Number((uniqueID + "").split("-")[0]);
      const { start, end } = data.find(element => id === element.id);
      return [start, end];
    });
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ clips: reqData, id: DLID })
    }
    fetch("http://localhost:3001/build-mp3", options).then(res => {//since this creates a new file it reloads the window when run in the dev server
      console.log(res);
      showDL(true);
    });
  }

  function getPlaceholderData() {
    const options = {
      method: "POST"
    }
    fetch("http://localhost:3001/placeholder-fragments", options).then(res => res.json()).then(json => {
      console.log(json)
      setDLID(json.id);
      const newData = json.data[0].timestamps.map((timestamp, index) => (
        {
          id: index,
          name: timestamp[0],
          start: timestamp[1],
          end: timestamp[2]
        }));
      console.log(newData);
      setData(newData);
      setAvailable(newData.map((e, index) => index));
    }).catch(console.log);
  }

  function getData() {
    const form = new FormData();
    const file = document.getElementById("audioFile").files[0]
    form.append("audioFile", file);
    const options = {
      method: "POST",
      body: form
    }
    fetch("http://localhost:3001/audio-fragments", options).then(res => res.json()).then(json => {
      console.log(json)
      setDLID(json.id);
      const newData = json.data[0].timestamps.map((timestamp, index) => (
        {
          id: index,
          name: timestamp[0],
          start: timestamp[1],
          end: timestamp[2]
        }));
      console.log(newData);
      setData(newData);
      setAvailable(newData.map((e, index) => index));
    }).catch(console.log);
  }

  function displayVideo() {
    const file = document.getElementById("audioFile").files[0];
    const src = URL.createObjectURL(file);
    const video = document.getElementById("video");
    const source = document.getElementById("source");
    source.setAttribute("src", src);
    video.load();

  }

  function playClip(start, end) {
    const video = document.getElementById("video")
    video.currentTime = start;
    function oneTimePause() {
      if (video.currentTime > end) {
        console.log("video pausing");
        video.pause();
        //video.removeEventListener("timeupdate",oneTimePause);
      } else {
        requestAnimationFrame(oneTimePause)
      }
    }
    requestAnimationFrame(oneTimePause)
    //video.addEventListener("timeupdate", oneTimePause);
    video.play();
    //setTimeout(()=>{console.log("trying to pause video"); video.pause()},(end-start)*1000);
  }

  return (
    <div id="app">
      {/* TODO style the video element */}
      <video id="video" controls visible="false">
        <source id="source" type="video/mp4"></source>
      </video>
      <DragDropContext onDragEnd={onDragEnd}>
        <DataContext.Provider value={data}>
          <ClipsPool clips={available} setClips={setAvailable} onPlay={playClip} droppableId="available" id="available"></ClipsPool>
          <ClipsPool clips={used} setClips={setUsed} onPlay={playClip} droppableId="used"></ClipsPool>
        </DataContext.Provider>
      </DragDropContext>
      <button onClick={buildMP3}>Export to mp3</button>
      <button onClick={getPlaceholderData}>Get placeholder data</button>
      <button onClick={getData}>Get words</button>
      <input type="file" id="audioFile" name="audioFile" accept=".mp3, .mp4" onChange={displayVideo}></input><br></br>
      {isDLShowing && <a href={`http://localhost:3001/tempfiles/output${DLID}.mp3`}>output link</a>}
    </div >
  );
}

function ClipsPool({ clips, setClips, ...props }) {//it is fed the available clips through props

  function duplicateClip(id) {
    setClips([...clips, `${id}-${uniquenumber++}`]);
  }

  function deleteClip(id) {
    const duplicateArray = [...clips];
    duplicateArray.splice(duplicateArray.indexOf(id), 1)
    setClips(duplicateArray);
  }


  return <Droppable droppableId={props.droppableId} direction="horizontal">
    {(provided) =>
      <div
        id={props.id || ""}
        className="clips-pool"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {clips.map((id, index) => <Clip onDuplicate={() => duplicateClip(id)} onDelete={() => deleteClip(id)} onPlay={props.onPlay} draggableId={`${id}`} index={index} key={id}></Clip>)}
        {provided.placeholder}
      </div>
    }
  </Droppable>
}

function Clip(props) {
  const data = useContext(DataContext);
  const { name, start: initialStart, end: initialEnd } = data.find(element => Number(props.draggableId.split("-")[0]) === element.id);
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  return <Draggable draggableId={props.draggableId} index={props.index}>
    {(provided) =>
      <div className="clip" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        {name}
        <div>
          <input type="text" className="time-input" defaultValue={start} onChange={(e) => { e.target.value && setStart(e.target.value) }}></input> - <input type="text" className="time-input" defaultValue={end} onChange={(e) => { e.target.value && setEnd(e.target.value) }}></input>
        </div>
        <button onClick={props.onDuplicate}>Duplicate</button>
        <button onClick={props.onDelete}>Delete</button>
        <button onClick={() => props.onPlay(start, end)}>Play</button>
      </div>}
  </Draggable>
}


export default App;