import pandas as pd
import re

# Read the csv file into a pandas dataframe
df = pd.read_csv('recipes.csv')


# Define a function to calculate the difficulty rating based on preptime and number of ingredients
def calculate_difficulty(row):
    # Extract the amount of time from the PrepTime column
    preptime = re.search(r'PT(\d+)([HMS])', row['PrepTime'])
    if preptime:
        time = int(preptime.group(1))
        unit = preptime.group(2)
        if unit == 'H':
            time *= 60
        elif unit == 'S':
            time /= 60
    else:
        time = 0

    # Count the number of ingredients in the RecipeIngredientParts column
    ingredients = row['RecipeIngredientParts']
    num_ingredients = len(ingredients.split(','))

    # Calculate the difficulty rating
    if num_ingredients == 0:
        difficulty = 'Unknown'
    elif time == 0:
        difficulty = 'Easy'
    elif num_ingredients <= 5 and time <= 30:
        difficulty = 'Easy'
    elif num_ingredients <= 10 and time <= 60:
        difficulty = 'Medium'
    else:
        difficulty = 'Hard'

    return difficulty


# Add a new column to the dataframe with the difficulty rating for each recipe
df['Difficulty'] = df.apply(calculate_difficulty, axis=1)

# Write the updated dataframe to a new csv file
df.to_csv('recipes_with_difficulty.csv', index=False)