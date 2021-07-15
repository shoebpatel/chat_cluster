let socket = socketClusterClient.create({
    hostname: 'localhost',
    port: 5002,
    autoReconnect: true,
});



(async () => {
    try {
        let result = await Promise.all([
            socket.invoke('login', {
                userName: 'Adam',
                password: '12345678'
            }),
            socket.listener('authenticate').once()
        ]);
        console.log('result: ', result);
    } catch (error) {
        console.log('error: ', error);
        return;
    }
})();



(async () => {
    let myChannel = socket.subscribe('adam@1995');
    await myChannel.listener('subscribe').once();
    for await (let data of myChannel) {
        console.log('Hey, Adam you got a new message', data);
    }
})();

(async () => {
    let myChannel = socket.subscribe('chatroom');
    await myChannel.listener('subscribe').once();
    for await (let data of myChannel) {
        console.log('New message from chatroom : ', data);
    }
})();



socket.transmitPublish('jhon@2106', {from: 'Adam', msg: 'Hello Jhon'});

socket.transmitPublish('kim@1984', {from: 'Adam', msg: 'Hello Kim'});

socket.transmitPublish('chatroom', 'Hey, everyone');
