
import { useEffect, useState } from 'react';
import { Star, ArrowLeft, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useUserData } from '@/hooks/useUserData';
import { useAuth } from '@/contexts/AuthContext';
import AuthButton from '@/components/AuthButton';

const Collection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pokemon, loading } = useUserData();

  const rarityColors = {
    common: 'from-gray-400 to-gray-500',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-purple-500 to-purple-700'
  };

  const rarityLabels = {
    common: 'Common',
    rare: 'Rare',
    legendary: 'Legendary'
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-200 to-purple-300 dark:from-slate-900 dark:via-purple-900 dark:to-cyan-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-b-4 border-blue-500 dark:border-blue-400">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/')}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Tasks
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Pokémon Collection</h1>
                    <p className="text-gray-600 dark:text-gray-300">Sign in to view your collection</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <AuthButton />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">⚪</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Sign In Required</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Please sign in to view your Pokémon collection.
              </p>
              <AuthButton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-blue-200 to-purple-300 dark:from-slate-900 dark:via-purple-900 dark:to-cyan-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-sm shadow-lg border-b-4 border-blue-500 dark:border-blue-400">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Tasks
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 rounded-full flex items-center justify-center shadow-lg">
                  <Star className="text-white w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Pokémon Collection</h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    {loading ? 'Loading...' : `All your caught Pokémon (${pokemon.length})`}
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Loading Collection...</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Fetching your Pokémon from the PC...
              </p>
            </CardContent>
          </Card>
        ) : pokemon.length === 0 ? (
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-6">⚪</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">No Pokémon Yet!</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Complete tasks to earn XP and catch your first Pokémon.
              </p>
              <Button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              >
                Start Catching Pokémon
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {pokemon.map((poke, index) => (
              <Card
                key={`${poke.id}-${index}`}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm hover:bg-white/90 dark:hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4 flex justify-center">
                    {poke.sprite.startsWith('http') ? (
                      <img 
                        src={poke.sprite} 
                        alt={poke.name}
                        className="w-20 h-20 rounded-lg object-cover shadow-lg"
                      />
                    ) : (
                      <div className="text-6xl">{poke.sprite}</div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    {poke.name}
                  </h3>
                  
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${rarityColors[poke.rarity]} text-white mb-3`}>
                    {rarityLabels[poke.rarity]}
                  </div>
                  
                  <div className="flex items-center justify-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(poke.dateAcquired).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Collection;
