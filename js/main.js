/* global google */
var $btn = document.querySelectorAll('.search-button');
var $logo = document.querySelectorAll('.logo');
var $lists = document.getElementById('lists');
var $homePage = document.querySelector('[data-view="home-page"]');
var $resultPage = document.querySelector('[data-view="result-page"]');
var $stores = document.querySelector('[data-view="stores"]');
var $favoritePage = document.querySelector('[data-view="favorites-page"]');
var $storeImage = document.getElementById('store-image');
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
    xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/textsearch/json%3Fquery=boba+in+' + zipcode + '%26key=AIzaSyCjh9dISRd6EmdVMLlRuPB1xz9RV1_UPDM');
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

        var $li = document.createElement('li');
        var $a = document.createElement('a');
        $li.className = 'result-item';
        $li.setAttribute('id', i);
        $li.appendChild($a);
        $lists.appendChild($li);

        var $storeName = document.createElement('h3');
        $storeName.textContent = xhr.response.results[i].name;
        $a.appendChild($storeName);

        var $address = document.createElement('p');
        $address.textContent = xhr.response.results[i].formatted_address;
        $a.appendChild($address);

        var $starRating = document.createElement('span');
        $starRating.className = 'star-rating';

        var val = (xhr.response.results[i].rating) * 10;
        var fullStar = Math.floor(val / 10);
        var halfStar = val % 10;
        var emptyStar = 5 - fullStar - 1;

        for (var k = 1; k <= fullStar; k++) {
          var $fullStar = document.createElement('i');
          $fullStar.className = 'fas fa-star';
          $starRating.appendChild($fullStar);
          $a.appendChild($starRating);
        }

        if (halfStar < 5 && fullStar < 5) {
          var $emptyStar = document.createElement('i');
          $emptyStar.className = 'far fa-star';
          $starRating.appendChild($emptyStar);
          $a.appendChild($starRating);
        } else if (halfStar >= 5 && fullStar < 5) {
          var $halfStar = document.createElement('i');
          $halfStar.className = 'fas fa-star-half-alt';
          $starRating.appendChild($halfStar);
          $a.appendChild($starRating);
        }

        for (var m = 1; m <= emptyStar; m++) {
          var $leftStar = document.createElement('i');
          $leftStar.className = 'far fa-star';
          $starRating.appendChild($leftStar);
          $a.appendChild($starRating);
        }

        var $numberRating = document.createElement('span');
        var ratingnum = xhr.response.results[i].rating;
        var num = ratingnum.toFixed(1);
        $numberRating.textContent = num;
        $numberRating.className = 'number-rating';
        $a.appendChild($numberRating);

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

  while ($storeImage.hasChildNodes()) {
    $storeImage.removeChild($storeImage.firstChild);
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
  xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '%26key=AIzaSyCjh9dISRd6EmdVMLlRuPB1xz9RV1_UPDM');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    // store-header
    var $storeBox = document.createElement('div');
    var $storeTitle = document.createElement('h1');
    $storeTitle.textContent = xhr.response.result.name;
    $storeBox.className = 'store-info';
    $storeTitle.className = 'store_title';
    $storeBox.appendChild($storeTitle);
    $storeImage.appendChild($storeBox);

    var addToFavorite = {
      name: xhr.response.result.name,
      rating: xhr.response.result.rating
    };

    var $heart = document.createElement('i');
    $storeBox.appendChild($heart);
    if (containObject(data, addToFavorite)) {
      $heart.className = 'fas fa-heart fa-lg';
    } else {
      $heart.className = 'far fa-heart fa-lg';
    }
    $storeImage.append($storeBox);

    // rating
    var $ratingBox = document.createElement('div');
    var $starRating = document.createElement('span');
    $ratingBox.appendChild($starRating);
    $starRating.className = 'star-rating';
    $ratingBox.className = 'rating-box';

    var val = (xhr.response.result.rating) * 10;
    var fullStar = Math.floor(val / 10);
    var halfStar = val % 10;
    var emptyStar = 5 - fullStar - 1;

    for (var k = 1; k <= fullStar; k++) {
      var $fullStar = document.createElement('i');
      $fullStar.className = 'fas fa-star';
      $starRating.appendChild($fullStar);
      $ratingBox.appendChild($starRating);

    }

    if (halfStar < 5 && fullStar < 5) {
      var $emptyStar = document.createElement('i');
      $emptyStar.className = 'far fa-star';
      $starRating.appendChild($emptyStar);
      $ratingBox.appendChild($starRating);
    } else if (halfStar >= 5 && fullStar < 5) {
      var $halfStar = document.createElement('i');
      $halfStar.className = 'fas fa-star-half-alt';
      $starRating.appendChild($halfStar);
      $ratingBox.appendChild($starRating);
    }

    for (var m = 1; m <= emptyStar; m++) {
      var $leftStar = document.createElement('i');
      $leftStar.className = 'far fa-star';
      $starRating.appendChild($leftStar);
      $ratingBox.appendChild($starRating);
    }

    var $numberRating = document.createElement('span');
    var ratingnum = xhr.response.result.rating;
    var num = ratingnum.toFixed(1);
    $numberRating.textContent = num;
    $numberRating.className = 'number-rating';
    $ratingBox.appendChild($numberRating);
    $storeImage.appendChild($ratingBox);

    // photos
    for (var n = 0; n < xhr.response.result.photos.length; n++) {
      var $photoItem = document.createElement('li');
      var $storePhoto = document.createElement('img');
      $storePhoto.className = 'photo-item';
      $storePhoto.setAttribute('src', 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photo_reference=' + xhr.response.result.photos[n].photo_reference + '&key=AIzaSyCjh9dISRd6EmdVMLlRuPB1xz9RV1_UPDM');
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
$storeImage.addEventListener('click', function (e) {

  if (e.target.tagName !== 'I') {
    return;
  }

  var rating = document.querySelector('.number-rating').innerHTML;
  var storeName = event.target.previousElementSibling.textContent;

  var addToFavorite = {
    name: storeName,
    rating: rating
  };

  if (containObject(data, addToFavorite) === false && e.target.className === 'far fa-heart fa-lg') {
    data.unshift(addToFavorite);
    e.target.className = 'fas fa-heart fa-lg';
    var favoriteList = renderFavoriteList(addToFavorite);
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
  var favList = renderFavoriteList(data[list]);
  $favoriteList.prepend(favList);
}

function renderFavoriteList(favorite) {

  var $favoriteItem = document.createElement('li');

  var $storeBox = document.createElement('div');
  var $storeTitle = document.createElement('p');
  $storeTitle.textContent = favorite.name;
  $storeBox.className = 'store-info';
  $storeTitle.className = 'store_title';
  $storeBox.appendChild($storeTitle);
  $favoriteItem.appendChild($storeBox);

  var $heart = document.createElement('i');
  $heart.className = 'fas fa-heart fa-lg';
  $storeBox.appendChild($heart);
  $favoriteItem.append($storeBox);

  var $ratingBox = document.createElement('div');
  var $starRating = document.createElement('span');
  $ratingBox.appendChild($starRating);
  $starRating.className = 'star-rating';
  $ratingBox.className = 'rating-box';

  var val = (favorite.rating) * 10;
  var fullStar = Math.floor(val / 10);
  var halfStar = val % 10;
  var emptyStar = 5 - fullStar - 1;

  for (var k = 1; k <= fullStar; k++) {
    var $fullStar = document.createElement('i');
    $fullStar.className = 'fas fa-star';
    $starRating.appendChild($fullStar);
    $ratingBox.appendChild($starRating);
  }

  if (halfStar < 5 && fullStar < 5) {
    var $emptyStar = document.createElement('i');
    $emptyStar.className = 'far fa-star';
    $starRating.appendChild($emptyStar);
    $ratingBox.appendChild($starRating);
  } else if (halfStar >= 5 && fullStar < 5) {
    var $halfStar = document.createElement('i');
    $halfStar.className = 'fas fa-star-half-alt';
    $starRating.appendChild($halfStar);
    $ratingBox.appendChild($starRating);
  }

  for (var m = 1; m <= emptyStar; m++) {
    var $leftStar = document.createElement('i');
    $leftStar.className = 'far fa-star';
    $starRating.appendChild($leftStar);
    $ratingBox.appendChild($starRating);
  }

  var $numberRating = document.createElement('span');
  var ratingnum = favorite.rating;
  var num = ratingnum;
  $numberRating.textContent = num;
  $numberRating.className = 'number-rating';
  $ratingBox.appendChild($numberRating);
  $favoriteItem.appendChild($ratingBox);

  return $favoriteItem;
}

function containObject(array, obj) {

  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i].name === obj.name) {
      return true;
    }
  }
  return false;
}
