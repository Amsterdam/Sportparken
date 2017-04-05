(function () {
    'use strict';
    angular.module('sportparken')
        .component( 'crudHuurders', {
            templateUrl: 'static/src/partials/crud-huurders.html',
            controller: huurderCntrl,
            controllerAs: 'hlCtrl'
        });

    huurderCntrl.$inject = ['sportparkApi', '$mdDialog']

    function huurderCntrl (sportparkApi, $mdDialog) {
        var self = this;
        self.huurders = []

        self.newFlag = false;
        self.selectedFlag = false;
        self.master_Huurder = {}
        self.user_Huurder = {}

        self.selectHuurder = function (obj) {
            // receive a selected huurder and populate information
            sportparkApi.getFromUrl(obj.url).then( function (response) {
                self.newFlag = false;
                self.selectedFlag = true;
                self.master_Huurder = response.data;

                sportparkApi.getKVKData(self.master_Huurder.kvk).then( function (response){
                    if(response.data.communicatiegegevens) {
                          self.master_Huurder.contacten = response.data.communicatiegegevens
                          }
                          if(response.data.postadres) {
                              self.master_Huurder.postadres= response.data.postadres.volledig_adres
                          } else {
                              self.master_Huurder.postadres= "!!ONBEKEND!!"
                          }
                          self.reset()
                      }, function (response) {
                        // response gets bad result

                      })
                self.reset()
            })
        }

        self.createNew = function () {
            self.newFlag = true;
            self.selectedFlag = false;
            self.master_Huurder = {}
            self.reset()
        }

        self.reset = function() {
            self.user_Huurder = angular.copy(self.master_Huurder);
        };

        self.reset();

        self.getHuurders = function() {
            sportparkApi.getHuurders().then( function (response) {
                self.huurders = response.data;
            } )
        }
        self.getHuurders()

        self.saveChanges = function (data) {
            if ( self.newFlag ) {
                sportparkApi.createHuurder(data).then( function (response) {

                    self.getHuurders()
                    self.selectHuurder(response.data)
                });
            }
            if ( self.selectedFlag ){
                sportparkApi.updateHuurder(data).then( function (response) { 
                    self.master_Huurder = angular.copy(self.user_Huurder);
                    self.getHuurders()
                });
            }
        };

        self.deleteHuurder = function ( id ) {
            sportparkApi.deleteHuurder(id).then( function (response) {
                self.selectedFlag = false
                self.newFlag = false 
                self.master_Huurder = {}
                self.reset()
                self.getHuurders()
            });
        };

        self.showConfirm = function(ev, item) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.confirm()
              .title('Verwijderen huurder')
              .textContent('Weet u zeker dat u de geselecteerd huurder en alle bijbehorende relaties wilt verwijderen?.')
              .targetEvent(ev)
              .ok('Verwijderen')
              .cancel('Cancel');

                $mdDialog.show(confirm).then(function() {
                self.status = 'confirmed delete';
                self.deleteHuurder(item.tid)
            }, function() {
                self.status = 'cancelled delete';
        });

        };
    }
}) ();