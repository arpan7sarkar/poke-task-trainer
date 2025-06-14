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

const XP_PER_LEVEL = 200;

export const useUserData = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    currentXP: 0,
    totalXP: 0,
    streak: 1, // Start from 1 instead of 0
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
        streak: 1, // Start from 1 instead of 0
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

      // Fetch stats - create if doesn't exist
      let { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (statsError && statsError.code === 'PGRST116') {
        // User stats don't exist, create them
        const { data: newStatsData, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            level: 1,
            current_xp: 0,
            total_xp: 0,
            streak: 1 // Start from 1 instead of 0
          })
          .select()
          .single();

        if (createError) throw createError;
        statsData = newStatsData;
      } else if (statsError) {
        throw statsError;
      }

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
          streak: Math.max(1, statsData.streak), // Ensure streak is at least 1
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

  const calculateStreak = (lastCompletionDate: string | null): number => {
    if (!lastCompletionDate) return 1; // First completion starts at 1

    const lastDate = new Date(lastCompletionDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time components to compare only dates
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (lastDate.getTime() === today.getTime()) {
      // Already completed today, don't change streak (keep current)
      return Math.max(1, userStats.streak);
    } else if (lastDate.getTime() === yesterday.getTime()) {
      // Completed yesterday, increment streak
      return Math.max(1, userStats.streak + 1);
    } else {
      // Streak broken, reset to 1
      return 1;
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

      // If completing a task, add XP and update streak
      if (!task.completed) {
        await updateUserXPAndStreak(task.xpReward);
        toast.success(`+${task.xpReward} XP earned!`);
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task');
      // Revert the optimistic update
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: task.completed } : t
      ));
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

  const updateUserXPAndStreak = async (xpGained: number, retryCount: number = 0) => {
    if (!user) return;
    
    const maxRetries = 3;

    try {
      const newTotalXP = userStats.totalXP + xpGained;
      let newCurrentXP = userStats.currentXP + xpGained;
      let newLevel = userStats.level;

      // Calculate level ups
      while (newCurrentXP >= XP_PER_LEVEL) {
        newCurrentXP -= XP_PER_LEVEL;
        newLevel += 1;
      }

      // Calculate new streak
      const today = new Date().toISOString().split('T')[0];
      const newStreak = calculateStreak(userStats.lastCompletionDate);

      const updateData = {
        level: newLevel,
        current_xp: newCurrentXP,
        total_xp: newTotalXP,
        streak: Math.max(1, newStreak), // Ensure streak is at least 1
        last_completion_date: today,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_stats')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state only after successful database update
      const oldLevel = userStats.level;
      const oldStreak = userStats.streak;
      
      setUserStats(prev => ({
        ...prev,
        level: newLevel,
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        streak: Math.max(1, newStreak), // Ensure streak is at least 1
        lastCompletionDate: today
      }));

      if (newLevel > oldLevel) {
        toast.success(`Level up! You're now level ${newLevel}!`);
      }

      if (newStreak > oldStreak) {
        toast.success(`🔥 ${newStreak} day streak!`);
      }

    } catch (error) {
      console.error('Error updating XP and streak:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying XP update... Attempt ${retryCount + 1}/${maxRetries}`);
        setTimeout(() => {
          updateUserXPAndStreak(xpGained, retryCount + 1);
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        toast.error('Failed to save progress. Please try again.');
        // Refresh data to get latest state from database
        fetchUserData();
      }
    }
  };

  const addPokemon = async (newPokemon: Pokemon, xpCost: number) => {
    if (!user) return;

    try {
      // Check if user has enough XP
      if (userStats.currentXP < xpCost) {
        toast.error('Not enough XP to catch this Pokémon!');
        return;
      }

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
