# TasteBud
 
## Project Description
 
Our project TasteBud, DTC-07, is developing a web app that suggests customised recipes to help people with different dietary preferences/restrictions, cooking ability, time available, and ingredients on hand to prepare healthy meals while reducing food waste with the help of AI.


## Technologies used 
- Database: MongoDB (noSQL Database used for Users, Recipes, and Sessions)
- Backend: Node.js server
- Frontend: EJS
- Other Tech Tools:
- OpenAI API key using GPT-3.5-Turbo
- Kaggle recipe dataset, cleaned and made additions to using Python and JavaScript scripts. Then imported to MongoDB as our recipe database.


## File Contents of folder

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
    │   api.ejs
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
    │   searchIngredientsNotLoggedIn.ejs
    │   searchName.ejs
    │   searchResults.ejs
    │   searchSkill.ejs
    │   verifyanswer.ejs
    │   viewCustomizedRecipe.ejs
    │
    └───templates
            footer.ejs
            header.ejs
            users.ejs


## Installation and Running the Project 

1. Clone the project using the github repo link and open the project in your IDE
2. Make sure you have Node.js installed on your machine. https://nodejs.org/en/download
3. If Node.js is installed, open a terminal or command prompt.
4. Navigate to the directory where the cloned repo is located using the cd command. 
5. Download Studio 3T https://studio3t.com/download/
6. Download the Kaggle Dataset.  https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews resource=download  
7. Copy and Paste the code below to modify the Database to store the first 103,426 recipes 
    ```
    const collection = db.getCollection("recipes");
    // Get the IDs of the first 103,426 items
    const idsToKeep = collection.find({}, { _id: 1 }).limit(103426).map(doc => doc._id);
    // Delete all items except the ones in idsToKeep
    const deleteResult = collection.deleteMany({ _id: { $nin: idsToKeep } });
    ```
8. In terminal , enter Bash cd path/to/my-project
9. In the project directory, there should be a package.json file that lists the project's dependencies. 
10. Run ‘npm install’ to install the project dependencies listed in the package.json file
11. Make sure all the dependencies have been installed
12. Create a .env file in the main directory.
13. Reach out to TasteBud team for the connection information that should be in .env file
14. Copy and paste all the information which includes MongoDB database connection information, node session and MongoDB session secrets and OpenAI API key
15. Run ‘nodemon server.js’ in the terminal
16. Go to your localhost:3000 port. You should see the project running there.


## How to Use the Product
### TasteBud offers the following features:

Features
1. Intelligent Recipe Search
Discover the perfect recipe by utilizing our intelligent search functionality. Find recipes by name, explore options suitable for your skill level, or locate dishes based on the ingredients you have on hand. Tastebud's powerful search engine ensures you always find the right recipe for any occasion.

2. AI Customization
Tastebud employs advanced artificial intelligence algorithms to customize recipes to your specific needs. Whether you want to shorten the cooking time, simplify the steps for beginners, or create a recipe with cost-effective ingredients, Tastebud has got you covered. Enjoy personalized recipes that fit your time, skill, and budget constraints.

3. Favorites Collection
Never lose track of your favorite recipes again! With Tastebud, you can easily save recipes to your favorites page, creating a personalized collection of culinary delights. Quickly access your go-to recipes whenever you need them, making meal planning a breeze.

4. AI-Generated Recipes
Running low on ingredients? No problem! Tastebud can generate AI-created recipes based on the ingredients you have available. Simply input the ingredients you want to use, and Tastebud will provide you with creative and delicious recipe suggestions to make the most out of your pantry.

5. Profile Page
Tailor your Tastebud experience to match your culinary preferences. On the profile page, you can:

Set your cooking and baking skill levels to receive recipe recommendations suitable for your expertise.
Define your typical on-hand ingredients, allowing Tastebud to provide more accurate recipe suggestions based on what you already have.
Specify your dietary preferences and restrictions, ensuring that Tastebud presents you with recipes that align with your specific needs.
Easily update your personal account information to keep your profile up to date and tailored to your evolving tastes and preferences.


## Include Credits, References, and Licenses

