;

/*
 * app.toolbase.resize
 *
 * resize tool.  
 *
 * not currently implemented 5/14/2014
 *  
 * TODO, need ui that either works with full screen image, shows smaller version, or allows direct input
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */

(function ($, window, document, undefined) {

    var toolname = 'resize';
    var selectmessage = 'Select Image to Resize';

    $.toolresize = function (element, options) {

        element.data('toolresize', this);
        this._elementCache = {
            toolbutton: null,
            images: null,
            btnSaveresize: null,
            btnSaveresize: null
        };

        //constructor
        this.init = function (element, options) {
            var $self = this;
            $self._elementCache.toolbutton = element;
            $self.options = $.extend({}, $.toolresize.defaultOptions, options);
            
            element.addClass('ui-tool ui-tool-' + toolname);
            element.on('click.activatetool', function () {
                $.proxy(_activate, $self)();
            });
        }

        //public methods
        this.execute = function ($image) {
            var $self = this;
            
            if ($self.options.message) { $self.options.message.call($self, 'Drag edges of image to resize', 0); }

            $self._elementCache.images = $image;
            
            $self._elementCache.images.data('imageasset').activate();

            //should disable drag in frame or imageasset
            $self._elementCache.images.draggable('disable');

            //initial drag location disabled
//            var imageOffset = $frame.getSelectedImage().offset();
//           var x1 = window.event.x - imageOffset.left;
//            var y1 = window.event.y - imageOffset.top;



            $self._elementCache.images.resizable({
                aspectRatio: true,
                handles: 'all',
                stop: $.proxy(_deActivate, $self)
            });

            //$self._elementCache.images.parent().find('.ui-resizable-se').removeClass('ui-icon', 'ui-icon-gripsmall-diagonal-se');

        };

        this.cancel = function () {
            var $self = this;
            $.proxy(_deActivate, $self)();
        };

        //call constructor
        return this.init(element, options);
    }

    //prototype
    $.fn.toolresize = function (options) {
        return this.each(function () {
            new $.toolresize($(this), options);
        });
    };

    //default options
    $.toolresize.defaultOptions = {
        waitingForSelection: null,
        finished: null,
        message: null
    }

    //private methods
    function _activate() {
        var $self = this;

        if ($self._elementCache.toolbutton.hasClass('ui-tool-disabled')) { return; }

        $self._elementCache.toolbutton.addClass("ui-tool-selected");

        if ($self.options.waitingForSelection) { $self.options.waitingForSelection.call($self,$self); }
        //if ($self.options.message) { $self.options.message.call($self, selectmessage, 0); }

    }

    function _deActivate() {
        var $self = this;

        $self._elementCache.toolbutton.removeClass("ui-tool-selected");

        
        if ($self._elementCache.images) {
            $self._elementCache.images.resizable("destroy");

            //should disable drag in frame or imageasset
            $self._elementCache.images.draggable('enable');

            $self._elementCache.images.data('imageasset').deActivate();
            $self._elementCache.images.trigger($.Event('resize'));
        }

        

        if ($self.options.finished) { $self.options.finished.call($self); }
        if ($self.options.message) { $self.options.message.call($self, '', 0); }
        
    }
    

})(jQuery, window, document);
