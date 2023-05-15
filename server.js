require('./utils.js')
const profileRoutes = require('./routes/profileRoutes.js')
const searchRoutes = require('./routes/searchRoutes.js')

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

app.use(bodyParser.json());
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

// home and login routes
app.get('/', async (req, res) => {
    var result = await recipeCollection.find().limit(3).toArray();
    console.log(result);
    if (!req.session.authenticated) {
        res.render('home');
    }
    else {
        res.render('homeLoggedIn', { username: req.session.username });
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
    const question = await userCollection.find({ email: userEmail }).project({ secretquestion: 1, _id: 0 }).toArray();

    if (result.length!=1) {
        res.redirect("/forgotPassword?error=user not found, please try again");
    }
    else {
        req.session.secret_question = question[0].secretquestion;
        req.session.cookie.maxAge = expireTime
        req.session.email = userEmail;
        console.log(req.session.email);
        res.redirect('/verifyanswer');
        return;
    }
});

app.get('/verifyanswer', (req, res) => {
    res.render('verifyanswer', { secret_question: req.session.secret_question });
});

app.post('/verifyanswerSubmit', async(req, res) => {
    var userAnswer = req.body.answer;
    const schema = Joi.string().max(100).required();
    const validationResult = schema.validate(userAnswer);
    if (validationResult.error != null) {
        console.log(userAnswer);
        res.redirect("/verifyanswer?error=incorrect answer, please try again");
        return;
    }
    console.log(req.session.email)
    var answer = await userCollection.find({ email: req.session.email }).project({ secretanswer: 1, _id: 0 }).toArray();
    console.log(answer);
    if (answer.length != 1) {
        res.redirect("/verifyanswer?error=no answer found, please try again");
    }
    else {
        const match = await bcrypt.compare(userAnswer, answer[0].secretanswer);
        if (!match) {
            console.log(userAnswer);
            res.redirect("/verifyanswer?error=incorrect answer, please try again");
            return;
        }
            req.session.authenticated = true;
            req.session.secret_answer = answer[0].secretanswer;
            req.session.cookie.maxAge = expireTime;
            console.log("success");
            res.redirect('/profile');
            return;
        }
});

app.post('/submitUser', async (req, res) => {
    if (!req.body.username) {
        res.redirect("/createUser?error=Missing username field, please try again");
        return;
    }
    if (!req.body.email) {
        res.redirect("/createUser?error=Missing email field, please try again");
        return;
    }
    if (!req.body.password) {
        res.redirect("/createUser?error=Missing password field, please try again");
        return;
    }
    if (!req.body.secretQuestion) {
        console.log(secretQuestion)
        res.redirect("/createUser?error=Missing question field, please try again");
        return;
    }
    if (!req.body.secretAnswer) {
        res.redirect("/createUser?error=Missing answer field, please try again");
        return;
    }
    if (req.body.username && req.body.email && req.body.password && req.body.secretQuestion && req.body.secretAnswer) {
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
                secretQuestion: Joi.string().max(1000).required(),
                secretAnswer: Joi.string().max(100).required()
            });

        const validationResult = schema.validate({ userName, userEmail, userPassword, secretAnswer, secretQuestion });
        console.log(validationResult.error);
        if (validationResult.error != null) {
            console.log(validationResult.error);
            res.redirect("/createUser");
            return;
        }
        var hashedAnswer = await bcrypt.hashSync(secretAnswer, 1);
        var hashedPassword = await bcrypt.hashSync(userPassword, 1);

        await userCollection.insertOne({ username: userName, email: userEmail, password: hashedPassword, type: "user", secretquestion: secretQuestion, secretanswer: hashedAnswer });
        console.log("Inserted user");
        if (await userCollection.find({ username: userName })) {
            req.session.authenticated = true;
            req.session.username = userName;
            req.session.email = userEmail;
            req.session.cookie.maxAge = expireTime;
            res.render("homeLoggedIn",{username: userName});
            return;
        }
    }
});


app.use('/', profileRoutes);



app.use('/', searchRoutes)




// recipe details page route (Reza)
const { ObjectId } = require('mongodb');

app.get('/recipes/:id', async (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        return res.status(400).send('Invalid recipe ID');
    }
    const recipe = await recipeCollection.findOne(
        { _id: new ObjectId(id) },
        { projection: { Name: 1, Description: 1, Images: 1, _id: 1, RecipeInstructions: 1, RecipeIngredientParts: 1, Image_Link: 1 } }
    );
    res.render('recipeDetails', { recipe: recipe });
});























app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// catch all 404 page not found errors
app.get('*', (req, res) => {
    res.status(404)
    res.send("Error 404 - Page not found");
})


