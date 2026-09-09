import { HlsPlayer } from "./HlsPlayer";
import { mosaicCamera } from "../utils/mosaic";
import type { Mosaic } from "../types/api";

export function MosaicGrid({ mosaic }: { mosaic: Mosaic }) {
  return (
    <section
      className="mosaic-wall"
      style={{ gridTemplateColumns: `repeat(${mosaic.columns}, minmax(0, 1fr))` }}
      aria-label={`Mosaico ${mosaic.name}`}
    >
      {Array.from({ length: mosaic.capacity }, (_, index) => {
        const camera = mosaicCamera(mosaic, index);
        return camera ? (
          <HlsPlayer key={camera.id} camera={camera} compact position={index + 1} />
        ) : (
          <div className="empty mosaic-slot" key={index}>
            <span>Posição {index + 1}</span>
            <small>Sem câmera</small>
          </div>
        );
      })}
    </section>
  );
}
