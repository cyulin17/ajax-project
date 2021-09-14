/* global google */
/* exported data */
/* global data */
var $btn = document.querySelectorAll('.search-button');
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
var idArray = [];

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
    xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/textsearch/json%3Fquery=boba+in+' + zipcode + '%26key=AIzaSyBG2u-pzXvsMhKqX7RVP94rUrSKVcJcmOw');
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
  xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/details/json?place_id=' + placeId + '%26key=AIzaSyBG2u-pzXvsMhKqX7RVP94rUrSKVcJcmOw');
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

    var $heartBox = document.createElement('div');
    var $heart = document.createElement('i');
    $heart.className = 'far fa-heart fa-lg';
    $heartBox.className = 'my_favorites';
    $heartBox.appendChild($heart);
    $storeImage.append($heartBox);

    var $starRating = document.createElement('span');
    $starRating.className = 'star-rating';

    var val = (xhr.response.result.rating) * 10;
    var fullStar = Math.floor(val / 10);
    var halfStar = val % 10;
    var emptyStar = 5 - fullStar - 1;

    for (var k = 1; k <= fullStar; k++) {
      var $fullStar = document.createElement('i');
      $fullStar.className = 'fas fa-star';
      $starRating.appendChild($fullStar);
      $storeBox.appendChild($starRating);
    }

    if (halfStar < 5 && fullStar < 5) {
      var $emptyStar = document.createElement('i');
      $emptyStar.className = 'far fa-star';
      $starRating.appendChild($emptyStar);
      $storeBox.appendChild($starRating);
    } else if (halfStar >= 5 && fullStar < 5) {
      var $halfStar = document.createElement('i');
      $halfStar.className = 'fas fa-star-half-alt';
      $starRating.appendChild($halfStar);
      $storeBox.appendChild($starRating);
    }

    for (var m = 1; m <= emptyStar; m++) {
      var $leftStar = document.createElement('i');
      $leftStar.className = 'far fa-star';
      $starRating.appendChild($leftStar);
      $storeBox.appendChild($starRating);
    }

    var $numberRating = document.createElement('span');
    var ratingnum = xhr.response.result.rating;
    var num = ratingnum.toFixed(1);
    $numberRating.textContent = num;
    $numberRating.className = 'number-rating';
    $storeBox.appendChild($numberRating);

    // photos
    for (var n = 0; n < xhr.response.result.photos.length; n++) {
      var $photoItem = document.createElement('li');
      var $storePhoto = document.createElement('img');
      $storePhoto.className = 'photo-item';
      $storePhoto.setAttribute('src', 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=250&photo_reference=' + xhr.response.result.photos[n].photo_reference + '&key=AIzaSyBG2u-pzXvsMhKqX7RVP94rUrSKVcJcmOw');
      $photoItem.appendChild($storePhoto);
      $photos.appendChild($photoItem);
    }

    // store hours
    var $opening = document.createElement('h2');
    $opening.textContent = 'Opening Hours';
    $hours.appendChild($opening);
    for (var i = 0; i < xhr.response.result.opening_hours.weekday_text.length; i++) {
      var $openHours = document.createElement('p');
      $openHours.textContent = xhr.response.result.opening_hours.weekday_text[i];
      $hours.appendChild($openHours);
    }
    // store location
    var $contact = document.createElement('h2');
    $contact.textContent = 'Address & Phone';
    $location.appendChild($contact);
    var $address = document.createElement('p');
    $address.textContent = 'Address: ' + xhr.response.result.formatted_address;
    $location.appendChild($address);
    var $phone = document.querySelector('p');
    $phone.textContent = 'Phone: ' + xhr.response.result.formatted_phone_number;
    $location.append($phone);

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
