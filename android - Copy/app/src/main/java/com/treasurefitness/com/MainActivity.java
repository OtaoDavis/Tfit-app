package com.treasurefitness.com;

import android.Manifest; // Import for Manifest.permission
import android.content.pm.PackageManager; // Import for PackageManager
import android.os.Build; // Import for Build.VERSION.SDK_INT
import android.os.Bundle; // Import for Bundle
import android.util.Log; // Import for Log
import android.widget.Toast; // Import for Toast

import androidx.annotation.NonNull; // Import for @NonNull annotation
import androidx.core.app.ActivityCompat; // Import for ActivityCompat
import androidx.core.content.ContextCompat; // Import for ContextCompat

import com.getcapacitor.BridgeActivity; // Your existing Capacitor import

public class MainActivity extends BridgeActivity {

    private static final int PERMISSION_REQUEST_ACTIVITY_RECOGNITION = 1;
    private static final String TAG = "MainActivity"; // For logging

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Call the method to check and request permission right after super.onCreate()
        // This ensures the permission is handled early in your app's lifecycle.
        checkAndRequestActivityRecognitionPermission();
    }

    private void checkAndRequestActivityRecognitionPermission() {
        // ACTIVITY_RECOGNITION became a dangerous (runtime) permission in Android 10 (API 29)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Check if the permission is already granted
            if (ContextCompat.checkSelfPermission(this,
                    Manifest.permission.ACTIVITY_RECOGNITION)
                    != PackageManager.PERMISSION_GRANTED) {

                // Permission is not granted. Request it from the user.
                // This will show the system permission dialog.
                ActivityCompat.requestPermissions(this,
                        new String[]{Manifest.permission.ACTIVITY_RECOGNITION},
                        PERMISSION_REQUEST_ACTIVITY_RECOGNITION);
                Log.d(TAG, "Requesting ACTIVITY_RECOGNITION permission...");
            } else {
                // Permission has already been granted by the user.
                Log.d(TAG, "ACTIVITY_RECOGNITION permission already granted.");
                // You can proceed with enabling your step counter here if it relies solely on this permission.
                // For Capacitor/Ionic Native Pedometer, calling its methods will now succeed.
            }
        } else {
            // For Android versions below 10 (API 29), ACTIVITY_RECOGNITION is a normal permission.
            // It's automatically granted if declared in the AndroidManifest.xml.
            Log.d(TAG, "ACTIVITY_RECOGNITION permission is implicitly granted for API < 29.");
            // Proceed with enabling your step counter.
        }
    }

    // This method is called by the Android system after the user responds to the permission dialog.
    @Override
    public void onRequestPermissionsResult(int requestCode,
                                           @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        // IMPORTANT: Call super to allow Capacitor and other libraries to handle their own permission results.
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        if (requestCode == PERMISSION_REQUEST_ACTIVITY_RECOGNITION) {
            // Check if the request was for ACTIVITY_RECOGNITION and if it was granted.
            if (grantResults.length > 0 &&
                    grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission was granted by the user.
                Log.d(TAG, "ACTIVITY_RECOGNITION permission granted by user!");
                Toast.makeText(this, "Activity Recognition permission granted!", Toast.LENGTH_SHORT).show();
                // Now you can safely use your step counter/pedometer.
            } else {
                // Permission was denied by the user.
                Log.w(TAG, "ACTIVITY_RECOGNITION permission denied by user.");
                Toast.makeText(this, "Activity Recognition permission denied. Step counter may not work.", Toast.LENGTH_LONG).show();
                // You should inform the user about the functionality limitation
                // or disable features that rely on this permission.
            }
        }
        // If you request other permissions, you'll add more 'else if' blocks here
        // to handle their specific request codes.
    }
}