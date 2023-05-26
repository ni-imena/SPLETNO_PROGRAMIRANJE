import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import { Navigate, Link } from "react-router-dom";
import moment from "moment";
import "./Runs.css";

function Runs() {
  const userContext = useContext(UserContext);
  const [runs, setRuns] = useState([]);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('asc');



  useEffect(function () {
    const getRuns = async function () {
      const token = localStorage.getItem('token');
      const res = await fetch("http://localhost:3001/users/runs", {
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
    getRuns();
  }, []);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getElevation = (altitudeArray) => {
    return (Math.max(...altitudeArray) - Math.min(...altitudeArray)).toFixed(0);
  };

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

  if (tokenExpired) {
    return <Navigate replace to="/logout" />;
  }
  return (
    <div className="container mt-4">
      {!userContext.user ? <Navigate replace to="/login" /> : ""}
      <ul className="list-group">
        {/* Column titles */}
        <li className="list-group-item rounded-6 mb-2 title-row">
          <div className="row column-title">
            <div className="col-1" onClick={() => handleSort('type')}>Type {sortField === 'type' && (<i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>)}</div>
            <div className="col-3" onClick={() => handleSort('name')}>Name {sortField === 'name' && (<i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>)}</div>
            <div className="col-2" onClick={() => handleSort('date')}>Date {sortField === 'date' && (<i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>)}</div>
            <div className="col-2" onClick={() => handleSort('time')}>Time {sortField === 'time' && (<i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>)}</div>
            <div className="col-2" onClick={() => handleSort('distance')}>Distance {sortField === 'distance' && (<i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>)}</div>
            <div className="col-2" onClick={() => handleSort('elevation')}>Elevation {sortField === 'elevation' && (<i className={`fas ${sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>)}</div>
          </div>
        </li>

        {/* Runs */}
        {runs
          .sort((a, b) => {
            let result = 0;
            if (sortField === 'type') {
              result = a.activity.type.localeCompare(b.activity.type);
            } else if (sortField === 'name') {
              result = a.activity.name.localeCompare(b.activity.name);
            } else if (sortField === 'date') {
              result = moment(b.activity.start_date) - moment(a.activity.start_date);
            } else if (sortField === 'time') {
              result = a.activity.elapsed_time - b.activity.elapsed_time;
            } else if (sortField === 'distance') {
              result = a.activity.distance - b.activity.distance;
            } else if (sortField === 'elevation') {
              if (a.stream.altitude && a.stream.altitude.data && b.stream.altitude && b.stream.altitude.data) {
                result = getElevation(a.stream.altitude.data) - getElevation(b.stream.altitude.data);
              }
            }

            if (sortDirection === 'desc') {
              result *= -1;
            }

            return result;
          })
          .map((run, index) => (
            <Link
              to={`/runs/${run._id}`}
              className={`list-group-item rounded-6 mb-2 item-row ${index % 2 === 0 ? "even-row" : "odd-row"}`}
              key={run._id}
            >
              <div className="row align-items-center">
                <div className="col-1"><span className="badge bg-secondary">{run.activity.type}</span></div>
                <div className="col-3"><h5 className="mb-0 truncate-text">{run.activity.name}</h5></div>
                <div className="col-2"><small className="mb-0 truncate-text">{moment(run.activity.start_date).format("D/M/YYYY")}</small></div>
                <div className="col-2">{formatTime(run.activity.elapsed_time)}</div>
                <div className="col-2"><span className="mb-0 truncate-text">{`${(run.activity.distance / 1000).toFixed(2)} km`}</span></div>
                <div className="col-2">{run.stream.altitude && run.stream.altitude.data ? getElevation(run.stream.altitude.data) + "m" : ''}</div>
              </div>
            </Link>
          ))}
      </ul>
    </div>
  );


}

export default Runs;
