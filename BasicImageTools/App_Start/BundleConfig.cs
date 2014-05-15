using System.Web;
using System.Web.Optimization;

namespace BasicImageTools
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));


            //bundles.Add(new ScriptBundle("~/bundles/app.routes").Include(
            //    ));
            bundles.Add(new ScriptBundle("~/bundles/app").IncludeDirectory("~/Scripts/library", "*.js").Include(
                        "~/Scripts/app/app.api.routes.js",
                        "~/Scripts/app/app.upload.js",
                        "~/Scripts/app/app.workarea.js",
                        "~/Scripts/app/app.browser.js",
                        "~/Scripts/app/app.imageasset.js",
                        "~/Scripts/app/app.toolbase.crop.js",
                        "~/Scripts/app/app.toolbase.delete.js",
                        "~/Scripts/app/app.toolbase.download.js",
                        "~/Scripts/app/app.toolbase.filter.js",
                        "~/Scripts/app/app.toolbase.resize.js",
                        "~/Scripts/app/app.toolbase.rotate.js",
                        "~/Scripts/app/app.toolbar.js",
                        "~/Scripts/app/app.js"
                        ));
            bundles.Add(new StyleBundle("~/Content/css").Include(
                "~/Content/site.css",
                "~/Content/jquery.qtip.css",
                "~/Content/imgareaselect-animated.css",
                "~/Content/imgareaselect-default.css",
                "~/Content/BasicImageTools.css"));

        }
    }
}