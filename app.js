const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const User = require('./models/users');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const cookeParser =  require('cookie-parser');
const Note = require('./models/notes');

const connect = mongoose.connect('mongodb://localhost:27017/missioncomplete', {useNewUrlParser: true});

// handle bars middleware
app.engine('handlebars', exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static("public"));

// app.use(cookeParser());
app.use(session({ secret: 'krunal', resave: false, saveUninitialized: true, }));

// page d'accueil
app.get('/', (req, res) => res.render('index', {
    title: 'Accueil'
}));
// page de connexion
app.get('/login', (req, res) => {
    if(req.session.email) {
        res.redirect("/home");
        return;
    }
    res.render('login', {
        title: 'Connexion'
    });
});
// page d'inscription
app.get('/register', (req, res) => {
    if(req.session.email) {
        res.redirect('/home');
    } else {
        res.render('register', {
            title: 'Inscription'
        })
    }
});
// page home
app.get('/home', (req, res) => {

    console.log(req.query.search);
    if(req.session.email) {
        Note.find({}, (err, notes) => {
            console.log(notes);
            let currentUser;
            
            res.render('home', {
                title: 'Principal',
                cards: notes
                // ,
                // cu: currentUser
            });
            console.log(currentUser)
        });
    } else {
        res.redirect("/login");
    }
    
});
// page users 
app.get('/users', (req, res) => {
    if(req.session.email) {
        User.find({}, (err, users) => {
            res.render("users", {
                users: users
            })
        })
        return
    }
    res.redirect('/login');
});
// page d'ajout d'une note
app.get('/add', (req, res) => {
    res.render("add", {title: "Ajouter une note"});
})
// page profil
app.get('/profil', (req, res) => {
    if(req.session.email) {

        User.findOne({email: req.session.email}, (err, user) => {
            if(user) {
                res.render('profil', {
                    title: 'profil',
                    user: user.email,
                    id: user.id,
                    password: user.password
                });
            }
        });

        
    } else {
        res.redirect('/login');
    }
});
// logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})
// login
app.post('/login', (req, res) => {
    // res.send(req.body);
    User.findOne({email: req.body.email, password: req.body.password}, (err, user) => {
        if(user) {
            req.session.email = req.body.email;
            // console.log(session.email);
            console.log(user);
            res.redirect("/home");
            // res.send("hellp")
        }
    });
});
// creer a new user
app.post('/register', (req, res)=> {
    let userData = new User ({
        email: req.body.email,
        password: req.body.password,
    });

    res.json(userData);

    if(req.body.password === req.body.repassword) {
        User.findOne({email: req.body.email}, (err, user) => {
            if(err) {
                console.log("error!!");
            }
            if(user) {
                console.log("user exists!");
            }
            else {
                userData.save((err, user) => {
                    if(err) {
                        console.log(err)
                    } else {
                        console.log(`saved ${user.email}`)
                    }
                });
                req.session.email = req.body.email;
                redirect("/profil");
            }
        })
        
    } else {
        console.log("passwords don't match")
    }
    
    // User.create(userData, (err, user) => {
    //     if(err) {
    //         return next(err)
    //     } else {
    //         return res.redirect('/home')
    //     }
    // })
});
// create a new note
app.post("/add", (req, res)=> {
    if(req.body.form == "new"){
        let noteData = new Note({
            title: req.body.title,
            text: req.body.text,
            user: req.session.email,
            color: req.body.color
        });

        noteData.save((err, note)=> {
            if(err) {
                console.log(err)
            } else {
                console.log(`Note saved : ${note}`);
                res.redirect('/home');
            }
        });
        return
    }
});
// recherche sur la page users
app.post("/users", (req, res) => {

    if(req.body.form == "users") {
        let search = { $regex: '.*' + req.body.search + '.*'};
        console.log(search);
        User.find({email: search}, (err, user) => {
            res.render("users", {
                // title: "Liste d'utiliateurs",
                users: user
            })
        })
    }

})
// recherche sur la page notes (home)
app.post("/home", (req, res) => {

    if(req.body.form == "search") {
        let search = { $regex: '.*' + req.body.search + '.*' };
        console.log(search);
        Note.find({title: search}, (err, note) => {
            res.render('home', {
                title: 'Principal',
                cards: note
            });
        });

    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("App running on ", PORT)
})