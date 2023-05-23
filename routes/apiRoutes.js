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


const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);



app.post('/customizedByCookingTimeSubmit', async(req, res) => {
    const recipeId = req.body.recipeId;
    const clickedRecipe = await recipeCollection.findOne({ _id: new ObjectId(recipeId) });
    const prompt = `This is the recipe ${clickedRecipe.Name}, this is the Cook Time ${clickedRecipe.CookTime},this is the Prep Time ${clickedRecipe.PrepTime},
    and this is the Total time ${clickedRecipe.TotalTime},and these are the instructions${clickedRecipe.UpdatedRecipeInstructions}.
    Can you modify this recipe so that it takes less time to make?
    Please make your answer be an array where each array element is taken from the below list.
    ["Recipe Title","Total Prep Time","Total Cook Time","Total Time", "list of quantities/units/ingredients  separated by &&&", "list of steps separated by &&&"]
    Can you format the response as an array only ? Can you make the response the least number of tokens as possible ?
    Here is an example to go off of:
        ["Cake", "ImageLink", "1 cup of flour&&&2 eggs&&&1 cup of sugar", "mix the ingredients together&&&bake at 350 degrees for 30 minutes"]`
    const runPrompt = async (recipeId) => {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "user", "content": prompt }
            ],
            max_tokens: 1024,
            temperature: 0,
        });
        console.log(response.data.choices[0].message.content)
        return response.data.choices[0].message.content;
    };
    const removeTimePrefix = (time) => {
        return time.replace("PT", "");
    };
    const recipe = await runPrompt(recipeId);
    const elements = recipe.match(/"([^"]*)"/g).map(element => element.replace(/"/g, ''));
    const title = elements[0];
    const totalPT = removeTimePrefix(elements[1]);
    const totalCT = removeTimePrefix(elements[2]);
        const totalT = removeTimePrefix(elements[3]);
    const ingredientsString = elements[4];
    const ingredients = ingredientsString.split("&&&");
    const instructionsString = elements[5];
    let instructionSteps;
    if (instructionsString.includes("&&&")) {
        instructionSteps = instructionsString.split("&&&");
    } else if (instructionsString.match(/^\d+\.\s/gm)) {
        instructionSteps = instructionsString.split(/^\d+\.\s/gm).filter((step) => step.trim() !== "");
    } else {
        instructionSteps = instructionsString.split(".");
    }
    res.render('customizedRecipeDisplay', { title: title, totalPT: totalPT, totalCT: totalCT, totalT: totalT, ingredients:ingredients, instructions:instructionSteps});
    return
})



