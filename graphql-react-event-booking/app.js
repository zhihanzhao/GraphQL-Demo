const express = require("express");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Event = require("./models/event");
const User = require("./models/user");
const app = express();

const events = [];

//middle wares
app.use(bodyParser.json());
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
        type Event{
            _id: ID!,
            title: String!,
            description: String!,
            price: Float!,
            date: String!
        }

        type User {
            _id: ID!,
            email: String!,
            password: String
        }

        input EventInput {
            title: String!, 
            description: String!, 
            price: Float!, 
            date: String!

        }

        input UserInput {
            email: String!,
            password: String!
        }

        type RootQuery {
            events: [Event!]!

        }

        type RootMutation {
            createEvent(eventInput : EventInput ): Event
            createUser(userInput: UserInput): User

        }

        schema{
            query: RootQuery
            mutation: RootMutation
        }
    `),
    //resolvers : just function
    rootValue: {
      events: () => {
        return Event.find()
          .then((result) => {
            console.log(result);
            return result;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        //save the data in database
        return event // need the return key words
          .save()
          .then((result) => {
            console.log(result);
            //return { ...result._doc };
            return result;
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
      createUser: (args) => {
        return User.findOne({ email: args.userInput.email })
          .then((user) => {
            console.log(user);
            if (user) {
                throw new Error("User exited already.");
            }
            return bcrypt.hash(args.userInput.password, 12);
          })
          .then((hashedPassword) => {
            const user = new User({
              email: args.userInput.email,
              password: hashedPassword,
            });
            return user.save();
          })
          .then((result) => {
            console.log("created" + result);
            return {...result._doc, password: null};
          })
          .catch((err) => {
            console.log(err);
            throw err;
          });
      },
    },
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
