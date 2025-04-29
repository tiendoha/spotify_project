import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/auth/authSlice";
import {
  FaUsers,
  FaMicrophone,
  FaCompactDisc,
  FaMusic,
  FaSignOutAlt,
  FaListAlt,
  FaUserPlus, 
  FaHeart, 
  FaChartBar, 
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Xóa thông tin đăng nhập khỏi localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_id');
    
    
    // Cập nhật trạng thái Redux
    dispatch(logout());
    
    // Chuyển hướng về trang đăng nhập
    navigate('/login');
  };

  return (
    <aside className="bg-gray-900 text-white w-64 fixed top-16 left-0 h-[calc(100vh-4rem)] flex flex-col shadow-lg z-40">
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {[
            { href: "/admin/users", label: "Người dùng", icon: <FaUsers /> },
            { href: "/admin/artists", label: "Nghệ sĩ", icon: <FaMicrophone /> },
            { href: "/admin/albums", label: "Album", icon: <FaCompactDisc /> },
            { href: "/admin/tracks", label: "Bài hát", icon: <FaMusic /> },
            { href: "/admin/playlists", label: "Playlist", icon: <FaListAlt /> },
            {
              href: "/admin/followers",
              label: "Theo dõi nghệ sĩ",
              icon: <FaUserPlus />,
            },
            { href: "/admin/likes", label: "Lượt thích bài hát", icon: <FaHeart /> },
            { href: "/admin/statistics", label: "Thống kê", icon: <FaChartBar /> },
          ].map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
                  ${
                    location.pathname === item.href
                    ? "bg-gray-800 text-white" 
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
              >
                <span className={`text-lg transition-colors
                  ${location.pathname === item.href 
                    ? "text-green-400" 
                    : "group-hover:text-green-400"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Nút đăng xuất */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <FaSignOutAlt className="text-lg" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
