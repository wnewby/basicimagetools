;

/*
 * app.workarea
 *
 * holds the currently selected images and attaches the toolbar.
 * images updated through the toolbar bubble up to the workarea which then updates the imageasset maintaining the thumbnail button
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */

(function ($, window, document, undefined) {
    $.workarea = function (element, options) {
        element.data('workarea', this);
        
        var $self = this,
        localCache = {
            element: null,
            imageasset: null,
            imageElement: null
        }

        $self.init = function (element, options) {

            $self.options = $.extend({}, $.workarea.defaultOptions, options);

            localCache.element = element;

            localCache.element.addClass('ui-workarea');

            localCache.element.css({
                width: $self.options.width,
                height: $self.options.height
            });

            //watch for window resize and do stuff!
            //$(window).resize(function () {
            //    _resizeElements();
            //});

        };

        $self.getImageAsset = function () {
            return localCache.imageasset;
        }

        $self.setWidth = function (width) {
            $self.options.width = width;
            localCache.element.css({
                width: $self.options.width,
            });
            _resizeImageAsset();
        }

        $self.setHeight = function (height) {
            $self.options.height = height;
            localCache.element.css({
                height: $self.options.height,
            });
            _resizeImageAsset();
        }

        //PUBLIC METHODS

        /*
         * load selected image into main work area
         */
        $self.addImageAsset = function (imageasset, resizeImage, callback) {

            $self.removeImageAsset();
            localCache.imageasset = imageasset;
            
            localCache.imageElement = $('<img>', {
                    src: imageasset.getPath(), 
                    alt: imageasset.getFileName(),
                    'class': 'ui-workimage',
                    css: {
                        display: 'none'
                    }
                }).load(function () {
                        // load tools
                    _resizeImageAsset();
                    $(this).fadeIn(500, function () {
                        _addTools();

                        if (callback) { callback(this); }
                    });
                });

                //_resizeImageAsset();

            localCache.element.append(localCache.imageElement);
        };

        $self.removeImageAsset = function () {
            if (localCache.imageElement != null) {
                localCache.imageElement.data('toolbar').destroy();
                localCache.imageElement.remove();
                localCache.imageElement = null;
            }
            localCache.imageasset = null;
            localCache.element.empty();
            //hide tools
        };


        $self.getSelectedImage = function () {
            return $self.selectedImage;
        };



        //PRIVATE METHODS _

        _resizeImageAsset = function () {
            if (!localCache.imageElement) { return; }
            localCache.imageElement.css({
                width: '',
                height: ''
            });

            var workareaRatio = localCache.element.width() / localCache.element.height();
            var imageRatio = localCache.imageElement.width() / localCache.imageElement.height();

            if (workareaRatio < imageRatio) {
                localCache.imageElement.css({
                    width: '100%'
                });
            }
            else {
                localCache.imageElement.css({
                    height: '100%'
                });
            }

            //localCache.imageElement.data('toolbar').reposition();
            
        };

        _addTools = function() {
            
            localCache.imageElement.toolbar({
                newImage: _updateImage, 
                //updateImage: function (result) { console.log(result); _updateImage(result); },
                deleteImage: function () { $self.removeImageAsset(); if ($self.options.deleteImage) { $self.options.deleteImage.call($self);} },
                toolActive: $.proxy($self.select, $self),
                toolDeactivated: $.proxy($self.unSelect, $self),
            });

        };

        var _updateImage = function (file) {
            // update main image and check size
            var tempImageAsset = localCache.imageasset;
            // rather than just updating the src of the current image, we need to remove and re-add.  updating src was causing data of element to get trashed.  strange behavior
            tempImageAsset.setNewImage(file);
            $self.addImageAsset(tempImageAsset);
        }

        //change explicit value to percentage to keep window resize position element automatically
        var _adjustImageLocation = function (event, ui) {

            var $image = ui.helper;
            var imgOffset = $image.position();

            $image.data('imageasset').setPosition((imgOffset.top / $self.elementCache.frame.height()) * 100, (imgOffset.left / $self.elementCache.frame.width()) * 100);

            //image moved, bubble update
            $image.data('imageasset').imageMoved();

            _unselectAllImage();
        }

        var _unselectAllImage = function () {


            $.each($self.elementCache.imageassets, function () {
                if (this == null) { return; }
            });

            $self.elementCache.frame.css({
                'overflow': 'hidden',
                'z-index': $self.options.zindex
            });
        }

        var _selectImage = function (event, ui) {

            var $image = ui.helper;

            $.each($self.elementCache.imageassets, function () {
                if (this == null) { return; }
                if (this != $image[0]) {
                    if ($(this).data('imageasset')) { $(this).data('imageasset').fade(); }
                }
            });
            $image.data('imageasset').activate();
            $self.elementCache.frame.css({
                'overflow': 'visible',
                'z-index': $self.elementCache.frame.css('z-index') + 1000 + $self.options.zindex //chosing to go 1000 from current rather than query all frames and find out for sure
            });

        }

        var _imageSelected = function (image) {

            $self.selectedImage = image;

            if ($self.options.imageSelected) { $self.options.imageSelected.call($self, image); }
        }



        //call constructor
        return $self.init(element, options);
    }


    //prototype
    $.fn.workarea = function (options) {

        return new $.workarea($(this), options);

        //better if "this" is multiple elements but doesn't work with returning the new frame
        //return this.each(function () {
        //    (new $.frame($(this), options));
        //});
    }

    //default options
    $.workarea.defaultOptions = {
        //events
        imageSelected: null,
        //options
        drop: null,
        width: '100',
        height: '100',
        zIndex: '10',
        id: null
    }


})(jQuery, window, document);