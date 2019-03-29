const mongo = require("mongodb");
const config = require("./config.js");

function makeid(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


class DatabaseHandler {
    constructor(){
        this.client = mongo.MongoClient;
        this.url = "mongodb://" + config.dbLocation + ":27017/" + config.plutoDatabase;
    }

    getAuthorised(cookie){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.client.connect(obj.url).then(function (db, err) {
                if(err){
                    reject(err);
                    return;
                }

                db.db(config.plutoDatabase).collection("cookie").findOne({cookie: cookie},function (err, result) {
                    if(err) reject(err);
                    resolve(result);
                    db.close();
                })
            })
        });
    };

    getObj(data){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.client.connect(obj.url).then(function (db, err) {
                db.db(config.plutoDatabase).collection("fileStorage").findOne({name: data}, function (err, result) {
                    resolve(result);
                });
            });
        })
    }

    insertData(user, data){
        let obj = this;
        return new Promise(function (resolve, reject) {
            obj.client.connect(obj.url).then(function (db,err) {
                if(err) reject(err);
                let id =  makeid(7);
                db.db("pluto").collection("fileStorage").insertOne({
                    name: id,
                    data: data,
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
        })
    }
}

module.exports = DatabaseHandler;