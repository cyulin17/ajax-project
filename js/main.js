/* global google */

const searchBtn = document.querySelectorAll('.search');
const logo = document.querySelector('.logo');
const homePage = document.querySelector('[data-view="home-page"]');
const resultPage = document.querySelector('[data-view="result-page"]');
const stores = document.querySelector('[data-view="stores"]');
const favoritePage = document.querySelector('[data-view="favorites-page"]');
const lists = document.getElementById('lists');
const storeImage = document.getElementById('store-image');
const photos = document.getElementById('photos');
const hours = document.getElementById('hours');
const address = document.getElementById('address');
const reviewLists = document.getElementById('review-lists');
const favoriteLists = document.getElementById('favorite-list');
const favorites = document.querySelector('.favorites');
let idArray = [];

// Handle Page
logo.addEventListener('click', handlePage);

// Create a function to handle the API request and data processing
async function fetchData(zipcode) {
  const key = 'AIzaSyCYNjwc3_3oj7HchcYbacmPYqsTXHyKOSc';
  const response = await fetch(`https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/textsearch/json%3Fquery=boba+in+${zipcode}%26key=${key}`);

  if (!response.ok) {
    throw new Error('Error: ' + response.status);
  }

  const data = await response.json();
  return data;
}

// Create a function to process and display the data
function searchResults(data) {
  // Process the data and perform necessary operations
  for (let i = 0; i < data.results.length; i++) {

    idArray.push(data.results[i].place_id);

    const li = document.createElement('li');
    const a = document.createElement('a');
    li.className = 'result-item';
    li.setAttribute('id', i);
    li.appendChild(a);
    lists.appendChild(li);

    const storeName = document.createElement('h3');
    storeName.textContent = data.results[i].name;
    a.appendChild(storeName);

    const address = document.createElement('p');
    address.textContent = data.results[i].formatted_address;
    a.appendChild(address);

    const starRating = createStarRating(data.results[i].rating);
    a.appendChild(starRating);

    const numberRating = document.createElement('span');
    const ratingnum = data.results[i].rating;
    const num = ratingnum.toFixed(1);
    numberRating.textContent = num;
    numberRating.className = 'number-rating';
    a.appendChild(numberRating);

  }

  initMap(data);

}

// display map
const initMap = data => {
  this.map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: data.results[0].geometry.location.lat,
      lng: data.results[0].geometry.location.lng
    },
    zoom: 15
  });

  for (let i = 0; i < data.results.length; i++) {
    const marker = new google.maps.Marker({
      position: data.results[i].geometry.location,
      map: this.map
    });

    const contentString = `<h3>${data.results[i].name}</h3><p>${data.results[i].formatted_address}<p>`;
    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 200
    });

    marker.addListener('click', () => {
      if (this.infowindow) {
        this.infowindow.close();
      }

      infowindow.open({
        anchor: marker,
        map: this.map
      });

      this.infowindow = infowindow;
    });

  }
};

// star rating
function createStarRating(rating) {
  const starRating = document.createElement('span');
  starRating.className = 'star-rating';

  var val = rating * 10;
  var fullStar = Math.floor(val / 10);
  var halfStar = val % 10;
  var emptyStar = 5 - fullStar - 1;

  for (var k = 1; k <= fullStar; k++) {
    var fullStarIcon = document.createElement('i');
    fullStarIcon.className = 'fas fa-star';
    starRating.appendChild(fullStarIcon);
  }

  if (halfStar < 5 && fullStar < 5) {
    var emptyStarIcon = document.createElement('i');
    emptyStarIcon.className = 'far fa-star';
    starRating.appendChild(emptyStarIcon);
  } else if (halfStar >= 5 && fullStar < 5) {
    var halfStarIcon = document.createElement('i');
    halfStarIcon.className = 'fas fa-star-half-alt';
    starRating.appendChild(halfStarIcon);
  }

  for (var m = 1; m <= emptyStar; m++) {
    var leftStarIcon = document.createElement('i');
    leftStarIcon.className = 'far fa-star';
    starRating.appendChild(leftStarIcon);
  }

  return starRating;
}

