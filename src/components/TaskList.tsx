
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
      task.completed ? 'opacity-60 bg-gray-50' : 'bg-white'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => !task.completed && onCompleteTask(task.id)}
              className={`p-2 rounded-full ${
                task.completed 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              disabled={task.completed}
            >
              <CheckCircle className="w-5 h-5" />
            </Button>
            
            <div className="flex-1">
              <h3 className={`font-medium ${
                task.completed ? 'line-through text-gray-500' : 'text-gray-900'
              }`}>
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}>
                  {getPriorityLabel(task.priority)}
                </span>
                
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">+{task.xpReward} XP</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
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
            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-500" />
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
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
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to start your journey?</h3>
            <p className="text-gray-600">Add your first task and begin earning XP!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
