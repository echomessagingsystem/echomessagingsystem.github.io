
const connecterName = "Echo-Globe";
let isOpen = false;
let photos = [];
let videos = [];
let imageChunks = "";
let videoChunks = "";
let fileChunks = "";
let imageChunksFileName = "";
let videoChunksFileName = "";
let fileChunksFileName = "";

function Photos() {
    return photos;
}

function ClearPhotos(){
    photos = [];
}

function Videos() {
    return videos;
}

function ClearVideos(){
    videos = [];
}

const showModal = (modalId, displayStyle) => {
    document.getElementById(modalId).style.display = displayStyle;
  };
  
function openImageModal(clickedImg) {
    const modalImage = document.getElementById("modalImage");
    showModal("imageModal", "block");
    modalImage.src = clickedImg.src;
}
  
  function openVideoModal(clickedVideo) {
    console.log("video url :", clickedVideo.src);
    const modalVideo = document.getElementById("modelVideo");
    showModal("videoModal", "block");
    modalVideo.src = clickedVideo.src;
  }
  
  document.getElementById("closeImageModalBtn").addEventListener("click", () => {
    closeImageModal();
  });
  
  function closeImageModal() {
    showModal("imageModal", "none");
  }
  
  document.getElementById("closeVideoModalBtn").addEventListener("click", () => {
    closeVideoModal();
  });
  
  function closeVideoModal() {
    const modalVideo = document.getElementById("modelVideo").src = "";
    showModal("videoModal", "none");
  }
  
  document.getElementById("closeSelectedVideoModalBtn").addEventListener("click", () => {
    closeSelectedVideoModal();
  });
  
  function closeSelectedVideoModal() {
    const modal = document.getElementById("selectedVideoModel");
    showModal("selectedVideoModel", "none");
    document.getElementById("video-grid").innerHTML = "";
  }
  
  document.getElementById("closeSelectedImageModalBtn").addEventListener("click", () => {
    closeSelectedImageModal();
  });
  
  function closeSelectedImageModal() {
    const modal = document.getElementById("selectedImageModel");
    showModal("selectedImageModel", "none");
    document.getElementById("image-grid").innerHTML = "";
  }
  
  function playNotificationSound() {
    const notificationSound = document.getElementById("notificationSound");
    notificationSound.play();
  }
  
  function displayTextMessage(message, name, isSent) {
    const messageContainer = document.querySelector(".message-container");
    const messageElement = createTextMessageElement(message, name, isSent);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if (name === connecterName) {
      playNotificationSound();
    }
  }
  
  function displayImageMessage(image, name, isSent) {
    const messageContainer = document.querySelector(".message-container");
    const messageElement = createImageMessageElement(image, name, isSent);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if (name === connecterName) {
      playNotificationSound();
    }
  }
  
  function displayVideoMessage(video, name, isSent) {
    const messageContainer = document.querySelector(".message-container");
    const messageElement = createVideoMessageElement(video, name, isSent);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if (name === connecterName) {
      playNotificationSound();
    }
  }
  
  function createTextMessageElement(message, name, isSent) {
    const messageContainer = document.createElement("div");
    const messageName = document.createElement("b");
    name === "you" ? messageName.classList.add('text-dark') : messageName.classList.add('text-primary');
    messageName.textContent = name === "you" ? "you" : name;
  
    messageContainer.innerHTML = '';
    if (message.includes('\n') || message.includes('\t')) {
      messageContainer.appendChild(messageName);
      const lines = message.replace('\t', '    ').split('\n');
      lines.forEach((line) => {
        const lineText = document.createElement('div');
        lineText.textContent = line;
  
        messageContainer.appendChild(lineText);
      });
    } else {
      const messageText = document.createElement("div");
      messageText.textContent = message;
      messageContainer.appendChild(messageName);
      messageContainer.appendChild(messageText);
    }
    messageContainer.classList.add("textmessage", isSent ? "sent" : "received");
    return messageContainer;
  }
  
  function createImageMessageElement(image, name, isSent) {
    const messageContainer = document.createElement("div");
    
    const messageName = document.createElement("b");
    const br = document.createElement("br");
    name === "you" ? (messageName.classList.add('text-dark', 'mr-2', 'text-left')) : (messageName.classList.add('text-primary', 'ml-2'));

    messageName.textContent = name === "you" ? "you" : name;
    messageContainer.classList.add("imagemessage", isSent ? "sent" : "received");
    const imageElement = document.createElement("img");
    imageElement.src = image;
    imageElement.onclick = () => {
      openImageModal(imageElement);
    };
    messageContainer.appendChild(messageName);
    messageContainer.appendChild(br);
    messageContainer.appendChild(imageElement);
    return messageContainer;
  }
  
  function createVideoMessageElement(video, name, isSent) {
    const messageContainer = document.createElement("div");
    const messageName = document.createElement("b");
    name === "you" ? messageName.classList.add('text-dark') : messageName.classList.add('text-primary');
    messageName.textContent = name === "you" ? "you" : name;
    messageContainer.classList.add("videomessage", isSent ? "sent" : "received");
    const videoElement = document.createElement("video");
    videoElement.src = video;
    videoElement.controls = false;
    videoElement.onclick = () => {
      openVideoModal(videoElement);
    };
    messageContainer.appendChild(messageName);
    messageContainer.appendChild(videoElement);
    return messageContainer;
  }
  
  function createFileMessageElement(fileName, url, name, isSent) {
    const messageContainer = document.querySelector(".message-container");
    const messageElement = document.createElement("div");
    const messageName = document.createElement("b");
    name === "you" ? messageName.classList.add('text-dark') : messageName.classList.add('text-primary');
    messageElement.classList.add("docmessage");
  
    if (isSent) {
      messageElement.classList.add("sent","text-right");
      messageElement.innerHTML = `
          <div class="row">
            <div class="col-12">
              <b class="text-dark">${name}</b>
            </div>
             <div class="col-4">
              <a href="${url}" download = ${fileName}> <i class="fas fa-regular fa-file-arrow-down file"></i></a>
             
            </a>
            </div>
            <div class="center col-8 text-left">
              <div class="filename">${fileName}</div>
            </div>
         </div>
          `;
    } else {
      messageElement.classList.add("received");
      messageElement.innerHTML = `
          <div class="row">
          <div class="col-12">
              <b class="text-primary">${name}</b>
          </div>
          <div class="center col-8 ">
              <div class="filename">${fileName}</div>
          </div>
          <div class="col-2">
              <a href="${url}" download = ${fileName}>
              <i class="fas fa-regular fa-file-arrow-down file"></i>
              </a>
              
            </a>
          </div>  
      </div>
        `;
    }
    messageContainer.appendChild(messageName);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
  
  function createprogressBar(name,isSent){
    const messageContainer = document.querySelector(".message-container");
    const messageElement = document.createElement("div");
    const messageName = document.createElement("b");
    name === "you" ? messageName.classList.add('text-dark') : messageName.classList.add('text-primary');
    messageElement.classList.add("textmessage", isSent ? "sent" : "received");
    messageElement.id = "Bar";
    messageElement.innerHTML = `
    <div id="progressBar">
        <div id="progressBarFill"></div>
    </div>
  `;
  messageContainer.appendChild(messageName);
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  function deleteProgressBar(){
    const element = document.getElementById("Bar");
    element.remove();
  }

  document.getElementById("openfileboxBtn").addEventListener("click", () => {
    openfilebox();
  });
  
  function openfilebox() {
    isOpen = !isOpen;
    const addFileBox = document.querySelector(".addfilebox");
    const addFileIcon = document.querySelector("#addfileicon");
    addFileBox.classList.toggle("none", !isOpen);
    addFileIcon.classList.toggle("fa-plus", !isOpen);
    addFileIcon.classList.toggle("fa-xmark", isOpen);
  }
  
  document.getElementById("uploadPhotosBtn").addEventListener("click", () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.id = "selectphoto";
    input.addEventListener('change', handlePhotosSelect);
    input.click();
  });
  
  document.getElementById("uploadVideosBtn").addEventListener("click", () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.multiple = true;
    input.id = 'selectvideo';
    input.addEventListener('change', handleVideosSelect);
    input.click();
  });
  
  function selectedImageElement(image) {
    const imageElement = document.createElement("img");
    imageElement.src = image;
    return imageElement;
  }
  
  function selectedVideoElement(video) {
    const videoElement = document.createElement("video");
    videoElement.src = video;
    videoElement.controls = true;
    return videoElement;
  }
  
  function handlePhotosSelect(event) {
    openfilebox()
    var modal = document.getElementById("selectedImageModel");
    var modalImage = document.getElementById("image-grid");
    modal.style.display = "block";
    const files = event.target.files;
    if (files && files.length > 0) {
      const selectedPhotos = Array.from(files).filter(file => file.type.startsWith('image/'));
      console.table(selectedPhotos);
      if (selectedPhotos.length > 0) {
        selectedPhotos.forEach(photo => {
          const reader = new FileReader();
          reader.onload = function (e) {
            const imageUrl = reader.result;
            const imageElement = selectedImageElement(imageUrl);
            modalImage.appendChild(imageElement);
          };
          reader.readAsDataURL(photo);
          photos.push(photo);
        });
      } else {
        console.log('No valid photos selected.');
      }
    }
  }

   function handleVideosSelect(event) {
  openfilebox();
  var modal = document.getElementById("selectedVideoModel");
  var modalvideo = document.getElementById("video-grid");
  modal.style.display = "block";
  videos = [];
  const files = event.target.files;
  if (files && files.length > 0) {
    const selectedVideos = Array.from(files).filter(file => file.type.startsWith('video/'));
    console.table(selectedVideos);
    if (selectedVideos.length > 0) {
      selectedVideos.forEach(video => {
        const videoURL = URL.createObjectURL(video);
        const videoElement = selectedVideoElement(videoURL);
        modalvideo.appendChild(videoElement);
        videos.push(video);
      });
    } else {
      console.log('No valid videos selected.');
    }
  }
}

  document.getElementById("messageInput").addEventListener("input", (event) => {
    const element = event.target;
    element.style.height = "";
    const scrollHeight = element.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(element).lineHeight);
    const maxLines = 5;
    element.style.height = Math.min(scrollHeight, lineHeight * maxLines) + "px";
  });
  
