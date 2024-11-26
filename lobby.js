const Roomform = document.getElementById('roomForm');


Roomform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomName = document.getElementById('roomName').value;
    const username = document.getElementById('joinUsername').value;
    
  
    
    const response = await fetch(`https://friendchat-backend.onrender.com/getToken/?room=${roomName}`);

    if (!response.ok) {
        console.error('Failed to get token');
        return;
    }
    const data = await response.json();
   
    let UID = data.UID;
    let Token = data.token;
     
    sessionStorage.setItem('UID', UID);
    sessionStorage.setItem('token', Token);
    sessionStorage.setItem('room', roomName);
    sessionStorage.setItem('name', username);
    window.open('room.html','_self'); 
   
});


function showModal(modalId) {
  document.getElementById(modalId).classList.add("active");
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}
