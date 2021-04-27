//jshint esversion:6
//require modules imports//
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');

//Setup APP an instance of express, use artifacs//
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//Setup mongoDB connections//
//local connections
// mongoose.connect("mongodb://localhost:27017/wikiDB",
 // {'useNewUrlParser': true,'useUnifiedTopology': true});

//remote connections
mongoose.connect("mongodb+srv://admin:PASSWORD@cluster0.tnmth.mongodb.net/wikiDB",
{'useNewUrlParser': true,'useUnifiedTopology': true});
// needs use settings
//mongoose.set('useUnifiedTopology', true);
//mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

//Define DB structure, schema and model//
const articlesSchema = new mongoose.Schema({
  title:String,
  content:String
});

const Article = mongoose.model("Article", articlesSchema);


//startings constants and variables//
const homeStartingContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mollis aliquam ut porttitor leo a. Blandit turpis cursus in hac habitasse. Elementum nisi quis eleifend quam adipiscing vitae proin sagittis. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Nulla facilisi cras fermentum odio eu. Faucibus scelerisque eleifend donec pretium vulputate sapien nec sagittis aliquam. Urna nec tincidunt praesent semper feugiat nibh sed pulvinar. Dui id ornare arcu odio ut sem.";


//start routing on express app//
app.get("/", function(req,res){

  Article.find({}, function(err, foundArticles){
    if(err){
      console.log(err);
    }else{
      res.render("home",{
        theContent: homeStartingContent,
        postsList: foundArticles
      });
      console.log("found some articles, for home page");
    }
  });
});

//////////////////////////Requests Targetting on ALL articles///////////////

app.route("/articles")
.get(function(req,res){
  Article.find({}, function(err, foundArticles){
    if(err){
      console.log(err);
    }else{
      res.send(foundArticles);
      console.log("found some articles, for home page");
    }
  });
})
.post(function(req, res){
  const newArticle = new Article (
    {
      title: req.body.title,
      content: req.body.content
    }
  );
  newArticle.save(function(err){
    if(!err){
      res.send("Successfully added a new article.")
    }else{
      res.send(err);
    }
  });
})
.delete(function(req,res){
  Article.deleteMany({},function(err){
    if(!err){
      res.send("Successfully delete all articles");
    }else{
      res.send(err);
    }
  });
});

// Easiest way to RESTfull over the same route
// app.get("/articles", );
// app.post("/articles", );
// app.delete("/articles", );

//////////////////////////Requests Targetting on ONE article///////////////

app.route("/article/:articleId")
.get(function(req,res){
  console.log(req.params.articleId);
  const requestArticleId = _.lowerCase(req.params.articleId);
  let flag = "no match ..."

  Article.findById(req.params.articleId, function (err, articleFound) {
    if(err){
      console.log(err);
    }else{
      flag = "done ... id Match found!";
      res.render("article", {
        theTitle: articleFound.title,
        theContent: articleFound.content,
        result: flag,
        articleId:articleFound._id
      });
      console.log(flag)
    }
  })
})
.post()
.patch(function(req,res){
  Article.update(
    {_id:req.params.articleId},
    {$set: req.body},
    function(err){
      if(!err){
        res.send("Successfully update the article");
      }else{
        res.send(err);
      }
    }
  )
})
.put(function(req,res){
  Article.update(
    {_id:req.params.articleId},
    {title:req.body.title, content:req.body.content},
    {overwrite:true},
    function(err,doc){
      if(!err){
        res.send("Successfully update!");
      }else{
        res.send(err);
      }
    }
  )
})
.delete(function(req,res){
  console.log(req);
  res.send("Delete");
  // Article.deleteById(
  //   req.params.articleId,
  //   function(err){
  //     if(!err){
  //       res.send("Successfully delete the Article");
  //     }else{
  //       res.send(err);
  //     }
  //   }
  // )
});

//Start Server listening
//wait for Heroku to give us a port.
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3010;
  //otherwise take localhost
}
app.listen(port, function(){
  console.log("Server has started and listening on port "+port);
});
