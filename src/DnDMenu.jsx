import React, { useState, useContext } from 'react';
import ClipsPool from './ClipsPool.jsx'
import { DragDropContext, } from 'react-beautiful-dnd';
import DataContext, { DataContextProvider } from "./DataContext.jsx"

export default function DnDMenu(props) {
    const [availableIDs, setAvailableIDs] = useState([]);//the IDs of the unused clips
    const [usedIDs, setUsedIDs] = useState([]);//the IDs of the clips being used
    const [clips, setClips] = useContext(DataContext);//table of clip information
    console.log(DataContext._currentValue)
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
            const { start, end } = clips[id];
            return [start, end];
        });
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ clips: reqData, id: DLID })
        }
        fetch("/build-mp3", options).then(res => {//since this creates a new file it reloads the window when run in the dev server
            console.log(res);
            showDL(true);
        });
    }

    function getPlaceholderData() {
        const options = {
            method: "POST"
        }
        fetch("/placeholder-fragments", options).then(res => res.json()).then(json => {
            console.log(json)
            setDLID(json.id);
            const newData = json.data.map((timestamp) => (
                {
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
        fetch("/audio-fragments", options).then(res => res.json()).then(json => {
            console.log(json)
            setDLID(json.id);
            const newData = json.data.map((timestamp, index) => (
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
        const myPromise = new Promise((resolve, reject) => {
            const video = document.getElementById("video")
            video.currentTime = start;
            function oneTimePause() {
                if (video.currentTime > end) {
                    console.log("video pausing");
                    video.pause();
                    resolve(end);
                    //video.removeEventListener("timeupdate",oneTimePause);
                } else {
                    requestAnimationFrame(oneTimePause)
                }
            }
            requestAnimationFrame(oneTimePause)
            //video.addEventListener("timeupdate", oneTimePause);
            video.play();
        })

        return myPromise;
        //setTimeout(()=>{console.log("trying to pause video"); video.pause()},(end-start)*1000);
    }

    async function playPreview() {
        for (let clipID of usedIDs) {
            const { start, end } = clips[clipID];
            const res = await playClip(start, end);
            console.log(res)
        }
    }


    return (
        <div id="app">
            {/* TODO style the video element */}
            <video id="video" controls visible="false">
                <source id="source" type="video/mp4"></source>
            </video>
            <DragDropContext onDragEnd={onDragEnd}>
                <ClipsPool clipsIDs={availableIDs} setClipsIDs={setAvailableIDs} onPlay={playClip} droppableId="availableIDs"></ClipsPool>
                <ClipsPool clipsIDs={usedIDs} setClipsIDs={setUsedIDs} onPlay={playClip} droppableId="usedIDs"></ClipsPool>
            </DragDropContext>
            <button onClick={buildMP3}>Export to mp3</button>
            <button onClick={getPlaceholderData}>Get placeholder data</button>
            <button onClick={getData}>Get words</button>
            <button onClick={playPreview}>Play Preview</button>
            <input type="file" id="audioFile" name="audioFile" accept=".mp3, .mp4" onChange={displayVideo}></input><br></br>
            {isDLShowing && <a href={`/tempfiles/output${DLID}.mp3`}>output link</a>}
        </div >
    );
}