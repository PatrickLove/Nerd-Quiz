var mongodb = require('mongodb'),
    DBpath = "mongodb://192.168.1.98:27017/NerdQuiz";

exports.runWithDb =  function(func){
    mongodb.connect(DBpath, func);
}

exports.isIdInArray = function(id, array){
    for(var i = 0; i < array.length; i++){
        if(array[i].equals(id)){
            return true;
        }
    }
    return false;
}