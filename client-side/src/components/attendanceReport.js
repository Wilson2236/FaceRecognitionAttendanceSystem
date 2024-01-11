// Based on the authentication, the system determines whether to display the user details page for the user or admin.

import React, {Component,useState, useEffect} from "react";

import AttendanceReportAdmin from "./attendanceReportAdmin";
import AttendanceReportUser from "./attendanceReportUser";

export default function UserDetails () {
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

      //  this.setState({userData: data.data});
      if(data.data.userType == "Admin")
        setAdmin(true)
    });
})

        return (
            admin? <AttendanceReportAdmin /> : <AttendanceReportUser/>
        );
}
