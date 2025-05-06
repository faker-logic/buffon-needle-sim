const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 440;
const RECT_X1 = 75;
const RECT_Y1 = 50;
const RECT_WIDTH = 250;
const RECT_HEIGHT = 300;
const NEEDLE_LENGTH = 10;
const TOTAL_LINES = RECT_HEIGHT / NEEDLE_LENGTH - 1;
let TOTAL_NEEDLES = 628;
const NEEDLE_THICKNESS = 2.5;

const BG_COLOR = "#D5D5D5";
const ENV_COLOR = "#B7B7DA";
const GRID_COLOR = "#000";
const NEEDLE_COLOR = "#0A0A5A";
const CROSSING_NEEDLE_COLOR = "#00FFF0";

const GRAPH_WIDTH = 300;
const GRAPH_HEIGHT = 200;
const GRAPH_MARGIN_LEFT = 50;
const REPORT_HEIGHT = 90;
const REPORT_TEXT_SIZE = 23;
const REPORT_MARGIN_TOP = 10;
const PI_REPORT_COLOR = "#00FF00";
const CROSS_REPORT_COLOR = "#FFFFFF";
const REPORT_BOX_COLOR = "#1E2A32";
const ERROR_REPORT_COLOR = "#ff5f00";

let needles = [];
let errors = [];
let looping = true;
let fps = 60;

let resetButton;
let pauseButton;
let fpsSlider;
let errorIntervalSlider;

function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  frameRate(fps);

  resetButton = createButton("Reset");
  resetButton.position(RECT_X1, RECT_Y1 + RECT_HEIGHT + 50);
  resetButton.mousePressed(resetSimulation);

  pauseButton = createButton("Pause");
  pauseButton.position(RECT_X1 + 75, RECT_Y1 + RECT_HEIGHT + 50);
  pauseButton.mousePressed(toggleSimulation);

  fpsSlider = createSlider(1, 60, 30);
  fpsSlider.position(RECT_X1 + 150, RECT_Y1 + RECT_HEIGHT + 50);

  errorIntervalSlider = createSlider(1, TOTAL_NEEDLES / 10, 50);
  errorIntervalSlider.position(RECT_X1 + 300, RECT_Y1 + RECT_HEIGHT + 50);
}

function draw() {
  fps = fpsSlider.value();
  frameRate(fps);
  background(BG_COLOR);
  simulate();
}

function simulate() {
  drawEnvironment();
  generateRandomNeedle();
  drawNeedles();
  showReport();
  graph();
}

function drawEnvironment() {
  strokeWeight(1);
  fill(ENV_COLOR);
  stroke(GRID_COLOR);

  // Draw Paper
  rect(RECT_X1, RECT_Y1, RECT_WIDTH, RECT_HEIGHT);

  // Draw Horizontal Lines
  for (let i = 1; i <= TOTAL_LINES; i++) {
    const yPosition = RECT_Y1 + i * NEEDLE_LENGTH;
    line(RECT_X1, yPosition, RECT_X1 + RECT_WIDTH, yPosition);
  }
}

function drawNeedles() {
  strokeWeight(NEEDLE_THICKNESS);
  needles.forEach((needle) => {
    const isCross = checkCross(needle);
    stroke(isCross ? CROSSING_NEEDLE_COLOR : NEEDLE_COLOR);
    const { p1, p2 } = needle;
    line(p1.x, p1.y, p2.x, p2.y);
  });
}

function generateRandomNeedle() {
  if (needles.length >= TOTAL_NEEDLES) {
    
    return;
  }
  const p1 = randomPosition();
  const dir = randomUnitVector();
  const p2 = calcPoint2(p1, dir);
  needles.push({ p1, p2 });
}

function randomPosition(
  x1 = RECT_X1,
  y1 = RECT_Y1,
  x2 = RECT_X1 + RECT_WIDTH,
  y2 = RECT_Y1 + RECT_HEIGHT
) {
  const randX = random(min(x1, x2), max(x1, x2));
  const randY = random(min(y1, y2), max(y1, y2));
  return createVector(randX, randY);
}

function randomUnitVector() {
  return p5.Vector.fromAngle(random(TWO_PI));
}

function calcPoint2(point1, dir, len = NEEDLE_LENGTH) {
  return p5.Vector.add(point1, dir.copy().mult(len));
}

function checkCross(needle) {
  const { p1, p2 } = needle;
  return findRegion(p1) !== findRegion(p2);
}

