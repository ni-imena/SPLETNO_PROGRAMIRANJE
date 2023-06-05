import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from '../userContext';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import Sidebar from "./Sidebar"
import moment from "moment";
import L from 'leaflet';
import 'leaflet-css';
import './Run.css';

function Run() {
  const userContext = useContext(UserContext);
  const { id } = useParams();
  const [run, setRun] = useState(null);
  const [activity, setActivity] = useState(null);
  const [stream, setStream] = useState(null);
  const [isPlotting, setIsPlotting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [current, setCurrent] = useState(1);
  const [isCentered, setIsCentered] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const [runs, setRuns] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const runnerMarkerRef = useRef(null);
  const iRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const getRun = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/runs/${id}`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      if (data.message === "Token expired.") {
        setTokenExpired(true);
      }
      else {
        setTokenExpired(false);
        setRun(data.run);
        setActivity(data.run.activity);
        setStream(data.run.stream);
      }
    };
    getRun();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [id, userContext, setActivity, setRun]);

  useEffect(function () {
    const fetchRuns = async function () {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/runs/nearby/${id}`, {
        credentials: "include",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        }
      });
      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      if (data.message === "Token expired.") {
        setTokenExpired(true);
      }
      else {
        setTokenExpired(false);
        setRuns(data.runs);
      }
    };
    fetchRuns();
  }, [userContext]);

  const drawPlotPoint = () => {
    setIsAnimationComplete(false);
    const currentIndex = iRef.current;
    const nextIndex = currentIndex + 1;
    const currentPoint = stream.latlng.data[currentIndex];
    const nextPoint = stream.latlng.data[nextIndex];

    if (!currentPoint || !nextPoint) {
      return;
    }

    const [currentLat, currentLng] = currentPoint;
    const [nextLat, nextLng] = nextPoint;
    const distance = getDistance(currentLat, currentLng, nextLat, nextLng);
    const distanceInSeconds = stream.time.data[nextIndex] - stream.time.data[currentIndex];

    if (distance === 0) {
      handleZeroDistance(nextLat, nextLng);
    } else {
      animateMovement(currentLat, currentLng, nextLat, nextLng, distanceInSeconds);
    }
  };

  const handleZeroDistance = (nextLat, nextLng) => {
    polylineRef.current.addLatLng([nextLat, nextLng]);
    iRef.current += 1;

    if (iRef.current < stream.latlng.data.length) {
      animationFrameRef.current = requestAnimationFrame(drawPlotPoint);
    } else {
      setIsPlotting(false);
    }
  };

  const animateMovement = (currentLat, currentLng, nextLat, nextLng, distanceInSeconds) => {
    const rawDuration = distanceInSeconds * 1000; // Convert to milliseconds
    const duration = rawDuration / speed;
    const totalFrames = duration / (1000 / 60); // Assuming 60 frames per second
    let frame = 0;

    const drawFrame = () => {
      const progress = frame / totalFrames;
      const lat = currentLat + (nextLat - currentLat) * progress;
      const lng = currentLng + (nextLng - currentLng) * progress;
      polylineRef.current.addLatLng([lat, lng]);

      if (isCentered) {
        mapRef.current.panTo([lat, lng], 18);
      }

      updateRunnerMarker(lat, lng);
      frame++;

      if (frame <= totalFrames) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
      } else {
        handleAnimationComplete();
      }
    };

    drawFrame();
  };

  const updateRunnerMarker = (lat, lng) => {
    if (runnerMarkerRef.current) {
      mapRef.current.removeLayer(runnerMarkerRef.current);
    }
    const runningIcon = L.divIcon({
      className: 'runnerIcon',
      html: '<div class="runnerAnimation"></div>',
      iconSize: [330, 428],
      iconAnchor: [165, 232]
    });

    runnerMarkerRef.current = L.marker([lat, lng], {
      icon: runningIcon,
    }).addTo(mapRef.current);
  };

  const handleAnimationComplete = () => {
    setCurrent(iRef.current);
    iRef.current += 1;
    if (iRef.current < stream.latlng.data.length) {
      setIsAnimationComplete(true);
      animationFrameRef.current = requestAnimationFrame(drawPlotPoint);
    } else {
      setIsPlotting(false);
    }
  };

  const getDistance = (lat1, lng1, lat2, lng2) => {
    if (lat1 === lat2 && lng1 === lng2) {
      return 0;
    }

    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLng = deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const startPlotting = () => {
    if (!isPlotting) {
      setIsPlotting(true);
      iRef.current = 1;
      mapRef.current.flyTo(stream.latlng.data[0], 18);
      polylineRef.current = L.polyline([], { color: 'cyan', weight: 3 }).addTo(mapRef.current);
      drawPlotPoint();
    }
  };

  const handleRunStartClick = () => {
    if (isAnimationComplete) {
      handleRunRestartClick();
    } else {
      startPlotting();
    }
  };

  const handleRunPauseClick = () => {
    if (isPlotting) {
      setIsPaused(!isPaused);
      if (!isPaused) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      } else {
        drawPlotPoint();
      }
    }
  };

  const handleRunSpeedClick = (direction) => {
    if (direction === 'low') {
      if (speed <= 0.25) setSpeed(prevSpeed => prevSpeed); else setSpeed(prevSpeed => prevSpeed / 2);
    } else if (direction === 'high') {
      if (speed >= 512) setSpeed(prevSpeed => prevSpeed); else setSpeed(prevSpeed => prevSpeed * 2);
    }
  };

  const velocityToPace = velocity => { // convert m/s to pace in mm:ss format
    if (current <= 1) { return `0:00`; }
    const pace = 60 / (velocity * 3.6);
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    if (hours > 0) {
      return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
      return `${formattedMinutes}:${formattedSeconds}`;
    }
  };

  const getElevation = (altitudeArray) => {
    return (Math.max(...altitudeArray) - Math.min(...altitudeArray)).toFixed(0);
  };

  useEffect(() => {
    if (isPlotting && !isPaused) {
      startPlotting();
    }
  }, [isPlotting, isPaused,]);

  useEffect(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      drawPlotPoint();
    }
  }, [speed, isCentered]);

  const toggleCentering = () => {
    setIsCentered(prevState => !prevState);
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

  const handleRunRestartClick = () => {
    setIsPaused(false);
    setSpeed(1);
    setCurrent(1);
    setIsAnimationComplete(false);

    if (polylineRef.current) {
      mapRef.current.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    iRef.current = 0;

    if (runnerMarkerRef.current) {
      mapRef.current.removeLayer(runnerMarkerRef.current);
      runnerMarkerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    polylineRef.current = L.polyline([], { color: 'cyan', weight: 3 }).addTo(mapRef.current);

    startPlotting();
  };

  const handlePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  let scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  }

  return (
    <div>
      <div>
        {stream && runs && (
          <MapContainer ref={mapRef} className="runMap" id="runMap" center={calculateCenter(stream.latlng.data)} zoom={15} doubleClickZoom={false}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>" />
            {/* <CircleMarker center={calculateCenter(stream.latlng.data)} radius={5} color="blue" fillColor="blue" fillOpacity={1} /> */}
            {isPlotting && (
              <div className='runData'>
                <div>
                  {stream.distance ? (<div>Distance:</div>) : null}
                  {stream.velocity_smooth ? (<div>Pace:</div>) : null}
                  {stream.velocity_smooth ? (<div>Speed:</div>) : null}
                  {stream.heartrate ? (<div>Heart rate:</div>) : null}
                  {stream.cadence ? (<div>Cadence:</div>) : null}
                  {stream.altitude ? (<div>Elevation:</div>) : null}
                  <div>Calories: </div>
                  {stream.time ? (<div>Time:</div>) : null}
                </div>
                <div>
                  {stream.distance ? (<div>{(stream.distance.data[current] / 1000).toFixed(2)} km</div>) : null}
                  {stream.velocity_smooth ? (<div>{velocityToPace(stream.velocity_smooth.data[current])}</div>) : null}
                  {stream.velocity_smooth ? (<div>{(stream.velocity_smooth.data[current] * 3.6).toFixed(2)} km/h</div>) : null}
                  {stream.heartrate ? (<div> {stream.heartrate.data[current]} bpm</div>) : null}
                  {stream.cadence ? (<div>{stream.cadence.data[current]} </div>) : null}
                  {stream.altitude ? (<div>{stream.altitude.data[current]}</div>) : null}
                  <div>{Math.round(activity.calories * current / stream.distance.data.length)} kcal</div>
                  {stream.time ? (<div>{formatTime(stream.time.data[current])}</div>) : null}
                </div>
              </div>
            )}
            <div className="controls">
              <button className="icon" onClick={toggleCentering}><i className="fas fa-arrows-alt"></i></button>
              <button className="icon" onClick={handleRunRestartClick}><i className="fas fa-redo"></i></button>
              <span className="speedup">{speed}x</span>
              <button className="icon" onClick={() => handleRunSpeedClick('low')}><i className="fas fa-step-backward"></i></button>
              {isPlotting ? (
                <button className="icon" onClick={handleRunPauseClick}><i className={isPaused ? "fas fa-play" : "fas fa-pause"}></i></button>
              ) : (
                <button className="icon" onClick={handleRunStartClick}><i className="fas fa-play"></i></button>)}
              <button className="icon" onClick={() => handleRunSpeedClick('high')}><i className="fas fa-step-forward"></i></button>
            </div>
            {sidebarVisible && (
              <button className="sidebarButton sidebarPointer" onClick={() => scrollToBottom()}>
                <i className="fas fa-hand-point-down"></i>
              </button>
            )}
          </MapContainer>
        )}
      </div>
      <div>
        {stream && runs && (
          <Sidebar stream={stream} current={current} speed={speed} />
        )}
      </div>
      <div className={isPopupOpen ? "addRunPopup" : "addRun"}>
        {isPopupOpen && (
          <div className="popup">
            <div className="popup-content">
              <ul className="list-group">
                <li className="list-group-item rounded-6 mb-2 title-row runTitleRow runsListGroupItem">
                  <div className="row column-title runColumnTitle">
                    <div className="col-2">Away</div>
                    <div className="col-2">Name</div>
                    <div className="col-2">Date</div>
                    <div className="col-2">Time</div>
                    <div className="col-2">Distance</div>
                    <div className="col-2">Elevation</div>
                  </div>
                </li>
                {runs
                  .sort((a, b) => a.distance - b.distance)
                  .map((run) => (
                    <button className="list-group-item rounded-6 mb-2 item-row runItemRow runsListGroupItem" key={run._id} /*onClick={handleAddRun}*/>
                      <div className="row align-items-center column-item runColumnItem">
                        <div className="col-2"><h6 className="mb-0">{run.distance.toFixed(2)} km</h6></div>
                        <div className="col-2"><h6 className="mb-0">{run.activity.name}</h6></div>
                        <div className="col-2"><h6 className="mb-0">{moment(run.activity.start_date).format("D/M/YYYY")}</h6></div>
                        <div className="col-2"><h6 className="mb-0">{formatTime(run.activity.elapsed_time)}</h6></div>
                        <div className="col-2"><h6 className="mb-0">{`${(run.activity.distance / 1000).toFixed(2)} km`}</h6></div>
                        <div className="col-2"><h6 className="mb-0">{run.stream.altitude && run.stream.altitude.data ? getElevation(run.stream.altitude.data) + "m" : ''}</h6></div>
                      </div>
                    </button>
                  ))}
              </ul>
            </div>
          </div>
        )}
        {isPopupOpen ?
          (<button className="addRunButtonOpen" onClick={handlePopup}>Hide</button>) :
          (<button className="addRunButtonClose" onClick={handlePopup}>Add Run</button>)
        }
      </div>
    </div>
  );
}

export default Run;