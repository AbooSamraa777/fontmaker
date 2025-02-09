import { useState, useRef, useEffect } from 'react';

function DrawingModal({ char, onSave, onClose, initialPath }) {
  const [currentPaths, setCurrentPaths] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isErasing, setIsErasing] = useState(false);
  const svgRef = useRef();

  useEffect(() => {
    if (initialPath) {
      const commands = initialPath.split(/ (?=M|L)/);
      const points = commands.map(cmd => {
        const [type, x, y] = cmd.split(' ');
        return { type, x: parseFloat(x), y: parseFloat(y) };
      });
      setCurrentPaths([points]);
    }
  }, [initialPath]);

  const getSVGPoint = (clientX, clientY) => {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.viewBox.baseVal;
    return {
      x: ((clientX - rect.left) / rect.width) * viewBox.width,
      y: ((clientY - rect.top) / rect.height) * viewBox.height,
    };
  };

  const handlePointerDown = (e) => {
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    const { x, y } = getSVGPoint(clientX, clientY);
    setIsDrawing(true);
    if (isErasing) {
      setCurrentPaths(prev => prev.map(path => path.filter(point => Math.hypot(point.x - x, point.y - y) > 20)));
    } else {
      setCurrentPaths(prev => [...prev, [{ type: 'M', x, y }]]);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || isErasing) return;
    const { clientX, clientY } = e.touches ? e.touches[0] : e;
    const { x, y } = getSVGPoint(clientX, clientY);
    setCurrentPaths(prev => {
      const newPaths = [...prev];
      newPaths[newPaths.length - 1] = [...newPaths[newPaths.length - 1], { type: 'L', x, y }];
      return newPaths;
    });
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const pathData = currentPaths
      .map(path => path.map(point => `${point.type} ${point.x} ${point.y}`).join(' '))
      .join(' ');
    onSave(char, pathData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Draw {char}</h2>
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          style={{ touchAction: 'none', width: '500px', height: '500px', border: '1px solid #000' }}
        >
          {currentPaths.map((path, index) => (
            <path
              key={index}
              d={path.map(point => `${point.type} ${point.x} ${point.y}`).join(' ')}
              stroke="black"
              fill="none"
              strokeWidth="20"
            />
          ))}
        </svg>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Close</button>
        <button onClick={() => setIsErasing(!isErasing)}>{isErasing ? 'Stop Erasing' : 'Erase'}</button>
      </div>
    </div>
  );
}

export default DrawingModal;