// Capture three images and send it to server to store them in database.

import React, { useRef, useEffect, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [imageData, setImageData] = useState(null);


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

  const takePhoto = () => {
    const width = 800;
    const height = 600;

    let video = videoRef.current;
    let photo = photoRef.current;

    photo.width = width;
    photo.height = height;

    canvas.width = 800;
    canvas.height = 600;

    // image
    //如果train不到 试试把30去掉
    ctx.drawImage(video, 0, 0, width, height);

    setHasPhoto(true);
    // setImageData(ctx.getImageData(0, 0, width, height));
    setImageData(canvas.toDataURL("image/jpeg"),0.5);
    
    
    let ctx1 = photo.getContext("2d");
    ctx1.drawImage(video, 0, 0, width, height);
   
  };

  const uploadPhoto = async () => {
    console.log(imageData)
    try {
      const response = await fetch("http://localhost:5000/upload", {
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
        alert("Click Clear Image and Try Again in the Well-lit Environment")
      }

      if(data.status === "ok"){
        alert("Images are uploaded successfully")
      }
      console.log("Image uploaded", data);
    } catch (error) {
      console.error("Error uploading image", error);
    }
  };




  const clearPhoto = async () => {
    try {
      const response = await fetch("http://localhost:5000/clear", {
        method: "POST",
        headers:{
          "Content-Type":"application/json",
          Accept:"application/json",
          "Access-Control-Allow-Origin":"*",
        },
        body: JSON.stringify({
         token: window.localStorage.getItem("token"),
        })
      });
      
      if (response.ok) {
        alert("Clear Image Successfully")
      }
      const data = await response.json();

      console.log("data:", data);

      if (data.status === "error") {
        throw new Error(data.error.message);
      }
      console.log("Image uploaded", data);
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Error uploading image: " + error.message);
    }
  };



  const closePhoto = () => {
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");

    ctx.clearRect(0, 0, photo.width, photo.height);

    setHasPhoto(false);
  };
  
  useEffect(() => {
    getVideo();
  }, [videoRef]);
  

  return (
    <div className="App">
      <div className="camera">
        <video ref={videoRef}></video>
        <button className="snapbutton" onClick={takePhoto}>
          SNAP!
        </button>
        <button className="clearimagebutton" onClick={clearPhoto}>
          Clear Image
        </button>
      </div>
      <div className={"result " + (hasPhoto ? "hasPhoto" : "")}>
        <canvas className="canvasSnap"ref={photoRef}></canvas>
        <button className="closebutton" onClick={closePhoto}>
          Delete
        </button>
        <button className="uploadbutton" onClick={() => {uploadPhoto(); closePhoto();}}>
          Upload
        </button>
      </div>
    </div>
  );
}

export default App;
