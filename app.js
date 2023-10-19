const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");

const graphqlSchema = require("./graphql/schema/index");
const graphqlResolvers = require("./graphql/resolvers/index");
const app = express();





//middle wares
app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
  })
);

app.get("/", (req, res, next) => {
  res.send("hello test");
});

//connect to the DB
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.v6sp6zi.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("Connected to the Datbase");
    app.listen(3000, () => {
      console.log(`http://localhost:3000`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
