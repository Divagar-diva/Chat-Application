import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import formatMessage from './utils/messages.js';
import { getCurrentuser, userjoin ,getroomuser , userleave} from './utils/users.js';
import formatmessage from './utils/messages.js';


dotenv.config();

// Create express app and HTTP server
const app = express();
const httpserver = http.createServer(app);
const io = new Server(httpserver);

// Set port from environment or default to 3000
const PORT = process.env.PORT || 3000;

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const botname = 'Zara';

// WebSocket connection handler
io.on('connection', (socket) => {
    socket.on('joinroom', ({ username, room }) => {
        const user = userjoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome message to the user
        socket.emit('message', formatMessage(botname, 'Welcome to the chat!'));

        // Broadcast to everyone else in the room
        socket.broadcast
            .to(user.room)
            .emit('message', formatMessage(botname, `${user.username} has joined the chat.`));

        //send users room info
        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getroomuser(user.room)
        })
          

        // Listen for chat messages
        socket.on('chatMessage', (msg) => {
            const currentUser = getCurrentuser(socket.id);
            if (currentUser) {
                io.to(currentUser.room).emit('message', formatMessage(currentUser.username, msg));
            }
        });

        // Handle user disconnect
        socket.on('disconnect', () => {
            const user = userleave(socket.id);
            //console.log(`${user.username} has left the chat`)
            io.to(user.room).emit('message',
                formatmessage(botname,`${user.username} left the chat`));
            
    })
    });
});

httpserver.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
