import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, CheckCircle, Star, Trophy, Target } from "lucide-react";
import { PokemonCollection } from "@/components/PokemonCollection";
import { TaskList } from "@/components/TaskList";
import { StatsPanel } from "@/components/StatsPanel";
import { ProgressBar } from "@/components/ProgressBar";
import { PokeBallSelector } from "@/components/PokeBallSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";

const Index = () => {
  const [newTask, setNewTask] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const { user } = useAuth();
  const { 
    tasks, 
    pokemon, 
    userStats, 
    loading,
    addTask, 
    toggleTask, 
    deleteTask, 
    addPokemon 
  } = useUserData();

  const handleAddTask = async () => {
    if (newTask.trim() && user) {
      await addTask(newTask, newTaskPriority);
      setNewTask("");
      setNewTaskPriority('medium');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Unknown';
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const xpToNextLevel = 200 - (userStats.currentXP % 200);

  const userStatsForPanel = {
    level: userStats.level,
    currentXP: userStats.currentXP,
    xpToNextLevel,
    totalXP: userStats.totalXP,
    streak: userStats.streak,
    lastCompletionDate: userStats.lastCompletionDate,
    pokemon
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-blue-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">PokeTasker</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Catch 'em all by completing tasks!</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Welcome back, {user.user_metadata?.username || user.email?.split('@')[0]}!</span>
              </div>
            )}
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message for Non-Authenticated Users */}
        {!user && (
          <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome to PokeTasker!</h2>
              <p className="mb-4">Sign in to start catching Pokemon by completing your daily tasks!</p>
              <AuthButton />
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-400 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Completed Tasks</p>
                  <p className="text-3xl font-bold">{completedTasks}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-400 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Tasks</p>
                  <p className="text-3xl font-bold">{totalTasks}</p>
                </div>
                <Target className="w-12 h-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-400 to-purple-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Pokemon Caught</p>
                  <p className="text-3xl font-bold">{pokemon.length}</p>
                </div>
                <Star className="w-12 h-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-400 to-orange-600 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Completion Rate</p>
                  <p className="text-3xl font-bold">{Math.round(completionRate)}%</p>
                </div>
                <Trophy className="w-12 h-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Management Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Task Card */}
            {user && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add New Task</span>
                  </CardTitle>
                  <CardDescription>Complete tasks to catch Pokemon and level up!</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Enter a new task..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                        className="flex-1"
                      />
                      <Select value={newTaskPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewTaskPriority(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span>Low</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                              <span>Medium</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                              <span>High</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-700" disabled={!newTask.trim()}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>XP Rewards:</span>
                      <Badge variant="outline" className="text-green-600">Low: 15 XP</Badge>
                      <Badge variant="outline" className="text-yellow-600">Medium: 20 XP</Badge>
                      <Badge variant="outline" className="text-red-600">High: 30 XP</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Card */}
            {user && (
              <ProgressBar 
                level={userStats.level}
                currentXP={userStats.currentXP}
                xpToNextLevel={xpToNextLevel}
              />
            )}

            {/* Task List */}
            <TaskList 
              tasks={tasks} 
              onCompleteTask={toggleTask} 
              onDeleteTask={deleteTask}
              getPriorityColor={getPriorityColor}
              getPriorityLabel={getPriorityLabel}
            />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Stats Panel */}
            {user && <StatsPanel userStats={userStatsForPanel} />}
            
            {/* Pokemon Collection with Ball Selector */}
            {user ? (
              <div className="space-y-6">
                <PokeBallSelector 
                  userLevel={userStats.level}
                  currentXP={userStats.currentXP}
                  onPokemonAcquired={addPokemon}
                />
                <PokemonCollection 
                  pokemon={pokemon}
                  userLevel={userStats.level}
                  currentXP={userStats.currentXP}
                  onPokemonAcquired={addPokemon}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-4">⚪</div>
                  <h3 className="text-lg font-semibold mb-2">Start Your Journey!</h3>
                  <p className="text-gray-600 mb-4">Sign in to begin catching Pokemon and tracking your progress.</p>
                  <AuthButton />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
