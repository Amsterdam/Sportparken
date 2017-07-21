""" 
This script writes selected information from a .json file to .csv
Author: Niki Niëns
"""

import json
import requests
import psycopg2
import csv


def read_json():

   return json.load(open('C:\OIS-500VerhuurSportvelden\data\ookmeer.json'))

if __name__ == "__main__":
    data = read_json()
    result = []
    header = ['naam', 'veld/pand', 'ondergrond', 'huurder', 'sport', 'kvk', 'adres', 'mail', 'telefoonnummer']
    result.append(header)

    for i, sp in enumerate(data["ookmeer"]):
        tid = i
        naam = sp["name"]
        object = sp["objectType"]
        ondergrond = sp["ondergrond_type"]
        if len(sp["huurders"])>0:
            huurder = sp["huurders"][0]["name"]
            sport = sp["huurders"][0]["sport"]
            kvk = sp["huurders"][0]["kvk"]
            api = "/".join(("https://api.data.amsterdam.nl/handelsregister/maatschappelijkeactiviteit",str(kvk)))
            try:
                adres = requests.get(api).json()["postadres"]["volledig_adres"]
                mail = requests.get(api).json()["communicatiegegevens"][0]["emailadres"]
                tel = str(requests.get(api).json()["communicatiegegevens"][0]["communicatie_nummer"])

            except Exception as e:
                adres = 'NaN'
                mail = 'NaN'
                tel = 'NaN'
                print(e)

        else:
            kvk = "NaN"
            huurder = "NaN"
            sport = "NaN"
            api = "NaN"
            api_dat = "NaN"
            adres = "NaN"
            mail = 'NaN'
            tel = 'NaN'
        result.append([naam, object, ondergrond, huurder, sport, kvk, adres, mail, tel, ])


    print(result)

# write to csv
with open('ookmeer_verhuur.csv', 'w', newline="") as f:
    writer = csv.writer(f, delimiter=',')
    for i in range(0,len(result)):
        writer.writerow(result[i])
    print('Done writing')

# Improvements: 
# - add header
# - test of seperate use of try statement (for adres, mail, tel) improves result.