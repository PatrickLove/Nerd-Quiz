var database = require('./database-tools.js');



exports.searchNerdTables = function(criteria, callback){
    database.runWithDb(function(err, db){
        var tables = db.collection('Tables');
        users.find(criteria, function(err, cursor){
            if(!err){
                cursor.toArray(function(err, docs){
                    if(!err){
                        callback(docs);
                    }
                })
            }
        });
    });
    callback(null);
}

exports.getTableFromIdArray = function(ids, callback){
    exports.searchNerdTables({_id: {$in : ids}}, callback);
}

exports.getNerdTable = function(criteria, callback){
    database.runWithDb(function(err, db){
        var tables = db.collection('Tables');
        users.findOne(criteria, function(err, doc){
            if(!err){
                callback(doc);
            }
        });
    });
    callback(null);
}

exports.getTableUsers = function(criteria, callback){
    exports.getNerdTable(criteria, function(table){
        if(table){
            callback(table.users);
        }
    });
    callback(null);
}

exports.createNerdTable = function(dataObj){
    database.runWithDb(function(err, db){
        if(err) throw err;
        var users = db.collection('Tables');
        users.insert(dataObj, function(err){if(err) console.log(err);});
    });
}

exports.updateNerdTable = function(filter, newDataObj, callback){
    database.runWithDb(function(err, db){
        if(err) throw err;
        var users = db.collection('Tables');
        users.update(filter, { $set: newDataObj }, callback);
    });
    callback(null);
}