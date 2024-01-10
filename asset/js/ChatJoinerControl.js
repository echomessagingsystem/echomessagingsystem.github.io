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
  import {  JoinerUpdateRoom,  getcreaterID, deleteRoom } from "./firebase.js";
  
  const urlParams = new URLSearchParams(window.location.search);
  const Type = urlParams.get("type") || "";
  const Name = urlParams.get("name") || "";
  const RoomID = urlParams.get("roomid") || "";
  let Connection = false;
  const connecterName = "Echo-Globe";

  
  
  if (Type !== "" && Name !== "" && RoomID !== "") {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "Are you sure you want to leave this page? If you leave this page, the room will be deleted.";
      e.returnValue = confirmationMessage; // Required for Chrome
      deleteRoom(RoomID);
      return confirmationMessage; // Required for other browsers
    });
  
  
    if (Type === "join") {
         displayTextMessage(`Hello, ${Name}! Nice to meet you.`, connecterName, false);
      let interval;
    //   const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const peer = new SimplePeer({
        initiator: false,
        // stream: stream,
        trickle: false,
      });
      peer.on("signal", async function (data) {
        await JoinerUpdateRoom(RoomID, JSON.stringify(data));
        displayTextMessage("Connection established", connecterName, false);
      });
  
      getcreaterID(RoomID).then((createrID) => {
        if (createrID !== false) {
          const parsedcreaterID = JSON.parse(createrID);
          peer.signal(parsedcreaterID);
          if (peer && peer._channel && peer._channel.readyState === "open") {
            displayTextMessage("Connection established", connecterName, false);
          }
        } else {
          displayTextMessage("Room not Available", connecterName, false);
          console.log("Creater ID not found or room does not exist.");
        }
      });
  
      peer.on("connect", () => {
        displayTextMessage("Connection Created", connecterName, false);
        Connection = true;
        console.log("CONNECT");
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
  
      interval = setInterval(deleteRoomIdIfChannelNull, 1000);
  
      // Add this code to your HTML file




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




      document.getElementById("sendMessage").addEventListener("click", async () => {
        const inputElement = document.getElementById("messageInput");
        const message = inputElement.value;
        const messages = { type: "message", msg: messageInput.value, name: Name };
        if (inputElement.value !== "") {
          if (peer && peer._channel && peer._channel.readyState === "open") {
            await peer.send(JSON.stringify(messages));
            if (message.trim() !== "") {
              displayTextMessage(message, "you", true);
              inputElement.value = "";
            }
          } else {
            console.log(peer._channel);
            displayTextMessage("Connection not established yet", connecterName, false);
          }
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
                    await new Promise((resolve) => setTimeout(resolve, 10)); // Introduce a delay of 10 milliseconds between sending each chunk
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

   

    //   document.getElementById("audioCallBtn").addEventListener("click", async () => {
    //     const createAudioCall = {
    //         type:"audiocall",
    //         mode:"request",
    //         from:Name,
    //     }
    //   });



    }
  } else {
    location.href = "/";
    document.body.innerHTML = `<center class="mt-5 text-light">Unauthorised</center>`;
  }
  
 