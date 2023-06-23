const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

morgan.token("body", (res, req) => {
  if (res.method !== "POST") return "No body provided";

  return JSON.stringify(res.body);
});

app.use(morgan(":method :url :status - :response-time ms - :body"));

let people = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (req, res) => {
  res.send(
    "<p>A simple api for getting users from a phonebook. Navigate to '/api/people' to get the data'</p>"
  );
});

app.get("/api/people", (req, res) => {
  res.json(people);
});

app.get("/info", (req, res) => {
  const reqTime = new Date();

  res.send(
    `<p>Phonebook has info for ${people.length} ${
      people.length == 1 ? "person" : "people"
    }</p>
    <p>${reqTime}</p>`
  );
});

app.get("/api/people/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = people.find(person => person.id === id);

  person ? res.json(person) : res.status(404).end();
});

app.delete("/api/people/:id", (req, res) => {
  const id = Number(req.params.id);
  people = people.filter(person => person.id !== id);

  res.status(204).end();
});

const checkDuplicate = name => people.some(person => person.name === name);

app.post("/api/people", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name and number required",
    });
  }

  const duplicate = checkDuplicate(name);

  if (duplicate) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name,
    number,
    id: Math.random(),
  };

  people = [...people, person];

  res.json(person);
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
