( function () { 
    'use strict';
    var app = angular.module("sportparken", ['ui.router', 'ngMaterial'] )

    angular.module("sportparken")
        .config(function($httpProvider, $stateProvider, $urlRouterProvider, $interpolateProvider){

        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state( 'home', {
            url: '/',
//                component: 'home'
            template: '<div>home</div><div class="trow"><div class="t1 a">a</div><div class="t2 b">b</div></div><div>end home</div>'
        }).state( 'huurders', {
            url: '/huurders',
//            templateUrl: 'src/partials/huurders.html',
            component: 'crudHuurders',
        }).state( 'sportparken', {
            url: '/sportparken',
//            templateUrl: 'src/partials/sportparken-master.html' ,
//            controller: 'tst'
            component: 'sportparkenMaster'
        }).state( 'sportparken.sportparkendetail', {
            Abstract: true,
            url: '/{id}',
//            template: '<div>sportparken detail</div><div ui-sref="sportparken.sportparkendetail.objecten" ui-sref-active="active">Objecten detail</div><ui-view></ui-view>',
            templateUrl: 'static/src/partials/sportparken-detail-container.html'
        }).state( 'sportparken.sportparkendetail.objecten', {
            url: '/objecten',
//            template: '<div>detail</div>',
            component: 'sportparkObjecten',
        }).state( 'sportparken.sportparkendetail.huurderoverzicht', {
            url: '/huurderoverzicht',
//            template: '<div>detail</div>',
            component: 'huurderOverzicht',
        }).state( 'sportparken.sportparkendetail.objectinformatie', {
            url: '/objectonderhoud',
//            template: '<div>detail</div>',
            component: 'sportparkObjectInformatie',
        }).state( 'sportparken.sportparkendetail.verhuur', {
            url: '/verhuur',
//            template: '<div>detail</div>',
            component: 'objectHuurderRelatie',
        });
    });

    
    app.controller("mainCtrl", ['$scope', function ($scope) {
        $scope.mssgs = "this is the active main controller"
    }])

    app.controller("tst", ['$scope', '$state', function ($scope, $state) {
        $scope.mssgs = "this is the active tst controller"
        $scope.hide = false
        $scope.stateName = "sportparken.sportparkendetail"
        $scope.state = $state;

        $scope.clicked = function () {
            console.log("clicked")
    //                $scope.hide = true
        }
    }])

}) ();