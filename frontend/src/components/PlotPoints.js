import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from '../userContext';
import { useParams } from 'react-router-dom';
import L from 'leaflet';

function PlotPoints(props) {
  const [currentPoint, setCurrentPoint] = useState(1);
  const [isPlotting, setIsPlotting] = useState(props.isPlotting);
  const animationFrameRef = useRef(null); // Ref to store the animation frame request ID

  const map = props.mapRef.current;
  let polyline;
  let runnerMarker;
  let currentDelay = props.stream.time.data[0] * 1000;

  var runningIcon = L.icon({
    iconUrl: 'https://use.fontawesome.com/releases/v5.8.1/svgs/solid/running.svg',
    iconSize: [38, 95],
    iconAnchor: [22, 54],
    popupAnchor: [-3, -76]
  });

  useEffect(() => {
    if (currentPoint > 0) {
      currentDelay = ((props.stream.time.data[currentPoint] - props.stream.time.data[currentPoint - 1]) * 1000) / Math.abs(props.speedup); //gets the delay in between 2 points

      polyline = L.polyline([], { color: 'red', weight: 3 }).addTo(map);
      if (isPlotting) {
        setIsPlotting(false);
        drawPlotPoint();
      }

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [props.speedup]);

  let i = 0;
  function drawPlotPoint() {
    if (i < props.stream.latlng.data.length - 1) {
      let point = props.stream.latlng.data[i];

      polyline.addLatLng([point[0], point[1]]);
      if (runnerMarker) {
        map.removeLayer(runnerMarker);
      }
      runnerMarker = L.marker([point[0], point[1]], { icon: runningIcon }).addTo(map);
      i++;
      setCurrentPoint(i); // sets the point that is shown on the graph
      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(() => drawPlotPoint());
      }, currentDelay);
    } else {
      setIsPlotting(false);
    }
  }

  const velocityToPace = velocity => { // convert m/s to pace in mm:ss format
    const pace = 60 / (velocity * 3.6);
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const formatTime = seconds => { // convert time from seconds to hh:mm:ss
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    let formattedTime = "";

    if (hours > 0) {
      formattedTime += hours.toString().padStart(2, "0") + ":";
    }

    formattedTime += minutes.toString().padStart(2, "0") + ":" +
      remainingSeconds.toString().padStart(2, "0");

    return formattedTime;
  }

  return (
    <div className='runData'>
      <div>
        <div>Distance:</div>
        <div>Pace:</div>
        <div>Speed:</div>
        <div>Heart rate:</div>
        <div>Cadence:</div>
        <div>Elevation:</div>
        <div>Calories: </div>
        <div>Time:</div>
      </div>
      <div>
        {props.stream.distance ? (<div>{(props.stream.distance.data[currentPoint] / 1000).toFixed(2)} km</div>) : <div></div>}
        {props.stream.velocity_smooth ? (<div>{velocityToPace(props.stream.velocity_smooth.data[currentPoint])}</div>) : <div></div>}
        {props.stream.velocity_smooth ? (<div>{(props.stream.velocity_smooth.data[currentPoint] * 3.6).toFixed(2)} km/h</div>) : <div></div>}
        {props.stream.heartrate ? (<div> {props.stream.heartrate.data[currentPoint]} bpm</div>) : <div></div>}
        {props.stream.cadence ? (<div>{props.stream.cadence.data[currentPoint]} </div>) : <div></div>}
        {props.stream.altitude ? (<div>{props.stream.altitude.data[currentPoint]}</div>) : <div></div>}
        <div>{Math.round(props.activity.calories * currentPoint / props.stream.distance.data.length)} kcal</div>
        {props.stream.time ? (<div>{formatTime(props.stream.time.data[currentPoint])}</div>) : <div></div>}
      </div>
    </div>
  );
}
export default PlotPoints;