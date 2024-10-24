const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const users = {};

app.use(express.static(path.join(__dirname, 'script')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'img', 'ase')));
app.use(express.static(path.join(__dirname, 'assets', 'images')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    users[socket.id] = { x: 100, y: 100 };

    socket.emit('updateUsers', users);

    socket.broadcast.emit('updateUsers', users);

    socket.on('userMovement', (position) => {
        users[socket.id] = position;
        io.emit('updateUsers', users);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete users[socket.id];
        io.emit('updateUsers', users);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at PORT : ${PORT}`);
});
