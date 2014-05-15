using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;


namespace BasicImageTools
{
    public partial class AssetManager
    {
        /* GetOriginalAssetData
         * retreives fileuploaddata which contains byte[].  also joins fileupload to 
         * return meta data
         */
        public byte[] GetAssetData(string fileName, string recordId)
        {
            // TODO, add content type
            string contextType = "";

            AssetManager.AssetType assetType;
            if (!Enum.TryParse<AssetManager.AssetType>(contextType, out assetType)) {assetType = AssetManager.AssetType.User;}

            string path = GetAssetTypePath(assetType, recordId, true);
            path += @"\" + fileName;
            if (!File.Exists(path))
            {
                throw (new Exception("original file not in filesystem"));
            }
            return File.ReadAllBytes(path);

            
        }

    }
}