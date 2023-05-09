function Photo(props){
    return (
        <div className="card bg-dark text-dark mb-2">
            <img className="card-img" style={{objectFit: "cover", height: "200px"}} src={"http://localhost:3001/"+props.photo.path} alt={props.photo.name}/>
            <div className="card-img-overlay">
            </div>
        </div>
    );
}
//<h5 className="card-title">{props.photo.name}</h5>
export default Photo;