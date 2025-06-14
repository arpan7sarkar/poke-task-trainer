
import { Trophy, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ProgressBarProps {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
}

export const ProgressBar = ({ level, currentXP, xpToNextLevel }: ProgressBarProps) => {
  // Calculate progress percentage based on current XP vs XP needed for next level
  const progressPercentage = Math.min((currentXP / xpToNextLevel) * 100, 100);

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {level}</h2>
              <p className="text-blue-100">Pokémon Trainer</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-1">
              <Zap className="w-5 h-5 text-yellow-300" />
              <span className="text-xl font-bold">{currentXP}/{xpToNextLevel} XP</span>
            </div>
            <p className="text-blue-100">to next level</p>
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-sm text-blue-100">
          <span>Level {level}</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
          <span>Level {level + 1}</span>
        </div>
      </CardContent>
    </Card>
  );
};
