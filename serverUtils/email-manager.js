var nodemailer = require('nodemailer'),
    fs = require('fs'),
    emailsPath = './json/messages/emailMessages.json',
    emailServer = nodemailer.createTransport(),
    emails = JSON.parse(fs.readFileSync(emailsPath));

var constructors = {
    encodeEmail: (function(link, args){
        var append = require('./security.js').secureString(args.to);
        return link.path + '?e=' + append;
    }),
    addSender: (function(link, args) {
        return args.sender.fullName;
    })
};

exports.sendEmail = function(mailConstant, args){
    emailServer.sendMail(createMail(mailConstant, args), function(err, res) {console.log(err)});
}

function createMail(mailConstant, args){
    if(emails[mailConstant]){
        var mailOptions = new Object();
        mailOptions.from = emails.from;
        mailOptions.to = args.to;
        var email = emails[mailConstant];
        mailOptions.subject = email.subject;
        mailOptions.text = replaceLinks(email.text, emails.links, args);
        return mailOptions;
    }
    return null;
}

function replaceLinks(text, links, args){
    links.forEach(function(link){
        var search = new RegExp(link.replaces, 'g');
        if(search.test(text)){
            var url = link.path;
            if(typeof link.constructor == "string"){
                var constructor = constructors[link.constructor];
                url = constructor(link, args);
            }
            text = text.replace(search, url);
        }
    });
    return text;
}