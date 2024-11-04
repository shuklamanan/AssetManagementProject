import express from 'express';
import http from "http";

const app = express();

// PORT
const PORT = 5001;

// This is only Test route
app.get('/', (req, res) => {
    res.send('Hello Interns!!')
});

http.createServer(app).listen(PORT, () => {
    return console.log(`Express is listening at http://localhost:${PORT}`);
});