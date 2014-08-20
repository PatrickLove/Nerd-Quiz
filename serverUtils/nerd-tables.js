var database = require('./database-tools.js'),
    userUtils = require('./users.js');



exports.searchNerdTables = function(criteria, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var tables = db.collection('Tables');
            tables.find(criteria, function(err, cursor){
                if(!err){
                    cursor.sort({name: 1});
                    cursor.toArray(function(err, docs){
                        if(!err){
                            callback(docs);
                        }
                    })
                }
                else{
                    callback(null);
                }
            });
        }
    });
}

exports.getTableFromIdArray = function(ids, callback){
    exports.searchNerdTables({_id: {$in : ids}}, callback);
}

exports.getNerdTable = function(criteria, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var tables = db.collection('Tables');
            tables.findOne(criteria, function(err, doc){
                if(!err && doc){
                    callback(doc);
                }
                else{
                    callback(null);
                }
            });
        }
    });
}

exports.getTableUsers = function(criteria, callback){
    exports.getNerdTable(criteria, function(table){
        if(table){
            callback(table.members);
        }
        else{
            callback(null);
        }
    });
}

exports.createNerdTable = function(dataObj, callback){
    database.runWithDb(function(db){
		if(!db){
		    callback(null);
        } else {
            var tables = db.collection('Tables');
            tables.insert(dataObj, function(err, doc){
                if(doc){
                    console.log(doc[0]);
                    callback(doc[0]._id);
                }
                else{
                    callback(null);
                }
            });
        }
    });
}

exports.checkTableName = function(name, callback){
    database.runWithDb(function(db){
        if(!db){
            callback(null);
        }
        else{
            var tables = db.collection('Tables');
            tables.findOne({name: name}, function(err, result){
                callback(result);
            })
        }
    })
}

exports.updateNerdTable = function(filter, newDataObj, callback){
    database.runWithDb(function(db){
		if(!db){
		    callback(null);
		} else {
            var tables = db.collection('Tables');
            tables.update(filter, { $set: newDataObj }, callback);
        }
    });
}

exports.pushToNerdTable = function(filter, newDataObj, callback){
    database.runWithDb(function(db){
		if(!db){
            callback(null)
		} else {
            var tables = db.collection('Tables');
            tables.update(filter, { $push: newDataObj }, callback);
        }
    });
}

exports.pullFromNerdTable = function(filter, dataObj, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null)
		} else {
            var tables = db.collection('Tables');
            tables.update(filter, { $pull: dataObj }, callback);
        }
    });
}

exports.addUsersToTable = function(userFilter, tableFilter, callback){
    userUtils.searchUsers(userFilter, function(users){
        if(users && users.length > 0){
            exports.searchNerdTables(tableFilter, function(nerdTables){
                if(nerdTables && nerdTables.length > 0){
                    var alreadyExists = 0;
                    nerdTables.forEach(function(table){
                        users.forEach(function(user){
                            if(!table.members || !database.isIdInArray(user._id, table.members)){
                                exports.pushToNerdTable({_id : table._id}, {members : user._id}, logError);
                            }
                            else{
                                alreadyExists++;
                            }
                            if(!user.nerdTables || !database.isIdInArray(table._id, user.nerdTables)){
                                userUtils.pushUserData({_id : user._id}, {nerdTables : table._id}, logError);
                            }
                            else{
                                alreadyExists++;
                            }
                        });
                    });
                    callback(0, alreadyExists/2);
                }
                else{
                    callback(1);
                }
            });
        }
        else{
            callback(2)
        }
    });
}

exports.removeUsersFromTable = function(userFilter, tableFilter, callback){
   userUtils.searchUsers(userFilter, function(users){
       if(users && users.length > 0){
           exports.searchNerdTables(tableFilter, function(nerdTables){
               if(nerdTables && nerdTables.length > 0){
                   nerdTables.forEach(function(table){
                       users.forEach(function(user){
                           exports.pullFromNerdTable({_id : table._id}, {members : user._id}, logError);
                           userUtils.pullUserData({_id : user._id}, {nerdTables : table._id}, logError);
                       });
                   });
                   callback(0);
               }
               else{
                   callback(1);
               }
           });
       }
       else{
           callback(2)
       }
   });
}

function logError(err){
    if(err){
        console.log(err);
    }
}