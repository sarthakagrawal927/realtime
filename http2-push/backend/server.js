import http2 from "http2";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import handler from "serve-handler"; // vercel uses this to send static files
import nanobuffer from "nanobuffer";

let connections = [];

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "brian",
  text: "hi",
  time: Date.now(),
});

// openssl req -new -newkey rsa:2048 -new -nodes -keyout key.pem -out csr.pem
// openssl x509 -req -days 365 -in csr.pem -signkey key.pem -out server.crt
//
// http2 only works over HTTPS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const server = http2.createSecureServer({
  cert: fs.readFileSync(path.join(__dirname, "/../server.crt")),
  key: fs.readFileSync(path.join(__dirname, "/../key.pem")),
});

server.on("stream",(stream,headers)=>{
  const path = headers[":path"];
  const method = headers[":method"];

  // streams open for every request from the browser
  if(path === '/msgs' && method === 'GET') {
    // immediately respond with 200 OK and encoding
    console.log("Connected to stream", stream.id)
    stream.respond({
      ":status": 200,
      // there is no way to stream json, and the chunks standalone wont be a valid json
      "content-type": "text/plain; charset=utf-8",
    })

    stream.write(JSON.stringify({msg: getMsgs()}))

    // keep track of the connection
    connections.push(stream);

    stream.on("close",()=>{
      console.log("disconnected "+ stream.id)
      connections = connections.filter(c => c !== stream)
    })
  }
})

server.on("request", async (req, res) => {
  const path = req.headers[":path"];
  const method = req.headers[":method"];

  if (path !== "/msgs") {
    // handle the static assets
    return handler(req, res, {
      public: "./frontend",
    });
  } else if (method === "POST") {
    // get data out of post
    // this is what jsonParser does
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    const { user, text } = JSON.parse(data);

    msg.push({user,text, time: Date.now()})
    res.end();

    connections.forEach(c => c.write(JSON.stringify({msg: getMsgs()})))
  }
});

// start listening
const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(
    `Server running at https://localhost:${port} - make sure you're on httpS, not http`
  )
);
