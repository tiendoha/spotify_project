import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        date_of_birth: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    // Check authentication and fetch profile
    useEffect(() => {
        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        if (!userId || !token) {
            toast.error("Please log in to edit your profile!", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/login");
            return;
        }

        // Fetch profile data
        fetch(`http://localhost:8000/api/profiles/${userId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }
                return response.json();
            })
            .then((data) => {
                setProfile(data);
                setFormData({
                    username: data.user.username || "",
                    email: data.user.email || "",
                    date_of_birth: data.date_of_birth || "",
                });
            })
            .catch((err) => {
                console.error("Error fetching profile:", err);
                toast.error("Failed to load profile data!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            });
    }, [navigate]);

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle "Change Image" click
    const handleChangeImage = () => {
        toast.info("Coming Soon", {
            position: "top-right",
            autoClose: 3000,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const userId = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");

        // Validate inputs
        if (!formData.username.trim()) {
            toast.error("Username is required!", {
                position: "top-right",
                autoClose: 3000,
            });
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address!", {
                position: "top-right",
                autoClose: 3000,
            });
            setIsLoading(false);
            return;
        }

        // Validate date_of_birth (optional, must be YYYY-MM-DD)
        if (formData.date_of_birth) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(formData.date_of_birth)) {
                toast.error("Date of birth must be in YYYY-MM-DD format!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setIsLoading(false);
                return;
            }
            const date = new Date(formData.date_of_birth);
            if (isNaN(date.getTime()) || date > new Date()) {
                toast.error("Please enter a valid date of birth in the past!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setIsLoading(false);
                return;
            }
        }

        try {
            // Update user data (username, email)
            const userData = {};
            if (formData.username !== profile.user.username) {
                userData.username = formData.username;
            }
            if (formData.email && formData.email !== profile.user.email) {
                userData.email = formData.email;
            }

            if (Object.keys(userData).length > 0) {
                const userResponse = await fetch(`http://localhost:8000/api/users/${userId}/`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                });

                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    throw new Error(errorData.error || "Failed to update user data");
                }

                const updatedUser = await userResponse.json();
                localStorage.setItem("username", updatedUser.username);
            }

            // Update profile data (date_of_birth)
            const profileData = new FormData();
            if (formData.date_of_birth && formData.date_of_birth !== profile.date_of_birth) {
                profileData.append("date_of_birth", formData.date_of_birth);
            }

            if (Array.from(profileData.entries()).length > 0) {
                const profileResponse = await fetch(`http://localhost:8000/api/profiles/${userId}/`, {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: profileData,
                });

                if (!profileResponse.ok) {
                    const errorData = await profileResponse.json();
                    throw new Error(errorData.error || "Failed to update profile data");
                }
            }

            toast.success("Profile updated successfully!", {
                position: "top-right",
                autoClose: 3000,
            });
            navigate("/");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error(error.message || "Failed to update profile!", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Generate avatar from username if no profile image
    const getInitialAvatar = (username) => {
        if (!username) return "https://via.placeholder.com/100";
        const initial = username.charAt(0).toUpperCase();
        return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23181818'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2322c55e' font-size='40' font-family='Arial'%3E${initial}%3C/text%3E%3C/svg%3E`;
    };

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900">
                <p className="text-gray-400 text-lg font-sans font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                theme="dark"
                toastStyle={{ backgroundColor: "#181818", color: "#22c55e", border: "1px solid #22c55e" }}
            />
            <div className="min-h-screen bg-gray-900- flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-black-700 rounded-xl shadow-md shadow-green-500/20 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center font-sans">Edit Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Profile Image */}
                        <div className="flex flex-col items-center mb-4">
                            <img
                                src={profile.profile_image ? `http://localhost:8000${profile.profile_image}` : getInitialAvatar(formData.username)}
                                alt="Profile"
                                className="w-24 h-24 rounded-full border-2 border-green-500 mb-2 object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleChangeImage}
                                className="bg-green-500 text-white text-sm px-4 py-2 rounded-full hover:bg-green-600 transition-all duration-200 shadow-sm font-sans font-medium"
                            >
                                Change Image
                            </button>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 font-sans">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="Enter your username"
                                className="w-full px-4 py-2 rounded-md text-white placeholder-gray-500 bg-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 font-sans"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 font-sans">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 rounded-md text-white placeholder-gray-500 bg-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 font-sans"
                            />
                        </div>

                        {/* Date of Birth */}
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1 font-sans">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="date_of_birth"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 rounded-md text-white placeholder-gray-500 bg-gray-700 border-none focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-200 font-sans appearance-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-between gap-4 mt-6">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="flex-1 px-4 py-2 bg-gray-700 text-gray-400 rounded-full hover:bg-gray-600 hover:text-white transition-all duration-200 shadow-sm font-sans font-medium"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all duration-200 shadow-sm font-sans font-medium"
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Custom CSS for Spotify theme */}
            <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #181818;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }

        /* Style native date picker */
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(68%) sepia(58%) saturate(448%) hue-rotate(81deg) brightness(97%) contrast(92%); /* Green-500 tint */
          cursor: pointer;
        }
        input[type="date"]::-webkit-datetime-edit {
          color: #ffffff;
        }
        input[type="date"]::-webkit-datetime-edit-year-field,
        input[type="date"]::-webkit-datetime-edit-month-field,
        input[type="date"]::-webkit-datetime-edit-day-field {
          color: #ffffff;
        }
        input[type="date"]::-webkit-datetime-edit-text {
          color: #22c55e;
        }
        /* Firefox */
        input[type="date"] {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
      `}</style>
        </>
    );
};

export default EditProfile;