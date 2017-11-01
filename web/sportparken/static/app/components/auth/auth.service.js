(function() {
    'use strict';

    angular
        .module('sportparken_auth', [])
        .factory('authService', authService);

    authService.$inject = ['$http', '$localStorage'];

    function authService($http, $localStorage) {
        var service = {
            login: login,
            register: register,
            isLoggedIn: isLoggedIn
        };
        return service;

        ////////////////////
        function login(user) {
            var getAuth = $http.post('/api-token-auth/', user)
            
            function returnToken(data) {
                console.log(data.data);
                $localStorage.token = data.data.token;
            };

            function  errorToken(error){
                 console.log('error!');
                 return error.data.non_field_errors[0];
            }

            return getAuth.then(returnToken, errorToken);
        }

        function register(user) {
            return $http('/api/users/').save({
                username: user.username,
                password: user.password,
                email: user.email
            });
        }

        function isLoggedIn() {
            if ($localStorage.hasOwnProperty('token')) {

                if ($localStorage.token != '') { 
                     console.log('token added!')
                    return true;
                } else {
                return false;
                }
            } else {
            console.log('no token present, returning false')
            return false;
            }
        }
    }
})();
