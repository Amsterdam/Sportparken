(function() {
    'use strict';

    angular.module('sportparken_auth')
           .controller('AuthController', AuthController);

    AuthController.$inject = ['$scope','$http','$location', '$localStorage', 'authService'] //, 'notifyService'];

    function AuthController($scope, $http, $location, $localStorage, authService){ //, notifyService) {
        var vm = this;

        vm.login = login;
        vm.logout = logout;
        vm.register = register;
        vm.isLoggedIn = isLoggedIn;
        // TODO: Save all these in $localStorage
        vm.$storage = $localStorage;
        vm.user = {
            username: '',
            email: '',
            password: '',
            error: ''
        };

        function login(user) {
            var response = authService.login(user);
            console.log(isLoggedIn());
            response.then(succesLogin, errorLogin)

            function succesLogin(data) {
                console.log(data);
                if (isLoggedIn()==true) {
                console.log(isLoggedIn());
        
                $localStorage.username = user.username;
                // return to main page
                $location.path('/');
                }
                else {
                    vm.user.error = data;
                }
            }

            function errorLogin(data) { 
                vm.user.error = data;
                error = data
                console.log(data);
            }
            
        }

        function logout() {
            console.log('logging out!')
            $localStorage.token = '';
            $localStorage.username = '';
            $location.path('/');
        }

        function register(user) {
            var resource = authService.register(user);
            resource.$promise
                .then(function(response) {
                    $localStorage.token = response.token;
                    $localStorage.username = user.username;
                    $location.path('/sportparken');
                })
                .catch(function(error) {
                    console.log(error);
                });
        }

        function isLoggedIn() {
            return authService.isLoggedIn();
        }
    }
})();
