const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");
const Booking = require("../../models/booking");
const user = require("../../models/user");

const fetchEvents = async (eventIds) => {
    console.log(" ==========fetching Event by Id ==========");
    try {
        const events = await Event.find({_id : {$in : eventIds}});
        //again and again 
        return events.map(event => {
            return {
                ...event._doc,
                creator: fetchUser.bind(this, event.creator)
            };
        });
        return events;  
    } catch (error) {
        throw error;
    }

}

const fetchSingleEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        return {
            ...event._doc,
            creator: fetchUser.bind(this, event.creator)
        };      
    } catch (error) {
        throw error;
    }
}


const fetchUser = async (userId) => {
    console.log(" ==========fetching User by Id ==========");
    try {
        const user = await User.findById(userId);
        return {
            ...user._doc,
            createdEvents: fetchEvents.bind(this, user.createdEvents)
          }   
    } catch (error) {
        throw error;
        
    }
  }


module.exports = {
    // //promise chian
    // events: () => {
    //   return Event.find()
    //     .then((result) => {   
    //       return result.map((event) => {
    //         let updatedEvent = {
    //           ...event._doc,
    //           creator: fetchUser.bind(this, event._doc.creator)
    //         }
    //         return updatedEvent
    //       })   
    //     })
    //     .catch((err) => {
    //       console.log('jkjkjk');
    //       throw err;
    //     });
    // },
    events: async () => {
        try {
            const events =  await Event.find();
            return events.map((event) => {
                const updatedEvent = {
                    ...event._doc,
                    creator : fetchUser.bind(this, event.creator)
                    // creaotr: fetchUser(event.creator)
                }
                console.log(updatedEvent);
                return updatedEvent;
            });     
        } catch (error) {
            throw error
        }
    },
    bookings: async(args) => {
    },
    createEvent: async (args) => {
      try {
        //createEvent with user 
        //get user id 
        const userId = "6528758d40c559a7b8582ef5"; 
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator : userId 
        });
        //save the data in database
        const createdEvent = await event.save();
        const user = await User.findById(userId);
        if(!user){
            throw new Error('User not exists');
        }
        user.createdEvents.push(createdEvent);
        await user.save();
        console.log(createdEvent)
        return {
            ...createdEvent._doc, 
            date: new Date(event._doc.date).toISOString(),                    
            creator : fetchUser.bind(this, event.creator)
        };
      } catch (error) {
        throw error;
      }

    },
    createUser: async (args) => {
        try {
            const userExists = User.findOne({ email: args.userInput.email });
            console.log(userExists);
            if(userExists){
                throw new Error("User exited already.");
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({
                email: args.userInput.email,
                password: hashedPassword,
              });
            const createdUser = await user.save();
            return createdUser;
            // return {...createdUser._doc, password: null}; 
        } catch (error) {
            throw error
        }
    },
    bookEvent: async (args) => {
        const userId = "";
        const fetchedEvent = await Event.findById({_id: args.eventId});
        const booking = new Booking({
            user: userId,
            event: fetchedEvent
        });
        const result = await booking.save();
        return {
            ...result._doc,
            user: fetchUser.bind(this, booking.user),
            event: fetchSingleEvent.bind(this,booking.event)
        }
    },
    cancelBooking:(args) => {

    }
  }