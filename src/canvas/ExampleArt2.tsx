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
        currentline.start.x,
        currentline.start.y,
        currentline.end.x,
        currentline.end.y,
        line.start.x,
        line.start.y,
        line.end.x,
        line.end.y
      );

      intersections.push(intersection);
    }
  }
  return intersections;
}

function shiftArrayToRight(arr, places) {
  for (var i = 0; i < places; i++) {
    arr.unshift(arr.pop());
  }
}

function getLineIntersectionsWithShape(slicingLine, rect: THREE.Vector2[]) {
  console.log("getLineIntersectionsWithShape");
  console.log("slicingLine", slicingLine);
  console.log("rect", [...rect]);
  const rectCorners: THREE.Vector2[] = [];
  const rectCornersClone: THREE.Vector2[] = [];
  const returnArrays = [rectCorners, rectCornersClone];

  let currentArrayIndex = 0;
  for (var i = 0; i < rect.length; i++) {
    const endPoint = i < rect.length - 1 ? rect[i + 1] : rect[0];
    const intersection = line_intersect(
      slicingLine[0].x,
      slicingLine[0].y,
      slicingLine[1].x,
      slicingLine[1].y,
      rect[i].x,
      rect[i].y,
      endPoint.x,
      endPoint.y
    );
    console.log("intersection", intersection);
    if (intersection) {
      returnArrays[currentArrayIndex].push(
        new THREE.Vector2(rect[i].x, rect[i].y)
      );
      returnArrays[currentArrayIndex].push(
        new THREE.Vector2(intersection.x, intersection.y)
      );
      currentArrayIndex = currentArrayIndex === 0 ? 1 : 0;
      returnArrays[currentArrayIndex].push(
        new THREE.Vector2(intersection.x, intersection.y)
      );
    } else {
      returnArrays[currentArrayIndex].push(
        new THREE.Vector2(rect[i].x, rect[i].y)
      );
    }

    // intersections.push(intersection);
  }
  console.log("returnArrays[0]", returnArrays[0]);
  // shiftArrayToRight(returnArrays[1], 1);
  // returnArrays[1] = returnArrays[1].concat(returnArrays[1].splice(0, 1));
  // console.log("returnArrays[1]", returnArrays[1]);
  return returnArrays;
}

function drawRandomLine(
  min: number,
  max: number,
  length: number,
  offset: number,
  horizontal: boolean
) {
  const starty = THREE.MathUtils.randInt(min, max);
  const endy = THREE.MathUtils.randInt(min, max);

  if (horizontal) {
    return [
      new THREE.Vector2(length + offset, endy),
      new THREE.Vector2(-offset, starty)
    ];
  }
  return [
    new THREE.Vector2(starty, -offset),
    new THREE.Vector2(endy, length + offset)
  ];
}

function generateSliceLines(
  length: number,
  span: number,
  intersections: number,
  horizontal: boolean
) {
  const section = span / intersections;
  const sectionBuffer = section / 4;

  const sliceLines = [];

  let min = sectionBuffer,
    max = section - sectionBuffer;
  for (var h = 0; h < intersections; h++) {
    const line = drawRandomLine(min, max, length, 1, horizontal);

    sliceLines.push(line);

    min += section;
    max += section;
  }

  return sliceLines;
}

function cleanupShape(shape: THREE.Vector2[]) {
  const first = shape[0];
  const last = shape[shape.length - 1];
  const isEqual = first.x === last.x && first.y === last.y;
  if (isEqual) {
    shape.pop();
  }

  return shape;
}

function sliceShape(shape: THREE.Vector2[], lines: THREE.Vector2[][]) {
  let slicedShapes: THREE.Vector2[][] = [];

  let baseshape: THREE.Vector2[] | null = cleanupShape([...shape]);
  for (var h = 0; h < lines.length; h++) {
    console.log("baseshape", baseshape);
    if (baseshape) {
      const shapes = getLineIntersectionsWithShape(lines[h], baseshape);
      console.log("shapes", shapes);
      if (shapes[1] && shapes[1].length) {
        slicedShapes.push(cleanupShape(shapes[1]));
      }
      if (shapes[0] && shapes[0].length) {
        baseshape = cleanupShape(shapes[0]);
      } else {
        baseshape = null;
      }
    }
  }
  if (baseshape) slicedShapes.push(baseshape);

  return slicedShapes;
}

function sliceShapes(shapes: THREE.Vector2[][], lines: THREE.Vector2[][]) {
  let slicedShapes: THREE.Vector2[][] = [];

  for (var h = 0; h < shapes.length; h++) {
    const shapesSliced = sliceShape(shapes[h], lines);

    slicedShapes.concat(shapesSliced);
  }

  return slicedShapes;
}
function generateIntersections(width: number, height: number) {
  const numberOfIntersectionsWidth = 3;
  const numberOfIntersectionsHeight = 3;
  const intersectionGapHeight = height / numberOfIntersectionsHeight;
  const intersectionGapWidth = width / numberOfIntersectionsWidth;
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
    intersectionsHeight.push({
      start: new THREE.Vector2(i1, 0),
      end: new THREE.Vector2(i2, width)
    });
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
    intersectionsWidth.push({
      start: new THREE.Vector2(0, i1),
      end: new THREE.Vector2(height, i2)
    });
    // intersectionPositionWidthLeft = i1;
    // intersectionPositionWidthRight = i2;
  }

  return intersectionsWidth.concat(intersectionsHeight);
}

