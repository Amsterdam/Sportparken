

var app = angular.module('sportparken_detail', [] ) 

app.filter('objectTypeFilter', function () {
            return function (input, type){
                var out = []
                angular.forEach(input, function(a) {
                    if(a.objectType === type) { out.push(a)}
                })
                return out;
            }
        });

app.filter('objectOndergrondFilter', function () {
            return function (input, ondergrond){
                var out = []
                angular.forEach(input, function(a) {
                    if(a.objectOndergrond === ondergrond) { out.push(a)}
                })
                return out;
            }
        })

app.filter('objectNameFilter', function () {
            return function (input, sName){
                var out = []
                if( typeof (sName) === 'undefined'  ) {
                    out = input
                } else {
                    angular.forEach(input, function(a) {
    //                    console.log(a.name.toUpperCase().indexOf(sName.toUpperCase()))
                        if(a.name.toUpperCase().indexOf(sName.toUpperCase()) !== -1) { out.push(a)}
                    })
                }
                return out;
            }
        })

app.filter('objectSliceFilter', function() {
            return function(arr, start, end) {
                return arr.slice(start, end);
                };
        });


(function () {
    'use strict';
/**
*   Overzicht van alle sportparken
*/
    angular.module('sportparken_detail')
        .component('overzicht', {
            bindings: {
                size: '='
            },
            templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/overzicht.html',
            controller: overzichtController,
            controllerAs: 'overzichtCtrl'
        });

    overzichtController.$inject = ['$location', '$scope', '$state', 'sportparkApi','leaflet'];

    function overzichtController ($location, $scope, $state, sportparkApi, leaflet) {
        console.log($location.$$absUrl);
        const self = this;
        self.stateName = "sportparken.sportparkendetail"
        self.state = $state;
        self.org_objectData = [];        
        self.sportparken = []
        
        self.getSportparkenList = function () {
            sportparkApi.getSportparken().then( function( response ) { 
                self.sportparken = response.data;
            })
        }
        
        self.getSportparkenList();

        self.mapId = "total_map"
        self.myMap = null
        var poly = null  
        var popup = L.popup();
        self.map_info = L.control({position: 'topright'});      

        self.initMap = function () {
            // method ensures basic initializatin of the map
            // only creates the map container and populates it with a tile layer and a place holder for the
            // gejson objects that will be added later.
            // method makes it possible to toggle show of seperale layes, this is not enabled yet

            self.myMap = L.map(self.mapId)
                .setView([52.36443980368169, 4.795318645566371], 5);

            var baseLayerOptions = {
                minZoom: 11,
                maxZoom: 21,
                subdomains: ['t1', 't2', 't3', 't4']
            };
            var baseLayers = { 'Topografie': L.tileLayer('https://{s}.data.amsterdam.nl/topo_wm_zw/{z}/{x}/{y}.png', baseLayerOptions)};
            var overlays = {
              "Stadsdelen": L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'stadsdeel,stadsdeel_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Gebieden":   L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'gebiedsgerichtwerken,gebiedsgerichtwerken_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Wijken":     L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'buurtcombinatie,buurtcombinatie_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Buurten":    L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'buurt,buurt_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Luchtfoto":    L.tileLayer.wms('https://map.data.amsterdam.nl/maps/lufo',
                              { layers: 'lufo2016',
                                format: 'image/png',
                                transparent: false
                                })
              };   

            //Load control layers 
            L.control.layers(baseLayers,overlays).addTo(self.myMap); 
            // Load default baselayer
            baseLayers['Topografie'].addTo(self.myMap);
            // Load default overlay
            overlays['Stadsdelen'].addTo(self.myMap);

            // hack to add multiple layers to the map, without loading them @ once.
            // when we don't do this, all geoJsons becom a seperate layer. For styling that is not wanted
            // the actual geoJsons are added later on.

            self.sportparken_layer = L.geoJson(null, {
                                        styleFeature: styleSportpark,
                                        onEachFeature: onEachFeature
                                        }).addTo(self.myMap)

        
        function onEachFeature(feature, layer) {
            layer.on( {
                mouseover: mouseOnFeature,
                mouseout: resetMouseOnFeature,
                click: onClick,
                hoover: showPopUp
            });

        self.myMap.invalidateSize();
        }

        function onClick(e) {
            //console.log(this.options.win_url);
            window.location.href = '#!/sportparken/'+e.target.feature.properties.sportpark_object_id+'/objecten';
        }


        function mouseOnFeature(e) {
            self.map_info.update(e.target.feature.properties);
        }

        function resetMouseOnFeature(e) {
            self.map_info.update();
        }

        function showPopUp(e) {
            popup
                .setLatLng(e.latlng)
                .setContent(e.target.feature.properties.sportpark_object_name)
                .openOn(self.myMap);
        }

        function styleSportpark(feature) {
            return {
                fillColor: 'blue',
                fillOpacity: 0.5,
                color: 'darkblue',
                weight: 0.2
            }
        }

            self.map_info.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'map_info'); // create a div with a map_class "info"
                    this.update();
                    return this._div;
                }

            self.map_info.update = function (obj) {
                this._div.innerHTML = 
                    (obj ?
                        '<b>' + obj.sportpark_object_name
                        : 'Muis over een object <br> <br>');
            };

            self.map_info.addTo(self.myMap);
    }

    self.initMap()


    self.getSportparken = function () {
        sportparkApi.getSportparken().then( function( response ) { 
            self.sportparken = response.data;
            addSportparkLayer(response.data)                  
        })
    }


    function addSportparkLayer(obj){
        var i = 0;
        console.log(obj) 
        while( i < obj.length ) {
                    var enhanchedGeoJson =
                    {
                        "type": "Feature",
                        "properties": {
                            "sportpark_object_name": obj[i].name,
                            "sportpark_object_url": obj[i].url,
                            "sportpark_object_id": obj[i].tid
                        },
                        "geometry": obj[i].geometry[0].geometry
                    }
                    self.sportparken_layer.addData(enhanchedGeoJson);
                    // Zoom to polygons
                    self.myMap.fitBounds(self.sportparken_layer.getBounds());
                i ++ 
            }
        }

    self.getSportparken();
  
    }
})();

