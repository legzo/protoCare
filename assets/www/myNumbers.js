
$(document).ready(function(){
	onLoad();
});



function onLoad() {
	
	var header = {
				title: "Mes options",
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
	
	$('#loading').hide();
	display();
}


function display(){
	console.log("test");
	for(var i=0;i<3;i++){
		var value = window.localStorage.getItem(i);
		console.log("value="+value);
		if(value!=null){
			$("#list1").append('<li class="w_list_item w_border_bottom w_bg_light"><a href="contacts.html?index='+i+'">'+value+'</a></li>');
		}else{
			$("#list1").append('<li class="w_list_item w_border_bottom w_bg_light"><a href="contacts.html?index='+i+'" style="font-style:italic">Sélectionner</a></li>');
		}
	}
	
}