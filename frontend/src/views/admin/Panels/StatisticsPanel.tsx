import { useState, useEffect } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../../store/authStore';
import { User, Resource, Favorite } from '../../../types/types';

// Enregistrer les composants nécessaires de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Options pour les périodes de temps
type TimePeriod = '30d' | '3m' | '1y' | 'all';

const StatisticsPanel = () => {
  // État pour les données de statistiques
  const [statData, setStatData] = useState({
    users: [] as { date: string; count: number }[],
    resources: [] as { date: string; count: number }[],
    validatedResources: [] as { date: string; count: number }[],
    favorites: [] as { date: string; count: number }[]
  });
  
  // État pour les séries de données à afficher
  const [visibleSeries, setVisibleSeries] = useState({
    users: true,
    resources: true,
    validatedResources: true,
    favorites: true
  });
  
  // État pour la période de temps sélectionnée
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  
  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fonction pour récupérer les données de statistiques
  const fetchStatistics = async (period: TimePeriod) => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer tous les utilisateurs
      const usersResponse = await api.get('/admin/get_users');
      
      // Récupérer toutes les ressources
      const resourcesResponse = await api.get('/resources/');
      
      // Récupérer les ressources en attente (pour calculer les validées)
      const pendingResourcesResponse = await api.get('/resources/pending');
      
      // Récupérer les favoris
      const favoritesResponse = await api.get('/resources/favorites');
      
      // Traiter les données pour obtenir les statistiques par date
      const users = usersResponse.data || [] as User[];
      const resources = resourcesResponse.data || [] as Resource[];
      const pendingResources = pendingResourcesResponse.data || [] as any[];
      const favorites = favoritesResponse.data || [] as Favorite[];
      
      // Calculer le nombre de ressources validées (total - en attente)
      const validatedResources = resources.filter((resource: Resource) => 
        !pendingResources.some((pending: any) => pending.id === resource._id)
      );
      
      // Traiter les données pour les adapter au format attendu par le graphique
      const processedData = processDataByTimePeriod({
        users,
        resources,
        validatedResources,
        favorites
      }, period);
      
      setStatData(processedData);
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError('Erreur lors de la récupération des statistiques. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };
  
  // Fonction pour traiter les données en fonction de la période sélectionnée
  const processDataByTimePeriod = (data: any, period: TimePeriod) => {
    const { users, resources, validatedResources, favorites } = data;
    const now = new Date();
    const periodStartDate = getPeriodStartDate(now, period);
    
    // Filtrer les données par période
    const filteredUsers = users.filter((user: User) => new Date(user.created_at || '') >= periodStartDate);
    const filteredResources = resources.filter((resource: Resource) => new Date(resource.createdAt || '') >= periodStartDate);
    const filteredValidatedResources = validatedResources.filter((resource: Resource) => new Date(resource.createdAt || '') >= periodStartDate);
    const filteredFavorites = favorites.filter((favorite: Favorite) => new Date(favorite.created_at || '') >= periodStartDate);
    
    // Grouper les données par jour/semaine/mois selon la période
    const groupedUsers = groupDataByDate(filteredUsers, 'created_at', period);
    const groupedResources = groupDataByDate(filteredResources, 'date_creation', period);
    const groupedValidatedResources = groupDataByDate(filteredValidatedResources, 'date_creation', period);
    const groupedFavorites = groupDataByDate(filteredFavorites, 'created_at', period);
    
    return {
      users: groupedUsers,
      resources: groupedResources,
      validatedResources: groupedValidatedResources,
      favorites: groupedFavorites
    };
  };
  
  // Fonction pour obtenir la date de début de la période
  const getPeriodStartDate = (now: Date, period: TimePeriod) => {
    const startDate = new Date(now);
    
    switch (period) {
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3m':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'all':
        startDate.setFullYear(2000); // Date suffisamment ancienne pour tout inclure
        break;
    }
    
    return startDate;
  };
  
  // Fonction pour grouper les données par date
  const groupDataByDate = (items: any[], dateField: string, period: TimePeriod) => {
    // Créer un dictionnaire pour regrouper les éléments par date
    const groupedByDate: Record<string, number> = {};
    
    // Déterminer le format de date en fonction de la période
    const getDateKey = (date: Date) => {
      if (period === '30d') {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else if (period === '3m') {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${Math.ceil(date.getDate() / 7)}`;
      } else {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
    };
    
    // Compter les éléments par date
    items.forEach(item => {
      const date = new Date(item[dateField] || '');
      const dateKey = getDateKey(date);
      
      if (groupedByDate[dateKey]) {
        groupedByDate[dateKey]++;
      } else {
        groupedByDate[dateKey] = 1;
      }
    });
    
    // Générer des dates pour toute la période (pour avoir des points à 0)
    const now = new Date();
    const startDate = getPeriodStartDate(now, period);
    const result = [];
    
    // Ajouter un jour/semaine/mois à la fois jusqu'à aujourd'hui
    let currentDate = new Date(startDate);
    while (currentDate <= now) {
      const dateKey = getDateKey(currentDate);
      
      result.push({
        date: dateKey,
        count: groupedByDate[dateKey] || 0
      });
      
      // Incrémenter la date selon la période
      if (period === '30d') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (period === '3m') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return result;
  };
  
  // Effet pour charger les données initiales
  useEffect(() => {
    fetchStatistics(timePeriod);
  }, [timePeriod]);
  
  // Fonction pour basculer la visibilité d'une série
  const toggleSeries = (series: keyof typeof visibleSeries) => {
    setVisibleSeries(prev => ({
      ...prev,
      [series]: !prev[series]
    }));
  };
  
  // Calculer les totaux actuels et les pourcentages de changement
  const calculateStats = () => {
    const stats = {
      users: { total: 0, change: 0 },
      resources: { total: 0, change: 0 },
      validatedResources: { total: 0, change: 0 },
      favorites: { total: 0, change: 0 }
    };
    
    // Calculer les totaux (somme de toutes les valeurs dans la période)
    if (statData.users.length > 0) {
      stats.users.total = statData.users.reduce((sum, item) => sum + item.count, 0);
    }
    
    if (statData.resources.length > 0) {
      stats.resources.total = statData.resources.reduce((sum, item) => sum + item.count, 0);
    }
    
    if (statData.validatedResources.length > 0) {
      stats.validatedResources.total = statData.validatedResources.reduce((sum, item) => sum + item.count, 0);
    }
    
    if (statData.favorites.length > 0) {
      stats.favorites.total = statData.favorites.reduce((sum, item) => sum + item.count, 0);
    }
    
    // Calculer les pourcentages de changement (entre le premier et le dernier mois)
    if (statData.users.length > 1) {
      const first = statData.users[0].count;
      const last = statData.users[statData.users.length - 1].count;
      stats.users.change = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    }
    
    if (statData.resources.length > 1) {
      const first = statData.resources[0].count;
      const last = statData.resources[statData.resources.length - 1].count;
      stats.resources.change = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    }
    
    if (statData.validatedResources.length > 1) {
      const first = statData.validatedResources[0].count;
      const last = statData.validatedResources[statData.validatedResources.length - 1].count;
      stats.validatedResources.change = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    }
    
    if (statData.favorites.length > 1) {
      const first = statData.favorites[0].count;
      const last = statData.favorites[statData.favorites.length - 1].count;
      stats.favorites.change = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    }
    
    return stats;
  };
  
  const stats = calculateStats();
  
  // Préparer les données pour le graphique
  const chartData = {
    datasets: [
      ...(visibleSeries.users ? [{
        label: 'Comptes utilisateurs',
        data: statData.users.map(item => ({ x: new Date(item.date), y: item.count })),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3
      }] : []),
      ...(visibleSeries.resources ? [{
        label: 'Ressources créées',
        data: statData.resources.map(item => ({ x: new Date(item.date), y: item.count })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3
      }] : []),
      ...(visibleSeries.validatedResources ? [{
        label: 'Ressources validées',
        data: statData.validatedResources.map(item => ({ x: new Date(item.date), y: item.count })),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        tension: 0.3
      }] : []),
      ...(visibleSeries.favorites ? [{
        label: 'Favoris',
        data: statData.favorites.map(item => ({ x: new Date(item.date), y: item.count })),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3
      }] : [])
    ]
  };
  
  // Options du graphique
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: timePeriod === '30d' ? 'day' as const : 
                timePeriod === '3m' ? 'week' as const : 
                'month' as const,
          tooltipFormat: 'PP',
          displayFormats: {
            day: 'dd MMM',
            week: 'dd MMM',
            month: 'MMM yyyy'
          }
        },
        adapters: {
          date: {
            locale: fr
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Nombre'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        onClick: (e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex;
          const key = Object.keys(visibleSeries)[index] as keyof typeof visibleSeries;
          toggleSeries(key);
        }
      },
      title: {
        display: true,
        text: `Statistiques (${
          timePeriod === '30d' ? '30 derniers jours' : 
          timePeriod === '3m' ? '3 derniers mois' : 
          timePeriod === '1y' ? 'Dernière année' : 
          'Depuis le début'
        })`
      }
    }
  };
  
  // Fonction pour obtenir la classe CSS en fonction du pourcentage de changement
  const getChangeClass = (change: number) => {
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-gray-500';
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Statistiques d'utilisation</h2>
        
        <div className="flex space-x-2">
          <select 
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="30d">30 derniers jours</option>
            <option value="3m">3 derniers mois</option>
            <option value="1y">Dernière année</option>
            <option value="all">Depuis le début</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className={`bg-white p-4 rounded-lg ring-1 ${visibleSeries.users ? 'ring-blue-300 shadow-sm' : 'ring-gray-200'} cursor-pointer hover:shadow-md transition-all`}
          onClick={() => toggleSeries('users')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Comptes utilisateurs créés</h3>
            <div className={`w-3 h-3 rounded-full bg-blue-500 ${visibleSeries.users ? 'opacity-100' : 'opacity-30'}`}></div>
          </div>
          <p className="text-2xl font-bold">{stats.users.total.toLocaleString()}</p>
          <p className={`text-xs ${getChangeClass(stats.users.change)}`}>
            {stats.users.change > 0 ? '+' : ''}{stats.users.change}% depuis le début de la période
          </p>
        </div>

        <div 
          className={`bg-white p-4 rounded-lg ring-1 ${visibleSeries.resources ? 'ring-teal-300 shadow-sm' : 'ring-gray-200'} cursor-pointer hover:shadow-md transition-all`}
          onClick={() => toggleSeries('resources')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Ressources créées</h3>
            <div className={`w-3 h-3 rounded-full bg-teal-500 ${visibleSeries.resources ? 'opacity-100' : 'opacity-30'}`}></div>
          </div>
          <p className="text-2xl font-bold">{stats.resources.total.toLocaleString()}</p>
          <p className={`text-xs ${getChangeClass(stats.resources.change)}`}>
            {stats.resources.change > 0 ? '+' : ''}{stats.resources.change}% depuis le début de la période
          </p>
        </div>

        <div 
          className={`bg-white p-4 rounded-lg ring-1 ${visibleSeries.validatedResources ? 'ring-orange-300 shadow-sm' : 'ring-gray-200'} cursor-pointer hover:shadow-md transition-all`}
          onClick={() => toggleSeries('validatedResources')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Ressources validées</h3>
            <div className={`w-3 h-3 rounded-full bg-orange-500 ${visibleSeries.validatedResources ? 'opacity-100' : 'opacity-30'}`}></div>
          </div>
          <p className="text-2xl font-bold">{stats.validatedResources.total.toLocaleString()}</p>
          <p className={`text-xs ${getChangeClass(stats.validatedResources.change)}`}>
            {stats.validatedResources.change > 0 ? '+' : ''}{stats.validatedResources.change}% depuis le début de la période
          </p>
        </div>
        
        <div 
          className={`bg-white p-4 rounded-lg ring-1 ${visibleSeries.favorites ? 'ring-red-300 shadow-sm' : 'ring-gray-200'} cursor-pointer hover:shadow-md transition-all`}
          onClick={() => toggleSeries('favorites')}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Interactions (favoris)</h3>
            <div className={`w-3 h-3 rounded-full bg-red-500 ${visibleSeries.favorites ? 'opacity-100' : 'opacity-30'}`}></div>
          </div>
          <p className="text-2xl font-bold">{stats.favorites.total.toLocaleString()}</p>
          <p className={`text-xs ${getChangeClass(stats.favorites.change)}`}>
            {stats.favorites.change > 0 ? '+' : ''}{stats.favorites.change}% depuis le début de la période
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Évolution des statistiques</h3>
        
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="h-64 flex items-center justify-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="h-64">
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <div className="text-xs text-gray-500">
            Cliquez sur les cartes ci-dessus ou sur les légendes du graphique pour afficher/masquer les séries.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;