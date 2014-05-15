;

/*
 * app.imageasset
 *
 * turns a mild mannered img into an obj used for displaying the clickable thumb like and holds a bit of meta data about the image
 */

var app = app || {};

(function (app, $, window, document, undefined) {

    app.imageasset = function (options) {
        var $self = {},
            localCache = {
                thumbContainer: null,
                thumbImage: null
            },
            // fileUploadResult object could remain rather than breaking out into variables.  at least the act of processing the result should happen in one location
            defaultOptions = {
                container: null,
                id: '',
                filename: '',
                path: '',
                thumbpath: '',
                //events
                load: null,
                click: null
            }

        // CONSTRUCTOR
        var init = function (options) {
            $self.options = $.extend({}, defaultOptions, options);

            _createThumb();

            $self.options.container.append(localCache.thumbContainer);
        };

        // PUBLIC METHODS
        $self.getPath = function () {
            return $self.options.path;
        }

        $self.getFileName = function () {
            return $self.options.filename;
        }

        $self.getElement = function () {
            return localCache.thumbContainer;
        }

        $self.getImageElement = function () {
            return localCache.thumbImage;
        }

        $self.setNewImage = function (file) {
            $self.options.path = file.path;
            $self.options.thumbpath = file.thumb;
            $self.options.filename = file.fileName;
            $self.options.id = file.fileUploadId;

            localCache.thumbImage.attr('alt', $self.options.filename);
            localCache.thumbImage.attr('src', $self.options.thumbpath);
        }

        //PRIVATE METHODS _

        /*
         * Creates elements for thumbnail
         */
        function _createThumb() {
            localCache.thumbContainer = $('<div>', {
                'class': 'ui-imageasset',
                css: {
                    'display': 'none'
                }
            }),

            localCache.thumbImage = $('<img>', {
                src: $self.options.thumbpath, 
                alt: $self.options.filename,
                'data-fileid': $self.options.id,
                height: '100px'
            }).load(function () {
                if ($self.options.load) {
                    $self.options.load($self);
                }
                localCache.thumbContainer.fadeIn(2000);
            }).click(function () {
                if ($self.options.click) {
                    $self.options.click($self);
                }
            });

            return localCache.thumbContainer.append(localCache.thumbImage);
        }

        init(options);

        return $self;

}


})(app || {}, jQuery, window, document );