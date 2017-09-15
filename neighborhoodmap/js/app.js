var map;
var markers;
var infoWindow;
var bounds;
var initMap = function () {
    'use strict';
    // create a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 30.06, lng: 31.25},
        zoom: 2
    });
    infoWindow = new google.maps.InfoWindow({maxWidth: 350});
    bounds = new google.maps.LatLngBounds();
    markers = [];
    for (var i = 0; i < Locations.length; i++) {
        var title = Locations[i].title;
        var position = Locations[i].location;
        var id = Locations[i].id;
        var marker = new google.maps.Marker({
            title: title,
            position: position,
            animation: google.maps.Animation.DROP,
            id: id,
            map:map
        });
        // Push the marker to the array of markers.
        markers.push(marker);
    }
    map.addListener('click', function() {
        if (infoWindow) {
            infoWindow.close();
            infoWindow = new google.maps.InfoWindow({maxWidth: 350});
        }
    });
};

var mapError = function () {
    'use strict';
    window.console.log('Could not load Google Maps API');
    window.alert('Could not load Google Maps API');
};
var Locations=[
    {   
    title: "Saudia Arabia",
    id: 1,
    location:{ lat: 21.422777, lng: 39.826158, }
    },
	{   
    title: "Cairo",
    id: 2,
    location:{ lat: 39.219038, lng: 35.362915, }  
    }, 
	{   
    title: "Turkey",
    id:3,
    location:{ lat: 39.219038, lng: 35.362915, }  
    },
	{
    title: "France",
    id:7,
    location:{ lat: 48.858532, lng: 2.294492,}  
    },
	{   
    title: "Germany",
    id: 4,
    location:{ lat: 51.076074, lng: 10.317732,}  
    },
	{
    title: "Minia University",
    id: 5,
    location:{ lat:28.123346, lng: 30.734545,}
    },
	{   
    title: "Alexandria",
    id:6,
    location:{ lat: 31.218750, lng: 29.919878,}  
    },    
	{
    title: "Canada",
    id:8,
    location:{ lat: 60.299048, lng: -112.415292,}
    },
    {
    title: "Brazil",
    id:9,
    location:{ lat: -8.310243, lng: -53.020630,}  
    }   	
];

var viewModel = function ()
     {
    'use strict';
    var self = this;
// store locations in an observable Array
    self.locationList = ko.observableArray([]);
    self.filter = ko.observable('');
    Locations.forEach(function (val) {
        self.locationList.push(val);
    });
    // Show all markers when map loaded
    self.showMarkers = function () {
        // Extend the boundaries of the map for each marker and display the marker
        for (var i = 0; i < markers.length; i++) {
            markers[i].setAnimation(google.maps.Animation.DROP);
            markers[i].setVisible(true);
            // Create an onclick event to open an infowindow at each marker.
            markers[i].addListener('click', self.openInfoWindow(markers[i]));
            bounds.extend(markers[i].position);
        }
        map.fitBounds(bounds);
    };
    // Show current marker info when selecting a location from the list
    self.showCurrentMarker = function (location) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i].id === location.id) {
                self.populateInfoWindow(markers[i]);
            }
        }
    };
    self.openInfoWindow = function (marker) {
        return function () {
            self.populateInfoWindow(marker);
        };
    };
    self.closeInfoWindow = function () {
        if (infoWindow) {
            infoWindow.close();
            infoWindow = new google.maps.InfoWindow({maxWidth: 350});
        }
    };
    
    self.populateInfoWindow = function (marker) {
        if (infoWindow.marker !== marker) {
            marker.setAnimation(4);  
            infoWindow.marker = marker;
            

            var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=' + marker.title;
            $.ajax({
                url: wikiUrl,
                dataType: 'jsonp'
            }).done(function (response) {
                var articleStr = response[1]; 
                var articleSummary = response[2];  
                var articleUrl = response[3];  
                for (var i = 0; i < articleStr.length; i++) {
                    infoWindow.setContent('<h4 class="iw-title">' + marker.title + '</h4>' +
                        '<h5>Relevant Wikipedia Summary</h5>' +
                        '<p>' + articleSummary[i] + '</p>' +
                        '<h5>Relevant Wikipedia Links</h5>' +
                        '<a href="' + articleUrl[i] + '">' + articleStr[i] + '</a>' );
                }

                }).fail(function (jqXHR, textStatus) {
              window.console.log('Could not load Wikipedia API');
              infoWindow.setContent('<div class="alert alert-danger">' +
                    '<strong>Error! </strong><span>Could not load Wikipedia API</span>' +
                    '</div>');
            });
               
            infoWindow.open(map, marker);
            infoWindow.addListener('closeclick', function() {
                infoWindow.marker = null;
            });
        }
    };

    self.filterLocationList = ko.computed(function () {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            self.closeInfoWindow();  
          if (map) {
                self.showMarkers();
            } else {
              setTimeout(function () {
                  self.showMarkers();
              }, 1000);
            }
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (val, index) {
                var checkMatch = stringStartsWith(val.title.toLowerCase(), filter);
                if (!checkMatch) {
                    self.closeInfoWindow();  // close the current infowindow
                    markers[index].setVisible(false);
                } else {
                    self.closeInfoWindow();  // close the current infowindow
                    markers[index].setAnimation(google.maps.Animation.DROP);
                    markers[index].setVisible(true);
                }
                return checkMatch;
            });
        }
    }, self);

    self.toggleMenu = function () {
        $('.navbar-nav').toggleClass('slide-in');
        $('.side-body').toggleClass('body-slide-in');
    };

    self.closeMenu = function () {
        $('.navbar-nav').removeClass('slide-in');
        $('.side-body').removeClass('body-slide-in');
    };
};
ko.applyBindings(new viewModel());
var stringStartsWith = function (string, startsWith) {
    string = string || "";
    if (startsWith.length > string.length) {
        return false;
        }
    return string.substring(0, startsWith.length) === startsWith;
};