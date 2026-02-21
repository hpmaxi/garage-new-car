import { useState } from "react";
import "./App.css";

interface Car {
  brand: string;
  model: string;
  length_mm: number;
  width_mm: number;
  color: string;
}

const CARS: Car[] = [
  { brand: "Renault", model: "Stepway 2010", length_mm: 4091, width_mm: 1751, color: "#B0BEC5" },
  { brand: "Renault", model: "Kardian", length_mm: 4120, width_mm: 1750, color: "#FDD835" },
  { brand: "VW", model: "T-Cross", length_mm: 4199, width_mm: 1760, color: "#1E88E5" },
  { brand: "Jeep", model: "Renegade", length_mm: 4236, width_mm: 1805, color: "#FF8F00" },
  { brand: "VW", model: "Nivus", length_mm: 4272, width_mm: 1757, color: "#1565C0" },
  { brand: "Chevrolet", model: "Tracker", length_mm: 4304, width_mm: 1791, color: "#E53935" },
  { brand: "Renault", model: "Duster", length_mm: 4341, width_mm: 1813, color: "#F9A825" },
  { brand: "Nissan", model: "Kicks", length_mm: 4365, width_mm: 1800, color: "#8E24AA" },
  { brand: "Jeep", model: "Compass", length_mm: 4404, width_mm: 1819, color: "#FF6F00" },
  { brand: "Toyota", model: "Corolla Cross", length_mm: 4460, width_mm: 1825, color: "#00897B" },
  { brand: "Ford", model: "Kuga", length_mm: 4604, width_mm: 1882, color: "#43A047" },
  { brand: "Nissan", model: "X-Trail", length_mm: 4680, width_mm: 1840, color: "#AB47BC" },
  { brand: "Ford", model: "Territory", length_mm: 4685, width_mm: 1936, color: "#2E7D32" },
];

function App() {
  const [garageWidth, setGarageWidth] = useState(2.5);
  const [garageLength, setGarageLength] = useState(5.0);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleCar = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // SVG dimensions and scaling
  const svgWidth = 500;
  const svgHeight = 600;
  const padding = 40;

  const garageW_mm = garageWidth * 1000;
  const garageL_mm = garageLength * 1000;

  const scaleX = (svgWidth - padding * 2) / garageW_mm;
  const scaleY = (svgHeight - padding * 2) / garageL_mm;
  const scale = Math.min(scaleX, scaleY);

  const garagePxW = garageW_mm * scale;
  const garagePxH = garageL_mm * scale;
  const garageX = (svgWidth - garagePxW) / 2;
  const garageY = (svgHeight - garagePxH) / 2;

  // Center of garage in SVG coords
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  return (
    <div className="app">
      <h1>Entra en la cochera?</h1>

      <div className="controls">
        <div className="garage-inputs">
          <h3>Cochera (metros)</h3>
          <div className="input-row">
            <label>
              Ancho:
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={garageWidth}
                onChange={(e) => setGarageWidth(Number(e.target.value))}
              />
              <span className="unit">m</span>
            </label>
            <label>
              Largo:
              <input
                type="number"
                step="0.1"
                min="1"
                max="15"
                value={garageLength}
                onChange={(e) => setGarageLength(Number(e.target.value))}
              />
              <span className="unit">m</span>
            </label>
          </div>
        </div>

        <div className="car-selector">
          <h3>Autos (ordenados por largo)</h3>
          <div className="car-list">
            {CARS.map((car, i) => (
              <label key={i} className="car-checkbox">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleCar(i)}
                />
                <span
                  className="color-dot"
                  style={{ backgroundColor: car.color }}
                />
                {car.brand} {car.model}
                <span className="car-dims">
                  {(car.length_mm / 1000).toFixed(2)} x{" "}
                  {(car.width_mm / 1000).toFixed(2)}m
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="visualization">
        <svg width={svgWidth} height={svgHeight}>
          {/* Garage rectangle */}
          <rect
            x={garageX}
            y={garageY}
            width={garagePxW}
            height={garagePxH}
            fill="#f5f5f5"
            stroke="#333"
            strokeWidth={2}
            strokeDasharray="8 4"
          />

          {/* Garage label */}
          <text
            x={centerX}
            y={garageY - 8}
            textAnchor="middle"
            fill="#666"
            fontSize={13}
          >
            Cochera {garageWidth.toFixed(1)}m x {garageLength.toFixed(1)}m
          </text>

          {/* Width dimension */}
          <text
            x={centerX}
            y={garageY + garagePxH + 20}
            textAnchor="middle"
            fill="#999"
            fontSize={11}
          >
            {garageWidth.toFixed(2)}m
          </text>

          {/* Length dimension */}
          <text
            x={garageX - 10}
            y={centerY}
            textAnchor="end"
            fill="#999"
            fontSize={11}
            transform={`rotate(-90 ${garageX - 10} ${centerY})`}
          >
            {garageLength.toFixed(2)}m
          </text>

          {/* Selected cars */}
          {[...selected].map((i) => {
            const car = CARS[i];
            const carPxW = car.width_mm * scale;
            const carPxH = car.length_mm * scale;
            const carX = centerX - carPxW / 2;
            const carY = centerY - carPxH / 2;

            const fitsWidth = car.width_mm <= garageW_mm;
            const fitsLength = car.length_mm <= garageL_mm;
            const fits = fitsWidth && fitsLength;

            return (
              <g key={i}>
                <rect
                  x={carX}
                  y={carY}
                  width={carPxW}
                  height={carPxH}
                  fill={car.color}
                  fillOpacity={0.35}
                  stroke={car.color}
                  strokeWidth={2}
                />
                <text
                  x={centerX}
                  y={carY + carPxH / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={car.color}
                  fontSize={12}
                  fontWeight="bold"
                >
                  {car.brand} {car.model}
                </text>
                <text
                  x={centerX}
                  y={carY + carPxH / 2 + 16}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={fits ? "#2E7D32" : "#C62828"}
                  fontSize={11}
                  fontWeight="bold"
                >
                  {fits ? "ENTRA" : "NO ENTRA"}
                  {!fitsWidth && ` (ancho: +${((car.width_mm - garageW_mm) / 10).toFixed(0)}cm)`}
                  {!fitsLength && ` (largo: +${((car.length_mm - garageL_mm) / 10).toFixed(0)}cm)`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Summary table */}
      {selected.size > 0 && (
        <div className="summary">
          <h3>Resumen</h3>
          <table>
            <thead>
              <tr>
                <th>Auto</th>
                <th>Ancho</th>
                <th>Largo</th>
                <th>Margen ancho</th>
                <th>Margen largo</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {[...selected].map((i) => {
                const car = CARS[i];
                const marginW = garageW_mm - car.width_mm;
                const marginL = garageL_mm - car.length_mm;
                const fits = marginW >= 0 && marginL >= 0;
                return (
                  <tr key={i} className={fits ? "fits" : "no-fits"}>
                    <td>
                      <span className="color-dot" style={{ backgroundColor: car.color }} />
                      {car.brand} {car.model}
                    </td>
                    <td>{(car.width_mm / 1000).toFixed(2)}m</td>
                    <td>{(car.length_mm / 1000).toFixed(2)}m</td>
                    <td>{(marginW / 10).toFixed(0)}cm</td>
                    <td>{(marginL / 10).toFixed(0)}cm</td>
                    <td className="result">{fits ? "ENTRA" : "NO ENTRA"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
