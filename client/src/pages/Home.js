import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styling/Home.css'

const Home = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [query, setQuery] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [recomFriends, setRecomFriends] = useState([]);
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchData = async () => {
            try {
                const userResponse = await axios.get(`${process.env.REACT_APP_FRONTEND_URL}/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setCurrentUser(userResponse.data.user);
                setFriendRequests(userResponse.data.user.friendRequests);
                setFriends(userResponse.data.user.friends);

                const response = await axios.get(`${process.env.REACT_APP_FRONTEND_URL}/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.Message !== "Users fetched successfully!") {
                    navigate("/login");
                    return;
                }

                setUsers(response.data.users);
                setFilteredUsers(response.data.users);

                const recomResponse = await axios.get(
                    `${process.env.REACT_APP_FRONTEND_URL}/${userResponse.data.user._id}/recommendations`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRecomFriends(recomResponse.data.recomFriends);

            } catch (error) {
                console.log("Error: ", error);
            }
        };

        fetchData();
    }, [navigate]);

    const handleSearch = (e) => {
        setQuery(e.target.value);
        const searchResults = users.filter(user =>
            user.username.toLowerCase().includes(e.target.value.toLowerCase())
        );
        setFilteredUsers(searchResults);
    };

    const sendFriendRequest = async (receiverId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${process.env.REACT_APP_FRONTEND_URL}/send-request`, {
                senderId: currentUser._id,
                receiverId: receiverId
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(response.data.Message);
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert("Failed to send friend request.");
        }
    };

    const handleFriendRequest = async (senderId, action) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${process.env.REACT_APP_FRONTEND_URL}/respond-request`, {
                senderId: senderId,
                receiverId: currentUser._id,
                action: action
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(response.data.Message);

            const userResponse = await axios.get(`${process.env.REACT_APP_FRONTEND_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setCurrentUser(userResponse.data.user);
            setFriendRequests(userResponse.data.user.friendRequests);
            setFriends(userResponse.data.user.friends);

        } catch (error) {
            console.error("Error responding to friend request:", error);
            alert("Failed to process request.");
        }
    };

    const removeFriend = async (friendId) => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.post(`${process.env.REACT_APP_FRONTEND_URL}/remove-friend`, {
                senderId: currentUser._id,
                receiverId: friendId
            }, { headers: { Authorization: `Bearer ${token}` } });

            alert(response.data.Message);
            setFriends(friends.filter(friend => friend._id !== friendId));

        } catch (error) {
            console.error("Error removing friend:", error);
            alert("Failed to remove friend.");
        }
    };

    return (
        <div className="container">
            <div className="navbar">
                {currentUser && <p className="current-user">Welcome, {currentUser.username}!</p>}
            </div>

            <div className="content">
                <div className="left-section">
                    <h2>All Users</h2>
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search Users..."
                        value={query}
                        onChange={handleSearch}
                    />
                    <ul>
                        {filteredUsers?.map((user) => (
                            <li key={user._id}>
                                {user.username}
                                {currentUser && user._id !== currentUser._id &&
                                    !friendRequests.some(req => req._id === user._id) &&
                                    !friends.some(friend => friend._id === user._id) && (
                                        <button onClick={() => sendFriendRequest(user._id)}>Add Friend</button>
                                    )}
                            </li>
                        ))}
                    </ul>

                    <h2>Friend Requests</h2>
                    <ul>
                        {friendRequests?.map((request) => (
                            <li key={request._id} className="friend-request-item">
                                <span>{request.username}</span>
                                <div className="button-group">
                                    <button onClick={() => handleFriendRequest(request._id, "accept")}>Accept</button>
                                    <button className="reject-btn" onClick={() => handleFriendRequest(request._id, "reject")}>Reject</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="right-section">
                    <h2>My Friends</h2>
                    <ul>
                        {friends?.map((friend) => (
                            <li key={friend._id}>
                                {friend.username}
                                <button onClick={() => removeFriend(friend._id)}>Remove</button>
                            </li>
                        ))}
                    </ul>

                    <h2>Recommended Friends</h2>
                    <ul>
                        {recomFriends?.map((user) => (
                            <li key={user.id}>
                                {user.username}
                                <button onClick={() => sendFriendRequest(user.id)}>Add Friend</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Home;
