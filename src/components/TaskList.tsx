
import { CheckCircle, Trash2, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  xpReward: number;
  createdAt: Date;
}

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  getPriorityColor: (priority: string) => string;
  getPriorityLabel: (priority: string) => string;
}

export const TaskList = ({ 
  tasks, 
  onCompleteTask, 
  onDeleteTask, 
  getPriorityColor, 
  getPriorityLabel 
}: TaskListProps) => {
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const TaskItem = ({ task }: { task: Task }) => (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      task.completed 
        ? 'opacity-60 bg-slate-700/40 dark:bg-slate-800/40' 
        : 'bg-white dark:bg-slate-800/90'
    } dark:border-slate-700`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !task.completed && onCompleteTask(task.id)}
              className={`p-2 rounded-full ${
                task.completed 
                  ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50 dark:text-gray-500 dark:hover:text-green-400 dark:hover:bg-green-900/30'
              }`}
              disabled={task.completed}
            >
              <CheckCircle className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <h3 className={`font-medium ${
                task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'
              }`}>
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                  {getPriorityLabel(task.priority)}
                </span>
                
                <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">+{task.xpReward} XP</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteTask(task.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30 p-2"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            Active Tasks ({activeTasks.length})
          </h2>
          <div className="space-y-3">
            {activeTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500 dark:text-green-400" />
            Completed Tasks ({completedTasks.length})
          </h2>
          <div className="space-y-3">
            {completedTasks.slice(-5).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600 dark:bg-slate-800/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to start your journey?</h3>
            <p className="text-gray-600 dark:text-gray-300">Add your first task and begin earning XP!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
