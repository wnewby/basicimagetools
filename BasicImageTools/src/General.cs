using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Mail;
using System.Web.Mvc;

namespace BasicImageTools.Helpers
{
    public static class General
    {
        /* GetFullPath
         * 
         * if given path is relative, it will be combined with given root 
         * if given root is null or empty, current application directory 
         * will be used
         */
        public static string GetFullPath(string path)
        {
            return GetFullPath(path, "", false);
        }

        public static string GetFullPath(string path, string root)
        {
            return GetFullPath(path, root, false);
        }

        public static string GetFullPath(string path, bool checkExists)
        {
            return GetFullPath(path, "", checkExists);
        }

        public static string GetFullPath(string path, string root, bool checkExists)
        {
            // is the given path absolute?  check for it starting with a drive letter [windows]
            if (!Regex.IsMatch(path, @"^([a-zA-Z]:\\.*)$"))
            {

                if (String.IsNullOrEmpty(root)) { root = HttpContext.Current.Server.MapPath("/"); }

                path = System.IO.Path.Combine(root, path);
                path = System.IO.Path.GetFullPath(path);
            }

            // if we were asked to check that the direct exists, and it does not, try to create it
            if (checkExists)
            {
                if (!Directory.Exists(path))
                {
                    try
                    {
                        Directory.CreateDirectory(path);
                    }
                    catch (Exception ex)
                    {
                        throw (new Exception("Could not create asset path. - " + path, ex));
                    }
                }

            }

            return path;

        }

    }
}