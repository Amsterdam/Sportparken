( function () {
    'use strict'
    angular.module("sportparken", [
        'ui.router', 
        'ngMaterial', 
        
        'header',
        'subHeader',
        'sportparken_detail',
    ] )
    
    angular.module("sportparken")
        .config(function($httpProvider, $stateProvider, $urlRouterProvider, $interpolateProvider){

        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');

         $stateProvider
            .state( 'home', {
                 url: '/',
                 component: 'overzicht' 
                 //,template: '<div>home</div>'
            }).state( 'huurders', {
                url: '/huurders',
                component: 'crudHuurders',
            }).state( 'sportparken', {
                url: '/sportparken',
                component: 'overzicht' 
            }).state( "sportparken.sportparkendetail", {
                url: '/{id}',
                component: "testrun"
            }).state( "sportparken.sportparkendetail.objecten", {
                url: '/objecten',
                component: "objectOverzicht"
            }).state( "sportparken.sportparkendetail.edit_objecten", {
                url: '/editobjecten',
                component: "editObject"
            }).state( "sportparken.sportparkendetail.verhuur", {
             url: "/verhuur",
             component: "objectHuurderRelatie"
            }).state( "sportparken.sportparkendetail.huurders", {
             url: "/huurders",
             component: "huurderOverzicht"
         });
         
        $urlRouterProvider.otherwise('/');
    });
}) ();


( function () {
    'use strict';
    angular.module("sportparken").controller('mainCtrl', mainCtrl);
    
    mainCtrl.$inject = ['$scope']
    
    function mainCtrl($scope) {
    }
    
}) ();