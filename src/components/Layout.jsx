/* eslint-disable react/prop-types */
import { SidebarPage } from '../pages/Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      <SidebarPage />
      <div className="flex-1  bg-black w-full px-10">
        {children}
      </div>
    </div>
  );
};

export default Layout;
