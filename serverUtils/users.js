var mongodb = require('mongodb'),
    DBpath = "mongodb://192.168.1.47:27017/NerdQuiz",
    helperFunctions = {
        fullName: function(usrData) {
            if(hasData(usrData, 'firstName', 'lastName')){
                return usrData.firstName + ' ' + usrData.lastName;
            }
            return "User";
        }
    };

exports.validateUser = function(usr, pwd, callback){
    runWithDb(function(err, db){
        var users = db.collection('UserData');
        users.findOne({username: usr, password: pwd}, function(err, res){
            callback(res);
        });
    });
}

exports.getUserData = function(usr, callback){
    runWithDb(function(err, db){
        var users = db.collection('UserData');
        users.findOne({username: usr}, function(err, res){
            var storedData = res;
            if(storedData){
                storedData.username = usr;
                for(name in helperFunctions){
                    storedData[name] = helperFunctions[name](storedData);
                }
                callback(storedData);
            }
            else{
                callback(null);
            }
        });
    });
}

exports.setUserData = function(dataObj){
    runWithDb(function(err, db){
        if(err) throw err;
        var users = db.collection('UserData');
        users.insert(dataObj, function(err){if(err) console.log(err);});
    });
}

exports.checkUserName = function(usr, callback){
    runWithDb(function(err, db){
        var users = db.collection('UserData');
        users.findOne({username: usr}, function(err, res){
            callback(res);
        });
    });
}

exports.checkEmail = function(email, callback){
    runWithDb(function(err, db){
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
    });
}

exports.blockEmail = function(email){
    runWithDb(function(err, db){
        if(err) throw err;
        var blacklist = db.collection('EmailBlacklist');
        blacklist.insert({email: email}, function(err){if(err) console.log(err);});
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

function runWithDb(code){
    mongodb.connect(DBpath, code);
}