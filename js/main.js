/* global google */
const searchBtn = document.querySelectorAll('.search');
const logo = document.querySelector('.logo');
const homePage = document.querySelector('[data-view="home-page"]');
const resultPage = document.querySelector('[data-view="result-page"]');
const stores = document.querySelector('[data-view="stores"]');
const favoritePage = document.querySelector('[data-view="favorites-page"]');
const lists = document.getElementById('lists');
const storeImage = document.getElementById('store-image');
const photo = document.getElementById('photos');
const hours = document.getElementById('hours');
const address = document.getElementById('address');
const reviewLists = document.getElementById('review-lists');
const favoriteLists = document.getElementById('favorite-list');
const favorites = document.querySelector('.favorites');
const key = 'AIzaSyCYNjwc3_3oj7HchcYbacmPYqsTXHyKOSc';
let idArray = [];

// Handle Page
logo.addEventListener('click', backToHome);
favorites.addEventListener('click', goToFavorite);

// Create a function to handle the API request and data processing
async function fetchData(zipcode) {

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

    const numberRating = createNumberRating(data.results[i].rating);
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

function createNumberRating(rating) {
  const numberRating = document.createElement('span');
  numberRating.className = 'number-rating';
  const num = Number(rating).toFixed(1);
  numberRating.textContent = num;

  return numberRating;
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

function backToHome() {
  homePage.className = 'row home';
  favoritePage.className = 'hidden';
  stores.className = 'hidden';
  resultPage.className = 'hidden';
}

function goToFavorite() {
  favoritePage.className = '';
  stores.className = 'hidden';
  homePage.className = 'hidden';
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
  while (photo.hasChildNodes()) {
    photo.removeChild(photo.firstChild);
  }

  resultPage.className = 'hidden';
  stores.className = '';

  var item = event.target.closest('.result-item');
  var id = item.getAttribute('id');
  var placeId = idArray[id];

  fetch(`https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}%26key=${key}`)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Error: ' + response.status);
      }
    })
    .then(listOfStores => {
      const storeDetail = listOfStores.result;
      renderStoreHeader(storeDetail, true);
      renderPhotos(storeDetail);
      renderStoreHours(storeDetail);
      renderStoreLocation(storeDetail);
      renderReviews(storeDetail);
    })
    .catch(error => {
      console.error(error);
    });
});

// add and remove favorites, update localStorage
const myfavoriteList = JSON.parse(localStorage.getItem('favorite-list')) || [];
function updateLocalStorage() {
  localStorage.setItem('favorite-list', JSON.stringify(myfavoriteList));
}

// add to favorite
storeImage.addEventListener('click', e => {
  if (e.target.tagName !== 'I') {
    return;
  }

  const numberRating = parseFloat(document.querySelector('.number-rating').textContent);
  const storeName = event.target.previousElementSibling.textContent;
  const favorite = { name: storeName, rating: numberRating };
  if (!containObject(myfavoriteList, favorite)) {
    myfavoriteList.unshift(favorite);
    e.target.className = 'fas fa-heart fa-lg';
    const favoriteElement = renderFavoriteList(favorite);
    favoriteLists.prepend(favoriteElement);
    updateLocalStorage();
  } else {
    removeFavorite(name);
    e.target.className = 'far fa-heart fa-lg';
  }
});

// Remove favorites in the favorites page
function removeFavorite(store) {
  const index = myfavoriteList.findIndex(favorite => favorite.name === store);
  if (index !== -1) {
    myfavoriteList.splice(index, 1);
    favoriteLists.removeChild(favoriteLists.childNodes[index]);
    updateLocalStorage();
  }
}

favoriteLists.addEventListener('click', e => {
  if (e.target.tagName !== 'I') {
    return;
  }

  const store = event.target.previousElementSibling.textContent;
  removeFavorite(store);
});