function findRegion(point) {
  for (let i = 0; i <= TOTAL_LINES; i++) {
    const y1 = RECT_Y1 + i * NEEDLE_LENGTH;
    if (point.y > y1 && point.y < y1 + NEEDLE_LENGTH) {
      return `${y1}-${y1 + NEEDLE_LENGTH}`;
    }
  }
  return -1;
}

function countCrosses() {
  const totalCrosses = needles.filter((needle) => checkCross(needle)).length;
  if (totalCrosses === 0) {
    console.warn("Total crosses is zero!");
  }
  return totalCrosses;
}

function evaluatePI(totalCrosses) {
  const totalNeedles = needles.length;
  return totalCrosses === 0 ? 0 : (2 * totalNeedles) / totalCrosses;
}

function showReport() {
  const x1 = RECT_X1 + RECT_WIDTH + GRAPH_MARGIN_LEFT;
  const y1 = RECT_Y1 + GRAPH_HEIGHT + REPORT_MARGIN_TOP;
  stroke(5);
  const totalCrosses = countCrosses();
  let pi = evaluatePI(totalCrosses);
  let error = calcError(pi);
  errors.push(error);
  let errorPercentage = calcPercentageError(error);
  pi = roundTo(pi, 5);
  error = roundTo(error, 5);
  errorPercentage = roundTo(errorPercentage, 5);
  fill(REPORT_BOX_COLOR);
  rect(x1, y1, GRAPH_WIDTH, REPORT_HEIGHT);
  noStroke();
  textSize(REPORT_TEXT_SIZE);
  showText(`π ${pi}`, x1 + 10, y1 + REPORT_MARGIN_TOP + 20, PI_REPORT_COLOR);
  showText(
    `ε    ${error}`,
    x1 + 160,
    y1 + REPORT_MARGIN_TOP + 20,
    ERROR_REPORT_COLOR
  );
  showText(
    `✘ ${totalCrosses}/${needles.length}`,
    x1 + 10,
    y1 + REPORT_MARGIN_TOP + 55,
    CROSS_REPORT_COLOR
  );
  showText(
    `ε% ${errorPercentage}`,
    x1 + 160,
    y1 + REPORT_MARGIN_TOP + 55,
    ERROR_REPORT_COLOR
  );
  textSize(15);
  showText("Speed", RECT_X1 + 155, RECT_Y1 + RECT_HEIGHT + 85, "#000");
  showText("Graph interval", RECT_X1 + 305, RECT_Y1 + RECT_HEIGHT + 85, "#000");
}

function showText(txt, x, y, fillColor) {
  fill(fillColor);
  text(txt, x, y);
}

function roundTo(num, decimals) {
  const factor = pow(10, decimals);
  return round(num * factor) / factor;
}

function resetSimulation() {
  needles = [];
  errors = [];
  loop();
}

function pauseSimulation() {
  noLoop();
  looping = false;
  pauseButton.html("Resume");
}

function resumeSimulation() {
  loop();
  looping = true;
  pauseButton.html("Pause");
}

function toggleSimulation() {
  if (needles.length === TOTAL_NEEDLES) return;
  if (looping) {
    pauseSimulation();
  } else {
    resumeSimulation();
  }
}

function calcError(estimated, expected = Math.PI) {
  const err = abs(estimated - expected);
  if (err > 1) return 0.99999;
  return err;
}

function calcPercentageError(error, expected = Math.PI) {
  return (error / expected) * 100;
}

function graph() {
  stroke(0);
  const strokewidth = 5;
  const halfStrokewidth = strokewidth / 2;
  strokeWeight(strokewidth);
  noFill();
  const x1 = RECT_X1 + RECT_WIDTH + GRAPH_MARGIN_LEFT;
  const y1 = RECT_Y1;
  const x2 = x1 + GRAPH_WIDTH;
  const y2 = y1 + GRAPH_HEIGHT;
  rect(x1, y1, GRAPH_WIDTH, GRAPH_HEIGHT);
  stroke(255, 0, 0);
  strokeWeight(2);
  beginShape();
  let interval = errorIntervalSlider.value();
  for (let index = 0; index < needles.length; index += interval) {
    const error = errors[index];
    const x = map(
      index,
      0,
      TOTAL_NEEDLES,
      x1 + halfStrokewidth,
      x2 - halfStrokewidth
    );
    const y = map(error, 0, 1, y2 - halfStrokewidth, y1 + halfStrokewidth);
    vertex(x, y);
  }

  endShape();
}
