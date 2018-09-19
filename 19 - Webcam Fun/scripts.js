const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
 navigator.mediaDevices.getUserMedia({ video: true, audio: false })
 .then(localMediaStream => { // return a promise
   console.log(localMediaStream);
   video.src = window.URL.createObjectURL(localMediaStream); // this is how we "convert" the source to a livestream
   video.play();
 })
 .catch(err => {
   console.error(`Webcam denied`, err); // catch in case someone doesn't allow you to access to their webcam
 });
}

function paintToCanvas() {
 const width = video.videoWidth;
 const height = video.videoHeight;
 canvas.width = width;
 canvas.height = height;

 return setInterval(() => { // take an image from the webcam and puts it into the canvas
   ctx.drawImage(video, 0, 0, width, height);
   let pixels = ctx.getImageData(0, 0, width, height); // take the pixels out
   pixels = greenScreen(pixels);
   // pixels = rgbSplit(pixels);
   // ctx.globalAlpha = 0.1;
   // pixels = redEffect(pixels); // play a little bit
   ctx.putImageData(pixels, 0, 0); // put them back

 }, 16);
}

function takePhoto() {
 snap.currentTime = 0;
 snap.play(); // plays the photo sound ('click!')

 const data = canvas.toDataURL('image.jpeg'); // take the data out of the canvas
 const link = document.createElement('a');
 link.href = data;
 link.setAttribute('download', 'image');
 link.innerHTML = `<img src="${data}" alt="Just an image" />`;
 strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
 for(let i = 0; i < pixels.data.length; i+=4) { // I loop over every pixels that I have
   pixels.data[i + 0] = pixels.data[i + 0] + 250; // red
   pixels.data[i + 1] = pixels.data[i + 1] - 50; // green
   pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue
 }
 return pixels;
}

function rgbSplit(pixels) {
 for(let i = 0; i < pixels.data.length; i+=4) {
   pixels.data[i - 150] = pixels.data[i + 0]; // red
   pixels.data[i + 500] = pixels.data[i + 1]; // green
   pixels.data[i - 350] = pixels.data[i + 2]; // blue
 }
 return pixels;
}

function greenScreen(pixels) {
 const levels = {}; // holds minimum and maximum green

 document.querySelectorAll('.rgb input').forEach((input) => {
   levels[input.name] = input.value;
 });

 for (i = 0; i < pixels.data.length; i = i + 4) {
   red = pixels.data[i + 0];
   green = pixels.data[i + 1];
   blue = pixels.data[i + 2];
   alpha = pixels.data[i + 3];

   if (red >= levels.rmin
     && green >= levels.gmin
     && blue >= levels.bmin
     && red <= levels.rmax
     && green <= levels.gmax
     && blue <= levels.bmax) {
     pixels.data[i + 3] = 0;
     }
 }
 return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
