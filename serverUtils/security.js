exports.randomString = function(len){
    return (Math.random()+1).toString(36).substring(2, len + 2);
}

exports.secureString = function(rawStr){
    var coeff = randInt(10, 70),
        ret = "";
    for(i = 0; i < rawStr.length; i++){
        var char = rawStr.charCodeAt(i);
        ret = ret + leadZero((char*coeff) + "", 4);
    }
    var coStr = coeff + "";
    ret = coStr.charAt(1) + ret + coStr.charAt(0);
    return ret;
}

exports.decryptString = function(encodeStr){
    if(encodeStr && (encodeStr.length - 2) % 4 == 0){
        var coStr = encodeStr.charAt(encodeStr.length-1) + encodeStr.charAt(0),
            messStr = encodeStr.substring(1, encodeStr.length-1),
            coeff = parseInt(coStr),
            ret = "";
        messStr.match(/..../g).forEach(function(multChar){
            var num = parseInt(multChar),
                char = String.fromCharCode(num/coeff);
            ret = ret + char;
        })
        return ret;
    }
    return null;
}

function randInt(min, max){
    return (Math.ceil((Math.random()*(max-min))+min));
}

function leadZero(string, length){
    while(string.length < length){
        string = '0' + string;
    }
    return string;
}