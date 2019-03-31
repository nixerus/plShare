const express = require('express');
const path = require('path');
const request = require('request');
const fs = require('fs');
const fileupload = require('express-fileupload')
const db = require("./dbHandler.js");
let dbHandler;
new db().setup().then(function (newDB) {
    dbHandler = newDB;
});

const config = require("./config.js");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(fileupload({
    useTempFiles : true,
    tempFileDir : "/tmp/"
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/:id', function(req,res){
    let id = req.params.id;
    dbHandler.getObj(id).then(function (result) {
        if(!result){
            res.status(404).send("Nothing here!");
        } else {
            if(result.data) {
                console.log(id + " indexed - it is using base64!!")
                let data = new Buffer(result.data, 'base64');
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': data.length
                });
                res.end(data);
                return;
            }
            try {
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                });
                dbHandler.bucket.openDownloadStreamByName(id + ".png").pipe(res)
            } catch(error) {
                res.status(500).send("WHAT THE FUCK? If you get this, screenshot the following to Netx#9697: " + error);
            }
        }
    })
});

app.get('/info/:id', function(req, res){
    let id = req.params.id;
    dbHandler.getObj(id).then(function (result) {
        if(!result) {
            res.status(404).send("Nothing here!");
        } else {
            let info = {
                imageId: id,
                imageUploader: result.uploader,
                uploadedAt: result.uploadTime,
                type: ""
            };
            if(result.data){
                info.type = "base64";
            } else {
                info.type = "gridfs"
            }
            const jsonString = JSON.stringify(info);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Content-Length': jsonString.length
            });
            res.end(jsonString);
        }
    });
});

app.get('/', function(req,res){
    res.status(200).send("This is using Pluto! Epic!")
});

app.post('/api/upload', function(req,res){
    let file = req.files.upload;
    if(config.authenticationRequired){
        let cookie = req.get("PlutoAuth");
        if(!cookie){
            res.status(401).send("Insert funny access denied message here!");
            return;
        }
        dbHandler.getAuthorised(cookie).then(function (user) {
            if(!user){
                res.status(401).send("Insert funny access denied message here!");
                return;
            }
            let path = file.tempFilePath;
            dbHandler.insertData(user.userid,path).then(function (data) {
                if(!data.success){
                    res.status(500).send(data);
                } else {
                    res.status(200).send(data);
                }
            })
        }).catch(function (err) {
            res.status(500).send(JSON.stringify({success: false, result: "An error occured"}))
            console.error(err);
        })
    }
});

app.listen(18492, () => console.log("App now listenining!"))