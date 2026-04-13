import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Statistics from "./pages/Statistics"
import PublicRoute from "./components/PublicRoute/PublicRoute"
import "./styles/global.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        <Route path='/' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path='/stats' element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        } />
        {/* <Route path='/config' element={<Config />} /> */}
              </Routes>
    </BrowserRouter>
  )
}

export default App
