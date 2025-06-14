
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, CheckCircle, Star, Trophy, Target } from "lucide-react";
import { PokemonCollection } from "@/components/PokemonCollection";
import { TaskList } from "@/components/TaskList";
import { StatsPanel } from "@/components/StatsPanel";
import { ProgressBar } from "@/components/ProgressBar";
import AuthButton from "@/components/AuthButton";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState([
    { id: 1, text: "Complete morning workout", completed: false, priority: "high" },
    { id: 2, text: "Review project proposals", completed: true, priority: "medium" },
    { id: 3, text: "Call dentist for appointment", completed: false, priority: "low" },
  ]);
  const { user } = useAuth();

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: Date.now(),
        text: newTask,
        completed: false,
        priority: "medium"
      }]);
      setNewTask("");
    }
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

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
                  <p className="text-3xl font-bold">12</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5" />
                  <span>Add New Task</span>
                </CardTitle>
                <CardDescription>Complete tasks to catch Pokemon and level up!</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter a new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="flex-1"
                  />
                  <Button onClick={addTask} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Progress</CardTitle>
                <CardDescription>Keep going! You're doing great!</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressBar current={completedTasks} total={totalTasks} />
                <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{completedTasks} completed</span>
                  <span>{totalTasks - completedTasks} remaining</span>
                </div>
              </CardContent>
            </Card>

            {/* Task List */}
            <TaskList 
              tasks={tasks} 
              onToggleTask={toggleTask} 
              onDeleteTask={deleteTask} 
            />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* Stats Panel */}
            <StatsPanel />
            
            {/* Pokemon Collection Preview */}
            <PokemonCollection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
