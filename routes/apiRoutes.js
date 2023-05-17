const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');
const expireTime = 1 * 60 * 60 * 1000;

const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

app.get('/api', (req, res) => {
    res.render('api');
});

const runPrompt = async () => {
    const prompt = "Tell me a dad joke.";
    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { "role": "user", "content": prompt }
        ],
        max_tokens: 100,
        temperature: 1,
    });

    console.log(response.data.choices[0].message.content);
};


app.post('/apiSubmit', (req, res) => {
    runPrompt();
    res.redirect('/');
    return
});


module.exports = app;