function fillShape(fill: THREE.Vector2[]) {
  const fillShape = new THREE.Shape();
  // console.log("fillShape", fill);

  fill.forEach((f, i) => {
    if (i === 0) {
      console.log("moveTo", f.x, f.y);
      fillShape.moveTo(f.x, f.y);
    } else {
      console.log("lineTo", f.x, f.y);
      fillShape.lineTo(f.x, f.y);
    }
  });
  // fillShape.closePath();

  const geom = new THREE.ShapeGeometry(fillShape);
  geom.rotateX(Math.PI / -2);
  return geom;
}

function computeBoundingBox(arr: THREE.Vector2[]) {
  const coords = [
    { x: 10, y: 20 },
    { x: 5, y: 6 },
    { x: 1, y: 25 },
    { x: 11, y: 2 }
  ];
  const xArr = arr.map((c) => c.x);
  const yArr = arr.map((c) => c.y);

  const l = Math.min(...xArr);
  const r = Math.max(...xArr);
  const b = Math.min(...yArr);
  const t = Math.max(...yArr);

  const width = r - l;
  const height = t - b;
  console.log("computeBoundingBox-x", xArr);
  console.log("computeBoundingBox-y", yArr);
  console.log("computeBoundingBox-tb", t, b);
  console.log("computeBoundingBox", width, height);

  return { width, height };
}

export default function ExampleCity(): JSX.Element {
  // const intersectionLines = generateIntersections(20, 20);

  const height = 20,
    width = 20;

  const cityShape = new THREE.Shape();

  cityShape.moveTo(0, height);
  // cityShape.lineTo(width - 6, height);
  // cityShape.lineTo(width, 5);
  // cityShape.lineTo(width / 2, 0);

  cityShape.lineTo(width, height);
  cityShape.lineTo(width, 0);
  cityShape.lineTo(0, 0);
  cityShape.closePath();

  const baserect = cityShape.getPoints(4);
  let bb = computeBoundingBox(baserect);
  const intersectionLines = generateSliceLines(bb.width, bb.height, 1, true);
  let finalFillsArray: THREE.Vector2[][] = sliceShape(
    baserect,
    intersectionLines
  );

  finalFillsArray.forEach((fill, i) => {
    const area = -THREE.ShapeUtils.area(fill);
    if (area > 100) {
      console.log("area", area);
      bb = computeBoundingBox(fill);
      console.log("bb", bb);
      let vertLines;
      if (bb.height > bb.width) {
        vertLines = generateSliceLines(bb.width, bb.height, 1, true);
      } else {
        vertLines = generateSliceLines(bb.height, bb.width, 1, false);
      }
      console.log("vertLines", vertLines);
      const slicedShapes = sliceShape(fill, vertLines);
      // finalFillsArray.splice(i, 1, ...slicedShapes);
      // console.log("slicedShapes", slicedShapes);
    }
  });

  // const sliceShapeI1 = 2;
  // // finalFillsArray.splice(sliceShapeI1, 1);
  // bb = computeBoundingBox(finalFillsArray[sliceShapeI1]);
  // const vertLines1 = generateSliceLines(bb.width, bb.height, 1, true);
  // const slicedShapes1 = sliceShape(finalFillsArray[sliceShapeI1], vertLines1);
  // console.log("slicedShapes1", slicedShapes1);
  // finalFillsArray.splice(sliceShapeI1, 1, ...slicedShapes1);

  // console.log("intersectionPoints", intersectionPoints);
  return (
    <group position={[-10, 0, -10]}>
      <Line
        points={[
          [0, 0.1, 0],
          [0, 0.1, 20]
        ]}
        color={0xffff00}
      />
      <Line
        points={[
          [20, 0.1, 0],
          [20, 0.1, 20]
        ]}
        color={0x0000ff}
      />
      <Line
        points={[
          [0, 0.1, 0],
          [20, 0.1, 0]
        ]}
        color={0x0000ff}
      />
      <Line
        points={[
          [0, 0.1, 20],
          [20, 0.1, 20]
        ]}
        color={0xff0000}
      />
      {intersectionLines &&
        intersectionLines.map((l) => (
          <Line
            points={[
              [l[0].x, 1, l[0].y],
              [l[1].x, 1, l[1].y]
            ]}
            color={0x00ffff}
          />
        ))}
      <group position={[0, 0, 20]}>
        {finalFillsArray &&
          finalFillsArray.map((fill: THREE.Vector2[], i) => {
            const color = new THREE.Color(0xffffff);
            if (i > 0) color.setHex(Math.random() * 0xffffff);
            return (
              <group position={[0, -i, 0]}>
                <mesh geometry={fillShape(fill)}>
                  <meshBasicMaterial color={color} />
                </mesh>
                {fill.map((f, ii) => (
                  <DSphere
                    args={[0.5, 16, 16]}
                    material-color={color}
                    position={[f.x, -ii, -f.y]}
                  />
                ))}
              </group>
            );
          })}
      </group>
      {/* {intersectionLines &&
        intersectionLines.map((line) => (
          <Line
            points={[
              [line.start.x, 0, line.start.y],
              [line.end.x, 0, line.end.y]
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
                args={[1, 16, 16]}
                material-color={0x0000ff}
                position={[point.x, 0, point.y]}
              />
            )
        )} */}
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
