import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  CardMedia,
  Alert,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState(0);
  const { token, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [token, user]);

  const fetchReviews = async () => {
    try {
      setError(null);
      // Получаем отзывы текущего пользователя
      const response = await axios.get(`http://localhost:5000/api/reviews/${user.id}/reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Полученные отзывы:', response.data); // Для отладки

      // Получаем информацию о достопримечательностях для каждого отзыва
      const reviewsWithLandmarks = await Promise.all(
        response.data.map(async (review) => {
          try {
            const landmarkResponse = await axios.get(`http://localhost:5000/api/ldmk/landmarks/${review.landmarkId}`);
            return {
              ...review,
              landmark: landmarkResponse.data
            };
          } catch (error) {
            console.error('Ошибка при загрузке информации о достопримечательности:', error);
            return review;
          }
        })
      );

      console.log('Отзывы с информацией о достопримечательностях:', reviewsWithLandmarks); // Для отладки
      
      setReviews(reviewsWithLandmarks);
      setLoading(false);
    } catch (error) {
      console.error('Ошибка при загрузке отзывов:', error);
      setError(error.response?.data?.message || 'Ошибка при загрузке отзывов');
      setLoading(false);
    }
  };

  const handleEditClick = (review) => {
    setCurrentReview(review);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/reviews/${user.id}/${currentReview.landmarkId}`, 
        {
          comment: editedComment,
          rating: editedRating
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setEditDialogOpen(false);
      fetchReviews(); // Обновляем список отзывов
    } catch (error) {
      console.error('Ошибка при редактировании отзыва:', error);
      setError(error.response?.data?.message || 'Ошибка при редактировании отзыва');
    }
  };

  const handleDelete = async (review) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${user.id}/${review.landmarkId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchReviews(); // Обновляем список отзывов
      } catch (error) {
        console.error('Ошибка при удалении отзыва:', error);
        setError(error.response?.data?.message || 'Ошибка при удалении отзыва');
      }
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
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mt: 4,
          textAlign: 'center',
          mb: 4 // добавляем отступ снизу для лучшего визуального баланса
        }}
      >
        Мои отзывы
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reviews.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">У вас пока нет отзывов</Typography>
          <Button
            component={Link}
            to="/landmarks"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            startIcon={<RateReviewIcon />}
          >
            Оставить отзыв
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={3} sx={{ maxWidth: '900px' }}>
            {reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Card sx={{ display: 'flex', height: '250px', width: '100%' }}>
                  <Grid container sx={{ flexWrap: 'nowrap' }}>
                    {/* Изображение достопримечательности */}
                    <Grid item sx={{ width: '300px', flexShrink: 0 }}>
                      {review.landmark && (
                        <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                          <CardMedia
                            component="img"
                            image={`http://localhost:5000/${review.landmark.img}`}
                            alt={review.landmark.name}
                            sx={{
                              height: '250px',
                              objectFit: 'cover'
                            }}
                          />
                        </Box>
                      )}
                    </Grid>
                    {/* Информация об отзыве */}
                    <Grid item sx={{ flex: 1, minWidth: 0, maxWidth: '600px' }}>
                      <CardContent sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        '&:last-child': { pb: 2 }
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start', 
                          mb: 2,
                          gap: 2 // Добавляем отступ между названием и кнопками
                        }}>
                          <Box sx={{ minWidth: 0 }}> {/* Контейнер для текста */}
                            <Typography 
                              variant="h6" 
                              component={Link} 
                              to={`/landmarks/${review.landmarkId}`} 
                              sx={{ 
                                textDecoration: 'none', 
                                color: 'inherit',
                                '&:hover': {
                                  color: 'primary.main',
                                },
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {review.landmark ? review.landmark.name : 'Достопримечательность'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
                              <Rating value={review.rating} readOnly size="small" />
                              <Typography variant="caption" color="text.secondary">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexShrink: 0 }}> {/* Контейнер для кнопок */}
                            <Button
                              startIcon={<EditIcon />}
                              onClick={() => handleEditClick(review)}
                              size="small"
                              sx={{ mr: 1 }}
                            >
                              Редактировать
                            </Button>
                            <Button
                              startIcon={<DeleteIcon />}
                              color="error"
                              onClick={() => handleDelete(review)}
                              size="small"
                            >
                              Удалить
                            </Button>
                          </Box>
                        </Box>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            flexGrow: 1,
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {review.comment}
                        </Typography>
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать отзыв</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Оценка</Typography>
            <Rating
              value={editedRating}
              onChange={(event, newValue) => setEditedRating(newValue)}
              size="large"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              margin="normal"
              label="Текст отзыва"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button onClick={handleEditSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Profile; 