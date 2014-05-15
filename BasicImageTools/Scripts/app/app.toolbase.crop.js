;

/*
 * app.toolbase.crop
 *
 * crop tool.  upon activation, presents user with ability to drag rubber band box over image.  
 *  when the selection is accepted, the coordinates are set to the server and the image is cropped
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */


(function (app, $, window, document, undefined) {

    var toolname = 'crop';
    var selectmessage = 'Select Image to Crop';

    $.toolcrop = function (element, options) {

        element.data('toolcrop', this);
        this._elementCache = {
            toolbutton: null,
            images: null,
            btnSaveCrop: null,
            btnCancelCrop: null
        };

        this.cropInProgress = false;

        //CONSTRUCTOR
        this.init = function (element, options) {
            var $self = this;
            $self._elementCache.toolbutton = element;
            $self.options = $.extend({}, $.toolcrop.defaultOptions, options);
            
            element.addClass('ui-tool ui-tool-' + toolname);

            element.on('click.activatetool',function () {
                $.proxy(_activate, $self)();
            });
        }

        //PUBLIC METHODS
        this.execute = function ($image) {
            var $self = this;
            
            if ($self.options.message) { $self.options.message.call($self, 'Drag to select crop area', 0); }

            $self._elementCache.images = $image;
            

            $self._elementCache.images.imgAreaSelect({
                handles: true,
                onSelectEnd: $.proxy(_showCropAccept, $self),
                onSelectChange: $.proxy(_removeAcceptButtons, $self)
            });
        };

        this.cancel = function () {
            var $self = this;
            $.proxy(_deActivate, $self)();
        };

        //call constructor
        return this.init(element, options);
    }

    //PROTOTYPE
    $.fn.toolcrop = function (options) {
        return this.each(function () {
            new $.toolcrop($(this), options);
        });
    };

    //default options
    $.toolcrop.defaultOptions = {
        waitingForSelection: null,
        finished: null,
        message: null,
        //events
        newImage: null
    }

    //PRIVATE METHODS _
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
        if ($self.options.message && !$self.cropInProgress) { $self.options.message.call($self, '', 0); }

        //remove buttons if they exist
        $.proxy(_removeAcceptButtons, $self)();


        //remove crop
        if ($self._elementCache.images) {
            $self._elementCache.images.imgAreaSelect({ remove: true });
        }

        
    }
    
    function _showCropAccept(img, selection) {
        var $self = this;

        var $img = $(img);

        $.proxy(_removeAcceptButtons, $self)();

        if (selection.width === 0) {
            //we canceled selection
            $.proxy(_deActivate, $self);
        } else {

            $self._elementCache.btnSaveCrop = $("<input>", {
                value: 'Save Crop',
                type: 'button',
                'class': 'btnSaveCrop ui-toolbutton',
                css: {
                    'position': 'absolute',
                    top: $img.offset().top + selection.y1 + "px",
                    left: $img.offset().left + selection.x1 + "px"
                }

            });


            $self._elementCache.btnCancelCrop = $self._elementCache.btnSaveCrop.clone();
            $self._elementCache.btnCancelCrop.css('left', parseInt($self._elementCache.btnCancelCrop.css('left').replace('px', '')) + 100 + 'px');

            $self._elementCache.btnCancelCrop.val('Cancel Crop');


            $self._elementCache.btnSaveCrop.click(function () {

                $self.cropInProgress = true;
                
                var ias = $img.imgAreaSelect({ instance: true }),
                    selection = ias.getSelection(),
                    imgWidth = $img.width(),
                    imgHeight = $img.height();

                var src = $img.attr('src');

                $img.show();

                if ($self.options.message) {
                    $self.options.message.call($self, 'Please wait <img style="width: 60px" src="/images/ajax-loader.gif"/>', 0);

                    $self._elementCache.images.on('load.crop', function () {
                        if ($self.options.message) { $self.options.message.call($self, '', 0); }
                        $self._elementCache.images.unbind('load.crop');
                    });

                    $self.cropInProgress = false;
                }


                $.ajax(app.routes.crop, {
                    type: 'get',
                    dataType: 'json',
                    data: {
                        fileName: $img.attr('alt'),
                        x1: selection.x1,
                        y1: selection.y1,
                        x2: selection.x2,
                        y2: selection.y2,
                        scalewidth: imgWidth,
                        scaleheight: imgHeight,
                        rotation: $img.attr('data-currentrotation'),
                        src: src
                    },
                    error: function (result) {
                        console.log('crop error');
                        console.log(result);
                        $self.cropInProgress = false;
                        $.proxy(_deActivate, $self)();

                    },
                    success: function (result) {
                        $.proxy(_deActivate, $self)();
                        if (result.success) {
                            // add timestamp to src so browser will not pull from cache
                            var ts = new Date().getTime();
                            result.path += '&ts=' + ts;
                            result.thumb += '&ts=' + ts;

                            if ($self.options.newImage) {
                                $self.options.newImage.call($self, result);
                            }
                        }
                    }
                });


            });

            $self._elementCache.btnCancelCrop.click(function () {
                $.proxy(_deActivate,$self)();
            });

            $('body').append($self._elementCache.btnSaveCrop);
            $('body').append($self._elementCache.btnCancelCrop);
        }
    }

    function _removeAcceptButtons() {
        var $self = this;

        if ($self._elementCache.btnSaveCrop) {
            $self._elementCache.btnSaveCrop.remove();
        }

        if ($self._elementCache.btnCancelCrop) {
            $self._elementCache.btnCancelCrop.remove();
        }


    }


})(app || {}, jQuery, window, document);
