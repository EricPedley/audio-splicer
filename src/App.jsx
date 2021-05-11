import React, { useState, useContext } from 'react';
import { DragDropContext, } from 'react-beautiful-dnd';
import DataContext, { DataContextProvider } from "./DataContext.jsx"
import DndMenu from './DnDMenu.jsx'
const placeholderData = [
  { name: "never", start: "0", end: "1" },
  { name: "gonna", start: "0", end: "1" },
  { name: "give", start: "0", end: "1" },
  { name: "you", start: "0", end: "1" }
];

function App() {
  return (
    <div id="app">
      <DataContextProvider>
        <DndMenu></DndMenu>
      </DataContextProvider>
    <a href="https://github.com/EricPedley/audio-splicer">View Source on Github</a>
    </div >
  );
}




export default App;
