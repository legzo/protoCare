/*--------------------------------------------------------
 * Copyright © 2009 – 2010* France Telecom
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Displays an iPhone-like popup menu
 * 
 * @author Frédéric MOULIS
 */

/**
 * The menu has been opened
 * 
 * @name wink.ui.xy.Menu#/menu/events/open
 * 
 * @event
 */

/**
 * The menu has been closed
 * 
 * @name wink.ui.xy.Menu#/menu/events/close
 * 
 * @event
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Displays an iPhone-like popup menu. You have to define the 1 to 6 items.
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} properties.x The top position of the menu
	 * @param {integer} properties.y The left position of the menu
	 * 
	 * @example
	 * 
	 * var menuProperties = 
	 * {
	 * 	x: 20;
	 * 	y: 20
	 * }
	 * 
	 * var menu = new wink.ui.xy.Menu(menuProperties);
	 * 
	 * document.body.appendChild(menu.getDomNode());
	 * 
	 * menu.addItem(
	 * {
	 * 	itemClass: 'item1',
	 * 	title: 'page1',
	 * 	callback: { context: window, method: 'selectItem1' }
	 * });
	 * 
	 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/menu/test/test_menu.html" target="_blank">Test page</a>
 */
wink.ui.xy.Menu = function(properties)
{
	if (wink.isUndefined(wink.ui.xy.Menu.singleton))
	{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
		this.uId 			= wink.getUId();
		
			
		this._domNode 		= null;
		this._closeNode 	= null;
		
		this._items 		= [];
		this._displayed		= false;
		
		this._view			= {
			x: 0,
			y: 0
		};
		
		wink.mixin(this._view, properties);
		
		if (this._validateProperties() === false) return;
		
		this._initDom();
		this._initListeners();
		
		wink.ui.xy.Menu.singleton = this;
	} 
	else
	{
		return wink.ui.xy.Menu.singleton;
	}
};

wink.ui.xy.Menu.prototype =
{
	_DISPLAY_DURATION: 400,

	/**
	 * Returns the Menu dom node
		 * 
		 * @returns {HTMLElement} The main dom node
	 */
	getDomNode: function()
	{
		return this._domNode;
	},
	/**
      	 * Destroy the singleton
	 */
	destroy : function(){
		wink.ui.xy.Menu.singleton = null;
		this._contentNode.innerHTML = "";
		delete wink.ui.xy.Menu.singleton;
	},
	/**
	 * Hides / Displays the menu
	 */
	toggle: function()
	{
		if (this._displayed == false) 
		{
			this._show();
		} 
		else 
		{
			this._hide();
		}
	},
	/**
		 * Adds an item to the menu
	 * 
		 * @param {object} item the item to add
		 * @param {string} item.itemClass The class associated to the item that allows css adjustment
		 * @param {string} item.title The title of the item
		 * @param {object|function} item.callback The callback action that will be invoked when selecting the item
	 */
	addItem: function(item)
	{
		this._items.push(item);
		var itemClass = item.itemClass;
		var title = item.title;
		var imgSrc = item.imgSrc;
		var callback = item.callback;
		
		var itemNode = document.createElement('div');
		var imageNode = document.createElement('img');
		var titleNode = document.createElement('div');		
		
		itemNode.appendChild(imageNode);
		itemNode.appendChild(titleNode);
		this._contentNode.appendChild(itemNode);
		
		wink.addClass(itemNode, 'mn_menu_item');
		wink.addClass(imageNode, 'mn_image');
		if (wink.isSet(itemClass))
		{
			wink.addClass(itemNode, itemClass);
		}
		if (wink.isSet(imgSrc)){
			imageNode.src = imgSrc;	
		}		
		wink.addClass(titleNode, 'mn_title');
		
		if (wink.isSet(itemClass))
		{
			wink.addClass(itemNode, itemClass);
		}
		
		if (wink.isSet(title))
		{
			titleNode.innerHTML = title;
		}
		
		var self = this; 
		if (wink.isSet(callback) && wink.isCallback(callback))
		{
			itemNode.onclick = function()
			{
				wink.call(callback);
				self._hide();
			};
		}
	},
	
	/**
	 * Initialize the DOM nodes
	 */
	_initDom: function()
	{		
		this._domNode = document.createElement('div');	
		this._contentNode = document.createElement('div');
		this._domNode.appendChild(this._contentNode);
		
		this._closeNode = document.createElement('div');
		//this._closeNode.className = "w_icon w_float w_button_close";/*For the moment, do not use wink.default.icons style*/
		this._closeNode.className = "mn_close";
		this._domNode.appendChild(this._closeNode);
		
		wink.addClass(this._domNode, 'w_box w_window mn_menu w_border w_radius w_bg_dark');
		
		wink.fx.apply(this._domNode, {
			display: 'none',
			opacity: 0
		});
	
    wink.fx.applyTranslate(this._domNode, this._view.x, this._view.y);
		//this._domNode.translate(this._view.x, this._view.y);
	},
	/**
	 * Initialize listeners
	 */
	_initListeners: function() 
	{
		wink.ux.touch.addListener(this._closeNode, "end", { context: this, method: "_hide" }, { preventDefault: true });
	},
	/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
	 */
	_validateProperties: function() 
		{
			if (!wink.isNumber(parseFloat(this._view.x)))
		{
			wink.log('[Menu] the x property must be an integer');
			return false;
		}
			if (!wink.isNumber(parseFloat(this._view.y)))
		{
			wink.log('[Menu] the y property must be an integer');
			return false;
		}
		return true;
	},
	/**
	 * Shows the Menu
	 */
	_show: function()
	{
		var self = this;
		if (this._displayed == true)
		{
			return;
		}
		wink.layer.onclick = function(){
			self._hide();
		};
		wink.layer.show();
		this._domNode.style.display = 'block';
		
		wink.fx.applyTransition(this._domNode, 'opacity', this._DISPLAY_DURATION + 'ms', '0ms', 'ease-in');

    setTimeout(function(){self._domNode.style.opacity = 1;},1);
		
    wink.fx.onTransitionEnd(this._domNode, wink.bind(this._postShow, this));
		
		wink.publish('/menu/events/open', null);
	},
	/**
	 * Post show management
	 */
	_postShow: function()
	{
		this._displayed = true;
	},
	/**
	 * Hides the Menu
	 */
	_hide: function()
	{
		if (this._displayed == false)
		{
			return;
		}
		var self = this;

    wink.fx.applyTransition(this._domNode, 'opacity', this._DISPLAY_DURATION + 'ms', '0ms', 'ease-out');

		setTimeout(function(){self._domNode.style.opacity = 0;},1);

    wink.fx.onTransitionEnd(this._domNode, wink.bind(this._postHide, this));
		
    wink.publish('/menu/events/close', null);
	},
	/**
	 * Post hide management
	 */
	_postHide: function()
	{
		this._domNode.style.display = "none";
		this._displayed = false;
		
		wink.layer.hide();
	}
};
	
	return wink.ui.xy.Menu;
});