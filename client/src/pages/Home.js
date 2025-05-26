import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Typography,
  Card,
  CardContent,
  Grid,
  Container,
  Box,
  Paper,
  Button,
  CircularProgress,
  CardMedia,
  Alert,
  Rating
} from '@mui/material';
import { Carousel } from 'react-bootstrap';

function Home() {
  const [popularLandmarks, setPopularLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularLandmarks();
  }, []);

  const fetchPopularLandmarks = async () => {
    try {
      // Получаем все достопримечательности
      const landmarksResponse = await axios.get('http://localhost:5000/api/ldmk/landmarks');
      const landmarks = landmarksResponse.data;

      // Получаем отзывы для каждой достопримечательности
      const landmarksWithRatings = await Promise.all(
        landmarks.map(async (landmark) => {
          try {
            const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/landmark/${landmark.id}`);
            const reviews = reviewsResponse.data;
            const averageRating = reviews.length > 0
              ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
              : 0;
            return {
              ...landmark,
              averageRating,
              reviewCount: reviews.length
            };
          } catch (error) {
            console.error(`Error fetching reviews for landmark ${landmark.id}:`, error);
            return {
              ...landmark,
              averageRating: 0,
              reviewCount: 0
            };
          }
        })
      );

      // Сортируем по рейтингу и берем топ-3
      const sortedLandmarks = landmarksWithRatings.sort((a, b) => b.averageRating - a.averageRating);
      setPopularLandmarks(sortedLandmarks.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке достопримечательностей:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Добро пожаловать в Дагестан
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom align="center" color="textSecondary">
        Откройте для себя удивительные места и богатую культуру Дагестана
      </Typography>

      {/* Слайдер с достопримечательностями */}
      {popularLandmarks.length > 0 && (
        <Box sx={{ mb: 6, mt: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Достопримечательности
          </Typography>
          <Carousel>
            {popularLandmarks.map((landmark) => (
              <Carousel.Item key={landmark.id}>
                <img
                  className="d-block w-100"
                  src={`http://localhost:5000/${landmark.img}`}
                  alt={landmark.name}
                  style={{ height: '400px', objectFit: 'cover' }}
                />
                <Carousel.Caption>
                  <Paper sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <Typography variant="h5" sx={{ color: 'white' }}>{landmark.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, my: 1 }}>
                      <Rating 
                        value={landmark.averageRating} 
                        precision={0.1} 
                        readOnly 
                        sx={{ color: 'gold' }}
                      />
                      <Typography sx={{ color: 'white' }}>
                        ({landmark.reviewCount} {landmark.reviewCount === 1 ? 'отзыв' : 
                          landmark.reviewCount > 1 && landmark.reviewCount < 5 ? 'отзыва' : 'отзывов'})
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: 'white' }}>
                      {landmark.description.substring(0, 100)}...
                    </Typography>
                    <Button
                      component={Link}
                      to={`/landmarks/${landmark.id}`}
                      variant="contained"
                      color="primary"
                      sx={{ mt: 1 }}
                    >
                      Подробнее
                    </Button>
                  </Paper>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Box>
      )}
    </Container>
  );
}

export default Home; 