import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/trainings', label: 'Trainings' },
  { to: '/admin/assignments', label: 'Assignments' },
  { to: '/admin/tests', label: 'Tests' },
  { to: '/admin/certificates', label: 'Certificates' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/reports', label: 'Reports' },
];

export default function AdminSidebar() {
  return (
    <aside className="sidebar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </aside>
  );
}
