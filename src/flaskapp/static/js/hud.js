let count = 0;
let dust, uv, rain, co2;
let lat, long;
let before_dust=-1, before_uv=-1, before_rain=-1, before_co2=-1;

$( document ).ready(function() {
    let time = setInterval(refreshWindow, 20000);
});

function refreshWindow(){
    let text="";

    count += 1;

    // get data from database
    $.ajax({
        type: "post",
        url: "/get_hud_data",
        data: {},
        dataType: "text"
    }).done(function (result) {
        let res = JSON.parse(result);

        dust = res['dust'];
        uv = res['uv'];
        rain = res['rain'];
        co2 = res['co2'];

        lat = res['lat'];
        long = res['long'];

        $('#dusttext').text("미세먼지 : "+dust);
        $('#uvtext').text("자외선 : "+uv);
        $('#raintext').text("강우량 : "+rain);
        $('#co2text').text("CO₂ : "+co2);

        // if(dust>150 && before_dust<=150){
        //
        // }

        // Center the image
        if(rain < 1 && co2 <= 30) {
            $('#blank_1_1').hide();
            $('#blank_1_2').hide();
            $('#blank_3_1').show();
            $('#blank_3_2').show();
        }

        else if(rain >= 1 && co2 <= 30) {
            $('#blank_1_1').show();
            $('#blank_1_2').show();
            $('#blank_3_1').hide();
            $('#blank_3_2').hide();
        }

        else if(rain < 1 && co2 > 30) {
            $('#blank_1_1').show();
            $('#blank_1_2').show();
            $('#blank_3_1').hide();
            $('#blank_3_2').hide();
        }

        else if(rain >= 1 && co2 > 30) {
            $('#blank_1_1').hide();
            $('#blank_1_2').hide();
            $('#blank_3_1').hide();
            $('#blank_3_2').hide();
        }

        // Change image
        if(0 < dust && dust < 30){
            $("#dust_img").attr("src", "/static/image/fine_dust_good.png");
        }
        else if(30 < dust && dust < 80){
            $("#dust_img").attr("src", "/static/image/fine_dust_normal.png");
        }
        else if(80 < dust && dust < 150){
            $("#dust_img").attr("src", "/static/image/fine_dust_bad.png");
        }
        else if(150 < dust){
            $("#dust_img").attr("src", "/static/image/fine_dust_very_bad.png");
        }

        if(0 <= uv && uv < 3){
            $("#uv_img").attr("src", "/static/image/UV_very_safe.png");
        }
        else if(3 <= uv && uv < 6){
            $("#uv_img").attr("src", "/static/image/UV_safe.png");
        }
        else if(6 <= uv && uv < 8){
            $("#uv_img").attr("src", "/static/image/UV_normal.png");
        }
        else if(8 <= uv && uv< 11){
            $("#uv_img").attr("src", "/static/image/UV_danger.png");
        }
        else if(11 <= uv){
            $("#uv_img").attr("src", "/static/image/UV_very_danger.png");
        }

        if(rain<1){
            $('#rain_container').hide();
        }
        else if(rain>=1){
            $('#rain_container').show();
        }

        if(co2<=30){
            $('#co2_container').hide();
        }
        else if(co2>30){
            $('#co2_container').show();
        }

        // HUD_Audio

        if(dust<=30 && (before_dust>30 || before_dust<0)){
            text = "미세먼지 수치가 "+ dust +"입니다. 아주 좋아요.";
        }
        else if(dust>30 && dust<=80 && (before_dust<=30 || before_dust>80)){
            text = "미세먼지 수치가 "+ dust +"입니다. 보통이에요.";
        }
        else if(dust>80 && dust<=150 && (before_dust<=80 || before_dust>150)){
            text = "미세먼지 수치가 "+ dust +"입니다. 공기가 나쁘니 창문을 닫아주세요.";
        }
        else if(dust>150 && before_dust<=150){
            text = "미세먼지 수치가 "+ dust +"입니다. 아주 나빠요. 공기청정기 가동을 위해 창문을 닫아주세요.";
        }
        else{
            text = ""
        }

        if(text !== ""){
            getTTS(text);
        }

        // console.log(rain, before_rain);
        //
        // if(rain<1 && (before_rain<0 || before_rain>=1)){
        //     text = "비가 내리지 않습니다. 날씨가 맑아요.";
        // }
        // else if(rain>=1 && rain<2 && (before_rain<1 || before_rain>=2)){
        //     text = "비가 조금씩 내리고 있습니다. 창문을 닫아주세요.";
        // }
        // else if(rain>=2 && before_rain<2){
        //     text = "비가 많이 내리고 있습니다. 창문을 닫고 와이퍼를 작동시켜주세요.";
        // }
        // else{
        //     text = ""
        // }
        //
        // setTimeout(function() {
        //     if(text !== ""){
        //         getTTS(text);
        //     }
        // }, 10000);

        console.log(co2, before_co2);

        if(co2<=30 && before_co2>30){
            text = "차량 내부 이산화탄소 수치가 정상 범위 내로 들어왔습니다. 창문을 올리셔도 되요.";
        }
        else if(co2>30 && before_co2<=30){
            text = "차량 내부 이산화탄소 수치가 높습니다. 환기를 해주세요";
        }
        else{
            text = ""
        }

        setTimeout(function() {
            if(text !== ""){
                getTTS(text);
            }
        }, 10000);

        before_dust = dust;
        before_uv = uv;
        before_rain = rain;
        before_co2 = co2;
    })
    .fail(function () {
        console.log("오류 발생");
        return;
    });
}

function getTTS(text){
    $.ajax({
        type: "post",
        url: "/get_tts",
        data: {'text':text},
        dataType: "text"
    }).done(function (result) {
        let res = JSON.parse(result);

        let audio = $("#audio_tts");
        $("#audio_src").attr("src", "data:audio/ogg;base64,"+res['success']);

        audio[0].pause();
        audio[0].load();

        audio[0].oncanplaythrough = audio[0].play();
    })
    .fail(function () {
        console.log("TTS 오류 발생");
    });
}