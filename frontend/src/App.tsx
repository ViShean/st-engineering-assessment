import { DataTableScreen } from "./screens/DataViewScreen";
import { LandingScreen } from "./screens/LandingScreen";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LandingScreen />} />

          <Route path="/comments" element={<DataTableScreen />} />

          {/* if user types a random URL, send them home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
