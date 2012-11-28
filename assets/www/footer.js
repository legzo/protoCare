/*--------------------------------------------------------
 * Copyright © 2009 – 2010* France Telecom
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Footer is the standard footer for Orange webapps. It is usually displayed at the bottom of the screen of the home page of a webapp.
 * 
 * @author JF Cunat
 */
define(['../../../../_amd/core', '../../../../ui/xy/popup/js/popup'], function(wink){

 /**
   * @class Implements an orange webapp footer
   * 
   * A footer can contain a link to share the webapp with a given social network, a link to go to a catalogue of apps, a link to the link to the classic site and one to the legal information.
   * Use the 'getDomNode' method to add the footer into the page.
   * 
   * @param {object} properties The properties object
   * @param {boolean} [properties.showShare=true] The visibility of the share link
   * @param {boolean} [properties.showApps=true] The visibility of the apps link
   * @param {string} [properties.classicSiteUrl="http://mobile.orange.fr/0/accueil/Retour?SA=WPWASITECLASSIQUE"] The url of the classic site of the service (i.e. for PC browser)
   * @param {object} properties.share information about what to share with a social network (Facebook, Twitter, email)
   * @param {string} properties.share.url The url to share
   * @param {string} properties.share.subject The subject of the info to share
   * @param {string} properties.share.message The message to share   
   * 
   * @requires wink.ui.xy.popup
   * 
   * @example
   * 
   * var properties = {
	 *			showShare : true,
	 *			showApps : true,
   *      classicSiteUrl : "http://orangewink.orange.fr",
   *      share:{
   *       url: "http://m.orange.fr"
   *      }
	 * };
   * header = new wink.ui.layout.Header(properties);
   * document.body.appendChild(header.getDomNode());
   *
   ** @compatibility Iphone OS2+,  Android 1.5+, Android 2.+, Android 4.0, BlackBerry 6+, Bada 1+, WindowsPhone 7.5
   */

  wink.ui.layout.Footer = function(properties)
  {
      this._properties = properties || {};
      this.uId = 1;		
      
      this._domNode = null;
      this._shareNode = null;
      this._appsNode = null;
      this._priceNode = null;
      this._siteNode = null;
      this._legalInfoNode = null;
      this._sharePopup = null;
      this._popupContent = null;
      
      /**
       * visibility of the share link
       * 
       * @property showShare
       * @type boolean
       */ 
      this.showShare = true;
      
      /**
       * visibility of the apps link
       * 
       * @property showApps
       * @type boolean
       */ 
      this.showApps = true;
      
      /**
       * url of the classic site
       * 
       * @property classicSiteUrl
       * @type string
       */
      this.classicSiteUrl = "http://mobile.orange.fr/0/accueil/Retour?SA=WPWASITECLASSIQUE";
      
      /**
       * sharing information
       * 
       * @property share
       * @type object
       */
      this.share = {
        url: window.location,
        message: "",
        subject: document.title  
      }
      
      if (this._properties.share){
        wink.mixin(this.share, this._properties.share);
        delete this._properties.share;
      }
      
      wink.mixin(this, this._properties);
      
      this._initDom();
      this._initListeners();
      
      this._defaultTimeout = 1000;
      
  };

  wink.ui.layout.Footer.prototype = 
  {
    /**
     * description of the Twitter API
     */
    _TWITTERAPI: {
      url : "http://twitter.com/home",
      params : ["status"]
    },
    
    /**
     * description of the Facebook API
     */		
    _FACEBOOKAPI: {
      url : "http://www.facebook.com/sharer.php",
      params : ["u", "t"]
    },
    
    /**
     * Returns the Header dom node
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
      var self = this;
      
      function _createLinkNode(parentNode, text, link, className, iconClass){
        var node = document.createElement("div"),
          a, 
          span;				
        node.className = className;			
        if (link){
          a = document.createElement("a");
          a.href = link;
          a.target = "_blank";	
          node.appendChild(a);
        }
        span = document.createElement("span");
        if (iconClass){
          span.className = iconClass;
          (a || node).appendChild(span);
          span = document.createElement("span");
        }
        span.className = "wfText";
        span.innerHTML = text;
        (a || node).appendChild(span);
        parentNode.appendChild(node);
        return node;
      }
      
      this._domNode = document.createElement("div");
      this._domNode.className = "winkFooter";
      if (this.showShare){
        this._shareNode = _createLinkNode(this._domNode,"partager", null, "wfBox", "wfShareIcon wfIcon");
        setTimeout(function(){
          if (!self.popup){
            self._createPopup();
          }
        }, this._defaultTimeout);	
      }
      if (this.showApps){
        this._appsNode = _createLinkNode(this._domNode, "apps", "http://mobile.orange.fr/0/accueil/Retour?SA=WPWAAPPS", "wfBox wfLink", "wfAppsIcon wfIcon");
      }
      var box = document.createElement("div");
      box.className = "wfBox";
      this._domNode.appendChild(box);
      this._priceNode = _createLinkNode(box, "infos tarifaires", "http://mobile.orange.fr/0/accueil/Retour?SA=ECINFOTARIFAIRE", "wfHalfLink");
      this._siteNode = _createLinkNode(box, "site classique", this.classicSiteUrl, "wfHalfLink");
      this._legalInfoNode = _createLinkNode(this._domNode, "© Orange 2012 - mentions légales", "http://mobile.orange.fr/0/accueil/Retour?SA=OMLMENTLEGALES", "wfBox center");	
    },	
    
    /**
     * Create the sharing popup
     */
    _createPopup: function(){
      this._sharePopup = new wink.ui.xy.Popup();
      this._popupContent = "<div class='wfPopupBtn' id='popup_share_mail'><a class='wfPopupLink' href='javascript:;'>Email</a></div><div class='wfPopupBtn' id='popup_share_twitter'><a class='wfPopupLink' href='javascript:;'>Twitter</a></div><div class='wfPopupBtn' id='popup_share_facebook'><a class='wfPopupLink' href='javascript:;'>Facebook</a></div><div id='popup_close' class='wfPopupClose'><a class='wfPopupLink' href='javascript:;'>annuler</a></div>";
      document.body.appendChild(this._sharePopup.getDomNode());
    },
    
    /**
     * Show the sharing popup
     */	
    _showPopup: function(){
      if (!this.popup){
        this._createPopup();
      }
      this._sharePopup.popup({
        arrow: "bottom",
        content: this._popupContent,
        targetNode: this._shareNode
      });
      var subject = encodeURIComponent(this.share.subject);
      var body = encodeURIComponent((this.share.message ? (this.share.message + " ") : "") + this.share.url);
      var self = this;
      wink.byId('popup_share_mail').onclick = function() {
            window.location = 'mailto:?subject=' + subject + '&body=' + body;
      };
        
      wink.byId('popup_share_twitter').onclick = function(){
        window.open(self._TWITTERAPI.url + "?" + self._TWITTERAPI.params[0] + "=" + body);
      };
      
      wink.byId('popup_share_facebook').onclick = function(){
        window.open(self._FACEBOOKAPI.url + "?" + self._FACEBOOKAPI.params[0] + "=" + body + self._FACEBOOKAPI.params[1] + "=" + subject);
      };			

      var list = $$('.wfPopupBtn');
      for (var i = 0; i < list.length; i++) {
        wink.ux.touch.addListener(list[i], "start", { context: self, method: "_select", arguments: [ list[i] ] });
        wink.ux.touch.addListener(list[i], "end", { context: self, method: "_unselect", arguments: [ list[i] ] });
      }
     
      wink.byId("popup_close").onclick = function(){
        self._sharePopup.hide(); /*[Merge Wink1.3] _showPopup is removed*/
      };
    },
    
    /**
     * Initialize the listeners of header
     */
    _initListeners: function(){
      var self = this;
      if (this._shareNode){
        this._shareNode.addEventListener("click", function(){
          self._showPopup();
        }, false);
      }
    },
      
    /**
     * add a class active to the selected item
     */
    _select: function(e, item) {
      wink.addClass(item, 'active');
    },
    
    /**
     * remove the class active to the unselected item
     */
    _unselect: function(e, item) {
      wink.removeClass(item, 'active');
    },
    
    /**
     * Destroy the footer singleton
     */
    destroy: function(){
      wink.ui.layout.Footer.singleton = null;
      delete wink.ui.layout.Footer.singleton;
    }
  }
  
  return wink.ui.layout.Footer;
  
});
