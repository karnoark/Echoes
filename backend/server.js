import express from "express"
import connectDB from "./db/connectDB.js"
import userRoutes from "./routes/userRoutes.js"
import messageRoutes from "./routes/messageRoutes.js"

import dotenv from "dotenv"
import cookieParser from "cookie-parser"
dotenv.config()

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

import {app, server} from "./socket/socket.js"
// const app = express();

connectDB()

const PORT = process.env.PORT || 5000


// middleware
app.use(express.json()) // to parse the JSON data in request body
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

// routes
app.use("/api/users", userRoutes)
app.use("/api/messages", messageRoutes)

// start the server
server.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})
// app.listen(PORT, () => {
//     console.log(`server is running on port ${PORT}`)
// })


