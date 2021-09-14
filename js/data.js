/* exported data */
var data = [];
var dataJSON = localStorage.getItem('favoriteList');

if (dataJSON !== null) {
  data = JSON.parse(dataJSON);
}

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('favoriteList', dataJSON);
});
