import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Paper,
  CircularProgress,
  Box,
  Rating,
  Divider,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';

function LandmarkDetails() {
  const { id } = useParams();
  const [landmark, setLandmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user } = useAuth();
  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/reviews/landmark/${id}`);
      setReviews(response.data);
    } catch (err) {
      console.error('Ошибка при загрузке отзывов:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [landmarkResponse] = await Promise.all([
          axios.get(`http://localhost:5000/api/ldmk/landmarks/${id}`),
        ]);
        setLandmark(landmarkResponse.data);
        setLoading(false);
        fetchReviews();
      } catch (err) {
        setError('Ошибка при загрузке информации о достопримечательности');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleReviewAdded = (newReview) => {
    fetchReviews();
    setShowReviewForm(false);
  };

  const handleEditClick = (review) => {
    setEditReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleEditClose = () => {
    setEditReview(null);
    setEditRating(0);
    setEditComment('');
  };

  const handleEditSave = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/reviews/${user.id}/${id}`,
        { rating: editRating, comment: editComment }
      );
      fetchReviews();
      handleEditClose();
    } catch (err) {
      console.error('Ошибка при обновлении отзыва:', err);
    }
  };

  const handleDeleteClick = async (review) => {
    if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reviews/${user.id}/${id}`);
        fetchReviews();
      } catch (err) {
        console.error('Ошибка при удалении отзыва:', err);
      }
    }
  };

  // Проверяем, есть ли уже отзыв от текущего пользователя
  const hasUserReview = user && reviews.some(review => review.userId === user.id);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!landmark) {
    return (
      <Container>
        <Typography align="center" variant="h6">
          Достопримечательность не найдена
        </Typography>
      </Container>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <Container>
      <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="400"
          image={`http://localhost:5000/${landmark.img}`}
          alt={landmark.name}
        />
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {landmark.name}
          </Typography>
          <Typography variant="body1" paragraph>
            {landmark.description}
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Местоположение
            </Typography>
            <Typography variant="body1">
              {landmark.location || 'Информация о местоположении отсутствует'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Категория
            </Typography>
            <Typography variant="body1">
              {landmark.category?.name || 'Категория не указана'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Отзывы {reviews.length > 0 && `(${reviews.length})`}
          </Typography>
          {!user ? (
            <Tooltip title="Войдите в систему, чтобы оставить отзыв">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                >
                  Написать отзыв
                </Button>
              </span>
            </Tooltip>
          ) : hasUserReview ? (
            <Tooltip title="Вы уже оставили отзыв для этой достопримечательности">
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                >
                  Отзыв добавлен
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Скрыть форму' : 'Написать отзыв'}
            </Button>
          )}
        </Box>

        {showReviewForm && !hasUserReview && (
          <Box sx={{ mb: 3 }}>
            <ReviewForm landmarkId={id} onReviewAdded={handleReviewAdded} />
          </Box>
        )}

        {reviews.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">Средняя оценка:</Typography>
              <Rating value={Number(averageRating)} precision={0.1} readOnly />
              <Typography variant="h6">({averageRating})</Typography>
            </Paper>
          </Box>
        )}

        <Grid container spacing={2}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Grid item xs={12} key={review.id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Rating value={review.rating} readOnly />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {user && user.id === review.userId && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleEditClick(review)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(review)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                  <Typography variant="body1">
                    {review.comment}
                  </Typography>
                </Paper>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Пока нет отзывов. Будьте первым, кто оставит отзыв!
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Диалог редактирования отзыва */}
      <Dialog 
        open={Boolean(editReview)} 
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Редактировать отзыв</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Typography component="legend">Ваша оценка</Typography>
              <Rating
                value={editRating}
                onChange={(event, newValue) => {
                  setEditRating(newValue);
                }}
                size="large"
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Ваш отзыв"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Отмена</Button>
          <Button onClick={handleEditSave} variant="contained" color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LandmarkDetails; 