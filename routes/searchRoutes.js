const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');

const userCollection = database.db(mongodb_database).collection('users');
const recipeCollection = database.db(mongodb_database).collection('recipes');



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

module.exports = app;
module.exports.searchRecipesByName = searchRecipesByName;
module.exports.searchRecipesBySkillAndKeywords = searchRecipesBySkillAndKeywords;