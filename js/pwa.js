/* 폰 앱(PWA): 서비스 워커를 등록해서 홈 화면에 설치·오프라인 실행이 되게 한다. (파일로 열었을 때는 건너뜀) */
if(typeof navigator!=="undefined"&&"serviceWorker" in navigator&&/^https?:/.test(location.protocol)){
 addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})}
