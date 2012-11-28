

var main = (function()
{
	var timer=null;
	var value = 0;
	var monAnimation = function()
			{
				if ( value < 100 )
				{
					value += 10;
					//main.progressBar.element.setValue(value);
				} else
				{
					clearInterval(timer);
				}
			};

	var main =
	{
		panels: null,
		carousel: {
			element: null,
			properties: {
				'itemsWidth': 280,
				'itemsHeight': 115,
				'autoAdjust': 1,
				'autoAdjustDuration': 400,
				'autoPlay':1,
				'autoPlayDuration': 4000,
				'firstItemIndex': 2,
				'items':
				[
				 {'type': 'string', 'content': '<img src="http://sites.orange.fr/webapps/orange/images/273x115_iphone5_bt_acheter.png" />'},
				 {'type': 'string', 'content': '<img src="http://sites.orange.fr/webapps/orange/images/273x115_LiveBoxStar.jpg" />'},
				 {'type': 'string', 'content': '<img src="http://sites.orange.fr/webapps/orange/images/273x115_open_start.jpg" />'},
				 {'type': 'string', 'content': '<img src="http://sites.orange.fr/webapps/orange/images/273x115_sosh.jpg" />'}
				]
			}
		},
		progressBar : {
			element : null,
			properties:	{
					'height': 20,
					'width' : 300,
					'borderColor': '#000000',
					'progressBarColor': '#F50'
			}
		},
		header : {
			element: null,
			properties: {
				title: "Suivi conso",
				showMenu: false
			}
		},
		footer : {
			showShare : true,
			showApps : true,
			classicSiteUrl : "http://orangewink.orange.fr",
			share:{
				url: "http://m.orange.fr"
			}
		},
		
		init: function()
		{
			this.carousel.element = new wink.ui.xy.Carousel(this.carousel.properties);
			wink.byId('carousel').appendChild(this.carousel.element.getDomNode());

			this.progressBar.element = new wink.ui.xy.ProgressBar(this.progressBar.properties);
			wink.byId('progressBar').appendChild(this.progressBar.element.getDomNode());

			this.header.element = new wink.ui.layout.Header(this.header.properties);		
			wink.byId('header').appendChild(this.header.element.getDomNode());
			
			this.footer.element = new wink.ui.layout.Footer(this.footer.properties);		
			wink.byId('footer').appendChild(this.footer.element.getDomNode());



accordion = new wink.ui.layout.Accordion();
				
				section1 = accordion.addSection('SMS', '<ul><li>Option 50 SMS : <span>reste 11 SMS</span></li></ul>');
				section2 = accordion.addSection('Data', '<ul><li>Option Orange Maps</li><li>Option musique premium Deezer</li></ul>');
				
				/*wink.byId('accordion').appendChild(accordion.getDomNode());*/

		}
		
		
	};
	
	window.addEventListener('load', wink.bind(main.init, main), false);
	timer = setInterval(function(){
		if ( value < 85 ) {
			value += 10;
			main.progressBar.element.setValue(value);
		} else {
			clearInterval(timer);
		}
	}, 250);
				
			var display = function(content)
			{
				var date = document.getElementById("date");
				var time = document.getElementById("time");
				var error = false;
				
				try {
					var json = JSON.parse(content);
					if(json !=null && json.date != null && json.time != null){
						if(date != null) date.innerHTML=json.date;
						if(time != null) time.innerHTML=json.time;
					} else {
						error = true;
					}
				} catch(e){
					error = true;
				}
				
				if(error) {
					date.innerHTML="--/--/----";
					time.innerHTML="--:--";
				}
			};
	
			var resources =
			[
				{ url: 'http://80.12.202.196/proto/date.json', type: 'json', group: 0, expires: 31536000, callback: display},
			];
			
			var options = {enable: true, storage: 'localStorage'};


			/*
			var resourcesLoaded = function(result)
			{
				//alert("loaded");
			};
			*/
			
			window.addEventListener('load', function() {
					wink.load(resources, null, options);

			}, false);

			window.addEventListener('online', function() {
				wink.load(resources, null, options);

			}, false);
			/*
		setInterval(function () {
			var lineStatus = document.getElementById('line-status');
			var options = document.getElementById('options');
			lineStatus.className = navigator.onLine ? 'online' : 'offline';
			lineStatus.innerHTML = navigator.onLine ? 'Online' : 'Offline';
			options.style.visibility = navigator.onLine ? 'visible' : 'hidden';
		}, 250);
			
	*/
	
	return main;
}());