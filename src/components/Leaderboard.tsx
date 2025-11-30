import { getLeaderBoard, type LeaderBoardEntry } from "@/services/users"
import LeaderboardCard from "./LeaderboardCard"
import { useCallback, useEffect, useState } from "react"
import { FiRefreshCw } from "react-icons/fi"

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderBoardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getLeaderBoard(5)
      setLeaderboard(data)
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return (
    <div className="flex w-full min-w-[300px] flex-col gap-4 md:w-[30%]">
      {/* Nagłówek z przyciskiem */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-headline">Top players</h2>
        
        <button
          onClick={fetchLeaderboard}
          disabled={isLoading}
          className="group rounded-full p-2 text-white/50 transition-all hover:bg-white/10 hover:text-orange-400 disabled:opacity-50"
          title="Refresh leaderboard"
        >
          <FiRefreshCw 
            className={`h-5 w-5 transition-transform ${isLoading ? 'animate-spin text-orange-400' : 'group-hover:rotate-180'}`} 
          />
        </button>
      </div>

      {isLoading && leaderboard.length === 0 ? (
        <div className="flex flex-col gap-3 opacity-50">
           <p className="text-sm text-white/50">Loading rankings...</p>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className={isLoading ? 'opacity-50 transition-opacity' : 'opacity-100 transition-opacity'}>
          {leaderboard.map((player, index) => (
            <LeaderboardCard
              key={player.nickname}
              place={index + 1}
              pfp_path={player.pfp_path}
              name={player.nickname}
              rating={player.elo}
            />
          ))}
        </div>
      ) : (
        <p className="text-white/50">No players found.</p>
      )}
    </div>
  )
}

export default Leaderboard