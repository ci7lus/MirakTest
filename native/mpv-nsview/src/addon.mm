#import <Cocoa/Cocoa.h>
#import <QuartzCore/QuartzCore.h>
#include <napi.h>
#include <unordered_map>
#include <stdint.h>

static int64_t g_nextViewId = 1;
static std::unordered_map<int64_t, NSView*> g_views;

Napi::Value CreatePlayerView(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 5) {
    Napi::TypeError::New(env, "Expected 5 arguments").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Napi::Buffer<uint8_t> buf = info[0].As<Napi::Buffer<uint8_t>>();
  NSView* contentView = nil;
  memcpy((void*)&contentView, buf.Data(), sizeof(NSView*));

  double x = info[1].As<Napi::Number>().DoubleValue();
  double y = info[2].As<Napi::Number>().DoubleValue();
  double width = info[3].As<Napi::Number>().DoubleValue();
  double height = info[4].As<Napi::Number>().DoubleValue();

  __block NSView* playerView = nil;
  __block int64_t viewId = 0;

  dispatch_sync(dispatch_get_main_queue(), ^{
    NSRect frame = NSMakeRect(x, y, width, height);
    playerView = [[NSView alloc] initWithFrame:frame];
    playerView.wantsLayer = YES;
    playerView.layer.backgroundColor = [[NSColor blackColor] CGColor];

    // Insert below the Electron web view so it renders behind it
    NSView* firstSubview = contentView.subviews.firstObject;
    if (firstSubview) {
      [contentView addSubview:playerView positioned:NSWindowBelow relativeTo:firstSubview];
    } else {
      [contentView addSubview:playerView];
    }

    viewId = g_nextViewId++;
    g_views[viewId] = playerView;
  });

  Napi::Object result = Napi::Object::New(env);
  result.Set("viewId", Napi::Number::New(env, (double)viewId));
  result.Set("wid", Napi::String::New(env, std::to_string((uintptr_t)playerView)));
  return result;
}

Napi::Value ResizePlayerView(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int64_t viewId = (int64_t)info[0].As<Napi::Number>().Int64Value();
  double x = info[1].As<Napi::Number>().DoubleValue();
  double y = info[2].As<Napi::Number>().DoubleValue();
  double width = info[3].As<Napi::Number>().DoubleValue();
  double height = info[4].As<Napi::Number>().DoubleValue();

  auto it = g_views.find(viewId);
  if (it == g_views.end()) return env.Undefined();
  NSView* view = it->second;

  dispatch_async(dispatch_get_main_queue(), ^{
    view.frame = NSMakeRect(x, y, width, height);
  });
  return env.Undefined();
}

Napi::Value DestroyPlayerView(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int64_t viewId = (int64_t)info[0].As<Napi::Number>().Int64Value();

  auto it = g_views.find(viewId);
  if (it == g_views.end()) return env.Undefined();
  NSView* view = it->second;
  g_views.erase(it);

  dispatch_async(dispatch_get_main_queue(), ^{
    [view removeFromSuperview];
  });
  return env.Undefined();
}

Napi::Value SetPlayerViewVisible(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  int64_t viewId = (int64_t)info[0].As<Napi::Number>().Int64Value();
  bool visible = info[1].As<Napi::Boolean>().Value();

  auto it = g_views.find(viewId);
  if (it == g_views.end()) return env.Undefined();
  NSView* view = it->second;

  dispatch_async(dispatch_get_main_queue(), ^{
    view.hidden = !visible;
  });
  return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("createPlayerView", Napi::Function::New(env, CreatePlayerView));
  exports.Set("resizePlayerView", Napi::Function::New(env, ResizePlayerView));
  exports.Set("destroyPlayerView", Napi::Function::New(env, DestroyPlayerView));
  exports.Set("setPlayerViewVisible", Napi::Function::New(env, SetPlayerViewVisible));
  return exports;
}

NODE_API_MODULE(mpv_nsview, Init)
