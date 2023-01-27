import React from "react";
import { PerspectiveCamera } from "@react-three/drei";

const { innerWidth, innerHeight } = window;

export default function ExampleCamera(): JSX.Element {
  return (
    <PerspectiveCamera
      makeDefault
      fov={5}
      aspect={innerWidth / innerHeight}
      near={1}
      far={1000}
      position={[0, -500, 0]}
    />
  );
}
