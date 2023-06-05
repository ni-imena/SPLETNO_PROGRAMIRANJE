import { useContext, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import "./Home.css";
import 'leaflet-css';

function Home() {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const mapRef = useRef(null);
  const [gpsLocation, setGPSLocation] = useState(null);
  const [socket, setSocket] = useState(null);


  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:3001");

    newSocket.onopen = function () {
      console.log("WebSocket connection established.");
      sendLocationData();
    };

    newSocket.onmessage = function (event) {
      const newRuns = JSON.parse(event.data);
      setRuns(newRuns);
    };

    setSocket(newSocket);

    return function cleanup() {
      newSocket.close();
    };
  }, []);

  const sendLocationData = () => {
    console.log("socket: " + socket + "gps: " + gpsLocation);
    if (socket && gpsLocation) {
      const locationData = JSON.stringify(gpsLocation);
      socket.send(locationData);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      sendLocationData();
    }, 2000);
    return function cleanup() {
      clearInterval(interval);
    };
  }, [socket, gpsLocation]);


  useEffect(function () {
    const getRuns = async function () {
      const res = await fetch("http://localhost:3001/setRuns");
      const data = await res.json();
      setRuns(data);
    };
    getRuns();
  }, []);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        console.log(navigator.geolocation);
        const options = {timeout: 10000};
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("pos: " + position);
            setGPSLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Error retrieving GPS location:', error);
          },
          options
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };
    getLocation();
  }, []);

  const handleRunClick = (run) => {
    mapRef.current.flyTo(run.location.coordinates, 15);
    setSelectedRun(run);
  };

  const handleCenterOnGPSLocation = () => {
    if (mapRef.current && gpsLocation) {
      mapRef.current.flyTo([gpsLocation.latitude, gpsLocation.longitude], 15);
    }

    sendLocationData();
  };

  return (
    <div className="container mt-4 homeScreenGrid">
      <div className="homeMap" style={{ position: 'relative' }}>
        <MapContainer ref={mapRef} className="homeMap" id="homeMap" center={gpsLocation ? [gpsLocation.latitude, gpsLocation.longitude] : [46.285502, 15.300966500000001]} zoom={15} doubleClickZoom={false}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>" />
          {gpsLocation && (
            <CircleMarker center={[gpsLocation.latitude, gpsLocation.longitude]} radius={5} color="blue" fillOpacity={1} />
          )}
          <div className="homeGps leaflet-bar">
            <a className="gpsButton leaflet-control-zoom-in" onClick={() => handleCenterOnGPSLocation()}>
              <i className="fas fa-compass"></i>
            </a>
          </div>
        </MapContainer>
      </div>
      {runs && (
        <div className="homeRuns">
          <ul className="list-group">
            <li className="list-group-item rounded-6 mb-2 title-row homeTitleRow homeListGroupItem">
              <div className="row column-title homeColumnTitle">
                <div className="col-3">Away</div>
                <div className="col-5">Name</div>
                <div className="col-4">Distance</div>
              </div>
            </li>
            {runs.sort((a, b) => a.distanceFromUser - b.distanceFromUser)
              .map((run) => (
                <button className="homeListGroupItem list-group-item rounded-6 mb-2" key={run._id} onClick={() => handleRunClick(run)}>
                  <div className="row align-items-center homeColumnItem">
                    <div className="col-3">{run.distanceFromUser ? `${(run.distanceFromUser).toFixed(2)} km` : "Loading..."}</div>
                    <div className="col-5"><h5 className="mb-0 homeTruncate">{run.name}</h5></div>
                    <div className="col-4"><span className="mb-0 homeTruncate">{`${(run.distance / 1000).toFixed(2)} km`}</span></div>
                  </div>
                </button>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
