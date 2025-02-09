import { useState } from 'react';
import DrawingModal from './DrawingModal';
import * as opentype from 'opentype.js';

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'.split('');

function App() {
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [letterPaths, setLetterPaths] = useState({});

  const saveLetter = (char, path) => {
    setLetterPaths(prev => ({ ...prev, [char]: path }));
    setSelectedLetter(null);
  };

  const generateFont = () => {
    const glyphs = letters.map(char => {
      const pathData = letterPaths[char];
      if (!pathData) return null;

      const path = new opentype.Path();
      const commands = pathData.split(' ');
      for (let i = 0; i < commands.length; i += 3) {
        const type = commands[i];
        const x = parseFloat(commands[i + 1]);
        const y = parseFloat(commands[i + 2]);
        if (type === 'M') {
          path.moveTo(x, y);
        } else if (type === 'L') {
          path.lineTo(x, y);
        }
      }

      return new opentype.Glyph({
        name: char,
        unicode: char.charCodeAt(0),
        advanceWidth: 1000,
        path: path
      });
    }).filter(glyph => glyph !== null);

    const font = new opentype.Font({
      familyName: 'MyCustomFont',
      styleName: 'Regular',
      unitsPerEm: 1000,
      ascender: 800,
      descender: -200,
      glyphs: glyphs
    });

    font.download();
  };

  return (
    <div className="App">
      <div className="grid">
        {letters.map(char => (
          <button
            key={char}
            className="letter-square"
            onClick={() => setSelectedLetter(char)}
          >
            {char}
            {letterPaths[char] && <svg viewBox="0 0 1000 1000"><path d={letterPaths[char]} /></svg>}
          </button>
        ))}
      </div>
      <button onClick={generateFont}>Save Font</button>
      {selectedLetter && (
        <DrawingModal
          char={selectedLetter}
          onSave={saveLetter}
          onClose={() => setSelectedLetter(null)}
          initialPath={letterPaths[selectedLetter]}
        />
      )}
    </div>
  );
}

export default App;