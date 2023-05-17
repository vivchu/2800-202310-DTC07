// const express = require('express');
// const app = express.Router();
// const { database } = require('../databaseConnection');
// const mongodb_database = process.env.MONGODB_DATABASE;
// const bcrypt = require('bcrypt');
// const Joi = require('joi');
// const expireTime = 1 * 60 * 60 * 1000;

// const userCollection = database.db(mongodb_database).collection('users');
// const recipeCollection = database.db(mongodb_database).collection('recipes_test');

// app.get('/cleanDatabase', async (req, res) => {
//     try {
//         console.log('Cleaning database');

//         // Find all documents in the collection
//         const documents = await recipeCollection.find({}).toArray();

//         // Iterate over each document
//         for (const document of documents) {
//             const recipeIngredientsString = document.RecipeIngredientParts;

//             // Remove unwanted characters and convert to an actual array
//             const recipeIngredientsArray = recipeIngredientsString
//                 .replace(/[()"\\]/g, '') // Remove unwanted characters (", (, ), \)
//                 .split(','); // Convert to an array

//             const updatedIngredients = [];

//             // Process each ingredient
//             for (const [index, ingredient] of recipeIngredientsArray.entries()) {
//                 // Convert each element to a string
//                 let ingredientString = ingredient.trim();

//                 // Remove the first character from the first element
//                 if (index === 0) {
//                     ingredientString = ingredientString.substring(1);
//                 }

//                 // Add the processed ingredient to the updated list
//                 updatedIngredients.push(ingredientString);
//             }

//             // Update the document with the new column
//             await recipeCollection.updateOne(
//                 { _id: document._id },
//                 { $set: { UpdatedRecipeIngredientParts: updatedIngredients } }
//             );

//             console.log('Document updated successfully');
//         }

//         res.status(200).json({ message: 'Database cleaned successfully' });
//     } catch (error) {
//         console.error('Error cleaning database:', error);
//         res.status(500).json({ error: 'An error occurred while cleaning the database' });
//     }
// });

// module.exports = app;

const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes_test');

app.get('/cleanDatabase', async (req, res) => {
    try {
        console.log('Cleaning database');

        const documents = await recipeCollection.find({}).toArray();

        const updateOperations = documents.map((document) => {
            const recipeIngredientsString = document.Keywords;
            const recipeIngredientsArray = recipeIngredientsString
                .replace(/[()"\\]/g, '')
                .split(',')
                .map((ingredient, index) => {
                    let ingredientString = ingredient.trim();
                    if (index === 0) {
                        ingredientString = ingredientString.substring(1);
                    }
                    return ingredientString;
                });

            return recipeCollection.updateOne(
                { _id: document._id },
                { $set: { UpdatedKeywords: recipeIngredientsArray } }
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


// const express = require('express');
// const app = express.Router();
// const { database } = require('../databaseConnection');
// const mongodb_database = process.env.MONGODB_DATABASE;
// const bcrypt = require('bcrypt');
// const Joi = require('joi');
// const expireTime = 1 * 60 * 60 * 1000;

// const userCollection = database.db(mongodb_database).collection('users');
// const recipeCollection = database.db(mongodb_database).collection('recipes_test');

// app.get('/cleanDatabase', async (req, res) => {
//     try {
//         console.log('Cleaning database');

//         const documents = await recipeCollection.find({}).toArray();

//         const updateOperations = documents.map((document) => {
//             const recipeInstructionsString = document.RecipeInstructions;
//             const regex = /"([^"]*)"/g;
//             const recipeInstructionsArray = [];
//             let match;
//             while ((match = regex.exec(recipeInstructionsString))) {
//                 recipeInstructionsArray.push(match[1]);
//             }

//             return recipeCollection.updateOne(
//                 { _id: document._id },
//                 { $set: { UpdatedRecipeInstructions: recipeInstructionsArray } }
//             );
//         });

//         await Promise.all(updateOperations);

//         console.log('Documents updated successfully');

//         res.status(200).json({ message: 'Database cleaned successfully' });
//     } catch (error) {
//         console.error('Error cleaning database:', error);
//         res.status(500).json({ error: 'An error occurred while cleaning the database' });
//     }
// });

// module.exports = app;
