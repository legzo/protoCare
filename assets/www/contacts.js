
var date;

$(document).ready(function(){
	onLoad();
	date = new Date();
	document.addEventListener("deviceready", onDeviceReady, false);
});


function onLoad() {
	
	var header = {
				title: "Mes contacts",
				showMenu: false,
				backTitle: "retour",
				backHref : "index.html",
				showBack: false
			}

	var footer = {
			showShare : true,
			showApps : true,
			classicSiteUrl : "http://orangewink.orange.fr",
			share:{
				url: "http://m.orange.fr"
			}
		}
	
	headerElement = new wink.ui.layout.Header(header);		
	wink.byId('header').appendChild(headerElement.getDomNode());
	
	footerElement = new wink.ui.layout.Footer(footer);		
	wink.byId('footer').appendChild(footerElement.getDomNode());
}



function extractUrlParams(){	
	var t = location.search.substring(1).split('&');
	var f = [];
	for (var i=0; i<t.length; i++){
		var x = t[ i ].split('=');
		f[x[0]]=x[1];
	}
	return f;
}

function add(name, number){
	var params = extractUrlParams();
	var index = params['index'];
	console.log("adding "+name+" at index "+index+"...");

	window.localStorage.setItem(index, name+" - "+number);
	window.location="myNumbers.html";//on redirige vers la page "mes numéros"
}

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
				
				
				var name = contact.displayName;
				var number = contact.phoneNumbers[0].value;
				
				$("#list1").append("<li class='w_list_item w_border_bottom w_bg_light'><a onClick=\"add('"+name+"','"+number+"')\">" + name + " (" + number + ")" +"</a></li>");
			}
			
			i++;
		}
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