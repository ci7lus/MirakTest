{
  "targets": [{
    "target_name": "mpv_nsview",
    "sources": ["src/addon.mm"],
    "include_dirs": [
      "<!@(node -p \"require('node-addon-api').include\")"
    ],
    "dependencies": [
      "<!(node -p \"require('node-addon-api').gyp\")"
    ],
    "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
    "conditions": [
      ["OS=='mac'", {
        "xcode_settings": {
          "OTHER_CFLAGS": ["-ObjC++", "-std=c++17", "-fobjc-arc"],
          "MACOSX_DEPLOYMENT_TARGET": "12.0",
          "CLANG_ENABLE_OBJC_ARC": "YES"
        },
        "link_settings": {
          "libraries": ["-framework Cocoa", "-framework QuartzCore"]
        }
      }]
    ]
  }]
}
