// import express from "express";
// import { createServer } from "http";
// import { Server } from "socket.io";
// import authRoutes from './routes/auth.js';
// import { log } from "console";

// const app = express();

// // Set up middleware, routes, etc., as needed for your Express app
// app.use(express.json());


// app.use('/api/auth', authRoutes);



// // Create HTTP server and bind it to the Express app
// const httpServer = createServer(app);

// // Set up Socket.IO server
// const io = new Server(httpServer, {
//   path: "/my-custom-path/",
//   cors: {
//     origin: "http://localhost:3000", // Use the root URL of your frontend
//     methods: ["GET", "POST"],
//     // allowedHeaders: ["my-custom-header"],
//     // credentials: true
//   }
// });

// // Handle Socket.IO connections
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);

//   socket.on("AD",(msg)=>{
//     console.log(msg);
    
//   })
//   // Handle events here
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });


// // Start the HTTP server on a specified port
// const PORT = 8000;
// httpServer.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });



import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from './routes/auth.js';

const app = express();

// Enable CORS for your Express app
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["GET", "POST"],
  credentials: true, // Optional, if you need to send cookies/auth headers
}));

app.use(express.json());
app.use('/api/auth', authRoutes);

// Create HTTP server and bind it to the Express app
const httpServer = createServer(app);

// Set up Socket.IO server
const io = new Server(httpServer, {
  path: "/my-custom-path/",
  cors: {
    origin: "http://localhost:3000", // Allow Socket.IO connections from this origin
    methods: ["GET", "POST"],
    credentials: true, // Optional, if you need to send cookies/auth headers
  }
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("AD", (msg) => {
    console.log(msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start the HTTP server on a specified port
const PORT = 8000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
