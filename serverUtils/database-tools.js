var mongodb = require('mongodb'),
    DBpath = "mongodb://192.168.1.98:27017/NerdQuiz";

exports.runWithDb =  function(func){
    mongodb.connect(DBpath, func);
}