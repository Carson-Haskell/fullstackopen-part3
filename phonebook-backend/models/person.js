require("dotenv").config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to", url);

mongoose
  .connect(url)
  .then(res => console.log("connected to MongoDB"))
  .catch(err => console.log(err));

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: number => {
        const validNumber = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
        return validNumber.test(number);
      },
      message: 'Error: number must be of format "xxx-xxx-xxxx"',
    },
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString();
    delete returnedObj._id;
    delete returnedObj.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
