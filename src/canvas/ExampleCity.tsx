import * as THREE from "three";
import React from "react";
import { Circle, Line, Sphere as DSphere } from "@react-three/drei";
import { Sphere } from "three";

interface IShapeEdge {
  start: THREE.Vector2;
  type: string;
}

interface IShape {
  edges: IShapeEdge[];
}

interface ISlicedShape {
  shapes: IShape[];
  sliceLines: THREE.Vector2[][];
}

interface IRoadLines {
  thickness: number;
  lines: THREE.Vector2[][];
}

const roadLines: IRoadLines[] = [];

const savedlog: any[] = [];
function resetlog() {
  savedlog.splice(0);
}
function savelog() {
  savedlog.push(Array.from(arguments));
}
function outputlog() {
  savedlog.forEach((l) => {
    console.log(l);
  });
}

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

function getIntersections(lines: any[]) {
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

function shiftArrayToRight(arr: any[], places: number) {
  for (var i = 0; i < places; i++) {
    arr.unshift(arr.pop());
  }
}

function getLineIntersectionsWithShape(
  slicingLine: THREE.Vector2[],
  rect: IShape
) {
  console.log("** getLineIntersectionsWithShape");
  console.log("slicingLine", slicingLine);
  console.log("rect", rect);
  const newSlicingLine: THREE.Vector2[] = [];
  const rectCorners: IShape = { edges: [] };
  const rectCornersClone: IShape = { edges: [] };
  const returnArrays = [rectCorners, rectCornersClone];
  resetlog();
  let currentArrayIndex = 1;
  for (var i = 0; i < rect.edges.length; i++) {
    const endPoint =
      i < rect.edges.length - 1 ? rect.edges[i + 1] : rect.edges[0];
    const intersection = line_intersect(
      slicingLine[0].x,
      slicingLine[0].y,
      slicingLine[1].x,
      slicingLine[1].y,
      rect.edges[i].start.x,
      rect.edges[i].start.y,
      endPoint.start.x,
      endPoint.start.y
    );
    console.log("intersection", JSON.stringify(intersection));
    // savelog("add point:", currentArrayIndex, rect[i].x, rect[i].y);
    returnArrays[currentArrayIndex].edges.push({
      start: new THREE.Vector2(rect.edges[i].start.x, rect.edges[i].start.y),
      type: ""
    });
    if (intersection) {
      newSlicingLine.push(new THREE.Vector2(intersection.x, intersection.y));
      returnArrays[currentArrayIndex].edges.push({
        start: new THREE.Vector2(intersection.x, intersection.y),
        type: ""
      });
      // savelog("add point:", currentArrayIndex, intersection.x, intersection.y);
      currentArrayIndex = currentArrayIndex === 0 ? 1 : 0;
      returnArrays[currentArrayIndex].edges.push({
        start: new THREE.Vector2(intersection.x, intersection.y),
        type: ""
      });
      // savelog("add point:", currentArrayIndex, intersection.x, intersection.y);
    } else {
    }
  }
  // console.log("returnArrays", returnArrays);
  returnArrays.forEach((r) => {
    if (r.edges.length <= 2) {
      console.log("***");
      outputlog();
      resetlog();
    }
  });
  if (newSlicingLine.length > 2) {
    console.log("*** newSlicingLine ***");
    outputlog();
  }
  if (!newSlicingLine.length) {
    console.warn("*** newSlicingLine null ***");
    outputlog();
  }
  console.log("*** newSlicingLine ***", newSlicingLine);
  returnArrays.reverse();
  return {
    shapes: returnArrays,
    slicingLine: newSlicingLine
  };
}

function pointAtX(a: any, b: any, x: any) {
  var slope = (b[1] - a[1]) / (b[0] - a[0]);
  var y = a[1] + (x - a[0]) * slope;
  return [x, y];
}

function drawRandomLine(
  min: number,
  max: number,
  length: number,
  horizontal: boolean
) {
  // console.log("drawRandomLine");
  const starty = THREE.MathUtils.randInt(min, max);
  const endy = THREE.MathUtils.randInt(min, max);
  console.log("drawRandomLine", starty, endy);

  if (horizontal) {
    var A = [0, starty], // x of 15 and y of 40
      B = [length, endy],
      p0 = pointAtX(A, B, -100),
      p1 = pointAtX(A, B, 100);
    return [new THREE.Vector2(p0[0], p0[1]), new THREE.Vector2(p1[0], p1[1])];
  }
  var A = [0, starty], // x of 15 and y of 40
    B = [length, endy],
    p0 = pointAtX(A, B, -100),
    p1 = pointAtX(A, B, 100);
  return [new THREE.Vector2(p0[1], p0[0]), new THREE.Vector2(p1[1], p1[0])];
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
    const line = drawRandomLine(min, max, length, horizontal);

    sliceLines.push(line);

    min += section;
    max += section;
  }

  return sliceLines;
}

