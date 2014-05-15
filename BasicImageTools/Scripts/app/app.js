;

/* app
 *
 * main entry point. sets up gallery, upload controls, and main work area
 *
 */

var app = app || {};

(function (app, $, document, window, undefined) {
	var $self = {},
		localCache = {
			assets: []
		};

	//CONSTRUCTOR
	var init = function () {

		//load user gallery

		$.getJSON(app.routes.gallery, _uploadUpdate);

		//upload controls
		localCache.gallery = $('#gallery');

		localCache.uploadcontrol = $("<div>").upload({
			uploadFinished: _uploadUpdate,
			uploadButton: "Upload",
			multiple: true 
		});

		localCache.gallery.append(localCache.uploadcontrol);

		localCache.workarea = $('#workarea').workarea({
			width: '100%',
			height: _getWorkAreaHeight()
		});


		$(window).resize(function () {
			localCache.workarea.setHeight(_getWorkAreaHeight());
		});
	};

	//PRIVATE 
	
	/*
	 * get the available height for the workarea
	 *		(total available visible window) - (gallery height)
	 *      - magic buffer number (should be defined in config or calulated)
	 */
	var _getWorkAreaHeight = function () {
		return $(window).height() - localCache.gallery.height() - 200;
	}

	var _uploadUpdate = function (files) {
		$.each(files, function () {
			localCache.assets.push(new app.imageasset({
				container: localCache.gallery,
				id: this.fileUploadId,
				filename: this.fileName,
				path: this.path,
				thumbpath: this.thumb,
				load: function (asset) {
					localCache.gallery.append(localCache.uploadcontrol);
					localCache.workarea.setHeight(_getWorkAreaHeight());
				},
				click: function (asset) {
					localCache.workarea.addImageAsset(asset);
				}
			}));
		});
	}


	//call init
	init();

	return $self;
})(app, jQuery, document, window);