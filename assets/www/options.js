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
	console.log('success!');
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
				
				$("#list1").append("<li>" + anonymize(contact.displayName) + " (" + anonymize(contact.phoneNumbers[0].value) + ")" +"</li>");
			}
			
			i++;
		}
};

function onError(contactError) {
	//$("#msg").text('oopsy!');
	console.log("oopsy");
};

function anonymize(phoneNumber) {
	return phoneNumber.replace(/.{3}$/, "xxx");
}