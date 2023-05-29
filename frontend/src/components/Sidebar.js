import React, { useState } from 'react';
import Graph from "./Graph"
import "./Sidebar.css"

function MyComponent(props) {
    const [sidebarVisible, setSidebarVisible] = useState(false);

    return (
        <div className={ "sidebar " + (sidebarVisible ? "sidebar-open" : "sidebar-closed")}>
            <button onClick={() => setSidebarVisible(!sidebarVisible)}>
                <i className={sidebarVisible ? "fas fa-multiply" : "fas fa-bars"}></i>
            </button>
            {props.stream && sidebarVisible && (
                <div>
                    <Graph name="Heartrate" data={props.stream.heartrate.data} color="red" index={props.current} kilometers={props.stream.distance.data} />
                    <Graph name="Cadence" data={props.stream.cadence.data} color="green" index={props.current} kilometers={props.stream.distance.data} />
                    <Graph name="Altitude" data={props.stream.altitude.data} color="blue" index={props.current} kilometers={props.stream.distance.data} />
                </div>
            )}
        </div>
    );
}

export default MyComponent;
