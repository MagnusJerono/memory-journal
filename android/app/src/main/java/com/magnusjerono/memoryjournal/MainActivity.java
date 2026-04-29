package com.magnusjerono.memoryjournal;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Register local plugins before super.onCreate so the bridge picks them up.
        registerPlugin(PhotoLibraryPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