( function () {
    angular.module('sportparken_detail')
        .component('testrun', {
            bindings: {
                size: '='
            },
            templateUrl: 'sportparken/static/app/components/sportparken_detail/page.html',
            controller: pageController,
            controllerAs: 'vmaster'
        });

    pageController.$inject = ['$scope', '$state']; 

    function pageController ($scope, $state) {
        const self = this;

//        vm.stateName = "sportparken.sportparkendetail"
//        vm.state = $state;
        
    }
})();

( function () {
    angular.module('sportparken_detail')
        .component('objectOverzicht', {
            bindings: {
                size: '='
            },
            templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/objecten.html',
            controller: objectOverzichtController,
            controllerAs: 'ooCtrl'
        });

    objectOverzichtController.$inject = ['$scope', '$state', 'sportparkApi', '$stateParams' ];

    function objectOverzichtController ($scope, $state, sportparkApi, $stateParams ) {
        const self = this;   
        self.sportparkId = self.sportparkId || $stateParams.id
        self.selectedObject = {};
        self.selectedGeometry = [];
        self.veldenList = [];
        self.sportparkData = {};
        
        self.getVeldenList = function(spid) {
            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function(response) {
                self.veldenList = response.data;
                // sort by tid
                self.veldenList.sort(function(a,b) { return a.tid-b.tid });
                // add auto increment
                for(i=0;i<self.veldenList.length;i++){
                    self.veldenList[i]['number'] = i+1;
                } 
            })         
        }

        self.getSportparkData = function(spid){
            sportparkApi.getSportpark(spid).then(function(response){
                self.sportparkData = response.data;
            });           
        }

        self.getVeldenList(self.sportparkId);
        self.getSportparkData(self.sportparkId); 
         
        self.selectObject = function (obj) {
            var tmp = [];

            if( self.selectedObject == obj ) {
                self.selectedObject = {}
            } else {
                self.selectedObject = obj
                tmp.push(self.selectedObject.tid)
    //                var i;
    //                for (i=0; i < self.selectedObject.geometry.length; i++ ) {
    //                    tmp.push(self.selectedObject.geometry[i].tid)
    //                }
            }
            console.log(tmp)
            self.selectedGeometry = tmp;         
        }
    }
})();

