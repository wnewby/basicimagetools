using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

using System.Runtime.Serialization.Json;
using System.Text;
using System.Web.Helpers;
using BasicImageTools;
using BasicImageTools.Helpers;

namespace BasicImageTools.Controllers
{   
    /*
     * FileUploadsController
     * 
     * MVC endpoints for local application
     * 
     * 
     */
    public class FileUploadsController : Controller
    {

        public FileUploadsController()
        {
        }


        //
        // POST: /FileUploads/Create

        [HttpPost]
        public ActionResult Create(HttpPostedFileBase[] files)
        { return Upload(files); }

        

        [HttpPost]
        public ActionResult Upload(HttpPostedFileBase[] files)
        {
            string recordId = "";
            string context = "";
            string recordType = ""; 

            if (!String.IsNullOrEmpty(Request.Form["context"]))
            {
                context = Request.Form["context"];
            }
            if (!String.IsNullOrEmpty(Request.Form["recordtype"]))
            {
                recordType = Request.Form["recordtype"];
            }


            if (files.Count() > 0)
            {
                AssetManager assman = new AssetManager();
                AssetManager.AssetType assetType;
                if (!Enum.TryParse<AssetManager.AssetType>(recordType, out assetType)) {assetType = AssetManager.AssetType.User;}

                if (assetType == AssetManager.AssetType.User) {
                    recordId = this.HttpContext.Request.AnonymousID;
                }

                List<ImageTools.FileUploadResult> newFiles = assman.SaveFile(files, assetType, recordId);

                DataContractJsonSerializer ser = new DataContractJsonSerializer(typeof(List<ImageTools.FileUploadResult>));
                using (MemoryStream ms = new MemoryStream())
                {
                    ser.WriteObject(ms, newFiles);
                    ViewBag.Result = "<div type='hidden' id='result' name='result'>" + Encoding.Default.GetString(ms.ToArray()) + "</div>";
                    return View();

                }
            }
            else
            {
                return View();
            }
        }

        //
        //Get FileUpload File
        //
        [CacheFilter(Duration=99999)]
        [CompressFilter]
        public ActionResult GetFile(string fileName, bool? thumb, int? rotation, int? width, int? height, bool? highres)
        {
            string recordId = this.HttpContext.Request.AnonymousID;
            AssetManager assman = new AssetManager();
            byte[] returnFile;
            string contentType;

            byte[] fileData = assman.GetAssetData(fileName, recordId);
            if (fileData == null) { return null; }
            returnFile = fileData;


            if (rotation.GetValueOrDefault(0) != 0)
            {
                returnFile = ImageTools.RotateImage(returnFile, rotation.Value);
            }

            if (thumb.GetValueOrDefault(false)) 
            {
                returnFile = ImageTools.ThumbnailImage(returnFile);
            }

            // TODO get content type from file extention
            return File(returnFile, General.GetContentType(""));
        }
        
        //
        // Download File
        // returns byte[] with proper headers for trigger download
        [HttpGet]
        public ActionResult DownloadFile(string fileName)
        {

            string recordId = this.HttpContext.Request.AnonymousID;
            AssetManager assman = new AssetManager();
            byte[] returnFile;
            string contentType;

            byte[] fileData = assman.GetAssetData(fileName, recordId);

            return File(fileData, "application/octet-stream", fileName);
        }

        //
        // Make Crop
        // Creates Crop of Image in FileUpload, saves as new record, returns id
        [HttpGet]
        public ActionResult CropImage(string fileName, int x1, int x2, int y1, int y2, int scaleWidth, int scaleHeight, int? rotation, string src)
        {
            string recordId = this.HttpContext.Request.AnonymousID;

            ImageTools.FileUploadResult result = new ImageTools.FileUploadResult();

            AssetManager assman = new AssetManager();

            byte[] fileData = assman.GetAssetData(fileName, recordId);

            if (rotation.GetValueOrDefault(0) == 0) { rotation = null; }

            byte[] returnFile = ImageTools.CropImage(fileData, x1, x2, y1, y2, scaleWidth, scaleHeight, rotation);
            

            result = assman.SaveFile(returnFile, AssetManager.AssetType.User, General.GetContentType(""), fileName, recordId);
            return Json(result, JsonRequestBehavior.AllowGet);
        }

        //
        // Rotate
        //
        [HttpGet]
        public ActionResult RotateImage(string fileName, int rotation)
        {
            
            string recordId = this.HttpContext.Request.AnonymousID;

            ImageTools.FileUploadResult result = new ImageTools.FileUploadResult();

            AssetManager assman = new AssetManager();

            byte[] fileData = assman.GetAssetData(fileName, recordId);

            byte[] returnFile = ImageTools.RotateImage(fileData, rotation);

            result = assman.SaveFile(returnFile, AssetManager.AssetType.User, General.GetContentType(""), fileName, recordId);

            return Json(result, JsonRequestBehavior.AllowGet);
        }

        //
        // Filter - Sharpen
        //
        // should use enum or specific route for filter
        // current filters:
        //  sharpen
        //  emboss
        //  blur
        //  detectedge
        [HttpGet]
        public ActionResult FilterImage(string fileName, string filtername)
        {

            string recordId = this.HttpContext.Request.AnonymousID;

            ImageTools.FileUploadResult result = new ImageTools.FileUploadResult();

            AssetManager assman = new AssetManager();

            byte[] fileData = assman.GetAssetData(fileName, recordId);
            using (Stream s = new MemoryStream(fileData))
            {
                using (Image image = Image.FromStream(s))
                {
                    switch (filtername.ToLower().Trim()) {
                        case "sharpen":  ImageTools.SharpenImage(image as Bitmap, 1); break;
                        case "emboss":  ImageTools.EmbossImage(image as Bitmap, 1); break;
                        case "blur":  ImageTools.BlurImage(image as Bitmap, 1); break;
                        case "detectedge":  ImageTools.DetectEdge(image as Bitmap, 1); break;
                    }
                    result = assman.SaveFile(image, AssetManager.AssetType.User, General.GetContentType(""), fileName, recordId);
                }
            }

            return Json(result, JsonRequestBehavior.AllowGet);
            //ImageTools
        }

        //
        // GerUserGallery
        // sessions are based on long term anonymous id stored in cookie.  this guid is used to id users and create individual stores. 
        // NOT SECURE ENOUGH FOR A PRODUCTION APPLICATION
        [HttpGet]
        public ActionResult GetUserGallery()
        {
            string recordId = this.HttpContext.Request.AnonymousID;

            List<ImageTools.FileUploadResult> newFiles = new List<ImageTools.FileUploadResult>();
            AssetManager assman = new AssetManager();

            newFiles = assman.GetFileList(AssetManager.AssetType.User, recordId);

            return Json(newFiles, JsonRequestBehavior.AllowGet);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing) {
                // dispose stuff
            }
            base.Dispose(disposing);
        }


    }
}

