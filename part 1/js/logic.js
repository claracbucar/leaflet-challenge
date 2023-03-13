// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to map features to marker properties
function pointToLayer(feature, latlng) {
  var markerStyle = {
    radius: getSize(feature.properties.mag),
    fillColor: getColor(feature.geometry.coordinates[2]),
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
  };

  return L.circleMarker(latlng, markerStyle);
}

// Function to map marker size to magnitude
function getSize(featureValue) {
  return featureValue*4
}

// Function to map marker color to depth
function getColor(d) {
  return d > 10 ? '#B22222' :
         d > 8  ? '#FF4500' :
         d > 6  ? '#FFA500' :
         d > 4  ? '#FFFF00' :
         d > 2  ? '#ADFF2F' :
                  '#32CD32';
}

// Function to map features to popup information
function onEachFeature(feature, layer) {
  // Create a popup with the feature's properties
  var popupContent = "<p><b>Magnitude:</b> " + feature.properties.mag + "</p>" +
                      "<p><b>Depth:</b> " + feature.geometry.coordinates[2] + "</p>" +
                      "<p><b>Time:</b> " + Date(feature.properties.time).toLocaleString() + "</p>" +
                      "<p><b>Location:</b> " + feature.properties.place + "</p>" +
                      "<p><b>More info visit:</b> <a href='" + feature.properties.url + "'> event page</p>";

  // Bind the popup to the layer
  layer.bindPopup(popupContent);
}

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  console.log(data)


  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.

  // 1.
  // Pass the features to a createFeatures() function:
  createFeatures(data.features);
});

// 2. 
function createFeatures(earthquakeData) {

  // YOUR CODE GOES HERE
  // Save the earthquake data in a variable.
var layergroup = L.geoJSON(earthquakeData, {
  pointToLayer: pointToLayer,
  onEachFeature: onEachFeature
})

  // Pass the earthquake data to a createMap() function.
  createMap(layergroup);

}


// 3.
// createMap() takes the earthquake data and incorporates it into the visualization:

function createMap(earthquakes) {
  // Create the base layers.
  var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object.
  var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create a new map.
  var myMap = L.map("map", {
    center: [37.7749, -122.4194],
    zoom: 4,
    layers: [street, earthquakes]
  });

  // Create an overlays object.
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend for the map.
  var legend = L.control({
    position: "bottomright"
  });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create("div", "info legend");

    var magnitudes = [0, 2, 4, 6, 8, 10];

    // Loop through our intervals and generate a label with a colored square for each interval.
    for (var i = 0; i < magnitudes.length; i++) {
      div.innerHTML +=
        "<i style='background: " + getColor(magnitudes[i]) + "'></i> " +
        magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }

    return div;
  };

  // Add the legend to the map.
  legend.addTo(myMap);
}
