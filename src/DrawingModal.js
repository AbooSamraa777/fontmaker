import { useState, useRef, useEffect } from 'react';

function DrawingModal({ char, onSave, onClose, initialPath }) {
  const [currentPaths, setCurrentPaths] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
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

  const handleMouseDown = (e) => {
    const { x, y } = getSVGPoint(e.clientX, e.clientY);
    setIsDrawing(true);
    setCurrentPaths(prev => [...prev, [{ type: 'M', x, y }]]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getSVGPoint(e.clientX, e.clientY);
    setCurrentPaths(prev => {
      const newPaths = [...prev];
      newPaths[newPaths.length - 1] = [...newPaths[newPaths.length - 1], { type: 'L', x, y }];
      return newPaths;
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleSave = () => {
    const pathData = currentPaths
      .map(path => path.map((point, i) => `${point.type} ${point.x} ${point.y}`).join(' '))
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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ touchAction: 'none', width: '500px', height: '500px', border: '1px solid #000' }}
        >
          {currentPaths.map((path, index) => (
            <path
              key={index}
              d={path.map((p, i) => `${p.type} ${p.x} ${p.y}`).join(' ')}
              stroke="black"
              fill="none"
              strokeWidth="20"
            />
          ))}
        </svg>
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default DrawingModal;