from flaskapp import app
from flask import render_template


@app.route('/')
@app.route('/main')
def route_mainpage():
    return render_template("mainpage.html")


@app.route('/hud')
def route_hud():
    return render_template("hud.html")
