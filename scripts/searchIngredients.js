$(document).ready(function() {
    // Add Ingredient Form Submission
    $("#addIngredientForm").submit(function(event) {
        event.preventDefault();
        var ingredient = $("#ingredientName").val();
        if (ingredient.trim() === "") {
            alert("Please enter an ingredient.");
            return;
        }
        $.ajax({
            url: "/addSearchIngredient",
            type: "POST",
            data: { ingredient: ingredient },
            success: function(response) {
                // Clear the input field
                $("#ingredientName").val("");
                // Close the modal
                $("#addIngredientModal").modal("hide");
                // Refresh the page or update the ingredient list dynamically
                location.reload();
            },
            error: function(error) {
                console.log(error);
                alert("An error occurred while adding the ingredient. Please try again.");
            }
        });
    });

    // Edit Ingredient Form Submission
    $("#editIngredientForm").submit(function(event) {
        event.preventDefault();
        var oldIngredient = $("#oldIngredient").val();
        var newIngredientName = $("#newIngredientName").val();
        if (newIngredientName.trim() === "") {
            alert("Please enter a new ingredient name.");
            return;
        }
        $.ajax({
            url: "/editSearchIngredient",
            type: "POST",
            data: {
                oldIngredient: oldIngredient,
                newIngredientName: newIngredientName
            },
            success: function(response) {
                // Close the modal
                $("#editIngredientModal").modal("hide");
                // Refresh the page or update the ingredient list dynamically
                location.reload();
            },
            error: function(error) {
                console.log(error);
                alert("An error occurred while editing the ingredient. Please try again.");
            }
        });
    });

    // Edit Ingredient Modal Open
    $(".edit-ingredient-btn").click(function() {
        var oldIngredient = $(this).val();
        $("#oldIngredient").val(oldIngredient);
        $("#newIngredientName").val(oldIngredient);
        $("#editIngredientModal").modal("show");
    });

    // Remove Ingredient
    $(".remove-ingredient-btn").click(function() {
        // get the value of the remove-ingredient-btn
        var ingredient = $(this).val();
        if (confirm("Are you sure you want to remove the ingredient: " + ingredient + "?")) {
            $.ajax({
                url: "/removeSearchIngredient",
                type: "POST",
                data: { ingredient: ingredient },
                success: function(response) {
                    // Refresh the page or update the ingredient list dynamically
                    location.reload();
                },
                error: function(error) {
                    console.log(error);
                    alert("An error occurred while removing the ingredient. Please try again.");
                }
            });
        }
    });

    // Remove all search ingredients
    $("#removeAllSearchIngredients").click(function() {
        if (confirm("Are you sure you want to remove all search ingredients?")) {
            $.ajax({
                url: "/removeAllSearchIngredients",
                type: "POST",
                success: function(response) {
                    // Refresh the page
                    location.reload();
                },
                error: function(error) {
                    console.log(error);
                    alert("An error occurred while removing all search ingredients. Please try again.");
                }
            });
        }
    });
});