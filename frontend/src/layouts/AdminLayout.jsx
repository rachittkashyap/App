import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';

export default function AdminLayout() {
  return (
    <div className="dashboard-layout container">
      <AdminSidebar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}
