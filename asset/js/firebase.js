import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase,ref,set,get} from "https://www.gstatic.com/firebasejs/9.22.2//firebase-database.js";

var firebaseConfig = {
  apiKey: "AIzaSyC1QgZw1hNhesqrq7gU-B4-IAKScY9ACdE",
  authDomain: "echo-b2f1f.firebaseapp.com",
  projectId: "echo-b2f1f",
  storageBucket: "echo-b2f1f.appspot.com",
  messagingSenderId: "795689625860",
  appId: "1:795689625860:web:9bcf69b393cc66ebdd4851",
  measurementId: "G-KZ2YBEV61X"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const createRoom = async (Name, roomID) => {
  try {
    // Create data
    await set(ref(database, `Rooms/${roomID}`), {
      name: Name,
      createrID: "",
      joinerID: ""
    });
    return true;
  } catch (error) {
    console.error("Error creating Room", error);
    return false;
  }
};

const checkRoom = async (roomID) => {
  try {
    // Check Room ID
    const snapshot = await get(ref(database, `Rooms/${roomID}`));
    if (snapshot.exists()) {
      console.log("Room exists!");
      const roomData = snapshot.val();
      return true;
    } else {
      console.log("Room does not exist!");
      return false;
    }
  } catch (error) {
    console.error("Error checking Room", error);
    return false;
  }
};

const createrUpdateRoom = async (roomId, newCreatorId) => {
  try {
    // Retrieve the room data
    const roomRef = ref(database, `Rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
      const updatedRoomData = {
        joinerID: roomData.joinerID,
        createrID: newCreatorId,
        name: roomData.name
      };

      // Update the room in the database
      await set(roomRef, updatedRoomData);

      return true;
    } else {
      console.log("Room does not exist!");
      return false;
    }
  } catch (error) {
    console.error("Error updating Room", error);
    return false;
  }
};

const JoinerUpdateRoom = async (roomId, newJoinerId) => {
  try {
    // Retrieve the room data
    const roomRef = ref(database, `Rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
      const updatedRoomData = {
        joinerID: newJoinerId,
        createrID: roomData.createrID,
        name: roomData.name
      };

      // Update the room in the database
      await set(roomRef, updatedRoomData);

      return true;
    } else {
      console.log("Room does not exist!");
      return false;
    }
  } catch (error) {
    console.error("Error updating Room", error);
    return false;
  }
};

const getcreaterID = async (roomId) => {
  try {
    // Retrieve the room data
    const roomRef = ref(database, `Rooms/${roomId}`);
    const roomSnapshot = await get(roomRef);

    if (roomSnapshot.exists()) {
      const roomData = roomSnapshot.val();
      if (roomData.createrID !== "") {
        return roomData.createrID;
      } else {
        // If joinerID is empty, wait for a short delay and call the function again
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        return getcreaterID(roomId); // Recursive call
      }
    } else {
      console.log("Room does not exist!");
      return false;
    }
  } catch (error) {
    console.error("Error getting creater ID in Room", error);
    return false;
  }
};

const getJoinerID = async (roomId) => {
    try {
      // Retrieve the room data
      const roomRef = ref(database, `Rooms/${roomId}`);
      const roomSnapshot = await get(roomRef);
  
      if (roomSnapshot.exists()) {
        const roomData = roomSnapshot.val();
        if (roomData.joinerID !== "") {
          return roomData.joinerID;
        } else {
          // If joinerID is empty, wait for a short delay and call the function again
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
          return getJoinerID(roomId); // Recursive call
        }
      } else {
        console.log("Room does not exist!");
        return false;
      }
    } catch (error) {
      console.error("Error getting Joiner ID in Room", error);
      return false;
    }
  };

  const deleteRoom = async (roomID) => {
    try {
      const roomRef = ref(database, `Rooms/${roomID}`);
      await set(roomRef, null);
      console.log("Room removed successfully");
    } catch (error) {
      console.error("Error removing room:", error);
    }
  }
  

export { createRoom, checkRoom, createrUpdateRoom, JoinerUpdateRoom,getcreaterID, getJoinerID ,deleteRoom };
