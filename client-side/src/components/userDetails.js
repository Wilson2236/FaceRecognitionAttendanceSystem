// Based on the authentication, the system determines whether to display the user details page for the user or admin.

import React, {useState, useEffect} from "react";

import UserHome from "./userHome";
import AdminHome from "./adminHome";

export default function UserDetails () {
  const [userData, setUserData] = useState("");
  const [admin, setAdmin] = useState(false);

    useEffect(() => {  
    fetch("http://localhost:5000/userData",{
      method:"POST",
      crossDomain:true,
      headers:{
        "Content-Type":"application/json",
        Accept:"application/json",
        "Access-Control-Allow-Origin":"*",
      },
      body: JSON.stringify({
       token: window.localStorage.getItem("token"),
      }),
    })
    .then((res)=>res.json())
    .then((data)=>{
      if(data.data.userType === "Admin")
        setAdmin(true)

        setUserData(data.data);
    });
})

        return (

            admin? <AdminHome /> : <UserHome userData = {userData}/>
            
        );
}
