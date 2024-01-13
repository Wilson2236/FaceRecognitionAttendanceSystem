// Component for a sign-up form that collects user information, validates it, and submits it to a server.

import React, { useState } from "react";

export default function SignUp() {
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [id, setId] = useState("");
  const attendance = 0

  const handleSubmit = (e) => {
    if (userType === "Admin" && secretKey !== "MADE BY OWS") {
      e.preventDefault();
      alert("Invalid Admin");
    } else {
      e.preventDefault();
      let body;
      if (userType === "Admin") {
        body = JSON.stringify({
          fname,
          lname,
          email,
          password,
          userType,
          id
          
        });
      } else {
        body = JSON.stringify({
          fname,
          lname,
          email,
          password,
          userType,
          id,
          attendance
        });
      }
      console.log(fname, lname, email, password, id , userType, attendance);
      fetch("http://localhost:5000/register", {
        method: "POST",
        crossDomain: true,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data, "userRegister");
          if (data.status === "ok") {
            alert("Registration Successful");
          }
          else if (data.status === "401"){
            alert("Password must be at least 8 characters long")
          } 
          else if (data.status === "402"){
            alert("Password must contain at least one letter and one number")
          }
          else {
            alert("The email or ID is already used");
          }
        });
    }
  };
  

  return (
    <div className="auth-wrapper">
     
        <form onSubmit={handleSubmit}>
          <h3>Sign Up</h3>
          <div className="container-radio">
            <input
              type="radio"
              name="UserType"
              value="User"
              id = "User"
              onChange={(e) => setUserType(e.target.value)}
            />
            <label>User</label>
            <input
              type="radio"
              name="UserType"
              value="Admin"
              id = "Admin"
              onChange={(e) => setUserType(e.target.value)}
            />
            <label>Admin</label>
          </div>
          {userType === "Admin" ? (
            <div className="mb-3">
              <label>Secret Key</label>
              <input
                type="text"
                className="form-control"
                placeholder="Secret Key"
                onChange={(e) => setSecretKey(e.target.value)}
              />
            </div>
          ) : null}

          <div className="mb-3">
            <label>First name</label>
            <input
              type="text"
              className="form-control"
              placeholder="First name"
              onChange={(e) => setFname(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Last name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Last name"
              onChange={(e) => setLname(e.target.value)}
            />
          </div>
            
          <div className="mb-3">
            <label>ID</label>
            <input
              type="id"
              className="form-control"
              placeholder="Enter ID"
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Email address</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="d-grid">
            <button type="submit" className="btn btn-primary">
              Sign Up
            </button>
          </div>
          <p className="forgot-password text-right">
            Already registered <a href="/sign-in">sign in?</a>
          </p>
        </form>
      </div>

  );
}
