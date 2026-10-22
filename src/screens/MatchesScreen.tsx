import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MATCHES_URL } from '../config';

const statusLabels: Record<string, string> = {
  finished: 'Завершён',
  scheduled: 'Предстоящий',
  live: 'Идёт',
  postponed: 'Перенесён',
};


// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<typeof import('../../data/matches.json')['matches']>([]);

  useEffect(() => {
    async function loadMatches() {
      try {
        const response = await fetch(MATCHES_URL);

        if (!response.ok) {
          throw new Error('Не удалось загрузить матчи');
        }

        const data = await response.json();

        setMatches(data.matches);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    }
    loadMatches();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>

      {matches.map(match => (
        <View key={match.id} style={styles.card}>
          <Text style={styles.teams}>
            {match.home.name} - {match.away.name}
          </Text>

          <Text>
            {match.score !== null
            ? `${match.score.home} : ${match.score.away}`
            : 'Счёт пока неизвестен'}
          </Text>

          <Text>
            {match.startsAt
            ? new Date(match.startsAt).toLocaleString('ru-RU')
            : 'Дата не назначена'}
          </Text>

          <Text>
            Статус: {statusLabels[match.status] ?? 'Неизвестен'}
          </Text>

        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  card: {
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#dddddd',
    borderRadius: 10,
    gap: 6,
  },
  teams: {
    fontSize: 16,
    fontWeight: '600',
  },
});
