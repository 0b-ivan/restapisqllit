// Create express app
const express = require("express");
const app = express();

// Server arguments
const HTTP_PORT = 8000;
const PROTOCOL = 'http' ;
const IP = require('ip');

// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on %PROTOCOL%://%IP%:%PORT%"
        .replace("%PROTOCOL%",PROTOCOL)
        .replace("%PORT%",HTTP_PORT)
        .replace("%IP%",IP.address()
        )
    )
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints

// Default response for any other request
app.use((req, res)=>{
    res.status(404);
});
