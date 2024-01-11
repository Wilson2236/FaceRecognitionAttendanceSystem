
const{
  FaceModel
}=require(process.cwd()+'/db/faceMongoose');
const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
faceapi.env.monkeyPatch({ Canvas, Image });

// takes an array of images and user data as input
// returns the array of face descriptors
async function uploadLabeledImages(images, userData) {
  try {
    const descriptions = [];      
    // Loop through the images
    for (let i = 0; i < images.length; i++) {
      const img = await canvas.loadImage(images[i]);
      // Read each face and save the face descriptions in the descriptions array
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      // console.log(img);
      // console.log(detections.descriptor);
      descriptions.push(detections.descriptor);
    }
    return descriptions;
  } catch (error) {
    console.log(error);
    return (error);
  }
}

// takes an image and a list of labeled face descriptors from a database as input
//  returns an array of matches
async function getDescriptorsFromDB(image,faceList) {
// console.log(faceList.length);
// Get all the face data from mongodb and loop through each of them to read the data
for (i = 0; i < faceList.length; i++) {
  // Change the face data descriptors from Objects to Float32Array type
  for (j = 0; j < faceList[i].descriptions.length; j++) {
    faceList[i].descriptions[j] = new Float32Array(Object.values(faceList[i].descriptions[j]));
  }
  // Turn the DB face docs to
  faceList[i] = new faceapi.LabeledFaceDescriptors(faceList[i].id,faceList[i].descriptions);
}
// Load face matcher to find the matching face
const faceMatcher = new faceapi.FaceMatcher(faceList, 0.45);
nowfaceMatcher=faceMatcher._labeledDescriptors.filter((face)=>{
  return face._descriptors.length>0
})
faceMatcher._labeledDescriptors=nowfaceMatcher;
console.log(faceMatcher);


// Read the image using canvas or other method
const img = await canvas.loadImage(image);
let temp = faceapi.createCanvasFromMedia(img);
// Process the image for the model
const displaySize = { width: img.width, height: img.height };
faceapi.matchDimensions(temp, displaySize);

// Find matching faces
const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
const resizedDetections = faceapi.resizeResults(detections, displaySize);
const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
return results;
}

module.exports={
  uploadLabeledImages,
  getDescriptorsFromDB
}




