#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

// Capacitor plugin registration. The Swift class is exposed to JavaScript
// via the CAP_PLUGIN macro; method names must match those called from
// src/lib/photo-library/index.ts.
CAP_PLUGIN(PhotoLibraryPlugin, "PhotoLibrary",
    CAP_PLUGIN_METHOD(checkPermission, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(requestPermission, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(listAssets, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getThumbnail, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(getAssetData, CAPPluginReturnPromise);
)
