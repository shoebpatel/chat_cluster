let socket = socketClusterClient.create({
    hostname: 'localhost',
    port: 5001,
    autoReconnect: true,
});



(async () => {
    try {
        let result = await Promise.all([
            socket.invoke('login', {
                userName: 'Jhon',
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
    let myChannel = socket.subscribe('jhon@2106');
    await myChannel.listener('subscribe').once();
    for await (let data of myChannel) {
        console.log('Hey, Jhon you got a new message', data);
    }
})();

(async () => {
    let myChannel = socket.subscribe('chatroom');
    await myChannel.listener('subscribe').once();
    for await (let data of myChannel) {
        console.log('New message from chatroom : ', data);
    }
})();


socket.transmitPublish('adam@1995', { from: 'Jhon', msg: 'Hello Adam' });

socket.transmitPublish('kim@1984', { from: 'Jhon', msg: 'Hello Kim' });

socket.transmitPublish('chatroom', 'Hey, everyone');