from django.contrib import admin
from sportparken.dataset.models import (
    Huurder,
    HuurderObjectRelation,
    Sportpark,
    SportparkObject,
    SportparkGeometry,
    SportparkObjectGeometry,
	Ondergrond,
    Soort
    )


# Register your models here.
class SportparkAdmin(admin.ModelAdmin):
    list_display = ["tid", "name",]

    class Meta:
        model = Sportpark

admin.site.register(Sportpark, SportparkAdmin )


class HuurderAdmin(admin.ModelAdmin):
    list_display = ["tid", "name",]

    class Meta:
        model = Huurder

admin.site.register(Huurder, HuurderAdmin )


class SoortAdmin(admin.ModelAdmin):
    list_display = ["sid", "soort",]

    class Meta:
        model = Soort

admin.site.register(Soort, SoortAdmin )


class SportparkObjectAdmin(admin.ModelAdmin):
    list_display = ["tid", "name",]

    class Meta:
        model = SportparkObject

admin.site.register(SportparkObject, SportparkObjectAdmin )


class HuurderObjectRelationAdmin(admin.ModelAdmin):
    # list_display = ["tid", "name",]
    pass

    class Meta:
        model = HuurderObjectRelation

admin.site.register(HuurderObjectRelation, HuurderObjectRelationAdmin )


class SportparkGeometryAdmin(admin.ModelAdmin):
    # list_display = ["tid", "name",]
    pass

    class Meta:
        model = SportparkGeometry

admin.site.register(SportparkGeometry, SportparkGeometryAdmin )


class SportparkObjectGeometryAdmin(admin.ModelAdmin):
    # list_display = ["tid", "name",]
    pass

    class Meta:
        model = SportparkObjectGeometry

admin.site.register(SportparkObjectGeometry, SportparkObjectGeometryAdmin )


class OndergrondAdmin(admin.ModelAdmin):
	pass

	class Meta:
		model = Ondergrond

admin.site.register(Ondergrond, OndergrondAdmin )