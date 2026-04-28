import Foundation
import Capacitor
import Photos
import UIKit

/**
 * Native photo-library bridge for iOS.
 *
 * Uses Photos framework (PHAsset) to enumerate the user's library and to fetch
 * thumbnails / full-resolution image data on demand. Authorization supports
 * the iOS 14+ "limited" mode where the user picks a subset of assets.
 *
 * Registered with Capacitor via PhotoLibraryPlugin.m so JS can call:
 *   PhotoLibrary.checkPermission(), .requestPermission(),
 *   .listAssets({ sinceMs, limit }),
 *   .getThumbnail({ id, size }),
 *   .getAssetData({ id, maxEdge }).
 */
@objc(PhotoLibraryPlugin)
public class PhotoLibraryPlugin: CAPPlugin {

    private let imageManager = PHCachingImageManager()
    private let queue = DispatchQueue(label: "com.magnusjerono.photolibrary", qos: .userInitiated)

    // MARK: - Permission

    private func mapStatus(_ status: PHAuthorizationStatus) -> String {
        switch status {
        case .authorized: return "granted"
        case .limited:    return "limited"
        case .denied, .restricted: return "denied"
        case .notDetermined: return "prompt"
        @unknown default: return "prompt"
        }
    }

    @objc public func checkPermission(_ call: CAPPluginCall) {
        let status: PHAuthorizationStatus
        if #available(iOS 14, *) {
            status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        } else {
            status = PHPhotoLibrary.authorizationStatus()
        }
        call.resolve(["status": mapStatus(status)])
    }

    @objc public func requestPermission(_ call: CAPPluginCall) {
        let handler: (PHAuthorizationStatus) -> Void = { [weak self] status in
            guard let self = self else { return }
            call.resolve(["status": self.mapStatus(status)])
        }
        if #available(iOS 14, *) {
            PHPhotoLibrary.requestAuthorization(for: .readWrite, handler: handler)
        } else {
            PHPhotoLibrary.requestAuthorization(handler)
        }
    }

    // MARK: - Listing

    @objc public func listAssets(_ call: CAPPluginCall) {
        let sinceMs = call.getDouble("sinceMs") ?? (Date().timeIntervalSince1970 * 1000 - 30.0 * 86400.0 * 1000.0)
        let limit = call.getInt("limit") ?? 1000

        queue.async {
            let options = PHFetchOptions()
            options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
            let sinceDate = Date(timeIntervalSince1970: sinceMs / 1000.0)
            options.predicate = NSPredicate(format: "creationDate >= %@ AND mediaType = %d",
                                            sinceDate as NSDate,
                                            PHAssetMediaType.image.rawValue)
            options.fetchLimit = limit

            let result = PHAsset.fetchAssets(with: options)
            var assets: [[String: Any]] = []
            assets.reserveCapacity(result.count)
            result.enumerateObjects { asset, _, _ in
                var entry: [String: Any] = [
                    "id": asset.localIdentifier,
                    "createdAt": (asset.creationDate?.timeIntervalSince1970 ?? 0) * 1000.0,
                    "width": asset.pixelWidth,
                    "height": asset.pixelHeight,
                    "mimeType": "image/jpeg",
                ]
                if let loc = asset.location {
                    entry["latitude"] = loc.coordinate.latitude
                    entry["longitude"] = loc.coordinate.longitude
                }
                assets.append(entry)
            }
            call.resolve(["assets": assets])
        }
    }

    // MARK: - Image data

    private func fetchAsset(_ id: String) -> PHAsset? {
        let result = PHAsset.fetchAssets(withLocalIdentifiers: [id], options: nil)
        return result.firstObject
    }

    @objc public func getThumbnail(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("Missing id")
            return
        }
        let size = CGFloat(call.getInt("size") ?? 256)
        guard let asset = fetchAsset(id) else {
            call.reject("Asset not found: \(id)")
            return
        }
        let target = CGSize(width: size, height: size)
        let opts = PHImageRequestOptions()
        opts.deliveryMode = .opportunistic
        opts.resizeMode = .fast
        opts.isSynchronous = false
        opts.isNetworkAccessAllowed = true

        imageManager.requestImage(for: asset,
                                  targetSize: target,
                                  contentMode: .aspectFill,
                                  options: opts) { image, info in
            // PhotoKit may invoke this twice (low-res then high-res); ignore the
            // degraded one so we resolve with a final result.
            if let degraded = info?[PHImageResultIsDegradedKey] as? Bool, degraded {
                return
            }
            guard let img = image,
                  let data = img.jpegData(compressionQuality: 0.85) else {
                call.reject("Failed to render thumbnail")
                return
            }
            call.resolve(["base64": data.base64EncodedString()])
        }
    }

    @objc public func getAssetData(_ call: CAPPluginCall) {
        guard let id = call.getString("id") else {
            call.reject("Missing id")
            return
        }
        let maxEdge = CGFloat(call.getInt("maxEdge") ?? 2048)
        guard let asset = fetchAsset(id) else {
            call.reject("Asset not found: \(id)")
            return
        }
        let target = CGSize(width: maxEdge, height: maxEdge)
        let opts = PHImageRequestOptions()
        opts.deliveryMode = .highQualityFormat
        opts.resizeMode = .exact
        opts.isSynchronous = false
        opts.isNetworkAccessAllowed = true

        imageManager.requestImage(for: asset,
                                  targetSize: target,
                                  contentMode: .aspectFit,
                                  options: opts) { image, info in
            if let degraded = info?[PHImageResultIsDegradedKey] as? Bool, degraded {
                return
            }
            guard let img = image,
                  let data = img.jpegData(compressionQuality: 0.85) else {
                call.reject("Failed to render asset")
                return
            }
            call.resolve([
                "base64": data.base64EncodedString(),
                "mimeType": "image/jpeg",
                "width": img.size.width,
                "height": img.size.height,
            ])
        }
    }
}
