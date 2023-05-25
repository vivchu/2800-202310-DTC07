# DTC-7 TasteBud
Corey McTavish
McKenzie Nicol
Vivian Chu
Reza Hedieloo

# Project Description
Our project TasteBud, DTC-07, is developing a web app that suggests customized recipes to help people with different dietary preferences/restrictions, cooking ability, time available, and ingredients on hand to prepare healthy meals while reducing food waste with the help of AI.

# Technologies
Database - MongoDB noSQL Database for Users, Recipes, and Sessions
Backend - Node js server
Frontend - EJS
Languages: python (dataset cleaning), javascript, html, css
Other Tech Tools
    - OpenAI API key using GPT-3.5-Turbo
    - Kaggle recipe dataset. Cleaned and made additions to using python scripts and javascript scripts. Then imported to MongoDB as our recipe database.

# Files
│   .env
│   .gitignore
│   databaseConnection.js
│   package-lock.json
│   package.json
│   README.md
│   server.js
│   utils.js
│
├───public
│   └───images
│           header.png
│           logo.png
│           meal.jpg
│           profile.png
│           tastebud.png
│           TasteBuddy.png
│           TasteBuddy_.png
│
├───routes
│       apiRoutes.js
│       authenticationRoutes.js
│       cleanDatabaseRecipeParts.js
│       customizationRoutes.js
│       favoritesRoutes.js
│       profileRoutes.js
│       recipeDetailsRoutes.js
│       searchRoutes.js
│
├───scripts
│       profile.js
│       recipeDetails.js
│       searchIngredients.js
│
└───views
    │   404.ejs
    │   createUser.ejs
    │   customizedRecipeDisplay.ejs
    │   customizeRecipe.ejs
    │   favorite.ejs
    │   forgotPassword.ejs
    │   generatedAIResults.ejs
    │   home.ejs
    │   homeLoggedIn.ejs
    │   login.ejs
    │   profile.ejs
    │   recipeDetails.ejs
    │   savedCustomizedRecipes.ejs
    │   search.ejs
    │   searchDietaryRestriction.ejs
    │   searchIngredients.ejs
    │   searchName.ejs
    │   searchResults.ejs
    │   searchSkill.ejs
    │   verifyanswer.ejs
    │   viewCustomizedRecipe.ejs
    │
    └───templates
            footer.ejs
            header.ejs

# Installation
1. Clone the project using the github repo link and open the project in your IDE
2. Make sure you have Node.js installed on your machine.
3. If Node.js is installed, open a terminal or command prompt.
4. Navigate to the directory where the cloned repo is located using the cd command. 
5. In terminal , enter Bash cd path/to/my-project
6. In the project directory, there should be a package.json file that lists the project's dependencies. 
7. Run ‘npm install’ to install the project dependencies listed in the package.json file
8. Make sure all the dependencies have been installed
9. Create a .env file in the main directory.
10. Reach out to TasteBud team for the connection information that should be in .env file
11. Copy and paste all the information which includes MongoDB database connection information, node session    and MongoDB session secrets and OpenAI API key
12. Run ‘nodemon server.js’ in the terminal
13. Go to your localhost:3000. You should see the project running there.

# Features
1. Intelligent Recipe Search
    Discover the perfect recipe by utilizing our intelligent search functionality. Find recipes by name, explore options suitable for your skill level, or locate dishes based on the ingredients you have on hand. Tastebud's powerful search engine ensures you always find the right recipe for any occasion.

2. AI Customization
    Tastebud employs advanced artificial intelligence algorithms to customize recipes to your specific needs. Whether you want to shorten the cooking time, simplify the steps for beginners, or create a recipe with cost-effective ingredients, Tastebud has got you covered. Enjoy personalized recipes that fit your time, skill, and budget constraints.

3. Favorites Collection
    Never lose track of your favorite recipes again! With Tastebud, you can easily save recipes to your favorites page, creating a personalized collection of culinary delights. Quickly access your go-to recipes whenever you need them, making meal planning a breeze.

