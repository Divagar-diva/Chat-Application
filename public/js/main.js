
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages'); 
const roomname = document.getElementById('room-name');
const userlist = document.getElementById('users');

// Parse username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinroom', { username, room });

socket.on('roomUsers', ({ room,users })=>{
    outputroomname(room),
    outputusers(users)
})

// Receive message from server
socket.on('message', (message) => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msgInput = e.target.elements.msg;

    const msg = msgInput.value.trim();
    if (!msg) return; // ✅ Prevent sending empty messages

    // Emit message to server
    socket.emit('chatMessage', msg);

    // Clear input
    msgInput.value = '';
    msgInput.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <p class="meta">${message.username} <span>${message.time}</span></p>
        <p class="text">${message.text}</p>
    `;
    chatMessages.appendChild(div);
}
function outputroomname(room){
    roomname.innerText = room;
}

function outputusers(users){
    userlist.innerHTML = users.map(user=>`<li>${user.username}</li>`).join('')
}