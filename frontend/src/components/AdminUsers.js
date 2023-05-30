import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState({
        username: '',
        email: '',
        stravaId: '',
        admin: false
    });

    useEffect(() => {
        const getUsers = async function () {
            const res = await fetch('http://localhost:3001/users', {
                credentials: 'include',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            setUsers(data);
        };
        getUsers();
    }, [editedUser]);

    const handleEdit = (user) => {
        setIsEditing(true);
        setEditedUser(user);
    };

    const handleModalClose = () => {
        setIsEditing(false);
    };

    const handleDelete = (user) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete user ${user.username}?`);

        if (confirmDelete) {
            if (user.admin === true) {
                alert("You can not delete admins.");
            } else {
                const deleteUser = async function () {
                    await fetch(`http://localhost:3001/users/${user._id}`, {
                        credentials: 'include',
                        method: 'DELETE',
                    });
                    setEditedUser(null);
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

    const handleSave = async () => {
        try {
            const res = await fetch(`http://localhost:3001/users/${editedUser._id}`, {
                credentials: 'include',
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editedUser)
            });
            const data = await res.json();
            if (res.ok) {
                setIsEditing(false);
                setUsers((prevUsers) =>
                    prevUsers.map((prevUser) => (prevUser._id === editedUser._id ? data : prevUser))
                );
            } else {
                console.log('Error saving user:', data.message);
            }
        } catch (error) {
            console.log('Error saving user:', error);
        }
    };

    return (
        <div className="container adminContainer">
            <ul className="list-group">
                <li className="list-group-item rounded-6 mb-2 title-row adminTitleRow adminListGroupItem">
                    <div className="row column-title adminColumnTitle">
                        <div className="col-2">Username</div>
                        <div className="col-3">Email</div>
                        <div className="col-2">StravaID</div>
                        <div className="col-1">Admin</div>
                        <div className="col-2">Edit</div>
                        <div className="col-2">Delete</div>
                    </div>
                </li>
                {users.map((user) => (
                    <div className="list-group-item rounded-6 mb-2 adminListGroupItem" key={user._id}>
                        {isEditing && user._id === editedUser._id ? (
                            <div className="row align-items-center">
                                <div className="col-2"><input className="adminInput" type="text" name="username" value={editedUser.username} onChange={handleInputChange} /></div>
                                <div className="col-3"><input className="adminInput" type="text" name="email" value={editedUser.email} onChange={handleInputChange} /></div>
                                <div className="col-2"><input className="adminInput" type="text" name="stravaId" value={editedUser.stravaId} onChange={handleInputChange} /></div>
                                <div className="col-1"><input className="adminInput" type="checkbox" name="admin" checked={editedUser.admin ? true : false} onChange={handleInputChange} /></div>
                                <div className="col-2"><button className="saveButton" onClick={handleSave}>Save</button></div>
                                <div className="col-2"><button className="cancelButton" onClick={handleModalClose}>Cancel</button></div>
                            </div>
                        ) : (
                            <div className="row align-items-center">
                                <div className="col-2">{user.username}</div>
                                <div className="col-3">{user.email}</div>
                                <div className="col-2">{user.stravaId}</div>
                                <div className="col-1">{user.admin ? 'True' : 'False'}</div>
                                <div className="col-2"><button className="editButton" onClick={() => handleEdit(user)}>Edit</button></div>
                                <div className="col-2"><button className="deleteButton" onClick={() => handleDelete(user)}>Delete</button></div>
                            </div>
                        )}
                    </div>
                ))}
            </ul>
        </div>
    );
}

export default AdminUsers;
