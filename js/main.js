/* global google */
var $btn = document.querySelectorAll('.search-button');
var $logo = document.querySelectorAll('.logo');
var $lists = document.getElementById('lists');
var $homePage = document.querySelector('[data-view="home-page"]');
var $resultPage = document.querySelector('[data-view="result-page"]');
var $stores = document.querySelector('[data-view="stores"]');
var $favoritePage = document.querySelector('[data-view="favorites-page"]');
// var $storeImage = document.getElementById('store-image');
var $storeHeader = document.querySelector('.store-header');
var $photos = document.getElementById('photos');
var $hours = document.getElementById('hours');
var $location = document.getElementById('location');
var $reviewLists = document.getElementById('review-lists');
var $favoriteList = document.getElementById('favorite-list');
var $favorites = document.querySelector('.favorites');
var idArray = [];

// add and remove favorites, update localStorage
const data = JSON.parse(localStorage.getItem('my-list')) || [];
function update() {
  localStorage.setItem('my-list', JSON.stringify(data));
}

// Handle page
for (var logo = 0; logo < $logo.length; logo++) {
  $logo[logo].addEventListener('click', function () {
    $homePage.className = '';
    $favoritePage.className = 'hidden';
    $stores.className = 'hidden';
    $resultPage.className = 'hidden';
  });
}

$favorites.addEventListener('click', function () {

  $favoritePage.className = '';
  $stores.className = 'hidden';
  $homePage.className = 'hidden';
  $resultPage.className = 'hidden';

});

// Search bar
for (var i = 0; i < $btn.length; i++) {

  $btn[i].addEventListener('click', function () {
    if (idArray.length > 0) {
      idArray = [];
    }

    while ($lists.hasChildNodes()) {
      $lists.removeChild($lists.firstChild);
    }

    var zipcode = this.previousElementSibling.value;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/textsearch/json%3Fquery=boba+in+' + zipcode + '%26key=AIzaSyBN7ub3XQK_C2cDMilDHrT3yy02o3kYtAY');
    xhr.responseType = 'json';
    xhr.addEventListener('load', function () {
      function initMap() {
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: xhr.response.results[0].geometry.location.lat, lng: xhr.response.results[0].geometry.location.lng },
          zoom: 15
        });

        for (var j = 0; j < xhr.response.results.length; j++) {
          const marker = new google.maps.Marker({
            position: xhr.response.results[j].geometry.location,
            map: this.map
          });

          const contentString = `<h3>${xhr.response.results[j].name}</h3><p>${xhr.response.results[j].formatted_address}<p>`;
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
      }
      initMap();

      for (var i = 0; i < xhr.response.results.length; i++) {

        idArray.push(xhr.response.results[i].place_id);
        renderResults(xhr.response.results[i].name, xhr.response.results[i].formatted_address, xhr.response.results[i].rating, i);
      }

    });
    xhr.send();
    $homePage.className = 'hidden';
    $resultPage.className = '';
    $stores.className = 'hidden';
    $favoritePage.className = 'hidden';
    this.previousElementSibling.value = '';
  });
}
// store information
$lists.addEventListener('click', function (e) {

  while ($storeHeader.hasChildNodes()) {
    $storeHeader.removeChild($storeHeader.firstChild);
  }
  while ($hours.hasChildNodes()) {
    $hours.removeChild($hours.firstChild);
  }
  while ($location.hasChildNodes()) {
    $location.removeChild($location.firstChild);
  }
  while ($reviewLists.hasChildNodes()) {
    $reviewLists.removeChild($reviewLists.firstChild);
  }
  while ($photos.hasChildNodes()) {
    $photos.removeChild($photos.firstChild);
  }

  $resultPage.className = 'hidden';
  $stores.className = '';

  var item = event.target.closest('.result-item');
  var id = item.getAttribute('id');
  var placeId = idArray[id];

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '%26key=AIzaSyBN7ub3XQK_C2cDMilDHrT3yy02o3kYtAY');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {

    renderHeader(xhr.response.result.name, xhr.response.result.rating);

    // photos
    for (var n = 0; n < xhr.response.result.photos.length; n++) {
      var $photoItem = document.createElement('li');
      var $storePhoto = document.createElement('img');
      $storePhoto.className = 'photo-item';
      $storePhoto.setAttribute('src', 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photo_reference=' + xhr.response.result.photos[n].photo_reference + '&key=AIzaSyBN7ub3XQK_C2cDMilDHrT3yy02o3kYtAY');
      $photoItem.appendChild($storePhoto);
      $photos.appendChild($photoItem);
    }

    // store hours
    var $opening = document.createElement('h3');
    $opening.textContent = 'Opening Hours';
    $hours.appendChild($opening);
    for (var i = 0; i < xhr.response.result.opening_hours.weekday_text.length; i++) {
      var $openHours = document.createElement('p');
      $openHours.textContent = xhr.response.result.opening_hours.weekday_text[i];
      $hours.appendChild($openHours);
    }
    // store location
    var $contact = document.createElement('h3');
    $contact.textContent = 'Address & Phone';
    $location.appendChild($contact);
    var $address = document.createElement('p');
    $address.textContent = 'Address: ' + xhr.response.result.formatted_address;
    $location.appendChild($address);
    var $phone = document.createElement('p');
    $phone.textContent = 'Phone: ' + xhr.response.result.formatted_phone_number;
    $location.appendChild($phone);

    // review
    for (var j = 0; j < xhr.response.result.reviews.length; j++) {
      var $review = document.createElement('li');
      var $profile = document.createElement('span');
      var $content = document.createElement('span');
      var $author = document.createElement('h4');
      var $text = document.createElement('p');
      var $image = document.createElement('img');
      var $time = document.createElement('h5');
      $image.setAttribute('src', xhr.response.result.reviews[j].profile_photo_url);
      $profile.appendChild($image);
      $author.textContent = xhr.response.result.reviews[j].author_name;
      $text.textContent = xhr.response.result.reviews[j].text;
      $time.textContent = xhr.response.result.reviews[j].relative_time_description;
      $profile.className = 'profile';
      $content.className = 'comment';
      $content.appendChild($author);
      $content.appendChild($text);
      $content.appendChild($time);
      $review.appendChild($profile);
      $review.appendChild($content);
      $reviewLists.appendChild($review);
    }
  });
  xhr.send();
});