app.post('/customizedBySkillLevelSubmit', async (req, res) => {
    if(req.session.authenticated){
    const recipeId = req.body.recipeId;
    const clickedRecipe = await recipeCollection.findOne({ _id: new ObjectId(recipeId) });
    const BakingLevel = await userCollection.find({ username: req.session.username }).project({ bakingSkill: 1 }).toArray();
    const CookingLevel = await userCollection.find({ username: req.session.username }).project({ cookingSkill: 1 }).toArray();
    const userBakingLevel = BakingLevel[0].bakingSkill
    const userCookingLevel = CookingLevel[0].cookingSkill

        const prompt = `This is the recipe ${clickedRecipe.Name}, this is my cooking level ${userCookingLevel},this is my baking level${userBakingLevel},this is the Cook Time ${clickedRecipe.CookTime},this is the Prep Time ${clickedRecipe.PrepTime},
    and this is the Total time ${clickedRecipe.TotalTime},
    and these are the instructions${clickedRecipe.UpdatedRecipeInstructions}.
    Can you modify this recipe so that it matches my cooking and baking level?
    Please make your answer be an array where each array element is taken from the below list.
    ["Recipe Title","Total Prep Time","Total Cook Time","Total Time", "list of quantities/units/ingredients  separated by &&&", "list of steps separated by &&&"]
    Can you format the response as an array only ? Can you make the response the least number of tokens as possible ?
    Here is an example to go off of:
        ["Cake", "ImageLink", "1 cup of flour&&&2 eggs&&&1 cup of sugar", "mix the ingredients together&&&bake at 350 degrees for 30 minutes"]`
    const runPrompt = async (recipeId) => {
        const response = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [
                { "role": "user", "content": prompt }
            ],
            max_tokens: 1024,
            temperature: 0,
        });
    console.log(response.data.choices[0].message.content)
    return response.data.choices[0].message.content;
};
const removeTimePrefix = (time) => {
    return time.replace("PT", "");
};
const recipe = await runPrompt(recipeId);
const elements = recipe.match(/"([^"]*)"/g).map(element => element.replace(/"/g, ''));
const title = elements[0];
const totalPT = removeTimePrefix(elements[1]);
const totalCT = removeTimePrefix(elements[2]);
const totalT = removeTimePrefix(elements[3]);
const ingredientsString = elements[4];
const ingredients = ingredientsString.split("&&&");
const instructionsString = elements[5];
let instructionSteps;
if (instructionsString.includes("&&&")) {
    instructionSteps = instructionsString.split("&&&");
} else if (instructionsString.match(/^\d+\.\s/gm)) {
    instructionSteps = instructionsString.split(/^\d+\.\s/gm).filter((step) => step.trim() !== "");
} else {
    instructionSteps = instructionsString.split(".");
}
        res.render('customizedRecipeDisplay', { title: title, totalPT: totalPT, totalCT: totalCT, totalT: totalT, ingredients: ingredients, instructions: instructionSteps });
return
}

})



app.post('/customizedByPrice', async (req, res) => {
    if (req.session.authenticated) {
        const recipeId = req.body.recipeId;
        const clickedRecipe = await recipeCollection.findOne({ _id: new ObjectId(recipeId) });
        const prompt = `This is the recipe ${clickedRecipe.Name},
    and these are the instructions${clickedRecipe.UpdatedRecipeInstructions}. These are the ingredients ${clickedRecipe.UpdatedRecipeIngredientParts}.
    Can you modify this recipe so that it is cheaper to make? Use cheaper ingredients alternative if possible.
    Please make your answer be an array where each array element is taken from the below list.
    ["Recipe Title","Total Prep Time","Total Cook Time","Total Time", "list of quantities/units/ingredients  separated by &&&", "list of steps separated by &&&"]
    Can you format the response as an array only ? Can you make the response the least number of tokens as possible ?
    Here is an example to go off of:
        ["Cake", "ImageLink", "1 cup of flour&&&2 eggs&&&1 cup of sugar", "mix the ingredients together&&&bake at 350 degrees for 30 minutes"]`
        const runPrompt = async (recipeId) => {
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    { "role": "user", "content": prompt }
                ],
                max_tokens: 1024,
                temperature: 0,
            });
            console.log(response.data.choices[0].message.content)
            return response.data.choices[0].message.content;
        };
        const removeTimePrefix = (time) => {
            return time.replace("PT", "");
        };
        const recipe = await runPrompt(recipeId);
        const elements = recipe.match(/"([^"]*)"/g).map(element => element.replace(/"/g, ''));
        const title = elements[0];
        const totalPT = removeTimePrefix(elements[1]);
        const totalCT = removeTimePrefix(elements[2]);
        const totalT = removeTimePrefix(elements[3]);
        const ingredientsString = elements[4];
        const ingredients = ingredientsString.split("&&&");
        const instructionsString = elements[5];
        let instructionSteps;
        if (instructionsString.includes("&&&")) {
            instructionSteps = instructionsString.split("&&&");
        } else if (instructionsString.match(/^\d+\.\s/gm)) {
            instructionSteps = instructionsString.split(/^\d+\.\s/gm).filter((step) => step.trim() !== "");
        } else {
            instructionSteps = instructionsString.split(".");
        }
        res.render('customizedRecipeDisplay', { title: title, totalPT: totalPT, totalCT: totalCT, totalT: totalT, ingredients: ingredients, instructions: instructionSteps });
        return
    }

})



module.exports = app;