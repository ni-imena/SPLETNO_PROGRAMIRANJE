import { useContext, useEffect, useState, useRef } from 'react';
import { UserContext } from '../userContext';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer/*, Marker, Popup */} from 'react-leaflet';
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
  const mapRef = useRef(null);
  const animationFrameRef = useRef(null); // Ref to store the animation frame request ID

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

  function plotPoint() {
    let i = 0;
    const map = mapRef.current;
    let polyline;
    let runnerMarker;

    var runningIcon = L.icon({
      iconUrl: 'https://use.fontawesome.com/releases/v5.8.1/svgs/solid/running.svg',
      iconSize: [38, 95],
      iconAnchor: [22, 54],
      popupAnchor: [-3, -76]
    });

    function drawPlotPoint() {
      if (i < stream.latlng.data.length) {
        let point = stream.latlng.data[i];
        polyline.addLatLng([point[0], point[1]]);
        if (runnerMarker) {
          map.removeLayer(runnerMarker);
        }
        runnerMarker = L.marker([point[0], point[1]], { icon: runningIcon }).addTo(map);
        i++;
        console.log(point);
        animationFrameRef.current = requestAnimationFrame(drawPlotPoint);
      } else {
        setIsPlotting(false);
      }
    }

    polyline = L.polyline([], { color: 'red', weight: 3 }).addTo(map);
    drawPlotPoint();
  }

  const handleButtonClick = () => {
    if (!isPlotting) {
      setIsPlotting(true);
      plotPoint();
    }
  };

  return (
    <div>
      {!isPlotting && (
        <button className="btn btn-primary" onClick={handleButtonClick}>Start Plotting</button>
      )}
      <div>
        {stream && (
          <MapContainer ref={mapRef} className="map" id="map" center={stream.latlng.data[0]} zoom={15}>
            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>" />
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default Run;
