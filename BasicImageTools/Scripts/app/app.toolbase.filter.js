;

/*
 * app.toolbase.filter
 *
 * filter tool.  calls filter end point passing requested filter as a string 
 *  
 * TODO, create specific end points for filters or better fail safe than string parameter
 *  create custom filter matrix
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */

 (function (app, $, window, document, undefined) {

    var toolname = 'filter';

    $.toolfilter = function (element, options) {

        element.data('toolfilter', this);
        this._elementCache = {
            toolbutton: null,
            images: null
        };

        //constructor
        this.init = function (element, options) {
            var $self = this;
            $self._elementCache.toolbutton = element;
            $self.options = $.extend({}, $.toolfilter.defaultOptions, options);
            
            element.addClass('ui-tool ui-tool-' + toolname).addClass('ui-tool-' + toolname + '-' + $self.options.filtername);

            element.on('click.activatetool', function () {
                $.proxy(_activate, $self)();
            });
        }

        //PUBLIC METHODS
        this.execute = function ($image) {
            var $self = this;
            $self._elementCache.images = $image;

            if ($self.options.message) {
                $self.options.message.call($self, 'Please wait <img style="width: 60px" src="/images/ajax-loader.gif"/>', 0);

                $self._elementCache.images.on('load.filter', function () {
                    if ($self.options.message) { $self.options.message.call($self, '', 0); }
                    $self._elementCache.images.unbind('load.filter');
                    $.proxy(_deActivate, $self)();
                });
            }
            
            
            $.ajax(app.routes.filter, {
                type: 'get',
                dataType: 'json',
                data: {
                    fileName: $self._elementCache.images.attr('alt'),
                    filtername: $self.options.filtername
                },
                error: function (result) {
                    console.log('filter error');
                    console.log(result);
                },
                success: function (result) {
                    if (result.success) {
                        var ts = new Date().getTime();
                        result.path += '&ts=' + ts;
                        result.thumb += '&ts=' + ts;

                        if ($self.options.newImage) {
                            $self.options.newImage.call($self, result);
                        }
                    }
                }
            });

            
        };

        this.cancel = function () {
            var $self = this;
            $.proxy(_deActivate, $self)();
        };

        //call constructor
        return this.init(element, options);
    }

    //prototype
    $.fn.toolfilter = function (options) {
        return this.each(function () {
            new $.toolfilter($(this), options);
        });
    };

    //default options
    $.toolfilter.defaultOptions = {
        waitingForSelection: null,
        finished: null,
        message: null,
        filtername: 'sharpen',
        //events
        newImage: null,
        updateImage: null
    }

    //PRIVATE METHODS _
    function _activate() {
        
        var $self = this;
        
        if ($self._elementCache.toolbutton.hasClass('ui-tool-disabled')) { return; }

        $self._elementCache.toolbutton.addClass("ui-tool-selected");

        if ($self.options.waitingForSelection) { $self.options.waitingForSelection.call($self,$self); }
    }

    function _deActivate() {
        var $self = this;

        $self._elementCache.toolbutton.removeClass("ui-tool-selected");

        if ($self.options.finished) { $self.options.finished.call($self); }
    }
    

 })(app || {}, jQuery, window, document);
