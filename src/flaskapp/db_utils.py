from flaskapp import db


def get_CO2(carname="12가3456"):
    ref_CO2 = db.child("CO2").child(carname).child("CO2").get().val()
    return ref_CO2


def get_lat(carname="12가3456"):
    ref_GPS = db.child("car_gps").child(carname).child("GPS").get().val()
    lat = ref_GPS.split(',')[0].replace("_", ".")
    return lat


def get_lon(carname="12가3456"):
    ref_GPS = db.child("car_gps").child(carname).child("GPS").get().val()
    lon = ref_GPS.split(',')[1].replace("_", ".")
    return lon