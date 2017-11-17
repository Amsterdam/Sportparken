-------------------------------
-- production DB Fixes oct 2017
-------------------------------


-- remove duplicate geometry field from schellingerwoude
DELETE FROM geometry_sportparken WHERE tid=8

-- move comments from name field to omschrijving
UPDATE public.sportpark_objecten
  SET omschrijving=substring(name,'[A-Za-z]\s[\d+\sA-Z]*(.*)');

-- keep only numbers and letters like 10A
UPDATE public.sportpark_objecten
  SET name=replace(substring(name,'\d+[\sA-Z]*'),' ','')