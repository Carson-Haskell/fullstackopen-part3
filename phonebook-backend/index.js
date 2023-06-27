const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Person = require("./models/person");

const app = express();

morgan.token("body", (res, req) => {
  if (res.method !== "POST") return "No body provided";

  return JSON.stringify(res.body);
});

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(morgan(":method :url :status - :response-time ms - :body"));

app.get("/", (req, res) => {
  res.send(
    "<p>A simple api for getting users from a phonebook. Navigate to '/api/people' to get the data'</p>"
  );
});

app.get("/api/people", (req, res) => {
  Person.find({}).then(person => res.json(person));
});

app.get("/info", async (req, res) => {
  const reqTime = new Date();
  const phonebookLength = await Person.find().estimatedDocumentCount();
  console.log(phonebookLength);

  res.send(
    `<p>Phonebook has info for ${phonebookLength} ${
      phonebookLength == 1 ? "person" : "people"
    }</p>
    <p>${reqTime}</p>`
  );
});

app.get("/api/people/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => res.json(person))
    .catch(err => next(err));
});

app.post("/api/people", (req, res, next) => {
  const { name, number } = req.body;

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then(savedPerson => res.json(savedPerson))
    .catch(err => next(err));
});

app.put("/api/people/:id", (req, res, next) => {
  const { name, number } = req.body;

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    { new: true, runValidators: true, context: "query" }
  )
    .then(updatedPerson => res.json(updatedPerson))
    .catch(err => next(err));
});

app.delete("/api/people/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => res.status(204).end())
    .catch(err => next(err));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error.message);

  // If error is invalid object id for Mongo
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }
  // If error fails personSchema validation
  else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }

  // Otherwise, pass error to default Express error handler
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
