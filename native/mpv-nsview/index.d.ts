export interface PlayerViewHandle {
  viewId: number;
  wid: string; // decimal NSView* pointer for mpv --wid=
}

export function createPlayerView(
  nativeWindowHandle: Buffer,
  x: number,
  y: number,
  width: number,
  height: number
): PlayerViewHandle;

export function resizePlayerView(
  viewId: number,
  x: number,
  y: number,
  width: number,
  height: number
): void;

export function destroyPlayerView(viewId: number): void;

export function setPlayerViewVisible(viewId: number, visible: boolean): void;
