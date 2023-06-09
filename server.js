/*jslint es6:true */
require('./utils.js');
require('dotenv').config();

// get all the route files
const profileRoutes = require('./routes/profileRoutes.js');
const searchRoutes = require('./routes/searchRoutes.js');
const authenticationRoutes = require('./routes/authenticationRoutes.js');
const favoritesRoutes = require('./routes/favoritesRoutes.js');
const customizationRoutes = require('./routes/customizationRoutes.js');
const apiRoutes = require('./routes/apiRoutes.js');
const cleanDatabaseRecipeParts = require('./routes/cleanDatabaseRecipeParts.js');
const recipeDetailsRoutes = require('./routes/recipeDetailsRoutes.js');

const express = require('express');
const sessions = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const app = express();
const port = process.env.PORT || 3000;

// mongodb connection
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;
const mongodb_session_secret = process.env.MONGODB_SESSION_SECRET;
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_database = process.env.MONGODB_DATABASE;

const node_session_secret = process.env.NODE_SESSION_SECRET;

const bodyParser = require('body-parser');

const expireTime = 1 * 60 * 60 * 1000; //expires after 1 hour (hours * minutes * seconds * millis)

var { database } = include('databaseConnection');

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(express.static("scripts"))

var mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/sessions`,
    crypto: { secret: mongodb_session_secret }
})

app.use(sessions({
    secret: node_session_secret,
    store: mongoStore,
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
    if (!req.session.authenticated) {
        res.render('home');
    }
    else {
        res.render('homeLoggedIn', { username: req.session.username });
    }
});

// separation of routes
app.use('/', authenticationRoutes)
app.use('/', profileRoutes);
app.use('/', searchRoutes)
app.use('/', favoritesRoutes)
app.use('/', customizationRoutes)
app.use('/', cleanDatabaseRecipeParts)
app.use('/', apiRoutes)
app.use('/', recipeDetailsRoutes)

// recipe details page route
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

// logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// catch all 404 page not found errors
app.get('*', (req, res) => {
    res.status(404)
    res.render('404')
})


