const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { ObjectId } = require('mongodb');

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');

const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

const runPrompt = async (prompt) => {
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "user", "content": prompt }
        ],
        max_tokens: 1024,
        temperature: 0,
    });

    return response.data.choices[0].message.content;
};


const createPrompt = (recipeIngredients) => {
    const prompt = `${recipeIngredients} \n\n
                    what is the most common units of measure for the above ingredients? please make your answer be an array where each array element is the single most common unit of measure for each item, taken from the below list. only include the one most common unit of measure. Can you format the response as an array only? can you make the response the least number of tokens as possible?
                    \n\n
                    [ "Teaspoon", "Tablespoon", "Cup", "Fluid ounce", "Pint", "Quart", "Gallon", "Ounce", "Pound", "Milliliter", "Liter", "Kilogram", "Gram", "Each", "Pinch" ]`
    return prompt;
}

function breakStringToArray(string) {
    // Remove the brackets and quotation marks from the string
    string = string.replace('[', '').replace(']', '').replace(/"/g, '');

    // Split the string into individual items
    var items = string.split(', ');

    // Return the resulting array
    return items;
}

app.post('/generateMeasureUnits', async (req, res) => {
    const recipeID = req.body.recipeID;
    console.log(recipeID);
    const result = await recipeCollection.find({ _id: new ObjectId(recipeID) }).toArray();
    console.log(result);
    const recipeIngredients = JSON.stringify({"UpdatedRecipeIngredientParts": result[0].UpdatedRecipeIngredientParts});
    const prompt = createPrompt(recipeIngredients);
    const measureUnitsResponse = await runPrompt(prompt);
    const measureUnits = breakStringToArray(measureUnitsResponse);
    console.log(measureUnits);

    res.render('recipeDetails', { recipe: result[0], measureUnits: measureUnits });

});



module.exports = app;