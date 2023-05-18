const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');

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

    console.log(response.data.choices[0].message.content);
};



app.post('/generateMeasureUnits', async (req, res) => {
    const recipeID = req.body.recipeID;
    res.render('home.ejs');
});












module.exports = app;