import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/authRoutes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json()); 
app.use(cookieParser());

// app.use(cors()); //=> all

const corsOptions = {
  origin: [
    'http://localhost:5173', 
  ],
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
  allowedHeaders: ['Content-Type', 'Authorization'], 
};
app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); 

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});


connectDB();

app.use('/api/auth', userRoutes);


app.get("/", (req, res) => {
  console.log("Home");
  res.status(200).json({ message: "Welcome to the Chat App API!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);