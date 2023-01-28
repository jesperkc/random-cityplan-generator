import React from "react";
import { OrbitControls } from "@react-three/drei";

import FullScreenCanvas from "./canvas/FullScreenCanvas";
import ExampleCamera from "./canvas/ExampleCamera";
// import ExampleLine from "./canvas/ExampleLine";
import ExampleCity from "./canvas/ExampleCity";

export default function App() {
  return (
    <FullScreenCanvas>
      <ExampleCamera />
      <ExampleCity />
      <OrbitControls />
    </FullScreenCanvas>
  );
}
