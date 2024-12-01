const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const time = require("./time");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const Contact = require("./models/contact");
const dotenv = require("dotenv");

dotenv.config();

mongoose.set("strictQuery", false);

morgan.token("req-body", (req) => {
  // Log the body for POST
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'malformatted id' })
  } 
  next(error)
}

// middleware
// Serve static files from the 'dist' folder
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.json());
// express error handler must be the last middleware
app.use(cors());
// Use morgan with custom format to log method, url, headers, and req body
app.use(
  morgan(":method :url :status :res[content-length] :req[headers] :req-body")
);
app.use(errorHandler)

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
];

const timestamp = time.getFormattedTimestamp();

app.get("/", (req, res) => {
  try {
    return res.sendFile(path.join(__dirname, "dist", "index.html"));
  } catch (error) {
    // If an error occurs, send a 500 status code (Internal Server Error)
    console.error(error);
    return res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/api/persons", async (req, res) => {
  try {
    const contacts = await Contact.find({});
    return res.json(contacts);
  } catch (error) {
    // If an error occurs, send a 500 status code (Internal Server Error)
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the data" });
  }
});

app.get("/api/info", (req, res) => {
  try {
    if (persons.length === 1) {
      return res.status(200).send(`
        <h1>Phonebook has info for ${persons.length} person</h1>
        <p>${timestamp}</p>`);
    }

    if (persons.length > 1) {
      return res.status(200).send(`
        <h1>Phonebook has info for ${persons.length} persons</h1>
        <p>${timestamp}</p>`);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while fetching the information" });
  }
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Contact.findById(id).
  then((contact) => {
    if (contact) {
      return res.status(200).json(contact);
    } else {
      return res.status(404).json({ error: "Contact not found" });
    }
  })
  .catch(error => next(error))
  });

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Contact.findByIdAndDelete(id)
  .then((contact) => {
    if (!contact) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.status(200).json({
      message: `The contact with ID ${id} has been deleted successfully`,
    });
  })
  .catch(error => next(error))
});

app.post("/api/persons", (req, res) => {
  try {
    const { name, number } = req.body;

    // Basic validation: Ensure name and number are provided
    if (!name || !number) {
      return res
        .status(400)
        .json({ error: "Both name and number are required" });
    }

    /*  const nameExists = persons.find((person) => person.name === name); */

    /*   if (nameExists) {
      return res.status(409).json({
        error: "Sorry, this contact name is already in the phonebook.",
      });
    } */

    // Generate a unique ID
    const id = `${Math.floor(Math.random() * 1000000)}-${
      persons.length
    }`.toString();

    const newPerson = new Contact({
      id: id,
      name: name,
      number: number,
    });

    newPerson.save().then((savedPerson) => {
      return res.json(savedPerson);
    });

    /*    return res.status(201).json({
      message: `${name} has been added to the phonebook`,
      person: newPerson,
    }); */
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "An error occurred while posting the data" });
  }
});

// Function to connect to the database
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to the database");
  } catch (error) {
    console.error("Database connection error:", error.message);
  }
}

// Call the connectDB function and catch any errors
connectDB().catch((err) => console.log(err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
