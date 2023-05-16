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
    var user = await userCollection.find({ email: req.session.email }).project({ username: 1, email: 1, cookingSkill: 1, bakingSkill: 1, secretquestion: 1, secretanswer: 1, _id: 1 }).toArray();
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
        await userCollection.updateOne({ email: req.session.email }, { $set: { username: newUsername } });
        req.session.username = newUsername;
    }
    if (newEmail) {
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
        await userCollection.updateOne({ email: req.session.email }, { $set: { secretquestion: secretQuestion, secretanswer: hashSecretAnswer } });
    }
    res.redirect('/profile?success=Secret question updated successfully');
});


module.exports = app;