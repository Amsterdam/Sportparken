(function () {
  'use strict';
  
  var app = angular
    .module('sportparken', [
      // angular modules
      'ui.router',
      'ngMaterial',
      'ngStorage',
      'ngMessages',

      // project modules
      'sportparken_auth',
      'sportparken_detail',
      'header',
      'subHeader',
    ]);

 
  app.config(configFunction);

    configFunction.$inject = ['$urlRouterProvider','$httpProvider', '$stateProvider','$interpolateProvider'];

    function configFunction($urlRouterProvider, $httpProvider, $stateProvider, $interpolateProvider) {
        // Stop the removal of trailing slash -- Django needs ending slash
        //$resourceProvider.defaults.stripTrailingSlashes = false;
        // Setup header stuff for CSRF token
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

        // Hack to let django ignore [[]] for favour of angular using it
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');

        $stateProvider
            .state( 'huurders', {
                url: '/huurders',
                component: 'crudHuurders',
            }).state( 'sportparken', {
                url: '/sportparken',
                component: 'overzicht' 
            }).state( "sportparken.sportparkendetail", {
                url: '/{id}', // extends /sportparken
                component: "testrun"
            }).state( "sportparken.sportparkendetail.objecten", {
                url: '/objecten', // extends /sportparken/21/objecten
                component: "objectOverzicht"
            }).state( "sportparken.sportparkendetail.print", {
                url: '/print',
                component: "print"
            }).state( "sportparken.sportparkendetail.edit_objecten", {
                url: '/editobjecten',
                component: "editObject"
            }).state( "sportparken.sportparkendetail.verhuur", {
             url: "/verhuur",
             component: "objectHuurderRelatie"
            }).state( "sportparken.sportparkendetail.huurders", {
             url: "/huurders",
             component: "huurderOverzicht"
            }).state('login', {
              url:'/login',
              templateUrl: 'sportparken/static/app/components/auth/login.html',
              //template: '<div>TEST'+vm.name+'</div>'
              controller: 'AuthController'
              

            });
         
        $urlRouterProvider.otherwise('/sportparken');
    };
    
    // to work with ui-router add mainCtrl 
    app.controller('mainCtrl', mainCtrl);
    
    mainCtrl.$inject = ['$scope']

    function mainCtrl($scope) {  
    }
    

    // for template locations in modules
    app.constant('STATIC_URL', '/static/app/components');


})();