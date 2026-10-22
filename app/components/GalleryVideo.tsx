import dynamic from "next/dynamic";
import SceneVideo from "./SceneVideo";
import { RENDERED } from "./scene-videos";

// the canvas drawings are a big file and every listed scene has a render, so load them only on a miss
const CanvasVideo = dynamic(() => import("./CanvasVideo"));

/** One gallery clip: the Manim render when the scene has one, else the canvas drawing. */
export default function GalleryVideo(props: {
  scene: string;
  label?: string;
  autoplay?: boolean;
  mini?: boolean;
}) {
  return RENDERED.has(props.scene) ? <SceneVideo {...props} /> : <CanvasVideo {...props} />;
}
