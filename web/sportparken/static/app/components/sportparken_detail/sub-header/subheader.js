( function () {
    'use strict';
    angular.module("subHeader", [])
}) ();

(function () {
    'use strict';

    angular.module('subHeader')
        .component('subHeader', {
            bindings: {
                size: '='
            },
            templateUrl: 'sportparken/static/app/components/sportparken_detail/sub-header/subheader.html',
            controller: subHeaderController,
            controllerAs: 'vm'
        });

    subHeaderController.$inject = ['$scope'];

    function subHeaderController ($scope) {
        const vm = this;

        $scope.$watch('vm.size', updateSize);

        function updateSize (size) {

        }
    }
})();