function cleanupShape(shape: IShape) {
  const first = shape.edges[0].start;
  const last = shape.edges[shape.edges.length - 1].start;
  const isEqual = first.x === last.x && first.y === last.y;
  if (isEqual) {
    shape.edges.pop();
  }

  return shape;
}

function sliceShape(shape: IShape, lines: THREE.Vector2[][]): ISlicedShape {
  let slicedShapes: IShape[] = [];
  const sliceLines: THREE.Vector2[][] = [];

  let baseshape: IShape | null = cleanupShape(shape);
  for (var h = 0; h < lines.length; h++) {
    // console.log("baseshape", baseshape);
    if (baseshape) {
      const shapes = getLineIntersectionsWithShape(lines[h], baseshape);
      // console.log("shapes", shapes);

      sliceLines.push(shapes.slicingLine);
      if (shapes.shapes[1] && shapes.shapes[1].edges.length) {
        slicedShapes.push(cleanupShape(shapes.shapes[1]));
      }
      if (shapes.shapes[0] && shapes.shapes[0].edges.length) {
        baseshape = cleanupShape(shapes.shapes[0]);
      } else {
        baseshape = null;
      }

      console.log("roadLines", roadLines.length);
    }
  }
  if (baseshape) slicedShapes.push(baseshape);

  return {
    shapes: slicedShapes,
    sliceLines: sliceLines
  };
}

function fillShape3d(fill: THREE.Vector2[]) {
  const curbshape: THREE.Vector3[] = [];
  fill.forEach((f, i) => {
    curbshape.push(new THREE.Vector3(f.x, 0, f.y));
  });

  const curbSpline = new THREE.CatmullRomCurve3(curbshape, true, "catmullrom");
  // curbSpline.tension = 0.1;
  const points = curbSpline.getPoints(50);
  const geom = new THREE.BufferGeometry().setFromPoints(points);

  // const geom = new THREE.ShapeGeometry(curbSpline);
  // geom.rotateX(Math.PI / 2);
  // geom.center();
  return geom;
}

function fillShape(fill: IShape) {
  const fillShape = new THREE.Shape();
  // console.log("fillShape", fill);

  fill.edges.forEach((f, i) => {
    if (i === 0) {
      // console.log("moveTo", f.x, f.y);
      fillShape.moveTo(f.start.x, f.start.y);
    } else {
      // console.log("lineTo", f.x, f.y);
      fillShape.lineTo(f.start.x, f.start.y);
    }
  });
  fillShape.closePath();

  const geom = new THREE.ShapeGeometry(fillShape);
  geom.rotateX(Math.PI / 2);
  // geom.center();
  return geom;
}

function computeBoundingBox(arr: THREE.Vector2[]) {
  const xArr = arr.map((c) => c.x);
  const yArr = arr.map((c) => c.y);

  const l = Math.min(...xArr);
  const r = Math.max(...xArr);
  const b = Math.min(...yArr);
  const t = Math.max(...yArr);

  const width = r - l;
  const height = t - b;
  // console.log("computeBoundingBox-x", xArr);
  // console.log("computeBoundingBox-y", yArr);
  // console.log("computeBoundingBox-tb", t, b);
  // console.log("computeBoundingBox", width, height);

  return { l, r, b, t, width, height };
}

