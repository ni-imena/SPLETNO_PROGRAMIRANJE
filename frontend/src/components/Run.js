import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import { useParams } from "react-router-dom";

function Run() {
  const userContext = useContext(UserContext);
  const { id } = useParams();
  const [run, setRun] = useState(null); //whole run document (_id, userId, activity, stream)
  const [activity, setActivity] = useState(null); //activity data (name, location, time, type...)
  const [stream, setStream] = useState(null); //stream data (lon., lat, speed...)

  useEffect(() => {
    const getRun = async () => {
      let headers = {};
      if (userContext.user) {
        headers = {
          Authorization: `Bearer ${userContext.user._id}`,
        };
      }
      const res = await fetch(`http://localhost:3001/runs/${id}`, {
        headers: headers,
      });
      const data = await res.json();
      setRun(data);
      setActivity(data.activity);
      setStream(data.stream);
    };
    getRun();
  }, [id, userContext]);

  return (
    <div className="container">
      {run && stream && activity && (
        <div>
          <p>{run._id}</p>
          <p>{activity.name}</p>
          <p>{activity.type}</p>
          <p>{activity.start_date_local}</p>
          <p>{activity.id}</p>
          <p>{stream.altitude.series_type}</p>
        </div>
      )}
    </div>
  );
}

export default Run;
