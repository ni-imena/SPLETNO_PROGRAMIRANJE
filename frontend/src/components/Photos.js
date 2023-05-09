import { useState, useEffect } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Photo from './Photo';

function Photos() {
    const [photos, setPhotos] = useState([]);

    useEffect(function () {
        const getPhotos = async function () {
            const res = await fetch("http://localhost:3001/photos");
            const data = await res.json();
            setPhotos(data);
        }
        getPhotos();
    }, []);

    return (
        <div className="container" style={{ maxWidth: '960px' }}>
            <h3 className="mt-4 mb-4">Photos:</h3>
            <div className="row row-cols-1 row-cols-md-3 g-1">
                {photos.map(photo => (
                    <div className="col sm-1" key={photo._id}>
                        <div className="card">
                            <Link to={`/photos/${photo._id}`}>
                                <Photo photo={photo} />
                            </Link>
                            <div className="card-body">
                                <span className="card-text float-end"><span className="me-2">{photo.views} views</span></span>
                                <h5 className="card-title">{photo.name.slice(0, 20)}{photo.name.length > 20 ? '...' : ''}</h5>
                                <small className="text-muted float-start">{photo.postedBy.username} | {moment(photo.date).format('MMM Do YYYY')}</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Photos;
