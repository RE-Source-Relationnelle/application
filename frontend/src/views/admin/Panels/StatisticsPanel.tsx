import React from 'react';

const StatisticsPanel = () => (
    <div className="space-y-4">
        <h2 className="text-xl font-semibold">Statistiques d'utilisation</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Utilisateurs actifs</h3>
                <p className="text-2xl font-bold">1,245</p>
                <p className="text-xs text-green-500">+12% depuis le mois dernier</p>
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Nouveaux posts</h3>
                <p className="text-2xl font-bold">342</p>
                <p className="text-xs text-green-500">+5% depuis le mois dernier</p>
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Interactions</h3>
                <p className="text-2xl font-bold">2,456</p>
                <p className="text-xs text-red-500">-3% depuis le mois dernier</p>
            </div>

            <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Temps moyen</h3>
                <p className="text-2xl font-bold">8m 12s</p>
                <p className="text-xs text-green-500">+2% depuis le mois dernier</p>
            </div>
        </div>

        <div className="bg-white p-4 rounded-lg ring-1 ring-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Activité des utilisateurs (30 derniers jours)</h3>
            <div className="h-64 flex items-end space-x-2">
                {Array.from({ length: 30 }).map((_, i) => {
                    const height = Math.random() * 100;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                            <div
                                className="w-full bg-primary rounded-t"
                                style={{ height: `${height}%` }}
                            ></div>
                            {i % 5 === 0 && <span className="text-xs mt-1">{i + 1}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);

export default StatisticsPanel;