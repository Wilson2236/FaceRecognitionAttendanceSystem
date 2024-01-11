// Capture image and sends it  to a server for face recognition and attendance tracking purposes.

import React, { useRef, useEffect, useState } from "react";
import axios from 'axios';
function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [hasPhoto, setHasPhoto] = useState(false);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const [imageData, setImageData] = useState(null);
  const [SignData, setSignData] = useState([]);

  const uploadAttendance = () => {
      try {
        fetch("http://localhost:5000/uploadAttendance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer "+ window.localStorage.getItem("token"),
            "Access-Control-Allow-Origin":"*",
          },
    
          body: JSON.stringify({

          })
        })
        alert("Successfully upload the attendance")
        getSign()
      }
      catch (error) {
        alert("Error : " + error.message);
      } 
        
  }

  // const resetState = () => {
  //     try {
  //       fetch("http://localhost:5000/reset", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Accept: "application/json",
  //           "Authorization": "Bearer "+ window.localStorage.getItem("token"),
  //           "Access-Control-Allow-Origin":"*",
  //         },
    
  //         body: JSON.stringify({

  //         })
  //       })
  //       alert("Successfully reset")
  //       getSign()
  //     }
  //     catch (error) {
  //       alert("Error : " + error.message);
  //     } 
        
  // }

  const closePhoto = () => {
    let photo = canvasRef.current;
    let ctx = photo.getContext("2d");

    ctx.clearRect(0, 0, photo.width, photo.height);

    setHasPhoto(false);
  };
  
  useEffect(() => {
    getVideo();
    window.onbeforeunload = () => {
      stopVideo();
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  const stopVideo = () => {
    let video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      video.srcObject = null;
    }
  };

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 800, height: 600 } })
      .then(stream => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play();
        };
      })
      .catch(err => {
        console.error(err);
      });
  };
  
  useEffect(() => {
    startVideo()
  }, [])

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: { width: 800, height: 600 }})
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const takePhoto = () => {
    const width = 800;
    const height = 600;

    let video = videoRef.current;
    let photo = canvasRef.current;

    photo.width = width;
    photo.height = height;

    canvas.width = 800;
    canvas.height = 600;

    ctx.drawImage(video, 0, 0, width, height);

    setHasPhoto(true);
    setImageData(canvas.toDataURL("image/jpeg"),0.5);
    
    let ctx1 = photo.getContext("2d");
    ctx1.drawImage(video, 0, 0, width, height); 
  };


  const Sign = async() => {
    console.time('Sign');
    if(imageData.length>0){
      try {
        const response = await fetch("http://localhost:5000/signIn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Authorization": "Bearer "+ window.localStorage.getItem("token"),
            "Access-Control-Allow-Origin":"*",
          },
    
          body: JSON.stringify({
            imageData
          })
          
        });
        
        
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        const data = await response.json();
  
        console.log("data:", data);
  
        if (data.status === "error") {
          throw new Error(data.error.message);
        }
        console.log("Face", data);
        if(data.status=="403"){
          alert("This user is sign-in today!");
        }

        else {
          alert("successful sign-in");
          getSign();
          console.timeEnd('Sign');
        }
      } catch (error) {
        console.error("Error uploading image", error);
        alert("Error uploading image: " + error.message);
      }
    }
  };

    const generate= async() =>{
    const res = await axios({
      url:"http://localhost:5000/getCsv",
      responseType: 'blob',
      method: "POST",
    }).then(function (response) {
      var blob = new Blob([response.data]);
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      var date=new Date();
      a.download = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"  "+"sign.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  useEffect(() => {
    getSign();
  }, []);

  const getSign=async()=>{
    fetch("http://localhost:5000/getSign",{
      method: "GET",
    }).then((res) => res.json())
    .then((data) => {
      console.log(data);
      //setSignData for the table by using the csv in node server
      setSignData(data.csvList);
    })
  }
 

  return (
    <div className="App" style={{height:"auto"}}>
      <div>
      <div >
        <video ref={videoRef}></video>
        <button className="snapbutton" onClick={takePhoto}>
          Sign-In
        </button>
     
        <button className="clearimagebutton" onClick={generate}>
          Generate
        </button>
        <div className={"result " + (hasPhoto ? "hasPhoto" : "")}>
          <canvas className="canvasSnap"ref={canvasRef}></canvas>
          <button className="closebutton" onClick={closePhoto}>
            Close
          </button>
          <button className="uploadbutton" onClick={() => {Sign(); closePhoto();}}>
            Source
          </button>
        </div>
      </div>
      </div>
      <div className="table-wrapper1">
      <table style = {{ width: "100%",marginTop:"4vw" }}  >
                <thead >
                <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>State</th>
                </tr>
                </thead>
                <tbody>

                  {SignData.map(i=> {
                    return(
                      <tr key={i.id}>
                            <td>{i.id}</td>
                            <td>{i.name}</td>
                            <td>{i.state}</td>
                        </tr>  
                    )  
                  })}
                 
        </tbody>
        </table>
        </div>
        <button style={{ alignSelf: "flex-end", marginTop: "10px", float: "left"}} className="btn btn-success" onClick={uploadAttendance}>
          Upload the Attendance
        </button>
        {/* <button style={{ alignSelf: "flex-end", marginTop: "10px", float: "right"}} className="btn btn-danger" onClick={resetState}>
          Reset
        </button> */}
    </div>
  );
}

export default App;
