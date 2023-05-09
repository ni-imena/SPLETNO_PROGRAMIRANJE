//import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Header(props) {
    return (
        <header className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">{props.title}</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <nav className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <UserContext.Consumer>
                            {context => (
                                context.user ?
                                    <>
                                        <li className="nav-item"><Link className="nav-link" to="/runs">My Runs</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/logout">Logout</Link></li>
                                    </>
                                    :
                                    <>
                                        <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                        <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                                    </>
                            )}
                        </UserContext.Consumer>
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
