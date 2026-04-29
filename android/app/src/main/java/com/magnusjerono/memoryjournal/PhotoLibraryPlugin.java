package com.magnusjerono.memoryjournal;

import android.Manifest;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import org.json.JSONException;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;

/**
 * Native photo-library bridge for Android.
 *
 * Uses MediaStore.Images to enumerate the gallery and ContentResolver to load
 * thumbnails / scaled full-size images. Permission alias "photos" maps to
 * READ_MEDIA_IMAGES on API 33+ and READ_EXTERNAL_STORAGE on older devices.
 */
@CapacitorPlugin(
        name = "PhotoLibrary",
        permissions = {
                @Permission(alias = "photos", strings = { Manifest.permission.READ_MEDIA_IMAGES }),
                @Permission(alias = "photosLegacy", strings = { Manifest.permission.READ_EXTERNAL_STORAGE })
        }
)
public class PhotoLibraryPlugin extends Plugin {

    private String permissionAlias() {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU ? "photos" : "photosLegacy";
    }

    private String mapState(PermissionState state) {
        switch (state) {
            case GRANTED: return "granted";
            case DENIED: return "denied";
            case PROMPT: return "prompt";
            default: return "prompt";
        }
    }

    @PluginMethod
    public void checkPermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("status", mapState(getPermissionState(permissionAlias())));
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (getPermissionState(permissionAlias()) == PermissionState.GRANTED) {
            JSObject result = new JSObject();
            result.put("status", "granted");
            call.resolve(result);
            return;
        }
        requestPermissionForAlias(permissionAlias(), call, "permissionCallback");
    }

    @PermissionCallback
    private void permissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("status", mapState(getPermissionState(permissionAlias())));
        call.resolve(result);
    }

    @PluginMethod
    public void listAssets(PluginCall call) {
        if (getPermissionState(permissionAlias()) != PermissionState.GRANTED) {
            call.reject("Photo library permission not granted");
            return;
        }
        long sinceMs = call.getLong("sinceMs", System.currentTimeMillis() - 30L * 24 * 60 * 60 * 1000);
        int limit = call.getInt("limit", 1000);

        ContentResolver resolver = getContext().getContentResolver();
        Uri collection = MediaStore.Images.Media.EXTERNAL_CONTENT_URI;

        String[] projection = new String[] {
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DATE_TAKEN,
                MediaStore.Images.Media.DATE_ADDED,
                MediaStore.Images.Media.WIDTH,
                MediaStore.Images.Media.HEIGHT,
                MediaStore.Images.Media.LATITUDE,
                MediaStore.Images.Media.LONGITUDE,
                MediaStore.Images.Media.MIME_TYPE,
        };
        String selection = MediaStore.Images.Media.DATE_TAKEN + " >= ?";
        String[] selectionArgs = new String[] { String.valueOf(sinceMs) };
        String sortOrder = MediaStore.Images.Media.DATE_TAKEN + " DESC LIMIT " + limit;

        JSArray assets = new JSArray();
        try (Cursor cursor = resolver.query(collection, projection, selection, selectionArgs, sortOrder)) {
            if (cursor == null) {
                JSObject empty = new JSObject();
                empty.put("assets", assets);
                call.resolve(empty);
                return;
            }
            int idCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID);
            int dateCol = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATE_TAKEN);
            int dateAddedCol = cursor.getColumnIndex(MediaStore.Images.Media.DATE_ADDED);
            int wCol = cursor.getColumnIndex(MediaStore.Images.Media.WIDTH);
            int hCol = cursor.getColumnIndex(MediaStore.Images.Media.HEIGHT);
            int latCol = cursor.getColumnIndex(MediaStore.Images.Media.LATITUDE);
            int lonCol = cursor.getColumnIndex(MediaStore.Images.Media.LONGITUDE);
            int mimeCol = cursor.getColumnIndex(MediaStore.Images.Media.MIME_TYPE);

            while (cursor.moveToNext()) {
                long id = cursor.getLong(idCol);
                long dateTaken = cursor.isNull(dateCol) ? 0 : cursor.getLong(dateCol);
                if (dateTaken == 0 && dateAddedCol >= 0 && !cursor.isNull(dateAddedCol)) {
                    dateTaken = cursor.getLong(dateAddedCol) * 1000L;
                }
                JSObject obj = new JSObject();
                obj.put("id", String.valueOf(id));
                obj.put("createdAt", dateTaken);
                if (wCol >= 0 && !cursor.isNull(wCol)) obj.put("width", cursor.getInt(wCol));
                if (hCol >= 0 && !cursor.isNull(hCol)) obj.put("height", cursor.getInt(hCol));
                if (latCol >= 0 && !cursor.isNull(latCol)) {
                    double lat = cursor.getDouble(latCol);
                    if (lat != 0) obj.put("latitude", lat);
                }
                if (lonCol >= 0 && !cursor.isNull(lonCol)) {
                    double lon = cursor.getDouble(lonCol);
                    if (lon != 0) obj.put("longitude", lon);
                }
                if (mimeCol >= 0 && !cursor.isNull(mimeCol)) obj.put("mimeType", cursor.getString(mimeCol));
                assets.put(obj);
            }
        } catch (JSONException e) {
            call.reject("Failed to assemble assets", e);
            return;
        }

        JSObject result = new JSObject();
        result.put("assets", assets);
        call.resolve(result);
    }

    private Uri uriFor(String id) {
        try {
            return ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, Long.parseLong(id));
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Bitmap loadScaledBitmap(Uri uri, int maxEdge) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        BitmapFactory.Options bounds = new BitmapFactory.Options();
        bounds.inJustDecodeBounds = true;
        try (InputStream is = resolver.openInputStream(uri)) {
            BitmapFactory.decodeStream(is, null, bounds);
        }
        int sample = 1;
        int longest = Math.max(bounds.outWidth, bounds.outHeight);
        while (longest / sample > maxEdge * 2) {
            sample *= 2;
        }
        BitmapFactory.Options opts = new BitmapFactory.Options();
        opts.inSampleSize = sample;
        Bitmap raw;
        try (InputStream is = resolver.openInputStream(uri)) {
            raw = BitmapFactory.decodeStream(is, null, opts);
        }
        if (raw == null) throw new Exception("Could not decode bitmap");
        float scale = Math.min(1f, (float) maxEdge / Math.max(raw.getWidth(), raw.getHeight()));
        if (scale < 1f) {
            int w = Math.round(raw.getWidth() * scale);
            int h = Math.round(raw.getHeight() * scale);
            Bitmap scaled = Bitmap.createScaledBitmap(raw, w, h, true);
            if (scaled != raw) raw.recycle();
            return scaled;
        }
        return raw;
    }

    private String encodeJpeg(Bitmap bitmap) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, out);
        byte[] bytes = out.toByteArray();
        return Base64.encodeToString(bytes, Base64.NO_WRAP);
    }

    @PluginMethod
    public void getThumbnail(PluginCall call) {
        String id = call.getString("id");
        if (id == null) { call.reject("Missing id"); return; }
        int size = call.getInt("size", 256);
        Uri uri = uriFor(id);
        if (uri == null) { call.reject("Invalid id"); return; }
        try {
            Bitmap bm = loadScaledBitmap(uri, size);
            String b64 = encodeJpeg(bm);
            bm.recycle();
            JSObject result = new JSObject();
            result.put("base64", b64);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to render thumbnail", e);
        }
    }

    @PluginMethod
    public void getAssetData(PluginCall call) {
        String id = call.getString("id");
        if (id == null) { call.reject("Missing id"); return; }
        int maxEdge = call.getInt("maxEdge", 2048);
        Uri uri = uriFor(id);
        if (uri == null) { call.reject("Invalid id"); return; }
        try {
            Bitmap bm = loadScaledBitmap(uri, maxEdge);
            String b64 = encodeJpeg(bm);
            int w = bm.getWidth();
            int h = bm.getHeight();
            bm.recycle();
            JSObject result = new JSObject();
            result.put("base64", b64);
            result.put("mimeType", "image/jpeg");
            result.put("width", w);
            result.put("height", h);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Failed to render asset", e);
        }
    }
}
