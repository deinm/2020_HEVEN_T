import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

cred = credentials.Certificate('mykey.json')
firebase_admin.initialize_app(cred,{'databaseURL':'https://heven-t.firebaseio.com/'})


ref = db.reference()
ref.update({'날씨' : 'good'})

def get_CO2():
    ref_CO2 = db.reference('CO2/12가3456/CO2')
    CO2 = ref_CO2.get()
    return CO2
    threading.Timer(300, self.get_CO2).start()


def get_lat():
    ref_GPS = db.reference('car_gps/12가3456/GPS')
    GPS = ref_GPS.get()
    lat=GPS.split(',')[0]
    return lat
    threading.Timer(300, self.get_lat).start()

def get_lon():
    ref_GPS = db.reference('car_gps/12가3456/GPS')
    GPS = ref_GPS.get()
    lon=GPS.split(',')[1]
    return lon
    threading.Timer(300, self.get_lon).start()