let splitShapeCount = 0;

function splitShape(fill: IShape) {
  splitShapeCount = splitShapeCount + 1;
  let slicedShapesFinal:IShape[] = [];
  const area = -THREE.ShapeUtils.area(fill.edges.map((e) => e.start));
  console.log("area", area);
  if (area > 10 && splitShapeCount < 500) {
    let roadWidth = 2;
    if (area > 50) {
      roadWidth = 6;
    } else if (area > 150) {
      roadWidth = 12;
    }
    // && Math.random() > 0.2
    const bb = computeBoundingBox(fill.edges.map((e) => e.start));
    let vertLines;
    if (bb.height > bb.width) {
      // vertLines = generateSliceLines(bb.width, bb.height, 1, true);
      const top = bb.b + (bb.t - bb.b) * THREE.MathUtils.randFloat(0.2, 0.8);
      const bottom = bb.b + (bb.t - bb.b) * THREE.MathUtils.randFloat(0.2, 0.8);
      vertLines = [
        [new THREE.Vector2(-40, top), new THREE.Vector2(40, bottom)]
      ];
    } else {
      // vertLines = generateSliceLines(bb.height, bb.width, 1, false);
      const left = bb.l + (bb.r - bb.l) * THREE.MathUtils.randFloat(0.2, 0.8);
      const right = bb.l + (bb.r - bb.l) * THREE.MathUtils.randFloat(0.2, 0.8);
      vertLines = [
        [new THREE.Vector2(left, -20), new THREE.Vector2(right, 40)]
      ];
    }
    // console.log("vertLines", vertLines);
    const slicedShapessemiFinal: IShape[] = [];
    const slicedShapes = sliceShape(fill, vertLines);
    slicedShapes.shapes.forEach((s, ii) => {
      const newsplitshapes: IShape[] = splitShape(s);
      slicedShapessemiFinal.push(...newsplitshapes);
    });

    roadLines.push({
      thickness: roadWidth,
      lines: slicedShapes.sliceLines
    });

    slicedShapesFinal = slicedShapesFinal.concat(slicedShapessemiFinal);
  } else {
    return [fill];
  }

  return slicedShapesFinal;
}

const height = 30,
  width = 30;

const cityShape = new THREE.Shape();

cityShape.moveTo(0, height);
// cityShape.lineTo(width - 6, height);
// cityShape.lineTo(width, 5);
// cityShape.lineTo(width / 2, 0);

cityShape.lineTo(width, height);
cityShape.lineTo(width, 0);
cityShape.lineTo(0, 0);
cityShape.closePath();

var path = new THREE.Path(),
  circleRadius = height / 2;

path.moveTo(0, circleRadius);
path.quadraticCurveTo(circleRadius, circleRadius, circleRadius, 0);
path.quadraticCurveTo(circleRadius, -circleRadius, 0, -circleRadius);
path.quadraticCurveTo(-circleRadius, -circleRadius, -circleRadius, 0);
path.quadraticCurveTo(-circleRadius, circleRadius, 0, circleRadius);

// const baserect = path.getSpacedPoints(12);
const getPoints = cityShape.getPoints(4);
const baserect: IShape = {
  edges: []
};
getPoints.forEach((p) => {
  baserect.edges.push({ start: p, type: "" });
});
console.log("baserect", baserect);

const bb = computeBoundingBox(baserect.edges.map((e) => e.start));

const minh = THREE.MathUtils.randInt(6, 6);
const maxh = THREE.MathUtils.randInt(15, 15);

const intersectionLines = generateSliceLines(bb.width, bb.height, 1, true);

