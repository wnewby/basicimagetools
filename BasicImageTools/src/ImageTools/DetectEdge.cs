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

/*ImageTools
 * 
 * Helper class for manipulating images in memory
 * 
 * 
 */



namespace BasicImageTools
{
    public static partial class ImageTools
    {
        public static void DetectEdge(Bitmap image, double strength)
        {
            var filter = new double[,]
                    {
                    {0, 1, 0},
                    {1, -4, 1},
                    {0, 1, 0}
                    };

            double factor = 1.0;
            double bias = 1.0 - strength;

            ApplyConvolution(image, filter, factor, bias);
        }

    }
}