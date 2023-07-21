import React, { useState, useCallback } from "react";
import { Stage, Layer, Line, Rect, Circle, Text } from "react-konva";

const CirclePoint = ({ point, selected, onDragMove, onClick, onMouseEnter, onMouseLeave }) => {
  return (
    <Circle
      x={point.x}
      y={point.y}
      radius={selected ? 12 : 10}
      fill={selected ? "green" : "red"}
      draggable
      onDragMove={onDragMove}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
};

const LineSegment = ({ point1, point2 }) => {
  const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <>
      <Line
        points={[point1.x, point1.y, point2.x, point2.y]}
        stroke="black"
        strokeWidth={4}
      />
      <Text
        x={(point1.x + point2.x) / 2}
        y={(point1.y + point2.y) / 2 - 20}
        text={`${calculateDistance(point1, point2).toFixed(0)} cm`}
        fontSize={15}
        fill="black"
      />
    </>
  );
};

const Angle = ({ point1, point2, point3 }) => {
  const calculateAngle = (point1, point2, point3) => {
    const dx1 = point2.x - point1.x;
    const dy1 = point2.y - point1.y;
    const dx2 = point3.x - point2.x;
    const dy2 = point3.y - point2.y;
    let angle = Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1);
    if (angle < 0) angle += 2 * Math.PI;
    angle = Math.round(angle * 180 / Math.PI);
    return angle > 180 ? 360 - angle : angle;
  };

  return (
    <Text
      x={point2.x}
      y={point2.y - 40}
      text={`${calculateAngle(point1, point2, point3)}°`}
      fontSize={15}
      fill="black"
    />
  );
};

const DrawingBoard = () => {
  const [points, setPoints] = useState([
    { x: 100, y: 100 },
    { x: 100, y: 900 },
    { x: 900, y: 900 },
    { x: 900, y: 100 }
  ]);
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [selectedCircle, setSelectedCircle] = useState(null);

  const updatePoint = useCallback((i, x, y) => {
    setPoints(points.map((point, index) => (index === i ? { x, y } : point)));
  }, [points, setPoints]);

  const handleCircleClick = useCallback((i) => {
    setSelectedCircle(i);
  }, [setSelectedCircle]);

  const handleCircleMouseEnter = useCallback((i) => {
    setSelectedCircle(i);
  }, [setSelectedCircle]);

  const handleCircleMouseLeave = useCallback(() => {
    setSelectedCircle(null);
  }, [setSelectedCircle]);

  const handleWheel = useCallback(e => {
    e.evt.preventDefault();

    const scaleBy = 1.02;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointerPos = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointerPos.x - stage.x()) / oldScale,
      y: (pointerPos.y - stage.y()) / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    setStageScale(newScale);
    setStagePosition({
      x: pointerPos.x - mousePointTo.x * newScale,
      y: pointerPos.y - mousePointTo.y * newScale
    });
  }, [setStageScale, setStagePosition]);

  const handleDragStart = useCallback(e => {
    const stage = e.target.getStage();
    setStagePosition({ x: stage.x(), y: stage.y() });
  }, [setStagePosition]);

  const handleDragMove = useCallback(e => {
    const stage = e.target.getStage();
    setStagePosition({ x: stage.x(), y: stage.y() });
  }, [setStagePosition]);

  // ... rest of your code ...

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePosition.x}
      y={stagePosition.y}
      draggable
      onWheel={handleWheel}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
    >
      <Layer>
        <Rect
          width={window.innerWidth}
          height={window.innerHeight}
          fill="#f9f9f9"
        />
        {/* ... rest of your code ... */}
        {points.map((point, i) => (
          i < points.length - 1 && 
          <LineSegment key={i} point1={point} point2={points[i + 1]} />
        ))}
        {points.map((point, i) => (
          i > 0 && i < points.length - 1 &&
          <Angle key={i} point1={points[i - 1]} point2={point} point3={points[i + 1]} />
        ))}
        {points.map((point, i) => (
          <CirclePoint
            key={i}
            point={point}
            selected={selectedCircle === i}
            onDragMove={e => updatePoint(i, e.target.x(), e.target.y())}
            onClick={() => handleCircleClick(i)}
            onMouseEnter={() => handleCircleMouseEnter(i)}
            onMouseLeave={handleCircleMouseLeave}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default DrawingBoard;
