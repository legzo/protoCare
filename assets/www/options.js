
var date = new Date();

$(document).ready(function(){
	document.addEventListener("deviceready", onDeviceReady, false);
});

function onDeviceReady() {
	fetchContacts();
}

function fetchContacts() {
	console.log('searching contacts');
	var fields = [ "displayname", "phoneNumbers" ];
	navigator.contacts.find(fields, onSuccess, onError);
}

function onSuccess(contacts) {
	var now = new Date();
	var timeToFetch = now.getTime()-date.getTime();
	console.log('success! '+timeToFetch+'ms to fetch data');
	$('#loading').hide();
	$('#save').show();
	var max = 10;
	var i=0;
	var j=0;
	while (i<contacts.length && j<=10) {
			
			var contact = contacts[i];
			
			if(contact.displayName != '' 
				&& contact.phoneNumbers 
				&& contact.phoneNumbers.length > 0) {
				j++;
				
				console.log(contact.displayName);
				
				$("#list1").append("<li class='w_list_item w_border_bottom w_bg_light'><input type='checkbox'/>" + anonymize(contact.displayName) + " (" + anonymize(contact.phoneNumbers[0].value) + ")" +"</li>");
			}
			
			i++;
		}
	$("#container").append('<div class="center"><input id="save" type="button" value="sauvegarder"/></div>');
	$("#container").append(timeToFetch+'ms to fetch data');
};

function onError(contactError) {
	console.log("oopsy");
	$('#loading').hide();
	$('#error').text("Erreur lors de l'accès aux contacts");
};

function anonymize(phoneNumber) {
	return phoneNumber.replace(/.{3}$/, "xxx");
}