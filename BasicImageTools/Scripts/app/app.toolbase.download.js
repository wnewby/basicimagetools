;

/*
 * app.toolbase.download
 *
 * download tool. redirects user to file download location.
 *  
 * TODO, needs a safer immplementation.  either download through an iframe or a direct link via an anchor tag
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 */

(function (app, $, window, document, undefined) {

    var toolname = 'download';

    $.tooldownload = function (element, options) {

        element.data('tooldownload', this);
        this._elementCache = {
            toolbutton: null,
            images: null,
            btnSavedownload: null,
            btnSavedownload: null
        };

        //constructor
        this.init = function (element, options) {
            var $self = this;
            $self._elementCache.toolbutton = element;
            $self.options = $.extend({}, $.tooldownload.defaultOptions, options);
            
            element.addClass('ui-tool ui-tool-' + toolname);

            element.on('click.activatetool', function () {
                $.proxy(_activate, $self)();
            });
        }

        //public methods
        this.execute = function ($image) {
            var $self = this;
            $self._elementCache.images = $image;

            //dangerous file download.  need to revise toolbar to include proper links
            // TODO, at least this should be done in an iframe for safety
            window.location = app.routes.download + '?fileName=' + $self._elementCache.images.attr('alt');

            $.proxy(_deActivate, $self)();

            //$.ajax('/FileUploads/DownloadFile', {
            //    type: 'get',
            //    dataType: 'json',
            //    data: {
            //        fileName: $self._elementCache.images.attr('alt')
            //    },
            //    error: function (result) {
            //        console.log('download error');
            //        console.log(result);
            //    }
            //});

            
        };

        this.cancel = function () {
            var $self = this;
            $.proxy(_deActivate, $self)();
        };

        //call constructor
        return this.init(element, options);
    }

    //prototype
    $.fn.tooldownload = function (options) {
        return this.each(function () {
            new $.tooldownload($(this), options);
        });
    };

    //default options
    $.tooldownload.defaultOptions = {
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
