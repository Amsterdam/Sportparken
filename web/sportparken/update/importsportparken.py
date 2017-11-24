import os
import sys
import json
import django
import requests

from reprojectgeojson import rd2wgsGeojson
from shapely.geometry import shape
from django.contrib.gis.geos import fromstr, MultiPolygon


def convertPoly2MultiPoly(geom):
    if isinstance(geom, str):
        geom = json.loads(geom)
        #print(type(geom))
    # this seems to work correctly
    if geom["type"] == 'Polygon':
        geom = MultiPolygon(fromstr(json.dumps(geom)),)
    return geom


def readJson(file):
    return json.load(open(file))


def outerRing(geom):
    if geom["type"] == 'MultiPolygon':
        geom["coordinates"] = [[geom["coordinates"][0][0], ]]
    return geom


def apiGeometry2pg(data, Sportpark, SportparkGeometry):
    for item in data["sportparken"]:
        SportparkItem = Sportpark(tid=item["id"], name=item["name"])
        SportparkItem.save()
    for sp in data["sportparken_geometry"]:
        result = {}
        response = requests.get(sp["uri"])
        geom = response.json()["geometrie"]

        geom = outerRing(geom)
        result['Geometry'] = rd2wgsGeojson(geom)

        #print(shape(geom).to_wkt)
        SportparkGeom = SportparkGeometry(sportpark_id=sp["sportpark_id"],
                                          bron=sp["uri"],
                                          geometry=result['Geometry'])
        SportparkGeom.save()


def getWFSFeaturesWithinPolygon(wfsURL, layerName, GML, spid):
    # Example: https://map.data.amsterdam.nl/maps/bgtobjecten?REQUEST=GetFeature&SERVICE=wfs&Version=1.0.0&typeName=ms:BGT_BTRN_groenvoorziening&srsNAME=urn:ogc:def:crs:EPSG::4326&FILTER=<ogc:Filter><ogc:Within><gml:MultiPolygon srsName="EPSG:4326"><gml:polygonMember><gml:Polygon><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>4.89566592,52.41515348 4.89574274,52.41519665 4.8957942,52.41520363 4.89585313,52.41519937 4.89590495,52.41517364 4.89595676,52.41514792 4.89618611,52.41504513 4.89635251,52.41497816 4.89669975,52.41486458 4.89685122,52.41481559 4.89727973,52.41467753 4.89761594,52.41456389 4.897823,52.41447905 4.89796369,52.41440521 4.89800256,52.41437784 4.898279,52.41418323 4.89846075,52.41405769 4.89855719,52.41399042 4.89858328,52.41396121 4.89858385,52.41390934 4.89855228,52.41388318 4.89834311,52.41370987 4.89814967,52.41356022 4.89801535,52.4134544 4.89761767,52.41313702 4.8974024,52.41296473 4.89668365,52.41239116 4.8964442,52.41220059 4.89599261,52.41184341 4.89575992,52.4116577 4.89558351,52.41150642 4.89546762,52.41147237 4.89539635,52.41147987 4.89493112,52.41170211 4.894841,52.41177971 4.89478877,52.41187939 4.89472055,52.41317238 4.89472698,52.41325585 4.89474481,52.41330779 4.89479185,52.41338016 4.89482653,52.4134396 4.89481866,52.41346708 4.89478415,52.4134918 4.89470032,52.41352547 4.89463595,52.41354221 4.89463128,52.41365456 4.89462594,52.41378302 4.89461958,52.41393576 4.89462659,52.41393939 4.89466149,52.41395746 4.89465453,52.4140708 4.89466117,52.41431945 4.89467052,52.41436099 4.89467987,52.41440253 4.89471689,52.41443461 4.89477448,52.41447689 4.89491769,52.41458203 4.89521691,52.41481783 4.89555275,52.41506957 4.89566592,52.41515348</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon></gml:polygonMember></gml:MultiPolygon></ogc:Within></ogc:Filter>
    spatialFilter='<ogc:Filter>' \
                  '<ogc:Intersects>' \
                  '<ogc:PropertyName>' + str(spid) + '</ogc:PropertyName>' \
                  + GML + \
                  '</ogc:Intersects>' \
                  '</ogc:Filter>'

    params = 'REQUEST=GetFeature&' \
             'SERVICE=wfs&' \
             'VERSION=1.0.0&' \
             'TYPENAME=' \
             + layerName + '&' \
             'SRSNAME=urn:ogc:def:crs:EPSG::4326&' \
             'FILTER=' + spatialFilter + '&' \
             'OUTPUTFORMAT=geojson'

    print('sportpark ' + str(spid))
    response = requests.get(wfsURL + params)
    return response.json()


