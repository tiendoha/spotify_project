import React from "react";
import { Provider } from 'react-redux';
import store from './redux/store';
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import UsersPage from "./pages/UsersPage";
import { Routes, Route } from "react-router-dom";
import ArtistPage from "./pages/ArtistPage";
import TracksPage from "./pages/TracksPage";
import AlbumsPage from "./pages/AlbumsPage";
import PlaylistsPage from "./pages/PlaylistsPage";
import FollowersPage from "./pages/FollowersPage";
import LikesPage from "./pages/LikesPage";
import StatisticsPage from "./pages/StatisticsPage";

export default function App() {
  return (
    <Provider store={store}>
      <div className="flex flex-col h-full">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 ml-64 pt-16 bg-gray-100">
            <Routes>
              <Route path="/users" element={<UsersPage />} />
              <Route path="artists" element={<ArtistPage />} />
              <Route path="tracks" element={<TracksPage />} />
              <Route path="albums" element={<AlbumsPage />} />
              <Route path="playlists" element={<PlaylistsPage />} />
              <Route path="followers" element={<FollowersPage />} />
              <Route path="likes" element={<LikesPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route
                path=""
                element={<StatisticsPage />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Provider>
  );
}