// Attach the event listener to the button
for (let i = 0; i < searchBtn.length; i++) {

  searchBtn[i].addEventListener('click', function () {

    if (idArray.length > 0) {
      idArray = [];
    }
    while (lists.hasChildNodes()) {
      lists.removeChild(lists.firstChild);
    }

    var zipcode = this.previousElementSibling.value;
    fetchData(zipcode)
      .then(searchResults)
      .catch(error => {
        console.error(error);
      });

    homePage.className = 'hidden';
    resultPage.className = '';
    stores.className = 'hidden';
    favoritePage.className = 'hidden';
    this.previousElementSibling.value = '';
  });
}

function handlePage() {
  homePage.className = 'row home';
  favoritePage.className = 'hidden';
  stores.className = 'hidden';
  resultPage.className = 'hidden';
}

// store information
lists.addEventListener('click', function (e) {
  while (storeImage.hasChildNodes()) {
    storeImage.removeChild(storeImage.firstChild);
  }
  while (hours.hasChildNodes()) {
    hours.removeChild(hours.firstChild);
  }
  while (address.hasChildNodes()) {
    address.removeChild(address.firstChild);
  }
  while (reviewLists.hasChildNodes()) {
    reviewLists.removeChild(reviewLists.firstChild);
  }
  while (photos.hasChildNodes()) {
    photos.removeChild(photos.firstChild);
  }

  resultPage.className = 'hidden';
  stores.className = '';

  var item = event.target.closest('.result-item');
  var id = item.getAttribute('id');
  var placeId = idArray[id];

  fetch('https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '%26key=AIzaSyCYNjwc3_3oj7HchcYbacmPYqsTXHyKOSc')
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error: ' + response.status);
      }
    })
    .then(data => {
      // store-header
      var storeBox = document.createElement('div');
      var storeTitle = document.createElement('h1');
      storeTitle.textContent = data.result.name;
      storeBox.className = 'store-info';
      storeTitle.className = 'store_title';
      storeBox.appendChild(storeTitle);
      storeImage.appendChild(storeBox);

      var addToFavorite = {
        name: data.result.name,
        rating: data.result.rating
      };

      var heart = document.createElement('i');
      storeBox.appendChild(heart);
      if (containObject(data, addToFavorite)) {
        heart.className = 'fas fa-heart fa-lg';
      } else {
        heart.className = 'far fa-heart fa-lg';
      }
      storeImage.append(storeBox);

      // rating
      var ratingBox = document.createElement('div');
      var starRating = createStarRating(data.result.rating);
      ratingBox.appendChild(starRating);
      starRating.className = 'star-rating';
      ratingBox.className = 'rating-box';
      storeImage.appendChild(ratingBox);

      // photos
      for (var n = 0; n < data.result.photos.length; n++) {
        var photoItem = document.createElement('li');
        var storePhoto = document.createElement('img');
        storePhoto.className = 'photo-item';
        storePhoto.setAttribute('src', 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photo_reference=' + data.result.photos[n].photo_reference + '&key=AIzaSyCYNjwc3_3oj7HchcYbacmPYqsTXHyKOSc');
        photoItem.appendChild(storePhoto);
        photos.appendChild(photoItem);
      }

      // store hours
      var opening = document.createElement('h3');
      opening.textContent = 'Opening Hours';
      hours.appendChild(opening);
      for (var i = 0; i < data.result.opening_hours.weekday_text.length; i++) {
        var openHours = document.createElement('p');
        openHours.textContent = data.result.opening_hours.weekday_text[i];
        hours.appendChild(openHours);
      }

      // store location
      var contact = document.createElement('h3');
      contact.textContent = 'Address & Phone';
      address.appendChild(contact);
      var storeAddress = document.createElement('p');
      storeAddress.textContent = 'Address: ' + data.result.formatted_address;
      address.appendChild(storeAddress);
      var phone = document.createElement('p');
      phone.textContent = 'Phone: ' + data.result.formatted_phone_number;
      address.appendChild(phone);

      // review
      for (var j = 0; j < data.result.reviews.length; j++) {
        var review = document.createElement('li');
        var profile = document.createElement('span');
        var content = document.createElement('span');
        var author = document.createElement('h4');
        var text = document.createElement('p');
        var image = document.createElement('img');
        var time = document.createElement('h5');
        image.setAttribute('src', data.result.reviews[j].profile_photo_url);
        profile.appendChild(image);
        author.textContent = data.result.reviews[j].author_name;
        text.textContent = data.result.reviews[j].text;
        time.textContent = data.result.reviews[j].relative_time_description;
        profile.className = 'profile';
        content.className = 'comment';
        content.appendChild(author);
        content.appendChild(text);
        content.appendChild(time);
        review.appendChild(profile);
        review.appendChild(content);
        reviewLists.appendChild(review);
      }
    })
    .catch(error => {
      console.error(error);
    });
});

