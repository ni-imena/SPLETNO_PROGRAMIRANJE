import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";
import './Header.css'

function Header(props) {
    const userContext = useContext(UserContext);

    const getPrivs = () => {
        return userContext.user.admin;
    };

    function handleToggle() {
        const navbarNav = document.getElementById("navbarNav");
        navbarNav.classList.toggle("show");
    }

    return (
        <header className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">{props.title}</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" onClick={handleToggle}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <nav className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        {userContext.user ? (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/runs">My Runs</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/profile">Profile</Link></li>
                                {getPrivs() && (
                                    <li className="nav-item"><Link className="nav-link" to="/adminUsers">Admin</Link></li>
                                )}
                                <li className="nav-item"><Link className="nav-link" to="/logout">Logout</Link></li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item"><Link className="nav-link" to="/login">Login</Link></li>
                                <li className="nav-item"><Link className="nav-link" to="/register">Register</Link></li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
