const express = require("express");
const app = express();
const mongoose = require("mongoose");
const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
var bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
faceapi.env.monkeyPatch({ Canvas, Image });
const cors = require("cors");
app.use(cors());
const bcrypt=require("bcryptjs")
app.set("view engine", "ejs");
const fs = require('fs');
const path = require('path');


app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
app.use(
  fileUpload({useTempFiles: true})
);

const{
  uploadLabeledImages,getDescriptorsFromDB
}=require(process.cwd()+'/models/face');

// Load face detector and face recognition model form weights folder
async function LoadModels() {
  // Load the models
  // __dirname gives the root directory of the server
  await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models/weights");
  await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models/weights");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models/weights");
}
LoadModels();

const jwt = require("jsonwebtoken");
var nodemailer = require('nodemailer');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const JWT_SECRET="oiapalanjiaoyoucakap{}}{{[[[[==adskadpeqaw"

// Change the mongourl to yours
const mongoUrl = "mongodb+srv://ows4207:011221021125_Ows@cluster0.3ilqy0l.mongodb.net/?retryWrites=true&w=majority"
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
  })
  .then(()=>{
    console.log("Connected to database");
  })
  .catch((e) => console.log(e));

  require("./userDetails")
  require("./signDetails")
  require("./class")

  const User = mongoose.model("UserInfo");
  const Sign = mongoose.model("SignInfo");
  const Class = mongoose.model("Class");

//---------------------------------------------------------------------------------------------//
// Register
app.post("/register", async(req, res)=>{
  const {fname, lname, id , email, password, userType, attendance} = req.body;
  if (password.length < 8) {
    return res.send({status: "401"});
  }

  // Check password contains letters and numbers
  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;
  if (!passwordRegex.test(password)) {
    return res.send({status: "402"});
  }

  const encryptedPassword = await bcrypt.hash(password,10);
  try {
    const oldUser = await User.findOne({email});
    

    if(oldUser){
      return res.send({error: "User Exists"});
    }
    await User.create({
      fname, 
      lname, 
      email,
      id,
      password: encryptedPassword,
      userType,
      attendance
    });
    res.send({status: "ok"});
  } catch (error){
    res.send({status: "error"});
  }
});

//---------------------------------------------------------------------------------------------//
// Login
app.post("/login-user", async(req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.json({error:"User Not Found"});
  }
  if(await bcrypt.compare(password,user.password)){
    const token = jwt.sign({email: user.email},JWT_SECRET)
    const userType = user.userType

    if(res.status(201)){
      return res.json({status: "ok",data: {token, userType}});
    } else {
      return res.json({error: "error"});
    }
  }
  res.json({status: "error", error:"Invalid Password"})
});

//---------------------------------------------------------------------------------------------//
// Show User Data from Database
app.post("/userData",async(req,res)=>{
  const {token} = req.body;
  
  try{
  const user = jwt.verify(token, JWT_SECRET);
  const useremail = user.email;
  User.findOne({email: useremail})
  .then((data)=>{
    res.send({status:"ok",data:data});
  })
  .catch((error)=>{
    res.send({status:"error",data:error});
  });
  } catch (error) {}
})

