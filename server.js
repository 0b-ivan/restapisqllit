// Create express app

const express = require("express");
const app = express();
const md5 = require("md5");
const db = require("./database.js")


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
//list of entities
app.get("/api/users", (req, res, next) => {
    //refactor to a const list
    const sql = "select * from user";
    let params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
    });
});
//entitle by id
app.get("/api/user/:id", (req, res, next) => {
    //refactor to a const list
    const sql = "select * from user where id = ?";
    let params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message":"success",
            "data":row
        })
    });
});

//POST
app.post("/api/user/", (req, res, next) => {

    getErrors(req,res)
    let data = extracted(req)
    const sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    let params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})
//UPDATE
app.patch("/api/user/:id", (req, res, next) => {

    let data = extracted(req);
    db.run(
        `UPDATE user set 
           name = COALESCE(?,name), 
           email = COALESCE(?,email), 
           password = COALESCE(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data,
                changes: this.changes
            })
        });
})

// Default response for any other request
app.use((req, res)=>{
    res.status(404);
});

//refactor area:
function extracted(req) {
    return {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password ? md5(req.body.password) : null
    };
}
function getErrors(req,res) {
    let errors = []

    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return [];
    }
}
