from flaskapp import app
from flask import render_template

import random


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
