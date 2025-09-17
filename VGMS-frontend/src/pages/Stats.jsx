import { useState } from "react";

export default function Stats() {
  // Mock data - in real app, fetch from API
  const [stats] = useState({
    overview: {
      totalGames: 23,
      completedGames: 15,
      currentlyPlaying: 3,
      wishlistGames: 12,
      totalPlaytime: 247,
      averageRating: 4.2
    },
    genreDistribution: [
      { genre: "RPG", count: 8, hours: 120 },
      { genre: "Action", count: 6, hours: 45 },
      { genre: "Adventure", count: 4, hours: 52 },
      { genre: "Strategy", count: 3, hours: 30 },
      { genre: "Shooter", count: 2, hours: 15 }
    ],
    monthlyActivity: [
      { month: "Jan", gamesCompleted: 3, hoursPlayed: 45 },
      { month: "Feb", gamesCompleted: 2, hoursPlayed: 38 },
      { month: "Mar", gamesCompleted: 4, hoursPlayed: 62 },
      { month: "Apr", gamesCompleted: 3, hoursPlayed: 41 },
      { month: "May", gamesCompleted: 2, hoursPlayed: 33 },
      { month: "Jun", gamesCompleted: 1, hoursPlayed: 28 }
    ],
    recentAchievements: [
      { title: "Completionist", description: "Finished 15 games", date: "2024-01-20" },
      { title: "Genre Explorer", description: "Played games from 5 different genres", date: "2024-01-15" },
      { title: "Marathon Gamer", description: "Played for 100+ hours total", date: "2024-01-10" }
    ]
  });

  const StatCard = ({ title, value, subtitle, color = "blue", icon }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-600 mr-4`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          <p className={`text-2xl font-bold text-${color}-400`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gaming Statistics</h1>
          <p className="text-gray-400">Detailed insights into your gaming habits and preferences</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Total Games" 
            value={stats.overview.totalGames} 
            subtitle="In your library"
            color="blue"
            icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg>}
          />
          <StatCard 
            title="Completion Rate" 
            value={`${Math.round((stats.overview.completedGames / stats.overview.totalGames) * 100)}%`} 
            subtitle={`${stats.overview.completedGames} games completed`}
            color="green"
            icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
          />
          <StatCard 
            title="Average Rating" 
            value={stats.overview.averageRating.toFixed(1)} 
            subtitle="Stars given to games"
            color="yellow"
            icon={<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
          />
        </div>

        {/* Genre Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Favorite Genres</h2>
          <div className="space-y-4">
            {stats.genreDistribution.map((genre, index) => (
              <div key={genre.genre} className="flex items-center">
                <div className="w-20 text-sm text-gray-400">{genre.genre}</div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(genre.count / stats.genreDistribution[0].count) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-20 text-sm text-gray-300 text-right">
                  {genre.count} games
                </div>
                <div className="w-20 text-sm text-gray-400 text-right">
                  {genre.hours}h
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Activity */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">Monthly Activity</h2>
          <div className="flex items-end space-x-4 h-40">
            {stats.monthlyActivity.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center">
                <div className="flex flex-col items-center space-y-2 mb-2">
                  <div 
                    className="bg-blue-600 rounded-t w-8 transition-all duration-500"
                    style={{ height: `${(month.hoursPlayed / 62) * 100}px` }}
                  ></div>
                  <div 
                    className="bg-green-600 rounded-t w-8 transition-all duration-500"
                    style={{ height: `${(month.gamesCompleted / 4) * 60}px` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">{month.month}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-6 mt-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-600 rounded mr-2"></div>
              Hours Played
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-600 rounded mr-2"></div>
              Games Completed
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Recent Achievements</h2>
          <div className="space-y-4">
            {stats.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{achievement.title}</h3>
                  <p className="text-gray-400 text-sm">{achievement.description}</p>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(achievement.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
