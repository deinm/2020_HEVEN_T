let count = 0;
let dust, uv, rain, co2;

$( document ).ready(function() {
    let time = setInterval(refreshWindow, 15000);
});

function refreshWindow(){
    // get data from database
    dust = Math.floor(Math.random() * 201);
    uv = Math.floor(Math.random() * 15);
    rain = Math.floor(Math.random() * 2);
    co2 = Math.floor(Math.random() * 61);

    $('#dusttext').text(dust);
    $('#uvtext').text(uv);
    $('#raintext').text(rain);
    $('#co2text').text(co2);
    count += 1;
}
