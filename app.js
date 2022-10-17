const express = require("express");
const bodyParser = require("body-parser");
const https =  require("https")
const app = express();
const axios = require("axios");
const ejs = require("ejs")
const mongoose = require("mongoose");
const _ = require("lodash");
app.use(express.static("public"));


let recipes = [];
let quickrecipes = [];
const savedreciped = [];
const word = "word"
//to use the body parser
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');

// connect to database
mongoose.connect("mongodb+srv://Namatirai:26november@healthyfit.t7dbehu.mongodb.net/Healthyfit?retryWrites=true&w=majority")
//mongodb+srv://Namatirai:<password>@healthyfit.t7dbehu.mongodb.net/?retryWrites=true&w=majority
// Recipelink Schema
const recipeSchema = new mongoose.Schema({
  link:String
})
//recipelink model

const Recipelink =  new mongoose.model('RecipeLinks',recipeSchema);

app.get("/",function(req,res){
// res.sendFile(__dirname + "/index.html")
res.render("index");
});
app.get("/food",function(req,res){
// res.sendFile(__dirname + "/index.html")
res.render("food");
});
app.get("/recipes",function(req,res){
// res.sendFile(__dirname + "/index.html")
res.render("recipes",{Recipes:recipes});

});
app.get("/quickmeals",function(req,res){
    res.render("quickmeals",{Meals:quickrecipes});
})
app.get("/meals",function(req,res){
    res.render("meals",{Meals:quickrecipes});
})

app.get("/failure",function(req,res){
  res.render("failure")
})

app.get("/savedrecipes",function(req,res){
  Recipelink.find({},function(err,founditems){
    if(!err){
      res.render("savedrecipes",{Recipelink:founditems})
      console.log(founditems);
    }else{
      console.log(err);
    }
  })
})
app.post("/recipes",function(req,res){
     main = req.body.main
const type =req.body.mealtype
const diet = req.body.diettype
   const query = req.body.main
   // const cuisine = req.body.cuisine
  const includeIngredients = req.body.ingridient1
const minCalories = req.body.minCalories
const maxCalories = req.body.maxCalories
   const includeIngredients3 = req.body.ingridient3
  const addRecipeInformation = true;
   const apiKey = "4d682c7903274554ba6ae59a1220ad75"
    const foodurl = "https://api.spoonacular.com/recipes/complexSearch?" +
     "&apiKey=" +apiKey
     + "&query=" + query+"&type=" +type+"&diet="+diet+
       "&includeIngredients=" +includeIngredients
       + "&addRecipeInformation="+ addRecipeInformation+ "&minCalories="+ minCalories+ "&maxCalories="+ maxCalories

  axios.get(foodurl)

  .then(function(response){
recipes = [];
 for (var i = 0; i < response.data.results.length; i++) {

   const recipe = {
     foodTitle:response.data.results[i].title,
     foodimage:response.data.results[i].image,
     recipelink:response.data.results[i].spoonacularSourceUrl,
     recipeCalories:response.data.results[i].nutrition.nutrients[0].amount,
     caloriesunit:response.data.results[i].nutrition.nutrients[0].unit
   }
recipes.push(recipe);

 }
if(recipes.length === 0){
  res.redirect("failure");
}else{
  res.redirect("recipes");
}


}).catch(function (error) {
   console.log("new error");
  res.redirect("failure");
 });



});

app.post("/quickmeals",function(req,res){
  const maxReadyTime = 10;
  const apiKey = "4d682c7903274554ba6ae59a1220ad75";
  const mealurl = "https://api.spoonacular.com/recipes/complexSearch?"+"&apiKey=" +apiKey +"&maxReadyTime="+ maxReadyTime+"&addRecipeInformation="+true
  axios.get(mealurl)
  .then(function(response){
    quickrecipes = [];
    for (var i = 0; i < response.data.results.length; i++) {

    const quickmeals = {
      mealTitle:response.data.results[i].title,
      mealimage:response.data.results[i].image,
      meallink:response.data.results[i].spoonacularSourceUrl,
    }
    quickrecipes.push(quickmeals);
    console.log(quickrecipes);
    }
    // console.log(response)
  }).catch(function(error){
    console.log(error);
  })
 res.redirect("meals")
})

app.post("/savedrecipes", function(req,res){
const recipelink = req.body.checkeditem;
const recipename = req.body.namelabel;
console.log(req.body.recipename);
const recipe1 = new Recipelink(
  {
    link: recipelink
  })
  recipe1.save();
   res.redirect("recipes")
})

app.get("/recipes/:recipename",function(req,res){
  const requested_title = _.capitalize(req.params.recipename);
  console.log(recipes);
recipes.forEach(function(recipe){
  const storedtitle = _.capitalize(recipe.foodTitle)
if (storedtitle === requested_title) {
  res.render("recipe",{
    title:recipe.title
  })

}
})

})
app.listen(4000,function(req,res){
  console.log("server running on port 4000")
})
