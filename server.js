require('./utils.js')
require('dotenv').config();

const express = require('express');

const sessions = require('express-session');

const MongoStore = require('connect-mongo');

const bcrypt = require('bcrypt');

const Joi = require('joi');

const app = express();

const port = process.env.PORT || 3000;
// const port = 3000;

const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const bodyParser = require('body-parser');

const expireTime = 1 * 60 * 60 * 1000; //expires after 1 day (hours * minutes * seconds * millis)

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: { secret: mongodb_session_secret }
})

app.use(sessions({
    secret: node_session_secret,
    store: mongoStore, //default is memory store 
    saveUninitialized: false,
    resave: true
}
));

app.listen(port, () =>
    console.log(`Listening on port ${port}`)
);



app.set('view engine', 'ejs');

app.get('/', async (req, res) => {
    var result = await recipeCollection.find().limit(3).toArray();
    console.log(result);
    if (!req.session.authenticated) {
        res.render('home');
    }
    else {
        res.render('homeLoggedIn');
    }
});

app.get('/login', (req, res) => {
    var errorMessage = req.query.error;
    console.log(errorMessage);
    res.render("login", { errorMessage: errorMessage });
});

app.post("/loginSubmit", async (req, res) => {
    var userEmail = req.body.email;
    var userPassword = req.body.password;

    const schema = Joi.string().email().required();
    const validationResult = schema.validate(userEmail);
    if (validationResult.error != null) {
        res.redirect("/login?error=Missing field, please try again");
        return;
    }

    const result = await userCollection.find({ email: userEmail }).project({ username: 1, email: 1, password: 1, _id: 1 }).toArray();

    if (result.length != 1) {
        res.redirect("/login?error=User not found");
        return;
    }
    if (await bcrypt.compare(userPassword, result[0].password)) {
        req.session.authenticated = true;
        req.session.username = result[0].username;
        req.session.email = userEmail;
        req.session.cookie.maxAge = expireTime;

        res.redirect('/');
        return;
    }
    else {
        res.redirect("/login?error=Invalid email or password");
        return;
    }
});

app.get("/createUser", (req, res) => {
    var errorMessage = req.query.error;
    console.log(errorMessage);
    res.render("createUser.ejs", { errorMessage: errorMessage });
});

// this is for the profile page route (Corey)





































// this is for the forgot password and email page routes (Vivian)
app.get('/forgotPassword', (req, res) => {
    res.render('forgotPassword');
});

app.post('/forgotPasswordSubmit', async (req, res) => {
    var userEmail = req.body.email;

    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(userEmail);
    if (validationResult.error != null) {
        console.log(userEmail);
        res.redirect("/forgotPassword");
        return;
    }
    const result = await userCollection.find({ email: userEmail }).project({ email: 1, _id: 1 }).toArray();
    const question = await userCollection.find({ email: userEmail }).project({ secret_question: 1, _id: 0 }).toArray();

    if (result.length != 1) {
        res.render(errorMessage, { errorMessage: "User not found" });
    }
    if (await bcrypt.compare(userEmail, result[0].useremail)) {
        console.log("found user email");
        req.session.authenticated = true;
        req.session.username = question[0].secret_question;
        req.session.usertype = result[0].usertype;
        req.session.secret_question = question[0].secret_question;
        req.session.cookie.maxAge = expireTime
        res.redirect('/verifyanswer');
        return;
    }
    else {
        ;
        res.render(errorMessage, { errorMessage: "User not found" });
    }
});

app.post('/submitUser', async (req, res) => {
    const { username, email, password, secretquestion, secretanswer } = req.body;
    // if no user name, email, or password, redirect to signup page
    if (!username) {
        res.redirect("/createUser?error=Missing username field, please try again");
        return;
    }
    if (!email) {
        res.redirect("/createUser?error=Missing email field, please try again");
        return;
    }
    if (!password) {
        res.redirect("/createUser?error=Missing password field, please try again");
        return;
    }
    if (!secretQuestion) {
        res.redirect("/createUser?error=Missing question field, please try again");
        return;
    }
    if (!secretAnswer) {
        res.redirect("/createUser?error=Missing answer field, please try again");
        return;
    }
    if (username && email && password && secretQuestion && secretAnswer) {
        var userName = req.body.username;
        var userEmail = req.body.email;
        var userPassword = req.body.password;
        var secretQuestion = req.body.secretQuestion;
        var secretAnswer = req.body.secretAnswer;
        const schema = Joi.object(
            {
                userName: Joi.string().alphanum().max(20).required(),
                userEmail: Joi.string().email().required(),
                userPassword: Joi.string().max(20).required(),
                secretQuestion: Joi.string().email().required(),
                secretAnswer: Joi.string().max(100).required()
            });

        const validationResult = schema.validate({ userName, userEmail, userPassword, secretAnswer, secretQuestion });
        console.log(validationResult.error);
        if (validationResult.error != null) {
            console.log(validationResult.error);
            res.redirect("/createUser");
            return;
        }

        var hashedPassword = await bcrypt.hashSync(userPassword, 1);

        await userCollection.insertOne({ username: userName, email: userEmail, password: hashedPassword, type: "user", secret_question: secretQuestion, secret_answer: secretAnswer });
        console.log("Inserted user");
        if (await userCollection.find({ username: userName }))
            req.session.authenticated = true;
        req.session.username = userName;
        req.session.email = userEmail;
        req.session.cookie.maxAge = expireTime;
        res.redirect("/");
    }
});




























// this is for the search page route (McKenzie)







































// this is for the favourite page route










































app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// catch all 404 page not found errors
app.get('*', (req, res) => {
    res.status(404)
    // res.render('errorMessages', {error: "Error 404 - Page not found", redirect: "/", button: "Go To Home Page"});
    res.send("Error 404 - Page not found");
    res.redirect('/');
})
