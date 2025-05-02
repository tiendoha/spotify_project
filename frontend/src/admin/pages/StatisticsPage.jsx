import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTracks } from "../redux/tracks/trackSlice";
import { fetchLikes } from "../redux/likes/likeSlice";
import { fetchFollowers } from "../redux/followers/followerSlice";
import { fetchUsers } from "../redux/users/userSlice";
import { fetchArtists } from "../redux/artists/artistSlice"; // Import fetchArtists
import { Bar, Line } from "react-chartjs-2"; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement, // Add this back
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BsGrid3X3Gap } from 'react-icons/bs';
import { HiChartBar } from 'react-icons/hi';

// Đăng ký các thành phần Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  LineElement, // Add this back
  Title,
  Tooltip,
  Legend
);

const StatisticsPage = () => {
  const dispatch = useDispatch();
  const { tracks, status: trackStatus } = useSelector((state) => state.tracks);
  const { likes, status: likeStatus } = useSelector((state) => state.likes);
  const { followers, status: followerStatus } = useSelector(
    (state) => state.followers
  );
  const { users, status: userStatus } = useSelector((state) => state.users);
  const { artists, status: artistStatus } = useSelector((state) => state.artists); // Get artists state
  const [viewMode, setViewMode] = useState("grid");
  const [artistStats, setArtistStats] = useState([]); // State for artist stats
  const [calculating, setCalculating] = useState(false); // State for calculation status
  const [selectedArtistId, setSelectedArtistId] = useState("all"); // State for selected artist ID ('all' or artist.id)
  const [trackStats, setTrackStats] = useState([]); // State for track stats

  useEffect(() => {
    dispatch(fetchTracks());
    dispatch(fetchLikes());
    dispatch(fetchFollowers());
    dispatch(fetchUsers());
    dispatch(fetchArtists()); // Dispatch fetchArtists
  }, [dispatch]);

  // Effect to calculate overall artist stats when all data is loaded
  useEffect(() => {
    if (
      trackStatus === "succeeded" &&
      likeStatus === "succeeded" &&
      followerStatus === "succeeded" &&
      userStatus === "succeeded" &&
      artistStatus === "succeeded"
    ) {
      setCalculating(true);
      const calculatedStats = artists.map((artist) => {
        // Count tracks for the artist
        const artistTracks = tracks.filter((track) => track.artist === artist.id);
        const trackCount = artistTracks.length;

        // Count likes for the artist's tracks
        const artistTrackIds = artistTracks.map((track) => track.id);
        const likeCount = likes.filter((like) =>
          artistTrackIds.includes(like.track)
        ).length;

        // Count followers for the artist
        const followerCount = followers.filter(
          (follower) => follower.artist === artist.id
        ).length;

        return {
          id: artist.id,
          name: artist.name,
          trackCount,
          likeCount,
          followerCount,
        };
      });
      setArtistStats(calculatedStats);
      setCalculating(false);
    } else {
      // Reset stats if data is loading or failed
      setArtistStats([]);
    }
  }, [
    artists,
    tracks,
    likes,
    followers,
    trackStatus,
    likeStatus,
    followerStatus,
    userStatus,
    artistStatus,
  ]);

  // Add new useEffect to calculate track likes
  useEffect(() => {
    if (trackStatus === "succeeded" && likeStatus === "succeeded" && artistStatus === "succeeded") {
      const trackLikesMap = tracks.map(track => {
        const likeCount = likes.filter(like => like.track === track.id).length;
        return {
          id: track.id,
          name: track.name,
          likeCount,
          artist: artists.find(a => a.id === track.artist)?.name || 'Unknown Artist'
        };
      });

      const sortedTracks = trackLikesMap.sort((a, b) => b.likeCount - a.likeCount);
      setTrackStats(sortedTracks);
    }
  }, [tracks, likes, trackStatus, likeStatus, artists, artistStatus]);

  // Sửa lại hàm tính số người dùng mới
  const getNewUsersCount = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return users.filter((user) => {
      const joinDate = new Date(user.date_joined);
      return joinDate >= thirtyDaysAgo && joinDate <= new Date();
    }).length;
  };

  // Dữ liệu thống kê tổng quan
  const stats = {
    songs: tracks.length,
    likes: likes.length,
    followers: followers.length,
    newUsers: getNewUsersCount(),
  };

  // Prepare data for Bar Chart
  const getBarData = () => {
    // --- Data for Selected Artist ---
    if (selectedArtistId !== "all") {
       const stat = artistStats.find(s => s.id === parseInt(selectedArtistId));
       if (!stat) return { labels: [], datasets: [] }; // Should not happen

       return {
         labels: ["Số bài hát", "Tổng lượt thích", "Lượt theo dõi"],
         datasets: [
           {
             label: `Thống kê - ${stat.name}`,
             data: [stat.trackCount, stat.likeCount, stat.followerCount],
             backgroundColor: [
               "rgba(54, 162, 235, 0.6)", // Blue for tracks
               "rgba(75, 192, 192, 0.6)", // Green for likes
               "rgba(255, 206, 86, 0.6)", // Yellow for followers
             ],
             borderColor: [
               "rgba(54, 162, 235, 1)",
               "rgba(75, 192, 192, 1)",
               "rgba(255, 206, 86, 1)",
             ],
             borderWidth: 1,
           },
         ],
       };
    }

    // --- Data for "All Artists" (Overall) ---
    return {
      labels: ["Tổng Bài hát", "Tổng Lượt thích", "Tổng Lượt theo dõi", "Người dùng mới"],
      datasets: [
        {
          label: "Thống kê Tổng quan",
          data: [stats.songs, stats.likes, stats.followers, stats.newUsers],
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)", // Blue
            "rgba(75, 192, 192, 0.6)", // Green
            "rgba(255, 206, 86, 0.6)", // Yellow
            "rgba(153, 102, 255, 0.6)", // Purple
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(153, 102, 255, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Add function to get line chart data
  const getTopTracksLineData = () => {
    const topTracks = trackStats.slice(0, 5); // Get top 5 tracks
    
    return {
      labels: topTracks.map(track => track.name),
      datasets: [
        {
          label: 'Lượt thích',
          data: topTracks.map(track => track.likeCount),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          pointBackgroundColor: 'rgb(75, 192, 192)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(75, 192, 192)'
        }
      ]
    };
  };

  // Add options for line chart
  const getTopTracksLineOptions = () => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Top 5 Bài hát được yêu thích nhất',
        font: { size: 16 }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  });

  // --- Chart Options ---
  const getChartOptions = () => {
    let titleText = "";
    const selectedArtistName = selectedArtistId !== 'all'
      ? artists.find(a => a.id === parseInt(selectedArtistId))?.name || ''
      : '';

    if (viewMode === "bar") {
      titleText = selectedArtistId === 'all'
        ? "Thống kê Tổng quan"
        : `Thống kê - ${selectedArtistName}`;
    } else {
      titleText = "Tổng quan";
    }

    return {
      responsive: true,
      plugins: {
        legend: { position: "top" },
        title: {
          display: true,
          text: titleText,
        },
      },
    };
  };

  if (
    trackStatus === "loading" ||
    likeStatus === "loading" ||
    followerStatus === "loading" ||
    userStatus === "loading" ||
    artistStatus === "loading" // Check artistStatus loading
  ) {
    return <div className="text-center text-gray-500 py-10">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-gray-800">Thống kê</h2>
        <div className="flex flex-wrap gap-4 items-center">
           {/* View Mode Buttons */}
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition flex items-center gap-2 ${
              viewMode === "grid"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Chế độ lưới"
          >
            <BsGrid3X3Gap size={20} />
          </button>
          <button
            onClick={() => setViewMode("bar")}
            className={`p-2 rounded-lg transition flex items-center gap-2 ${
              viewMode === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title="Biểu đồ cột"
          >
            <HiChartBar size={20} />
          </button>
        </div>
      </div>

      {/* Data Display Area */}
      {/* Grid View (Always Overall Stats) */}
      {viewMode === "grid" && (
        <>
          {/* Existing grid cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-800">Tổng Bài hát</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.songs}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-800">Tổng Lượt thích</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {stats.likes}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Tổng Lượt theo dõi
              </h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.followers}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Người dùng mới
              </h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {stats.newUsers}
              </p>
              <p className="text-sm text-gray-500">
                {stats.newUsers}/{users.length} ({((stats.newUsers/users.length) * 100).toFixed(1)}%)
              </p>
              <p className="text-xs text-gray-400">(30 ngày qua)</p>
            </div>
          </div>

          {/* Add Track List */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Top 10 Bài hát được yêu thích</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tên bài hát
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nghệ sĩ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lượt thích
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trackStats.slice(0, 10).map((track) => (
                    <tr key={track.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {track.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {track.artist}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {track.likeCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

       {/* Bar Chart View */}
       {viewMode === "bar" && (
         <>
           {/* Existing charts */}
           <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
             <select
               value={selectedArtistId}
               onChange={(e) => setSelectedArtistId(e.target.value)}
               className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
               disabled={artistStatus !== 'succeeded'}
             >
               <option value="all">Tất cả nghệ sĩ</option>
               {artists.map((artist) => (
                 <option key={artist.id} value={artist.id}>
                   {artist.name}
                 </option>
               ))}
             </select>
             <Bar data={getBarData()} options={getChartOptions()} />
           </div>

           {/* New Top Tracks Line Chart */}
           <div className="bg-white rounded-lg shadow-md p-6 space-y-4 mt-6">
             <Line data={getTopTracksLineData()} options={getTopTracksLineOptions()} />
           </div>
           
           {/* Top Tracks Table */}
           <div className="bg-white rounded-lg shadow-md p-6 space-y-4 mt-6">
             <h3 className="text-xl font-bold text-gray-800">Bài hát được yêu thích nhất</h3>
             <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-gray-200">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Tên bài hát
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Nghệ sĩ
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                       Lượt thích
                     </th>
                   </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {trackStats.slice(0, 10).map((track) => (
                     <tr key={track.id} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                         {track.name}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {track.artist}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {track.likeCount}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         </>
       )}

      {/* Artist Statistics Table (Always visible) */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Thống kê Chi tiết theo Nghệ sĩ
        </h3>
        {calculating ? (
          <div className="text-center text-gray-500 py-5">Đang tính toán chi tiết...</div>
        ) : artistStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tên Nghệ sĩ
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Số bài hát
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tổng lượt thích
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Lượt theo dõi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {artistStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {stat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.trackCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.likeCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {stat.followerCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-5">
            Không có dữ liệu nghệ sĩ để hiển thị thống kê.
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
