import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Rating,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ReviewForm({ landmarkId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user) {
      setError('Пожалуйста, войдите в систему, чтобы оставить отзыв');
      return;
    }

    if (!rating) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    if (!comment.trim()) {
      setError('Пожалуйста, напишите текст отзыва');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/reviews/${user.id}/${landmarkId}`,
        { rating, comment }
      );

      setComment('');
      setRating(0);
      setSuccess(true);
      if (onReviewAdded) {
        onReviewAdded(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Произошла ошибка при отправке отзыва');
    }
  };

  if (!user) {
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="error" gutterBottom>
          Пожалуйста, войдите в систему, чтобы оставить отзыв
        </Typography>
      </Paper>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ mb: 2 }}>
        <Typography component="legend">Ваша оценка</Typography>
        <Rating
          name="rating"
          value={rating}
          onChange={(event, newValue) => {
            setRating(newValue);
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
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Спасибо за ваш отзыв!
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        size="large"
        fullWidth
      >
        Отправить отзыв
      </Button>
    </Box>
  );
}

export default ReviewForm; 