import { useState, useEffect, useCallback } from "react";
import "./App.css";

interface Car {
  brand: string;
  model: string;
  length_mm: number;
  width_mm: number;
  color: string;
  custom?: boolean;
}

const DEFAULT_CARS: Car[] = [
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

const RANDOM_COLORS = [
  "#E91E63", "#9C27B0", "#3F51B5", "#009688", "#795548",
  "#607D8B", "#FF5722", "#CDDC39", "#00BCD4", "#4CAF50",
];

function loadCustomCars(): Car[] {
  try {
    const raw = localStorage.getItem("customCars");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadGarage(): { width: number; length: number } {
  try {
    const raw = localStorage.getItem("garage");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { width: 2500, length: 5000 };
}

function loadUnit(): "cm" | "m" {
  return localStorage.getItem("unit") === "m" ? "m" : "cm";
}

type Unit = "cm" | "m";

function mmToDisplay(mm: number, unit: Unit): number {
  return unit === "cm" ? mm / 10 : mm / 1000;
}

function displayToMm(val: number, unit: Unit): number {
  return unit === "cm" ? val * 10 : val * 1000;
}

function App() {
  const [garageW_mm, setGarageW_mm] = useState(() => loadGarage().width);
  const [garageL_mm, setGarageL_mm] = useState(() => loadGarage().length);
  const [unit, setUnit] = useState<Unit>(() => loadUnit());
  const [customCars, setCustomCars] = useState<Car[]>(() => loadCustomCars());
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [formBrand, setFormBrand] = useState("");
  const [formModel, setFormModel] = useState("");
  const [formLength, setFormLength] = useState("");
  const [formWidth, setFormWidth] = useState("");

  // Merge and sort all cars by length
  const allCars: Car[] = [...DEFAULT_CARS, ...customCars.map(c => ({ ...c, custom: true }))]
    .sort((a, b) => a.length_mm - b.length_mm);

  // Persist garage
  useEffect(() => {
    localStorage.setItem("garage", JSON.stringify({ width: garageW_mm, length: garageL_mm }));
  }, [garageW_mm, garageL_mm]);

  // Persist unit
  useEffect(() => {
    localStorage.setItem("unit", unit);
  }, [unit]);

  // Persist custom cars
  useEffect(() => {
    localStorage.setItem("customCars", JSON.stringify(customCars));
  }, [customCars]);

  const toggleCar = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const addCar = () => {
    const lengthCm = parseFloat(formLength);
    const widthCm = parseFloat(formWidth);
    if (!formBrand.trim() || !formModel.trim() || !lengthCm || !widthCm) return;

    const newCar: Car = {
      brand: formBrand.trim(),
      model: formModel.trim(),
      length_mm: lengthCm * 10,
      width_mm: widthCm * 10,
      color: RANDOM_COLORS[customCars.length % RANDOM_COLORS.length],
      custom: true,
    };
    setCustomCars((prev) => [...prev, newCar]);
    setFormBrand("");
    setFormModel("");
    setFormLength("");
    setFormWidth("");
    setShowForm(false);
  };

  const removeCar = (car: Car) => {
    setCustomCars((prev) =>
      prev.filter((c) => !(c.brand === car.brand && c.model === car.model && c.length_mm === car.length_mm))
    );
    setSelected(new Set());
  };

  // SVG dimensions and scaling
  const svgWidth = 500;
  const svgHeight = 600;
  const padding = 40;

  const scaleX = (svgWidth - padding * 2) / garageW_mm;
  const scaleY = (svgHeight - padding * 2) / garageL_mm;
  const scale = Math.min(scaleX, scaleY);

  const garagePxW = garageW_mm * scale;
  const garagePxH = garageL_mm * scale;
  const garageX = (svgWidth - garagePxW) / 2;
  const garageY = (svgHeight - garagePxH) / 2;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  const step = unit === "cm" ? 1 : 0.1;
  const unitLabel = unit;

  const garageWidthDisplay = mmToDisplay(garageW_mm, unit);
  const garageLengthDisplay = mmToDisplay(garageL_mm, unit);

  const formatDim = (mm: number) =>
    `${(mm / 1000).toFixed(2)}m`;

  return (
    <div className="app">
      <h1>Entra en la cochera?</h1>

      <div className="main-layout">
        <div className="left-col">
          <div className="garage-inputs">
            <h3>
              Cochera
              <span className="unit-toggle">
                <button
                  className={unit === "cm" ? "active" : ""}
                  onClick={() => setUnit("cm")}
                >
                  cm
                </button>
                <button
                  className={unit === "m" ? "active" : ""}
                  onClick={() => setUnit("m")}
                >
                  m
                </button>
              </span>
            </h3>
            <div className="input-row">
              <label>
                Ancho:
                <input
                  type="number"
                  step={step}
                  min={unit === "cm" ? 100 : 1}
                  max={unit === "cm" ? 1000 : 10}
                  value={parseFloat(garageWidthDisplay.toFixed(unit === "cm" ? 0 : 2))}
                  onChange={(e) => setGarageW_mm(displayToMm(Number(e.target.value), unit))}
                />
                <span className="unit">{unitLabel}</span>
              </label>
              <label>
                Largo:
                <input
                  type="number"
                  step={step}
                  min={unit === "cm" ? 100 : 1}
                  max={unit === "cm" ? 1500 : 15}
                  value={parseFloat(garageLengthDisplay.toFixed(unit === "cm" ? 0 : 2))}
                  onChange={(e) => setGarageL_mm(displayToMm(Number(e.target.value), unit))}
                />
                <span className="unit">{unitLabel}</span>
              </label>
            </div>
          </div>

          <div className="visualization">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
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

              <text x={centerX} y={garageY - 8} textAnchor="middle" fill="#666" fontSize={13}>
                Cochera {formatDim(garageW_mm)} x {formatDim(garageL_mm)}
              </text>

              <text x={centerX} y={garageY + garagePxH + 20} textAnchor="middle" fill="#999" fontSize={11}>
                {formatDim(garageW_mm)}
              </text>

              <text
                x={garageX - 10}
                y={centerY}
                textAnchor="end"
                fill="#999"
                fontSize={11}
                transform={`rotate(-90 ${garageX - 10} ${centerY})`}
              >
                {formatDim(garageL_mm)}
              </text>

              {[...selected].map((i) => {
                const car = allCars[i];
                if (!car) return null;
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
        </div>

        <div className="right-col">
          <h3>
            Autos
            <button className="add-car-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? "Cancelar" : "+ Agregar"}
            </button>
          </h3>

          {showForm && (
            <div className="add-car-form">
              <input
                placeholder="Marca"
                value={formBrand}
                onChange={(e) => setFormBrand(e.target.value)}
              />
              <input
                placeholder="Modelo"
                value={formModel}
                onChange={(e) => setFormModel(e.target.value)}
              />
              <input
                type="number"
                placeholder="Largo (cm)"
                value={formLength}
                onChange={(e) => setFormLength(e.target.value)}
              />
              <input
                type="number"
                placeholder="Ancho (cm)"
                value={formWidth}
                onChange={(e) => setFormWidth(e.target.value)}
              />
              <button className="confirm-btn" onClick={addCar}>Agregar</button>
            </div>
          )}

          <div className="car-list">
            {allCars.map((car, i) => (
              <label key={`${car.brand}-${car.model}-${car.length_mm}`} className="car-checkbox">
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleCar(i)}
                />
                <span
                  className="color-dot"
                  style={{ backgroundColor: car.color }}
                />
                <span className="car-name">{car.brand} {car.model}</span>
                <span className="car-dims">
                  {formatDim(car.length_mm)} x {formatDim(car.width_mm)}
                </span>
                {car.custom && (
                  <button
                    className="remove-car-btn"
                    onClick={(e) => { e.preventDefault(); removeCar(car); }}
                    title="Eliminar"
                  >
                    x
                  </button>
                )}
              </label>
            ))}
          </div>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="summary">
          <h3>Resumen</h3>
          <div className="table-wrap">
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
                  const car = allCars[i];
                  if (!car) return null;
                  const marginW = garageW_mm - car.width_mm;
                  const marginL = garageL_mm - car.length_mm;
                  const fits = marginW >= 0 && marginL >= 0;
                  return (
                    <tr key={i} className={fits ? "fits" : "no-fits"}>
                      <td>
                        <span className="color-dot" style={{ backgroundColor: car.color }} />
                        {car.brand} {car.model}
                      </td>
                      <td>{formatDim(car.width_mm)}</td>
                      <td>{formatDim(car.length_mm)}</td>
                      <td>{(marginW / 10).toFixed(0)}cm</td>
                      <td>{(marginL / 10).toFixed(0)}cm</td>
                      <td className="result">{fits ? "ENTRA" : "NO ENTRA"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
