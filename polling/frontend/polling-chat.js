const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

// let's store all current messages here
let allChat = [];
let failedTries = 0

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {user, text}
  const options = {
    method: 'POST',
    body: JSON.stringify(data),
    headers:{
      'Content-Type': 'application/json'
    }
  }
  await fetch('/poll', options);
}

async function getNewMsgs() {
    let json;
   try{
     const res = await fetch('/poll');
     json = await res.json()

     if(res.status >= 400) {
       throw new Error("Request did not succeed : " + res.status);
     }
     allChat = json.msg;
     render();
     failedTries = 0
   }
   catch(err){
     console.log("polling failed, backing off",err);
     // linear back-off - increasing duration of retry in case of failure, you might wanna make it exponential once 3 fails
     failedTries++;
   }
  //  setTimeout(getNewMsgs, INTERVAL);
}

function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficient. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

let timeToMakeNextRequest = 0
const BACKOFF = 5000

async function rafTimer(time) {
  if (timeToMakeNextRequest <= time) {
    await getNewMsgs();
    timeToMakeNextRequest = time + INTERVAL + failedTries * BACKOFF;
  }
  requestAnimationFrame(rafTimer);
}

// runs only when the browser ta active
requestAnimationFrame(rafTimer);
