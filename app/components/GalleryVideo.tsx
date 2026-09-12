import CanvasVideo from "./CanvasVideo";
import SceneVideo from "./SceneVideo";
import { RENDERED } from "./scene-videos";

/** One gallery clip: the Manim render when the scene has one, else the canvas drawing. */
export default function GalleryVideo(props: {
  scene: string;
  label?: string;
  autoplay?: boolean;
  mini?: boolean;
}) {
  return RENDERED.has(props.scene) ? <SceneVideo {...props} /> : <CanvasVideo {...props} />;
}
