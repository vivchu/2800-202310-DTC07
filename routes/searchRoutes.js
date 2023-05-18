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


app.get('/search', (req, res) => {
    res.render('search');
});

app.get('/searchName', (req, res) => {    
    res.render('searchName');
});

// populates search results based off of image availability and then rating
const searchRecipesByName = async (keywords) => {
    const searchRegex = new RegExp(keywords, 'i');
    const foundRecipes = await recipeCollection.find({ Name: searchRegex }).toArray();

    const sortedRecipes = foundRecipes.sort((a, b) => {
        if (a.Image_Link === 'Unavailable' && b.Image_Link !== 'Unavailable') {
            return 1;
        } else if (a.Image_Link !== 'Unavailable' && b.Image_Link === 'Unavailable') {
            return -1;
        } else {
            return b.AggregatedRating - a.AggregatedRating;
        }
    }).slice(0, 200);

    return sortedRecipes;
};


app.post('/searchNameSubmit', async (req, res) => {
    const keywords = req.body.recipeName;
    console.log(keywords)
    const foundRecipes = await searchRecipesByName(keywords);
    console.log(foundRecipes);
    res.render('searchResults', { foundRecipes: foundRecipes });
});


const searchRecipesBySkillAndKeywords = async (cookingSkill, bakingSkill, keywords) => {
    let skillLevelFilter = [];

    if (cookingSkill === 'beginner') {
        skillLevelFilter = ['Easy'];
    } else if (cookingSkill === 'intermediate') {
        skillLevelFilter = ['Easy', 'Medium'];
    } else if (cookingSkill === 'expert') {
        skillLevelFilter = ['Easy', 'Medium', 'Hard'];
    }

    // if (bakingSkill === 'beginner') {
    //     skillLevelFilter.bakingSkill = 'Easy';
    // } else if (bakingSkill === 'intermediate') {
    //     skillLevelFilter.bakingSkill = { $in: ['Easy', 'Medium'] };
    // } else if (bakingSkill === 'expert') {
    //     skillLevelFilter.bakingSkill = { $in: ['Easy', 'Medium', 'Hard'] };
    // }

    const searchRegex = new RegExp(keywords, 'i');
    const foundRecipes = await recipeCollection.find({ Name: searchRegex }).toArray();

    // filter found recipes by skill level by checking if recipe.Difficulty is in skillLevelFilter
    const filteredRecipes = foundRecipes.filter(recipe => {
        return skillLevelFilter.includes(recipe.Difficulty);
    });
        

    const sortedRecipes = filteredRecipes.sort((a, b) => {
        if (a.Image_Link === 'Unavailable' && b.Image_Link !== 'Unavailable') {
            return 1;
        } else if (a.Image_Link !== 'Unavailable' && b.Image_Link === 'Unavailable') {
            return -1;
        } else {
            return b.AggregatedRating - a.AggregatedRating;
        }
    }).slice(0, 200);

    return sortedRecipes;
};

app.get('/searchSkillLevel', async (req, res) => {
    if (req.session.authenticated) {
        var currentUser = await userCollection.find({ username: req.session.username }).toArray();
        console.log(currentUser)
    }
    res.render('searchSkill', { currentUser: currentUser });
});

app.post('/searchSkillLevelSubmit', async (req, res) => {
    const { cookingSkill, bakingSkill, keywords } = req.body;
    const foundRecipes = await searchRecipesBySkillAndKeywords(cookingSkill, bakingSkill, keywords);
    res.render('searchResults', { foundRecipes: foundRecipes }); 
});

app.get('/searchByIngredients', async (req, res) => {
    if (req.session.authenticated) {
        var currentUser = await userCollection.find({ username: req.session.username }).toArray();
        console.log(currentUser)
        res.render('searchIngredients', { user: currentUser });
        return
    }
    res.render('searchIngredientsNotLoggedIn');
});

app.post('/addSearchIngredient', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var ingredient = req.body.ingredient
    if (ingredient) {
        await userCollection.updateOne({ email: req.session.email }, { $push: { SearchIngredients: ingredient } });
    }
    res.redirect('/profile?success=Ingredient added successfully');
});

app.post('/editSearchIngredient', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var oldIngredient = req.body.oldIngredient
    var newIngredientName = req.body.newIngredientName
    if (oldIngredient && newIngredientName) {
        await userCollection.updateOne({ email: req.session.email }, { $pull: { SearchIngredients: oldIngredient } });
        await userCollection.updateOne({ email: req.session.email }, { $push: { SearchIngredients: newIngredientName } });
    }
    res.redirect('/profile?success=Ingredient edited successfully');
});