( function () {
    angular.module('sportparken_detail')
        .component('print', {
            bindings: {
                size: '='
            },
            templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/print.html',
            controller: objectOverzichtController,
            controllerAs: 'ooCtrl'
        });

    objectOverzichtController.$inject = ['$scope', '$state', 'sportparkApi', '$stateParams' ];

    function objectOverzichtController ($scope, $state, sportparkApi, $stateParams ) {
        const self = this;   
        
        self.printScreen = function() {
            window.print();
        }

        self.sportparkId = self.sportparkId || $stateParams.id
        self.selectedObject = {};
        self.selectedGeometry = [];
        self.veldenList = [];
        self.sportparkData = {};
        
        self.getVeldenList = function(spid) {
            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function(response) {
                self.veldenList = response.data;
                // sort by tid
                self.veldenList.sort(function(a,b) { return a.tid-b.tid });
                // add auto increment
                for(i=0;i<self.veldenList.length;i++){
                    self.veldenList[i]['number'] = i+1;
                }
               return self.veldenList
            })
        }
        
        self.getSportparkData = function(spid){
            sportparkApi.getSportpark(spid).then(function(response){
                self.sportparkData = response.data; 
            });           
        }

        self.getVeldenList(self.sportparkId);
        self.getSportparkData(self.sportparkId); 

        self.columns = [];
        self.columnCount = 2;
  
        self.calculateColumns = function(arr) {
            var itemsPerColumn = Math.ceil(arr.length / self.columnCount);
            for (var i=0; i<arr.length; i += itemsPerColumn) {
                var col = {start:i, end: Math.min(i + itemsPerColumn, arr.length) };
                self.columns.push(col);
            }
            console.log(self.columns);
        }
  
        self.calculateColumns(self.veldenList);

        self.selectObject = function (obj) {
            var tmp = [];

            if( self.selectedObject == obj ) {
                self.selectedObject = {}
            } else {
                self.selectedObject = obj
                tmp.push(self.selectedObject.tid)
    //                var i;
    //                for (i=0; i < self.selectedObject.geometry.length; i++ ) {
    //                    tmp.push(self.selectedObject.geometry[i].tid)
    //                }
            }
            console.log(tmp)
            self.selectedGeometry = tmp;  
        }
    }
})();


