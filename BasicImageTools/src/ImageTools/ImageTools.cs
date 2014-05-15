using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Helpers;
//using Ghostscript.NET.Rasterizer;

/*ImageTools
 * 
 * Helper class for manipulating images in memory
 * 
 * RoateImage(byte[] fileData)
 * ThumnailImage(byte[] fileData) 
 * CropImage(byte[] fileData, int x1, int x2, int y1, int y2, int scaleWidth, int scaleHeight)
 * 
 * FileUpdateResult //Seralizable Class for JSON return;
 * 
 */



namespace BasicImageTools
{
    public static partial class ImageTools
    {
       
        public static byte[] RotateImage(byte[] fileData, int? degreesRotation)
        {
            RotateFlipType rotation;

            switch (degreesRotation.GetValueOrDefault(90))
            {
                case 180: rotation = RotateFlipType.Rotate180FlipNone; break;
                case 270: rotation = RotateFlipType.Rotate270FlipNone; break;
                default: rotation = RotateFlipType.Rotate90FlipNone; break;

            }

            using (MemoryStream ms = new MemoryStream(fileData))
            {

                using (Image imgOriginal = Image.FromStream(ms))
                {
                                        
                    imgOriginal.RotateFlip(rotation);
                    using (MemoryStream finalMS = new MemoryStream())
                    {
                        imgOriginal.Save(finalMS, System.Drawing.Imaging.ImageFormat.Png);
                        return finalMS.ToArray();
                    }
                }
            }
        }

        public static Image RotateImage(Image original, int? degreesRotation)
        {
            RotateFlipType rotation;

            switch (degreesRotation.GetValueOrDefault(90))
            {
                case 180: rotation = RotateFlipType.Rotate180FlipNone; break;
                case 270: rotation = RotateFlipType.Rotate270FlipNone; break;
                default: rotation = RotateFlipType.Rotate90FlipNone; break;

            }

            original.RotateFlip(rotation);
            return original;
        }

        public static byte[] ThumbnailImage(byte[] fileData)
        {
            return ResizeImage(fileData, 200, 200);
        }

        public static byte[] ResizeImage(byte[] fileData, int maxWidth, int maxHeight)
        {
            return new WebImage(fileData).Resize(maxWidth, maxHeight, true, true).Crop(1, 1).GetBytes();
        }


        public static Bitmap ResizeImage(Image imgToResize, Size size)
        {
           // try
           // {
                //using (Bitmap b = new Bitmap(size.Width, size.Height))
                Bitmap b = new Bitmap(size.Width, size.Height);
                //{
                    b.SetResolution(imgToResize.HorizontalResolution, imgToResize.VerticalResolution);
                    using (Graphics g = Graphics.FromImage((System.Drawing.Image)b))
                    {
                        g.InterpolationMode = System.Drawing.Drawing2D.InterpolationMode.HighQualityBicubic;
                        g.DrawImage(imgToResize, 0, 0, size.Width, size.Height);
                    }
                    return b;
                //}
            // }
            // catch { }

            //return null;
        }

        //public static Bitmap ResizeImage(Image imgToResize, Size size)
        //{
        //    try
        //    {
        //        return new Bitmap(imgToResize, size);
        //    }
        //    catch { }

        //    return null;
        //}

        public static byte[] ConvertTiffToPNG(byte[] fileData)
        {
            using (MemoryStream msTiff = new MemoryStream(fileData))
            {
                using (MemoryStream msPng = new MemoryStream())
                {
                    Bitmap.FromStream(msTiff).Save(msPng, System.Drawing.Imaging.ImageFormat.Png);
                    return msPng.ToArray();
                }
            }
        }

        public static byte[] CropImage(byte[] fileData, int x1, int x2, int y1, int y2, int scaleWidth, int scaleHeight)
        {
            return CropImage(fileData, x1, x2, y1, y2, scaleWidth, scaleHeight, null);
        }

