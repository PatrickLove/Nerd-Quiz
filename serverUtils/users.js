var fs = require('fs'),
    userDataPath = './json/userData.json',
    emailBlacklistPath = './json/emailBlacklist.json',
    userDataObj = JSON.parse(fs.readFileSync(userDataPath)),
    emailBlacklist = JSON.parse(fs.readFileSync(emailBlacklistPath)),
    helperFunctions = {
        fullName: function(usrData) {
            if(hasData(usrData, 'firstName', 'lastName')){
                return usrData.firstName + ' ' + usrData.lastName;
            }
            return "User";
        }
    };

exports.validateUser = function(usr, pwd){
    if(userDataObj[usr]){
        return userDataObj[usr].password == pwd;
    }
    return false;
}

exports.getUserData = function(usr){
    var storedData =  userDataObj[usr];
    storedData.username = usr;
    for(name in helperFunctions){
        storedData[name] = helperFunctions[name](storedData);
    }
    return storedData;
}

exports.setUserData = function(usr, dataObj){
    if(!userDataObj[usr]){
        userDataObj[usr] = new Object();
    }
    for(index in dataObj){
        if(index != 'username'){
            userDataObj[usr][index] = dataObj[index];
        }
    }
    saveUserData()
}

exports.checkUserName = function(usr){
    return userDataObj[usr];
}

exports.checkEmail = function(email){
    return !emailBlacklist[email];
}

exports.isEmailUsed = function(email){
    for(index in userDataObj){
        if(userDataObj[index].email == email){
            return true;
        }
    }
    return checkEmail(email);
}

exports.blockEmail = function(email){
    emailBlacklist[email] = true;
    saveEmailBList();
}

function saveEmailBList(){
    fs.writeFile(emailBlacklistPath, JSON.stringify(emailBlacklist));
}

function saveUserData(){
    fs.writeFile(userDataPath, JSON.stringify(userDataObj));
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