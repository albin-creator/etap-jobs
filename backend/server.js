const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize } = require('./models');

const http = require('http');
const { Server } = require('socket.io');


const app = express();

app.use(cors({
    origin: [
        "https://jobs.etap.qa"
    ],
    credentials:true
}));
app.use(express.json());


// serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));


// APIs
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));


// create HTTP server
const server = http.createServer(app);


// socket server
const io = new Server(server, {
  cors: {
    origin: "https://jobs.etap.qa",
    credentials:true
  }
});


// make io available everywhere
app.set('io', io);



io.on('connection', (socket) => {

  console.log('🟢 Socket connected:', socket.id);


  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });

});



const PORT = process.env.PORT || 5000;


sequelize.sync({ alter: true })
.then(() => {

  server.listen(PORT, () => {
    console.log(`✅ Server running on :${PORT}`);
    console.log(`⚡ Socket.IO ready`);
  });

});