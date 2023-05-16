import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserContext } from "./userContext";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import RedirectPage from "./components/RedirectPage";
import Logout from "./components/Logout";
import Map from "./components/Map";
import Runs from "./components/Runs";
import Home from "./components/Home";
import Run from "./components/Run";

function App() {
  const [user, setUser] = useState(
    localStorage.user ? JSON.parse(localStorage.user) : null
  );

  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  return (
    <BrowserRouter>
      <UserContext.Provider
        value={{
          user: user,
          setUserContext: updateUserData,
        }}
      >
        <div className="App">
          <Header title="Virtual Runner"></Header>
          <Routes>
            <Route path="/" exact element={<Home />}></Route>
            <Route path="/login" exact element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/map" element={<Map />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/logout" element={<Logout />}></Route>
            <Route path="/runs" element={<Runs />}></Route>
            <Route path="/stravaAuth" element={<RedirectPage />} />
            <Route path="/runs/:id" element={<Run />} />
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
