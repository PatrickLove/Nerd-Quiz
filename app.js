var express = require('express'),
    app = express(),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    security = require('./serverUtils/security.js'),
    users = require('./serverUtils/users.js'),
    messages = JSON.parse(fs.readFileSync('./json/messages/messages.json'));

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
    if(pwd && usr && users.validateUser(usr, pwd)){
        req.session.userData = users.getUserData(usr);
        req.session.loginState = 1;
        res.redirect('/home');
    } else {
        req.session.loginState = -1;
        res.redirect('/');
    }
});

app.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

app.get('/nerdQuiz', function(req, res){
//    var email = security.decryptString(res.query.e);
//    if(email){
//
//    }
    if(!req.session.userData){
        req.session.userData = new Object();
    }
    req.session.userData.email = "hello";
    res.render('nerd-quiz', JSON.parse(fs.readFileSync('./json/quizzes/quiz1.json')));
});

app.post('/nerdQuiz/grade', function(req, res){
    var passed = false,
        resultsByQ = [];
    if(req.body.usrAnswers){
        var correct = req.body.rightAnswers,
            usr = req.body.usrAnswers,
            count = 0;
        usr.forEach(function(answer, index){
            if(answer == correct[index]){
                count++;
                resultsByQ[index] = true;
            } else {
                resultsByQ[index] = false;
            }
        });
        var percentage = count/correct.length;
        passed = percentage >= 0.85;
    }
    if(!req.session.userData){
        req.session.userData = new Object();
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
    if(req.session.userData){
        var formData = req.body,
            userData = req.session.userData;
        if(!users.checkUserName(formData.username)){
        userData.password = formData.password;
        userData.firstName = formData.firstName;
        userData.lastName = formData.lastName;
        users.setUserData(formData.username, userData);
        req.session.destroy();
        res.render('message', messages.ACCOUNT_CREATED);
        }
        else{
            res.render('createAccount', {usrTaken: true});
        }
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

app.post('/account/setup', function(req, res){

});

app.listen(3000);