// Displays a table of user data and allows an admin to delete users.
import React, { useEffect, useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function AdminHome (){

    const [data, setData] = useState([]);
    useEffect(() => {
        getAllUser();
    }, []);

    const getAllUser = () => {
        fetch("http://localhost:5000/getAllUser",{
            method: "GET",
    })
            .then((res) => res.json())
            .then((data) => {
                console.log(data, "userData");
                setData(data.data);
        })
    }


    const deleteUser = (id, name) =>{
        if (window.confirm(`Are you sure you want to delete ${name}`)){
            fetch("http://localhost:5000/deleteUser",{
                method:"POST",
                crossDomain:true,
                headers:{
                  "Content-Type":"application/json",
                  Accept:"application/json",
                  "Access-Control-Allow-Origin":"*",
                },
                body: JSON.stringify({
                 userid: id,
                }),
              })
                .then((res) => res.json())
                .then((data) => {
                    alert(data.data);
                    getAllUser();
                })
        } else {

        }
    };

    return (
        <div className = "auth-wrapper">
                <h3>Welcome Admin</h3>
                <div className="table-wrapper2">
                <table style = {{ width: 500 } }  >
                <thead >
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Student ID</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody>
                {data.filter(i => i.userType == "User").map(i=> {
                    return(
                        <tr key={i.email}>
                            <td>{i.fname} {i.lname}</td>
                            <td>{i.email}</td>
                            <td>{i.id}</td>
                            <td>
                                <FontAwesomeIcon icon={faTrash} onClick={() => deleteUser(i.id, i.fname)}
                                />
                            </td>
                        </tr>
                    )
                })}
                </tbody>
                </table>
                </div>
            
            </div>

    );
}