// Function to chunk the file into smaller chunks
function chunkFile(file) {
    const chunkSize = 100 * 1024; 
    const chunks = [];
    let offset = 0;
    while (offset < file.length) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
      offset += chunkSize;
    }
    return [chunks, chunks.length];
  }
 
  function handleImageChunk(chunk, filename, chunkIndex, totalChunks, name) {
    
    if (chunkIndex === 1) {
      createprogressBar(connecterName,false);
      imageChunksFileName = filename;
    }
  
    if (imageChunksFileName === filename) {
      const progressBarFill = document.getElementById("progressBarFill");
      imageChunks += chunk;
  
      // Update progress bar
      const progress = Math.floor((chunkIndex / totalChunks) * 100);
      progressBarFill.style.width = `${progress}%`;
  
      if (chunkIndex === totalChunks) {
        // Display the complete image
        displayImageMessage(imageChunks, name, false);
        imageChunks = "";
        imageChunksFileName = "";
  
        // Reset progress bar
        progressBarFill.style.width = "0%";
        deleteProgressBar();
      }
    } else {
      console.log("Download file error");
      deleteProgressBar();
    }
  }

  async function  handleVideoChunk(chunk, filename, chunkIndex, totalChunks, name) {
    
    if (chunkIndex === 1) {
      createprogressBar(connecterName,false);
      videoChunksFileName = filename;
      console.log(videoChunksFileName);
    }
  
    if (videoChunksFileName === filename) {
      const progressBarFill = document.getElementById("progressBarFill");
      videoChunks += chunk;
  
      // Update progress bar
      const progress = Math.floor((chunkIndex / totalChunks) * 100);
      progressBarFill.style.width = `${progress}%`;
  
      if (chunkIndex === totalChunks) {
        // Display the complete image
       await displayVideoMessage( videoChunks, name, false);
        videoChunks = "";
        videoChunksFileName = "";
        // Reset progress bar
        progressBarFill.style.width = "0%";
        deleteProgressBar();
      }
    } else {
      console.log("Download file error");
      deleteProgressBar();
    }
  }

  async function  handleFileChunk(chunk, filename, chunkIndex, totalChunks, name) {
    
    if (chunkIndex === 1) {
      createprogressBar(connecterName,false);
      fileChunksFileName = filename;
    }
  
    if (fileChunksFileName === filename) {
      const progressBarFill = document.getElementById("progressBarFill");
      fileChunks += chunk;
  
      // Update progress bar
      const progress = Math.floor((chunkIndex / totalChunks) * 100);
      progressBarFill.style.width = `${progress}%`;
  
      if (chunkIndex === totalChunks) {
        // Display the complete file
       await createFileMessageElement(fileChunksFileName,fileChunks, name, false);
       fileChunks = "";
       fileChunksFileName = "";
        // Reset progress bar
        progressBarFill.style.width = "0%";
        deleteProgressBar();
      }
    } else {
      console.log("Download file error");
      deleteProgressBar();
    }
  }

  function convertfileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        const base64String = reader.result;
        resolve(base64String);
      };
  
      reader.onerror = error => {
        reject(error);
      };
  
      reader.readAsDataURL(file);
    });
  }

  export {
    Photos,
    ClearPhotos,
    Videos,
    ClearVideos,
    chunkFile,
    handleImageChunk,
    handleVideoChunk,
    handleFileChunk,
    convertfileToBase64,
    handlePhotosSelect,
    selectedVideoElement,
    selectedImageElement,
    openfilebox,
    createFileMessageElement,
    createVideoMessageElement,
    createImageMessageElement,
    createTextMessageElement,
    displayVideoMessage,
    displayImageMessage,
    displayTextMessage,
    playNotificationSound,
    closeSelectedImageModal,
    closeSelectedVideoModal,
    closeVideoModal,
    closeImageModal,
    openVideoModal,
    openImageModal,
    createprogressBar,
    deleteProgressBar,
    showModal
  }