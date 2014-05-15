using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using BasicImageTools.Helpers;


namespace BasicImageTools
{
    public partial class AssetManager
    {
        /* GetAssetTypePath
         * returns full path for saving asset to file system based on assettype enum
         * Microsoft advices against getting name from enum and instead suggests using
         * a switch and explicity returning string.  
         * 
         * this probably could be abstracted to make paths managaged in config file
         */
        private string GetAssetTypePath(AssetType assetType, string recordId, bool checkDirectory)
        {
            string path = GetAssetTypeName(assetType);

            path = General.GetFullPath(path, AssetPath, checkDirectory);

            return General.GetFullPath(recordId, path, checkDirectory);
        }

        private string GetAssetTypeName(AssetType assetType)
        {
            string assetName = "";
            switch (assetType)
            {
                case AssetType.User: assetName = "User"; break;
            }

            return assetName;
        }
    }
}