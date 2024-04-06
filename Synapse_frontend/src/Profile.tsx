import React, { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    id: "",
    name: "",
    email: "",
    avatar: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/data`,
          {
            withCredentials: true, // Ensure cookies are sent with the request
          }
        );

        if (response.status === 200) {
          setUserData(response.data.data);
          setError("");
        } else {
          setError("Unauthorized");
        }
      } catch (error) {
        setError("Unauthorized");
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>User Data</h2>
      {userData && userData.id !== "" ? (
        <div>
          <p>ID: {userData.id}</p>
          <p>Name: {userData.name}</p>
          {userData.email && <p>Email: {userData.email}</p>}
          {userData.avatar && (
            <img
              src={userData.avatar}
              alt="Avatar"
              style={{ width: 100, height: 100 }}
            />
          )}
        </div>
      ) : (
        <p>{error}</p>
      )}
    </div>
  );
};

export default ProfilePage;
