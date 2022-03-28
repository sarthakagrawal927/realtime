# realtime

All the details here are a part of a course, done for me to expand/test my knowledge on realtime.

## Polling

Just responding to a HTTP request a lot. Simplest implementation to real time.

requestAnimationFrame is awesome. You can keep tailoring the back-off function, based on requirements.

## HTTP2

Multiplex requests - allows browser to send multiple requests at once on the same connection & receive the requests back in any order, better compression strategies, lower level access to binary frames - allows in better compressing, request prioritization, long running requests - you can send chunks of data instead of sending the whole at once, etc.

HTTP3 uses QUICK, which basically uses UDP as the transport layer -  making it way more fault tolerant and faster - normally we won't see much difference but with low network connectivity, it can be a huge improvement.

## SocketIO

Extremely straight forward - extremely powerful library

## More

WebRTC, SignalR ( not available for JS yet)
