(function () {
    'use strict';
    angular.module('sportparken')
        .component('sportMap', {
            bindings: {
                    selectedObjects: '<',
                },
            controller: tmapCtrl,
            controllerAs: "tmapCtrl",
            template: '<div id="mapId"></div>',
        });

    tmapCtrl.$inject = ['$log', 'leaflet', 'sportparkApi', '$stateParams', '$scope']

    function tmapCtrl ($log, leaflet, sportparkApi, $stateParams, $scope) {
        var self = this;
        self.id = "mapId";
        self.sportparkId = $stateParams.id;
        self.myMap = null

        var poly = null


        var previousValue;
        var i;
        self.log = []
        self.$doCheck = function() {
        // check te for changes on selected geometry
        // method watches the binded object for changes. It expects an updated array
        // of object ideas that where selected by the user
        // it checks the map layers to look for the object and highlight when found.

            var currentValue = self.selectedObjects && self.selectedObjects.valueOf();
                if (previousValue !== currentValue) {
                    previousValue = currentValue;

//                    console.log(self.jsonVar)
                    self.jsonVar.eachLayer( function (layer ) {
                        if( currentValue.indexOf(layer.feature.properties.sportpark_object_id) != -1 ){
                                highlightLayer(layer)
                            } else {
                                self.jsonVar.resetStyle(layer)
                            }
                    })
                }
            }

        self.initMap = function () {
            // method ensures basic initializatin of the map
            // only creates the map container and populates it with a tile layer and a place holder for the
            // gejson objects that will be added later.
            // method makes it possible to toggle show of seperale layes, this is not enabled yet

            self.myMap = L.map(self.id)
                .setView([52.36443980368169, 4.795318645566371], 5);

            L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                        maxZoom: 18,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(self.myMap);

            // hack to add multiple layers to the map, without loading them @ once.
            // when we not do this, all geoJsons becom a seperate layer. For styling that is not wanted
            // the actual geoJsons are added later on.
            self.jsonVar = L.geoJson(null, {
                                          style: styleFeature,
                                          onEachFeature: onEachFeature
                                      }).addTo(self.myMap)

        }
        self.initMap()

        self.sportparkData = {}
        self.getSportparkData = function(spid){
            sportparkApi.getSportpark(spid).then(function(response){
                self.spObjectData = response.data
                for (var i = 0; i < self.spObjectData.geometry.length; i++) {
                    sportparkApi.getFromUrl(self.spObjectData.geometry[i].url).then( function (response) {
                        addSportparkLayer(self.myMap, response.data )
                    });
                }
            })
        }

        self.getSportparkData(self.sportparkId)

        function addSportparkLayer(map, geoJson ) {
            poly = L.geoJSON(geoJson.geometry)
            poly.addTo(map);
            map.fitBounds(poly.getBounds());
        }


        self.getSportparkObjecten = function ( spid ) {

            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function (response ) {
                for (var i = 0; i < response.data.length; i++ ) {
                    for (var j = 0; j < response.data[i].geometry.length; j++ ){
                        sportparkApi.getFromUrl(response.data[i].geometry[j].url).then( function (response) {
                            addObjectLayer(self.myMap,
                                            response.data
                                            )
                        });
                    }
                }
            });
        }

        self.getSportparkObjecten(self.sportparkId)





        function addObjectLayer(map, geoJson ) {
            var enhanchedGeoJson =
                {
                    "type": "Feature",
                    "properties": {
                        "sportpark_object_name": geoJson.sportpark_object_name,
                        "sportpark_object_id": geoJson.sportpark_object_id,
                        "sportpark_object_type": geoJson.sportpark_object_type,
                        "ondergrondType": geoJson.ondergrond_type,
                    },
                    "geometry": geoJson.geometry
                }
                self.jsonVar.addData(enhanchedGeoJson);
            }




        function onEachFeature(feature, layer) {
//            self.features.push(feature)
    ////            console.log(feature.properties.masterObjectId)
    //            layer._polygonId = feature.properties.masterObjectId
    ////            console.log(layer._polygonId)
    //            layer.on({
    //                mouseover: highlightFeature,
    //                mouseout: resetHighlight
    //            });
        }

        function styleFeature(feature) {

            return {
                fillColor: getColor(feature.properties),
                weight: 2,
                opacity: 1,
                color: 'white',
                dashArray: '3',
                fillOpacity: 0.7
            };
        }

        function getColor(properties) {
            if( properties.sportpark_object_type === "pand") {
                return "yellow"
            } else {
                return "green"
            }

        }

        function highlightLayer(layer) {
            layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                    });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }

        function resetHighlightLayer(layer) {
            layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                    });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }
    };

}) ();