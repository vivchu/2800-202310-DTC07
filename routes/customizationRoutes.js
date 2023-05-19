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

// placeholder for whatever we need for this stuff
// app.get('/customizeRecipe', (req, res) => {
//     res.render('customizeRecipe');
// });


app.post('/customizeRecipe', async (req, res) => {
    const recipeId = req.body.recipeId;
    console.log(recipeId);
    const recipe = await recipeCollection.findOne({ _id: new ObjectId(recipeId) });
    res.render('customizeRecipe', { recipe: recipe });
});

app.post('/customizeRecipeIngredients', async (req, res) => {
    const recipeId = req.body.recipeId;
    console.log(recipeId);
    const recipe = await recipeCollection.findOne({ _id: new ObjectId(recipeId) });
    console.log(recipe);
    res.render('home');
});

// app.post('/customizeRecipeSubmit', async(req, res) => {
//     const recipeID= req.body.recipeID
//     console.log('test', recipeID)
//     const result = await recipeCollection.find({_id: new ObjectId(recipeID)}).toArray();
//     // const recipeIngredients = JSON.stringify({ "UpdatedRecipeIngredientParts": result[0].recipeID });
//     // const prompt = createPrompt(recipeIngredients);


//     res.render('customizeRecipe', { recipe: result[0] });

// });

module.exports = app;