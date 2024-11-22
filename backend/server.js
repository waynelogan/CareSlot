import express from "express"
import cors from 'cors'
import 'dotenv/config'
import connectDB from "./config/mongodb.js"
import connectCloudinary from "./config/cloudinary.js"
import userRouter from "./routes/userRoute.js"
import doctorRouter from "./routes/doctorRoute.js"
import adminRouter from "./routes/adminRoute.js"
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
connectCloudinary()

// middlewares
app.use(express.json())
app.use(cors())

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/admin", adminRouter)
app.use("/api/doctor", doctorRouter)

app.use('/', express.static(path.join(__dirname, 'public', 'frontend')));

// Serve static files for admin panel
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));

// For any other routes not matching above, serve the frontend's index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'frontend', 'index.html'));
});

app.get("/", (req, res) => {
  res.send("API Working")
});

app.listen(port, () => console.log(`Server started on PORT:${port}`))