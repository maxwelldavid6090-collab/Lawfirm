const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "messages.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ contacts: [] }, null, 2), "utf8");
}

function readDatabase() {
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

function writeDatabase(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}

function addContact(contact, callback) {
  try {
    const data = readDatabase();
    data.contacts.push(contact);
    writeDatabase(data);
    callback(null);
  } catch (error) {
    callback(error);
  }
}

module.exports = { addContact };