( function () {
    'use strict';
    
    angular.module('sportparken_detail')
        .component('editObject', {
            templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/object_informatie.html',
            controller: objectEditController,
            controllerAs: 'oeCtrl'
    });
    
    objectEditController.$inject = ['$state', 'sportparkApi', '$stateParams', 'leaflet']
    
    function objectEditController ($state, sportparkApi, $stateParams, leaflet) {
        const self = this;
        self.sportparkId = self.sportparkId || $stateParams.id

        self.spObjectData = {};
        self.selectedGeometry = [];
        self.veldenList = [];
        self.ondergrondList = [];
        self.user_selectedObject = {};
        self.org_selectedObject = {};
        self.user_objectData = []; // holds the geometry and onther information each object is made up off
        self.org_objectData = [];
        
        var poly = null
        
        self.getOndergrondenList = function() {
            sportparkApi.getOndergronden().then( function(response) {
                self.ondergrondList = response.data;    
            })
        }

        self.getOndergrondenList();

        self.getVeldenList = function(spid) {
            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function(response) {
                self.veldenList = response.data;
                
            })
        }
        self.getVeldenList(self.sportparkId);
        

        self.mapId = "edit_map"
        self.myMap = null
        
        self.initMap = function () {
            // method ensures basic initializatin of the map
            // only creates the map container and populates it with a tile layer and a place holder for the
            // gejson objects that will be added later.
            // method makes it possible to toggle show of seperale layes, this is not enabled yet

            self.myMap = L.map(self.mapId)
                .setView([52.36443980368169, 4.795318645566371], 5);

            L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                        maxZoom: 18,
                        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(self.myMap);

            // hack to add multiple layers to the map, without loading them @ once.
            // when we don't do this, all geoJsons becom a seperate layer. For styling that is not wanted
            // the actual geoJsons are added later on.
            self.jsonVar = L.geoJson(null, {
//                                          style: styleFeature,
//                                          onEachFeature: onEachFeature
                                      }).addTo(self.myMap)

            
        }
        self.initMap()
        
//        self.sportparkData = {}
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
        
        self.selectObject = function(obj) {
            self.jsonVar.clearLayers()
            self.org_objectData = []
            
            if( self.org_selectedObject == obj) {
                self.org_selectedObject = {}
                self.reset_data()
            } else {
                self.org_selectedObject = obj
                self.loadObjectLayer(obj)
            }
        }
        
        self.loadObjectLayer = function (obj){
            var i = 0;
            while( i < obj.geometry.length ) {
                sportparkApi.getFromUrl(obj.geometry[i].url).then(function(response){
                    self.org_objectData.push(response.data)
                        var enhanchedGeoJson =
                        {
                            "type": "Feature",
                            "properties": {
                                "sportpark_object_name": 'test'
                            },
                            "geometry": response.data.geometry
                        }
                        self.jsonVar.addData(enhanchedGeoJson);
                        self.myMap.fitBounds(self.jsonVar.getBounds())
                        
                        // runnning this method to store the data in a user array, where the user can edit the data
                        self.reset_data()
                })
                i ++ 
            }   
        }
        
        self.reset_data = function () {
            angular.copy(self.org_selectedObject, self.user_selectedObject)
            angular.copy(self.org_objectData, self.user_objectData)
        }
        
        self.save_data = function () {
            sportparkApi.saveSportparkObjectChanges(self.user_selectedObject).then( function(response){
                    angular.forEach(self.user_objectData, function(obj){
                    sportparkApi.updateGeomObjectData(obj)
                })
                self.getVeldenList(self.sportparkId);
                self.user_objectData = []
                self.user_selectedObject = []
            })
        }
    }          
}) ();

