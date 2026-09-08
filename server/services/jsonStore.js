const fs = require("fs");
const path = require("path");

const dataDirectory = path.join(__dirname, "../data");

function filePath(collection) {
  return path.join(dataDirectory, `${collection}.json`);
}

function ensureCollection(collection) {
  fs.mkdirSync(dataDirectory, { recursive: true });
  const target = filePath(collection);
  if (!fs.existsSync(target)) fs.writeFileSync(target, "[]\n", "utf8");
  return target;
}

function readAll(collection) {
  const raw = fs.readFileSync(ensureCollection(collection), "utf8");
  return raw.trim() ? JSON.parse(raw) : [];
}

function writeAll(collection, records) {
  const target = ensureCollection(collection);
  const temporary = `${target}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  fs.renameSync(temporary, target);
  return records;
}

function findMany(collection, predicate = () => true) { return readAll(collection).filter(predicate); }
function findOne(collection, predicate) { return readAll(collection).find(predicate) || null; }
function create(collection, record) { const records = readAll(collection); records.push(record); writeAll(collection, records); return record; }
function update(collection, id, changes) { const records = readAll(collection); const index = records.findIndex((record) => record.id === id); if (index < 0) return null; records[index] = { ...records[index], ...changes }; writeAll(collection, records); return records[index]; }
function remove(collection, id) { const records = readAll(collection); const next = records.filter((record) => record.id !== id); if (next.length === records.length) return false; writeAll(collection, next); return true; }

module.exports = { readAll, writeAll, findMany, findOne, create, update, remove };