//---------------------------------------------------------------------------------------------//
// Uplaod images to database
app.post("/upload", upload.single("image"), async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.send({ status: "error", error: "Authorization header is missing" });
  }
  const token = authHeader.split(" ")[1];
  
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('Decoded user: ', user);

    const userEmail = user.email;
    const userData = await User.findOne({ email: userEmail });
    if (!userData) {
      return res.send({ status: "error", error: "User not found" });
    }
    
    const stringData = JSON.stringify(req.body)
    const data = Buffer.from(stringData.split(',')[1], 'base64');
    const id = userData.id

    if (userData.image1 == null && userData.image2 == null && userData.image3 == null ){
      userData.image1 = data;
      await userData.save();
      console.log("image1 is uploaded")
    }

    else if (userData.image2 == null && userData.image3 == null ){
      userData.image2 = data;
      await userData.save();
      console.log("image2 is uploaded");
    }

    else if (userData.image3 == null ){
      userData.image3 = data;
      await userData.save();
      console.log("image3 is uploaded");
      //After 3 images are uploaded, save it in this folder
      var image1=userData.image1;
      var image2=userData.image2;
      var image3=userData.image3;
      var path1=__dirname+"\\tmp\\"+userData.id+"_1.png";
      var path2=__dirname+"\\tmp\\"+userData.id+"_2.png";
      var path3=__dirname+"\\tmp\\"+userData.id+"_3.png";

      //After uploading the images, put them in the directory
      fs.writeFile(path1,image1,async function(err){//用fs写入文件
        if(err){
          console.log(err);
        }else{
          fs.writeFile(path2,image2,async function(err){
            if(err){
              console.log(err);
            }else{
              fs.writeFile(path3,image3,async function(err){
                if(err){
                  console.log(err);
                }else{
                  // go to face.js and upload the descriptions
                  userData.descriptions = await uploadLabeledImages([path1,path2,path3], userData);
                  if(userData.descriptions[0] =='error'){
                    res.send({ status: "error", error: "The images are blur"});
                  }
                  else {
                  // console.log(userData.descriptions)
                  
                  
                  console.log("success");
                  
                  await userData.save();
                  // if (fs.existsSync(path1))
                  // fs.unlinkSync(path1)
          
                  // if (fs.existsSync(path2))
                  // fs.unlinkSync(path2)
          
                  // if (fs.existsSync(path3))
                  // fs.unlinkSync(path3)
          
          
                  res.send({ status: "ok", data: "Image uploaded successfully" });
                  }
                }
              })
            }
          })
        }
      });
    } else {
      var path1=__dirname+"\\tmp\\"+userData.id+"_1.png";
      var path2=__dirname+"\\tmp\\"+userData.id+"_2.png";
      var path3=__dirname+"\\tmp\\"+userData.id+"_3.png";
  
      userData.descriptions =await uploadLabeledImages([path1,path2,path3], userData);
      // console.log(userData.descriptions);
      
    }
    // res.send({ status: "ok", data: "Image uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.send({ status: "error", error: error });
  }
});

//---------------------------------------------------------------------------------------------//
// Clear Image in the database
app.post("/clear",async(req,res)=>{
  const {token} = req.body;
  try{
  const user = jwt.verify(token, JWT_SECRET);
  const useremail = user.email;

  User.updateOne(
    {email :useremail},
    {
      $unset: {
        image1 : "",
        image2: "",
        image3: "",
        descriptions:[],
      },
    })

    .then((data)=>{
      res.send({status:"ok",data:data});
    })
    .catch((error)=>{
      res.send({status:"error",data:error});
    });
    } catch (error) {
      res.send({ status: "error", error: error });
    }
})



//---------------------------------------------------------------------------------------------//
// Click forgot password, then it will send a link to your email 
app.post("/forgot-password", async(req, res)=> {
  const{ email } = req.body;
  try {
    const oldUser = await User.findOne({email});
    if (!oldUser){
      return res.json({status: "User Not Exists"});
    }
    const secret = JWT_SECRET + oldUser.password;
    const token = jwt.sign({email: oldUser.email, id: oldUser._id}, secret, {
      expiresIn: "5m",
    });
    
    const link = `http://localhost:5000/reset-password/${oldUser._id}/${token}`;
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ows4207@gmail.com',
        pass: 'wdgjucwoovocwptz'
      }
    });
    
    var mailOptions = {
      from: 'ows4207@gmail.com',
      to: email,
      subject: 'Password Reset',
      text: "Hello, a request has been received to change the password for your OWS attendance system account. Here is the link below: " + link
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
    console.log(link)
  } catch (error){
    console.log(error)
    res.send("Not Verified")
  }
})

//---------------------------------------------------------------------------------------------//
// Click the link to reset the password
app.get("/reset-password/:id/:token", async (req, res) => {
 
  const {id, token} = req.params;

  const oldUser = await User.findOne({ _id: id});
  if (!oldUser){
    return res.json({status: "User Not Exists"});
  }
 
  const secret = JWT_SECRET + oldUser.password;
  try { 
    const verify = jwt.verify(token, secret);
    res.render("index", {email: verify.email, status: "Not Verified"});
  } catch (error) {
    console.log(error);
    res.send("Not Verified");
  }
});

app.post("/reset-password/:id/:token", async (req, res) => {
  const {id, token} = req.params;
  const {password} = req.body; 

  const oldUser = await User.findOne({ _id: id});
  if (!oldUser){
    return res.json({status: "User Not Exists"});
  }

  const secret = JWT_SECRET + oldUser.password;
  try { 
    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: encryptedPassword,
        },
      }
      )

    res.render("index", {email: verify.email, status: "verified"});
  } catch (error) {
    console.log(error);
    res.json({status: "Something Went Wrong"})
  }
});


app.listen(5000, ()=> {
  console.log("Server Started");
});

app.get("/getAllUser",async(req, res)=> {
  try {
    const allUser= await User.find({});
    res.send({status: "ok",data: allUser })
  } catch (error){
    console.log(error)
  }
});


