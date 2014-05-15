using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web;


namespace BasicImageTools
{
    public partial class AssetManager
    {
        /* Save File
         *
         * Saves an array of assets to their proper location in the filesystem
         *
         * TODO Saves meta data to database or CDN
         * 
         * if file is image type, web friendly thumb is created and saved with
         * meta data in database
         * 
         * HttpPostFileBase[] files - array of files as passed from client through
         *                            .net/iis pipeline
         * AssetType assetType - AssetType enum descripting the context of the file
         *                       as it relates to the system. used as subfolder for
         *                       file system save
         *
         * returns List<ImageTools.FileUploadResult> of saved files so calling function/controller can save
         *         foreign key if needed
         */
        public List<ImageTools.FileUploadResult> SaveFile(HttpPostedFileBase[] files, AssetType assetType, string recordId) {
            List<ImageTools.FileUploadResult> newFiles = new List<ImageTools.FileUploadResult>();

            foreach (HttpPostedFileBase file in files)
            {
                byte[] fileData = new byte[file.ContentLength];
                file.InputStream.Read(fileData, 0, file.ContentLength);

                newFiles.Add(SaveFile(fileData, assetType, file.ContentType, file.FileName, recordId));
            }


            return newFiles;

        }

        public ImageTools.FileUploadResult SaveFile(byte[] fileData, AssetType assetType, string contentType, string fileName, string recordId) {

            string path = GetAssetTypePath(assetType, recordId, true); 

            // save raw/highres to filesytem
            File.WriteAllBytes(path + @"\" + fileName, fileData);

            // UNCOMMENT TO CREATE STATIC THUMB VERSION

            // if image, create web friendly version.
            //if (contentType.Contains("image")) //maybe a better way to check than this?
            //{
            //    int imageWebLargestDimension = Int32.Parse(ConfigurationManager.AppSettings["ImageWebLargestDimension"].ToString());

            //    byte[] webVersion = Helpers.ImageTools.ResizeImage(fileData, imageWebLargestDimension, imageWebLargestDimension);
            //    if (contentType.Contains("tif")) // catch both tiff and tif content type
            //    {
            //        webVersion = ImageTools.ConvertTiffToPNG(webVersion);
            //        // change content type
            //        fileName = fileName.Substring(0, fileName.LastIndexOf('.')) + ".png";
            //    }

            //    fileName = fileName.Replace(".", "_thumb.");

            //    File.WriteAllBytes(path + @"\" + fileName, webVersion);
            //}

            return (new ImageTools.FileUploadResult(true, 1, fileName));

        }

        public ImageTools.FileUploadResult SaveFile(Image image, AssetType assetType, string contentType, string fileName, string recordId) {

            string path = GetAssetTypePath(assetType, recordId, true); 

            image.Save(path + @"\" + fileName);

            return (new ImageTools.FileUploadResult(true, 1, fileName));

        }
   }

    
}