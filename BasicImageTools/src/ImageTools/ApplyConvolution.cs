using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Web;
using System.Web.Helpers;
//using Ghostscript.NET.Rasterizer;

/*
 * ImageTools
 *
 * Helper class for manipulating images in memory
 * 
 */



namespace BasicImageTools
{
    public static partial class ImageTools
    {

        /*
         * Applies given filter matrix to BitmapData
         * 
         * @see http://en.wikipedia.org/wiki/Kernel_(image_processing)
         * 
         */
        public static void ApplyConvolution(Bitmap image, double[,] filter, double factor, double bias)
        {

            int width = image.Width;
            int height = image.Height;

            int filterSize = filter.GetLength(0);
            int s = filterSize / 2;

            // potential memory issue with extremely large images
            var result = new System.Drawing.Color[image.Width, image.Height];

            // Lock image bits for read/write.
            if (image != null)
            {
                BitmapData pbits = image.LockBits(new System.Drawing.Rectangle(0, 0, width, height),
                                                            ImageLockMode.ReadWrite,
                                                            PixelFormat.Format32bppArgb
                                                            );


                // Declare an array to hold the bytes of the bitmap.
                int bytes = pbits.Stride * height;
                var rgbValues = new byte[bytes];

                // Copy the RGB values into the array.
                Marshal.Copy(pbits.Scan0, rgbValues, 0, bytes);

                int rgb;
                // Fill the color array with the new sharpened color values.
                for (int x = s; x < width - s; x++)
                {
                    for (int y = s; y < height - s; y++)
                    {
                        double red = 0.0, green = 0.0, blue = 0.0, alpha = 0.0;

                        //just leave alpha as it was 
                        //int alphaX = x + s;
                        //int alphaY = y + s;
                        //int alphaPos = (alphaY * pbits.Stride) + alphaY;

                        //alpha = rgbValues[alphaPos + 0];

                        //int a = Math.Min(Math.Max((int)alpha, 0), 255);

                        for (int filterX = 0; filterX < filterSize; filterX++)
                        {
                            for (int filterY = 0; filterY < filterSize; filterY++)
                            {
                                int imageX = (x - s + filterX + width) % width;
                                int imageY = (y - s + filterY + height) % height;

                                rgb = (imageY * pbits.Stride) + 4 * imageX;

                                red += rgbValues[rgb + 2] * filter[filterX, filterY];
                                green += rgbValues[rgb + 1] * filter[filterX, filterY];
                                blue += rgbValues[rgb + 0] * filter[filterX, filterY];
                            }

                            rgb = y * pbits.Stride + 4 * x;


                            int r = Math.Min(Math.Max((int)(factor * red + (bias * rgbValues[rgb + 2])), 0), 255);
                            int g = Math.Min(Math.Max((int)(factor * green + (bias * rgbValues[rgb + 1])), 0), 255);
                            int b = Math.Min(Math.Max((int)(factor * blue + (bias * rgbValues[rgb + 0])), 0), 255);

                            //by ignoring alpha, we leave it as it was for each pixel
                            result[x, y] = System.Drawing.Color.FromArgb(r, g, b);
                        }
                    }
                }

                // Update the image with the sharpened pixels.
                for (int x = s; x < width - s; x++)
                {
                    for (int y = s; y < height - s; y++)
                    {
                        rgb = y * pbits.Stride + 4 * x;

                        rgbValues[rgb + 2] = result[x, y].R;
                        rgbValues[rgb + 1] = result[x, y].G;
                        rgbValues[rgb + 0] = result[x, y].B;
                        //rgbValues[rgb + 0] = result[x, y].A;
                    }
                }

                // Copy the RGB values back to the bitmap.
                Marshal.Copy(rgbValues, 0, pbits.Scan0, bytes);
                // Release image bits.
                image.UnlockBits(pbits);

            }


        }

    }
}