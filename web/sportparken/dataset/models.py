from django.db import models
from django.contrib.gis.db import models as geo_models

# Create your models here.


class Sportpark(models.Model):
    tid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=128, null=True)

    def __str__(self):
        return '{} - {}'.format(self.tid, self.name)

    class Meta:
        db_table = 'sportparken'


class Huurder(models.Model):
    tid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, null=True)
    kvk = models.CharField(max_length=10, null=True)
    sport = models.CharField(max_length=64, null=True)

    def get_sp_objecten(self, spid=None):
        qs = SportparkObject.objects.filter(ho_set__huurder__tid=self.tid)

        if spid:
            qs = qs.filter(sportpark__tid=spid)

        return qs

    def __str__(self):
        return '{} - {}'.format(self.tid, self.name)

    class Meta:
        db_table = 'huurders'


class SportparkObject(models.Model):
    tid = models.AutoField(primary_key=True)
    uid = models.CharField(max_length=20, null=True)
    name = models.CharField(max_length=64, null=True)
    objectType = models.CharField(max_length=164, null=True)
    sportpark = models.ForeignKey(Sportpark,
        related_name='sportparkobject_set',
        on_delete=models.CASCADE)
    verhuurprijs = geo_models.FloatField(null=True)

    @property
    def ondergrond_type(self):
        return ','.join( x.name for x in self.get_ondergrond_mix())

    def bgt_id(self):
        return ','.join( x.lokaalid for x in self.SportparkObjectGeometry.objects)

    def get_bgt_mix(self):
        return Ondergrond.objects.filter(object_geometry_set__sportparkObject__tid=self.tid).distinct()

    def get_huurder_set(self):
        return Huurder.objects.filter(ho_set__sportpark_object__tid=self.tid)

    def get_ondergrond_mix(self):
        return Ondergrond.objects.filter(object_geometry_set__sportparkObject__tid=self.tid).distinct()

    def __str__(self):
        return '{} - {}'.format(self.tid, self.name)

    class Meta:
        db_table = 'sportpark_objecten'


class HuurderObjectRelation(models.Model):
    tid = models.AutoField(primary_key=True)
    huurder = models.ForeignKey(Huurder,
        related_name='ho_set', on_delete=models.CASCADE)
    sportpark_object = models.ForeignKey(SportparkObject,
        related_name='ho_set', on_delete=models.CASCADE)

    def __str__(self):
        return '{}-{}'.format(self.huurder, self.sportpark_object)

    class Meta:
        db_table = 'huurder_object_relaties'


class Ondergrond(models.Model):
    tid = models.AutoField(primary_key=True)
    name = models.CharField(max_length=128, null=True)

    def __str__(self):
        return '{} - {}'.format(self.tid, self.name)

    class Meta:
        db_table = 'ondergrond_type'


class ObjectGeometry(geo_models.Model):
    tid = geo_models.AutoField(primary_key=True)
    geometry = geo_models.MultiPolygonField(null=True, srid=4326)
    objects = geo_models.GeoManager()

    class Meta:
        abstract = True


class SportparkGeometry(ObjectGeometry):
    sportpark = models.ForeignKey(Sportpark,
        related_name='object_geometry_set',
        on_delete=models.CASCADE)
    bron = models.TextField(null=True)

    class Meta:
        db_table = 'geometry_sportparken'


class SportparkObjectGeometry(ObjectGeometry):
    sportparkObject = models.ForeignKey(SportparkObject,
        related_name='object_geometry_set',
        on_delete=models.CASCADE)
    ondergrond = models.ForeignKey(Ondergrond,
        related_name='object_geometry_set',
        on_delete=models.CASCADE)
    bron = models.CharField(max_length=64, null=True)
    lokaalid = models.CharField(max_length=38, null=True)
    veld_id = models.CharField(max_length=13, null=True)
    bagpndid = models.CharField(max_length=20, null=True)

    @property
    def ondergrond_type(self):
        return self.ondergrond.name

    @property
    def sportpark_object_id(self):
        return self.sportparkObject.tid

    @property
    def sportpark_object_name(self):
        return self.sportparkObject.name

    @property
    def sportpark_object_type(self):
        return self.sportparkObject.objectType

    class Meta:
        db_table = 'geometry_sportpark_objecten'
