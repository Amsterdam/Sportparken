from django.conf.urls import url
from .views import (
		HuurderListApi,
		HuurderDetailApi,
		SportparkListApi,
		SportparkDetailApi,
		SportparkObjectListApi,
		SportparkObjectDetailApi,
		SportparkGeomDetailApi,
		SportparkObjectGeomDetailApi,
		RelatieListApi,
		RelatieDetailApi,
		UserLoginApi,
		)
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
	url(r'^auth/$', UserLoginApi.as_view(), name='auth' ),

	url(r'^huurder/$', HuurderListApi.as_view(), name='huurder-list' ),
	url(r'^huurder/(?P<pk>[0-9]+)$', HuurderDetailApi.as_view(), name='huurder-detail' ),

	url(r'^sportpark/$', SportparkListApi.as_view(), name='sportpark-list' ),
	url(r'^sportpark/(?P<pk>[0-9]+)$', SportparkDetailApi.as_view(), name='sportpark-detail' ),
	# url(r'^sportpark/(?P<pk>[0-9]+)/$', SportparkDetailApi.as_view(), name='sportpark-detail' ),  #temp to solve error

	url(r'^sportparkobject/$', SportparkObjectListApi.as_view(), name='sportparkObject-list' ),
	url(r'^sportparkobject/(?P<pk>[0-9]+)$', SportparkObjectDetailApi.as_view(), name='sportparkObject-detail' ),

	url(r'^sportparkgeometry/(?P<pk>[0-9]+)$', SportparkGeomDetailApi.as_view(), name='sportparkGeom-detail' ),
	url(r'^sportparkobjectgeometry/(?P<pk>[0-9]+)$', SportparkObjectGeomDetailApi.as_view(), name='sportparkObjectGeom-detail' ),	

	url(r'^relation/$', RelatieListApi.as_view(), name='relation-list' ),
	url(r'^relation/(?P<pk>[0-9]+)$', RelatieDetailApi.as_view(), name='relation-detail' ),

]

# urlpatterns = format_suffix_patterns(urlpatterns)