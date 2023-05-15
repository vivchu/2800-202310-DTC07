require('./utils.js')
require('dotenv').config();

// get all the route files
const profileRoutes = require('./routes/profileRoutes.js')
const searchRoutes = require('./routes/searchRoutes.js')
const authenticationRoutes = require('./routes/authenticationRoutes.js')
const favoritesRoutes = require('./routes/favoritesRoutes.js')

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

// home route
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


app.use('/', authenticationRoutes)


app.use('/', profileRoutes);


app.use('/', searchRoutes)


app.use('/', favoritesRoutes)


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


