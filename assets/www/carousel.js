/*--------------------------------------------------------
 * Copyright © 2009 – 2010* France Telecom
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a carousel
 * 
 * @author Jerome GIRAUD, William MARKLE, JF CUNAT
 */

/**
 * The event is fired when there is an item switch
 * 
 * @name wink.ui.xy.Carousel#/carousel/events/switch

 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.carouselId The uId of the carousel triggering the event
 * @param {integer} param.currentItemIndex The current carousel item
 */
define(['../../../../_amd/core'], function(wink)
{
  /**
   * @class Implements a carousel
   * <br>
   * Built to add a Carousel in your page. You can insert images or DOM nodes inside your Carousel.
   * The navigation is handled through touch events (a gesture on the left or on the right will make it switch items).
   * The carousel also handles the click events on its items.
   * Note that it could also be used with the 'history' component to handle the 'back' and 'forward' buttons in a custom way
   * <br><br>
   * The Carousel needs properties to define its behaviour and its items. As all other graphical components,
   * it has a getDomNode method that should be used after the instantiation to add the carousel node to the page.
   * The code sample shows how to instantiate a new carousel and to add it to a section of a webpage.
   * 
   * @param {object} properties The properties object
   * @param {integer} [properties.itemsWidth=250] The width of the items of the Carousel
   * @param {integer} [properties.itemsHeight=100] The height of the items of the Carousel
   * @param {string} [properties.display="horizontal"] Either vertical or horizontal
   * @param {integer} [properties.displayDots=1] Whether or not to display the position indicators
   * @param {integer} [properties.autoAdjust=1] Should the Carousel auto-adjust items position after each movement
   * @param {integer} [properties.autoAdjustDuration=800] The transition duration for the auto adjust slide
   * @param {integer} [properties.autoPlay=0] Does the Carousel automatically starts sliding
   * @param {integer} [properties.autoPlayDuration=800] The time interval between two autoplays
   * @param {integer} [properties.firstItemIndex=1] The item to be displayed in the center of the page at startup
   * @param {integer} [properties.containerWidth=window.innerWidth] The width of the div containing the carousel
   * @param {string} [properties.itemsAlign="center"] The alignment of the first item of the carousel (either "left" or "center")
   * @param {array} properties.items An array containing the items of the carousel
   * @param {string} properties.items.type The type of the content (can be a DOM node or a string)
   * @param {string|HTMLElement} properties.items.content The content of the item
   * @param {boolean} [properties.touchPropagation=true] Indicates whether the touch event on the Carousel must be propagated
   * 
   * @example
   * 
   * var properties = 
   *   {
   *   itemsWidth: 280,
   *   itemsHeight: 136,
   *   autoAdjust: 1,
   *   autoAdjustDuration: 400,
   *   autoPlay: 1,
   *   autoPlayDuration: 4000,
   *   firstItemIndex: 2,
   *   items:
   *   [
   *     {'type': 'string', 'content': '&lt;img src="../img/carousel_image_01.png" onclick="alert(1)" /&gt;'},
   *     {'type': 'string', 'content': '&lt;img src="../img/carousel_image_02.png" onclick="alert(2)" /&gt;'},
   *     {'type': 'string', 'content': '&lt;img src="../img/carousel_image_03.png" onclick="alert(3)"/&gt;'}
   *   ]
   * }
   * 
   * carousel = new wink.ui.xy.Carousel(properties);
   * 
   * wink.byId('output').appendChild(carousel.getDomNode());
   * 
   * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0
   * 
   * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_1.html" target="_blank">Test page</a>
   * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_2.html" target="_blank">Test page (vertical)</a>
   * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_3.html" target="_blank">Test page (add, remove items)</a>
   */
  wink.ui.xy.Carousel = function(properties)
  {
    /**
     * Unique identifier
     * 
     * @property uId
     * @type integer
     */
    this.uId = wink.getUId();
    
    /**
     * The list of carousel items
     * 
     * @property items
     * @type array
     */
    this.items = [];
    
    /**
     * The item to be displayed in the center of the page at startup
     * 
     * @property firstItemIndex
     * @type integer
     * @default 0
     */
    this.firstItemIndex = 0;    
  
    /**
     * The width of the items of the Carousel
     * 
     * @property itemsWidth
     * @type integer
     * @default 250
     */
    this.itemsWidth = 250;
  
    /**
     * The height of the items of the Carousel
     * 
     * @property itemsHeight
     * @type integer
     * @default 100
     */
    this.itemsHeight = 100;
  
    /**
     * The margin on the side of the item
     * 
     * @property itemsMargin
     * @type integer
     * @default 6
     */
    this.itemsMargin = 6;/* correponds to 3px of margin to the right and to the left of the item. So, choose an even number.*/
    
    /**
     * The margin when the carousel is fullwidth
     * 
     * @property fullWidthItemsMargin
     * @type integer
     * @default 0
     */
    this.fullWidthItemsMargin = 0;
    /**
     * The width of the div containing the carousel
     * 
     * @property containerWidth
     * @type integer
     * @default window.innerWidth
     */  
    this.containerWidth = window.innerWidth;
    
    
    /**
     * Whether or not to display the position indicators
     * 
     * @property displayDots
     * @type integer
     * @default 1
     */
    this.displayDots = 1;
  
    /**
     * Whether or not to display the navigation arrows
     * 
     * @property displayArrows
     * @type integer
     * @default 1
     */
    this.displayArrows = 0;
    
    /**
     * Should the Carousel auto-adjust items position after each movement
     * 
     * @property autoAdjust
     * @type integer
     * @default 1
     */
    this.autoAdjust = 1;
  
    /**
     * The transition duration for the auto adjust slide
     * 
     * @property autoAdjustDuration
     * @type integer
     * @default 400
     */
    this.autoAdjustDuration = 400;
  
    /**
     * Does the Carousel automatically starts sliding
     * 
     * @property autoPlay
     * @type integer
     * @default 0
     */
    this.autoPlay = 0;
      
    /**
     * The time interval between two autoplays
     * 
     * @property autoPlayDuration
     * @type integer
     * @default 3000
     */
    this.autoPlayDuration = 3000;

    /**
     * The time to move an item using the arrows
     * 
     * @property moveDuration
     * @type integer
     * @default 500
     */
    this.moveDuration = 500; 
  
    /**
     * The alignment of the first item of the carousel
     * 
     * @property itemsAlign
     * @type string
     * @default center
     */  
    this.itemsAlign = this._CENTER_POSITION;
  
    /**
     * Indicates whether the touch event on the Carousel must be propagated
     * 
     * @property touchPropagation
     * @type boolean
     * @default true
     */  
    this.touchPropagation = true;
    
    /**
     * Indicates whether the carousel is circular (infinite movement)
     * 
     * @property circular
     * @type integer
     * @default 1
     */      
    this.circular  = 1;

    this._absoluteIndex = 0;
    this._currentItemIndex = 0;
    this._lastLeftIndex = 0;
    this._lastRightIndex = 1;
    
    this._beginX = 0;
    this._currentX = 0;    
  
    this._position = 0;
    this._jump = 1;  
    
    this._minX = 0;
    this._maxX = 0;  
    
    this._autoPlayInterval = null;
    this._autoPlayDirection = 1;
    
    this._startEvent = null;
    this._endEvent = null;
    
    this._itemsList = [];
    this._dotsList = [];
    
    this._domNode = null;
  
    this._itemsNode = null;
    this._arrowLeftNode  = null;
    this._arrowRightNode = null;
    this._dotsNode = null;
  
  
    wink.mixin(this, properties);
    
    if  ( this._validateProperties() ===  false )return;
    if ( !wink.isSet(properties.containerWidth) ){
      this._fullWidth = true;
    }
    this._centered = (this.itemsAlign == this._CENTER_POSITION);  
  
    this._carouselMoved = false;
  
    this._initProperties();
    this._initDom();
    this._positionItems();
    this._initListeners();  
  };
  
  wink.ui.xy.Carousel.prototype =
  {
    _LEFT_POSITION: 'left',
    _CENTER_POSITION: 'center',
  
  
  
    /**
     * Returns the dom node containing the Carousel
     * 
     * @returns {HTMLElement} The main dom node
     */
    getDomNode: function()
    {
      return this._domNode;
    },
    
    /**
     * Cleans the dom of the Carousel content nodes. To invoke only if Carousel no longer used.
     */
    clean: function()
    {
      for (var i = 0; i < this._itemsList.length; i++) {
        this._itemsList[i].getDomNode().innerHTML = '';
      }
      this._domNode.innerHTML = '';
    },
    
    /**
     * Display the selected item
     * 
     * @param {integer} index The index of the item we want to move to
     * @param {boolean} fast whether there is an animation or not to move to the item
     */
    goToItem: function(index, fast){
      if (this.circular){     
        this._jump = index - this._currentItemIndex;      
        this._direction = this._jump > 0 ? 1 : -1;
        this._absoluteIndex += this._jump;
  
      }
      this._moveToItem(index, fast);  
    },
    
    /**
     * make the transition to the given item
     * 
     * @param {integer} index The index of the item we want to move to
     * @param {boolean} fast whether there is an animation or not to move to the item
     */
    _moveToItem: function(index, fast){
       if (index != this._currentItemIndex || this._followTouch){        
        var l = this._itemsList.length;        
        if (this.circular){
           setTimeout(wink.bind(this._swapItems, this), parseInt(this.moveDuration / 2));      
  
  
        }        
        this.position = (this.firstItemIndex-index)*this.itemsWidth; 
        
        wink.fx.applyTransition(this._itemsNode, "transform", (fast ? this.autoAdjustDuration : this.moveDuration )+ 'ms', 0, 'cubic-bezier');  
        
        var pos = (this.firstItemIndex - (this.circular ? this._absoluteIndex : index )) * this.itemsWidth ;
        this._currentX = pos;
        wink.fx.applyTranslate(this._itemsNode,pos,0);       
        wink.removeClass(this._itemsList[this._currentItemIndex].getDomNode(), "ca_selected");  
        this._currentItemIndex = index;    
        wink.addClass(this._itemsList[this._currentItemIndex].getDomNode(), "ca_selected");  
        this._selectItem(this._currentItemIndex);
  
      }
      wink.publish('/carousel/events/switch', {'carouselId': this.uId, 'currentItemIndex': this._currentItemIndex});   
  
  
    },
    
      
    /**
     * Refresh containerWidth, set container width, refresh min and max values
     * 
     * @param {integer} containerWidth The width of the carousel's container
     */
    refreshContainerWidth: function(containerWidth) 
    {  
      this._setContainerWidth(containerWidth);
      this._setMinMaxValues();
  
    },
    
    /**
     * Add a new item in the Carousel
     * 
     * @param {string} type The type of the content ("node" or "string")
     * @param {string|HTMLElement} content The content of the item
     * @param {integer} index The position of the item in the carousel
     */
    _addItem: function(type, content, index)
    {
      var node, item;
      
      if ( type == 'node' )
      {
        node = content;
      } else
      {
        node = document.createElement('div');
        node.innerHTML = content;
      }
      
      item = new wink.ui.xy.Carousel.Item({'width': this.itemsWidth, 'height': this.itemsHeight, 'node': node, 'index': (index-this.firstItemIndex)});
    
       this._itemsList.splice(index, 0, item);
    },
    
    /**
     * Listen to the start events
     *
     * @param {wink.ux.Event} event The start event
     */
    _touchStart: function(event)
    {
      this._startEvent = event;  
      if (this.touchPropagation == false)
      {
        this._startEvent.stopPropagation();
      }
      
      this._stopAutoPlay();  
      
      this._beginX = event.x;
      this._beginY = event.y;
    
      wink.fx.apply(this._itemsNode, {
        "transition-duration": '',
        "transition-timing-function": ''
      });
    },
    
    /**
     * Listen to the move events
     *
     * @param {wink.ux.Event} event The move event
     */
    _touchMove: function(event)
    {  
      // if movement is more vertical than horizontal, it is not aimed at carousel
      var deltaX = this._beginX - event.x,
        deltaY = this._beginY - event.y,
        absX = Math.abs(deltaX),
        absY = Math.abs(deltaY);        
      if (absX > 30 || this._followTouch){
        this._followTouch = true;
        if (absY < absX){
          event.stopPropagation();  
          event.preventDefault();
        }else{
          if (absY > absX){
            if (absX > 30){          
              scrollBy(0, deltaY);
            }  
            return;
          }else{
            event.stopPropagation();
            event.preventDefault();
          }        
        }    
      }else{      
        if (absY > absX ){      
          if (window.pageYOffset + deltaY > 0 ){
            scrollBy(0, deltaY);         
          }      
        }
        return;
      }      
      
      // If the auto adjust parameter is not set, stop the movement at both ends of the carousel
      if ( (this.autoAdjust == 0) && (((this._currentX - deltaX) > this._minX) || ((this._currentX - deltaX ) < this._maxX )))
      {
        return;
      }
        
      // Update items positions
      var l = this._itemsList.length;     
  
      if (!this.circular){
        for ( var i=0; i<l; i++)
        {
          this._itemsList[i].position = (this._itemsList[i].beginX - deltaX);
        }
      }
        
      // Update carousel position
      this.position = this._currentX - deltaX;
      wink.fx.applyTranslate(this._itemsNode, this.position,0);      
    },
    
    /**
     * Listen to the end events
     *
     * @param {wink.ux.Event} event The end event
     */
    _touchEnd: function(event)
    {
      this._endEvent = event;    
      if (this.touchPropagation == false)  
      {
        this._endEvent.stopPropagation();
  
      }
      this._lastYOffset = null;
      var deltaX = Math.abs(this._endEvent.x-this._startEvent.x),
        deltaY = Math.abs(this._endEvent.y-this._startEvent.y);
    
      this._carouselMoved = false;
      // Check if a click event must be generated (only for touch)
      if(deltaX < 20 && deltaY < 20 && ((this._endEvent.timestamp-this._startEvent.timestamp) < 1000))
      {
        if (wink.has("touch")){
          this._endEvent.dispatch(this._endEvent.target, 'click');
  
        }
        return;    
      } 
      this._carouselMoved = true;
      this._direction = (this._endEvent.x > this._startEvent.x) ? -1 : 1;      
      // If the autoAdjust parameter is set, move the items with a transition movement, else don't
      if ( this.autoAdjust == 1)  
      {
        var index, 
          l = this._itemsList.length, 
          delta = (l== 1 || (deltaX < 50)) ? 0 : -this._direction * Math.ceil(Math.abs(this._endEvent.x-this._startEvent.x) / this.itemsWidth);      
        this._absoluteIndex -= delta;
        this._jump = delta;      
        if (this.circular){
          index = mod(this._currentItemIndex - delta, l);
        }else{
          index = this._currentItemIndex - delta;
          if (index<0){
            index = 0;
          }else if (index >= l ){
            index = l-1;
          }
  
        }  
        this._moveToItem(index, true);   
      } else
      {
        if(!wink.isUndefined(this.position))
  
  
  
        {
           this._currentX = this.position;
  
  
  
  
        }
      }
      this._followTouch = false;
    },
    
    _click: function(event){
      // Do not propagate click event to contained elements if the carousel has moved. See #59
      if(this._carouselMoved) {
       event.stopPropagation();
      }
    },
    
    /**
     * Display the selected 'dot'
     * 
     * @param {integer} index The index of the item in the list
     */
    _selectItem: function(index)
    {
      var l = this._itemsList.length;
  
      for ( var i=0; i<l; i++)
      {
        this._itemsList[i].beginX = this._centered?(i-index)*this.itemsWidth + (this.containerWidth-this.itemsWidth)/2:(i-index)*this.itemsWidth;
        
        if (this._dotsList[i]){
          if ( i == index)
          {
          wink.addClass(this._dotsList[i], 'ca_selected');
          } else
          {
          wink.removeClass(this._dotsList[i], 'ca_selected');
          }
        }
      }
    },
    
    /**
     * Set the position of all the items at startup
     * @param {integer} index The position of the item in the carousel
     */
    _positionItems: function(index){
      var l = this._itemsList.length,
        w = this.itemsWidth,  
        index = wink.isUndefined(index) ? this.firstItemIndex : index;  
      for ( var i=0; i<l; i++){
        this._positionItem(i);
      }
      if (this.circular){
        // allow a better repartition of items
        var diff = this._centered ? parseInt(l/2 - index) : parseInt((l- parseInt(this.containerWidth / w)) / 2) - index + 1;
        if (diff > 0){
          this._lastLeftIndex = l - diff;
          this._lastRightIndex = mod(this._lastLeftIndex - 1, l);
          while (diff){
            this._positionItem(l-diff, this._itemsList[l-diff].position - w * l);
            diff--;
          }        
        }else{
          if (l>2){
            if (!(diff == 0 && index < l/2)){
             diff--;
            }          
            this._lastRightIndex = mod(-diff - 1, l);
            this._lastLeftIndex = mod(this._lastRightIndex + 1, l);
            while (diff){
              this._positionItem(-diff-1, this._itemsList[-diff-1].position + w * l);
              diff++;
            }
          }                
        }
      }
    },
    
    /**
     * Set the position of the item with given index
     */  
    _positionItem: function(i, position){
      var item = this._itemsList[i],
        width = this.itemsWidth;
      if (position != undefined){
        item.position = position;
      }else{
        item.position = (this._centered ? item.index * width + (this.containerWidth - width)/2 + (this.fullWidthItemsMargin / 2) : item.index*width );
      }    
      item.beginX = item.position;
      wink.fx.applyTranslate(item.getDomNode(),item.position,0);
      //item.getDomNode().translate(item.position, 0);
      
    },
    
    /**
     * call the updateItemsPosition with a delay (useful for orientation change)  
     */ 
    _delayedUpdateItemsPosition: function(){
      var self = this;
      setTimeout(function(){self._updateItemsPosition()}, 300);
    },
    
    /**
     * Update the items' positions when the orientation changes
     */
    _updateItemsPosition: function()
    {
      var self = this; 
      if (this._fullWidth){
        this.containerWidth = document.documentElement.offsetWidth;
      }
      else{
        this.containerWidth = this._domNode.offsetWidth;
      }
      if (this.itemsWidth > this.containerWidth + this.fullWidthItemsMargin){
        // this is when you first load in landscape in order not have itemsWidth > containerWidth
        this.itemsWidth = this.containerWidth;
        this._positionItems();
      }
        
      this._absoluteIndex = this._currentItemIndex;
      this._currentX = (this.firstItemIndex - this._currentItemIndex) * this.itemsWidth;    
      this._positionItems(this._currentItemIndex);
      
      wink.fx.applyTransition(this._itemsNode, "transform", 0);
      
      wink.fx.applyTranslate(this._itemsNode, this._currentX, 0);
      //this._itemsNode.translate(this._currentX, 0);    
      setTimeout(function(){wink.fx.applyTransition(self._itemsNode, "transform", self.autoAdjustDuration + 'ms')}, 1);
    },
    
    /**
     *  swap item to allow circular mode
     */
    _swapItems: function(){    
      var l = this._itemsList.length,
        w = this.itemsWidth,
        index,
        jump = Math.abs(this._jump);  
  
      if (this._direction == 1){        
        index = this._lastLeftIndex;
        while (jump--){        
          this._positionItem(index,  this._itemsList[index].position + w * l);  
          this._lastRightIndex = index;      
          this._lastLeftIndex = index = mod(index + 1, l);        
        }
      }else{      
        index = this._lastRightIndex;
        while (jump--){
          this._positionItem(index, this._itemsList[index].position - w * l);  
          this._lastLeftIndex = index;
          this._lastRightIndex = index = mod(index - 1, l);
        }
      }
      this._jump = 1;    
    },
    
    /**
     * Slide the carousel automatically
     */
    _startAutoPlay: function()
    {
      if(document.readyState && !(/loaded|complete/.test(document.readyState))){
        return;
      }
      if (this.circular){
        this.goRight();
      }else{
        if ( this._currentItemIndex >= (this._itemsList.length-1) )
          this._autoPlayDirection = -1;
        
        if ( this._currentItemIndex <= 0 )
          this._autoPlayDirection = 1;
        
        
        if ( this._autoPlayDirection == 1 )
        {
          this._moveToItem(this._currentItemIndex+1);
        } else
        {
          this._moveToItem(this._currentItemIndex-1);
        }
      }
    },
    
    /**
     * stops the automatic play
     */
    _stopAutoPlay: function(){
      if ( this._autoPlayInterval != null )
      {
        clearInterval(this._autoPlayInterval);
        this._autoPlayInterval = null;
      }
    },
    
    /**
     * Initialize the 'touch' and orientation change listeners
     */
    _initListeners: function()
    {
      var self = this;    
      // do not prevent default if it is an iphone or a bada as we can manage both scrolling and carousel navigation for it, no feature detection possible here
      wink.ux.touch.addListener(this._itemsNode, "start", { context: this, method: "_touchStart", arguments: null }, { preventDefault: !(wink.ua.isIPhone || wink.ua.isBada)});
      wink.ux.touch.addListener(this._itemsNode, "move", { context: this, method: "_touchMove", arguments: null }, { preventDefault: !(wink.ua.isIPhone || wink.ua.isBada)});
      wink.ux.touch.addListener(this._itemsNode, "end", { context: this, method: "_touchEnd", arguments: null }, { preventDefault: true });
      // Catch click event to stop its propagation if the carousel has moved. Use event capturing mode to do that. See #59
      this._itemsNode.addEventListener("click", function(e){self._click(e);}, true);
      
      wink.subscribe("/window/events/orientationchange", { context: this, method: "_delayedUpdateItemsPosition" });    
    
      if (this._arrowLeftNode){            
        this._arrowLeftNode.addEventListener("click", function(){
          self._stopAutoPlay();
          self.goLeft();
        }, false);
      }  
      if (this._arrowRightNode){      
        this._arrowRightNode.addEventListener("click", function(){
          self._stopAutoPlay();
          self.goRight();
        }, false);
      }    
    },
    
    /* 
    * Go one step to the left
    */  
    goLeft: function (){
      var index = this._currentItemIndex - 1,
        l = this._itemsList.length - 1; 
      if (l > 0){      
        if (index == -1){          
          index = this.circular ? l : 0;
        }
        this._direction = -1;
        this._absoluteIndex--;
        this._moveToItem(index);
      }
    },
    
    /* 
    * Go one step to the right
    */
    goRight: function(){
      var index = this._currentItemIndex + 1,
        l = this._itemsList.length - 1;
      if (l > 0) {
        if (index == this._itemsList.length){          
          index = this.circular ? 0 : l;
        }      
        this._direction = 1;
        this._absoluteIndex++;
        this._moveToItem(index);
      }
    },
    
    /**
     * Initialize the Carousel DOM nodes
     */
    _initDom: function()
    {
      this._domNode = document.createElement('div');  
  
      this._domNode.className = 'ca_container';   
      
      this._itemsNode = document.createElement('div');
      this._itemsNode.className = 'ca_items';
      this._itemsNode.style.height = this.itemsHeight + 'px';
      
      this._dotsNode = document.createElement('div');
      this._dotsNode.className = 'ca_dots'; 
  
      var l = this._itemsList.length;
    
      for ( var i=0; i<l; i++)
      {
        var dot = document.createElement('span');
        
        if ( i == this.firstItemIndex )
        {
          dot.className = 'ca_dot ca_selected';
        } else
        {
          dot.className = 'ca_dot';
        }
        
        if ( i == (l-1) )
        {
          dot.style.clear = 'both';
        }
            
        this._dotsList.push(dot);
        this._dotsNode.appendChild(dot);  
        
        this._itemsNode.appendChild(this._itemsList[i].getDomNode());
      }
      
      if ( this.displayDots == 0 )
      {
        this._dotsNode.style.display = 'none';
      }
      
      if (this.displayArrows == 1){ 
        var _aln = this._arrowLeftNode = document.createElement("div");
        _aln.className = "ca_arrow_left";
        _aln.style.height = this.itemsHeight + 'px';
        var div = document.createElement("div");
        _aln.appendChild(div);
        this._domNode.appendChild(_aln);
        var _arn = this._arrowRightNode = document.createElement("div");
        _arn.className = "ca_arrow_right";
        _arn.style.height = this.itemsHeight + 'px';
        div = document.createElement("div");
        _arn.appendChild(div);
        this._domNode.appendChild(_arn);
        if (this._itemsAlign == this._LEFT_POSITION){
          wink.addClass(this._domNode, "adjustLeft");
        }      
      }
      
      this._setMinMaxValues();
      
  
      this._domNode.appendChild(this._itemsNode);
      this._domNode.appendChild(this._dotsNode);
  
      
      if ( this.autoPlay == 1 )
      {
        this._autoPlayInterval = wink.setInterval(this, '_startAutoPlay', this.autoPlayDuration);
      }
    },
    
    /**
     * Set containerWidth
     * 
     * @param {integer} containerWidth The width of the container
     */
    _setContainerWidth: function(containerWidth)
    {  
      // Check container width
      if (!wink.isUndefined(containerWidth))
      {
        if ( !wink.isInteger(containerWidth) || containerWidth < 0 )
        {
          wink.log('[Carousel] The property containerWidth must be a positive integer');
          return false;
        }        
        this.containerWidth = containerWidth;  
      }  
    },
    
    /**
     * Set containerWidth, refresh min and max values and 
     */
    _setMinMaxValues: function()
    {  
      if (this.autoAdjust == 0)
      { 
        if(this._centered)
        {                  
          this._minX = ((this._firstItemIndex)*this.itemsWidth)-((this.containerWidth-this.itemsWidth)/2);
        } else
        {
          this._minX = ((this._firstItemIndex)*this.itemsWidth);
        }
        
        if(this._centered)
        {
          this._maxX = ((this._firstItemIndex-this._itemsList.length)*this.itemsWidth)+((this.containerWidth+this.itemsWidth)/2);
        } else
        {
          this._maxX = ((this._firstItemIndex-this._itemsList.length)*this.itemsWidth)+this.containerWidth;  
        }
      }
    },
    
    /**
     * Validate the properties of the component
     * @returns {boolean} True if the properties are valid, false otherwise
     */
    _validateProperties: function()
    {
      // Check Items width
      if ( !wink.isInteger(this.itemsWidth) || this.itemsWidth < 0 )
        {
          wink.log('[Carousel] The property itemsWidth must be a positive integer');
          return false;
        }      
      
      // Check Items height
      
      if ( !wink.isInteger(this.itemsHeight) || this.itemsHeight < 0 )
        {
          wink.log('[Carousel] The property itemsHeight must be a positive integer');
          return false;
        }
        
      // Check the firstItem parameter
      if ( !wink.isInteger(this.firstItemIndex) || this.firstItemIndex < 0 || (this.firstItemIndex >= this.items.length && this.items.length != 0))
        {
          wink.log('[Carousel] The property firstItemIndex must be a positive integer and less than the number of items');
          return false;
        }
        
      // Check the dots parameter
      if ( !wink.isInteger(this.displayDots) || (this.displayDots != 0 && this.displayDots != 1) )
      {
          wink.log('[Carousel] The property displayDots must be either 0 or 1');
          return false;
      }    
            
      // Check the displayArrows parameter
      
      if ( !wink.isInteger(this.displayArrows) || (this.displayArrows != 0 && this.displayArrows != 1) )
      {
        wink.log('[Carousel] The property displayArrows must be either 0 or 1');
        return false;
      }      
    
      // Check the auto adjust parameter
      if ( !wink.isInteger(this.autoAdjust) || (this.autoAdjust != 0 && this.autoAdjust != 1) )
      {
        wink.log('[Carousel] The property autoAdjust must be either 0 or 1');
        return false;
      }
        
        // Not displaying the dots if the auto-adjust parameter is not set to 1
      if ( this.autoAdjust == 0 )
      {
        this.displayDots = 0;
      }
      
      // Check the auto adjust duration parameter
      if ( !wink.isInteger(this.autoAdjustDuration))
        {
          wink.log('[Carousel] The property autoAdjustDuration must be an integer');
          return false;
        }
                
      // Check the auto adjust duration parameter
    
      if ( !wink.isInteger(this.moveDuration))
      {
          wink.log('[Carousel] The property moveDuration must be an integer');
          return false;
      }
            
          // Check the auto play parameter
      if ( !wink.isInteger(this.autoPlay) || (this.autoPlay != 0 && this.autoPlay != 1))
        {
          wink.log('[Carousel] The property autoPlay must be either 0 or 1');
          return false;
        }
        
      // Check the auto play duration parameter
      if ( !wink.isInteger(this.autoPlayDuration) )
      {
        wink.log('[Carousel] The property autoPlayDuration must be an integer');
        return false;
      }  
      
      // Check the circular parameter    
      if ( !wink.isInteger(this.circular) || (this.circular != 0 && this.circular != 1) )
      {
        wink.log('[Carousel] The property circular must be either 0 or 1');
        return false;
      }   
      
      // Check items list
      if ( !wink.isArray(this.items))  
      {
        wink.log('[Carousel] The items must be contained in an array');
        return false;
      }
        
      // Check propagation
      if ( !wink.isBoolean(this.touchPropagation))
      {
        this.touchPropagation = false;
      }
      
      // Check container width
      if ( !wink.isUndefined(this.containerWidth))
      {
        this._setContainerWidth(this.containerWidth);
      }
      
      // Check items alignement
      if ( !wink.isString(this.itemsAlign) || (this.itemsAlign != this._CENTER_POSITION && this.itemsAlign != this._LEFT_POSITION))
        {
          wink.log('[Carousel] The property itemsAlign must be a positive integer');
          return false;
        }
    },
    
    /**
     * Initialize the Carousel properties
     */
    _initProperties: function()
    {
      var l = this.items.length;
      
      for ( var i=0; i<l; i++)
      {
        this._addItem(this.items[i].type, this.items[i].content, i);
      }    
      this._currentItemIndex = this._absoluteIndex = this.firstItemIndex;  
    },
    
    dummyFunction:function(){
      /** SPE : dummy function to avoid build problem if the last method is overriden */  
    }
  };
  
  /**
   * @class Implements a carousel item
   * 
   * @param {object} properties The properties object
   * @param {integer} properties.index The initial position of the item in the Carousel
   * @param {integer} properties.height The height of the item
   * @param {integer} properties.width The width of the item
   * @param {HTMLElement} properties.node The DOM node containing the item
   */
  wink.ui.xy.Carousel.Item = function(properties)
  {
    /**
     * Unique identifier
     * 
     * @property uId
     * @type integer
     */
    this.uId = wink.getUId();
    
  
    /**
     * The initial position of the item in the Carousel
     * 
     * @property index
     * @type integer
     */
    this.index = properties.index;
    
    /**
     * The width of the item
     * 
     * @property width
     * @type integer
     */
    this.width = properties.width;
  
    /**
     * The height of the item
     * 
     * @property height
     * @type integer
     */
    this.height = properties.height;
    
    /**
     * The start position in pixels of the item in the Carousel
     * 
     * @property beginX
     * @type integer
     */
    this.beginX = 0;
  
    /**
     * The current position in pixels of the item in the Carousel
     * 
     * @property position
     * @type integer
     */
    this.position = 0;
    
    this._domNode = properties.node;
    
    this._initDom();
  };
  
  wink.ui.xy.Carousel.Item.prototype =
  {
    /**
     * Return the dom node containing the item
     * 
     * @returns {HTMLElement} The main dom node
     */
    getDomNode: function()
    {
      return this._domNode;
    },
    
    /**
     * Initialize the Carousel DOM nodes
     */
    _initDom: function()
    {
      wink.addClass(this._domNode, 'ca_item');
  
      wink.fx.apply(this._domNode, {
        width: this.width + 'px',
        height: this.height + 'px'
      });
    }
  };
  
  mod = wink.bind(wink.math.modulo, wink.math);

  return wink.ui.xy.Carousel;
});