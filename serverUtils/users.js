exports.validateUser = function(usr, pwd){
    return usr === "walrus" && pwd == "walrus";
}

exports.getUserData = function(usr){
    return { fullName: "Mr. Walrus" };
}