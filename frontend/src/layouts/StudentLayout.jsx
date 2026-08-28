import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar.jsx';

export default function StudentLayout() {
  return (
    <div className="dashboard-layout container">
      <StudentSidebar />
      <div className="dashboard-content">
        <Outlet />
      </div>
    </div>
  );
}
