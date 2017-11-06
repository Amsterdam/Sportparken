from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.http import Http404
from rest_framework import generics, viewsets
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from sportparken.dataset.models import (
        Huurder,
        HuurderObjectRelation,
        Sportpark,
        SportparkObjectGeometry,
        SportparkObject,
        SportparkGeometry,
        Ondergrond,
        Soort,
        )

from sportparken.api.serializers import (
        HuurderListSerializer,
        HuurderDetailSerializer,
        RelationListSerializer,
        SportparkDetailSerializer,
        SportparkObjectListSerializer,
        SportparkObjectDetailSerializer,
        SportparkGeometryDetailSerializer,
        SportparkObjectGeomDetailSerializer,
        RelationPostRemoveSerializer,
        UserLoginSerializer,
        OndergrondSerializer,
        SoortSerializer,
)

#User = get_user_model()


class HuurderListApi(generics.ListCreateAPIView):
    queryset = Huurder.objects.all()
    serializer_class = HuurderListSerializer

    def get_queryset(self):
        queryset = Huurder.objects.all()
        spid = self.request.query_params.get('sp', None)
        if spid is not None:
            queryset = queryset.filter(ho_set__sportpark_object__sportpark__tid=spid).distinct()
        return queryset


class HuurderDetailApi(generics.RetrieveUpdateDestroyAPIView):
    queryset = Huurder.objects.all()
    serializer_class = HuurderDetailSerializer


class SportparkDetailApi(viewsets.ModelViewSet):
    queryset = Sportpark.objects.all()
    serializer_class = SportparkDetailSerializer


class SportparkObjectListApi(generics.ListAPIView):

    serializer_class = SportparkObjectListSerializer

    def get_queryset(self):
        queryset = SportparkObject.objects.all()
        spid = self.request.query_params.get('sp', None)
        if spid is not None:
            queryset = queryset.filter(sportpark__tid=spid)
        return queryset


class SportparkObjectDetailApi(generics.RetrieveUpdateAPIView):
    queryset = SportparkObject.objects.all()
    serializer_class = SportparkObjectDetailSerializer


class SportparkGeometryDetailApi(viewsets.ModelViewSet):
    queryset = SportparkGeometry.objects.all()
    serializer_class = SportparkGeometryDetailSerializer


class OndergrondDetailApi(viewsets.ModelViewSet):
    queryset = Ondergrond.objects.all()
    serializer_class = OndergrondSerializer


class SoortDetailApi(viewsets.ModelViewSet):
    queryset = Soort.objects.all()
    serializer_class = SoortSerializer


class SportparkObjectGeomDetailApi(APIView):
	def get_object(self, pk):
		try:
			return SportparkObjectGeometry.objects.get(pk=pk)
		except SportparkObjectGeometry.DoesNotExist:
			raise Http404

	def get(self, request, pk, format=None):
		snippet = self.get_object(pk)
		serializer = SportparkObjectGeomDetailSerializer(snippet)
		return Response(serializer.data)

	def put(self, request, pk, format=None):
		snippet = self.get_object(pk)
		serializer = SportparkObjectGeomDetailSerializer(snippet, data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RelatieListApi(generics.ListCreateAPIView):
    serializer_class = RelationListSerializer

    def get_queryset(self):
        queryset = HuurderObjectRelation.objects.all()

        spid = self.request.query_params.get('sp', None)
        hid = self.request.query_params.get('hid', None)

        if spid:
            queryset = queryset.filter(sportpark_object__sportpark__tid=spid)

        if hid:
            queryset = queryset.filter(huurder__tid=hid)

        return queryset

    def post(self, request, format=None):
        relation = RelationPostRemoveSerializer(data=request.data)
        if relation.is_valid():
            relation.save()
            return Response(relation.data, status=status.HTTP_201_CREATED)

        return Response(relation.errors, status=status.HTTP_400_BAD_REQUEST)


class RelatieDetailApi(generics.RetrieveDestroyAPIView):
    serializer_class = RelationPostRemoveSerializer
    queryset = HuurderObjectRelation.objects.all()


class UserLoginApi(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserLoginSerializer
