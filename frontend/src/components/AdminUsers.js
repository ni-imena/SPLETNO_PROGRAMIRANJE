import React, { useContext, useState, useEffect } from 'react';
import { Navigate } from "react-router-dom";
import './AdminUsers.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [tokenExpired, setTokenExpired] = useState(false);
    const [editedUser, setEditedUser] = useState({
        username: '',
        email: '',
        stravaId: '',
        admin: false
    });
    const [expandedRow, setExpandedRow] = useState(null);


    useEffect(() => {
        const getUsers = async function () {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/users`, {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                }
            });
            const data = await res.json();
            console.log(data);
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
            }
            if (data.message === "Token expired.") {
                setTokenExpired(true);
            }
            else {
                setTokenExpired(false);
                setUsers(data.users);
            }
        };
        getUsers();
    }, [editedUser]);

    const handleEdit = (user, event) => {
        event.stopPropagation();
        setIsEditing(true);
        setEditedUser(user);
    };

    const handleClose = (event) => {
        event.stopPropagation();
        setIsEditing(false);
    };

    const handleDelete = (user, event) => {
        event.stopPropagation();
        const confirmDelete = window.confirm(`Are you sure you want to delete user ${user.username}?`);

        if (confirmDelete) {
            if (user.admin === true) {
                alert("You can not delete admins.");
            } else {
                const deleteUser = async function () {
                    const token = localStorage.getItem('token');
                    const res = await fetch(`http://localhost:3001/users/${user._id}`, {
                        credentials: 'include',
                        method: 'DELETE',
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
                        setEditedUser(null);
                    }
                };
                deleteUser();
            }
        }
    };

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        const inputValue = type === 'checkbox' ? checked : value;

        setEditedUser((prevUser) => ({
            ...prevUser,
            [name]: inputValue
        }));
    };

    const handleAssign = (user, event) => {
        event.stopPropagation();
        const updateRuns = async function () {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/users/assignruns/${user._id}`, {
                credentials: 'include',
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
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
            }
        }
        updateRuns();
    }

    const handleSave = async (event) => {
        event.stopPropagation();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/users/${editedUser._id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(editedUser)
            });
            console.log(editedUser);
            const data = await res.json();
            console.log(data);
            if (data.accessToken) {
                localStorage.setItem('token', data.accessToken);
            }
            if (data.message === "Token expired.") {
                setTokenExpired(true);
            }
            else {
                setTokenExpired(false);
                setIsEditing(false);
                setUsers((prevUsers) =>
                    prevUsers.map((prevUser) => (prevUser._id === editedUser._id ? data.user : prevUser))
                );
            }
        } catch (error) {
            console.log('Error saving user:', error);
        }
    };

    const handleRowClick = (rowId) => {
        setExpandedRow(rowId === expandedRow ? null : rowId);
    };

    if (tokenExpired) {
        return <Navigate replace to="/logout" />;
    }

    return (
        <div className="container adminContainer">
            <ul className="list-group">
                <li className="list-group-item rounded-6 mb-2 title-row adminTitleRow adminListGroupItem">
                    <div className="row column-title adminColumnTitle">
                        <div className="col-2">Username</div>
                        <div className="col-2">Email</div>
                        <div className="col-2">StravaID</div>
                        <div className="col-1">Admin</div>
                        <div className="col-2">Edit</div>
                        <div className="col-2">Delete</div>
                        <div className="col-1">Assign</div>
                    </div>
                </li>
                {users.map((user) => (
                    <div key={user._id}>
                        <div className={`list-group-item rounded-6 mb-2 adminListGroupItem ${expandedRow === user._id ? "expanded" : ""}`} onClick={() => handleRowClick(user._id)}>
                            {isEditing && user._id === editedUser._id ? (
                                <div className="row align-items-center">
                                    <div className="col-2"><input className="adminInput" type="text" name="username" value={editedUser.username} onChange={handleInputChange} /></div>
                                    <div className="col-2"><input className="adminInput" type="text" name="email" value={editedUser.email} onChange={handleInputChange} /></div>
                                    <div className="col-2"><input className="adminInput" type="text" name="stravaId" value={editedUser.stravaId} onChange={handleInputChange} /></div>
                                    <div className="col-1"><input className="adminInput" type="checkbox" name="admin" checked={editedUser.admin ? true : false} onChange={handleInputChange} /></div>
                                    <div className="col-2"><button className="saveButton" onClick={(event) => handleSave(event)}>Save</button></div>
                                    <div className="col-2"><button className="cancelButton" onClick={(event) => handleClose(event)}>Cancel</button></div>
                                    <div className="col-1"></div>
                                </div>
                            ) : (
                                <div className="row align-items-center">
                                    <div className="col-2">{user.username}</div>
                                    <div className="col-2">{user.email}</div>
                                    <div className="col-2">{user.stravaId}</div>
                                    <div className="col-1">{user.admin ? 'True' : 'False'}</div>
                                    <div className="col-2"><button className="editButton" onClick={(event) => handleEdit(user, event)}>Edit</button></div>
                                    <div className="col-2"><button className="deleteButton" onClick={(event) => handleDelete(user, event)}>Delete</button></div>
                                    <div className="col-1"><button className="updateButton" onClick={(event) => handleAssign(user, event)}>Assign</button></div>
                                </div>
                            )}
                        </div>
                        {expandedRow === user._id && (
                            <div className="container expanded-row">
                                <div>Posted Runs: {user.docsPosted}</div>
                            </div>
                        )}
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default AdminUsers;
