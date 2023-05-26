fetch('/favorites/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ recipeId }),
})
  .then((response) => response.json())
  .then((data) => {
    // Handle the response from the server
    if (data.favorited) {
      favoriteBtn.classList.add('btn-success'); // Change button color to success
      isFavorite = true;
      console.log(isFavorite)
      console.log("Recipe is favorited");
    }
    else {
      isFavorite = false;
      console.log(isFavorite)
      console.log("Recipe is not favorited");
    }
  })
  .catch((error) => {
    console.error('Error checking if recipe is favorited:', error);
  });


favoriteBtn.addEventListener('click', () => {
    
  if (isFavorite) {
    // Recipe is already a favorite, so remove it
    removeFromFavorites(recipeId);
    //reload page
    location.reload();
  } else {
    // Recipe is not a favorite, so add it
    addToFavorites(recipeId);
    location.reload();
  }
});

function addToFavorites(recipeId) {
  // Send an AJAX request to add the recipe to favorites
  fetch('/favorites/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipeId }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      if (data.success) {
        favoriteBtn.classList.add('btn-success'); // Change button color to success
        isFavorite = true;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function removeFromFavorites(recipeId) {
  // Send an AJAX request to remove the recipe from favorites
  console.log("remove from favorites");
  fetch('/favorites/remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ recipeId }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the server
      if (data.success) {
        favoriteBtn.classList.remove('btn-success'); // Change button color to success
        isFavorite = false;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}