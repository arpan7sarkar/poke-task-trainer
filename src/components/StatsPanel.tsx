
import { Calendar, Flame, Zap, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  rarity: 'common' | 'rare' | 'legendary';
  dateAcquired: Date;
}

interface UserStats {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  streak: number;
  lastCompletionDate: string | null;
  pokemon: Pokemon[];
}

interface StatsPanelProps {
  userStats: UserStats;
}

export const StatsPanel = ({ userStats }: StatsPanelProps) => {
  const statsCards = [
    {
      title: "Total XP",
      value: userStats.totalXP.toLocaleString(),
      icon: Zap,
      color: "text-yellow-500 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      title: "Current Level",
      value: userStats.level,
      icon: Trophy,
      color: "text-blue-500 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Day Streak",
      value: userStats.streak,
      icon: Flame,
      color: "text-orange-500 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: "Pokémon Caught",
      value: userStats.pokemon.length,
      icon: Calendar,
      color: "text-purple-500 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  return (
    <Card className="dark:bg-slate-800/90 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <span className="dark:text-white">Trainer Stats</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{stat.title}</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</span>
          </div>
        ))}
        
        {userStats.streak > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800/50">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              <span className="font-semibold text-orange-800 dark:text-orange-300">
                {userStats.streak} day streak! 
              </span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              Keep it up to maintain your momentum!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
