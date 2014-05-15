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
        /* Get File List
         * 
         * Retrieves list of files from path corresponding to recordid
         *
         */
        public List<ImageTools.FileUploadResult> GetFileList(AssetType assetType, string recordId) {
            List<ImageTools.FileUploadResult> fileList = new List<ImageTools.FileUploadResult>();

            string path = GetAssetTypePath(assetType, recordId, true);

            string[] files = Directory.GetFiles(path);

            for (int i = 0; i < files.Length; i++)
            {
                string fileName = files[i];
                fileName = fileName.Substring(fileName.LastIndexOf('\\')+1);
                fileList.Add(new ImageTools.FileUploadResult(true, null, fileName));
            }

            return fileList;

        }

   }

    
}