// app.get("/getAllImages", async (req, res) => {
//   try {
//     const allImages = await User.find({});
//     const imageList = [];
//     for (const image of allImages) {
//       const imageData1 = image.image1;
//       const imageData2 = image.image2;
//       const imageData3 = image.image3;
//       const id = image.id;
//       if (imageData1 && imageData2 && imageData3) { // Check if all three images exist
//         imageList.push({ filename: id, image1: imageData1, image2: imageData2, image3: imageData3 });
//       }
//     }
//     //console.log(imageList)
//     res.send({ status: "ok", data: imageList });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send({ status: "error", message: "Internal server error" });
//   }
// });

//---------------------------------------------------------------------------------------------//
// Delete user on User Details page for admin
app.post("/deleteUser",async(req, res)=> {
  const {userid} = req.body;
  try {
    User.deleteOne({id :userid}, function (err, res){
        console.log(err);
        let imageName1 = userid + "_1.png"
        let imageName2 = userid + "_2.png"
        let imageName3 = userid + "_3.png"
        console.log(imageName1)
        console.log(imageName2)
        console.log(imageName3)

        const folderPath = './tmp';

        // Use path.join() to construct the full file paths
        const imagePath1 = path.join(folderPath, imageName1);
        const imagePath2 = path.join(folderPath, imageName2);
        const imagePath3 = path.join(folderPath, imageName3);
        console.log(imagePath1)
        // Delete the files using fs.unlink()
        if (fs.existsSync(imagePath1))
        fs.unlinkSync(imagePath1)

        if (fs.existsSync(imagePath2))
        fs.unlinkSync(imagePath2)

        if (fs.existsSync(imagePath3))
        fs.unlinkSync(imagePath3)

      });
      res.send({status: "OK", data: "Deleted"})
  } catch (error){
    console.log(error)
  }
})


//---------------------------------------------------------------------------------------------//
//Sign-in attendance on Camera Pgae for admin
app.post("/signIn", upload.single("image"), async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.send({ status: "error", error: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('Decoded user: ', user);

    const faces = await User.find();
    if (!faces) {
      return res.send({ status: "error", error: "User not found" });
    }
    let results={};
    const stringData = JSON.stringify(req.body)
    //decode
    // console.log(Date.now())
    const data = Buffer.from(stringData.split(',')[1], 'base64');
    // the number of milliseconds elapsed since January 1, 1970, 00:00:00 UTC (Coordinated Universal Time).
    var path=__dirname+"\\tmp\\sign\\"+Date.now()+".png";
    fs.writeFile(path,data,async function(err){//use fs to write the image into file
      if(err){
        console.log(err);
      }else{
        //faces = all user
        //path = the image that is captured
       results=await getDescriptorsFromDB(path,faces);
       // Example:  FaceMatch { _label: '1', _distance: 0.39881540740668164}
       console.log(results);
       if(results.length>0){
        var label=results[0]._label;
        // var date=new Date();        
        // var nowdate=date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
        if(label!="unknown"){
          // const sign = await Sign.findOne({uid:label,date:nowdate});
          const sign = await Sign.findOne({uid:label});
          if(sign==null){
            await Sign.create({
              "uid":label,
              // "date":nowdate
            });
            console.log(results)
            res.send({ status: "ok", data: "Sign In successfully" ,results:results});
          }else{
            res.send({ status: "403", data: "error" });
          }
        }
       }else{
          res.send({ status: "error", data: "error"});
       }
      }
    });
  } catch (error) {
    console.error(error)
    res.send({ status: "error", error: error });
  }
});

//---------------------------------------------------------------------------------------------//
// Attendance table
app.get("/getSign",async (req, res) => {
  // var date=new Date(); 
  // console.log(date)       
  // var nowdate=date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
  // console.log(nowdate)   
  // const SignList=await Sign.find({date:nowdate});
  const SignList=await Sign.find();
  const UserList=await User.find();
  let csvList=[];
  UserList.forEach((user)=>{
    var index=0;
    var state="absent";
    for(index;index<SignList.length;index++){
      if(SignList[index].uid==user.id){
        state="attend";
      }
    }
    if(user.userType!="Admin"){
      var csv={
        "id":user.id,
        "name":user.fname+" "+user.lname,
        "state":state
      }
      csvList.push(csv);
    }
  });
  res.send({csvList:csvList,status:"200"});
})

