import { useContext, useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import io from "socket.io-client";

import "./Home.css";
import 'leaflet-css';

function Home() {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const mapRef = useRef(null);
  const [gpsLocation, setGPSLocation] = useState(null);


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
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setGPSLocation({ latitude, longitude });
          },
          (error) => {
            console.error('Error retrieving GPS location:', error);
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3001");
    console.log("Socket.IO connection status:", socket.connected);
    console.log(gpsLocation);
    // Send GPS location updates to the server
    socket.emit("gpsUpdate", gpsLocation); // Adjust the location data as needed

    // Handle GPS location updates from the server
    socket.on("gpsUpdate", (location) => {
      console.log("Received GPS location update:", location);

      // Further processing with the received location data
    });

    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [gpsLocation]);



  const handleRunClick = (run) => {
    mapRef.current.flyTo(run.location.coordinates, 15);
    setSelectedRun(run);
  };

  const handleCenterOnGPSLocation = () => {
    if (mapRef.current && gpsLocation) {
      mapRef.current.flyTo([gpsLocation.latitude, gpsLocation.longitude], 15);
    }
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
                <div className="col-4">Name</div>
                <div className="col-3">Distance</div>
                <div className="col-5">Elevation</div>
              </div>
            </li>
            {runs.map((run) => (
              <button className="homeListGroupItem list-group-item rounded-6 mb-2" key={run._id} onClick={() => handleRunClick(run)}>
                <div className="row align-items-center homeColumnItem">
                  <div className="col-4"><h5 className="mb-0 homeTruncate">{run.name}</h5></div>
                  <div className="col-3"><span className="mb-0 homeTruncate">{`${(run.distance / 1000).toFixed(2)} km`}</span></div>
                  <div className="col-5">{run.location.coordinates}</div>
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
