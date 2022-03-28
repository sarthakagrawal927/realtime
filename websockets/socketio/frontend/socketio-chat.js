// a global called "io" is being loaded separately (via CDN)

const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");
let allChat = [];

const socket = io('http://localhost:8080');

// starts polling
// window.WebSocket = null

socket.on('connect',()=>{
  presence.innerText = 'connected';
})

socket.on('disconnect',()=>{
  presence.innerText = 'disconnected';
})

socket.on("get:messages",(data)=>{
  allChat = data.msg;
  render();
})

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  socket.emit("post:message", { user, text });
}

function render() {
  const html = allChat.map(({ user, text }) => template(user, text));
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;
