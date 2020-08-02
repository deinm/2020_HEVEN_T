from flaskapp import app
from flask import render_template, request, jsonify
from flaskapp import db
from bs4 import BeautifulSoup

from flaskapp import db_utils

import os
import sys
import urllib
import random
import base64
import requests
import datetime

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
    # co2 = random.randint(0, 60)
    return render_template("hud.html", dust=dust, uv=uv, rain=rain, co2=db_utils.get_CO2(), lat=db_utils.get_lat(),
                           lon=db_utils.get_lon(), cards=0)


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

    hours_added = datetime.timedelta(hours=9)
    current_time = datetime.datetime.now() + hours_added
    current_time_formatted = current_time.strftime('%Y.%-m.%-d.%H.%-M')
    current_time_list = current_time_formatted.split('.')

    print(current_time_list)

    for key, value in gps_datas.items():
        lat, long, time = key.replace('_', ".").split(',')
        lat = float(lat)
        long = float(long)

        db_time_list = time.split('.')

        if (abs(current_lat - lat) < 0.0005 and abs(current_long - long) < 0.0005) and current_time_list[:2] == db_time_list[:2] and abs(int(current_time_list[3]) - int(db_time_list[3])) <= 3:
            exists = True
            db_sensor_datas = value['data']
            fine_dust.append(db_sensor_datas[0])
            ultrafine_dust.append(db_sensor_datas[1])
            uv.append(db_sensor_datas[2])
            rain.append(db_sensor_datas[3])

    if not exists:
        return jsonify({'none': ''})

    pos_sensor_datas['fine_dust'] = int(sum(fine_dust) / len(fine_dust))
    pos_sensor_datas['ultrafine_dust'] = int(sum(ultrafine_dust) / len(ultrafine_dust))
    pos_sensor_datas['uv'] = int(sum(uv) / len(uv))
    pos_sensor_datas['rain'] = round(sum(rain) / len(rain), 2)

    return jsonify(pos_sensor_datas)


@app.route('/search_weather', methods=['POST'])
def route_search_weather():
    current_address = request.form.to_dict()
    new_address = current_address['new_address'].split(' ')
    old_address = current_address['old_address'].split(' ')

    base_url = 'https://search.naver.com/search.naver?&query='
    url = base_url + old_address[0] + old_address[1] + "날씨"
    print(url)

    # 미세먼지, 초미세먼지
    html = requests.get(url).text
    soup = BeautifulSoup(html, 'html.parser')

    infos = soup.find("dl", {"class": "indicator"})
    datas = infos.find_all("dd")

    data_list = []
    for data in datas:
        value = data.findAll("span")[0].text
        text_value = data.text
        data_list.append(f"{value}({text_value.replace(value, '')})")

    weather = soup.find("p", {"class": "cast_txt"})
    weather_text = weather.text.split(',')[0]

    # 강수량
    rain_url = base_url + old_address[0] + old_address[1] + "강수량"
    rain_html = requests.get(rain_url).text
    rain_soup = BeautifulSoup(rain_html, 'html.parser')

    rain_area = rain_soup.find("div", {"class": "rainfall"})
    rain_infos = rain_area.findAll("dd", {"class": "item_condition"})
    rainfall = rain_infos[0].text

    # 자외선
    uv_url = base_url + old_address[0] + old_address[1] + "자외선"
    uv_html = requests.get(uv_url).text
    uv_soup = BeautifulSoup(uv_html, 'html.parser')

    uv_total_area = uv_soup.find("div", {"class": "main_box"})
    uv_info_list = uv_total_area.findAll("tr")

    uv_info = 0
    for uv_data in uv_info_list:
        uv_data_text = uv_data.text
        if old_address[0] in uv_data_text:
            uv_detail = uv_data.findAll("span")
            uv_info = f'{uv_detail[0].text}({uv_detail[1].text})'
            break

    data_dict = {'finedust': data_list[0], 'ultrafinedust': data_list[1],
                 'uv': uv_info, 'rain': rainfall + f"({weather_text})"}

    return jsonify(data_dict)


@app.route('/get_tts', methods=['POST'])
def route_get_tts():
    text_data = request.form.to_dict()
    print(text_data)
    text = text_data['text']

    client_id = "l0q6tktoc2"
    client_secret = "sQv86YFGJoJ6pxIcvjqskKHMWJzKk9opGzpyYAsa"
    encode_text = urllib.parse.quote(text)

    data = "speaker=jinho&speed=0&text=" + encode_text
    url = "https://naveropenapi.apigw.ntruss.com/voice/v1/tts"
    requested_data = urllib.request.Request(url)
    requested_data.add_header("X-NCP-APIGW-API-KEY-ID", client_id)
    requested_data.add_header("X-NCP-APIGW-API-KEY", client_secret)
    response = urllib.request.urlopen(requested_data, data=data.encode('utf-8'))
    rescode = response.getcode()

    # filename = f'{text}.mp3'
    if rescode == 200:
        response_body = response.read()
        mp3_file = base64.b64encode(response_body)
        mp3_file_decode = mp3_file.decode('utf8')

        # with open(filename, 'wb') as f:
        #     f.write(response_body)
        return jsonify({"success": mp3_file_decode})
    else:
        return jsonify({"error": str(rescode)})

    return jsonify({"error": "not implemented"})