// add to favorites
$storeHeader.addEventListener('click', function (e) {

  if (e.target.tagName !== 'I') {
    return;
  }

  var rating = document.querySelector('.number-rating').textContent;
  var storeName = event.target.previousElementSibling.textContent;

  var addToFavorite = {
    name: storeName,
    rating: rating
  };

  if (containObject(data, addToFavorite) === false && e.target.className === 'far fa-heart fa-lg') {
    data.unshift(addToFavorite);
    e.target.className = 'fas fa-heart fa-lg';
    var favoriteList = renderHeader(addToFavorite.name, addToFavorite.rating);
    $favoriteList.prepend(favoriteList);
    update();
    // remove from favorites
  } else if (containObject(data, addToFavorite) === true && e.target.className === 'fas fa-heart fa-lg') {
    for (var num = data.length - 1; num >= 0; num--) {
      if (data[num].name === storeName) {
        data.splice(num, 1);
        $favoriteList.removeChild($favoriteList.childNodes[num]);
      }
    }
    e.target.className = 'far fa-heart fa-lg';
    update();
  }
});

// Remove favorites in the favorites page
$favoriteList.addEventListener('click', function (e) {
  if (e.target.tagName !== 'I') {
    return;
  }

  var value = event.target.previousElementSibling.textContent;

  for (var num = data.length - 1; num >= 0; num--) {
    if (data[num].name === value) {
      data.splice(num, 1);
      $favoriteList.removeChild($favoriteList.childNodes[num]);
    }
  }
  update();
});

// Favorites Page
for (var list = data.length - 1; list >= 0; list--) {
  var favList = renderHeader(data[list].name, data[list].rating);
  $favoriteList.prepend(favList);
}

function containObject(array, obj) {

  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i].name === obj.name) {
      return true;
    }
  }
  return false;
}

function renderResults(store, address, value, i) {
  const $li = document.createElement('li');
  const $a = document.createElement('a');
  $li.className = 'result-item';
  $li.setAttribute('id', i);
  $li.appendChild($a);
  $lists.appendChild($li);

  const $storeName = document.createElement('h3');
  $storeName.textContent = store;
  $a.appendChild($storeName);

  const $address = document.createElement('p');
  $address.textContent = address;
  $a.appendChild($address);

  const $starRating = document.createElement('span');
  $starRating.className = 'star-rating';
  $a.appendChild($starRating);

  const fullStar = Math.floor(value);
  const halfStar = value * 10 % 10;

  for (let i = 1; i <= 5; i++) {
    const $fStar = document.createElement('i');
    $fStar.className = 'fa-regular fa-star';
    $starRating.appendChild($fStar);
  }
  for (let j = 0; j < fullStar; j++) {
    $starRating.children[j].className = 'fa-solid fa-star';
    if (halfStar > 4 && halfStar <= 9) {
      $starRating.children[fullStar].className = 'fa-solid fa-star-half-stroke';
    }
  }

  const $numberRating = document.createElement('span');
  const num = value.toFixed(1);
  $numberRating.textContent = num;
  $numberRating.className = 'number-rating';
  $a.appendChild($numberRating);

  return $li;

}

function renderHeader(storeName, value) {

  const $storeImage = document.createElement('div');

  const $storeBox = document.createElement('div');
  const $storeTitle = document.createElement('h1');
  $storeTitle.textContent = storeName;
  $storeBox.className = 'store-info';
  $storeTitle.className = 'store_title';
  $storeBox.appendChild($storeTitle);
  $storeImage.appendChild($storeBox);
  $storeHeader.appendChild($storeImage);

  var addToFavorite = {
    name: storeName,
    rating: value
  };

  var $heart = document.createElement('i');
  $storeBox.appendChild($heart);
  if (containObject(data, addToFavorite)) {
    $heart.className = 'fas fa-heart fa-lg';
  } else {
    $heart.className = 'far fa-heart fa-lg';
  }
  $storeImage.append($storeBox);

  const $ratingBox = document.createElement('div');
  const $starRating = document.createElement('span');
  $ratingBox.appendChild($starRating);
  $starRating.className = 'star-rating';
  $ratingBox.className = 'rating-box';
  $storeImage.appendChild($ratingBox);

  const fullStar = Math.floor(value);
  const halfStar = value * 10 % 10;

  for (let i = 1; i <= 5; i++) {
    const $fStar = document.createElement('i');
    $fStar.className = 'fa-regular fa-star';
    $starRating.appendChild($fStar);
  }
  for (let j = 0; j < fullStar; j++) {
    $starRating.children[j].className = 'fa-solid fa-star';
    if (halfStar > 4 && halfStar <= 9) {
      $starRating.children[fullStar].className = 'fa-solid fa-star-half-stroke';
    }
  }

  const $numberRating = document.createElement('span');
  if (typeof value === 'number') {
    const num = value.toFixed(1);
    $numberRating.textContent = num;
  }
  $numberRating.className = 'number-rating';
  $ratingBox.appendChild($numberRating);
  $storeImage.appendChild($ratingBox);

  return $storeImage;
}
