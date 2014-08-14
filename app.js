var express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    emailMan = require('./serverUtils/email-manager.js'),
    security = require('./serverUtils/security.js'),
    users = require('./serverUtils/users.js'),
    messages = JSON.parse(fs.readFileSync('./json/messages/messages.json'));

function logError(err){
    console.log(err);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: security.randomString(7),
    cookie: { maxAge: 3600000 }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    var loginState = req.session.loginState;
    var context = {error: ((loginState && loginState == -1) ? "Invalid Username or Password" : "")};
    req.session.loginState = (loginState == -1) ? 0 : loginState;
    if(loginState == 1){
        res.redirect('/home');
    } else {
        res.render('index', context);
    }
});

app.get('/home', function(req, res){
    if(req.session.loginState == 1){
        res.render('home', req.session.userData);
    } else {
        res.redirect('/');
    }
});

app.post('/login', function(req, res){
    var pwd = req.body.password,
        usr = req.body.username;
    if(pwd && usr){
        users.validateUser(usr, pwd, function(dbres){
            if(dbres){
                users.getUserData(usr, function(data){
                    req.session.userData = data;
                    req.session.loginState = 1;
                    res.redirect('/home');
                });
            } else {
                req.session.loginState = -1;
                res.redirect('/');
            }
        });
    }
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/nerdQuiz', function(req, res){
    var email = security.decryptString(req.query.e);
    if(email){
        users.checkEmail(email, function(emailCode){
            if(emailCode == 1){
                res.render('message', messages.CANNOT_TAKE_QUIZ_EMAIL_FAILED)
            } else if(emailCode == 2){
                res.render('message', messages.CANNOT_TAKE_QUIZ_EMAIL_EXISTS);
            }else {
                req.session.regenerate(function(){
                    req.session.userData = new Object();
                    req.session.userData.email = email;
                    req.query = null;
                    res.render('nerd-quiz', JSON.parse(fs.readFileSync('./json/quizzes/quiz1.json')));
                });
            }
        });
    }
    else{
        res.render('message', messages.CANNOT_TAKE_QUIZ_NO_EMAIL)
    }
});

app.post('/nerdQuiz/grade', function(req, res){
    var passed = false,
        resultsByQ = [],
        percentage = 0;
    if(req.body.usrAnswers){
        var correct = req.body.rightAnswers,
            usr = req.body.usrAnswers,
            count = 0;
        correct.forEach(function(answer, index){
            if(answer == usr[index]){
                count++;
                resultsByQ[index] = true;
            } else {
                resultsByQ[index] = false;
            }
        });
        percentage = count/correct.length;
        passed = percentage >= 0.85;
    }
    if(!req.session.userData){
        req.session.userData = {};
    }
    req.session.userData.quizResults = {
        pass: passed,
        percent: Math.floor(percentage*100),
        resultsPerQuestion: resultsByQ
    };
    res.redirect('/nerdQuiz/results');
});

app.get('/nerdQuiz/results', function(req, res){
    if(req.session.userData.quizResults){
        var results = req.session.userData.quizResults;
        if(!results.pass){
            users.blockEmail(req.session.userData.email);
        }
        res.render('results', results);
    }
    else{
        res.render('message', messages.NO_RESULTS);
    }
});

app.get('/account/create', function(req, res){
    if(req.session.loginState == 1){
        res.render('message', messages.ALREADY_LOGGED_IN);
    } else if(req.session.userData && req.session.userData.email){
        var userData = req.session.userData;
        if(userData.quizResults){
            if(userData.quizResults.pass){
                res.render('createAccount', {usrTaken: false});
            }
            else{
                res.render('message', messages.NO_ACCOUNT_QUIZ_FAILED);
            }
        }
        else{
            res.redirect('/');
        }
    }
    else{
        res.render('message', messages.NO_ACCOUNT_TAKE_QUIZ);
    }
});

app.post('/account/create', function(req, res){
    if(req.session.loginState != 1 && req.session.userData){
        var formData = req.body,
            userData = req.session.userData;
        users.checkUserName(formData.username, function(dbres){
            if(!dbres){
                userData.password = formData.password;
                userData.firstName = formData.firstName;
                userData.lastName = formData.lastName;
                userData.username = formData.username;
                users.setUserData(userData);
                req.session.destroy();
                res.render('message', messages.ACCOUNT_CREATED);
            }
            else{
                res.render('createAccount', {usrTaken: true});
            }
        });
    }
    else{
        res.render('message', messages.ACCOUNT_CREATE_FAILED);
    }
});

app.get('/account/setup', function(req, res){
    if(req.session.loginState == 1){
        res.redirect('/');
    }
    else {
        res.render('setupAccount');
    }
});

app.post('/email', function(req, res){
    var userData = req.session.userData,
        formData = req.body;
    if(formData){
        var to = formData.email,
            type = formData.mailType,
            args = {to: to};
        if(userData){
            args.sender = userData;
        }
        emailMan.sendEmail(type, args);
        res.render('message', messages[type]);
    }
    else{
        res.redirect('/');
    }
});

app.get('/newPassword', function(req, res){
    res.render("passwordReset");
});

app.get('/account/resetPassword', function(req, res){
    var email = security.decryptString(req.query.e);
    if(email){
        users.checkEmail(email, function(emailCode){
            if(emailCode == 2){
                req.session.regenerate(function(){
                    req.session.userData = new Object();
                    req.session.userData.email = email;
                    req.query = null;
                    res.render('changePassword');
                });
            }else {
            }
        });
    }
    else{
        res.render('message', messages.CANNOT_RESET_PASSWORD_NO_EMAIL)
    }
});

app.post('/account/resetPassword', function(req, res){
    if(req.session.loginState != 1 && req.session.userData){
        var formData = req.body,
            userData = req.session.userData;
        users.updateUserData({email: userData.email}, {password: formData.password}, function(err, dbres){
            if(!err && dbres >= 1){
                req.session.destroy();
                res.render('message', messages.PASSWORD_CHANGED);
            }
            else{
                res.render('message', messages.PASSWORD_CHANGE_FAILED_NOT_ACCOUNT);
            }
        });
    }
    else{
        res.render('message', messages.PASSWORD_CHANGE_FAILED);
    }
});

app.listen(3000);