const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

// add all app.get and app.post routes related to favorites here
app.get('/favorite', (req, res) => {
    // placeholder until we have a favorites.ejs file to render
    res.send('this is the favorites page');
});

module.exports = app;