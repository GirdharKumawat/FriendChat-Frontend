const APP_ID = "c98d2c61906641b9a4c62e83fb71aa09";
let baseURL = 'https://friendchat-backend.onrender.com/';
const TOKEN = sessionStorage.getItem("token");
const CHANNEL = sessionStorage.getItem("room");
let UID = sessionStorage.getItem("UID");

let NAME = sessionStorage.getItem("name");

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {
  document.getElementById("RoomName").innerText = CHANNEL;

  client.on("user-published", handleUserJoined);
  client.on("user-left", handleUserLeft);

  try {
    UID = await client.join(APP_ID, CHANNEL, TOKEN, UID);
  } catch (error) {

    console.error("Error joining channel", error);
     
    window.open('index.html', '_self')    
  }

  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  let member = await createMember();
  addUserToGrid(UID, member.name);


  localTracks[1].play(`user-${UID}`);
  await client.publish([localTracks[0], localTracks[1]]);
};

let handleUserJoined = async (user, mediaType) => {
  remoteUsers[user.uid] = user;
  await client.subscribe(user, mediaType);

  //
  if (mediaType === "video") {
    let player = document.getElementById(`user-container-${user.uid}`);
    if (player != null) {
      player.remove();
    }

    let member = await getMember(user);
    addUserToGrid(user.uid, member.name);
 
    user.videoTrack.play(`user-${user.uid}`);
  }

  if (mediaType === "audio") {
    user.audioTrack.play();
  }
};

let handleUserLeft = async (user) => {
  delete remoteUsers[user.uid];
  document.getElementById(`user-container-${user.uid}`).remove();
};

let leaveAndRemoveLocalStream = async () => {
  for (let i = 0; localTracks.length > i; i++) {
    localTracks[i].stop();
    localTracks[i].close();
  }

  await client.leave();

  deleteMember();
  window.open("index.html", "_self");
};

let toggleCamera = async () => {
  if (localTracks[1].muted) {
    await localTracks[1].setMuted(false);
     cameraBtn.classList.remove("danger");
  } else {
    await localTracks[1].setMuted(true);
    cameraBtn.classList.add("danger");
  }
};

let toggleMic = async () => {
  if (localTracks[0].muted) {
    await localTracks[0].setMuted(false);
    micBtn.classList.remove("danger");
  } else {
    await localTracks[0].setMuted(true);
    micBtn.classList.add("danger");
  }
};

let createMember = async () => {
  let response = await fetch("https://friendchat-backend.onrender.com/createMember/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: NAME, room: CHANNEL, UID: UID }),
  });
  let member = await response.json();
  return member;
};

let getMember = async (user) => {
  let response = await fetch(`https://friendchat-backend.onrender.com/getMember/?UID=${user.uid}&room=${CHANNEL}`);

  let member = await response.json();
  return member;
};

let deleteMember = async () => {
  let response = await fetch("https://friendchat-backend.onrender.com/deleteMember/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: NAME, room: CHANNEL }),
  });
  let member = await response.json();
};

window.addEventListener("beforeunload", deleteMember);

joinAndDisplayLocalStream();

let leaveBtn = document.getElementById("leave-btn");
let cameraBtn = document.getElementById("camera-btn");
let micBtn = document.getElementById("mic-btn");

leaveBtn.addEventListener("click", leaveAndRemoveLocalStream);
cameraBtn.addEventListener("click",toggleCamera);
micBtn.addEventListener("click", toggleMic);

 

let addUserToGrid = (uid, name) => {
  let userHTML = `
        <div class="bg-gray-800 rounded-lg relative video-player overflow-hidden ">
            <div class="z-10 absolute top-2 left-2 flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full ">
                <span class="text-white text-sm">${name}</span>
            </div>

            <div id="user-${uid}" class="w-full h-full">
            
            </div>
        </div>
          
        `;

  document
    .getElementById("videoGrid")
    .insertAdjacentHTML("beforeend", userHTML);
};
