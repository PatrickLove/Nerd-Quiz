var express = require('express'),
    app = express(),
    path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res){
    res.redirect('/index.html');
});

app.listen(3000);