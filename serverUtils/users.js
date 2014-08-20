var database = require('./database-tools.js'),
    helperFunctions = {
        fullName: function(usrData) {
            if(hasData(usrData, 'firstName', 'lastName')){
                return usrData.firstName + ' ' + usrData.lastName;
            }
            return "User";
        }
    };

exports.validateUser = function(usr, pwd, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.findOne({username: usr, password: pwd}, function(err, res){
                callback(res);
            });
        }
    });
}

exports.getUserData = function(filter, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.findOne(filter, function(err, res){
                var storedData = res;
                if(storedData){
                    for(name in helperFunctions){
                        storedData[name] = helperFunctions[name](storedData);
                    }
                    callback(storedData);
                }
                else{
                    callback(null);
                }
            });
        }
    });
}

exports.getUserTables = function(filter, callback){
    exports.getUserData(filter, function(userData){
        if(userData){
            callback(userData.nerdTables);
        }
        else{
            callback(null);
        }
    });
}

exports.addUserData = function(dataObj){
    database.runWithDb(function(db){
        if(db){
            var users = db.collection('UserData');
            users.insert(dataObj, function(){if(err) console.log(err);});
        }
    });
}

exports.getUsersFromIdArray = function(ids, callback){
    exports.searchUsers({_id: {$in : ids}}, callback);
}

exports.searchUsers = function(criteria, callback){
    database.runWithDb(function(db){
        if(!db){
            callback(null);
        } else {
            var users = db.collection('UserData');
            users.find(criteria, function(err, cursor){
                if(!err){
                    cursor.toArray(function(err, docs){
                        if(!err){
                            callback(docs);
                        }
                    })
                }
            });
        }
    });
}

exports.updateUserData = function(filter, newDataObj, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.update(filter, { $set: newDataObj }, callback);
        }
    });
}

exports.pushUserData = function(filter, newDataObj, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.update(filter, { $push: newDataObj }, callback);
        }
    });
}

exports.pullUserData = function(filter, dataObj, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.update(filter, { $pull: dataObj }, callback);
        }
    });
}

exports.checkUserName = function(usr, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.findOne({username: usr}, function(err, res){
                callback(res);
            });
        }
    });
}

exports.checkEmail = function(email, callback){
    database.runWithDb(function(db){
		if(!db){
			callback(null);
		} else {
            var users = db.collection('UserData');
            users.findOne({email: email}, function(err, res){
                if(res){
                    callback(2);
                }
                else{
                    var blacklist = db.collection('EmailBlacklist');
                    blacklist.findOne({email: email}, function(err, res){
                        if(res){
                            callback(1);
                        }
                        else{
                            callback(0);
                        }
                    })
                }
            });
        }
    });
}

exports.blockEmail = function(email){
    database.runWithDb(function(db){
		if(!db){
            var blacklist = db.collection('EmailBlacklist');
            blacklist.insert({email: email}, function(err){if(err) console.log(err);});
        }
    });
}

function hasData(usrData){
    var dataNames = Array.prototype.slice.call(arguments, 1),
        ret = true;
    dataNames.forEach(function(data){
        if(!usrData[data]){
            ret = false;
        }
    });
    return ret;
}