//---------------------------------------------------------------------------------------------//
//Download CSV file of attendance table by CLicking Generate
app.post("/getCsv", async (req, res) => {
  // var date=new Date();        
  // var nowdate=date.getFullYear()+"/"+(date.getMonth()+1)+"/"+date.getDate();
  // const SignList=await Sign.find({date:nowdate});
  const SignList=await Sign.find();
  const UserList=await User.find();
  let csvList=[];
  UserList.forEach((user)=>{
    var index=0;
    var state="absent";
    for(index;index<SignList.length;index++){
      if(SignList[index].uid==user.id){
        state="attend";
      }
    }
    if(user.userType!="Admin"){
      var csv={
        "id":user.id,
        "name":user.fname+" "+user.lname,
        "state":state
      }
      csvList.push(csv);
    }
  });

  //csv 
  if(!fs.existsSync('./public/csv')){
    fs.mkdir('./public/csv', (err) => {});
  }
  var csvContent ='Id,Name,State\n';
  fs.writeFileSync('./public/csv/sign.csv',csvContent,function(err){});
  csvList.forEach((csv)=>{
    var nowCsv=csv.id+","+csv.name+","+csv.state+"\n";
    fs.appendFileSync('./public/csv/sign.csv',nowCsv,function(err){});
  });

  

  var rs = fs.createReadStream('./public/csv/sign.csv');
  res.writeHead(200, {
    'Content-Type': 'application/force-download',
    'Content-Disposition': 'attachment; filename=' + "sign.csv"
  });
  rs.pipe(res);
})

//---------------------------------------------------------------------------------------------//
// Update the attendance record in the database
app.post("/uploadAttendance",async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.send({ status: "error", error: "Authorization header is missing" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const user = jwt.verify(token, JWT_SECRET);
    console.log('Decoded user: ', user);

    const existingClass = await Class.findOne();
    const uid = await Sign.distinct("uid")
    
   await User.updateMany(
       { id : uid},
       { $inc: { attendance: 1 } }
    )

    if (existingClass) {
      // If a document is found, update its classNumber property
      classNumber = parseInt(existingClass.classNumber)
      classNumber += 1;
      existingClass.classNumber = classNumber
      await existingClass.save();
    } else {
      // If no document is found, create a new one with classNumber set to 0
      await Class.create({ "classNumber": "1" });
    }
    
  
  const folderPath = './tmp/sign';
  fs.readdirSync(folderPath).forEach((file) => {
  const filePath = `${folderPath}/${file}`;
  fs.unlinkSync(filePath);
  }); 

  Sign.deleteMany({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("All documents removed from the collection.");
    }
  });
}

catch (error) {
  console.error(error)
  res.send({ status: "error", error: error });
  
}
})

//---------------------------------------------------------------------------------------------//

// app.post("/reset",async (req, res) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.send({ status: "error", error: "Authorization header is missing" });
//   }
//   const token = authHeader.split(" ")[1];

//   try {
//     const user = jwt.verify(token, JWT_SECRET);
//     console.log('Decoded user: ', user);
    
//     const allUser= await User.find({userType: "User"});
//     res.send({status: "ok",data: allUser })
    
//   const folderPath = './tmp/sign';
//   fs.readdirSync(folderPath).forEach((file) => {
//   const filePath = `${folderPath}/${file}`;
//   fs.unlinkSync(filePath);
//   }); 
 

//   Sign.deleteMany({}, (err) => {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("All documents removed from the collection.");
//     }
//   });
// }

// catch (error) {
//   console.error(error)
//   res.send({ status: "error", error: error });
  
// }
// })



//---------------------------------------------------------------------------------------------//
// get the class number from database for Attendnace Report 
app.get("/getClassNumber",async(req, res)=> {
  try {
    const classNumber= await Class.find({});
    res.send({status: "ok",data: classNumber })
  } catch (error){
    console.log(error)
  }
});

//---------------------------------------------------------------------------------------------//
// get all user information exceprt admin
app.get("/getAllUserExceptAdmin",async(req, res)=> {
  try {
    const allUser= await User.find({userType: "User"});
    res.send({status: "ok",data: allUser })
  } catch (error){
    console.log(error)
  }
});



//---------------------------------------------------------------------------------------------//
// get user attendance record

app.post("/getUserAttendance",async(req,res)=>{
  const {token} = req.body;
  
  try{
  const user = jwt.verify(token, JWT_SECRET);
  const useremail = user.email;
  User.findOne({email: useremail})
  .then((data)=>{
    res.send({status:"ok",data:data.attendance});
  })
  .catch((error)=>{
    res.send({status:"error",data:error});
  });
  } catch (error) {}
})


//---------------------------------------------------------------------------------------------//


