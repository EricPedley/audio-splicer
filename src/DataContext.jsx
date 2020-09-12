import React,{useState} from 'react';

const DataContext = React.createContext();

export default DataContext;
export function DataContextProvider(props) {
    const [clips,setClips] = useState([]);
    return (
        <DataContext.Provider value = {[clips,setClips]}>
            {props.children}
        </DataContext.Provider>
    );
}

