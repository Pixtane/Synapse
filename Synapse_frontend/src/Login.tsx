import React, { useState } from "react";
import axios from "axios";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/login`,
        formData,
        {
          withCredentials: true, // Ensure credentials are included
        }
      );

      if (response.status === 200 || response.status === 204) {
        setSuccess("Login successful");
        setError("");
      } else {
        setError("Login failed");
        setSuccess("");
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          setError("Bad request");
        } else if (error.response.status === 401) {
          setError("Invalid credentials");
        } else if (error.response.status === 404) {
          setError("User not found");
        } else if (error.response.status === 500) {
          setError("Internal server error");
        }
      } else {
        setError("Network error");
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p>Error: {error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
};

export default LoginPage;
