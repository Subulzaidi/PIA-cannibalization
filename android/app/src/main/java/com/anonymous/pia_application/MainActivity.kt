package com.anonymous.pia_application

import android.os.Bundle
import expo.modules.ReactActivityDelegateWrapper
import com.facebook.react.ReactActivity

class MainActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
    }

    override fun getMainComponentName(): String? {
        return "main"
    }
}
