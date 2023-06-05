import React, { useState } from 'react';
import Graph from "./Graph"

function MyComponent(props) {
    const [sidebarVisible, setSidebarVisible] = useState(false);
    
    return (
        <div className={"sidebar sidebarPopup " + (sidebarVisible ? "sidebarOpen" : "sidebarClosed")}>
            <button className="sidebarButton" onClick={() => setSidebarVisible(!sidebarVisible)}>
                <i className={sidebarVisible ? "fas fa-multiply" : "fas fa-bars"}></i>
            </button>

            {props.stream && sidebarVisible && props.stream.distance?.data && (
                <div>
                    {<Graph data={props.stream} index={props.current} kilometers={props.stream.distance.data} speed={props.speed} />}

                    {/*props.stream.heartrate.data ? (<Graph name="Heartrate" data={props.stream.heartrate.data} color="red" index={props.current} kilometers={props.stream.distance.data} speed={props.speed} />) : null}
                    {props.stream.cadence.data ? (<Graph name="Cadence" data={props.stream.cadence.data} color="green" index={props.current} kilometers={props.stream.distance.data} speed={props.speed} />) : null}
                    {props.stream.altitude.data ? (<Graph name="Altitude" data={props.stream.altitude.data} color="blue" index={props.current} kilometers={props.stream.distance.data} speed={props.speed} />) : null*/}
                </div>
            )}
        </div>
    );
}

export default MyComponent;
