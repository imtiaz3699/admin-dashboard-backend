import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/db/db.js';
import routes from './src/routes/index.js'
dotenv.config();

const app = express();

app.use(express.json());
(async () => {
    await connectDB()
})();

app.get("/", (req, res) => {
    res.send("Admin dashboard.");
});

const PORT = process.env.PORT || 3000;
app.use('/',routes)
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});