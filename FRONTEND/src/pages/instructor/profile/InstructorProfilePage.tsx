import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { instructorGetProfile } from "../../../api/action/InstructorActionApi";
import { setInstructor } from "../../../redux/slices/instructorSlice";

const InstructorProfilePage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await instructorGetProfile();
        console.log("response from profilepage instructor", response);
        if (response.success) {
          dispatch(
            setInstructor({
              userId: response.data._id,
              name: response.data.username,
              email: response.data.email,
              role: response.data.role,
              isBlocked: response.data.isBlocked,
              isVerified: response.data.isVerified,
              profilePicture: response.data.profilePicUrl || null,
            })
          );
          setProfile(response.data);
        }
      } catch (error) {
        console.error("Failed to load instructor profile", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-orange-500 text-sm font-semibold">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">No profile data found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
          Instructor Profile
        </h1>
        <p className="text-gray-400">
          Manage your professional information and settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl">
            <div className="text-center">
              {/* Profile Image */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-orange-600 p-1 shadow-xl">
                  <div className="w-full h-full rounded-3xl overflow-hidden bg-gray-700">
                    {profile.profilePicUrl ? (
                      <img
                        src={profile.profilePicUrl}
                        alt="Instructor Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                        👨‍🏫
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                    profile.isVerified
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-gray-900"
                  }`}
                >
                  {profile.isVerified ? "✅ Verified" : "⏳ Pending"}
                </div>
              </div>

              {/* Name and Role */}
              <h2 className="text-2xl font-bold text-white mb-2">
                {profile.username}
              </h2>
              <p className="text-orange-300 font-medium mb-1">
                Professional Instructor
              </p>
              <p className="text-gray-400 text-sm">{profile.email}</p>

              {/* Mentor Badge */}
              {profile.isMentor && (
                <div className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 px-4 py-2 rounded-full border border-orange-500/30">
                  <span className="text-orange-400">🌟</span>
                  <span className="text-orange-300 font-semibold text-sm">
                    Certified Mentor
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skills Card */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/30 shadow-xl">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Skills & Expertise
              </h3>
            </div>

            <div className="space-y-6">
              {/* Skills */}
              <div>
                <h4 className="text-orange-300 font-semibold mb-3 text-sm uppercase tracking-wide">
                  Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">
                      No skills added yet
                    </span>
                  )}
                </div>
              </div>

              {/* Expertise */}
              <div>
                <h4 className="text-orange-300 font-semibold mb-3 text-sm uppercase tracking-wide">
                  Expertise
                </h4>
                <div className="flex flex-wrap gap-2">
                  {profile.expertise && profile.expertise.length > 0 ? (
                    profile.expertise.map((exp: string, index: number) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-gray-600/30 to-gray-700/30 text-gray-300 rounded-full text-sm font-medium border border-gray-600/30"
                      >
                        {exp}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">
                      No expertise added yet
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/instructor/editProfile")}
              className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center space-x-3"
            >
              <span className="text-xl group-hover:scale-110 transition-transform">
                ✏️
              </span>
              <span className="tracking-wide">EDIT PROFILE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorProfilePage;
