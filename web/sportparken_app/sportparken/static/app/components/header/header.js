( function () {
    'use strict';
    angular.module("header", [])
}) ();

(function () {
    'use strict';

    angular.module('header')
        .component('spHeader', {
            bindings: {
                size: '='
            },
            templateUrl: 'static/app/components/header/header.html',
            controller: siteHeaderController,
            controllerAs: 'vm'
        });

    siteHeaderController.$inject = ['$scope'];

    function siteHeaderController ($scope) {
        const vm = this;
    }
})();