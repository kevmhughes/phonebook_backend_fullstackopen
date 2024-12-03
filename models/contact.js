// contact schema
const { Schema, model } = require("mongoose");

// Capitalize the first letter of each word in a string
function capitalizeWords(str) {
  return str
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

const contactSchema = new Schema({
  id: String,
  name: {
    type: String,
    minLength: 3,
    maxLength: 20,
    required: true,
    match: /^[A-Za-z\s]+$/, // Only letters and spaces are allowed
    set: capitalizeWords, // Automatically capitalize first letter of each word before saving
  },
  number: {
    type: String,
    minLength: 8,
    maxLength: 13,
    required: true,
    validate: {
      validator: function (v) {
        // The regex matches phone numbers with 2 or 3 digits, a hyphen, and 6 to 9 digits after the hyphen.
        return /^\d{2,3}-\d{6,9}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
});

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Contact = model("Contact", contactSchema);

module.exports = Contact;
