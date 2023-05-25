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
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    res.render('search');
});

app.get('/searchName', (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
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
    const keywords = req.body.recipeName.trim()
    // check if the keywords are valid
    const schema = Joi.object({
        recipeName: Joi.string().pattern(/^[^${}/\]"'`:,.<>]{3,20}$/).required()
    });
    if (schema.validate({ recipeName: keywords }).error) {
        res.redirect('/searchName?error=Invalid keywords');
        return;
    }
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
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    if (req.session.authenticated) {
        var currentUser = await userCollection.find({ username: req.session.username }).toArray();
        console.log(currentUser)
    }
    res.render('searchSkill', { currentUser: currentUser });
});

app.post('/searchSkillLevelSubmit', async (req, res) => {
    let { cookingSkill, bakingSkill, keywords } = req.body;
    // trim the keywords
    keywords = keywords.trim();
    // check if the keywords are valid
    const schema = Joi.object({
        cookingSkill: Joi.string().valid('beginner', 'intermediate', 'expert').required(),
        bakingSkill: Joi.string().valid('beginner', 'intermediate', 'expert').required(),
        keywords: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
    });
    if (schema.validate({ cookingSkill: cookingSkill, bakingSkill: bakingSkill, keywords: keywords }).error) {
        res.redirect('/searchSkillLevel?error=Invalid keywords');
        return;
    }
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
    res.redirect('/');
});

app.post('/addSearchIngredient', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var ingredient = req.body.ingredient
    if (ingredient) {
        // check if the ingredient is valid
        const schema = Joi.object({
            ingredient: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
        });
        if (schema.validate({ ingredient: ingredient }).error) {
            res.redirect('/searchByIngredients?error=Invalid ingredient');
            return;
        }
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
        // check if the newIngredientName is valid
        const schema = Joi.object({
            newIngredientName: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
        });
        if (schema.validate({ newIngredientName: newIngredientName }).error) {
            res.redirect('/searchByIngredients?error=Invalid ingredient');
            return;
        }
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

        const foundRecipes = await recipeCollection.find({
                                                        UpdatedRecipeIngredientParts: {
                                                            $all: searchedIngredients[0].SearchIngredients.map((ingredient) => ({
                                                                $elemMatch: { $eq: ingredient }
                                                            }))
                                                        }
                                                    }).toArray();

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

        ["Recipe Title", "Image Link", "list of quantities/units/ingredients separated by &&&", "list of steps separated by &&&"]
        
        here is an example response:
        ["Cake", "ImageLink", "1 cup of flour&&&2 eggs&&&1 cup of sugar", "mix the ingredients together&&&bake at 350 degrees for 30 minutes&&&enjoy!"]`
        
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
        const ingredients = ingredientsString.split("&&&");
        const instructionsString = elements[3];
        let instructionSteps;
        if (instructionsString.includes("&&&")) {
            instructionSteps = instructionsString.split("&&&");
        } else if (instructionsString.match(/^\d+\.\s/gm)) {
            instructionSteps = instructionsString.split(/^\d+\.\s/gm).filter((step) => step.trim() !== "");
        } else {
            instructionSteps = instructionsString.split(".");
        }

        const extractedRecipe = [title, ingredients, instructionSteps];
        console.log(`here is the extracted recipe: ${extractedRecipe}`)
        console.log(`here is the instruction string: ${instructionsString}`)
        console.log(`here are the instructions: ${instructionSteps}`)

        await userCollection.updateOne({ username: req.session.username }, { $set: { SearchIngredients: UserIngredients[0].UserIngredients } });

        res.render('generatedAIResults', { extractedRecipe: extractedRecipe });
        return;
    }

    res.redirect('/');
});

app.post('/addCustomizedRecipe', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    const title = JSON.parse(req.body.title);
    const ingredients = JSON.parse(req.body.ingredients);
    const instructions = JSON.parse(req.body.instructions);
    const recipe = [title, ingredients, instructions];
    console.log(`here is the recipe: ${recipe}`)

    await userCollection.updateOne({ username: req.session.username }, { $push: { CustomizedRecipe: recipe } }); 

    res.redirect('/savedCustomizedRecipes');
    return;
});

app.get('/savedCustomizedRecipes', async (req, res) => {
    if (!req.session.authenticated || !req.session.username) {
        res.redirect('/');
        return;
    }
    const email = req.session.email;
    const user = await userCollection.findOne({ email })
    const customizedRecipes = await userCollection.find({ username: req.session.username }).project({ CustomizedRecipe: 1 }).toArray();
    console.log('Customized Recipes:', customizedRecipes[0].CustomizedRecipe);
    console.log('Customized Recipes Length:', customizedRecipes[0]);
    res.render('savedCustomizedRecipes', { customizedRecipes: customizedRecipes[0].CustomizedRecipe, user: user });
    return;
});

app.post('/viewCustomizedRecipe', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    const title = JSON.parse(req.body.title);
    const ingredients = JSON.parse(req.body.ingredients);
    const instructions = JSON.parse(req.body.instructions);
    const recipe = [title, ingredients, instructions];
    console.log(`here is the recipe: ${recipe}`)
    res.render('viewCustomizedRecipe', { recipe: recipe });
    return;
});

app.get('/searchByDietaryRestriction', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var currentUser = await userCollection.find({ username: req.session.username }).toArray();
    console.log(currentUser)
    res.render('searchDietaryRestriction', { user: currentUser });
    return
});

const searchDietaryRestriction = async (foundRecipes, DietaryRestriction) => {
    let exclusionKeywords = [];
    if (DietaryRestriction === "vegetarian") {
        exclusionKeywords = [
            'meat', 'chicken', 'pork', 'bacon', 'sausage', 'beef', 'steak', 'ham', 'lamb', 'duck', 'turkey', 'spam', 'salmon', 'halibut', 'fish', 'shrimp',
            'crab', 'lobster', 'clam', 'mussel', 'oyster', 'anchovy', 'sardine', 'tuna', 'trout', 'cod', 'tilapia', 'catfish', 'bass', 'pepperoni', 'prosciutto',
            'salami', 'chorizo'];
    } else if (DietaryRestriction === "vegan") {
        exclusionKeywords = [
            'meat', 'chicken', 'pork', 'bacon', 'sausage', 'beef', 'steak', 'ham', 'lamb', 'duck', 'turkey', 'spam', 'salmon', 'halibut', 'fish', 'shrimp',
            'crab', 'lobster', 'clam', 'mussel', 'oyster', 'anchovy', 'sardine', 'tuna', 'trout', 'cod', 'tilapia', 'catfish', 'bass', 'pepperoni', 'prosciutto',
            'salami', 'chorizo', 'egg', 'milk', 'cheese', 'butter', 'yogurt', 'cream', 'honey', 'mayonnaise', 'gelatin', 'lard', 'whey', 'casein', 'albumin',
            'isenglass', 'carmine', 'cochineal', 'shellac', 'vitamin d3', 'whey', 'casein', 'albumin', 'isenglass', 'carmine', 'cochineal', 'shellac', 'vitamin d3'];
    } else if (DietaryRestriction === "dairy-free") {
        exclusionKeywords = [
            'milk', 'cheese', 'butter', 'yogurt', 'cream', 'honey', 'mayonnaise', 'gelatin', 'lard', 'whey', 'casein', 'albumin',
            'feta', 'ghee', 'goat cheese', 'ice cream', 'margarine', 'parmesan', 'ricotta', 'brie', 'cheddar', 'mozzarella', 'provolone', 'swiss', 
            'isenglass', 'carmine', 'cochineal', 'shellac', 'vitamin d3', 'whey', 'casein', 'albumin', 'isenglass', 'carmine', 'cochineal', 'shellac', 'vitamin d3'];
    } else if (DietaryRestriction === "gluten-free") {
        exclusionKeywords = [
            'wheat', 'barley', , 'flour', 'rye', 'triticale', 'malt', 'brewer\'s yeast', 'oats', 'spelt', 'kamut', 'semolina', 'durum', 'farina', 'farro', 'einkorn', 'emmer',
            'wheat germ', 'wheat bran', 'bulgur', 'couscous', 'pasta', 'bread', 'cracker', 'cake', 'cookie', 'pie', 'pastry', 'dough', 'biscuit', 'muffin', 'roll',
            'bagel', 'pretzel', 'croissant', 'crouton', 'stuffing', 'noodle', 'cereal', 'beer', 'ale', 'lager', 'stout', 'porter', 'malt', 'malt vinegar', 'soy sauce',
            'teriyaki sauce', 'hoisin sauce', 'oyster sauce', 'barley malt', 'malt extract', 'malt flavoring', 'malt vinegar', 'malt syrup', 'maltodextrin', 'maltol']
    }

    const filteredRecipes = foundRecipes.filter(recipe => {
        for (const keyword of exclusionKeywords) {
            const regex = new RegExp(keyword, 'i');
            for (const property in recipe) {
                if (regex.test(recipe[property])) {
                    return false; // Exclude recipes containing the keyword
                }
            }
        }
        return true; // Include recipes that don't contain any of the keywords
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

app.post('/searchDietaryRestrictionSubmit', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    const DietaryRestriction = req.body.DietaryRestriction;
    console.log(DietaryRestriction);
    const keywords = req.body.keywords;
    // check if keywords is valid
    const schema = Joi.object({
        keywords: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
    });
    if (schema.validate({ keywords: keywords }).error) {
        res.redirect('/searchName?error=Invalid keywords');
        return;
    }
    const searchRegex = new RegExp(keywords, 'i');
    const foundRecipes = await recipeCollection.find({ Name: searchRegex }).toArray();

    const sortedRecipes = await searchDietaryRestriction(foundRecipes, DietaryRestriction);
    res.render('searchResults', { foundRecipes: sortedRecipes });
})

app.post('/removeAllSearchIngredients', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    const email = req.session.email;
    await userCollection.updateOne({ email: email }, { $set: { SearchIngredients: [] } });
    res.redirect('/searchbyIngredients');
});

module.exports = app;
module.exports.searchRecipesByName = searchRecipesByName;
module.exports.searchRecipesBySkillAndKeywords = searchRecipesBySkillAndKeywords;