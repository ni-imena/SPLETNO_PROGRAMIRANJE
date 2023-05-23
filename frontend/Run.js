import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from '../userContext';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker/*, Marker, Popup */ } from 'react-leaflet';
import PlotPoints from "./PlotPoints";
import L from 'leaflet';
import 'leaflet-css';
import './Run.css';
import * as d3 from 'd3';

function Run() {
  const userContext = useContext(UserContext);
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [activity, setActivity] = useState(null);
  const [stream, setStream] = useState(null);
  const [isPlotting, setIsPlotting] = useState(false);
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null); // Ref to store the animation frame request ID
  const [currentPoint, setCurrentPoint] = useState(null);
  const [speedup, setSpeedup] = useState(1);

  useEffect(() => {
    const getRun = async () => {
      let headers = {};
      if (userContext.user) {
        headers = {
          'Authorization': `Bearer ${userContext.user._id}`
        };
      }
      const res = await fetch(`http://localhost:3001/runs/${id}`, {
        headers: headers
      });
      const data = await res.json();
      setRun(data);
      setActivity(data.activity);
      setStream(data.stream);
    };
    getRun();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [id, userContext, setActivity, setRun]);

  const handlePlayClick = () => {
    if (!isPlotting) {
      setIsPlotting(true);
    }
  };

  const handleRestartClicked = () => {

  };

  const handleStopClicked = () => {
    if (isPlotting) {
      setIsPlotting(false);
    }
  };

  const handleForwardClicked = () => {
    speedup === -1 || speedup === 1 ? setSpeedup(2) :
      speedup < 1 ? setSpeedup(speedup / 2) : setSpeedup(speedup * 2);
  };

  const handleBackClicked = () => {
    speedup === 1 ? setSpeedup(-2) :
      speedup > 1 ? setSpeedup(speedup / 2) : setSpeedup(speedup * 2);
  };

  const calculateCenter = data => { // gets the center point of the run
    const lats = data.map((point) => point[0]);
    const lngs = data.map((point) => point[1]);

    const maxLat = Math.max(...lats);
    const minLat = Math.min(...lats);
    const maxLng = Math.max(...lngs);
    const minLng = Math.min(...lngs);

    const centerLat = (maxLat + minLat) / 2;
    const centerLng = (maxLng + minLng) / 2;

    return [centerLat, centerLng];
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

  function drawGraph(data) {
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 230 - margin.top - margin.bottom;

    const svg = d3.select(".statistics").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d));

    x.domain([0, data.length - 1]);
    y.domain([d3.min(data), d3.max(data)]);

    svg.append("path")
      .datum(data)
      .attr("class", "line")
      .attr("d", line);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    svg.append("g")
      .call(d3.axisLeft(y));
  }

  return (
    <div>
      <div>
        {stream && (
          <MapContainer ref={mapRef} className="map" id="map" center={calculateCenter(stream.latlng.data)} zoom={15}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>" />
            <CircleMarker center={calculateCenter(stream.latlng.data)} radius={5} color="blue" fillColor="blue" fillOpacity={1} />
            {isPlotting &&
              <PlotPoints stream={stream} activity={activity} speedup={speedup} mapRef={mapRef} isPlotting={isPlotting} />
            }
            <div className="controls">
              <button className="icon" onClick={handlePlayClick}>
                <i className="fas fa-play"></i>
              </button>
              <button className="icon" >
                <i className="fas fa-redo"></i>
              </button>
              <span className="speedup">{speedup}x</span>
              <button className="icon" onClick={handleBackClicked}>
                <i className="fas fa-step-backward"></i>
              </button>
              <button className="icon" onClick={handleStopClicked}>
                <i className="fas fa-stop"></i>
              </button>
              <button className="icon" onClick={handleForwardClicked}>
                <i className="fas fa-step-forward"></i>
              </button>
            </div>
          </MapContainer>
        )}
      </div>
    </div>
  );
}

//TODO popravi start/stop/changespeed
//TODO grafi
//TODO restart

export default Run;
