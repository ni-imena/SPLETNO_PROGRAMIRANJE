import { useContext, useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { UserContext } from '../userContext';
import { useParams, } from 'react-router-dom';
import moment from 'moment';

function PhotoDetails() {
  const userContext = useContext(UserContext);
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [likes, setLikes] = useState(0);
  const [text, setText] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const getPhoto = async () => {
      const res = await fetch(`http://localhost:3001/photos/${id}`);
      const data = await res.json();
      setPhoto(data);
      setLikes(data.likes);
    };
    getPhoto();

    const getComments = async () => {
      const res = await fetch(`http://localhost:3001/comments/photo/${id}`);
      const data = await res.json();
      console.log(data);
      setComments(data);
    };
    getComments();
  }, [id]);

  const handleLike = async () => {
    const res = await fetch(`http://localhost:3001/photos/${id}`, {
      method: 'PUT',
      body: like: +1
    });
    const data = await res.json();
    setLikes(data.likes);
  };

  async function Comment(e) {
    e.preventDefault();

    if (!text) {
      alert("Vnesite Komentar!");
      return;
    }
    const res = await fetch("http://localhost:3001/comments", {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text,
        parentPhoto: id
      })
    });
    const data = await res.json();

  };

  return (
    <div className='container'>
      {photo && (
        <div>
          <img
            className='card-img'
            style={{ objectFit: 'cover', height: '200px' }}
            src={'http://localhost:3001/' + photo.path}
            alt={photo.name}
          />
          <button onClick={handleLike}>Like</button>
          <span>{likes} likes</span>
          <div>
            {comments.map((comment) => (
              <div key={comment.id}>
                {comment.postedBy.username} <small>{moment(comment.date).fromNow()} </small>
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
          <form className="form-group" onSubmit={Comment}>
            {!userContext.user ? <Navigate replace to="/login" /> : ""}
            <input type="text" className="form-control" placeholder="Add a comment" name="text" value={text} onChange={(e) => { setText(e.target.value) }} />
            <input className="btn btn-primary" type="submit" name="submit" value="Komentiraj" />
          </form>
        </div>
      )}
    </div>
  );
}

export default PhotoDetails;
