# chat_cluster

![alt text](https://github.com/shoebpatel/chat_cluster/blob/main/design_flow.png)


- ✅  Should be able to send private messages to another user
- ✅  Should be able to broadcast any message to all connected users.
- ✅  Your chat server should be horizontally scalable.

* complexity/difficulty faced while developing this app - 
Using SocketCluster a highly scalable pub/sub and RPC framework for the first time was little bit challenging. But the documention & client/server library is really handy while consuming.

```
- Functionality
1. Client invoke an RPC call to login to the server where a procedure can authenticate the client.
2. Server provide the auth token for subsequent RPC call & list of channels accessible to the connected client.
3. Client can only subscribe to the channels set inside the AuthToken method while listening to the authenticate event.
  - A middleware function listening to SUBSCRIBE action of Client.
  - If a client tries to subscribe the channel which is not authorized then, the middleware function prevents the access of that channel.
4. Thus, A private message publish to a particular client is garanteed to be delivered as, only he has the access to subscribe to that private channel.
  - Pub/sub channels are very cheap. You can have millions of unique channels without worrying about memory or CPU usage.
  - Thus, creating a private channel for each Client is one of the solution to share private message on the SocketCluster enviornment.
5. A Client can subscribe/publish to a global chat channel to share/receive data from every loggin user.
```
```
User Data stored inside a persisted database like MySQL
{
  "userName": "Jhon",
  "password": "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f",
  "channels": ["jhon@2106","chatroom"]
}
```
