/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a popup component
 * 
 * @author Frédéric MOULIS, JF CUNAT, Sylvain LALANDE, Sébastien PENEAU
 */

define(['../../../../_amd/core'], function(wink)
{
	var byId = wink.byId;
	
	/**
	 * @class Popup is a singleton that allows to open a popup window with one (alert) or two buttons (confirm) or with a fully customizable content
	 * Options are available for each type of popup style
	 * 
	 * @example
	 * 
	 * var popup = new wink.ui.xy.Popup();
	 * 
	 * document.body.appendChild(popup.getDomNode());
 * 
	 * popup.confirm(
	 * {
	 * 	msg: "Do you confirm ?",
	 * 	callbackOk: { context: window, method: 'confirmOk' },
	 * 	callbackCancel: { context: window, method: 'confirmCancel' }
	 * });
	 * 
	 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/popup/test/test_popup_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xy/popup/test/test_popup_2.html" target="_blank">Test page (add to homescreen)</a>
 */
  wink.ui.xy.Popup = function(properties)
  {
    if (wink.isUndefined(wink.ui.xy.Popup.singleton)){
      this._properties   = properties;
      this.uId       = 1;
      this.displayed    = false;
      
      this._domNode    = null;
      this._contentNode   = null;
      this._btnsNode     = null;
      this._arrowNode    = null;
      this._absolutePos  = false;
      this._nodeAsContent = false;

      this._popupClasses  = "";
      this._inTransition  = false;
      this._transitions  = {};
      this._waitingPopup = null;
      this._initDom();  
      this._initListeners();
      
      wink.ui.xy.Popup.singleton = this;
    }else{
      return wink.ui.xy.Popup.singleton;
    }
  };

  wink.ui.xy.Popup.prototype = 
  {
    i18n: {},
    _DEFAULT_ARROW: "none",
    
    /**
     * Returns the Popup dom node
       * 
       * @returns {HTMLElement} The main dom node
     */
    getDomNode: function()
    {
      return this._domNode;
    },
    /**
     * Hides the Popup
     */
    hide: function()
    {
      this._hide();
    },
    /**
       * @deprecated This method is no longer needed
       * @since 1.2.0
     */
    preloadContent: function()
      {
      wink.log('[Popup] preloadContent is deprecated : this method is no longer needed');
        return;
    },
    /**
     * Opens a fully customizable popup
     * 
     * @param {object} options The various options of the popup
     * @param {string|HTMLElement} options.content HTML code of the content if a string or the HTMLElement that will go inside the popup
     * @param {string} options.arrow Position of the arrow, if needed, values: "top", "bottom", "right", "left", "none" (default value)
     * @param {integer} options.top Top position of the popup
     * @param {HTMLElement} options.targetNode Node pointed by the arrow (top is then ignored)
     * @param {integer} options.arrowLeftPos Left position of the arrow in pixels
     * @param {string} options.position Position relative to the screen (optional, possible values : "top", "bottom", "left", "right") 
     * @param {boolean} options.borderRadius Indicates whether the popup must be displayed with border-radius style or not
     * @param {integer} options.duration The duration of the display transition
     * @param {boolean} options.followScrollY Allows to follow the scroll on y-axis
     * @param {object} options.layerCallback The callback invoked when the user click on the layer, if not specified the default action is the popup hiding
     * @param {string} options.type Type of the popup (possible value : panel)
     * @param {string} options.title An optional title for the popup (used only for panel)
     * @param {boolean} [options.closeBtn=false] Show a closing button
     * @param {boolean} [options.modal=false] Whether the popup is modal or not. If modal, it means that you can only click on a close button to close it
     * @param {boolean} [options.showLayer=false] Whether there is half transparent showLayer or not
     * @param {boolean} [options.alwaysOnTop=false] Whether the popup is always displayed until explicitely closed and you still have access to other elements of the page
     *     }
     */
    popup: function(options){

      var opt = options || {},
        arrowValue = this._DEFAULT_ARROW;

      this._currentOpt = opt;
      
      if (this.displayed == true && !this._alwaysOnTop) {      
        this._waitingPopup = options;     
        return;
      } else if(this.displayed == true && this._alwaysOnTop) {
        this._waitingPopup = null;
        return;
      }
      var className = "";
      if (wink.isSet(opt.type)){
        className += (" " + opt.type);
      }
      if (wink.isSet(opt.arrow))
      {
        arrowValue     = opt.arrow;
        className += (" pp_" + opt.arrow);
      }
      if(wink.isSet(opt.position)){
        className += (" pp_" + opt.position);
      }
      if (className){
        wink.addClass(this._domNode, className);
      }

      this._alwaysOnTop = (wink.isSet(opt.alwaysOnTop)) ? opt.alwaysOnTop : false;
      
      if (wink.isSet(opt.closeBtn) && opt.closeBtn == true){
        this._showCloseBtn();      
      }
      
      if (wink.isSet(opt.title)){
        this._showTitle(opt.title);
      }
     
      this._initTemplate(opt.content); 
      
      this._setPopupLayout();
         
      this._show(opt.modal, opt.showLayer);
      
      if (wink.isSet(opt.layerCallback)) {
        wink.ui.xy.layer.onclick = function() {
          if (!this._inTransition) {
            wink.call(opt.layerCallback);
          }
        };
      }     
    },
    
    _setPopupLayout: function(){
      this._popupClasses = "w_box w_window pp_popup";
      var opt = this._currentOpt,
        topValue = "0px",
        arrowValue = this._DEFAULT_ARROW,
        arrowLeftPos = "50px",      
        arrowTopPos = null;

      if(wink.isSet(opt.showBorder)){
        this._popupClasses+=" pp_border";
      }
      if(wink.isSet(opt.position)){
        var pos = opt.position;
      }
      if (wink.isSet(opt.arrow)){
        arrowValue = opt.arrow;
      }
      if(wink.isSet(opt.position) && (pos=="left" || pos == "right") || arrowValue == "left" || arrowValue == "right"){
        this._domNode.style.right="auto";
        this._domNode.style.left="auto";
      } else {
        this._domNode.style.removeProperty("right");
        this._domNode.style.removeProperty("left");
      }
        
      if (wink.isSet(opt.top) && wink.isInteger(parseInt(opt.top)))
      {
        topValue = opt.top;
        this._absolutePos = true;
      }else{
        this._absolutePos = false;
      }    
      if(wink.isSet(opt.position) && arrowValue != this._DEFAULT_ARROW && !wink.isSet(opt.width)){
        arrowLeftPos = (window.innerWidth - (this._arrowNode.offsetWidth)*1.4) / 2;
        arrowLeftPos += "px"; 
      } else {
        if(wink.isSet(opt.width)){
      // 2 is the border size
          arrowLeftPos = opt.width.charAt(opt.width.length-1) == '%' ? (window.innerWidth*(parseInt(opt.width)/100)) : parseInt(opt.width);
          arrowLeftPos = ((arrowLeftPos - this._arrowNode.offsetWidth - 2) / 2);
          arrowLeftPos += "px"; 
        }
      }
      if (wink.isSet(opt.arrowLeftPos) && wink.isInteger(parseInt(opt.arrowLeftPos)))
      {
        arrowLeftPos = opt.arrowLeftPos;
      }
      if (wink.isSet(opt.targetNode)){
        this._absolutePos = true; 
        var offsetY = window.pageYOffset,
          nodeHeight = this._domNode.offsetHeight,
          nodeWidth = this._domNode.offsetWidth,
          nodeLeft = wink.getLeftPosition(this._domNode),
          targetHeight = opt.targetNode.offsetHeight,
          targetWidth = opt.targetNode.offsetWidth,
          targetPos = wink.getPosition(opt.targetNode, null, true),
          targetTop = targetPos.y,
          targetLeft = targetPos.x,
          windowWidth = document.documentElement.offsetWidth;
        if (arrowValue == "bottom" || arrowValue == "top"){
          var deltaArrow = this._arrowNode.offsetWidth * 1.4;
          if (arrowValue == "bottom"){
            topValue = targetTop - nodeHeight - deltaArrow / 2; 
            if (topValue < 0){
              arrowValue = "top";
              topValue = targetTop + targetHeight + deltaArrow / 2;
            }    
          }else{
            topValue = targetTop + targetHeight + deltaArrow / 2;
          }
        
        if ((targetLeft + targetWidth / 2) > Math.abs((-this._arrowNode.offsetWidth * 1.4 / 2 - nodeLeft))) {
          arrowLeftPos = targetLeft + targetWidth / 2 - this._arrowNode.offsetWidth * 1.4 / 2 - nodeLeft;   
        } else {
          arrowLeftPos = targetLeft + targetWidth / 2;
        }
      

      if (arrowLeftPos > (nodeLeft + nodeWidth - this._arrowNode.offsetWidth * 1.4) - nodeLeft){
            //var delta = arrowLeftPos - nodeLeft - nodeWidth + 40;
            //this._domNode.style.left = delta + "px";
            /*this._domNode.style.right = (windowWidth - nodeLeft - delta) + "px";*/
            //arrowLeftPos -= delta;
            // Fix a max left value for the arrow
            arrowLeftPos = (nodeLeft + nodeWidth - deltaArrow) - nodeLeft;
          }
          arrowLeftPos += "px";  
        }else if (arrowValue == "right" || arrowValue == "left"){
          topValue = targetTop + (targetHeight / 2) - (nodeHeight / 2);
          if (topValue < 0){          
            arrowTopPos = topValue + nodeHeight/2 + "px";
            topValue = 0;
          }else {
            var bh = document.body.offsetHeight;
            if (topValue + nodeHeight > bh ){
              arrowTopPos = topValue + nodeHeight - bh + nodeHeight/2 - 5 + "px";
              topValue = bh - nodeHeight;            
            }
          }
          if (arrowValue == "right"){          
              rightValue = windowWidth - targetLeft + 5;
              if(rightValue + nodeWidth > windowWidth){
                // Try on the other side
                rightValue = windowWidth - targetLeft - targetWidth - 5 - nodeWidth;
                if(rightValue < 0){
                  // Give up, glue it on left part of screen
                  rightValue = 15;
                } else {
                arrowValue="left";
                }
              }
          }else{
              rightValue = windowWidth - targetLeft - targetWidth - 5 - nodeWidth;
              if(rightValue < 0){
                // Try on the other side
                rightValue = windowWidth - targetLeft + 5;
                if(rightValue + nodeWidth > windowWidth){
                  // Give up, glue it on the right part of the screen
                  rightValue = windowWidth - nodeWidth - 15;
                } else {
                arrowValue="right";
                }
              }
          }          
        } else if(wink.isSet(pos)){
          if(pos == "top" || pos == "bottom"){
            if(pos == "top"){
              topValue = targetTop - nodeHeight;
              if(topValue<0){
                topValue = targetTop + targetHeight;
              }
            } else {
              topValue = targetTop + targetHeight;
              if(topValue + nodeHeight > document.body.offsetHeight){
                topValue = targetTop - nodeHeight;
              }
            }
          } else if(pos=="left" || pos == "right"){
            var rightValue;
            topValue = (nodeHeight > targetHeight) ? targetTop - ((nodeHeight-targetHeight) / 2) : targetTop + ((targetHeight-nodeHeight) / 2);
            if(pos == "left"){
              rightValue = windowWidth - targetLeft + 10;
              if(rightValue + nodeWidth > windowWidth){
                // Try on the other side
                rightValue = windowWidth - targetLeft - targetWidth - 10 - nodeWidth;
                if(rightValue < 0){
                  // Give up, glue it on left part of screen
                  rightValue = windowWidth - nodeWidth - 10;
                }
              }
            } else {
              rightValue = windowWidth - targetLeft - targetWidth - 10 - nodeWidth;
              if(rightValue < 0){
                // Try on the other side
                rightValue = windowWidth - targetLeft + 10;
                if(rightValue + nodeWidth > windowWidth){
                  // Give up, glue it on the right part of the screen
                  rightValue = 10;
                }
              }
            }
            if(opt.closeBtn && targetLeft<=6 && pos=="right"){rightValue+=6;};/*take into account the closebutton*/
          }
        }
        this._arrowNode.style.left = arrowLeftPos;  
        
        topValue = this._scrollToPopup(topValue, offsetY, nodeHeight, targetTop, targetHeight, opt);

        topValue += "px"; 
        
        /*(#600) Change left positioning to right in order to fix a bug when orientation changes:
          content is squashed */
        if (rightValue){
          /*use % to enhance a little bit the transtion by avoiding a too big move*/
          this._domNode.style.right = Math.round(rightValue / windowWidth * 10000)/100 + "%";
          /*this._domNode.style.right = rightValue + "px";*/
        }
      }
      this._domNode.style.top = topValue;
      
      this._setBorders(arrowValue, arrowLeftPos, arrowTopPos);
      this._setPopupStyle("pp_type_popup", opt);

      if(wink.isSet(opt.centered) && opt.centered == true){
      this._setCenteredLayout();
      }
      this._layouting = false;
    },
    
    /**
   * Set centered layout popup (to be overriden)
   */
  _setCenteredLayout: function () {
    this._domNode.style.left = -this._domNode.offsetWidth / 2 + "px";
    this._domNode.style.marginLeft = "50%";
  },
  
  /**
     * Scroll to the popup if not visible
     * 
     * @parameters:
     *   --> topValue: the top value of the popup (px)
     *   --> offsetY: the y offset of the window
     *   --> nodeHeight: the popup node height  
     *   --> targetTop: top of the target 
     *   --> targetHeight: target node height
     *   --> opt : options of the popup (object)
     */
    _scrollToPopup: function(topValue, offsetY, nodeHeight, targetTop, targetHeight, opt){
      
      var top = topValue;
      if (topValue < offsetY){
        //to avoid a popup not visible as we prevent scroll after          
        if(!(opt.arrow=="bottom" || opt.pos == "top")){
          top = targetTop;
        }        
        setTimeout(function(){window.scrollTo(0, top - 5 );}, 200);
      }else{
        var pos1 = topValue + nodeHeight,
          pos2 = offsetY + window.innerHeight;
        if (pos1 > pos2){
          if(opt.arrow=="bottom" || opt.pos == "top"){
            top = targetTop + targetHeight - window.innerHeight;
          } else {
            top = pos1 - window.innerHeight;
          }
          //to avoid a popup not visible as we prevent scroll after
          setTimeout(function(){window.scrollTo(0, top + 5);}, 200);
        }
      }
      return topValue;
    },
    
    
     /**
     * Initialize the popup template
     * 
     * @parameters:
     *   --> arrowType: the arrow type ("top", "bottom", "left", "right" or "none")
     *   --> content: the content
     */
    _initTemplate: function(content)
    {
      this._absolutePos = false;
      this._followScrollY = false;
      this._nodeAsContent = false;
      this._contentParentNode = null;
      
      if(wink.isString(content)){
        this._contentNode.innerHTML = content;
      }else{
        if (content && content.nodeType != undefined){
          this._nodeAsContent = true;
          this._contentParentNode = content.parentNode;
          this._contentNode.appendChild(content);
        }
      }
      this._btnsNode.innerHTML = "";       
      this._domNode.style.top = "0px";
    },
    /**
     * Set the popup style
     * 
     * @parameters:
     *   --> style: the css class of the popup
     *   --> opt: display options
     */
    _setPopupStyle: function(style, opt)
    {
      this._popupClasses += " " + style;
      if (opt.borderRadius !== false) {
        this._popupClasses += " w_radius";
      }
      if (opt.type){
        this._popupClasses += (" " + opt.type);
      }
      if (wink.isSet(opt.arrow) && opt.arrow != "none"){
        this._popupClasses += " pp_" + opt.arrow;
      } else if(wink.isSet(opt.position)){
        this._popupClasses += " pp_" + opt.position;
      }
      
      if(wink.isSet(opt.classname) && opt.classname != ""){
        this._popupClasses = opt.classname + " " + this._popupClasses;
      }
      
      this._domNode.className = this._popupClasses;

      if (wink.isSet(opt.followScrollY) && opt.followScrollY === true) {
        this._followScrollY = true;
      }
      
      //can't have a popup higher than the window height minus 50 px
      this._contentNode.style.maxHeight =  window.innerHeight - (this._titleNode ? this._titleNode.offsetHeight : 0) - 50 + "px";
      
      if(wink.isSet(opt.width)){
        this._domNode.style.width = opt.width;   
        this._domNode.style.right = "initial"; //Need to remove the left 3% to make sure popup is well centered
      this._domNode.style.left = "initial";
      }
      
      this._updatePosition();
      
      var newOpDur = (opt.duration >= 0) ? opt.duration : 300;
      this._updateTransition(newOpDur, 0);
    },
    /**
     * Updates the popup transitions
     * 
     * @parameters:
     *   --> opacityDuration: the opacity duration
     *   --> topDuration: the top duration
     */
    _updateTransition: function(opacityDuration, topDuration)
    {
      var trsChanged = false;
      if (wink.isInteger(opacityDuration) && this._transitions.opacity != opacityDuration) {
        this._transitions.opacity = opacityDuration;
        trsChanged = true;
      }
      if (wink.isInteger(topDuration) && this._transitions.top != topDuration) {
        this._transitions.top = topDuration;
        trsChanged = true;
      }
      
      if (trsChanged) {
        var dr = this._transitions.opacity + "ms," + this._transitions.top + 'ms';
        wink.fx.applyTransition(this._domNode, 'opacity, transform', dr, '1ms,1ms', 'default,default');
        // WORKAROUND : the second delay must be 1ms instead of 0ms for iOS2
      }
    },
    /**
     * Updates the popup position
     */
    _updatePosition: function()
    {    
      var y = 0, x = 0,
        wh = window.innerHeight,
        ww = window.innerWidth,
        self = this;
      if (this._absolutePos == false) {
        var pos = this._currentOpt.position ? this._currentOpt.position : null;      
        if(wink.isSet(pos)){
          if(pos == "bottom" || pos == "top"){
            if (wink.isSet(this._currentOpt.width)){
              x += ((ww - this._domNode.offsetWidth) / 2);  
            }    
            var arH = wink.isSet(this._currentOpt.arrow) ? this._arrowNode.offsetHeight : 5;
            var offset = arH && arW !=0 ? arH : 5;
            y += (pos == "top") ? offset + window.pageYOffset : wh - this._domNode.offsetHeight - offset + window.pageYOffset;
          } else if(pos == "left" || pos == "right"){
            this._contentNode.style.maxHeight = wh - (this._titleNode ? this._titleNode.offsetHeight : 0) - 50 + "px";
            var arW = wink.isSet(this._currentOpt.arrow) ? this._arrowNode.offsetWidth : 0;
            var offset = arW && arW !=0 ? arW : 5;
            
            this._domNode.style.left = "0";
            x += (pos == "left") ? offset : ww - this._domNode.offsetWidth - offset;
            y += ((wh - this._domNode.offsetHeight) / 2) + window.pageYOffset;
          }
        } else {
          this._contentNode.style.maxHeight = wh - (this._titleNode ? this._titleNode.offsetHeight : 0) - 50 + "px";  
          y += ((wh - this._domNode.offsetHeight) / 2) + window.pageYOffset;
        }     
        $$("img", this._contentNode).forEach(
          function(img){
            if (!img.complete){
              img.addEventListener("load", function(){self._updatePosition();});
            }
          }
        );   
      } else {
        if(wink.isSet(this._currentOpt.width) && wink.isSet(this._currentOpt.targetNode)){
          //var oldWidth = this._domNode.offsetWidth / (1 - (parseInt(this._currentOpt.width) / 100));
        x = this._calculateTranslateX();
      }
        if (this._followScrollY) {
          y += window.pageYOffset;
        } 
      } 
      
      wink.fx.applyTranslate(this._domNode, x, y);
     
      //this._domNode.translate(x, y);
      /* For android, when applying a translate on popup, div with onclick and form elements can have trouble */
      wink.fx.applyTranslate(this._domNode.firstChild, 0, 0);
      //this._domNode.firstChild.translate(0,0);
    },
    
    /**
   * calculate translate x (to be overriden)
   */
  _calculateTranslateX: function () {
    var withleft = this._domNode.offsetLeft + /*oldWidth -*/ this._domNode.offsetWidth,
        x = 0;
    if(withleft < (this._currentOpt.targetNode.offsetLeft + this._currentOpt.targetNode.offsetWidth)) {
      x = (this._currentOpt.targetNode.offsetLeft + (this._currentOpt.targetNode.offsetWidth/2)) - /*withleft*/ this._domNode.offsetWidth;
      this._arrowNode.style.left = (this._domNode.offsetWidth - (this._arrowNode.offsetWidth) - 10) + "px";
    }else if(withleft > window.innerWidth){
      x = window.innerWidth - withleft;
      this._arrowNode.style.left = (this._domNode.offsetWidth - (this._arrowNode.offsetWidth) - 10) + "px";
    }
    return x;
  },
  
  /**
     * Initialize the DOM nodes
     */
    _initDom: function()
    {
      this._domNode = document.createElement('div');
      this._contentNode = document.createElement('div');
      this._btnsNode = document.createElement('div');  
      this._arrowNode  = document.createElement('div');
      
      wink.addClass(this._domNode, "pp_popup pp_hidden");
      wink.addClass(this._contentNode, "w_bloc");
      wink.addClass(this._arrowNode, "pp_popup_arrow none");
      
      this._domNode.appendChild(this._contentNode);
      this._domNode.appendChild(this._btnsNode);    
      this._domNode.appendChild(this._arrowNode);
      
      this._domNode.style.opacity   = 0;
      this._transitions.opacity = 0;
      this._transitions.top = 0;
    },
    /**
     * Set the popup borders
     * 
     * @parameters:
     *  --> arrow:       "top", "bottom", "right", "left" or "none"
     *  --> arrowLeftPos:  left-position of the arrow
     *  --> arrowTopPos:   top-position of the arrow
     */
    _setBorders: function(arrow, arrowLeftPos, arrowTopPos)
    {
      if (!wink.isSet(arrow) || (arrow != 'top' && arrow != 'bottom' && arrow != 'right' && arrow != 'left' && arrow != this._DEFAULT_ARROW))
      {
        wink.log('[Popup] Error: _setBorders: "arrow" missing or invalid');
      }else{      
        if (!this._arrowNode){
          this._arrowNode  = document.createElement('div');
          wink.addClass(this._arrowNode, "pp_popup_arrow");
          this._domNode.appendChild(this._arrowNode);
        }
        this._arrowNode.className = "pp_popup_arrow pp_"+ arrow;      
        if (arrow != this._DEFAULT_ARROW){
        this._setArrowLeftPosition(arrow, arrowLeftPos);
          if (arrowTopPos){
            this._arrowNode.style.top = arrowTopPos;
          }else{
            this._arrowNode.style.removeProperty("top");
          }
        }
      }    
    },
  
    /**
   * Set the popup arrow left position (to be overriden)
   * 
   * @parameters:
   *  --> arrow:       "top", "bottom", "right", "left" or "none"
   *  --> arrowLeftPos:  left-position of the arrow
   */
  _setArrowLeftPosition: function(arrow, arrowLeftPos) {
    this._arrowNode.style.left =  (arrow == 'top' || arrow == 'bottom') ? arrowLeftPos : "auto";
  },
  
  /**
     * Initialize listeners
     */
    _initListeners: function() 
    {
      this._scrollHandler = wink.bind(this._updatePosition, this);
      this._postShowHandler = wink.bind(this._postShow, this);    
      this._postHideHandler = wink.bind(this._postHide, this);
      this._closeHandler = wink.bind(this._close, this);
      //this._layerHandler = wink.bind(this._hide, this);
      this._orientationEvent = ("onorientationchange" in window) ? "orientationchange" : "resize";
    },
    /**
     * Shows the popup
     */
    _show: function(modal, withOverlay)
      {
      if (this.displayed == true || this._inTransition == true) {
        return;
      }
      if (arguments.length == 0){
        modal = true;
      }
      this._inTransition = true;
      
      if (this._followScrollY == true) {
        window.addEventListener("scroll", this._scrollHandler, false);
      }
      this._orientationChangeHandler = wink.bind(function(){       
         if (!this._layouting){
            wink.setTimeout(this, "_setPopupLayout", 500);
         }
         this._layouting = true; 
      }, this);
       
      window.addEventListener(this._orientationEvent, this._orientationChangeHandler, false);    
      
      wink.removeClass(this._domNode, "pp_hidden");
      
      if (!withOverlay){ 
        wink.layer.opacity = 0;
        wink.layer.update();
      }
      
      if (modal){
        //by default we try to avoid scrolling when the popup is displayed      
        wink.layer.show();//Call this function first because it creates the Layer DOM
        wink.ux.touch.addListener(wink.layer._domNode, "move", { context: this, method: "_preventScroll" }, { preventDefault: true }); 
      }else{    
        if(!this._alwaysOnTop){        
          wink.layer.show();//Call this function first because it creates the Layer DOM  
          wink.ux.touch.addListener(wink.layer._domNode, "start", { context: this, method: "_closeHandler" }, { preventDefault: true });
          //if inside a scroller
          wink.subscribe('/movementtracker/events/notrack', { context: this, method: '_closeHandler' });
        }
      }
      if (this._transitions.opacity > 0){  
        wink.fx.onTransitionEnd(this._domNode, this._postShowHandler);
      }else{
        this._postShow();
      }
      this._domNode.style.opacity = 1;
    },
    
    /**
     * Prevent scroll (only works for iphone)
     */
     _preventScroll: function(e){
      return false;
     },
     
     /**
     * Follow scroll (fallback for android)
     */
     _followScroll: function(){
        wink.fx.applyTranslate(this._domNode,0, ((window.innerHeight - this._domNode.offsetHeight) / 2) + window.pageYOffset);
        //this._domNode.translate(0, ((window.innerHeight - this._domNode.offsetHeight) / 2) + window.pageYOffset);
     },
        
    /**
     * Post show management
     */
    _postShow: function()
    {
      if (this._followScrollY == true) {
        this._updateTransition(this._transitions.opacity, 300);
      }
      this.displayed = true;
      this._inTransition = false;
    },
    
    
    /**
     * Closes the popup in case of modal state
     */
    _close: function(e){
      var canHide = true,
        node = e.target;
      while (node){
        if (node == this._domNode){
          canHide = false;
          break;
        }
        node = node.parentNode;
      }
      if (canHide){       
        this._hide();
      }
    },
    
    /**
     * Hides the popup
     */
    _hide: function()
    {
      if (this.displayed != false){
        this._inTransition = true;
        
        if (this._followScrollY == true) {
          window.removeEventListener("scroll", this._scrollHandler, false);
        }
        wink.layer.hide();
        wink.ux.touch.removeListener(wink.layer._domNode, "move", { context: this, method: "_preventScroll" });
        window.removeEventListener(this._orientationEvent, this._orientationChangeHandler);
        wink.ux.touch.removeListener(wink.layer._domNode, "start", { context: this, method: "_closeHandler" }); 
        wink.unsubscribe('/movementtracker/events/notrack', { context: this, method: '_closeHandler' }); 
        if (this._transitions.opacity > 0){
          wink.fx.onTransitionEnd(this._domNode, this._postHideHandler, false);
        }else{
          this._postHideHandler(null);
        }
        this._domNode.style.opacity = 0;     
      }
    },
    /**
     * Post hide management
     */
    _postHide: function()
    {
      //wink.layer.hide();
      wink.layer.opacity = 0.6;
      wink.layer.update();
      wink.layer.onclick = null;    
      wink.addClass(this._domNode, "pp_hidden");
      if (this._nodeAsContent){
        (this._contentParentNode || document.body).appendChild(this._contentNode.firstChild);
      }
      this._contentNode.innerHTML = "";    
      var style = this._domNode.style;
      style.top = "-10000px";
      style.height = "auto";
      style.removeProperty("left");
      style.removeProperty("width");
    style.removeProperty("-webkit-transform");
      style.removeProperty("margin-left");
    style.removeProperty("margin-right");
      var arrowStyle=this._arrowNode.style;
      arrowStyle.removeProperty("left");
      this._domNode.className = "pp_popup";
      if (this._closeNode){
        this._closeNode.style.display= "none";
      }
      if (this._titleNode){
        this._titleNode.style.display= "none";
      }
      this.displayed = false;
      this._inTransition = false;   
      if (this._waitingPopup){
        this.popup(this._waitingPopup);
        this._waitingPopup = null;
    }
    },
    
    
    /**
     * hide the layer after the fade out
     */
    _hideLayer: function(){
      if (!this.displayed){
        wink.layer.hide();
      }
    },
    
    /**
     * Invokes the given callback
     * 
     * @parameters:
     *  --> cb: the callback to invoke
     */
    _invokeCallback: function(cb)
    {
      if (this._inTransition == true || !wink.isSet(cb)) {
        return;
      }
      this._hide();
      wink.call(cb);
    },
    
    /**
      show the close icon
    **/
    _showCloseBtn: function(){
      if (!this._closeNode){
        this._closeNode = document.createElement('div');
        this._closeNode.className = "pp_close";
        var self = this;
        this._closeNode.onclick = function(){
          self._hide();
        };
        this._domNode.appendChild(this._closeNode);
      }
      // here we rewrite the function because the closeNode is now created
      this._showCloseBtn = function(){
        this._closeNode.style.display= "";
      }
    },
    
    
     /**
      show the title
    **/
    _showTitle: function(label){     
      
      // here we rewrite the function because the titleNode will now be created
      this._showTitle = function(label){
        this._titleNode.style.display = "block";
        this._titleNode.innerHTML = label;
      }  
      
      if (!this._titleNode){
        this._titleNode = document.createElement('div');
        this._titleNode.className = "pp_title";
        this._domNode.insertBefore(this._titleNode, this._domNode.firstChild);
        this._showTitle(label);
      }     
    }
    
  }
  return wink.ui.xy.Popup;
});
