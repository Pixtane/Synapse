import React, { useState } from "react";
import axios from "axios";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
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
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/register`,
        formData
      );

      if (response.status === 200 || response.status === 204) {
        setSuccess("Registration successful");
        setError("");
      } else {
        setError("Registration failed");
        setSuccess("");
      }
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          setError("Bad request");
        } else if (error.response.status === 404) {
          setError("Resource not found");
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
      <h2>Register</h2>
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
          <label>Username:</label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      {error && <p>Error: {error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
};

export default RegisterPage;
