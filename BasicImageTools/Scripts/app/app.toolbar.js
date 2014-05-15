;

/* 
 * app.toolbar
 *
 * container for image tools.  this control is attached to the image in the workarea and dynamically creates each available tool
 * can be refactored a bit including creating a base class for all tools which overload the prototype
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 *
 */

(function ($, window, document, undefined) {

    $.toolbar = function (element, options) {

        element.data('toolbar', this);

        this._elementCache = {
            imageasset: null,
            container: null,
            messageArea: null,
            toolDelete: null,
            toolCrop: null,
            toolResize: null,
            toolRotate: null
        }

        this.init = function (element, options) {
            var $self = this;

            $self.options = $.extend({}, $.toolbar.defaultOptions, options);
            
            $self._elementCache.imageasset = element;

            $self._elementCache.messageArea = $('<div>', {
                "class": "messageArea"
            });

            //add individual tools

            // DELETE [currently implimented as remove from workarea]
            $self._elementCache.toolDelete = $('<div>', {
            }).tooldelete({
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                deleteImage: function () { if ($self.options.deleteImage) { $self.options.deleteImage.call($self); } }
            });

            // CROP
            $self._elementCache.toolCrop = $('<div>', {
            }).toolcrop({
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                newImage: function (result) { if ($self.options.newImage) { $self.options.newImage.call($self, result); } }

            });

            // 5/1/2014 disabling resize as it's current state is client side only and needs enchancements to update stored file
            //$self._elementCache.toolResize = $('<div>', {
            //}).toolresize({
            //    waitingForSelection: $.proxy(_toolSelected, $self),
            //    finished: $.proxy(_toolFinished, $self),
            //    message: $.proxy(_toolMessage, $self)
            //});

            // ROTATE
            $self._elementCache.toolRotate = $('<div>', {
            }).toolrotate({
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                newImage: function (result) { if ($self.options.newImage) { $self.options.newImage.call($self, result); } }
            });

            // FILTER - SHARPEN
            $self._elementCache.toolSharpen = $('<div>', {
            }).toolfilter({
                filtername: 'sharpen',
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                newImage: function (result) { if ($self.options.newImage) { $self.options.newImage.call($self, result); } }
            });

            // FILTER - EMBOSS
            $self._elementCache.toolEmboss = $('<div>', {
            }).toolfilter({
                filtername: 'emboss',
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                newImage: function (result) { if ($self.options.newImage) { $self.options.newImage.call($self, result); } }
            });

            // FILTER - BLUR
            $self._elementCache.toolBlur = $('<div>', {
            }).toolfilter({
                filtername: 'blur',
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                newImage: function (result) { if ($self.options.newImage) { $self.options.newImage.call($self, result); } }
            });

            // FILTER - DETECT EDGE
            $self._elementCache.toolDetectEdge = $('<div>', {
            }).toolfilter({
                filtername: 'detectedge',
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
                message: $.proxy(_toolMessage, $self),
                newImage: function (result) { if ($self.options.newImage) { $self.options.newImage.call($self, result); } }
            });

            // DOWNLOAD
            $self._elementCache.toolDownload = $('<div>', {
            }).tooldownload({
                waitingForSelection: $.proxy(_toolSelected, $self),
                finished: $.proxy(_toolFinished, $self),
            });

            $self._elementCache.container = $('<div>', {
            }).append($self._elementCache.messageArea,
                      $self._elementCache.toolDelete,
                      $self._elementCache.toolCrop,
                      $self._elementCache.toolRotate,
                      $self._elementCache.toolSharpen,
                      $self._elementCache.toolEmboss,
                      $self._elementCache.toolBlur,
                      $self._elementCache.toolDetectEdge,
                      $self._elementCache.toolDownload
                      );


            if (element.width() != 0) {
                $.proxy(_setToolBar, $self)();
            } else {
                element.on('resize.toolbar.init', $.proxy(_setToolBar, $self));
            }
                        
            element.on('dragstop.toolbar', $.proxy(_adjustToolPlacement, $self));

            element.on('remove.toolbar', function () {
                $self._elementCache.imageasset.qtip('api').destroy();
            });
            
        }

        //PUBLIC METHODS
        this.destroy = function () {
            var $self = this;
            //$self._elementCache.imageasset.qtip('api').destroy();
            $self._elementCache.imageasset.qtip("destroy",true);
            // extra cleanup
            $self._elementCache.imageasset.removeData("hasqtip");
            $self._elementCache.imageasset.removeAttr("data-hasqtip");
        }

        this.reposition = function () {
            var $self = this;
            $.proxy(_adjustToolPlacement, $self)();
        }


        return this.init(element, options);
    }

    //call constructor
    $.fn.toolbar = function (options) {
        return this.each(function () {
            new $.toolbar($(this), options);
        });
    }

    $.toolbar.defaultOptions = {
        //events
        toolActive: null,
        toolDeactivated: null,
        newImage: null,
        updateImage: null,
        deleteImage: null
        //options
    }

    //PRIVATE METHODS _
    function _toolMessage(message, duration) {
        var $self = this;
        $self._elementCache.messageArea.html(message);
        
        //app.layout.layout('Message', message, duration);

        
    }


    function _disableAllTools() {
        $('.ui-tool').addClass('ui-tool-disabled');
    }

    function _enableAllTools() {
        $('.ui-tool').removeClass('ui-tool-disabled');
    }

    function _activateTool($tool, image) {
        var $self = this;
        //if ($self.options.toolActive) { $self.options.toolActive(); }

      
        _disableAllTools();
        $tool.execute($(image));
        
        //watching for escape
        $(document).on('keyup.tool', function (event) {
            if (event.keyCode === 27) {
                $tool.cancel();
                $.proxy(_adjustToolPlacement, $self)();
            }
        });

        // IE Count is needed for IE & Chrome.  The rubber band box will trigger a click on body which then triggers the cancel.  Ignoring the first body click does the trick
        var IEcount = 0;
        //waiting for click that triggered the action to complete before assigning click off cancel
        setTimeout(function () {
            //watch for click not on imageasset
            $(document).on('click.canceltool', function (event) {
                
                var target = event ? event.target : window.event.srcElement;
                var $target = $(target);
               
                //IE fix
                if ((app.browser.isIE || app.browser.isChrome) && IEcount == 0) {
                    IEcount++;
                    return;
                }
                //check for image asset, crop, resize, controls
                //imgareaselect-border4
                //imgareaselect-handle
                //activetool?
                //ui-resizable-handle
                var targetClass = $target.attr('class');
                // the IE/Chrome body click issue is causing problems when resizing selection so we are going to only cancel a click for those browsers
                //  when something other than the body is clicked [something with a class]
                if (!targetClass && (app.browser.isIE || app.browser.isChrome)) {
                    return;
                    // not called for now
                    if ($target.children) {
                        var ieTarget = $target[0];
                        var children = ieTarget.children;
                        var childClass = children.className;
                        targetClass = $(children[0]).attr('class');
                    }
                }
                if (targetClass) {
                    if (targetClass.indexOf('imgareaselect') >= 0) { return; }
                    if (targetClass.indexOf('ui-resizable') >= 0) { return; }
                    if (targetClass.indexOf('toolbutton') >= 0) { return; }
                }
                $tool.cancel();
                $.proxy(_adjustToolPlacement, $self)();
            });
        }, 500);

    }

    function _toolSelected($tool) {
        var $self = this;

        // UNCOMMENT IF QTIP IS CURRENTLY A MOUSE OVER MENU
        ////check to see if the element did not get deleted by the tool
        //if ($self._elementCache.imageasset) {
        //    if ($self._elementCache.imageasset.data('qtip')) {

        //        $self._elementCache.imageasset.qtip('api').set({
        //            'hide.leave': false,
        //            'hide.event': false
        //        });
        //    }
        //}

        $.proxy(_activateTool, $self, $tool, $self._elementCache.imageasset)();

    }

    function _toolFinished() {
        var $self = this;

        //if ($self.options.toolDeactivated) { $self.options.toolDeactivated(); }

        $(document).unbind('keyup.tool');
        $(document).unbind('click.canceltool');

        // UNCOMMENT IF QTIP SHOULD RETURN TO A MOUSE OVER MENU
        ////check to see if the element did not get deleted by the tool
        //if ($self._elementCache.imageasset) {
        //    if ($self._elementCache.imageasset.data('qtip')) {
        //        var api = $self._elementCache.imageasset.qtip('api');
        //        api.set({
        //            'hide.leave': true,
        //            'hide.event': 'mouseout'
        //        });
        //        //api.hide();
        //    }
        //}

        //bubble image update
        if ($self.options.updateImage) { $self.options.updateImage(); }

        $.proxy(_adjustToolPlacement, $self)();
        _enableAllTools();
    }

    function _setToolBar() {
        var $self = this;

        var toolOffset = $.proxy(_getToolPlacement, $self)();

        $self._elementCache.imageasset.qtip({
            prerender: true,
            content: {
                text: $self._elementCache.container
            },
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            hide: false,
            show: {
                ready: true
            },
            style: {
                tip: {
                    corner: false
                },
                classes: 'qtip-blue qtip-toolbar'
            }
        });

        $self._elementCache.imageasset.off('resize.toolbar.init');
        $self._elementCache.imageasset.on('resize.toolbar', $.proxy(_adjustToolPlacement, $self));

    }

    function _adjustToolPlacement() {
        var $self = this;

        if (!$self._elementCache.imageasset.data('qtip')) {
            //if the qtip is not set yet, set it!
            //5-1-2014, tool bar reset is legacy from use as client side only tool, this is causing an extra qtip to be added after the fact
            return;
            //$.proxy(_setToolBar, $self)();
        }
        var $qtipAPI = $self._elementCache.imageasset.qtip('api');

        $qtipAPI.reposition();

    }

    function _getToolPlacement() {
        var $self = this;

        if (!$self._elementCache.imageasset) { return; }

        var $parent = $self._elementCache.imageasset.parent();

        if (!$parent) { return; }

        var imgOffset = $self._elementCache.imageasset.position();

        var toolOffsetX = ($self._elementCache.imageasset.width() + imgOffset.left - $parent.width()) * -1;
        var toolOffsetY = ($self._elementCache.imageasset.height() + imgOffset.top - $parent.height()) * -1;

        return {
            x: toolOffsetX,
            y: toolOffsetY
        };

        
    }

})(jQuery,window,document)