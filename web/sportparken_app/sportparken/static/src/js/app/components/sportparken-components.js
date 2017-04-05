( function () {
    'use strict';
    
    angular.module("sportparken")
        .component('sportparkenMaster', {
            templateUrl: 'static/src/partials/sportparken-master.html',
            controller: spMasterCtrl,
            controllerAs: 'spmasterctrl'
    })
    
    spMasterCtrl.$inject = ['$state', 'sportparkApi' ];
    
    function spMasterCtrl ($state, sportparkApi) {
        var self = this;
        
        self.title = "Sportparken master list"
        self.stateName = "sportparken.sportparkendetail"
        self.state = $state;
        
        self.sportparkenList = []
        
        self.getSportparkenList = function () {
            sportparkApi.getSportparken().then( function( response ) { 
                self.sportparkenList = response.data
            })
        }
        
        self.getSportparkenList();
    }
    
} ) ();

( function () {
    'use strict';
    
    angular.module("sportparken")
        .component("sportparkObjecten", {
//            template: '<div>naam: [[spobjectctrl.title]] <br> sportparkId: [[spobjectctrl.id]]<div><div><veld-list sportpark-id=spobjectctrl.id></veld-list><div class="temp"><sport-map></sport-map></div></div>',
            templateUrl: 'static/src/partials/sportparken-objecten-detail.html',
            controller: sportparkObjectenCtrl, 
            controllerAs: 'spobjectctrl'
    });
    
    sportparkObjectenCtrl.$inject = ['sportparkApi', '$stateParams']
    
    function sportparkObjectenCtrl (sportparkApi, $stateParams) {
        var self = this;
        self.title = "objecten detail"
        self.description = "master holder voor lijst met velden + huurder informate en kaart"
        self.sportparkId = self.sportparkId || $stateParams.id
        self.selectedObject = {};
        self.selectedGeometry = [];
        self.veldenList = [];
        self.getVeldenList = function(spid) {
            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function(response) {
                self.veldenList = response.data;
            })
        }
        self.getVeldenList(self.sportparkId);

        self.selectObject = function (obj) {
            var tmp = [];

            if( self.selectedObject == obj ) {
                self.selectedObject = {}
            } else {
                self.selectedObject = obj
                var i;
                for (i=0; i < self.selectedObject.geometry.length; i++ ) {
                    tmp.push(self.selectedObject.geometry[i].tid)
                }
            }
            self.selectedGeometry = tmp;
        }
    }
    
}) ();


( function () {
    'use strict';
    
    angular.module("sportparken")
        .component("huurderOverzicht", {
//            template: '<div>naam: [[huurderoverzichtctrl.title]] <br> sportparkId: [[huurderoverzichtctrl.id]]</div>',
            templateUrl: 'static/src/partials/sportparken-huurders-detail.html',
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
                        if(response.data.communicatiegegevens) {
                            huurder.contacten = response.data.communicatiegegevens

                        }
                        if(response.data.postadres) {
                            huurder.postadres= response.data.postadres.volledig_adres
                        } else {
                            huurder.postadres= "!!ONBEKEND!!"
                        }
                    })
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


(function () {
    'use strict';

    // onderhouden van sportpark object kenmerken behorende bij het 
    // geslecteerde sportpark

    angular.module('sportparken')
        .component( 'sportparkObjectInformatie', {
            templateUrl: 'static/src/partials/editSportparkObject.html',
            controller: sportparkObjectInformatieCtrl,
            controllerAs: 'spomdCtrl'
        });

        sportparkObjectInformatieCtrl.$inject = ['$stateParams', 'sportparkApi',];

        function sportparkObjectInformatieCtrl ($stateParams, sportparkApi) {
            var self = this;
            self.spId = $stateParams.id;
            self.sportparkObjecten = [];
            self.selectedObject = {};
            self.master_objectDetail = {};
            self.user_objectDetail = {};
            self.objectTypeOpties = ['pand', 'veld', ];
            self.selected = false;

            self.getSportparkObjecten = function (sp_id) {
                sportparkApi.getSportparkObjectenWithSportpark(sp_id).then( function (response) {
                    self.sportparkObjecten = response.data;
                    self.selected = false;
                });
            };

            self.getSportparkObjecten(self.spId)

            self.loadObjectDetailInformation = function (url) {
                sportparkApi.getFromUrl(url).then ( function (response) {
                    self.master_objectDetail = response.data;
                    self.selected = true;
                    self.reset()
                })
            }

            self.selectObject = function (obj) {
                self.selectedObject = obj
                self.loadObjectDetailInformation(obj.url)
            }

            self.reset = function () {
                self.user_objectDetail = angular.copy(self.master_objectDetail)
            }

            self.saveChanges = function(obj){
                sportparkApi.saveSportparkObjectChanges(obj).then( function (response) {
                    self.getSportparkObjecten(self.spId)
                    self.master_objectDetail = {}
                    self.user_objectDetail = {}
                });
            }
        };
}) ();


(function (){
    'use strict';

    // onderhouden van de relatie tussen een huurder en een sportpark objecten, binnen
    // het geselecteerde sportpak

    angular.module('sportparken')
        .component('objectHuurderRelatie', {
            templateUrl: 'static/src/partials/sportpark-verhuur.html',
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
                templateUrl: 'static/src/partials/dlg_nw_relatie.html',
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

//        self.spId = $stateParams.id;
//        self.selectedHuurderId = 0
//        self.huurderSet = []
//        self.sportparkObjectSet = []
//        self.huurderObjectSet = []
//        self.selectedObject = null
//
//        self.getHuurders = function () {
//            sportparkApi.getHuurders().then(function(response){
//                self.huurderSet = response.data;
//            })
//        }
//
//        self.getSportparkObjecten = function ( spid ) {
//            sportparkApi.getSportparkObjectenWithSportpark(spid).then( function (response ) {
//                self.sportparkObjectSet = response.data
//            });
//        }
//
//        self.selectHuurder = function(h_id) {
//            self.selectedHuurderId = h_id
//            self.getHuurderObjectRelationSet(h_id, self.spId)
//        }
//
//        self.getHuurderObjectRelationSet = function ( h_id, sp_id ){
//            sportparkApi.getHuurderSportparkObjectRelations(h_id, sp_id).then( function (response) {
//                self.huurderObjectSet = response.data
//            })
//        }
//
//        self.addObjectHuurderRelation = function () {
//            sportparkApi.addHuurderObjectRelation(self.selectedHuurderId, self.selectedObject).then( function (response) {
//                self.getHuurderObjectRelationSet(self.selectedHuurderId, self.spId)
//            })
//        };
//
//        self.removeHuurderRelation = function (rel_id) {
//            sportparkApi.removeHuurderRelation(rel_id).then( function (response ) {
//                self.getHuurderObjectRelationSet(self.selectedHuurderId, self.spId)
//            })
//        }
//
//        self.showConfirm = function(ev, rel_id) {
//            // Appending dialog to document.body to cover sidenav in docs app
//            var confirm = $mdDialog.confirm()
//              .title('Verwijderen object')
//              .textContent('Weet u zeker dat u de geselecteerd object wilt verwijderen?.')
//              .targetEvent(ev)
//              .ok('Verwijderen')
//              .cancel('Cancel');
//
//                $mdDialog.show(confirm).then(function() {
//                self.status = 'confirmed delete';
//                self.removeHuurderRelation(rel_id)
//            }, function() {
//                self.status = 'cancelled delete';
//        });
//        }
//
//        self.getHuurders();
//        self.getSportparkObjecten(self.spId);

    };
})();