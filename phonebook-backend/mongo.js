const mongoose = require('mongoose');

// Expected: node mongo.js dbpassword name phonenumber
const args = process.argv;

// No password provided
if (args.length < 3) {
  console.log('Password required');
  process.exit();
}

// Missing number argument
if (args.length === 4) {
  console.log('Please provide name and number');
  process.exit();
}

// Too many arguments or name not enclosed in quotations
if (args.length > 5) {
  console.log(
    'Error, too many arguments given. Arguments required: password, name, and phone number.\nNote: if first and last name provided, please enclose name in quotations.\nNote: if number contains spaces, please enclose in quotations.',
  );
  process.exit();
}

const password = args[2];
const name = args[3];
const number = args[4];

const url = `mongodb+srv://carson:${password}@cluster0.s0rm30h.mongodb.net/phonebook`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model('Person', personSchema);

// If program is executed with only password provided, simply return all people in db
if (args.length === 3) {
  Person.find({}).then((people) => {
    if (people.length < 1) {
      console.log('phonebook is empty!');
      mongoose.connection.close();
      process.exit();
    }

    console.log('phonebook:');
    people.forEach((person) => console.log(person.name, person.number));

    mongoose.connection.close();
  });
} else {
  // Otherwise, create new person in db
  const person = new Person({
    name,
    number,
  });

  person.save().then((savedPerson) => {
    console.log(`added ${savedPerson.name} ${savedPerson.number} to phonebook`);
    mongoose.connection.close();
  });
}
