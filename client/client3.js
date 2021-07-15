let socket = socketClusterClient.create({
    hostname: 'localhost',
    port: 5003,
    autoReconnect: true,
});



(async () => {
    try {
        let result = await Promise.all([
            socket.invoke('login', {
                userName: 'Kim',
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
    let myChannel = socket.subscribe('kim@1984');
    await myChannel.listener('subscribe').once();
    for await (let data of myChannel) {
        console.log('Hey, Kim you got a new message', data);
    }
})();

(async () => {
    let myChannel = socket.subscribe('chatroom');
    await myChannel.listener('subscribe').once();
    for await (let data of myChannel) {
        console.log('New message from chatroom : ', data);
    }
})();



socket.transmitPublish('jhon@2106', {from: 'Kim', msg: 'Hello Jhon'});

socket.transmitPublish('adam@1995', {from: 'Kim', msg: 'Hello Adam'});

socket.transmitPublish('chatroom', 'Hey, everyone');
