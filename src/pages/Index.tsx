import { useState, useEffect } from 'react';
import { TaskList } from '../components/TaskList';
import { ProgressBar } from '../components/ProgressBar';
import { PokemonCollection } from '../components/PokemonCollection';
import { StatsPanel } from '../components/StatsPanel';
import { Plus, Zap, Award, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '../components/ThemeToggle';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  xpReward: number;
  createdAt: Date;
}

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

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    currentXP: 0,
    xpToNextLevel: 100,
    totalXP: 0,
    streak: 0,
    lastCompletionDate: null,
    pokemon: []
  });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('poketasker-tasks');
    const savedStats = localStorage.getItem('poketasker-stats');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  }, []);

  // Save data to localStorage whenever tasks or stats change
  useEffect(() => {
    localStorage.setItem('poketasker-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('poketasker-stats', JSON.stringify(userStats));
  }, [userStats]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const xpRewards = { low: 10, medium: 20, high: 35 };
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: newTaskPriority,
      xpReward: xpRewards[newTaskPriority],
      createdAt: new Date()
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const completeTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Toggle task completion
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));

    // Only award/deduct XP when completing (not uncompleting)
    if (!task.completed) {
      // Award XP and update stats for completion
      const newTotalXP = userStats.totalXP + task.xpReward;
      const newCurrentXP = userStats.currentXP + task.xpReward;
      let newLevel = userStats.level;
      let xpForNextLevel = userStats.xpToNextLevel;

      // Check for level up
      if (newCurrentXP >= userStats.xpToNextLevel) {
        newLevel += 1;
        xpForNextLevel = newLevel * 100; // XP required increases with level
      }

      // Update streak
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      let newStreak = userStats.streak;

      if (userStats.lastCompletionDate === yesterday) {
        newStreak += 1;
      } else if (userStats.lastCompletionDate !== today) {
        newStreak = 1;
      }

      setUserStats({
        ...userStats,
        currentXP: newCurrentXP >= userStats.xpToNextLevel ? newCurrentXP - userStats.xpToNextLevel : newCurrentXP,
        totalXP: newTotalXP,
        level: newLevel,
        xpToNextLevel: xpForNextLevel,
        streak: newStreak,
        lastCompletionDate: today
      });

      console.log(`Task completed! +${task.xpReward} XP`);
    } else {
      console.log(`Task unchecked!`);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handlePokemonAcquired = (newPokemon: Pokemon, xpCost: number) => {
    setUserStats(prev => ({
      ...prev,
      currentXP: prev.currentXP - xpCost,
      pokemon: [...prev.pokemon, newPokemon]
    }));
    console.log(`Pokemon acquired! -${xpCost} XP spent`);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Master Ball!';
      case 'medium': return 'Great Ball!';
      case 'low': return 'Poké Ball!';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-200 to-purple-300 dark:from-slate-900 dark:via-purple-900 dark:to-cyan-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-b-4 border-blue-500 dark:border-blue-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PokeTasker</h1>
                <p className="text-gray-600 dark:text-gray-300">Gotta complete 'em all!</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Level {userStats.level} Trainer</div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.streak} day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <ProgressBar 
              level={userStats.level}
              currentXP={userStats.currentXP}
              xpToNextLevel={userStats.xpToNextLevel}
            />

            {/* Add Task Section */}
            <Card className="border-2 border-dashed border-blue-300 dark:border-blue-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardContent className="p-6">
                {!showAddTask ? (
                  <Button 
                    onClick={() => setShowAddTask(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 dark:from-blue-600 dark:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-800 text-white shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Task
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="What needs to be done?"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {(['low', 'medium', 'high'] as const).map((priority) => (
                          <button
                            key={priority}
                            onClick={() => setNewTaskPriority(priority)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              newTaskPriority === priority
                                ? `bg-gradient-to-r ${getPriorityColor(priority)} text-white shadow-lg`
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {getPriorityLabel(priority)}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setShowAddTask(false)} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                          Cancel
                        </Button>
                        <Button onClick={addTask} className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                          Add Task
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Task List */}
            <TaskList 
              tasks={tasks}
              onCompleteTask={completeTask}
              onDeleteTask={deleteTask}
              getPriorityColor={getPriorityColor}
              getPriorityLabel={getPriorityLabel}
            />
          </div>

          {/* Right Column - Stats and Pokemon */}
          <div className="space-y-6">
            <StatsPanel userStats={userStats} />
            <PokemonCollection 
              pokemon={userStats.pokemon}
              userLevel={userStats.level}
              currentXP={userStats.currentXP}
              onPokemonAcquired={handlePokemonAcquired}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
