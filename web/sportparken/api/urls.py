from django.conf.urls import url, include
from rest_framework import routers

# Explicit loaded views
from .views import (
    HuurderListApi,
    HuurderDetailApi,
    SportparkDetailApi,
    SportparkObjectListApi,
    SportparkObjectDetailApi,
    SportparkGeometryDetailApi,
    SportparkObjectGeomDetailApi,
    SoortDetailApi,
    OndergrondDetailApi,
    RelatieListApi,
    RelatieDetailApi,
    UserLoginApi,
)

# Add user add/delete/create extensions on api/users
router = routers.DefaultRouter()
router.register(r'users', UserLoginApi)
router.register(prefix='sportpark', viewset=SportparkDetailApi)
router.register(prefix='sportparkgeometry', viewset=SportparkGeometryDetailApi)
router.register(prefix='soort', viewset=SoortDetailApi)
router.register(prefix='ondergrond', viewset=OndergrondDetailApi)

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^huurder/$',
        HuurderListApi.as_view(),
        name='huurder-list'),
    url(r'^huurder/(?P<pk>[0-9]+)$',
        HuurderDetailApi.as_view(),
        name='huurder-detail'),
    url(r'^sportparkobject/$',
        SportparkObjectListApi.as_view(),
        name='sportparkObject-list'),
    url(r'^sportparkobject/(?P<pk>[0-9]+)$',
        SportparkObjectDetailApi.as_view(),
        name='sportparkObject-detail'),

    url(r'^sportparkobjectgeometry/(?P<pk>[0-9]+)$',
        SportparkObjectGeomDetailApi.as_view(),
        name='sportparkObjectGeom-detail'),

    url(r'^relation/$',
        RelatieListApi.as_view(), name='relation-list'),
    url(r'^relation/(?P<pk>[0-9]+)$',
        RelatieDetailApi.as_view(), name='relation-detail'),
]
