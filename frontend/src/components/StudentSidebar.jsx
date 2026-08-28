import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard', end: true },
  { to: '/dashboard/courses', label: 'My Courses' },
  { to: '/dashboard/trainings', label: 'My Trainings' },
  { to: '/dashboard/assignments', label: 'Assignments' },
  { to: '/dashboard/tests', label: 'Tests' },
  { to: '/dashboard/certificates', label: 'Certificates' },
  { to: '/dashboard/payments', label: 'Payments' },
  { to: '/dashboard/profile', label: 'Profile' },
  { to: '/dashboard/change-password', label: 'Change Password' },
];

export default function StudentSidebar() {
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
