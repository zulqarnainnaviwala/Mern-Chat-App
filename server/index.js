const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const http = require("http");
const userRoute = require("./routes/userRoute");
const chatRoute = require("./routes/chatRoute");
const messageRoute = require("./routes/messageRoute");
const { setupSocket } = require("./socket");

dotenv.config();
const app = express();
const server = http.createServer(app);

//Middlewares
//allow use to sent & receive JSON data
app.use(express.json());
// help us to communicate with the frontend
app.use(cors());
app.use((request, response, next) => {
  console.log(request.path, request.method);
  next();
});

// Define the root path '/'
app.get('/', (req, res) => {
  res.send('Welcome to the Server !!');
});

//user routes
app.use("/api/users", userRoute);
//chat routes
app.use("/api/chats", chatRoute);
//message routes
app.use("/api/messages", messageRoute);

const port = process.env.PORT || 5000;
const uri = process.env.DB_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((error) => console.log(error));

// Setup Socket.io
setupSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
