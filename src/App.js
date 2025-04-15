import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BookDiscoveryPage from './pages/BookDiscoveryPage';  // Keep your original page
import BookDetailPage from './pages/BookDetailPage';
import BookshelfPage from './pages/BookshelfPage';
import AddBookPage from './pages/AddBookPage';
import ProfilePage from './pages/ProfilePage';

// Simple auth check
const PrivateRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={<PrivateRoute element={<DashboardPage />} />} 
        />
        <Route 
          path="/discovery" 
          element={<PrivateRoute element={<BookDiscoveryPage />} />} 
        />
        <Route 
          path="/mystery" 
          element={<PrivateRoute element={<BookDiscoveryPage />} />} 
        />
        <Route 
          path="/books/:id" 
          element={<PrivateRoute element={<BookDetailPage />} />} 
        />
        <Route 
          path="/bookshelf" 
          element={<PrivateRoute element={<BookshelfPage />} />} 
        />
        <Route 
          path="/add-book" 
          element={<PrivateRoute element={<AddBookPage />} />} 
        />
        <Route 
          path="/edit-book/:id" 
          element={<PrivateRoute element={<AddBookPage />} />} 
        />
        <Route 
          path="/profile" 
          element={<PrivateRoute element={<ProfilePage />} />} 
        />
        {/* Redirect any unknown routes to Dashboard if logged in, or Welcome if not */}
        <Route 
          path="*" 
          element={
            localStorage.getItem('token') ? 
            <Navigate to="/dashboard" /> : 
            <Navigate to="/" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;