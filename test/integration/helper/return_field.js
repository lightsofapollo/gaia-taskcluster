module.exports = function returnFields(field) {
  return function(item) {
    return item[field];
  };
}