### Credits and References
1. Kaggle Dataset - Food.com - Recipes and Reviews 
- Link to Kaggle dataset: [https://www.kaggle.com/datasets/irkaal/foodcom-recipes-and-reviews]
- We would like to include a brief description of the dataset we used, which contains recipes sourced from Food.com. This dataset is a valuable resource that encompasses a wide variety of culinary creations, ranging from appetizers to desserts. By leveraging this extensive recipe collection, our app, Tastebud, offers users a diverse range of options to explore and discover new dishes. The inclusion of the Food.com dataset enhances the relevance and richness of our recipe database, providing users with an extensive selection of recipes to search, customize, and enjoy.
2. ChatGPT API
- Link to ChatGPT API[https://platform.openai.com/overview]
- We would like to acknowledge the invaluable contribution of the ChatGPT API provided by OpenAI in powering the intelligent conversational capabilities of our app, Tastebud. The ChatGPT API plays a crucial role in enabling users to interact seamlessly with our app, allowing them to search for recipes, receive personalized recommendations, and generate AI-created recipes based on their available ingredients. We are grateful to OpenAI for their cutting-edge technology and the transformative impact it has on enhancing the user experience of our app.
3. ChatGPT by OpenAI 
- Link to the ChatGPT website or GitHub repository.
- We would like to recognize the utilization of the ChatGPT language model itself in the development of our app, Tastebud. The integration of the ChatGPT language model has significantly contributed to the diverse range of features and capabilities offered by our app. By leveraging the power of ChatGPT, Tastebud enables users to search for recipes, receive personalized recommendations, generate AI-created recipes, and engage in natural language interactions, thereby enhancing their overall culinary experience. We extend our appreciation to OpenAI for providing this exceptional language model that has greatly enriched our app's functionality.


## Licenses

This project utilizes the following third-party dependencies:

bcrypt: License:[https://github.com/kelektiv/node.bcrypt.js/blob/master/LICENSE]  (v5.1.0)
body-parser: License: [https://github.com/expressjs/body-parser/blob/master/LICENSE] (v1.20.2)
connect-mongo: License:[https://github.com/jdesboeufs/connect-mongo/blob/master/LICENSE]  (v5.0.0)
dotenv: License:[https://github.com/motdotla/dotenv/blob/main/LICENSE] (v16.0.3)
ejs: License:[https://github.com/mde/ejs/blob/main/LICENSE] (v3.1.9)
express: License:[https://github.com/expressjs/express/blob/master/LICENSE] (v4.18.2)
express-session:[https://github.com/expressjs/session/blob/master/LICENSE] License:  (v1.17.3)
joi: License:[https://github.com/hapijs/joi/blob/master/LICENSE.md] (v17.9.2)
mongodb: License:[https://github.com/mongodb/node-mongodb-native/blob/main/LICENSE.md] (v5.5.0)
mongoose: License:[https://github.com/Automattic/mongoose/blob/master/LICENSE.md]  (v7.1.0)
openai: The OpenAI API may have its own specific terms of use, which can be found on the OpenAI website[https://openai.com/policies/terms-of-use] 
 
# AI section
 
## Did you use AI to help create your app? If so, how? 
 
Yes, we utilized AI in the development of our app. Here are the specific use cases:
 
- We used chatGPT to assist us in generating code for our project, as documented in our chatlog.
- We integrated the OpenAI GPT-3.5-Turbo API engine to generate recipes based on user-inputted ingredients.
- The same API was used to provide measurement units for each recipe.
- We employed the API to customize any recipe in our database through three options: making it easier, quicker, or cheaper. The API helped generate a modified recipe.
 
## Did you use AI to create data sets or clean data sets? If so, how? 
 
Yes, we used AI in the following ways for data sets:
 
- Initially, we utilized chatGPT to generate Python scripts for dataset cleaning and creating necessary columns in our dataset.
- We faced challenges while attempting to create array elements in a CSV format using a Python script and uploading them to Studio 3T. To overcome this, we opted for an alternative approach leveraging ChatGPT's capabilities. We prompted ChatGPT to provide us with a JavaScript route that would clean or clear a designated section of the database for optimal functionality.
- It's important to note that this process required multiple iterations of prompts and interactions with ChatGPT. Each recipe had unique characteristics, requiring refinement and adjustment during the prompt iterations for desired outcomes.
 
## Does your app use AI? If so, how?
 
Yes, our app incorporates AI in various ways:
 
- It allows users to customize recipes based on available ingredients. AI is used to generate recipes that contain the given ingredients or find recipes exclusively containing them.
- The app also enables customization of any recipe in the database using AI. Users can make recipes easier, quicker, or cheaper with a simple click.
 
## Did you encounter any limitations? How did you overcome them? 
 
During the development process, we encountered some limitations which we resolved with the assistance of AI:
 
- Initially, we had no means to search for recipes based on skill level. To address this, we employed chatGPT to develop a Python script that calculated a difficulty rating based on certain columns in our dataset. This allowed us to implement skill level-based search.
- We faced an issue with our dataset lacking measurement units for ingredients in the recipes. To overcome this, we utilized the power of AI by making an API call to the OpenAI GPT-3.5-Turbo engine. The engine provided us with the most likely measurement units for the desired recipe.
 
## Contact Information
 
## Feedback and Support 
 
We highly value your feedback and strive for continuous improvement. If you have any questions, suggestions, or encounter any issues, please don't hesitate to contact our support team at support@tastebud.com. We are here to assist you and ensure your TasteBud experience is nothing short of exceptional.
 
## BCIT Emails
 
- cmctavish5@my.bcit.ca
- mchu65@my.bcit.ca
- rhedieloo@my.bcit.ca
- mnicol11@my.bcit.ca
