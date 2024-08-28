
const Handlebars = require('handlebars');

Handlebars.registerHelper('subtract', function (a, b) {
  return a - b;
});

Handlebars.registerHelper('add', function (a, b) {
  return a + b;
});

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('range', function (n) {
  const arr = [];
  for (let i = 1; i <= n; i++) {
    arr.push(i);
  }
  return arr;
});
// Handlebars.registerHelper('range', function (n, block) {
//   let accum = '';
//   for (let i = 1; i <= n; ++i) {
//     accum += block.fn(i);
//   }
//   return accum;
// });
module.exports = Handlebars;
