import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import CVCustomiser from './CVCusstomiser';
import WebsiteLogin from './WebsiteLogin';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<WebsiteLogin />} />
          <Route path="/customiser" element={<CVCustomiser />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
