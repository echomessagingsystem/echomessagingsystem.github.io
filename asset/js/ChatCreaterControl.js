import {
    Photos,
    ClearPhotos,
    Videos,
    ClearVideos,
    chunkFile,
    openfilebox,
    handleImageChunk,
    handleVideoChunk,
    handleFileChunk,
    displayVideoMessage,
    displayImageMessage,
    displayTextMessage,
    createFileMessageElement,
    closeSelectedImageModal,
    closeSelectedVideoModal,
    convertfileToBase64,
    createprogressBar,
    deleteProgressBar
  } from "./ChatControls.js";
  import {  createrUpdateRoom,  getJoinerID,  deleteRoom } from "./firebase.js";
  
  const urlParams = new URLSearchParams(window.location.search);
  const Type = urlParams.get("type") || "";
  const Name = urlParams.get("name") || "";
  const RoomID = urlParams.get("roomid") || "";
  let Connection = false;
  const connecterName = "Echo-Globe";
  let isOpen = false;
  let videos = [];
  let imageChunks = [];
  let receivedChunks = 0;
  let assembledImage = null;
  
  if (Type !== "" && Name !== "" && RoomID !== "") {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "Are you sure you want to leave this page? If you leave this page, the room will be deleted.";
      e.returnValue = confirmationMessage; // Required for Chrome
      deleteRoom(RoomID);
      return confirmationMessage; // Required for other browsers
    });
  
    
  
    if (Type === "create") {
        displayTextMessage(`Hello, ${Name}! Nice to meet you.`, connecterName, false);
      let interval;
    //   const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const peer = new SimplePeer({
        initiator: true,
        // stream: stream,
        trickle: false,
      });
  
      // Handle peer signaling
      peer.on("signal", async function (data) {
        await createrUpdateRoom(RoomID, JSON.stringify(data));
        Connection = true;
      });
  
      const deleteRoomIdIfChannelNull = () => {
        if (Connection === true) {
          if (peer && !peer._channel) {
            deleteRoom(RoomID);
            displayTextMessage("Room Closed", connecterName, false);
            clearInterval(interval);
          }
        }
      };
  
      getJoinerID(RoomID).then((joinerId) => {
        if (joinerId !== false) {
          const parsedJoinerId = JSON.parse(joinerId);
          peer.signal(parsedJoinerId);
        } else {
          console.log("Joiner ID not found or room does not exist.");
          displayTextMessage("Room not available.", connecterName, false);
        }
      });
  
      peer.on("connect", () => {
        displayTextMessage("Connection Created", connecterName, false);
        Connection = true;
        console.log("CONNECT");
      });
      interval = setInterval(deleteRoomIdIfChannelNull, 1000);
  
      peer.on("data", function (data) {
        const message = JSON.parse(data);
        if (message.type === "message") {
          console.log(message);
          displayTextMessage(message.msg, message.name, false);
        } else if (message.type === "image") {
          handleImageChunk(message.chunk, message.filename, message.chunkIndex, message.totalChunks, message.name);
        }else if (message.type === "video"){
          handleVideoChunk(message.chunk, message.filename, message.chunkIndex, message.totalChunks, message.name);
        }else if (message.type === "file"){
          handleFileChunk(message.chunk, message.filename, message.chunkIndex, message.totalChunks, message.name);
        }
      });
  



  
      document.getElementById("sendPhotosBtn").addEventListener("click", async () => {
        closeSelectedImageModal();
        const photos = Photos();
        if (photos.length > 0) {
          for (const photo of photos) {
            const filename = photo.name;
            const base64String = await convertfileToBase64(photo);
            const [imageChunks, totalChunks] = chunkFile(base64String);
             createprogressBar(connecterName, true);
            const progressBarFill = document.getElementById("progressBarFill");
            for (let i = 0; i < totalChunks; i++) {
              const chunkData = imageChunks[i];
              const chunkIndex = i + 1;
              const numTotalChunks = totalChunks;
              const sendImageChunk = {
                type: "image",
                chunk: chunkData,
                filename: filename,
                chunkIndex: chunkIndex,
                totalChunks: numTotalChunks,
                name: Name,
              };
               await new Promise((resolve) => setTimeout(resolve, 1));
                try {
                  await peer.send(JSON.stringify(sendImageChunk));
                } catch (error) {
                  console.error("Failed to send image chunk:", error);
                }
                 if (chunkIndex === numTotalChunks) {
                progressBarFill.style.width = "0%";
                deleteProgressBar();
                await displayImageMessage(base64String, "you", true);
              }
            }
          }
          ClearPhotos();
        } else {
          console.log("No valid photos selected.");
        }
      });

      document.getElementById("sendVideosBtn").addEventListener("click", async () => {
        closeSelectedVideoModal();
        const videos = Videos();
        if (videos.length > 0) {
          for (const video of videos) {
            const filename = video.name;
            const base64String = await convertfileToBase64(video);
            const [videoChunks, totalChunks] = chunkFile(base64String);
            createprogressBar(connecterName, true);
            const progressBarFill = document.getElementById("progressBarFill");
            for (let i = 0; i < totalChunks; i++) {
              const chunkData = videoChunks[i];
              const chunkIndex = i + 1;
              const numTotalChunks = totalChunks;
              const sendVideoChunk = {
                type: "video",
                chunk: chunkData,
                filename: filename,
                chunkIndex: chunkIndex,
                totalChunks: numTotalChunks,
                name: Name,
              };
              await new Promise((resolve) => setTimeout(resolve, 10)); 
                 // Update progress bar
              const progress = Math.floor(((i + 1) / numTotalChunks) * 100);
              progressBarFill.style.width = `${progress}%`;
              try {
                await peer.send(JSON.stringify(sendVideoChunk));
              } catch (error) {
                console.error("Failed to send video chunk:", error);
              }
              if (chunkIndex === numTotalChunks) {
                progressBarFill.style.width = "0%";
                deleteProgressBar();
                await displayVideoMessage(base64String, "you", true);
              }
            }    
          }
          ClearVideos();
        } else {
          console.log("No valid video selected.");
        }
      });

      document.getElementById("sendMessage").addEventListener("click", async () => {
        const inputElement = document.getElementById("messageInput");
        const message = inputElement.value;
        const messages = { type: "message", msg: inputElement.value, name: Name };
        if (inputElement.value !== "") {
          if (peer && peer._channel && peer._channel.readyState === "open") {
            await peer.send(JSON.stringify(messages));
            if (message.trim() !== "") {
              displayTextMessage(message, "you", true);
              inputElement.value = "";
            }
          } else {
            displayTextMessage("Connection not established yet", connecterName, false);
          }
        }
      });
  
      document.getElementById("uploadFilesBtn").addEventListener("click", () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.id = 'selectfiles';
        input.addEventListener('change', async (event)=>{
            openfilebox();
            const files = event.target.files;
            if (files && files.length > 0) {
              const selectedFiles = Array.from(files);
              if (selectedFiles.length > 0) {
                for (let file of selectedFiles) {
                  const filename = file.name;
                  const base64String = await convertfileToBase64(file);
                  const [fileChunks, totalChunks] = chunkFile(base64String);
                  createprogressBar(connecterName, true);
                  const progressBarFill = document.getElementById("progressBarFill");
                  for (let i = 0; i < totalChunks; i++) {
                    const chunkData = fileChunks[i];
                    const chunkIndex = i + 1;
                    const numTotalChunks = totalChunks;
                    const sendFileChunk = {
                      type: "file",
                      chunk: chunkData,
                      filename: filename,
                      chunkIndex: chunkIndex,
                      totalChunks: numTotalChunks,
                      name: Name,
                    };
                    await new Promise((resolve) => setTimeout(resolve, 10)); 
                     // Update progress bar
                        const progress = Math.floor(((i + 1) / numTotalChunks) * 100);
                        progressBarFill.style.width = `${progress}%`;
                    try {
                      await peer.send(JSON.stringify(sendFileChunk));
                    } catch (error) {
                      console.error("Failed to send file chunk:", error);
                    }
                    if (chunkIndex === numTotalChunks) {
                      progressBarFill.style.width = "0%";
                      deleteProgressBar();
                      await createFileMessageElement(filename, base64String, "you", true);
                    }
                  }
                }
              } else {
                console.log('No valid file selected.');
              }
            }
          
          });
        input.click();
      });

         

      window.addEventListener("unload", function (e) {
        deleteRoom(RoomID);
      });
    }
  } else {
    location.href = "/";
    document.body.innerHTML = `<center class="mt-5 text-light">Unauthorised</center>`;
  }
