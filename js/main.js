/* global google */
var $input = document.querySelector('input');
var $btn = document.querySelectorAll('.search-button');
var $lists = document.getElementById('lists');
var $homePage = document.querySelector('[data-view="home-page"]');
var $resultPage = document.querySelector('[data-view="result-page"]');

for (var i = 0; i < $btn.length; i++) {

  $btn[i].addEventListener('click', function () {

    while ($lists.hasChildNodes()) {
      $lists.removeChild($lists.firstChild);
    }

    var zipcode = this.previousElementSibling.value;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://lfz-cors.herokuapp.com/?url=https://maps.googleapis.com/maps/api/place/textsearch/json%3Fquery=boba+in+' + zipcode + '%26key=MYKEY');
    xhr.responseType = 'json';
    xhr.addEventListener('load', function () {

      for (var i = 0; i < xhr.response.results.length; i++) {

        var $li = document.createElement('li');
        var $a = document.createElement('a');
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

    });
    xhr.send();

    $homePage.className = 'hidden';
    $resultPage.className = '';
    $input.value = '';
  });
}