// add and remove favorites, update localStorage
const data = JSON.parse(localStorage.getItem('my-list')) || [];
function update() {
  localStorage.setItem('my-list', JSON.stringify(data));
}

favorites.addEventListener('click', function () {

  favoritePage.className = '';
  stores.className = 'hidden';
  homePage.className = 'hidden';
  resultPage.className = 'hidden';

});

// add to favorites
storeImage.addEventListener('click', function (e) {

  if (e.target.tagName !== 'I') {
    return;
  }

  var numbers = document.querySelector('.number-rating').textContent;
  var storeName = event.target.previousElementSibling.textContent;
  var addToFavorite = {
    name: storeName,
    rating: numbers
  };

  if (containObject(data, addToFavorite) === false && e.target.className === 'far fa-heart fa-lg') {
    data.unshift(addToFavorite);
    e.target.className = 'fas fa-heart fa-lg';
    var favoriteList = renderFavoriteList(addToFavorite);
    favoriteLists.prepend(favoriteList);
    update();
    // remove from favorites
  } else if (containObject(data, addToFavorite) === true && e.target.className === 'fas fa-heart fa-lg') {
    for (var num = data.length - 1; num >= 0; num--) {
      if (data[num].name === storeName) {
        data.splice(num, 1);
        favoriteLists.removeChild(favoriteLists.childNodes[num]);
      }
    }
    e.target.className = 'far fa-heart fa-lg';
    update();
  }
});

// Remove favorites in the favorites page
favoriteLists.addEventListener('click', function (e) {
  if (e.target.tagName !== 'I') {
    return;
  }

  var value = event.target.previousElementSibling.textContent;

  for (var num = data.length - 1; num >= 0; num--) {
    if (data[num].name === value) {
      data.splice(num, 1);
      favoriteLists.removeChild(favoriteLists.childNodes[num]);
    }
  }
  update();
});

// Favorites Page
for (var list = data.length - 1; list >= 0; list--) {
  var favList = renderFavoriteList(data[list]);
  favoriteLists.prepend(favList);
}

function renderFavoriteList(favorite) {

  var favoriteItem = document.createElement('li');

  var storeBox = document.createElement('div');
  var storeTitle = document.createElement('p');
  storeTitle.textContent = favorite.name;
  storeBox.className = 'store-info';
  storeTitle.className = 'store_title';
  storeBox.appendChild(storeTitle);
  favoriteItem.appendChild(storeBox);

  var heart = document.createElement('i');
  heart.className = 'fas fa-heart fa-lg';
  storeBox.appendChild(heart);
  favoriteItem.append(storeBox);

  var ratingBox = document.createElement('div');
  var starRating = document.createElement('span');
  ratingBox.appendChild(starRating);
  starRating.className = 'star-rating';
  ratingBox.className = 'rating-box';

  var val = (favorite.rating) * 10;
  var fullStar = Math.floor(val / 10);
  var halfStar = val % 10;
  var emptyStar = 5 - fullStar - 1;

  for (var k = 1; k <= fullStar; k++) {
    var full = document.createElement('i');
    full.className = 'fas fa-star';
    starRating.appendChild(fullStar);
    ratingBox.appendChild(starRating);
  }

  if (halfStar < 5 && fullStar < 5) {
    var empty = document.createElement('i');
    empty.className = 'far fa-star';
    starRating.appendChild(empty);
    ratingBox.appendChild(starRating);
  } else if (halfStar >= 5 && fullStar < 5) {
    var half = document.createElement('i');
    half.className = 'fas fa-star-half-alt';
    starRating.appendChild(half);
    ratingBox.appendChild(starRating);
  }

  for (var m = 1; m <= emptyStar; m++) {
    var leftStar = document.createElement('i');
    leftStar.className = 'far fa-star';
    starRating.appendChild(leftStar);
    ratingBox.appendChild(starRating);
  }

  var numberRating = document.createElement('span');
  var ratingnum = favorite.rating;
  var num = ratingnum;
  numberRating.textContent = num;
  numberRating.className = 'number-rating';
  ratingBox.appendChild(numberRating);
  favoriteItem.appendChild(ratingBox);

  return favoriteItem;
}

function containObject(array, obj) {

  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i].name === obj.name) {
      return true;
    }
  }
  return false;
}
