const express = require('express');
const app = express.Router();
const { ObjectId } = require('mongodb');
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

// add all app.get and app.post routes related to favorites here
app.get('/favorite', async (req, res) => {
    try {
        const email = req.session.email;
        if (!email) {
            throw new Error('Email not found in session');
        }
        const user = await userCollection.findOne({ email });
    
        if (!user) {
            throw new Error('User not found');
        }
        const recipeId = user.favoritedRecipes
        console.log(recipeId);

       
      
        const favoritedRecipes = await recipeCollection.find({ _id: { $in: recipeId.map(id => new ObjectId(id)) } }).toArray();
        console.log(favoritedRecipes);
        res.render('favorite', { favoritedRecipes: favoritedRecipes, user: user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving favorite recipes');
    }
});






app.post('/favorites/check', async (req, res) => {
    const { recipeId } = req.body;
    const email = req.session.email; // Get the user email from the session

    console.log(`Checking if recipe ${recipeId} is favorited by user ${email}`);

    try {
        const user = await userCollection.findOne({ email });
        if (!user) {
            console.log(`User ${email} not found`);
            res.json({ favorited: false });
        } else {
            const favorited = user.favoritedRecipes.includes(recipeId);
            console.log(`Recipe ${recipeId} is favorited: ${favorited}`);
            res.json({ favorited });
        }
    } catch (error) {
        console.error('Error checking if recipe is favorited:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/favorites/add', async (req, res) => {
  const { recipeId } = req.body;
  const email = req.session.email; // Assuming you have a session and userId available

  try {
    // Add the recipeId to the user's favorite recipes array
    await userCollection.updateOne(
      { email: email },
        { $addToSet: { favoritedRecipes: recipeId } }
        
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding recipe to favorites:', error);
    res.json({ success: false });
  }
});

// Route to remove a recipe from favorites
app.post('/favorites/remove', async (req, res) => {
    const { recipeId } = req.body;
    const email = req.session.email; // Assuming you have a session and userId available

    try {
        // Remove the recipeId from the user's favorite recipes array
        await userCollection.updateOne(
            { email: email },
            { $pull: { favoritedRecipes: recipeId } }
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing recipe from favorites:', error);
        res.json({ success: false });
    }
});
module.exports = app;