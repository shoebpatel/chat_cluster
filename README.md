# chat_cluster

![alt text](https://github.com/shoebpatel/chat_cluster/blob/main/design_flow.png)


- ✅  Should be able to send private messages to another user
- ✅  Should be able to broadcast any message to all connected users.
- ✅  Your chat server should be horizontally scalable.

* complexity/difficulty faced while developing this app - 
Using SocketCluster a highly scalable pub/sub and RPC framework for the first time was little bit challenging. But the documention & client/server library is really handy while consuming.

- ```Functionality
1. Client invoke an RPC call to login to the server where a procedure can authenticate the client.
2. Server provide the auth token for subsequent RPC call & list of channels accessible to the connected client.
3. Client can only subscribe to the channels set inside the AuthToken method while listening to the authenticate event.
4. Thus, A private message publish to a particular client is garanteed to be delivered as, only he has the access to subscribe to that private channel.
  - Pub/sub channels are very cheap. You can have millions of unique channels without worrying about memory or CPU usage.
  - Thus, creating a private channel for each Client is one of the solution to share private message on the SocketCluster enviornment.

