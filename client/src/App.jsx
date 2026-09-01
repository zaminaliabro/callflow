import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import Spinner from './components/Spinner.jsx'

import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import CustomerDetailPage from './pages/CustomerDetailPage.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AgentsPage from './pages/admin/AgentsPage.jsx'
import AgentDetailPage from './pages/admin/AgentDetailPage.jsx'
import CustomersPage from './pages/admin/CustomersPage.jsx'
import CallLogPage from './pages/admin/CallLogPage.jsx'

import AgentDashboard from './pages/agent/AgentDashboard.jsx'
import MyCustomersPage from './pages/agent/MyCustomersPage.jsx'
import CallConsolePage from './pages/agent/CallConsolePage.jsx'

export default function App() {
  const { loading, user } = useAuth()
  if (loading) return <Spinner label="Starting CallFlow…" />

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin */}
      <Route
        element={
          <ProtectedRoute role="ADMIN">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/agents" element={<AgentsPage />} />
        <Route path="/admin/agents/:id" element={<AgentDetailPage />} />
        <Route path="/admin/customers" element={<CustomersPage />} />
        <Route path="/admin/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/admin/calls" element={<CallLogPage />} />
      </Route>

      {/* Agent */}
      <Route
        element={
          <ProtectedRoute role="AGENT">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/customers" element={<MyCustomersPage />} />
        <Route path="/agent/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/agent/call" element={<CallConsolePage />} />
      </Route>

      <Route
        path="/"
        element={
          <Navigate to={user ? (user.role === 'ADMIN' ? '/admin' : '/agent') : '/login'} replace />
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
