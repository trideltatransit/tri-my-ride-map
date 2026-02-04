function isMobile() {
  var mq = window.matchMedia("(min-width: 768px)");
  return !mq.matches;
}

document.addEventListener('DOMContentLoaded', async function () {
  const response = await fetch('./tri-my-ride-service-area.geojson');
  serviceAreaGeoJSON = await response.json();
  const thumbsUpIcon = '<span class="alert-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" focusable="false"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75l7.4-5.9c26.5-21.2 44.6-51 51.2-84.2l2.3-11.4c5.2-26 30.5-42.9 56.5-37.7zM32 192H96c17.7 0 32 14.3 32 32V448c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32V224c0-17.7 14.3-32 32-32z"/></svg></span>';
  const triangleExclamationIcon = '<span class="alert-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#7f1d1d" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg><path xmlns="http://www.w3.org/2000/svg" fill="#7f1d1d" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#7f1d1d" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/></svg></span>';

  function addMapTypeControl(mapDiv) {
    if (!mapDiv) {
      return;
    }
    const mapTypeMenu = document.createElement('div');
    mapTypeMenu.className = 'map-type-menu mapboxgl-ctrl-group';

    [
      { name: 'Light', key: 'mapbox/light-v11' },
      { name: 'Dark', key: 'mapbox/dark-v11' },
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
  var initialZoom = isMobile() ? 9.3 : 10.5;
  var map = new mapboxgl.Map({
    container: 'tri-my-ride-service-map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-121.81159429150071, 37.99162107738382],
    zoom: initialZoom
  });

  function getServiceAreaBounds(geojson) {
    if (!geojson || !geojson.features || !geojson.features.length) {
      return null;
    }
    const bounds = turf.bbox(geojson);
    if (!Array.isArray(bounds) || bounds.length !== 4) {
      return null;
    }
    return bounds;
  }


  addMapTypeControl(document.getElementById('tri-my-ride-service-map'));

  const mapContainer = document.getElementById('tri-my-ride-service-map');
  const tooltip = document.createElement('div');
  tooltip.className = 'service-area-tooltip';
  if (mapContainer) {
    mapContainer.appendChild(tooltip);
  }

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
    const matchedFeature = serviceAreaGeoJSON.features.find((feature) =>
      turf.booleanPointInPolygon(pt, feature)
    );
    
    const addressAlert = document.getElementById('address-alert');
    if (!addressAlert) {
      return;
    }

    if (!matchedFeature) {
      addressAlert.innerHTML = '<div class="alert alert-danger">' + triangleExclamationIcon + '<span>Sorry, this address is outside of the service area.</span></div>';
    } else {
      const zoneName = matchedFeature.properties && matchedFeature.properties.name
        ? matchedFeature.properties.name
        : '';
      addressAlert.innerHTML = '<div class="alert alert-success">' + thumbsUpIcon + '<span>This address is inside the ' + zoneName + ' Tri MyRide zone.* Download the Tri MyRide app to request a ride or call <a href="tel:1-925-470-4997">1-925-470-4997</a>.</span></div>';
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

    const serviceAreaBounds = getServiceAreaBounds(serviceAreaGeoJSON);
    if (serviceAreaBounds) {
      map.fitBounds(serviceAreaBounds, {
        padding: isMobile() ? 10 : 50,
        duration: 0
      });
    }

    const routeLayerIds = [];

    // Add Service Area
    map.addSource('tri-my-ride-service-area', {
      type: 'geojson',
      data: '/tri-my-ride-service-area.geojson',
      generateId: true
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
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          '#e8f70f',
          '#edc511'
        ],
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

    let hoveredServiceAreaId = null;

    function showTooltip(e) {
      if (!e.features || !e.features.length) {
        return;
      }

      const feature = e.features[0];
      const nextHoveredId = feature.id;

      if (hoveredServiceAreaId !== null && hoveredServiceAreaId !== nextHoveredId) {
        map.setFeatureState(
          { source: 'tri-my-ride-service-area', id: hoveredServiceAreaId },
          { hover: false }
        );
      }

      if (nextHoveredId !== null && nextHoveredId !== undefined) {
        hoveredServiceAreaId = nextHoveredId;
        map.setFeatureState(
          { source: 'tri-my-ride-service-area', id: hoveredServiceAreaId },
          { hover: true }
        );
      }

      const name = feature.properties && feature.properties.name;
      if (!name) {
        tooltip.style.display = 'none';
        return;
      }

      tooltip.textContent = name;
      tooltip.style.left = e.point.x + 12 + 'px';
      tooltip.style.top = e.point.y + 12 + 'px';
      tooltip.style.display = 'block';
      map.getCanvas().style.cursor = 'pointer';
    }

    function hideTooltip() {
      if (hoveredServiceAreaId !== null) {
        map.setFeatureState(
          { source: 'tri-my-ride-service-area', id: hoveredServiceAreaId },
          { hover: false }
        );
      }
      hoveredServiceAreaId = null;
      tooltip.style.display = 'none';
      map.getCanvas().style.cursor = '';
    }

    map.off('mousemove', 'tri-my-ride-service-area', showTooltip);
    map.off('mouseleave', 'tri-my-ride-service-area', hideTooltip);
    map.on('mousemove', 'tri-my-ride-service-area', showTooltip);
    map.on('mouseleave', 'tri-my-ride-service-area', hideTooltip);
  });
});