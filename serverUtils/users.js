var fs = require('fs'),
    userDataPath = './json/userData.json',
    userDataObj = JSON.parse(fs.readFileSync(userDataPath)),
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