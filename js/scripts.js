// Mapa Leaflet
	var mapa = L.map('mapid').setView([9.8, -84.25], 8);

// Definición de capas base
var capas_base = {
	
  // Capa base agregada mediante L.tileLayer
  "OSM": L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?', 
    {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  ),
  
  "Esri": L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' , 
    {
      maxZoom: 19,
      atribución : 'Tiles & copy; Esri & mdash; Fuente: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP y la comunidad de usuarios de GIS '
    }
  ),

  // Capa base agregada mediante L.tileLayer y leaflet-providers
  "Stamen.Watercolor": L.tileLayer.provider('Stamen.Watercolor'),
  "Esri.WorldStreetMap": L.tileLayer.provider('Esri.WorldStreetMap')
}

// Se agregan todas las capas base al mapa
control_capas = L.control.layers(capas_base).addTo(mapa);

// Se activa una capa base del control
capas_base['Esri.WorldStreetMap'].addTo(mapa);	

// Control de escala
L.control.scale().addTo(mapa);

// Capa vectorial sitios en formato GeoJSON
$.getJSON("https://marce27.github.io/Dtarea2/sitios_OH5.geojson", function(geodata) {
  var capa_sit = L.geoJson(geodata, {
    style: function(feature) {
	  return {'color': "red", 'weight': 2.5, 'fillOpacity': 0.0}
    },
    onEachFeature: function(feature, layer) {
      var popupText = "<strong>Sitios Arqueológicos</strong>: " + feature.properties.sitios_OH5 + "<br>" + "<strong>Nombre</strong>: " + feature.properties.Nombre;
      layer.bindPopup(popupText);
    }			
  }).addTo(mapa);

  control_capas.addOverlay(capa_sit, 'Sitios Arqueológicos');
});

// Capa raster precipitacion anual
var capa_precipitacion = L.imageOverlay("https://raw.githubusercontent.com/tpb729-desarrollosigweb-2021/datos/main/worldclim/bio12_cr.png", 
	[[11.2174518619451575, -87.0981414346102696], 
	[5.4997120253547189, -82.5543713734725770]], 
	{opacity:0.5}
).addTo(mapa);
control_capas.addOverlay(capa_precipitacion, 'Precipitación Anual');

function updateOpacityPrec() {
  document.getElementById("span-opacity-prec").innerHTML = document.getElementById("sld-opacity-prec").value;
  capa_precipitacion.setOpacity(document.getElementById("sld-opacity-prec").value);
}

// Capa de coropletas de % de cobertura vegetal en cantones de la GAM
$.getJSON('https://tpb729-desarrollosigweb-2021.github.io/datos/atlasverde/gam-cantones-metricas.geojson', function (geojson) {
  var capa_cantones_gam_coropletas = L.choropleth(geojson, {
	  valueProperty: 'cob_veg',
	  scale: ['brown', 'green'],
	  steps: 5,
	  mode: 'q',
	  style: {
	    color: '#fff',
	    weight: 2,
	    fillOpacity: 0.7
	  },
	  onEachFeature: function (feature, layer) {
	    layer.bindPopup('Cantón: ' + feature.properties.canton + '<br>' + 'Cobertura vegetal: ' + feature.properties.cob_veg.toLocaleString() + '%')
	  }
  }).addTo(mapa);
  control_capas.addOverlay(capa_cantones_gam_coropletas, 'Cobertura vegetal por cantón de la GAM');	

  // Leyenda de la capa de coropletas
  var leyenda = L.control({ position: 'bottomleft' })
  leyenda.onAdd = function (mapa) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = capa_cantones_gam_coropletas.options.limits
    var colors = capa_cantones_gam_coropletas.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"><div class="min">' + limits[0] + '</div> \
			<div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }
  leyenda.addTo(mapa)
});