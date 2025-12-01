import { getLeaderBoard, type LeaderBoardEntry } from "@/services/users"
import LeaderboardCard from "./LeaderboardCard"
import { useCallback, useEffect, useState } from "react"
import { FiRefreshCw } from "react-icons/fi"
import RefreshButton from "./RefreshButton"

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
        
        <RefreshButton
          onClick={fetchLeaderboard}
          isLoading={isLoading}
          title="Refresh leaderboard"/>
      </div>

      {isLoading && leaderboard.length === 0 ? (
        <div className="flex flex-col gap-3 opacity-50">
           <p className="text-sm text-white/50">Loading rankings...</p>
        </div>
      ) : leaderboard.length > 0 ? (
        <div className={"gap-1 flex-col flex" + (isLoading ? ' opacity-50 transition-opacity' : ' opacity-100 transition-opacity')}>
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