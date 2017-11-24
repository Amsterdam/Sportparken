from functools import partial
import pyproj as proj
from shapely.ops import transform
from shapely.geometry import mapping, shape
import json


def rd2wgsGeojson(geojson):
    # convert geojson from RD new to WSG84
    reprojection = partial(proj.transform,
                           # Source coordinate system
                           proj.Proj(init='epsg:28992'),
                           # Destination coordinate system
                           proj.Proj(init='epsg:4326'))

    g1 = shape(geojson)
    g2 = transform(reprojection, g1)  # apply projection

    geom = json.dumps(mapping(g2))
    return geom