( function () {
    angular.module('sportparken_detail')
        .component('basicMap', {
            bindings: {
                selectedObjects: '<',
            },
            template: "<div id='mapId'></div>",
            transclude: true,
            controller: mapController,
            controllerAs: "mapCtrl"
        });
    
    mapController.$inject = ['leaflet', 'sportparkApi', '$stateParams', '$scope']

    function mapController (leaflet, sportparkApi, $stateParams, $scope ) {

        /**
        * basic variables
        * used for controlling the logic in the div
        */
        const self = this;
        self.id = "mapId";


        self.sportparkId = $stateParams.id;
        self.sportparkData = {};
        self.origin_sportparkData = {};
        self.labels_layer = {};
        /**
        * map variables
        */
        self.myMap = null
        self.legend = null
        var poly = null
        var previousValue;
        var i;
        var popup = L.popup();

        self.map_info = L.control({position: 'topright'});
        self.legend = L.control({position: 'bottomright'});

        self.$doCheck = function() {
        // check te for changes on selected geometry
        // method watches the binded object for changes. It expects an updated array
        // of object ideas that where selected by the user
        // it checks the map layers to look for the object and highlight when found.

            var currentValue = self.selectedObjects && self.selectedObjects.valueOf();
                if (previousValue !== currentValue) {
                    previousValue = currentValue;

                    self.objects_layer_var.eachLayer( function (layer ) {
                        if( currentValue.indexOf(layer.feature.properties.sportpark_object_id) != -1 ){
                                highlightLayer(layer)
                            } else {
                                self.objects_layer_var.resetStyle(layer)
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

           // L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
           //             maxZoom: 18,
           //             attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
           // }).addTo(self.myMap);

            var baseLayerOptions = {
                minZoom: 11,
                maxZoom: 21,
                subdomains: ['t1', 't2', 't3', 't4']
            };
            var baseLayers = { 'Topografie': L.tileLayer('https://{s}.data.amsterdam.nl/topo_wm_zw/{z}/{x}/{y}.png', baseLayerOptions),
                               'Openstreetmap': L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                                 maxZoom: 18,
                                 attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'})
                            };
            var overlays = {
              "Stadsdelen": L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'stadsdeel,stadsdeel_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Gebieden":   L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'gebiedsgerichtwerken,gebiedsgerichtwerken_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Wijken":     L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'buurtcombinatie,buurtcombinatie_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Buurten":    L.tileLayer.wms('https://map.data.amsterdam.nl/maps/gebieden',
                              { layers: 'buurt,buurt_label',
                                format: 'image/png',
                                transparent: true
                                }),
              "Luchtfoto":    L.tileLayer.wms('https://map.data.amsterdam.nl/maps/lufo',
                              { layers: 'lufo2016',
                                format: 'image/png',
                                transparent: false
                                })
              };   

            //Load control layers 
            L.control.layers(baseLayers,overlays).addTo(self.myMap); 
            // Load default baselayer
            baseLayers['Openstreetmap'].addTo(self.myMap);
            // Load default overlay
            //overlays['Luchtfoto'].addTo(self.myMap);


            overlays['Luchtfoto'].setOpacity(0.7);

            // hack to add multiple layers to the map, without loading them @ once.
            // when we not do this, all geoJsons becom a seperate layer. For styling that is not wanted
            // the actual geoJsons are added later on.


            self.objects_layer_var = L.geoJson(null,
                                 {
                                      style: styleFeature,
                                      onEachFeature: onEachFeature
                                  }).addTo(self.myMap)

            self.sportpark_layer_var = L.geoJSON(null,
                                                {
                                        style: styleSportpark
                                    }).addTo(self.myMap)

            // end hack



            self.map_info.onAdd = function (map) {
                    this._div = L.DomUtil.create('div', 'map_info'); // create a div with a map_class "info"
                    this.update();
                    return this._div;
                }

            self.map_info.update = function (obj) {
                this._div.innerHTML = '<h4>Basis gegevens</h4>' +
                    (obj ?
                        '<b>' + obj.sportpark_object_name + '</b><br>' +
                        obj.sportpark_object_ondergrondType
                        : 'Muis over een object <br> <br>');
            };

            self.map_info.addTo(self.myMap);

            self.legend.onAdd = function (map) {

                var div = L.DomUtil.create('div', 'map_legend'),
                    classes = [
                        ["Gras",
                        "Gravel",
                        "Kunststof(gras)/Verhard/Wetra","Onbekend"],[
                        "Aarde",
                        "Kunststof",
                        "Kunstgras (zand)",
                        "Kunstgras (rubber)",
                        "Verhard",
                        "Wetra",
                    
                    ]]

                // loop through our density intervals and generate a label with a colored square for each interval
                div.innerHTML += "<p style='font-weight: bold;  margin-bottom: 4px;'>Ondergond</p>"
                div.innerHTML += "<p style='font-weight: bold;  margin-bottom: 4px;'>Afgeleid uit BGT</p>"
                for (var i = 0; i < classes[0].length; i++) {
                    div.innerHTML += '<i style="background-color:' + getColorValue(classes[0][i]) + ';"></i>' + classes[0][i] + '<br>';
                }
                div.innerHTML += "<p style='font-weight: bold;  margin-bottom: 4px;'>Specifiek</p>"
                 for (var i = 0; i < classes[1].length; i++) {
                    div.innerHTML += '<i style="background-color:' + getColorValue(classes[1][i]) + ';"></i>' + classes[1][i] + '<br>';
                }
               
                return div;
            };

            self.legend.addTo(self.myMap);
        }
        self.initMap()


    self.getVeldenList = function(spid) {
            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function(response) {
                self.veldenList = response.data;
                // sort by tid
                self.veldenList.sort(function(a,b) { return a.tid-b.tid });
                // add auto increment
                for(i=0;i<self.veldenList.length;i++){
                    self.veldenList[i]['number'] = i+1;
                }

                console.log(self.veldenList);

                addObjectLayer(self.veldenList) 
               
            })
        }
        self.getVeldenList(self.sportparkId);


        function addObjectLayer(veldenList) {
            var i = 0 
            while( i < veldenList.length ) {
                var enhanchedGeoJson =
                    {
                        "type": "Feature",
                        "id" : veldenList[i].tid,
                        "properties": {
                            "sportpark_object_name": veldenList[i].name,
                            "sportpark_object_url": veldenList[i].url,
                            "sportpark_object_id": veldenList[i].tid,
                            "number": veldenList[i].number,
                            "sportpark_object_type": veldenList[i].objectType,
                            "sportpark_object_ondergrondType": veldenList[i].ondergrond_type,
                        },
                        "geometry": veldenList[i].geometry[0].geometry
                    }
                self.objects_layer_var.addData(enhanchedGeoJson) 
                    var noneIcon = L.icon({
                        iconUrl: '',
                        shadowUrl: '',
                        iconSize:     [0, 0], // size of the icon
                        shadowSize:   [0, 0], // size of the shadow
                        iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
                        shadowAnchor: [0, 0],  // the same for the shadow
                        popupAnchor:  [0, -25] // point from which the popup should open relative to the iconAnchor
                    });

                    var emptyIcon = L.divIcon({className: 'my-div-icon'});
                    var geojson = L.geoJson(enhanchedGeoJson,{
                    onEachFeature: function(feature,layer){
                        var centroidPolygon = L.polygon(feature.geometry.coordinates).getBounds().getCenter()
                        L.marker([centroidPolygon.lng,centroidPolygon.lat],{icon: emptyIcon}).bindTooltip(
                                feature.properties.number.toString(), //+ feature.properties.sportpark_object_name, 
                                {className: 'map_label', permanent: true, direction: 'center',opacity: 1}//,offset: L.point({x: -5, y: -5})}
                        ).addTo(self.myMap);
                    }
                  });

   
                i ++       
            }
            geojson.addTo(self.myMap);
        }

       self.sportparkData = function(spid){
            sportparkApi.getSportpark(spid).then(function(response){
                self.sportparkData = response.data;
                addSportparkLayer(response.data )
                console.log(self.sportparkData)
                    });           
        }

        function addSportparkLayer(sportparkData ) {
     
            var i = 0 
            while( i < sportparkData.geometry.length ) {
                var enhanchedGeoJson =
                    {
                        "type": "Feature",
                        "id" : sportparkData.tid,
                        "properties": {
                            "sportpark_object_name": sportparkData.name,
                        },
                        "geometry": sportparkData.geometry[i].geometry
                    }
                self.sportpark_layer_var.addData(enhanchedGeoJson); 
                i ++       
            }
            self.myMap.fitBounds(self.sportpark_layer_var.getBounds());
        }

        self.sportparkData(self.sportparkId)

        function onEachFeature(feature, layer) {
            layer.on( {
                mouseover: mouseOnFeature,
                mouseout: resetMouseOnFeature,
                click: showPopUp
            });
        }

        function mouseOnFeature(e) {
            self.map_info.update(e.target.feature.properties);
        }

        function resetMouseOnFeature(e) {
            self.map_info.update();
        }

        function showPopUp(e) {
            popup
                .setLatLng(e.latlng)
                .setContent(e.target.feature.properties.sportpark_object_name)
                .openOn(self.myMap);
        }

        function styleFeature(feature) {
            return {
                fillColor: getColor(feature.properties),
                weight: 1,
                opacity: 1,
                color: 'white',
                dashArray: '',
                fillOpacity: 0.5
            };
        };

        function styleSportpark(feature) {
            return {
                fillColor: 'grey',
                fillOpacity: 0,
                color: 'red'
            }
        }

        function getColorValue (value) {
            //value = value.toUpperCase()

            //if ( value === 'GRAS') { return 'lightgreen'}
            //if ( value === 'GRAVEL') { return 'orange'}
            //if ( value === 'KUNSTGRAS') { return 'lightblue'}
            if ( value === 'Gras') { return 'lightgreen' }
            if ( value === 'Gravel') { return 'orange'}
            if ( value === 'Kunststof(gras)/Verhard/Wetra') { return 'darkgreen'}
            if ( value === 'Aarde') { return 'brown'}
            if ( value === 'Kunststof') { return 'lightblue'}
            if ( value === 'Kunstgras (zand)') { return 'yellow'}
            if ( value === 'Kunstgras (rubber)') { return 'black'}
            if ( value === 'Verhard') { return 'black'}
            if ( value === 'Wetra') { return 'darkgreen'}
            return 'lightgray'
  
        }

        function getColor(properties) {
            if( properties.sportpark_object_type === "pand") {
                return getColorValue('Verhard')
            } else {
                return getColorValue(properties.sportpark_object_ondergrondType)

            }
        }

        function highlightLayer(layer) {
            layer.setStyle({
                    weight: 5,
                    color: 'red',
                    dashArray: '',
                    fillOpacity: 0.7
                    });

            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
            }
        }
    }
})();

(function (){
    'use strict';

    // onderhouden van de relatie tussen een huurder en een sportpark objecten, binnen
    // het geselecteerde sportpark

    angular.module('sportparken_detail')
        .component('objectHuurderRelatie', {
            templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/verhuur.html',
            controller: objectHuurderRelatieCtrl,
            controllerAs: 'ohrCtrl'
    });

    objectHuurderRelatieCtrl.$inject = ['$stateParams', 'sportparkApi', '$mdDialog' ]
    
    function objectHuurderRelatieCtrl ($stateParams, sportparkApi, $mdDialog){
        var self = this;
        self.sportparkId = $stateParams.id;
        self.selectedHuurder = {};
        self.relaties = [];
        self.huurdersList = [];
        self.sportparkObjectList = [];
        self.active = false;

        self.status = 'no status'
        self.getHuurders = function () {
            sportparkApi.getHuurders().then(function(response){
                self.huurdersList = response.data;
            })
        }
        self.getHuurders()

        self.getSportparkObjectenWithSportpark = function ( spid ) {
            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function (response ) {
                self.sportparkObjectList = response.data
            });
        }
        self.getSportparkObjectenWithSportpark( self.sportparkId )

        self.selectHuurder = function (obj) {
            if( self.selectedHuurder == obj ) {
                self.selectedHuurder = {};
                self.relaties = [];
                self.active = false;
            } else {
                self.selectedHuurder = obj;
                getHuurderRelaties(self.sportparkId, obj.tid)
                self.active = true;
            }
        }

        function getHuurderRelaties (spid, huurder_id) {
             sportparkApi.getHuurderSportparkObjectRelations(huurder_id, spid).then( function (response) {
                 self.relaties = response.data
             })
        };

        function addObjectHuurderRelation (huurder_id, object_id) {
            sportparkApi.addHuurderObjectRelation(huurder_id, object_id).then( function (response) {
                getHuurderRelaties(self.sportparkId, huurder_id)
            })
        };

        function removeHuurderRelation (rel_id) {
            sportparkApi.removeHuurderRelation(rel_id).then( function (response ) {
                getHuurderRelaties(self.sportparkId, self.selectedHuurder.tid)
            })
        }

        self.newRelation = function(ev) {

            $mdDialog.show({
                controller: newRelationCtrl,
                controllerAs: 'dlgNew',
                templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/dlg_nw_relatie.html',
//                template: '<div>Dialog</div><pre>[[dlgNew.text]]</pre><pre>id: [[dlgNew.parent.selectedHuurder | json]]</pre>',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: self.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
                self.status = 'given';
                }, function() {
                self.status = 'cancel';
            });
        };

        function newRelationCtrl( $mdDialog) {
            var that = this;
//            that.selectedObject
            that.parent = self;
            that.hide = function() {
                $mdDialog.hide();
            };

            that.cancel = function() {
                $mdDialog.cancel();
            };

            that.answer = function(answer) {
                $mdDialog.hide(answer);
            };

            that.addNew = function() {
                addObjectHuurderRelation(that.parent.selectedHuurder.tid, that.selectedObject.tid)
                $mdDialog.hide()
            }
        }


        self.showConfirm = function(ev, rel_id) {
        // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
                .title('Verwijderen object')
                .textContent('Weet u zeker dat u de geselecteerd object wilt verwijderen?.')
                .targetEvent(ev)
                .ok('Verwijderen')
                .cancel('Cancel');

            $mdDialog.show(confirm).then(function() {
                removeHuurderRelation(rel_id)
            }, function() {
                // canceld deletion
            });
        }

    };
})();


( function () {
    'use strict';
    
    angular.module("sportparken_detail")
        .component("huurderOverzicht", {
//            template: '<div>naam: [[huurderoverzichtctrl.title]] <br> sportparkId: [[huurderoverzichtctrl.id]]</div>',
            templateUrl: 'sportparken/static/app/components/sportparken_detail/partials/huurders.html',
            controller: huurderOverzichtCtrl, 
            controllerAs: 'huurderoverzichtctrl'
    });
    
    huurderOverzichtCtrl.$inject = ['sportparkApi', '$stateParams']
    
    function huurderOverzichtCtrl (sportparkApi, $stateParams) {
        var self = this;
        self.title = "huurderoverzicht"
        self.sportparkId = $stateParams.id
        
        self.huurdersList = [];
        self.selectedHuurders = [];
        self.selectedGeometry = [];
        self.getHuurdersList = function (spid) {
            sportparkApi.getHuurdersWithSportpark(spid).then( function(response) {
                self.huurdersList = response.data;
                angular.forEach(self.huurdersList, function(huurder) {
                    sportparkApi.getKVKData(huurder.kvk).then( function (response){
                        self.huurder.statitutairenaam = response.data._display;
                        if(response.data.communicatiegegevens) {
                            huurder.contacten = response.data.communicatiegegevens

                        }
                            if (response.data.postadres) {
                                huurder.adrestype = "postadres";
                                huurder.adres = response.data.postadres.volledig_adres
                            } else if (response.data.bezoekadres) {
                                huurder.adrestype = "bezoekadres";
                                huurder.adres = response.data.bezoekadres.volledig_adres
                            } else {
                                huurder.adres= "Bezoek en Postadres niet opgegeven bij KVK."
                            }                    })
                })
            })
        }
        self.getHuurdersList(self.sportparkId)

        var i, j
        self.toggle = function (obj) {
            // method used to maintain a list of selected
            // huurders within the list of huurders
            
            // check if in, ifso remove otherwise push
            i = contains(obj, self.selectedHuurders)

            if ( i >= 0 ) {
                self.selectedHuurders.splice(i,1);
            } else  {
                self.selectedHuurders.push(obj)
            };
            
            var tmp = []
            for (i = 0; i < self.selectedHuurders.length; i++) {
                for (j = 0; j < self.selectedHuurders[i].objecten.length; j++) {
                    tmp.push(self.selectedHuurders[i].objecten[j].tid)
                }
            }
            self.selectedGeometry = tmp
        }

        function contains (obj, list) {
            var i = 0;
            var x;
            for (i = 0; i < list.length; i++) {
                    if (list[i] === obj) {
                        x = i
                        return i;
                    }
                }
                return -1;
            }
    }
    
}) ();
