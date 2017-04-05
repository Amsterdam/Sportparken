(function () {
	'use strict';
	angular.module('sportparken')
		.factory('sportparkApi', sportparkApiFact );

	sportparkApiFact.$inject = ['$http'];

	function sportparkApiFact ($http) {
		var instances = {
			sportpark: 'http://127.0.0.1:8000/api/sportpark/',
			sportparkObject: 'http://127.0.0.1:8000/api/sportparkobject/',
			sportparkGeometry: 'http://127.0.0.1:8000/api/sportparkgeometry/',
			huurders: 'http://127.0.0.1:8000/api/huurder/',
			relations: 'http://127.0.0.1:8000/api/relation/',
			kvk: 'https://api.datapunt.amsterdam.nl/handelsregister/maatschappelijkeactiviteit/',
		}

		return {
			getSportparken: getSportparken,
			getSportpark: getSportpark,
			getSportparkObjectenWithSportpark: getSportparkObjectenWithSportpark,
			getSportparkGeometry:getSportparkGeometry,
			getSportparkObject:getSportparkObject,
			getFromUrl:getFromUrl,
			getHuurders:getHuurders,
			getHuurdersWithSportpark:getHuurdersWithSportpark,
			getHuurder:getHuurder,
			getHuurderSportparkObjectRelations: getHuurderSportparkObjectRelations,
			addHuurderObjectRelation:addHuurderObjectRelation,
			removeHuurderRelation:removeHuurderRelation,
			saveSportparkObjectChanges:saveSportparkObjectChanges,
			updateHuurder:updateHuurder,
			createHuurder:createHuurder,
			deleteHuurder:deleteHuurder,
			getKVKData: getKVKData,
		}

		function getSportparken () {
			return $http.get(instances.sportpark);
		}

		function getSportpark (id) {
			return $http.get(instances.sportpark + id)
		}

		function getSportparkObjectenWithSportpark(spid) {
			return $http.get(instances.sportparkObject + '?sp=' + spid)
		}

		function getSportparkGeometry(spid) {
			return $http.get(instances.sportparkGeometry + spid )
		}

		function getFromUrl(url) {
			return $http.get(url)
		}

		function getHuurders() {
			return $http.get(instances.huurders)
		}

		function getHuurder(id) {
			return $http.get(instances.huurders + id)
		}

		function getHuurderSportparkObjectRelations(h_id, sp_id) {
			return $http.get(instances.relations + '?hid=' + h_id + '&sp=' + sp_id )
		}

		function addHuurderObjectRelation(h_id, o_id) {
			var data = {"huurder": h_id, "sportpark_object": o_id };
			return $http.post(instances.relations, data)
		}

		function removeHuurderRelation(rel_id) {
			return $http.delete(instances.relations + rel_id)
		}

		function getSportparkObject(id) {
			return $http.get(instances.sportparkObject + id )
		}

		function saveSportparkObjectChanges(data) {
			var id = data.tid
			return $http.put(instances.sportparkObject + id, data)
		}

		function updateHuurder(data) {
			var id = data.tid
			return $http.put(instances.huurders + id, data)
		}

		function createHuurder(data) {
			return $http.post(instances.huurders, data)
		}

		function deleteHuurder(id) {
			return $http.delete(instances.huurders + id)
		}

		function getHuurdersWithSportpark(id) {
			return $http.get(instances.huurders + '?sp=' + id)
		}

		function getKVKData(kvkId) {
		    return $http.get(instances.kvk + kvkId )
		}
	}

}) ();


        