myfavoriteList.slice().reverse().forEach(favorite => {
  const favoriteElement = renderFavoriteList(favorite);
  favoriteLists.prepend(favoriteElement);
});

function renderFavoriteList(favorite) {
  const favoriteItem = document.createElement('li');

  const storeBox = renderStoreHeader(favorite);
  favoriteItem.appendChild(storeBox);

  const stars = createStarRating(favorite.rating);
  favoriteItem.appendChild(stars);
  const numbers = createNumberRating(favorite.rating);
  favoriteItem.appendChild(numbers);

  return favoriteItem;
}

function renderStoreHeader(storeDetail, shouldIncludeRating = false) {
  const storeBox = document.createElement('div');
  const storeTitle = document.createElement('h1');
  storeTitle.textContent = storeDetail.name;
  storeBox.className = 'store-info';
  storeTitle.className = 'store_title';
  storeBox.appendChild(storeTitle);
  storeImage.appendChild(storeBox);

  const addToFavorite = {
    name: storeDetail.name,
    rating: storeDetail.rating
  };

  const heart = document.createElement('i');
  storeBox.appendChild(heart);
  if (containObject(myfavoriteList, addToFavorite)) {
    heart.className = 'fas fa-heart fa-lg';
  } else {
    heart.className = 'far fa-heart fa-lg';
  }

  if (shouldIncludeRating) {
    const starRating = createStarRating(storeDetail.rating);
    storeImage.appendChild(starRating);
    const numberRating = createNumberRating(storeDetail.rating);
    storeImage.appendChild(numberRating);
  }
  return storeBox;
}

function renderPhotos(storeDetail) {
  for (var n = 0; n < storeDetail.photos.length; n++) {
    var photoItem = document.createElement('li');
    var storePhoto = document.createElement('img');
    storePhoto.className = 'photo-item';
    storePhoto.setAttribute('src', `https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photo_reference=${storeDetail.photos[n].photo_reference}&key=${key}`);
    photoItem.appendChild(storePhoto);
    photo.appendChild(photoItem);
  }
}

function renderStoreHours(storeDetail) {
  var opening = document.createElement('h3');
  opening.textContent = 'Opening Hours';
  hours.appendChild(opening);
  const weekdayText = storeDetail.current_opening_hours.weekday_text;
  for (var i = 0; i < weekdayText.length; i++) {
    var openHours = document.createElement('p');
    openHours.textContent = weekdayText[i];
    hours.appendChild(openHours);
  }

}

function renderStoreLocation(storeDetail) {
  var contact = document.createElement('h3');
  contact.textContent = 'Address & Phone';
  address.appendChild(contact);
  var storeAddress = document.createElement('p');
  storeAddress.textContent = 'Address: ' + storeDetail.formatted_address;
  address.appendChild(storeAddress);
  var phone = document.createElement('p');
  phone.textContent = 'Phone: ' + storeDetail.formatted_phoneNumber;
  address.appendChild(phone);
}

function renderReviews(storeDetail) {
  for (var j = 0; j < storeDetail.reviews.length; j++) {
    var review = document.createElement('li');
    var profile = document.createElement('span');
    var content = document.createElement('span');
    var author = document.createElement('h4');
    var text = document.createElement('p');
    var image = document.createElement('img');
    var time = document.createElement('h5');
    image.setAttribute('src', storeDetail.reviews[j].profile_photo_url);
    profile.appendChild(image);
    author.textContent = storeDetail.reviews[j].author_name;
    text.textContent = storeDetail.reviews[j].text;
    time.textContent = storeDetail.reviews[j].relative_time_description;
    profile.className = 'profile';
    content.className = 'comment';
    content.appendChild(author);
    content.appendChild(text);
    content.appendChild(time);
    review.appendChild(profile);
    review.appendChild(content);
    reviewLists.appendChild(review);
  }
}

function containObject(array, obj) {
  return array.some(element => element.name === obj.name);
}