app.post('/removeSearchIngredient', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var ingredient = req.body.ingredient
    if (ingredient) {
        await userCollection.updateOne({ email: req.session.email }, { $pull: { SearchIngredients: ingredient } });
    }
    res.redirect('/profile?success=Ingredient removed successfully');
});

app.post('/searchIngredientSubmit', async (req, res) => {
    if (req.session.authenticated) {
        const searchedIngredients = await userCollection.find({ username: req.session.username }).project({ SearchIngredients: 1 }).toArray();
        console.log('Search Ingredients:', searchedIngredients[0].SearchIngredients);

        const UserIngredients = await userCollection.find({ username: req.session.username }).project({ UserIngredients: 1 }).toArray();
    
        // const foundRecipes = await recipeCollection
        //     .find({
        //         $expr: { $setEquals: ['$UpdatedRecipeIngredientParts', searchedIngredients[0].SearchIngredients] },
        //     })
        //     .toArray();

        const foundRecipes = await recipeCollection
    .find({
        UpdatedRecipeIngredientParts: {
            $all: searchedIngredients[0].SearchIngredients.map((ingredient) => ({
                $elemMatch: { $eq: ingredient }
            }))
        }
    })
    .toArray();

        const sortedRecipes = foundRecipes.sort((a, b) => {
                if (a.Image_Link === 'Unavailable' && b.Image_Link !== 'Unavailable') {
                    return 1;
                } else if (a.Image_Link !== 'Unavailable' && b.Image_Link === 'Unavailable') {
                    return -1;
                } else {
                    return b.AggregatedRating - a.AggregatedRating;
                }
            }).slice(0, 200);
        console.log('Found Recipes:', foundRecipes);
        console.log('Sorted Recipes:', sortedRecipes);
    
        await userCollection.updateOne({ username: req.session.username }, { $set: { SearchIngredients: UserIngredients[0].UserIngredients } });
    
        res.render('searchResults', { foundRecipes: sortedRecipes });
        return;
    }
    
    res.redirect('/');
});

app.post('/generateIngredientSubmit', async (req, res) => {
    if (req.session.authenticated) {
        const searchedIngredients = await userCollection.find({ username: req.session.username }).project({ SearchIngredients: 1 }).toArray();
        console.log('Search Ingredients:', searchedIngredients[0].SearchIngredients);
        const UserIngredients = await userCollection.find({ username: req.session.username }).project({ UserIngredients: 1 }).toArray();
        console.log(`searchedIngredients: ${searchedIngredients[0].SearchIngredients.join(", ")}`);
        const prompt = `
        can you generate a recipe based on the below list of ingredients?

        ${searchedIngredients[0].SearchIngredients}

        please make your answer be an array where each array element is taken from the below list. Can you format the response as an array only? can you make the response the least number of tokens as possible?

        ["Recipe Title", "Image Link", "list of quantities/units/ingredients", "list of steps"]
        
        do not include newline characters and have the list of steps numbered`
        
        const runPrompt = async () => {
            const response = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    { "role": "user", "content": prompt }
                ],
                max_tokens: 1024,
                temperature: 0,
            });
            return response.data.choices[0].message.content;
        }
        const recipe = await runPrompt();

        // Extract the array elements
        const elements = recipe.match(/"([^"]*)"/g).map(element => element.replace(/"/g, ''));
        const title = elements[0];
        const imageLink = elements[1];
        const ingredientsString = elements[2];
        const ingredients = ingredientsString.split('|');
        const instructionsString = elements[3];
        const instructionSteps = instructionsString.split(/\d+\./)

        // Remove empty strings and leading/trailing whitespace from instructionSteps
        const filteredSteps = instructionSteps.filter(step => step.trim() !== '');

        // Remove the first element if it is blank
        if (filteredSteps.length > 0 && filteredSteps[0].trim() === '') {
            filteredSteps.shift();
        }
        console.log(`here is the unfiltered recipe: ${recipe}`)
        console.log(`here are the instructions: ${filteredSteps}`)


        await userCollection.updateOne({ username: req.session.username }, { $set: { SearchIngredients: UserIngredients[0].UserIngredients } });

        res.render('generatedAIResults', { title: title, imageLink: imageLink, ingredients: ingredients, instructions: filteredSteps });
        return;
    }

    res.redirect('/');
});

module.exports = app;
module.exports.searchRecipesByName = searchRecipesByName;
module.exports.searchRecipesBySkillAndKeywords = searchRecipesBySkillAndKeywords;