// JavaScript Document
function closeSign(){
	$('.rl-modal').hide();	
	$('.modal-backdrop').hide();
}
$('.modal-backdrop,.closeBtn').bind('click',function(){
	closeSign();
});