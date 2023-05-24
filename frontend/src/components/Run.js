import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from '../userContext';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
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

  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const runnerMarkerRef = useRef(null);
  const iRef = useRef(0);
  const animationFrameRef = useRef(null);


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

  // const updateRunnerMarker = (lat, lng) => {
  //   if (runnerMarkerRef.current) {
  //     mapRef.current.removeLayer(runnerMarkerRef.current);
  //   }

  //   const runningIcon = L.icon({
  //     iconUrl: 'https://use.fontawesome.com/releases/v5.8.1/svgs/solid/running.svg',
  //     iconSize: [28, 75],
  //     iconAnchor: [22, 54],
  //     popupAnchor: [-3, -76],
  //   });

  //   runnerMarkerRef.current = L.marker([lat, lng], {
  //     icon: runningIcon,
  //   }).addTo(mapRef.current);
  // };

  const updateRunnerMarker = (lat, lng) => {
    if (runnerMarkerRef.current) {
      mapRef.current.removeLayer(runnerMarkerRef.current);
    }
    const runningIcon = L.divIcon({
      className: 'runner-icon',
      html: '<div class="runner-animation"></div>',
      iconSize: [57, 67],
      iconAnchor: [28, 40],
      popupAnchor: [-3, -76],
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
      polylineRef.current = L.polyline([], { color: 'red', weight: 3 }).addTo(mapRef.current);
      drawPlotPoint();
    }
  };

  const handleRunStartClick = () => { startPlotting(); };

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
      setSpeed(prevSpeed => prevSpeed / 2);
    } else if (direction === 'high') {
      setSpeed(prevSpeed => prevSpeed * 2);
    }
  };

  const velocityToPace = velocity => { // convert m/s to pace in mm:ss format
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

  return (
    <div>
      <div>
        {stream && (
          <MapContainer ref={mapRef} className="map" id="map" center={calculateCenter(stream.latlng.data)} zoom={15} doubleClickZoom={false}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>" />
            {/* <CircleMarker center={calculateCenter(stream.latlng.data)} radius={5} color="blue" fillColor="blue" fillOpacity={1} /> */}
            {isPlotting && (
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
                  {stream.distance ? (<div>{(stream.distance.data[current] / 1000).toFixed(2)} km</div>) : <div></div>}
                  {stream.velocity_smooth ? (<div>{velocityToPace(stream.velocity_smooth.data[current])}</div>) : <div></div>}
                  {stream.velocity_smooth ? (<div>{(stream.velocity_smooth.data[current] * 3.6).toFixed(2)} km/h</div>) : <div></div>}
                  {stream.heartrate ? (<div> {stream.heartrate.data[current]} bpm</div>) : <div></div>}
                  {stream.cadence ? (<div>{stream.cadence.data[current]} </div>) : <div></div>}
                  {stream.altitude ? (<div>{stream.altitude.data[current]}</div>) : <div></div>}
                  <div>{Math.round(activity.calories * current / stream.distance.data.length)} kcal</div>
                  {stream.time ? (<div>{formatTime(stream.time.data[current])}</div>) : <div></div>}
                </div>
                {current}
              </div>
            )}
            <div className="controls">
              <button className="icon" onClick={toggleCentering}><i className="fas fa-arrows-alt"></i></button>
              <button className="icon"><i className="fas fa-redo"></i></button>
              <span className="speedup">{speed}x</span>
              <button className="icon" onClick={() => handleRunSpeedClick('low')}><i className="fas fa-step-backward"></i></button>
              {isPlotting
                ? (<button className="icon" onClick={handleRunPauseClick}><i className={isPaused ? "fas fa-play" : "fas fa-pause"}></i></button>)
                : (<button className="icon" onClick={handleRunStartClick}><i className="fas fa-play"></i></button>)
              }

              <button className="icon" onClick={() => handleRunSpeedClick('high')}><i className="fas fa-step-forward"></i></button>
            </div>
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default Run;