const express = require('express');
const app = express.Router();
const { database } = require('../databaseConnection');
const mongodb_database = process.env.MONGODB_DATABASE;
const bcrypt = require('bcrypt');
const Joi = require('joi');

const userCollection = database.db(mongodb_database).collection('users');

app.get('/profile', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    // retrieve user info from database
    var user = await userCollection.find({ email: req.session.email }).project({ username: 1, email: 1, cookingSkill: 1, bakingSkill: 1, secretquestion: 1, secretanswer: 1, UserIngredients: 1, _id: 1 }).toArray();
    console.log(user);
    res.render('profile', { user: user });
});

app.post('/changePassword', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var newPasword = req.body.newPassword;
    var confirmPassword = req.body.confirmPassword;
    // Check if the new password is valid
    const schema = Joi.object({
        newPassword: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required(),
        confirmPassword: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
    });

    if (schema.validate({ newPassword: newPasword, confirmPassword: confirmPassword }).error) {
        res.redirect('/profile?error=Invalid password');
        return;
    }

    if (newPasword != confirmPassword) {
        res.redirect('/profile?error=Passwords do not match');
        return;
    }
    var hashedPassword = await bcrypt.hashSync(newPasword, 1);
    await userCollection.updateOne({ email: req.session.email }, { $set: { password: hashedPassword } });
    res.redirect('/profile?success=Password changed successfully');
});

app.post('/editProfile', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var newUsername = req.body.name;
    var newEmail = req.body.email;

    if (newUsername) {
        // check if the newUsername is valid
        const schema = Joi.object({
            name: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
        });
        if (schema.validate({ name: newUsername }).error) {
            res.redirect('/profile?error=Invalid username');
            return;
        }

        await userCollection.updateOne({ email: req.session.email }, { $set: { username: newUsername } });
        req.session.username = newUsername;
    }
    if (newEmail) {
        // check if the newEmail is valid
        const schema = Joi.object({
            email: Joi.string().email().required()
        });
        if (schema.validate({ email: newEmail }).error) {
            res.redirect('/profile?error=Invalid email');
            return;
        }
        // Check if the new email already exists in the database
        const existingUser = await userCollection.findOne({ email: newEmail });
        if (existingUser) {
            // Email already belongs to another user
            res.redirect('/profile?error=Email is already in use');
            return;
        }

        await userCollection.updateOne({ email: req.session.email }, { $set: { email: newEmail } });
        req.session.email = newEmail;
    }
    res.redirect('/profile?success=Profile updated successfully');
});

app.post('/editSkillLevel', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var cookingSkill = req.body.cookingSkillLevel
    var bakingSkill = req.body.bakingSkillLevel
    if (cookingSkill) {
        await userCollection.updateOne({ email: req.session.email }, { $set: { cookingSkill: cookingSkill } });
    }
    if (bakingSkill) {
        await userCollection.updateOne({ email: req.session.email }, { $set: { bakingSkill: bakingSkill } });
    }
    res.redirect('/profile?success=Skill level updated successfully');
});

app.post('/editSecretQuestion', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var secretQuestion = req.body.secretQuestion
    var secretAnswer = req.body.secretAnswer
    var hashSecretAnswer = await bcrypt.hashSync(secretAnswer, 1);
    if (secretQuestion && secretAnswer) {
        // check if the secretAnswer is valid
        const schema = Joi.object({
            secretAnswer: Joi.string().pattern(/^[^${}[\]"'`:,.<>]{3,20}$/).required()
        });
        if (schema.validate({ secretAnswer: secretAnswer }).error) {
            res.redirect('/profile?error=Invalid secret answer');
            return;
        }
        await userCollection.updateOne({ email: req.session.email }, { $set: { secretquestion: secretQuestion, secretanswer: hashSecretAnswer } });
    }
    res.redirect('/profile?success=Secret question updated successfully');
});

app.post('/addIngredient', async (req, res) => { 
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
            res.redirect('/profile?error=Invalid ingredient');
            return;
        }
        await userCollection.updateOne({ email: req.session.email }, { $push: { UserIngredients: ingredient, SearchIngredients: ingredient } });
    }
    res.redirect('/profile?success=Ingredient added successfully');
});

app.post('/editIngredient', async (req, res) => {
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
            res.redirect('/profile?error=Invalid ingredient');
            return;
        }
        await userCollection.updateOne({ email: req.session.email }, { $pull: { UserIngredients: oldIngredient, SearchIngredients: oldIngredient } });
        await userCollection.updateOne({ email: req.session.email }, { $push: { UserIngredients: newIngredientName, SearchIngredients: newIngredientName } });
    }
    res.redirect('/profile?success=Ingredient edited successfully');
});

app.post('/removeIngredient', async (req, res) => {
    if (!req.session.authenticated) {
        res.redirect('/');
        return;
    }
    var ingredient = req.body.ingredient
    if (ingredient) {
        await userCollection.updateOne({ email: req.session.email }, { $pull: { UserIngredients: ingredient, SearchIngredients: ingredient } });
    }
    res.redirect('/profile?success=Ingredient removed successfully');
});

module.exports = app;