// const intersectionLines = [
//   [new THREE.Vector2(-10, maxh), new THREE.Vector2(30, maxh)]
// ];
function RoadLines(props: { roadLines: IRoadLines[] }): JSX.Element {
  console.log("final roadLines", props.roadLines.length);
  return (
    <group position={[0, 0, 0]}>
      {props.roadLines &&
        props.roadLines.map((rl: IRoadLines, i) => {
          // console.log("roadLines", i, rl);
          return rl.lines.map((l: THREE.Vector2[], ii) => {
            const color = new THREE.Color(0x000000);
            // const color = new THREE.Color(0xffffff);
            // color.setHex(Math.random() * 0xffffff);
            return (
              <Line
                points={[
                  [l[0].x, -1, l[0].y],
                  [l[1].x, -1, l[1].y]
                ]}
                lineWidth={rl.thickness}
                color={color}
              />
            );
          });
        })}
    </group>
  );
}

export default function ExampleCity(): JSX.Element {
  roadLines.splice(0);
  // const intersectionLines = generateIntersections(20, 20);

  // console.log("minh.", minh);
  // console.log("maxh", maxh);
  // const intersectionLines = [drawRandomLine(minh, minh, bb.width, 1, true)];

  let finalFillsArray: ISlicedShape = sliceShape(baserect, intersectionLines);

  roadLines.push({
    thickness: 20,
    lines: finalFillsArray.sliceLines
  });
  // const fill = finalFillsArray[0];
  // const bb = computeBoundingBox(fill);
  // console.log("bb", bb);
  // let vertLines;
  // if (bb.height > bb.width) {
  //   vertLines = generateSliceLines(bb.width, bb.height, 1, true);
  // } else {
  //   vertLines = generateSliceLines(bb.height, bb.width, 1, false);
  // }
  // // vertLines = [[new THREE.Vector2(8, 20), new THREE.Vector2(12, 0)]];
  // console.log("vertLines for 1.", vertLines);
  // const slicedShapes = sliceShape(fill, vertLines);
  // finalFillsArray.splice(0, 1, ...slicedShapes);
  // console.log("slicedShapes", slicedShapes);

  // {
  //   // const fill = finalFillsArray[1];
  //   // const bb = computeBoundingBox(fill);
  //   // console.log("bb", bb);
  //   // if (bb.height > bb.width) {
  //   //   vertLines = generateSliceLines(bb.width, bb.height, 1, true);
  //   // } else {
  //   //   vertLines = generateSliceLines(bb.height, bb.width, 1, false);
  //   // }
  //   // // vertLines = [[new THREE.Vector2(-1, 6), new THREE.Vector2(20, 6)]];
  //   // console.log("vertLines for 2.", vertLines);
  //   // const slicedShapes = sliceShape(fill, vertLines);
  //   // finalFillsArray.splice(1, 1, ...slicedShapes);
  //   // console.log("slicedShapes", slicedShapes);
  // }

  let finalfinalFillsArray: IShape[] = [];

  splitShapeCount = 0;
  console.warn("Starting split");
  finalFillsArray.shapes.forEach((fill, i) => {
    const slicedShapes = splitShape(fill);
    finalfinalFillsArray.push(...slicedShapes);
  });

  // const sliceShapeI1 = 2;
  // // finalFillsArray.splice(sliceShapeI1, 1);
  // bb = computeBoundingBox(finalFillsArray[sliceShapeI1]);
  // const vertLines1 = generateSliceLines(bb.width, bb.height, 1, true);
  // const slicedShapes1 = sliceShape(finalFillsArray[sliceShapeI1], vertLines1);
  console.log("splitShapeCount", splitShapeCount);
  console.log("finalfinalFillsArray length", finalfinalFillsArray.length);
  // finalFillsArray.splice(sliceShapeI1, 1, ...slicedShapes1);
  // finalFillsArray.splice(1);
  // console.log("intersectionPoints", intersectionPoints);

  console.log("final roadLines", roadLines.length);
  return (
    <group position={[0, 0, 0]}>
      <RoadLines roadLines={roadLines} />
      {finalfinalFillsArray &&
        finalfinalFillsArray.map((fill: IShape, i) => {
          const color = new THREE.Color(0xffffff);
          if (i > 0) color.setHex(Math.random() * 0xffffff);
          return (
            <group key={`g-${i}`}>
              <mesh geometry={fillShape(fill)}>
                <meshBasicMaterial color={color} />
              </mesh>
            </group>
          );
        })}
    </group>
  );
}
