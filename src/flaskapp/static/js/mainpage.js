let map;
let marker;
let mapContainer;
// let geocoder;
geocoder = new kakao.maps.services.Geocoder();

$( document ).ready(function() {
	mapContainer = document.getElementById('map'), // 지도를 표시할 div
		mapOption = {
			center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
			level: 3 // 지도의 확대 레벨
		};

	// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
	map = new kakao.maps.Map(mapContainer, mapOption);

    /* -- 현재 접속 위치 받아오기 --*/
    // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
    if (navigator.geolocation) {
        // GeoLocation을 이용해서 접속 위치를 얻어옵니다
        navigator.geolocation.getCurrentPosition(function(position) {

            let lat = position.coords.latitude, // 위도
                lon = position.coords.longitude; // 경도

            let locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
                message = '<div style="padding:5px;">현재 위치</div>'; // 인포윈도우에 표시될 내용입니다

            // 마커와 인포윈도우를 표시합니다
            displayMarker(locPosition, message);

            // 지도에 클릭 이벤트를 등록합니다
            // 지도를 클릭하면 마지막 파라미터로 넘어온 함수를 호출합니다
            kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                // 클릭한 위도, 경도 정보를 가져옵니다
                let latlng = mouseEvent.latLng;

                // 마커 위치를 클릭한 위치로 옮깁니다
                marker.setPosition(latlng);

                let message = '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, ';
                message += '경도는 ' + latlng.getLng() + ' 입니다';

                $('#location').text(message);

                searchAddrFromCoords(map.getCenter(), consolePrint);

                searchDetailAddrFromCoords(mouseEvent.latLng, function(result, status) {
                    if (status === kakao.maps.services.Status.OK) {
                        console.log("searchDetailAddrFromCoords");
                        console.log(result[0].road_address.address_name);
                        console.log(result[0].address.address_name);
                    }
                });

                $.ajax({
                    type: "post",
                    url: "/get_data",
                    data: {'lat':latlng.getLat(), 'long':latlng.getLng()},
                    dataType: "text"
                }).done(function (result) {
                    let res = JSON.parse(result);
                    console.log(res);

                    $("#describe").addClass("dis_none");
                    $("#describe1").addClass("dis_none");
                    $("#info_text").addClass("dis_none");

                    if(res.hasOwnProperty('none')){
                        $("#no_data").removeClass("dis_none");
                        $("#no_data1").removeClass("dis_none");
                        $("#no_data2").removeClass("dis_none");
                        $("#weather_button").removeClass("dis_none");

                        $("#dust").addClass("dis_none");
                        $("#dustText").addClass("dis_none");
                        $("#ultradust").addClass("dis_none");
                        $("#ultradustText").addClass("dis_none");
                        $("#uv").addClass("dis_none");
                        $("#uvText").addClass("dis_none");
                        $("#rain").addClass("dis_none");
                        $("#rainText").addClass("dis_none");
                        $("#refresh").addClass("dis_none");

                        $('#no_data').text("🚘");
                        $('#no_data1').text("아직 데이터가 없어요.");
                        $('#no_data2').text("오늘은 이곳으로 떠나볼까요?");
                        return;
                    }

                    $("#no_data").addClass("dis_none");
                    $("#no_data1").addClass("dis_none");
                    $("#no_data2").addClass("dis_none");
                    $("#weather_button").addClass("dis_none");

                    $("#dust").removeClass("dis_none");
                    $("#dustText").removeClass("dis_none");
                    $("#ultradust").removeClass("dis_none");
                    $("#ultradustText").removeClass("dis_none");
                    $("#uv").removeClass("dis_none");
                    $("#uvText").removeClass("dis_none");
                    $("#rain").removeClass("dis_none");
                    $("#rainText").removeClass("dis_none");
                    $("#refresh").removeClass("dis_none");

                    if(res['rain']>0.8){
                        $('#rainText').text("비가 오고 있어요.");
                    }else{
                        $('#rainText').text("오늘은 날씨가 맑아요!");
                    }

                    if(res['fine_dust']<=30){
                        $('#dustText').text("오늘은 미세먼지 수치가 좋아요!");
                    }
                    else if(res['fine_dust']<=80){
                        $('#dustText').text("오늘은 미세먼지 수치가 보통이에요.");
                    }
                    else if(res['fine_dust']<=150){
                        $('#dustText').text("오늘은 미세먼지 수치가 나빠요.");
                    }
                    else{
                        $('#dustText').text("오늘은 미세먼지 수치가 매우 나빠요.");
                    }

                    if(res['ultrafine_dust']<=15){
                        $('#ultradustText').text("오늘은 초미세먼지 수치가 좋아요!");
                    }
                    else if(res['ultrafine_dust']<=35){
                        $('#ultradustText').text("오늘은 초미세먼지 수치가 보통이에요.");
                    }
                    else if(res['ultrafine_dust']<=75){
                        $('#ultradustText').text("오늘은 초미세먼지 수치가 나빠요.");
                    }
                    else{
                        $('#ultradustText').text("오늘은 초미세먼지 수치가 매우 나빠요.");
                    }

                    if(res['uv']<=2){
                        $('#uvText').text("오늘은 자외선 지수가 낮아요!");
                    }
                    else if(res['ultrafine_dust']<=5){
                        $('#uvText').text("오늘은 자외선 지수가 보통이에요.");
                    }
                    else if(res['ultrafine_dust']<=7){
                        $('#uvText').text("오늘은 자외선 지수가 나빠요.");
                    }
                    else{
                        $('#uvText').text("오늘은 자외선 지수가 매우 나빠요.");
                    }
                })
                .fail(function () {
                    console.log("오류 발생");
               });
            });
        });
    }
    else { // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
        let locPosition = new kakao.maps.LatLng(33.450701, 126.570667),
            message = '현재 위치를 받아올 수 없습니다. 위치정보 사용을 허용해 주세요.';
        displayMarker(locPosition, message);
    }
});

// 지도에 마커와 인포윈도우를 표시하는 함수입니다
function displayMarker(locPosition, message) {

    // 마커를 생성합니다
    marker = new kakao.maps.Marker({
        map: map,
        position: locPosition
    });

    let iwContent = message, // 인포윈도우에 표시할 내용
        iwRemoveable = true;

    // 인포윈도우를 생성합니다
    let infowindow = new kakao.maps.InfoWindow({
        content : iwContent,
        removable : iwRemoveable
    });

    // 인포윈도우를 마커위에 표시합니다
    infowindow.open(map, marker);

    // 지도 중심좌표를 접속위치로 변경합니다
    map.setCenter(locPosition);
}

function searchAddrFromCoords(coords, callback) {
    // 좌표로 행정동 주소 정보를 요청합니다
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function searchDetailAddrFromCoords(coords, callback) {
    // 좌표로 법정동 상세 주소 정보를 요청합니다
    geocoder.coord2Address(coords.getLng(), coords.getLat(), callback);
}

function consolePrint(result, status){
    if (status === kakao.maps.services.Status.OK) {
        for(let i = 0; i < result.length; i++) {
            // 행정동의 region_type 값은 'H' 이므로
            if (result[i].region_type === 'H') {
                console.log("consolePrint");
                console.log(result[i].address_name);
                break;
            }
        }
    }
}

$('#weather_button').click(function(){
    $("#info_text").removeClass("dis_none");

    $("#no_data").addClass("dis_none");
    $("#no_data1").addClass("dis_none");
    $("#no_data2").addClass("dis_none");
    $("#weather_button").addClass("dis_none");
});

