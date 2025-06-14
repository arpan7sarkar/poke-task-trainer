
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  totalXP: number;
  streak: number;
  lastCompletionDate: string | null;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    streak: 0,
    lastCompletionDate: null
  });
  const [loading, setLoading] = useState(false);

  // Clear local storage on mount to reset any existing data
  useEffect(() => {
    localStorage.removeItem('poketasker-tasks');
    localStorage.removeItem('poketasker-pokemon');
    localStorage.removeItem('poketasker-stats');
  }, []);

  // Fetch user data when user logs in
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // Reset data when user logs out
      setTasks([]);
      setPokemon([]);
      setUserStats({
        level: 1,
        currentXP: 0,
        totalXP: 0,
        streak: 0,
        lastCompletionDate: null
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) throw tasksError;

      // Fetch pokemon
      const { data: pokemonData, error: pokemonError } = await supabase
        .from('user_pokemon')
        .select('*')
        .eq('user_id', user.id)
        .order('date_acquired', { ascending: false });

      if (pokemonError) throw pokemonError;

      // Fetch stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      setTasks(tasksData?.map(task => ({
        id: task.id,
        title: task.title,
        completed: task.completed,
        priority: task.priority as 'low' | 'medium' | 'high',
        xpReward: task.xp_reward,
        createdAt: new Date(task.created_at)
      })) || []);

      setPokemon(pokemonData?.map(poke => ({
        id: poke.pokemon_id,
        name: poke.name,
        sprite: poke.sprite,
        rarity: poke.rarity as 'common' | 'rare' | 'legendary',
        dateAcquired: new Date(poke.date_acquired)
      })) || []);

      if (statsData) {
        setUserStats({
          level: statsData.level,
          currentXP: statsData.current_xp,
          totalXP: statsData.total_xp,
          streak: statsData.streak,
          lastCompletionDate: statsData.last_completion_date
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    if (!user) return;

    const xpReward = priority === 'high' ? 30 : priority === 'medium' ? 20 : 15;

    try {
      const { data, error } = await supabase
        .from('user_tasks')
        .insert({
          user_id: user.id,
          title,
          priority,
          xp_reward: xpReward
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        completed: data.completed,
        priority: data.priority as 'low' | 'medium' | 'high',
        xpReward: data.xp_reward,
        createdAt: new Date(data.created_at)
      };

      setTasks(prev => [newTask, ...prev]);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ));

      // If completing a task, add XP
      if (!task.completed) {
        await updateUserXP(task.xpReward);
        toast.success(`+${task.xpReward} XP earned!`);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const updateUserXP = async (xpGained: number) => {
    if (!user) return;

    try {
      const newCurrentXP = userStats.currentXP + xpGained;
      const newTotalXP = userStats.totalXP + xpGained;
      let newLevel = userStats.level;

      // Level up calculation (every 200 XP)
      const xpToNextLevel = 200;
      if (newCurrentXP >= xpToNextLevel) {
        newLevel += Math.floor(newCurrentXP / xpToNextLevel);
        const remainingXP = newCurrentXP % xpToNextLevel;

        const { error } = await supabase
          .from('user_stats')
          .update({
            level: newLevel,
            current_xp: remainingXP,
            total_xp: newTotalXP,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;

        setUserStats(prev => ({
          ...prev,
          level: newLevel,
          currentXP: remainingXP,
          totalXP: newTotalXP
        }));

        if (newLevel > userStats.level) {
          toast.success(`Level up! You're now level ${newLevel}!`);
        }
      } else {
        const { error } = await supabase
          .from('user_stats')
          .update({
            current_xp: newCurrentXP,
            total_xp: newTotalXP,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;

        setUserStats(prev => ({
          ...prev,
          currentXP: newCurrentXP,
          totalXP: newTotalXP
        }));
      }
    } catch (error) {
      console.error('Error updating XP:', error);
      toast.error('Failed to update XP');
    }
  };

  const addPokemon = async (newPokemon: Pokemon, xpCost: number) => {
    if (!user) return;

    try {
      // Add pokemon to collection
      const { error: pokemonError } = await supabase
        .from('user_pokemon')
        .insert({
          user_id: user.id,
          pokemon_id: newPokemon.id,
          name: newPokemon.name,
          sprite: newPokemon.sprite,
          rarity: newPokemon.rarity
        });

      if (pokemonError) throw pokemonError;

      // Deduct XP cost
      const newCurrentXP = Math.max(0, userStats.currentXP - xpCost);
      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          current_xp: newCurrentXP,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (statsError) throw statsError;

      setPokemon(prev => [newPokemon, ...prev]);
      setUserStats(prev => ({ ...prev, currentXP: newCurrentXP }));
      
      toast.success(`${newPokemon.name} added to your collection!`);
    } catch (error) {
      console.error('Error adding pokemon:', error);
      toast.error('Failed to add Pokémon to collection');
    }
  };

  return {
    tasks,
    pokemon,
    userStats,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    addPokemon,
    refreshData: fetchUserData
  };
};
