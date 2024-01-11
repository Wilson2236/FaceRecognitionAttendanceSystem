// Display user data.

import React  from "react";

export default function UserHome({userData}) {
    return (
            <div>
            Last Name<h2>{userData.lname}</h2>
            First Name<h2>{userData.fname}</h2>
            Student ID<h2>{userData.id}</h2>
            Email<h2>{userData.email}</h2>
            </div>
    );
}