        public static byte[] CropImage(byte[] fileData, int x1, int x2, int y1, int y2, int scaleWidth, int scaleHeight, int? rotation)
        {
            byte[] returnFile;
            
            if (rotation.HasValue)
            {
                fileData = ImageTools.RotateImage(fileData, rotation.Value);
            }

            using (MemoryStream ms = new MemoryStream(fileData))
            {

                using (Image imgOriginal = Image.FromStream(ms))
                {
                    int width = 0;
                    int height = 0;

                    //rectangle outer corner cannot fall on x/y axis nor be equal to the cords of the first point.  
                    //this would result in no image after crop.  so just return original
                    if (x2 == 0 || y2 == 0 || x1 == x2 || y1 == y2)
                    {
                        return fileData;
                    }

                    //scale points?  
                    //image on client side might be different size so points will need moved for our original image

                    if (scaleWidth != 0 && scaleHeight != 0)
                    {
                        double scaleX = (double)imgOriginal.Width / scaleWidth;
                        double scaleY = (double)imgOriginal.Height / scaleHeight;

                        x1 = Convert.ToInt32(x1 * scaleX);
                        x2 = Convert.ToInt32(x2 * scaleX);
                        y1 = Convert.ToInt32(y1 * scaleY);
                        y2 = Convert.ToInt32(y2 * scaleY);

                    }

                    width = x2 - x1;
                    height = y2 - y1;

                    using (Bitmap imgCropped = new Bitmap(width, height))
                    {
                        imgCropped.SetResolution(imgOriginal.HorizontalResolution, imgOriginal.VerticalResolution);
                        //imgCropped.SetResolution(72f, 72f);

                        Rectangle cropRec = new Rectangle(x1, y1, width, height);


                        using (Graphics gclipper = Graphics.FromImage(imgCropped))
                        {
                            gclipper.DrawImage(imgOriginal, new Rectangle(0, 0, width, height),
                                cropRec,
                                GraphicsUnit.Pixel);
                        }

                        using (MemoryStream croppedMS = new MemoryStream())
                        {
                        
                            imgCropped.Save(croppedMS, System.Drawing.Imaging.ImageFormat.Jpeg);
                            returnFile = croppedMS.ToArray();
                        }

                        //could be more efficient by not rotating entire image
                        if (rotation.HasValue)
                        {
                            returnFile = ImageTools.RotateImage(returnFile, 360 - rotation.Value);
                        }

                        return returnFile;
                    }
                }
            }
        }

        public static Image CropImage(Image original, int x, int y, int width, int height)
        {
            Rectangle cropRec = new Rectangle(x, y, width, height);

            Bitmap imgCropped = new Bitmap(width, height);
            using (Graphics g = Graphics.FromImage(imgCropped))
            {
                g.DrawImage(original, new Rectangle(0, 0, width, height), cropRec, GraphicsUnit.Pixel); 
            }

            return imgCropped;
        }

        public static void GetPdfImage()
        {
            //GhostscriptRasterizer rasterizer = new GhostscriptRasterizer();
            //Image img = rasterizer.GetPage(300, 300, 1);
        }




        public class FileUploadResult
        {
            private string defaultContext = "/FileUploads/GetFile?fileName=";
            public bool success { get; set; }
            public int fileUploadId { get; set; }
            public string fileName { get; set; }
            public string path
            {
                set { }
                get
                {
                    return defaultContext + fileName;
                }
            }

            public string thumb
            {
                set { }
                get
                {
                    return path + "&thumb=true";
                }
            }

            public FileUploadResult() { }

            public FileUploadResult(bool success, int? fileUploadId, string fileName) : this(success, fileUploadId, fileName, "") { }


            public FileUploadResult(bool success, int? fileUploadId, string fileName, string context)
            {
                if (!String.IsNullOrEmpty(context)) { this.defaultContext = context; }
                this.success = success;
                this.fileName = fileName;
                if (fileUploadId.HasValue) { this.fileUploadId = fileUploadId.Value; }
            }
        }
    }
}