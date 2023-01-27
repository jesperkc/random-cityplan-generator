import * as THREE from "three";
import React from "react";
import { Circle, Line, Sphere as DSphere } from "@react-three/drei";
import { Sphere } from "three";

function line_intersect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number
) {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false;
  }

  let denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // Lines are parallel
  if (denominator === 0) {
    return false;
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false;
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1);
  let y = y1 + ua * (y2 - y1);

  return { x, y };
}

function getIntersections(lines) {
  const intersections = [];
  for (var i = 0; i < lines.length; i++) {
    const currentline = lines[i];
    for (var ii = i + 1; ii < lines.length; ii++) {
      const line = lines[ii];
      const intersection = line_intersect(
        currentline[0].x,
        currentline[0].y,
        currentline[1].x,
        currentline[1].y,
        line[0].x,
        line[0].y,
        line[1].x,
        line[1].y
      );
      console.log(
        currentline[0].x,
        currentline[0].y,
        currentline[1].x,
        currentline[1].y,
        line[0].x,
        line[0].y,
        line[1].x,
        line[1].y
      );
      intersections.push(intersection);
    }
  }
  return intersections;
}

function generateIntersections(width: number, height: number) {
  const numberOfIntersectionsWidth = 2;
  const numberOfIntersectionsHeight = 2;
  const intersectionGapHeight = height / (numberOfIntersectionsHeight + 1);
  const intersectionGapWidth = width / (numberOfIntersectionsWidth + 1);
  const intersectionsHeight = [];
  const intersectionsWidth = [];
  // let intersectionPositionHeightLeft = intersectionGapHeight / 2;
  // let intersectionPositionHeightRight = intersectionGapHeight / 2;
  for (var h = 0; h < numberOfIntersectionsHeight; h++) {
    const i1 = THREE.MathUtils.randInt(
      intersectionGapHeight * h,
      intersectionGapHeight * (h + 1)
    );
    const i2 = THREE.MathUtils.randInt(
      intersectionGapHeight * h,
      intersectionGapHeight * (h + 1)
    );
    intersectionsHeight.push([
      new THREE.Vector2(i1, 0),
      new THREE.Vector2(i2, width)
    ]);
    // intersectionPositionHeightLeft = i1;
    // intersectionPositionHeightRight = i2;
  }

  // let intersectionPositionWidthLeft = intersectionGapWidth / 2;
  // let intersectionPositionWidthRight = intersectionGapWidth / 2;
  for (var w = 0; w < numberOfIntersectionsWidth; w++) {
    const i1 = THREE.MathUtils.randInt(
      intersectionGapWidth * w,
      intersectionGapWidth * (w + 1)
    );
    const i2 = THREE.MathUtils.randInt(
      intersectionGapWidth * w,
      intersectionGapWidth * (w + 1)
    );
    intersectionsWidth.push([
      new THREE.Vector2(0, i1),
      new THREE.Vector2(height, i2)
    ]);
    // intersectionPositionWidthLeft = i1;
    // intersectionPositionWidthRight = i2;
  }

  return intersectionsWidth.concat(intersectionsHeight);
}

export default function ExampleLine(): JSX.Element {
  const intersections = generateIntersections(20, 20);
  const intersectionPoints = getIntersections(intersections);
  console.log("intersectionPoints", intersectionPoints);
  return (
    <group>
      {intersections &&
        intersections.map((intersection) => (
          <Line
            points={[
              [intersection[0].x, 0, intersection[0].y],
              [intersection[1].x, 0, intersection[1].y]
            ]}
            color={0x0000ff}
          />
          // <DSphere
          //   args={[2, 16, 16]}
          //   material-color={0x0000ff}
          //   position={[intersection.x, 0, intersection.y]}
          // />
        ))}
      {intersectionPoints &&
        intersectionPoints.map(
          (point) =>
            point && (
              <DSphere
                args={[2, 16, 16]}
                material-color={0x0000ff}
                position={[point.x, 0, point.y]}
              />
            )
        )}
    </group>
  );
  // <Line
  //   points={[
  //     [-10, 0, 0],
  //     [0, 10, 0],
  //     [10, 0, 0]
  //   ]}
  //   color={0x0000ff}
  // />
}
