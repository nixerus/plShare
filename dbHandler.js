const mongo = require("mongodb");
const config = require("./config.js");

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
    }

    setup(){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.client.connect(obj.url).then(function (db) {
                obj.db = db.db(config.plutoDatabase);
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
           obj.db.collection("fileStorage").insertOne({
                name: id,
                data: data,
                uploader: user
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
                return;
            })
        })
    }
}

module.exports = DatabaseHandler;