import React, { useState, useContext } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'



const placeholderData = [
  {name: "never", start: "0", end: "1" },
  {name: "gonna", start: "0", end: "1" },
  {name: "give", start: "0", end: "1" },
  {name: "you", start: "0", end: "1" }
];

var uniquenumber = 0;

const DataContext = React.createContext();
function App() {

  const [availableIDs, setAvailableIDs] = useState([]);//the IDs of the unused clips
  const [usedIDs, setUsedIDs] = useState([]);//the IDs of the clips being used
  const [clips, setClips] = useState(placeholderData);//table of clip information
  const [DLID, setDLID] = useState();//id of file for upload and download
  const [isDLShowing, showDL] = useState(false);
  
  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index))//no destination or dropped in same location
      return;
    const states = Object.assign({}, { availableIDs: availableIDs, usedIDs: usedIDs });
    states[source.droppableId].splice(source.index, 1);//remove from where it was before
    states[destination.droppableId].splice(destination.index, 0, draggableId)//insert into new place
    setAvailableIDs(states.availableIDs);
    setUsedIDs(states.usedIDs);
  }

  function buildMP3() {
    const reqData = usedIDs.map(uniqueID => {
      const id = Number((uniqueID + "").split("-")[0]);
      const { start, end } = clips[id]
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
      setClips(newData);
      setAvailableIDs(newData.map((e, index) => index));
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
      setClips(newData);
      setAvailableIDs(newData.map((e, index) => index));
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
    const myPromise = new Promise(()=>{console.log("resolved")},()=>{console.log("error")})
    const video = document.getElementById("video")
    video.currentTime = start;
    function oneTimePause() {
      if (video.currentTime > end) {
        console.log("video pausing");
        video.pause();
        Promise.resolve()
        //video.removeEventListener("timeupdate",oneTimePause);
      } else {
        requestAnimationFrame(oneTimePause)
      }
    }
    requestAnimationFrame(oneTimePause)
    //video.addEventListener("timeupdate", oneTimePause);
    video.play();
    return myPromise;
    //setTimeout(()=>{console.log("trying to pause video"); video.pause()},(end-start)*1000);
  }

  function playPreview() {
    for(let clipID of usedIDs) {
      const [start,end] = clips[clipID];
      const myPromise = playClip(start,end);
    }
  }


  return (
    <div id="app">
      {/* TODO style the video element */}
      <video id="video" controls visible="false">
        <source id="source" type="video/mp4"></source>
      </video>
      {console.log(clips)}
      <DragDropContext onDragEnd={onDragEnd}>
        <DataContext.Provider value={[clips,setClips]}>
          <ClipsPool clipsIDs={availableIDs} setClipsIDs={setAvailableIDs} onPlay={playClip} droppableId="availableIDs" id="availableIDs"></ClipsPool>
          <ClipsPool clipsIDs={usedIDs} setClipsIDs={setUsedIDs} onPlay={playClip} droppableId="usedIDs"></ClipsPool>
        </DataContext.Provider>
      </DragDropContext>
      <button onClick={buildMP3}>Export to mp3</button>
      <button onClick={getPlaceholderData}>Get placeholder data</button>
      <button onClick={getData}>Get words</button>
      <button onClick={playPreview}>Play Preview</button>
      <input type="file" id="audioFile" name="audioFile" accept=".mp3, .mp4" onChange={displayVideo}></input><br></br>
      {isDLShowing && <a href={`http://localhost:3001/tempfiles/output${DLID}.mp3`}>output link</a>}
    </div >
  );
}

function ClipsPool({ clipsIDs, setClipsIDs, ...props }) {//it is fed the availableIDs clips through props
  const [clips,setClips] = useContext(DataContext);
  console.log(clipsIDs);

  function duplicateClip(id) {
    setClipsIDs([...clipsIDs,clips.length]);
    setClips([...clips, clips[id]]);
  }

  function deleteClip(id) {
    const duplicateArray = [...clipsIDs];
    duplicateArray.splice(clipsIDs.indexOf(id), 1);
    setClipsIDs(duplicateArray);
  }


  return <Droppable droppableId={props.droppableId} direction="horizontal">
    {(provided) =>
      <div
        id={props.id || ""}
        className="clips-pool"
        ref={provided.innerRef}
        {...provided.droppableProps}
      >
        {clipsIDs.map((id, index) => <Clip onDuplicate={() => duplicateClip(id)} onDelete={() => deleteClip(id)} onPlay={props.onPlay} id={id} index={index} key={id}></Clip>)}
        {provided.placeholder}
      </div>
    }
  </Droppable>
}

function Clip({id,...props}) {
  const [clips,setClips] = useContext(DataContext);
  console.log(id)
  const { name, start: initialStart, end: initialEnd } = clips[id]
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  function setStartGlobally(newVal) {
    setStart(newVal);
    const newArray = [...clips];
    const oldClip = newArray.splice(id,1)[0];
    oldClip.start=newVal;
    newArray.splice(id,0,oldClip);
    setClips(newArray)
  }

  function setEndGlobally(newVal) {
    setEnd(newVal);
    const newArray = [...clips];
    const oldClip = newArray.splice(id,1)[0];
    oldClip.end=newVal;
    newArray.splice(id,0,oldClip);
    setClips(newArray)
  }

  return <Draggable draggableId={id+""} index={props.index}>
    {(provided) =>
      <div className="clip" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
        {name}
        <div>
          <input type="text" className="time-input" defaultValue={start} onChange={(e) => { e.target.value && setStartGlobally(e.target.value);}}></input> - <input type="text" className="time-input" defaultValue={end} onChange={(e) => { e.target.value && setEndGlobally(e.target.value) }}></input>
        </div>
        <button onClick={props.onDuplicate}>Duplicate</button>
        <button onClick={props.onDelete}>Delete</button>
        <button onClick={() => props.onPlay(start, end)}>Play</button>
      </div>}
  </Draggable>
}


export default App;