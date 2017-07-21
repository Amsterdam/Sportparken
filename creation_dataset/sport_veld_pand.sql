-- This script creates:
-- - union of relevant BGT surfaces (bgt_union)
-- - dataset of all sport fields for rent (veld_park)
-- - datasets of all buildings in the sports parks (pand_park)
-- The selection of the sport field is based on:
-- - inclusion in a sportpark
-- - overlap with field in k10_plus dataset
-- - id of missing fields (obtained via QGIS)
-- Author: Niki Niëns

-- Union BGT bestanden met naam bronbestand in extra kolom
drop table if exists sportparken.bgt_union;
create table sportparken.bgt_union as
SELECT *, 'bgt_btrn_bouwland'  as bron FROM sportparken.bgt_btrn_bouwland
UNION ALL
SELECT *, 'bgt_btrn_groenvoorziening' as bron FROM sportparken.bgt_btrn_groenvoorziening
UNION ALL
SELECT *, 'bgt_btrn_loofbos' as bron FROM sportparken.bgt_btrn_loofbos
UNION ALL
SELECT *, 'bgt_otrn_gesloten_verharding' as bron FROM sportparken.bgt_otrn_gesloten_verharding
UNION ALL
SELECT *, 'bgt_otrn_half_verhard' as bron FROM sportparken.bgt_otrn_half_verhard
UNION ALL
SELECT *, 'bgt_otrn_transitie' as bron FROM sportparken.bgt_otrn_transitie
UNION ALL
SELECT *, 'bgt_btrn_transitie' as bron FROM sportparken.bgt_btrn_transitie
UNION ALL
SELECT *, 'bgt_otrn_erf' as bron FROM sportparken.bgt_otrn_erf
UNION ALL
SELECT *, 'bgt_otrn_onverhard' as bron FROM sportparken.bgt_otrn_onverhard
UNION ALL
SELECT *, 'bgt_btrn_grasland_agrarisch' as bron FROM sportparken.bgt_btrn_grasland_agrarisch

-- Selectie velden obv sportparken contouren (veld_park_cont)
drop table if exists sportparken.veld_park_cont;
create table sportparken.veld_park_cont as
select sportparken.bgt_union.*, sportparken.park.naam as sportpark
from sportparken.park, sportparken.bgt_union
where st_disjoint(bgt_union.geom,park.geom) = 'f';

-- Selectie velden binnen sportpark obv k10 plus (veld_park_zero)
drop table if exists sportparken.veld_park_zero;
create table sportparken.veld_park_zero as
select sportparken.veld_park_cont.*, 'v' as type_veld
from sportparken.k10plus_2016_sport, sportparken.veld_park_cont
where st_disjoint(veld_park_cont.geom,st_centroid(k10plus_2016_sport.geom)) = 'f';
alter table sportparken.veld_park_zero
alter type_veld TYPE character;

-- Toevoegen velden k10 plus 
DELETE FROM sportparken.veld_park_zero WHERE bron = 'k10plus_2016_sport';
INSERT INTO 
   sportparken.veld_park_zero (id,geom, bron,type_veld)
SELECT 
  id,geom, 'k10plus_2016_sport', 'v'
FROM 
sportparken.k10plus_2016_sport WHERE id IN (1054,
363,
78,
461,
7,
1008,
154,
565,
866,
593,
696,
173,
349,
775,
86,
829,
252,
704,
422,
83,
190,
411,
547,
548,
624,
680,
844,
933,
1034,
1107,
460,
546,
43,
946,
947,
305,
503,
878,
736,
120,
1033,
502,
52,
926,
927,
1154);

-- verwijder velden bgt (die door k10 plus worden vervangen)  
DELETE FROM sportparken.veld_park_zero WHERE id IN (
4227,
42926,
49287,
10829,
9232,
62688,
33279,
9877,
3014,
65703,
2618,
7609,
3899,
23094,
56442,
4564,
7144,
917,
31449,
10039,
8289,
57828,
5665,
5600,
5697,
1503,
5703,
47678,
5162,
3493,
8747,
43710,
21425);

