;

/* app.api.routes
 * 
 * defines endpoints for image tools.
 * calling methods are required to understand required parameters as this is not a proper implementation of a hypermedia api
 *
 */


var app = app || {};

app.routes = {
	gallery: '/FileUploads/GetUserGallery',
	upload: '/FileUploads/Upload',
	crop : '/FileUploads/CropImage',
	filter: '/FileUploads/FilterImage',
	rotate: '/FileUploads/RotateImage',
	download: '/FileUploads/DownloadFile'
}