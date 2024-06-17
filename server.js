const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

let users = {};  // IP adresi ve kullanıcı isimlerini saklamak için

io.on('connection', (socket) => {
    const userIp = socket.handshake.address;
    console.log(`User connected: ${userIp}`);

    // Kullanıcıya varsayılan bir isim ata
    if (!users[userIp]) {
        users[userIp] = `User_${Math.floor(Math.random() * 1000)}`;
    }

    // Kullanıcıya mevcut ismini gönder
    socket.emit('set username', users[userIp]);

    socket.on('chat message', (msg) => {
        const userName = users[userIp];
        const fullMessage = { userName: userName, message: msg };
        console.log(fullMessage);
        socket.broadcast.emit('chat message', fullMessage);
    });

    socket.on('change username', (newUsername) => {
        users[userIp] = newUsername;
        socket.emit('set username', newUsername);
        console.log(`User ${userIp} changed name to ${newUsername}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userIp}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