def main():
    # Define paths to load django settings
    script_path = os.path.dirname(__file__)
    project_dir = os.path.abspath(os.path.join(script_path, '..','..'))
    print(project_dir)
    sys.path.insert(0, project_dir)
    os.environ['DJANGO_SETTINGS_MODULE'] = 'sportparken.settings'

    django.setup()

    from sportparken.dataset.models import (SportparkGeometry,
                                            Sportpark,
                                            SportparkObjectGeometry,
                                            SportparkObject)
    from django.contrib.gis.db.models.functions import AsGML

    # load 4 new sportparken in 2 models
    data = readJson('sportparken/update/aanvullingsportterreinen.json')
    apiGeometry2pg(data, Sportpark, SportparkGeometry)

    # Set variables for WFS request
    sportparksObjects = None
    bgtWFS = 'https://map.data.amsterdam.nl/maps/bgtobjecten?'

    for sp in data['sportparken']:
        sportparksObjects = None
        # Get all BGT layers within geometry
        for layer in data["bgt_layers"]:
            # select each sportpark and return gml value
            sportparkGML = SportparkGeometry.objects.filter(sportpark_id=sp["id"]).annotate(gml=AsGML('geometry'))

            for i in range(0, len(sportparkGML)):
                print('{} of {} sportpark geoms'.format(i, len(sportparkGML)))
                GML = sportparkGML[i].gml
                sportparkLayerObjects = getWFSFeaturesWithinPolygon(bgtWFS,
                                                                    layer,
                                                                    GML,
                                                                    sp['id'])
                print(layer + ': ' + str(len(sportparkLayerObjects["features"])))
                for item in sportparkLayerObjects["features"]:
                    item["properties"]["sportpark_id"] = sp["id"]
                    item["properties"]["bron"] = layer[3:]
                if sportparksObjects is not None:
                    sportparksObjects["features"].extend(sportparkLayerObjects["features"])
                else:
                    sportparksObjects = sportparkLayerObjects

        # Write sportparkobjecten
        veldnr = 1
        pandnr = 1

        for item in sportparksObjects["features"]:
            if item["properties"]["identificatie_lokaalid"] in data["sportpark_objecten_lokaal_id"]:
                #print(item["properties"]["bron"])
                if item["properties"]["bron"] == 'BGT_PND_pand':
                    spObject = SportparkObject(
                        name='Pand {num:02d}'.format(num=pandnr),
                        objectType="pand",
                        sportpark_id=sp["id"],
                        uid=item["properties"]["identificatieBAGPND"])
                    pandnr += 1
                else:
                    spObject = SportparkObject(
                        name='{num:02d}'.format(num=veldnr),
                        objectType="veld",
                        sportpark_id=sp["id"],
                        uid=item["properties"]["identificatie_lokaalid"])
                    veldnr += 1
                spObject.save()

                geom = convertPoly2MultiPoly(rd2wgsGeojson(item["geometry"]))
                # print(item["properties"])
                og_id = 1
                if (item["properties"]["bron"].lower() == 'bgt_btrn_groenvoorziening'):
                    og_id = 3
                if item["properties"]["bron"].lower() == 'bgt_otrn_half_verhard':
                    og_id = 4
                if item["properties"]["bron"].lower() == 'bgt_otrn_gesloten_verharding':
                    og_id = 5
                spObjectGeometry = SportparkObjectGeometry(geometry=geom,
                                        sportparkObject_id=spObject.tid, # Get id from previous saved object to use in geometry model as a foreign field
                                        ondergrond_id=og_id,
                                        bron=item["properties"]["bron"],
                                        lokaalid=item["properties"]["identificatie_lokaalid"])
                spObjectGeometry.save()
                # Load K10 sportparken Aad when sportpark id matches
        fileName = 'sportparken/update/k10plus_2016_sport_aanvulling.geojson'
        dataK10 = readJson(fileName)
        for item in dataK10["features"]:
            #print(item)
            if sp["id"] == item["properties"]["sportpark"]:
                spObject = SportparkObject(
                        name='{num:02d}'.format(num=veldnr),
                        objectType="veld",
                        sportpark_id=item["properties"]["sportpark"])
                spObject.save()


                geom = convertPoly2MultiPoly(rd2wgsGeojson(item["geometry"]))
                spObjectGeometry = SportparkObjectGeometry(geometry=geom,
                                        sportparkObject_id=spObject.tid,
                                        ondergrond_id=1,
                                        bron=fileName)
                spObjectGeometry.save()
                veldnr += 1

    #with open('sportparks.geojson', 'w') as output:
    #    json.dump(sportparksObjects, output)


if __name__ == "__main__":
    main()
