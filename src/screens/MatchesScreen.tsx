import {ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MATCHES_URL } from '../config';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { useFavorites } from '../hooks/useFavorites';
import { FavoriteButton } from '../components/FavoriteButton';

const statusLabels: Record<string, string> = {
  finished: 'Завершён',
  scheduled: 'Предстоящий',
  live: 'Идёт',
  postponed: 'Перенесён',
};


// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<typeof import('../../data/matches.json')['matches']>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState('all');
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { isFavorite, toggle } = useFavorites();

  async function loadMatches() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(MATCHES_URL);

      if (!response.ok) {
        throw new Error('Не удалось загрузить матчи');
      }

      const data = await response.json();
      setMatches(data.matches);
      setLastUpdated(new Date());

    } catch (error) {
      setError('Не удалось загрузить матчи. Попробуйте ещё раз.');
      console.error('Ошибка загрузки:', error);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const filteredMatches = matches.filter(match => {
    if (filter === 'upcoming') {
      return match.status === 'scheduled' || match.status === 'postponed';
    }

    if (filter === 'finished') {
      return match.status === 'finished';
    }

    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>
      <Pressable onPress={loadMatches} disabled={loading}>
        <Text>Обновить</Text>
      </Pressable>
      {lastUpdated !== null && (
        <UpdatedAgo since={lastUpdated} />
      )}

      <View style={styles.filters}>
        <Pressable onPress={() => setFilter('all')}>
          <Text>Все</Text>
        </Pressable>

        <Pressable onPress={() => setFilter('upcoming')}>
          <Text>Предстоящие</Text>
        </Pressable>

        <Pressable onPress={() => setFilter('finished')}>
          <Text>Завершённые</Text>
        </Pressable>
      </View>

      {loading && (
        <View>
          <ActivityIndicator size="large" />
          <Text>Загрузка матчей...</Text>
        </View>
      )}

      {!loading && error && (
        <View>
          <Text>
            {error}
          </Text>

          <Pressable onPress={loadMatches}>
            <Text>
              Повторить
            </Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && matches.length === 0 && (
          <Text>
            Матчей пока нет
          </Text>

      )}


      {!loading && !error && filteredMatches.map(match => (
        <View key={match.id} style={styles.card}>
          <Text style={styles.teams}>
            {match.home.name} - {match.away.name}
          </Text>

          <FavoriteButton
            active={isFavorite(match.id)}
            onPress={() => toggle(match.id)}
          />

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
  filters: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 16,
    flexWrap: 'wrap',
  },
});
