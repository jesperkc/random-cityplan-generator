import React from "react";
import { Canvas } from "@react-three/fiber";

interface Props {
  children: React.ReactNode;
}

const { innerWidth, innerHeight } = window;

export default function FullScreenCanvas({ children }: Props): JSX.Element {
  return (
    <Canvas
      style={{
        width: innerWidth + "px",
        height: innerHeight + "px"
      }}
    >
      {children}
    </Canvas>
  );
}
