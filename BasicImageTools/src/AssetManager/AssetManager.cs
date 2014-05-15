using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;
using BasicImageTools.Helpers;


namespace BasicImageTools
{

    /*
     * AssemManager handles IO and can be expanded to store previews and/or meta data in a database 
     *
     */

    public partial class AssetManager
    {
        private string AssetPath { get; set; }

        // add additional asset types for multiple domain uploads
        public enum AssetType { User };

        public AssetManager()
        {
            this.AssetPath = General.GetFullPath(ConfigurationManager.AppSettings["AssetPath"], true);
        }
   }
}