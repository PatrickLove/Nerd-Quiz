var express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    security = require('./serverUtils/security.js'),
    users = require('./serverUtils/users.js');

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
        res.render('home');
    } else {
        res.redirect('/');
    }
});

app.post('/login', function(req, res){
    var pwd = req.body.password,
        usr = req.body.username;
    if(pwd && usr && users.validateUser(usr, pwd)){
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

app.listen(3000);