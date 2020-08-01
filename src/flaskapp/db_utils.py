from flaskapp import db


def get_CO2():
    ref_CO2 = db.child("CO2").child("12가3456").child("CO2").get().val()
    return ref_CO2
    threading.Timer(300, self.get_CO2).start()


def get_lat():
    ref_GPS = db.child("car_gps").child("12가3456").child("GPS").get().val()
    lat = ref_GPS.split(',')[0]
    return lat
    threading.Timer(300, self.get_lat).start()


def get_lon():
    ref_GPS = db.child("car_gps").child("12가3456").child("GPS").get().val()
    lon = ref_GPS.split(',')[1]
    return lon
    threading.Timer(300, self.get_lon).start()
