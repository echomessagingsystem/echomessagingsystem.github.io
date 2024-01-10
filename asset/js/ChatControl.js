import { checkRoom, createrUpdateRoom , JoinerUpdateRoom,getJoinerID , getcreaterID , deleteRoom} from "./firebase.js";

const urlParams = new URLSearchParams(window.location.search);
const Type = urlParams.get("type") || "";
const Name = urlParams.get("name") || "";
const RoomID = urlParams.get("roomid") || "";
let Connection = false;
const connecterName = "Echo-Global";




function playNotificationSound() {
  const notificationSound = document.getElementById("notificationSound");
  notificationSound.play();
}

function displayTextMessage(message,name, isSent) {
    const messageContainer = document.querySelector(".message-container");
    const messageElement = createTextMessageElement(message,name, isSent);
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if (name === connecterName ){
      playNotificationSound();
    }
}

function createTextMessageElement(message,name, isSent) {
    const messageContainer = document.createElement("div");
    const messageName = document.createElement("b");
    name === "you" ? messageName.classList.add('text-dark'):messageName.classList.add('text-primary');
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



document.getElementById("messageInput").addEventListener("input", (event) => {
  const element = event.target;
  element.style.height = "";
  const scrollHeight = element.scrollHeight;
  const lineHeight = parseInt(getComputedStyle(element).lineHeight);
  const maxLines = 5;
  element.style.height = Math.min(scrollHeight, lineHeight * maxLines) + "px";
});



if(Type !== "" && Name !== "" && RoomID !== "" ){

  window.addEventListener('beforeunload', function (e) {
    var confirmationMessage = 'Are you sure you want to leave this page? if you leave this page Room will be Deleted';
    e.returnValue = confirmationMessage; // Required for Chrome
    deleteRoom(RoomID);
    return confirmationMessage; // Required for other browsers
  });
  
  displayTextMessage(`Hello, ${Name}! Nice to meet you.`, connecterName, false);

  if (Type === "create") {
    let interval;
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
    });
  
    // Handle peer signaling
    peer.on('signal', async function (data) {
      await createrUpdateRoom(RoomID, JSON.stringify(data));
      Connection = true;
    });
  
    const deleteRoomIdIfChannelNull = () => {
      if (Connection === true){
      if (peer && !peer._channel) {
        // Call your delete room ID function here
        deleteRoom(RoomID); // Modify this line according to your actual function
        displayTextMessage("Room Closed", connecterName, false);
        clearInterval(interval);
      }
    }
    }
  
    getJoinerID(RoomID).then((joinerId) => {
      if (joinerId !== false) {
        const parsedJoinerId = JSON.parse(joinerId);
        peer.signal(parsedJoinerId);
        displayTextMessage("Connection Created", connecterName, false);
        Connection = true;
      } else {
        console.log("Joiner ID not found or room does not exist.");
        displayTextMessage("Room not available.", connecterName, false);
      }
    });
  
    peer.on('data', function (data) {
      const message = JSON.parse(data);
      displayTextMessage(message.msg, message.name, false);
    });
  

      interval = setInterval(deleteRoomIdIfChannelNull, 1000);

  
    document.getElementById("sendMessage").addEventListener("click", async () => {
      const inputElement = document.getElementById("messageInput");
      const message = inputElement.value;
      const messages = { msg: inputElement.value, name: Name };
      if (inputElement.value !== "") {
        if (peer && peer._channel && peer._channel.readyState === 'open') {
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
  
    window.addEventListener('unload', function (e) {
      deleteRoom(RoomID);
    });
  }
  else{
    let interval;
    const peer = new SimplePeer({
        initiator: false, 
        trickle: false, 
      });
      peer.on('signal',async function (data) {
        await  JoinerUpdateRoom(RoomID,JSON.stringify(data))
        displayTextMessage("Connection established", connecterName, false);
      });

      getcreaterID(RoomID).then((createrID) => {
        if (createrID !== false) {
          const parsedcreaterID = JSON.parse(createrID);
          peer.signal(parsedcreaterID);
          if (peer && peer._channel && peer._channel.readyState === 'open') {
            displayTextMessage("Connection established", connecterName, false);
          }
        } else {
          displayTextMessage("Room not Available", connecterName, false);
          console.log("Creater ID not found or room does not exist.");
        }
      });
      
      const deleteRoomIdIfChannelNull = () => {
        if (Connection === true){
        if (peer && !peer._channel) {
          // Call your delete room ID function here
          deleteRoom(RoomID); // Modify this line according to your actual function
          displayTextMessage("Room Closed", connecterName, false);
          clearInterval(interval);
        }
      }
      }

      interval = setInterval(deleteRoomIdIfChannelNull, 1000);
      peer.on('data', function (data) {
    const message = JSON.parse(data);
    displayTextMessage(message.msg,message.name, false);
    });

    document.getElementById("sendMessage").addEventListener("click",async ()=>{
        const inputElement = document.getElementById("messageInput");
        const message = inputElement.value;
        const messages = { msg: messageInput.value, name: Name };
        if(inputElement.value !== ""){
          if (peer && peer._channel && peer._channel.readyState === 'open') {
            await peer.send(JSON.stringify(messages));
            if (message.trim() !== "") {
              displayTextMessage(message, "you", true);
              inputElement.value = "";
            }
          }  else {
            console.log(peer._channel);
            displayTextMessage("Connection not established yet", connecterName, false);
          }
      }
      });
}
}else{
    document.body.innerHTML = `<center class="mt-5 text-light">Unauthorised</center>`
}
