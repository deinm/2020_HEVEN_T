from flaskapp import db
import datetime


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


def db_get_hud_data(carname="12가3456"):
    ref_datas = db.child("CO2").child(carname).child("data").get().val()
    return ref_datas


def get_dust_uv_rain():
    ref_GPS = db.child("car_gps").child("12가3456").child("GPS").get().val()
    current_lat = float(ref_GPS.split(',')[0].replace('_', "."))
    ref_GPS = db.child("car_gps").child("12가3456").child("GPS").get().val()
    current_lon = float(ref_GPS.split(',')[1].replace('_', "."))

    gps_datas = dict(db.child("gps").get().val())

    # +- 0.0005
    # 미세먼지 / 자외선 / 강우
    # pos_sensor_datas = {}
    dust = []
    uv = []
    rain = []
    exists = False

    hours_added = datetime.timedelta(hours=9)
    current_time = datetime.datetime.now() + hours_added
    current_time_formatted = current_time.strftime('%Y.%-m.%-d.%H.%-M')
    current_time_list = current_time_formatted.split('.')

    for key, value in gps_datas.items():
        lat, long, time = key.replace('_', ".").split(',')
        lat = float(lat)
        long = float(long)
        db_time_list = time.split('.')
        if abs(current_lat - lat) < 0.0005 and abs(current_lon - long) < 0.0005 and current_time_list[
                                                                                    :3] == db_time_list[:3] and abs(
            int(current_time_list[3]) - int(db_time_list[3])) <= 3:
            exists = True
            db_sensor_datas = value['data']
            dust.append(db_sensor_datas[0])
            uv.append(db_sensor_datas[2])
            rain.append(db_sensor_datas[3])

    if not exists:
        return 0, 0, 0

    average_dust = int(sum(dust) / len(dust))
    average_uv = int(sum(uv) / len(uv))
    average_rain = int(sum(rain) / len(rain))

    return average_dust, average_uv, average_rain