4. AI Generated Recipes
    Running low on ingredients? No problem! Tastebud can generate AI-created recipes based on the ingredients you have available. Simply input the ingredients you want to use, and Tastebud will provide you with creative and delicious recipe suggestions to make the most out of your pantry.

5. Profile Page
    Tailor your Tastebud experience to match your culinary preferences. On the profile page, you can:
        - Set your cooking and baking skill levels to receive recipe recommendations suitable for your expertise.
        - Define your typical on-hand ingredients, allowing Tastebud to provide more accurate recipe - suggestions based on what you already have.
        - Specify your dietary preferences and restrictions, ensuring that Tastebud presents you with recipes that align with your specific needs.
        - Easily update your personal account information to keep your profile up to date and tailored to your evolving tastes and preferences.

# Credits and References
Kaggle Dataset:  Food.com - Recipes and Reviews
https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews
    We would like to include a brief description of the dataset we used, which contains recipes sourced from Food.com. This dataset is a valuable resource that encompasses a wide variety of culinary creations, ranging from appetizers to desserts. By leveraging this extensive recipe collection, our app, Tastebud, offers users a diverse range of options to explore and discover new dishes. The inclusion of the Food.com dataset enhances the relevance and richness of our recipe database, providing users with an extensive selection of recipes to search, customize, and enjoy.
ChatGPT API:
https://platform.openai.com/overview
    We would like to acknowledge the invaluable contribution of the ChatGPT API provided by OpenAI in powering the intelligent conversational capabilities of our app, Tastebud. The ChatGPT API plays a crucial role in enabling users to interact seamlessly with our app, allowing them to search for recipes, receive personalized recommendations, and generate AI-created recipes based on their available ingredients. We are grateful to OpenAI for their cutting-edge technology and the transformative impact it has on enhancing the user experience of our app.
ChatGPT by OpenAI:
https://openai.com/blog/chatgpt
    We would like to recognize the utilization of the ChatGPT language model itself in the development of our app, Tastebud. The integration of the ChatGPT language model has significantly contributed to the diverse range of features and capabilities offered by our app. By leveraging the power of ChatGPT, Tastebud enables users to search for recipes, receive personalized recommendations, generate AI-created recipes, and engage in natural language interactions, thereby enhancing their overall culinary experience. We extend our appreciation to OpenAI for providing this exceptional language model that has greatly enriched our app's functionality.

# Licenses
This project utilizes the following third-party dependencies:
    - bcrypt: License: https://github.com/kelektiv/node.bcrypt.js/blob/master/LICENSE  (v5.1.0)
    - body-parser: License: https://github.com/expressjs/body-parser/blob/master/LICENSE  (v1.20.2)
    - connect-mongo: License: https://github.com/jdesboeufs/connect-mongo/blob/master/LICENSE  (v5.0.0)
    - dotenv: License: https://github.com/motdotla/dotenv/blob/main/LICENSE  (v16.0.3)
    - ejs: License: https://github.com/mde/ejs/blob/main/LICENSE  (v3.1.9)
    - express: License: https://github.com/expressjs/express/blob/master/LICENSE  (v4.18.2)
    - express-session: License: https://github.com/expressjs/session/blob/master/LICENSE  (v1.17.3)
    - joi: License: https://github.com/hapijs/joi/blob/master/LICENSE.md  (v17.9.2)
    - mongodb: License: https://github.com/mongodb/node-mongodb-native/blob/main/LICENSE.md  (v5.5.0)
    - mongoose: License: https://github.com/Automattic/mongoose/blob/master/LICENSE.md  (v7.1.0)
    - openai: The OpenAI API may have its own specific terms of use, which can be found on the OpenAI website: https://openai.com/policies/terms-of-use

# Contact Information
cmctavish5@my.bcit.ca
mchu65@my.bcit.ca
mnicol11@my.bcit.ca
rhedieloo@my.bcit.ca

# Feedback and Support
We value your feedback and strive to continuously improve Tastebud. If you have any questions, suggestions, or encounter any issues, please contact our support team at support@tastebud.com. We are here to assist you and ensure your Tastebud experience is nothing short of exceptional.