var mongodb = require('mongodb'),
    DBpath = "mongodb://192.168.1.98:27017/NerdQuiz";

var dbVar;
var connecting = false;

exports.runWithDb =  function(func){
    if(!dbVar){
        if(!connecting){
            connecting = true;
            mongodb.connect(DBpath, function(err, db){
                if(err || !db){
                    connecting = false;
                } else {
                    dbVar = db;
                    func(dbVar);
                }
            });
        }
        else{
            while(connecting){
            }
            exports.runWithDb(func);
        }
    } else {
        func(dbVar);
    }
}

exports.isIdInArray = function(id, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].equals(id)){
            return true;
        }
    }
    return false;
}