/*--------------------------------------------------------
 * Copyright © 2009 – 2010* France Telecom
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Header is the standard header for Orange webapps. It is displayed at the top of the screen with some contextual information and useful navigation elements
 * 
 * @author JF Cunat
 */
define(['../../../../_amd/core', '../../../../ui/xy/menu/js/menu'], function(wink){
  
  /**
   * @class Implements an orange webapp header
   * 
   * A header can contain a logo or a back button, a title, a menu and/or custom buttons. Use the 'getDomNode' method to add the header into the page.
   * 
   * @param {object} properties The properties object
   * @param {string} properties.title The title of the header
   * @param {string} [properties.backTitle="back" | "retour"] the label of the back button
   * @param {string} properties.backHref The URL of the back button
   * @param {string} properties.menuTitle The title of the menu button
   * @param {boolean} [properties.showLogo=true] The visibility of the logo
   * @param {boolean} [properties.showBack=false] The visibility of the back button
   * @param {object} properties.backCallback The callback of the back button
   * @param {boolean} [properties.showMenu=true] The visibility of the menu button
   * @param {array} properties.buttons The array of custom buttons
   * @param {string} properties.customMenuUrl The url for the content of the menu
   * @param {wink.ui.xy.Menu} properties.menu A custom menu to replace the default one
   * 
   * @requires wink.ui.xy.menu
   * 
   * @example
   * 
   * var properties = 
   *   {
   *    title: "programmatic",
   *    showLogo: true,
   *    showMenu: true
   *  }
   * header = new wink.ui.layout.Header(properties);
   * document.body.appendChild(header.getDomNode());
   *
   ** @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0
   */
  
  wink.ui.layout.Header = function(properties){
    if (wink.isUndefined(wink.ui.layout.Header.singleton)){
      this.uId = 1;
      this.displayed = false;      
      
      this._domNode = null;
      this._logoNode = null;
      this._titleNode = null;
      this._backBtnNode = null;
      this._buttonsNode = null;
      this._initBtns = null;
      this._menuNode = null;
      this._menuLoaded = false;
    this._iframeMenu = null;
      this._defaultTimeout = 1000;
      
      //public properties
      /**
       * The title of the header
       * 
       * @property title
       * @type string
       */
      this.title = "";
      
      /**
       * The title of the back button
       * 
       * @property backTitle
       * @type string
       */
      this.backTitle = wink.translate("back", this);
      
      /**
       * The url to be loaded when clicking on the back button
       * 
       * @property backHref
       * @type string
       */
      this.backHref = "";
      
      /**
       * The title of the menu button
       * 
       * @property menuTitle
       * @type string
       */      
      this.menuTitle = wink.translate("menu", this);
      
      /**
       * visibility of the logo
       * 
       * @property showLogo
       * @type boolean
       */ 
      this.showLogo = true;
      
      /**
       * visibility of the back button
       * 
       * @property showBack
       * @type boolean
       */ 
      this.showBack = false;
      
      /**
       * callback called when cicking on the back button
       * 
       * @property backCallback
       * @type object
       */
      this.backCallback = null;
      
      /**
       * visibility of the menu button
       * 
       * @property showMenu
       * @type boolean
       */
      this.showMenu = true;
      
      /**
       * array of buttons
       * 
       * @property buttons
       * @type array
       */
      this.buttons = [];
      
      /**
       * custom menu url to provide menu content. By default the menu content is provided by a json-p call
       * 
       * @property customMenuUrl
       * @type string
       */
      this.customMenuUrl = null;
      
      /**
       * custom menu object to replace the default one
       * 
       * @property menu
       * @type wink.ui.xy.Menu
       */
      this.menu = null;      
      
      this._initProperties(properties);
      
      this._initDom();
      this._initListeners();
      wink.ui.layout.Header.singleton = this;
    } 
    else 
    {
      return wink.ui.layout.Header.singleton;
    }
  };

  wink.ui.layout.Header.prototype = 
  {
    /**
     * The list of translations
     * 
     * @property
     * @type object
    */
    i18n:{
      en_EN:{
        back: 'back',
        menu: 'menu'  
      },
      fr_FR:{
        back: 'retour',
        menu: 'menu'          
      }
    },      
    
    //URL_TO_MENU_CONTENT: "http://mobile.orange.fr/0/accueil/Retour?SA=INCJSONPWPMENU9",
    URL_TO_MENU_CONTENT: "http://mobile.orange.fr/0/accueil/Retour?SA=INCWPMENU9",
    URL_TO_MOBILE_ORANGE: "http://m.orange.fr",
    
   /**
    * Returns the DOM node containing the header
    * 
    * @returns {HTMLElement} The component main dom node
    */
    getDomNode: function()
    {
      return this._domNode;
    },
    
    /**
     * Initialize the DOM nodes
     */
    _initDom: function()
    {
      var self = this,
        anchorBack, 
        anchorBtn;
      this._domNode = document.createElement("div");
      this._logoNode = document.createElement("a");
      this._logoNode.href = this.URL_TO_MOBILE_ORANGE;
      this._logoNode.className = "whBrandLogo";
      
      this._backBtnNode = document.createElement("div");
      this._backBtnNode.className = "whBtn whButtonBack";
      anchorBack = document.createElement("a");
      anchorBack.innerHTML = this.backTitle;
      anchorBack.href = "javascript:history.back()";
      this._backBtnNode.appendChild(anchorBack);    
      
      this._titleNode = document.createElement("div");
      this._titleNode.className = "whTitle";
      this._titleNode.innerHTML = this.title;
      
      this._domNode.className = "winkHeader whGradient";
      this._domNode.appendChild(this._logoNode);
      this._domNode.appendChild(this._backBtnNode);
      //because of the use of float layout for windows mobile, buttons must included in a div 
      if (!wink.ua.isIE){
        this._buttonsNode = this._domNode;
        this._domNode.appendChild(this._titleNode);
      }else{
        this._buttonsNode = document.createElement("div");
        this._buttonsNode.className = "whButtons";
        this._domNode.appendChild(this._buttonsNode);
      }
      
      if(this.showMenu){
        this._menuNode = document.createElement("div");
        this._menuNode.className = "whButton whBtn whGradient";
        anchorBtn = document.createElement("a");
        anchorBtn.innerHTML = this.menuTitle;
        this._menuNode.appendChild(anchorBtn);   
        this._buttonsNode.appendChild(this._menuNode);
      }
      if (this._initBtns){
        for (var i=0; i< this._initBtns.length; i++){
          this.addButton(this._initBtns[i]);
        }       
      }
      delete this._initBtns;
      
      //because of the use of float layout for windows mobile, title should be appended at the end
      if (wink.ua.isIE){
        this._domNode.appendChild(this._titleNode);
      }
      
      this._updateDisplay();
      
      wink.layer.opacity = .7;
      
      setTimeout(function(){
        if (!self._menuLoaded && !self.menu && self.showMenu){
          self._createMenu();
        }
      }, this._defaultTimeout);
    },  
    
    /**
     * Initialize the Header properties
     */
    _initProperties: function(properties){
      var props = properties || {};
      wink.mixin(this, props);
      
      if (wink.isSet(props.backCallback) && wink.isCallback(this.backCallback)){
        var cb = this.backCallback = props.backCallback;
        var backBtnLabel = $$("a", this._backBtnNode)[0];
        backBtnLabel.removeAttribute("href");
        this._backBtnNode.onclick = function()
        {
          wink.call(cb);
          return false;
        };
      }    
      if (props.buttons){
        this._initBtns = props.buttons;      
      }
      if (props.menu){
        this._menuLoaded = true;
      }    
    },
    
    /**
     * Initialize the listeners of header
     */
    _initListeners: function(){
      wink.ux.touch.addListener(this._backBtnNode, 'start', { context: this, method: '_touchStart' });
      wink.ux.touch.addListener(this._backBtnNode, 'end', { context: this, method: '_touchEnd' });   
      this._initMenuListener();
    },
    
    /**
     * Initialize the listeners of the menu button
     */
    _initMenuListener: function(){
      if (this.showMenu){
        var self = this;
        wink.ux.touch.addListener(this._menuNode, 'start', { context: this, method: '_touchStart' });
        wink.ux.touch.addListener(this._menuNode, 'end', { context: this, method: '_touchEnd' });     
        this._menuNode.addEventListener("click", function(){
          if (!self.menu){      
            self._createMenu();
          }
          if (self._menuLoaded){
            self.menu._show();
          }else{
            self._menuShowing = true;
          }
        }, false); 
      window.addEventListener("message", function(e){self.receiveSize(e, self)}, false);  
      }    
    },
    
   
    /**
   * Receive size from the iframe in order to adapt the menu to the correct size of the iframe content 
   * (work only for *.orange.fr domain)
   */
  receiveSize: function(e, header){
   if (header._iframeMenu) 
    var url = e.origin;
    url= url.substring(url.indexOf("://") + 3);
    if (url && url.indexOf("orange.fr") > 0){
      header._iframeMenu.style.height = e.data + "px";
    }
  },
  
  /**
     * Update the Header elements display
     */
    _updateDisplay: function(){        
      if (this.showLogo){
        wink.addClass(this._domNode, "whHome");
      }else{
        wink.removeClass(this._domNode, "whHome");
      }
      this._logoNode.style.display = this.showLogo ? "" : "none";    
      this._backBtnNode.style.display = this.showBack ? "" : "none";    
      if(this._menuNode){this._menuNode.style.display = this.showMenu ? "" : "none";}
    },
    
    /**
     * Update the Url of the Backbutton
     */
    _updateBackHref: function(){},

    /**
     * update the Header properties
     */
    update: function(properties){
      this.backHref="";
      for (var key in properties){
        if ((properties.menu || properties.customMenuUrl) && this.menu){
          this._menuLoaded = false;
          this.menu.destroy();
          if (properties.customMenuUrl){
            this.menu = null;
          }
        }  
      }    
      this._initProperties(properties);
      
      this._updateBackHref();
      /*case when showMenu = false at starting*/
      if(this.showMenu){
        if(!this._menuNode){
          this._menuNode = document.createElement("div");
          this._menuNode.className = "whBtn whGradient whButton";
          anchorBtn = document.createElement("a");
          anchorBtn.innerHTML = this.menuTitle;
          this._menuNode.appendChild(anchorBtn);    
          this._buttonsNode.appendChild(this._menuNode);
          this._initMenuListener();
         }else{this._menuNode.firstChild.innerHTML = this.menuTitle;}
      }
      this._titleNode.innerHTML = this.title;
      var backBtnLabel = $$("a", this._backBtnNode)[0];
      backBtnLabel.innerHTML = this.backTitle;
      if(this.showMenu && properties.customMenuUrl){
        this._loadMenu();
      }
      this._updateDisplay();
    },
    
    /**
     * add a new button
     * @parameters:
     *   --> btn: btn object ( item: { itemClass, title, callback } )
     *     --> An button is composed of :
     *       - [className]:     the class associated to the button that allows css adjustment
     *       - [content]:     the content of the button (usually an image)
     *       - [callback]:    the callback action that will be invoked when selecting the button  
     */  
    addButton: function(btn){    
      var a = document.createElement("a"),
        uId = wink.getUId();
      a.id = uId;
      a.className = "whIcon whButton whBtn";  
      if (btn.className){
        wink.addClass(a, btn.className);
      }
      a.innerHTML = btn.content;
      if (wink.isSet(btn.callback) && wink.isCallback(btn.callback)){
        a.onclick = function(){
          wink.call(btn.callback);
          return false;
        };
      }
      wink.ux.touch.addListener(a, 'start', { context: this, method: '_touchStart' });
      wink.ux.touch.addListener(a, 'end', { context: this, method: '_touchEnd' });
      this._buttonsNode.appendChild(a);
      this.buttons[uId] = a;
      return uId;
    },
    
    /**
     * remove a button
     * @parameters:
     *   --> btnId: id of the button   
     */  
    removeButton: function(btnId){
      var btn = this.buttons[btnId];
      if (btn){
        this._buttonsNode.removeChild(btn);
        btn = null;
        delete this.buttons[btnId];
      }
    },
    
    /**
     * create the default menu
     */
    _createMenu: function(){
      this.menu = new wink.ui.xy.Menu(); 
      document.body.appendChild(this.menu.getDomNode());
      this._loadMenu();
    },
    
    /**
     * load the default content for the menu
     * to uncomment when new jsonp configuration will be available
     *
     _loadMenu: function(){    
      var self = this,
      url = this.customMenuUrl ? this.customMenuUrl : this._URL_TO_MENU_CONTENT,
      iframe = this._iframeMenu = document.createElement("iframe");    
    iframe.frameBorder = "0";
    iframe.scrolling = "no";        
      if (this.menu){
        var style = this.menu.getDomNode().style;
        style.visibility = "hidden";
        style.display = "block";  
      }  
      
      // dynamic script insertion for json-p
      var script = document.createElement('script');
      script.setAttribute('src', url);

      // load the script
      document.getElementsByTagName('head')[0].appendChild(script);
     },*/
    
   /**
   * load the default content for the  menu
   */
   _loadMenu: function(){    
    var self = this,
      url = this.customMenuUrl ? this.customMenuUrl : this.URL_TO_MENU_CONTENT,
      iframe = this._iframeMenu = document.createElement("iframe");    
    iframe.frameBorder = "0";
    iframe.scrolling = "no";        
    if (this.menu){
      var cn = this.menu._contentNode,
        style = this.menu.getDomNode().style;
      cn.appendChild(iframe);
      style.visibility = "hidden";
      style.display = "block";  
    }    
    iframe.src = url;    
    iframe.onload = function(e){
      if(!self._menuLoaded){                  
        self._menuLoaded = true;
        var style = self.menu.getDomNode().style;        
        style.visibility = "visible";
        style.display = "none";  
        // the menu was called but was not ready to be shown
        if (self._menuShowing){
          self.menu._show();
          delete self._menuShowing;
        }    
      }      
    }
   },  

    /**
     * add a class for a touch start
     */
    _touchStart: function(uxEvent){    
      var buttonNode = uxEvent.srcEvent.currentTarget;    
      wink.addClass(buttonNode, "touched");
      setTimeout(function(){
        //just in case we touch and move somewhere else
        if (wink.hasClass(buttonNode, "touched")){
          wink.removeClass(buttonNode, "touched");
        }
      }, 500);
    },
    
    /**
     * remove a class after a touch end
     */
    _touchEnd: function(uxEvent){
      var buttonNode = uxEvent.srcEvent.currentTarget;
      setTimeout(function(){
        wink.removeClass(buttonNode, "touched");
      }, 500);    
    }
    
  };
  
  
  /**
   * callback for json-p to allow cross-domain configuration file to describe menu content
   *
  wink_orange_portal_menu = function(menuItems){
  
    var header = wink.ui.layout.Header.singleton;
    var helper = {
      open: function(url){
        window.open(url);
      }
    }
    var i,item;
    
    if (header){
      if (!header.menu){
        header.menu = new wink.ui.xy.Menu(); 
        document.body.appendChild(header.menu.getDomNode());
      }      
      //we try to better display menu items if there are not multiple of 3 
      var rest = menuItems.length % 3;
      if (rest == 2){
        menuItems.push({});
      }else if (rest == 1){
        menuItems.splice(menuItems.length - rest, 0, {});
        menuItems.push({});
      }
      for (i=0; i<menuItems.length; i++){
        item = menuItems[i];
        header.menu.addItem({
          imgSrc : item.imgSrc,
          title: item.title,
          callback: { context: helper, method: "open", arguments: item.href }
        });
      }   
      if (!header._menuLoaded){                  
          header._menuLoaded = true;
          var style = header.menu.getDomNode().style;        
          style.visibility = "visible";
          style.display = "none";  
          // the menu was called but was not ready to be shown
          if (header._menuShowing){
            header.menu._show();
            delete header._menuShowing;
          }
       }
    }
  } */ 
  
  return wink.ui.layout.Header;
});



