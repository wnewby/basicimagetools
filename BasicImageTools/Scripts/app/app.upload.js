;

/*
 * app.upload
 *
 * creates an iframe with upload controls and submits files to app.routes.upload
 *   the response is expected to have a results array of each successfully uploaded files
 *
 * jQuery style plugin added to $.fn and able to be attached to jQuery objects
 *
 */


(function (app, $, window, document, undefined) {

    $.upload = function (element, options) {

        element.data('upload', this);

        this._elementCache = {
            container: null,
            uploadiFrame: null,
            uploadForm: null,
            fileInput: null,
            submitButton: null,
            hiddenCallback: null,
            hiddenWrapper: null,
            uploadButton: null,
            uploadProgress: null
        };

        //constructor
        this.init = function (element, options) {
            var $self = this;
            $self.options = $.extend({}, $.upload.defaultOptions, options);
            $self._elementCache.container = element;

            element.addClass('ui-upload');
            //temp fix, should use widget class
            //element.addClass('cube');
            //add upload
            
            $self._elementCache.uploadiFrame = $("<iframe>", {
                id: "frameUpload",
                frameborder: 0,
                scrolling: "no",
                'class': 'ui-upload-frame',
                load: function () { _attachUploadForm($self, $(this)); }  //was difficult to get this call right with the iframe loaded
            }).appendTo(element);

            $self._elementCache.uploadProgress = $("<img>", {
                src: "/images/ajax-loader.gif",
                width: "90px",
                css: {
                    display:'none'
                    }
            });

            $self._elementCache.container.prepend($self._elementCache.uploadProgress);

        };

        //PUBLIC METHODS

        this.init(element, options);

    };

    //prototype
    $.fn.upload = function (options) {
        return this.each(function () {
            new $.upload($(this), options);
        });
    };

    //default options
    $.upload.defaultOptions = {
        context: app.routes.upload, 
        recordId: '',
        recordType: '',
        uploadButton: 'Upload',
        //events
        uploadStarted: null,
        uploadFinished: null,
        multiple: true
    };


    //PRIVATE METHODS _
    function _attachUploadForm($self, $iframeControl) {

        //var $self = uploadControl;

        var $frameBody = $iframeControl.contents().find('body');

        var $result = $frameBody.find('#result');
        if ($result.length) {
            //upload finished
            var result = $.parseJSON($result.html());
            //if the loading img is present, remove
            $self._elementCache.uploadiFrame.show();
            $self._elementCache.uploadProgress.hide();

            if ($self.options.uploadFinished) {
                $self.options.uploadFinished.call($self._elementCache.container, result);
            }
        }

        $frameBody.empty();
        //add stylesheet
        $frameBody.css({
            //'background-color': '#c0c0c0'
        });

        $self._elementCache.uploadForm = $('<form>', {
            action: $self.options.context,
            method: 'post',
            enctype: 'multipart/form-data'
        });

        $self._elementCache.submitButton = $('<input>', {
            type: 'submit',
            value: 'upload'
        });

        $self._elementCache.fileInput = $('<input>', {
            type: 'file',
            id: 'files',
            name: 'files'
        });

        //OVERRIDE TO PREVENT SAFARI FROM BEING MULTIPLE DUE TO BROWSER BUG
        //HINT: useragent for chrom has both safari and chrome, so that must be ruled out
        if (($self.options.multiple) && !((navigator.userAgent.indexOf('Chrome') == -1) && (navigator.userAgent.indexOf('Safari') > -1)))
        { $self._elementCache.fileInput.attr('multiple', 'multiple'); }

        $self._elementCache.hiddenCallback = $('<input>', {
            type: 'hidden',
            id: 'recordId',
            name: 'recordId',
            value: $self.options.recordId //revise
        });

        $self._elementCache.hiddenRecordType = $('<input>', {
            type: 'hidden',
            id: 'recordtype',
            name: 'recordtype',
            value: $self.options.recordType //revise
        });

 
        $self._elementCache.hiddenWrapper = $('<div>', {
            css: {
                //'display': 'none'
                'visibility': 'hidden'
            }
        }).append($self._elementCache.fileInput,
            $self._elementCache.hiddenCallback,
            $self._elementCache.hiddenRecordType,
            $self._elementCache.submitButton);

        $self._elementCache.uploadButton = $('<div>', {
            'class': 'ui-widget-upload-button'
        }).append($self.options.uploadButton);

        //temp.  should reference stylesheet
        $self._elementCache.uploadButton.css({
            'cursor': 'pointer',
            'padding-top': '30px',
            'text-align': 'center',
            'vertical-align': 'middle',
            'line-height': '90px;',
            'color': 'white',
            'background-color': '#010131',
            'height': '50px',
            'border-radius': '15px'});

        $self._elementCache.uploadForm.append($self._elementCache.uploadButton, $self._elementCache.hiddenWrapper);


        //bind events
        $self._elementCache.fileInput.change(function () {
            if ($self.options.uploadStarted) {
                $self.options.uploadStarted.call($self);
            }
            else {
                //if no uploadstart was given, default progress bar

                $self._elementCache.uploadiFrame.hide();

                $self._elementCache.uploadProgress.show();
            }
            //$self._elementCache.submitButton.click();
            $self._elementCache.uploadForm.submit();
        });

        $self._elementCache.uploadButton.click(function () { $self._elementCache.fileInput.click(); });


        $frameBody.append($self._elementCache.uploadForm);

    };



})(app || {}, jQuery, window, document);