//   <button id="changeModeBtn">Change Audio/Video Mode</button>


//   peer.on('data', data => {
//     // Handle incoming data from the remote peer
//     const message = JSON.parse(data);
  
//     if (message.type === 'updateStream') {
//       // Update the stream on the other side with the received stream
//       const receivedStream = message.stream;
      
//       // Here, you can perform actions with the receivedStream variable
//       // For example, you could update the video element with the new stream
//       const videoElement = document.getElementById('remoteVideo');
//       videoElement.srcObject = receivedStream;
//     }
//   });
  
// // Declare the initial stream variable outside the click event listener
// let stream;

// // Create the initial peer object
// const peer = new SimplePeer({
//   initiator: true, // Set as true for the initiator side
//   trickle: false,
// });

// // Select the button element
// const changeModeBtn = document.getElementById('changeModeBtn');

// // Add event listener to the button
// changeModeBtn.addEventListener('click', async () => {
//   try {
//     // Update the stream variable with the new audio/video mode
//     stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

//     // Send a signal to the remote peer indicating the change in the stream
//     peer.send(JSON.stringify({ type: 'updateStream', stream }));

//     // Do something with the updated `stream` and `peer` variables
//     // ...
//   } catch (error) {
//     console.error('Error accessing media devices:', error);
//   }
// });

// // Listen for incoming signals from the remote peer
// peer.on('signal', signal => {
//   // Send the signal to the remote peer using your chosen signaling method
//   // ...
// });

// peer.on('data', data => {
//   // Handle incoming data from the remote peer
//   const message = JSON.parse(data);

//   if (message.type === 'updateStream') {
//     // Update the stream on the other side with the received stream
//     const receivedStream = message.stream;
//     // ...
//   }
// });
