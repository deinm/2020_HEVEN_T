from flaskapp import app
from flask import render_template, request, jsonify
from flaskapp import db

import random
import pyrebase


@app.route('/')
@app.route('/main')
def route_mainpage():
    return render_template("mainpage.html")


@app.route('/hud')
def route_hud():
    dust = random.randint(0, 200)
    uv = random.randint(0, 14)
    rain = random.randint(0, 1)
    co2 = random.randint(0, 60)
    return render_template("hud.html", dust=dust, uv=uv, rain=rain, co2=co2)


@app.route('/get_data', methods=['POST'])
def route_data():
    # {'lat': '37.38541126992877', 'long': '126.96375354884748'}
    current_pos = request.form.to_dict()
    current_lat = float(current_pos['lat'])
    current_long = float(current_pos['long'])

    gps_datas = dict(db.child("gps").get().val())

    # +- 0.0005
    # 미세먼지 / 초미세먼지 / 자외선 / 강우
    pos_sensor_datas = {}
    fine_dust = []
    ultrafine_dust = []
    uv = []
    rain = []
    exists = False

    for key, value in gps_datas.items():
        lat, long, time = key.replace('_', ".").split(',')
        lat = float(lat)
        long = float(long)
        if abs(current_lat - lat) < 0.0005 and abs(current_long - long) < 0.0005:
            exists = True
            db_sensor_datas = value['data']
            fine_dust.append(db_sensor_datas[0])
            ultrafine_dust.append(db_sensor_datas[1])
            uv.append(db_sensor_datas[2])
            rain.append(db_sensor_datas[3])

    if not exists:
        return jsonify({'none':''})

    pos_sensor_datas['fine_dust'] = sum(fine_dust) / len(fine_dust)
    pos_sensor_datas['ultrafine_dust'] = sum(ultrafine_dust) / len(ultrafine_dust)
    pos_sensor_datas['uv'] = sum(uv) / len(uv)
    pos_sensor_datas['rain'] = sum(rain) / len(rain)

    return jsonify(pos_sensor_datas)
