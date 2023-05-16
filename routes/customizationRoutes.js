const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

// placeholder for whatever we need for this stuff
app.get('/customizeRecipe', (req, res) => {
    res.render('customizeRecipe');
});

module.exports = app;