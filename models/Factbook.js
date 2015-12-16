var request = require('request');
var pg = require('pg');
var config = require('./config.js');
var Factbook = function( koop ){

  var factbook = {};
  factbook.__proto__ = koop.BaseModel( koop );
  factbook.client = new pg.Client(config.factbookdb);
  factbook.client.connect(function(err) {
    if(err) {
      console.error('could not connect to postgres', err);
    }
  });
  // adds a service to the Cache.db
  // needs a host, generates an id 
  factbook.register = function (id, host, callback) {
    var type = 'factbook';
    koop.Cache.db.serviceCount( type, function (error, count) {
      id = id || count++;
      koop.Cache.db.serviceRegister( type, {'id': id, 'host': host},  function (err, success) {
        callback( err, id );
      });
    });
  };
  // get service by id, no id == return all
  factbook.find = function( id, dataset, options,callback ){
	  var options = options;
    koop.Cache.db.serviceGet( 'factbook', parseInt(id) || id, function(err, res){
		
      if (err){
        callback('No service table found for that id. Try POSTing {"id":"arcgis", "host":"http://www.arcgis.com"} to /jsonurl', null);
      } else {
		  var host = res.host;
			var query = 'SELECT *, ST_AsGeoJson(ST_Transform(geom,4326)) as geometry from "countries"';   
			factbook.client.query(query, function(err, result) {			
			  if(err) {
				callback( err, null);
			  } else {
				  var url = host+"rawdata_"+dataset+".txt";
				  request.get(url, function(e, res){
					var text = res.body
					var lines = text.split("\n");
					var parsedData = [];
					var geojson = {type: 'FeatureCollection', features: []};
					for (var i = 0; i< lines.length; i++){
						var country = lines[i].substring(7,58);
						country = country.trim();
						var value =   lines[i].substring(58);
						value = value.replace(/[^\d.-]/g, '');
						try{
							value = parseFloat(value);
						}
						catch(err){value = 0}
						parsedData.push({country: country, value: value});
					}
					result.rows.forEach(function(row){
						  var geom = JSON.parse(row.geometry);
						  
						  var feature = {properties: row, geometry: geom, type: 'Feature'};
						  feature.properties["value"] = 0;
						  parsedData.forEach(function(item){
							  if (feature.properties.country ===item.country){
								  feature.properties["value"] = item.value;								  
							  }
						  });
						  
						  delete feature.properties.geom;
						  delete feature.properties.geometry;
						
						  geojson.features.push(feature);
			  
					});
					callback( null, [geojson] );
					
				  });
			  }
		  });
        
      }
    });
  };

  
  
  return factbook;

};

module.exports = Factbook;
