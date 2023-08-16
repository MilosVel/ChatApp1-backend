const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");
require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started`)
);

const io = socket(server, {
  cors: {
    origin: process.env.ORIGIN,
    credentials: true,
  },
});
let counter = 0
global.onlineUsers = new Map();
global.onlineUsers = new Map([['ime', { ime: 'Milos' }]]);


io.on("connection", (socket) => {

  socket.on("add-user", (userId) => {

    counter++
    console.log('Izvrsenje na bekendu -> dodavanje usera ----------------',counter)
    onlineUsers.set(userId, socket.id);
 
    console.log('Online useri 1 su: ',onlineUsers)
    console.log('Online useri 1 global su: ',global.onlineUsers)
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to); // Ovim se iz onLineUsers objekat uzimza BAS onaj user kome ce se slati podatke pomocu data.to i tom useru se emituje data.msg
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", { msg: data.msg, from: data.from });
    }
  });
});