-- Toevoegen velden bgt (die nog ontbreken) 
INSERT INTO 
   sportparken.veld_park_zero (id, geom, namespace, lokaalid, begintijd, eindtijd, tijdreg, eindreg, lv_pubdat, bronhoud, inonderzk, hoogtelig, bgtstatus, plusstatus, bgtfysvkn, optalud, plusfysvkn, bron, sportpark, type_veld)
SELECT 
  id, geom, namespace, lokaalid, begintijd, eindtijd, tijdreg, eindreg, lv_pubdat, bronhoud, inonderzk, hoogtelig, bgtstatus, plusstatus, bgtfysvkn, optalud, plusfysvkn, bron, sportpark, 'v'
FROM 
sportparken.veld_park_cont WHERE id IN (422,
65,
60881,
8440,
1030,
1645,
51863,
457,
141,
45084,
1824,
203,
216,
23544,
9055,
1468,
1046,
5726,
1775,
8068,
88,
55,
4688,
4564,
2794,
4021);

-- Defineer honkbalvelden 
UPDATE sportparken.veld_park_zero
SET type_veld = 'h'
where lokaalid in 
('G0363.7e66924ead0d4e7a9d4723c276ed47e5',
'G0363.07b72845cf5944f9810c0e7f93aeaa8b',
'G0363.82cf047b68034cd09e094578ea2abba5',
'G0363.ff20561396f34080b9c28fe2243f3c1e',
'G0363.44701f0232494101997e43fd2170de98',
'G0363.d73217e226924af99a39cf1dee018e61',
'G0363.441479f465b040a9b891f18d4a4df22d',
'G0363.51196d840ca84074a302197ebf6cbb2f',
'G0363.cfb6438a94d641a285cd10d773d8431f',
'G0363.eee4c00b21444813a9ba00e0d3730ee8',
'G0363.1240e0bd9e074373a0e261e2a2adf8db',
'G0363.b2ea0a8d910c4a24b5704a7d44feceb4',
'G0363.816bbf49e4a04b3282312abbd32b0cbf',
'G0363.5f27b4e850b74c3686181f65a878c44c',
'G0363.e9accf5e14af463d9f09aa0f7a6f1752',
'G0363.cf78f07e64ae453cb3f23bee8d5f61fb',
'G0363.7e66924ead0d4e7a9d4723c276ed47e5',
'G0363.07b72845cf5944f9810c0e7f93aeaa8b');

-- voeg veldid toe op basis van type veld (v vs h) (veld_park)
drop table if exists sportparken.veld_park;
create table sportparken.veld_park as
with honk_union as 
(select (st_dump(ST_Union(geom))).path, (st_dump(ST_Union(geom))).geom as geom2, ST_Union(geom) as honk from sportparken.veld_park_zero
where type_veld='h'),
veld as
(select * from sportparken.veld_park_zero)
SELECT DISTINCT ON (id, lokaalid)
       CASE WHEN st_disjoint(veld.geom,honk_union.honk) = False
       		THEN round(st_Y(st_centroid(honk_union.geom2)))||'-'||round(st_X(st_centroid(honk_union.geom2)))
            ELSE round(st_Y(st_centroid(veld.geom)))||'-'||round(st_X(st_centroid(veld.geom)))
        END as veld_id, 
       id, geom, geom2, namespace, lokaalid, begintijd, eindtijd, tijdreg, eindreg, lv_pubdat, bronhoud, inonderzk, hoogtelig, bgtstatus, plusstatus, bgtfysvkn, optalud, plusfysvkn, bron, sportpark, type_veld 
    FROM veld, honk_union
    WHERE
    	type_veld is not NULL
    AND
    	((st_disjoint(veld.geom,honk_union.honk) = False and st_disjoint(veld.geom,honk_union.geom2) = False)
	OR
    	st_disjoint(veld.geom,honk_union.honk) = True);


-- Selectie panden binnen sportpark
drop table if exists sportparken.pand_park;
create table sportparken.pand_park as
select sportparken.bgt_pnd_pand.*, sportparken.park.naam as sportpark
from sportparken.park, sportparken.bgt_pnd_pand
where st_disjoint(bgt_pnd_pand.geom,park.geom) = 'f'
