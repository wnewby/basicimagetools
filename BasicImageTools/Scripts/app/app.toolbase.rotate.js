;

/*
 * app.toolbase.rotate
 *
 * rotate tool.  allows rotation in 90 degree increments.  rotation occurs upon each click, no confirmation
 *
 *  
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */

(function (app, $, window, document, undefined) {

    var toolname = 'rotate';

    $.toolrotate = function (element, options) {

        element.data('toolrotate', this);
        this._elementCache = {
            toolbutton: null,
            images: null,
            btnSaverotate: null,
            btnSaverotate: null
        };

        //constructor
        this.init = function (element, options) {
            var $self = this;
            $self._elementCache.toolbutton = element;
            $self.options = $.extend({}, $.toolrotate.defaultOptions, options);
            
            element.addClass('ui-tool ui-tool-' + toolname);

            element.on('click.activatetool', function () {
                $.proxy(_activate, $self)();
            });
        }

        //public methods
        this.execute = function ($image) {
            var $self = this;
            $self._elementCache.images = $image;

            if ($self.options.message) {
                $self.options.message.call($self, 'Please wait <img style="width: 60px" src="/images/ajax-loader.gif"/>', 0);

                $self._elementCache.images.on('load.rotate', function () {
                    if ($self.options.message) { $self.options.message.call($self, '', 0); }
                    $self._elementCache.images.unbind('load.rotate');
                    $.proxy(_deActivate, $self)();
                });
            }
            
            //$self._elementCache.images.data('imageasset').activate();


            // currentRotation is used to all future client side only rotation
            if (!$self._elementCache.images.attr("data-currentRotation")) {
                $self._elementCache.images.attr("data-currentRotation", "0");
            }

            var currentRotation = parseInt($self._elementCache.images.attr("data-currentRotation"), 10);
            currentRotation += 90;
            if (currentRotation === 360) { currentRotation = 0; }
            $self._elementCache.images.attr("data-currentRotation", currentRotation);
            //11/7/2013 removing jqueyr client side css rotation for server side
            //          too many problems with css rotation
            //$self._elementCache.images.rotate(currentRotation);
            //var currentSRC = $self._elementCache.images.attr('src').replace(/\b(&)rotation=[^&]+/, '');
            
            //$self._elementCache.images.attr('src', '/images/ajax-loader.gif');
            //$self._elementCache.images.attr('src', currentSRC + '&rotation=' + currentRotation);
            
            $.ajax(app.routes.rotate, {
                type: 'get',
                dataType: 'json',
                data: {
                    fileName: $self._elementCache.images.attr('alt'),
                    rotation: currentRotation
                },
                error: function (result) {
                    console.log('rotation error');
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
    $.fn.toolrotate = function (options) {
        return this.each(function () {
            new $.toolrotate($(this), options);
        });
    };

    //default options
    $.toolrotate.defaultOptions = {
        waitingForSelection: null,
        finished: null,
        message: null,
        //events
        newImage: null,
        updateImage: null
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

        if ($self.options.finished) { $self.options.finished.call($self); }
        //if ($self.options.message) { $self.options.message.call($self, '', 0); }
        

        
    }
    

})(app || {}, jQuery, window, document);
