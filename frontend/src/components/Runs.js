import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import { Navigate, Link } from "react-router-dom";
import moment from "moment";
import "./Runs.css";

function Runs() {
  const userContext = useContext(UserContext);
  const [runs, setRuns] = useState([]);

  useEffect(function () {
    const getRuns = async function () {
      const res = await fetch("http://localhost:3001/users/runs", {
        credentials: "include",
      });
      const data = await res.json();
      setRuns(data);
    };
    getRuns();
  }, []);

  return (
    <div className="container mt-4">
      {!userContext.user ? <Navigate replace to="/login" /> : ""}
      <ul className="list-group">
        {runs
          .sort(
            (a, b) =>
              moment(b.activity.start_date) - moment(a.activity.start_date)
          )
          .map((run) => (
            <li className="list-group-item rounded-6 mb-2" key={run._id}>
              <Link
                to={`/runs/${run._id}`}
                className="d-flex align-items-center"
              >
                <div>
                  <h5 className="mb-0">{run.activity.name}</h5>
                  <p className="mb-0">
                    <span className="badge bg-secondary me-2">
                      {run.activity.type}
                    </span>
                    {`${(run.activity.distance / 1000).toFixed(2)} km`}
                  </p>
                </div>
                <div className="ms-auto">
                  <small>{moment(run.activity.start_date).format("LLL")}</small>
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default Runs;
