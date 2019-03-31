const mongo = require("mongodb");
const config = require("./config.js");
const fs = require('fs');


function makeid(length) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


class DatabaseHandler {
    constructor(){
        this.client = mongo.MongoClient;
        this.url = "mongodb://" + config.dbLocation + ":27017/" + config.plutoDatabase;
        this.db = [];
        this.bucket = [];
    }

    setup(){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.client.connect(obj.url).then(function (db) {
                obj.db = db.db(config.plutoDatabase);
                obj.bucket = new mongo.GridFSBucket(db.db(config.plutoDatabase),{bucketName: "imageHosting"});
                resolve(obj);
            })
        });
    }

    getAuthorised(cookie){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.db.collection("cookies").findOne({cookie: cookie}, function (err, result) {
                if (err) reject(err);
                resolve(result);
            })
        });
    };

    getObj(data){
        let obj = this;
        return new Promise(function (resolve) {
            obj.db.collection("fileStorage").findOne({name: data}, function (err, result) {
                resolve(result);
            });
        })
    }

    insertData(user, data){
        let obj = this;
        return new Promise(function (resolve, reject) {
            let id = makeid(7);
            fs.createReadStream(data).pipe(obj.bucket.openUploadStream(id + ".png")).on('error', function (error) {
                reject(error);
            }).on('finish', function (error) {
                obj.db.collection("fileStorage").insertOne({
                    name: id,
                    uploader: user,
                    uploadTime: new Date().toDateString()
                }).then(function (res) {
                    resolve({
                        success: true,
                        result: id
                    })
                }).catch(function (err) {
                    resolve({
                        success: false,
                        result: err,
                    });
                })
            });
        });
    }
}

module.exports = DatabaseHandler;