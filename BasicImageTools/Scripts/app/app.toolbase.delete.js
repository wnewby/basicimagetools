;

/*
 * app.toolbase.delete
 *
 * delete tool.  currently implemented as a simple remove from workspace.
 *  
 * TODO, remove file from FS after confirmation from user
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */

(function ($, window, document, undefined) {

    var toolname = 'delete',
        selectmessage = 'Select Image to Delete';

    $.tooldelete = function (element, options) {

        element.data('tooldelete', this);
        this._elementCache = {
            toolbutton: null
        };

        //constructor
        this.init = function (element, options) {
            var $self = this;
            $self._elementCache.toolbutton = element;
            $self.options = $.extend({}, $.tooldelete.defaultOptions, options);
            
            element.addClass('ui-tool ui-tool-' + toolname);

            element.on('click.activatetool', function () {
                $.proxy(_activate, $self)();
            });
        }

        //PUBLIC METHODS
        this.execute = function ($image) {
            var $self = this;
            
            //$image.remove();
            //bubble up client side image removal
            $.proxy(_deActivate, $self, false)();

            if ($self.options.deleteImage) { $self.options.deleteImage($self); }
        };

        this.cancel = function () {
            var $self = this;
            $.proxy(_deActivate, $self)();
        };

        //call constructor
        return this.init(element, options);
    }

    //prototype
    $.fn.tooldelete = function (options) {
        return this.each(function () {
            new $.tooldelete($(this), options);
        });
    };

    //default options
    $.tooldelete.defaultOptions = {
        waitingForSelection: null,
        finished: null,
        message: null
    }

    //PRIVATE METHODS _
    function _activate() {
        
        var $self = this;
        
        if ($self._elementCache.toolbutton.hasClass('ui-tool-disabled')) { return; }

        $self._elementCache.toolbutton.addClass("ui-tool-selected");

        if ($self.options.waitingForSelection) { $self.options.waitingForSelection.call($self, $self); }
        //if ($self.options.message) { $self.options.message.call($self, selectmessage, 0); }
    }

    function _deActivate() {
        var $self = this;

        $self._elementCache.toolbutton.removeClass("ui-tool-selected");

        if ($self.options.finished) { $self.options.finished.call($self); }
        if ($self.options.message) { $self.options.message.call($self, '', 0); }
    }
    


})(jQuery, window, document);
