import React, { useState, useContext } from 'react';
import {Draggable, Droppable} from 'react-beautiful-dnd';
import DataContext from './DataContext.jsx';

export default function ClipsPool({ clipsIDs, setClipsIDs, ...props }) {//it is fed the availableIDs clips through props
    const [clips, setClips] = useContext(DataContext);
    
    function duplicateClip(id) {
      setClipsIDs([...clipsIDs, clips.length]);
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
  
function Clip({ id, ...props }) {
    const [clips, setClips] = useContext(DataContext);
    const { name, start: initialStart, end: initialEnd } = clips[id]
    const [start, setStart] = useState(initialStart);
    const [end, setEnd] = useState(initialEnd);
  
    function setStartGlobally(newVal) {
      setStart(newVal);
      const newArray = [...clips];
      const oldClip = newArray.splice(id, 1)[0];
      oldClip.start = newVal;
      newArray.splice(id, 0, oldClip);
      setClips(newArray)
    }
  
    function setEndGlobally(newVal) {
      setEnd(newVal);
      const newArray = [...clips];
      const oldClip = newArray.splice(id, 1)[0];
      oldClip.end = newVal;
      newArray.splice(id, 0, oldClip);
      setClips(newArray)
    }
  
    return <Draggable draggableId={id + ""} index={props.index}>
      {(provided) =>
        <div className="clip" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          {name}
          <div>
            <input type="text" className="time-input" defaultValue={start} onChange={(e) => { e.target.value && setStartGlobally(e.target.value); }}></input> - <input type="text" className="time-input" defaultValue={end} onChange={(e) => { e.target.value && setEndGlobally(e.target.value) }}></input>
          </div>
          <button onClick={props.onDuplicate}>Duplicate</button>
          <button onClick={props.onDelete}>Delete</button>
          <button onClick={() => props.onPlay(start, end)}>Play</button>
        </div>}
    </Draggable>
  }