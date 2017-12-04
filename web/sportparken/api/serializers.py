from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.gis.geos import GEOSGeometry

from rest_framework import serializers
from rest_framework_gis.serializers import GeoModelSerializer
from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework_gis.serializers import GeometrySerializerMethodField
from django.shortcuts import get_object_or_404
from sportparken.dataset.models import (
        Huurder,
        HuurderObjectRelation,
        Sportpark,
        SportparkGeometry,
        SportparkObject,
        SportparkObjectGeometry,
        Ondergrond,
		Soort,
        )

#User = get_user_model()

class HuurderListSerializer(serializers.ModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:huurder-detail')

	objecten = serializers.SerializerMethodField()

	def get_objecten(self, obj):
		request = self.context.get('request')
		spi = request.query_params.get('sp', None)
		return SportparkObjectDetailSerializer(obj.get_sp_objecten(spi), many=True, context={'request':request}).data

	class Meta:
		model = Huurder
		fields = [
			'url',
			'tid',
			'kvk',
			'name',
			'sport',
			'objecten',
			'bezoek_adres',
			'post_adres'
		]


class HuurderDetailSerializer(serializers.ModelSerializer):

	objecten = serializers.SerializerMethodField()

	def get_objecten(self, obj):
		request = self.context.get('request')
		spi = request.query_params.get('sp', None)
		return SportparkObjectDetailSerializer(obj.get_sp_objecten(spi), many=True, context={'request':request}).data

	class Meta:
		model = Huurder
		fields = [
			'tid',
			'name',
			'sport',
			'kvk',
			'objecten',
			'bezoek_adres',
			'post_adres'
		]


class SportparkGeometryDetailSerializer(GeoModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:sportparkgeometry-detail')

	class Meta:
		model = SportparkGeometry
		geo_field = 'geometry'

		#fields = '__all__'
		fields = [
			'tid',
			'url',
			'bron',
			'geometry',
		]


class SportparkNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sportpark
        fields = ('tid','name')


class SportparkDetailSerializer(serializers.ModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:sportpark-detail')

	geometry = SportparkGeometryDetailSerializer(source='sportparkgeometry_set', many=True)


	class Meta:
		model = Sportpark
		fields = [
			'tid',
			'url',
			'name',
			'geometry',
		]


class SportparkDetailGeoJsonSerializer(GeoFeatureModelSerializer):
    url = serializers.HyperlinkedIdentityField(view_name='api:sportpark-detail')

    sportparkname = SportparkNameSerializer(source='sportpark') # get id from sportpark column in sportparkgeometry

    # Convert sportparkname Nested JSON to flat key/values

    def to_representation(self, obj):
        """Move fields from sportparkName to user representation."""
        representation = super().to_representation(obj)
        model_representation = representation['properties'].pop('sportparkname')
        for key in model_representation:
            representation['properties'][key] = model_representation[key]

        return representation

    def to_internal_value(self, data):
        """Move fields related to sportparkName to their own dictionary."""
        model_internal = {}
        for key in SportparkNameSerializer.Meta.fields:
            if key in data:
                model_internal[key] = data.pop(key)

        internal = super().to_internal_value(data)
        internal['sportparkname'] = model_internal
        return internal

    def update(self, instance, validated_data):
        """Update fields. Assumes there is a sportparkName for every sportparkgeometry."""
        model_data = validated_data.pop('sportparkname')
        super().update(instance, validated_data)

        sportparkname = instance.sportparkname
        for attr, value in model_data.items():
            setattr(sportparkname, attr, value)
        sportparkname.save()

        return instance

    #geom_rd = GeometrySerializerMethodField()

    #def get_geom_rd(self, obj):
    #    geometry = GEOSGeometry(obj.geometry)
    #    geometry.transform(28992)
    #    return geometry

    class Meta:
        model = SportparkGeometry
        geo_field = 'geometry'

        fields = [
            'sportparkname',
            'url',
            'bron',
            'geometry',
        ]


class SportparkObjectListSerializer(serializers.ModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:sportparkObject-detail')

	geometry = serializers.SerializerMethodField()

	huurders = serializers.SerializerMethodField()

	def get_huurders(self, obj):
		request = self.context.get('request')
		qs = obj.get_huurder_set()
		return HuurderListSerializer(qs, many=True, context={'request':request}).data

	def get_geometry(self, obj):
		request = self.context.get('request')
		qs = obj.object_geometry_set
		return SportparkObjectGeomListSerializer(qs, many=True, context={'request':request}).data

	class Meta:
		model = SportparkObject
		fields = [
			'uid',
			'url',
			'tid',
			'name',
			'objectType',
			'ondergrond_type',
			'huurders',
			'soort',
			'omschrijving',
			'geometry',

		]

class SportparkObjectListGeoJsonSerializer(GeoFeatureModelSerializer):
    geometry = serializers.SerializerMethodField()
    geometry_information = serializers.SerializerMethodField()
    objectdetails = SportparkGeometry

    def get_geometry(self, obj):
        request = self.context.get('request')
        qs = obj.object_geometry_set
        geometryData = SportparkObjectGeomListSerializer(qs, many=True, context={'request':request}).data
        
        return geometryData[0]['geometry'] # still need to fix returning more than 1 geometry


    def get_geometry_information(self,obj):
        request = self.context.get('request')
        qs = obj.object_geometry_set
        geometryData = SportparkObjectGeomListSerializer(qs, many=True, context={'request':request}).data
        
        geometryData[0].pop('geometry', None) # still need to fix returning more than 1 geometry

        return geometryData[0]

    def get_soort(self, obj):
        request = self.context.get('request')
        qs = obj.object_soort_set
        return SoortSerializer(qs, many=True, context={'request':request}).data


   # Convert Nested JSON to flat key/values

    def to_representation(self, obj):
        """Move fields from sportparkName to user representation."""
        representation = super().to_representation(obj)
        model_representation = representation['properties'].pop('geometry_information')
        for key in model_representation:
            representation['properties'][key] = model_representation[key]

        return representation

    def to_internal_value(self, data):
        """Move fields related to sportparkName to their own dictionary."""
        model_internal = {}
        for key in SportparkNameSerializer.Meta.fields:
            if key in data:
                model_internal[key] = data.pop(key)

        internal = super().to_internal_value(data)
        internal['geometry_information'] = model_internal
        return internal

    def update(self, instance, validated_data):
        """Update fields. Assumes there is a sportparkName for every sportparkgeometry."""
        model_data = validated_data.pop('geometry_information')
        super().update(instance, validated_data)

        sportparkname = instance.sportparkname
        for attr, value in model_data.items():
            setattr(sportparkname, attr, value)
        sportparkname.save()

        return instance

    class Meta:
        model = SportparkObject
        geo_field = 'geometry'
        fields = [
            'tid',
            'name',
            'objectType',
            'ondergrond_type',
            'soort',
            'omschrijving',
            'geometry',
            'geometry_information'
        ]   
       # flatten = [ ('geometry_information', SportparkObjectGeomSerializer) ]

class SportparkObjectDetailSerializer(serializers.ModelSerializer):
	geometry = serializers.SerializerMethodField()

	def get_geometry(self, obj):
		request = self.context.get('request')
		qs = obj.object_geometry_set
		return SportparkObjectGeomListSerializer(qs, many=True, context={'request':request}).data

	def get_soort(self, obj):
		request = self.context.get('request')
		qs = obj.object_soort_set
		return SoortSerializer(qs, many=True, context={'request':request}).data


	class Meta:
		model = SportparkObject
		fields = [
			'tid',
			'name',
			'objectType',
			'ondergrond_type',
			'soort',
			'omschrijving',
			'geometry',
		]



class SportparkObjectGeomListSerializer(serializers.ModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:sportparkObjectGeom-detail')

	class Meta:
		model = SportparkObjectGeometry
		fields = '__all__'


class SportparkObjectGeomDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = SportparkObjectGeometry
		# fields = '__all__'
		fields = [
			'tid',
			'ondergrond',
			'sportpark_object_id',
			'sportpark_object_name',
			'sportpark_object_type',
			'ondergrond_type',
			'lokaalid',
			'bagpndid',
			'bron',
			'geometry',
		]



class SportparkObjectGeomDetailEditSerializer(serializers.ModelSerializer):
	class Meta:
		model = SportparkObjectGeometry
		# fields = '__all__'
		fields = [
			'tid',
			'ondergrond'
		]


class RelationListSerializer(serializers.ModelSerializer):
	sportparkObject = serializers.SerializerMethodField()
	huurder = serializers.SerializerMethodField()


	def get_sportparkObject(self, obj):
		vo = obj.sportpark_object
		request = self.context.get('request')
		return SportparkObjectDetailSerializer(vo, many=False, context={'request':request}).data

	def get_huurder(self, obj):
		vo = obj.huurder
		request = self.context.get('request')
		return HuurderDetailSerializer(vo, many=False, context={'request':request}).data


	class Meta:
		model = HuurderObjectRelation
		fields = [
			'tid',
			'sportparkObject',
			'huurder',
			]


class RelationPostRemoveSerializer(serializers.ModelSerializer):
	class Meta:
		model = HuurderObjectRelation
		fields = '__all__'


class OndergrondSerializer(serializers.ModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:ondergrond-detail')

	class Meta:
		model = Ondergrond
		fields = [
			'tid',
			'name',
			'url'
		]


class SoortSerializer(serializers.ModelSerializer):
	url = serializers.HyperlinkedIdentityField( view_name = 'api:soort-detail')

	class Meta:
		model = Soort
		fields = [
			'sid',
			'soort',
			'url'
		]


class UserLoginSerializer(serializers.ModelSerializer):
	token = serializers.CharField(allow_blank=True, read_only=True)
	username = serializers.CharField()

	class Meta:
		model = User
		fields  =[
		        'username',
		        'email',
		        'password',
		        'token',
		    ]
		extra_kwargs = {'password':
		                        {'write_only': True}
		                    }
	def validate(self, data):
		username = data.get('username', None)
		password = data['password']

		if not username:
			raise serializers.ValidationError('Username is verplicht')

		user = User.objects.filter(username=username).distinct()

		if user.exists() and user.count() == 1:
			user_obj = user.first()
		else:
			raise serializers.ValidationError('Username is niet correct')

		if user_obj:
			if not user_obj.check_password(password):
				raise serializers.ValidationError('Password niet correct')
			data['token'] = "SOME TOKEN"
		return data