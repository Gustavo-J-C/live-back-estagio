const express = require('express');
const router = express.Router();
const app = express();
const http = require("http");
const cors = require("cors");
const {Server} = require('socket.io');

const PORT = process.env.PORT || 80
const server =  http.createServer(app);
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: ["https://video-room-front.vercel.app", "http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});

let rooms = [];

io.on("connection", (socket) => {

    socket.emit("request_rooms", rooms);
    console.log(`User Connected: ${socket.id}`);

    socket.on("set_video", (data) => {
        console.log("set video: ",data)
        socket.to(data.room).emit("recieve_video", data.newLink)
    })

    socket.on("leave-room", (data) => {
        console.log("função leave acionada: ",data);
        let clients = io.sockets.adapter.rooms.get(data);
        socket.leave(data);
        if (clients.size === 0) {
            rooms = rooms.slice(rooms.indexOf(data) + 1)
            socket.emit("request_rooms", rooms);
        }
    })

    socket.on("join_room", (data) => {
        socket.join(data)
    })

    socket.on("create_room", (data) => {
        if (!rooms.includes(data)) {
            rooms.push(data);
            socket.emit("request_rooms", rooms) 
        } else {
            socket.emit("room_exists", "sala já existe")
            console.log("sala já existe");
        }
    })

    socket.on("send_message", (data) => {
        console.log(data);
        socket.to(data.room).emit("recieve_message", data)
    })

    socket.on("disconnect", () => {
        console.log("User Disconnects", socket.id)
    })
}) 


server.listen(PORT, () => {
    console.log('server runing')
})