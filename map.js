function isMobile() {
  var mq = window.matchMedia("(min-width: 768px)");
  return !mq.matches;
}

document.addEventListener('DOMContentLoaded', async function () {
  const response = await fetch('./tri-my-ride-service-area.geojson');
  serviceAreaGeoJSON = await response.json();

  function addMapTypeControl(mapDiv) {
    if (!mapDiv) {
      return;
    }
    const mapTypeMenu = document.createElement('div');
    mapTypeMenu.className = 'map-type-menu mapboxgl-ctrl-group';

    [
      { name: 'Light', key: 'mapbox/light-v9' },
      { name: 'Dark', key: 'mapbox/dark-v9' },
      { name: 'Satellite', key: 'mapbox/satellite-v9' }
    ].forEach(function (mapType) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'map-type-toggle';
      input.value = mapType.key;
      label.appendChild(input);
      label.appendChild(document.createTextNode(mapType.name));
      mapTypeMenu.appendChild(label);
    });

    mapDiv.appendChild(mapTypeMenu);

    const firstInput = mapTypeMenu.querySelector('input[name="map-type-toggle"]');
    if (firstInput) {
      firstInput.checked = true;
    }

    mapTypeMenu.addEventListener('change', function (e) {
      if (!e.target || e.target.name !== 'map-type-toggle') {
        return;
      }
      var layerId = e.target.value;
      map.setStyle('mapbox://styles/' + layerId);
    });
  }

  mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZGVsdGF0cmFuc2l0IiwiYSI6ImNtbDdyOHo3ZjBzNGgzZ3ByeGEwMzZhbXkifQ.RlmYDj98uIoB0Zcd-35Qig';
  var initialZoom = isMobile() ? 9.3 : 11;
  var map = new mapboxgl.Map({
    container: 'tri-my-ride-service-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-121.81159429150071, 37.99162107738382],
    zoom: initialZoom
  });


  addMapTypeControl(document.getElementById('tri-my-ride-service-map'));

  // Initialize the geocoder
  const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    bbox: [-122.55839130279035, 37.67726355946309, -121.76737567964851, 38.12479895222226],
    placeholder: 'Search for an address',
    marker: false,
    proximity: {
      longitude: -121.79150796823885,
      latitude: 37.99492924402946
    }
  });

  geocoder.on('result', (event) => {
    map.getSource('single-point').setData(event.result.geometry);

    if (!event.result?.geometry?.coordinates) {
      return alert('Unable to geocode address')
    }

    const pt = turf.point(event.result.geometry.coordinates);
    const poly = turf.multiPolygon(serviceAreaGeoJSON.features[0].geometry.coordinates);

    const resultInSericeArea = turf.booleanPointInPolygon(pt, poly);
    
    const addressAlert = document.getElementById('address-alert');
    if (!addressAlert) {
      return;
    }

    if (!resultInSericeArea) {
      addressAlert.innerHTML = '<div class="alert alert-danger">Sorry, this address is outside of the service area.</div>';
    } else {
      addressAlert.innerHTML = '<div>This address is inside a Tri MyRide zone.* Download the Tri MyRide app to request a ride or call 1-925-470-4997.</div>';
    }
  });

  geocoder.on('clear', () => {
    map.getSource('single-point').setData({
      type: 'FeatureCollection',
      features: []
    });
    const addressAlert = document.getElementById('address-alert');
    if (addressAlert) {
      addressAlert.innerHTML = '';
    }
  });

  // Add the geocoder to the page
  document.getElementById('address').appendChild(geocoder.onAdd(map))

  map.addControl(new mapboxgl.NavigationControl());

  map.on('style.load', function () {
    map.scrollZoom.disable();

    const routeLayerIds = [];

    // Add Service Area
    map.addSource('tri-my-ride-service-area', {
      type: 'geojson',
      data: '/tri-my-ride-service-area.geojson'
    });


    routeLayerIds.push('tri-my-ride-service-area-outline');
    map.addLayer({
      'id': 'tri-my-ride-service-area-outline',
      'type': 'line',
      'source': 'tri-my-ride-service-area',
      'paint': {
        'line-color': '#edc511',
        'line-width': 3
      }
    });
    routeLayerIds.push('tri-my-ride-service-area');
    map.addLayer({
      'id': 'tri-my-ride-service-area',
      'type': 'fill',
      'source': 'tri-my-ride-service-area',
      'paint': {
        'fill-color': '#edc511',
        'fill-opacity': 0.3
      }
    });


    map.addSource('single-point', {
      'type': 'geojson',
      'data': {
      'type': 'FeatureCollection',
      'features': []
      }
    });   
    map.addLayer({
      'id': 'point',
      'source': 'single-point',
      'type': 'circle',
      'paint': {
      'circle-radius': 10,
      'circle-color': '#448ee4'
      }
    });
  });
});