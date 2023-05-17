const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes_test');




app.get('/cleanDatabaseIngredientParts', async (req, res) => {
    try {
        console.log('Cleaning database');

        const documents = await recipeCollection.find({}).toArray();

        const updateOperations = documents.map((document) => {
            const recipeInstructionsString = document.RecipeIngredientParts;
            const regex = /"([^"]*)"/g;
            const recipeInstructionsArray = [];
            let match;
            while ((match = regex.exec(recipeInstructionsString))) {
                recipeInstructionsArray.push(match[1]);
            }

            return recipeCollection.updateOne(
                { _id: document._id },
                { $set: { UpdatedRecipeIngredientParts: recipeInstructionsArray } }
            );
        });

        await Promise.all(updateOperations);

        console.log('Documents updated successfully');

        res.status(200).json({ message: 'Database cleaned successfully' });
    } catch (error) {
        console.error('Error cleaning database:', error);
        res.status(500).json({ error: 'An error occurred while cleaning the database' });
    }
});

app.get('/cleanDatabaseIngredientQuantities', async (req, res) => {
    try {
        console.log('Cleaning database');

        const documents = await recipeCollection.find({}).toArray();

        const updateOperations = documents.map((document) => {
            const recipeInstructionsString = document.RecipeIngredientQuantities;
            const regex = /"([^"]*)"/g;
            const recipeInstructionsArray = [];
            let match;
            while ((match = regex.exec(recipeInstructionsString))) {
                recipeInstructionsArray.push(match[1]);
            }

            return recipeCollection.updateOne(
                { _id: document._id },
                { $set: { UpdatedRecipeIngredientQuantities: recipeInstructionsArray } }
            );
        });

        await Promise.all(updateOperations);

        console.log('Documents updated successfully');

        res.status(200).json({ message: 'Database cleaned successfully' });
    } catch (error) {
        console.error('Error cleaning database:', error);
        res.status(500).json({ error: 'An error occurred while cleaning the database' });
    }
});

app.get('/cleanDatabaseInstructions', async (req, res) => {
    try {
        console.log('Cleaning database');

        const documents = await recipeCollection.find({}).toArray();

        const updateOperations = documents.map((document) => {
            const recipeInstructionsString = document.RecipeInstructions;
            const regex = /"([^"]*)"/g;
            const recipeInstructionsArray = [];
            let match;
            while ((match = regex.exec(recipeInstructionsString))) {
                recipeInstructionsArray.push(match[1]);
            }

            return recipeCollection.updateOne(
                { _id: document._id },
                { $set: { UpdatedRecipeInstructions: recipeInstructionsArray } }
            );
        });

        await Promise.all(updateOperations);

        console.log('Documents updated successfully');

        res.status(200).json({ message: 'Database cleaned successfully' });
    } catch (error) {
        console.error('Error cleaning database:', error);
        res.status(500).json({ error: 'An error occurred while cleaning the database' });
    }
});

app.get('/cleanDatabaseKeywords', async (req, res) => {
    try {
        console.log('Cleaning database');

        const documents = await recipeCollection.find({}).toArray();

        const updateOperations = documents.map((document) => {
            const recipeInstructionsString = document.Keywords;
            const regex = /"([^"]*)"/g;
            const recipeInstructionsArray = [];
            let match;
            while ((match = regex.exec(recipeInstructionsString))) {
                recipeInstructionsArray.push(match[1]);
            }

            return recipeCollection.updateOne(
                { _id: document._id },
                { $set: { UpdatedKeywords: recipeInstructionsArray } }
            );
        });

        await Promise.all(updateOperations);

        console.log('Documents updated successfully');

        res.status(200).json({ message: 'Database cleaned successfully' });
    } catch (error) {
        console.error('Error cleaning database:', error);
        res.status(500).json({ error: 'An error occurred while cleaning the database' });
    }
});

module.exports = app;
