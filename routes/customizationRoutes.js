const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;
const { ObjectId } = require('mongodb');


const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

app.post('/customizeRecipe', async (req, res) => {
    const recipeId = req.body.recipeId;
    console.log(recipeId);
    const recipe = await recipeCollection.findOne({ _id: new ObjectId(recipeId) });
    res.render('customizeRecipe', { recipe: recipe });
});

module.exports = app;