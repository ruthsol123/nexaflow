const store = require("./jsonStore");
const { createId } = require("../utils/ids");

function list(collection, companyId, predicate = () => true) { return store.findMany(collection, (record) => record.companyId === companyId && predicate(record)); }
function get(collection, id, companyId) { return store.findOne(collection, (record) => record.id === id && record.companyId === companyId); }
function insert(collection, data, prefix) { return store.create(collection, { id: data.id || createId(prefix), ...data }); }
function patch(collection, id, companyId, changes) { const record = get(collection, id, companyId); return record ? store.update(collection, id, changes) : null; }
function destroy(collection, id, companyId) { return Boolean(get(collection, id, companyId)) && store.remove(collection, id); }

module.exports = { ...store, list, get, insert, patch, destroy };